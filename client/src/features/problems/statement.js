// Example inputs are stored one JSON value per line, in parameter order.
// For function-style problems, show them LeetCode style: `nums = [2,7,11,15]`.
// Returns null for full-program problems (no signature) or when the line
// count does not match, so the raw input is shown instead.
export function namedArguments(signature, input) {
  if (!signature?.params?.length) return null;
  const lines = input.split('\n');
  if (lines.length !== signature.params.length) return null;
  return signature.params.map((p, i) => ({ name: p.name, value: lines[i] }));
}

// Descriptions mark code with backticks (`nums`, `true`). Splits text into
// plain and code segments so the page can style the code parts.
export function splitInlineCode(text = '') {
  return text
    .split(/(`[^`\n]+`)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('`') && part.endsWith('`') && part.length > 2
        ? { code: true, text: part.slice(1, -1) }
        : { code: false, text: part }
    );
}
