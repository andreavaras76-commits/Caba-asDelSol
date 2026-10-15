import { motion } from 'framer-motion';

export default function CabinShape({ x = 0, y = 0, scale = 1, winter = false, smoke = false, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {smoke &&
        [0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={70}
            cy={-78}
            r={6 + i * 2}
            fill="#ffffff"
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{ opacity: [0, 0.55, 0], y: -60, x: 18 }}
            transition={{ duration: 4.5, repeat: Infinity, delay: delay + i * 1.5, ease: 'easeOut' }}
          />
        ))}
      <rect x="62" y="-74" width="16" height="40" rx="2" fill="#B9B3A8" />
      <path d="M62 -64 h16 M62 -54 h16 M62 -44 h16 M70 -74 v10 M66 -64 v10 M74 -54 v10" stroke="#8E887D" strokeWidth="1.2" />
      {winter && <rect x="60" y="-78" width="20" height="6" rx="3" fill="#fff" />}

      <rect x="4" y="-42" width="92" height="42" fill="#F2C230" />
      <rect x="4" y="-42" width="92" height="42" fill="url(#cabinShade)" />
      <path d="M-8 -40 L50 -86 L108 -40 Z" fill="#7A4A2A" />
      <path d="M-8 -40 L50 -86 L108 -40" fill="none" stroke="#55331C" strokeWidth="3" strokeLinejoin="round" />
      {winter && <path d="M-6 -44 L50 -88 L106 -44 L96 -44 L50 -78 L4 -44 Z" fill="#ffffff" />}
      <circle cx="50" cy="-58" r="7" fill="#FDEBC8" stroke="#7A4A2A" strokeWidth="2.5" />

      {[14, 64].map((wx) => (
        <g key={wx}>
          <rect x={wx} y="-32" width="22" height="18" fill="#FDEBC8" />
          <rect x={wx} y="-32" width="22" height="18" fill="none" stroke="#7A4A2A" strokeWidth="3" />
          <path d={`M${wx + 11} -32 v18 M${wx} -23 h22`} stroke="#7A4A2A" strokeWidth="2" />
        </g>
      ))}
      <rect x="40" y="-28" width="20" height="28" rx="2" fill="#7A4A2A" />
      <circle cx="55" cy="-13" r="1.6" fill="#F6B23C" />
      <rect x="36" y="-2" width="28" height="4" rx="1" fill="#B9B3A8" />
    </g>
  );
}

export function CabinDefs() {
  return (
    <defs>
      <linearGradient id="cabinShade" x1="0" x2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#7A4A2A" stopOpacity="0.18" />
      </linearGradient>
    </defs>
  );
}
