// Editorial approach notes for the built-in problems. The solutions shown
// with them are the verified reference solutions (referenceSolutions.js);
// seedProblems.js combines the two.
import { PYTHON, CPP, JAVA } from './referenceSolutions.js';

export const APPROACHES = {
  'Two Sum (Index Pair)':
    'Walk the array once, keeping a hash map from value to index. For each number x, check whether target - x is already in the map: if so, those two indices are the answer.\n\nTime O(n), space O(n).',
  'Valid Parentheses':
    'Push every opening bracket onto a stack. For a closing bracket, the top of the stack must be the matching opener, otherwise the string is invalid. At the end the stack must be empty.\n\nTime O(n), space O(n).',
  'Reverse Integer':
    'Reverse the digits of |x| and restore the sign. If the result falls outside the 32-bit signed range [-2^31, 2^31 - 1], return 0. In languages with fixed-width integers, check for overflow before each multiply-by-10 step.\n\nTime O(log |x|).',
  'Binary Search Target':
    'Keep a window [lo, hi]. Compare the middle element with the target and discard the half that cannot contain it. Stop when found or when the window is empty.\n\nTime O(log n), space O(1).',
  'Climbing Stairs':
    'The ways to reach step n are the ways to reach n - 1 (then one step) plus the ways to reach n - 2 (then two steps). That is the Fibonacci recurrence; keep only the last two values.\n\nTime O(n), space O(1).',
  'Merge Two Sorted Arrays':
    'Use two pointers, one per array, and repeatedly take the smaller current element. When one array runs out, append the rest of the other. (Concatenating and sorting also passes here, at O(n log n).)\n\nTime O(n + m).',
  'First Unique Character':
    'Count every character in one pass, then scan the string again and return the first index whose character has count 1.\n\nTime O(n), space O(1) for a fixed alphabet.',
  'Longest Substring Without Repeating Characters':
    'Sliding window: remember the last index of each character. When the current character was seen inside the window, move the window start just past that index. Track the largest window size.\n\nTime O(n), space O(alphabet).',
  '3Sum Zero':
    'Sort the array. For each index i (skipping duplicate values), find pairs in the rest of the array that sum to -nums[i] with two pointers moving inward, skipping duplicates after each match.\n\nTime O(n^2), space O(1) besides the output.',
  'Subarray Sum Equals K':
    'Keep a running prefix sum and a map of how many times each prefix sum has appeared (starting with 0 once). A subarray ending here sums to k exactly when prefix - k appeared before, so add that count.\n\nTime O(n), space O(n).',
  'Group Anagrams':
    'Two words are anagrams when their sorted letters are equal. Use the sorted word (or a 26-letter count) as a hash key and group words under it.\n\nTime O(n * k log k) for n words of length k.',
  'Binary Tree Level Order Traversal':
    'Breadth-first search with a queue. Process the queue one level at a time: record its values, then enqueue the children for the next level.\n\nTime O(n), space O(width).',
  'Number of Islands':
    "Scan the grid. Each time you find unvisited land, count an island and flood-fill (DFS or BFS) every connected '1' so it is not counted again.\n\nTime O(m * n).",
  'Course Schedule':
    'Courses and prerequisites form a directed graph; all courses can be finished exactly when it has no cycle. Kahn\'s algorithm: repeatedly take courses with no remaining prerequisites. If every course gets taken, there is no cycle.\n\nTime O(V + E).',
  'Kth Largest Element':
    'Keep a min-heap of the k largest values seen so far; its top is the answer. (Quickselect averages O(n); sorting is O(n log n).)\n\nTime O(n log k), space O(k).',
  'Merge K Sorted Lists':
    'Put the head of every non-empty list in a min-heap. Repeatedly pop the smallest node, append it to the result and push its next node.\n\nTime O(N log k) for N nodes across k lists.',
  'Word Ladder':
    'Breadth-first search over words, where neighbours differ by one letter and are in the word list. BFS finds the shortest sequence; remove words from the set once visited.\n\nTime O(N * L * 26) for N words of length L.',
  'N-Queens Count':
    'Backtracking row by row. Track used columns and both diagonals (row - col and row + col); place a queen only where all three are free, and count complete placements.\n\nTime O(n!) worst case, fast for n <= 9.',
  'Longest Increasing Path in Matrix':
    'DFS from every cell with memoization: the longest path from a cell is 1 plus the best path from any larger neighbour. Each cell is computed once.\n\nTime O(m * n).',
  'Trapping Rain Water':
    'Water above a bar is min(highest bar to its left, highest to its right) minus its height. Two pointers from both ends: always move the side with the lower wall, since that wall is the limit for it.\n\nTime O(n), space O(1).',
};

export function editorialFor(title) {
  if (!APPROACHES[title]) return undefined;
  return {
    approach: APPROACHES[title],
    solutions: { python: PYTHON[title] ?? '', cpp: CPP[title] ?? '', java: JAVA[title] ?? '' },
  };
}
