import { useCallback, useEffect, useRef, useState } from 'react';

/** Caché en memoria por clave: navegar entre páginas no repite pedidos */
const cache = new Map();

/**
 * Hook mínimo de datos: { data, loading, error, reload }.
 * @param {string|null} key  clave de caché (null = no pedir)
 * @param {() => Promise<any>} fetcher
 */
export default function useFetch(key, fetcher) {
  const [state, setState] = useState(() => ({ data: key ? cache.get(key) : undefined, loading: key ? !cache.has(key) : false, error: null }));
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const keyRef = useRef(key);
  keyRef.current = key;

  const load = useCallback(async () => {
    if (!key) return;
    setState((s) => ({ ...s, loading: !cache.has(key), error: null }));
    try {
      const data = await fetcherRef.current();
      cache.set(key, data);
      // Si mientras tanto cambió la clave (otro filtro), esta respuesta ya no corresponde
      if (keyRef.current === key) setState({ data, loading: false, error: null });
    } catch (error) {
      if (keyRef.current === key) setState({ data: cache.get(key), loading: false, error });
    }
  }, [key]);

  useEffect(() => {
    if (key && cache.has(key)) setState({ data: cache.get(key), loading: false, error: null });
    else load();
  }, [key, load]);

  return { ...state, reload: load };
}

export const clearFetchCache = (key) => (key ? cache.delete(key) : cache.clear());

/** Valor con retardo (para buscadores: no pedir en cada tecla) */
export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
