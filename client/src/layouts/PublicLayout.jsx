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

/** Layout público: navbar, transición suave entre páginas, footer y botones flotantes */
export default function PublicLayout() {
  const location = useLocation();
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const fetchPromos = usePromoStore((s) => s.fetchPromos);

  useEffect(() => {
    fetchSettings();
    fetchPromos();
  }, [fetchSettings, fetchPromos]);

  // Al cambiar de página: ir al ancla (#seccion) o arriba de todo
  useEffect(() => {
    const id = location.hash.replace('#', '');
    if (id) {
      // Espera a que la sección exista (las páginas cargan con lazy)
      let tries = 0;
      const t = setInterval(() => {
        if (scrollToId(id) || ++tries > 20) clearInterval(t);
      }, 120);
      return () => clearInterval(t);
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
      {/* Fundido de entrada en cada cambio de página (la key remonta el main).
          Sin exit: AnimatePresence + Outlet + lazy dejaba la página nueva en opacidad 0. */}
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
