import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { getProblemForEdit, checkProblem, createProblem, updateProblem } from './adminService';
import {
  SIGNATURE_TYPES,
  emptyDraft,
  emptyCase,
  emptyParam,
  draftFromProblem,
  validateDraft,
  buildPayload,
  isFunctionStyle,
} from './problemForm';
import { LANGUAGES } from '../execution/languages';
import VerdictPanel from '../execution/VerdictPanel';
import { getErrorMessage } from '../../shared/getErrorMessage';
import Button from '../../shared/ui/Button';
import Field from '../../shared/ui/Field';
import PageHeader, { SectionTitle, ErrorNote } from '../../shared/ui/PageHeader';
import { PageSpinner } from '../../shared/ui/Spinner';

// Width is set per use: full width in forms, fixed in the parameter rows.
const controlClass = 'border border-rule bg-panel px-3 py-2 text-sm text-ink focus:border-p1 focus:outline-none';
const inputClass = `w-full ${controlClass}`;
const monoClass = `${inputClass} font-mono`;

function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
      {children}
    </label>
  );
}

// Editable list of { input, output } (and optional explanation) cases.
function CaseList({ label, cases, onChange, withExplanation = false, hint }) {
  const update = (i, key, value) => onChange(cases.map((c, j) => (j === i ? { ...c, [key]: value } : c)));
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-medium">{label}</legend>
      {hint && <p className="text-xs text-muted">{hint}</p>}
      {cases.map((c, i) => (
        <div key={i} className="grid gap-2 border border-rule bg-sunk/40 p-3 sm:grid-cols-[1fr_1fr_auto]">
          <textarea
            aria-label={`${label} ${i + 1} input`}
            value={c.input}
            onChange={(e) => update(i, 'input', e.target.value)}
            rows={3}
            placeholder="Input"
            spellCheck={false}
            className={monoClass}
          />
          <textarea
            aria-label={`${label} ${i + 1} expected output`}
            value={c.output}
            onChange={(e) => update(i, 'output', e.target.value)}
            rows={3}
            placeholder="Expected output"
            spellCheck={false}
            className={monoClass}
          />
          <button
            type="button"
            onClick={() => onChange(cases.filter((_, j) => j !== i))}
            className="self-start p-2 text-muted hover:text-p2"
            aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
          >
            <X className="size-4" />
          </button>
          {withExplanation && (
            <input
              aria-label={`${label} ${i + 1} explanation`}
              value={c.explanation}
              onChange={(e) => update(i, 'explanation', e.target.value)}
              placeholder="Explanation (optional)"
              className={`${inputClass} sm:col-span-2`}
            />
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        className="self-start"
        onClick={() => onChange([...cases, withExplanation ? { ...emptyCase(), explanation: '' } : emptyCase()])}
      >
        <Plus className="size-4" /> Add
      </Button>
    </fieldset>
  );
}

// Create (no :id) or edit a problem. Saving runs the reference solution
// against every test case on the server; it must pass.
function AdminProblemEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(isEdit ? null : emptyDraft());
  const [hiddenCount, setHiddenCount] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [errors, setErrors] = useState([]);
  const [check, setCheck] = useState(null);
  const [busy, setBusy] = useState(null); // 'check' | 'save'
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    getProblemForEdit(id)
      .then((res) => {
        setForm(draftFromProblem(res.data.problem));
        setHiddenCount(res.data.hiddenCount);
      })
      .catch(() => setLoadError('Could not load this problem.'));
  }, [id, isEdit]);

  if (loadError) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ErrorNote>{loadError}</ErrorNote>
      </main>
    );
  }
  if (!form) return <PageSpinner label="Loading problem" />;

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const setField = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const setParam = (i, key, value) => set('params')(form.params.map((p, j) => (j === i ? { ...p, [key]: value } : p)));

  const runCheck = async () => {
    const problems = validateDraft(form, { isEdit });
    setErrors(problems);
    if (problems.length) return;
    setBusy('check');
    setCheck(null);
    try {
      const payload = buildPayload(form, { isEdit });
      const res = await checkProblem({
        problem: payload,
        referenceSolution: payload.referenceSolution,
        ...(isEdit ? { problemId: id } : {}),
      });
      setCheck(res.data.check);
    } catch (err) {
      setCheck({ verdict: 'Error', passedCount: 0, totalCount: 0, compileError: getErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const problems = validateDraft(form, { isEdit });
    setErrors(problems);
    if (problems.length) return;
    setBusy('save');
    setSaveError('');
    try {
      const payload = buildPayload(form, { isEdit });
      if (isEdit) await updateProblem(id, payload);
      else await createProblem(payload);
      navigate('/admin/problems');
    } catch (err) {
      const data = err.response?.data;
      if (data?.data?.check) setCheck(data.data.check);
      setSaveError(getErrorMessage(err, 'Could not save the problem.'));
      setBusy(null);
    }
  };

  const functionStyle = isFunctionStyle(form);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/admin/problems" className="text-sm text-muted hover:text-ink">
        Problems
      </Link>
      <PageHeader title={isEdit ? `Edit: ${form.title || 'problem'}` : 'New problem'} />

      <form onSubmit={save} noValidate className="mt-6 flex max-w-4xl flex-col gap-2">
        <SectionTitle>Basics</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <Field label="Title" name="title" value={form.title} onChange={setField} />
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <select id="difficulty" name="difficulty" value={form.difficulty} onChange={setField} className={inputClass}>
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
        <Field label="Tags" name="tags" value={form.tags} onChange={setField} hint="Comma-separated, e.g. arrays, hashing" />
        <div>
          <Label htmlFor="description">Description</Label>
          <textarea id="description" name="description" value={form.description} onChange={setField} rows={7} className={inputClass} />
          <p className="mt-1 text-xs text-muted">Wrap code in backticks: `nums`.</p>
        </div>
        <div>
          <Label htmlFor="constraints">Constraints</Label>
          <textarea id="constraints" name="constraints" value={form.constraints} onChange={setField} rows={3} className={monoClass} />
          <p className="mt-1 text-xs text-muted">One per line.</p>
        </div>

        <SectionTitle>Function</SectionTitle>
        <p className="text-sm text-muted">
          Players write a method with this signature; inputs are one JSON value per parameter per line (see the
          examples). Leave the name empty for a full-program problem that reads stdin.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Function name" name="functionName" value={form.functionName} onChange={setField} placeholder="twoSum" />
          <div>
            <Label htmlFor="returnType">Returns</Label>
            <select id="returnType" name="returnType" value={form.returnType} onChange={setField} disabled={!functionStyle} className={inputClass}>
              {SIGNATURE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        {functionStyle && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Parameters, in order</legend>
            {form.params.map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  aria-label={`Parameter ${i + 1} name`}
                  value={p.name}
                  onChange={(e) => setParam(i, 'name', e.target.value)}
                  placeholder="name"
                  className={`${controlClass} min-w-0 flex-1 font-mono`}
                />
                <select
                  aria-label={`Parameter ${i + 1} type`}
                  value={p.type}
                  onChange={(e) => setParam(i, 'type', e.target.value)}
                  className={`${controlClass} w-44 shrink-0`}
                >
                  {SIGNATURE_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => set('params')(form.params.filter((_, j) => j !== i))}
                  disabled={form.params.length === 1}
                  className="p-2 text-muted hover:text-p2 disabled:opacity-30"
                  aria-label={`Remove parameter ${i + 1}`}
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="ghost" className="self-start" onClick={() => set('params')([...form.params, emptyParam()])}>
              <Plus className="size-4" /> Add parameter
            </Button>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.outputOrder === 'any'}
                onChange={(e) => set('outputOrder')(e.target.checked ? 'any' : 'exact')}
              />
              Accept the returned lists in any order (e.g. 3Sum)
            </label>
          </fieldset>
        )}

        <SectionTitle>Examples and test cases</SectionTitle>
        <CaseList
          label="Example"
          cases={form.examples}
          onChange={set('examples')}
          withExplanation
          hint={functionStyle ? `Input: ${form.params.length} line(s), e.g. [2,7,11,15] then 9. Output: the returned value as JSON.` : undefined}
        />
        <CaseList label="Public test case" cases={form.publicTestCases} onChange={set('publicTestCases')} />
        {isEdit && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.keepHidden} onChange={(e) => set('keepHidden')(e.target.checked)} />
            Keep the {hiddenCount} existing hidden test case{hiddenCount === 1 ? '' : 's'} (their content is never shown)
          </label>
        )}
        {!(isEdit && form.keepHidden) && (
          <CaseList label="Hidden test case" cases={form.hiddenTestCases} onChange={set('hiddenTestCases')} />
        )}

        <SectionTitle>Editorial</SectionTitle>
        <div>
          <Label htmlFor="approach">Approach</Label>
          <textarea id="approach" name="approach" value={form.approach} onChange={setField} rows={4} className={inputClass} />
        </div>
        {LANGUAGES.map((l) => (
          <div key={l.id}>
            <Label htmlFor={`sol-${l.id}`}>{l.label} solution (optional)</Label>
            <textarea
              id={`sol-${l.id}`}
              value={form.solutions[l.id]}
              onChange={(e) => set('solutions')({ ...form.solutions, [l.id]: e.target.value })}
              rows={5}
              spellCheck={false}
              className={monoClass}
            />
          </div>
        ))}

        <SectionTitle>Reference solution</SectionTitle>
        <p className="text-sm text-muted">
          A correct solution. It runs against every test case when you check or save; saving is refused if it fails.
        </p>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => set('refLanguage')(l.id)}
              aria-pressed={form.refLanguage === l.id}
              className={`border px-3 py-1.5 text-sm font-semibold ${form.refLanguage === l.id ? 'border-ink bg-ink text-paper' : 'border-rule text-muted hover:text-ink'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <textarea
          aria-label="Reference solution code"
          value={form.refCode}
          onChange={setField}
          name="refCode"
          rows={10}
          spellCheck={false}
          placeholder={functionStyle ? 'class Solution:\n    def ...' : 'Full program reading stdin'}
          className={monoClass}
        />

        {errors.length > 0 && (
          <div className="mt-4">
            <ErrorNote>
              {errors.map((e) => (
                <span key={e} className="block">
                  {e}
                </span>
              ))}
            </ErrorNote>
          </div>
        )}
        {check && (
          <div className="mt-4">
            <VerdictPanel verdict={check} />
          </div>
        )}
        {saveError && (
          <div className="mt-4">
            <ErrorNote>{saveError}</ErrorNote>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={runCheck} loading={busy === 'check'} disabled={busy === 'save'}>
            Check solution
          </Button>
          <Button type="submit" loading={busy === 'save'} disabled={busy === 'check'}>
            {isEdit ? 'Save changes' : 'Create problem'}
          </Button>
        </div>
      </form>
    </main>
  );
}

export default AdminProblemEditor;
