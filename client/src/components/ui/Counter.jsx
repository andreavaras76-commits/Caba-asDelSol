import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

/** Número que cuenta desde 0 al entrar en pantalla */
export default function Counter({ value, suffix = '', prefix = '', duration = 2, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  // Si el valor tiene decimales (1,5 km) animamos y mostramos con un decimal
  const decimals = Number.isInteger(Number(value)) ? 0 : 1;
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(decimals ? Number(v.toFixed(decimals)) : Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString('es-AR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix && <span className="ml-1 text-[0.55em] font-medium">{suffix}</span>}
    </span>
  );
}
