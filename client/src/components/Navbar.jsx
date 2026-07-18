import { NavLink } from 'react-router-dom';
import { Swords, LayoutDashboard, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

// Same NavLink `active` styling function reused for both authed and
// unauthed links so the active-page indicator behaves identically everywhere.
const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive ? 'bg-surface text-foreground' : 'text-muted hover:text-foreground'
  }`;

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
        <NavLink to="/" className="flex items-center gap-2 text-base font-bold text-foreground">
          <Swords className="size-5 text-accent" />
          CodeArena
        </NavLink>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </span>
              </NavLink>
              <NavLink to={`/profile/${user.username}`} className={linkClass}>
                <span className="flex items-center gap-1.5">
                  <User className="size-4" />
                  Profile
                </span>
              </NavLink>
              <Button variant="ghost" onClick={logout} className="ml-1">
                <LogOut className="size-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              {/* Styled to match Button's primary variant directly, rather than
                  nesting a <button> inside this <a> (invalid HTML). */}
              <NavLink
                to="/register"
                className="ml-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white
                  shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-md"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
