const Client = require('../models/Client');
const Inquiry = require('../models/Inquiry');
const Promotion = require('../models/Promotion');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { bodyData, paginate } = require('../utils/requestData');

const findClient = async (id) => {
  const client = await Client.findById(id);
  if (!client) throw ApiError.notFound('Cliente no encontrado');
  return client;
};

/** Normaliza un teléfono argentino a formato wa.me (549 + área + número) */
const toWhatsapp = (raw = '') => {
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) digits = digits.slice(1); // 0381… → 381…
  digits = digits.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2'); // quita el 15 del celular
  if (!digits.startsWith('54')) digits = `549${digits}`;
  else if (!digits.startsWith('549')) digits = `549${digits.slice(2)}`;
  return digits;
};

/**
 * GET /clients?tags=familia,pareja&q=juan&promotion=<id>&pending=true
 * Con ?promotion, cada cliente trae `sent` (si ya se le envió esa promo).
 */
exports.list = asyncHandler(async (req, res) => {
  const { tags, q, promotion, pending } = req.query;
  const filter = {};
  if (tags) filter.tags = { $in: String(tags).split(',').filter(Boolean) };
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { phone: rx }, { notes: rx }];
  }
  if (promotion && pending === 'true') filter['promotionsSent.promotion'] = { $ne: promotion };

  const { page, limit, skip } = paginate(req, 50);
  const [items, total] = await Promise.all([
    Client.find(filter).sort({ name: 1 }).skip(skip).limit(limit).populate('cabin', 'name slug'),
    Client.countDocuments(filter),
  ]);

  const data = items.map((c) => {
    const obj = c.toJSON();
    if (promotion) {
      const sent = c.promotionsSent.find((p) => String(p.promotion) === String(promotion));
      obj.sent = Boolean(sent);
      obj.sentAt = sent?.sentAt || null;
    }
    return obj;
  });

  success(res, { items: data, total, page, pages: Math.ceil(total / limit) || 1 });
});

exports.getOne = asyncHandler(async (req, res) => {
  const client = await findClient(req.params.id);
  await client.populate([{ path: 'cabin', select: 'name slug' }, { path: 'promotionsSent.promotion', select: 'title' }]);
  success(res, client);
});

/** Aplica la normalización de WhatsApp al body ya validado */
const clientData = (req) => {
  const data = bodyData(req);
  if (data.phone) data.phone = toWhatsapp(data.phone);
  if (data.cabin === '') data.cabin = null;
  return data;
};

exports.create = asyncHandler(async (req, res) => {
  const client = await Client.create(clientData(req));
  created(res, client, 'Cliente guardado');
});

exports.update = asyncHandler(async (req, res) => {
  const client = await findClient(req.params.id);
  client.set(clientData(req));
  await client.save();
  success(res, client, 'Cliente actualizado');
});

exports.remove = asyncHandler(async (req, res) => {
  const client = await Client.findByIdAndDelete(req.params.id);
  if (!client) throw ApiError.notFound('Cliente no encontrado');
  success(res, null, 'Cliente eliminado');
});

/** Convierte una consulta en cliente con un clic (o la vincula si el teléfono ya existe) */
exports.fromInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.inquiryId);
  if (!inquiry) throw ApiError.notFound('Consulta no encontrada');

  const phone = toWhatsapp(req.body.phone || inquiry.phone);
  if (!/^\d{10,15}$/.test(phone)) {
    throw ApiError.badRequest('La consulta no tiene un WhatsApp válido. Cargalo para crear el cliente.', [
      { field: 'phone', message: 'WhatsApp inválido' },
    ]);
  }

  const tags = new Set();
  if (inquiry.pets) tags.add('mascota');
  if (inquiry.type === 'evento') tags.add('eventos');
  if (inquiry.guests === 2) tags.add('pareja');
  if (inquiry.guests >= 3) tags.add('familia');

  let client = await Client.findOne({ phone });
  const isNew = !client;
  if (isNew) {
    client = new Client({ name: inquiry.name, phone, fromInquiry: inquiry._id, notes: inquiry.comments || '' });
  }
  client.tags = [...new Set([...client.tags, ...tags])];
  if (inquiry.cabin) client.cabin = inquiry.cabin;
  if (inquiry.status === 'reservo' && inquiry.checkIn) client.lastStay = inquiry.checkIn;
  await client.save();

  inquiry.client = client._id;
  await inquiry.save();

  success(res, client, isNew ? 'Cliente creado desde la consulta' : 'La consulta se vinculó a un cliente existente', isNew ? 201 : 200);
});

/** Marca / desmarca una promo como enviada a un cliente */
exports.markSent = asyncHandler(async (req, res) => {
  const { promotion, sent = true } = req.body;
  const [client, promo] = await Promise.all([findClient(req.params.id), Promotion.exists({ _id: promotion })]);
  if (!promo) throw ApiError.notFound('Promoción no encontrada');

  client.promotionsSent = client.promotionsSent.filter((p) => String(p.promotion) !== String(promotion));
  if (sent) client.promotionsSent.push({ promotion, sentAt: new Date() });
  await client.save();
  success(res, client, sent ? 'Marcado como enviado' : 'Marca de envío quitada');
});

exports.toWhatsapp = toWhatsapp;
