import { useEffect, useState } from 'react';
import { ThemeContext } from './themeContext';
import { readThemePreference, saveThemePreference, applyTheme, resolveDark } from './theme';
import useMediaQuery from './useMediaQuery';

// Light, dark, or follow the OS. The CSS does the actual switching (see
// index.css); this keeps the preference and tells components like the code
// editor, which can't read CSS variables, whether the page is dark.
export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(() => readThemePreference());
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');

  useEffect(() => applyTheme(preference), [preference]);

  const setPreference = (value) => {
    saveThemePreference(value);
    setPreferenceState(value);
  };

  return (
    <ThemeContext.Provider value={{ preference, setPreference, isDark: resolveDark(preference, systemDark) }}>
      {children}
    </ThemeContext.Provider>
  );
}
