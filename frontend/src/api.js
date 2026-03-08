const BASE = '';

async function request(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export const startInterview = (role) => request('/start', { role });
export const submitTurn = (session_id, text) => request('/turn', { session_id, text });
export const endInterview = (session_id) => request('/end', { session_id });
