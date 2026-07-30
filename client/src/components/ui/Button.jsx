import { motion } from 'framer-motion';
import Spinner from './Spinner';

const variants = {
  primary:
    'bg-accent text-background font-semibold hover:bg-accent-hover shadow-[0_6px_16px_-6px_var(--color-accent)] hover:shadow-[0_8px_20px_-6px_var(--color-accent)]',
  secondary:
    'bg-surface text-foreground border border-border hover:border-accent hover:shadow-[0_4px_12px_-4px_var(--color-accent)]',
  ghost: 'text-muted hover:text-foreground hover:bg-surface',
};

// Single Button used across the app so every primary/secondary action
// (forms, navbar, quick actions) shares the same hover-lift / press-down /
// loading behavior instead of each page reinventing it. The lift/press is a
// spring (via framer-motion) rather than a CSS transition so it feels
// tactile - color/shadow changes stay plain CSS since motion doesn't need
// to own those.
function Button({ variant = 'primary', loading = false, disabled = false, children, className = '', ...props }) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      disabled={isDisabled}
      whileHover={isDisabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={isDisabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium
        transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50
        ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </motion.button>
  );
}

export default Button;
