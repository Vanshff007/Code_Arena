import { useState, useEffect } from 'react';

// Reads a real CSS media query rather than a one-time window.innerWidth
// check, so anything using this (e.g. Monaco's height prop, which can't be
// driven by a Tailwind class) actually reacts to the viewport changing -
// window resize, or a device rotating - not just its size at mount.
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default useMediaQuery;
