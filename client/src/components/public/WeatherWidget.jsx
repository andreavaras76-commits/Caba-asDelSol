import { motion } from 'framer-motion';
import { Sun, Moon, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, Wind, Droplets, Thermometer } from 'lucide-react';
import useWeather, { describeWeather } from '@/hooks/useWeather';
import Skeleton from '@/components/ui/Skeleton';

const WEATHER_ICONS = { Sun, Moon, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning };

const dayName = (iso) => new Intl.DateTimeFormat('es-AR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

/** Widget de clima en vivo de Tafí del Valle */
export default function WeatherWidget({ lat, lng }) {
  const { data, loading, error } = useWeather(lat, lng);

  if (error && !data) {
    return (
      <div className="rounded-4xl bg-cielo-800 p-6 text-crema">
        <p className="font-serif text-xl">El clima no está disponible ahora.</p>
        <p className="mt-1 text-sm text-crema/70">Probá de nuevo en unos minutos.</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="rounded-4xl bg-cielo-800 p-6" aria-busy="true" aria-label="Cargando clima">
        <Skeleton className="h-6 w-1/2 !bg-white/10" />
        <Skeleton className="mt-4 h-16 w-1/3 !bg-white/10" />
        <Skeleton className="mt-6 h-20 w-full !bg-white/10" />
      </div>
    );
  }

  const c = data.current;
  const now = describeWeather(c.weather_code, c.is_day);
  const NowIcon = WEATHER_ICONS[now.icon];

  return (
    <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-cielo-700 via-cielo to-cielo-400 p-6 text-white shadow-calida-lg sm:p-8" aria-live="polite">
      <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-sol/30 blur-2xl" aria-hidden="true" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="font-script text-2xl text-sol-200">Ahora en Tafí del Valle</p>
          <p className="mt-1 font-serif text-7xl font-semibold leading-none">
            {Math.round(c.temperature_2m)}
            <span className="align-top text-3xl">°C</span>
          </p>
          <p className="mt-2 text-lg font-semibold">{now.label}</p>
        </div>
        <motion.span animate={{ rotate: now.icon === 'Sun' ? 360 : 0, y: now.icon === 'Sun' ? 0 : [0, -6, 0] }} transition={{ duration: now.icon === 'Sun' ? 40 : 4, repeat: Infinity, ease: 'linear' }}>
          <NowIcon className="h-20 w-20 text-sol-200 drop-shadow-lg" aria-hidden="true" />
        </motion.span>
      </div>

      <dl className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/90">
        <div className="flex items-center gap-1.5">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Sensación térmica</dt>
          <dd>Sensación {Math.round(c.apparent_temperature)}°</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Humedad</dt>
          <dd>{c.relative_humidity_2m}%</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Viento</dt>
          <dd>{Math.round(c.wind_speed_10m)} km/h</dd>
        </div>
      </dl>

      <ul className="relative mt-6 grid grid-cols-4 gap-2 border-t border-white/20 pt-5">
        {data.daily.time.map((day, i) => {
          const d = describeWeather(data.daily.weather_code[i]);
          const Icon = WEATHER_ICONS[d.icon];
          return (
            <li key={day} className="flex flex-col items-center gap-1 rounded-2xl bg-white/10 py-3 text-center">
              <span className="text-xs font-bold uppercase tracking-wide">{i === 0 ? 'Hoy' : dayName(day)}</span>
              <Icon className="h-6 w-6 text-sol-200" aria-label={d.label} />
              <span className="text-sm font-semibold">
                {Math.round(data.daily.temperature_2m_max[i])}° <span className="text-white/60">{Math.round(data.daily.temperature_2m_min[i])}°</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="relative mt-4 text-right text-[11px] text-white/60">Datos: Open-Meteo</p>
    </div>
  );
}
