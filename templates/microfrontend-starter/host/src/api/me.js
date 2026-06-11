import { getToken } from '../utils/hostAuth';

/**
 * @returns {Promise<{ email?: string; name?: string; role?: string } | null>}
 */
export async function fetchCurrentUser() {
  const token = getToken();
  if (!token) return null;

  const res = await fetch('/api/v1/me', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    return { unauthorized: true };
  }

  if (!res.ok) {
    throw new Error(`me request failed (${res.status})`);
  }

  const data = await res.json();
  if (data && typeof data === 'object' && data.user && typeof data.user === 'object') {
    return data.user;
  }
  return data;
}
