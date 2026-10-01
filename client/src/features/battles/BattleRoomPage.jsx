import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { useSocket } from './useSocket';
import { useAuth } from '../auth/useAuth';
import { EVENTS, splitPlayers, outcomeFor, OUTCOME_TEXT, progressFromResume } from './battleState';
import VersusBar from './VersusBar';
import BattleChat from './BattleChat';
import ProblemStatement from '../problems/ProblemStatement';
import EditorialPanel from '../problems/EditorialPanel';
import CodeWorkspace from '../execution/CodeWorkspace';
import { formatNumber, formatSigned } from '../../shared/format';
import Button, { ButtonLink } from '../../shared/ui/Button';
import Tag from '../../shared/ui/Tag';
import { verdictTone } from '../../shared/ui/verdict';
import { ErrorNote } from '../../shared/ui/PageHeader';
import Spinner, { PageSpinner } from '../../shared/ui/Spinner';

// Typing indicator is sent at most this often, not on every keystroke.
const TYPING_THROTTLE_MS = 1000;
// Code snapshots for the replay: the latest code, at most this often.
const SNAPSHOT_INTERVAL_MS = 5000;

function BattleRoomPage() {
  const { roomCode } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  // waiting -> countdown -> in_progress -> completed; takenOver when the
  // battle moved to another tab.
  const [phase, setPhase] = useState('waiting');
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [problem, setProblem] = useState(null);
  const [remainingMs, setRemainingMs] = useState(null);
  const [durationMs, setDurationMs] = useState(null);
  const [selfProgress, setSelfProgress] = useState(null);
  const [opponentProgress, setOpponentProgress] = useState(null);
  const [opponentOnline, setOpponentOnline] = useState(true);
  const [opponentTyping, setOpponentTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [result, setResult] = useState(null);
  const [roomError, setRoomError] = useState('');
  const [chatNotice, setChatNotice] = useState('');
  const [copied, setCopied] = useState(false);

  // Captured when the battle actually starts (or resumes) - lets the
  // backend compute "time taken" for the Skill Analyzer / AI Coach.
  const startedAtRef = useRef(Date.now());
  const typingTimeout = useRef(null);
  const lastTypingSent = useRef(0);
  const latestCode = useRef(null); // { code, language } not yet sent as a snapshot

  const { self, opponent } = splitPlayers(players, user._id);

  useEffect(() => {
    if (!socket) return;

    const onRoomState = (data) => {
      if (data.roomCode !== roomCode) return;
      setPlayers(data.players);
      setPhase((prev) => (prev === 'waiting' || prev === 'countdown' ? data.status : prev));
    };
    const onCountdown = ({ secondsLeft }) => {
      setPhase('countdown');
      setCountdown(secondsLeft);
    };
    const onBattleStart = (data) => {
      if (data.roomCode !== roomCode) return;
      setPhase('in_progress');
      setProblem(data.problem);
      setPlayers(data.players);
      setRemainingMs(data.durationMs);
      setDurationMs(data.durationMs);
      startedAtRef.current = Date.now();
    };
    const onResume = (data) => {
      if (data.roomCode !== roomCode) return;
      setPhase('in_progress');
      setProblem(data.problem);
      setPlayers(data.players);
      setRemainingMs(data.remainingMs);
      setDurationMs(data.durationMs);
      const progress = progressFromResume(data.progress, user._id);
      setSelfProgress(progress.self);
      setOpponentProgress(progress.opponent);
      // Reconstruct the original start time from how much time has already
      // elapsed, so a page refresh mid-battle doesn't reset the "time taken"
      // clock back to zero.
      startedAtRef.current = Date.now() - (data.durationMs - data.remainingMs);
    };
    const onTimerSync = ({ remainingMs: ms }) => setRemainingMs(ms);
    const onOpponentSubmitted = (data) => setOpponentProgress(data);
    const onOpponentDisconnected = () => setOpponentOnline(false);
    const onOpponentReconnected = () => setOpponentOnline(true);
    const onBattleEnd = (data) => {
      if (data.roomCode && data.roomCode !== roomCode) return;
      setPhase('completed');
      setResult(data);
    };
    const onChatMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onChatLimited = ({ message }) => {
      setChatNotice(message);
      setTimeout(() => setChatNotice(''), 4000);
    };
    const onOpponentTyping = () => {
      setOpponentTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setOpponentTyping(false), 2000);
    };
    const onTakenOver = (data) => {
      if (data.roomCode === roomCode) setPhase('takenOver');
    };
    const onRoomError = ({ message }) => setRoomError(message);

    const handlers = {
      [EVENTS.roomState]: onRoomState,
      [EVENTS.countdown]: onCountdown,
      [EVENTS.start]: onBattleStart,
      [EVENTS.resume]: onResume,
      [EVENTS.timerSync]: onTimerSync,
      [EVENTS.opponentSubmitted]: onOpponentSubmitted,
      [EVENTS.opponentDisconnected]: onOpponentDisconnected,
      [EVENTS.opponentReconnected]: onOpponentReconnected,
      [EVENTS.end]: onBattleEnd,
      [EVENTS.chatMessage]: onChatMessage,
      [EVENTS.chatRateLimited]: onChatLimited,
      [EVENTS.opponentTyping]: onOpponentTyping,
      [EVENTS.takenOver]: onTakenOver,
      [EVENTS.roomError]: onRoomError,
    };
    for (const [event, fn] of Object.entries(handlers)) socket.on(event, fn);

    // Opening this page makes this tab the active one for the battle (a
    // refresh, or a second tab). Ignored by the server if we're not a
    // player yet (e.g. joining through a room code).
    socket.emit(EVENTS.claim, { roomCode });

    return () => {
      for (const [event, fn] of Object.entries(handlers)) socket.off(event, fn);
      clearTimeout(typingTimeout.current);
    };
  }, [socket, roomCode, user._id]);

  // Replay snapshots: send the latest code every few seconds while it
  // changes, never on every keystroke.
  useEffect(() => {
    if (!socket || phase !== 'in_progress') return;
    const id = setInterval(() => {
      if (!latestCode.current) return;
      socket.emit(EVENTS.snapshot, { roomCode, ...latestCode.current });
      latestCode.current = null;
    }, SNAPSHOT_INTERVAL_MS);
    return () => clearInterval(id);
  }, [socket, phase, roomCode]);

  const handleReady = () => socket.emit(EVENTS.roomReady, { roomCode });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCodeChange = (code, language) => {
    latestCode.current = { code, language };
    const now = Date.now();
    if (now - lastTypingSent.current < TYPING_THROTTLE_MS) return;
    lastTypingSent.current = now;
    socket.emit(EVENTS.typing, { roomCode });
  };

  const sendChat = (message) => socket.emit(EVENTS.chatSend, { roomCode, message });

  if (!socket) return <PageSpinner label="Connecting" />;

  if (roomError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{roomError}</ErrorNote>
        <Link to="/battle" className="mt-4 inline-block text-sm font-semibold text-p1 hover:underline">
          Back to battle
        </Link>
      </main>
    );
  }

  if (phase === 'takenOver') {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h1 className="font-wide text-3xl font-extrabold">This battle is open in another tab</h1>
        <p className="mt-2 max-w-xl text-muted">
          Only one tab can play at a time. Keep going in the other tab, or move the battle back here.
        </p>
        <Button className="mt-6" onClick={() => socket.emit(EVENTS.claim, { roomCode })}>
          Use this tab
        </Button>
      </main>
    );
  }

  if (phase === 'waiting') {
    return (
      <Lobby
        roomCode={roomCode}
        self={self}
        opponent={opponent}
        copied={copied}
        onCopy={handleCopyCode}
        onReady={handleReady}
      />
    );
  }

  if (phase === 'countdown') return <Countdown seconds={countdown} self={self} opponent={opponent} />;

  if (phase === 'completed' && result) {
    return <Result result={result} userId={user._id} problem={problem} socket={socket} roomCode={roomCode} />;
  }

  if (!problem) return <PageSpinner label="Loading the problem" />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <VersusBar
        self={self}
        opponent={opponent}
        selfProgress={selfProgress}
        opponentProgress={opponentProgress}
        remainingMs={remainingMs}
        durationMs={durationMs}
        opponentOnline={opponentOnline}
        opponentTyping={opponentTyping}
      />

      {/* Phones: problem, editor, chat. Wide screens: problem over chat on
          the left, editor spanning both rows on the right. */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_auto]">
        <div className="lg:col-start-1 lg:row-start-1 lg:max-h-[calc(100vh-24rem)] lg:overflow-y-auto lg:pr-4">
          <ProblemStatement problem={problem} />
        </div>
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <CodeWorkspace
            problem={problem}
            submitExtras={() => ({ roomCode, startedAt: startedAtRef.current })}
            onCodeChange={handleCodeChange}
            onVerdict={(v) => setSelfProgress({ passedCount: v.passedCount, totalCount: v.totalCount })}
          />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <BattleChat
            messages={messages}
            selfName={user.username}
            opponentName={opponent?.username}
            onSend={sendChat}
            notice={chatNotice}
          />
        </div>
      </div>
    </main>
  );
}

function Slot({ player, side, isYou }) {
  const color = side === 'you' ? 'border-p1' : 'border-p2';
  if (!player) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 border-2 border-dashed border-rule p-6 text-muted">
        <Spinner className="size-5" />
        <p className="text-sm">Waiting for an opponent to join</p>
      </div>
    );
  }
  return (
    <div className={`flex min-h-40 flex-col justify-between border-t-4 bg-panel p-6 ${color}`}>
      <div>
        <p className={`font-wide text-2xl font-extrabold ${side === 'you' ? 'text-p1' : 'text-p2'}`}>
          {player.username}
        </p>
        <p className="mt-1 text-sm text-muted">
          Rating <span className="font-tight text-base font-semibold text-ink">{formatNumber(player.rating)}</span>
          {isYou && ' (you)'}
        </p>
      </div>
      <Tag tone={player.ready ? 'ok' : 'muted'}>{player.ready ? 'Ready' : 'Not ready'}</Tag>
    </div>
  );
}

function Lobby({ roomCode, self, opponent, copied, onCopy, onReady }) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Room code</p>
          <p className="font-tight text-6xl font-black tracking-[0.08em]">{roomCode}</p>
        </div>
        <Button variant="secondary" onClick={onCopy}>
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy code'}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">Send this code to a friend. The battle starts when both players are ready.</p>

      <div className="mt-8 grid items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <Slot player={self} side="you" isYou />
        <span className="self-center text-center font-wide text-xl font-black text-muted">vs</span>
        <Slot player={opponent} side="them" />
      </div>

      {opponent && !self?.ready && (
        <Button onClick={onReady} className="mt-6 w-full py-3 text-base sm:w-auto">
          I'm ready
        </Button>
      )}
      {self?.ready && !opponent?.ready && opponent && (
        <p className="mt-6 text-sm text-muted">You're ready. Waiting for {opponent.username}.</p>
      )}
    </main>
  );
}

// The one big moment before a battle: the screen splits into the two
// player colors and the count sits on the seam.
function Countdown({ seconds, self, opponent }) {
  return (
    <main className="relative grid min-h-[calc(100vh-4rem)] grid-cols-2" aria-live="assertive">
      <div className="flex items-end bg-p1 p-6 sm:p-10">
        <span className="truncate font-wide text-2xl font-extrabold text-white sm:text-4xl">{self?.username ?? 'You'}</span>
      </div>
      <div className="flex items-end justify-end bg-p2 p-6 sm:p-10">
        <span className="truncate font-wide text-2xl font-extrabold text-white sm:text-4xl">{opponent?.username ?? 'Opponent'}</span>
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span key={seconds} className="font-tight text-[min(40vw,16rem)] font-black leading-none text-white">
          {seconds}
        </span>
        <span className="mt-2 text-sm font-semibold text-white/90">Battle starts in</span>
      </div>
    </main>
  );
}

// Rematch offers after the battle: either player can offer; the other
// accepts or declines. Accepting starts a new room for both.
function Rematch({ socket, roomCode }) {
  const navigate = useNavigate();
  const [state, setState] = useState({ status: 'idle' }); // idle | pending | offered | declined | unavailable

  useEffect(() => {
    const onRequested = (d) => d.roomCode === roomCode && setState({ status: 'offered', from: d.from });
    const onPending = (d) => d.roomCode === roomCode && setState({ status: 'pending' });
    const onDeclined = (d) => d.roomCode === roomCode && setState({ status: 'declined', by: d.by });
    const onUnavailable = (d) => setState({ status: 'unavailable', message: d.message });
    const onStart = (d) => navigate(`/battle/${d.roomCode}`);
    const handlers = {
      [EVENTS.rematchRequested]: onRequested,
      [EVENTS.rematchPending]: onPending,
      [EVENTS.rematchDeclined]: onDeclined,
      [EVENTS.rematchUnavailable]: onUnavailable,
      [EVENTS.rematchStart]: onStart,
    };
    for (const [event, fn] of Object.entries(handlers)) socket.on(event, fn);
    return () => {
      for (const [event, fn] of Object.entries(handlers)) socket.off(event, fn);
    };
  }, [socket, roomCode, navigate]);

  if (state.status === 'offered') {
    return (
      <div className="flex flex-wrap items-center gap-3 border-l-4 border-p2 bg-panel px-4 py-3">
        <span className="font-semibold">{state.from} wants a rematch.</span>
        <Button onClick={() => socket.emit(EVENTS.rematchAccept, { roomCode })}>Accept</Button>
        <Button
          variant="ghost"
          onClick={() => {
            socket.emit(EVENTS.rematchDecline, { roomCode });
            setState({ status: 'idle' });
          }}
        >
          Decline
        </Button>
      </div>
    );
  }
  if (state.status === 'pending') {
    return <p className="flex items-center gap-2 text-sm text-muted"><Spinner className="size-4" /> Waiting for your opponent to accept the rematch</p>;
  }
  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="secondary" onClick={() => socket.emit(EVENTS.rematchRequest, { roomCode })}>
        Offer a rematch
      </Button>
      {state.status === 'declined' && <p className="text-sm text-muted">{state.by} declined the rematch.</p>}
      {state.status === 'unavailable' && <p className="text-sm text-muted">{state.message}</p>}
    </div>
  );
}

function Result({ result, userId, problem, socket, roomCode }) {
  const outcome = outcomeFor(result, userId);
  const { self: you, opponent: opp } = splitPlayers(result.results, userId);
  const headlineColor = outcome === 'win' ? 'text-p1' : outcome === 'loss' ? 'text-p2' : 'text-ink';

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className={`font-wide text-6xl font-black leading-none tracking-tight sm:text-8xl ${headlineColor}`}>
        {OUTCOME_TEXT[outcome]}
      </h1>

      <div className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-2">
        {[
          [you, 'you'],
          [opp, 'them'],
        ].map(([r, side]) =>
          r ? (
            <div key={r.userId} className="bg-panel p-6">
              <p className={`font-wide text-xl font-extrabold ${side === 'you' ? 'text-p1' : 'text-p2'}`}>
                {r.username}
                {side === 'you' && <span className="ml-2 text-sm font-normal text-muted">(you)</span>}
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-tight text-5xl font-black">{formatNumber(r.ratingAfter)}</span>
                <span
                  className={`font-tight text-xl font-bold ${r.ratingAfter >= r.ratingBefore ? 'text-ok' : 'text-p2'}`}
                >
                  {formatSigned(r.ratingAfter - r.ratingBefore)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">Rating, was {formatNumber(r.ratingBefore)}</p>
              <div className="mt-4">
                {r.verdict ? (
                  <Tag tone={verdictTone(r.verdict)}>
                    {r.verdict}, {r.passedCount}/{r.totalCount} passed
                  </Tag>
                ) : (
                  <Tag>No submission</Tag>
                )}
              </div>
            </div>
          ) : null
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-start gap-3">
        <ButtonLink to="/battle">Find another match</ButtonLink>
        {result.matchId && (
          <ButtonLink to={`/replay/${result.matchId}`} variant="secondary">
            Watch the replay
          </ButtonLink>
        )}
        <ButtonLink to="/dashboard" variant="ghost">
          Go to dashboard
        </ButtonLink>
      </div>

      <div className="mt-6">
        <Rematch socket={socket} roomCode={roomCode} />
      </div>

      {problem && (
        <div className="mt-10">
          <EditorialPanel problemId={problem._id} />
        </div>
      )}
    </main>
  );
}

export default BattleRoomPage;
