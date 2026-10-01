# Problems (client)

The practice list and the practice page.

## Files

| File | Job |
|---|---|
| `ProblemsPage.jsx` | List with difficulty filter and search (client-side). |
| `ProblemSolvePage.jsx` | Problem statement and `CodeWorkspace`. |
| `ProblemStatement.jsx` | Problem text (backticks render as code), examples as `name = value`, constraints. Also used in battles. |
| `statement.js` | `namedArguments`, `splitInlineCode`. |
| `DifficultyMeter.jsx`, `difficulty.js` | Difficulty as 1–3 bars; filter helper. |
| `problemService.js` | `/problems`, `/problems/:id`. |
| `problems.test.js` | Service contract, difficulty levels, filtering, statement helpers. |

## Manual test cases

1. Filter by Hard, then search "graph". Only matching Hard problems show.
2. Open a problem with a bad id in the URL. Expect the error note and a link back.
