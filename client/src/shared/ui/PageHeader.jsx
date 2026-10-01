// Standard page opening: a wide, heavy title and one line of context.
// `aside` sits on the right on wide screens (a primary action or a number).
function PageHeader({ title, children, aside }) {
  return (
    <header className="flex flex-col gap-4 border-b border-rule pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-wide text-3xl font-extrabold leading-none tracking-tight text-ink sm:text-4xl">{title}</h1>
        {children && <p className="mt-3 max-w-xl text-[15px] text-muted">{children}</p>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}

// Section heading inside a page.
export function SectionTitle({ children, aside }) {
  return (
    <div className="mb-3 mt-10 flex items-baseline justify-between gap-4">
      <h2 className="text-lg font-bold text-ink">{children}</h2>
      {aside}
    </div>
  );
}

// An empty list is a prompt to act, not a mood.
export function EmptyState({ title, children, action }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-[var(--radius-ctl)] border border-dashed border-rule px-5 py-8">
      <p className="font-semibold text-ink">{title}</p>
      {children && <p className="text-sm text-muted">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children }) {
  return (
    <p role="alert" className="border-l-2 border-p2 bg-p2/5 px-3 py-2 text-sm text-p2">
      {children}
    </p>
  );
}

export default PageHeader;
