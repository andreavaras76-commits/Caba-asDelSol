const multer = require('multer');
const ApiError = require('../utils/ApiError');
const { LIMITS } = require('../utils/constants');

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITS.IMAGE_MAX_MB * 1024 * 1024, files: 20 },
  fileFilter(req, file, cb) {
    if (ALLOWED.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest('Formato no permitido. Usá JPG, PNG, WEBP o AVIF.'));
  },
});

const isRealImage = (buf) => {
  if (!buf || buf.length < 12) return false;
  const ascii = (start, end) => buf.subarray(start, end).toString('ascii');
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return true;
  if (buf[0] === 0x89 && ascii(1, 4) === 'PNG') return true;
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return true;
  return ascii(4, 8) === 'ftyp' && ['avif', 'avis', 'mif1'].includes(ascii(8, 12));
};

const requireFiles = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files.length) return next(ApiError.badRequest('Tenés que adjuntar al menos una imagen'));
  const fake = files.find((f) => !isRealImage(f.buffer));
  if (fake) return next(ApiError.badRequest(`"${fake.originalname}" no es una imagen válida. Usá JPG, PNG, WEBP o AVIF.`));
  next();
};

module.exports = {
  single: (field = 'image') => [upload.single(field), requireFiles],
  many: (field = 'images', max = 20) => [upload.array(field, max), requireFiles],
};
