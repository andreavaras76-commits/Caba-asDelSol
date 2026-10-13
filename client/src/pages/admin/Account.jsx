import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2 } from 'lucide-react';
import { PageHeader, Card } from '@/components/admin/ui';
import { Field } from '@/components/ui/FormField';
import { changePasswordSchema } from '@/schemas/admin.schema';
import { adminApi } from '@/api/admin';
import { useAuthStore } from '@/store/authStore';
import { notifySuccess, handleFormError } from '@/utils/notify';

export default function Account() {
  const user = useAuthStore((s) => s.user);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await adminApi.changePassword({ currentPassword, newPassword });
      notifySuccess('Contraseña actualizada');
      reset();
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  return (
    <>
      <PageHeader title="Mi cuenta" subtitle={`${user?.name} · @${user?.username}`} />
      <Card className="max-w-lg">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-cerro-profundo">
          <KeyRound className="h-5 w-5 text-tejido-ink" aria-hidden="true" /> Cambiar contraseña
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Field label="Contraseña actual" error={errors.currentPassword?.message}>
            {(a) => <input type="password" autoComplete="current-password" className="input" {...a} {...register('currentPassword')} />}
          </Field>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres, con letras y números." error={errors.newPassword?.message}>
            {(a) => <input type="password" autoComplete="new-password" className="input" {...a} {...register('newPassword')} />}
          </Field>
          <Field label="Repetí la nueva contraseña" error={errors.confirm?.message}>
            {(a) => <input type="password" autoComplete="new-password" className="input" {...a} {...register('confirm')} />}
          </Field>
          <button type="submit" disabled={isSubmitting} className="btn-cerro w-full">
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />} Actualizar contraseña
          </button>
        </form>
      </Card>
    </>
  );
}
