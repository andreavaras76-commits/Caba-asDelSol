import api from './axios';

/** Endpoints públicos. Cada función devuelve directamente `data`. */
const get = (url, params) => api.get(url, { params }).then((r) => r.data);

export const publicApi = {
  settings: () => get('/settings'),
  cabins: () => get('/cabins'),
  cabin: (slug) => get(`/cabins/slug/${slug}`),
  promotions: () => get('/promotions'),
  services: () => get('/services'),
  attractions: () => get('/attractions'),
  faqs: () => get('/faqs'),
  reviews: () => get('/reviews'),
  gallery: (category) => get('/gallery', category ? { category } : undefined),
  blockedDates: (cabin) => get('/blocked-dates', { cabin }),
  /** Devuelve { id, message, whatsappUrl } */
  createInquiry: (payload) => api.post('/inquiries', payload).then((r) => r.data),
};
