import { motion } from 'framer-motion';
import { Sun, Snowflake } from 'lucide-react';
import { useSeasonStore } from '@/store/seasonStore';

/** Selector Verano / Invierno: cambia fotos del hero, galería y la nieve */
export default function SeasonToggle({ className = '' }) {
  const { season, setSeason } = useSeasonStore();
  const options = [
    { value: 'verano', label: 'Verano', Icon: Sun },
    { value: 'invierno', label: 'Invierno', Icon: Snowflake },
  ];
  return (
    <div role="radiogroup" aria-label="Temporada" className={`glass relative inline-flex rounded-full p-1 ${className}`}>
      {options.map(({ value, label, Icon }) => {
        const active = season === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setSeason(value)}
            className={`relative z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active ? 'text-carbon' : 'text-white/85 hover:text-white'
            }`}
          >
            {active && (
              <motion.span
                layoutId="season-pill"
                className={`absolute inset-0 -z-10 rounded-full ${value === 'verano' ? 'bg-sol' : 'bg-white'}`}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
