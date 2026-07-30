import { motion } from 'framer-motion';

const tones = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  muted: 'bg-foreground/8 text-muted',
};

// Small pop-in on mount/change - noticeable on a verdict or status flip
// (e.g. "checking" -> "connected") without being distracting on a page
// that's full of badges (difficulty tags, topic pills).
function Badge({ tone = 'muted', children, className = '' }) {
  return (
    <motion.span
      key={tone}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </motion.span>
  );
}

export default Badge;
