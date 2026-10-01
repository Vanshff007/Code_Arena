import { TYPES, cppParamType } from './types.js';

// The class-and-method stub a player starts from, LeetCode style. Includes
// a comment describing TreeNode/ListNode when the signature uses them, since
// those definitions are provided by the hidden harness, not the player.

const usesType = (signature, name) =>
  [signature.returnType, ...signature.params.map((p) => p.type)].some((t) => t.startsWith(name));

const CPP_NODE_DOCS = {
  ListNode: [
    '/**',
    ' * Definition for singly-linked list (provided):',
    ' * struct ListNode {',
    ' *     int val;',
    ' *     ListNode *next;',
    ' *     ListNode(int x) : val(x), next(nullptr) {}',
    ' * };',
    ' */',
  ],
  TreeNode: [
    '/**',
    ' * Definition for a binary tree node (provided):',
    ' * struct TreeNode {',
    ' *     int val;',
    ' *     TreeNode *left;',
    ' *     TreeNode *right;',
    ' *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}',
    ' * };',
    ' */',
  ],
};

const JAVA_NODE_DOCS = {
  ListNode: [
    '/**',
    ' * Definition for singly-linked list (provided):',
    ' * class ListNode {',
    ' *     int val;',
    ' *     ListNode next;',
    ' *     ListNode(int val) { this.val = val; }',
    ' * }',
    ' */',
  ],
  TreeNode: [
    '/**',
    ' * Definition for a binary tree node (provided):',
    ' * class TreeNode {',
    ' *     int val;',
    ' *     TreeNode left;',
    ' *     TreeNode right;',
    ' *     TreeNode(int val) { this.val = val; }',
    ' * }',
    ' */',
  ],
};

const PY_NODE_DOCS = {
  ListNode: [
    '# Definition for singly-linked list (provided):',
    '# class ListNode:',
    '#     def __init__(self, val=0, next=None):',
    '#         self.val = val',
    '#         self.next = next',
  ],
  TreeNode: [
    '# Definition for a binary tree node (provided):',
    '# class TreeNode:',
    '#     def __init__(self, val=0, left=None, right=None):',
    '#         self.val = val',
    '#         self.left = left',
    '#         self.right = right',
  ],
};

function nodeDocs(signature, docs) {
  const lines = [];
  for (const name of ['ListNode', 'TreeNode']) {
    if (usesType(signature, name)) lines.push(...docs[name]);
  }
  return lines.length ? `${lines.join('\n')}\n` : '';
}

export function cppStarter(signature) {
  const params = signature.params.map((p) => `${cppParamType(p.type)} ${p.name}`).join(', ');
  return (
    nodeDocs(signature, CPP_NODE_DOCS) +
    `class Solution {\npublic:\n    ${TYPES[signature.returnType].cpp} ${signature.functionName}(${params}) {\n        \n    }\n};\n`
  );
}

export function javaStarter(signature) {
  const params = signature.params.map((p) => `${TYPES[p.type].java} ${p.name}`).join(', ');
  return (
    nodeDocs(signature, JAVA_NODE_DOCS) +
    `class Solution {\n    public ${TYPES[signature.returnType].java} ${signature.functionName}(${params}) {\n        \n    }\n}\n`
  );
}

export function pythonStarter(signature) {
  const params = signature.params.map((p) => `${p.name}: ${TYPES[p.type].python}`).join(', ');
  return (
    nodeDocs(signature, PY_NODE_DOCS) +
    `class Solution:\n    def ${signature.functionName}(self, ${params}) -> ${TYPES[signature.returnType].python}:\n        pass\n`
  );
}

export function generateStarterCode(signature) {
  return { cpp: cppStarter(signature), java: javaStarter(signature), python: pythonStarter(signature) };
}
