import { create } from 'zustand';
import api from '@/api/axios';

/**
 * Sesión del panel. No guarda tokens: la sesión es una cookie httpOnly que maneja el navegador.
 * El rol que vemos acá sólo decide qué se muestra; los permisos reales los valida siempre el backend.
 */
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
      /* si falla igual cerramos del lado del cliente */
    }
  },

  /** Consulta la sesión actual al entrar al panel (responde null sin error si no hay) */
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

// El interceptor avisa cuando el backend responde 401: la sesión venció o la revocaron
window.addEventListener('auth:expired', () => useAuthStore.setState({ user: null, ready: true }));
