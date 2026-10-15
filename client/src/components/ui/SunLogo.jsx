export default function SunLogo({ className = 'h-10 w-10', title = 'Cabañas del Sol' }) {
  const rays = [-60, -30, 0, 30, 60];
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title}>
      <g stroke="#3A78C9" strokeWidth="3" strokeLinecap="round">
        {rays.map((deg) => (
          <line key={deg} x1="32" y1="4" x2="32" y2="13" transform={`rotate(${deg} 32 36)`} />
        ))}
      </g>
      <circle cx="32" cy="36" r="14" fill="#F6B23C" />
      <path d="M0 64 V46 Q20 30 40 42 T64 40 V64 Z" fill="#0E9F4D" />
    </svg>
  );
}
