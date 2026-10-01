import { Link } from 'react-router-dom';
import Spinner from './Spinner';
import { buttonClass } from './buttonClass';

// One button for every action in the app. Motion is a 1px press only - the
// interface stays still so the battle itself is the thing that moves.
function Button({ variant = 'primary', loading = false, disabled = false, children, className = '', ...props }) {
  return (
    <button disabled={disabled || loading} className={buttonClass(variant, className)} {...props}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

// Same look, for navigation. Avoids nesting a <button> inside an <a>.
export function ButtonLink({ variant = 'primary', className = '', ...props }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export default Button;
