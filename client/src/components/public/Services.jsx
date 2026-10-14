import { motion, useReducedMotion } from 'framer-motion';
import SectionHeading from '@/components/ui/SectionHeading';
import MountainDivider from '@/components/ui/MountainDivider';
import { staggerContainer } from '@/components/ui/Reveal';
import { getIcon } from '@/utils/icons';

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 16, stiffness: 170 } },
};

// Los íconos van rotando entre los colores del logo
const TONES = ['bg-cerro text-white', 'bg-cielo text-white', 'bg-tejido text-white', 'bg-cerro-profundo text-sol-200', 'bg-madera text-crema'];

/** Rayos del sol detrás del título (giran lento) */
function SunRays() {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute left-1/2 top-4 h-[560px] w-[560px] -translate-x-1/2 text-white/40 sm:h-[760px] sm:w-[760px]"
      animate={reduce ? undefined : { rotate: 360 }}
      transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      aria-hidden="true"
    >
      {Array.from({ length: 24 }, (_, i) => (
        <path key={i} d="M100 100 L97 0 L103 0 Z" fill="currentColor" transform={`rotate(${i * 15} 100 100)`} />
      ))}
    </motion.svg>
  );
}

/** Servicios (tarjetas con ícono) + espacios comunes del predio destacados, sobre un fondo soleado */
export default function Services({ services = [] }) {
  const servicios = services.filter((s) => (s.group || 'servicio') === 'servicio');
  const espacios = services.filter((s) => s.group === 'espacio');
  if (!services.length) return null;

  return (
    <section id="servicios" className="relative overflow-hidden bg-gradient-to-b from-sol-200 via-sol-300 to-sol text-carbon">
      <MountainDivider from="#F3EADA" to="#FBD891" accent="#F9C564" />
      <SunRays />
      <div className="pointer-events-none absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-tejido/25 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-white/40 blur-3xl" aria-hidden="true" />

      <div className="container-sol relative py-16 sm:py-24">
        <SectionHeading eyebrow="Todo pensado para vos" title="Servicios" />

        {servicios.length > 0 && (
          <motion.ul
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
            variants={staggerContainer(0.05)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {servicios.map((s, i) => {
              const Icon = getIcon(s.icon);
              return (
                <motion.li
                  key={s._id}
                  variants={item}
                  whileHover={{ y: -6 }}
                  className="group flex flex-col items-center gap-2.5 rounded-3xl bg-white/90 px-2 py-4 text-center shadow-calida ring-1 ring-white backdrop-blur transition-shadow hover:shadow-calida-lg sm:flex-row sm:gap-4 sm:p-5 sm:text-left"
                  title={s.description || undefined}
                >
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 sm:h-14 sm:w-14 ${TONES[i % TONES.length]}`}>
                    <Icon className="h-5 w-5 sm:h-7 sm:w-7" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 text-sm font-bold leading-snug text-cerro-noche sm:text-base">{s.name}</span>
                </motion.li>
              );
            })}
          </motion.ul>
        )}

        {espacios.length > 0 && (
          <div className="mt-14 sm:mt-20">
            <div className="text-center">
              <span className="inline-block rounded-full bg-cerro-noche px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-sol-200">En el predio</span>
              <h3 className="mt-3 font-serif text-3xl font-semibold text-cerro-noche sm:text-4xl">Espacios comunes</h3>
            </div>
            <motion.ul
              className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-3 sm:gap-5"
              variants={staggerContainer(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
            >
              {espacios.map((s) => {
                const Icon = getIcon(s.icon);
                return (
                  <motion.li
                    key={s._id}
                    variants={item}
                    whileHover={{ y: -8 }}
                    className="group relative overflow-hidden rounded-4xl bg-cerro-noche p-6 text-crema shadow-calida-lg sm:p-8"
                  >
                    <Icon className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 text-white/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12" aria-hidden="true" />
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-sol text-carbon shadow-calida transition-transform duration-500 group-hover:-rotate-6">
                      <Icon className="h-8 w-8" aria-hidden="true" />
                    </span>
                    <span className="relative mt-5 block font-serif text-2xl font-semibold leading-tight">{s.name}</span>
                    {s.description && <span className="relative mt-2 block text-sm leading-relaxed text-crema/75">{s.description}</span>}
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        )}
      </div>
      <MountainDivider from="#F6B23C" to="#FBF6EC" accent="#E8893A" />
    </section>
  );
}
