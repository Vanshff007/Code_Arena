// Must run after `protect` - relies on req.user already being populated.
// Kept as its own middleware (rather than folded into `protect`) so routes
// compose exactly the authorization they need: `protect` alone for any
// logged-in user, `protect, isAdmin` for admin-only actions like managing
// problems.
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
