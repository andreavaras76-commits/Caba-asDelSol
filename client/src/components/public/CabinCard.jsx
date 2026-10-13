import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, DoorOpen, ArrowRight, Star } from 'lucide-react';
import CldImage from '@/components/ui/CldImage';
import CabinIllustration from '@/components/illustrations/CabinIllustration';
import { fadeUp } from '@/components/ui/Reveal';
import { AMENITIES } from '@/utils/constants';
import { getIcon } from '@/utils/icons';
import { formatPrice } from '@/utils/format';

/** Card de cabaña: zoom suave de la foto y aparición de amenities al hover */
export default function CabinCard({ cabin, index = 0, winter = false }) {
  const amenities = (cabin.amenities || []).slice(0, 6);
  return (
    <motion.article variants={fadeUp} className="group relative">
      <Link
        to={`/cabanas/${cabin.slug}`}
        className="block overflow-hidden rounded-4xl bg-white shadow-calida transition-shadow duration-500 hover:shadow-calida-lg focus-visible:ring-4"
        aria-label={`Ver ${cabin.name}, hasta ${cabin.capacity} huéspedes`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <div className="h-full w-full transition-transform duration-[1.2s] ease-out group-hover:scale-110">
            {cabin.cover ? (
              <CldImage src={cabin.cover.url} alt={cabin.cover.alt || cabin.name} width={900} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="h-full w-full" />
            ) : (
              <CabinIllustration variant={index} winter={winter} className="h-full w-full" label={cabin.name} />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/75 via-carbon/0 to-transparent" />

          {cabin.featured && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-sol px-3 py-1 text-xs font-bold text-carbon shadow">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Destacada
            </span>
          )}

          {/* Amenities que aparecen al hover (en mobile siempre visibles) */}
          <ul className="absolute inset-x-4 bottom-4 flex flex-wrap gap-1.5 transition-all duration-500 sm:translate-y-4 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            {amenities.map((key) => {
              const a = AMENITIES[key];
              if (!a) return null;
              const Icon = getIcon(a.icon);
              return (
                <li key={key} className="glass inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {a.label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-2xl font-semibold text-cerro-profundo">{cabin.name}</h3>
            {cabin.price?.show && cabin.price.amount ? (
              <p className="shrink-0 text-right text-sm text-carbon-light">
                desde
                <span className="block font-serif text-xl font-semibold text-madera">{formatPrice(cabin.price.amount)}</span>
                <span className="text-xs">/noche</span>
              </p>
            ) : null}
          </div>
          {cabin.shortDescription && <p className="mt-2 line-clamp-2 text-carbon-light">{cabin.shortDescription}</p>}
          <div className="mt-5 flex items-center justify-between border-t border-crema-dark pt-4">
            <div className="flex gap-4 text-sm font-semibold text-carbon-light">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-cielo" aria-hidden="true" /> Hasta {cabin.capacity}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <DoorOpen className="h-4 w-4 text-cielo" aria-hidden="true" /> {cabin.rooms} {cabin.rooms === 1 ? 'ambiente' : 'ambientes'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-tejido-ink transition-transform group-hover:translate-x-1">
              Ver <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
