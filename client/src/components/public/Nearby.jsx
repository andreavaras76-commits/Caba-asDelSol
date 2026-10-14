import { Phone, MessageCircle, Navigation, MapPin } from 'lucide-react';
import CldImage from '@/components/ui/CldImage';
import { NEARBY_CATEGORIES } from '@/utils/constants';
import { getIcon } from '@/utils/icons';
import { waLink } from '@/utils/whatsapp';

const CATEGORY_TONES = {
  delivery: 'bg-tejido text-white',
  supermercado: 'bg-cerro text-white',
  estacion_servicio: 'bg-cielo text-white',
  carniceria: 'bg-madera text-crema',
  panaderia: 'bg-sol text-carbon',
  tortas: 'bg-[#E88BA3] text-white',
  paseos: 'bg-cerro-profundo text-crema',
};

/**
 * Tarjeta de un lugar cercano ("Todo cerca tuyo"): ícono por categoría y botones Llamar / WhatsApp / Cómo llegar.
 * Si todavía no tiene datos de contacto, ofrece pedírselos al complejo por WhatsApp.
 */
export function PlaceCard({ place: p, contactWhatsapp, businessName = 'Cabañas del Sol' }) {
  const cat = NEARBY_CATEGORIES[p.category] || { label: p.category, icon: 'MapPin' };
  const Icon = getIcon(cat.icon);
  const telHref = p.phone ? `tel:${p.phone.replace(/[^\d+]/g, '')}` : null;
  const hasContact = Boolean(telHref || p.whatsapp || p.mapsUrl);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-calida ring-1 ring-madera/5 transition-shadow hover:shadow-calida-lg">
      {p.image?.url && <CldImage src={p.image.url} alt={p.image.alt || p.name} width={700} sizes="(max-width: 640px) 100vw, 33vw" className="aspect-[16/9]" />}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${CATEGORY_TONES[p.category] || 'bg-cerro text-white'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-tejido-ink">{cat.label}</p>
            <h3 className="font-serif text-xl font-semibold leading-tight text-cerro-profundo">{p.name}</h3>
          </div>
        </div>
        {p.description && <p className="mt-3 text-sm leading-relaxed text-carbon-light">{p.description}</p>}
        {p.address && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-carbon-light">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cielo" aria-hidden="true" /> {p.address}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {telHref && (
            <a href={telHref} className="btn-cerro !px-4 !py-2 text-sm" aria-label={`Llamar a ${p.name}`}>
              <Phone className="h-4 w-4" aria-hidden="true" /> Llamar
            </a>
          )}
          {p.whatsapp && (
            <a href={waLink(p.whatsapp, '¡Hola! Te escribo desde Cabañas del Sol 👋')} target="_blank" rel="noopener noreferrer" className="btn !px-4 !py-2 bg-[#25D366] text-sm text-white hover:brightness-95" aria-label={`WhatsApp de ${p.name}`}>
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
            </a>
          )}
          {p.mapsUrl && (
            <a href={p.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline !px-4 !py-2 text-sm" aria-label={`Cómo llegar a ${p.name}`}>
              <Navigation className="h-4 w-4" aria-hidden="true" /> Cómo llegar
            </a>
          )}
          {!hasContact && contactWhatsapp && (
            <a
              href={waLink(contactWhatsapp, `¡Hola ${businessName}! 👋 ¿Me pasan el contacto de ${p.name.toLowerCase()}?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !px-4 !py-2 text-sm"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Consultanos el contacto
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
