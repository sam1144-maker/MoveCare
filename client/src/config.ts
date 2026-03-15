export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';
export const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:5001';

// ---------- AUTO-REFRESH FETCH WRAPPER ----------

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem('movecare_refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    localStorage.setItem('movecare_token', data.token);
    localStorage.setItem('movecare_refresh_token', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

/**
 * Drop-in replacement for fetch() that auto-refreshes the access token on 401.
 * Use this for all authenticated API calls.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Inject current access token
  const token = localStorage.getItem('movecare_token');
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response = await fetch(url, { ...options, headers });

  // If 401, try refreshing the token once
  if (response.status === 401) {
    // Deduplicate concurrent refresh attempts
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshTokens();
    }

    const refreshed = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;

    if (refreshed) {
      // Retry the original request with the new token
      const newToken = localStorage.getItem('movecare_token');
      headers.set('Authorization', `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers });
    } else {
      // Refresh failed — force logout
      localStorage.removeItem('movecare_token');
      localStorage.removeItem('movecare_refresh_token');
      localStorage.removeItem('movecare_role');
      window.location.href = '/login';
    }
  }

  return response;
}
