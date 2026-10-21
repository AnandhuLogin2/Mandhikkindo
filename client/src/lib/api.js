const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "http://localhost:4000" : "");

/**
 * Universal fetch wrapper targeting Mandhikkindo Express backend with token refresh support.
 * @param {string} endpoint - API path (e.g. '/api/shops')
 * @param {object} options - Fetch options (method, headers, body)
 * @param {object|null} user - Firebase user object if authenticated
 */
export async function apiFetch(endpoint, options = {}, user = null) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (user && typeof user.getIdToken === "function") {
    try {
      const idToken = await user.getIdToken();
      headers["Authorization"] = `Bearer ${idToken}`;
    } catch (err) {
      console.warn("Could not get Firebase ID token:", err);
    }
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Automatic token refresh retry if 401 Unauthorized occurs and user is present
  if (response.status === 401 && user && typeof user.getIdToken === "function") {
    try {
      const refreshedToken = await user.getIdToken(true);
      headers["Authorization"] = `Bearer ${refreshedToken}`;
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (refreshErr) {
      console.warn("Token refresh attempt failed:", refreshErr.message);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || "API request failed";
    const error = new Error(errorMsg);
    error.status = response.status;
    error.code = data?.error?.code;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, user, options) => apiFetch(path, { method: "GET", ...options }, user),
  post: (path, body, user, options) =>
    apiFetch(path, { method: "POST", body: JSON.stringify(body), ...options }, user),
  patch: (path, body, user, options) =>
    apiFetch(path, { method: "PATCH", body: JSON.stringify(body), ...options }, user),
  delete: (path, user, options) => apiFetch(path, { method: "DELETE", ...options }, user),
};
