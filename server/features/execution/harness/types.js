// The parameter and return types a function-style problem may use, and how
// each maps onto C++, Java and Python. Test inputs and outputs are written
// LeetCode-style: one JSON value per parameter, one per line
// (`[2,7,11,15]` then `9`), trees and linked lists as level-order arrays.
//
// `list<...>` types exist for Java, where LeetCode returns List<List<Integer>>
// rather than int[][]; in C++ and Python they map to the same thing as the
// array form.
export const TYPES = {
  int: { cpp: 'int', java: 'int', python: 'int' },
  long: { cpp: 'long long', java: 'long', python: 'int' },
  double: { cpp: 'double', java: 'double', python: 'float' },
  bool: { cpp: 'bool', java: 'boolean', python: 'bool' },
  string: { cpp: 'string', java: 'String', python: 'str' },
  char: { cpp: 'char', java: 'char', python: 'str' },

  'int[]': { cpp: 'vector<int>', java: 'int[]', python: 'List[int]' },
  'long[]': { cpp: 'vector<long long>', java: 'long[]', python: 'List[int]' },
  'double[]': { cpp: 'vector<double>', java: 'double[]', python: 'List[float]' },
  'bool[]': { cpp: 'vector<bool>', java: 'boolean[]', python: 'List[bool]' },
  'string[]': { cpp: 'vector<string>', java: 'String[]', python: 'List[str]' },
  'char[]': { cpp: 'vector<char>', java: 'char[]', python: 'List[str]' },
  'int[][]': { cpp: 'vector<vector<int>>', java: 'int[][]', python: 'List[List[int]]' },
  'char[][]': { cpp: 'vector<vector<char>>', java: 'char[][]', python: 'List[List[str]]' },
  'string[][]': { cpp: 'vector<vector<string>>', java: 'String[][]', python: 'List[List[str]]' },

  'list<int>': { cpp: 'vector<int>', java: 'List<Integer>', python: 'List[int]' },
  'list<string>': { cpp: 'vector<string>', java: 'List<String>', python: 'List[str]' },
  'list<list<int>>': { cpp: 'vector<vector<int>>', java: 'List<List<Integer>>', python: 'List[List[int]]' },
  'list<list<string>>': { cpp: 'vector<vector<string>>', java: 'List<List<String>>', python: 'List[List[str]]' },

  TreeNode: { cpp: 'TreeNode*', java: 'TreeNode', python: 'Optional[TreeNode]' },
  ListNode: { cpp: 'ListNode*', java: 'ListNode', python: 'Optional[ListNode]' },
  'ListNode[]': { cpp: 'vector<ListNode*>', java: 'ListNode[]', python: 'List[Optional[ListNode]]' },
};

export const TYPE_NAMES = Object.keys(TYPES);

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Returns a list of problems with a signature, empty when it is valid.
export function validateSignature(signature) {
  const errors = [];
  if (!signature || typeof signature !== 'object') return ['Signature must be an object'];
  if (!IDENTIFIER.test(signature.functionName ?? '')) errors.push('functionName must be a valid identifier');
  if (!Array.isArray(signature.params) || signature.params.length === 0) {
    errors.push('params must be a non-empty array');
  } else {
    const seen = new Set();
    for (const p of signature.params) {
      if (!IDENTIFIER.test(p?.name ?? '')) errors.push(`Invalid parameter name: ${p?.name}`);
      if (!TYPES[p?.type]) errors.push(`Unsupported parameter type: ${p?.type}`);
      if (seen.has(p?.name)) errors.push(`Duplicate parameter name: ${p?.name}`);
      seen.add(p?.name);
    }
  }
  if (!TYPES[signature.returnType]) errors.push(`Unsupported return type: ${signature.returnType}`);
  return errors;
}

// C++ passes containers by reference, the way LeetCode signatures do.
export function cppParamType(type) {
  const t = TYPES[type].cpp;
  return t.startsWith('vector<') ? `${t}&` : t;
}
