import Tag from '../../shared/ui/Tag';
import { verdictTone } from '../../shared/ui/verdict';
import Pips from '../../shared/ui/Pips';

// Result of a Submit. Shows only what the server returned: the failing
// case details exist only for public test cases, never hidden ones.
function VerdictPanel({ verdict }) {
  if (!verdict) return null;
  const accepted = verdict.verdict === 'Accepted';

  return (
    <section
      aria-live="polite"
      className={`border-l-4 bg-panel px-4 py-4 ${accepted ? 'border-ok' : 'border-p2'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tag tone={verdictTone(verdict.verdict)} className="text-base">
          {verdict.verdict}
        </Tag>
        {verdict.totalCount > 0 && (
          <div className="flex items-center gap-3">
            <Pips passed={verdict.passedCount} total={verdict.totalCount} color={accepted ? 'bg-ok' : 'bg-warn'} />
            <span className="font-tight text-sm font-semibold text-muted">
              {verdict.passedCount}/{verdict.totalCount}
            </span>
          </div>
        )}
      </div>

      {(verdict.runtimeMs != null || verdict.memoryKb != null) && accepted && (
        <p className="mt-2 text-sm text-muted">
          {verdict.runtimeMs != null && <>Ran in {verdict.runtimeMs} ms</>}
          {verdict.runtimeMs != null && verdict.memoryKb != null && ', '}
          {verdict.memoryKb != null && <>{Math.round(verdict.memoryKb / 1024)} MB peak memory</>}
        </p>
      )}

      {verdict.compileError && (
        <pre className="mt-3 max-h-48 overflow-auto bg-sunk p-3 font-mono text-xs text-p2">{verdict.compileError}</pre>
      )}

      {verdict.failedCase?.input && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
          <dt className="text-muted">Input</dt>
          <dd className="whitespace-pre-wrap text-ink">{verdict.failedCase.input}</dd>
          <dt className="text-muted">Expected</dt>
          <dd className="whitespace-pre-wrap text-ok">{verdict.failedCase.expectedOutput}</dd>
          <dt className="text-muted">Your output</dt>
          <dd className="whitespace-pre-wrap text-p2">{verdict.failedCase.actualOutput || '(nothing returned)'}</dd>
          {verdict.failedCase.stdout && (
            <>
              <dt className="text-muted">Printed</dt>
              <dd className="whitespace-pre-wrap text-ink">{verdict.failedCase.stdout}</dd>
            </>
          )}
        </dl>
      )}
      {verdict.failedCase?.stderr && (
        <pre className="mt-3 max-h-48 overflow-auto bg-sunk p-3 font-mono text-xs text-p2">{verdict.failedCase.stderr}</pre>
      )}
      {verdict.failedCase && !verdict.failedCase.input && !accepted && (
        <p className="mt-2 text-sm text-muted">A hidden test case failed. Check edge cases and limits.</p>
      )}

      {verdict.scoreAwarded != null && (
        <p className="mt-3 text-sm text-ink">
          <span className="font-tight text-lg font-bold text-p1">+{verdict.scoreAwarded}</span> points
          {verdict.xpAwarded?.length > 0 && (
            <span className="text-muted">, {verdict.xpAwarded.map((x) => `+${x.xpGained} ${x.topic} XP`).join(', ')}</span>
          )}
        </p>
      )}

      {verdict.coaching?.length > 0 && (
        <div className="mt-3 space-y-1 border-t border-rule pt-3 text-sm text-muted">
          {verdict.coaching.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
    </section>
  );
}

export default VerdictPanel;
