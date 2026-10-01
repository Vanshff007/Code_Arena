// Function-style ("LeetCode-style") problems: the player writes only a
// Solution class; the harness adds the hidden headers and a main() that
// reads one JSON value per parameter from stdin, calls the method and
// prints the result after RESULT_MARKER.
import { buildCpp } from './cpp.js';
import { buildJava } from './java.js';
import { buildPython } from './python.js';

export { generateStarterCode } from './starterCode.js';
export { validateSignature, TYPE_NAMES } from './types.js';
export { extractResult } from './protocol.js';
export { outputsMatch } from './compare.js';

const BUILDERS = { cpp: buildCpp, java: buildJava, python: buildPython };

// Returns { source, offset, userLines }: the full program, and where the
// player's code starts in it (for mapping error line numbers back).
export function buildProgram(language, signature, userCode) {
  const build = BUILDERS[language];
  if (!build) throw new Error(`Unsupported language: ${language}`);
  return build(signature, userCode);
}

// Compiler and runtime messages refer to the generated file. Shift line
// numbers so they point into the player's own code; a line outside it is
// in the hidden harness (usually a signature mismatch), so say that.
const LINE_PATTERNS = {
  cpp: /main\.cpp:(\d+)/g,
  java: /Main\.java:(\d+)/g,
  python: /main\.py", line (\d+)/g,
};

export function remapLineNumbers(language, text, { offset, userLines }) {
  const pattern = LINE_PATTERNS[language];
  if (!text || !pattern) return text;
  return text.replace(pattern, (match, n) => {
    const line = Number(n) - offset;
    const fixed = line >= 1 && line <= userLines ? String(line) : 'harness';
    return match.replace(n, fixed);
  });
}
