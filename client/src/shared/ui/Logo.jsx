// Wordmark: two facing blocks (you in cobalt, them in crimson) and the name
// set wide. The blocks are the whole brand in miniature.
function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span aria-hidden className="flex gap-[3px]">
        <span className="h-4 w-2 bg-p1" />
        <span className="h-4 w-2 bg-p2" />
      </span>
      <span className="font-wide text-[17px] font-extrabold tracking-tight text-ink">CodeArena</span>
    </span>
  );
}

export default Logo;
