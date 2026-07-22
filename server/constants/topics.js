// Canonical concept taxonomy shared by the Skill Analyzer, Recommendation
// Engine, and XP system. Problem.tags (freeform strings) and LeetCode's own
// topic tags are both normalized into this list rather than each service
// inventing its own topic names.
export const TOPICS = [
  'Arrays',
  'Hashing',
  'Strings',
  'Two Pointers',
  'Sliding Window',
  'Prefix Sum',
  'Binary Search',
  'Sorting',
  'Stack',
  'Queue',
  'Linked List',
  'Trees',
  'Heap',
  'Trie',
  'Segment Tree',
  'Graphs',
  'BFS',
  'DFS',
  'Shortest Path',
  'Union Find',
  'Binary Lifting',
  'Euler Tour',
  'LCA',
  'Greedy',
  'Dynamic Programming',
  'Backtracking',
  'Divide and Conquer',
  'Recursion',
  'Bit Manipulation',
  'Math',
  'Design',
];

// LeetCode topicTag slug -> our canonical topic name. Only slugs we can map
// confidently are included here; any LeetCode tag not in this map is
// ignored during sync rather than guessed at.
export const LEETCODE_TAG_MAP = {
  array: 'Arrays',
  'hash-table': 'Hashing',
  string: 'Strings',
  'two-pointers': 'Two Pointers',
  'sliding-window': 'Sliding Window',
  'prefix-sum': 'Prefix Sum',
  'binary-search': 'Binary Search',
  sorting: 'Sorting',
  stack: 'Stack',
  queue: 'Queue',
  'linked-list': 'Linked List',
  tree: 'Trees',
  'binary-tree': 'Trees',
  'binary-search-tree': 'Trees',
  'heap-priority-queue': 'Heap',
  trie: 'Trie',
  'segment-tree': 'Segment Tree',
  graph: 'Graphs',
  'breadth-first-search': 'BFS',
  'depth-first-search': 'DFS',
  'shortest-path': 'Shortest Path',
  'union-find': 'Union Find',
  greedy: 'Greedy',
  'dynamic-programming': 'Dynamic Programming',
  backtracking: 'Backtracking',
  'divide-and-conquer': 'Divide and Conquer',
  recursion: 'Recursion',
  'bit-manipulation': 'Bit Manipulation',
  math: 'Math',
  design: 'Design',
};

const TOPICS_LOWER_MAP = Object.fromEntries(TOPICS.map((t) => [t.toLowerCase(), t]));

// Maps a freeform Problem.tag (always lowercase, per the Problem schema) to
// its canonical topic name for skill scoring - e.g. "arrays" -> "Arrays".
// A tag outside the canonical taxonomy passes through unchanged; it just
// never contributes to a skill score, which is a reasonable fallback for
// an admin-entered freeform tag that isn't one of the tracked concepts.
export function normalizeTopicName(tag) {
  return TOPICS_LOWER_MAP[tag.toLowerCase()] || tag;
}

// Concept-based "next problems" progression. Recommendation engine uses
// this to turn a weak or strong topic into a set of adjacent concepts,
// rather than referencing specific problem IDs from any external bank.
export const CONCEPT_PROGRESSION = {
  Arrays: ['Two Pointers', 'Sliding Window', 'Prefix Sum'],
  Hashing: ['Arrays', 'Sliding Window'],
  Strings: ['Two Pointers', 'Sliding Window'],
  Graphs: ['BFS', 'DFS', 'Shortest Path', 'Union Find'],
  Trees: ['Binary Lifting', 'Euler Tour', 'LCA'],
  'Dynamic Programming': ['Greedy', 'Backtracking'],
  Greedy: ['Dynamic Programming'],
  'Binary Search': ['Sorting', 'Two Pointers'],
  Heap: ['Graphs', 'Greedy'],
};
