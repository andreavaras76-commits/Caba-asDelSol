const { Router } = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { loginLimiter, inquiryLimiter, publicLimiter } = require('../middlewares/rateLimiters');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { mongoIdParam } = require('../validators/common');
const v = {
  auth: require('../validators/auth.validator'),
  cabin: require('../validators/cabin.validator'),
  promo: require('../validators/promotion.validator'),
  inquiry: require('../validators/inquiry.validator'),
  client: require('../validators/client.validator'),
  content: require('../validators/content.validator'),
  settings: require('../validators/settings.validator'),
};
const c = {
  auth: require('../controllers/auth.controller'),
  settings: require('../controllers/settings.controller'),
  cabins: require('../controllers/cabin.controller'),
  promos: require('../controllers/promotion.controller'),
  inquiries: require('../controllers/inquiry.controller'),
  clients: require('../controllers/client.controller'),
  gallery: require('../controllers/gallery.controller'),
  blocked: require('../controllers/blockedDate.controller'),
  seo: require('../controllers/seo.controller'),
  feedback: require('../controllers/feedback.controller'),
};
const crudFactory = require('../controllers/crudFactory');
const crud = {
  services: crudFactory(require('../models/Service'), { label: 'Servicio' }),
  attractions: crudFactory(require('../models/Attraction'), { label: 'Atractivo', folder: 'atractivos' }),
  faqs: crudFactory(require('../models/Faq'), { label: 'Pregunta' }),
  reviews: crudFactory(require('../models/Review'), { label: 'Reseña', sort: { order: 1, date: -1, createdAt: -1 } }),
  'nearby-places': crudFactory(require('../models/NearbyPlace'), { label: 'Lugar', folder: 'cerca', sort: { category: 1, order: 1, createdAt: 1 } }),
  'special-events': crudFactory(require('../models/SpecialEvent'), { label: 'Evento especial', folder: 'eventos-especiales', sort: { order: 1, date: 1 } }),
};

const router = Router();
const id = validate([mongoIdParam('id')]);
const admin = [protect, authorize('admin')];

/* ============================ AUTH ============================ */
router.post('/auth/login', loginLimiter, validate(v.auth.login), c.auth.login);
router.get('/auth/me', protect, c.auth.me);
router.get('/auth/session', c.auth.session);
router.post('/auth/logout', c.auth.logout);
router.put('/auth/password', protect, validate(v.auth.changePassword), c.auth.changePassword);

/* ========================== PÚBLICO =========================== */
router.get('/settings', publicLimiter, c.settings.get);
router.get('/sitemap.xml', publicLimiter, c.seo.sitemap);
router.get('/cabins', publicLimiter, c.cabins.listPublic);
router.get('/cabins/slug/:slug', publicLimiter, c.cabins.getBySlug);
router.get('/promotions', publicLimiter, c.promos.listPublic);
router.get('/gallery', publicLimiter, c.gallery.listPublic);
router.get('/blocked-dates', publicLimiter, c.blocked.listPublic);
router.post('/inquiries', inquiryLimiter, validate(v.inquiry.create), c.inquiries.create);
// Opinión del huésped por link personal (enviado por WhatsApp desde el panel)
router.get('/feedback/:token', publicLimiter, c.feedback.show);
router.post('/feedback/:token', inquiryLimiter, validate(v.content.feedback.submit), c.feedback.submit);
Object.entries(crud).forEach(([path, ctrl]) => router.get(`/${path}`, publicLimiter, ctrl.listPublic));

/* =========================== ADMIN ============================ */
// Cabañas
router.get('/admin/cabins', admin, c.cabins.listAll);
router.post('/admin/cabins', admin, validate(v.cabin.create), c.cabins.create);
router.get('/admin/cabins/:id', admin, id, c.cabins.getOne);
router.put('/admin/cabins/:id', admin, id, validate(v.cabin.update), c.cabins.update);
router.delete('/admin/cabins/:id', admin, id, c.cabins.remove);
router.post('/admin/cabins/:id/images', admin, id, ...upload.many('images'), c.cabins.uploadImages);
router.put('/admin/cabins/:id/images/order', admin, id, validate(v.cabin.reorderImages), c.cabins.reorderImages);
router.put('/admin/cabins/:id/images/:imageId', admin, validate([mongoIdParam('id'), mongoIdParam('imageId'), ...v.cabin.updateImage]), c.cabins.updateImage);
router.delete('/admin/cabins/:id/images/:imageId', admin, validate([mongoIdParam('id'), mongoIdParam('imageId')]), c.cabins.deleteImage);

// Promociones
router.get('/admin/promotions', admin, c.promos.listAll);
router.post('/admin/promotions', admin, validate(v.promo.create), c.promos.create);
router.get('/admin/promotions/:id', admin, id, c.promos.getOne);
router.put('/admin/promotions/:id', admin, id, validate(v.promo.update), c.promos.update);
router.delete('/admin/promotions/:id', admin, id, c.promos.remove);
router.post('/admin/promotions/:id/image', admin, id, ...upload.single('image'), c.promos.uploadImage);
router.delete('/admin/promotions/:id/image', admin, id, c.promos.deleteImage);

// Consultas
router.get('/admin/inquiries', admin, validate(v.inquiry.list), c.inquiries.list);
router.get('/admin/inquiries/stats', admin, c.inquiries.stats);
router.patch('/admin/inquiries/:id', admin, id, validate(v.inquiry.updateStatus), c.inquiries.updateStatus);
router.delete('/admin/inquiries/:id', admin, id, c.inquiries.remove);

// Galería
router.get('/admin/gallery', admin, c.gallery.listAll);
router.post('/admin/gallery', admin, ...upload.many('images'), validate(v.content.gallery.upload), c.gallery.upload);
router.put('/admin/gallery/order', admin, validate(v.content.reorder), c.gallery.reorder);
router.put('/admin/gallery/:id', admin, id, validate(v.content.gallery.update), c.gallery.update);
router.delete('/admin/gallery/:id', admin, id, c.gallery.remove);

// Fechas bloqueadas
router.get('/admin/blocked-dates', admin, c.blocked.listAll);
router.post('/admin/blocked-dates', admin, validate(v.content.blockedDate), c.blocked.create);
router.delete('/admin/blocked-dates/:id', admin, id, c.blocked.remove);

// Servicios, atractivos, FAQ y reseñas (CRUD genérico)
const crudValidators = {
  services: v.content.service,
  attractions: v.content.attraction,
  faqs: v.content.faq,
  reviews: v.content.review,
  'nearby-places': v.content.nearbyPlace,
  'special-events': v.content.specialEvent,
};
Object.entries(crud).forEach(([path, ctrl]) => {
  const base = `/admin/${path}`;
  router.get(base, admin, ctrl.listAll);
  router.post(base, admin, validate(crudValidators[path].create), ctrl.create);
  router.put(`${base}/order`, admin, validate(v.content.reorder), ctrl.reorder);
  router.get(`${base}/:id`, admin, id, ctrl.getOne);
  router.put(`${base}/:id`, admin, id, validate(crudValidators[path].update), ctrl.update);
  router.delete(`${base}/:id`, admin, id, ctrl.remove);
  if (ctrl.uploadImage) {
    router.post(`${base}/:id/image`, admin, id, ...upload.single('image'), ctrl.uploadImage);
    router.delete(`${base}/:id/image`, admin, id, ctrl.deleteImage);
  }
});

/* ============ CLIENTES, ENVÍO DE PROMOS Y CONFIGURACIÓN ============ */
// Clientes
router.post('/admin/reviews/request', admin, validate(v.content.feedback.request), c.feedback.request);
router.get('/admin/feedback', admin, c.feedback.list);
router.get('/admin/clients', admin, c.clients.list);
router.post('/admin/clients', admin, validate(v.client.create), c.clients.create);
router.post('/admin/clients/from-inquiry/:inquiryId', admin, validate([mongoIdParam('inquiryId')]), c.clients.fromInquiry);
router.get('/admin/clients/:id', admin, id, c.clients.getOne);
router.put('/admin/clients/:id', admin, id, validate(v.client.update), c.clients.update);
router.delete('/admin/clients/:id', admin, id, c.clients.remove);
router.post('/admin/clients/:id/promo-sent', admin, id, validate(v.client.markSent), c.clients.markSent);

// Configuración general
router.put('/admin/settings', admin, validate(v.settings.update), c.settings.update);
router.post('/admin/settings/images/:group', admin, ...upload.many('images', 10), c.settings.uploadImages);
router.put('/admin/settings/images/:group/order', admin, validate(v.content.reorder), c.settings.reorderImages);
router.delete('/admin/settings/images/:group/:imageId', admin, c.settings.deleteImage);

module.exports = router;
