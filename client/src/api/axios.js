import axios from 'axios';

const api = axios.create({
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

    if (status === 401 && !error.config?.url?.includes('/auth/login')) window.dispatchEvent(new Event('auth:expired'));

    return Promise.reject({ status, message, errors: error.response?.data?.errors || [] });
  }
);

export default api;
