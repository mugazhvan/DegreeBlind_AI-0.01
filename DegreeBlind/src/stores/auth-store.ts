import { create } from 'zustand';
import { getMe } from '@/services/api';

interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  provider: string;
  github_username?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('token'),
  user: null,
  isLoading: true,

  login: async (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isLoading: true });
    try {
      const user = await getMe(token);
      set({ user, isLoading: false });
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null });
  },

  initialize: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await getMe(token);
      if (user) {
        set({ user, isLoading: false });
      } else {
        localStorage.removeItem('token');
        set({ token: null, user: null, isLoading: false });
      }
    } catch {
      localStorage.removeItem('token');
      set({ token: null, user: null, isLoading: false });
    }
  },
}));
