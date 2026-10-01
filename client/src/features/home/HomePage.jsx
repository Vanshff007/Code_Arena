import { useAuth } from '../auth/useAuth';
import { ButtonLink } from '../../shared/ui/Button';
import DuelDemo from './DuelDemo';

// A real sequence, so it is numbered.
const STEPS = [
  ['Get matched', 'Quick match pairs you with the next player in the queue, or invite a friend with a room code.'],
  ['Ready up', 'Both players confirm. A five-second countdown starts the battle.'],
  ['Solve', 'You both get the same problem and fifteen minutes. Run your code as often as you like.'],
  ['Submit', 'The first accepted submission wins. If time runs out, more passed test cases wins.'],
  ['Rating moves', 'Ratings update with ELO. Beating a stronger player earns more.'],
];

function HomePage() {
  const { user } = useAuth();

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-12">
        <DuelDemo />

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <h1 className="font-wide text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
            Two players.
            <br />
            One problem.
            <br />
            First accepted answer wins.
          </h1>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            {user ? (
              <>
                <ButtonLink to="/battle" className="px-6 py-3 text-base">
                  Find a match
                </ButtonLink>
                <ButtonLink to="/dashboard" variant="secondary" className="px-6 py-3 text-base">
                  Go to dashboard
                </ButtonLink>
              </>
            ) : (
              <>
                <ButtonLink to="/register" className="px-6 py-3 text-base">
                  Create an account
                </ButtonLink>
                <ButtonLink to="/login" variant="secondary" className="px-6 py-3 text-base">
                  Log in
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
        <h2 className="font-wide text-2xl font-extrabold">How a battle runs</h2>
        <ol className="mt-6 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="bg-panel p-5">
              <span className="font-tight text-4xl font-black text-muted">{i + 1}</span>
              <h3 className="mt-2 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-3">
        <div>
          <h2 className="font-wide text-2xl font-extrabold">Between battles</h2>
        </div>
        <div>
          <h3 className="font-bold">Practice on the same judge</h3>
          <p className="mt-1 text-[15px] text-muted">
            Every problem runs in C++, Java or Python against hidden test cases, exactly like a battle, without the
            clock.
          </p>
        </div>
        <div>
          <h3 className="font-bold">See where you're weak</h3>
          <p className="mt-1 text-[15px] text-muted">
            Each submission updates a per-topic skill score. The skills page points you at the next problems to try.
          </p>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
