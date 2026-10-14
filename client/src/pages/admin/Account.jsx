import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Field } from '@/components/ui/FormField';
import { changePasswordSchema } from '@/schemas/admin.schema';
import { adminApi } from '@/api/admin';
import { useAuthStore } from '@/store/authStore';
import { notifySuccess, handleFormError } from '@/utils/notify';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

/** Mi cuenta (cambiar contraseña), en un modal que se abre desde el encabezado del panel */
export default function AccountModal({ open, onClose }) {
  const user = useAuthStore((s) => s.user);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: EMPTY });

  // Estable: el Modal la usa como dependencia (si cambiara en cada render, movería el foco al escribir)
  const close = useCallback(() => {
    reset(EMPTY);
    onClose();
  }, [reset, onClose]);

  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await adminApi.changePassword({ currentPassword, newPassword });
      close();
      notifySuccess('Contraseña actualizada');
    } catch (err) {
      handleFormError(err, setError);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Mi cuenta">
      <p className="-mt-2 mb-5 text-sm text-carbon-light">
        {user?.name} · @{user?.username}
      </p>
      <h3 className="mb-3 font-serif text-lg font-semibold text-cerro-profundo">Cambiar contraseña</h3>
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
    </Modal>
  );
}
