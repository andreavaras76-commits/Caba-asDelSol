import SunLogo from './SunLogo';

export default function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-crema" role="status">
      <SunLogo className="h-16 w-16 animate-pulse" />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
