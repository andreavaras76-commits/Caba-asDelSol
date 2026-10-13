import Swal from 'sweetalert2';

/** SweetAlert2 con la estética del sitio (las clases están en index.css) */
const themed = Swal.mixin({
  buttonsStyling: false,
  customClass: {
    popup: 'swal-sol',
    title: 'swal-sol-title',
    confirmButton: 'btn-sol',
    cancelButton: 'btn-outline',
    actions: 'gap-3',
  },
});

export const toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
  customClass: { popup: 'swal-sol' },
});

export default themed;
