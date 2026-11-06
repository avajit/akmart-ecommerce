import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { UserDTO } from '../types/api.types';
import { clearAccessToken, setAccessToken } from '../api/client';

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDTO, accessToken: string) => void;
  updateUser: (userData: Partial<UserDTO>) => void;
  logout: () => void;
}

const dynamicAuthStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name) || sessionStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      const isRemembered = localStorage.getItem('akmart_remember_session') === 'true';
      if (isRemembered) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
      }
    } catch {}
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
      sessionStorage.removeItem(name);
    } catch {}
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, isAuthenticated: true });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      logout: () => {
        clearAccessToken();
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('akmart_remember_session');
          } catch {}
        }
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => dynamicAuthStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
