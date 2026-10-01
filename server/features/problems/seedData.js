// The built-in problem bank, in function (LeetCode) format: players write a
// Solution method; every test input is one JSON value per parameter, one per
// line, and every output is the JSON of the returned value.
//
// Every test case is checked against a reference solution by
// seed.test.js (see referenceSolutions.js), so a wrong expected output fails
// the test suite instead of shipping.
//
// Used by seedProblems.js (npm run seed-problems) and by the tests.

const lines = (...values) => values.map((v) => JSON.stringify(v)).join('\n');
const out = (value) => JSON.stringify(value);
const tc = (args, expected) => ({ input: lines(...args), output: out(expected) });
const ex = (args, expected, explanation = '') => ({ ...tc(args, expected), explanation });

export const SEED_PROBLEMS = [
  // --- Easy ---
  {
    title: 'Two Sum (Index Pair)',
    difficulty: 'Easy',
    description:
      'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers that add up ' +
      'to `target`, in increasing order.\n\n' +
      'You may assume that exactly one valid answer exists, and you may not use the same element twice.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists'],
    signature: {
      functionName: 'twoSum',
      params: [
        { name: 'nums', type: 'int[]' },
        { name: 'target', type: 'int' },
      ],
      returnType: 'int[]',
    },
    examples: [
      ex([[2, 7, 11, 15], 9], [0, 1], 'nums[0] + nums[1] == 9'),
      ex([[3, 2, 4], 6], [1, 2], 'nums[1] + nums[2] == 6'),
    ],
    publicTestCases: [tc([[2, 7, 11, 15], 9], [0, 1]), tc([[3, 2, 4], 6], [1, 2])],
    hiddenTestCases: [
      tc([[3, 3], 6], [0, 1]),
      tc([[1, 5, 3, 8, 2], 10], [3, 4]),
      tc([[-3, 4, 3, 90], 0], [0, 2]),
    ],
    tags: ['arrays', 'hashing'],
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description:
      'Given a string `s` containing only the characters `(`, `)`, `{`, `}`, `[` and `]`, return `true` if the ' +
      'brackets are valid.\n\n' +
      'Brackets are valid when every opening bracket is closed by the same type of bracket, in the correct order.',
    constraints: ['1 <= s.length <= 10^4', 's consists only of ()[]{}'],
    signature: { functionName: 'isValid', params: [{ name: 's', type: 'string' }], returnType: 'bool' },
    examples: [ex(['()[]{}'], true), ex(['(]'], false)],
    publicTestCases: [tc(['()'], true), tc(['(]'], false)],
    hiddenTestCases: [tc(['{[]}'], true), tc(['((('], false), tc(['()[]{}'], true)],
    tags: ['stack', 'strings'],
  },
  {
    title: 'Reverse Integer',
    difficulty: 'Easy',
    description:
      'Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` would overflow a ' +
      'signed 32-bit integer, return `0`.',
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    signature: { functionName: 'reverse', params: [{ name: 'x', type: 'int' }], returnType: 'int' },
    examples: [ex([123], 321), ex([-123], -321)],
    publicTestCases: [tc([123], 321), tc([-123], -321)],
    hiddenTestCases: [tc([120], 21), tc([0], 0), tc([1534236469], 0)],
    tags: ['math'],
  },
  {
    title: 'Binary Search Target',
    difficulty: 'Easy',
    description:
      'Given an array of unique integers `nums` sorted in increasing order and an integer `target`, return the index ' +
      'of `target` in `nums`, or `-1` if it is not present.\n\nYour solution must run in O(log n) time.',
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted in strictly increasing order'],
    signature: {
      functionName: 'search',
      params: [
        { name: 'nums', type: 'int[]' },
        { name: 'target', type: 'int' },
      ],
      returnType: 'int',
    },
    examples: [ex([[-1, 0, 3, 5, 9, 12], 9], 4), ex([[-1, 0, 3, 5, 9, 12], 2], -1)],
    publicTestCases: [tc([[-1, 0, 3, 5, 9, 12], 9], 4), tc([[-1, 0, 3, 5, 9, 12], 2], -1)],
    hiddenTestCases: [
      tc([[5], 5], 0),
      tc([[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 10], 9),
      tc([[1, 3, 5, 7], 4], -1),
    ],
    tags: ['binary search', 'arrays'],
  },
  {
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    description:
      'You are climbing a staircase with `n` steps. Each time you can climb either 1 or 2 steps. Return the number ' +
      'of distinct ways to reach the top.',
    constraints: ['1 <= n <= 45'],
    signature: { functionName: 'climbStairs', params: [{ name: 'n', type: 'int' }], returnType: 'int' },
    examples: [ex([2], 2, '1+1 or 2'), ex([3], 3, '1+1+1, 1+2 or 2+1')],
    publicTestCases: [tc([2], 2), tc([3], 3)],
    hiddenTestCases: [tc([1], 1), tc([5], 8), tc([10], 89)],
    tags: ['dynamic programming'],
  },
  {
    title: 'Merge Two Sorted Arrays',
    difficulty: 'Easy',
    description:
      'Given two integer arrays `nums1` and `nums2`, each sorted in non-decreasing order, return a single array ' +
      'containing all their elements in non-decreasing order.',
    constraints: ['1 <= nums1.length, nums2.length <= 10^4', 'Each array is sorted in non-decreasing order'],
    signature: {
      functionName: 'mergeArrays',
      params: [
        { name: 'nums1', type: 'int[]' },
        { name: 'nums2', type: 'int[]' },
      ],
      returnType: 'int[]',
    },
    examples: [ex([[1, 3, 5], [2, 4, 6]], [1, 2, 3, 4, 5, 6]), ex([[5], [1, 2, 3]], [1, 2, 3, 5])],
    publicTestCases: [tc([[1, 3, 5], [2, 4, 6]], [1, 2, 3, 4, 5, 6]), tc([[5], [1, 2, 3]], [1, 2, 3, 5])],
    hiddenTestCases: [
      tc([[1, 2, 3], [4, 5, 6]], [1, 2, 3, 4, 5, 6]),
      tc([[-5, 0, 10], [-3, 2, 8]], [-5, -3, 0, 2, 8, 10]),
      tc([[1, 1, 1], [1, 1]], [1, 1, 1, 1, 1]),
    ],
    tags: ['arrays'],
  },
  {
    title: 'First Unique Character',
    difficulty: 'Easy',
    description:
      'Given a string `s` of lowercase letters, return the index of the first character that appears exactly once. ' +
      'If every character repeats, return `-1`.',
    constraints: ['1 <= s.length <= 10^5', 's consists of lowercase English letters only'],
    signature: { functionName: 'firstUniqChar', params: [{ name: 's', type: 'string' }], returnType: 'int' },
    examples: [ex(['leetcode'], 0), ex(['aabb'], -1)],
    publicTestCases: [tc(['leetcode'], 0), tc(['aabb'], -1)],
    hiddenTestCases: [tc(['z'], 0), tc(['aabbc'], 4), tc(['abcabcd'], 6)],
    tags: ['strings', 'hashing'],
  },

  // --- Medium ---
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: 'Given a string `s`, return the length of the longest substring that contains no repeated characters.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of printable ASCII characters'],
    signature: {
      functionName: 'lengthOfLongestSubstring',
      params: [{ name: 's', type: 'string' }],
      returnType: 'int',
    },
    examples: [ex(['abcabcbb'], 3, '"abc" is the longest substring without repeats'), ex(['bbbbb'], 1)],
    publicTestCases: [tc(['abcabcbb'], 3), tc(['bbbbb'], 1)],
    hiddenTestCases: [tc(['pwwkew'], 3), tc(['dvdf'], 3), tc([''], 0)],
    tags: ['sliding window', 'strings', 'hashing'],
  },
  {
    title: '3Sum Zero',
    difficulty: 'Medium',
    description:
      'Given an integer array `nums`, return every unique triplet `[a, b, c]` of values from different positions ' +
      'such that `a + b + c == 0`.\n\nThe answer must not contain duplicate triplets. You may return the triplets, ' +
      'and the values inside each triplet, in any order.',
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    signature: { functionName: 'threeSum', params: [{ name: 'nums', type: 'int[]' }], returnType: 'list<list<int>>' },
    outputOrder: 'any',
    examples: [
      ex(
        [[-1, 0, 1, 2, -1, -4]],
        [
          [-1, -1, 2],
          [-1, 0, 1],
        ]
      ),
      ex([[0, 0, 0]], [[0, 0, 0]]),
    ],
    publicTestCases: [
      tc(
        [[-1, 0, 1, 2, -1, -4]],
        [
          [-1, -1, 2],
          [-1, 0, 1],
        ]
      ),
      tc([[0, 0, 0]], [[0, 0, 0]]),
    ],
    hiddenTestCases: [tc([[1, 2, -2, -1]], []), tc([[-2, 0, 0, 2, 2]], [[-2, 0, 2]])],
    tags: ['arrays', 'two pointers', 'sorting'],
  },
  {
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    description:
      'Given an integer array `nums` and an integer `k`, return the number of contiguous, non-empty subarrays whose ' +
      'elements sum to exactly `k`.',
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000'],
    signature: {
      functionName: 'subarraySum',
      params: [
        { name: 'nums', type: 'int[]' },
        { name: 'k', type: 'int' },
      ],
      returnType: 'int',
    },
    examples: [ex([[1, 1, 1], 2], 2), ex([[1, 2, 3], 3], 2)],
    publicTestCases: [tc([[1, 1, 1], 2], 2), tc([[1, 2, 3], 3], 2)],
    hiddenTestCases: [tc([[1, -1, 0], 0], 3), tc([[3, 4, 7, 2, -3, 1, 4, 2], 7], 4)],
    tags: ['prefix sum', 'hashing', 'arrays'],
  },
  {
    title: 'Group Anagrams',
    difficulty: 'Medium',
    description:
      'Given an array of lowercase strings `strs`, group the strings that are anagrams of each other.\n\n' +
      'You may return the groups, and the strings inside each group, in any order.',
    constraints: ['1 <= strs.length <= 10^4', '1 <= strs[i].length <= 20'],
    signature: {
      functionName: 'groupAnagrams',
      params: [{ name: 'strs', type: 'string[]' }],
      returnType: 'list<list<string>>',
    },
    outputOrder: 'any',
    examples: [
      ex([['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], [['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]),
      ex([['a']], [['a']]),
    ],
    publicTestCases: [
      tc([['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], [['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]),
      tc([['a']], [['a']]),
    ],
    hiddenTestCases: [tc([['ab', 'ba']], [['ab', 'ba']]), tc([['abc', 'bca', 'xyz', 'cab']], [['abc', 'bca', 'cab'], ['xyz']])],
    tags: ['hashing', 'strings', 'sorting'],
  },
  {
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    description:
      "Given the `root` of a binary tree, return the level-order traversal of its nodes' values: each level from " +
      'left to right, top level first.\n\n' +
      'Trees in test cases are written in level order, with `null` for a missing child.',
    constraints: ['0 <= number of nodes <= 2000', '-1000 <= Node.val <= 1000'],
    signature: {
      functionName: 'levelOrder',
      params: [{ name: 'root', type: 'TreeNode' }],
      returnType: 'list<list<int>>',
    },
    examples: [ex([[3, 9, 20, null, null, 15, 7]], [[3], [9, 20], [15, 7]]), ex([[1]], [[1]])],
    publicTestCases: [tc([[3, 9, 20, null, null, 15, 7]], [[3], [9, 20], [15, 7]]), tc([[1]], [[1]])],
    hiddenTestCases: [tc([[1, 2, 3, 4, null, null, 5]], [[1], [2, 3], [4, 5]]), tc([[]], [])],
    tags: ['trees', 'bfs', 'queue'],
  },
  {
    title: 'Number of Islands',
    difficulty: 'Medium',
    description:
      "Given an `m x n` grid of `'1'` (land) and `'0'` (water), return the number of islands.\n\n" +
      'An island is surrounded by water and formed by connecting adjacent land cells horizontally or vertically.',
    constraints: ['1 <= m, n <= 300', "grid[i][j] is '0' or '1'"],
    signature: { functionName: 'numIslands', params: [{ name: 'grid', type: 'char[][]' }], returnType: 'int' },
    examples: [
      ex(
        [
          [
            ['1', '1', '1', '1', '0'],
            ['1', '1', '0', '1', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '0', '0', '0'],
          ],
        ],
        1
      ),
      ex(
        [
          [
            ['1', '1', '0', '0', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '1', '0', '0'],
            ['0', '0', '0', '1', '1'],
          ],
        ],
        3
      ),
    ],
    publicTestCases: [
      tc(
        [
          [
            ['1', '1', '1', '1', '0'],
            ['1', '1', '0', '1', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '0', '0', '0'],
          ],
        ],
        1
      ),
      tc(
        [
          [
            ['1', '1', '0', '0', '0'],
            ['1', '1', '0', '0', '0'],
            ['0', '0', '1', '0', '0'],
            ['0', '0', '0', '1', '1'],
          ],
        ],
        3
      ),
    ],
    hiddenTestCases: [tc([[['0']]], 0), tc([[['1', '0', '1'], ['0', '1', '0'], ['1', '0', '1']]], 5)],
    tags: ['graphs', 'dfs', 'bfs'],
  },
  {
    title: 'Course Schedule',
    difficulty: 'Medium',
    description:
      'There are `numCourses` courses labeled `0` to `numCourses - 1`. `prerequisites[i] = [a, b]` means you must ' +
      'take course `b` before course `a`.\n\nReturn `true` if you can finish all courses, or `false` if a cycle ' +
      'makes it impossible.',
    constraints: ['1 <= numCourses <= 2000', '0 <= prerequisites.length <= 5000'],
    signature: {
      functionName: 'canFinish',
      params: [
        { name: 'numCourses', type: 'int' },
        { name: 'prerequisites', type: 'int[][]' },
      ],
      returnType: 'bool',
    },
    examples: [
      ex([2, [[1, 0]]], true, 'Take course 0, then course 1.'),
      ex(
        [
          2,
          [
            [1, 0],
            [0, 1],
          ],
        ],
        false,
        'Each course needs the other first.'
      ),
    ],
    publicTestCases: [
      tc([2, [[1, 0]]], true),
      tc(
        [
          2,
          [
            [1, 0],
            [0, 1],
          ],
        ],
        false
      ),
    ],
    hiddenTestCases: [
      tc([3, []], true),
      tc(
        [
          4,
          [
            [1, 0],
            [2, 1],
            [3, 2],
            [0, 3],
          ],
        ],
        false
      ),
    ],
    tags: ['graphs', 'dfs'],
  },
  {
    title: 'Kth Largest Element',
    difficulty: 'Medium',
    description:
      'Given an integer array `nums` and an integer `k`, return the `k`-th largest element in the array (`k = 1` ' +
      'is the largest). It is the k-th largest in sorted order, not the k-th distinct value.',
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    signature: {
      functionName: 'findKthLargest',
      params: [
        { name: 'nums', type: 'int[]' },
        { name: 'k', type: 'int' },
      ],
      returnType: 'int',
    },
    examples: [ex([[3, 2, 1, 5, 6, 4], 2], 5), ex([[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], 4)],
    publicTestCases: [tc([[3, 2, 1, 5, 6, 4], 2], 5), tc([[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], 4)],
    hiddenTestCases: [tc([[1], 1], 1), tc([[7, 7, 7, 1], 2], 7)],
    tags: ['heap', 'sorting'],
  },

  // --- Hard ---
  {
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    description:
      'You are given an array of `k` linked lists `lists`, each sorted in ascending order. Merge all of them into ' +
      'one sorted linked list and return it.\n\nLinked lists in test cases are written as arrays of their values.',
    constraints: ['0 <= k <= 10^4', '0 <= lists[i].length <= 500', 'Each list is sorted in ascending order'],
    signature: {
      functionName: 'mergeKLists',
      params: [{ name: 'lists', type: 'ListNode[]' }],
      returnType: 'ListNode',
    },
    examples: [
      ex(
        [
          [
            [1, 4, 5],
            [1, 3, 4],
            [2, 6],
          ],
        ],
        [1, 1, 2, 3, 4, 4, 5, 6]
      ),
      ex([[[]]], []),
    ],
    publicTestCases: [
      tc(
        [
          [
            [1, 4, 5],
            [1, 3, 4],
            [2, 6],
          ],
        ],
        [1, 1, 2, 3, 4, 4, 5, 6]
      ),
      tc([[[]]], []),
    ],
    hiddenTestCases: [tc([[[1], []]], [1]), tc([[[1, 2], [], [-3, 0]]], [-3, 0, 1, 2]), tc([[]], [])],
    tags: ['linked list', 'heap', 'divide and conquer'],
  },
  {
    title: 'Word Ladder',
    difficulty: 'Hard',
    description:
      'A transformation sequence from `beginWord` to `endWord` changes exactly one letter at each step, and every ' +
      'word after `beginWord` must be in `wordList`.\n\nReturn the number of words in the shortest such sequence ' +
      '(counting both ends), or `0` if none exists.',
    constraints: ['1 <= beginWord.length <= 10', 'All words have the same length and are lowercase'],
    signature: {
      functionName: 'ladderLength',
      params: [
        { name: 'beginWord', type: 'string' },
        { name: 'endWord', type: 'string' },
        { name: 'wordList', type: 'list<string>' },
      ],
      returnType: 'int',
    },
    examples: [
      ex(['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], 5, 'hit -> hot -> dot -> dog -> cog'),
      ex(['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], 0, 'endWord is not in wordList'),
    ],
    publicTestCases: [
      tc(['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']], 5),
      tc(['hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']], 0),
    ],
    hiddenTestCases: [tc(['a', 'c', ['a', 'b', 'c']], 2)],
    tags: ['bfs', 'graphs', 'shortest path'],
  },
  {
    title: 'N-Queens Count',
    difficulty: 'Hard',
    description:
      'Return the number of distinct ways to place `n` queens on an `n x n` chessboard so that no two queens ' +
      'attack each other (no shared row, column or diagonal).',
    constraints: ['1 <= n <= 9'],
    signature: { functionName: 'totalNQueens', params: [{ name: 'n', type: 'int' }], returnType: 'int' },
    examples: [ex([4], 2), ex([1], 1)],
    publicTestCases: [tc([4], 2), tc([1], 1)],
    hiddenTestCases: [tc([2], 0), tc([8], 92)],
    tags: ['backtracking'],
  },
  {
    title: 'Longest Increasing Path in Matrix',
    difficulty: 'Hard',
    description:
      'Given an `m x n` integer matrix, return the length of the longest strictly increasing path.\n\n' +
      'From each cell you can move up, down, left or right. You may not move diagonally or outside the matrix.',
    constraints: ['1 <= m, n <= 200', '0 <= matrix[i][j] <= 2^31 - 1'],
    signature: {
      functionName: 'longestIncreasingPath',
      params: [{ name: 'matrix', type: 'int[][]' }],
      returnType: 'int',
    },
    examples: [
      ex(
        [
          [
            [9, 9, 4],
            [6, 6, 8],
            [2, 1, 1],
          ],
        ],
        4,
        'The path 1 -> 2 -> 6 -> 9 has length 4'
      ),
      ex(
        [
          [
            [3, 4, 5],
            [3, 2, 6],
            [2, 2, 1],
          ],
        ],
        4
      ),
    ],
    publicTestCases: [
      tc(
        [
          [
            [9, 9, 4],
            [6, 6, 8],
            [2, 1, 1],
          ],
        ],
        4
      ),
      tc(
        [
          [
            [3, 4, 5],
            [3, 2, 6],
            [2, 2, 1],
          ],
        ],
        4
      ),
    ],
    hiddenTestCases: [tc([[[1]]], 1)],
    tags: ['dfs', 'dynamic programming', 'graphs'],
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    description:
      'Given `n` non-negative integers `height` describing an elevation map where each bar has width 1, return how ' +
      'much water it can trap after raining.',
    constraints: ['1 <= height.length <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    signature: { functionName: 'trap', params: [{ name: 'height', type: 'int[]' }], returnType: 'int' },
    examples: [ex([[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], 6), ex([[4, 2, 0, 3, 2, 5]], 9)],
    publicTestCases: [tc([[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], 6), tc([[4, 2, 0, 3, 2, 5]], 9)],
    hiddenTestCases: [tc([[1, 1, 1]], 0)],
    tags: ['two pointers', 'arrays'],
  },
];
