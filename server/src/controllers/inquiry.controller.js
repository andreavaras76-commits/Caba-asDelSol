const Inquiry = require('../models/Inquiry');
const Cabin = require('../models/Cabin');
const Promotion = require('../models/Promotion');
const BlockedDate = require('../models/BlockedDate');
const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { bodyData, paginate } = require('../utils/requestData');
const { buildInquiryMessage, waLink } = require('../utils/whatsapp');
const { nightsBetween, startOfDayAR, startOfWeekAR, startOfMonthAR } = require('../utils/dates');

/**
 * POST público: valida reglas de negocio, guarda la consulta y devuelve el link de WhatsApp.
 * El front redirige a whatsappUrl apenas recibe la respuesta.
 */
exports.create = asyncHandler(async (req, res) => {
  const data = bodyData(req);
  const settings = await Settings.getSingleton();

  if (data.cabin) {
    const cabin = await Cabin.findOne({ _id: data.cabin, active: true });
    if (!cabin) throw ApiError.badRequest('La cabaña elegida no está disponible');
    if (data.guests && data.guests > cabin.capacity) {
      throw ApiError.badRequest(`${cabin.name} recibe hasta ${cabin.capacity} huéspedes`, [
        { field: 'guests', message: `Máximo ${cabin.capacity} huéspedes` },
      ]);
    }
    if (data.checkIn && data.checkOut && (await BlockedDate.overlaps(cabin._id, data.checkIn, data.checkOut))) {
      const err = new ApiError(409, `${cabin.name} no tiene disponibilidad en esas fechas. Probá con otras o elegí otra cabaña.`);
      err.errors = [{ field: 'checkIn', message: 'Sin disponibilidad en esas fechas' }];
      throw err;
    }
    data.cabinName = cabin.name;
  }

  if (data.promotion) {
    const promo = await Promotion.findOne({ _id: data.promotion, ...Promotion.currentFilter() });
    if (!promo) throw ApiError.badRequest('La promoción ya no está vigente');
    data.promotionTitle = promo.title;
  }

  if (data.checkIn && data.checkOut) data.nights = nightsBetween(data.checkIn, data.checkOut);
  if (data.type === 'evento' && data.people > settings.events.capacity) {
    throw ApiError.badRequest(`El predio recibe hasta ${settings.events.capacity} personas`, [
      { field: 'people', message: `Máximo ${settings.events.capacity} personas` },
    ]);
  }

  data.message = buildInquiryMessage(data, settings.businessName);
  const inquiry = await Inquiry.create(data);

  created(res, { id: inquiry._id, message: inquiry.message, whatsappUrl: waLink(settings.contact.whatsapp, inquiry.message) }, '¡Listo! Te llevamos a WhatsApp');
});

// ---------- Admin ----------

exports.list = asyncHandler(async (req, res) => {
  const { status, type, cabin, promotion, from, to, q } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (cabin) filter.cabin = cabin;
  if (promotion) filter.promotion = promotion;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(new Date(to).getTime() + 24 * 3600 * 1000 - 1); // incluye el día completo
  }
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { cabinName: rx }, { promotionTitle: rx }];
  }

  const { page, limit, skip } = paginate(req);
  const [items, total] = await Promise.all([
    Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('cabin', 'name slug').populate('promotion', 'title'),
    Inquiry.countDocuments(filter),
  ]);
  success(res, { items, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { $set: bodyData(req) }, { new: true, runValidators: true });
  if (!inquiry) throw ApiError.notFound('Consulta no encontrada');
  success(res, inquiry, 'Consulta actualizada');
});

exports.remove = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) throw ApiError.notFound('Consulta no encontrada');
  success(res, null, 'Consulta eliminada');
});

/** Métricas del dashboard */
exports.stats = asyncHandler(async (req, res) => {
  const now = new Date();
  const last30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

  const topBy = (field, nameField) =>
    Inquiry.aggregate([
      { $match: { [field]: { $ne: null }, createdAt: { $gte: last30 } } },
      { $group: { _id: `$${field}`, name: { $last: `$${nameField}` }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

  const [today, week, month, total, byStatus, topCabins, topPromos, latest] = await Promise.all([
    Inquiry.countDocuments({ createdAt: { $gte: startOfDayAR(now) } }),
    Inquiry.countDocuments({ createdAt: { $gte: startOfWeekAR(now) } }),
    Inquiry.countDocuments({ createdAt: { $gte: startOfMonthAR(now) } }),
    Inquiry.estimatedDocumentCount(),
    Inquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    topBy('cabin', 'cabinName'),
    topBy('promotion', 'promotionTitle'),
    Inquiry.find().sort({ createdAt: -1 }).limit(8).populate('cabin', 'name slug'),
  ]);

  success(res, {
    counts: { today, week, month, total },
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    topCabins,
    topPromos,
    latest,
  });
});
