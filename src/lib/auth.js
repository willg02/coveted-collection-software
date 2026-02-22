/**
 * Auth helper — placeholder for JWT-based auth.
 * Expand this once the Express backend issues tokens.
 */

const TOKEN_KEY = 'cc_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}
