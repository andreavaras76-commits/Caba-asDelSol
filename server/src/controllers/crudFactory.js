const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { bodyData, flatten } = require('../utils/requestData');
const { uploadBuffer, destroyImage } = require('../utils/cloudinaryUpload');

/**
 * Genera los controladores de un CRUD simple con `active` y `order`
 * (servicios, atractivos, FAQ, reseñas).
 */
module.exports = function crudFactory(Model, { label = 'Elemento', sort = { order: 1, createdAt: 1 }, folder } = {}) {
  const find = async (id) => {
    const doc = await Model.findById(id);
    if (!doc) throw ApiError.notFound(`${label} no encontrado`);
    return doc;
  };

  const controllers = {
    listPublic: asyncHandler(async (req, res) => success(res, await Model.find({ active: true }).sort(sort))),

    listAll: asyncHandler(async (req, res) => success(res, await Model.find().sort(sort))),

    getOne: asyncHandler(async (req, res) => success(res, await find(req.params.id))),

    create: asyncHandler(async (req, res) => {
      const data = bodyData(req);
      if (data.order === undefined) data.order = await Model.countDocuments();
      created(res, await Model.create(data), `${label} creado`);
    }),

    update: asyncHandler(async (req, res) => {
      const doc = await find(req.params.id);
      doc.set(flatten(bodyData(req)));
      await doc.save();
      success(res, doc, `${label} actualizado`);
    }),

    remove: asyncHandler(async (req, res) => {
      const doc = await find(req.params.id);
      if (doc.image?.public_id) await destroyImage(doc.image.public_id);
      await doc.deleteOne();
      success(res, null, `${label} eliminado`);
    }),

    /** Recibe { ids: [...] } en el orden deseado */
    reorder: asyncHandler(async (req, res) => {
      await Model.bulkWrite(req.body.ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } })));
      success(res, await Model.find().sort(sort), 'Orden actualizado');
    }),
  };

  // Imagen única opcional (ej: atractivos)
  if (folder) {
    controllers.uploadImage = asyncHandler(async (req, res) => {
      const doc = await find(req.params.id);
      const previous = doc.image?.public_id;
      doc.image = { ...(await uploadBuffer(req.file.buffer, folder)), alt: doc.name || doc.title || '' };
      await doc.save();
      await destroyImage(previous);
      success(res, doc, 'Imagen actualizada');
    });

    controllers.deleteImage = asyncHandler(async (req, res) => {
      const doc = await find(req.params.id);
      await destroyImage(doc.image?.public_id);
      doc.image = null;
      await doc.save();
      success(res, doc, 'Imagen eliminada');
    });
  }

  return controllers;
};
