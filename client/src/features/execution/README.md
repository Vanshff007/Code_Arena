# Execution (client)

The code workspace shared by practice and battles.

## Files

| File | Job |
|---|---|
| `CodeWorkspace.jsx` | Language switch, Monaco editor (follows the light/dark theme), Run, Submit, custom input, output. `onCodeChange(code, language)` feeds battle snapshots. |
| `CodeView.jsx` | Read-only Monaco view, used by replays. |
| `VerdictPanel.jsx` | Submit result: verdict, pips, runtime/memory, failing public case, points, XP, coach notes. |
| `languages.js` | Supported languages (must match the server), `starterFor` (problem stub or full-program template), `defaultInputFor`, light and dark editor themes and options. |
| `executionService.js` | `/execute/run`, `/execute/submit`. |
| `execution.test.js` | Service contract, templates, and a check that the language list matches the server validator. |

## Behavior

- Function-style problems start from the problem's `Solution` stub; custom
  input starts as the first example, one JSON value per parameter per line.
- Run shows "Returned" (the method's value) and "Printed" (debug output)
  separately.
- A new problem (e.g. the next battle) resets the editor.
- Switching language replaces the code with that language's stub; it asks first if you changed the code.
- The editor uses the app colors (`ARENA_THEME`) and JetBrains Mono.

## Manual test cases

1. Open Two Sum and click Run without changes to the input. With a correct method, Output shows "Returned [0,1]".
2. Submit a compile error in C++. The verdict panel shows the compiler output.
3. Type code, switch language, cancel the prompt. The code stays.
