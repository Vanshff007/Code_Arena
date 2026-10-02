// Known-correct solutions for the built-in problems. seed.test.js submits
// each one through the real judge and expects Accepted on every test case,
// which proves both the test data in seedData.js and the function harness.
//
// Python covers every problem; C++ and Java cover a set that between them
// uses every kind of parameter and return type in the bank (arrays, lists,
// grids, strings, booleans, TreeNode, ListNode).

export const PYTHON = {
  'Two Sum (Index Pair)': `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        seen = {}
        for i, x in enumerate(nums):
            if target - x in seen:
                return [seen[target - x], i]
            seen[x] = i
`,
  'Valid Parentheses': `class Solution:
    def isValid(self, s: str) -> bool:
        pairs = {')': '(', ']': '[', '}': '{'}
        stack = []
        for c in s:
            if c in pairs:
                if not stack or stack.pop() != pairs[c]:
                    return False
            else:
                stack.append(c)
        return not stack
`,
  'Reverse Integer': `class Solution:
    def reverse(self, x: int) -> int:
        r = int(str(abs(x))[::-1]) * (1 if x >= 0 else -1)
        return r if -2**31 <= r <= 2**31 - 1 else 0
`,
  'Binary Search Target': `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[mid] < target:
                lo = mid + 1
            else:
                hi = mid - 1
        return -1
`,
  'Climbing Stairs': `class Solution:
    def climbStairs(self, n: int) -> int:
        a, b = 1, 1
        for _ in range(n):
            a, b = b, a + b
        return a
`,
  'Merge Two Sorted Arrays': `class Solution:
    def mergeArrays(self, nums1: List[int], nums2: List[int]) -> List[int]:
        return sorted(nums1 + nums2)
`,
  'First Unique Character': `class Solution:
    def firstUniqChar(self, s: str) -> int:
        counts = Counter(s)
        for i, c in enumerate(s):
            if counts[c] == 1:
                return i
        return -1
`,
  'Longest Substring Without Repeating Characters': `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        last, start, best = {}, 0, 0
        for i, c in enumerate(s):
            if c in last and last[c] >= start:
                start = last[c] + 1
            last[c] = i
            best = max(best, i - start + 1)
        return best
`,
  '3Sum Zero': `class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()
        res = []
        for i in range(len(nums)):
            if i and nums[i] == nums[i - 1]:
                continue
            l, r = i + 1, len(nums) - 1
            while l < r:
                s = nums[i] + nums[l] + nums[r]
                if s == 0:
                    res.append([nums[r], nums[i], nums[l]])  # deliberately unsorted
                    l += 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
                elif s < 0:
                    l += 1
                else:
                    r -= 1
        return res[::-1]  # deliberately in a different order
`,
  'Subarray Sum Equals K': `class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        seen = defaultdict(int)
        seen[0] = 1
        total = count = 0
        for x in nums:
            total += x
            count += seen[total - k]
            seen[total] += 1
        return count
`,
  'Group Anagrams': `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for s in strs:
            groups[''.join(sorted(s))].append(s)
        return list(groups.values())
`,
  'Binary Tree Level Order Traversal': `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        res, level = [], [root] if root else []
        while level:
            res.append([n.val for n in level])
            level = [c for n in level for c in (n.left, n.right) if c]
        return res
`,
  'Number of Islands': `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        m, n = len(grid), len(grid[0])
        def sink(i, j):
            if 0 <= i < m and 0 <= j < n and grid[i][j] == '1':
                grid[i][j] = '0'
                for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    sink(i + di, j + dj)
        count = 0
        for i in range(m):
            for j in range(n):
                if grid[i][j] == '1':
                    count += 1
                    sink(i, j)
        return count
`,
  'Course Schedule': `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        indeg = [0] * numCourses
        graph = defaultdict(list)
        for a, b in prerequisites:
            graph[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        done = 0
        while q:
            c = q.popleft()
            done += 1
            for nxt in graph[c]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return done == numCourses
`,
  'Kth Largest Element': `class Solution:
    def findKthLargest(self, nums: List[int], k: int) -> int:
        return heapq.nlargest(k, nums)[-1]
`,
  'Merge K Sorted Lists': `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        values = []
        for node in lists:
            while node:
                values.append(node.val)
                node = node.next
        dummy = tail = ListNode()
        for v in sorted(values):
            tail.next = ListNode(v)
            tail = tail.next
        return dummy.next
`,
  'Word Ladder': `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        q = deque([(beginWord, 1)])
        seen = {beginWord}
        while q:
            w, d = q.popleft()
            if w == endWord:
                return d
            for i in range(len(w)):
                for c in 'abcdefghijklmnopqrstuvwxyz':
                    nw = w[:i] + c + w[i + 1:]
                    if nw in words and nw not in seen:
                        seen.add(nw)
                        q.append((nw, d + 1))
        return 0
`,
  'N-Queens Count': `class Solution:
    def totalNQueens(self, n: int) -> int:
        def place(r, cols, d1, d2):
            if r == n:
                return 1
            total = 0
            for c in range(n):
                if c not in cols and r - c not in d1 and r + c not in d2:
                    total += place(r + 1, cols | {c}, d1 | {r - c}, d2 | {r + c})
            return total
        return place(0, set(), set(), set())
`,
  'Longest Increasing Path in Matrix': `class Solution:
    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:
        m, n = len(matrix), len(matrix[0])
        @lru_cache(None)
        def best(i, j):
            res = 1
            for di, dj in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                a, b = i + di, j + dj
                if 0 <= a < m and 0 <= b < n and matrix[a][b] > matrix[i][j]:
                    res = max(res, 1 + best(a, b))
            return res
        return max(best(i, j) for i in range(m) for j in range(n))
`,
  'Trapping Rain Water': `class Solution:
    def trap(self, height: List[int]) -> int:
        l, r = 0, len(height) - 1
        lmax = rmax = water = 0
        while l < r:
            if height[l] < height[r]:
                lmax = max(lmax, height[l])
                water += lmax - height[l]
                l += 1
            else:
                rmax = max(rmax, height[r])
                water += rmax - height[r]
                r -= 1
        return water
`,
  'Contains Duplicate': `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        return len(set(nums)) != len(nums)
`,
  'Valid Anagram': `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return Counter(s) == Counter(t)
`,
  'Best Time to Buy and Sell Stock': `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        best, low = 0, float('inf')
        for p in prices:
            low = min(low, p)
            best = max(best, p - low)
        return best
`,
  'Maximum Depth of Binary Tree': `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
`,
  'Invert Binary Tree': `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if root:
            root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root
`,
  'Reverse Linked List': `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev = None
        while head:
            head.next, prev, head = prev, head, head.next
        return prev
`,
  'Valid Palindrome': `class Solution:
    def isPalindrome(self, s: str) -> bool:
        t = [c.lower() for c in s if c.isalnum()]
        return t == t[::-1]
`,
  'Missing Number': `class Solution:
    def missingNumber(self, nums: List[int]) -> int:
        n = len(nums)
        return n * (n + 1) // 2 - sum(nums)
`,
  'Single Number': `class Solution:
    def singleNumber(self, nums: List[int]) -> int:
        return reduce(lambda a, b: a ^ b, nums)
`,
  'Majority Element': `class Solution:
    def majorityElement(self, nums: List[int]) -> int:
        cand, count = 0, 0
        for x in nums:
            if count == 0:
                cand = x
            count += 1 if x == cand else -1
        return cand
`,
  'Move Zeroes': `class Solution:
    def moveZeroes(self, nums: List[int]) -> List[int]:
        k = 0
        for x in nums:
            if x != 0:
                nums[k] = x
                k += 1
        for i in range(k, len(nums)):
            nums[i] = 0
        return nums
`,
  'Fizz Buzz': `class Solution:
    def fizzBuzz(self, n: int) -> List[str]:
        out = []
        for i in range(1, n + 1):
            s = ('Fizz' if i % 3 == 0 else '') + ('Buzz' if i % 5 == 0 else '')
            out.append(s or str(i))
        return out
`,
  'Middle of the Linked List': `class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        slow = fast = head
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        return slow
`,
  'Pascal\'s Triangle': `class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        rows = [[1]]
        for _ in range(numRows - 1):
            prev = rows[-1]
            rows.append([1] + [prev[i] + prev[i + 1] for i in range(len(prev) - 1)] + [1])
        return rows
`,
  'Product of Array Except Self': `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        n = len(nums)
        out = [1] * n
        left = 1
        for i in range(n):
            out[i] = left
            left *= nums[i]
        right = 1
        for i in range(n - 1, -1, -1):
            out[i] *= right
            right *= nums[i]
        return out
`,
  'Maximum Subarray': `class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        best = cur = nums[0]
        for x in nums[1:]:
            cur = max(x, cur + x)
            best = max(best, cur)
        return best
`,
  'Top K Frequent Elements': `class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        return [x for x, _ in Counter(nums).most_common(k)]
`,
  'Container With Most Water': `class Solution:
    def maxArea(self, height: List[int]) -> int:
        i, j, best = 0, len(height) - 1, 0
        while i < j:
            best = max(best, (j - i) * min(height[i], height[j]))
            if height[i] < height[j]:
                i += 1
            else:
                j -= 1
        return best
`,
  'Coin Change': `class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        INF = amount + 1
        dp = [0] + [INF] * amount
        for a in range(1, amount + 1):
            for c in coins:
                if c <= a and dp[a - c] + 1 < dp[a]:
                    dp[a] = dp[a - c] + 1
        return dp[amount] if dp[amount] < INF else -1
`,
  'House Robber': `class Solution:
    def rob(self, nums: List[int]) -> int:
        take, skip = 0, 0
        for x in nums:
            take, skip = skip + x, max(take, skip)
        return max(take, skip)
`,
  'Rotting Oranges': `class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        m, n = len(grid), len(grid[0])
        q = deque((i, j) for i in range(m) for j in range(n) if grid[i][j] == 2)
        fresh = sum(row.count(1) for row in grid)
        minutes = 0
        while q and fresh:
            for _ in range(len(q)):
                i, j = q.popleft()
                for a, b in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                    if 0 <= a < m and 0 <= b < n and grid[a][b] == 1:
                        grid[a][b] = 2
                        fresh -= 1
                        q.append((a, b))
            minutes += 1
        return -1 if fresh else minutes
`,
  'Validate Binary Search Tree': `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def ok(node, lo, hi):
            if not node:
                return True
            if not (lo < node.val < hi):
                return False
            return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
        return ok(root, float('-inf'), float('inf'))
`,
  'Search in Rotated Sorted Array': `class Solution:
    def search(self, nums: List[int], target: int) -> int:
        lo, hi = 0, len(nums) - 1
        while lo <= hi:
            mid = (lo + hi) // 2
            if nums[mid] == target:
                return mid
            if nums[lo] <= nums[mid]:
                if nums[lo] <= target < nums[mid]:
                    hi = mid - 1
                else:
                    lo = mid + 1
            else:
                if nums[mid] < target <= nums[hi]:
                    lo = mid + 1
                else:
                    hi = mid - 1
        return -1
`,
  'Palindromic Substrings': `class Solution:
    def countSubstrings(self, s: str) -> int:
        n, count = len(s), 0
        for c in range(2 * n - 1):
            i, j = c // 2, c // 2 + c % 2
            while i >= 0 and j < n and s[i] == s[j]:
                count += 1
                i -= 1
                j += 1
        return count
`,
  'Daily Temperatures': `class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        out = [0] * len(temperatures)
        stack = []
        for i, t in enumerate(temperatures):
            while stack and temperatures[stack[-1]] < t:
                j = stack.pop()
                out[j] = i - j
            stack.append(i)
        return out
`,
  'Merge Intervals': `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        out = []
        for s, e in sorted(intervals):
            if out and s <= out[-1][1]:
                out[-1][1] = max(out[-1][1], e)
            else:
                out.append([s, e])
        return out
`,
  'Word Break': `class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        words = set(wordDict)
        ok = [True] + [False] * len(s)
        for i in range(1, len(s) + 1):
            ok[i] = any(ok[j] and s[j:i] in words for j in range(i))
        return ok[len(s)]
`,
  'Unique Paths': `class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        row = [1] * n
        for _ in range(m - 1):
            for j in range(1, n):
                row[j] += row[j - 1]
        return row[-1]
`,
  'Permutations': `class Solution:
    def permute(self, nums: List[int]) -> List[List[int]]:
        return [list(p) for p in permutations(nums)]
`,
  'Decode Ways': `class Solution:
    def numDecodings(self, s: str) -> int:
        prev, cur = 1, 0 if s[0] == '0' else 1
        for i in range(1, len(s)):
            nxt = 0
            if s[i] != '0':
                nxt += cur
            if 10 <= int(s[i - 1:i + 1]) <= 26:
                nxt += prev
            prev, cur = cur, nxt
        return cur
`,
  'Median of Two Sorted Arrays': `class Solution:
    def findMedianSortedArrays(self, nums1: List[int], nums2: List[int]) -> float:
        a, b = nums1, nums2
        if len(a) > len(b):
            a, b = b, a
        m, n = len(a), len(b)
        half = (m + n + 1) // 2
        lo, hi = 0, m
        while True:
            i = (lo + hi) // 2
            j = half - i
            al = a[i - 1] if i > 0 else float('-inf')
            ar = a[i] if i < m else float('inf')
            bl = b[j - 1] if j > 0 else float('-inf')
            br = b[j] if j < n else float('inf')
            if al <= br and bl <= ar:
                if (m + n) % 2:
                    return float(max(al, bl))
                return (max(al, bl) + min(ar, br)) / 2
            if al > br:
                hi = i - 1
            else:
                lo = i + 1
`,
  'Edit Distance': `class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        m, n = len(word1), len(word2)
        prev = list(range(n + 1))
        for i in range(1, m + 1):
            cur = [i] + [0] * n
            for j in range(1, n + 1):
                if word1[i - 1] == word2[j - 1]:
                    cur[j] = prev[j - 1]
                else:
                    cur[j] = 1 + min(prev[j - 1], prev[j], cur[j - 1])
            prev = cur
        return prev[n]
`,
  'Largest Rectangle in Histogram': `class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        stack, best = [], 0
        for i, h in enumerate(heights + [0]):
            start = i
            while stack and stack[-1][1] >= h:
                j, hj = stack.pop()
                best = max(best, hj * (i - j))
                start = j
            stack.append((start, h))
        return best
`,
  'Minimum Window Substring': `class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing = len(t)
        start, end, i = 0, 0, 0
        for j, c in enumerate(s, 1):
            if need[c] > 0:
                missing -= 1
            need[c] -= 1
            if missing == 0:
                while need[s[i]] < 0:
                    need[s[i]] += 1
                    i += 1
                if end == 0 or j - i < end - start:
                    start, end = i, j
                need[s[i]] += 1
                missing += 1
                i += 1
        return s[start:end]
`,
  'Sliding Window Maximum': `class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        dq, out = deque(), []
        for i, x in enumerate(nums):
            while dq and nums[dq[-1]] <= x:
                dq.pop()
            dq.append(i)
            if dq[0] <= i - k:
                dq.popleft()
            if i >= k - 1:
                out.append(nums[dq[0]])
        return out
`,
  'Binary Tree Maximum Path Sum': `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = float('-inf')
        def down(node):
            nonlocal best
            if not node:
                return 0
            l = max(down(node.left), 0)
            r = max(down(node.right), 0)
            best = max(best, node.val + l + r)
            return node.val + max(l, r)
        down(root)
        return best
`,
  'Regular Expression Matching': `class Solution:
    def isMatch(self, s: str, p: str) -> bool:
        @lru_cache(None)
        def m(i, j):
            if j == len(p):
                return i == len(s)
            first = i < len(s) and p[j] in (s[i], '.')
            if j + 1 < len(p) and p[j + 1] == '*':
                return m(i, j + 2) or (first and m(i + 1, j))
            return first and m(i + 1, j + 1)
        return m(0, 0)
`,
  'First Missing Positive': `class Solution:
    def firstMissingPositive(self, nums: List[int]) -> int:
        n = len(nums)
        for i in range(n):
            while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
                v = nums[i]
                nums[i], nums[v - 1] = nums[v - 1], v
        for i in range(n):
            if nums[i] != i + 1:
                return i + 1
        return n + 1
`,
  'Longest Valid Parentheses': `class Solution:
    def longestValidParentheses(self, s: str) -> int:
        stack, best = [-1], 0
        for i, c in enumerate(s):
            if c == '(':
                stack.append(i)
            else:
                stack.pop()
                if not stack:
                    stack.append(i)
                else:
                    best = max(best, i - stack[-1])
        return best
`,
  'Burst Balloons': `class Solution:
    def maxCoins(self, nums: List[int]) -> int:
        a = [1] + nums + [1]
        n = len(a)
        dp = [[0] * n for _ in range(n)]
        for gap in range(2, n):
            for l in range(n - gap):
                r = l + gap
                dp[l][r] = max(a[l] * a[k] * a[r] + dp[l][k] + dp[k][r] for k in range(l + 1, r))
        return dp[0][n - 1]
`,
};

export const CPP = {
  'Two Sum (Index Pair)': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            auto it = seen.find(target - nums[i]);
            if (it != seen.end()) return {it->second, i};
            seen[nums[i]] = i;
        }
        return {};
    }
};
`,
  'Valid Parentheses': `class Solution {
public:
    bool isValid(string s) {
        string st;
        for (char c : s) {
            if (c == '(' || c == '[' || c == '{') st.push_back(c);
            else {
                char want = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (st.empty() || st.back() != want) return false;
                st.pop_back();
            }
        }
        return st.empty();
    }
};
`,
  'Group Anagrams': `class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        map<string, vector<string>> g;
        for (auto& s : strs) { string k = s; sort(k.begin(), k.end()); g[k].push_back(s); }
        vector<vector<string>> res;
        for (auto& [k, v] : g) res.push_back(v);
        return res;
    }
};
`,
  'Binary Tree Level Order Traversal': `class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> res;
        if (!root) return res;
        queue<TreeNode*> q; q.push(root);
        while (!q.empty()) {
            int n = q.size(); vector<int> level;
            while (n--) {
                TreeNode* t = q.front(); q.pop(); level.push_back(t->val);
                if (t->left) q.push(t->left);
                if (t->right) q.push(t->right);
            }
            res.push_back(level);
        }
        return res;
    }
};
`,
  'Number of Islands': `class Solution {
    void sink(vector<vector<char>>& g, int i, int j) {
        if (i < 0 || j < 0 || i >= (int)g.size() || j >= (int)g[0].size() || g[i][j] != '1') return;
        g[i][j] = '0';
        sink(g, i + 1, j); sink(g, i - 1, j); sink(g, i, j + 1); sink(g, i, j - 1);
    }
public:
    int numIslands(vector<vector<char>>& grid) {
        int count = 0;
        for (int i = 0; i < (int)grid.size(); i++)
            for (int j = 0; j < (int)grid[0].size(); j++)
                if (grid[i][j] == '1') { count++; sink(grid, i, j); }
        return count;
    }
};
`,
  'Course Schedule': `class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> g(numCourses); vector<int> indeg(numCourses);
        for (auto& p : prerequisites) { g[p[1]].push_back(p[0]); indeg[p[0]]++; }
        queue<int> q;
        for (int i = 0; i < numCourses; i++) if (!indeg[i]) q.push(i);
        int done = 0;
        while (!q.empty()) { int c = q.front(); q.pop(); done++; for (int n : g[c]) if (--indeg[n] == 0) q.push(n); }
        return done == numCourses;
    }
};
`,
  'Merge K Sorted Lists': `class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        auto cmp = [](ListNode* a, ListNode* b) { return a->val > b->val; };
        priority_queue<ListNode*, vector<ListNode*>, decltype(cmp)> pq(cmp);
        for (auto l : lists) if (l) pq.push(l);
        ListNode dummy; ListNode* t = &dummy;
        while (!pq.empty()) { auto n = pq.top(); pq.pop(); t->next = n; t = n; if (n->next) pq.push(n->next); }
        return dummy.next;
    }
};
`,
  'Word Ladder': `class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        if (!words.count(endWord)) return 0;
        queue<pair<string, int>> q; q.push({beginWord, 1});
        while (!q.empty()) {
            auto [w, d] = q.front(); q.pop();
            if (w == endWord) return d;
            for (size_t i = 0; i < w.size(); i++) {
                string nw = w;
                for (char c = 'a'; c <= 'z'; c++) {
                    nw[i] = c;
                    if (words.count(nw)) { words.erase(nw); q.push({nw, d + 1}); }
                }
            }
        }
        return 0;
    }
};
`,
  'Invert Binary Tree': `class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if (!root) return nullptr;
        TreeNode* l = invertTree(root->left);
        root->left = invertTree(root->right);
        root->right = l;
        return root;
    }
};
`,
  'Reverse Linked List': `class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        ListNode* prev = nullptr;
        while (head) { ListNode* next = head->next; head->next = prev; prev = head; head = next; }
        return prev;
    }
};
`,
  'Fizz Buzz': `class Solution {
public:
    vector<string> fizzBuzz(int n) {
        vector<string> out;
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) out.push_back("FizzBuzz");
            else if (i % 3 == 0) out.push_back("Fizz");
            else if (i % 5 == 0) out.push_back("Buzz");
            else out.push_back(to_string(i));
        }
        return out;
    }
};
`,
  'Merge Intervals': `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> out;
        for (auto& iv : intervals) {
            if (!out.empty() && iv[0] <= out.back()[1]) out.back()[1] = max(out.back()[1], iv[1]);
            else out.push_back(iv);
        }
        return out;
    }
};
`,
  'Median of Two Sorted Arrays': `class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> all(nums1);
        all.insert(all.end(), nums2.begin(), nums2.end());
        sort(all.begin(), all.end());
        int n = all.size();
        return n % 2 ? all[n / 2] : (all[n / 2 - 1] + all[n / 2]) / 2.0;
    }
};
`,
  'Minimum Window Substring': `class Solution {
public:
    string minWindow(string s, string t) {
        vector<int> need(128, 0);
        for (char c : t) need[c]++;
        int missing = t.size(), start = 0, best = INT_MAX, i = 0;
        for (int j = 0; j < (int)s.size(); j++) {
            if (need[s[j]]-- > 0) missing--;
            while (missing == 0) {
                if (j - i + 1 < best) { best = j - i + 1; start = i; }
                if (++need[s[i++]] > 0) missing++;
            }
        }
        return best == INT_MAX ? "" : s.substr(start, best);
    }
};
`,
};

export const JAVA = {
  'Two Sum (Index Pair)': `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) return new int[] {j, i};
            seen.put(nums[i], i);
        }
        return new int[0];
    }
}
`,
  'Valid Parentheses': `import java.util.ArrayDeque;

public class Solution {
    public boolean isValid(String s) {
        ArrayDeque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                char want = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (st.isEmpty() || st.pop() != want) return false;
            }
        }
        return st.isEmpty();
    }
}
`,
  'Group Anagrams': `class Solution {
    public List<List<String>> groupAnagrams(String[] strs) {
        Map<String, List<String>> g = new HashMap<>();
        for (String s : strs) {
            char[] k = s.toCharArray(); Arrays.sort(k);
            g.computeIfAbsent(new String(k), x -> new ArrayList<>()).add(s);
        }
        return new ArrayList<>(g.values());
    }
}
`,
  'Binary Tree Level Order Traversal': `class Solution {
    public List<List<Integer>> levelOrder(TreeNode root) {
        List<List<Integer>> res = new ArrayList<>();
        if (root == null) return res;
        Queue<TreeNode> q = new LinkedList<>(); q.add(root);
        while (!q.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int n = q.size(); n > 0; n--) {
                TreeNode t = q.poll(); level.add(t.val);
                if (t.left != null) q.add(t.left);
                if (t.right != null) q.add(t.right);
            }
            res.add(level);
        }
        return res;
    }
}
`,
  'Number of Islands': `class Solution {
    public int numIslands(char[][] grid) {
        int count = 0;
        for (int i = 0; i < grid.length; i++)
            for (int j = 0; j < grid[0].length; j++)
                if (grid[i][j] == '1') { count++; sink(grid, i, j); }
        return count;
    }
    private void sink(char[][] g, int i, int j) {
        if (i < 0 || j < 0 || i >= g.length || j >= g[0].length || g[i][j] != '1') return;
        g[i][j] = '0';
        sink(g, i + 1, j); sink(g, i - 1, j); sink(g, i, j + 1); sink(g, i, j - 1);
    }
}
`,
  'Course Schedule': `class Solution {
    public boolean canFinish(int numCourses, int[][] prerequisites) {
        List<List<Integer>> g = new ArrayList<>();
        for (int i = 0; i < numCourses; i++) g.add(new ArrayList<>());
        int[] indeg = new int[numCourses];
        for (int[] p : prerequisites) { g.get(p[1]).add(p[0]); indeg[p[0]]++; }
        Deque<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.add(i);
        int done = 0;
        while (!q.isEmpty()) { int c = q.poll(); done++; for (int n : g.get(c)) if (--indeg[n] == 0) q.add(n); }
        return done == numCourses;
    }
}
`,
  'Merge K Sorted Lists': `class Solution {
    public ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
        for (ListNode l : lists) if (l != null) pq.add(l);
        ListNode dummy = new ListNode(0), t = dummy;
        while (!pq.isEmpty()) { ListNode n = pq.poll(); t.next = n; t = n; if (n.next != null) pq.add(n.next); }
        return dummy.next;
    }
}
`,
  'Word Ladder': `class Solution {
    public int ladderLength(String beginWord, String endWord, List<String> wordList) {
        Set<String> words = new HashSet<>(wordList);
        if (!words.contains(endWord)) return 0;
        Deque<String> q = new ArrayDeque<>(); q.add(beginWord);
        for (int d = 1; !q.isEmpty(); d++) {
            for (int n = q.size(); n > 0; n--) {
                String w = q.poll();
                if (w.equals(endWord)) return d;
                char[] cs = w.toCharArray();
                for (int i = 0; i < cs.length; i++) {
                    char old = cs[i];
                    for (char c = 'a'; c <= 'z'; c++) {
                        cs[i] = c; String nw = new String(cs);
                        if (words.remove(nw)) q.add(nw);
                    }
                    cs[i] = old;
                }
            }
        }
        return 0;
    }
}
`,
  'Invert Binary Tree': `class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) return null;
        TreeNode l = invertTree(root.left);
        root.left = invertTree(root.right);
        root.right = l;
        return root;
    }
}
`,
  'Reverse Linked List': `class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        while (head != null) { ListNode next = head.next; head.next = prev; prev = head; head = next; }
        return prev;
    }
}
`,
  'Fizz Buzz': `class Solution {
    public List<String> fizzBuzz(int n) {
        List<String> out = new ArrayList<>();
        for (int i = 1; i <= n; i++) {
            if (i % 15 == 0) out.add("FizzBuzz");
            else if (i % 3 == 0) out.add("Fizz");
            else if (i % 5 == 0) out.add("Buzz");
            else out.add(String.valueOf(i));
        }
        return out;
    }
}
`,
  'Merge Intervals': `class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        List<int[]> out = new ArrayList<>();
        for (int[] iv : intervals) {
            if (!out.isEmpty() && iv[0] <= out.get(out.size() - 1)[1]) {
                int[] last = out.get(out.size() - 1);
                last[1] = Math.max(last[1], iv[1]);
            } else {
                out.add(new int[] { iv[0], iv[1] });
            }
        }
        return out.toArray(new int[0][]);
    }
}
`,
  'Median of Two Sorted Arrays': `class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] all = new int[nums1.length + nums2.length];
        System.arraycopy(nums1, 0, all, 0, nums1.length);
        System.arraycopy(nums2, 0, all, nums1.length, nums2.length);
        Arrays.sort(all);
        int n = all.length;
        return n % 2 == 1 ? all[n / 2] : (all[n / 2 - 1] + all[n / 2]) / 2.0;
    }
}
`,
  'Minimum Window Substring': `class Solution {
    public String minWindow(String s, String t) {
        int[] need = new int[128];
        for (char c : t.toCharArray()) need[c]++;
        int missing = t.length(), start = 0, best = Integer.MAX_VALUE, i = 0;
        for (int j = 0; j < s.length(); j++) {
            if (need[s.charAt(j)]-- > 0) missing--;
            while (missing == 0) {
                if (j - i + 1 < best) { best = j - i + 1; start = i; }
                if (++need[s.charAt(i++)] > 0) missing++;
            }
        }
        return best == Integer.MAX_VALUE ? "" : s.substring(start, start + best);
    }
}
`,
};
