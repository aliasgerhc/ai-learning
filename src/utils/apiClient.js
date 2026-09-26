// ================================================
// EduAI — API Client
// Calls the PHP backend. Falls back to localStorage
// if the backend is unreachable or user is Guest.
// ================================================

export const API_BASE = 'http://localhost/AI-Learning-api';

// ------------------------------------------------
// Generic fetch wrapper
// ------------------------------------------------
async function request(endpoint, options = {}) {
  // Check if we are in guest mode
  const authRaw = localStorage.getItem('eduai_auth');
  const auth = authRaw ? JSON.parse(authRaw) : null;
  
  if (!auth || auth.isGuest) {
    // Force fallback to localStorage immediately if guest
    throw new Error('Guest mode active');
  }

  const url = new URL(`${API_BASE}/${endpoint}`);
  url.searchParams.set('user_id', auth.id);

  const res = await fetch(url.toString(), {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'API error');
  return json.data;
}

export const api = {
  get: (ep) => request(ep, { method: 'GET' }),
  post: (ep, body) => request(ep, { method: 'POST', body: JSON.stringify(body) }),
  put: (ep, body) => request(ep, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (ep) => request(ep, { method: 'DELETE' }),
};
