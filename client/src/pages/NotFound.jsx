import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

function NotFound() {
  return (
    <main className="animate-fade-in mx-auto flex min-h-[calc(100vh-64px)] max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <Compass className="size-8 text-muted" />
      <h1 className="text-2xl font-bold text-foreground">404</h1>
      <p className="text-sm text-muted">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-hover"
      >
        Back home
      </Link>
    </main>
  );
}

export default NotFound;
