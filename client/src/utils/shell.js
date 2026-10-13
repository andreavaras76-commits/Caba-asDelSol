/**
 * ¿La página arrancó con el shell estático del hero (index.html)?
 * Se evalúa al importar este módulo desde main.jsx, antes de que React reemplace el contenido de #root.
 * Si hubo shell, el hero no vuelve a animar la entrada del título (evita un parpadeo).
 */
export const HAD_SHELL =
  typeof document !== 'undefined' && Boolean(document.getElementById('hero-shell')) && !document.documentElement.classList.contains('no-shell');
