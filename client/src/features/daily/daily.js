// Pure helpers for the daily problem card (covered by daily.test.js).

export function streakText(streak) {
  if (!streak) return 'No streak yet';
  return streak === 1 ? '1 day streak' : `${streak} day streak`;
}
