import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { Swords, ArrowRight } from 'lucide-react';
import { getHealth } from '../services/healthService';
import { useAuth } from '../hooks/useAuth';
import Badge from '../components/ui/Badge';
import CodeWindowCard, { line } from '../components/ui/CodeWindowCard';

// This page doubles as a foundation smoke test: if the status badge reads
// "connected", the Axios service layer is successfully reaching the backend
// through CORS - unchanged behavior from before, just restyled.
function Home() {
  const { user } = useAuth();
  const [status, setStatus] = useState('checking');
  const heroRef = useRef(null);

  // Raw values track the cursor 1:1; the springs are what's actually
  // rendered, so the glow eases toward the pointer instead of teleporting.
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const glowX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(rawY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    getHealth()
      .then((res) => setStatus(res.db === 'connected' ? 'connected' : 'unreachable'))
      .catch(() => setStatus('unreachable'));

    // Centers the glow on first paint (before any mouse movement) using the
    // hero's own size rather than the whole viewport, since the glow is
    // absolutely positioned within <main>, not the page.
    if (heroRef.current) {
      const rect = heroRef.current.getBoundingClientRect();
      rawX.set(rect.width / 2);
      rawY.set(rect.height / 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - rect.left);
    rawY.set(e.clientY - rect.top);
  }

  const badgeTone = status === 'connected' ? 'success' : status === 'unreachable' ? 'error' : 'muted';

  return (
    <main
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col items-center justify-center overflow-hidden px-6 py-16"
    >
      {/* Ambient glow that eases toward the cursor - not the particle-sphere
          animation the reference video used, but the same "glowing,
          reactive centerpiece behind floating code windows" mood. */}
      <motion.div
        className="pointer-events-none absolute size-[36rem] rounded-full opacity-10 blur-3xl"
        style={{
          left: glowX,
          top: glowY,
          x: '-50%',
          y: '-50%',
          background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
        }}
      />

      {/* Floating decorative code windows - hidden on small screens where
          there's no room for them not to collide with the hero copy. */}
      <CodeWindowCard
        title="matchmaking.js"
        className="absolute left-0 top-8 hidden rotate-[-6deg] lg:block"
        style={{ animationDelay: '0s' }}
        lines={[
          line(['kw', 'export function '], ['fn', 'joinQueue'], ['pl', '(socket) {']),
          line(['pl', '  matchmakingQueue.'], ['fn', 'push'], ['pl', '(player);']),
          line(['cm', '  // pair when 2 players are queued']),
          line(['kw', '  if '], ['pl', '(queue.length >= '], ['str', '2'], ['pl', ') {']),
          line(['fn', '    startBattle'], ['pl', '(a, b);']),
        ]}
      />
      <CodeWindowCard
        title="Battle.model.js"
        className="absolute right-0 top-2 hidden rotate-[5deg] lg:block"
        style={{ animationDelay: '1.2s' }}
        lines={[
          line(['kw', 'const '], ['fn', 'battle'], ['pl', ' = {']),
          line(['pl', '  problem, players,']),
          line(['pl', '  '], ['fn', 'durationMs'], ['pl', ': '], ['str', '900000'], ['pl', ',']),
          line(['pl', '  '], ['fn', 'startedAt'], ['pl', ': '], ['fn', 'Date'], ['pl', '.'], ['fn', 'now'], ['pl', '(),']),
          line(['pl', '};']),
        ]}
      />
      <CodeWindowCard
        title="judge.py"
        className="absolute bottom-4 left-4 hidden rotate-[4deg] lg:block"
        style={{ animationDelay: '0.6s' }}
        lines={[
          line(['kw', 'if '], ['fn', 'stdout'], ['pl', ' == '], ['fn', 'expected'], ['pl', ':']),
          line(['kw', '    return '], ['str', '"Accepted"']),
          line(['kw', 'else'], ['pl', ':']),
          line(['kw', '    return '], ['str', '"Wrong Answer"']),
        ]}
      />
      <CodeWindowCard
        title="rating.js"
        className="absolute bottom-10 right-6 hidden rotate-[-4deg] lg:block"
        style={{ animationDelay: '1.8s' }}
        lines={[
          line(['kw', 'const '], ['fn', 'expected'], ['pl', ' = '], ['str', '1'], ['pl', ' / (']),
          line(['pl', '  '], ['str', '1'], ['pl', ' + '], ['fn', '10'], ['pl', ' ** ((rB - rA) / '], ['str', '400'], ['pl', '));']),
        ]}
      />

      <div className="animate-fade-in relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card shadow-[0_8px_24px_-8px_var(--color-accent)]">
          <Swords className="size-7 text-accent" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Code<span className="text-accent">Arena</span>
        </h1>
        <p className="max-w-md text-balance text-muted">
          Real-time 1v1 competitive coding battles. Same problem, same constraints, first correct
          submission wins.
        </p>

        <NavLink
          to={user ? '/dashboard' : '/register'}
          className="group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium
            text-background shadow-[0_6px_18px_-6px_var(--color-accent)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
        >
          {user ? 'Go to Dashboard' : 'Get Started'}
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </NavLink>

        <Badge tone={badgeTone}>
          <span
            className={`size-1.5 rounded-full ${
              badgeTone === 'success' ? 'bg-success' : badgeTone === 'error' ? 'bg-error' : 'bg-muted'
            }`}
          />
          Backend {status}
        </Badge>
      </div>
    </main>
  );
}

export default Home;
