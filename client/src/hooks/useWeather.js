import { useEffect, useState } from 'react';

/** Clima en vivo de Open-Meteo (gratis, sin API key). Se refresca cada 15 minutos. */
export default function useWeather(lat = -26.8596544, lng = -65.6869324) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${lat}&longitude=${lng}` +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
      '&timezone=America%2FArgentina%2FTucuman&forecast_days=4';

    const load = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('No pudimos obtener el clima');
        const data = await res.json();
        if (!cancelled) setState({ data, loading: false, error: null });
      } catch (error) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error }));
      }
    };
    load();
    const t = setInterval(load, 15 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [lat, lng]);

  return state;
}

/** Código WMO → descripción en castellano + ícono de Lucide */
export function describeWeather(code, isDay = 1) {
  if (code === 0) return { label: isDay ? 'Despejado' : 'Noche despejada', icon: isDay ? 'Sun' : 'Moon' };
  if (code <= 2) return { label: 'Parcialmente nublado', icon: 'CloudSun' };
  if (code === 3) return { label: 'Nublado', icon: 'Cloud' };
  if (code <= 48) return { label: 'Niebla', icon: 'CloudFog' };
  if (code <= 57) return { label: 'Llovizna', icon: 'CloudDrizzle' };
  if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Lluvia', icon: 'CloudRain' };
  if (code <= 77 || code === 85 || code === 86) return { label: 'Nieve', icon: 'CloudSnow' };
  return { label: 'Tormenta', icon: 'CloudLightning' };
}
