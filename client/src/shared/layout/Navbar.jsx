import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../features/auth/useAuth';
import { formatNumber } from '../format';
import Logo from '../ui/Logo';
import { buttonClass } from '../ui/buttonClass';

const APP_LINKS = [
  { to: '/battle', label: 'Battle' },
  { to: '/problems', label: 'Practice' },
  { to: '/leaderboard', label: 'Rankings' },
  { to: '/history', label: 'History' },
  { to: '/skills', label: 'Skills' },
];

// Active page gets a cobalt underline sitting on the bar's bottom rule.
const linkClass = ({ isActive }) =>
  `relative px-3 py-5 text-sm font-medium transition-colors ${
    isActive
      ? 'text-ink after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:bg-p1'
      : 'text-muted hover:text-ink'
  }`;

const mobileLinkClass = ({ isActive }) =>
  `border-l-2 px-3 py-2.5 text-[15px] font-medium ${isActive ? 'border-p1 text-ink' : 'border-transparent text-muted'}`;

function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to={user ? '/dashboard' : '/'} onClick={close} className="py-4">
          <Logo />
        </Link>

        <div className="hidden flex-1 items-center md:flex">
          {user && APP_LINKS.map((l) => <NavLink key={l.to} to={l.to} className={linkClass}>{l.label}</NavLink>)}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <Link
                to={`/profile/${user.username}`}
                className="flex items-baseline gap-2 text-sm text-ink hover:text-p1"
                title="Your profile"
              >
                <span className="font-semibold">{user.username}</span>
                <span className="font-tight text-base font-bold text-p1">{formatNumber(user.rating)}</span>
              </Link>
              <button onClick={logout} className="text-sm text-muted hover:text-ink">
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm font-medium text-muted hover:text-ink">
                Log in
              </NavLink>
              <Link to="/register" className={buttonClass('primary', 'py-2')}>
                Create account
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="-mr-2 p-2 text-ink md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-rule px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col">
            {user ? (
              <>
                {APP_LINKS.map((l) => (
                  <NavLink key={l.to} to={l.to} className={mobileLinkClass} onClick={close}>
                    {l.label}
                  </NavLink>
                ))}
                <NavLink to={`/profile/${user.username}`} className={mobileLinkClass} onClick={close}>
                  Profile
                </NavLink>
                <button
                  onClick={() => {
                    close();
                    logout();
                  }}
                  className="border-l-2 border-transparent px-3 py-2.5 text-left text-[15px] text-muted"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={mobileLinkClass} onClick={close}>
                  Log in
                </NavLink>
                <NavLink to="/register" className={mobileLinkClass} onClick={close}>
                  Create account
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
