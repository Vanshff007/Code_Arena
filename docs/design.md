# Design

Read this before changing the look of the client: colors, type, layout or
components.

## Idea

Everything is built on a duel. **Cobalt is always you. Crimson is always the
other side** (the opponent in a battle, a loss in history). The rest of the
interface stays neutral so those two colors carry meaning wherever they
appear. The memorable moments are the landing-page duel demo and the battle
screens (versus bar, split-color countdown); everything else is quiet.

## Tokens (`client/src/index.css`)

| Token | Value | Use |
|---|---|---|
| `paper` | `#e8eaef` | Page background (cool grey) |
| `panel` | `#f6f7f9` | Raised surfaces |
| `sunk` | `#dde0e7` | Tracks, inset output areas |
| `rule` | `#c4c9d3` | 1px lines |
| `ink` | `#15171f` | Primary text |
| `muted` | `#5a6070` | Secondary text |
| `p1` / `p1-deep` | `#2440d8` / `#1a2fa8` | You, primary actions |
| `p2` | `#d3203f` | Opponent, losses, errors |
| `ok` | `#0f7f57` | Accepted, positive rating change |
| `warn` | `#a96400` | Partial results (wrong answer, time limit) |

Use the generated utilities (`bg-panel`, `text-p1`, `border-rule`). Do not
use raw hex values or Tailwind's default palette in components.

### Dark mode

The same tokens have dark values (`paper` `#13151c`, `panel` `#1b1e28`,
`ink` `#e6e8ee`, `p1` `#5d76ff`, `p2` `#ff4f6d`, ...). They apply when
`<html data-theme="dark">` is set, or when the device prefers dark and the
user has not picked light. The choice (system, light, dark) is in Settings
and stored in `localStorage` (`shared/theme.js`); `index.html` applies it
before first paint. Monaco uses matching `arena` / `arena-dark` themes
(`features/execution/languages.js`). Because components only use tokens,
new screens get dark mode for free; check both modes before shipping.

## Type

- **Archivo** (variable, Google Fonts) for all UI text. Its width axis is the
  main expressive tool:
  - `font-wide` (width 125): page titles, player names, headlines.
  - `font-tight` (width 68, tabular digits): every number that changes —
    clocks, ratings, scores, ranks.
- **JetBrains Mono** only for code: the editor, examples, constraints,
  program output.
- Sentence case everywhere. No all-caps labels.

## Components (`client/src/shared/ui/`)

| Component | Notes |
|---|---|
| `Button`, `ButtonLink` | `primary` (cobalt), `secondary` (outline), `ghost`, `danger`. Press moves 1px; no hover lift. |
| `Panel` | Flat surface: 1px rule, no shadow. |
| `Field` | Label above, hint or error below. |
| `Tag` | Status word with a small colored square. Use `verdictTone()` for judge verdicts. |
| `Pips` | Test cases as squares, filled when passed. |
| `PageHeader`, `SectionTitle`, `EmptyState`, `ErrorNote` | Page structure and states. |
| `Spinner`, `PageSpinner` | Loading. |
| `Logo` | Two facing blocks plus the wordmark. |

## Layout

- Content width `max-w-6xl` with `px-4 sm:px-6`, aligned with the navbar.
- Left-aligned text. Lists are divided rows, not grids of identical cards.
- Every layout must work at 390px wide. On phones, battle screens stack:
  clock, players, problem, editor, chat.

## Motion

- One ambient animation: the landing-page duel demo. It stops and shows the
  final frame when the OS asks for reduced motion.
- The battle countdown is the one big in-product moment.
- Otherwise motion only answers an action (button press, timer drain).
- `index.css` turns off animations under `prefers-reduced-motion`.

## Writing

- Name things by what the player does: "Find a match", "Create a room".
- Errors say what happened and what to do next. Empty states invite an action.
- No exclamation marks, no filler.
