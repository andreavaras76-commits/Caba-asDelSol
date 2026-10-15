import Reveal from './Reveal';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', light = false, className = '' }) {
  const alignment = align === 'center' ? 'mx-auto text-center items-center' : 'text-left items-start';
  return (
    <Reveal className={`mb-12 flex max-w-2xl flex-col gap-3 ${alignment} ${className}`}>
      {eyebrow && <p className={`font-script text-2xl sm:text-3xl ${light ? 'text-sol-300' : 'text-tejido-ink'}`}>{eyebrow}</p>}
      <h2 className={`text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl ${light ? 'text-crema' : 'text-cerro-profundo'}`}>{title}</h2>
      {subtitle && <p className={`text-balance text-lg ${light ? 'text-crema/80' : 'text-carbon-light'}`}>{subtitle}</p>}
      <SunRule light={light} />
    </Reveal>
  );
}

function SunRule({ light }) {
  return (
    <svg viewBox="0 0 120 16" className="mt-1 h-4 w-28" aria-hidden="true">
      <line x1="0" y1="8" x2="46" y2="8" stroke={light ? '#F9C564' : '#E8893A'} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="60" cy="8" r="5" fill="#F6B23C" />
      <line x1="74" y1="8" x2="120" y2="8" stroke={light ? '#F9C564' : '#E8893A'} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
