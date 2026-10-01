import Panel from '../../shared/ui/Panel';

// Shared frame for log in / create account: the form on the left, and on
// wide screens a short reminder of what a battle is on the right.
function AuthLayout({ title, intro, children, footer }) {
  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,26rem)_1fr] md:py-20">
      <div>
        <h1 className="font-wide text-4xl font-extrabold leading-none tracking-tight">{title}</h1>
        <p className="mt-3 text-[15px] text-muted">{intro}</p>
        <Panel className="mt-8 overflow-hidden">
          <div aria-hidden className="flex h-1">
            <span className="flex-1 bg-p1" />
            <span className="flex-1 bg-p2" />
          </div>
          <div className="p-6">{children}</div>
        </Panel>
        <p className="mt-6 text-sm text-muted">{footer}</p>
      </div>

      <aside className="hidden self-center border-l border-rule pl-12 md:block">
        <p className="font-tight text-[7rem] font-black leading-[0.85] text-ink">
          15<span className="text-muted">:00</span>
        </p>
        <p className="mt-4 max-w-xs text-[15px] text-muted">
          Every battle is one problem and fifteen minutes. The first accepted answer takes the rating points.
        </p>
      </aside>
    </main>
  );
}

export default AuthLayout;
