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
  'Contains Duplicate':
    'Put the numbers in a hash set. If the set ends up smaller than the array, some value was repeated. You can ' +
    'also stop early the first time a number is already in the set.\n\nTime O(n), space O(n).',
  'Valid Anagram':
    'Count the letters of `s`, then subtract the letters of `t`. They are anagrams exactly when every count ends ' +
    'at zero (and so the lengths match). Sorting both strings and comparing also works in O(n log n).\n\nTime O(n), ' +
    'space O(1) for a 26-letter alphabet.',
  'Best Time to Buy and Sell Stock':
    'Scan the days once, keeping the lowest price seen so far. Selling today gives `price - lowest`; keep the ' +
    'best of those.\n\nTime O(n), space O(1).',
  'Maximum Depth of Binary Tree':
    'An empty tree has depth 0. Otherwise the depth is 1 plus the larger depth of the two subtrees. A level-order ' +
    'BFS that counts levels works too and avoids deep recursion.\n\nTime O(n), space O(height).',
  'Invert Binary Tree':
    'Swap the two children of the root, then invert both subtrees the same way. Every node is visited once.\n\nTime ' +
    'O(n), space O(height).',
  'Reverse Linked List':
    'Walk the list with two pointers, `prev` and `current`. Point each node back at `prev`, then move both ' +
    'forward. When `current` runs out, `prev` is the new head.\n\nTime O(n), space O(1).',
  'Valid Palindrome':
    'Use two pointers from both ends. Skip characters that are not letters or digits, and compare the rest ' +
    'case-insensitively, moving inward. Any mismatch means it is not a palindrome.\n\nTime O(n), space O(1).',
  'Missing Number':
    'The numbers 0..n add up to n(n + 1) / 2. Subtract the sum of the array; what is left is the missing number. ' +
    'XOR-ing every index and value gives the same answer without any risk of overflow.\n\nTime O(n), space O(1).',
  'Single Number':
    'XOR all the numbers together. A value XOR-ed with itself is 0 and XOR is order-independent, so every pair ' +
    'cancels and only the single number remains.\n\nTime O(n), space O(1).',
  'Majority Element':
    'Boyer-Moore voting: keep a candidate and a counter. A matching value adds 1, any other subtracts 1, and at 0 ' +
    'the next value becomes the candidate. The majority outnumbers everything else combined, so it is the ' +
    'candidate at the end.\n\nTime O(n), space O(1).',
  'Move Zeroes':
    'Keep a write pointer. Copy every non-zero value to the write position in order, then fill the rest of the ' +
    'array with zeros. This works in place with no extra array.\n\nTime O(n), space O(1).',
  'Fizz Buzz':
    'Loop from 1 to n. Check divisibility by 15 first (or build the string from the "Fizz" and "Buzz" parts), ' +
    'then by 3, then by 5, and fall back to the number.\n\nTime O(n).',
  'Middle of the Linked List':
    'Slow and fast pointers: move one pointer by one node and the other by two. When the fast pointer reaches the ' +
    'end, the slow one is at the middle (the second middle for even lengths).\n\nTime O(n), space O(1).',
  'Pascal\'s Triangle':
    'Start from `[1]`. Each next row starts and ends with 1, and every inner value is the sum of the two ' +
    'neighbours above it in the previous row.\n\nTime O(numRows^2).',
  'Product of Array Except Self':
    'The answer at i is (product of everything left of i) times (product of everything right of i). Fill the ' +
    'output with prefix products in one pass, then multiply in suffix products in a backward pass.\n\nTime O(n), ' +
    'space O(1) besides the output.',
  'Maximum Subarray':
    'Kadane\'s algorithm: the best subarray ending at i either extends the best one ending at i - 1 or starts ' +
    'fresh at i, whichever is larger. Track the best value seen.\n\nTime O(n), space O(1).',
  'Top K Frequent Elements':
    'Count each value with a hash map. Then either keep a min-heap of size k over the counts, or bucket the ' +
    'values by frequency (a count is at most n) and read buckets from the highest down until you have k ' +
    'values.\n\nTime O(n log k) with a heap, O(n) with buckets.',
  'Container With Most Water':
    'Start with the widest container (both ends). The shorter line limits the water, and moving the taller line ' +
    'inward can never help, so always move the shorter one. Track the best area.\n\nTime O(n), space O(1).',
  'Coin Change':
    'Let dp[a] be the fewest coins for amount a, with dp[0] = 0. For each amount, try every coin c <= a: dp[a] = ' +
    'min(dp[a], dp[a - c] + 1). Amounts that stay "infinite" cannot be made. Greedy (largest coin first) is wrong ' +
    'for many coin sets.\n\nTime O(amount * coins), space O(amount).',
  'House Robber':
    'At each house you either rob it (plus the best up to two houses back) or skip it (keeping the best up to the ' +
    'previous house). best[i] = max(best[i - 1], best[i - 2] + nums[i]); two variables are enough.\n\nTime O(n), ' +
    'space O(1).',
  'Rotting Oranges':
    'Multi-source BFS: put every rotten orange in the queue at once, then process the queue one level (one ' +
    'minute) at a time, rotting fresh neighbours. Count the fresh oranges; if any remain when the queue empties, ' +
    'return -1.\n\nTime O(m * n).',
  'Validate Binary Search Tree':
    'Checking only each node against its children is not enough. Pass down the allowed range instead: the left ' +
    'child must be below the current value and the right child above it, while both stay inside the range from ' +
    'further up. An in-order traversal that must be strictly increasing works too.\n\nTime O(n), space O(height).',
  'Search in Rotated Sorted Array':
    'Binary search, but at each step one half [lo, mid] or [mid, hi] is always sorted. Check whether the target ' +
    'lies inside the sorted half; if so search there, otherwise search the other half.\n\nTime O(log n), space ' +
    'O(1).',
  'Palindromic Substrings':
    'Expand around centres. There are 2n - 1 centres (each character and each gap between two characters). From ' +
    'each centre, expand outward while both ends match, counting one palindrome per step.\n\nTime O(n^2), space ' +
    'O(1).',
  'Daily Temperatures':
    'Monotonic stack of indices whose warmer day has not been found yet, with temperatures decreasing from bottom ' +
    'to top. Each new day pops every colder day off the stack and fills in their wait time.\n\nTime O(n): every ' +
    'index is pushed and popped once.',
  'Merge Intervals':
    'Sort by start. Walk the intervals: if one starts before (or where) the last merged interval ends, extend ' +
    'that interval\'s end; otherwise start a new one.\n\nTime O(n log n) for the sort.',
  'Word Break':
    'Let ok[i] mean "the first i characters can be split". ok[0] is true, and ok[i] is true if some j < i has ' +
    'ok[j] true and s[j:i] is a dictionary word. Put the words in a hash set for fast lookups.\n\nTime O(n^2) ' +
    'lookups, space O(n).',
  'Unique Paths':
    'The paths into a cell are the paths into the cell above plus the cell to its left; the first row and column ' +
    'have one path each. One row of the table is enough. (In closed form, it is C(m + n - 2, m - 1).)\n\nTime O(m * ' +
    'n), space O(n).',
  'Permutations':
    'Backtracking: build a permutation one position at a time, choosing any number not used yet, recursing, then ' +
    'undoing the choice. Each complete path is one permutation.\n\nTime O(n * n!).',
  'Decode Ways':
    'Let ways[i] be the decodings of the first i digits. The last digit alone adds ways[i - 1] if it is not 0; ' +
    'the last two digits add ways[i - 2] if they form 10..26. Only the last two values are needed.\n\nTime O(n), ' +
    'space O(1).',
  'Median of Two Sorted Arrays':
    'Binary search on how many elements of the shorter array go into the left half. With i from A and j = (m + n ' +
    '+ 1) / 2 - i from B, the split is right when A[i-1] <= B[j] and B[j-1] <= A[i]. Then the median comes from ' +
    'the max of the left sides (and the min of the right sides for an even total).\n\nTime O(log min(m, n)), space ' +
    'O(1).',
  'Edit Distance':
    'Let d[i][j] be the distance between the first i letters of word1 and the first j of word2. If the letters ' +
    'match, d[i][j] = d[i-1][j-1]; otherwise 1 + the minimum of replace d[i-1][j-1], delete d[i-1][j] and insert ' +
    'd[i][j-1]. Row 0 and column 0 are i and j. Keep two rows.\n\nTime O(m * n), space O(n).',
  'Largest Rectangle in Histogram':
    'Keep a stack of bars with increasing heights, each with the leftmost index it can extend to. When a lower ' +
    'bar arrives, pop every taller bar: it cannot extend further right, so its rectangle is height * (current ' +
    'index - its start). A final 0-height bar flushes the stack.\n\nTime O(n), space O(n).',
  'Minimum Window Substring':
    'Sliding window with counts of what is still needed. Grow the right end until the window holds all of t, then ' +
    'shrink the left end while it still does, recording the shortest window. Then drop one needed character from ' +
    'the left and keep going.\n\nTime O(|s| + |t|).',
  'Sliding Window Maximum':
    'Keep a deque of indices whose values are decreasing. A new value removes smaller values from the back (they ' +
    'can never be a maximum again); the front drops out once it leaves the window. The front is always the ' +
    'current maximum.\n\nTime O(n), space O(k).',
  'Binary Tree Maximum Path Sum':
    'DFS returning the best downward path starting at each node: its value plus the better child path, counting a ' +
    'negative child path as 0. At each node, the best path that bends there is value + left + right; track the ' +
    'largest of those.\n\nTime O(n), space O(height).',
  'Regular Expression Matching':
    'Recursion with memoization on (position in s, position in p). If the next pattern element is followed by *, ' +
    'either skip it (use it zero times) or, if it matches the current character, consume one character and stay ' +
    'on the same element. Otherwise match one character and move both.\n\nTime O(|s| * |p|).',
  'First Missing Positive':
    'The answer is in 1..n + 1. Use the array itself as a hash table: swap each value v in 1..n into position v - ' +
    '1 until every slot holds its own value or a value that does not fit. Then the first index i with nums[i] != ' +
    'i + 1 gives the answer i + 1.\n\nTime O(n) (each swap places one value for good), space O(1).',
  'Longest Valid Parentheses':
    'Stack of indices, starting with -1 as the base. Push the index of every "(". For ")", pop; if the stack is ' +
    'now empty, push this index as the new base, otherwise the valid run ends here and has length i - top of ' +
    'stack.\n\nTime O(n), space O(n).',
  'Burst Balloons':
    'Think about the last balloon to burst instead of the first. Pad the array with 1 on both sides. For an open ' +
    'interval (l, r), if k is burst last its neighbours are l and r, so dp[l][r] = max over k of a[l] * a[k] * ' +
    'a[r] + dp[l][k] + dp[k][r]. Fill by increasing interval length.\n\nTime O(n^3), space O(n^2).',
};

export function editorialFor(title) {
  if (!APPROACHES[title]) return undefined;
  return {
    approach: APPROACHES[title],
    solutions: { python: PYTHON[title] ?? '', cpp: CPP[title] ?? '', java: JAVA[title] ?? '' },
  };
}
