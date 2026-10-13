/** Formateos y fechas para la UI (es-AR) */

export const formatPrice = (amount) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

/** Las fechas de estadía viajan como "YYYY-MM-DD" (día calendario, sin hora) */
export const formatDay = (value, opts = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-AR', { ...opts, timeZone: 'UTC' }).format(new Date(value));
};

export const formatDayLong = (value) => formatDay(value, { day: 'numeric', month: 'long', year: 'numeric' });

/** "YYYY-MM-DD" de hoy en la zona horaria del navegador */
export const todayISO = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

export const addDaysISO = (iso, days) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const nightsBetween = (checkIn, checkOut) =>
  Math.round((new Date(`${checkOut}T00:00:00Z`) - new Date(`${checkIn}T00:00:00Z`)) / 86400000);

/** ¿[checkIn, checkOut) se superpone con algún rango bloqueado? */
export const overlapsBlocked = (checkIn, checkOut, ranges = []) => {
  if (!checkIn || !checkOut) return null;
  const a = new Date(`${checkIn}T00:00:00Z`);
  const b = new Date(`${checkOut}T00:00:00Z`);
  return ranges.find((r) => new Date(r.startDate) < b && new Date(r.endDate) > a) || null;
};

/** Texto del beneficio de una promo según su tipo */
export const promoBadge = (promo) => {
  switch (promo.type) {
    case 'porcentaje':
      return `${promo.value}% OFF`;
    case 'precio_especial':
      return `${formatPrice(promo.value)} / noche`;
    case 'noche_gratis':
      return promo.valueText || 'Noche gratis';
    default:
      return promo.valueText || 'Promo';
  }
};

/* ---- Fechas del panel ----
 * Promos: instantes en hora argentina (inicio 00:00, fin 23:59:59 del día elegido).
 * Estadías y bloqueos: días calendario (YYYY-MM-DD → 00:00 UTC), igual que las consultas.
 */
export const dayStartAR = (day) => (day ? `${day}T00:00:00-03:00` : null);
export const dayEndAR = (day) => (day ? `${day}T23:59:59-03:00` : null);
export const isoToInputAR = (iso) =>
  iso ? new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(iso)) : '';
export const isoToInputUTC = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

/** "hace 5 min", "hace 2 h", "ayer"… */
export const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'recién';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  if (diff < 172800) return 'ayer';
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(iso));
};
