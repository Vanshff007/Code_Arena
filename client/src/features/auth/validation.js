// Client-side checks that mirror server/features/auth/auth.validator.js, so
// a player sees the problem before a round trip. The server stays the
// source of truth and re-validates everything.
export function validateRegistration({ username = '', email = '', password = '', confirmPassword = '' }) {
  const errors = {};
  const name = username.trim();

  if (name.length < 3 || name.length > 20) errors.username = 'Use 3 to 20 characters.';
  else if (!/^[a-zA-Z0-9]+$/.test(name)) errors.username = 'Use letters and numbers only.';

  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = 'Enter a valid email address.';
  if (password.length < 6) errors.password = 'Use at least 6 characters.';
  if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

export function validatePasswordChange({ currentPassword = '', newPassword = '', confirmPassword = '' }) {
  const errors = {};
  if (!currentPassword) errors.currentPassword = 'Enter your current password.';
  if (newPassword.length < 6) errors.newPassword = 'Use at least 6 characters.';
  else if (newPassword === currentPassword) errors.newPassword = 'Choose a different password.';
  if (confirmPassword !== newPassword) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}
