import { TYPES } from './types.js';
import { RESULT_MARKER, inputCountMessage } from './protocol.js';

// Imports always available to the player, like on LeetCode.
const PRELUDE_IMPORTS = ['import java.util.*;', 'import java.util.stream.*;', 'import java.io.*;'];

// Converter in CaH for each parameter type.
const CONVERTERS = {
  int: 'toInt',
  long: 'toLong',
  double: 'toDouble',
  bool: 'toBool',
  string: 'toStr',
  char: 'toChar',
  'int[]': 'toIntArr',
  'long[]': 'toLongArr',
  'double[]': 'toDoubleArr',
  'bool[]': 'toBoolArr',
  'string[]': 'toStrArr',
  'char[]': 'toCharArr',
  'int[][]': 'toInt2D',
  'char[][]': 'toChar2D',
  'string[][]': 'toStr2D',
  'list<int>': 'toIntList',
  'list<string>': 'toStrList',
  'list<list<int>>': 'toIntListList',
  'list<list<string>>': 'toStrListList',
  TreeNode: 'toTree',
  ListNode: 'toList',
  'ListNode[]': 'toListArr',
};

const HELPERS = `
class ListNode { int val; ListNode next; ListNode() {} ListNode(int val) { this.val = val; } ListNode(int val, ListNode next) { this.val = val; this.next = next; } }
class TreeNode { int val; TreeNode left; TreeNode right; TreeNode() {} TreeNode(int val) { this.val = val; } TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; } }

@SuppressWarnings("unchecked")
final class CaH {
  private final String x; private int p = 0;
  private CaH(String x) { this.x = x; }
  static Object parse(String line) {
    CaH h = new CaH(line); Object v = h.val(); h.ws();
    if (h.p != line.length()) throw new IllegalArgumentException("unexpected text after the value");
    return v;
  }
  private void ws() { while (p < x.length() && Character.isWhitespace(x.charAt(p))) p++; }
  private Object val() {
    ws();
    if (p >= x.length()) throw new IllegalArgumentException("unexpected end of value");
    char c = x.charAt(p);
    if (c == '[') {
      p++; List<Object> a = new ArrayList<>(); ws();
      if (p < x.length() && x.charAt(p) == ']') { p++; return a; }
      while (true) {
        a.add(val()); ws();
        if (p < x.length() && x.charAt(p) == ',') { p++; continue; }
        if (p < x.length() && x.charAt(p) == ']') { p++; break; }
        throw new IllegalArgumentException("expected , or ]");
      }
      return a;
    }
    if (c == '"') {
      p++; StringBuilder sb = new StringBuilder();
      while (p < x.length() && x.charAt(p) != '"') {
        char ch = x.charAt(p);
        if (ch == '\\\\' && p + 1 < x.length()) { p++; char e = x.charAt(p); sb.append(e == 'n' ? '\\n' : e == 't' ? '\\t' : e); }
        else sb.append(ch);
        p++;
      }
      if (p >= x.length()) throw new IllegalArgumentException("unterminated string");
      p++; return sb.toString();
    }
    if (x.startsWith("true", p)) { p += 4; return Boolean.TRUE; }
    if (x.startsWith("false", p)) { p += 5; return Boolean.FALSE; }
    if (x.startsWith("null", p)) { p += 4; return null; }
    int st = p;
    while (p < x.length() && "+-0123456789.eE".indexOf(x.charAt(p)) >= 0) p++;
    if (st == p) throw new IllegalArgumentException("unexpected character '" + c + "'");
    String n = x.substring(st, p);
    if (n.contains(".") || n.contains("e") || n.contains("E")) return Double.parseDouble(n);
    return Long.parseLong(n);
  }
  private static List<Object> arr(Object o) { return o == null ? new ArrayList<>() : (List<Object>) o; }
  static int toInt(Object o) { return ((Number) o).intValue(); }
  static long toLong(Object o) { return ((Number) o).longValue(); }
  static double toDouble(Object o) { return ((Number) o).doubleValue(); }
  static boolean toBool(Object o) { return (Boolean) o; }
  static String toStr(Object o) { return (String) o; }
  static char toChar(Object o) { String s = (String) o; return s.isEmpty() ? '\\0' : s.charAt(0); }
  static int[] toIntArr(Object o) { List<Object> a = arr(o); int[] r = new int[a.size()]; for (int i = 0; i < r.length; i++) r[i] = toInt(a.get(i)); return r; }
  static long[] toLongArr(Object o) { List<Object> a = arr(o); long[] r = new long[a.size()]; for (int i = 0; i < r.length; i++) r[i] = toLong(a.get(i)); return r; }
  static double[] toDoubleArr(Object o) { List<Object> a = arr(o); double[] r = new double[a.size()]; for (int i = 0; i < r.length; i++) r[i] = toDouble(a.get(i)); return r; }
  static boolean[] toBoolArr(Object o) { List<Object> a = arr(o); boolean[] r = new boolean[a.size()]; for (int i = 0; i < r.length; i++) r[i] = toBool(a.get(i)); return r; }
  static String[] toStrArr(Object o) { List<Object> a = arr(o); String[] r = new String[a.size()]; for (int i = 0; i < r.length; i++) r[i] = toStr(a.get(i)); return r; }
  static char[] toCharArr(Object o) { List<Object> a = arr(o); char[] r = new char[a.size()]; for (int i = 0; i < r.length; i++) r[i] = toChar(a.get(i)); return r; }
  static int[][] toInt2D(Object o) { List<Object> a = arr(o); int[][] r = new int[a.size()][]; for (int i = 0; i < r.length; i++) r[i] = toIntArr(a.get(i)); return r; }
  static char[][] toChar2D(Object o) { List<Object> a = arr(o); char[][] r = new char[a.size()][]; for (int i = 0; i < r.length; i++) r[i] = toCharArr(a.get(i)); return r; }
  static String[][] toStr2D(Object o) { List<Object> a = arr(o); String[][] r = new String[a.size()][]; for (int i = 0; i < r.length; i++) r[i] = toStrArr(a.get(i)); return r; }
  static List<Integer> toIntList(Object o) { List<Integer> r = new ArrayList<>(); for (Object e : arr(o)) r.add(toInt(e)); return r; }
  static List<String> toStrList(Object o) { List<String> r = new ArrayList<>(); for (Object e : arr(o)) r.add(toStr(e)); return r; }
  static List<List<Integer>> toIntListList(Object o) { List<List<Integer>> r = new ArrayList<>(); for (Object e : arr(o)) r.add(toIntList(e)); return r; }
  static List<List<String>> toStrListList(Object o) { List<List<String>> r = new ArrayList<>(); for (Object e : arr(o)) r.add(toStrList(e)); return r; }
  static ListNode toList(Object o) { ListNode d = new ListNode(0), t = d; for (Object e : arr(o)) { t.next = new ListNode(toInt(e)); t = t.next; } return d.next; }
  static ListNode[] toListArr(Object o) { List<Object> a = arr(o); ListNode[] r = new ListNode[a.size()]; for (int i = 0; i < r.length; i++) r[i] = toList(a.get(i)); return r; }
  static TreeNode toTree(Object o) {
    List<Object> a = arr(o);
    if (a.isEmpty() || a.get(0) == null) return null;
    TreeNode root = new TreeNode(toInt(a.get(0)));
    Deque<TreeNode> q = new ArrayDeque<>(); q.add(root); int k = 1;
    while (!q.isEmpty() && k < a.size()) {
      TreeNode n = q.poll();
      if (k < a.size() && a.get(k) != null) { n.left = new TreeNode(toInt(a.get(k))); q.add(n.left); }
      k++;
      if (k < a.size() && a.get(k) != null) { n.right = new TreeNode(toInt(a.get(k))); q.add(n.right); }
      k++;
    }
    return root;
  }
  static String quote(String s) {
    StringBuilder sb = new StringBuilder("\\"");
    for (char c : s.toCharArray()) { if (c == '"' || c == '\\\\') sb.append('\\\\').append(c); else if (c == '\\n') sb.append("\\\\n"); else sb.append(c); }
    return sb.append('"').toString();
  }
  static String ser(Object o) {
    if (o == null) return "null";
    if (o instanceof String) return quote((String) o);
    if (o instanceof Character) return quote(String.valueOf(o));
    if (o instanceof Boolean) return o.toString();
    if (o instanceof Double || o instanceof Float) {
      double d = ((Number) o).doubleValue();
      return d == Math.rint(d) && !Double.isInfinite(d) ? String.valueOf((long) d) : String.valueOf(d);
    }
    if (o instanceof Number) return o.toString();
    if (o instanceof ListNode) {
      StringBuilder sb = new StringBuilder("["); ListNode h = (ListNode) o; int g = 0;
      while (h != null && g++ < 100000) { if (sb.length() > 1) sb.append(','); sb.append(h.val); h = h.next; }
      return sb.append(']').toString();
    }
    if (o instanceof TreeNode) {
      List<String> out = new ArrayList<>(); LinkedList<TreeNode> q = new LinkedList<>(); q.add((TreeNode) o);
      while (!q.isEmpty()) {
        TreeNode n = q.poll();
        if (n != null) { out.add(String.valueOf(n.val)); q.add(n.left); q.add(n.right); } else out.add("null");
      }
      while (!out.isEmpty() && out.get(out.size() - 1).equals("null")) out.remove(out.size() - 1);
      return "[" + String.join(",", out) + "]";
    }
    if (o.getClass().isArray()) {
      int n = java.lang.reflect.Array.getLength(o); StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < n; i++) { if (i > 0) sb.append(','); sb.append(ser(java.lang.reflect.Array.get(o, i))); }
      return sb.append(']').toString();
    }
    if (o instanceof Iterable) {
      StringBuilder sb = new StringBuilder("["); boolean first = true;
      for (Object e : (Iterable<?>) o) { if (!first) sb.append(','); sb.append(ser(e)); first = false; }
      return sb.append(']').toString();
    }
    return quote(o.toString());
  }
}
`;

function mainClass(signature) {
  const { params, functionName } = signature;
  // Declared before the try and assigned inside it; the catch exits, so the
  // compiler sees every argument as definitely assigned afterwards. The
  // player's method is called outside the try, so their own exceptions are
  // reported as runtime errors, not as bad input.
  const decls = params.map((p, i) => `    ${TYPES[p.type].java} a${i};`).join('\n');
  const reads = params.map((p, i) => `      a${i} = CaH.${CONVERTERS[p.type]}(CaH.parse(L.get(${i})));`).join('\n');
  const args = params.map((_, i) => `a${i}`).join(', ');
  const nodeReturn = ['ListNode', 'TreeNode'].includes(signature.returnType);
  return `
public class Main {
  public static void main(String[] argv) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    List<String> L = new ArrayList<>(); String line;
    while ((line = br.readLine()) != null) L.add(line);
    while (!L.isEmpty() && L.get(L.size() - 1).trim().isEmpty()) L.remove(L.size() - 1);
    if (L.size() < ${params.length}) { System.err.println(${JSON.stringify(inputCountMessage(signature))} + " Got " + L.size() + "."); System.exit(3); }
${decls}
    try {
${reads}
    } catch (RuntimeException e) {
      System.err.println("Could not read the input: " + e.getMessage()); System.exit(3); return;
    }
    Object result = new Solution().${functionName}(${args});
${nodeReturn ? '    if (result == null) result = new ArrayList<Object>(); // an empty list or tree is written as []\n' : ''}    System.out.println();
    System.out.println("${RESULT_MARKER}" + CaH.ser(result));
  }
}
`;
}

const IMPORT_LINE = /^\s*import\s+(static\s+)?[\w.]+(\.\*)?\s*;\s*$/;
const PACKAGE_LINE = /^\s*package\s+[\w.]+\s*;\s*$/;

// Java requires imports at the top of the file and allows only one public
// class per file. The player's imports are hoisted (their lines left blank
// so line numbers still match), and `public class Solution` loses `public`.
export function buildJava(signature, userCode) {
  const hoisted = [];
  const body = userCode
    .split('\n')
    .map((line) => {
      if (IMPORT_LINE.test(line)) {
        hoisted.push(line.trim());
        return '';
      }
      if (PACKAGE_LINE.test(line)) return '';
      return line.replace(/\bpublic\s+(final\s+)?class\s+Solution\b/, (m, fin) => `${fin ?? ''}class Solution`);
    })
    .join('\n');

  const header = [...hoisted, ...PRELUDE_IMPORTS];
  return {
    source: `${header.join('\n')}\n${body}\n${HELPERS}${mainClass(signature)}`,
    offset: header.length,
    userLines: userCode.split('\n').length,
  };
}
