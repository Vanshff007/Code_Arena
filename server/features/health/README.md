# Health (server)

`GET /api/health` returns `{ success, version, uptime, db, timestamp }`.
`version` comes from `server/package.json`. The client footer shows a
warning when it differs from the client version.

## Tests

`health.test.js`: health response, version matches `package.json`, unknown
route returns 404 JSON, and the version rule (semver format, client and
server versions equal, lock files in sync), and `trust proxy` (off outside
production, one hop in production).
