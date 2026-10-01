import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';
import { runCode, submitCode } from './executionService';
import {
  LANGUAGES,
  MONACO_LANGUAGE,
  EDITOR_OPTIONS,
  starterFor,
  defaultInputFor,
  defineArenaThemes,
  editorThemeName,
} from './languages';
import { useTheme } from '../../shared/useTheme';
import { getErrorMessage } from '../../shared/getErrorMessage';
import useMediaQuery from '../../shared/useMediaQuery';
import Button from '../../shared/ui/Button';
import Tag from '../../shared/ui/Tag';
import { verdictTone } from '../../shared/ui/verdict';
import VerdictPanel from './VerdictPanel';


const inputHint = (problem) =>
  problem?.signature ? problem.signature.params.map((p) => p.name).join('\n') : 'Input for Run';

// Run result: for function-style problems the returned value comes first,
// then anything the player printed while debugging.
function RunOutput({ output }) {
  const hasResult = output.result !== undefined;
  return (
    <div className="flex flex-col gap-2">
      {hasResult && (
        <div>
          <p className="font-sans text-xs text-muted">Returned</p>
          <pre className="whitespace-pre-wrap font-semibold">{output.result}</pre>
        </div>
      )}
      {output.stdout && (
        <div>
          {hasResult && <p className="font-sans text-xs text-muted">Printed</p>}
          <pre className="whitespace-pre-wrap">{output.stdout}</pre>
        </div>
      )}
      {output.stderr && <pre className="whitespace-pre-wrap text-p2">{output.stderr}</pre>}
      {!hasResult && !output.stdout && !output.stderr && <span className="text-muted">(no output)</span>}
    </div>
  );
}

// Editor, Run, Submit, custom input/output and the verdict - shared by
// practice mode and battles. For function-style problems the editor starts
// from the problem's Solution stub (no headers, no main). `submitExtras`
// adds fields to the submit body (roomCode, startedAt); `onCodeChange`
// (code, language) lets a battle send the typing indicator and replay
// snapshots.
function CodeWorkspace({ problem, submitExtras, onCodeChange, onVerdict, disabled = false }) {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const { isDark } = useTheme();
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(() => starterFor(problem, 'cpp'));
  const [input, setInput] = useState(() => defaultInputFor(problem));
  const [output, setOutput] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // A different problem (e.g. the next battle) starts from a clean editor.
  const problemId = problem?._id;
  useEffect(() => {
    setCode(starterFor(problem, language));
    setInput(defaultInputFor(problem));
    setOutput(null);
    setVerdict(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemId]);

  const changeLanguage = (id) => {
    if (id === language) return;
    // Switching resets to that language's template. Ask first if the
    // player has written anything beyond the starter code.
    if (code.trim() !== starterFor(problem, language).trim() && !window.confirm('Switching language replaces your code. Continue?')) {
      return;
    }
    setLanguage(id);
    setCode(starterFor(problem, id));
    onCodeChange?.(starterFor(problem, id), id);
  };

  const handleChange = (value) => {
    setCode(value ?? '');
    onCodeChange?.(value ?? '', language);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await runCode({ language, code, input, ...(problemId ? { problemId } : {}) });
      setOutput(res.data);
    } catch (err) {
      setOutput({ status: 'Error', stdout: '', stderr: getErrorMessage(err) });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setVerdict(null);
    try {
      const res = await submitCode({ language, code, problemId, ...submitExtras?.() });
      setVerdict(res.data);
      onVerdict?.(res.data);
    } catch (err) {
      setVerdict({ verdict: 'Error', passedCount: 0, totalCount: 0, compileError: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Language" className="flex border border-rule bg-panel p-0.5">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              role="radio"
              aria-checked={language === l.id}
              onClick={() => changeLanguage(l.id)}
              className={`px-3 py-1.5 text-sm font-semibold ${
                language === l.id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleRun} loading={running} disabled={disabled}>
            {!running && <Play className="size-4" />}
            Run
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={disabled}>
            Submit
          </Button>
        </div>
      </div>

      <div className="overflow-hidden border border-rule">
        <Editor
          height={isMobile ? '280px' : '420px'}
          language={MONACO_LANGUAGE[language]}
          value={code}
          onChange={handleChange}
          beforeMount={defineArenaThemes}
          theme={editorThemeName(isDark)}
          options={{ ...EDITOR_OPTIONS, readOnly: disabled }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Custom input</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            spellCheck={false}
            placeholder={inputHint(problem)}
            className="resize-y border border-rule bg-panel px-3 py-2 font-mono text-sm text-ink focus:border-p1 focus:outline-none"
          />
          {problem?.signature && (
            <span className="text-xs text-muted">
              One value per line: {problem.signature.params.map((p) => p.name).join(', ')}
            </span>
          )}
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center justify-between text-sm font-medium">
            Output
            {output && <Tag tone={verdictTone(output.status)}>{output.status}</Tag>}
          </span>
          <div
            aria-live="polite"
            className="h-[132px] overflow-auto bg-sunk px-3 py-2 font-mono text-sm text-ink"
          >
            {output ? <RunOutput output={output} /> : <span className="text-muted">Run your code to see output here.</span>}
          </div>
        </div>
      </div>

      <VerdictPanel verdict={verdict} />
    </div>
  );
}

export default CodeWorkspace;
