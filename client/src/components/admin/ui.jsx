import { Loader2, Inbox } from 'lucide-react';

/** Piezas visuales reutilizables del panel */

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-cerro-profundo sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-carbon-light">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`rounded-3xl bg-white p-5 shadow-calida ring-1 ring-madera/5 sm:p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, text, action, inline = false }) {
  return (
    <div className={`flex flex-col items-center text-center ${inline ? 'px-4 py-8' : 'rounded-3xl border-2 border-dashed border-piedra bg-white/60 px-6 py-14'}`}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sol-100 text-madera">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="mt-4 font-serif text-2xl text-cerro-profundo">{title}</p>
      {text && <p className="mt-1 max-w-sm text-carbon-light">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Spinner({ className = 'h-6 w-6', label = 'Cargando…' }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-carbon-light">
      <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function LoadingBlock() {
  return (
    <div className="flex justify-center py-20">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

const TONES = {
  green: 'bg-cerro-50 text-cerro-600 ring-cerro/20',
  yellow: 'bg-sol-100 text-sol-700 ring-sol/30',
  blue: 'bg-cielo-50 text-cielo-700 ring-cielo/20',
  orange: 'bg-orange-50 text-tejido-dark ring-tejido/20',
  gray: 'bg-crema-dark text-carbon-light ring-piedra',
  red: 'bg-red-50 text-red-700 ring-red-200',
};

export function Badge({ tone = 'gray', children, className = '' }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${TONES[tone]} ${className}`}>{children}</span>;
}

export const INQUIRY_TONES = { nueva: 'blue', respondida: 'yellow', reservo: 'green', no_concreto: 'gray' };

/** Botón de ícono accesible (siempre con aria-label) */
export function IconButton({ label, children, className = '', tone = 'default', ...rest }) {
  const tones = {
    default: 'text-carbon-light hover:bg-crema-dark hover:text-carbon',
    danger: 'text-red-600 hover:bg-red-50',
    success: 'text-cerro-600 hover:bg-cerro-50',
  };
  return (
    <button type="button" aria-label={label} title={label} className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${tones[tone]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

/** Pestañas simples */
export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="mb-6 flex flex-wrap gap-1 rounded-3xl bg-white p-1.5 shadow-calida">
      {tabs.map(([key, label]) => (
        <button
          key={key}
          role="tab"
          type="button"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`rounded-full px-3.5 py-2 text-sm font-semibold transition sm:px-4 ${value === key ? 'bg-cerro-profundo text-crema' : 'text-carbon-light hover:bg-crema-dark'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
