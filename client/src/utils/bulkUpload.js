/**
 * Carga masiva de fotos.
 * - Achica cada foto en el navegador (lado mayor 2400 px, calidad web) antes de subirla:
 *   las fotos de celular pesan 5–15 MB y Vercel rechaza cualquier envío de más de 4,5 MB.
 * - Las sube de a una (varias en paralelo) para que ninguna supere ese límite,
 *   y si alguna falla sigue con las demás.
 */

const MAX_SIDE = 2400;
const TARGET_BYTES = 3.8 * 1024 * 1024; // margen debajo de los 4,5 MB de Vercel
const CONCURRENCY = 3;

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la foto'));
    };
    img.src = url;
  });

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/** Devuelve la foto lista para subir (achicada si hace falta). Si algo falla, devuelve la original. */
export async function compressImage(file) {
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= TARGET_BYTES) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    // Las PNG con transparencia quedan sobre fondo blanco (se guardan como JPG)
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.86;
    let blob = await toBlob(canvas, 'image/jpeg', quality);
    while (blob && blob.size > TARGET_BYTES && quality > 0.5) {
      quality -= 0.1;
      blob = await toBlob(canvas, 'image/jpeg', quality); // eslint-disable-line no-await-in-loop
    }
    if (!blob || (blob.size >= file.size && file.size <= TARGET_BYTES)) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
  } catch {
    return file;
  }
}

/**
 * Sube las fotos de a una con `sendOne(file)`.
 * `onProgress({ done, total, phase })` se llama en cada paso para mostrar la barra.
 * Devuelve { ok: [respuestas], failed: [{ name, message }] }.
 */
export async function bulkUpload(files, sendOne, onProgress = () => {}) {
  const total = files.length;
  const ok = [];
  const failed = [];
  let done = 0;
  let next = 0;
  onProgress({ done, total });

  const worker = async () => {
    while (next < total) {
      const file = files[next++];
      try {
        const ready = await compressImage(file); // eslint-disable-line no-await-in-loop
        ok.push(await sendOne(ready)); // eslint-disable-line no-await-in-loop
      } catch (err) {
        failed.push({ name: file.name, message: err?.message || 'No se pudo subir' });
      }
      done++;
      onProgress({ done, total });
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, total) }, worker));
  return { ok, failed };
}
