import { Link } from 'react-router-dom';
import SunLogo from '@/components/ui/SunLogo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-crema px-4 text-center textura-tejido">
      <SunLogo className="h-20 w-20" />
      <p className="eyebrow">Te perdiste en el cerro…</p>
      <h1 className="text-5xl font-semibold text-cerro-profundo">Página no encontrada</h1>
      <Link to="/" className="btn-sol">
        Volver al inicio
      </Link>
    </main>
  );
}
