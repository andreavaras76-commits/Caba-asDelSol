import { Check } from 'lucide-react';

/**
 * Selección múltiple con chips (amenities, etiquetas, cabañas).
 * options: [{ value, label, icon? }]
 */
export default function Chips({ options, value = [], onChange, label }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(({ value: v, label: l, icon: Icon }) => {
        const on = value.includes(v);
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition ${
              on ? 'bg-cerro-profundo text-crema ring-cerro-profundo' : 'bg-white text-carbon-light ring-piedra hover:ring-cerro-profundo'
            }`}
          >
            {on ? <Check className="h-4 w-4" aria-hidden="true" /> : Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
            {l}
          </button>
        );
      })}
    </div>
  );
}
