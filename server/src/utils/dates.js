/** Utilidades de fecha en hora de Argentina (UTC-3, sin horario de verano) */
const AR_OFFSET_MS = 3 * 60 * 60 * 1000;

/** Inicio del día actual en Argentina, expresado en UTC */
function startOfDayAR(date = new Date()) {
  const local = new Date(date.getTime() - AR_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() + AR_OFFSET_MS);
}

function startOfWeekAR(date = new Date()) {
  const start = startOfDayAR(date);
  const local = new Date(start.getTime() - AR_OFFSET_MS);
  const day = (local.getUTCDay() + 6) % 7; // lunes = 0
  return new Date(start.getTime() - day * 24 * 3600 * 1000);
}

function startOfMonthAR(date = new Date()) {
  const local = new Date(date.getTime() - AR_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) + AR_OFFSET_MS);
}

const nightsBetween = (checkIn, checkOut) => Math.round((new Date(checkOut) - new Date(checkIn)) / (24 * 3600 * 1000));

/** 2026-01-15 → "jue 15/01/2026" */
const formatDateAR = (date) =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC', // las fechas de estadía se guardan como día calendario (00:00 UTC)
  }).format(new Date(date));

module.exports = { startOfDayAR, startOfWeekAR, startOfMonthAR, nightsBetween, formatDateAR };
