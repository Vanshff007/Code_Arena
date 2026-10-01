// Maps a judge verdict (or Run status) to a Tag tone.
export function verdictTone(verdict) {
  if (verdict === 'Accepted' || verdict === 'Success') return 'ok';
  if (!verdict) return 'muted';
  if (verdict === 'Wrong Answer' || verdict === 'Time Limit Exceeded') return 'warn';
  return 'bad';
}
