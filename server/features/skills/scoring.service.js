// Dynamic per-submission scoring. Pure function - no DB access - so every
// modifier below is independently testable and the whole thing is reusable
// wherever a score needs recomputing.
const BASE_SCORE = { Easy: 100, Medium: 250, Hard: 500 };

export function calculateSubmissionScore({
  difficulty,
  isFirstAttempt,
  timeTakenMs,
  averageTimeMs,
  runtimeMs,
  averageRuntimeMs,
  memoryKb,
  averageMemoryKb,
  wrongAttempts = 0,
  hintsUsed = 0,
  editorialViewed = false,
}) {
  const base = BASE_SCORE[difficulty] ?? 0;
  let multiplier = 1;

  if (isFirstAttempt) multiplier += 0.3;
  if (averageTimeMs && timeTakenMs && timeTakenMs < averageTimeMs) multiplier += 0.2;
  if (averageRuntimeMs && runtimeMs && runtimeMs < averageRuntimeMs * 0.8) multiplier += 0.15;
  if (averageMemoryKb && memoryKb && memoryKb < averageMemoryKb * 0.8) multiplier += 0.1;
  if (hintsUsed === 0) multiplier += 0.15;

  multiplier -= wrongAttempts * 0.05;
  if (hintsUsed > 0) multiplier -= 0.15;
  if (editorialViewed) multiplier -= 0.25;

  multiplier = Math.max(0, multiplier);
  return Math.round(base * multiplier);
}
