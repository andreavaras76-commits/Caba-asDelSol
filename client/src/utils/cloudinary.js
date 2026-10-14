/**
 * Inserta transformaciones de Cloudinary (f_auto, q_auto, ancho) en una URL de upload.
 * Si la URL no es de Cloudinary, se devuelve tal cual.
 */
export function cld(url, { width, height, crop = 'fill' } = {}) {
  if (!url || !url.includes('/upload/')) return url;
  const parts = ['f_auto', 'q_auto'];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);
  return url.replace('/upload/', `/upload/${parts.join(',')}/`);
}

/** Genera un srcSet responsivo para <img> */
export function cldSrcSet(url, widths = [480, 768, 1080, 1600, 2200]) {
  if (!url || !url.includes('/upload/')) return undefined;
  return widths.map((w) => `${cld(url, { width: w, crop: 'limit' })} ${w}w`).join(', ');
}

/**
 * URL para descargar una foto en buena calidad (JPG) con fl_attachment:
 * Cloudinary responde con "Content-Disposition: attachment", así que se descarga directo
 * en vez de abrirse en otra pestaña. `filename` va sin extensión.
 */
export function cldDownload(url, filename = 'cabanas-del-sol') {
  if (!url || !url.includes('/upload/')) return url;
  const safe = String(filename).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase();
  return url.replace('/upload/', `/upload/fl_attachment:${safe},f_jpg,q_auto:best/`);
}
