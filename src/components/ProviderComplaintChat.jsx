// src/components/ProviderComplaintChat.jsx
// Flow: Select Booking → AI Chat → Finalize → Done

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchMyBookings,
  startAIChat,
  sendAIMessage,
  finalizeAIComplaint,
} from "../services/complaintService";

// ─── Step indicators ───────────────────────────
const STEPS = {
  BOOKING: "booking",
  CHAT: "chat",
  FINALIZE: "finalize",
  DONE: "done",
};

// ─── Typing dots animation ─────────────────────
function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, padding: "12px 16px", alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#93C5FD",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}

// ─── Single chat bubble ────────────────────────
function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{
      display: "flex", justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 14, animation: "msgIn 0.25s ease",
    }}>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: "50%", background: "#2563EB",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 10, flexShrink: 0, color: "white",
          fontWeight: 700, fontSize: 13, fontFamily: "Manrope, sans-serif",
        }}>AI</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "11px 16px",
        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: isUser ? "#2563EB" : "#F1F5F9",
        color: isUser ? "white" : "#1E293B",
        fontSize: "0.875rem", lineHeight: 1.65,
        fontFamily: "Manrope, sans-serif", whiteSpace: "pre-wrap",
        boxShadow: isUser ? "0 2px 12px rgba(37,99,235,0.2)" : "0 1px 4px rgba(0,0,0,0.05)",
      }}>
        {msg.content.replace("[READY]", "").trim()}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────
export default function ProviderComplaintChat() {
  const { user, loading: authLoading } = useAuth(); // ✅ use user instead of token
  const navigate = useNavigate();

  const [step, setStep] = useState(STEPS.BOOKING);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
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

  // ✅ Wait for auth to load, then check if user is logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  // Auto scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load bookings on mount (only when user is available)
  useEffect(() => {
    if (user) {
      fetchMyBookings()
        .then(setBookings)
        .catch((err) => setError(err.message))
        .finally(() => setLoadingBookings(false));
    }
  }, [user]);

  // Show loading spinner while auth is being checked
  if (authLoading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", fontFamily: "Manrope, sans-serif",
        color: "#64748B", fontSize: "0.9rem",
      }}>
        Loading…
      </div>
    );
  }

  // If not logged in, show nothing (redirect handled by useEffect)
  if (!user) return null;

  // ── Start AI chat for selected booking ─────
  const handleStartChat = async (booking) => {
    setSelectedBooking(booking);
    setError("");
    setLoading(true);
    try {
      const data = await startAIChat(booking._id);
      setSessionKey(data.sessionKey);
      setMessages([{ role: "assistant", content: data.reply }]);
      setStep(STEPS.CHAT);
      setTimeout(() => inputRef.current?.focus(), 100);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // ── Send message in AI chat ─────────────────
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
      if (data.isReady) {
        setFinalDescription(data.finalDescription);
        setIsReady(true);
      }
    } catch (err) {
      setError("⚠️ " + err.message);
      setMessages([...newMessages, {
        role: "assistant",
        content: "Something went wrong. Please try again.",
      }]);
    }
    setLoading(false);
  };

  // ── Finalize & save complaint ───────────────
  const handleFinalize = async () => {
    if (!title.trim()) { setError("Please enter a complaint title."); return; }
    setSubmitting(true);
    setError("");
    try {
      const data = await finalizeAIComplaint(sessionKey, title);
      setComplaintRef(data.data._id || "");
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  // ── Reset everything ────────────────────────
  const reset = () => {
    setStep(STEPS.BOOKING);
    setSelectedBooking(null);
    setSessionKey("");
    setMessages([]);
    setInput("");
    setIsReady(false);
    setFinalDescription("");
    setTitle("");
    setError("");
    setComplaintRef("");
  };

  return (
    <div style={{
      fontFamily: "Manrope, sans-serif", background: "white",
      borderRadius: 24, boxShadow: "0 4px 40px rgba(0,0,0,0.10)",
      border: "1px solid #E2E8F0", overflow: "hidden",
      maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)",
        padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.18)", display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>🛠️</div>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: "1rem" }}>
              Provider Complaint Support
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.77rem", marginTop: 2 }}>
              {step === STEPS.BOOKING && "Step 1 of 3 · Select your booking"}
              {step === STEPS.CHAT && "Step 2 of 3 · Describing your issue"}
              {step === STEPS.FINALIZE && "Step 3 of 3 · Review & submit"}
              {step === STEPS.DONE && "Complaint submitted ✓"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80" }} />
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8rem", fontWeight: 600 }}>
            Gemini AI
          </span>
          {(step === STEPS.CHAT || step === STEPS.FINALIZE) && (
            <button onClick={reset} style={{
              marginLeft: 10, background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: 8, padding: "6px 14px", color: "white",
              fontFamily: "Manrope, sans-serif", fontWeight: 600,
              fontSize: "0.8rem", cursor: "pointer",
            }}>← Start Over</button>
          )}
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div style={{
          background: "#FEF2F2", color: "#DC2626", padding: "10px 22px",
          fontSize: "0.82rem", fontWeight: 600, borderBottom: "1px solid #FECACA",
        }}>{error}</div>
      )}

      {/* STEP 1: Select Booking */}
      {step === STEPS.BOOKING && (
        <div style={{ padding: "28px" }}>
          <p style={{ color: "#64748B", fontSize: "0.9rem", marginBottom: 20, lineHeight: 1.6 }}>
            Select the booking you want to raise a complaint about. Our AI will help you describe the issue clearly.
          </p>
          {loadingBookings ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontSize: "0.9rem" }}>
              Loading your bookings…
            </div>
          ) : bookings.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              background: "#F8FAFC", borderRadius: 16,
              color: "#94A3B8", fontSize: "0.9rem",
            }}>
              No bookings found. You need an active booking to raise a complaint.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bookings.map((booking) => (
                <button key={booking._id} onClick={() => handleStartChat(booking)}
                  disabled={loading}
                  style={{
                    background: "#F8FAFC", border: "1.5px solid #E2E8F0",
                    borderRadius: 16, padding: "18px 20px", cursor: "pointer",
                    textAlign: "left", transition: "all 0.15s", display: "flex",
                    alignItems: "center", justifyContent: "space-between", gap: 16,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#2563EB";
                    e.currentTarget.style.background = "#EFF6FF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#E2E8F0";
                    e.currentTarget.style.background = "#F8FAFC";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: "#EFF6FF", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0,
                    }}>🔧</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1E293B", marginBottom: 3 }}>
                        {booking.service?.name || "Service Booking"}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748B" }}>
                        📅 {booking.scheduledDate
                          ? new Date(booking.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "Date N/A"}
                        &nbsp;·&nbsp;₹{booking.totalPrice || "N/A"}
                        &nbsp;·&nbsp;
                        <span style={{
                          padding: "2px 8px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700,
                          background: booking.status === "completed" ? "#F0FDF4" : "#FFF7ED",
                          color: booking.status === "completed" ? "#16A34A" : "#D97706",
                        }}>{booking.status}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ color: "#2563EB", fontSize: "1.2rem", flexShrink: 0 }}>→</div>
                </button>
              ))}
            </div>
          )}
          {loading && (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#2563EB", fontSize: "0.875rem", fontWeight: 600 }}>
              Starting AI chat session…
            </div>
          )}
        </div>
      )}

      {/* STEP 2: AI Chat */}
      {step === STEPS.CHAT && (
        <>
          <div style={{
            padding: "10px 22px", background: "#EFF6FF",
            borderBottom: "1px solid #BFDBFE",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1rem" }}>🔧</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1E293B" }}>
                {selectedBooking?.service?.name || "Booking"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748B" }}>
                · {selectedBooking?.scheduledDate
                  ? new Date(selectedBooking.scheduledDate).toLocaleDateString("en-IN") : ""}
              </span>
            </div>
            {isReady && (
              <button onClick={() => setStep(STEPS.FINALIZE)} style={{
                background: "#2563EB", color: "white", border: "none",
                borderRadius: 20, padding: "6px 18px", fontFamily: "Manrope, sans-serif",
                fontWeight: 700, fontSize: "0.8rem", cursor: "pointer",
                animation: "pulse 1.5s infinite",
              }}>Review & Submit →</button>
            )}
          </div>
          <style>{`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.4)}50%{box-shadow:0 0 0 6px rgba(37,99,235,0)}}`}</style>

          <div style={{
            height: 360, overflowY: "auto", padding: "20px 22px 8px",
            scrollbarWidth: "thin", scrollbarColor: "#E2E8F0 transparent",
          }}>
            {messages.map((msg, i) => <Message key={i} msg={msg} />)}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", background: "#2563EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginRight: 10, color: "white", fontWeight: 700, fontSize: 13,
                }}>AI</div>
                <div style={{ background: "#F1F5F9", borderRadius: "18px 18px 18px 4px" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {isReady && (
            <div style={{
              margin: "0 22px 12px", padding: "12px 16px",
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: 12, fontSize: "0.82rem", color: "#166534", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ✅ AI has collected enough details. Click <strong>"Review & Submit"</strong> above to finalize.
            </div>
          )}

          <div style={{
            padding: "14px 22px", borderTop: "1px solid #E2E8F0",
            display: "flex", gap: 10, alignItems: "flex-end",
          }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isReady ? "Add anything else or click Review & Submit →" : "Describe your issue… (Enter to send)"}
              rows={1}
              style={{
                flex: 1, resize: "none", border: "1.5px solid #E2E8F0",
                borderRadius: 14, padding: "12px 16px",
                fontFamily: "Manrope, sans-serif", fontSize: "0.875rem",
                color: "#1E293B", outline: "none", lineHeight: 1.5,
                minHeight: 46, maxHeight: 120, overflowY: "auto",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
            <button onClick={handleSend} disabled={!input.trim() || loading} style={{
              width: 46, height: 46, borderRadius: 14, border: "none",
              background: input.trim() && !loading ? "#2563EB" : "#E2E8F0",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s", flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !loading ? "white" : "#94A3B8"}
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <div style={{ padding: "6px 22px 14px", textAlign: "center" }}>
            <span style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>
              Powered by Google Gemini · Your response is saved securely
            </span>
          </div>
        </>
      )}

      {/* STEP 3: Finalize */}
      {step === STEPS.FINALIZE && (
        <div style={{ padding: "28px" }}>
          <p style={{ color: "#64748B", fontSize: "0.88rem", marginBottom: 22, lineHeight: 1.6 }}>
            Review the AI-generated complaint description below. Add a title and submit.
          </p>
          <div style={{
            background: "#F8FAFC", border: "1.5px solid #E2E8F0",
            borderRadius: 14, padding: "18px 20px", marginBottom: 20,
          }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#94A3B8", marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              AI-Generated Description
            </div>
            <p style={{ fontSize: "0.875rem", color: "#1E293B", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {finalDescription}
            </p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#374151", marginBottom: 8 }}>
              Complaint Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Payment not received for completed job"
              style={{
                width: "100%", padding: "12px 16px",
                border: "1.5px solid #E2E8F0", borderRadius: 12,
                fontFamily: "Manrope, sans-serif", fontSize: "0.875rem",
                color: "#1E293B", outline: "none", transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
              onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(STEPS.CHAT)} style={{
              flex: 1, padding: "13px", background: "#F1F5F9", border: "none",
              borderRadius: 12, fontFamily: "Manrope, sans-serif",
              fontWeight: 700, fontSize: "0.9rem", color: "#475569", cursor: "pointer",
            }}>← Back to Chat</button>
            <button onClick={handleFinalize} disabled={submitting} style={{
              flex: 2, padding: "13px", background: submitting ? "#93C5FD" : "#2563EB",
              border: "none", borderRadius: 12, fontFamily: "Manrope, sans-serif",
              fontWeight: 700, fontSize: "0.9rem", color: "white",
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
            }}>
              {submitting ? "Submitting…" : "Submit Complaint ✓"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Done */}
      {step === STEPS.DONE && (
        <div style={{ padding: "48px 28px", textAlign: "center" }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>✅</div>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>
            Complaint Submitted!
          </h3>
          <p style={{ color: "#64748B", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 6 }}>
            Your complaint has been recorded and will be reviewed by our admin team within 24 hours.
          </p>
          {complaintRef && (
            <p style={{ fontSize: "0.78rem", color: "#94A3B8", marginBottom: 28 }}>
              Reference ID: <strong style={{ color: "#2563EB" }}>{complaintRef}</strong>
            </p>
          )}
          <button onClick={reset} style={{
            background: "#2563EB", color: "white", border: "none",
            borderRadius: 12, padding: "13px 32px",
            fontFamily: "Manrope, sans-serif", fontWeight: 700,
            fontSize: "0.9rem", cursor: "pointer",
            boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
          }}>
            Raise Another Complaint
          </button>
        </div>
      )}
    </div>
  );
}