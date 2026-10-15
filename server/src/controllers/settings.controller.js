const Settings = require('../models/Settings');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const { bodyData, flatten } = require('../utils/requestData');
const { uploadMany, uploadBuffer, destroyImage } = require('../utils/cloudinaryUpload');

/** Grupo de imágenes → ruta dentro del documento de configuración */
const IMAGE_GROUPS = {
  heroVerano: { path: 'hero.imagesVerano', multiple: true },
  heroInvierno: { path: 'hero.imagesInvierno', multiple: true },
  about: { path: 'about.images', multiple: true },
  events: { path: 'events.images', multiple: true },
  og: { path: 'seo.ogImage', multiple: false },
};

const getGroup = (name) => {
  const group = IMAGE_GROUPS[name];
  if (!group) throw ApiError.badRequest('Grupo de imágenes inválido');
  return group;
};

exports.get = asyncHandler(async (req, res) => {
  success(res, await Settings.getSingleton());
});

exports.update = asyncHandler(async (req, res) => {
  await Settings.getSingleton();
  const settings = await Settings.findOneAndUpdate(
    { key: 'main' },
    { $set: flatten(bodyData(req)) },
    { new: true, runValidators: true }
  );
  success(res, settings, 'Configuración guardada');
});

exports.uploadImages = asyncHandler(async (req, res) => {
  const group = getGroup(req.params.group);
  const settings = await Settings.getSingleton();
  const files = req.files || [req.file];

  if (group.multiple) {
    const uploaded = await uploadMany(files, 'sitio');
    // $push atómico: la carga masiva sube varias fotos en paralelo
    await Settings.updateOne({ _id: settings._id }, { $push: { [group.path]: { $each: uploaded } } });
    return success(res, await Settings.getSingleton(), 'Imágenes subidas');
  } else {
    const previous = settings.get(group.path);
    settings.set(group.path, await uploadBuffer(files[0].buffer, 'sitio'));
    if (previous?.public_id) await destroyImage(previous.public_id);
  }

  await settings.save();
  success(res, settings, 'Imágenes subidas');
});

exports.reorderImages = asyncHandler(async (req, res) => {
  const group = getGroup(req.params.group);
  if (!group.multiple) throw ApiError.badRequest('Este grupo tiene una sola imagen');
  const settings = await Settings.getSingleton();
  const current = settings.get(group.path);
  const byId = new Map(current.map((img) => [String(img._id), img]));
  const ordered = req.body.ids.map((id) => byId.get(String(id))).filter(Boolean);
  if (ordered.length !== current.length) throw ApiError.badRequest('El orden enviado no coincide con las imágenes actuales');
  settings.set(group.path, ordered);
  await settings.save();
  success(res, settings, 'Orden actualizado');
});

exports.deleteImage = asyncHandler(async (req, res) => {
  const group = getGroup(req.params.group);
  const settings = await Settings.getSingleton();

  if (group.multiple) {
    const list = settings.get(group.path);
    const image = list.id(req.params.imageId);
    if (!image) throw ApiError.notFound('Imagen no encontrada');
    await destroyImage(image.public_id);
    image.deleteOne();
  } else {
    const image = settings.get(group.path);
    if (image?.public_id) await destroyImage(image.public_id);
    settings.set(group.path, null);
  }

  await settings.save();
  success(res, settings, 'Imagen eliminada');
});
