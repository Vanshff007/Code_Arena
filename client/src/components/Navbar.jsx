import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, LayoutDashboard, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from './ui/Button';

const MotionNavLink = motion.create(NavLink);

// Same NavLink `active` styling function reused for both authed and
// unauthed links so the active-page indicator behaves identically everywhere.
const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive ? 'bg-surface text-foreground' : 'text-muted hover:text-foreground'
  }`;

const linkTap = { whileHover: { y: -1 }, whileTap: { scale: 0.95 } };

function Navbar() {
  const { user, logout } = useAuth();
  // Below `sm` there isn't room for every link at once (icon + label x3, or
  // even just Login/Register, gets cramped on a ~360px phone) - collapse
  // into a hamburger there instead of letting the row wrap or overflow.
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <NavLink to="/" className="flex items-center gap-2 text-base font-bold text-foreground" onClick={closeMenu}>
            <Swords className="size-5 text-accent" />
            CodeArena
          </NavLink>
        </motion.div>

        {/* Desktop/tablet nav - full row, hidden once it wouldn't fit */}
        <div className="hidden items-center gap-1 sm:flex">
          {user ? (
            <>
              <MotionNavLink to="/dashboard" className={linkClass} {...linkTap}>
                <span className="flex items-center gap-1.5">
                  <LayoutDashboard className="size-4" />
                  Dashboard
                </span>
              </MotionNavLink>
              <MotionNavLink to={`/profile/${user.username}`} className={linkClass} {...linkTap}>
                <span className="flex items-center gap-1.5">
                  <User className="size-4" />
                  Profile
                </span>
              </MotionNavLink>
              <Button variant="ghost" onClick={logout} className="ml-1">
                <LogOut className="size-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <MotionNavLink to="/login" className={linkClass} {...linkTap}>
                Login
              </MotionNavLink>
              {/* Styled to match Button's primary variant directly, rather than
                  nesting a <button> inside this <a> (invalid HTML). */}
              <MotionNavLink
                to="/register"
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="ml-1 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background
                  shadow-[0_6px_16px_-6px_var(--color-accent)] transition-colors duration-200 hover:bg-accent-hover"
              >
                Register
              </MotionNavLink>
            </>
          )}
        </div>

        {/* Mobile hamburger toggle - only rendered below `sm` */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="rounded-lg p-2 text-foreground sm:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </motion.button>
      </div>

      {/* Mobile dropdown - links stacked full-width, only exists below `sm` */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border sm:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {user ? (
                <>
                  <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
                    <span className="flex items-center gap-1.5">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </span>
                  </NavLink>
                  <NavLink to={`/profile/${user.username}`} className={linkClass} onClick={closeMenu}>
                    <span className="flex items-center gap-1.5">
                      <User className="size-4" />
                      Profile
                    </span>
                  </NavLink>
                  <button
                    onClick={() => {
                      closeMenu();
                      logout();
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted transition-colors hover:text-foreground"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={linkClass} onClick={closeMenu}>
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-lg bg-accent px-3 py-2 text-center text-sm font-semibold text-background shadow-[0_6px_16px_-6px_var(--color-accent)]"
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
