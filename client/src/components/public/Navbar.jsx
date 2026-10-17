import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Instagram, MessageCircle, MapPin } from 'lucide-react';
import SunLogo from '@/components/ui/SunLogo';
import BrandLogo from '@/components/ui/BrandLogo';
import Magnetic from '@/components/ui/Magnetic';
import useScrolled from '@/hooks/useScrolled';
import { useSettingsStore } from '@/store/settingsStore';
import useNavLinks from '@/hooks/useNavLinks';
import { waLink } from '@/utils/whatsapp';

export default function Navbar() {
  const scrolled = useScrolled(60);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const settings = useSettingsStore((s) => s.settings);

  const onHome = pathname === '/';
  const solid = scrolled || !onHome || open;

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onLogo = (e) => {
    setOpen(false);
    if (onHome) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
  };

  const nav = useNavLinks();
  const goTo = (id) => nav.goTo(id, () => setOpen(false));

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid && !open ? 'bg-crema/85 shadow-[0_1px_0_rgba(122,74,42,0.1)] backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <nav className="container-sol flex h-[60px] items-center justify-between gap-3 sm:h-[72px]" aria-label="Principal">
          <Link to="/" className="group flex items-center gap-2 sm:gap-2.5" onClick={onLogo}>
            <BrandLogo size={44} className="h-9 w-auto shrink-0 shadow-sm ring-1 ring-black/5 transition-transform duration-500 group-hover:scale-105 sm:h-11" />
            <span className="flex min-w-0 flex-col whitespace-nowrap leading-none">
              <span className={`font-serif text-base font-semibold transition-colors sm:text-xl ${solid ? 'text-cerro-profundo' : 'text-white'} ${open ? '!text-crema' : ''}`}>
                {settings.businessName}
              </span>
              <span className={`font-script text-sm transition-colors sm:text-lg ${solid ? 'text-tejido-ink' : 'text-sol-200'} ${open ? '!text-sol-200' : ''}`}>
                {settings.location}
              </span>
              <span className="sr-only"> — ir al inicio</span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 xl:flex">
            {nav.links.filter((l) => !l.mobileOnly).map((l) => (
              <li key={l.id}>
                <a
                  href={`/#${l.id}`}
                  onClick={goTo(l.id)}
                  className={`relative rounded-full px-3 py-2 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-sol after:transition-transform hover:after:scale-x-100 ${
                    solid ? 'text-carbon hover:text-cerro-profundo' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <Magnetic className="hidden sm:inline-block">
              <a href="/#consultar" onClick={goTo('consultar')} className="btn-sol whitespace-nowrap !px-5 !py-2.5 text-sm">
                Consultar disponibilidad
              </a>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={`relative z-[60] -mr-1 rounded-full p-2 transition sm:p-2.5 xl:hidden ${solid && !open ? 'text-carbon hover:bg-crema-dark' : 'text-white hover:bg-white/10'}`}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            >
              {open ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[45] flex flex-col overflow-y-auto overflow-x-hidden bg-cerro-noche px-6 pb-10 pt-28 text-crema xl:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 36px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 36px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 36px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <SunLogo className="absolute -right-16 top-40 h-72 w-72 opacity-10" title="" />
            </div>
            <motion.ul
              className="flex flex-col gap-1"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
            >
              {nav.links.map((l) => (
                <motion.li key={l.id} variants={{ hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0 } }}>
                  <a href={`/#${l.id}`} onClick={goTo(l.id)} className="block py-2 font-serif text-4xl font-medium transition-colors hover:text-sol">
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mt-auto space-y-3 pt-10">
              <a href={waLink(settings.contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-sol w-full">
                <MessageCircle className="h-5 w-5" /> Escribinos por WhatsApp
              </a>
              <div className="flex flex-wrap gap-3">
                {settings.social.instagram && (
                  <a href={settings.social.instagram} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 whitespace-nowrap !px-4">
                    <Instagram className="h-5 w-5" /> Instagram
                  </a>
                )}
                <a href={settings.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost flex-1 whitespace-nowrap !px-4">
                  <MapPin className="h-5 w-5" /> Cómo llegar
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
