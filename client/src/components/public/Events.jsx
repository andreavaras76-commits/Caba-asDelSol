import { motion } from 'framer-motion';
import { Check, BedDouble } from 'lucide-react';
import Reveal, { staggerContainer, fadeUp } from '@/components/ui/Reveal';
import Counter from '@/components/ui/Counter';
import CldImage from '@/components/ui/CldImage';
import MountainDivider from '@/components/ui/MountainDivider';
import EventForm from './EventForm';
import { useSettingsStore } from '@/store/settingsStore';

/** Eventos y días de campo: fondo madera cálido con textura tejida */
export default function Events() {
  const { events } = useSettingsStore((s) => s.settings);
  const images = events.images || [];

  return (
    <section id="eventos" className="relative overflow-hidden bg-madera-dark text-crema">
      <MountainDivider from="#FBF6EC" to="#55331C" accent="#7A4A2A" />
      <div className="textura-tejido absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-tejido/25 blur-3xl" aria-hidden="true" />

      <div className="container-sol relative grid gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <Reveal>
            <p className="font-script text-3xl text-sol-200">Cumpleaños, juntadas y asados</p>
            <h2 className="mt-1 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">{events.title}</h2>
            <p className="mt-5 max-w-xl whitespace-pre-line text-lg text-crema/85">{events.text}</p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 flex flex-wrap items-end gap-6">
            <div>
              <span className="block text-sm font-semibold uppercase tracking-widest text-crema/70">Hasta</span>
              <Counter value={events.capacity || 30} className="font-serif text-7xl font-semibold leading-none text-sol" />
              <span className="block font-script text-2xl text-sol-200">personas</span>
            </div>
            {events.lodgingOptional && (
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                <BedDouble className="h-4 w-4" aria-hidden="true" /> Hospedaje opcional
              </span>
            )}
          </Reveal>

          {events.includes?.length > 0 && (
            <motion.ul
              className="mt-8 flex flex-wrap gap-2"
              variants={staggerContainer(0.05)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              aria-label="Qué incluye"
            >
              {events.includes.map((inc) => (
                <motion.li key={inc} variants={fadeUp} className="inline-flex items-center gap-1.5 rounded-full bg-crema/10 px-4 py-2 font-semibold ring-1 ring-crema/20">
                  <Check className="h-4 w-4 text-sol" aria-hidden="true" /> {inc}
                </motion.li>
              ))}
            </motion.ul>
          )}

          {images.length > 0 && (
            <div className="mt-10 grid grid-cols-3 gap-3">
              {images.slice(0, 3).map((img, i) => (
                <Reveal key={img._id} delay={i * 0.1} className={`overflow-hidden rounded-3xl ${i === 1 ? 'translate-y-6' : ''}`}>
                  <CldImage src={img.url} alt={img.alt || 'Quincho y pileta de Cabañas del Sol'} width={600} sizes="30vw" className="aspect-[3/4]" />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={0.15}>
          <EventForm capacity={events.capacity || 30} lodgingOptional={events.lodgingOptional} />
        </Reveal>
      </div>
      <MountainDivider from="transparent" to="#FBF6EC" accent="#E8893A" className="relative" />
    </section>
  );
}
