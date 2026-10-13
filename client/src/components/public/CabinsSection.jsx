import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { staggerContainer } from '@/components/ui/Reveal';
import CabinCard from './CabinCard';
import { useSeasonStore } from '@/store/seasonStore';

export default function CabinsSection({ cabins, loading }) {
  const winter = useSeasonStore((s) => s.season) === 'invierno';
  return (
    <section id="cabanas" className="textura-tejido relative bg-crema-dark py-20 sm:py-28">
      <div className="container-sol">
        <SectionHeading
          eyebrow="Tu lugar en el valle"
          title="Nuestras cabañas"
          subtitle="Fachadas amarillas, madera y piedra, y los cerros siempre en la ventana. Elegí la que mejor le queda a tu viaje."
        />
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : cabins.length ? (
          <motion.div
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {cabins.map((c, i) => (
              <CabinCard key={c.id} cabin={c} index={i} winter={winter} />
            ))}
          </motion.div>
        ) : (
          <div className="mx-auto max-w-md rounded-4xl bg-white p-10 text-center shadow-calida">
            <Home className="mx-auto h-10 w-10 text-piedra-dark" aria-hidden="true" />
            <p className="mt-4 font-serif text-2xl text-cerro-profundo">Estamos preparando las cabañas</p>
            <p className="mt-2 text-carbon-light">Mientras tanto, escribinos por WhatsApp y te contamos la disponibilidad.</p>
          </div>
        )}
      </div>
    </section>
  );
}
