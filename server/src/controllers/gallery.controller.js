const GalleryImage = require('../models/GalleryImage');
const Cabin = require('../models/Cabin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { bodyData } = require('../utils/requestData');
const { uploadMany, destroyImage } = require('../utils/cloudinaryUpload');

const SORT = { order: 1, createdAt: -1 };

exports.listPublic = asyncHandler(async (req, res) => {
  const [gallery, cabins] = await Promise.all([
    GalleryImage.find({ active: true }).sort(SORT).populate('cabin', 'name slug active order').lean(),
    Cabin.find({ active: true, 'images.0': { $exists: true } }).select('name slug images order').sort({ order: 1 }).lean(),
  ]);
  const fromGallery = gallery
    .filter((img) => !img.cabin || img.cabin.active)
    .map((img) => ({ ...img, cabin: img.cabin ? { _id: img.cabin._id, name: img.cabin.name, slug: img.cabin.slug, order: img.cabin.order } : null }));
  const fromCabins = cabins.flatMap((c) =>
    c.images.map((img) => ({
      _id: img._id,
      url: img.url,
      width: img.width,
      height: img.height,
      alt: img.alt || c.name,
      category: 'cabanas',
      cabin: { _id: c._id, name: c.name, slug: c.slug, order: c.order },
      source: 'cabin',
    }))
  );
  success(res, [...fromGallery, ...fromCabins]);
});

exports.listAll = asyncHandler(async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  success(res, await GalleryImage.find(filter).sort(SORT));
});

exports.upload = asyncHandler(async (req, res) => {
  const { category } = req.body;
  const cabin = category === 'cabanas' && req.body.cabin ? req.body.cabin : null;
  const uploaded = await uploadMany(req.files, `galeria/${category}`);
  const start = await GalleryImage.countDocuments();
  const docs = await GalleryImage.insertMany(
    uploaded.map((img, i) => ({ ...img, category, cabin, order: start + i, alt: `Cabañas del Sol, Tafí del Valle — ${category}` }))
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
