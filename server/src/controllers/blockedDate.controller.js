const BlockedDate = require('../models/BlockedDate');
const Cabin = require('../models/Cabin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { success, created } = require('../utils/response');
const { bodyData } = require('../utils/requestData');
const { startOfDayAR } = require('../utils/dates');

exports.listPublic = asyncHandler(async (req, res) => {
  const filter = { endDate: { $gte: startOfDayAR() } };
  if (req.query.cabin) filter.cabin = req.query.cabin;
  const ranges = await BlockedDate.find(filter).select('cabin startDate endDate').sort({ startDate: 1 });
  success(res, ranges);
});

exports.listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.cabin) filter.cabin = req.query.cabin;
  if (req.query.upcoming === 'true') filter.endDate = { $gte: startOfDayAR() };
  success(res, await BlockedDate.find(filter).populate('cabin', 'name slug').sort({ startDate: 1 }));
});

exports.create = asyncHandler(async (req, res) => {
  const data = bodyData(req);
  if (!(await Cabin.exists({ _id: data.cabin }))) throw ApiError.badRequest('La cabaña no existe');
  if (await BlockedDate.overlaps(data.cabin, data.startDate, data.endDate)) {
    throw new ApiError(409, 'Ese rango se superpone con otro bloqueo de la misma cabaña');
  }
  const blocked = await BlockedDate.create(data);
  await blocked.populate('cabin', 'name slug');
  created(res, blocked, 'Fechas bloqueadas');
});

exports.remove = asyncHandler(async (req, res) => {
  const blocked = await BlockedDate.findByIdAndDelete(req.params.id);
  if (!blocked) throw ApiError.notFound('Bloqueo no encontrado');
  success(res, null, 'Bloqueo eliminado');
});
