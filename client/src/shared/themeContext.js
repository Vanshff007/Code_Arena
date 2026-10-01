import { createContext } from 'react';

export const ThemeContext = createContext({ preference: 'system', setPreference: () => {}, isDark: false });
