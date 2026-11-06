import { randomInt } from 'crypto';
import DailyProblem from './DailyProblem.model.js';
import Problem from '../problems/Problem.model.js';
import PerformanceHistory from '../skills/PerformanceHistory.model.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_STREAK_DAYS = 366;

// 'YYYY-MM-DD' of a moment, in UTC.
export const dayId = (date = new Date()) => new Date(date).toISOString().slice(0, 10);

export const previousDay = (id) => dayId(new Date(Date.parse(id) - DAY_MS));

// Consecutive solved days ending today. Today not solved yet does not break
// the streak: it then counts back from yesterday.
export function streakFrom(solvedDays, today) {
  let day = solvedDays.has(today) ? today : previousDay(today);
  let streak = 0;
  while (solvedDays.has(day) && streak < MAX_STREAK_DAYS) {
    streak += 1;
    day = previousDay(day);
  }
  return streak;
}

// Today's problem, picked at random on the first request of the day. A pick
// whose problem was deleted is replaced. Uses find + skip (not $sample) so
// hiddenTestCases stays excluded.
export async function getDailyProblem(now = new Date()) {
  const date = dayId(now);
  const existing = await DailyProblem.findOne({ date }).populate('problem', 'title difficulty tags');
  if (existing?.problem) return existing;
  if (existing) await DailyProblem.deleteOne({ _id: existing._id });

  const count = await Problem.countDocuments();
  if (!count) return null;
  const problem = await Problem.findOne().skip(randomInt(count)).select('_id');
  try {
    await DailyProblem.create({ date, problem: problem._id });
  } catch (err) {
    if (err.code !== 11000) throw err; // another request created it first
  }
  return DailyProblem.findOne({ date }).populate('problem', 'title difficulty tags');
}

// Days (UTC) on which the user had an accepted submission on that day's
// daily problem, then the streak from them.
export async function getStreak(userId, now = new Date()) {
  const today = dayId(now);
  const since = dayId(new Date(Date.parse(today) - MAX_STREAK_DAYS * DAY_MS));
  const dailies = await DailyProblem.find({ date: { $gte: since, $lte: today } }).select('date problem');
  if (!dailies.length) return { streak: 0, solvedToday: false };

  const accepted = await PerformanceHistory.find({
    user: userId,
    isAccepted: true,
    problem: { $in: dailies.map((d) => d.problem) },
    createdAt: { $gte: new Date(since) },
  }).select('problem createdAt');
  const solvedOn = new Set(accepted.map((a) => `${dayId(a.createdAt)}:${a.problem}`));
  const solvedDays = new Set(dailies.filter((d) => solvedOn.has(`${d.date}:${d.problem}`)).map((d) => d.date));

  return { streak: streakFrom(solvedDays, today), solvedToday: solvedDays.has(today) };
}
