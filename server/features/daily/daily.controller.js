import { getDailyProblem, getStreak } from './daily.service.js';

// GET /api/daily - today's problem, whether the user solved it today, and
// their streak of consecutive days.
export const getDaily = async (req, res, next) => {
  try {
    const daily = await getDailyProblem();
    if (!daily) return res.status(404).json({ success: false, message: 'No problems available yet' });

    const { streak, solvedToday } = await getStreak(req.user._id);
    const { _id, title, difficulty, tags } = daily.problem;
    return res.status(200).json({
      success: true,
      data: { date: daily.date, problem: { _id, title, difficulty, tags }, solvedToday, streak },
    });
  } catch (err) {
    next(err);
  }
};
