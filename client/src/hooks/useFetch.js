import { useCallback, useEffect, useRef, useState } from 'react';

const cache = new Map();
const inflight = new Map();

const fetchOnce = (key, fetcher) => {
  if (!inflight.has(key)) {
    const p = Promise.resolve()
      .then(fetcher)
      .finally(() => inflight.get(key) === p && inflight.delete(key));
    inflight.set(key, p);
  }
  return inflight.get(key);
};

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
      const data = await fetchOnce(key, fetcherRef.current);
      cache.set(key, data);
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

export const clearFetchCache = (key) => {
  if (key) {
    cache.delete(key);
    inflight.delete(key);
  } else {
    cache.clear();
    inflight.clear();
  }
};

export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
