import { motion } from 'framer-motion';
import Reveal from '@/components/ui/Reveal';
import Counter from '@/components/ui/Counter';
import CldImage from '@/components/ui/CldImage';
import CabinIllustration from '@/components/illustrations/CabinIllustration';
import { useSettingsStore } from '@/store/settingsStore';
import { useSeasonStore } from '@/store/seasonStore';

/** Nosotros / El complejo: texto institucional + collage + contadores */
export default function About({ cabinsCount = 0 }) {
  const { about, businessName } = useSettingsStore((s) => s.settings);
  const winter = useSeasonStore((s) => s.season) === 'invierno';
  const images = about.images || [];

  const stats = [...(about.stats || [])];
  if (cabinsCount) stats.unshift({ value: cabinsCount, suffix: '', label: cabinsCount === 1 ? 'cabaña' : 'cabañas' });

  // Collage: 3 piezas (fotos si hay, ilustraciones si no)
  const tiles = [0, 1, 2].map((i) => images[i]);

  return (
    <section id="nosotros" className="relative overflow-hidden bg-crema py-20 sm:py-28">
      <div className="container-sol grid items-center gap-14 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="eyebrow">Bienvenidos a los Valles</p>
            <h2 className="mt-2 text-balance text-4xl font-semibold leading-[1.05] text-cerro-profundo sm:text-5xl">{about.title || businessName}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-carbon-light first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-6xl first-letter:font-semibold first-letter:leading-[0.85] first-letter:text-tejido-ink">
              {about.text}
            </p>
          </Reveal>

          {stats.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={0.15 + i * 0.08} className="rounded-3xl bg-white p-4 text-center shadow-calida">
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <Counter value={s.value} suffix={s.suffix} className="block font-serif text-4xl font-semibold text-cerro-profundo" />
                    <span className="mt-1 block font-script text-lg leading-tight text-madera">{s.label}</span>
                  </dd>
                </Reveal>
              ))}
            </dl>
          )}
        </div>

        {/* Collage */}
        <div className="relative mx-auto grid w-full max-w-lg grid-cols-6 grid-rows-6 gap-3 sm:gap-4" style={{ aspectRatio: '1 / 1' }}>
          {tiles.map((img, i) => {
            const pos = ['col-span-4 row-span-4', 'col-span-2 col-start-5 row-span-3 row-start-2', 'col-span-3 col-start-3 row-span-2 row-start-5'][i];
            return (
              <motion.div
                key={i}
                className={`${pos} overflow-hidden rounded-3xl shadow-calida-lg ring-4 ring-crema`}
                initial={{ opacity: 0, scale: 0.9, rotate: [-3, 4, -2][i] }}
                whileInView={{ opacity: 1, scale: 1, rotate: [-2, 3, -1][i] }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ rotate: 0, scale: 1.03 }}
              >
                {img ? (
                  <CldImage src={img.url} alt={img.alt || `${businessName}`} width={900} sizes="(max-width: 1024px) 70vw, 30vw" className="h-full w-full" />
                ) : (
                  <CabinIllustration variant={i + 1} winter={winter} className="h-full w-full" />
                )}
              </motion.div>
            );
          })}
          <span className="pointer-events-none absolute -bottom-6 -left-4 rotate-[-6deg] font-script text-3xl text-tejido-ink" aria-hidden="true">
            a 1,5 km de la Villa ☀
          </span>
        </div>
      </div>
    </section>
  );
}
