import { Helmet } from 'react-helmet-async';
import { useSettingsStore } from '@/store/settingsStore';
import { cld } from '@/utils/cloudinary';

const SITE_URL = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');

/** Meta tags dinámicos + Open Graph + JSON-LD opcional */
export default function Seo({ title, description, image, path = '', jsonLd, noindex = false }) {
  const settings = useSettingsStore((s) => s.settings);
  const siteName = `${settings.businessName} — ${settings.location}`;
  const fullTitle = title ? `${title} · ${siteName}` : settings.seo?.title || siteName;
  const desc = description || settings.seo?.description || settings.slogan;
  const ogSrc = image || settings.seo?.ogImage?.url || settings.hero?.imagesVerano?.[0]?.url;
  // 1200x630 es el tamaño ideal para la vista previa de WhatsApp / Instagram / Facebook
  const ogImage = ogSrc ? cld(ogSrc, { width: 1200, height: 630 }) : SITE_URL ? `${SITE_URL}/og-default.jpg` : undefined;
  const url = SITE_URL ? `${SITE_URL}${path}` : undefined;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="es_AR" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {url && <meta property="og:url" content={url} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content="1200" />}
      {ogImage && <meta property="og:image:height" content="630" />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}

/** Datos estructurados schema.org/LodgingBusiness */
export const lodgingJsonLd = (settings, { cabins = [], reviews = [] } = {}) => {
  const a = settings.address || {};
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: settings.businessName,
    description: settings.about?.text || settings.slogan,
    url: SITE_URL || settings.contact?.website,
    telephone: settings.contact?.whatsapp ? `+${settings.contact.whatsapp}` : undefined,
    image: [settings.seo?.ogImage?.url, ...(settings.hero?.imagesVerano || []).map((i) => i.url)].filter(Boolean),
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.city,
      postalCode: a.postalCode,
      addressRegion: a.province,
      addressCountry: 'AR',
    },
    geo: a.lat && a.lng ? { '@type': 'GeoCoordinates', latitude: a.lat, longitude: a.lng } : undefined,
    hasMap: a.mapsUrl,
    petsAllowed: true,
    amenityFeature: ['WiFi gratis', 'TV satelital', 'Pileta', 'Quincho', 'Aire acondicionado', 'Desayuno', 'Lavandería', 'Estacionamiento'].map(
      (name) => ({ '@type': 'LocationFeatureSpecification', name, value: true })
    ),
    sameAs: [settings.social?.instagram, settings.social?.facebook].filter(Boolean),
    containsPlace: cabins.map((c) => ({ '@type': 'Accommodation', name: c.name, occupancy: { '@type': 'QuantitativeValue', maxValue: c.capacity } })),
  };
  if (reviews.length) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1),
      reviewCount: reviews.length,
    };
  }
  return JSON.parse(JSON.stringify(data)); // quita undefined
};
