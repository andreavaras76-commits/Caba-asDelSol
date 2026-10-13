import { motion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1];

/** Aparece suavemente (fade + subida) al entrar en pantalla */
export default function Reveal({ children, delay = 0, y = 28, className = '', as = 'div', once = true, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}

/** Contenedor para animar hijos en cascada (stagger) */
export const staggerContainer = (stagger = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
