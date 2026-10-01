# Auth (server)

Accounts, login and the middleware that protects every other feature.

## Files

| File | Job |
|---|---|
| `User.model.js` | User schema. `password` is `select: false`; `role` is `user` or `admin`; rating starts at 1000. |
| `auth.routes.js` | `/api/auth` routes. |
| `auth.controller.js` | Register, login, current user. |
| `auth.validator.js` | express-validator chains for register and login. |
| `auth.middleware.js` | `protect`: checks `Authorization: Bearer <JWT>` and sets `req.user`. Used by other features. |
| `admin.middleware.js` | `isAdmin`: requires `req.user.role === 'admin'`. |
| `generateToken.js` | Signs a JWT with `JWT_SECRET` and `JWT_EXPIRES_IN`. |
| `makeAdmin.js` | CLI: `npm run make-admin -- <email>`. The only way to grant admin. |
| `auth.test.js` | Automated tests. |

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | — | Log in, returns `{ token, user }` |
| GET | `/api/auth/me` | user | Current user |

Rules: username 3–20 letters and numbers, valid email, password 6+
characters. Register and login share `authLimiter` (10 requests per 15
minutes per IP).

## Tests

Automated (`auth.test.js`): register, duplicate email (409), login, wrong
password (401), `/me` without a token (401), `/me` with a token.

Manual:

1. Register with a 2-character username. Expect a field error.
2. Register, log out, log in again. Expect the dashboard with the same rating.
3. Delete the token from local storage and refresh a protected page. Expect the login page.

## Known issues

- Tokens cannot be revoked before they expire (stateless JWT).
