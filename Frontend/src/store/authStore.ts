import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserDTO } from '../types/api.types';

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDTO, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      setAuth: (user, accessToken) => {
        // Tokens are typically stored in localStorage for the Axios interceptor
        // We'll sync them here just in case, but Zustand doesn't strictly need to persist the tokens 
        // if they are already in localStorage. We will persist the user object.
        localStorage.setItem('accessToken', accessToken);
        
        set({ user, isAuthenticated: true });
      },
      
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken'); // Clean up legacy token
        set({ user: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
