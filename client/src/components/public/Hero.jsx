import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import HeroLandscape from '@/components/illustrations/HeroLandscape';
import Snowfall from '@/components/ui/Snowfall';
import SeasonToggle from './SeasonToggle';
// El buscador (React Hook Form + Zod) se carga aparte para aliviar el primer render
const HeroSearch = lazy(() => import('./HeroSearch'));
import { useSeasonStore } from '@/store/seasonStore';
import { useSettingsStore } from '@/store/settingsStore';
import { cld } from '@/utils/cloudinary';
import { scrollToId } from '@/utils/scroll';
import { HAD_SHELL } from '@/utils/shell';

const EASE = [0.22, 1, 0.36, 1];

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const season = useSeasonStore((s) => s.season);
  const settings = useSettingsStore((s) => s.settings);
  const images = (season === 'invierno' ? settings.hero.imagesInvierno : settings.hero.imagesVerano) || [];
  const [index, setIndex] = useState(0);
  // useScroll en el mismo componente que el ref (evita leer el ref antes de montarse)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'], layoutEffect: false });

  // Slideshow con Ken Burns cuando hay fotos cargadas
  useEffect(() => {
    setIndex(0);
    if (images.length < 2 || reduce) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 7000);
    return () => clearInterval(t);
  }, [images.length, season, reduce]);

  // Al cambiar de temporada el índice puede quedar fuera de rango hasta que corre el efecto
  const current = images.length ? images[index % images.length] : null;

  const title = settings.hero.title || settings.businessName;
  const words = title.split(' ');

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-cielo-800" aria-label="Portada">
      {/* Fondo: fotos reales o paisaje ilustrado */}
      <div className="absolute inset-0 -z-10">
        {images.length ? (
          <>
            <AnimatePresence mode="sync">
              <motion.img
                key={`${season}-${current._id}`}
                src={cld(current.url, { width: 2200, crop: 'limit' })}
                srcSet={[768, 1280, 1920, 2400].map((w) => `${cld(current.url, { width: w, crop: 'limit' })} ${w}w`).join(', ')}
                sizes="100vw"
                alt={current.alt || `${settings.businessName} en ${season}`}
                fetchpriority="high"
                className="absolute inset-0 h-full w-full object-cover animate-ken-burns"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-cielo-900/55 via-carbon/10 to-carbon/70" />
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute bottom-0 h-20 w-full sm:h-28" aria-hidden="true">
              <path d="M0 120 V70 Q240 20 480 60 T960 50 T1440 60 V120Z" fill="#2F5D3A" opacity="0.5" />
              <path d="M0 120 V96 Q360 60 720 92 T1440 84 V120Z" fill="#FBF6EC" />
            </svg>
          </>
        ) : (
          <>
            <HeroLandscape season={season} scrollYProgress={scrollYProgress} />
            {/* Velo para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-cielo-900/50 via-transparent to-transparent" />
          </>
        )}
        <AnimatePresence>
          {season === 'invierno' && (
            <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }}>
              <Snowfall />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="container-sol flex flex-1 flex-col items-center justify-center pb-10 pt-28 text-center text-white sm:pt-32">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <SeasonToggle className="mb-6" />
        </motion.div>

        <motion.p
          className="font-script text-3xl text-sol-200 drop-shadow sm:text-4xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.4 }}
        >
          {settings.businessName} · {settings.location}
        </motion.p>

        <h1 className="mt-2 max-w-4xl text-balance text-5xl font-semibold leading-[0.95] drop-shadow-[0_4px_24px_rgba(18,39,66,0.45)] sm:text-7xl lg:text-8xl">
          {words.map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              className="inline-block pb-2"
              initial={reduce || HAD_SHELL ? false : { y: '0.35em', opacity: 0.01 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.1 }}
            >
              {w}&nbsp;
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mt-5 max-w-xl text-balance text-lg text-white/90 drop-shadow sm:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 1.1 }}
        >
          {settings.hero.subtitle || settings.slogan}
        </motion.p>

        <motion.div
          className="mt-10 w-full max-w-6xl text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 1.35 }}
        >
          <Suspense fallback={<div className="glass h-[400px] w-full rounded-4xl sm:h-[364px] lg:h-[188px]" aria-hidden="true" />}>
            <HeroSearch />
          </Suspense>
        </motion.div>

        <motion.button
          type="button"
          onClick={() => scrollToId('nosotros')}
          className="mt-8 hidden flex-col items-center gap-1 text-sm font-semibold text-white/85 drop-shadow sm:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{ opacity: { delay: 2.4 }, y: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
          aria-label="Bajar a conocer el complejo"
        >
          <span className="font-script text-xl">Conocé el complejo</span>
          <ChevronDown className="h-5 w-5" />
        </motion.button>
      </div>
    </section>
  );
}
