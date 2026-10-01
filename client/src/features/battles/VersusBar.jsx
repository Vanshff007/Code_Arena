import { WifiOff } from 'lucide-react';
import { formatClock, formatNumber } from '../../shared/format';
import Pips from '../../shared/ui/Pips';
import { clockFraction, LOW_TIME_MS } from './battleState';

function Side({ player, progress, side, note }) {
  const isYou = side === 'you';
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-2 border-t-4 px-4 py-3 sm:border-t-0 ${isYou ? 'items-start border-p1' : 'items-end border-p2 text-right'}`}>
      <div className={`flex max-w-full items-baseline gap-3 ${isYou ? '' : 'flex-row-reverse'}`}>
        <span className={`truncate font-wide text-lg font-extrabold ${isYou ? 'text-p1' : 'text-p2'}`}>
          {player?.username ?? 'Opponent'}
        </span>
        {player && <span className="font-tight text-base font-semibold text-muted">{formatNumber(player.rating)}</span>}
      </div>
      <div className={`flex items-center gap-2 ${isYou ? '' : 'flex-row-reverse'}`}>
        {progress?.totalCount ? (
          <>
            <Pips
              passed={progress.passedCount}
              total={progress.totalCount}
              color={isYou ? 'bg-p1' : 'bg-p2'}
              align={isYou ? 'start' : 'end'}
              label={`${player?.username ?? 'Opponent'}: ${progress.passedCount} of ${progress.totalCount} passed`}
            />
            <span className="font-tight text-sm font-semibold text-ink">
              {progress.passedCount}/{progress.totalCount}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted">No submission yet</span>
        )}
      </div>
      {note}
    </div>
  );
}

// The duel at a glance: you on the left in cobalt, the opponent on the
// right in crimson, and the shared chess clock between you.
function VersusBar({ self, opponent, selfProgress, opponentProgress, remainingMs, durationMs, opponentOnline, opponentTyping }) {
  const low = remainingMs != null && remainingMs <= LOW_TIME_MS;
  const fraction = clockFraction(remainingMs ?? 0, durationMs);

  return (
    <section aria-label="Battle status" className="border border-rule bg-panel">
      <div className="grid grid-cols-2 sm:flex sm:items-stretch">
        <div className="hidden w-1 shrink-0 bg-p1 sm:block" />
        <Side player={self} progress={selfProgress} side="you" />

        <div className="order-first col-span-2 flex shrink-0 items-center justify-center border-b border-rule py-3 sm:order-none sm:flex-col sm:border-x sm:border-b-0 sm:px-8 sm:py-0">
          <span
            role="timer"
            aria-label="Time remaining"
            className={`font-tight text-4xl font-black leading-none sm:text-5xl ${low ? 'text-p2' : 'text-ink'}`}
          >
            {formatClock(remainingMs)}
          </span>
        </div>

        <Side
          player={opponent}
          progress={opponentProgress}
          side="them"
          note={
            !opponentOnline ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-p2">
                <WifiOff className="size-3.5" /> Disconnected, waiting to reconnect
              </span>
            ) : opponentTyping ? (
              <span className="text-xs text-muted">Typing</span>
            ) : null
          }
        />
        <div className="hidden w-1 shrink-0 bg-p2 sm:block" />
      </div>
      {/* Time left drains from both ends toward the middle. */}
      <div aria-hidden className="flex h-1 justify-center bg-sunk">
        <div className={`h-full transition-[width] duration-1000 ease-linear ${low ? 'bg-p2' : 'bg-ink'}`} style={{ width: `${fraction * 100}%` }} />
      </div>
    </section>
  );
}

export default VersusBar;
