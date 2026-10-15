import { adminApi } from '@/api/admin';
import { waLink } from './whatsapp';

const PUBLIC_SITE = (import.meta.env.VITE_SITE_URL || 'https://caba-as-del-sol-nu.vercel.app').replace(/\/$/, '');
const isLocal = () => /^(localhost|127\.|192\.168\.|10\.)/.test(window.location.hostname);

export const feedbackUrl = (token) => `${isLocal() ? PUBLIC_SITE : window.location.origin}/opinar/${token}`;

export const feedbackMessage = (name, link, businessName = 'Cabañas del Sol') =>
  [
    `¡Hola ${String(name).split(' ')[0]}! 👋 Gracias por elegir ${businessName}.`,
    '¿Nos contás cómo fue tu estadía? Te lleva un minuto y nos ayuda muchísimo ☀️',
    link,
  ].join('\n');

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
