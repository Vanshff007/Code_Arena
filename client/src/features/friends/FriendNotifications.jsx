import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useSocket } from '../battles/useSocket';
import { EVENTS } from '../battles/battleState';
import { pushToast } from './friends';
import Button from '../../shared/ui/Button';

let nextId = 1;

// App-wide listener for friend events: challenges (with Accept / Decline),
// new requests and accepted requests. Shown on any page while logged in.
function FriendNotifications() {
  const socket = useSocket();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);

  const dismiss = (id) => setToasts((list) => list.filter((t) => t.id !== id));

  useEffect(() => {
    if (!socket) return;
    const add = (toast) => setToasts((list) => pushToast(list, { id: nextId++, ...toast }));

    const onChallenged = (d) => add({ kind: 'challenge', ...d });
    const onRequest = ({ username }) => add({ kind: 'info', text: `${username} sent you a friend request.`, link: '/friends' });
    const onAccepted = ({ username }) => add({ kind: 'info', text: `${username} accepted your friend request.`, link: '/friends' });
    const onSent = ({ roomCode }) => navigate(`/battle/${roomCode}`);
    const onDeclined = ({ by }) => add({ kind: 'info', text: `${by} declined your challenge.` });
    const onError = ({ message }) => add({ kind: 'info', text: message });

    const handlers = {
      [EVENTS.friendChallenged]: onChallenged,
      [EVENTS.friendRequest]: onRequest,
      [EVENTS.friendAccepted]: onAccepted,
      [EVENTS.friendChallengeSent]: onSent,
      [EVENTS.friendChallengeDeclined]: onDeclined,
      [EVENTS.friendChallengeError]: onError,
    };
    for (const [event, fn] of Object.entries(handlers)) socket.on(event, fn);
    return () => {
      for (const [event, fn] of Object.entries(handlers)) socket.off(event, fn);
    };
  }, [socket, navigate]);

  if (!toasts.length) return null;

  const accept = (t) => {
    dismiss(t.id);
    socket.emit(EVENTS.roomJoin, { roomCode: t.roomCode });
    navigate(`/battle/${t.roomCode}`);
  };
  const decline = (t) => {
    dismiss(t.id);
    socket.emit(EVENTS.friendChallengeDecline, { fromId: t.fromId, roomCode: t.roomCode });
  };

  return (
    <div aria-live="polite" className="fixed bottom-4 right-4 z-[60] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="border border-rule border-l-4 border-l-p2 bg-panel p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm">
              {t.kind === 'challenge' ? (
                <>
                  <span className="font-bold text-p2">{t.from}</span> challenges you to a battle.
                </>
              ) : (
                t.text
              )}
            </p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-muted hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
          {t.kind === 'challenge' && (
            <div className="mt-3 flex gap-2">
              <Button onClick={() => accept(t)} className="py-1.5">
                Accept
              </Button>
              <Button variant="ghost" onClick={() => decline(t)} className="py-1.5">
                Decline
              </Button>
            </div>
          )}
          {t.link && (
            <button
              onClick={() => {
                dismiss(t.id);
                navigate(t.link);
              }}
              className="mt-2 text-sm font-semibold text-p1 hover:underline"
            >
              Open friends
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default FriendNotifications;
