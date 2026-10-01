import { Loader2 } from 'lucide-react';

function Spinner({ className = '' }) {
  return <Loader2 aria-hidden className={`animate-spin ${className}`} />;
}

// Full-height centered spinner for a page that is still loading.
export function PageSpinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex min-h-[60vh] items-center justify-center text-muted">
      <Spinner className="size-6" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;
