const base =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-ctl)] px-4 py-2.5 text-sm font-semibold ' +
  'transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const variants = {
  primary: 'bg-p1 text-white hover:bg-p1-deep',
  secondary: 'border border-ink/25 bg-panel text-ink hover:border-ink',
  ghost: 'text-muted hover:bg-sunk hover:text-ink',
  danger: 'border border-p2/40 text-p2 hover:bg-p2 hover:text-white',
};

// Button styling as a class string, for elements that must not be a
// <button> (router links).
export function buttonClass(variant = 'primary', className = '') {
  return `${base} ${variants[variant]} ${className}`;
}
