import { create } from 'zustand';
import api from '@/api/axios';

export const useAuthStore = create((set) => ({
  user: null,
  ready: false,

  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    set({ user: data.user, ready: true });
    return data.user;
  },

  logout: async () => {
    set({ user: null, ready: true });
    try {
      await api.post('/auth/logout');
    } catch {
    }
  },

  bootstrap: async () => {
    try {
      const { data } = await api.get('/auth/session');
      set({ user: data, ready: true });
    } catch {
      set({ user: null, ready: true });
    }
  },

  setUser: (user) => set({ user }),
}));

window.addEventListener('auth:expired', () => useAuthStore.setState({ user: null, ready: true }));
