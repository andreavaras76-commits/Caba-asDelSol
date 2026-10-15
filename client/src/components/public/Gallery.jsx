import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Expand, ChevronDown } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import CldImage from '@/components/ui/CldImage';
import { GALLERY_CATEGORIES } from '@/utils/constants';

const PhotoLightbox = lazy(() => import('@/components/ui/PhotoLightbox'));

const PAGE = 12;

export default function Gallery({ images = [] }) {
  const [filter, setFilter] = useState('todas');
  const [limit, setLimit] = useState(PAGE);
  const [open, setOpen] = useState(-1);

  const tabs = useMemo(() => [['todas', 'Todos'], ...Object.entries(GALLERY_CATEGORIES)], []);

  useEffect(() => setLimit(PAGE), [filter]);

  const filtered = useMemo(() => {
    if (filter === 'todas') return images;
    return images.filter((i) => i.category === filter);
  }, [images, filter]);
  const visible = filtered.slice(0, limit);

  const forLightbox = useMemo(() => {
    const counters = {};
    return filtered.map((img) => {
      const cat = img.cabin ? img.cabin.slug : img.category;
      counters[cat] = (counters[cat] || 0) + 1;
      return { ...img, downloadName: `cabanas-del-sol-${cat}-${counters[cat]}` };
    });
  }, [filtered]);

  if (!images.length) return null;

  return (
    <section id="galeria" className="bg-crema py-20 sm:py-28">
      <div className="container-sol">
        <SectionHeading eyebrow="Mirá por la ventana" title="Galería" />

        {(
          <div role="tablist" aria-label="Filtrar fotos" className="-mx-4 mb-10 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
            {tabs.map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                type="button"
                onClick={() => setFilter(key)}
                className={`relative shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors ${filter === key ? 'text-crema' : 'bg-white text-carbon-light shadow-sm hover:text-cerro-profundo'}`}
              >
                {filter === key && <motion.span layoutId="gallery-tab" className="absolute inset-0 rounded-full bg-cerro-profundo" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        )}

        {!filtered.length && (
          <p className="mx-auto max-w-md rounded-3xl bg-white p-8 text-center text-carbon-light shadow-calida">
            Todavía no hay fotos de <b className="text-cerro-profundo">{tabs.find(([k]) => k === filter)?.[1]}</b>. ¡Muy pronto!
          </p>
        )}
        <motion.ul layout className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
          <AnimatePresence mode="popLayout">
            {visible.map((img, i) => (
              <motion.li
                key={`${img.source || 'g'}-${img._id}`}
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
                  aria-label={`Ampliar foto: ${img.alt || img.cabin?.name || GALLERY_CATEGORIES[img.category]}`}
                >
                  <CldImage
                    src={img.url}
                    alt={img.alt || img.cabin?.name || GALLERY_CATEGORIES[img.category]}
                    width={700}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={img.width && img.height ? { aspectRatio: `${img.width} / ${img.height}` } : undefined}
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  {img.cabin && filter === 'todas' && (
                    <span className="glass absolute bottom-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-bold text-white">{img.cabin.name}</span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center bg-carbon/0 transition-colors duration-500 group-hover:bg-carbon/30">
                    <Expand className="h-8 w-8 scale-75 text-white opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100" aria-hidden="true" />
                  </span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {filtered.length > limit && (
          <div className="mt-8 text-center">
            <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="btn-outline">
              Ver más fotos <ChevronDown className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-normal text-carbon-light">({filtered.length - limit})</span>
            </button>
          </div>
        )}
      </div>
      {open >= 0 && (
        <Suspense fallback={null}>
          <PhotoLightbox images={forLightbox} index={open} onClose={() => setOpen(-1)} />
        </Suspense>
      )}
    </section>
  );
}
