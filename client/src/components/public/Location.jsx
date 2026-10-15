import { MapPin, Navigation, MessageCircle, Phone } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import Magnetic from '@/components/ui/Magnetic';
import { useSettingsStore } from '@/store/settingsStore';
import { waLink } from '@/utils/whatsapp';
import LazyMap from '@/components/ui/LazyMap';

export const mapEmbedUrl = ({ lat, lng }, zoom = 15) =>
  `https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s${lat},${lng}!6i${zoom}!3m1!1ses!5m1!1ses`;

export const fullAddress = (a) => [a.street, `${a.city} (CP ${a.postalCode})`, a.province, a.country].filter(Boolean).join(', ');

export function HowToGetThere({ className = 'btn-sol', label = 'Cómo llegar' }) {
  const mapsUrl = useSettingsStore((s) => s.settings.address.mapsUrl);
  return (
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={className}>
      <Navigation className="h-5 w-5" aria-hidden="true" /> {label}
    </a>
  );
}

export default function Location() {
  const { address, contact, businessName } = useSettingsStore((s) => s.settings);
  return (
    <section id="ubicacion" className="bg-crema-dark py-20 sm:py-28">
      <div className="container-sol">
        <SectionHeading eyebrow="Te esperamos" title="Ubicación" subtitle="A 1,5 km de la Villa de Tafí, a menos de 5 minutos en auto. Lo justo para descansar y tener todo cerca." />
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <Reveal className="overflow-hidden rounded-4xl shadow-calida-lg ring-8 ring-white">
            <LazyMap title={`Mapa de ${businessName}`} src={mapEmbedUrl(address)} className="h-[360px] w-full sm:h-[460px]" label="Ver mapa interactivo" />
          </Reveal>
          <Reveal delay={0.1} className="flex flex-col justify-center rounded-4xl bg-white p-8 shadow-calida">
            <MapPin className="h-10 w-10 text-tejido-ink" aria-hidden="true" />
            <h3 className="mt-4 text-3xl font-semibold text-cerro-profundo">{businessName}</h3>
            <address className="mt-3 not-italic leading-relaxed text-carbon-light">{fullAddress(address)}</address>
            <div className="mt-8 flex flex-col gap-3">
              <Magnetic className="w-full">
                <HowToGetThere className="btn-sol w-full !py-4 text-lg" />
              </Magnetic>
              <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-outline w-full">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> Escribinos por WhatsApp
              </a>
              {contact.phoneDisplay && (
                <a href={`tel:+${contact.whatsapp}`} className="inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-carbon-light hover:text-cerro-profundo">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {contact.phoneDisplay}
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
