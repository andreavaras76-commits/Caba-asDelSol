const GalleryImage = require('../models/GalleryImage');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { bodyData } = require('../utils/requestData');
const { uploadMany, destroyImage } = require('../utils/cloudinaryUpload');

const SORT = { order: 1, createdAt: -1 };

exports.listPublic = asyncHandler(async (req, res) => {
  const filter = { active: true };
  if (req.query.category) filter.category = req.query.category;
  success(res, await GalleryImage.find(filter).sort(SORT));
});

exports.listAll = asyncHandler(async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  success(res, await GalleryImage.find(filter).sort(SORT));
});

/** Subida múltiple: todas las fotos del lote quedan en la misma categoría */
exports.upload = asyncHandler(async (req, res) => {
  const { category } = req.body;
  const start = await GalleryImage.countDocuments();
  const uploaded = await uploadMany(req.files, `galeria/${category}`);
  const docs = await GalleryImage.insertMany(
    uploaded.map((img, i) => ({ ...img, category, order: start + i, alt: `Cabañas del Sol, Tafí del Valle — ${category}` }))
  );
  created(res, docs, `${docs.length} ${docs.length === 1 ? 'foto subida' : 'fotos subidas'}`);
});

exports.update = asyncHandler(async (req, res) => {
  const img = await GalleryImage.findByIdAndUpdate(req.params.id, { $set: bodyData(req) }, { new: true, runValidators: true });
  if (!img) throw ApiError.notFound('Foto no encontrada');
  success(res, img, 'Foto actualizada');
});

exports.reorder = asyncHandler(async (req, res) => {
  await GalleryImage.bulkWrite(req.body.ids.map((id, order) => ({ updateOne: { filter: { _id: id }, update: { $set: { order } } } })));
  success(res, await GalleryImage.find().sort(SORT), 'Orden actualizado');
});

exports.remove = asyncHandler(async (req, res) => {
  const img = await GalleryImage.findById(req.params.id);
  if (!img) throw ApiError.notFound('Foto no encontrada');
  await destroyImage(img.public_id);
  await img.deleteOne();
  success(res, null, 'Foto eliminada');
});
