import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFriends, sendFriendRequest, acceptFriendRequest, removeFriendRequest, removeFriend } from './friendsService';
import { friendStatus } from './friends';
import { useSocket } from '../battles/useSocket';
import { EVENTS } from '../battles/battleState';
import { getErrorMessage } from '../../shared/getErrorMessage';
import { formatNumber } from '../../shared/format';
import Button from '../../shared/ui/Button';
import PageHeader, { SectionTitle, EmptyState, ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

const STATUS_STYLE = {
  online: 'bg-ok',
  'in a battle': 'bg-warn',
  offline: 'bg-muted/40',
};

function FriendsPage() {
  const socket = useSocket();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    getFriends()
      .then((res) => setData(res.data))
      .catch(() => setError('Could not load your friends. Refresh to try again.'));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Live updates: a new request or an accepted one refreshes the lists.
  useEffect(() => {
    if (!socket) return;
    socket.on(EVENTS.friendRequest, load);
    socket.on(EVENTS.friendAccepted, load);
    return () => {
      socket.off(EVENTS.friendRequest, load);
      socket.off(EVENTS.friendAccepted, load);
    };
  }, [socket, load]);

  const run = async (action) => {
    setBusy(true);
    setNotice('');
    try {
      const res = await action();
      if (res?.message) setNotice(res.message);
      load();
    } catch (err) {
      setNotice(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const add = (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    run(async () => {
      const res = await sendFriendRequest(name);
      setUsername('');
      return res;
    });
  };

  const challenge = (userId) => {
    setNotice('');
    socket?.emit(EVENTS.friendChallenge, { userId });
  };

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{error}</ErrorNote>
      </main>
    );
  }
  if (!data) return <PageSpinner label="Loading friends" />;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader title="Friends">
        Add players by username. When a friend is online, challenge them straight to a private battle.
      </PageHeader>

      <form onSubmit={add} className="mt-6 flex max-w-md gap-2">
        <label htmlFor="friend-name" className="sr-only">
          Username
        </label>
        <input
          id="friend-name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="off"
          className="min-w-0 flex-1 border border-rule bg-panel px-3 py-2 text-sm focus:border-p1 focus:outline-none"
        />
        <Button type="submit" loading={busy}>
          Add friend
        </Button>
      </form>
      {notice && (
        <p role="status" className="mt-3 text-sm text-muted">
          {notice}
        </p>
      )}

      {data.incoming.length > 0 && (
        <>
          <SectionTitle>Requests for you</SectionTitle>
          <ul className="divide-y divide-rule border-y border-rule">
            {data.incoming.map((r) => (
              <li key={r.requestId} className="flex flex-wrap items-center gap-3 py-3">
                <Link to={`/profile/${r.username}`} className="flex-1 font-semibold hover:text-p1">
                  {r.username}
                </Link>
                <Button onClick={() => run(() => acceptFriendRequest(r.requestId))} disabled={busy}>
                  Accept
                </Button>
                <Button variant="ghost" onClick={() => run(() => removeFriendRequest(r.requestId))} disabled={busy}>
                  Decline
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionTitle>Your friends</SectionTitle>
      {data.friends.length === 0 ? (
        <EmptyState title="No friends yet">Add someone above, or find players on the rankings page.</EmptyState>
      ) : (
        <ul className="divide-y divide-rule border-y border-rule">
          {data.friends.map((f) => {
            const status = friendStatus(f);
            return (
              <li key={f.userId} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span aria-hidden className={`size-2.5 shrink-0 ${STATUS_STYLE[status]}`} />
                <Link to={`/profile/${f.username}`} className="font-semibold hover:text-p1">
                  {f.username}
                </Link>
                <span className="font-tight text-base font-semibold text-muted">{formatNumber(f.rating)}</span>
                <span className="flex-1 text-sm text-muted">{status}</span>
                <Button onClick={() => challenge(f.userId)} disabled={status !== 'online'}>
                  Challenge
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm(`Remove ${f.username} from your friends?`)) run(() => removeFriend(f.userId));
                  }}
                >
                  Remove
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {data.outgoing.length > 0 && (
        <>
          <SectionTitle>Waiting for an answer</SectionTitle>
          <ul className="divide-y divide-rule border-y border-rule">
            {data.outgoing.map((r) => (
              <li key={r.requestId} className="flex items-center gap-3 py-3">
                <span className="flex-1">{r.username}</span>
                <Button variant="ghost" onClick={() => run(() => removeFriendRequest(r.requestId))} disabled={busy}>
                  Cancel
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default FriendsPage;
