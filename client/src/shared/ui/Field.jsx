import { useId } from 'react';

// Labelled input. The label sits above the field in plain sentence case;
// `hint` and `error` render underneath.
function Field({ label, hint, error, className = '', inputClassName = '', trailing, ...props }) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`w-full rounded-[var(--radius-ctl)] border border-rule bg-panel px-3 py-2.5 text-sm text-ink
            placeholder:text-muted/80 focus:border-p1 focus:outline-none ${trailing ? 'pr-11' : ''} ${inputClassName}`}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-p2">{error}</p>}
    </div>
  );
}

export default Field;
