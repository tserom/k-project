/** Must stay in sync with apps/user-front/src/utils/authToken.ts */
export const USER_FRONT_TOKEN_KEY = 'user-front:access-token';

export const HOST_AUTH_CHANGED = 'host-auth-changed';

export function getToken() {
  try {
    return localStorage.getItem(USER_FRONT_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(USER_FRONT_TOKEN_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(HOST_AUTH_CHANGED));
}

export function notifyAuthChanged() {
  window.dispatchEvent(new CustomEvent(HOST_AUTH_CHANGED));
}
