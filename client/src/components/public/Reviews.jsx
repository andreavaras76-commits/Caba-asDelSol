import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { Quote, Star } from 'lucide-react';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import { formatDay } from '@/utils/format';

/** Sólo reseñas reales cargadas desde el panel. Sin reseñas, la sección no existe. */
export default function Reviews({ reviews = [] }) {
  if (!reviews.length) return null;
  return (
    <section id="opiniones" className="relative overflow-hidden bg-cerro-noche py-20 text-crema sm:py-28">
      <div className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full bg-sol/10 blur-3xl" aria-hidden="true" />
      <div className="container-sol relative">
        <SectionHeading eyebrow="Lo que dicen nuestros huéspedes" title="Opiniones" light />
        <Reveal>
          <Swiper
            modules={[Autoplay, Pagination, A11y]}
            spaceBetween={24}
            slidesPerView={1.05}
            autoplay={{ delay: 6500, disableOnInteraction: true, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            breakpoints={{ 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } }}
            className="swiper-light !pb-14"
          >
            {reviews.map((r) => (
              <SwiperSlide key={r._id} className="!h-auto">
                <figure className="flex h-full flex-col rounded-4xl bg-white/5 p-7 ring-1 ring-white/10 backdrop-blur">
                  <Quote className="h-8 w-8 text-sol" aria-hidden="true" />
                  <div className="mt-3 flex gap-0.5" aria-label={`${r.rating} de 5 estrellas`}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < r.rating ? 'fill-sol text-sol' : 'text-white/25'}`} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="mt-4 flex-1 font-serif text-lg italic leading-relaxed text-crema/90">“{r.text}”</blockquote>
                  <figcaption className="mt-6 border-t border-white/10 pt-4">
                    <p className="font-semibold">{r.author}</p>
                    <p className="text-sm text-crema/60">{[r.origin, r.source, r.date && formatDay(r.date, { month: 'long', year: 'numeric' })].filter(Boolean).join(' · ')}</p>
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}
