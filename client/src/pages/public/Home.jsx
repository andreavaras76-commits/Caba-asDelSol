import { lazy, Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Seo from '@/components/ui/Seo';
import Hero from '@/components/public/Hero';

const loadSections = () => import('./HomeSections');
const HomeSections = lazy(loadSections);

function useDeferredMount(immediate) {
  const [ready, setReady] = useState(immediate);
  useEffect(() => {
    if (ready) return undefined;
    loadSections();
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
