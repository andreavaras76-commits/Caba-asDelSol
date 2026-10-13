/* El "shell" del hero (en index.html) sólo corresponde a la portada: en cualquier otra ruta lo ocultamos antes de pintar. */
if (location.pathname !== '/') document.documentElement.classList.add('no-shell');
