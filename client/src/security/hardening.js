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
    }
  }

  ['log', 'info', 'debug', 'warn', 'error', 'table', 'trace', 'dir'].forEach((method) => {
    try {
      console[method] = noop;
    } catch {
    }
  });
}
