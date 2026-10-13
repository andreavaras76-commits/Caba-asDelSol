import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Envuelve un botón/link y lo "atrae" levemente hacia el cursor.
 * En touch o con movimiento reducido no hace nada.
 */
export default function Magnetic({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15, mass: 0.4 });

  const onMove = (e) => {
    if (reduce || e.pointerType !== 'mouse') return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} onPointerMove={onMove} onPointerLeave={reset} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}
