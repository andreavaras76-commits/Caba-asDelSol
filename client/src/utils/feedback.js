import { adminApi } from '@/api/admin';
import Swal from './swal';
import { waLink, isMobileDevice } from './whatsapp';

const PUBLIC_SITE = (import.meta.env.VITE_SITE_URL || 'https://www.delsoltafidelvalle.com.ar').replace(/\/$/, '');
const isLocal = () => /^(localhost|127\.|192\.168\.|10\.)/.test(window.location.hostname);

const escapeAttr = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const feedbackUrl = (token) => `${isLocal() ? PUBLIC_SITE : window.location.origin}/opinar/${token}`;

export const feedbackMessage = (name, link, businessName = 'Cabañas del Sol') =>
  [
    `¡Hola ${String(name).split(' ')[0]}! 👋 Gracias por elegir ${businessName}.`,
    '¿Nos contás cómo fue tu estadía? Te lleva un minuto y nos ayuda muchísimo ☀️',
    link,
  ].join('\n');

async function promptOpen(waUrl, link, firstName) {
  await Swal.fire({
    icon: 'success',
    titleText: 'Mensaje listo',
    html: `<p class="mb-4">Tocá el botón para mandarle el link a <b>${escapeAttr(firstName)}</b> por WhatsApp.</p>
      <a id="wa-open" href="${escapeAttr(waUrl)}" target="_blank" rel="noopener noreferrer" class="btn w-full bg-[#25D366] text-white">Abrir WhatsApp</a>
      <button id="wa-copy" type="button" class="btn-outline mt-3 w-full">Copiar link</button>`,
    showConfirmButton: false,
    showCloseButton: true,
    didOpen: (popup) => {
      popup.querySelector('#wa-open').addEventListener('click', () => setTimeout(() => Swal.close(), 300));
      const copy = popup.querySelector('#wa-copy');
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(link);
          copy.textContent = '¡Link copiado!';
        } catch {
          copy.textContent = link;
        }
      });
    },
  });
}

export async function requestFeedback(client, businessName) {
  const mobile = isMobileDevice();
  const win = mobile ? null : window.open('', '_blank');
  try {
    const res = await adminApi.feedback.request(client._id);
    const link = feedbackUrl(res.data.token);
    const url = waLink(client.phone, feedbackMessage(client.name, link, businessName));
    if (win && !win.closed) win.location.href = url;
    else await promptOpen(url, link, String(client.name).split(' ')[0]);
    return res.data;
  } catch (err) {
    win?.close();
    throw err;
  }
}
