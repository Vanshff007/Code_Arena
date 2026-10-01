import { LEETCODE_TAG_MAP } from '../skills/topics.js';

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

// LeetCode has no official public API - this talks to the same unofficial
// GraphQL endpoint the leetcode.com site itself uses. It can change shape or
// start blocking server IPs at any time with no notice or SLA. Every
// exported function here is expected to fail sometimes; callers (see
// syncLeetCodeProfile and the controller) must treat that as a normal,
// recoverable outcome, not a crash - LeetCode integration is optional and
// must never take the rest of the app down with it.
//
// IMPORTANT DATA LIMITATION: for an arbitrary public username, LeetCode
// exposes aggregate solved counts (easy/medium/hard/total) and contest
// history, but NOT a full list of every problem ever solved. The closest
// available signal for "which topics has this person practiced" is
// `recentAcSubmissionList`, which is capped to a small recent window (and
// can be empty depending on the account's privacy settings) - it is used
// here purely as a cold-start seed. skillAnalyzer.service.js blends it with
// a low weight specifically because of this limitation; CodeArena's own
// tracked submissions (PerformanceHistory) are the signal that actually
// stays accurate over time.
async function graphqlRequest(query, variables) {
  const res = await fetch(LEETCODE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // LeetCode's endpoint rejects requests that don't look like they came
      // from a browser tab on leetcode.com.
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://leetcode.com',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API responded with ${res.status}`);
  }

  const json = await res.json();
  // A "not found" username comes back as HTTP 200 with a populated
  // `errors` array AND `data: { matchedUser: null }` - that's a normal
  // outcome the caller checks for, not a thrown error. Only treat this as a
  // hard failure when `data` itself is entirely missing.
  if (!json.data) {
    throw new Error(json.errors?.[0]?.message || 'LeetCode GraphQL error');
  }
  return json.data;
}

// Aggregate solved counts. Returns null if the username doesn't exist.
export async function fetchProfileStats(username) {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum { difficulty count }
        }
      }
    }
  `;
  const data = await graphqlRequest(query, { username });
  if (!data.matchedUser) return null;

  const counts = { Easy: 0, Medium: 0, Hard: 0, All: 0 };
  for (const entry of data.matchedUser.submitStats.acSubmissionNum) {
    counts[entry.difficulty] = entry.count;
  }
  return {
    totalSolved: counts.All,
    easySolved: counts.Easy,
    mediumSolved: counts.Medium,
    hardSolved: counts.Hard,
  };
}

// Contest history is genuinely absent for accounts that never competed -
// null here is a normal result, not a failure.
export async function fetchContestInfo(username) {
  const query = `
    query userContestInfo($username: String!) {
      userContestRanking(username: $username) {
        rating
        globalRanking
        attendedContestsCount
      }
    }
  `;
  const data = await graphqlRequest(query, { username });
  return data.userContestRanking;
}

// See the module-level comment: this is a limited recent window, not full
// history, and can legitimately be empty.
export async function fetchRecentAcSubmissions(username, limit = 20) {
  const query = `
    query recentAc($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        title
        titleSlug
        timestamp
      }
    }
  `;
  const data = await graphqlRequest(query, { username, limit });
  return data.recentAcSubmissionList || [];
}

// One lookup per recent submission during sync (bounded by the `limit`
// above, so at most ~20 calls) - maps a problem to its LeetCode topic tags.
export async function fetchProblemTags(titleSlug) {
  const query = `
    query questionTags($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        topicTags { name slug }
      }
    }
  `;
  const data = await graphqlRequest(query, { titleSlug });
  return (data.question?.topicTags || []).map((t) => t.slug);
}

// All-time solved count per topic, from the "Skills" box on a public
// LeetCode profile (tagProblemCounts). Several LeetCode tags can map to one
// topic (tree, binary-tree, binary-search-tree -> Trees); the largest count
// is used, since one problem usually carries all of those tags.
export function topicCountsFromTags(tagProblemCounts) {
  const counts = {};
  for (const level of ['fundamental', 'intermediate', 'advanced']) {
    for (const tag of tagProblemCounts?.[level] ?? []) {
      const topic = LEETCODE_TAG_MAP[tag.tagSlug];
      if (topic) counts[topic] = Math.max(counts[topic] ?? 0, tag.problemsSolved);
    }
  }
  return counts;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// submissionCalendar is a JSON string of { unixSeconds: submissions }.
export function summarizeCalendar(calendar, now = Date.now()) {
  if (!calendar) return null;
  let days = {};
  try {
    days = JSON.parse(calendar.submissionCalendar || '{}');
  } catch {
    days = {};
  }
  let last30Days = 0;
  let lastActiveAt = null;
  for (const [seconds, count] of Object.entries(days)) {
    const at = Number(seconds) * 1000;
    if (now - at <= 30 * DAY_MS) last30Days += count;
    if (count > 0 && (!lastActiveAt || at > lastActiveAt)) lastActiveAt = at;
  }
  return {
    streak: calendar.streak ?? 0,
    totalActiveDays: calendar.totalActiveDays ?? 0,
    last30Days,
    lastActiveAt: lastActiveAt ? new Date(lastActiveAt) : null,
  };
}

const CONTEST_HISTORY_LIMIT = 20;

// Rated contests the user actually took part in, oldest first, last 20.
export function summarizeContests(history) {
  return (history ?? [])
    .filter((c) => c.attended)
    .map((c) => ({
      title: c.contest?.title ?? '',
      rating: Math.round(c.rating),
      ranking: c.ranking ?? null,
      date: c.contest?.startTime ? new Date(c.contest.startTime * 1000) : null,
    }))
    .slice(-CONTEST_HISTORY_LIMIT);
}

// Everything else a public profile shows, in one request: all-time topic
// counts, solved per language, activity calendar and contest history.
// Best-effort: callers treat a failure as "no extras", not a failed sync.
export async function fetchProfileExtras(username) {
  const query = `
    query profileExtras($username: String!) {
      matchedUser(username: $username) {
        tagProblemCounts {
          fundamental { tagSlug problemsSolved }
          intermediate { tagSlug problemsSolved }
          advanced { tagSlug problemsSolved }
        }
        languageProblemCount { languageName problemsSolved }
        userCalendar { streak totalActiveDays submissionCalendar }
      }
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        contest { title startTime }
      }
    }
  `;
  const data = await graphqlRequest(query, { username });
  const user = data.matchedUser;
  if (!user) return null;
  return {
    allTimeTopicCounts: topicCountsFromTags(user.tagProblemCounts),
    languages: (user.languageProblemCount ?? [])
      .map((l) => ({ name: l.languageName, solved: l.problemsSolved }))
      .sort((a, b) => b.solved - a.solved),
    activity: summarizeCalendar(user.userCalendar),
    contestHistory: summarizeContests(data.userContestRankingHistory),
  };
}

// Full sync: aggregate stats (required) + contest info, recent-topic signal
// and profile extras (all best-effort - their absence doesn't fail the sync).
export async function syncLeetCodeProfile(username) {
  const profile = await fetchProfileStats(username);
  if (!profile) {
    const err = new Error('LeetCode username not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const [contest, recentSubmissions, extras] = await Promise.all([
    fetchContestInfo(username).catch(() => null),
    fetchRecentAcSubmissions(username, 20).catch(() => []),
    fetchProfileExtras(username).catch(() => null),
  ]);

  const topicCounts = {};
  for (const sub of recentSubmissions) {
    try {
      const tagSlugs = await fetchProblemTags(sub.titleSlug);
      for (const slug of tagSlugs) {
        const topic = LEETCODE_TAG_MAP[slug];
        if (topic) topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    } catch {
      // One bad per-problem lookup shouldn't fail the whole sync.
    }
  }

  return {
    totalSolved: profile.totalSolved,
    easySolved: profile.easySolved,
    mediumSolved: profile.mediumSolved,
    hardSolved: profile.hardSolved,
    contestRating: contest?.rating ?? null,
    contestRanking: contest?.globalRanking ?? null,
    recentTopicCounts: topicCounts,
    recentSolvedSlugs: recentSubmissions.map((sub) => sub.titleSlug),
    allTimeTopicCounts: extras?.allTimeTopicCounts ?? {},
    languages: extras?.languages ?? [],
    activity: extras?.activity ?? null,
    contestHistory: extras?.contestHistory ?? [],
  };
}

// Public problem list for one topic tag, used to recommend LeetCode
// problems (as links - the problems are solved on leetcode.com, never
// copied here). `difficulty` is EASY, MEDIUM or HARD.
export async function fetchProblemsByTag(tagSlug, difficulty, limit = 50) {
  const query = `
    query problemList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
        questions: data {
          title
          titleSlug
          difficulty
          acRate
          isPaidOnly
        }
      }
    }
  `;
  const data = await graphqlRequest(query, {
    categorySlug: '',
    limit,
    skip: 0,
    filters: { tags: [tagSlug], difficulty },
  });
  return data.problemsetQuestionList?.questions ?? [];
}
