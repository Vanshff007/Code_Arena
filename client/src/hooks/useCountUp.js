import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate } from 'framer-motion';

// Animates a number from its previous value to `target` instead of snapping
// straight to it - used on the Dashboard stat tiles so a rating/win/loss
// change (or the initial 0 -> real value on load) reads as something that
// just happened, not a static label. Returns a MotionValue; render it via
// <motion.span>{rounded}</motion.span> so framer-motion updates the DOM
// text directly without re-rendering the component on every tick.
function useCountUp(target, duration = 1) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const isFirstRun = useRef(true);

  useEffect(() => {
    const value = Number(target) || 0;
    // First mount animates up from 0; subsequent changes animate from
    // whatever the tile currently shows, so a rating going 1000 -> 1016
    // counts up by 16 rather than replaying the whole 0 -> 1016 climb.
    const from = isFirstRun.current ? 0 : count.get();
    isFirstRun.current = false;
    count.set(from);
    const controls = animate(count, value, { duration, ease: 'easeOut' });
    return controls.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return rounded;
}

export default useCountUp;
