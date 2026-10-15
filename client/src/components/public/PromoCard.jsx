import { CalendarClock, Moon, Home, Gift } from 'lucide-react';
import CldImage from '@/components/ui/CldImage';
import { SEASONS } from '@/utils/constants';
import { formatDayLong, promoBadge } from '@/utils/format';

export default function PromoCard({ promo, onWant, preview = false }) {
  const cabinNames = promo.appliesToAll ? 'Todas las cabañas' : (promo.cabins || []).map((c) => c.name).filter(Boolean).join(', ');
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-4xl bg-white shadow-calida transition-shadow duration-500 hover:shadow-calida-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        {promo.image?.url ? (
          <CldImage src={promo.image.url} alt={promo.image.alt || promo.title} width={900} sizes="(max-width: 640px) 90vw, 33vw" className="h-full w-full transition-transform duration-[1.2s] group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-atardecer">
            <Gift className="h-16 w-16 text-white/40" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-sol px-4 py-1.5 font-serif text-lg font-bold text-carbon shadow-calida">{promoBadge(promo)}</span>
        {promo.season && promo.season !== 'todo_el_anio' && (
          <span className="glass absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white">{SEASONS[promo.season]}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl font-semibold text-cerro-profundo">{promo.title || 'Título de la promo'}</h3>
        {promo.description && <p className="mt-2 whitespace-pre-line text-carbon-light">{promo.description}</p>}
        <ul className="mt-4 space-y-1.5 text-sm text-carbon-light">
          {promo.endDate && (
            <li className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-tejido-ink" aria-hidden="true" /> Válida hasta el {formatDayLong(promo.endDate)}
            </li>
          )}
          {promo.minNights > 1 && (
            <li className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-tejido-ink" aria-hidden="true" /> Mínimo {promo.minNights} noches
            </li>
          )}
          {cabinNames && (
            <li className="flex items-center gap-2">
              <Home className="h-4 w-4 text-tejido-ink" aria-hidden="true" /> {cabinNames}
            </li>
          )}
        </ul>
        <button type="button" onClick={() => !preview && onWant?.(promo)} className="btn-sol mt-6 w-full sm:mt-auto" tabIndex={preview ? -1 : undefined}>
          Quiero esta promo
        </button>
      </div>
    </article>
  );
}
