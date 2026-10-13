import { lazy, Suspense, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { ChevronRight, Users, DoorOpen, Bath, BedDouble, Images, MapPin } from 'lucide-react';
import Seo from '@/components/ui/Seo';
import Reveal, { staggerContainer, fadeUp } from '@/components/ui/Reveal';
import CldImage from '@/components/ui/CldImage';
import Skeleton from '@/components/ui/Skeleton';
import CabinIllustration from '@/components/illustrations/CabinIllustration';
import CabinInquiryForm from '@/components/public/CabinInquiryForm';
import CabinCard from '@/components/public/CabinCard';
import { HowToGetThere, fullAddress } from '@/components/public/Location';
import NotFound from './NotFound';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';
import { useSeasonStore } from '@/store/seasonStore';
import { useSettingsStore } from '@/store/settingsStore';
import { AMENITIES, BED_TYPES } from '@/utils/constants';
import { getIcon } from '@/utils/icons';

const PhotoLightbox = lazy(() => import('@/components/ui/PhotoLightbox'));

export default function CabinDetail() {
  const { slug } = useParams();
  const { data: cabin, loading, error } = useFetch(`cabin-${slug}`, () => publicApi.cabin(slug));
  const { data: cabins = [] } = useFetch('cabins', publicApi.cabins);
  const winter = useSeasonStore((s) => s.season) === 'invierno';
  const address = useSettingsStore((s) => s.settings.address);
  const [open, setOpen] = useState(-1);

  if (error?.status === 404) return <NotFound />;
  if (loading || !cabin) return <DetailSkeleton />;

  const images = cabin.images || [];
  const cover = cabin.cover;
  const ordered = cover ? [cover, ...images.filter((i) => i._id !== cover._id)] : images;
  const others = cabins.filter((c) => c.id !== cabin.id).slice(0, 3);
  const index = Math.max(0, cabins.findIndex((c) => c.id === cabin.id));

  return (
    <>
      <Seo title={cabin.name} description={cabin.shortDescription || cabin.description?.slice(0, 155)} image={cover?.url} path={`/cabanas/${cabin.slug}`} />

      <div className="bg-crema pt-[76px] sm:pt-[88px]">
        <div className="container-sol">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-1 text-sm text-carbon-light">
            <Link to="/" className="hover:text-cerro-profundo">Inicio</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <Link to="/#cabanas" className="hover:text-cerro-profundo">Cabañas</Link>
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            <span aria-current="page" className="font-semibold text-carbon">{cabin.name}</span>
          </nav>

          <Reveal className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-5xl font-semibold text-cerro-profundo sm:text-6xl">{cabin.name}</h1>
              {cabin.shortDescription && <p className="mt-2 max-w-2xl text-lg text-carbon-light">{cabin.shortDescription}</p>}
            </div>
            <ul className="flex flex-wrap gap-2">
              {[
                [Users, `Hasta ${cabin.capacity} huéspedes`],
                [DoorOpen, `${cabin.rooms} ${cabin.rooms === 1 ? 'ambiente' : 'ambientes'}`],
                [Bath, `${cabin.bathrooms} ${cabin.bathrooms === 1 ? 'baño' : 'baños'}`],
              ].map(([Icon, label]) => (
                <li key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-calida">
                  <Icon className="h-4 w-4 text-cielo" aria-hidden="true" /> {label}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Galería */}
          <Reveal delay={0.1} className="mt-8">
            {ordered.length === 0 ? (
              <div className="overflow-hidden rounded-4xl shadow-calida">
                <CabinIllustration variant={index} winter={winter} className="aspect-[16/7] w-full" label={cabin.name} />
              </div>
            ) : (
              <>
                {/* Mobile: carrusel */}
                <div className="sm:hidden">
                  <Swiper modules={[Pagination]} pagination={{ clickable: true }} spaceBetween={12} className="overflow-hidden rounded-4xl">
                    {ordered.map((img, i) => (
                      <SwiperSlide key={img._id}>
                        <button type="button" onClick={() => setOpen(i)} className="block w-full" aria-label={`Ampliar foto ${i + 1}`}>
                          <CldImage src={img.url} alt={img.alt || cabin.name} width={900} sizes="100vw" priority={i === 0} className="aspect-[4/3] w-full" />
                        </button>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
                {/* Desktop: mosaico */}
                <div className="hidden h-[520px] grid-cols-4 grid-rows-2 gap-3 overflow-hidden rounded-4xl sm:grid">
                  {ordered.slice(0, 5).map((img, i) => (
                    <button
                      key={img._id}
                      type="button"
                      onClick={() => setOpen(i)}
                      className={`group relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : ''} ${ordered.length === 1 ? 'col-span-4' : ''}`}
                      aria-label={`Ampliar foto ${i + 1}`}
                    >
                      <CldImage
                        src={img.url}
                        alt={img.alt || cabin.name}
                        width={i === 0 ? 1400 : 700}
                        sizes={i === 0 ? '50vw' : '25vw'}
                        priority={i === 0}
                        className="h-full w-full"
                        imgClassName="transition-transform duration-700 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
                {ordered.length > 1 && (
                  <button type="button" onClick={() => setOpen(0)} className="btn-outline mt-4 hidden !py-2 text-sm sm:inline-flex">
                    <Images className="h-4 w-4" aria-hidden="true" /> Ver las {ordered.length} fotos
                  </button>
                )}
              </>
            )}
          </Reveal>
        </div>
      </div>

      <section className="bg-crema py-12 sm:py-16">
        <div className="container-sol grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="space-y-12">
            {cabin.description && (
              <Reveal>
                <h2 className="text-3xl font-semibold text-cerro-profundo">La cabaña</h2>
                <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-carbon-light">{cabin.description}</p>
              </Reveal>
            )}

            {cabin.beds?.length > 0 && (
              <Reveal>
                <h2 className="text-3xl font-semibold text-cerro-profundo">Dónde vas a dormir</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {cabin.beds.map((b) => (
                    <li key={b.type} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-calida">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cielo-50 text-cielo">
                        <BedDouble className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="font-semibold">
                        {b.quantity} {b.quantity === 1 ? BED_TYPES[b.type]?.label : BED_TYPES[b.type]?.plural}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            {cabin.amenities?.length > 0 && (
              <div>
                <Reveal>
                  <h2 className="text-3xl font-semibold text-cerro-profundo">Comodidades</h2>
                </Reveal>
                <motion.ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3" variants={staggerContainer(0.04)} initial="hidden" whileInView="show" viewport={{ once: true }}>
                  {cabin.amenities.map((key) => {
                    const a = AMENITIES[key];
                    if (!a) return null;
                    const Icon = getIcon(a.icon);
                    return (
                      <motion.li key={key} variants={fadeUp} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-calida">
                        <Icon className="h-5 w-5 shrink-0 text-cerro" aria-hidden="true" />
                        <span className="text-sm font-semibold">{a.label}</span>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              </div>
            )}

            <Reveal className="flex flex-col gap-5 rounded-4xl bg-cerro-profundo p-7 text-crema sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-4">
                <MapPin className="h-8 w-8 shrink-0 text-sol" aria-hidden="true" />
                <div>
                  <p className="font-serif text-xl font-semibold">A 1 km de la Villa de Tafí</p>
                  <p className="mt-1 text-sm text-crema/75">{fullAddress(address)}</p>
                </div>
              </div>
              <HowToGetThere className="btn-sol shrink-0" />
            </Reveal>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" id="consultar">
            <CabinInquiryForm cabin={cabin} />
          </aside>
        </div>
      </section>

      {others.length > 0 && (
        <section className="textura-tejido bg-crema-dark py-16 sm:py-20">
          <div className="container-sol">
            <h2 className="mb-8 text-3xl font-semibold text-cerro-profundo">Otras cabañas</h2>
            <motion.div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" variants={staggerContainer(0.1)} initial="hidden" whileInView="show" viewport={{ once: true }}>
              {others.map((c) => (
                <CabinCard key={c.id} cabin={c} index={cabins.indexOf(c)} winter={winter} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {open >= 0 && (
        <Suspense fallback={null}>
          <PhotoLightbox images={ordered} index={open} onClose={() => setOpen(-1)} />
        </Suspense>
      )}
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="container-sol pb-20 pt-[100px]" aria-busy="true" aria-label="Cargando cabaña">
      <Skeleton className="h-12 w-1/2" />
      <Skeleton className="mt-4 h-5 w-1/3" />
      <Skeleton className="mt-8 aspect-[16/7] w-full !rounded-4xl" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-96 !rounded-4xl" />
      </div>
    </div>
  );
}
