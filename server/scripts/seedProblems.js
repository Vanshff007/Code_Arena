// Seeds the initial problem bank. Idempotent (skips any title that already
// exists), so it's safe to run on every fresh deployment - including this
// one, which already has the first 5 problems from an earlier session.
// Every test case here was verified against a reference solution before
// being added (see the session notes - an earlier hand-authored hidden test
// case shipped with a wrong expected output and was only caught by a real
// submission through the judge).
//
// Usage: npm run seed-problems
import mongoose from 'mongoose';
import env from '../config/env.js';
import Problem from '../models/Problem.model.js';
import User from '../models/User.model.js';

const problems = [
  // --- Easy ---
  {
    title: 'Two Sum (Index Pair)',
    difficulty: 'Easy',
    description:
      'You are given a line of space-separated integers representing an array `nums`, followed by a line containing an integer `target`.\n\n' +
      'Find the two distinct indices i and j such that nums[i] + nums[j] == target, and print them space-separated in increasing order.\n\n' +
      'You may assume exactly one valid pair exists.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists'],
    examples: [
      { input: '2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] == 9' },
      { input: '3 2 4\n6', output: '1 2', explanation: 'nums[1] + nums[2] == 6' },
    ],
    publicTestCases: [
      { input: '2 7 11 15\n9', output: '0 1' },
      { input: '3 2 4\n6', output: '1 2' },
    ],
    hiddenTestCases: [
      { input: '3 3\n6', output: '0 1' },
      { input: '1 5 3 8 2\n10', output: '3 4' },
      { input: '-3 4 3 90\n0', output: '0 2' },
    ],
    tags: ['arrays', 'hashing'],
  },
  {
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    description:
      'Given a string `s` containing only the characters (){}[], determine if the brackets are valid: every opening bracket must ' +
      'be closed by the same type of bracket, and in the correct order.\n\nPrint "true" if valid, otherwise print "false".',
    constraints: ['1 <= s.length <= 10^4', 's consists only of ()[]{}'],
    examples: [
      { input: '()[]{}', output: 'true' },
      { input: '(]', output: 'false' },
    ],
    publicTestCases: [
      { input: '()', output: 'true' },
      { input: '(]', output: 'false' },
    ],
    hiddenTestCases: [
      { input: '{[]}', output: 'true' },
      { input: '(((', output: 'false' },
      { input: '()[]{}', output: 'true' },
    ],
    tags: ['stack', 'strings'],
  },
  {
    title: 'Reverse Integer',
    difficulty: 'Easy',
    description:
      'Given a 32-bit signed integer `x`, print its digits reversed. If reversing `x` would overflow a signed 32-bit integer, print 0.',
    constraints: ['-2^31 <= x <= 2^31 - 1'],
    examples: [
      { input: '123', output: '321' },
      { input: '-123', output: '-321' },
    ],
    publicTestCases: [
      { input: '123', output: '321' },
      { input: '-123', output: '-321' },
    ],
    hiddenTestCases: [
      { input: '120', output: '21' },
      { input: '0', output: '0' },
      { input: '1534236469', output: '0' },
    ],
    tags: ['math'],
  },
  {
    title: 'Binary Search Target',
    difficulty: 'Easy',
    description:
      'Given a sorted array of unique integers `nums` and an integer `target`, print the index of `target` in `nums`, or -1 if it ' +
      'is not present. Your solution must run in O(log n) time.',
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted in strictly increasing order'],
    examples: [
      { input: '-1 0 3 5 9 12\n9', output: '4' },
      { input: '-1 0 3 5 9 12\n2', output: '-1' },
    ],
    publicTestCases: [
      { input: '-1 0 3 5 9 12\n9', output: '4' },
      { input: '-1 0 3 5 9 12\n2', output: '-1' },
    ],
    hiddenTestCases: [
      { input: '5\n5', output: '0' },
      { input: '1 2 3 4 5 6 7 8 9 10\n10', output: '9' },
      { input: '1 3 5 7\n4', output: '-1' },
    ],
    tags: ['binary search', 'arrays'],
  },
  {
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    description:
      'You are climbing a staircase with `n` steps. Each time you can climb either 1 or 2 steps. Print the number of distinct ways ' +
      'to reach the top.',
    constraints: ['1 <= n <= 45'],
    examples: [
      { input: '2', output: '2' },
      { input: '3', output: '3' },
    ],
    publicTestCases: [
      { input: '2', output: '2' },
      { input: '3', output: '3' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '5', output: '8' },
      { input: '10', output: '89' },
    ],
    tags: ['dynamic programming'],
  },
  {
    title: 'Merge Two Sorted Arrays',
    difficulty: 'Easy',
    description:
      'You are given two lines, each a space-separated list of integers already sorted in non-decreasing order. Print the two ' +
      'lists merged into a single sorted list, space-separated.',
    constraints: ['1 <= array length <= 10^4', 'Each array is individually sorted ascending'],
    examples: [
      { input: '1 3 5\n2 4 6', output: '1 2 3 4 5 6' },
      { input: '5\n1 2 3', output: '1 2 3 5' },
    ],
    publicTestCases: [
      { input: '1 3 5\n2 4 6', output: '1 2 3 4 5 6' },
      { input: '5\n1 2 3', output: '1 2 3 5' },
    ],
    hiddenTestCases: [
      { input: '1 2 3\n4 5 6', output: '1 2 3 4 5 6' },
      { input: '-5 0 10\n-3 2 8', output: '-5 -3 0 2 8 10' },
      { input: '1 1 1\n1 1', output: '1 1 1 1 1' },
    ],
    tags: ['arrays'],
  },
  {
    title: 'First Unique Character',
    difficulty: 'Easy',
    description:
      'Given a lowercase string `s`, print the index (0-based) of the first character that appears exactly once. If every ' +
      'character repeats, print -1.',
    constraints: ['1 <= s.length <= 10^5', 's consists of lowercase English letters only'],
    examples: [
      { input: 'leetcode', output: '0' },
      { input: 'aabb', output: '-1' },
    ],
    publicTestCases: [
      { input: 'leetcode', output: '0' },
      { input: 'aabb', output: '-1' },
    ],
    hiddenTestCases: [
      { input: 'z', output: '0' },
      { input: 'aabbc', output: '4' },
      { input: 'abcabcd', output: '6' },
    ],
    tags: ['strings', 'hashing'],
  },

  // --- Medium ---
  {
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description:
      'Given a string `s`, print the length of the longest contiguous substring that contains no repeated characters.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of printable ASCII characters'],
    examples: [
      { input: 'abcabcbb', output: '3', explanation: '"abc" is the longest substring without repeats' },
      { input: 'bbbbb', output: '1' },
    ],
    publicTestCases: [
      { input: 'abcabcbb', output: '3' },
      { input: 'bbbbb', output: '1' },
    ],
    hiddenTestCases: [
      { input: 'pwwkew', output: '3' },
      { input: 'dvdf', output: '3' },
    ],
    tags: ['sliding window', 'strings', 'hashing'],
  },
  {
    title: '3Sum Zero',
    difficulty: 'Medium',
    description:
      'Given a line of space-separated integers `nums`, find every unique triplet of values that sums to zero.\n\n' +
      'Print each triplet on its own line with its three values space-separated in ascending order. Order the triplets ' +
      'themselves by ascending (first value, then second, then third). If no triplet sums to zero, print nothing.',
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    examples: [
      { input: '-1 0 1 2 -1 -4', output: '-1 -1 2\n-1 0 1' },
      { input: '0 0 0', output: '0 0 0' },
    ],
    publicTestCases: [
      { input: '-1 0 1 2 -1 -4', output: '-1 -1 2\n-1 0 1' },
      { input: '0 0 0', output: '0 0 0' },
    ],
    hiddenTestCases: [
      { input: '1 2 -2 -1', output: ' ' },
      { input: '-2 0 0 2 2', output: '-2 0 2' },
    ],
    tags: ['arrays', 'two pointers', 'sorting'],
  },
  {
    title: 'Subarray Sum Equals K',
    difficulty: 'Medium',
    description:
      'You are given a line of space-separated integers `nums`, followed by a line with an integer `k`. Print the number of ' +
      'contiguous subarrays whose elements sum to exactly `k`.',
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000'],
    examples: [
      { input: '1 1 1\n2', output: '2' },
      { input: '1 2 3\n3', output: '2' },
    ],
    publicTestCases: [
      { input: '1 1 1\n2', output: '2' },
      { input: '1 2 3\n3', output: '2' },
    ],
    hiddenTestCases: [
      { input: '1 -1 0\n0', output: '3' },
      { input: '3 4 7 2 -3 1 4 2\n7', output: '4' },
    ],
    tags: ['prefix sum', 'hashing', 'arrays'],
  },
  {
    title: 'Group Anagrams',
    difficulty: 'Medium',
    description:
      'You are given a line of space-separated lowercase words. Group the words that are anagrams of one another.\n\n' +
      'Print one group per line, its words space-separated and sorted alphabetically within the group. Order the groups ' +
      'themselves by their printed line, ascending.',
    constraints: ['1 <= number of words <= 10^4', '1 <= word length <= 20'],
    examples: [
      { input: 'eat tea tan ate nat bat', output: 'ate eat tea\nbat\nnat tan' },
      { input: 'a', output: 'a' },
    ],
    publicTestCases: [
      { input: 'eat tea tan ate nat bat', output: 'ate eat tea\nbat\nnat tan' },
      { input: 'a', output: 'a' },
    ],
    hiddenTestCases: [{ input: 'ab ba', output: 'ab ba' }],
    tags: ['hashing', 'strings', 'sorting'],
  },
  {
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    description:
      'A binary tree is given as a level-order list of space-separated tokens, where "null" marks a missing child ' +
      '(the same encoding LeetCode uses: after any value, its next two tokens are its left then right child, skipping ' +
      'over already-terminated branches).\n\n' +
      'Print the tree\'s level-order traversal, one level per line, values space-separated top level first.',
    constraints: ['0 <= number of nodes <= 2000', '-1000 <= node value <= 1000'],
    examples: [
      { input: '3 9 20 null null 15 7', output: '3\n9 20\n15 7' },
      { input: '1', output: '1' },
    ],
    publicTestCases: [
      { input: '3 9 20 null null 15 7', output: '3\n9 20\n15 7' },
      { input: '1', output: '1' },
    ],
    hiddenTestCases: [{ input: '1 2 3 4 null null 5', output: '1\n2 3\n4 5' }],
    tags: ['trees', 'bfs', 'queue'],
  },
  {
    title: 'Number of Islands',
    difficulty: 'Medium',
    description:
      'You are given a grid: the first line has two integers `rows` and `cols`, followed by `rows` lines each containing a ' +
      'string of `cols` characters, \'1\' (land) or \'0\' (water).\n\n' +
      'An island is a group of \'1\'s connected horizontally or vertically. Print the number of islands.',
    constraints: ['1 <= rows, cols <= 300'],
    examples: [
      { input: '4 5\n11110\n11010\n11000\n00000', output: '1' },
      { input: '4 5\n11000\n11000\n00100\n00011', output: '3' },
    ],
    publicTestCases: [
      { input: '4 5\n11110\n11010\n11000\n00000', output: '1' },
      { input: '4 5\n11000\n11000\n00100\n00011', output: '3' },
    ],
    hiddenTestCases: [{ input: '1 1\n0', output: '0' }],
    tags: ['graphs', 'dfs', 'bfs'],
  },
  {
    title: 'Course Schedule',
    difficulty: 'Medium',
    description:
      'There are `numCourses` courses labeled 0 to numCourses-1. You are given the first line "numCourses numPrereqs", then ' +
      '`numPrereqs` lines each "a b" meaning course `a` requires course `b` to be completed first.\n\n' +
      'Print "true" if it is possible to finish all courses, or "false" if there is a cycle making it impossible.',
    constraints: ['1 <= numCourses <= 2000', '0 <= numPrereqs <= 5000'],
    examples: [
      { input: '2 1\n1 0', output: 'true' },
      { input: '2 2\n1 0\n0 1', output: 'false' },
    ],
    publicTestCases: [
      { input: '2 1\n1 0', output: 'true' },
      { input: '2 2\n1 0\n0 1', output: 'false' },
    ],
    hiddenTestCases: [
      { input: '3 0', output: 'true' },
      { input: '4 4\n1 0\n2 1\n3 2\n0 3', output: 'false' },
    ],
    tags: ['graphs', 'dfs'],
  },
  {
    title: 'Kth Largest Element',
    difficulty: 'Medium',
    description:
      'You are given a line of space-separated integers `nums`, followed by a line with an integer `k`. Print the k-th ' +
      'largest element in the array (k=1 means the largest element).',
    constraints: ['1 <= nums.length <= 10^4', '1 <= k <= nums.length'],
    examples: [
      { input: '3 2 1 5 6 4\n2', output: '5' },
      { input: '3 2 3 1 2 4 5 5 6\n4', output: '4' },
    ],
    publicTestCases: [
      { input: '3 2 1 5 6 4\n2', output: '5' },
      { input: '3 2 3 1 2 4 5 5 6\n4', output: '4' },
    ],
    hiddenTestCases: [{ input: '1\n1', output: '1' }],
    tags: ['heap', 'sorting'],
  },

  // --- Hard ---
  {
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    description:
      'The first line contains an integer `k`. Each of the next `k` lines represents one already-sorted list of ' +
      'space-separated integers, or a single "-" for an empty list.\n\n' +
      'Print all values from all lists merged into one fully sorted list, space-separated. If every list is empty, print nothing.',
    constraints: ['1 <= k <= 10^4', 'Each non-empty list is individually sorted ascending'],
    examples: [
      { input: '3\n1 4 5\n1 3 4\n2 6', output: '1 1 2 3 4 4 5 6' },
      { input: '1\n-', output: ' ' },
    ],
    publicTestCases: [
      { input: '3\n1 4 5\n1 3 4\n2 6', output: '1 1 2 3 4 4 5 6' },
      { input: '1\n-', output: ' ' },
    ],
    hiddenTestCases: [
      { input: '2\n1\n-', output: '1' },
      { input: '3\n1 2\n-\n-3 0', output: '-3 0 1 2' },
    ],
    tags: ['linked list', 'heap', 'divide and conquer'],
  },
  {
    title: 'Word Ladder',
    difficulty: 'Hard',
    description:
      'You are given `beginWord` on the first line, `endWord` on the second, and a space-separated `wordList` on the third. ' +
      'A transformation sequence changes exactly one letter per step, and every intermediate word must appear in `wordList`.\n\n' +
      'Print the number of words in the shortest transformation sequence from `beginWord` to `endWord` (inclusive of both ' +
      'endpoints), or 0 if no such sequence exists.',
    constraints: ['1 <= beginWord.length <= 10', 'All words are the same length and lowercase'],
    examples: [
      { input: 'hit\ncog\nhot dot dog lot log cog', output: '5' },
      { input: 'hit\ncog\nhot dot dog lot log', output: '0', explanation: 'endWord is not in wordList' },
    ],
    publicTestCases: [
      { input: 'hit\ncog\nhot dot dog lot log cog', output: '5' },
      { input: 'hit\ncog\nhot dot dog lot log', output: '0' },
    ],
    hiddenTestCases: [{ input: 'a\nc\na b c', output: '2' }],
    tags: ['bfs', 'graphs', 'shortest path'],
  },
  {
    title: 'N-Queens Count',
    difficulty: 'Hard',
    description:
      'Given an integer `n`, print the number of distinct ways to place `n` queens on an n x n chessboard so that no two ' +
      'queens attack each other (no shared row, column, or diagonal).',
    constraints: ['1 <= n <= 9'],
    examples: [
      { input: '4', output: '2' },
      { input: '1', output: '1' },
    ],
    publicTestCases: [
      { input: '4', output: '2' },
      { input: '1', output: '1' },
    ],
    hiddenTestCases: [
      { input: '2', output: '0' },
      { input: '8', output: '92' },
    ],
    tags: ['backtracking'],
  },
  {
    title: 'Longest Increasing Path in Matrix',
    difficulty: 'Hard',
    description:
      'You are given a grid: the first line has "rows cols", followed by `rows` lines each with `cols` space-separated ' +
      'integers.\n\nFrom any cell you may move to an adjacent cell (up/down/left/right) with a strictly greater value. ' +
      'Print the length of the longest such increasing path in the grid.',
    constraints: ['1 <= rows, cols <= 200'],
    examples: [
      { input: '3 3\n9 9 4\n6 6 8\n2 1 1', output: '4', explanation: 'The path 1 -> 2 -> 6 -> 9 has length 4' },
      { input: '3 3\n3 4 5\n3 2 6\n2 2 1', output: '4' },
    ],
    publicTestCases: [
      { input: '3 3\n9 9 4\n6 6 8\n2 1 1', output: '4' },
      { input: '3 3\n3 4 5\n3 2 6\n2 2 1', output: '4' },
    ],
    hiddenTestCases: [{ input: '1 1\n1', output: '1' }],
    tags: ['dfs', 'dynamic programming', 'graphs'],
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    description:
      'You are given a line of space-separated non-negative integers representing an elevation map, where each value is the ' +
      'width-1 bar height at that position. Print the total amount of water trapped between the bars after it rains.',
    constraints: ['1 <= heights.length <= 2 * 10^4', '0 <= heights[i] <= 10^5'],
    examples: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6' },
      { input: '4 2 0 3 2 5', output: '9' },
    ],
    publicTestCases: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', output: '6' },
      { input: '4 2 0 3 2 5', output: '9' },
    ],
    hiddenTestCases: [{ input: '1 1 1', output: '0' }],
    tags: ['two pointers', 'arrays'],
  },
];

async function seed() {
  await mongoose.connect(env.mongoUri);

  const owner = await User.findOne({ role: 'admin' }).select('_id');

  let created = 0;
  let skipped = 0;

  for (const p of problems) {
    const exists = await Problem.findOne({ title: p.title });
    if (exists) {
      skipped += 1;
      continue;
    }
    await Problem.create({ ...p, createdBy: owner?._id });
    created += 1;
    console.log(`Created "${p.title}" (${p.difficulty})`);
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped} (already existed).`);
  console.log(`Total problems in DB: ${await Problem.countDocuments()}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
