/**
 * Silueta de cerros en capas para separar secciones.
 * `from` es el color de la sección de arriba (fondo del SVG), `to` el de la de abajo.
 */
export default function MountainDivider({ from = 'transparent', to = '#FBF6EC', accent = '#2F5D3A', flip = false, className = '' }) {
  return (
    <div className={`pointer-events-none relative -mb-px w-full ${className}`} style={{ background: from }} aria-hidden="true">
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className={`block h-16 w-full sm:h-24 lg:h-28 ${flip ? 'rotate-180' : ''}`}
      >
        <path d="M0 140 V70 L120 40 L230 78 L360 22 L470 66 L600 34 L720 80 L850 30 L980 72 L1100 26 L1230 64 L1340 40 L1440 60 V140 Z" fill={accent} opacity="0.18" />
        <path d="M0 140 V96 Q180 52 360 88 T720 82 T1080 92 T1440 78 V140 Z" fill={accent} opacity="0.35" />
        <path d="M0 140 V118 Q240 86 520 112 T1040 108 T1440 104 V140 Z" fill={to} />
      </svg>
    </div>
  );
}
