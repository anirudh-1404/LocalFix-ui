// src/components/ComplaintFloatingButton.jsx
// Flow: Floating Button → Popup → Select Booking → Select Category → AI Chat → Finalize → Done

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchMyBookings,
  startAIChat,
  sendAIMessage,
  finalizeAIComplaint,
} from "../services/complaintService";

// ─── Steps ─────────────────────────────────────
const STEPS = {
  BOOKING: "booking",
  CATEGORY: "category",   // ← NEW step
  CHAT: "chat",
  FINALIZE: "finalize",
  DONE: "done",
};

// ─── Category Cards Data ───────────────────────
const CATEGORIES = [
  { id: "payment",  icon: "💳", label: "Payment not received",  color: "#EFF6FF", border: "#BFDBFE", message: "I have not received my payment for the completed job." },
  { id: "rude",     icon: "😠", label: "Customer was rude",     color: "#FFF7ED", border: "#FED7AA", message: "The customer was rude and behaved inappropriately during the service." },
  { id: "cancel",   icon: "❌", label: "Job was cancelled",     color: "#FEF2F2", border: "#FECACA", message: "My job was cancelled without proper notice or reason." },
  { id: "wrong",    icon: "🔀", label: "Wrong service assigned", color: "#F5F3FF", border: "#DDD6FE", message: "I was assigned a service that does not match my skills or profile." },
  { id: "refund",   icon: "💰", label: "Refund not processed",  color: "#F0FDF4", border: "#BBF7D0", message: "My refund has not been processed even after multiple follow-ups." },
];

// ─── Typing dots ────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "10px 14px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: "#93C5FD",
          animation: `tdot 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes tdot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

// ─── Chat bubble ────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 10, animation: "msgIn 0.2s ease",
    }}>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%", background: "#2563EB",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 8, flexShrink: 0, color: "white",
          fontWeight: 700, fontSize: 11, fontFamily: "Manrope, sans-serif",
        }}>AI</div>
      )}
      <div style={{
        maxWidth: "80%", padding: "9px 13px",
        borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        background: isUser ? "#2563EB" : "#F1F5F9",
        color: isUser ? "white" : "#1E293B",
        fontSize: "0.82rem", lineHeight: 1.6,
        fontFamily: "Manrope, sans-serif", whiteSpace: "pre-wrap",
        boxShadow: isUser ? "0 2px 8px rgba(37,99,235,0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        {msg.content.replace("[READY]", "").trim()}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────
export default function ComplaintFloatingButton() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Complaint state
  const [step, setStep] = useState(STEPS.BOOKING);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sessionKey, setSessionKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [finalDescription, setFinalDescription] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complaintRef, setComplaintRef] = useState("");

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Open popup ──────────────────────────────
  const handleOpen = () => {
    if (!user) { navigate("/login"); return; }
    setOpen(true);
    setLoadingBookings(true);
    fetchMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingBookings(false));
  };

  // ── Close & reset ───────────────────────────
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setStep(STEPS.BOOKING);
      setBookings([]);
      setSelectedBooking(null);
      setSelectedCategory(null);
      setSessionKey("");
      setMessages([]);
      setInput("");
      setIsReady(false);
      setFinalDescription("");
      setTitle("");
      setError("");
      setComplaintRef("");
    }, 300);
  };

  // ── Select booking → go to category ────────
  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    setError("");
    setStep(STEPS.CATEGORY);
  };

  // ── Select category → start AI chat ────────
  const handleSelectCategory = async (cat) => {
    setSelectedCategory(cat);
    setError("");
    setLoading(true);
    try {
      const data = await startAIChat(selectedBooking._id, cat.message);
      setSessionKey(data.sessionKey);
      setMessages([{ role: "assistant", content: data.reply }]);
      setStep(STEPS.CHAT);
      setTimeout(() => inputRef.current?.focus(), 150);
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  // ── Send message ────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setError("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const data = await sendAIMessage(sessionKey, userText);
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      if (data.isReady) { setFinalDescription(data.finalDescription); setIsReady(true); }
    } catch (err) {
      setError("⚠️ " + err.message);
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  };

  // ── Finalize complaint ──────────────────────
  const handleFinalize = async () => {
    if (!title.trim()) { setError("Please enter a complaint title."); return; }
    setSubmitting(true);
    setError("");
    try {
      const data = await finalizeAIComplaint(sessionKey, title);
      setComplaintRef(data.data._id || "");
      setStep(STEPS.DONE);
    } catch (err) { setError(err.message); }
    setSubmitting(false);
  };

  // ── Step label for header ───────────────────
  const stepLabel = {
    [STEPS.BOOKING]: "Step 1 · Select booking",
    [STEPS.CATEGORY]: "Step 2 · Select issue type",
    [STEPS.CHAT]: "Step 3 · Describe issue",
    [STEPS.FINALIZE]: "Step 4 · Review & submit",
    [STEPS.DONE]: "Submitted ✓",
  };

  // ── Back button logic ───────────────────────
  const handleBack = () => {
    if (step === STEPS.CATEGORY) { setStep(STEPS.BOOKING); setSelectedBooking(null); }
    if (step === STEPS.CHAT) { setStep(STEPS.CATEGORY); setMessages([]); setIsReady(false); setSessionKey(""); }
    if (step === STEPS.FINALIZE) { setStep(STEPS.CHAT); }
    setError("");
  };

  return (
    <>
      {/* ── Backdrop ── */}
      {open && (
        <div onClick={handleClose} style={{
          position: "fixed", inset: 0, zIndex: 9998,
          background: "rgba(15,23,42,0.4)", backdropFilter: "blur(4px)",
          animation: "fadeIn 0.2s ease",
        }} />
      )}
      <style>{`
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse-ring{0%{transform:scale(1);opacity:0.8}100%{transform:scale(1.7);opacity:0}}
      `}</style>

      {/* ── Popup Card ── */}
      {open && (
        <div style={{
          position: "fixed", bottom: 100, right: 32,
          width: 520, maxHeight: "85vh", zIndex: 9999,
          background: "white", borderRadius: 20,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          border: "1px solid #E2E8F0",
          display: "flex", flexDirection: "column",
          overflow: "hidden", animation: "slideUp 0.25s ease",
        }}>

          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(135deg, #1D4ED8, #3B82F6)",
            padding: "20px 24px", display: "flex",
            alignItems: "center", justifyContent: "space-between", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>🛠️</div>
              <div>
                <div style={{ color: "white", fontWeight: 800, fontSize: "0.92rem", fontFamily: "Manrope, sans-serif" }}>
                  Provider Support
                </div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.7rem", fontFamily: "Manrope, sans-serif" }}>
                  {stepLabel[step]}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Review button */}
              {step === STEPS.CHAT && isReady && (
                <button onClick={() => setStep(STEPS.FINALIZE)} style={{
                  background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
                  padding: "5px 12px", color: "white", fontFamily: "Manrope, sans-serif",
                  fontWeight: 700, fontSize: "0.72rem", cursor: "pointer",
                }}>Review →</button>
              )}
              {/* Back button */}
              {(step === STEPS.CATEGORY || step === STEPS.CHAT || step === STEPS.FINALIZE) && (
                <button onClick={handleBack} style={{
                  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
                  padding: "5px 10px", color: "white", fontFamily: "Manrope, sans-serif",
                  fontWeight: 600, fontSize: "0.72rem", cursor: "pointer",
                }}>← Back</button>
              )}
              {/* Close button */}
              <button onClick={handleClose} style={{
                background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8,
                width: 28, height: 28, color: "white", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem",
              }}>✕</button>
            </div>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div style={{
              background: "#FEF2F2", color: "#DC2626", padding: "8px 18px",
              fontSize: "0.78rem", fontWeight: 600, borderBottom: "1px solid #FECACA", flexShrink: 0,
            }}>{error}</div>
          )}

          {/* ══════════════════════════════════
              STEP 1: Select Booking
          ══════════════════════════════════ */}
          {step === STEPS.BOOKING && (
            <div style={{ padding: "20px", overflowY: "auto" }}>
              <p style={{ color: "#64748B", fontSize: "0.82rem", marginBottom: 14, lineHeight: 1.5, fontFamily: "Manrope, sans-serif" }}>
                Select a booking to raise a complaint about.
              </p>
              {loadingBookings ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: "0.82rem", fontFamily: "Manrope, sans-serif" }}>
                  Loading bookings…
                </div>
              ) : bookings.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "30px 16px", background: "#F8FAFC",
                  borderRadius: 12, color: "#94A3B8", fontSize: "0.82rem", fontFamily: "Manrope, sans-serif",
                }}>
                  No bookings found. You need an active booking to raise a complaint.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {bookings.map((booking) => (
                    <button key={booking._id} onClick={() => handleSelectBooking(booking)}
                      style={{
                        background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                        borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                        textAlign: "left", transition: "all 0.15s",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.background = "#EFF6FF"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#F8FAFC"; }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10, background: "#EFF6FF",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0,
                        }}>🔧</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.84rem", color: "#1E293B", marginBottom: 2, fontFamily: "Manrope, sans-serif" }}>
                            {booking.service?.name || "Service Booking"}
                          </div>
                          <div style={{ fontSize: "0.72rem", color: "#64748B", fontFamily: "Manrope, sans-serif" }}>
                            {booking.scheduledDate
                              ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                              : "Date N/A"}
                            {" · "}₹{booking.totalPrice || "N/A"}
                            {" · "}
                            <span style={{
                              padding: "1px 7px", borderRadius: 20, fontSize: "0.68rem", fontWeight: 700,
                              background: booking.status === "completed" ? "#F0FDF4" : "#FFF7ED",
                              color: booking.status === "completed" ? "#16A34A" : "#D97706",
                            }}>{booking.status}</span>
                          </div>
                        </div>
                      </div>
                      <span style={{ color: "#2563EB", fontSize: "1rem" }}>→</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════
              STEP 2: Select Category
          ══════════════════════════════════ */}
          {step === STEPS.CATEGORY && (
            <div style={{ padding: "20px", overflowY: "auto" }}>
              <p style={{ color: "#64748B", fontSize: "0.82rem", marginBottom: 16, lineHeight: 1.5, fontFamily: "Manrope, sans-serif" }}>
                What is your complaint about? Select the issue type below.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    disabled={loading}
                    style={{
                      background: cat.color,
                      border: `1.5px solid ${cat.border}`,
                      borderRadius: 14, padding: "14px 16px",
                      cursor: loading ? "not-allowed" : "pointer",
                      textAlign: "left", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 14,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span style={{ fontSize: "1.6rem", lineHeight: 1, flexShrink: 0 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B", fontFamily: "Manrope, sans-serif" }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 2, fontFamily: "Manrope, sans-serif" }}>
                        Click to start AI-assisted complaint
                      </div>
                    </div>
                    <span style={{ marginLeft: "auto", color: "#94A3B8", fontSize: "1rem", flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
              {loading && (
                <div style={{ textAlign: "center", padding: "14px 0", color: "#2563EB", fontSize: "0.8rem", fontWeight: 600, fontFamily: "Manrope, sans-serif" }}>
                  Starting AI chat…
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════
              STEP 3: AI Chat
          ══════════════════════════════════ */}
          {step === STEPS.CHAT && (
            <>
              {/* Category tag */}
              <div style={{
                padding: "8px 16px", flexShrink: 0,
                background: selectedCategory?.color || "#EFF6FF",
                borderBottom: `1px solid ${selectedCategory?.border || "#BFDBFE"}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: "1rem" }}>{selectedCategory?.icon}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1E293B", fontFamily: "Manrope, sans-serif" }}>
                  {selectedCategory?.label}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#64748B", fontFamily: "Manrope, sans-serif" }}>
                  · {selectedBooking?.service?.name || "Booking"}
                </span>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "14px 16px 8px",
                minHeight: 0, maxHeight: 340,
              }}>
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", background: "#2563EB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginRight: 8, color: "white", fontWeight: 700, fontSize: 11,
                    }}>AI</div>
                    <div style={{ background: "#F1F5F9", borderRadius: "16px 16px 16px 4px" }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Ready banner */}
              {isReady && (
                <div style={{
                  margin: "0 14px 8px", padding: "8px 12px",
                  background: "#F0FDF4", border: "1px solid #BBF7D0",
                  borderRadius: 10, fontSize: "0.75rem", color: "#166534",
                  fontWeight: 600, fontFamily: "Manrope, sans-serif", flexShrink: 0,
                }}>
                  ✅ Ready! Click <strong>Review →</strong> in the header to submit.
                </div>
              )}

              {/* Input */}
              <div style={{
                padding: "10px 14px", borderTop: "1px solid #E2E8F0",
                display: "flex", gap: 8, alignItems: "flex-end", flexShrink: 0,
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Add more details… (Enter to send)"
                  rows={1}
                  style={{
                    flex: 1, resize: "none", border: "1.5px solid #E2E8F0",
                    borderRadius: 12, padding: "9px 12px",
                    fontFamily: "Manrope, sans-serif", fontSize: "0.82rem",
                    color: "#1E293B", outline: "none", lineHeight: 1.5,
                    minHeight: 38, maxHeight: 90, overflowY: "auto",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
                <button onClick={handleSend} disabled={!input.trim() || loading} style={{
                  width: 38, height: 38, borderRadius: 12, border: "none",
                  background: input.trim() && !loading ? "#2563EB" : "#E2E8F0",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "background 0.2s",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={input.trim() && !loading ? "white" : "#94A3B8"}
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* ══════════════════════════════════
              STEP 4: Finalize
          ══════════════════════════════════ */}
          {step === STEPS.FINALIZE && (
            <div style={{ padding: "20px", overflowY: "auto" }}>
              <p style={{ color: "#64748B", fontSize: "0.8rem", marginBottom: 14, lineHeight: 1.5, fontFamily: "Manrope, sans-serif" }}>
                Review the AI-generated description and add a title.
              </p>
              <div style={{
                background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                borderRadius: 12, padding: "12px 14px", marginBottom: 14,
              }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94A3B8", marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "Manrope, sans-serif" }}>
                  AI-Generated Description
                </div>
                <p style={{ fontSize: "0.8rem", color: "#1E293B", lineHeight: 1.6, whiteSpace: "pre-wrap", fontFamily: "Manrope, sans-serif" }}>
                  {finalDescription}
                </p>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "Manrope, sans-serif" }}>
                  Complaint Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Payment not received"
                  style={{
                    width: "100%", padding: "10px 12px",
                    border: "1.5px solid #E2E8F0", borderRadius: 10,
                    fontFamily: "Manrope, sans-serif", fontSize: "0.82rem",
                    color: "#1E293B", outline: "none", boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                />
              </div>
              <button onClick={handleFinalize} disabled={submitting} style={{
                width: "100%", padding: "12px",
                background: submitting ? "#93C5FD" : "#2563EB",
                border: "none", borderRadius: 12,
                fontFamily: "Manrope, sans-serif", fontWeight: 700,
                fontSize: "0.875rem", color: "white",
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}>
                {submitting ? "Submitting…" : "Submit Complaint ✓"}
              </button>
            </div>
          )}

          {/* ══════════════════════════════════
              STEP 5: Done
          ══════════════════════════════════ */}
          {step === STEPS.DONE && (
            <div style={{ padding: "36px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1E293B", marginBottom: 6, fontFamily: "Manrope, sans-serif" }}>
                Complaint Submitted!
              </h3>
              <p style={{ color: "#64748B", fontSize: "0.8rem", lineHeight: 1.6, marginBottom: 6, fontFamily: "Manrope, sans-serif" }}>
                Our admin team will review it within 24 hours.
              </p>
              {complaintRef && (
                <p style={{ fontSize: "0.72rem", color: "#94A3B8", marginBottom: 20, fontFamily: "Manrope, sans-serif" }}>
                  Ref: <strong style={{ color: "#2563EB" }}>{complaintRef}</strong>
                </p>
              )}
              <button onClick={handleClose} style={{
                background: "#2563EB", color: "white", border: "none",
                borderRadius: 10, padding: "10px 28px",
                fontFamily: "Manrope, sans-serif", fontWeight: 700,
                fontSize: "0.85rem", cursor: "pointer",
              }}>Close</button>
            </div>
          )}

          {/* Footer */}
          {step !== STEPS.DONE && (
            <div style={{ padding: "6px 16px 10px", textAlign: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "0.68rem", color: "#CBD5E1", fontFamily: "Manrope, sans-serif" }}>
                Powered by Google Gemini · LocalFixer Support
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Floating Button ── */}
      <div
        style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 9999,
          display: open ? "none" : "flex", alignItems: "center", gap: 12, cursor: "pointer",
        }}
        onClick={handleOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Hover label */}
        <div style={{
          background: "#1E293B", color: "white", padding: "8px 14px",
          borderRadius: 12, fontSize: "0.8rem", fontWeight: 700,
          fontFamily: "Manrope, sans-serif", whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          opacity: hovered ? 1 : 0,
          transform: hovered ? "translateX(0) scale(1)" : "translateX(10px) scale(0.95)",
          transition: "all 0.25s ease", pointerEvents: "none",
        }}>
          🛠️ Raise a Complaint
        </div>

        {/* Circle button */}
        <div style={{
          width: 56, height: 56, borderRadius: "50%", position: "relative",
          background: hovered
            ? "linear-gradient(135deg, #1D4ED8, #3B82F6)"
            : "linear-gradient(135deg, #2563EB, #3B82F6)",
          boxShadow: hovered ? "0 8px 30px rgba(37,99,235,0.6)" : "0 4px 20px rgba(37,99,235,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transform: hovered ? "scale(1.1)" : "scale(1)",
          transition: "all 0.25s ease",
        }}>
          <div style={{
            position: "absolute", width: 56, height: 56, borderRadius: "50%",
            background: "rgba(37,99,235,0.3)",
            animation: "pulse-ring 2s ease-out infinite",
          }} />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <line x1="9" y1="10" x2="15" y2="10" />
            <line x1="12" y1="7" x2="12" y2="13" />
          </svg>
        </div>
      </div>
    </>
  );
}