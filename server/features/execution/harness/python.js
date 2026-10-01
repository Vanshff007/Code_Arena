import { RESULT_MARKER, inputCountMessage } from './protocol.js';

// Imports LeetCode makes available without asking, plus the node classes.
const PRELUDE = `from typing import *
import sys, json, math, heapq, bisect, itertools, functools, collections, string, re
from collections import *
from functools import *
from itertools import *
from heapq import *
from bisect import *
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`;

const HELPERS = `
import sys as _ca_sys, json as _ca_json, collections as _ca_collections

def _ca_to_list(v):
    d = t = ListNode(0)
    for x in v or []:
        t.next = ListNode(x)
        t = t.next
    return d.next

def _ca_to_tree(v):
    if not v or v[0] is None:
        return None
    root = TreeNode(v[0])
    q = _ca_collections.deque([root])
    k = 1
    while q and k < len(v):
        n = q.popleft()
        if k < len(v) and v[k] is not None:
            n.left = TreeNode(v[k])
            q.append(n.left)
        k += 1
        if k < len(v) and v[k] is not None:
            n.right = TreeNode(v[k])
            q.append(n.right)
        k += 1
    return root

def _ca_conv(v, t):
    if t == 'TreeNode':
        return _ca_to_tree(v)
    if t == 'ListNode':
        return _ca_to_list(v)
    if t == 'ListNode[]':
        return [_ca_to_list(x) for x in v]
    if t == 'double':
        return float(v)
    if t == 'double[]':
        return [float(x) for x in v]
    return v

def _ca_plain(r):
    if isinstance(r, ListNode):
        out, g = [], 0
        while r is not None and g < 100000:
            out.append(r.val)
            r = r.next
            g += 1
        return out
    if isinstance(r, TreeNode):
        out, q = [], _ca_collections.deque([r])
        while q:
            n = q.popleft()
            if n is None:
                out.append(None)
            else:
                out.append(n.val)
                q.append(n.left)
                q.append(n.right)
        while out and out[-1] is None:
            out.pop()
        return out
    if isinstance(r, (list, tuple)):
        return [_ca_plain(x) for x in r]
    return r
`;

function mainFunction(signature) {
  const { params, functionName } = signature;
  const types = JSON.stringify(params.map((p) => p.type));
  const nodeReturn = ['ListNode', 'TreeNode'].includes(signature.returnType);
  return `
def _ca_main():
    lines = [l.rstrip('\\r') for l in _ca_sys.stdin.read().split('\\n')]
    while lines and not lines[-1].strip():
        lines.pop()
    if len(lines) < ${params.length}:
        print(${JSON.stringify(inputCountMessage(signature))} + ' Got %d.' % len(lines), file=_ca_sys.stderr)
        _ca_sys.exit(3)
    types = ${types}
    try:
        args = [_ca_conv(_ca_json.loads(lines[i]), t) for i, t in enumerate(types)]
    except (ValueError, TypeError) as e:
        print('Could not read the input: %s' % e, file=_ca_sys.stderr)
        _ca_sys.exit(3)
    result = Solution().${functionName}(*args)
${nodeReturn ? '    if result is None:\n        result = []  # an empty list or tree is written as []\n' : ''}    print()
    print('${RESULT_MARKER}' + _ca_json.dumps(_ca_plain(result), separators=(',', ':')))

_ca_main()
`;
}

export function buildPython(signature, userCode) {
  return {
    source: PRELUDE + userCode + '\n' + HELPERS + mainFunction(signature),
    offset: PRELUDE.split('\n').length - 1,
    userLines: userCode.split('\n').length,
  };
}
