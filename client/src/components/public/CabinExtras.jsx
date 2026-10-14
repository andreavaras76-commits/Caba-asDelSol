import { motion } from 'framer-motion';
import { Bath, ShowerHead, KeyRound } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import { BED_LOCATIONS, BED_TYPES } from '@/utils/constants';
import { getIcon } from '@/utils/icons';

/** "Baño privado · Termotanque eléctrico · Todo individual" (card y detalle de cabaña) */
export function PrivateBadge({ cabin, compact = false, className = '' }) {
  if (!cabin?.privateBathroom && !cabin?.electricWaterHeater) return null;
  const items = [
    cabin.privateBathroom && { Icon: Bath, label: 'Baño privado' },
    cabin.electricWaterHeater && { Icon: ShowerHead, label: 'Termotanque eléctrico' },
    { Icon: KeyRound, label: 'Todo individual' },
  ].filter(Boolean);

  if (compact) {
    return (
      <p className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-2xl bg-cerro-50 px-3 py-1.5 text-xs font-bold text-cerro-600 ${className}`}>
        {items.map(({ Icon, label }, i) => (
          <span key={label} className="inline-flex items-center gap-1">
            {i > 0 && <span aria-hidden="true" className="text-cerro/40">·</span>}
            <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
          </span>
        ))}
      </p>
    );
  }

  return (
    <div className={`rounded-3xl bg-cerro-50 p-5 ring-1 ring-cerro/15 ${className}`}>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {items.map(({ Icon, label }) => (
          <li key={label} className="inline-flex items-center gap-2 font-semibold text-cerro-profundo">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cerro shadow-sm">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            {label}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-carbon-light">Todo es de uso exclusivo de la cabaña: sólo se comparten los espacios comunes del complejo.</p>
    </div>
  );
}

/** Imagen provisoria para cabañas sin fotos: el logo sobre un fondo de cerros */
export function CabinPlaceholder({ name, className = '' }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-cielo-100 via-crema to-crema-dark ${className}`} role="img" aria-label={`${name}: fotos próximamente`}>
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-1/3 w-full" aria-hidden="true">
        <path d="M0 120 V60 L60 30 L120 55 L190 15 L260 50 L330 25 L400 45 V120Z" fill="#2F5D3A" opacity="0.15" />
        <path d="M0 120 V85 Q100 55 200 80 T400 75 V120Z" fill="#0E9F4D" opacity="0.25" />
      </svg>
      <div className="relative flex flex-col items-center gap-3 px-4 text-center">
        <span className="rounded-3xl bg-white p-2 shadow-calida">
          <BrandLogo variant="full" size={112} className="h-24 w-24 rounded-2xl sm:h-28 sm:w-28" />
        </span>
        <p className="font-script text-xl text-tejido-ink sm:text-2xl">Fotos de {name} muy pronto</p>
      </div>
    </div>
  );
}

const LOCATION_ORDER = ['dormitorio', 'cocina_comedor', 'monoambiente'];

/** "¿Dónde vas a dormir?": una card por ambiente, tipo Airbnb */
export function SleepingArrangement({ beds = [] }) {
  const rooms = LOCATION_ORDER.map((loc) => ({ loc, beds: beds.filter((b) => (b.location || 'dormitorio') === loc) })).filter((r) => r.beds.length);
  if (!rooms.length) return null;

  return (
    <div>
      <h2 className="text-3xl font-semibold text-cerro-profundo">¿Dónde vas a dormir?</h2>
      {/* Grilla en desktop; scroll horizontal con snap en mobile */}
      <ul className="-mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {rooms.map(({ loc, beds: list }, i) => (
          <motion.li
            key={loc}
            className="w-[78%] shrink-0 snap-start rounded-3xl bg-white p-6 shadow-calida ring-1 ring-madera/5 sm:w-auto"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex gap-2 text-cielo">
              {list.map((b) => {
                const Icon = getIcon(BED_TYPES[b.type]?.icon);
                return <Icon key={b.type} className="h-8 w-8" aria-hidden="true" />;
              })}
            </div>
            <p className="mt-4 font-serif text-xl font-semibold text-cerro-profundo">{BED_LOCATIONS[loc]}</p>
            <ul className="mt-1 text-carbon-light">
              {list.map((b) => (
                <li key={b.type}>
                  {b.quantity} {b.quantity === 1 ? BED_TYPES[b.type]?.label : BED_TYPES[b.type]?.plural}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
