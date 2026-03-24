// src/services/complaintService.js
// Uses cookies for auth (withCredentials: true) — matches AuthContext

const API_BASE = import.meta.env.VITE_API_URL;

// ─────────────────────────────────────────
// 1. Fetch user's bookings
// ─────────────────────────────────────────
export const fetchMyBookings = async () => {
  const res = await fetch(`${API_BASE}/api/bookings/my-bookings`, {
    method: "GET",
    credentials: "include", // ← sends cookies automatically
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
  return data.data;
};

// ─────────────────────────────────────────
// 2. Start AI chat session
// ─────────────────────────────────────────
export const startAIChat = async (bookingId, initialMessage = "") => {
  const res = await fetch(`${API_BASE}/api/complaints/ai-chat/start`, {
    method: "POST",
    credentials: "include", // ← sends cookies automatically
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, initialMessage }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to start AI chat");
  return data;
};

// ─────────────────────────────────────────
// 3. Send message in AI chat
// ─────────────────────────────────────────
export const sendAIMessage = async (sessionKey, message) => {
  const res = await fetch(`${API_BASE}/api/complaints/ai-chat/message`, {
    method: "POST",
    credentials: "include", // ← sends cookies automatically
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionKey, message }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to send message");
  return data;
};

// ─────────────────────────────────────────
// 4. Finalize complaint
// ─────────────────────────────────────────
export const finalizeAIComplaint = async (sessionKey, title) => {
  const res = await fetch(`${API_BASE}/api/complaints/ai-chat/finalize`, {
    method: "POST",
    credentials: "include", // ← sends cookies automatically
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionKey, title }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to finalize complaint");
  return data;
};

// ─────────────────────────────────────────
// 5. Get user's complaints
// ─────────────────────────────────────────
export const getMyComplaints = async () => {
  const res = await fetch(`${API_BASE}/api/complaints`, {
    method: "GET",
    credentials: "include", // ← sends cookies automatically
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch complaints");
  return data.data;
};