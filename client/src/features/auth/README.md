# Auth (client)

Log in, create account, session handling, settings and route protection.

## Files

| File | Job |
|---|---|
| `authContext.js` | The React context object. |
| `AuthContext.jsx` | Provider: holds the user; `login`, `register`, `resetPassword`, `logout`, `logoutAll`, `refreshUser`. Checks `/auth/me` at start. The session is an httpOnly cookie, so nothing is stored in `localStorage`. A 401 from any request logs the user out. |
| `useAuth.js` | Hook for the context. |
| `ProtectedRoute.jsx` | Spinner while checking the session, redirect to `/login` when logged out. |
| `AdminRoute.jsx` | Like `ProtectedRoute`, and sends non-admins to the dashboard. |
| `authService.js` | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/logout-all`, `PUT /auth/password`, `/auth/forgot-password`, `/auth/reset-password`. |
| `validation.js` | Register, password-change and password-reset checks that mirror the server validator; `readResetToken` reads the token from the link's `#token=` fragment. |
| `SettingsPage.jsx` | Theme (system, light, dark), change password, log out on all devices. |
| `AuthLayout.jsx`, `PasswordToggle.jsx` | Shared form layout. |
| `LoginPage.jsx`, `RegisterPage.jsx` | Pages. Log in links to "Forgot password?". |
| `ForgotPasswordPage.jsx` | `/forgot-password`: asks for the email, then shows the same "check your email" note whether or not the account exists. |
| `ResetPasswordPage.jsx` | `/reset-password#token=...` from the email: new password twice, then logs in and opens the dashboard. Removes the token from the address bar on open. |
| `auth.test.js` | Service contract and validation tests. |

## Manual test cases

1. Register with mismatched passwords. Expect a field error, no request sent.
2. Log in with a wrong password. Expect the server message in the red note.
3. Refresh `/dashboard` while logged in. Expect no redirect to `/login`.
4. In Settings, change the password with a wrong current password. Expect
   the server message; with the right one, a success note.
5. Pick Dark in Settings and refresh. Expect dark from the first paint.
6. On Log in, click "Forgot password?", enter your email. Expect "Check
   your email" and an email within a minute. An unknown email shows the same
   note and sends nothing.
7. Open the link. Expect the token gone from the address bar. Set a new
   password; expect the dashboard. Log in elsewhere with the old password:
   rejected. Open the same link again: "invalid or has expired".
8. Open `/reset-password` with no token. Expect "This reset link is
   incomplete".
