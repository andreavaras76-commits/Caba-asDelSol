let pending = null; // corrección en curso (se cancela si se pide otro scroll)

/**
 * Scroll suave a una sección por id, compensando la altura del navbar.
 * Si la sección todavía no existe (las de abajo se montan después del primer pintado)
 * la espera, y durante ~1.5 s corrige la posición si el contenido de arriba cambia de alto.
 * Devuelve true si la sección ya existía.
 */
export function scrollToId(id, offset = (document.querySelector('header')?.offsetHeight || 72)) {
  if (pending) pending();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = () => {
    const el = document.getElementById(id);
    return el ? el.getBoundingClientRect().top + window.scrollY - offset : null;
  };

  const existed = target() !== null;
  let tries = 0;
  let last = null;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    const y = target();
    if (y !== null && (last === null || Math.abs(y - last) > 4 || Math.abs(window.scrollY - y) > 4)) {
      window.scrollTo({ top: y, behavior: last === null && !reduce ? 'smooth' : 'auto' });
      last = y;
    }
    if (++tries < 15) timer = setTimeout(tick, last === null ? 120 : 160);
  };
  let timer = setTimeout(tick, 0);

  // Si la persona scrollea a mano, dejamos de corregir
  const stop = () => {
    cancelled = true;
    clearTimeout(timer);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchmove', stop);
  };
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchmove', stop, { passive: true });
  pending = stop;
  setTimeout(stop, 2600);
  return existed;
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
