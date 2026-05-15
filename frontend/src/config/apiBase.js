function trimTrailingSlashes(s) {
  return (s || '').replace(/\/+$/, '');
}

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Axios base URL (includes /api). Vercel must set VITE_API_URL.
 */
export function getApiBaseUrl() {
  const raw = trimTrailingSlashes(API_URL);
  return raw ? (raw.endsWith('/api') ? raw : `${raw}/api`) : '/api';
}

/** Backend origin for uploaded file links (no /api suffix). */
export function getApiOrigin() {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}
