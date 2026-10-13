/** Scroll suave a una sección por id, compensando la altura del navbar */
export function scrollToId(id, offset = 72) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: reduce ? 'auto' : 'smooth' });
  return true;
}

export const NAV_LINKS = [
  { id: 'nosotros', label: 'El complejo' },
  { id: 'cabanas', label: 'Cabañas' },
  { id: 'promociones', label: 'Promos' },
  { id: 'eventos', label: 'Eventos' },
  { id: 'galeria', label: 'Galería' },
  { id: 'tafi', label: 'Tafí' },
  { id: 'ubicacion', label: 'Ubicación' },
  { id: 'faq', label: 'Preguntas', mobileOnly: true },
];
