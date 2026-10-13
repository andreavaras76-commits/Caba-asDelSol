import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '@/components/ui/Seo';
import Hero from '@/components/public/Hero';

// Debajo del hero: chunk aparte (no bloquea el primer render)
const loadSections = () => import('./HomeSections');
const HomeSections = lazy(loadSections);

/**
 * Monta las secciones de abajo recién cuando el hero ya se pintó y el navegador está libre,
 * así no compiten por la CPU del celular en la primera carga.
 * Si se llega con un ancla (/#tafi) o el usuario scrollea, se montan enseguida.
 */
function useDeferredMount(immediate) {
  const [ready, setReady] = useState(immediate);
  useEffect(() => {
    if (ready) return undefined;
    loadSections(); // empieza a descargar ya
    const go = () => setReady(true);
    const idle = window.requestIdleCallback ? window.requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 600);
    window.addEventListener('scroll', go, { once: true, passive: true });
    window.addEventListener('pointerdown', go, { once: true });
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      clearTimeout(idle);
      window.removeEventListener('scroll', go);
      window.removeEventListener('pointerdown', go);
    };
  }, [ready]);
  return ready;
}

export default function Home() {
  const { hash } = useLocation();
  const showSections = useDeferredMount(Boolean(hash));
  const placeholder = <div className="min-h-screen bg-crema" aria-hidden="true" />;
  return (
    <>
      <Seo path="/" />
      <Hero />
      {showSections ? <Suspense fallback={placeholder}>{<HomeSections />}</Suspense> : placeholder}
    </>
  );
}
