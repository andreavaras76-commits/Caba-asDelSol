const Cabin = require('../models/Cabin');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

const xmlEscape = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);

/** sitemap.xml dinámico: home + cada cabaña activa (el front lo expone en /sitemap.xml) */
exports.sitemap = asyncHandler(async (req, res) => {
  const base = env.SITE_URL;
  const cabins = await Cabin.find({ active: true }).select('slug updatedAt').sort({ order: 1 }).lean();
  const urls = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0' },
    ...cabins.map((c) => ({ loc: `${base}/cabanas/${c.slug}`, lastmod: c.updatedAt.toISOString().slice(0, 10), changefreq: 'monthly', priority: '0.8' })),
  ];
  const body = urls
    .map((u) => `  <url><loc>${xmlEscape(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`)
    .join('\n');
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
});
