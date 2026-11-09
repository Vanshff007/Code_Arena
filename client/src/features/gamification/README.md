# Gamification (client)

Game-feel layers on top of battles and ratings. Phase A of the
gamification plan: tier promotion and live battle callouts. Both are
client only; they use data the battle already has.

## Files

| File | Job |
|---|---|
| `callouts.js` | `diffCallouts(prev, next, opponentName)`: pure rules for battle callouts from one state to the next. |
| `BattleCallouts.jsx` | Shows callouts in the top-right corner of the battle for 4 s, at most 3 at once. The first render only records state, so a refresh does not replay old news. |
| `PromotionPanel.jsx` | Battle result: a promotion panel when the rating change crossed a tier line upward, one quiet line when it dropped. |
| `gamification.test.js` | Callout rules. Tier helpers are tested in `shared/shared.test.js`. |

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
