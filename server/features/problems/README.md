# Problems (server)

The problem bank used by practice mode and battles, editorials, and the
admin API behind the problem editor.

## Files

| File | Job |
|---|---|
| `Problem.model.js` | Schema. `hiddenTestCases` and `editorial` are `select: false`. Titles are unique. Tags are lowercase. |
| `EditorialView.model.js` | One row per user who opened a problem's editorial. Scoring lowers practice points for it. |
| `problem.routes.js` | `/api/problems` routes. |
| `problem.controller.js` | List, get, editorial, and admin check/create/update/delete. Admin writes run the reference solution through the judge first. |
| `problem.validator.js` | Validation for create, update and check (signature, tests, reference solution, editorial). |
| `seedData.js` | The 60 built-in problems in function (LeetCode) format: signature, JSON test cases. |
| `referenceSolutions.js` | Known-correct solutions (Python for all, C++ and Java for 14 that together use every type in the bank). |
| `editorials.js` | Approach text for the 60 built-in problems; solutions come from `referenceSolutions.js`. |
| `seedProblems.js` | `npm run seed-problems` inserts missing problems; `-- --update` overwrites built-in ones by title (ids kept), editorials included. |
| `seed.test.js` | Judges every built-in problem with its reference solutions through the real judge. |
| `problems.test.js` | Automated tests. |

## API

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/problems` | — | List (`?difficulty=`, `?tag=`), title/difficulty/tags only |
| GET | `/api/problems/:id` | — | One problem, without hidden test cases or editorial, with generated `starterCode` |
| GET | `/api/problems/:id/editorial` | user | Approach and solutions. 403 during the user's live battle on it. Records a view |
| POST | `/api/problems/check` | admin | Judge a draft's reference solution, nothing saved |
| GET | `/api/problems/:id/admin` | admin | For the editor: editorial and `hiddenCount` (never hidden content) |
| POST | `/api/problems` | admin | Create; the reference solution must pass every test |
| PUT | `/api/problems/:id` | admin | Update; reference solution required when tests, signature or output order change |
| DELETE | `/api/problems/:id` | admin | Delete |

## Rules

- Never return `hiddenTestCases`. Only the execution feature reads them,
  with `.select('+hiddenTestCases')`. The admin view returns a count only.
- Never send the editorial with the problem. It is a separate request and
  is refused while the player's battle on that problem is live.
- Admin check, create and update use `executeLimiter`, since they run the
  judge.
- A failing reference solution returns 422 with the verdict; nothing is saved.
- A duplicate title returns 409.
- `signature` (optional) makes a problem function-style; it is validated
  against the supported types. `signature: null` on update removes it.
  `outputOrder: 'any'` accepts answers in any order. Format details:
  `docs/execution.md`.

## Tests

Automated: public list, no hidden cases or editorial on the detail
endpoint, admin-only writes, reference solution required and judged, admin
view without hidden content, editorial 404 / view recorded / blocked in a
live battle (`problems.test.js`); seed data well-formed and every problem
accepted by its reference solutions in Python, C++ and Java (`seed.test.js`).

Manual:

1. Run `npm run seed-problems` twice. The second run creates 0.
2. Open a problem in the browser. The network response has no
   `hiddenTestCases` and no `editorial`.
3. As admin, edit a problem's tests with a wrong reference solution. Expect
   "Wrong Answer" and no change saved.
