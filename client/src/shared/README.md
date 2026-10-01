# Shared (client)

Code used by more than one feature. Feature code lives in `src/features/`.

| Path | Job |
|---|---|
| `api.js` | The only Axios instance. Adds the JWT, clears it on 401. |
| `getErrorMessage.js` | Turns any API error into one display string. |
| `format.js` | `formatSigned`, `formatNumber`, `formatClock`, `formatDate`. |
| `useMediaQuery.js` | Reactive media query hook. |
| `version.js` | `APP_VERSION`, injected from `package.json` by `vite.config.js`. |
| `layout/Navbar.jsx`, `layout/Footer.jsx` | Page frame. The footer shows the version. |
| `ui/` | `Button`, `ButtonLink`, `Panel`, `Field`, `Tag`, `Pips`, `Spinner`, `PageHeader`, `Logo`, plus `buttonClass.js` and `verdict.js`. |
| `shared.test.js` | Format helpers, error messages, verdict tones, version. |

Design tokens are in `src/index.css`. See `docs/design.md`.
