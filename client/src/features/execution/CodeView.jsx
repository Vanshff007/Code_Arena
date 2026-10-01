import Editor from '@monaco-editor/react';
import { MONACO_LANGUAGE, EDITOR_OPTIONS, defineArenaThemes, editorThemeName } from './languages';
import { useTheme } from '../../shared/useTheme';

// Read-only code, highlighted like the editor. Used by replays and the
// editorial.
function CodeView({ code, language, height = '320px' }) {
  const { isDark } = useTheme();
  return (
    <div className="overflow-hidden border border-rule">
      <Editor
        height={height}
        language={MONACO_LANGUAGE[language] ?? 'plaintext'}
        value={code}
        beforeMount={defineArenaThemes}
        theme={editorThemeName(isDark)}
        options={{ ...EDITOR_OPTIONS, readOnly: true, domReadOnly: true, lineNumbers: 'on', renderLineHighlight: 'none' }}
      />
    </div>
  );
}

export default CodeView;
