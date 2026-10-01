import { useState } from 'react';
import { connectLeetCode, disconnectLeetCode, syncLeetCode } from './leetcodeService';
import { isValidLeetCodeUsername } from './leetcode';
import { getErrorMessage } from '../../shared/getErrorMessage';
import { formatDate, formatNumber } from '../../shared/format';
import Button from '../../shared/ui/Button';
import { ErrorNote } from '../../shared/ui/PageHeader';
import LeetCodeDetails from './LeetCodeDetails';

// LeetCode link on a profile. Owners can connect, sync and disconnect;
// everyone else sees the stats read-only.
function LeetCodePanel({ leetcode, isOwner, onChanged }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (action, fallback) => {
    setBusy(true);
    setError('');
    try {
      await action();
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const handleConnect = (e) => {
    e.preventDefault();
    const name = input.trim();
    if (!isValidLeetCodeUsername(name)) {
      setError('LeetCode usernames use letters, numbers, hyphens and underscores.');
      return;
    }
    run(async () => {
      await connectLeetCode(name);
      await syncLeetCode();
      setInput('');
    }, 'Could not connect that LeetCode account.');
  };

  const stats = leetcode?.stats;

  return (
    <section className="border border-rule bg-panel p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-lg font-bold">LeetCode</h2>
        {leetcode?.username && <span className="text-sm text-muted">@{leetcode.username}</span>}
      </div>

      {leetcode?.username ? (
        <>
          {stats && (
            <dl className="mt-4 grid grid-cols-4 gap-4">
              {[
                ['Solved', stats.totalSolved, 'text-ink'],
                ['Easy', stats.easySolved, 'text-ok'],
                ['Medium', stats.mediumSolved, 'text-warn'],
                ['Hard', stats.hardSolved, 'text-p2'],
              ].map(([label, value, color]) => (
                <div key={label}>
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className={`font-tight text-3xl font-black ${color}`}>{formatNumber(value)}</dd>
                </div>
              ))}
            </dl>
          )}
          <LeetCodeDetails leetcode={leetcode} />
          {leetcode.lastSyncedAt && <p className="mt-3 text-xs text-muted">Last synced {formatDate(leetcode.lastSyncedAt)}</p>}
          {isOwner && (
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" onClick={() => run(syncLeetCode, 'Sync failed. LeetCode may be unreachable right now.')} loading={busy}>
                Sync now
              </Button>
              <Button variant="ghost" onClick={() => run(disconnectLeetCode, 'Could not disconnect.')} disabled={busy}>
                Disconnect
              </Button>
            </div>
          )}
        </>
      ) : isOwner ? (
        <>
          <p className="mt-2 text-sm text-muted">
            Link your public LeetCode profile to seed your skill profile from problems you've already solved.
          </p>
          <form onSubmit={handleConnect} className="mt-4 flex gap-2">
            <label htmlFor="lc-username" className="sr-only">
              LeetCode username
            </label>
            <input
              id="lc-username"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="LeetCode username"
              className="min-w-0 flex-1 border border-rule bg-paper px-3 py-2 text-sm focus:border-p1 focus:outline-none"
            />
            <Button type="submit" loading={busy}>
              Connect
            </Button>
          </form>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">No LeetCode account linked.</p>
      )}

      {error && (
        <div className="mt-4">
          <ErrorNote>{error}</ErrorNote>
        </div>
      )}
    </section>
  );
}

export default LeetCodePanel;
