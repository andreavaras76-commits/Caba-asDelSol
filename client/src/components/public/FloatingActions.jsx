import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp } from 'lucide-react';
import useScrolled from '@/hooks/useScrolled';
import { useSettingsStore } from '@/store/settingsStore';
import { waLink } from '@/utils/whatsapp';
import { scrollToId } from '@/utils/scroll';

function WhatsAppIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.43 9.43 0 0 1-4.8-1.32l-.35-.2-3.57.93.96-3.48-.23-.36a9.4 9.4 0 0 1-1.44-5.03c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.68 2.77a9.38 9.38 0 0 1 2.76 6.68c0 5.21-4.24 9.45-9.45 9.45zm8.04-17.49A11.3 11.3 0 0 0 12.04.67C5.77.67.66 5.77.66 12.04c0 2 .52 3.96 1.52 5.69L.57 23.6l6.01-1.58a11.33 11.33 0 0 0 5.45 1.39h.01c6.27 0 11.38-5.1 11.38-11.37 0-3.04-1.18-5.9-3.34-8.04z" />
    </svg>
  );
}

export default function FloatingActions() {
  const { contact, businessName } = useSettingsStore((s) => s.settings);
  const scrolled = useScrolled(400);
  const [tooltip, setTooltip] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setTooltip(true), 4000);
    const hide = setTimeout(() => setTooltip(false), 11000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const onArrow = () => {
    if (scrolled) window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    else scrollToId('nosotros');
  };

  const message = `¡Hola ${businessName}! 👋 Quería hacer una consulta.`;

  return (
    <>
      <motion.button
        type="button"
        onClick={onArrow}
        className="fixed bottom-5 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-crema/90 text-cerro-profundo shadow-calida ring-1 ring-madera/10 backdrop-blur transition hover:bg-sol sm:left-6"
        aria-label={scrolled ? 'Volver arriba' : 'Bajar'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={scrolled ? 'up' : 'down'} initial={{ y: scrolled ? 10 : -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: scrolled ? -10 : 10, opacity: 0 }} transition={{ duration: 0.25 }}>
            {scrolled ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <div className="fixed bottom-5 right-4 z-40 flex items-center gap-3 sm:right-6">
        <AnimatePresence>
          {tooltip && (
            <motion.span
              className="hidden rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-carbon shadow-calida-lg sm:block"
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              role="status"
            >
              ¿Consultás disponibilidad? <span className="font-script text-lg text-tejido-ink">¡Escribinos!</span>
            </motion.span>
          )}
        </AnimatePresence>
        <motion.a
          href={waLink(contact.whatsapp, message)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escribinos por WhatsApp"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-calida-lg"
          onMouseEnter={() => setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
          onFocus={() => setTooltip(true)}
          onBlur={() => setTooltip(false)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', delay: 1.5 }}
        >
          <span className="absolute inset-0 animate-soft-ping rounded-full bg-[#25D366] motion-reduce:hidden" aria-hidden="true" />
          <WhatsAppIcon className="relative h-7 w-7" />
        </motion.a>
      </div>
    </>
  );
}
