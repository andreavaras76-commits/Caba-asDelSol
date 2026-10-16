import { formatDay, nightsBetween } from './format';

const SLEEPING_LABELS = { matrimonial: 'Matrimonial', individuales: 'Individuales' };

export function buildInquiryMessage(inq, businessName = 'Cabañas del Sol') {
  const lines = [];

  if (inq.type === 'evento') {
    lines.push(`¡Hola ${businessName}! 👋 Quiero consultar por un evento / día de campo:`);
    if (inq.eventType) lines.push(`🎉 Evento: ${inq.eventType}`);
    if (inq.eventDate) lines.push(`📅 Fecha: ${formatDay(inq.eventDate)}`);
    if (inq.people) lines.push(`👥 Personas: ${inq.people}`);
    if (inq.hours) lines.push(`⏱️ Duración: ${inq.hours} horas`);
    lines.push(`🛏️ Con hospedaje: ${inq.withLodging ? 'Sí' : 'No'}`);
  } else {
    lines.push(`¡Hola ${businessName}! 👋 Quiero consultar disponibilidad:`);
    if (inq.cabinName) lines.push(`🏡 Cabaña: ${inq.cabinName}`);
    if (inq.checkIn && inq.checkOut) {
      const n = nightsBetween(inq.checkIn, inq.checkOut);
      lines.push(`📅 Entrada: ${formatDay(inq.checkIn)} · Salida: ${formatDay(inq.checkOut)} (${n} ${n === 1 ? 'noche' : 'noches'})`);
    }
    if (inq.guests) lines.push(`👥 Huéspedes: ${inq.guests}`);
    if (inq.sleepingPreference) lines.push(`🛏️ Preferencia de cama: ${SLEEPING_LABELS[inq.sleepingPreference] || inq.sleepingPreference}`);
    lines.push(`🐾 Mascota: ${inq.pets ? 'Sí' : 'No'}`);
  }

  if (inq.promotionTitle) lines.push(`🎁 Promo: ${inq.promotionTitle}`);
  if (inq.comments) lines.push(`💬 ${inq.comments}`);
  lines.push(`Nombre: ${inq.name}`);
  return lines.join('\n');
}

export const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

export const waLink = (phone, text = '') =>
  `https://api.whatsapp.com/send?phone=${String(phone).replace(/\D/g, '')}${text ? `&text=${encodeURIComponent(text)}` : ''}`;

export function normalizeArPhone(raw = '') {
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.replace(/^(\d{2,4})15(\d{6,8})$/, '$1$2');
  if (!digits.startsWith('54')) digits = `549${digits}`;
  else if (!digits.startsWith('549')) digits = `549${digits.slice(2)}`;
  return digits;
}

export function replyLink(inquiry, businessName = 'Cabañas del Sol') {
  const phone = normalizeArPhone(inquiry.phone);
  if (!/^\d{10,15}$/.test(phone)) return null;
  const what = inquiry.type === 'evento' ? 'tu evento' : inquiry.cabinName ? `la ${inquiry.cabinName}` : 'tu estadía';
  return waLink(phone, `¡Hola ${inquiry.name}! 👋 Te escribimos de ${businessName} por tu consulta sobre ${what}.`);
}
