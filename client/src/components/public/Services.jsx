import { motion } from 'framer-motion';
import SectionHeading from '@/components/ui/SectionHeading';
import MountainDivider from '@/components/ui/MountainDivider';
import { staggerContainer } from '@/components/ui/Reveal';
import { getIcon } from '@/utils/icons';

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 14, stiffness: 160 } },
};

/** Servicios: íconos animados con etiqueta manuscrita, sobre verde cerro profundo */
export default function Services({ services = [] }) {
  if (!services.length) return null;
  return (
    <section id="servicios" className="relative overflow-hidden bg-cerro-profundo text-crema">
      <MountainDivider from="#F3EADA" to="#2F5D3A" accent="#2F5D3A" />
      <div className="container-sol relative py-16 sm:py-24">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-sol/10 blur-3xl" aria-hidden="true" />
        <SectionHeading eyebrow="Todo pensado para vos" title="Servicios" light />
        <motion.ul
          className="grid grid-cols-3 gap-x-4 gap-y-10 sm:grid-cols-5 lg:grid-cols-9"
          variants={staggerContainer(0.07)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {services.map((s) => {
            const Icon = getIcon(s.icon);
            return (
              <motion.li key={s._id} variants={item} className="group flex flex-col items-center gap-3 text-center" title={s.description || undefined}>
                <motion.span
                  className="relative flex h-16 w-16 items-center justify-center rounded-full bg-crema text-cerro-profundo shadow-calida sm:h-20 sm:w-20"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.08 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="absolute inset-0 rounded-full border-2 border-dashed border-sol/60 transition-transform duration-[3s] group-hover:rotate-180" aria-hidden="true" />
                  <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden="true" />
                </motion.span>
                <span className="font-script text-xl leading-tight text-sol-200 sm:text-2xl">{s.name}</span>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>
      <MountainDivider from="#2F5D3A" to="#FBF6EC" accent="#F6B23C" />
    </section>
  );
}
