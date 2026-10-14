import { adminApi } from '@/api/admin';
import { waLink } from './whatsapp';

// Sitio público: si el panel se usa en local, el link igual tiene que abrir desde el celular del huésped
const PUBLIC_SITE = (import.meta.env.VITE_SITE_URL || 'https://caba-as-del-sol.vercel.app').replace(/\/$/, '');
const isLocal = () => /^(localhost|127\.|192\.168\.|10\.)/.test(window.location.hostname);

/** Link público para que el huésped deje su opinión */
export const feedbackUrl = (token) => `${isLocal() ? PUBLIC_SITE : window.location.origin}/opinar/${token}`;

/** Mensaje de WhatsApp para pedir la opinión */
export const feedbackMessage = (name, link, businessName = 'Cabañas del Sol') =>
  [
    `¡Hola ${String(name).split(' ')[0]}! 👋 Gracias por elegir ${businessName}.`,
    '¿Nos contás cómo fue tu estadía? Te lleva un minuto y nos ayuda muchísimo ☀️',
    link,
  ].join('\n');

/**
 * Crea (o reutiliza) el pedido de opinión del cliente y abre WhatsApp con el link.
 * La pestaña se abre antes del await para que el navegador no la bloquee.
 */
export async function requestFeedback(client, businessName) {
  const win = window.open('', '_blank');
  try {
    const res = await adminApi.feedback.request(client._id);
    const url = waLink(client.phone, feedbackMessage(client.name, feedbackUrl(res.data.token), businessName));
    if (win && !win.closed) win.location.href = url;
    else window.location.href = url;
    return res.data;
  } catch (err) {
    win?.close();
    throw err;
  }
}
