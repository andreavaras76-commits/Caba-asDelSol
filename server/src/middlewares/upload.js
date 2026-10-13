const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { LIMITS } = require('../utils/constants');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** Multer en memoria: el buffer va directo a Cloudinary, nada se escribe en disco */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITS.IMAGE_MAX_MB * 1024 * 1024, files: 20 },
  fileFilter(req, file, cb) {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest('Formato no permitido. Usá JPG, PNG, WEBP o AVIF.'));
  },
});

/** Exige al menos un archivo después de multer */
const requireFiles = (req, res, next) => {
  const hasFiles = req.file || (req.files && req.files.length);
  if (!hasFiles) return next(ApiError.badRequest('Tenés que adjuntar al menos una imagen'));
  next();
};

module.exports = {
  single: (field = 'image') => [upload.single(field), requireFiles],
  many: (field = 'images', max = 20) => [upload.array(field, max), requireFiles],
};
