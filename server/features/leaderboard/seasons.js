// Seasons are calendar months (UTC), e.g. "2026-10". A season ranking is
// the rating points each player gained or lost in battles that ended that
// month. Overall ELO never resets; seasons are computed from match history.

const SEASON = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function seasonId(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function isSeasonId(id) {
  return SEASON.test(id);
}

// [start, end) of a season in UTC.
export function seasonRange(id) {
  const [, y, m] = SEASON.exec(id);
  const start = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  const end = new Date(Date.UTC(Number(y), Number(m), 1));
  return { start, end };
}

// "October 2026"
export function seasonLabel(id) {
  const { start } = seasonRange(id);
  return start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

// Mongo aggregation: one row per player for matches ended in the season.
export function seasonPipeline(id) {
  const { start, end } = seasonRange(id);
  return [
    { $match: { status: 'completed', endedAt: { $gte: start, $lt: end } } },
    { $unwind: '$players' },
    {
      $group: {
        _id: '$players.user',
        points: { $sum: { $subtract: [{ $ifNull: ['$players.ratingAfter', '$players.ratingBefore'] }, '$players.ratingBefore'] } },
        battles: { $sum: 1 },
        wins: { $sum: { $cond: [{ $eq: ['$winner', '$players.user'] }, 1, 0] } },
      },
    },
    { $sort: { points: -1, wins: -1, battles: 1 } },
    { $limit: 100 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { _id: 0, username: '$user.username', rating: '$user.rating', points: 1, battles: 1, wins: 1 } },
  ];
}
