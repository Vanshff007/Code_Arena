import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './useSocket';
import { useAuth } from '../auth/useAuth';
import { EVENTS, normalizeRoomCode, ROOM_CODE_LENGTH } from './battleState';
import { formatClock, formatNumber } from '../../shared/format';
import Button from '../../shared/ui/Button';
import PageHeader, { ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

function FindBattlePage() {
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);
  const [searchStart, setSearchStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    // A socket that never authenticates (expired/invalid token) would
    // otherwise fail silently: emits just queue forever.
    const onConnectError = () => setError('Could not connect to the battle server. Refresh and try again.');
    const onFound = ({ roomCode }) => navigate(`/battle/${roomCode}`);
    const onCreated = ({ roomCode }) => navigate(`/battle/${roomCode}`);
    const onError = ({ message }) => {
      setError(message);
      setSearching(false);
    };

    socket.on('connect_error', onConnectError);
    socket.on(EVENTS.queueFound, onFound);
    socket.on(EVENTS.roomCreated, onCreated);
    socket.on(EVENTS.roomError, onError);
    return () => {
      socket.off('connect_error', onConnectError);
      socket.off(EVENTS.queueFound, onFound);
      socket.off(EVENTS.roomCreated, onCreated);
      socket.off(EVENTS.roomError, onError);
    };
  }, [socket, navigate]);

  // Search timer, so a long wait shows progress instead of a frozen screen.
  useEffect(() => {
    if (!searching) return;
    const id = setInterval(() => setElapsed(Date.now() - searchStart), 1000);
    return () => clearInterval(id);
  }, [searching, searchStart]);

  // Leave the queue if the player navigates away mid-search.
  useEffect(() => {
    if (!searching || !socket) return;
    return () => socket.emit(EVENTS.queueLeave);
  }, [searching, socket]);

  const startMatchmaking = () => {
    setError('');
    setSearchStart(Date.now());
    setElapsed(0);
    setSearching(true);
    socket.emit(EVENTS.queueJoin);
  };

  const cancelMatchmaking = () => setSearching(false);

  const createRoom = () => {
    setError('');
    socket.emit(EVENTS.roomCreate);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    setError('');
    const code = normalizeRoomCode(joinCode);
    if (code.length !== ROOM_CODE_LENGTH) {
      setError(`Room codes are ${ROOM_CODE_LENGTH} characters.`);
      return;
    }
    socket.emit(EVENTS.roomJoin, { roomCode: code });
    navigate(`/battle/${code}`);
  };

  if (!socket) return <PageSpinner label="Connecting to the battle server" />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Battle">
        One problem, fifteen minutes. The first accepted submission wins. If time runs out, more passed test cases
        wins.
      </PageHeader>

      {error && (
        <div className="mt-6">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section className="flex min-h-72 flex-col justify-between border-t-4 border-p1 bg-panel p-6 sm:p-8">
          {searching ? (
            <>
              <div>
                <h2 className="text-lg font-bold">Looking for an opponent</h2>
                <p className="mt-1 text-sm text-muted">You'll be matched with the next player who joins the queue.</p>
              </div>
              <div className="flex items-end justify-between gap-4">
                <span role="timer" aria-label="Time searching" className="font-tight text-7xl font-black leading-none">
                  {formatClock(elapsed)}
                </span>
                <Button variant="secondary" onClick={cancelMatchmaking}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-bold">Quick match</h2>
                <p className="mt-1 max-w-md text-sm text-muted">
                  Play the next available player. A win against a higher-rated opponent earns more points.
                </p>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <p className="text-sm text-muted">
                  Your rating
                  <span className="block font-tight text-5xl font-black leading-none text-p1">
                    {formatNumber(user.rating)}
                  </span>
                </p>
                <Button onClick={startMatchmaking} className="px-6 py-3 text-base">
                  Find a match
                </Button>
              </div>
            </>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="border border-rule bg-panel p-6">
            <h2 className="text-lg font-bold">Play a friend</h2>
            <p className="mt-1 text-sm text-muted">Create a private room and share its code.</p>
            <Button variant="secondary" onClick={createRoom} disabled={searching} className="mt-4">
              Create a room
            </Button>
          </section>

          <section className="border border-rule bg-panel p-6">
            <h2 className="text-lg font-bold">Join with a code</h2>
            <form onSubmit={joinRoom} className="mt-4 flex gap-2">
              <label htmlFor="room-code" className="sr-only">
                Room code
              </label>
              <input
                id="room-code"
                value={joinCode}
                onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
                placeholder="ABC123"
                autoComplete="off"
                spellCheck={false}
                className="w-40 border border-rule bg-paper px-3 py-2 font-tight text-xl font-bold tracking-[0.15em] placeholder:text-muted/50 focus:border-p1 focus:outline-none"
              />
              <Button type="submit" variant="secondary" disabled={searching}>
                Join
              </Button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default FindBattlePage;
