import axios from 'axios';

/**
 * Instancia centralizada de Axios.
 * - La sesión viaja en una cookie httpOnly que pone el backend: el token nunca pasa por JavaScript,
 *   así que no se puede leer ni modificar desde la consola.
 * - Mandamos X-Requested-With: el backend lo exige en escrituras (protección anti-CSRF).
 * - Desenvuelve la respuesta { ok, data, message } del backend.
 */
const api = axios.create({
  // En producción el front proxea /api al backend (mismo dominio = cookie first-party)
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      (error.code === 'ECONNABORTED' ? 'El servidor tardó demasiado en responder.' : 'No pudimos conectarnos con el servidor.');

    // Sesión vencida o revocada en medio del uso del panel
    if (status === 401 && !error.config?.url?.includes('/auth/login')) window.dispatchEvent(new Event('auth:expired'));

    return Promise.reject({ status, message, errors: error.response?.data?.errors || [] });
  }
);

export default api;
