// Theme preference: 'system' (follow the OS), 'light' or 'dark'. Saved per
// browser in localStorage - a per-viewer convenience, safe to lose.
// index.html applies the saved value before first paint.
export const THEME_KEY = 'codearena_theme';
export const THEMES = ['system', 'light', 'dark'];

export function readThemePreference(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem(THEME_KEY);
    return THEMES.includes(value) ? value : 'system';
  } catch {
    return 'system';
  }
}

export function saveThemePreference(preference, storage = globalThis.localStorage) {
  try {
    if (preference === 'system') storage?.removeItem(THEME_KEY);
    else storage?.setItem(THEME_KEY, preference);
  } catch {
    // Storage blocked (private mode): the choice lasts for this page only.
  }
}

export function applyTheme(preference, root = globalThis.document?.documentElement) {
  if (!root) return;
  if (preference === 'light' || preference === 'dark') root.dataset.theme = preference;
  else delete root.dataset.theme;
}

// Whether the page is dark right now, given the preference and the OS.
export function resolveDark(preference, systemPrefersDark) {
  if (preference === 'dark') return true;
  if (preference === 'light') return false;
  return Boolean(systemPrefersDark);
}
