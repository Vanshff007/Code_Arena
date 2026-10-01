# Problems (server)

The problem bank used by practice mode and battles.

## Files

| File | Job |
|---|---|
| `Problem.model.js` | Schema. `hiddenTestCases` is `select: false`. Titles are unique. Tags are lowercase. |
| `problem.routes.js` | `/api/problems` routes. |
| `problem.controller.js` | List, get, create, update, delete. |
| `problem.validator.js` | Validation for create and update. |
| `seedData.js` | The 20 built-in problems in function (LeetCode) format: signature, JSON test cases. |
| `referenceSolutions.js` | Known-correct solutions (Python for all, C++ and Java for 8). |
| `seedProblems.js` | `npm run seed-problems` inserts missing problems; `-- --update` overwrites built-in ones by title (ids kept). |
| `seed.test.js` | Judges every built-in problem with its reference solutions through the real judge. |
| `problems.test.js` | Automated tests. |

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/problems` | — | List (`?difficulty=`, `?tag=`), title/difficulty/tags only |
| GET | `/api/problems/:id` | — | One problem, without hidden test cases, with generated `starterCode` |
| POST | `/api/problems` | admin | Create |
| PUT | `/api/problems/:id` | admin | Update |
| DELETE | `/api/problems/:id` | admin | Delete |

## Rules

- Never return `hiddenTestCases`. Only the execution feature reads them,
  with `.select('+hiddenTestCases')`.
- A duplicate title returns 409.
- `signature` (optional) makes a problem function-style; it is validated
  against the supported types. `outputOrder: 'any'` accepts answers in any
  order. Format details: `docs/execution.md`.

## Tests

Automated: CRUD, admin-only writes, hidden test cases never returned
(`problems.test.js`); seed data well-formed and every problem accepted by
its reference solutions in Python, C++ and Java (`seed.test.js`).

Manual:

1. Run `npm run seed-problems` twice. The second run creates 0.
2. Open a problem in the browser. The network response has no `hiddenTestCases`.
