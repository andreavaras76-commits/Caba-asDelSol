import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { usePromoStore } from '@/store/promoStore';
import useCountdown from '@/hooks/useCountdown';
import { promoBadge } from '@/utils/format';
import { scrollToId } from '@/utils/scroll';

const DISMISS_KEY = 'cds_promo_dismissed';

/** Tarjeta flotante con la promo destacada + cuenta regresiva si tiene fecha de fin */
export default function PromoBanner({ onWant }) {
  const promos = usePromoStore((s) => s.promos);
  const promo = promos.find((p) => p.featured);
  const [visible, setVisible] = useState(false);
  const left = useCountdown(promo?.endDate);

  useEffect(() => {
    if (!promo) return undefined;
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === promo._id;
    } catch {
      /* storage bloqueado: mostramos igual */
    }
    if (dismissed) return undefined;
    const t = setTimeout(() => setVisible(true), 3200);
    return () => clearTimeout(t);
  }, [promo]);

  const close = () => {
    setVisible(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, promo._id);
    } catch {
      /* noop */
    }
  };

  return (
    <AnimatePresence>
      {visible && promo && (
        <motion.aside
          role="complementary"
          aria-label="Promoción destacada"
          className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md overflow-hidden rounded-3xl bg-cerro-noche text-crema shadow-calida-lg sm:bottom-6 sm:left-auto sm:right-24 sm:mx-0"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sol/25 blur-2xl" aria-hidden="true" />
          <button type="button" onClick={close} className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-crema/70 hover:bg-white/10 hover:text-crema" aria-label="Cerrar promoción">
            <X className="h-4 w-4" />
          </button>
          <div className="relative flex gap-4 p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sol text-carbon">
              <Gift className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-script text-xl leading-none text-sol-200">Promo especial</p>
              <p className="mt-1 pr-6 font-serif text-xl font-semibold leading-tight">{promo.title}</p>
              <p className="mt-1 inline-block rounded-full bg-sol px-2.5 py-0.5 text-xs font-bold text-carbon">{promoBadge(promo)}</p>
              {left && (
                <div className="mt-3 flex gap-2 text-center" aria-label="Tiempo restante">
                  {[
                    ['días', left.days],
                    ['hs', left.hours],
                    ['min', left.minutes],
                    ['seg', left.seconds],
                  ].map(([label, v]) => (
                    <span key={label} className="min-w-[3rem] rounded-xl bg-white/10 px-2 py-1">
                      <span className="block font-serif text-lg font-semibold tabular-nums">{String(v).padStart(2, '0')}</span>
                      <span className="block text-[10px] uppercase tracking-wider text-crema/70">{label}</span>
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => { close(); onWant(promo); }} className="btn-sol !px-4 !py-2 text-sm">
                  La quiero
                </button>
                <button type="button" onClick={() => { close(); scrollToId('promociones'); }} className="btn !px-4 !py-2 text-sm text-crema hover:bg-white/10">
                  Ver todas
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
