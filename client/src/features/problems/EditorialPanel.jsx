import { useState } from 'react';
import { getEditorial } from './problemService';
import { editorialLanguages } from './statement';
import { LANGUAGES } from '../execution/languages';
import CodeView from '../execution/CodeView';
import { getErrorMessage } from '../../shared/getErrorMessage';
import Button from '../../shared/ui/Button';
import { ErrorNote } from '../../shared/ui/PageHeader';

// The approach and reference solutions for a problem. Hidden behind a
// button: in practice, opening it lowers the points for solving this
// problem (`warn`); after a battle it is free to read.
function EditorialPanel({ problemId, warn = false }) {
  const [state, setState] = useState({ status: 'closed' });
  const [language, setLanguage] = useState(null);

  const open = async () => {
    if (warn && !window.confirm('Reading the editorial lowers the points you can earn on this problem. Open it?')) return;
    setState({ status: 'loading' });
    try {
      const res = await getEditorial(problemId);
      const langs = editorialLanguages(res.data.editorial);
      setLanguage(langs[0] ?? null);
      setState({ status: 'open', editorial: res.data.editorial });
    } catch (err) {
      setState({ status: 'error', message: getErrorMessage(err, 'Could not load the editorial.') });
    }
  };

  if (state.status === 'closed' || state.status === 'loading') {
    return (
      <Button variant="secondary" onClick={open} loading={state.status === 'loading'}>
        Show editorial
      </Button>
    );
  }
  if (state.status === 'error') return <ErrorNote>{state.message}</ErrorNote>;

  const { editorial } = state;
  const langs = editorialLanguages(editorial);
  return (
    <section className="flex flex-col gap-4 border-t-4 border-ink bg-panel p-5">
      <h2 className="text-lg font-bold">Editorial</h2>
      {editorial.approach && <p className="max-w-[68ch] whitespace-pre-wrap text-[15px] leading-relaxed">{editorial.approach}</p>}
      {langs.length > 0 && (
        <div className="flex flex-col gap-2">
          <div role="tablist" aria-label="Solution language" className="flex self-start border border-rule p-0.5">
            {langs.map((id) => (
              <button
                key={id}
                role="tab"
                aria-selected={language === id}
                onClick={() => setLanguage(id)}
                className={`px-3 py-1.5 text-sm font-semibold ${language === id ? 'bg-ink text-paper' : 'text-muted hover:text-ink'}`}
              >
                {LANGUAGES.find((l) => l.id === id)?.label ?? id}
              </button>
            ))}
          </div>
          <CodeView code={editorial.solutions[language]} language={language} height="300px" />
        </div>
      )}
    </section>
  );
}

export default EditorialPanel;
