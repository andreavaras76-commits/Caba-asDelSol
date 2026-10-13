/**
 * Endurecimiento del cliente en producción. Se importa ANTES que React (primera línea de main.jsx).
 *
 * - Desactiva el hook de React DevTools: no se puede inspeccionar ni editar estado/props desde la extensión.
 * - Silencia la consola (el build además elimina console/debugger del código con esbuild).
 *
 * Importante: esto es una capa extra, no la seguridad real. Todo permiso y validación
 * se verifica en el backend; aunque alguien cambie algo en el navegador, la API lo rechaza.
 */
if (import.meta.env.PROD && typeof window !== 'undefined') {
  const noop = () => {};

  const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (hook && typeof hook === 'object') {
    hook.isDisabled = true;
    Object.keys(hook).forEach((key) => {
      if (typeof hook[key] === 'function') hook[key] = noop;
    });
  } else {
    try {
      Object.defineProperty(window, '__REACT_DEVTOOLS_GLOBAL_HOOK__', { value: { isDisabled: true }, configurable: false, writable: false });
    } catch {
      /* noop */
    }
  }

  ['log', 'info', 'debug', 'warn', 'error', 'table', 'trace', 'dir'].forEach((method) => {
    try {
      console[method] = noop; // eslint-disable-line no-console
    } catch {
      /* noop */
    }
  });
}
