import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

/** Raíz de /admin: valida el token guardado y carga la configuración una sola vez */
export default function AdminRoot() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  useEffect(() => {
    bootstrap();
    fetchSettings();
  }, [bootstrap, fetchSettings]);
  return <Outlet />;
}
