import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

export default function AdminRoot() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  useEffect(() => {
    bootstrap();
    fetchSettings();
  }, [bootstrap, fetchSettings]);
  return <Outlet />;
}
