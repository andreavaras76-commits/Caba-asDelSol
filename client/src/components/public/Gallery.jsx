import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Expand } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import CldImage from '@/components/ui/CldImage';
import { useSeasonStore } from '@/store/seasonStore';
import { GALLERY_CATEGORIES } from '@/utils/constants';

const PhotoLightbox = lazy(() => import('@/components/ui/PhotoLightbox'));

/** Galería masonry con filtros por categoría y lightbox */
export default function Gallery({ images = [] }) {
  const season = useSeasonStore((s) => s.season);
  const [filter, setFilter] = useState('todas');
  const [open, setOpen] = useState(-1);

  const available = useMemo(() => Object.keys(GALLERY_CATEGORIES).filter((k) => images.some((i) => i.category === k)), [images]);

  // El toggle de temporada también mueve la galería
  useEffect(() => {
    setFilter(season === 'invierno' && available.includes('invierno') ? 'invierno' : 'todas');
  }, [season, available]);

  const visible = useMemo(() => (filter === 'todas' ? images : images.filter((i) => i.category === filter)), [images, filter]);

  if (!images.length) return null;

  const tabs = [['todas', 'Todas'], ...available.map((k) => [k, GALLERY_CATEGORIES[k]])];

  return (
    <section id="galeria" className="bg-crema py-20 sm:py-28">
      <div className="container-sol">
        <SectionHeading eyebrow="Mirá por la ventana" title="Galería" />

        {tabs.length > 2 && (
          <div role="tablist" aria-label="Filtrar fotos" className="mb-10 flex flex-wrap justify-center gap-2">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                type="button"
                onClick={() => setFilter(key)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${filter === key ? 'text-crema' : 'text-carbon-light hover:text-cerro-profundo'}`}
              >
                {filter === key && <motion.span layoutId="gallery-tab" className="absolute inset-0 -z-0 rounded-full bg-cerro-profundo" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        )}

        <motion.ul layout className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          <AnimatePresence mode="popLayout">
            {visible.map((img, i) => (
              <motion.li
                key={img._id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.45 }}
                className="mb-3 break-inside-avoid sm:mb-4"
              >
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group relative block w-full overflow-hidden rounded-3xl shadow-calida"
                  aria-label={`Ampliar foto: ${img.alt || GALLERY_CATEGORIES[img.category]}`}
                >
                  <CldImage
                    src={img.url}
                    alt={img.alt || GALLERY_CATEGORIES[img.category]}
                    width={700}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={img.width && img.height ? { aspectRatio: `${img.width} / ${img.height}` } : undefined}
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-carbon/0 transition-colors duration-500 group-hover:bg-carbon/30">
                    <Expand className="h-8 w-8 scale-75 text-white opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100" aria-hidden="true" />
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
      {open >= 0 && (
        <Suspense fallback={null}>
          <PhotoLightbox images={visible} index={open} onClose={() => setOpen(-1)} />
        </Suspense>
      )}
    </section>
  );
}
