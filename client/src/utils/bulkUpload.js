const MAX_SIDE = 2400;
const TARGET_BYTES = 3.8 * 1024 * 1024;
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

export async function compressImage(file) {
  try {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= TARGET_BYTES) return file;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.86;
    let blob = await toBlob(canvas, 'image/jpeg', quality);
    while (blob && blob.size > TARGET_BYTES && quality > 0.5) {
      quality -= 0.1;
      blob = await toBlob(canvas, 'image/jpeg', quality);
    }
    if (!blob || (blob.size >= file.size && file.size <= TARGET_BYTES)) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg', lastModified: file.lastModified });
  } catch {
    return file;
  }
}

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
        const ready = await compressImage(file);
        ok.push(await sendOne(ready));
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
