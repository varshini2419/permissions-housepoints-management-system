function trimTrailingSlashes(s) {
  return (s || '').replace(/\/+$/, '');
}

/**
 * Axios base URL (includes /api). Vercel: VITE_API_URL=https://permissions-housepoints-management.onrender.com
 */
export function getApiBaseUrl() {
  const raw = trimTrailingSlashes(import.meta.env.VITE_API_URL);
  if (raw) {
    return raw.endsWith('/api') ? raw : `${raw}/api`;
  }
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  return 'https://permissions-housepoints-management.onrender.com/api';
}

/** Backend origin for uploaded file links (no /api suffix). */
export function getApiOrigin() {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}
