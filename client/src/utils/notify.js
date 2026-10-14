import Swal, { toast } from './swal';

/** Confirmaciones y avisos del panel (SweetAlert2) */

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const confirmDelete = async (what = 'este elemento', extra = 'Esta acción no se puede deshacer.') => {
  const { isConfirmed } = await Swal.fire({
    icon: 'warning',
    titleText: `¿Eliminar ${what}?`, // texto plano: `what` puede traer datos de visitantes
    text: extra,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    focusCancel: true,
    customClass: { popup: 'swal-sol', title: 'swal-sol-title', confirmButton: 'btn bg-red-600 text-white hover:bg-red-700', cancelButton: 'btn-outline', actions: 'gap-3' },
  });
  return isConfirmed;
};

export const confirmAction = async (title, text, confirmButtonText = 'Confirmar') => {
  const { isConfirmed } = await Swal.fire({ icon: 'question', titleText: title, text, showCancelButton: true, confirmButtonText, cancelButtonText: 'Cancelar' });
  return isConfirmed;
};

/** Guardados y eliminaciones: aviso centrado que se cierra solo */
export const notifySuccess = (title, text) =>
  Swal.fire({ icon: 'success', titleText: title, text, showConfirmButton: false, timer: 1700, timerProgressBar: true });

/** Avisos chicos (esquina): login, link copiado, orden guardado… */
export const toastSuccess = (title) => toast.fire({ icon: 'success', titleText: title });
export const toastError = (title, text) => toast.fire({ icon: 'error', titleText: title, text, timer: 4000 });
export const toastWarning = (title) => toast.fire({ icon: 'warning', titleText: title });

export const notifyError = (err, title = 'No se pudo completar') =>
  Swal.fire({
    icon: 'error',
    titleText: title,
    html: [err?.message || 'Ocurrió un error inesperado', ...(err?.errors?.length > 1 ? err.errors.slice(1).map((e) => e.message) : [])]
      .map((m) => `<p>${escapeHtml(m)}</p>`)
      .join(''),
    confirmButtonText: 'Entendido',
  });

/**
 * Lleva los errores de validación del backend a los campos de React Hook Form
 * (por si alguna regla del servidor no está en Zod) y muestra el mensaje general.
 */
export const handleFormError = (err, setError) => {
  if (setError && err?.errors?.length) {
    err.errors.forEach((e) => e.field && setError(e.field, { type: 'server', message: e.message }));
  }
  notifyError(err);
};
