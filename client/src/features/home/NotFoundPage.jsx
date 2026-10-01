import { ButtonLink } from '../../shared/ui/Button';

function NotFoundPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <p className="font-tight text-[10rem] font-black leading-none text-p2">404</p>
      <h1 className="mt-4 font-wide text-3xl font-extrabold">No page at this address</h1>
      <p className="mt-2 text-muted">The link may be old, or the room may have closed.</p>
      <ButtonLink to="/" variant="secondary" className="mt-6">
        Go to the home page
      </ButtonLink>
    </main>
  );
}

export default NotFoundPage;
