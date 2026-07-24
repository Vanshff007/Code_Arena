import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send, Copy, Check, WifiOff, Wifi, Trophy } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { runCode, submitCode } from '../services/executionService';
import { STARTER_CODE, MONACO_LANGUAGE, DIFFICULTY_TONE } from '../utils/starterCode';
import { getErrorMessage } from '../utils/getErrorMessage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

function formatMs(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function BattleRoom() {
  const { roomCode } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('waiting'); // waiting -> countdown -> in_progress -> completed
  const [players, setPlayers] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [problem, setProblem] = useState(null);
  const [remainingMs, setRemainingMs] = useState(null);
  const [opponentUpdate, setOpponentUpdate] = useState(null);
  const [opponentOnline, setOpponentOnline] = useState(true);
  const [result, setResult] = useState(null);
  const [roomError, setRoomError] = useState('');
  const [copied, setCopied] = useState(false);

  // Captured when the battle actually starts (or resumes) - lets the
  // backend compute "time taken" for the Skill Analyzer / AI Coach.
  const startedAtRef = useRef(Date.now());

  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [opponentTyping, setOpponentTyping] = useState(false);
  const typingTimeout = useRef(null);

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(STARTER_CODE.cpp);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const self = players.find((p) => p.userId === user._id);
  const opponent = players.find((p) => p.userId !== user._id);

  useEffect(() => {
    if (!socket) return;

    const onRoomState = (data) => {
      if (data.roomCode !== roomCode) return;
      console.log('[Battle] room:state received', data);
      setPlayers(data.players);
      setPhase((prev) => (prev === 'waiting' || prev === 'countdown' ? data.status : prev));
    };
    const onCountdown = ({ secondsLeft }) => {
      setPhase('countdown');
      setCountdown(secondsLeft);
    };
    const onBattleStart = (data) => {
      if (data.roomCode !== roomCode) return;
      console.log('[Battle] battle:start received', data);
      setPhase('in_progress');
      setProblem(data.problem);
      setPlayers(data.players);
      setRemainingMs(data.durationMs);
      startedAtRef.current = Date.now();
    };
    const onResume = (data) => {
      if (data.roomCode !== roomCode) return;
      console.log('[Battle] battle:resume received', data);
      setPhase('in_progress');
      setProblem(data.problem);
      setPlayers(data.players);
      setRemainingMs(data.remainingMs);
      // Reconstruct the original start time from how much time has already
      // elapsed, so a page refresh mid-battle doesn't reset the "time taken"
      // clock back to zero.
      startedAtRef.current = Date.now() - (data.durationMs - data.remainingMs);
    };
    const onTimerSync = ({ remainingMs }) => setRemainingMs(remainingMs);
    const onOpponentSubmitted = (data) => setOpponentUpdate(data);
    const onOpponentDisconnected = () => setOpponentOnline(false);
    const onOpponentReconnected = () => setOpponentOnline(true);
    const onBattleEnd = (data) => {
      setPhase('completed');
      setResult(data);
    };
    const onChatMessage = (msg) => setMessages((prev) => [...prev, msg]);
    const onOpponentTyping = () => {
      setOpponentTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => setOpponentTyping(false), 2000);
    };
    const onRoomError = ({ message }) => {
      console.error('[Battle] room:error received:', message);
      setRoomError(message);
    };

    socket.on('room:state', onRoomState);
    socket.on('room:countdown', onCountdown);
    socket.on('battle:start', onBattleStart);
    socket.on('battle:resume', onResume);
    socket.on('battle:timerSync', onTimerSync);
    socket.on('battle:opponentSubmitted', onOpponentSubmitted);
    socket.on('battle:opponentDisconnected', onOpponentDisconnected);
    socket.on('battle:opponentReconnected', onOpponentReconnected);
    socket.on('battle:end', onBattleEnd);
    socket.on('chat:message', onChatMessage);
    socket.on('battle:opponentTyping', onOpponentTyping);
    socket.on('room:error', onRoomError);

    return () => {
      socket.off('room:state', onRoomState);
      socket.off('room:countdown', onCountdown);
      socket.off('battle:start', onBattleStart);
      socket.off('battle:resume', onResume);
      socket.off('battle:timerSync', onTimerSync);
      socket.off('battle:opponentSubmitted', onOpponentSubmitted);
      socket.off('battle:opponentDisconnected', onOpponentDisconnected);
      socket.off('battle:opponentReconnected', onOpponentReconnected);
      socket.off('battle:end', onBattleEnd);
      socket.off('chat:message', onChatMessage);
      socket.off('battle:opponentTyping', onOpponentTyping);
      socket.off('room:error', onRoomError);
    };
  }, [socket, roomCode]);

  const handleReady = () => socket.emit('room:ready', { roomCode });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang]);
  };

  const handleCodeChange = (value) => {
    setCode(value ?? '');
    socket.emit('battle:typing', { roomCode });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('chat:send', { roomCode, message: chatInput.trim() });
    setChatInput('');
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await runCode({ language, code, input });
      setOutput(res.data);
    } catch (err) {
      setOutput({ status: 'Error', stdout: '', stderr: getErrorMessage(err) });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutput(null);
    try {
      const res = await submitCode({
        language,
        code,
        problemId: problem._id,
        roomCode,
        startedAt: startedAtRef.current,
      });
      setVerdict(res.data);
    } catch (err) {
      setVerdict({ verdict: 'Error', passedCount: 0, totalCount: 0, compileError: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (!socket) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  if (roomError) {
    return (
      <main className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="text-error">{roomError}</p>
        <Link to="/battle" className="mt-4 inline-block text-sm text-accent hover:underline">
          Back to matchmaking
        </Link>
      </main>
    );
  }

  // --- Lobby (waiting for opponent / ready-up) ---
  if (phase === 'waiting') {
    return (
      <main className="animate-fade-in mx-auto max-w-md px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Room {roomCode}</h1>
        <Button variant="secondary" onClick={handleCopyCode} className="mt-3">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? 'Copied' : 'Copy code to invite a friend'}
        </Button>

        <Card className="mt-6 flex flex-col gap-3">
          {players.map((p) => (
            <div key={p.userId} className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {p.username} {p.userId === user._id && '(you)'}
              </span>
              <Badge tone={p.ready ? 'success' : 'muted'}>{p.ready ? 'Ready' : 'Not ready'}</Badge>
            </div>
          ))}
          {players.length < 2 && (
            <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted">
              <Spinner className="size-4" /> Waiting for an opponent to join...
            </p>
          )}
        </Card>

        {players.length === 2 && !self?.ready && (
          <Button onClick={handleReady} className="mt-4 w-full">
            I'm Ready
          </Button>
        )}
      </main>
    );
  }

  // --- Countdown ---
  if (phase === 'countdown') {
    return (
      <main className="animate-fade-in flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted">Battle starting in</p>
        <p className="text-7xl font-extrabold text-accent">{countdown}</p>
      </main>
    );
  }

  // --- Completed ---
  if (phase === 'completed' && result) {
    const you = result.results.find((r) => r.userId === user._id);
    const opp = result.results.find((r) => r.userId !== user._id);
    const youWon = result.winner === user._id;

    return (
      <main className="animate-fade-in mx-auto max-w-md px-6 py-16 text-center">
        <Trophy className={`mx-auto size-10 ${youWon ? 'text-warning' : 'text-muted'}`} />
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          {result.isDraw ? "It's a draw" : youWon ? 'Victory!' : 'Defeat'}
        </h1>

        <Card className="mt-6 flex flex-col gap-3 text-left">
          {[you, opp].map((r) => (
            <div key={r.userId} className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {r.username} {r.userId === user._id && '(you)'}
              </span>
              <span className="text-sm text-muted">
                {r.verdict ?? 'No submission'} · {r.ratingBefore} &rarr;{' '}
                <span className={r.ratingAfter >= r.ratingBefore ? 'text-success' : 'text-error'}>
                  {r.ratingAfter}
                </span>
              </span>
            </div>
          ))}
        </Card>

        <Link
          to="/dashboard"
          className="mt-6 inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
        >
          Back to Dashboard
        </Link>
      </main>
    );
  }

  // --- In progress: the actual battle ---
  if (!problem) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  return (
    <main className="animate-fade-in mx-auto grid max-w-6xl gap-6 px-6 py-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{problem.title}</h1>
            <Badge tone={DIFFICULTY_TONE[problem.difficulty]}>{problem.difficulty}</Badge>
          </div>
          <span className="font-mono text-lg font-semibold text-foreground">{formatMs(remainingMs)}</span>
        </div>

        {/* Opponent status */}
        <Card className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            {opponentOnline ? (
              <Wifi className="size-4 text-success" />
            ) : (
              <WifiOff className="size-4 text-error" />
            )}
            <span className="text-sm font-medium text-foreground">{opponent?.username ?? 'Opponent'}</span>
            {!opponentOnline && <Badge tone="error">Disconnected</Badge>}
          </div>
          {opponentUpdate && (
            <Badge tone={opponentUpdate.verdict === 'Accepted' ? 'success' : 'warning'}>
              {opponentUpdate.verdict} ({opponentUpdate.passedCount}/{opponentUpdate.totalCount})
            </Badge>
          )}
        </Card>

        <Card className="whitespace-pre-wrap text-sm text-foreground">{problem.description}</Card>

        {problem.constraints?.length > 0 && (
          <Card>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Constraints</h2>
            <ul className="list-inside list-disc text-sm text-foreground">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Card>
        )}

        {problem.examples?.map((ex, i) => (
          <Card key={i}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Example {i + 1}</h2>
            <p className="font-mono text-sm text-foreground">
              <span className="text-muted">Input: </span>
              {ex.input}
            </p>
            <p className="font-mono text-sm text-foreground">
              <span className="text-muted">Output: </span>
              {ex.output}
            </p>
          </Card>
        ))}

        {/* Chat */}
        <Card className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">Chat</h2>
          <div className="h-32 overflow-y-auto rounded-lg bg-surface p-2 text-sm">
            {messages.length === 0 && <p className="text-muted">No messages yet.</p>}
            {messages.map((m, i) => (
              <p key={i} className="text-foreground">
                <span className="font-medium">{m.username}:</span> {m.message}
              </p>
            ))}
          </div>
          {opponentTyping && <p className="text-xs text-muted">{opponent?.username} is typing...</p>}
          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Say something..."
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
            />
            <Button type="submit" variant="secondary">
              Send
            </Button>
          </form>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleRun} loading={running}>
              <Play className="size-4" />
              Run
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              <Send className="size-4" />
              Submit
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <Editor
            height="320px"
            language={MONACO_LANGUAGE[language]}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true }}
          />
        </Card>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              Input
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
              placeholder="stdin for Run"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              Output
            </label>
            <div className="h-[84px] overflow-auto rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground">
              {output ? (
                <>
                  <Badge tone={output.status === 'Success' ? 'success' : 'error'}>{output.status}</Badge>
                  <pre className="mt-1 whitespace-pre-wrap">{output.stdout || output.stderr}</pre>
                </>
              ) : (
                <span className="text-muted">Run your code to see output here.</span>
              )}
            </div>
          </div>
        </div>

        {verdict && (
          <Card className={verdict.verdict === 'Accepted' ? 'border-success/40' : 'border-error/40'}>
            <div className="flex items-center justify-between">
              <Badge tone={verdict.verdict === 'Accepted' ? 'success' : 'error'}>{verdict.verdict}</Badge>
              <span className="text-sm text-muted">
                {verdict.passedCount}/{verdict.totalCount} test cases passed
              </span>
            </div>
            {verdict.compileError && (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-error">{verdict.compileError}</pre>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

export default BattleRoom;
