import Spinner from './Spinner';

const variants = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0',
  secondary:
    'bg-surface text-foreground border border-border hover:border-accent hover:shadow-[0_0_16px_-4px_var(--color-accent)]',
  ghost: 'text-muted hover:text-foreground hover:bg-surface',
};

// Single Button used across the app so every primary/secondary action
// (forms, navbar, quick actions) shares the same hover-lift / loading
// behavior instead of each page reinventing it.
function Button({ variant = 'primary', loading = false, disabled = false, children, className = '', ...props }) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
        transition-all duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

export default Button;
