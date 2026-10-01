import { Eye, EyeOff } from 'lucide-react';

function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-2 text-muted hover:text-ink"
      aria-label={shown ? 'Hide password' : 'Show password'}
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

export default PasswordToggle;
