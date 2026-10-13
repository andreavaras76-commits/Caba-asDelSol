import api from './axios';

/** Endpoints del panel. Todas las funciones devuelven `{ ok, data, message }`. */

const form = (field, files) => {
  const fd = new FormData();
  [].concat(files).forEach((f) => fd.append(field, f));
  return fd;
};

/** CRUD estándar para un recurso /admin/<path> */
export const resource = (path) => ({
  list: (params) => api.get(`/admin/${path}`, { params }),
  get: (id) => api.get(`/admin/${path}/${id}`),
  create: (data) => api.post(`/admin/${path}`, data),
  update: (id, data) => api.put(`/admin/${path}/${id}`, data),
  remove: (id) => api.delete(`/admin/${path}/${id}`),
  reorder: (ids) => api.put(`/admin/${path}/order`, { ids }),
  uploadImage: (id, file) => api.post(`/admin/${path}/${id}/image`, form('image', file), { timeout: 120000 }),
  deleteImage: (id) => api.delete(`/admin/${path}/${id}/image`),
});

export const adminApi = {
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/password', data),

  cabins: {
    ...resource('cabins'),
    uploadImages: (id, files) => api.post(`/admin/cabins/${id}/images`, form('images', files), { timeout: 180000 }),
    reorderImages: (id, imageIds, coverImageId) => api.put(`/admin/cabins/${id}/images/order`, { imageIds, coverImageId }),
    updateImage: (id, imageId, data) => api.put(`/admin/cabins/${id}/images/${imageId}`, data),
    deleteImage: (id, imageId) => api.delete(`/admin/cabins/${id}/images/${imageId}`),
  },
  promotions: resource('promotions'),
  inquiries: {
    list: (params) => api.get('/admin/inquiries', { params }),
    stats: () => api.get('/admin/inquiries/stats'),
    update: (id, data) => api.patch(`/admin/inquiries/${id}`, data),
    remove: (id) => api.delete(`/admin/inquiries/${id}`),
  },
  gallery: {
    list: (params) => api.get('/admin/gallery', { params }),
    upload: (files, category) => {
      const fd = form('images', files);
      fd.append('category', category);
      return api.post('/admin/gallery', fd, { timeout: 180000 });
    },
    update: (id, data) => api.put(`/admin/gallery/${id}`, data),
    reorder: (ids) => api.put('/admin/gallery/order', { ids }),
    remove: (id) => api.delete(`/admin/gallery/${id}`),
  },
  blockedDates: {
    list: (params) => api.get('/admin/blocked-dates', { params }),
    create: (data) => api.post('/admin/blocked-dates', data),
    remove: (id) => api.delete(`/admin/blocked-dates/${id}`),
  },
  services: resource('services'),
  attractions: resource('attractions'),
  faqs: resource('faqs'),
  reviews: resource('reviews'),

  clients: {
    ...resource('clients'),
    fromInquiry: (inquiryId, phone) => api.post(`/admin/clients/from-inquiry/${inquiryId}`, phone ? { phone } : {}),
    markSent: (id, promotion, sent = true) => api.post(`/admin/clients/${id}/promo-sent`, { promotion, sent }),
  },
  settings: {
    get: () => api.get('/settings'),
    update: (data) => api.put('/admin/settings', data),
    uploadImages: (group, files) => api.post(`/admin/settings/images/${group}`, form('images', files), { timeout: 180000 }),
    reorderImages: (group, ids) => api.put(`/admin/settings/images/${group}/order`, { ids }),
    deleteImage: (group, imageId) => api.delete(`/admin/settings/images/${group}/${imageId}`),
  },
};
