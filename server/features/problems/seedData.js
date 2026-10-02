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

  // --- Added in 1.5.0: 14 Easy, 16 Medium, 10 Hard ---
  {
    title: 'Contains Duplicate',
    difficulty: 'Easy',
    description:
      'Given an integer array `nums`, return `true` if any value appears at least twice, and `false` if every ' +
      'element is distinct.',
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    signature: { functionName: 'containsDuplicate', params: [{ name: 'nums', type: 'int[]' }], returnType: 'bool' },
    examples: [
      ex([[1, 2, 3, 1]], true, '1 appears twice.'),
      ex([[1, 2, 3, 4]], false, 'All values are distinct.'),
    ],
    publicTestCases: [
      tc([[1, 2, 3, 1]], true),
      tc([[1, 2, 3, 4]], false),
    ],
    hiddenTestCases: [
      tc([[1]], false),
      tc([[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], true),
      tc([[-5, 0, 5, -5]], true),
      tc([[1000000000, -1000000000]], false),
    ],
    tags: ['arrays', 'hashing'],
  },
  {
    title: 'Valid Anagram',
    difficulty: 'Easy',
    description:
      'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s` (it uses exactly the same letters, ' +
      'the same number of times), and `false` otherwise.',
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters'],
    signature: { functionName: 'isAnagram', params: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }], returnType: 'bool' },
    examples: [
      ex(['anagram', 'nagaram'], true),
      ex(['rat', 'car'], false),
    ],
    publicTestCases: [
      tc(['anagram', 'nagaram'], true),
      tc(['rat', 'car'], false),
    ],
    hiddenTestCases: [
      tc(['a', 'a'], true),
      tc(['ab', 'a'], false),
      tc(['aacc', 'ccac'], false),
      tc(['listen', 'silent'], true),
    ],
    tags: ['strings', 'hashing', 'sorting'],
  },
  {
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    description:
      'You are given an array `prices` where `prices[i]` is the price of a stock on day `i`. Choose one day to buy ' +
      'and a later day to sell. Return the maximum profit you can make, or `0` if no profit is possible.',
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    signature: { functionName: 'maxProfit', params: [{ name: 'prices', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[7, 1, 5, 3, 6, 4]], 5, 'Buy on day 1 (price 1) and sell on day 4 (price 6).'),
      ex([[7, 6, 4, 3, 1]], 0, 'Prices only fall, so no trade makes a profit.'),
    ],
    publicTestCases: [
      tc([[7, 1, 5, 3, 6, 4]], 5),
      tc([[7, 6, 4, 3, 1]], 0),
    ],
    hiddenTestCases: [
      tc([[1]], 0),
      tc([[2, 4, 1]], 2),
      tc([[3, 3, 5, 0, 0, 3, 1, 4]], 4),
      tc([[1, 2, 3, 4, 5]], 4),
    ],
    tags: ['arrays', 'greedy'],
  },
  {
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'Easy',
    description:
      'Given the `root` of a binary tree, return its maximum depth: the number of nodes on the longest path from ' +
      'the root down to a leaf.\n\nTrees are given in level order, with `null` for a missing child.',
    constraints: ['0 <= number of nodes <= 10^4', '-100 <= Node.val <= 100'],
    signature: { functionName: 'maxDepth', params: [{ name: 'root', type: 'TreeNode' }], returnType: 'int' },
    examples: [
      ex([[3, 9, 20, null, null, 15, 7]], 3, 'The longest path is 3 -> 20 -> 15 (or 7).'),
      ex([[1, null, 2]], 2),
    ],
    publicTestCases: [
      tc([[3, 9, 20, null, null, 15, 7]], 3),
      tc([[1, null, 2]], 2),
    ],
    hiddenTestCases: [
      tc([[]], 0),
      tc([[1]], 1),
      tc([[1, 2, 3, 4, null, null, 5, 6]], 4),
      tc([[1, 2, null, 3, null, 4, null, 5]], 5),
    ],
    tags: ['trees', 'dfs', 'recursion'],
  },
  {
    title: 'Invert Binary Tree',
    difficulty: 'Easy',
    description:
      'Given the `root` of a binary tree, mirror it (swap the left and right child of every node) and return its ' +
      'root.\n\nTrees are given and returned in level order, with `null` for a missing child.',
    constraints: ['0 <= number of nodes <= 100', '-100 <= Node.val <= 100'],
    signature: { functionName: 'invertTree', params: [{ name: 'root', type: 'TreeNode' }], returnType: 'TreeNode' },
    examples: [
      ex([[4, 2, 7, 1, 3, 6, 9]], [4, 7, 2, 9, 6, 3, 1]),
      ex([[2, 1, 3]], [2, 3, 1]),
    ],
    publicTestCases: [
      tc([[4, 2, 7, 1, 3, 6, 9]], [4, 7, 2, 9, 6, 3, 1]),
      tc([[2, 1, 3]], [2, 3, 1]),
    ],
    hiddenTestCases: [
      tc([[]], []),
      tc([[1]], [1]),
      tc([[1, 2]], [1, null, 2]),
      tc([[1, 2, 3, 4, null, null, 5]], [1, 3, 2, 5, null, null, 4]),
    ],
    tags: ['trees', 'dfs', 'recursion'],
  },
  {
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    description:
      'Given the `head` of a singly linked list, reverse the list and return the new head.\n\nLists are given and ' +
      'returned as arrays of values.',
    constraints: ['0 <= number of nodes <= 5000', '-5000 <= Node.val <= 5000'],
    signature: { functionName: 'reverseList', params: [{ name: 'head', type: 'ListNode' }], returnType: 'ListNode' },
    examples: [
      ex([[1, 2, 3, 4, 5]], [5, 4, 3, 2, 1]),
      ex([[1, 2]], [2, 1]),
    ],
    publicTestCases: [
      tc([[1, 2, 3, 4, 5]], [5, 4, 3, 2, 1]),
      tc([[1, 2]], [2, 1]),
    ],
    hiddenTestCases: [
      tc([[]], []),
      tc([[7]], [7]),
      tc([[3, 3, 1, -2]], [-2, 1, 3, 3]),
    ],
    tags: ['linked list', 'recursion'],
  },
  {
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description:
      'A phrase is a palindrome if, after turning all uppercase letters into lowercase and removing every character ' +
      'that is not a letter or digit, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if ' +
      'it is a palindrome.',
    constraints: ['1 <= s.length <= 2 * 10^5', 's consists of printable ASCII characters'],
    signature: { functionName: 'isPalindrome', params: [{ name: 's', type: 'string' }], returnType: 'bool' },
    examples: [
      ex(['A man, a plan, a canal: Panama'], true, '"amanaplanacanalpanama" reads the same both ways.'),
      ex(['race a car'], false, '"raceacar" is not a palindrome.'),
    ],
    publicTestCases: [
      tc(['A man, a plan, a canal: Panama'], true),
      tc(['race a car'], false),
    ],
    hiddenTestCases: [
      tc([' '], true),
      tc(['0P'], false),
      tc(['Was it a car or a cat I saw?'], true),
      tc(['ab_a'], true),
    ],
    tags: ['strings', 'two pointers'],
  },
  {
    title: 'Missing Number',
    difficulty: 'Easy',
    description:
      'Given an array `nums` containing `n` distinct numbers taken from the range `[0, n]`, return the one number ' +
      'in that range that is missing.',
    constraints: ['1 <= n <= 10^4', '0 <= nums[i] <= n', 'All numbers are distinct'],
    signature: { functionName: 'missingNumber', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[3, 0, 1]], 2, 'n = 3, so the range is [0, 3]; 2 is missing.'),
      ex([[0, 1]], 2),
    ],
    publicTestCases: [
      tc([[3, 0, 1]], 2),
      tc([[0, 1]], 2),
    ],
    hiddenTestCases: [
      tc([[9, 6, 4, 2, 3, 5, 7, 0, 1]], 8),
      tc([[0]], 1),
      tc([[1]], 0),
      tc([[1, 2, 3]], 0),
    ],
    tags: ['math', 'bit manipulation', 'arrays'],
  },
  {
    title: 'Single Number',
    difficulty: 'Easy',
    description:
      'Given a non-empty array of integers `nums`, every element appears twice except for one. Return that single ' +
      'one.\n\nTry to use only constant extra space.',
    constraints: ['1 <= nums.length <= 3 * 10^4', '-3 * 10^4 <= nums[i] <= 3 * 10^4', 'Every element appears twice except one'],
    signature: { functionName: 'singleNumber', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[2, 2, 1]], 1),
      ex([[4, 1, 2, 1, 2]], 4),
    ],
    publicTestCases: [
      tc([[2, 2, 1]], 1),
      tc([[4, 1, 2, 1, 2]], 4),
    ],
    hiddenTestCases: [
      tc([[1]], 1),
      tc([[-1, 5, 5]], -1),
      tc([[7, 3, 7, 9, 3]], 9),
    ],
    tags: ['bit manipulation', 'arrays'],
  },
  {
    title: 'Majority Element',
    difficulty: 'Easy',
    description:
      'Given an array `nums` of size `n`, return the majority element: the value that appears more than `n / 2` ' +
      'times. You may assume it always exists.',
    constraints: ['1 <= n <= 5 * 10^4', '-10^9 <= nums[i] <= 10^9', 'A majority element always exists'],
    signature: { functionName: 'majorityElement', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[3, 2, 3]], 3),
      ex([[2, 2, 1, 1, 1, 2, 2]], 2),
    ],
    publicTestCases: [
      tc([[3, 2, 3]], 3),
      tc([[2, 2, 1, 1, 1, 2, 2]], 2),
    ],
    hiddenTestCases: [
      tc([[1]], 1),
      tc([[6, 5, 5]], 5),
      tc([[-1, -1, 4, -1, 2]], -1),
    ],
    tags: ['arrays', 'hashing'],
  },
  {
    title: 'Move Zeroes',
    difficulty: 'Easy',
    description:
      'Given an integer array `nums`, move all `0`s to the end while keeping the relative order of the other ' +
      'elements. Return the resulting array.',
    constraints: ['1 <= nums.length <= 10^4', '-2^31 <= nums[i] <= 2^31 - 1'],
    signature: { functionName: 'moveZeroes', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int[]' },
    examples: [
      ex([[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]),
      ex([[0]], [0]),
    ],
    publicTestCases: [
      tc([[0, 1, 0, 3, 12]], [1, 3, 12, 0, 0]),
      tc([[0]], [0]),
    ],
    hiddenTestCases: [
      tc([[1, 2, 3]], [1, 2, 3]),
      tc([[0, 0, 1]], [1, 0, 0]),
      tc([[4, 0, 5, 0, 0, 6, -1]], [4, 5, 6, -1, 0, 0, 0]),
    ],
    tags: ['arrays', 'two pointers'],
  },
  {
    title: 'Fizz Buzz',
    difficulty: 'Easy',
    description:
      'Given an integer `n`, return a list of strings for the numbers 1 to `n`, where each entry is:\n\n- ' +
      '`"FizzBuzz"` if the number is divisible by 3 and 5,\n- `"Fizz"` if it is divisible by 3,\n- `"Buzz"` if it is ' +
      'divisible by 5,\n- otherwise the number itself as a string.',
    constraints: ['1 <= n <= 10^4'],
    signature: { functionName: 'fizzBuzz', params: [{ name: 'n', type: 'int' }], returnType: 'list<string>' },
    examples: [
      ex([3], ['1', '2', 'Fizz']),
      ex([5], ['1', '2', 'Fizz', '4', 'Buzz']),
    ],
    publicTestCases: [
      tc([3], ['1', '2', 'Fizz']),
      tc([5], ['1', '2', 'Fizz', '4', 'Buzz']),
    ],
    hiddenTestCases: [
      tc([1], ['1']),
      tc([15], ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz']),
      tc([16], ['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz', '16']),
    ],
    tags: ['math', 'strings'],
  },
  {
    title: 'Middle of the Linked List',
    difficulty: 'Easy',
    description:
      'Given the `head` of a singly linked list, return the list starting from its middle node. If there are two ' +
      'middle nodes, return the second one.\n\nLists are given and returned as arrays of values.',
    constraints: ['1 <= number of nodes <= 100', '1 <= Node.val <= 100'],
    signature: { functionName: 'middleNode', params: [{ name: 'head', type: 'ListNode' }], returnType: 'ListNode' },
    examples: [
      ex([[1, 2, 3, 4, 5]], [3, 4, 5], 'The middle node is 3.'),
      ex([[1, 2, 3, 4, 5, 6]], [4, 5, 6], 'There are two middle nodes, 3 and 4; return from the second.'),
    ],
    publicTestCases: [
      tc([[1, 2, 3, 4, 5]], [3, 4, 5]),
      tc([[1, 2, 3, 4, 5, 6]], [4, 5, 6]),
    ],
    hiddenTestCases: [
      tc([[1]], [1]),
      tc([[1, 2]], [2]),
      tc([[5, 4, 3, 2, 1, 9, 8]], [2, 1, 9, 8]),
    ],
    tags: ['linked list', 'two pointers'],
  },
  {
    title: 'Pascal\'s Triangle',
    difficulty: 'Easy',
    description:
      'Given an integer `numRows`, return the first `numRows` rows of Pascal\'s triangle. Each number is the sum of ' +
      'the two numbers directly above it.',
    constraints: ['1 <= numRows <= 30'],
    signature: { functionName: 'generate', params: [{ name: 'numRows', type: 'int' }], returnType: 'list<list<int>>' },
    examples: [
      ex([5], [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]),
      ex([1], [[1]]),
    ],
    publicTestCases: [
      tc([5], [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]),
      tc([1], [[1]]),
    ],
    hiddenTestCases: [
      tc([2], [[1], [1, 1]]),
      tc([7], [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1]]),
      tc([10], [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1], [1, 5, 10, 10, 5, 1], [1, 6, 15, 20, 15, 6, 1], [1, 7, 21, 35, 35, 21, 7, 1], [1, 8, 28, 56, 70, 56, 28, 8, 1], [1, 9, 36, 84, 126, 126, 84, 36, 9, 1]]),
    ],
    tags: ['arrays', 'dynamic programming'],
  },
  {
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    description:
      'Given an integer array `nums`, return an array `answer` where `answer[i]` is the product of all elements of ' +
      '`nums` except `nums[i]`.\n\nSolve it in O(n) time without using division.',
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'Every prefix and suffix product fits in a 32-bit integer'],
    signature: { functionName: 'productExceptSelf', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int[]' },
    examples: [
      ex([[1, 2, 3, 4]], [24, 12, 8, 6]),
      ex([[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]),
    ],
    publicTestCases: [
      tc([[1, 2, 3, 4]], [24, 12, 8, 6]),
      tc([[-1, 1, 0, -3, 3]], [0, 0, 9, 0, 0]),
    ],
    hiddenTestCases: [
      tc([[2, 3]], [3, 2]),
      tc([[0, 0]], [0, 0]),
      tc([[5, -2, 1, 3, -1]], [6, -15, 30, 10, -30]),
      tc([[1, 1, 1, 1]], [1, 1, 1, 1]),
    ],
    tags: ['arrays', 'prefix sum'],
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description:
      'Given an integer array `nums`, find the contiguous subarray (with at least one element) that has the largest ' +
      'sum, and return that sum.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    signature: { functionName: 'maxSubArray', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6, 'The subarray [4, -1, 2, 1] has the largest sum, 6.'),
      ex([[5, 4, -1, 7, 8]], 23),
    ],
    publicTestCases: [
      tc([[-2, 1, -3, 4, -1, 2, 1, -5, 4]], 6),
      tc([[5, 4, -1, 7, 8]], 23),
    ],
    hiddenTestCases: [
      tc([[1]], 1),
      tc([[-3, -1, -2]], -1),
      tc([[2, -1, 2, -1, 2]], 4),
      tc([[-2, 3, -4, 5, -1, 6]], 10),
    ],
    tags: ['arrays', 'dynamic programming', 'divide and conquer'],
  },
  {
    title: 'Top K Frequent Elements',
    difficulty: 'Medium',
    description:
      'Given an integer array `nums` and an integer `k`, return the `k` most frequent elements, in any order. The ' +
      'answer is guaranteed to be unique.',
    constraints: ['1 <= nums.length <= 10^5', '1 <= k <= number of distinct elements', 'The answer is unique'],
    signature: { functionName: 'topKFrequent', params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }], returnType: 'int[]' },
    outputOrder: 'any',
    examples: [
      ex([[1, 1, 1, 2, 2, 3], 2], [1, 2], '1 appears 3 times and 2 appears twice.'),
      ex([[1], 1], [1]),
    ],
    publicTestCases: [
      tc([[1, 1, 1, 2, 2, 3], 2], [1, 2]),
      tc([[1], 1], [1]),
    ],
    hiddenTestCases: [
      tc([[4, 4, 5, 5, 5, 6, 7, 7, 7, 7], 2], [7, 5]),
      tc([[-1, -1, 2], 1], [-1]),
      tc([[3, 0, 1, 0], 1], [0]),
      tc([[1, 2, 2, 3, 3, 3], 3], [3, 2, 1]),
    ],
    tags: ['hashing', 'heap', 'sorting'],
  },
  {
    title: 'Container With Most Water',
    difficulty: 'Medium',
    description:
      'You are given an array `height` of `n` vertical lines; line `i` goes from `(i, 0)` to `(i, height[i])`. Pick ' +
      'two lines that, with the x-axis, form a container holding the most water. Return that amount.',
    constraints: ['2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    signature: { functionName: 'maxArea', params: [{ name: 'height', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49, 'Lines at index 1 and 8 hold min(8, 7) * 7 = 49.'),
      ex([[1, 1]], 1),
    ],
    publicTestCases: [
      tc([[1, 8, 6, 2, 5, 4, 8, 3, 7]], 49),
      tc([[1, 1]], 1),
    ],
    hiddenTestCases: [
      tc([[4, 3, 2, 1, 4]], 16),
      tc([[1, 2, 1]], 2),
      tc([[0, 0]], 0),
      tc([[2, 3, 10, 5, 7, 8, 9]], 36),
    ],
    tags: ['arrays', 'two pointers', 'greedy'],
  },
  {
    title: 'Coin Change',
    difficulty: 'Medium',
    description:
      'Given coin denominations `coins` and a total `amount`, return the fewest coins needed to make up that ' +
      'amount, or `-1` if it cannot be made. You have an unlimited number of each coin.',
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    signature: { functionName: 'coinChange', params: [{ name: 'coins', type: 'int[]' }, { name: 'amount', type: 'int' }], returnType: 'int' },
    examples: [
      ex([[1, 2, 5], 11], 3, '11 = 5 + 5 + 1.'),
      ex([[2], 3], -1, '3 cannot be made from 2s.'),
    ],
    publicTestCases: [
      tc([[1, 2, 5], 11], 3),
      tc([[2], 3], -1),
    ],
    hiddenTestCases: [
      tc([[1], 0], 0),
      tc([[2, 5, 10, 1], 27], 4),
      tc([[186, 419, 83, 408], 6249], 20),
      tc([[3, 7], 5], -1),
    ],
    tags: ['dynamic programming', 'bfs'],
  },
  {
    title: 'House Robber',
    difficulty: 'Medium',
    description:
      'Houses along a street hold `nums[i]` money each. You cannot rob two adjacent houses (the alarm would go ' +
      'off). Return the most money you can rob.',
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    signature: { functionName: 'rob', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[1, 2, 3, 1]], 4, 'Rob houses 0 and 2: 1 + 3 = 4.'),
      ex([[2, 7, 9, 3, 1]], 12, 'Rob houses 0, 2 and 4: 2 + 9 + 1 = 12.'),
    ],
    publicTestCases: [
      tc([[1, 2, 3, 1]], 4),
      tc([[2, 7, 9, 3, 1]], 12),
    ],
    hiddenTestCases: [
      tc([[5]], 5),
      tc([[2, 1, 1, 2]], 4),
      tc([[0, 0, 0]], 0),
      tc([[6, 3, 10, 8, 2, 10, 3, 5, 10, 5, 3]], 39),
    ],
    tags: ['dynamic programming', 'arrays'],
  },
  {
    title: 'Rotting Oranges',
    difficulty: 'Medium',
    description:
      'In a grid, `0` is an empty cell, `1` a fresh orange and `2` a rotten orange. Every minute, each fresh orange ' +
      'next to (up, down, left, right) a rotten one becomes rotten.\n\nReturn the minutes until no fresh orange is ' +
      'left, or `-1` if that never happens.',
    constraints: ['1 <= m, n <= 10', 'grid[i][j] is 0, 1 or 2'],
    signature: { functionName: 'orangesRotting', params: [{ name: 'grid', type: 'int[][]' }], returnType: 'int' },
    examples: [
      ex([[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], 4),
      ex([[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], -1, 'The bottom-left orange can never be reached.'),
    ],
    publicTestCases: [
      tc([[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], 4),
      tc([[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], -1),
    ],
    hiddenTestCases: [
      tc([[[0, 2]]], 0),
      tc([[[0]]], 0),
      tc([[[1]]], -1),
      tc([[[2, 1, 0, 2], [1, 0, 1, 1], [1, 1, 0, 1]]], 3),
    ],
    tags: ['bfs', 'graphs', 'arrays'],
  },
  {
    title: 'Validate Binary Search Tree',
    difficulty: 'Medium',
    description:
      'Given the `root` of a binary tree, return `true` if it is a valid binary search tree: every node\'s left ' +
      'subtree holds only smaller values, its right subtree only larger values, and both subtrees are valid BSTs ' +
      'too.\n\nTrees are given in level order, with `null` for a missing child.',
    constraints: ['1 <= number of nodes <= 10^4', '-2^31 <= Node.val <= 2^31 - 1'],
    signature: { functionName: 'isValidBST', params: [{ name: 'root', type: 'TreeNode' }], returnType: 'bool' },
    examples: [
      ex([[2, 1, 3]], true),
      ex([[5, 1, 4, null, null, 3, 6]], false, '4 is in the right subtree of 5 but is smaller than 5.'),
    ],
    publicTestCases: [
      tc([[2, 1, 3]], true),
      tc([[5, 1, 4, null, null, 3, 6]], false),
    ],
    hiddenTestCases: [
      tc([[1]], true),
      tc([[2, 2, 2]], false),
      tc([[5, 4, 6, null, null, 3, 7]], false),
      tc([[8, 4, 12, 2, 6, 10, 14]], true),
    ],
    tags: ['trees', 'dfs', 'recursion'],
  },
  {
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    description:
      'An array of distinct integers sorted in increasing order was rotated at an unknown pivot (for example ' +
      '`[0,1,2,4,5,6,7]` became `[4,5,6,7,0,1,2]`). Given the rotated array `nums` and a `target`, return the index ' +
      'of `target`, or `-1` if it is not present.\n\nYour solution must run in O(log n) time.',
    constraints: ['1 <= nums.length <= 5000', 'All values are distinct', 'nums is a rotated sorted array'],
    signature: { functionName: 'search', params: [{ name: 'nums', type: 'int[]' }, { name: 'target', type: 'int' }], returnType: 'int' },
    examples: [
      ex([[4, 5, 6, 7, 0, 1, 2], 0], 4),
      ex([[4, 5, 6, 7, 0, 1, 2], 3], -1),
    ],
    publicTestCases: [
      tc([[4, 5, 6, 7, 0, 1, 2], 0], 4),
      tc([[4, 5, 6, 7, 0, 1, 2], 3], -1),
    ],
    hiddenTestCases: [
      tc([[1], 0], -1),
      tc([[1], 1], 0),
      tc([[3, 1], 1], 1),
      tc([[5, 6, 7, 8, 9, 1, 2, 3], 8], 3),
      tc([[6, 7, 1, 2, 3, 4, 5], 6], 0),
    ],
    tags: ['binary search', 'arrays'],
  },
  {
    title: 'Palindromic Substrings',
    difficulty: 'Medium',
    description:
      'Given a string `s`, return how many of its substrings are palindromes. Substrings at different positions ' +
      'count separately, even if they contain the same characters.',
    constraints: ['1 <= s.length <= 1000', 's consists of lowercase English letters'],
    signature: { functionName: 'countSubstrings', params: [{ name: 's', type: 'string' }], returnType: 'int' },
    examples: [
      ex(['abc'], 3, '"a", "b", "c".'),
      ex(['aaa'], 6, '"a", "a", "a", "aa", "aa", "aaa".'),
    ],
    publicTestCases: [
      tc(['abc'], 3),
      tc(['aaa'], 6),
    ],
    hiddenTestCases: [
      tc(['a'], 1),
      tc(['abba'], 6),
      tc(['racecar'], 10),
      tc(['abacdfgdcaba'], 14),
    ],
    tags: ['strings', 'dynamic programming', 'two pointers'],
  },
  {
    title: 'Daily Temperatures',
    difficulty: 'Medium',
    description:
      'Given daily temperatures `temperatures`, return an array `answer` where `answer[i]` is how many days after ' +
      'day `i` you must wait for a warmer temperature, or `0` if no warmer day comes.',
    constraints: ['1 <= temperatures.length <= 10^5', '30 <= temperatures[i] <= 100'],
    signature: { functionName: 'dailyTemperatures', params: [{ name: 'temperatures', type: 'int[]' }], returnType: 'int[]' },
    examples: [
      ex([[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]),
      ex([[30, 40, 50, 60]], [1, 1, 1, 0]),
    ],
    publicTestCases: [
      tc([[73, 74, 75, 71, 69, 72, 76, 73]], [1, 1, 4, 2, 1, 1, 0, 0]),
      tc([[30, 40, 50, 60]], [1, 1, 1, 0]),
    ],
    hiddenTestCases: [
      tc([[30, 60, 90]], [1, 1, 0]),
      tc([[90, 80, 70]], [0, 0, 0]),
      tc([[50]], [0]),
      tc([[55, 38, 53, 81, 61, 93, 97, 32, 43, 78]], [3, 1, 1, 2, 1, 1, 0, 1, 1, 0]),
    ],
    tags: ['stack', 'arrays'],
  },
  {
    title: 'Merge Intervals',
    difficulty: 'Medium',
    description:
      'Given an array of `intervals` where `intervals[i] = [start, end]`, merge all overlapping intervals and ' +
      'return the non-overlapping intervals that cover the same ranges, sorted by start.\n\nIntervals that touch ' +
      '(like `[1,4]` and `[4,5]`) overlap.',
    constraints: ['1 <= intervals.length <= 10^4', '0 <= start <= end <= 10^4'],
    signature: { functionName: 'merge', params: [{ name: 'intervals', type: 'int[][]' }], returnType: 'int[][]' },
    examples: [
      ex([[[1, 3], [2, 6], [8, 10], [15, 18]]], [[1, 6], [8, 10], [15, 18]], '[1,3] and [2,6] overlap and become [1,6].'),
      ex([[[1, 4], [4, 5]]], [[1, 5]]),
    ],
    publicTestCases: [
      tc([[[1, 3], [2, 6], [8, 10], [15, 18]]], [[1, 6], [8, 10], [15, 18]]),
      tc([[[1, 4], [4, 5]]], [[1, 5]]),
    ],
    hiddenTestCases: [
      tc([[[1, 4]]], [[1, 4]]),
      tc([[[1, 4], [0, 4]]], [[0, 4]]),
      tc([[[1, 4], [2, 3]]], [[1, 4]]),
      tc([[[5, 7], [1, 2], [3, 4], [6, 9], [2, 3]]], [[1, 4], [5, 9]]),
    ],
    tags: ['sorting', 'arrays'],
  },
  {
    title: 'Word Break',
    difficulty: 'Medium',
    description:
      'Given a string `s` and a list of words `wordDict`, return `true` if `s` can be split into a sequence of one ' +
      'or more dictionary words. A word may be used more than once.',
    constraints: ['1 <= s.length <= 300', '1 <= wordDict.length <= 1000', 'All words are distinct lowercase strings'],
    signature: { functionName: 'wordBreak', params: [{ name: 's', type: 'string' }, { name: 'wordDict', type: 'string[]' }], returnType: 'bool' },
    examples: [
      ex(['leetcode', ['leet', 'code']], true, '"leet" + "code".'),
      ex(['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], false),
    ],
    publicTestCases: [
      tc(['leetcode', ['leet', 'code']], true),
      tc(['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], false),
    ],
    hiddenTestCases: [
      tc(['applepenapple', ['apple', 'pen']], true),
      tc(['a', ['b']], false),
      tc(['aaaaaaa', ['aaaa', 'aaa']], true),
      tc(['cars', ['car', 'ca', 'rs']], true),
    ],
    tags: ['dynamic programming', 'strings', 'hashing'],
  },
  {
    title: 'Unique Paths',
    difficulty: 'Medium',
    description:
      'A robot starts at the top-left corner of an `m x n` grid and can only move right or down. Return the number ' +
      'of different paths to the bottom-right corner.',
    constraints: ['1 <= m, n <= 100', 'The answer fits in a 32-bit signed integer for the given tests'],
    signature: { functionName: 'uniquePaths', params: [{ name: 'm', type: 'int' }, { name: 'n', type: 'int' }], returnType: 'int' },
    examples: [
      ex([3, 7], 28),
      ex([3, 2], 3, 'Right-Down-Down, Down-Down-Right and Down-Right-Down.'),
    ],
    publicTestCases: [
      tc([3, 7], 28),
      tc([3, 2], 3),
    ],
    hiddenTestCases: [
      tc([1, 1], 1),
      tc([1, 10], 1),
      tc([7, 3], 28),
      tc([10, 10], 48620),
      tc([16, 16], 155117520),
    ],
    tags: ['dynamic programming', 'math'],
  },
  {
    title: 'Permutations',
    difficulty: 'Medium',
    description: 'Given an array `nums` of distinct integers, return all possible permutations, in any order.',
    constraints: ['1 <= nums.length <= 6', '-10 <= nums[i] <= 10', 'All integers are distinct'],
    signature: { functionName: 'permute', params: [{ name: 'nums', type: 'int[]' }], returnType: 'list<list<int>>' },
    outputOrder: 'any',
    examples: [
      ex([[1, 2, 3]], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]),
      ex([[0, 1]], [[0, 1], [1, 0]]),
    ],
    publicTestCases: [
      tc([[1, 2, 3]], [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]),
      tc([[0, 1]], [[0, 1], [1, 0]]),
    ],
    hiddenTestCases: [
      tc([[1]], [[1]]),
      tc([[5, -2, 7]], [[5, -2, 7], [5, 7, -2], [-2, 5, 7], [-2, 7, 5], [7, 5, -2], [7, -2, 5]]),
      tc([[1, 2, 3, 4]], [[1, 2, 3, 4], [1, 2, 4, 3], [1, 3, 2, 4], [1, 3, 4, 2], [1, 4, 2, 3], [1, 4, 3, 2], [2, 1, 3, 4], [2, 1, 4, 3], [2, 3, 1, 4], [2, 3, 4, 1], [2, 4, 1, 3], [2, 4, 3, 1], [3, 1, 2, 4], [3, 1, 4, 2], [3, 2, 1, 4], [3, 2, 4, 1], [3, 4, 1, 2], [3, 4, 2, 1], [4, 1, 2, 3], [4, 1, 3, 2], [4, 2, 1, 3], [4, 2, 3, 1], [4, 3, 1, 2], [4, 3, 2, 1]]),
    ],
    tags: ['backtracking', 'recursion'],
  },
  {
    title: 'Decode Ways',
    difficulty: 'Medium',
    description:
      'A message of letters was encoded as digits with `A -> "1"`, `B -> "2"`, ..., `Z -> "26"`. Given a digit ' +
      'string `s`, return the number of ways to decode it. A part may not start with `0` (so `"06"` is not valid).',
    constraints: ['1 <= s.length <= 100', 's contains only digits', 'The answer fits in a 32-bit integer'],
    signature: { functionName: 'numDecodings', params: [{ name: 's', type: 'string' }], returnType: 'int' },
    examples: [
      ex(['12'], 2, '"AB" (1 2) or "L" (12).'),
      ex(['226'], 3, '"BZ" (2 26), "VF" (22 6) or "BBF" (2 2 6).'),
    ],
    publicTestCases: [
      tc(['12'], 2),
      tc(['226'], 3),
    ],
    hiddenTestCases: [
      tc(['06'], 0),
      tc(['0'], 0),
      tc(['10'], 1),
      tc(['2101'], 1),
      tc(['11106'], 2),
      tc(['1111111111'], 89),
    ],
    tags: ['dynamic programming', 'strings'],
  },
  {
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    description:
      'Given two sorted arrays `nums1` and `nums2`, return the median of all their numbers together.\n\nAim for O(log ' +
      '(m + n)) time.',
    constraints: ['0 <= m, n <= 1000', '1 <= m + n <= 2000', '-10^6 <= nums1[i], nums2[i] <= 10^6'],
    signature: { functionName: 'findMedianSortedArrays', params: [{ name: 'nums1', type: 'int[]' }, { name: 'nums2', type: 'int[]' }], returnType: 'double' },
    examples: [
      ex([[1, 3], [2]], 2, 'Merged: [1, 2, 3], the median is 2.'),
      ex([[1, 2], [3, 4]], 2.5, 'Merged: [1, 2, 3, 4], the median is (2 + 3) / 2 = 2.5.'),
    ],
    publicTestCases: [
      tc([[1, 3], [2]], 2),
      tc([[1, 2], [3, 4]], 2.5),
    ],
    hiddenTestCases: [
      tc([[], [1]], 1),
      tc([[2], []], 2),
      tc([[0, 0], [0, 0]], 0),
      tc([[1, 4, 7, 9], [2, 3, 5]], 4),
      tc([[-5, 3, 6, 12, 15], [-12, -10, -6, -3, 4, 10]], 3),
    ],
    tags: ['binary search', 'arrays', 'divide and conquer'],
  },
  {
    title: 'Edit Distance',
    difficulty: 'Hard',
    description:
      'Given two strings `word1` and `word2`, return the minimum number of operations to turn `word1` into `word2`. ' +
      'One operation inserts, deletes or replaces a single character.',
    constraints: ['0 <= word1.length, word2.length <= 500', 'Both words consist of lowercase English letters'],
    signature: { functionName: 'minDistance', params: [{ name: 'word1', type: 'string' }, { name: 'word2', type: 'string' }], returnType: 'int' },
    examples: [
      ex(['horse', 'ros'], 3, 'horse -> rorse (replace h) -> rose (delete r) -> ros (delete e).'),
      ex(['intention', 'execution'], 5),
    ],
    publicTestCases: [
      tc(['horse', 'ros'], 3),
      tc(['intention', 'execution'], 5),
    ],
    hiddenTestCases: [
      tc(['', 'abc'], 3),
      tc(['abc', ''], 3),
      tc(['same', 'same'], 0),
      tc(['kitten', 'sitting'], 3),
      tc(['sunday', 'saturday'], 3),
    ],
    tags: ['dynamic programming', 'strings'],
  },
  {
    title: 'Largest Rectangle in Histogram',
    difficulty: 'Hard',
    description:
      'Given an array `heights` of bar heights in a histogram where every bar has width 1, return the area of the ' +
      'largest rectangle that fits inside the histogram.',
    constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4'],
    signature: { functionName: 'largestRectangleArea', params: [{ name: 'heights', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[2, 1, 5, 6, 2, 3]], 10, 'Bars 5 and 6 form a 5 x 2 rectangle of area 10.'),
      ex([[2, 4]], 4),
    ],
    publicTestCases: [
      tc([[2, 1, 5, 6, 2, 3]], 10),
      tc([[2, 4]], 4),
    ],
    hiddenTestCases: [
      tc([[1]], 1),
      tc([[0, 0]], 0),
      tc([[2, 2, 2, 2]], 8),
      tc([[6, 2, 5, 4, 5, 1, 6]], 12),
      tc([[1, 2, 3, 4, 5]], 9),
    ],
    tags: ['stack', 'arrays'],
  },
  {
    title: 'Minimum Window Substring',
    difficulty: 'Hard',
    description:
      'Given strings `s` and `t`, return the shortest substring of `s` that contains every character of `t`, ' +
      'including duplicates. If there is none, return the empty string. The answer is unique for every test.',
    constraints: ['1 <= s.length, t.length <= 10^5', 's and t consist of English letters'],
    signature: { functionName: 'minWindow', params: [{ name: 's', type: 'string' }, { name: 't', type: 'string' }], returnType: 'string' },
    examples: [
      ex(['ADOBECODEBANC', 'ABC'], 'BANC', '"BANC" holds A, B and C.'),
      ex(['a', 'aa'], '', 's has only one "a".'),
    ],
    publicTestCases: [
      tc(['ADOBECODEBANC', 'ABC'], 'BANC'),
      tc(['a', 'aa'], ''),
    ],
    hiddenTestCases: [
      tc(['a', 'a'], 'a'),
      tc(['ab', 'b'], 'b'),
      tc(['aaflslflsldkalskaaa', 'aaa'], 'aaa'),
      tc(['cabwefgewcwaefgcf', 'cae'], 'cwae'),
    ],
    tags: ['sliding window', 'strings', 'hashing'],
  },
  {
    title: 'Sliding Window Maximum',
    difficulty: 'Hard',
    description:
      'Given an array `nums` and a window size `k`, a window of `k` numbers slides from the left of the array to ' +
      'the right, one step at a time. Return the maximum of each window position.',
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4', '1 <= k <= nums.length'],
    signature: { functionName: 'maxSlidingWindow', params: [{ name: 'nums', type: 'int[]' }, { name: 'k', type: 'int' }], returnType: 'int[]' },
    examples: [
      ex([[1, 3, -1, -3, 5, 3, 6, 7], 3], [3, 3, 5, 5, 6, 7]),
      ex([[1], 1], [1]),
    ],
    publicTestCases: [
      tc([[1, 3, -1, -3, 5, 3, 6, 7], 3], [3, 3, 5, 5, 6, 7]),
      tc([[1], 1], [1]),
    ],
    hiddenTestCases: [
      tc([[9, 11], 2], [11]),
      tc([[4, -2], 2], [4]),
      tc([[7, 2, 4], 1], [7, 2, 4]),
      tc([[1, 3, 1, 2, 0, 5], 3], [3, 3, 2, 5]),
      tc([[10, 9, 8, 7, 6, 5], 4], [10, 9, 8]),
    ],
    tags: ['sliding window', 'queue', 'heap'],
  },
  {
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    description:
      'A path in a binary tree is a sequence of nodes where each pair of neighbours is connected by an edge, and no ' +
      'node appears twice. The path does not need to pass through the root.\n\nGiven the `root` of a binary tree, ' +
      'return the largest sum of node values along any non-empty path.\n\nTrees are given in level order, with `null` ' +
      'for a missing child.',
    constraints: ['1 <= number of nodes <= 3 * 10^4', '-1000 <= Node.val <= 1000'],
    signature: { functionName: 'maxPathSum', params: [{ name: 'root', type: 'TreeNode' }], returnType: 'int' },
    examples: [
      ex([[1, 2, 3]], 6, 'The path 2 -> 1 -> 3 sums to 6.'),
      ex([[-10, 9, 20, null, null, 15, 7]], 42, 'The path 15 -> 20 -> 7 sums to 42.'),
    ],
    publicTestCases: [
      tc([[1, 2, 3]], 6),
      tc([[-10, 9, 20, null, null, 15, 7]], 42),
    ],
    hiddenTestCases: [
      tc([[-3]], -3),
      tc([[2, -1]], 2),
      tc([[-2, -1]], -1),
      tc([[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], 48),
    ],
    tags: ['trees', 'dfs', 'dynamic programming'],
  },
  {
    title: 'Regular Expression Matching',
    difficulty: 'Hard',
    description:
      'Given a string `s` and a pattern `p`, implement matching with support for `.` and `*`:\n\n- `.` matches any ' +
      'single character.\n- `*` matches zero or more of the element right before it.\n\nThe pattern must match the ' +
      'whole string. Return `true` if it does.',
    constraints: ['1 <= s.length <= 20', '1 <= p.length <= 20', 's has lowercase letters; p has lowercase letters, . and *', 'Every * follows a valid character'],
    signature: { functionName: 'isMatch', params: [{ name: 's', type: 'string' }, { name: 'p', type: 'string' }], returnType: 'bool' },
    examples: [
      ex(['aa', 'a'], false, '"a" does not match the whole of "aa".'),
      ex(['aa', 'a*'], true, '"a*" repeats a twice.'),
    ],
    publicTestCases: [
      tc(['aa', 'a'], false),
      tc(['aa', 'a*'], true),
    ],
    hiddenTestCases: [
      tc(['ab', '.*'], true),
      tc(['aab', 'c*a*b'], true),
      tc(['mississippi', 'mis*is*p*.'], false),
      tc(['mississippi', 'mis*is*ip*.'], true),
      tc(['ab', '.*c'], false),
      tc(['aaa', 'a*a'], true),
    ],
    tags: ['dynamic programming', 'strings', 'recursion'],
  },
  {
    title: 'First Missing Positive',
    difficulty: 'Hard',
    description:
      'Given an unsorted integer array `nums`, return the smallest positive integer that is not in `nums`.\n\nAim for ' +
      'O(n) time and O(1) extra space.',
    constraints: ['1 <= nums.length <= 10^5', '-2^31 <= nums[i] <= 2^31 - 1'],
    signature: { functionName: 'firstMissingPositive', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[1, 2, 0]], 3),
      ex([[3, 4, -1, 1]], 2),
    ],
    publicTestCases: [
      tc([[1, 2, 0]], 3),
      tc([[3, 4, -1, 1]], 2),
    ],
    hiddenTestCases: [
      tc([[7, 8, 9, 11, 12]], 1),
      tc([[1]], 2),
      tc([[2]], 1),
      tc([[1, 1]], 2),
      tc([[2, 3, 4, 5, 1]], 6),
    ],
    tags: ['arrays', 'hashing'],
  },
  {
    title: 'Longest Valid Parentheses',
    difficulty: 'Hard',
    description:
      'Given a string `s` of `(` and `)` characters, return the length of the longest substring of well-formed ' +
      '(valid) parentheses.',
    constraints: ['0 <= s.length <= 3 * 10^4', 's[i] is ( or )'],
    signature: { functionName: 'longestValidParentheses', params: [{ name: 's', type: 'string' }], returnType: 'int' },
    examples: [
      ex(['(()'], 2, 'The longest valid substring is "()".'),
      ex([')()())'], 4, 'The longest valid substring is "()()".'),
    ],
    publicTestCases: [
      tc(['(()'], 2),
      tc([')()())'], 4),
    ],
    hiddenTestCases: [
      tc([''], 0),
      tc(['()(())'], 6),
      tc(['(((('], 0),
      tc(['()(()'], 2),
      tc([')(()())('], 6),
    ],
    tags: ['stack', 'dynamic programming', 'strings'],
  },
  {
    title: 'Burst Balloons',
    difficulty: 'Hard',
    description:
      'You have `n` balloons with numbers `nums[i]`. Bursting balloon `i` earns `nums[left] * nums[i] * ' +
      'nums[right]` coins, where `left` and `right` are its current neighbours (treat out-of-range neighbours as ' +
      'balloons with number 1). After a burst, its neighbours become adjacent.\n\nReturn the most coins you can ' +
      'collect by bursting all the balloons.',
    constraints: ['1 <= n <= 300', '0 <= nums[i] <= 100'],
    signature: { functionName: 'maxCoins', params: [{ name: 'nums', type: 'int[]' }], returnType: 'int' },
    examples: [
      ex([[3, 1, 5, 8]], 167, '3*1*5 + 3*5*8 + 1*3*8 + 1*8*1 = 167.'),
      ex([[1, 5]], 10),
    ],
    publicTestCases: [
      tc([[3, 1, 5, 8]], 167),
      tc([[1, 5]], 10),
    ],
    hiddenTestCases: [
      tc([[7]], 7),
      tc([[0, 0]], 0),
      tc([[2, 4, 3]], 33),
      tc([[9, 76, 64, 21, 97, 60]], 1086136),
    ],
    tags: ['dynamic programming', 'divide and conquer'],
  },
];
