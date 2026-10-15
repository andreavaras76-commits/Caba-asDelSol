const AR_OFFSET_MS = 3 * 60 * 60 * 1000;

function startOfDayAR(date = new Date()) {
  const local = new Date(date.getTime() - AR_OFFSET_MS);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() + AR_OFFSET_MS);
}

function startOfWeekAR(date = new Date()) {
  const start = startOfDayAR(date);
  const local = new Date(start.getTime() - AR_OFFSET_MS);
  const day = (local.getUTCDay() + 6) % 7;
  return new Date(start.getTime() - day * 24 * 3600 * 1000);
}

function startOfMonthAR(date = new Date()) {
  const local = new Date(date.getTime() - AR_OFFSET_MS);
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) + AR_OFFSET_MS);
}

const nightsBetween = (checkIn, checkOut) => Math.round((new Date(checkOut) - new Date(checkIn)) / (24 * 3600 * 1000));

const formatDateAR = (date) =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));

module.exports = { startOfDayAR, startOfWeekAR, startOfMonthAR, nightsBetween, formatDateAR };
