# Gamification (client)

Game-feel layers on top of battles and ratings. Phase A: tier promotion
and live battle callouts (client only). Phase B: recent form and win
streak in the versus bar (data from `server/features/gamification`).

## Files

| File | Job |
|---|---|
| `callouts.js` | `diffCallouts(prev, next, opponentName)`: pure rules for battle callouts from one state to the next. |
| `BattleCallouts.jsx` | Shows callouts in the top-right corner of the battle for 4 s, at most 3 at once. The first render only records state, so a refresh does not replay old news. |
| `PromotionPanel.jsx` | Battle result: a promotion panel when the rating change crossed a tier line upward, one quiet line when it dropped. |
| `form.js` | `streakLabel(streak)` ("4 wins in a row" from 3 up) and `formLabel(name, form)` for screen readers. |
| `FormStrip.jsx` | Last results under a name in the versus bar, oldest first: a win filled in that player's color, a loss hollow, a draw grey, plus the streak label. Hidden when there is no history. |
| `gamification.test.js` | Callout rules, streak and form labels. Tier helpers are tested in `shared/shared.test.js`. |

## Behavior

Callouts (from passed counts and the clock only, never code):

- First blood: the first player to pass at least one case.
- Lead change: "You took the lead" or "<opponent> took the lead".
- Opponent progress: "<opponent> is on 4/10" when they improve without
  taking the lead.
- One minute left, once, as the clock crosses 1:00.

Promotion uses `tierChange`, `nextTier`, `TIER_ORDER` and the tier colors
(`TIER_TEXT`, `TIER_BG`) from `shared/tier.js`. Tier color tokens are in
`src/index.css` (`--color-tier-*`), for tier names, frames and ladders only.

## Manual test cases

1. In a battle, submit something that passes some cases before the
   opponent does. "First blood. You passed cases first." appears and
   fades after about 4 s.
2. Have the opponent pass more cases than you. "<opponent> took the lead."
   appears with a crimson edge.
3. Refresh mid-battle. No callouts replay.
4. Win a battle that takes your rating from below 1100 to 1100 or more.
   The result shows "You moved up", "Silver" in the Silver color, the
   rating, the points to Gold and the tier ladder.
5. Lose a battle that drops you below a tier line. One line says which
   tier you dropped to.
6. Check both in light and dark mode.
7. With 3 wins in a row, the versus bar shows three cobalt squares and
   "3 wins in a row" under your name. The opponent's losses are hollow.
8. Refresh mid-battle. The form squares stay.
