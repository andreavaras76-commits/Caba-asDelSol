import { z } from 'zod';
import { LIMITS, SLEEPING_OPTIONS, EVENT_MIN_HOURS } from '@/utils/constants';
import { todayISO, overlapsBlocked } from '@/utils/format';

const name = z
  .string({ required_error: 'Tu nombre es obligatorio' })
  .trim()
  .min(LIMITS.NAME_MIN, `Tu nombre debe tener entre ${LIMITS.NAME_MIN} y ${LIMITS.NAME_MAX} caracteres`)
  .max(LIMITS.NAME_MAX, `Tu nombre debe tener entre ${LIMITS.NAME_MIN} y ${LIMITS.NAME_MAX} caracteres`);

const phone = z
  .string()
  .trim()
  .regex(/^[\d\s()+-]{8,20}$/, 'Ingresá un teléfono válido')
  .optional()
  .or(z.literal(''));

const comments = z.string().trim().max(500, 'El comentario admite hasta 500 caracteres').optional().or(z.literal(''));

const isoDate = (label) => z.string({ required_error: `Elegí ${label}` }).min(1, `Elegí ${label}`);

const guests = (max) =>
  z.coerce
    .number({ invalid_type_error: 'Indicá la cantidad de huéspedes' })
    .int()
    .min(1, 'Tiene que haber al menos 1 huésped')
    .max(max, `Máximo ${max} ${max === 1 ? 'huésped' : 'huéspedes'}`);

export const makeStaySchema = ({ maxGuests = LIMITS.GUESTS_MAX, requireCabin = false, blocked = [], sleepingOptions = Object.keys(SLEEPING_OPTIONS) } = {}) =>
  z
    .object({
      name,
      phone,
      cabin: requireCabin ? z.string().min(1, 'Elegí una cabaña') : z.string().optional().or(z.literal('')),
      promotion: z.string().optional().or(z.literal('')),
      checkIn: isoDate('la fecha de entrada'),
      checkOut: isoDate('la fecha de salida'),
      guests: guests(maxGuests),
      pets: z.boolean().default(false),
      sleepingPreference: z.enum(Object.keys(SLEEPING_OPTIONS)).optional().or(z.literal('')),
      comments,
    })
    .refine((d) => !d.sleepingPreference || sleepingOptions.includes(d.sleepingPreference), {
      path: ['sleepingPreference'],
      message: 'Esa opción de cama no está disponible en esta cabaña',
    })
    .refine((d) => d.checkIn >= todayISO(), { path: ['checkIn'], message: 'La fecha de entrada no puede ser pasada' })
    .refine((d) => d.checkOut > d.checkIn, { path: ['checkOut'], message: 'La salida debe ser posterior a la entrada' })
    .refine((d) => !overlapsBlocked(d.checkIn, d.checkOut, blocked), {
      path: ['checkIn'],
      message: 'Sin disponibilidad en esas fechas. Probá con otras.',
    });

export const makeEventSchema = ({ capacity = LIMITS.GUESTS_MAX, minHours = EVENT_MIN_HOURS } = {}) =>
  z
    .object({
      name,
      phone,
      eventType: z.string().trim().min(2, 'Contanos qué tipo de evento es').max(60, 'Hasta 60 caracteres'),
      eventDate: isoDate('la fecha del evento'),
      people: z.coerce
        .number({ invalid_type_error: 'Indicá la cantidad de personas' })
        .int()
        .min(1, 'Tiene que haber al menos 1 persona')
        .max(capacity, `El predio recibe hasta ${capacity} personas`),
      hours: z.coerce
        .number({ invalid_type_error: 'Indicá cuántas horas' })
        .int('Indicá horas enteras')
        .min(minHours, `El mínimo es de ${minHours} horas`)
        .max(24, 'Hasta 24 horas'),
      withLodging: z.boolean().default(false),
      comments,
    })
    .refine((d) => d.eventDate >= todayISO(), { path: ['eventDate'], message: 'La fecha del evento no puede ser pasada' });

export const makePromoSchema = ({ maxGuests = LIMITS.GUESTS_MAX } = {}) =>
  z
    .object({
      name,
      cabin: z.string().optional().or(z.literal('')),
      checkIn: z.string().optional().or(z.literal('')),
      checkOut: z.string().optional().or(z.literal('')),
      guests: z.preprocess((v) => (v === '' || v === null ? undefined : v), guests(maxGuests).optional()),
      pets: z.boolean().default(false),
    })
    .refine((d) => !d.checkIn || d.checkIn >= todayISO(), { path: ['checkIn'], message: 'La fecha de entrada no puede ser pasada' })
    .refine((d) => !d.checkOut || d.checkIn, { path: ['checkIn'], message: 'Elegí también la fecha de entrada' })
    .refine((d) => !d.checkIn || !d.checkOut || d.checkOut > d.checkIn, {
      path: ['checkOut'],
      message: 'La salida debe ser posterior a la entrada',
    });
