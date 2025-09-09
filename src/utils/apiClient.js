// src/utils/apiClient.js
// Works in React (Create React App, Vite, Next CSR). No deps.
// Reads base URL from REACT_APP_API (e.g. https://alem-api.pp.ua)

const BASE = (process.env.REACT_APP_API || "").replace(/\/+$/, "");
let refreshPromise = null;
let onUnauthorized = null;

const storage = {
  get token() { return localStorage.getItem("token") || ""; },
  get refreshToken() { return localStorage.getItem("refreshToken") || ""; },
  setTokens({ token, refreshToken }) {
    if (token) localStorage.setItem("token", token);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
  },
  clear() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

const url = (pathOrUrl) => {
  if (!pathOrUrl) return BASE;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${BASE}/${String(pathOrUrl).replace(/^\/+/, "")}`;
};

async function refreshTokens() {
  if (refreshPromise) return refreshPromise; // de-dupe concurrent refreshes
  const rt = storage.refreshToken;
  if (!rt) throw new Error("No refresh token");

  refreshPromise = (async () => {
    const res = await fetch(url("/api/v1/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt })
    });

    if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
    const json = await res.json();
    const payload = json?.data || json || {};
    const token = payload.token;
    const newRefresh = payload.refreshToken;

    if (!token) throw new Error("Refresh response missing token");
    storage.setTokens({ token, refreshToken: newRefresh });
    return token;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function coreFetch(pathOrUrl, init = {}) {
  const u = url(pathOrUrl);
  const withAuth = (headersInit = {}) => {
    const h = new Headers(headersInit);
    if (!h.has("Authorization") && storage.token) {
      h.set("Authorization", `Bearer ${storage.token}`);
    }
    return h;
  };

  const first = await fetch(u, { ...init, headers: withAuth(init.headers) });
  if (first.status !== 401) return first;

  // Try one refresh
  try {
    await refreshTokens();
  } catch (e) {
    // refresh failed → clear and notify
    storage.clear();
    if (typeof onUnauthorized === "function") onUnauthorized(e);
    return first; // return original 401
  }

  // Retry once with new token
  return fetch(u, { ...init, headers: withAuth(init.headers) });
}

function bodyAndHeaders(body, initHeaders) {
  const headers = new Headers(initHeaders || {});
  if (body instanceof FormData) return { body, headers };
  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return {
    body: body === undefined ? undefined : (body instanceof Blob || typeof body === "string" ? body : JSON.stringify(body)),
    headers
  };
}

// Public API
const api = {
  // Optional: set a global handler to e.g. redirect to /login on hard 401/refresh fail
  setUnauthorizedHandler(fn) { onUnauthorized = fn; },

  // Convenience methods
  get: (p, init={}) => coreFetch(p, { ...init, method: "GET" }),
  delete: (p, init={}) => coreFetch(p, { ...init, method: "DELETE" }),
  post: (p, body, init={}) => {
    const { body: b, headers } = bodyAndHeaders(body, init.headers);
    return coreFetch(p, { ...init, method: "POST", body: b, headers });
  },
  put: (p, body, init={}) => {
    const { body: b, headers } = bodyAndHeaders(body, init.headers);
    return coreFetch(p, { ...init, method: "PUT", body: b, headers });
  },
  // Low-level access if you need it
  fetch: coreFetch,

  // Expose token helpers if login screen wants to store tokens explicitly
  setTokens: storage.setTokens,
  clearTokens: storage.clear
};

export default api;
