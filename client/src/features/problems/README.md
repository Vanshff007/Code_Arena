# Problems (client)

The practice list, the practice page and the editorial panel.

## Files

| File | Job |
|---|---|
| `ProblemsPage.jsx` | List with difficulty filter and search (client-side). |
| `ProblemSolvePage.jsx` | Problem statement, editorial panel and `CodeWorkspace`. |
| `EditorialPanel.jsx` | Loads `/problems/:id/editorial` on request. In practice it asks first, since reading it lowers the points. Shown after a battle and on replays. |
| `ProblemStatement.jsx` | Problem text (backticks render as code), examples as `name = value`, constraints. Also used in battles. |
| `statement.js` | `namedArguments`, `splitInlineCode`, `editorialLanguages`. |
| `DifficultyMeter.jsx`, `difficulty.js` | Difficulty as 1–3 bars; filter helper. |
| `problemService.js` | `/problems`, `/problems/:id`, `/problems/:id/editorial`. |
| `problems.test.js` | Service contract, difficulty levels, filtering, statement helpers. |

## Manual test cases

1. Filter by Hard, then search "graph". Only matching Hard problems show.
2. Open a problem with a bad id in the URL. Expect the error note and a link back.
3. In practice, click Show editorial. Expect a warning first, then the
   approach and solutions per language.
