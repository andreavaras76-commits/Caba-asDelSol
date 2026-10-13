const cloudinary = require('../config/cloudinary');
const env = require('../config/env');

/**
 * Sube un buffer (multer en memoria) a Cloudinary mediante upload_stream.
 * @returns {Promise<{url: string, public_id: string, width: number, height: number}>}
 */
function uploadBuffer(buffer, subfolder = 'general') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY.folder}/${subfolder}`,
        resource_type: 'image',
        // Limitamos el original a 2400px para no almacenar fotos gigantes de celular
        transformation: [{ width: 2400, height: 2400, crop: 'limit' }],
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );
    stream.end(buffer);
  });
}

/** Sube varios archivos de multer en paralelo */
const uploadMany = (files = [], subfolder) => Promise.all(files.map((f) => uploadBuffer(f.buffer, subfolder)));

/** Borra una imagen de Cloudinary; nunca rompe el flujo si falla */
async function destroyImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error(`No se pudo borrar ${publicId} de Cloudinary:`, err.message);
  }
}

const destroyMany = (publicIds = []) => Promise.all(publicIds.filter(Boolean).map(destroyImage));

module.exports = { uploadBuffer, uploadMany, destroyImage, destroyMany };
