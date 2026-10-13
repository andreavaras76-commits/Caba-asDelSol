/** Espejo de server/src/utils/slugify.js: "Cabaña El Pelado" → "cabana-el-pelado" */
export default function slugify(text = '') {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
