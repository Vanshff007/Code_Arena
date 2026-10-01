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
};
