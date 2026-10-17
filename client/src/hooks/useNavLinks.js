import { useLocation, useNavigate } from 'react-router-dom';
import useFetch from '@/hooks/useFetch';
import { publicApi } from '@/api/public';
import { NAV_LINKS, scrollToId } from '@/utils/scroll';

const isEmpty = (r) => !r.loading && Array.isArray(r.data) && r.data.length === 0;

export default function useNavLinks() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const services = useFetch('services', publicApi.services);
  const gallery = useFetch('gallery', () => publicApi.gallery());
  const attractions = useFetch('attractions', publicApi.attractions);
  const nearby = useFetch('nearby-places', publicApi.nearbyPlaces);
  const reviews = useFetch('reviews', publicApi.reviews);
  const faqs = useFetch('faqs', publicApi.faqs);

  const hidden = {
    servicios: isEmpty(services),
    galeria: isEmpty(gallery),
    tafi: isEmpty(attractions) && isEmpty(nearby),
    opiniones: isEmpty(reviews),
    faq: isEmpty(faqs),
  };
  const links = NAV_LINKS.filter((l) => !hidden[l.id]);

  const goTo = (id, after) => (e) => {
    e.preventDefault();
    after?.();
    if (pathname === '/') scrollToId(id);
    else navigate(`/#${id}`);
  };

  return { links, goTo };
}
