import { LOW_TIME_MS } from '../battles/battleState';

const passed = (p) => p?.passedCount ?? 0;
const lead = (self, opp) => Math.sign(self - opp);

// Battle callouts from one state change to the next. `prev` and `next` are
// { self, opponent, remainingMs }, where self/opponent are the progress
// objects the battle page already keeps ({ passedCount, totalCount }).
// Pure, so the rules are tested without a DOM. Uses only what both players
// already see: passed counts and the clock, never code.
export function diffCallouts(prev, next, opponentName = 'Opponent') {
  const out = [];
  const [ps, po, ns, no] = [passed(prev.self), passed(prev.opponent), passed(next.self), passed(next.opponent)];
  const bloodDrawn = ps > 0 || po > 0;

  if (!bloodDrawn && ns > 0 && no === 0) {
    out.push({ tone: 'you', title: 'First blood.', text: 'You passed cases first.' });
  } else if (!bloodDrawn && no > 0 && ns === 0) {
    out.push({ tone: 'them', title: `First blood to ${opponentName}.`, text: 'Your move.' });
  } else if (bloodDrawn) {
    const before = lead(ps, po);
    const after = lead(ns, no);
    if (after === 1 && before !== 1) {
      out.push({ tone: 'you', title: 'You took the lead.', text: `${ns} passed to ${no}.` });
    } else if (after === -1 && before !== -1) {
      out.push({ tone: 'them', title: `${opponentName} took the lead.`, text: `${no} passed to ${ns}.` });
    } else if (no > po) {
      out.push({ tone: 'them', title: `${opponentName} is on ${no}/${next.opponent.totalCount}.`, text: '' });
    }
  }

  if (prev.remainingMs > LOW_TIME_MS && next.remainingMs != null && next.remainingMs <= LOW_TIME_MS && next.remainingMs > 0) {
    out.push({ tone: 'clock', title: 'One minute left.', text: 'Most passed cases wins.' });
  }
  return out;
}
