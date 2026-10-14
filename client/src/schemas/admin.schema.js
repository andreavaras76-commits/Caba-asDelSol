import { z } from 'zod';
import {
  LIMITS,
  AMENITIES,
  BED_TYPES,
  BED_LOCATIONS,
  CABIN_TYPES,
  SLEEPING_OPTIONS,
  NEARBY_CATEGORIES,
  SERVICE_GROUPS,
  PROMO_TYPES,
  SEASONS,
  CLIENT_TAGS,
  GALLERY_CATEGORIES,
  INQUIRY_STATUS,
} from '@/utils/constants';

/*
 * Esquemas del panel. Cada uno espeja el validator homónimo de server/src/validators.
 * Los inputs numéricos vacíos se convierten a null para los campos opcionales.
 */

const keys = (obj) => Object.keys(obj);
const emptyToNull = (v) => (v === '' || v === undefined || Number.isNaN(v) ? null : v);

const text = (label, { min = 0, max = LIMITS.SHORT_TEXT_MAX, required = false } = {}) => {
  const base = z.string().trim();
  if (required) {
    return base
      .min(Math.max(min, 1), min > 1 ? `${label} debe tener entre ${min} y ${max} caracteres` : `${label} es obligatorio`)
      .max(max, `${label} debe tener entre ${min} y ${max} caracteres`);
  }
  return base.max(max, `${label} admite hasta ${max} caracteres`).optional().or(z.literal(''));
};

const int = (label, min, max) =>
  z.coerce.number({ invalid_type_error: `${label} debe ser un número` }).int(`${label} debe ser un número entero`).min(min, `${label} debe ser entre ${min} y ${max}`).max(max, `${label} debe ser entre ${min} y ${max}`);

const optionalNumber = (label, min = 0, max = 1e9) =>
  z.preprocess(emptyToNull, z.coerce.number({ invalid_type_error: `${label} debe ser un número` }).min(min, `${label} debe ser entre ${min} y ${max}`).max(max, `${label} debe ser entre ${min} y ${max}`).nullable());

const url = (label) => z.string().trim().url(`${label} debe ser una URL válida (https://…)`).regex(/^https?:\/\//, `${label} debe empezar con https://`).optional().or(z.literal(''));

export const whatsappField = (label = 'El WhatsApp') =>
  z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => /^\d{10,15}$/.test(v), `${label} debe tener entre 10 y 15 dígitos, con código de país (ej: 5493815027738)`);

const password = (label = 'La contraseña') =>
  z
    .string()
    .min(LIMITS.PASSWORD_MIN, `${label} debe tener entre ${LIMITS.PASSWORD_MIN} y 72 caracteres`)
    .max(72, `${label} debe tener entre ${LIMITS.PASSWORD_MIN} y 72 caracteres`)
    .regex(/[A-Za-z]/, `${label} debe incluir al menos una letra`)
    .regex(/\d/, `${label} debe incluir al menos un número`);

/* ---------------------------------- Auth ---------------------------------- */

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Ingresá tu usuario'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresá tu contraseña actual'),
    newPassword: password('La nueva contraseña'),
    confirm: z.string(),
  })
  .refine((d) => d.newPassword === d.confirm, { path: ['confirm'], message: 'Las contraseñas no coinciden' });


/* --------------------------------- Cabañas --------------------------------- */

export const cabinSchema = z.object({
  name: text('El nombre', { required: true, min: 2, max: LIMITS.NAME_MAX }),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug sólo admite minúsculas, números y guiones')
    .optional()
    .or(z.literal('')),
  shortDescription: text('La descripción corta', { max: LIMITS.SHORT_TEXT_MAX }),
  description: text('La descripción', { max: LIMITS.LONG_TEXT_MAX }),
  capacity: int('La capacidad', 1, LIMITS.GUESTS_MAX),
  rooms: int('Los ambientes', 1, 20),
  bathrooms: int('Los baños', 0, 10),
  type: z.enum(keys(CABIN_TYPES), { errorMap: () => ({ message: 'El tipo de cabaña no es válido' }) }),
  beds: z
    .array(
      z.object({
        type: z.enum(keys(BED_TYPES), { errorMap: () => ({ message: 'Tipo de cama no válido' }) }),
        quantity: int('La cantidad de camas', 1, 10),
        location: z.enum(keys(BED_LOCATIONS), { errorMap: () => ({ message: 'El ambiente de la cama no es válido' }) }),
      })
    )
    .max(10, 'Hasta 10 tipos de cama'),
  privateBathroom: z.boolean(),
  electricWaterHeater: z.boolean(),
  sleepingOptions: z.array(z.enum(keys(SLEEPING_OPTIONS))),
  amenities: z.array(z.enum(keys(AMENITIES))),
  price: z.object({ amount: optionalNumber('El precio', 0, 100000000), show: z.boolean() }),
  featured: z.boolean(),
  active: z.boolean(),
  order: int('El orden', 0, 9999),
});

/* ------------------------------- Promociones ------------------------------- */

export const promotionSchema = z
  .object({
    title: text('El título', { required: true, min: 3, max: LIMITS.TITLE_MAX }),
    description: text('La descripción', { max: 2000 }),
    type: z.enum(keys(PROMO_TYPES), { errorMap: () => ({ message: 'Elegí el tipo de promoción' }) }),
    value: optionalNumber('El valor', 0),
    valueText: text('El texto del beneficio', { max: 80 }),
    appliesToAll: z.boolean(),
    cabins: z.array(z.string()),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    minNights: int('El mínimo de noches', 1, 30),
    season: z.enum(keys(SEASONS)),
    featured: z.boolean(),
    active: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (d.type === 'porcentaje' && !(d.value >= 1 && d.value <= 100)) ctx.addIssue({ code: 'custom', path: ['value'], message: 'El descuento debe ser entre 1% y 100%' });
    if (d.type === 'precio_especial' && !(d.value > 0)) ctx.addIssue({ code: 'custom', path: ['value'], message: 'Ingresá el precio especial' });
    if (d.type === 'texto' && !d.valueText?.trim()) ctx.addIssue({ code: 'custom', path: ['valueText'], message: 'Escribí el beneficio de la promo' });
    if (!d.appliesToAll && !d.cabins.length) ctx.addIssue({ code: 'custom', path: ['cabins'], message: 'Elegí al menos una cabaña o marcá "todas"' });
    if (d.startDate && d.endDate && d.endDate < d.startDate) ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'La fecha de fin debe ser posterior a la de inicio' });
  });

/* -------------------------------- Consultas -------------------------------- */

export const inquiryUpdateSchema = z.object({
  status: z.enum(keys(INQUIRY_STATUS)),
  notes: text('Las notas', { max: 1000 }),
});

/* ---------------------------- Clientes ---------------------------- */

export const clientSchema = z.object({
  name: text('El nombre', { required: true, min: 2, max: LIMITS.NAME_MAX }),
  phone: whatsappField(),
  cabin: z.string().optional().or(z.literal('')),
  lastStay: z.string().optional().or(z.literal('')),
  notes: text('Las notas', { max: 1000 }),
  tags: z.array(z.enum(keys(CLIENT_TAGS))),
});

/* ------------------------------ Contenido simple ------------------------------ */

// El orden se maneja con drag & drop, no desde el formulario
const common = { active: z.boolean() };

export const serviceSchema = z.object({
  name: text('El nombre', { required: true, min: 2, max: 60 }),
  icon: z.string().regex(/^[A-Za-z0-9]{2,40}$/, 'Elegí un ícono'),
  description: text('La descripción', { max: LIMITS.SHORT_TEXT_MAX }),
  group: z.enum(keys(SERVICE_GROUPS)),
  ...common,
});

export const attractionSchema = z.object({
  name: text('El nombre', { required: true, min: 2, max: LIMITS.NAME_MAX }),
  description: text('La descripción', { max: 1000 }),
  distance: text('La distancia', { max: 40 }),
  mapsUrl: url('El link de Maps'),
  ...common,
});

export const faqSchema = z.object({
  question: text('La pregunta', { required: true, min: 5, max: 200 }),
  answer: text('La respuesta', { required: true, min: 5, max: 2000 }),
  ...common,
});

const optionalPhone = (label) => z.string().trim().regex(/^[\d\s()+-]{6,25}$/, `${label} no es válido`).optional().or(z.literal(''));

export const nearbyPlaceSchema = z.object({
  name: text('El nombre', { required: true, min: 2, max: LIMITS.NAME_MAX }),
  category: z.enum(keys(NEARBY_CATEGORIES), { errorMap: () => ({ message: 'Elegí la categoría' }) }),
  description: text('La descripción', { max: LIMITS.SHORT_TEXT_MAX }),
  phone: optionalPhone('El teléfono'),
  whatsapp: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => !v || /^\d{10,15}$/.test(v), 'El WhatsApp debe tener entre 10 y 15 dígitos, con código de país (ej: 5493815027738)'),
  address: text('La dirección', { max: 160 }),
  mapsUrl: url('El link de Maps'),
  ...common,
});

export const specialEventSchema = z.object({
  title: text('El título', { required: true, min: 3, max: LIMITS.TITLE_MAX }),
  description: text('La descripción', { max: 1000 }),
  date: z.string().optional().or(z.literal('')),
  ...common,
});

export const reviewSchema = z.object({
  author: text('El autor', { required: true, min: 2, max: LIMITS.NAME_MAX }),
  origin: text('La procedencia', { max: 80 }),
  rating: int('La puntuación', 1, 5),
  text: text('La reseña', { required: true, min: 10, max: 1500 }),
  source: text('La fuente', { max: 40 }),
  date: z.string().optional().or(z.literal('')),
  ...common,
});

export const galleryUpdateSchema = z.object({
  alt: text('El texto alternativo', { max: 160 }),
  category: z.enum(keys(GALLERY_CATEGORIES)),
  cabin: z.string().optional().or(z.literal('')),
  active: z.boolean(),
});

export const blockedDateSchema = z
  .object({
    cabin: z.string().min(1, 'Elegí la cabaña'),
    startDate: z.string().min(1, 'La fecha desde es obligatoria'),
    endDate: z.string().min(1, 'La fecha hasta es obligatoria'),
    reason: text('El motivo', { max: 120 }),
  })
  .refine((d) => d.endDate > d.startDate, { path: ['endDate'], message: 'La fecha hasta debe ser posterior a la fecha desde' });

/* ---------------------------- Configuración general ---------------------------- */

export const settingsSchema = z.object({
  businessName: text('El nombre del negocio', { max: LIMITS.NAME_MAX }),
  location: text('La localidad', { max: LIMITS.NAME_MAX }),
  slogan: text('El slogan', { max: 200 }),
  contact: z.object({
    whatsapp: whatsappField(),
    phoneDisplay: text('El teléfono visible', { max: 30 }),
    email: z.string().trim().email('El email de contacto no es válido').optional().or(z.literal('')),
    website: url('La web'),
  }),
  social: z.object({ instagram: url('El link de Instagram'), threads: url('El link de Threads'), facebook: url('El link de Facebook') }),
  address: z.object({
    street: text('La dirección', { max: 200 }),
    city: text('La ciudad', { max: 80 }),
    postalCode: text('El código postal', { max: 12 }),
    province: text('La provincia', { max: 80 }),
    country: text('El país', { max: 80 }),
    mapsUrl: url('El link de Google Maps'),
    lat: optionalNumber('La latitud', -90, 90),
    lng: optionalNumber('La longitud', -180, 180),
  }),
  hero: z.object({ title: text('El título del hero', { max: LIMITS.TITLE_MAX }), subtitle: text('El subtítulo del hero', { max: LIMITS.SHORT_TEXT_MAX }) }),
  about: z.object({
    title: text('El título de Nosotros', { max: LIMITS.TITLE_MAX }),
    text: text('El texto de Nosotros', { max: LIMITS.LONG_TEXT_MAX }),
    stats: z
      .array(
        z.object({
          value: z.coerce.number({ invalid_type_error: 'El valor del contador debe ser un número' }).min(0, 'El valor del contador debe ser un número'),
          suffix: z.string().max(10, 'Sufijo de hasta 10 caracteres').optional().or(z.literal('')),
          label: z.string().trim().min(2, 'Etiqueta del contador entre 2 y 60 caracteres').max(60, 'Etiqueta del contador entre 2 y 60 caracteres'),
        })
      )
      .max(6, 'Hasta 6 contadores'),
  }),
  events: z.object({
    title: text('El título de Eventos', { max: LIMITS.TITLE_MAX }),
    text: text('El texto de Eventos', { max: LIMITS.LONG_TEXT_MAX }),
    capacity: int('La capacidad de eventos', 1, 500),
    includes: z
      .array(
        z.object({
          label: z.string().trim().min(2, 'Cada ítem incluido entre 2 y 60 caracteres').max(60, 'Cada ítem incluido entre 2 y 60 caracteres'),
          icon: z.string().regex(/^[A-Za-z0-9]{2,40}$/, 'Ícono inválido'),
          badge: z.string().trim().max(20, 'La etiqueta del ítem admite hasta 20 caracteres').optional().or(z.literal('')),
        })
      )
      .max(24, 'Hasta 24 ítems'),
    minHours: int('El mínimo de horas', 1, 24),
    schedule: text('Los horarios', { max: 60 }),
    lodgingOptional: z.boolean(),
  }),
  showPrices: z.boolean(),
  seo: z.object({ title: text('El título SEO', { max: 70 }), description: text('La descripción SEO', { max: 160 }) }),
});
