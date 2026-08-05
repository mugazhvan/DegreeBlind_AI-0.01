import { create } from 'zustand';

interface ThemeState {
  theme: 'dark' | 'light';
  toggle: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',

  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
    set({ theme: next });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('light', theme === 'light');
    set({ theme });
  },
}));
