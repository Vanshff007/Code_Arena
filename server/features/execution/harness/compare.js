// Compares a returned value with the expected one. Both are JSON text
// (the harness serializes results as JSON; test cases store expected
// outputs the same way), so formatting differences like spaces never
// matter - only the values do.

const FLOAT_TOLERANCE = 1e-5;

function parse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}

// Sorts every array (at every depth) into a stable order, for problems
// where any order of the answer is accepted (e.g. 3Sum, Group Anagrams).
function canonicalize(value) {
  if (!Array.isArray(value)) return value;
  return value
    .map(canonicalize)
    .sort((a, b) => {
      const sa = JSON.stringify(a);
      const sb = JSON.stringify(b);
      return sa < sb ? -1 : sa > sb ? 1 : 0;
    });
}

function equal(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    if (Number.isInteger(a) && Number.isInteger(b)) return a === b;
    return Math.abs(a - b) <= FLOAT_TOLERANCE * Math.max(1, Math.abs(b));
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((x, i) => equal(x, b[i]));
  }
  return a === b;
}

export function outputsMatch(actualText, expectedText, { anyOrder = false } = {}) {
  const actual = parse(actualText);
  const expected = parse(expectedText);
  if (!actual.ok || !expected.ok) return actualText.trim() === expectedText.trim();
  if (anyOrder) return equal(canonicalize(actual.value), canonicalize(expected.value));
  return equal(actual.value, expected.value);
}
