import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, Mountain } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import CldImage from '@/components/ui/CldImage';
import { staggerContainer, fadeUp } from '@/components/ui/Reveal';
import WeatherWidget from './WeatherWidget';
import { useSettingsStore } from '@/store/settingsStore';

/** Destino Tafí del Valle: atractivos cercanos + clima en vivo */
export default function Tafi({ attractions = [] }) {
  const { address } = useSettingsStore((s) => s.settings);
  return (
    <section id="tafi" className="relative overflow-hidden bg-gradient-to-b from-crema via-cielo-50 to-crema py-20 sm:py-28">
      <div className="container-sol">
        <SectionHeading
          eyebrow="El destino"
          title="Tafí del Valle"
          subtitle="Lagos, menhires milenarios, cerros para caminar y quesos de tradición. Todo a pocos minutos de tu cabaña."
        />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <motion.ul
            className="grid gap-5 sm:grid-cols-2"
            variants={staggerContainer(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {attractions.map((a, i) => (
              <motion.li key={a._id} variants={fadeUp} className="group flex overflow-hidden rounded-3xl bg-white shadow-calida transition-shadow hover:shadow-calida-lg">
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
            ))}
          </motion.ul>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <WeatherWidget lat={address.lat} lng={address.lng} />
          </div>
        </div>
      </div>
    </section>
  );
}
