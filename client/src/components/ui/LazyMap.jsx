import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

export default function LazyMap({ src, title, className = '', label = 'Ver mapa' }) {
  const ref = useRef(null);
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || load) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px 120px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <div ref={ref} className={`relative overflow-hidden bg-[#E8F0E3] ${className}`}>
      {load ? (
        <iframe title={title} src={src} className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
      ) : (
        <button type="button" onClick={() => setLoad(true)} className="group absolute inset-0 flex h-full w-full items-center justify-center" aria-label={`${label}: ${title}`}>
          <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <rect width="400" height="240" fill="#E8F0E3" />
            {[0, 1, 2, 3, 4].map((i) => (
              <path key={i} d={`M-20 ${60 + i * 38} Q100 ${20 + i * 40} 200 ${70 + i * 34} T420 ${50 + i * 38}`} fill="none" stroke="#B9CDB0" strokeWidth="1.5" />
            ))}
            <path d="M0 170 C90 150 140 190 220 160 S340 120 400 140" fill="none" stroke="#FBF6EC" strokeWidth="9" />
            <path d="M0 170 C90 150 140 190 220 160 S340 120 400 140" fill="none" stroke="#F2C230" strokeWidth="2" strokeDasharray="6 6" />
            <ellipse cx="300" cy="70" rx="46" ry="22" fill="#ADCBEF" />
          </svg>
          <span className="relative flex flex-col items-center gap-2">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tejido text-white shadow-calida transition-transform group-hover:-translate-y-1">
              <MapPin className="h-6 w-6" aria-hidden="true" />
            </span>
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-cerro-profundo shadow">{label}</span>
          </span>
        </button>
      )}
    </div>
  );
}
