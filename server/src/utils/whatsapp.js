const { formatDateAR } = require('./dates');

/**
 * Arma el mensaje prearmado de una consulta.
 * Es la misma plantilla que client/src/utils/whatsapp.js (el front la usa como respaldo si la API no responde).
 */
function buildInquiryMessage(inq, businessName = 'Cabañas del Sol') {
  const lines = [];

  if (inq.type === 'evento') {
    lines.push(`¡Hola ${businessName}! 👋 Quiero consultar por un evento / día de campo:`);
    if (inq.eventType) lines.push(`🎉 Evento: ${inq.eventType}`);
    if (inq.eventDate) lines.push(`📅 Fecha: ${formatDateAR(inq.eventDate)}`);
    if (inq.people) lines.push(`👥 Personas: ${inq.people}`);
    lines.push(`🛏️ Con hospedaje: ${inq.withLodging ? 'Sí' : 'No'}`);
  } else {
    lines.push(`¡Hola ${businessName}! 👋 Quiero consultar disponibilidad:`);
    if (inq.cabinName) lines.push(`🏡 Cabaña: ${inq.cabinName}`);
    if (inq.checkIn && inq.checkOut) {
      const n = inq.nights;
      lines.push(`📅 Entrada: ${formatDateAR(inq.checkIn)} · Salida: ${formatDateAR(inq.checkOut)} (${n} ${n === 1 ? 'noche' : 'noches'})`);
    }
    if (inq.guests) lines.push(`👥 Huéspedes: ${inq.guests}`);
    lines.push(`🐾 Mascota: ${inq.pets ? 'Sí' : 'No'}`);
  }

  if (inq.promotionTitle) lines.push(`🎁 Promo: ${inq.promotionTitle}`);
  if (inq.comments) lines.push(`💬 ${inq.comments}`);
  lines.push(`Nombre: ${inq.name}`);

  return lines.join('\n');
}

const waLink = (phone, text) => `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

module.exports = { buildInquiryMessage, waLink };
