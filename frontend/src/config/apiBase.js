function trimTrailingSlashes(s) {
  return (s || '').replace(/\/+$/, '');
}

const DEFAULT_API_URL = 'http://localhost:5000';

const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

/**
 * Axios base URL (includes /api). Set VITE_API_URL in production.
 */
export function getApiBaseUrl() {
  const raw = trimTrailingSlashes(API_URL);
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

/** Backend origin for uploaded file links (no /api suffix). */
export function getApiOrigin() {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}
