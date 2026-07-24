import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Users, Shuffle } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

function FindBattle() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [searching, setSearching] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Connection-stage visibility - a socket that never authenticates
    // (expired/invalid token) fails silently otherwise: emits just queue
    // forever with no error surfaced anywhere.
    const onConnect = () => console.log('[Matchmaking] Socket connected:', socket.id);
    const onConnectError = (err) => console.error('[Matchmaking] Socket connect_error:', err.message);

    const onWaiting = () => console.log('[Matchmaking] matchmaking:waiting received - in queue');
    const onFound = ({ roomCode }) => {
      console.log('[Matchmaking] matchmaking:found received, room:', roomCode);
      navigate(`/battle/${roomCode}`);
    };
    const onCreated = ({ roomCode }) => {
      console.log('[Matchmaking] room:created received, room:', roomCode);
      navigate(`/battle/${roomCode}`);
    };
    const onError = ({ message }) => {
      console.error('[Matchmaking] room:error received:', message);
      setError(message);
      setSearching(false);
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('matchmaking:waiting', onWaiting);
    socket.on('matchmaking:found', onFound);
    socket.on('room:created', onCreated);
    socket.on('room:error', onError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('matchmaking:waiting', onWaiting);
      socket.off('matchmaking:found', onFound);
      socket.off('room:created', onCreated);
      socket.off('room:error', onError);
    };
  }, [socket, navigate]);

  const startMatchmaking = () => {
    console.log('[Matchmaking] Find match button clicked - emitting matchmaking:join');
    setError('');
    setSearching(true);
    socket.emit('matchmaking:join');
  };

  const cancelMatchmaking = () => {
    socket.emit('matchmaking:leave');
    setSearching(false);
  };

  const createRoom = () => {
    setError('');
    socket.emit('room:create');
  };

  const joinRoom = (e) => {
    e.preventDefault();
    setError('');
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    socket.emit('room:join', { roomCode: code });
    navigate(`/battle/${code}`);
  };

  if (!socket) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  return (
    <main className="animate-fade-in mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground">Start a Battle</h1>
      <p className="mt-1 text-sm text-muted">
        Same problem, same time limit - first correct submission wins.
      </p>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      {searching ? (
        <Card className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
          <Spinner className="size-6 text-accent" />
          <p className="text-sm text-foreground">Searching for an opponent...</p>
          <Button variant="secondary" onClick={cancelMatchmaking}>
            Cancel
          </Button>
        </Card>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <Card hover className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Shuffle className="size-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">Random Matchmaking</p>
                <p className="text-sm text-muted">Get paired with the next available player</p>
              </div>
            </div>
            <Button onClick={startMatchmaking}>Find match</Button>
          </Card>

          <Card hover className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Swords className="size-5 shrink-0 text-accent" />
              <div>
                <p className="font-medium text-foreground">Create Room</p>
                <p className="text-sm text-muted">Get a code to invite a friend</p>
              </div>
            </div>
            <Button variant="secondary" onClick={createRoom}>
              Create
            </Button>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <Users className="size-5 shrink-0 text-accent" />
              <p className="font-medium text-foreground">Join Room</p>
            </div>
            <form onSubmit={joinRoom} className="mt-3 flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Room code"
                maxLength={6}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm uppercase tracking-widest text-foreground focus:border-accent focus:outline-none"
              />
              <Button type="submit" variant="secondary">
                Join
              </Button>
            </form>
          </Card>
        </div>
      )}
    </main>
  );
}

export default FindBattle;
