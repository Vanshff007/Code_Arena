# Auth (client)

Log in, create account, session handling and route protection.

## Files

| File | Job |
|---|---|
| `AuthContext.jsx` | Holds the user; `login`, `register`, `logout`, `refreshUser`. Token in `localStorage['codearena_token']`. |
| `useAuth.js` | Hook for the context. |
| `ProtectedRoute.jsx` | Spinner while checking the session, redirect to `/login` when logged out. |
| `authService.js` | `/auth/register`, `/auth/login`, `/auth/me`. |
| `validation.js` | Register form checks that mirror the server validator. |
| `AuthLayout.jsx`, `PasswordToggle.jsx` | Shared form layout. |
| `LoginPage.jsx`, `RegisterPage.jsx` | Pages. |
| `auth.test.js` | Service contract and validation tests. |

## Manual test cases

1. Register with mismatched passwords. Expect a field error, no request sent.
2. Log in with a wrong password. Expect the server message in the red note.
3. Refresh `/dashboard` while logged in. Expect no redirect to `/login`.
