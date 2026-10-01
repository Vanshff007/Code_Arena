import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSocket } from './useSocket';
import { EVENTS, progressFromResume } from './battleState';
import VersusBar from './VersusBar';
import BattleChat from './BattleChat';
import ProblemStatement from '../problems/ProblemStatement';
import { formatSigned } from '../../shared/format';
import { ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

// Watching a live battle: players, progress, clock, problem and chat (read
// only). The first player is shown in cobalt and the second in crimson.
function SpectatePage() {
  const { roomCode } = useParams();
  const socket = useSocket();
  const [state, setState] = useState(null);
  const [progress, setProgress] = useState({});
  const [remainingMs, setRemainingMs] = useState(null);
  const [typing, setTyping] = useState({});
  const [messages, setMessages] = useState([]);
  const [ended, setEnded] = useState(null);
  const [error, setError] = useState('');
  const typingTimers = useRef({});

  useEffect(() => {
    if (!socket) return;
    const timers = typingTimers.current;
    const onState = (s) => {
      if (s.roomCode !== roomCode) return;
      setState(s);
      setRemainingMs(s.remainingMs);
      const first = s.players[0]?.userId;
      const p = progressFromResume(s.progress, first);
      setProgress({ [first]: p.self, [s.players[1]?.userId]: p.opponent });
    };
    const onProgress = ({ userId, ...rest }) => setProgress((prev) => ({ ...prev, [userId]: rest }));
    const onTimer = ({ remainingMs: ms }) => setRemainingMs(ms);
    const onTyping = ({ userId }) => {
      setTyping((prev) => ({ ...prev, [userId]: true }));
      clearTimeout(timers[userId]);
      timers[userId] = setTimeout(() => setTyping((prev) => ({ ...prev, [userId]: false })), 2000);
    };
    const onChat = (msg) => setMessages((prev) => [...prev, msg]);
    const onEnd = (data) => setEnded(data);
    const onError = ({ message }) => setError(message);

    const handlers = {
      [EVENTS.spectateState]: onState,
      [EVENTS.progress]: onProgress,
      [EVENTS.timerSync]: onTimer,
      [EVENTS.playerTyping]: onTyping,
      [EVENTS.chatMessage]: onChat,
      [EVENTS.end]: onEnd,
      [EVENTS.spectateError]: onError,
    };
    for (const [event, fn] of Object.entries(handlers)) socket.on(event, fn);
    socket.emit(EVENTS.spectateJoin, { roomCode });
    return () => {
      for (const [event, fn] of Object.entries(handlers)) socket.off(event, fn);
      socket.emit(EVENTS.spectateLeave, { roomCode });
      Object.values(timers).forEach(clearTimeout);
    };
  }, [socket, roomCode]);

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{error}</ErrorNote>
        <Link to="/watch" className="mt-4 inline-block text-sm font-semibold text-p1 hover:underline">
          See live battles
        </Link>
      </main>
    );
  }
  if (!socket || !state) return <PageSpinner label="Joining as a spectator" />;

  const [first, second] = state.players;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <p className="mb-3 text-sm text-muted">
        Spectating. Code is hidden until the battle ends.{' '}
        <Link to="/watch" className="font-semibold text-p1 hover:underline">
          Other battles
        </Link>
      </p>

      {ended ? (
        <section className="border border-rule bg-panel p-6" aria-live="polite">
          <h1 className="font-wide text-4xl font-black">
            {ended.isDraw ? 'Draw' : `${ended.results.find((r) => r.userId === ended.winner)?.username} won`}
          </h1>
          <ul className="mt-4 space-y-1">
            {ended.results.map((r, i) => (
              <li key={r.userId} className="flex flex-wrap gap-3">
                <span className={`font-bold ${i === 0 ? 'text-p1' : 'text-p2'}`}>{r.username}</span>
                <span className="text-muted">
                  {r.verdict ?? 'No submission'}, rating {formatSigned(r.ratingAfter - r.ratingBefore)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <VersusBar
          self={first}
          opponent={second}
          selfProgress={progress[first?.userId]}
          opponentProgress={progress[second?.userId]}
          remainingMs={remainingMs}
          durationMs={state.durationMs}
          opponentOnline
          opponentTyping={typing[second?.userId]}
        />
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,4fr)]">
        {state.problem ? <ProblemStatement problem={state.problem} /> : <p className="text-muted">Countdown...</p>}
        <BattleChat messages={messages} selfName={first?.username} title="Players' chat" readOnly />
      </div>
    </main>
  );
}

export default SpectatePage;
