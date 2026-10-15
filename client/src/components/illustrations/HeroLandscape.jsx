import { motion, useTransform, useReducedMotion } from 'framer-motion';
import CabinShape, { CabinDefs } from './CabinShape';

const EASE = [0.22, 1, 0.36, 1];

const PALETTES = {
  verano: {
    sky: ['#244D84', '#3A78C9', '#7FADE4', '#F9C564', '#F6B23C'],
    far: '#5A92D6',
    farOpacity: 0.55,
    mid: '#2F5D3A',
    near: '#0E9F4D',
    nearShade: '#0B843F',
  },
  invierno: {
    sky: ['#122742', '#244D84', '#7FADE4', '#D6E5F7', '#FDEBC8'],
    far: '#ADCBEF',
    farOpacity: 0.9,
    mid: '#46636E',
    near: '#EEF4FC',
    nearShade: '#D6E5F7',
  },
};

const FAR_PEAKS = [
  [260, 440],
  [420, 400],
  [590, 380],
  [760, 360],
  [930, 390],
  [1110, 370],
  [1290, 400],
];
const FAR_PATH =
  'M0 560 L90 500 L170 530 L260 440 L330 480 L420 400 L500 455 L590 380 L660 430 L760 360 L850 420 L930 390 L1020 450 L1110 370 L1200 430 L1290 400 L1370 450 L1440 420 V900 H0 Z';
const MID_PATH = 'M0 640 Q120 560 240 600 T480 590 Q600 520 720 575 T960 560 Q1100 500 1220 570 T1440 560 V900 H0 Z';
const NEAR_PATH = 'M0 770 Q260 650 560 705 Q820 752 1040 688 Q1260 628 1440 705 V900 H0 Z';

export default function HeroLandscape({ season = 'verano', scrollYProgress }) {
  const reduce = useReducedMotion();
  const p = PALETTES[season];
  const winter = season === 'invierno';

  const ySun = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const yFar = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const yMid = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yNear = useTransform(scrollYProgress, [0, 1], [0, 30]);

  const rays = Array.from({ length: 11 }, (_, i) => -100 + i * 20);

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <CabinDefs />
      <defs>
        <linearGradient id={`sky-${season}`} x1="0" y1="0" x2="0" y2="1">
          {p.sky.map((c, i) => (
            <stop key={c} offset={`${(i / (p.sky.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0" stopColor="#FDEBC8" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#F9C564" stopOpacity="0.55" />
          <stop offset="1" stopColor="#F6B23C" stopOpacity="0" />
        </radialGradient>
      </defs>

      <motion.rect
        key={season}
        width="1440"
        height="900"
        fill={`url(#sky-${season})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      <motion.g style={{ y: reduce ? 0 : ySun }}>
        <motion.g
          initial={reduce ? false : { y: 320 }}
          animate={{ y: 0 }}
          transition={{ duration: 2.4, ease: EASE, delay: 0.2 }}
        >
          <circle cx="720" cy="430" r="260" fill="url(#sunGlow)" opacity={winter ? 0.6 : 1} />
          <g stroke={winter ? '#FDEBC8' : '#FBF6EC'} strokeWidth="6" strokeLinecap="round" opacity="0.6">
            {rays.map((deg, i) => (
              <motion.line
                key={deg}
                x1="720"
                y1="285"
                x2="720"
                y2="235"
                transform={`rotate(${deg} 720 430)`}
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.9 + i * 0.09, ease: 'easeOut' }}
              />
            ))}
          </g>
          <circle cx="720" cy="430" r="110" fill="#F6B23C" />
          <circle cx="690" cy="400" r="58" fill="#FDEBC8" opacity="0.35" />
        </motion.g>
      </motion.g>

      <motion.g style={{ y: reduce ? 0 : yFar }}>
        <path d={FAR_PATH} fill={p.far} opacity={p.farOpacity} />
        {winter &&
          FAR_PEAKS.map(([x, y]) => (
            <motion.path
              key={x}
              d={`M${x - 34} ${y + 30} L${x} ${y} L${x + 36} ${y + 32} L${x + 16} ${y + 24} L${x + 2} ${y + 36} L${x - 14} ${y + 24} Z`}
              fill="#ffffff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          ))}
      </motion.g>

      <motion.g style={{ y: reduce ? 0 : yMid }}>
        <path d={MID_PATH} fill={p.mid} opacity="0.92" />
      </motion.g>

      <motion.g style={{ y: reduce ? 0 : yNear }}>
        <path d={NEAR_PATH} fill={p.near} />
        <path d="M0 800 Q300 700 600 742 Q860 780 1080 720 Q1280 668 1440 735 V900 H0 Z" fill={p.nearShade} opacity="0.7" />
        {[
          [520, 712, 1],
          [560, 718, 0.8],
          [1040, 700, 0.9],
          [1075, 694, 1.1],
          [1180, 676, 0.85],
        ].map(([x, y, s]) => (
          <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x="-3" y="-8" width="6" height="12" fill="#55331C" />
            <path d="M0 -58 L18 -8 H-18 Z" fill={winter ? '#2F5D3A' : '#1C3A24'} />
            {winter && <path d="M0 -58 L9 -34 L-9 -34 Z" fill="#fff" />}
          </g>
        ))}
        <CabinShape x={640} y={735} scale={0.85} winter={winter} smoke={winter} />
        <CabinShape x={780} y={748} scale={1.05} winter={winter} smoke={winter} delay={0.7} />
        <CabinShape x={930} y={728} scale={0.8} winter={winter} smoke={winter} delay={1.4} />
      </motion.g>

      <path d="M0 900 V846 Q360 806 720 840 T1440 832 V900 Z" fill="#FBF6EC" />
    </svg>
  );
}
