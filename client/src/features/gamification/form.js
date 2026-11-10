// Win streaks shorter than this are not called out.
export const STREAK_MIN = 3;

const WORD = { W: 'won', L: 'lost', D: 'drew' };

// "4 wins in a row" from STREAK_MIN up, else null.
export function streakLabel(streak = 0) {
  return streak >= STREAK_MIN ? `${streak} wins in a row` : null;
}

// Screen-reader text for a form strip, oldest first.
export function formLabel(name, form = []) {
  return form.length ? `${name}, last ${form.length}: ${form.map((r) => WORD[r]).join(', ')}` : '';
}
