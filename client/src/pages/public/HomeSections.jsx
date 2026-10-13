import { useState } from 'react';
import Seo, { lodgingJsonLd } from '@/components/ui/Seo';
import PromoBanner from '@/components/public/PromoBanner';
import PromoModal from '@/components/public/PromoModal';
import About from '@/components/public/About';
import CabinsSection from '@/components/public/CabinsSection';
import Services from '@/components/public/Services';
import Promotions from '@/components/public/Promotions';
import Events from '@/components/public/Events';
import Gallery from '@/components/public/Gallery';
import Tafi from '@/components/public/Tafi';
import Reviews from '@/components/public/Reviews';
import Location from '@/components/public/Location';
import Faq from '@/components/public/Faq';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Todo lo que está debajo del hero. Se descarga en un chunk aparte para que
 * el primer render (lo que se ve al entrar desde el celular) sea lo más liviano posible.
 */
export default function HomeSections() {
  const settings = useSettingsStore((s) => s.settings);
  const [promoToAsk, setPromoToAsk] = useState(null);

  const cabins = useFetch('cabins', publicApi.cabins);
  const services = useFetch('services', publicApi.services);
  const gallery = useFetch('gallery', () => publicApi.gallery());
  const attractions = useFetch('attractions', publicApi.attractions);
  const reviews = useFetch('reviews', publicApi.reviews);
  const faqs = useFetch('faqs', publicApi.faqs);

  return (
    <>
      <Seo path="/" jsonLd={lodgingJsonLd(settings, { cabins: cabins.data || [], reviews: reviews.data || [] })} />
      <About cabinsCount={cabins.data?.length || 0} />
      <CabinsSection cabins={cabins.data || []} loading={cabins.loading} />
      <Services services={services.data || []} />
      <Promotions onWant={setPromoToAsk} />
      <Events />
      <Gallery images={gallery.data || []} />
      <Tafi attractions={attractions.data || []} />
      <Reviews reviews={reviews.data || []} />
      <Location />
      <Faq faqs={faqs.data || []} />

      <PromoBanner onWant={setPromoToAsk} />
      <PromoModal promo={promoToAsk} onClose={() => setPromoToAsk(null)} />
    </>
  );
}
