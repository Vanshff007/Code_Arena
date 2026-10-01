# Health (client)

`healthService.js` calls `/health`. The footer uses it to compare the server
version with the client version and shows a warning if they differ.

`health.test.js`: service contract, and the version rule (client and server
`package.json` versions are equal).
