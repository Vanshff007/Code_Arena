// Base card used for stats, quick actions, auth forms, and empty states -
// the one visual container the whole design system builds on.
function Card({ children, hover = false, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 shadow-sm
        ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-accent/40' : ''}
        ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
