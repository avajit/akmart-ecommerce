const AUTH_STORAGE_KEY = 'auth-storage';

export const clearPersistedAuthState = () => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage access issues in restricted browser environments.
  }
};
