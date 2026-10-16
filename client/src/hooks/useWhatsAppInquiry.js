import { useState } from 'react';
import { publicApi } from '@/api/public';
import { useSettingsStore } from '@/store/settingsStore';
import { buildInquiryMessage, waLink, isMobileDevice } from '@/utils/whatsapp';

export default function useWhatsAppInquiry() {
  const [sending, setSending] = useState(false);
  const settings = useSettingsStore((s) => s.settings);

  const send = async (payload, { cabinName, promotionTitle } = {}) => {
    setSending(true);
    const isMobile = isMobileDevice();
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
        const { default: Swal } = await import('@/utils/swal');
        await Swal.fire({
          icon: err.status === 409 ? 'info' : 'warning',
          title: err.status === 409 ? 'Sin disponibilidad' : 'Revisá los datos',
          text: err.message,
          confirmButtonText: 'Entendido',
        });
        return false;
      }
      const message = buildInquiryMessage({ ...payload, cabinName, promotionTitle }, settings.businessName);
      go(waLink(settings.contact.whatsapp, message));
      return true;
    } finally {
      setSending(false);
    }
  };

  return { send, sending };
}

const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== '' && v !== undefined && v !== null));
