# Auth (server)

Accounts, cookie sessions and the middleware that protects every other
feature.

## Files

| File | Job |
|---|---|
| `User.model.js` | User schema. `password`, `tokenVersion`, `passwordResetHash` and `passwordResetExpires` are `select: false` and stripped from JSON; `role` is `user` or `admin`; rating starts at 1000. |
| `session.js` | Signs JWTs (`{ id, tv }`), sets and clears the `ca_token` cookie, reads a token from the cookie or a Bearer header, and checks `tv` against `tokenVersion`. Used by `protect` and the socket auth. |
| `auth.routes.js` | `/api/auth` routes. |
| `auth.controller.js` | Register, login, current user, logout, logout on all devices, change password. |
| `passwordReset.js` | Forgot password (emails a reset link) and reset password. |
| `auth.validator.js` | express-validator chains for register, login, password change, forgot and reset password. |
| `auth.middleware.js` | `protect`: reads the session and sets `req.user`. Used by other features. |
| `admin.middleware.js` | `isAdmin`: requires `req.user.role === 'admin'`. |
| `makeAdmin.js` | CLI: `npm run make-admin -- <email>`. The only way to grant admin. |
| `auth.test.js`, `session.test.js`, `passwordReset.test.js` | Automated tests. |

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, sets the cookie, returns `{ token, user }` |
| POST | `/api/auth/login` | — | Log in, sets the cookie, returns `{ token, user }` |
| GET | `/api/auth/me` | user | Current user |
| POST | `/api/auth/logout` | — | Clear the cookie |
| POST | `/api/auth/logout-all` | user | Increase `tokenVersion` (revokes every token) and disconnect the user's sockets |
| PUT | `/api/auth/password` | user | Change password; revokes other sessions and starts a new one here |
| POST | `/api/auth/forgot-password` | — | `{ email }`. Emails a reset link if the account exists. Always the same 200 answer |
| POST | `/api/auth/reset-password` | — | `{ token, password }`. Sets the password, revokes every session, starts a new one here, returns `{ token, user }`. 400 if the link is invalid, used or expired |

Rules: username 3–20 letters and numbers, valid email, password 6+
characters. Register, login, password change, forgot and reset password
share `authLimiter` (10 requests per 15 minutes per IP).

The cookie is httpOnly and `SameSite=Lax` (`Secure` in production), so the
web app and API must be on the same site. The returned `token` is for API
clients and tests; the web app never stores it.

## Password reset

- The link is `<first CLIENT_URL>/reset-password#token=<64 hex>`. The token
  is in the fragment, which browsers never send to a server, so it stays out
  of Nginx logs and `Referer` headers.
- Only the SHA-256 of the token is stored (`passwordResetHash`), with a
  30-minute expiry. A new request replaces the old link; a used link stops
  working.
- Forgot password answers the same for known and unknown emails, and does
  not wait for the email to send, so neither the answer nor its timing
  reveals which emails are registered.
- A reset increases `tokenVersion` (every session ends), disconnects the
  user's sockets, and logs this browser in.
- Email goes out through `server/core/utils/mailer.js` (SMTP, Gmail by
  default; `SMTP_*` and `MAIL_FROM` in `.env`). Without SMTP settings no
  email is sent and a warning is logged. Tokens and links are never logged.

## Tests

Automated: register, duplicate email (409), login, wrong password (401),
`/me` without a session (401) and with one (`auth.test.js`); cookie flags,
cookie-only auth, no private fields, logout, logout on all devices,
password change, wrong secret, cookie helpers (`session.test.js`); same
answer for known and unknown emails, only a hash stored, reset logs in and
revokes old sessions, single use, expired, wrong and malformed tokens,
newer link replaces older (`passwordReset.test.js`).

Manual:

1. Register with a 2-character username. Expect a field error.
2. Register, log out, log in again. Expect the dashboard with the same rating.
3. Log in on two browsers. In Settings on one, click "Log out on all
   devices". Expect the other browser to land on the login page on its next
   request.
4. Change the password in Settings. Expect the old password to fail at login.
5. Forgot password flow: see `client/src/features/auth/README.md`, cases 6 to 8.
