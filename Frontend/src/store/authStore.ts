import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDTO } from '../types/api.types';
import { clearAccessToken, setAccessToken } from '../api/client';

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDTO, accessToken: string) => void;
  updateUser: (userData: Partial<UserDTO>) => void;
  logout: () => void;
}

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
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
