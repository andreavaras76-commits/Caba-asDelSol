import CabinShape, { CabinDefs } from './CabinShape';

const SKIES = [
  ['#3A78C9', '#7FADE4', '#FDEBC8'],
  ['#2E62A7', '#5A92D6', '#F9C564'],
  ['#244D84', '#7FADE4', '#FBD891'],
  ['#3A78C9', '#ADCBEF', '#FDEBC8'],
];

export default function CabinIllustration({ variant: rawVariant = 0, winter = false, className = '', label }) {
  const variant = Math.abs(Math.trunc(Number(rawVariant) || 0));
  const sky = winter ? ['#244D84', '#ADCBEF', '#EEF4FC'] : SKIES[variant % SKIES.length];
  const sunX = [300, 110, 250, 150][variant % 4];
  const id = `ci-${variant}-${winter ? 'w' : 's'}`;
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" className={className} role="img" aria-label={label || 'Ilustración de cabaña'}>
      <CabinDefs />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.6" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id})`} />
      <circle cx={sunX} cy="110" r="34" fill="#F6B23C" opacity={winter ? 0.75 : 1} />
      <path d="M0 200 L60 150 L110 175 L170 120 L230 165 L290 130 L350 170 L400 145 V300 H0 Z" fill={winter ? '#ADCBEF' : '#5A92D6'} opacity="0.6" />
      {winter && <path d="M150 138 L170 120 L190 136 L178 132 L170 140 L160 132 Z M272 145 L290 130 L310 147 L298 142 L290 150 L282 142 Z" fill="#fff" />}
      <path d="M0 240 Q100 190 200 222 T400 210 V300 H0 Z" fill={winter ? '#46636E' : '#2F5D3A'} />
      <path d="M0 270 Q120 236 230 258 T400 250 V300 H0 Z" fill={winter ? '#EEF4FC' : '#0E9F4D'} />
      <CabinShape x={150} y={262} scale={1} winter={winter} />
    </svg>
  );
}
