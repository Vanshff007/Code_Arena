# Execution (server)

Runs submitted code in Docker sandboxes and judges it. Design notes:
`docs/execution.md`.

## Files

| Path | Job |
|---|---|
| `engine/config.js` | Languages: image, file name, compile and run commands, memory. |
| `engine/workspace.js` | Temp folder per submission in `tmp/` (git-ignored). |
| `engine/dockerRunner.js` | Starts the locked-down container, runs `docker exec`, reads memory. |
| `engine/executeCode.js` | Compile once, run per test case. |
| `engine/judge.js` | `runCustomInput` (Run) and `judgeSubmission` (Submit). |
| `engine/concurrencyLimiter.js` | At most `max(2, CPUs)` containers and a queue of 20, then HTTP 503. |
| `harness/` | Function-style (LeetCode format) problems: starter stubs, hidden wrapper per language, result protocol, value comparison. See `docs/execution.md`. |
| `images/<lang>/Dockerfile` | Sandbox images. |
| `buildImages.js` | `npm run docker:build`. |
| `execution.routes.js`, `execution.controller.js`, `execution.validator.js` | `/api/execute`. |
| `execution.test.js` | Automated tests against real Docker. |
| `harness.test.js` | Harness tests without Docker. |

## API

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/api/execute/run` | user | `{ language, code, input?, problemId? }` — with `problemId`, `code` is a `Solution` class and the response includes `result` |
| POST | `/api/execute/submit` | user | `{ language, code, problemId, roomCode?, startedAt? }` |

Both use `executeLimiter` (20 per 5 minutes per user). A submit with
`roomCode` goes to the battles feature (`handleBattleSubmission`). Every
submit feeds the skills feature (`trackSubmission`); errors there never break
the response.

## Security rules

- Do not loosen the container flags in `dockerRunner.js`.
- Hidden test case content never leaves `judgeSubmission`.

## Tests

Automated (`harness.test.js`): signature validation, starter code, Java
import hoisting, line-number mapping, result extraction, value comparison.

Automated (`execution.test.js`, needs Docker and built images): function-style
accepted, Run result vs prints, too-few-lines message, compile error at the
player's line, wrong answer with returned value, starter code in the API.
Full-program: Python
accepted and wrong answer, C++ accepted, Java accepted, compilation error,
hidden case not leaked, Run with custom input, runtime error, unsupported
language (400), login required (401).

Manual:

1. Open Two Sum. The editor shows only `class Solution` with `twoSum`.
   Run with the prefilled input: Output shows "Returned [0,1]".
2. Add a `print` in the method and Run. It shows under "Printed".
3. Submit `while True: pass` in Python. Expect `Time Limit Exceeded`.
4. Submit code that opens a network connection. Expect a runtime error (no network in the sandbox).
