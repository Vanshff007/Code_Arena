// How the hidden harness talks back to the judge. The player's own prints
// go to stdout first; the harness then prints a newline, this marker and the
// return value as JSON. Everything before the marker is shown to the player
// as their output.
export const RESULT_MARKER = '@@CA_RESULT@@';

export function inputCountMessage(signature) {
  const names = signature.params.map((p) => p.name).join(', ');
  const n = signature.params.length;
  return `Input needs ${n} line${n === 1 ? '' : 's'}, one value per parameter (${names}).`;
}

// Splits raw stdout into the player's own output and the returned value.
// `result` is null when the harness never printed it (crash, timeout).
export function extractResult(stdout) {
  const at = stdout.lastIndexOf(RESULT_MARKER);
  if (at === -1) return { output: stdout, result: null };
  // Trailing newlines (the player's last print plus the harness separator)
  // carry no information for display.
  const output = stdout.slice(0, at).replace(/\s+$/, '');
  const result = stdout.slice(at + RESULT_MARKER.length).split('\n')[0].trim();
  return { output, result };
}
