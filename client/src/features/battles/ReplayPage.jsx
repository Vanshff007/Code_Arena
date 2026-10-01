import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pause, Play } from 'lucide-react';
import { getReplay } from './matchService';
import { codeAt, replayLength, submissionsUntil, advance, REPLAY_STEP_MS } from './replay';
import { useAuth } from '../auth/useAuth';
import CodeView from '../execution/CodeView';
import EditorialPanel from '../problems/EditorialPanel';
import DifficultyMeter from '../problems/DifficultyMeter';
import { LANGUAGES } from '../execution/languages';
import { formatClock } from '../../shared/format';
import Button from '../../shared/ui/Button';
import Tag from '../../shared/ui/Tag';
import { verdictTone } from '../../shared/ui/verdict';
import { ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

const SPEEDS = [5, 10, 30];
const TICK_MS = 100;
const languageLabel = (id) => LANGUAGES.find((l) => l.id === id)?.label ?? id ?? '';

// How both players' code changed during a battle, with every submission
// on the timeline. Only the two players can open it (checked by the API).
function ReplayPage() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);

  useEffect(() => {
    getReplay(matchId)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load this replay.'));
  }, [matchId]);

  const length = useMemo(
    () => (data ? replayLength(data.players, data.timeline, data.match.durationMs) : 0),
    [data]
  );

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setT((prev) => {
        const next = advance(prev, TICK_MS, speed, length);
        if (next >= length) setPlaying(false);
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, speed, length]);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{error}</ErrorNote>
        <Link to="/history" className="mt-4 inline-block text-sm font-semibold text-p1 hover:underline">
          Back to history
        </Link>
      </main>
    );
  }
  if (!data) return <PageSpinner label="Loading replay" />;

  const { match, players, timeline } = data;
  // You on the left in cobalt, as in the battle itself.
  const isMe = (p) => String(p.userId) === user._id;
  const ordered = [...players.filter(isMe), ...players.filter((p) => !isMe(p))];
  const recent = submissionsUntil(timeline, t);

  const togglePlay = () => {
    if (!playing && t >= length) setT(0);
    setPlaying((p) => !p);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2 border-b border-rule pb-6">
        <Link to="/history" className="text-sm text-muted hover:text-ink">
          History
        </Link>
        <h1 className="font-wide text-3xl font-extrabold leading-tight sm:text-4xl">
          Replay: {match.problem?.title ?? 'Battle'}
        </h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          {match.problem && <DifficultyMeter difficulty={match.problem.difficulty} />}
          <span>
            {match.players.map((p) => p.username).join(' vs ')},{' '}
            {match.isDraw ? 'draw' : `${match.players.find((p) => String(p.userId) === String(match.winner))?.username} won`}
          </span>
        </div>
      </header>

      <section aria-label="Playback" className="mt-6 flex flex-col gap-3 border border-rule bg-panel p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={togglePlay} className="w-28">
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            {playing ? 'Pause' : 'Play'}
          </Button>
          <span className="font-tight text-2xl font-black" aria-live="off">
            {formatClock(t)}
            <span className="text-muted"> / {formatClock(length)}</span>
          </span>
          <div role="radiogroup" aria-label="Speed" className="ml-auto flex border border-rule p-0.5">
            {SPEEDS.map((s) => (
              <button
                key={s}
                role="radio"
                aria-checked={speed === s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 text-sm font-semibold ${speed === s ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <input
            type="range"
            min={0}
            max={length}
            step={REPLAY_STEP_MS}
            value={t}
            onChange={(e) => {
              setPlaying(false);
              setT(Number(e.target.value));
            }}
            aria-label="Replay position"
            className="w-full accent-[var(--color-p1)]"
          />
          {/* Submissions as marks on the track, in the submitter's color. */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-1 h-2">
            {timeline.map((e, i) => (
              <span
                key={i}
                className={`absolute h-2 w-1 ${String(e.user) === user._id ? 'bg-p1' : 'bg-p2'}`}
                style={{ left: `${(e.t / length) * 100}%` }}
                title={`${e.verdict} at ${formatClock(e.t)}`}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {ordered.map((p, i) => {
          const snap = codeAt(p.snapshots, t);
          const isYou = String(p.userId) === user._id;
          return (
            <section key={p.username} aria-label={`${p.username}'s code`}>
              <div className={`flex items-baseline justify-between border-t-4 pt-2 ${i === 0 ? 'border-p1' : 'border-p2'}`}>
                <h2 className={`font-wide text-lg font-extrabold ${i === 0 ? 'text-p1' : 'text-p2'}`}>
                  {p.username}
                  {isYou && <span className="ml-2 text-sm font-normal text-muted">(you)</span>}
                </h2>
                <span className="text-sm text-muted">{snap ? languageLabel(snap.language) : ''}</span>
              </div>
              <div className="mt-2">
                {snap ? (
                  <CodeView code={snap.code} language={snap.language} height="380px" />
                ) : (
                  <p className="border border-dashed border-rule px-4 py-10 text-sm text-muted">
                    No code written yet at {formatClock(t)}.
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Submissions</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No submissions yet at this point.</p>
        ) : (
          <ul className="mt-2 divide-y divide-rule border-y border-rule">
            {recent.map((e, i) => {
              const who = players.find((p) => String(p.userId) === String(e.user));
              return (
                <li key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                  <button
                    className="font-tight text-base font-bold text-muted hover:text-ink"
                    onClick={() => {
                      setPlaying(false);
                      setT(e.t);
                    }}
                  >
                    {formatClock(e.t)}
                  </button>
                  <span className={`font-semibold ${String(e.user) === user._id ? 'text-p1' : 'text-p2'}`}>
                    {who?.username}
                  </span>
                  <Tag tone={verdictTone(e.verdict)}>
                    {e.verdict}, {e.passedCount}/{e.totalCount}
                  </Tag>
                  <span className="text-sm text-muted">{languageLabel(e.language)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {match.problem && (
        <div className="mt-10">
          <EditorialPanel problemId={match.problem._id} />
        </div>
      )}
    </main>
  );
}

export default ReplayPage;
