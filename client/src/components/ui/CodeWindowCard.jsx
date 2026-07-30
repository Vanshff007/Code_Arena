import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Purely decorative "code editor window" - the little traffic-light-topped
// snippet cards used to dress up the landing page hero. `lines` accepts
// pre-tokenized text (see the `code` helper below) rather than a real syntax
// highlighter - this is set dressing, not an editor, so a full highlighting
// dependency would be overkill for what's on screen.
//
// The idle up/down bob is a plain CSS animation (`animate-float`, defined in
// index.css) on the outer wrapper; the mouse-tilt below is framer-motion's
// own transform on the inner element. Kept on separate elements because both
// ultimately animate the CSS `transform` property - on the same element
// they'd fight each other instead of combining.
function CodeWindowCard({ title, lines, className = '', style }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 20 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <div className={`animate-float ${className}`} style={style}>
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 600 }}
        whileHover={{ scale: 1.04 }}
        className="w-64 rounded-lg border border-border bg-card/90 shadow-[0_10px_30px_-10px_var(--color-accent)]
          backdrop-blur-sm"
      >
        <div className="flex items-center gap-1.5 rounded-t-lg border-b border-border bg-surface px-3 py-2">
          <span className="size-2.5 rounded-full bg-error/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-success/70" />
          {title && <span className="ml-2 truncate text-xs text-muted">{title}</span>}
        </div>
        <pre className="overflow-hidden px-3 py-3 font-mono text-[11px] leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="whitespace-pre">
              {line.map((tok, j) => (
                <span key={j} className={tokenClass[tok.t]}>
                  {tok.v}
                </span>
              ))}
            </div>
          ))}
        </pre>
      </motion.div>
    </div>
  );
}

const tokenClass = {
  kw: 'text-accent', // keywords
  str: 'text-warning', // strings
  fn: 'text-foreground font-medium', // function/identifier names
  cm: 'text-muted', // comments
  pl: 'text-muted', // plain punctuation/whitespace filler
};

// Small helper so callers can write code as readable strings instead of
// hand-building token arrays: code`kw:const ` + `fn:battle` + `pl: = ...`
// is more error-prone than just describing each line as [type, text] pairs.
export function line(...pairs) {
  return pairs.map(([t, v]) => ({ t, v }));
}

export default CodeWindowCard;
