import { Loader2 } from 'lucide-react';

function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin ${className}`} />;
}

export default Spinner;
