import { create } from 'zustand';
import { getSession, login, logout, register, hasAccount } from '@/lib/auth';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasAccount: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  hasAccount: false,
  error: null,

  initialize: async () => {
    const [session, account] = await Promise.all([getSession(), hasAccount()]);
    set({ isAuthenticated: session, hasAccount: account, isLoading: false });
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      await login(email, password);
      set({ isAuthenticated: true });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  register: async (email, password) => {
    set({ error: null });
    try {
      await register(email, password);
      await login(email, password);
      set({ isAuthenticated: true, hasAccount: true });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  logout: async () => {
    await logout();
    set({ isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
