import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, ArrowUpRight, Mountain } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import CldImage from '@/components/ui/CldImage';
import WeatherWidget from './WeatherWidget';
import { PlaceCard } from './Nearby';
import { useSettingsStore } from '@/store/settingsStore';
import { NEARBY_CATEGORIES } from '@/utils/constants';

export default function Tafi({ attractions = [], places = [] }) {
  const { address, contact, businessName } = useSettingsStore((s) => s.settings);

  const tabs = useMemo(() => {
    const cats = Object.keys(NEARBY_CATEGORIES).filter((k) => places.some((p) => p.category === k));
    return [
      ...(attractions.length ? [['conocer', 'Para conocer']] : []),
      ...(places.length ? [['cerca', 'Todo cerca']] : []),
      ...cats.map((k) => [k, NEARBY_CATEGORIES[k].short]),
    ];
  }, [attractions, places]);
  const [tab, setTab] = useState(null);
  const active = tab || tabs[0]?.[0];

  const order = Object.keys(NEARBY_CATEGORIES);
  const sortedPlaces = useMemo(
    () => [...places].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || (a.order ?? 0) - (b.order ?? 0)),
    [places]
  );
  const visiblePlaces = active === 'cerca' ? sortedPlaces : sortedPlaces.filter((p) => p.category === active);

  if (!tabs.length) return null;

  return (
    <section id="tafi" className="relative overflow-hidden bg-gradient-to-b from-crema via-cielo-50 to-crema py-20 sm:py-28">
      <span id="cerca" className="absolute -top-20" aria-hidden="true" />
      <div className="container-sol">
        <SectionHeading
          eyebrow="El destino"
          title="Tafí del Valle"
          subtitle="Lugares para conocer y todo lo que necesitás cerca, con sus teléfonos. A 1,5 km de la Villa, a menos de 5 minutos en auto."
        />

        <div role="tablist" aria-label="Filtrar" className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={active === key}
              onClick={() => setTab(key)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active === key ? 'text-crema' : 'bg-white text-carbon-light shadow-sm hover:text-cerro-profundo'}`}
            >
              {active === key && <motion.span layoutId="tafi-tab" className="absolute inset-0 rounded-full bg-cerro-profundo" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <motion.ul layout className="grid content-start gap-5 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {active === 'conocer'
                ? attractions.map((a, i) => (
                    <motion.li key={a._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }} className="group flex overflow-hidden rounded-3xl bg-white shadow-calida transition-shadow hover:shadow-calida-lg">
                                    <div className="relative w-28 shrink-0 overflow-hidden sm:w-32">
                                      {a.image?.url ? (
                                        <CldImage src={a.image.url} alt={a.image.alt || a.name} width={400} sizes="128px" className="h-full w-full" imgClassName="transition-transform duration-700 group-hover:scale-110" />
                                      ) : (
                                        <div className={`flex h-full w-full items-center justify-center ${['bg-cielo', 'bg-cerro-profundo', 'bg-madera', 'bg-tejido', 'bg-cerro', 'bg-cielo-700'][i % 6]}`}>
                                          <Mountain className="h-10 w-10 text-white/70 transition-transform duration-500 group-hover:-translate-y-1" aria-hidden="true" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-5">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-xl font-semibold text-cerro-profundo">{a.name}</h3>
                                        {a.distance && <span className="rounded-full bg-sol-100 px-2.5 py-0.5 text-xs font-bold text-madera">{a.distance}</span>}
                                      </div>
                                      {a.description && <p className="mt-1.5 text-sm leading-relaxed text-carbon-light">{a.description}</p>}
                                      {a.mapsUrl && (
                                        <a
                                          href={a.mapsUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-bold text-cielo hover:text-cielo-700"
                                        >
                                          <MapPin className="h-4 w-4" aria-hidden="true" /> Ver en el mapa <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        </a>
                                      )}
                                    </div>
                                  </motion.li>
                  ))
                : visiblePlaces.map((p) => (
                    <motion.li key={p._id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.35 }}>
                      <PlaceCard place={p} contactWhatsapp={contact.whatsapp} businessName={businessName} />
                    </motion.li>
                  ))}
            </AnimatePresence>
          </motion.ul>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <WeatherWidget lat={address.lat} lng={address.lng} />
          </div>
        </div>
      </div>
    </section>
  );
}
