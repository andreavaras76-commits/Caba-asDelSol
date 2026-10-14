import { Suspense, useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquareText,
  Home,
  Gift,
  CalendarX2,
  Images,
  Sparkles,
  Mountain,
  MapPin,
  PartyPopper,
  HelpCircle,
  Star,
  Users,
  Send,
  Settings,
  KeyRound,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import SunLogo from '@/components/ui/SunLogo';
import Seo from '@/components/ui/Seo';
import { LoadingBlock } from '@/components/admin/ui';
import AccountModal from '@/pages/admin/Account';
import { useAuthStore } from '@/store/authStore';
import { confirmAction } from '@/utils/notify';

const NAV = [
  {
    title: 'General',
    items: [
      { to: '/admin/resumen', label: 'Resumen', icon: LayoutDashboard },
      { to: '/admin/consultas', label: 'Consultas', icon: MessageSquareText },
    ],
  },
  {
    title: 'Contenido',
    items: [
      { to: '/admin/cabanas', label: 'Cabañas', icon: Home },
      { to: '/admin/promociones', label: 'Promociones', icon: Gift },
      { to: '/admin/fechas-bloqueadas', label: 'Fechas bloqueadas', icon: CalendarX2 },
      { to: '/admin/galeria', label: 'Galería', icon: Images },
      { to: '/admin/servicios', label: 'Servicios', icon: Sparkles },
      { to: '/admin/atractivos', label: 'Atractivos de Tafí', icon: Mountain },
      { to: '/admin/cerca', label: 'Todo cerca tuyo', icon: MapPin },
      { to: '/admin/eventos-especiales', label: 'Eventos especiales', icon: PartyPopper },
      { to: '/admin/preguntas', label: 'Preguntas frecuentes', icon: HelpCircle },
      { to: '/admin/resenas', label: 'Reseñas', icon: Star },
    ],
  },
  {
    title: 'Clientes y ajustes',
    items: [
      { to: '/admin/clientes', label: 'Clientes', icon: Users },
      { to: '/admin/enviar-promos', label: 'Enviar promos', icon: Send },
      { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
    ],
  },
];

/** Saludo según la hora de Tafí */
const greeting = () => {
  const h = Number(new Intl.DateTimeFormat('es-AR', { hour: 'numeric', hour12: false, timeZone: 'America/Argentina/Tucuman' }).format(new Date()));
  return h < 13 ? '¡Buen día!' : h < 20 ? '¡Buenas tardes!' : '¡Buenas noches!';
};

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const closeAccount = useCallback(() => setAccount(false), []);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [pathname]);

  const onLogout = async () => {
    if (await confirmAction('¿Cerrar sesión?', 'Vas a tener que volver a ingresar con tu usuario.', 'Cerrar sesión')) {
      logout();
      navigate('/admin', { replace: true });
    }
  };

  const sidebar = (
    <div className="sidebar-scroll flex h-full flex-col overflow-y-auto overscroll-contain">
      <div className="flex shrink-0 items-center gap-3 px-5 py-5">
        <SunLogo className="h-10 w-10" />
        <div className="leading-tight">
          <p className="font-serif text-lg font-semibold text-crema">Cabañas del Sol</p>
          <p className="font-script text-lg text-sol-200">Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-5 px-3 pb-4" aria-label="Panel">
        {NAV.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-widest text-crema/50">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                        isActive ? 'bg-sol text-carbon shadow-calida' : 'text-crema/80 hover:bg-white/10 hover:text-crema'
                      }`
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="shrink-0 space-y-0.5 border-t border-white/10 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-crema/80 hover:bg-white/10 hover:text-crema">
          <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" /> Ver el sitio
        </a>
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-crema/80 hover:bg-white/10 hover:text-crema">
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" /> Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-crema">
      <Seo title="Panel" noindex />

      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-cerro-noche lg:block">{sidebar}</aside>

      {/* Sidebar mobile (drawer) */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-carbon/50 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-cerro-noche lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-5 rounded-full p-2 text-crema/80 hover:bg-white/10" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-madera/10 bg-crema px-4 shadow-[0_6px_20px_-12px_rgba(122,74,42,0.35)] sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="rounded-full p-2 hover:bg-crema-dark lg:hidden" aria-label="Abrir menú">
            <Menu className="h-6 w-6" />
          </button>
          <p className="hidden font-script text-xl text-tejido-ink sm:block">{greeting()} ☀</p>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-sm leading-tight min-[380px]:block">
              <span className="block font-semibold">{user?.name}</span>
              <button type="button" onClick={() => setAccount(true)} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-tejido-ink underline-offset-2 hover:underline">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" /> Mi cuenta
              </button>
            </span>
            <button
              type="button"
              onClick={() => setAccount(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sol font-serif text-lg font-semibold text-carbon transition hover:ring-4 hover:ring-sol/30"
              aria-label="Mi cuenta"
            >
              {user?.name?.[0]}
            </button>
          </div>
        </header>
        <AccountModal open={account} onClose={closeAccount} />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Suspense fallback={<LoadingBlock />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
