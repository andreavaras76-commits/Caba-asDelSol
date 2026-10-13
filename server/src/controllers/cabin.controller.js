const Cabin = require('../models/Cabin');
const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('../utils/slugify');
const { success, created } = require('../utils/response');
const { bodyData, flatten } = require('../utils/requestData');
const { uploadMany, destroyImage, destroyMany } = require('../utils/cloudinaryUpload');

/** Oculta el precio si el switch global o el de la cabaña están apagados */
const publicCabin = (cabin, showPrices) => {
  const obj = cabin.toJSON();
  if (!showPrices || !obj.price?.show) obj.price = { amount: null, show: false };
  return obj;
};

const uniqueSlug = async (base, excludeId) => {
  let slug = slugify(base);
  let i = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await Cabin.exists({ slug, _id: { $ne: excludeId } })) slug = `${slugify(base)}-${i++}`;
  return slug;
};

const findCabin = async (id) => {
  const cabin = await Cabin.findById(id);
  if (!cabin) throw ApiError.notFound('Cabaña no encontrada');
  return cabin;
};

// ---------- Público ----------

exports.listPublic = asyncHandler(async (req, res) => {
  const [cabins, settings] = await Promise.all([Cabin.find({ active: true }).sort({ order: 1, createdAt: 1 }), Settings.getSingleton()]);
  success(res, cabins.map((c) => publicCabin(c, settings.showPrices)));
});

exports.getBySlug = asyncHandler(async (req, res) => {
  const [cabin, settings] = await Promise.all([Cabin.findOne({ slug: req.params.slug, active: true }), Settings.getSingleton()]);
  if (!cabin) throw ApiError.notFound('Cabaña no encontrada');
  success(res, publicCabin(cabin, settings.showPrices));
});

// ---------- Admin ----------

exports.listAll = asyncHandler(async (req, res) => {
  success(res, await Cabin.find().sort({ order: 1, createdAt: 1 }));
});

exports.getOne = asyncHandler(async (req, res) => success(res, await findCabin(req.params.id)));

exports.create = asyncHandler(async (req, res) => {
  const data = bodyData(req);
  data.slug = await uniqueSlug(data.slug || data.name);
  const cabin = await Cabin.create(data);
  created(res, cabin, 'Cabaña creada');
});

exports.update = asyncHandler(async (req, res) => {
  const cabin = await findCabin(req.params.id);
  const data = bodyData(req);
  if (data.slug) data.slug = await uniqueSlug(data.slug, cabin._id);
  cabin.set(flatten(data));
  await cabin.save();
  success(res, cabin, 'Cabaña actualizada');
});

exports.remove = asyncHandler(async (req, res) => {
  const cabin = await findCabin(req.params.id);
  await destroyMany(cabin.images.map((img) => img.public_id));
  await cabin.deleteOne();
  success(res, null, 'Cabaña eliminada');
});

// ---------- Galería de la cabaña ----------

exports.uploadImages = asyncHandler(async (req, res) => {
  const cabin = await findCabin(req.params.id);
  const uploaded = await uploadMany(req.files, `cabanas/${cabin.slug}`);
  cabin.images.push(...uploaded.map((img) => ({ ...img, alt: `${cabin.name} — Cabañas del Sol, Tafí del Valle` })));
  await cabin.save();
  success(res, cabin, `${uploaded.length} ${uploaded.length === 1 ? 'imagen subida' : 'imágenes subidas'}`);
});

/** Reordena (drag & drop) y define la portada */
exports.reorderImages = asyncHandler(async (req, res) => {
  const cabin = await findCabin(req.params.id);
  const byId = new Map(cabin.images.map((img) => [String(img._id), img]));
  const ordered = req.body.imageIds.map((id) => byId.get(String(id))).filter(Boolean);
  if (ordered.length !== cabin.images.length) throw ApiError.badRequest('El orden enviado no coincide con las imágenes de la cabaña');

  cabin.images = ordered;
  if (req.body.coverImageId !== undefined) {
    if (req.body.coverImageId && !byId.has(String(req.body.coverImageId))) throw ApiError.badRequest('La portada no pertenece a esta cabaña');
    cabin.coverImageId = req.body.coverImageId || null;
  }
  await cabin.save();
  success(res, cabin, 'Galería actualizada');
});

exports.updateImage = asyncHandler(async (req, res) => {
  const cabin = await findCabin(req.params.id);
  const image = cabin.images.id(req.params.imageId);
  if (!image) throw ApiError.notFound('Imagen no encontrada');
  image.alt = req.body.alt ?? image.alt;
  await cabin.save();
  success(res, cabin, 'Imagen actualizada');
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const cabin = await findCabin(req.params.id);
  const image = cabin.images.id(req.params.imageId);
  if (!image) throw ApiError.notFound('Imagen no encontrada');

  await destroyImage(image.public_id);
  if (String(cabin.coverImageId) === String(image._id)) cabin.coverImageId = null;
  image.deleteOne();
  await cabin.save();
  success(res, cabin, 'Imagen eliminada');
});
