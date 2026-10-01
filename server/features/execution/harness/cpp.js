import { TYPES } from './types.js';
import { RESULT_MARKER, inputCountMessage } from './protocol.js';

// Hidden code placed BEFORE the player's Solution class. Kept short so
// compiler line numbers map back with a small offset.
const PRELUDE = `#include <bits/stdc++.h>
using namespace std;
struct ListNode { int val; ListNode *next; ListNode() : val(0), next(nullptr) {} ListNode(int x) : val(x), next(nullptr) {} ListNode(int x, ListNode *n) : val(x), next(n) {} };
struct TreeNode { int val; TreeNode *left; TreeNode *right; TreeNode() : val(0), left(nullptr), right(nullptr) {} TreeNode(int x) : val(x), left(nullptr), right(nullptr) {} TreeNode(int x, TreeNode *l, TreeNode *r) : val(x), left(l), right(r) {} };
`;

// Hidden code placed AFTER the player's Solution class: a tiny JSON reader,
// converters into the parameter types, and serializers for the result.
const HELPERS = `
namespace ca {
struct V { int t = 0; bool b = false; long long i = 0; double d = 0; string s; vector<V> a; };
struct Reader {
  const string& x; size_t p = 0;
  void ws() { while (p < x.size() && isspace((unsigned char)x[p])) p++; }
  V val() {
    ws(); V v;
    if (p >= x.size()) throw runtime_error("unexpected end of value");
    char c = x[p];
    if (c == '[') {
      p++; v.t = 4; ws();
      if (p < x.size() && x[p] == ']') { p++; return v; }
      while (true) {
        v.a.push_back(val()); ws();
        if (p < x.size() && x[p] == ',') { p++; continue; }
        if (p < x.size() && x[p] == ']') { p++; break; }
        throw runtime_error("expected , or ]");
      }
      return v;
    }
    if (c == '"') {
      p++; v.t = 3;
      while (p < x.size() && x[p] != '"') {
        if (x[p] == '\\\\' && p + 1 < x.size()) { p++; char e = x[p]; v.s += e == 'n' ? '\\n' : e == 't' ? '\\t' : e; }
        else v.s += x[p];
        p++;
      }
      if (p >= x.size()) throw runtime_error("unterminated string");
      p++; return v;
    }
    if (x.compare(p, 4, "true") == 0) { p += 4; v.t = 1; v.b = true; return v; }
    if (x.compare(p, 5, "false") == 0) { p += 5; v.t = 1; v.b = false; return v; }
    if (x.compare(p, 4, "null") == 0) { p += 4; v.t = 0; return v; }
    size_t st = p;
    while (p < x.size() && (isdigit((unsigned char)x[p]) || x[p] == '-' || x[p] == '+' || x[p] == '.' || x[p] == 'e' || x[p] == 'E')) p++;
    if (st == p) throw runtime_error(string("unexpected character '") + c + "'");
    string num = x.substr(st, p - st); v.t = 2;
    if (num.find_first_of(".eE") != string::npos) { v.d = stod(num); v.i = (long long)v.d; }
    else { v.i = stoll(num); v.d = (double)v.i; }
    return v;
  }
};
V parse(const string& line) {
  Reader r{line}; V v = r.val(); r.ws();
  if (r.p != line.size()) throw runtime_error("unexpected text after the value");
  return v;
}
void conv(const V& v, int& o) { o = (int)v.i; }
void conv(const V& v, long long& o) { o = v.i; }
void conv(const V& v, double& o) { o = v.d; }
void conv(const V& v, bool& o) { o = v.b; }
void conv(const V& v, string& o) { o = v.s; }
void conv(const V& v, char& o) { o = v.s.empty() ? '\\0' : v.s[0]; }
void conv(const V& v, ListNode*& o) {
  ListNode dummy; ListNode* t = &dummy;
  for (const V& e : v.a) { t->next = new ListNode((int)e.i); t = t->next; }
  o = dummy.next;
}
void conv(const V& v, TreeNode*& o) {
  o = nullptr;
  if (v.t != 4 || v.a.empty() || v.a[0].t == 0) return;
  o = new TreeNode((int)v.a[0].i);
  queue<TreeNode*> q; q.push(o); size_t k = 1;
  while (!q.empty() && k < v.a.size()) {
    TreeNode* n = q.front(); q.pop();
    if (k < v.a.size() && v.a[k].t != 0) { n->left = new TreeNode((int)v.a[k].i); q.push(n->left); }
    k++;
    if (k < v.a.size() && v.a[k].t != 0) { n->right = new TreeNode((int)v.a[k].i); q.push(n->right); }
    k++;
  }
}
template <class T> void conv(const V& v, vector<T>& o) {
  o.clear();
  for (const V& e : v.a) { T x{}; conv(e, x); o.push_back(x); }
}
string ser(int x) { return to_string(x); }
string ser(long long x) { return to_string(x); }
string ser(double x) { ostringstream os; os << setprecision(12) << x; return os.str(); }
string ser(bool x) { return x ? "true" : "false"; }
string ser(const string& x) {
  string r = "\\"";
  for (char c : x) { if (c == '"' || c == '\\\\') { r += '\\\\'; r += c; } else if (c == '\\n') r += "\\\\n"; else r += c; }
  return r + "\\"";
}
string ser(char c) { return ser(string(1, c)); }
string ser(ListNode* h) {
  string r = "["; int g = 0;
  while (h && g++ < 100000) { if (r.size() > 1) r += ","; r += to_string(h->val); h = h->next; }
  return r + "]";
}
string ser(TreeNode* root) {
  vector<string> out; queue<TreeNode*> q; q.push(root);
  while (!q.empty()) {
    TreeNode* n = q.front(); q.pop();
    if (n) { out.push_back(to_string(n->val)); q.push(n->left); q.push(n->right); }
    else out.push_back("null");
  }
  while (!out.empty() && out.back() == "null") out.pop_back();
  string r = "[";
  for (size_t i = 0; i < out.size(); i++) { if (i) r += ","; r += out[i]; }
  return r + "]";
}
template <class T> string ser(const vector<T>& v) {
  string r = "[";
  for (size_t i = 0; i < v.size(); i++) { if (i) r += ","; r += ser((T)v[i]); }
  return r + "]";
}
}  // namespace ca
`;

function mainFunction(signature) {
  const { params, functionName } = signature;
  const decls = params.map((p, i) => `  ${TYPES[p.type].cpp} a${i}{};`).join('\n');
  const reads = params.map((p, i) => `    ca::conv(ca::parse(L[${i}]), a${i});`).join('\n');
  const args = params.map((_, i) => `a${i}`).join(', ');
  return `
int main() {
  vector<string> L; string line;
  while (getline(cin, line)) { if (!line.empty() && line.back() == '\\r') line.pop_back(); L.push_back(line); }
  while (!L.empty() && L.back().find_first_not_of(" \\t") == string::npos) L.pop_back();
  if (L.size() < ${params.length}) { cerr << ${JSON.stringify(inputCountMessage(signature))} << " Got " << L.size() << "." << endl; return 3; }
${decls}
  try {
${reads}
  } catch (exception& e) { cerr << "Could not read the input: " << e.what() << endl; return 3; }
  Solution sol;
  auto result = sol.${functionName}(${args});
  cout << "\\n${RESULT_MARKER}" << ca::ser(result) << endl;
  return 0;
}
`;
}

export function buildCpp(signature, userCode) {
  const offset = PRELUDE.split('\n').length - 1;
  return {
    source: PRELUDE + userCode + '\n' + HELPERS + mainFunction(signature),
    offset,
    userLines: userCode.split('\n').length,
  };
}
