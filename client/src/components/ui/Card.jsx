import { motion } from 'framer-motion';

// Base card used for stats, quick actions, auth forms, and empty states -
// the one visual container the whole design system builds on. `hover` cards
// lift/scale on hover and settle back with a spring on tap, for the pages
// (quick actions, problem list) where the whole card is clickable.
function Card({ children, hover = false, className = '' }) {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.015 } : undefined}
      whileTap={hover ? { scale: 0.985 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`rounded-xl border border-border bg-card p-6 shadow-sm
        ${hover ? 'transition-shadow duration-200 hover:shadow-lg hover:border-accent/40' : ''}
        ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default Card;
