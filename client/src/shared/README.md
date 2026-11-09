# Shared (client)

Code used by more than one feature. Feature code lives in `src/features/`.

| Path | Job |
|---|---|
| `api.js` | The only Axios instance. Sends the session cookie (`withCredentials`); `onUnauthorized` listeners run on a 401. |
| `getErrorMessage.js` | Turns any API error into one display string. |
| `format.js` | `formatSigned`, `formatNumber`, `formatClock`, `formatDate`. |
| `tier.js` | `tierFor(rating)`: Bronze below 1100, Silver below 1300, Gold below 1500, Platinum below 1700, else Diamond. `nextTier`, `tierChange`, `TIER_ORDER`, and `TIER_TEXT` / `TIER_BG` class names for the tier colors. Display only (dashboard, leaderboard, profiles, battle result). |
| `monitoring.js` | `initMonitoring()` (called in `main.jsx`): loads Sentry only when `VITE_SENTRY_DSN` is set; `scrubEvent` strips bodies, headers and cookies. |
| `useMediaQuery.js` | Reactive media query hook. |
| `theme.js`, `themeContext.js`, `ThemeProvider.jsx`, `useTheme.js` | Light, dark or system theme. The choice is stored in `localStorage["codearena_theme"]` and applied as `data-theme` on `<html>`. |
| `version.js` | `APP_VERSION`, injected from `package.json` by `vite.config.js`. |
| `layout/Navbar.jsx`, `layout/Footer.jsx` | Page frame. The footer shows the version. |
| `ui/` | `Button`, `ButtonLink`, `Panel`, `Field`, `Tag`, `Pips`, `Spinner`, `PageHeader`, `Logo`, plus `buttonClass.js` and `verdict.js`. |
| `shared.test.js` | Format helpers, tiers (including next tier and tier changes), monitoring scrub, error messages, verdict tones, version, theme helpers, 401 listeners. |

Design tokens are in `src/index.css`. See `docs/design.md`.
