import { useEffect, useState } from 'react';

/** Cuenta regresiva hasta `target`. Devuelve null si no hay fecha o ya pasó. */
export default function useCountdown(target) {
  const calc = () => {
    if (!target) return null;
    const diff = new Date(target).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [left, setLeft] = useState(calc);

  useEffect(() => {
    if (!target) return undefined;
    const t = setInterval(() => setLeft(calc()), 1000);
    return () => clearInterval(t);
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  return left;
}
