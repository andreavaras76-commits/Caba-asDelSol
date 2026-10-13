import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, LogIn, User, Lock } from 'lucide-react';
import SunLogo from '@/components/ui/SunLogo';
import Seo from '@/components/ui/Seo';
import { Field } from '@/components/ui/FormField';
import { LoadingBlock } from '@/components/admin/ui';
import { loginSchema } from '@/schemas/admin.schema';
import { useAuthStore } from '@/store/authStore';
import { notifyError } from '@/utils/notify';

export default function Login() {
  const { user, ready, login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { username: '', password: '' } });

  if (!ready) return <LoadingBlock />;
  if (user) return <Navigate to={location.state?.from || '/admin/resumen'} replace />;

  const onSubmit = async ({ username, password }) => {
    try {
      await login(username, password);
      navigate(location.state?.from || '/admin/resumen', { replace: true });
    } catch (err) {
      notifyError(err, 'No pudimos ingresar');
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-amanecer px-4 py-12">
      <Seo title="Ingresar" noindex />
      <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-1/3 w-full" aria-hidden="true">
        <path d="M0 320 V170 L180 90 L330 150 L520 60 L700 140 L880 70 L1060 150 L1250 80 L1440 130 V320Z" fill="#2F5D3A" opacity="0.55" />
        <path d="M0 320 V230 Q360 160 720 220 T1440 210 V320Z" fill="#0E9F4D" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-4xl bg-crema/95 p-8 shadow-calida-lg backdrop-blur sm:p-10"
      >
        <div className="mb-8 text-center">
          <SunLogo className="mx-auto h-16 w-16" />
          <p className="mt-3 font-script text-2xl text-tejido-ink">Panel de administración</p>
          <h1 className="text-3xl font-semibold text-cerro-profundo">Cabañas del Sol</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Usuario" error={errors.username?.message}>
            {(a) => (
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-madera" aria-hidden="true" />
                <input className="input pl-10" autoComplete="username" autoCapitalize="none" spellCheck={false} {...a} {...register('username')} />
              </div>
            )}
          </Field>
          <Field label="Contraseña" error={errors.password?.message}>
            {(a) => (
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-madera" aria-hidden="true" />
                <input type={show ? 'text' : 'password'} className="input px-10" autoComplete="current-password" {...a} {...register('password')} />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-carbon-light hover:bg-crema-dark" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            )}
          </Field>
          <button type="submit" disabled={isSubmitting} className="btn-cerro mt-2 w-full !py-3.5">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            Ingresar
          </button>
        </form>
      </motion.div>
    </main>
  );
}
