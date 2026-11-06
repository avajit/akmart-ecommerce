const AUTH_STORAGE_KEY = 'auth-storage';
const REMEMBER_SESSION_KEY = 'akmart_remember_session';

export const clearPersistedAuthState = () => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    window.localStorage.removeItem(REMEMBER_SESSION_KEY);
  } catch {
    // Ignore storage access issues in restricted browser environments.
  }
};
