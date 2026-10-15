import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PageLoader from '@/components/ui/PageLoader';
import PublicLayout from '@/layouts/PublicLayout';
import Home from '@/pages/public/Home';

const CabinDetail = lazy(() => import('@/pages/public/CabinDetail'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));
const Feedback = lazy(() => import('@/pages/public/Feedback'));

const AdminRoot = lazy(() => import('@/layouts/AdminRoot'));
const AdminLayout = lazy(() => import('@/layouts/AdminLayout'));
const ProtectedRoute = lazy(() => import('@/components/admin/ProtectedRoute'));
const Login = lazy(() => import('@/pages/admin/Login'));
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const Inquiries = lazy(() => import('@/pages/admin/Inquiries'));
const Cabins = lazy(() => import('@/pages/admin/Cabins'));
const CabinForm = lazy(() => import('@/pages/admin/CabinForm'));
const Promotions = lazy(() => import('@/pages/admin/Promotions'));
const PromotionForm = lazy(() => import('@/pages/admin/PromotionForm'));
const BlockedDates = lazy(() => import('@/pages/admin/BlockedDates'));
const AdminGallery = lazy(() => import('@/pages/admin/Gallery'));
const content = () => import('@/pages/admin/ContentPages');
const ServicesPage = lazy(() => content().then((m) => ({ default: m.ServicesPage })));
const AttractionsPage = lazy(() => content().then((m) => ({ default: m.AttractionsPage })));
const FaqsPage = lazy(() => content().then((m) => ({ default: m.FaqsPage })));
const ReviewsPage = lazy(() => import('@/pages/admin/Reviews'));
const NearbyPlacesPage = lazy(() => content().then((m) => ({ default: m.NearbyPlacesPage })));
const SpecialEventsPage = lazy(() => content().then((m) => ({ default: m.SpecialEventsPage })));
const Clients = lazy(() => import('@/pages/admin/Clients'));
const PromoSender = lazy(() => import('@/pages/admin/PromoSender'));
const Settings = lazy(() => import('@/pages/admin/Settings'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cabanas/:slug" element={<CabinDetail />} />
          <Route path="/opinar/:token" element={<Feedback />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<AdminRoot />}>
          <Route index element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="resumen" element={<Dashboard />} />
              <Route path="dashboard" element={<Navigate to="/admin/resumen" replace />} />
              <Route path="consultas" element={<Inquiries />} />
              <Route path="cabanas" element={<Cabins />} />
              <Route path="cabanas/:id" element={<CabinForm />} />
              <Route path="promociones" element={<Promotions />} />
              <Route path="promociones/:id" element={<PromotionForm />} />
              <Route path="fechas-bloqueadas" element={<BlockedDates />} />
              <Route path="galeria" element={<AdminGallery />} />
              <Route path="servicios" element={<ServicesPage />} />
              <Route path="atractivos" element={<AttractionsPage />} />
              <Route path="preguntas" element={<FaqsPage />} />
              <Route path="resenas" element={<ReviewsPage />} />
              <Route path="cerca" element={<NearbyPlacesPage />} />
              <Route path="eventos-especiales" element={<SpecialEventsPage />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="enviar-promos" element={<PromoSender />} />
              <Route path="configuracion" element={<Settings />} />
              <Route path="*" element={<Navigate to="/admin/resumen" replace />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
