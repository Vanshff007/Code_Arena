import { useEffect, useState } from 'react';
import useMediaQuery from '../../shared/useMediaQuery';
import { formatClock, formatNumber } from '../../shared/format';
import Pips from '../../shared/ui/Pips';
import { demoFrame, FINAL_FRAME, LEFT, RIGHT, DEMO_PROBLEM } from './duelScript';

const TICK_MS = 50;

// On phones the panes stack (left player on top), so "left/right" become
// "top/bottom" and mirroring is dropped.
function Pane({ player, code, result, side, won, typing }) {
  const isLeft = side === 'left';
  const accent = isLeft ? 'text-p1' : 'text-p2';
  const mirror = isLeft ? '' : 'sm:flex-row-reverse';
  return (
    <div className={`flex min-w-0 flex-1 flex-col ${won ? 'bg-p1/[0.06]' : ''}`}>
      <div className={`flex items-baseline justify-between gap-3 border-b border-rule px-4 py-3 ${mirror}`}>
        <div className={`flex items-baseline gap-3 ${mirror}`}>
          <span className={`font-wide text-base font-extrabold sm:text-lg ${accent}`}>{player.name}</span>
          <span className="font-tight text-base font-semibold text-muted">{formatNumber(player.rating)}</span>
        </div>
        <span className="text-xs text-muted">{player.language}</span>
      </div>

      <pre className="h-40 overflow-hidden px-4 py-3 font-mono text-[12px] leading-relaxed text-ink sm:h-64 sm:text-[13px]">
        {code}
        {typing && <span className={`inline-block h-[1.1em] w-[0.55em] translate-y-[0.15em] ${isLeft ? 'bg-p1' : 'bg-p2'}`} />}
      </pre>

      <div className={`flex min-h-12 flex-wrap items-center gap-3 border-t border-rule px-4 py-3 ${mirror}`}>
        {result ? (
          <>
            <Pips passed={result.passed} total={result.total} color={isLeft ? 'bg-p1' : 'bg-p2'} align={isLeft ? 'start' : 'end'} />
            <span className={`text-sm font-bold ${result.verdict === 'Accepted' ? 'text-ok' : 'text-warn'}`}>
              {result.verdict} {result.passed}/{result.total}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted">Writing a solution</span>
        )}
      </div>
    </div>
  );
}

// Landing-page hero: a scripted duel between two players. It is the only
// ambient animation in the app; with reduced motion it shows the result.
function DuelDemo() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [t, setT] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const start = Date.now();
    const id = setInterval(() => setT(Date.now() - start), TICK_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const frame = reduceMotion ? FINAL_FRAME : demoFrame(t);

  return (
    <figure aria-label={`Example battle on ${DEMO_PROBLEM}`} className="border border-rule bg-panel">
      <div className="flex flex-col items-stretch sm:flex-row">
        <div className="h-1 shrink-0 bg-p1 sm:h-auto sm:w-1" />
        <Pane player={LEFT} code={frame.leftCode} result={frame.left} side="left" won={frame.winner === 'left'} typing={!frame.left} />

        <div className="flex shrink-0 items-center justify-between gap-2 border-y border-rule px-4 py-3 sm:w-32 sm:flex-col sm:justify-center sm:border-x sm:border-y-0 sm:px-2">
          <span className="font-tight text-4xl font-black leading-none sm:text-5xl">{formatClock(frame.clockMs)}</span>
          <span className="text-right text-xs leading-tight text-muted sm:text-center sm:text-[11px]">{DEMO_PROBLEM}</span>
        </div>

        <Pane
          player={RIGHT}
          code={frame.rightCode}
          result={frame.right}
          side="right"
          typing={!frame.right && !frame.winner}
        />
        <div className="h-1 shrink-0 bg-p2 sm:h-auto sm:w-1" />
      </div>
      <figcaption className="flex min-h-11 items-center border-t border-rule px-5 py-3 text-sm">
        {frame.winner ? (
          <span>
            <span className="font-bold text-p1">{LEFT.name}</span> wins with the first accepted answer and gains{' '}
            <span className="font-tight text-base font-black text-ok">+18</span>
          </span>
        ) : (
          <span className="text-muted">Same problem, same clock. Each submission shows how many test cases passed.</span>
        )}
      </figcaption>
    </figure>
  );
}

export default DuelDemo;
