export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

// Difficulty as a 1-3 level, drawn as filled bars by DifficultyMeter.
export function difficultyLevel(difficulty) {
  const i = DIFFICULTIES.indexOf(difficulty);
  return i === -1 ? 0 : i + 1;
}

// Client-side filter for the problem list.
export function filterProblems(problems, { difficulty = 'All', query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return problems.filter((p) => {
    if (difficulty !== 'All' && p.difficulty !== difficulty) return false;
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q));
  });
}
