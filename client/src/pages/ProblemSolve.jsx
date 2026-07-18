import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send } from 'lucide-react';
import { getProblemById } from '../services/problemService';
import { runCode, submitCode } from '../services/executionService';
import { STARTER_CODE, MONACO_LANGUAGE, DIFFICULTY_TONE } from '../utils/starterCode';
import { getErrorMessage } from '../utils/getErrorMessage';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

function ProblemSolve() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(STARTER_CODE.cpp);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null); // { status, stdout, stderr }
  const [verdict, setVerdict] = useState(null); // submit result
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getProblemById(id)
      .then((res) => setProblem(res.data.problem))
      .catch(() => setLoadError('Failed to load problem.'));
  }, [id]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(STARTER_CODE[lang]);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    setVerdict(null);
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
    setVerdict(null);
    try {
      const res = await submitCode({ language, code, problemId: id });
      setVerdict(res.data);
    } catch (err) {
      setVerdict({ verdict: 'Error', passedCount: 0, totalCount: 0, compileError: getErrorMessage(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return <main className="mx-auto max-w-md px-6 py-24 text-center text-error">{loadError}</main>;
  }

  if (!problem) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <Spinner className="size-6 text-accent" />
      </div>
    );
  }

  return (
    <main className="animate-fade-in mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
      {/* Problem description */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">{problem.title}</h1>
          <Badge tone={DIFFICULTY_TONE[problem.difficulty]}>{problem.difficulty}</Badge>
        </div>

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
            {ex.explanation && <p className="mt-1 text-sm text-muted">{ex.explanation}</p>}
          </Card>
        ))}
      </div>

      {/* Editor + run/submit */}
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
            height="360px"
            language={MONACO_LANGUAGE[language]}
            value={code}
            onChange={(value) => setCode(value ?? '')}
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
              rows={4}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
              placeholder="stdin for Run"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              Output
            </label>
            <div className="h-[104px] overflow-auto rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground">
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
            {verdict.failedCase?.input && (
              <div className="mt-2 space-y-0.5 font-mono text-xs text-muted">
                <p>Input: {verdict.failedCase.input}</p>
                <p>Expected: {verdict.failedCase.expectedOutput}</p>
                <p>Got: {verdict.failedCase.actualOutput}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

export default ProblemSolve;
