const Promotion = require('../models/Promotion');
const Inquiry = require('../models/Inquiry');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { bodyData } = require('../utils/requestData');
const { uploadBuffer, destroyImage } = require('../utils/cloudinaryUpload');

const CABIN_FIELDS = 'name slug capacity';

const findPromo = async (id) => {
  const promo = await Promotion.findById(id);
  if (!promo) throw ApiError.notFound('Promoción no encontrada');
  return promo;
};

/** Vigentes: activas y dentro de su rango de fechas */
exports.listPublic = asyncHandler(async (req, res) => {
  const promos = await Promotion.find(Promotion.currentFilter())
    .populate('cabins', CABIN_FIELDS)
    .sort({ featured: -1, order: 1, endDate: 1 });
  success(res, promos);
});

/** Todas, con la cantidad de consultas que generó cada una */
exports.listAll = asyncHandler(async (req, res) => {
  const [promos, counts] = await Promise.all([
    Promotion.find().populate('cabins', CABIN_FIELDS).sort({ createdAt: -1 }),
    Inquiry.aggregate([{ $match: { promotion: { $ne: null } } }, { $group: { _id: '$promotion', count: { $sum: 1 } } }]),
  ]);
  const byPromo = new Map(counts.map((c) => [String(c._id), c.count]));
  success(res, promos.map((p) => ({ ...p.toJSON(), inquiriesCount: byPromo.get(String(p._id)) || 0 })));
});

exports.getOne = asyncHandler(async (req, res) => {
  const promo = await findPromo(req.params.id);
  await promo.populate('cabins', CABIN_FIELDS);
  success(res, promo);
});

const normalize = (data) => {
  if (data.appliesToAll === true) data.cabins = [];
  return data;
};

exports.create = asyncHandler(async (req, res) => {
  const promo = await Promotion.create(normalize(bodyData(req)));
  created(res, promo, 'Promoción creada');
});

exports.update = asyncHandler(async (req, res) => {
  const promo = await findPromo(req.params.id);
  promo.set(normalize(bodyData(req)));
  await promo.save();
  await promo.populate('cabins', CABIN_FIELDS);
  success(res, promo, 'Promoción actualizada');
});

exports.remove = asyncHandler(async (req, res) => {
  const promo = await findPromo(req.params.id);
  await destroyImage(promo.image?.public_id);
  await promo.deleteOne();
  success(res, null, 'Promoción eliminada');
});

/** Sube o reemplaza la imagen (borra la anterior de Cloudinary) */
exports.uploadImage = asyncHandler(async (req, res) => {
  const promo = await findPromo(req.params.id);
  const previous = promo.image?.public_id;
  promo.image = { ...(await uploadBuffer(req.file.buffer, 'promociones')), alt: promo.title };
  await promo.save();
  await destroyImage(previous);
  success(res, promo, 'Imagen actualizada');
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const promo = await findPromo(req.params.id);
  await destroyImage(promo.image?.public_id);
  promo.image = null;
  await promo.save();
  success(res, promo, 'Imagen eliminada');
});
