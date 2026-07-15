// Icon-prefixed input shared by Login/Register. Kept as a plain controlled
// input (value/onChange passed through) so it drops into existing form state
// without changing how those pages talk to AuthContext.
function Input({ icon: Icon, className = '', ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4.5 -translate-y-1/2 text-muted" />
      )}
      <input
        className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground
          placeholder:text-muted transition-colors duration-150
          focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20
          ${Icon ? 'pl-10' : ''} ${className}`}
        {...props}
      />
    </div>
  );
}

export default Input;
