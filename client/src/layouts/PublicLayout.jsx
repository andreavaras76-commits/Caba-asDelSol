import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingActions from '@/components/public/FloatingActions';
import PageLoader from '@/components/ui/PageLoader';
import { useSettingsStore } from '@/store/settingsStore';
import { usePromoStore } from '@/store/promoStore';
import { scrollToId } from '@/utils/scroll';

export default function PublicLayout() {
  const location = useLocation();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const fetchPromos = usePromoStore((s) => s.fetchPromos);

  useEffect(() => {
    fetchSettings();
    fetchPromos();
  }, [fetchSettings, fetchPromos]);

  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id) {
      scrollToId(id);
      return undefined;
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [location.pathname, location.hash]);

  return (
    <>
      <a href="#contenido" className="sr-only z-[100] rounded-full bg-sol px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Saltar al contenido
      </a>
      <Navbar />
      <motion.main id="contenido" key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </motion.main>
      <Footer />
      <FloatingActions />
    </>
  );
}
