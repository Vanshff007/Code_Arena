import DifficultyMeter from './DifficultyMeter';
import { namedArguments, splitInlineCode } from './statement';

function RichText({ text }) {
  return splitInlineCode(text).map((part, i) =>
    part.code ? (
      <code key={i} className="bg-sunk px-1 py-px font-mono text-[0.9em]">
        {part.text}
      </code>
    ) : (
      <span key={i}>{part.text}</span>
    )
  );
}

function ExampleInput({ signature, input }) {
  const args = namedArguments(signature, input);
  if (!args) return <pre className="whitespace-pre-wrap font-mono text-sm">{input}</pre>;
  return (
    <div className="space-y-0.5 font-mono text-sm">
      {args.map((a) => (
        <p key={a.name} className="whitespace-pre-wrap break-all">
          <span className="text-muted">{a.name} = </span>
          {a.value}
        </p>
      ))}
    </div>
  );
}

// The problem text, shared by practice mode and battles.
function ProblemStatement({ problem, headingLevel = 'h1' }) {
  const Heading = headingLevel;
  return (
    <article className="flex flex-col gap-6">
      <header>
        <Heading className="font-wide text-2xl font-extrabold leading-tight tracking-tight break-words">
          {problem.title}
        </Heading>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <DifficultyMeter difficulty={problem.difficulty} />
          {problem.tags?.length > 0 && <span className="text-sm text-muted">{problem.tags.join(', ')}</span>}
        </div>
      </header>

      <div className="max-w-[68ch] whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
        <RichText text={problem.description} />
      </div>

      {problem.examples?.map((ex, i) => (
        <section key={i}>
          <h2 className="mb-2 text-sm font-bold">{problem.examples.length > 1 ? `Example ${i + 1}` : 'Example'}</h2>
          <div className="grid gap-px border border-rule bg-rule sm:grid-cols-2">
            <div className="bg-panel p-3">
              <p className="mb-1 text-xs text-muted">Input</p>
              <ExampleInput signature={problem.signature} input={ex.input} />
            </div>
            <div className="bg-panel p-3">
              <p className="mb-1 text-xs text-muted">Output</p>
              <pre className="whitespace-pre-wrap break-all font-mono text-sm">{ex.output}</pre>
            </div>
          </div>
          {ex.explanation && <p className="mt-2 text-sm text-muted">{ex.explanation}</p>}
        </section>
      ))}

      {problem.constraints?.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold">Constraints</h2>
          <ul className="space-y-1 font-mono text-sm text-ink">
            {problem.constraints.map((c, i) => (
              <li key={i} className="border-l-2 border-rule pl-3">
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

export default ProblemStatement;
