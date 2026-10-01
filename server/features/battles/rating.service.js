// Standard ELO rating update, same system chess uses. The higher-rated
// player is "expected" to win more often, so beating them shifts more
// points than beating someone rated far below you.
const K_FACTOR = 32;

function expectedScore(ratingSelf, ratingOpponent) {
  return 1 / (1 + Math.pow(10, (ratingOpponent - ratingSelf) / 400));
}

// actualScore: 1 = win, 0.5 = draw, 0 = loss
function newRating(rating, opponentRating, actualScore) {
  const expected = expectedScore(rating, opponentRating);
  return Math.round(rating + K_FACTOR * (actualScore - expected));
}

// outcome is from player A's perspective: 'A' (A won), 'B' (B won), or 'draw'
export function calculateRatings(ratingA, ratingB, outcome) {
  const scoreA = outcome === 'A' ? 1 : outcome === 'draw' ? 0.5 : 0;
  const scoreB = 1 - scoreA;

  return {
    ratingA: newRating(ratingA, ratingB, scoreA),
    ratingB: newRating(ratingB, ratingA, scoreB),
  };
}
