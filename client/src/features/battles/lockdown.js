import { useEffect, useState } from 'react';

// Blocked on the whole page while a battle runs: copy, cut and paste (also
// through the right-click menu), and dropping dragged text into the editor.
// shortcut: client-side only, so a determined player can get around it with
// dev tools or a second device; server-side checks would be the upgrade.
export const BLOCKED_EVENTS = ['copy', 'cut', 'paste', 'contextmenu', 'drop'];

const CAPTURE = { capture: true };

const block = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

// Capture phase on the window runs before Monaco's own handlers, so the
// editor never sees the event. Returns the detach function.
export function attachLockdown(target) {
  for (const type of BLOCKED_EVENTS) target.addEventListener(type, block, CAPTURE);
  return () => {
    for (const type of BLOCKED_EVENTS) target.removeEventListener(type, block, CAPTURE);
  };
}

// iPhone Safari and some embedded browsers have no fullscreen API. Those
// players are not locked out of battles.
export const fullscreenSupported = () => typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);

// Browsers only allow this from a click, so call it from a button handler.
export function enterFullscreen() {
  if (!fullscreenSupported() || document.fullscreenElement) return;
  document.documentElement.requestFullscreen().catch(() => {});
}

// While `active`: copy/paste/right-click are blocked, and `needsFullscreen`
// is true whenever the player has left fullscreen (Esc, F11, a refresh).
// Fullscreen is closed when the battle ends.
export function useBattleLockdown(active) {
  const [isFullscreen, setIsFullscreen] = useState(() => typeof document !== 'undefined' && Boolean(document.fullscreenElement));

  useEffect(() => {
    if (!active) return;
    const detach = attachLockdown(window);
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    onChange();
    return () => {
      detach();
      document.removeEventListener('fullscreenchange', onChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [active]);

  return { needsFullscreen: active && fullscreenSupported() && !isFullscreen };
}
