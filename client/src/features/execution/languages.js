// Languages the judge supports. Must match LANGUAGES in
// server/features/execution/engine/config.js.
export const LANGUAGES = [
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'python', label: 'Python' },
];

// Java specifically requires a `public class Main` (javac/java need the
// public class name to match the filename the execution engine writes,
// Main.java) - the other two languages have no such constraint but get a
// minimal template for consistency.
export const STARTER_CODE = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n    }\n}\n',
  python: '# Write your solution below\n',
};

export const MONACO_LANGUAGE = { cpp: 'cpp', java: 'java', python: 'python' };

// Function-style problems come with a Solution stub per language from the
// server (generated from the problem's signature). Full-program problems
// have none and fall back to the templates above.
export function starterFor(problem, language) {
  return problem?.starterCode?.[language] ?? STARTER_CODE[language];
}

// Custom input starts as the first example, so Run works straight away.
export function defaultInputFor(problem) {
  return problem?.examples?.[0]?.input ?? '';
}

// Editor theme built from the app tokens in index.css, so the editor reads
// as part of the page instead of a dark box dropped into it.
export const ARENA_THEME = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '2440d8', fontStyle: 'bold' },
    { token: 'type', foreground: '1a2fa8' },
    { token: 'string', foreground: '0f7f57' },
    { token: 'number', foreground: 'd3203f' },
    { token: 'comment', foreground: '5a6070', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#f6f7f9',
    'editor.foreground': '#15171f',
    'editor.lineHighlightBackground': '#e8eaef',
    'editorLineNumber.foreground': '#9aa0ad',
    'editorLineNumber.activeForeground': '#15171f',
    'editorCursor.foreground': '#2440d8',
    'editor.selectionBackground': '#2440d833',
    'editorIndentGuide.background1': '#dde0e7',
  },
};

// Night version for dark mode (values from the dark tokens in index.css).
export const ARENA_THEME_DARK = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '8fa2ff', fontStyle: 'bold' },
    { token: 'type', foreground: 'b3c0ff' },
    { token: 'string', foreground: '5fd8a3' },
    { token: 'number', foreground: 'ff7d93' },
    { token: 'comment', foreground: '8a91a3', fontStyle: 'italic' },
  ],
  colors: {
    'editor.background': '#1b1e28',
    'editor.foreground': '#e6e8ee',
    'editor.lineHighlightBackground': '#232735',
    'editorLineNumber.foreground': '#5c6375',
    'editorLineNumber.activeForeground': '#e6e8ee',
    'editorCursor.foreground': '#8fa2ff',
    'editor.selectionBackground': '#5d76ff44',
    'editorIndentGuide.background1': '#2e3342',
  },
};

// Registers both editor themes; pass to Monaco's beforeMount.
export function defineArenaThemes(monaco) {
  monaco.editor.defineTheme('arena', ARENA_THEME);
  monaco.editor.defineTheme('arena-dark', ARENA_THEME_DARK);
}

export const editorThemeName = (isDark) => (isDark ? 'arena-dark' : 'arena');

export const EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
  fontLigatures: false,
  minimap: { enabled: false },
  automaticLayout: true,
  scrollBeyondLastLine: false,
  padding: { top: 12 },
  renderLineHighlight: 'line',
};
