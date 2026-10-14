const crypto = require('crypto');
const Review = require('../models/Review');
const Client = require('../models/Client');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');

// Sólo letras y números: WhatsApp toma "_" y "-" como formato y corta el link
const newToken = () => crypto.randomBytes(16).toString('hex');

/**
 * Panel: crea (o reutiliza) un pedido de opinión para un cliente y devuelve el token.
 * El front arma el link /opinar/:token y abre WhatsApp con el mensaje.
 */
exports.request = asyncHandler(async (req, res) => {
  const client = await Client.findById(req.body.client).populate('cabin', 'name');
  if (!client) throw ApiError.notFound('Cliente no encontrado');

  let review = await Review.findOne({ client: client._id, status: 'pendiente' });
  if (!review) {
    review = await Review.create({
      kind: 'feedback',
      status: 'pendiente',
      active: false,
      token: newToken(),
      author: client.name,
      client: client._id,
      cabin: client.cabin?._id || null,
      rating: null,
    });
  }
  // Los links viejos podían terminar en "_" y WhatsApp los cortaba: se regeneran
  if (!/^[a-f0-9]+$/.test(review.token || '')) review.token = newToken();
  review.requestedAt = new Date();
  await review.save();
  client.feedbackRequestedAt = review.requestedAt;
  await client.save();

  created(res, { token: review.token, reviewId: review._id, cabinName: client.cabin?.name || '' }, 'Pedido de opinión listo');
});

/** Panel: todas las opiniones (pedidas y manuales) con cliente y cabaña */
exports.list = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status === 'pendiente') filter.status = 'pendiente';
  if (req.query.status === 'respondida') Object.assign(filter, { status: 'respondida' });
  if (req.query.status === 'publicada') Object.assign(filter, { active: true, status: 'respondida' });
  const items = await Review.find(filter).sort({ submittedAt: -1, requestedAt: -1, createdAt: -1 }).populate('client', 'name phone').populate('cabin', 'name').lean();
  const answered = items.filter((r) => r.status === 'respondida' && r.rating);
  const avg = answered.length ? answered.reduce((s, r) => s + r.rating, 0) / answered.length : null;
  success(res, { items, stats: { total: items.length, answered: answered.length, average: avg && Math.round(avg * 10) / 10 } });
});

/** Público: datos mínimos para mostrar la página de opinión */
exports.show = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ token: req.params.token, kind: 'feedback' }).populate('cabin', 'name');
  if (!review) throw ApiError.notFound('Este link de opinión no existe o ya no está disponible');
  success(res, {
    name: review.author.split(' ')[0],
    cabinName: review.cabin?.name || '',
    answered: review.status === 'respondida',
  });
});

/** Público: el huésped envía su puntuación y comentario (una sola vez) */
exports.submit = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ token: req.params.token, kind: 'feedback' });
  if (!review) throw ApiError.notFound('Este link de opinión no existe o ya no está disponible');
  if (review.status === 'respondida') throw new ApiError(409, '¡Ya recibimos tu opinión! Gracias.');

  review.set({
    rating: req.body.rating,
    text: req.body.text || '',
    origin: req.body.origin || '',
    status: 'respondida',
    submittedAt: new Date(),
    date: new Date(),
    source: 'Huésped',
    active: false, // la publica el dueño desde el panel
  });
  await review.save();

  if (review.client) {
    await Client.updateOne({ _id: review.client }, { $set: { lastRating: review.rating, lastFeedbackAt: review.submittedAt } });
  }
  success(res, null, '¡Gracias por tu opinión!');
});
