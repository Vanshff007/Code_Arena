import { useEffect, useRef, useState } from 'react';
import { diffCallouts } from './callouts';

// How long each callout stays on screen.
const CALLOUT_MS = 4000;

const TONE_BORDER = { you: 'border-p1', them: 'border-p2', clock: 'border-warn' };

// Short notes in the top corner of the battle when something happens.
// The first render only records the state, so a refresh or resume does not
// replay old news.
function BattleCallouts({ selfProgress, opponentProgress, remainingMs, opponentName }) {
  const [items, setItems] = useState([]);
  const prev = useRef(null);
  const nextId = useRef(0);

  useEffect(() => {
    const next = { self: selfProgress, opponent: opponentProgress, remainingMs };
    const last = prev.current;
    prev.current = next;
    if (!last) return;
    const fresh = diffCallouts(last, next, opponentName).map((c) => ({ ...c, id: nextId.current++ }));
    if (!fresh.length) return;
    setItems((list) => [...list, ...fresh].slice(-3));
    for (const c of fresh) setTimeout(() => setItems((list) => list.filter((i) => i.id !== c.id)), CALLOUT_MS);
  }, [selfProgress, opponentProgress, remainingMs, opponentName]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-20 z-40 flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {items.map((c) => (
        <p key={c.id} className={`callout-in border-l-4 bg-panel px-4 py-2.5 text-sm text-ink shadow-sm ${TONE_BORDER[c.tone]}`}>
          <span className="font-bold">{c.title}</span>
          {c.text && ` ${c.text}`}
        </p>
      ))}
    </div>
  );
}

export default BattleCallouts;
