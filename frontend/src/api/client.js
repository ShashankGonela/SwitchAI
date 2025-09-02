export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8003";

export async function getModels() {
  const r = await fetch(`${API_BASE}/models`);
  return r.json();
}

export async function createSession(user_id, title="New Chat") {
  const r = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ user_id, title })
  });
  return r.json();
}

export async function listSessions(user_id) {
  const r = await fetch(`${API_BASE}/sessions?user_id=${user_id}`);
  return r.json();
}


export async function getSession(session_id) {
  const r = await fetch(`${API_BASE}/sessions/${session_id}`);
  return r.json();
}

export async function saveSessionMessages(session_id, messages) {
  const r = await fetch(`${API_BASE}/sessions/${session_id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });
  return r.json();
}

export async function renameSession(session_id, title) {
  const r = await fetch(`${API_BASE}/sessions/${session_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  return r.json();
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "DELETE"
  });
  return res.json();
}
