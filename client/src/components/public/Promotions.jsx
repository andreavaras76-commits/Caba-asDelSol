import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/ui/Reveal';
import PromoCard from './PromoCard';
import { usePromoStore } from '@/store/promoStore';

export default function Promotions({ onWant }) {
  const promos = usePromoStore((s) => s.promos);
  if (!promos.length) return null;

  return (
    <section id="promociones" className="relative overflow-hidden bg-crema py-20 sm:py-28">
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-sol/15 blur-3xl" aria-hidden="true" />
      <div className="container-sol relative">
        <SectionHeading eyebrow="Aprovechá" title="Promociones" subtitle="Escapadas con beneficios especiales. Elegí la tuya y la reservamos por WhatsApp." />
        <Reveal>
          <Swiper
            modules={[Pagination, A11y, Keyboard]}
            spaceBetween={24}
            slidesPerView={1.08}
            keyboard={{ enabled: true }}
            pagination={{ clickable: true }}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            className="!pb-14"
            a11y={{ prevSlideMessage: 'Promo anterior', nextSlideMessage: 'Promo siguiente', paginationBulletMessage: 'Ir a la promo {{index}}' }}
          >
            {promos.map((p) => (
              <SwiperSlide key={p._id} className="!h-auto">
                <PromoCard promo={p} onWant={onWant} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Reveal>
      </div>
    </section>
  );
}
