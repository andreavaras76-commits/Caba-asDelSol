import { Link } from 'react-router-dom';
import { Instagram, AtSign, MessageCircle, MapPin, Phone } from 'lucide-react';
import SunLogo from '@/components/ui/SunLogo';
import MountainDivider from '@/components/ui/MountainDivider';
import { useSettingsStore } from '@/store/settingsStore';
import { NAV_LINKS } from '@/utils/scroll';
import { waLink } from '@/utils/whatsapp';
import { mapEmbedUrl, fullAddress } from './Location';
import LazyMap from '@/components/ui/LazyMap';

export default function Footer() {
  const { businessName, location, slogan, contact, social, address } = useSettingsStore((s) => s.settings);
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-cerro-noche text-crema/85">
      <MountainDivider from="#FBF6EC" to="#1C3A24" accent="#2F5D3A" />
      <div className="container-sol grid gap-10 pb-10 pt-8 text-center sm:grid-cols-2 sm:gap-12 sm:text-left lg:grid-cols-[1.3fr_0.8fr_1fr_1.2fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 text-left">
            <SunLogo className="h-14 w-14" />
            <span>
              <span className="block font-serif text-2xl font-semibold text-crema">{businessName}</span>
              <span className="block font-script text-xl text-sol-200">{location}</span>
            </span>
          </Link>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed sm:mx-0">{slogan}</p>
          <div className="mt-6 flex justify-center gap-2 sm:justify-start">
            {social.instagram && (
              <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="rounded-full bg-white/10 p-2.5 transition hover:bg-sol hover:text-carbon">
                <Instagram className="h-5 w-5" />
              </a>
            )}
            {social.threads && (
              <a href={social.threads} target="_blank" rel="noopener noreferrer" aria-label="Threads" className="rounded-full bg-white/10 p-2.5 transition hover:bg-sol hover:text-carbon">
                <AtSign className="h-5 w-5" />
              </a>
            )}
            <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-full bg-white/10 p-2.5 transition hover:bg-sol hover:text-carbon">
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        <nav aria-label="Secciones" className="hidden sm:block">
          <h2 className="font-script text-2xl text-sol-200">Explorá</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a href={`/#${l.id}`} className="transition hover:text-sol">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden sm:block">
          <h2 className="font-script text-2xl text-sol-200">Contacto</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li>
              <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex justify-center gap-2 transition hover:text-sol sm:justify-start">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sol" aria-hidden="true" />
                <span>{fullAddress(address)}</span>
              </a>
            </li>
            <li>
              <a href={waLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex justify-center gap-2 transition hover:text-sol sm:justify-start">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sol" aria-hidden="true" />
                <span>Reservas: {contact.phoneDisplay}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="hidden self-start overflow-hidden rounded-3xl ring-4 ring-white/10 sm:block">
          <LazyMap title={`Mapa de ${businessName}`} src={mapEmbedUrl(address, 13)} className="h-48 w-full" label="Ver mapa" />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-sol pb-24 pt-5 text-center text-xs text-crema/60 sm:pb-5 sm:text-left">
          <p>
            © {year} {businessName} — {location}, Tucumán, Argentina.
          </p>
        </div>
      </div>
    </footer>
  );
}
