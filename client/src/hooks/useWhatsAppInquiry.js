import { useState } from 'react';
import { publicApi } from '@/api/public';
import { useSettingsStore } from '@/store/settingsStore';
import { buildInquiryMessage, waLink } from '@/utils/whatsapp';

/**
 * Guarda la consulta en la base y abre WhatsApp con el mensaje prearmado.
 *
 * - Abre la pestaña ANTES del await (si no, el navegador la bloquea como popup).
 * - Si el backend rechaza por validación o disponibilidad (400/409), mostramos el motivo.
 * - Si el backend no responde (red, 429, 5xx), igual abrimos WhatsApp con el mensaje armado acá.
 */
export default function useWhatsAppInquiry() {
  const [sending, setSending] = useState(false);
  const settings = useSettingsStore((s) => s.settings);

  const send = async (payload, { cabinName, promotionTitle } = {}) => {
    setSending(true);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const win = isMobile ? null : window.open('', '_blank');
    const go = (url) => {
      if (win && !win.closed) win.location.href = url;
      else window.location.href = url;
    };

    try {
      const { whatsappUrl } = await publicApi.createInquiry(clean(payload));
      go(whatsappUrl);
      return true;
    } catch (err) {
      if (err.status === 400 || err.status === 409) {
        win?.close();
        // SweetAlert se descarga sólo si hay que mostrar un aviso
        const { default: Swal } = await import('@/utils/swal');
        await Swal.fire({
          icon: err.status === 409 ? 'info' : 'warning',
          title: err.status === 409 ? 'Sin disponibilidad' : 'Revisá los datos',
          text: err.message,
          confirmButtonText: 'Entendido',
        });
        return false;
      }
      // Respaldo: no perdemos la consulta aunque falle el registro
      const message = buildInquiryMessage({ ...payload, cabinName, promotionTitle }, settings.businessName);
      go(waLink(settings.contact.whatsapp, message));
      return true;
    } finally {
      setSending(false);
    }
  };

  return { send, sending };
}

/** Quita strings vacíos para no mandar campos opcionales en blanco */
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null));
