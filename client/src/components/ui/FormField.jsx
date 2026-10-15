import { forwardRef, useId } from 'react';

export function Field({ label, error, hint, children, className = '', light = false }) {
  const id = useId();
  const errorId = `${id}-error`;
  const control = typeof children === 'function' ? children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': error ? errorId : undefined }) : children;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className={`label ${light ? 'text-white/90' : ''}`}>
          {label}
        </label>
      )}
      {control}
      {hint && !error && <p className={`mt-1 text-xs ${light ? 'text-white/70' : 'text-carbon-light'}`}>{hint}</p>}
      {error && (
        <p id={errorId} role="alert" className={light ? 'mt-1 text-sm font-semibold text-sol-200' : 'error-text'}>
          {error}
        </p>
      )}
    </div>
  );
}

export function YesNoSelect({ value, onChange, label, light = false, yes = 'Sí', no = 'No', className = '' }) {
  const id = useId();
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 ${className}`}>
      <label htmlFor={id} className={`text-sm font-semibold ${light ? 'text-white' : 'text-carbon'}`}>
        {label}
      </label>
      <select
        id={id}
        value={value ? 'si' : 'no'}
        onChange={(e) => onChange(e.target.value === 'si')}
        className={`input !w-auto min-w-0 max-w-full !py-2 !pl-3 !pr-8 text-sm ${light ? '!border-transparent !bg-white/95' : ''}`}
      >
        <option value="no">{no}</option>
        <option value="si">{yes}</option>
      </select>
    </div>
  );
}

export const Toggle = forwardRef(function Toggle({ checked, onChange, label, light = false, id }, ref) {
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-3 text-left"
    >
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 ${checked ? 'bg-cerro' : light ? 'bg-white/30' : 'bg-piedra'}`}>
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${checked ? 'left-6' : 'left-1'}`}
        />
      </span>
      <span className={`text-sm font-semibold ${light ? 'text-white' : 'text-carbon'}`}>{label}</span>
    </button>
  );
});
