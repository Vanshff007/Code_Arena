# Auth (client)

Log in, create account, session handling, settings and route protection.

## Files

| File | Job |
|---|---|
| `authContext.js` | The React context object. |
| `AuthContext.jsx` | Provider: holds the user; `login`, `register`, `logout`, `logoutAll`, `refreshUser`. Checks `/auth/me` at start. The session is an httpOnly cookie, so nothing is stored in `localStorage`. A 401 from any request logs the user out. |
| `useAuth.js` | Hook for the context. |
| `ProtectedRoute.jsx` | Spinner while checking the session, redirect to `/login` when logged out. |
| `AdminRoute.jsx` | Like `ProtectedRoute`, and sends non-admins to the dashboard. |
| `authService.js` | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/logout-all`, `PUT /auth/password`. |
| `validation.js` | Register and password-change checks that mirror the server validator. |
| `SettingsPage.jsx` | Theme (system, light, dark), change password, log out on all devices. |
| `AuthLayout.jsx`, `PasswordToggle.jsx` | Shared form layout. |
| `LoginPage.jsx`, `RegisterPage.jsx` | Pages. |
| `auth.test.js` | Service contract and validation tests. |

## Manual test cases

1. Register with mismatched passwords. Expect a field error, no request sent.
2. Log in with a wrong password. Expect the server message in the red note.
3. Refresh `/dashboard` while logged in. Expect no redirect to `/login`.
4. In Settings, change the password with a wrong current password. Expect
   the server message; with the right one, a success note.
5. Pick Dark in Settings and refresh. Expect dark from the first paint.
