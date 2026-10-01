// Pure helpers for the admin problem editor (covered by admin.test.js):
// turning a problem into editable form state, validating it, and building
// the API payload back from it.

// Must match server/features/execution/harness/types.js (checked by a test).
export const SIGNATURE_TYPES = [
  'int',
  'long',
  'double',
  'bool',
  'string',
  'char',
  'int[]',
  'long[]',
  'double[]',
  'bool[]',
  'string[]',
  'char[]',
  'int[][]',
  'char[][]',
  'string[][]',
  'list<int>',
  'list<string>',
  'list<list<int>>',
  'list<list<string>>',
  'TreeNode',
  'ListNode',
  'ListNode[]',
];

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

export const emptyCase = () => ({ input: '', output: '' });
export const emptyParam = () => ({ name: '', type: 'int' });

export function emptyDraft() {
  return {
    title: '',
    difficulty: 'Easy',
    tags: '',
    description: '',
    constraints: '',
    functionName: '',
    params: [emptyParam()],
    returnType: 'int',
    outputOrder: 'exact',
    examples: [{ ...emptyCase(), explanation: '' }],
    publicTestCases: [emptyCase()],
    hiddenTestCases: [emptyCase()],
    keepHidden: false,
    approach: '',
    solutions: { python: '', cpp: '', java: '' },
    refLanguage: 'python',
    refCode: '',
  };
}

// Form state from a problem as returned by GET /problems/:id/admin.
// Hidden test cases never come back from the API, so editing starts by
// keeping the stored ones.
export function draftFromProblem(problem) {
  const sig = problem.signature;
  return {
    ...emptyDraft(),
    title: problem.title ?? '',
    difficulty: problem.difficulty ?? 'Easy',
    tags: (problem.tags ?? []).join(', '),
    description: problem.description ?? '',
    constraints: (problem.constraints ?? []).join('\n'),
    functionName: sig?.functionName ?? '',
    params: sig?.params?.length ? sig.params.map((p) => ({ name: p.name, type: p.type })) : [emptyParam()],
    returnType: sig?.returnType ?? 'int',
    outputOrder: problem.outputOrder ?? 'exact',
    examples: (problem.examples ?? []).map((e) => ({ input: e.input, output: e.output, explanation: e.explanation ?? '' })),
    publicTestCases: (problem.publicTestCases ?? []).map((c) => ({ input: c.input, output: c.output })),
    hiddenTestCases: [],
    keepHidden: true,
    approach: problem.editorial?.approach ?? '',
    solutions: { python: '', cpp: '', java: '', ...(problem.editorial?.solutions ?? {}) },
  };
}

const filled = (c) => c.input.trim() !== '' || c.output.trim() !== '';
const splitLines = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean);

export function isFunctionStyle(form) {
  return form.functionName.trim() !== '';
}

// Returns a list of problems to fix; empty when the form can be sent.
export function validateDraft(form, { isEdit = false } = {}) {
  const errors = [];
  if (!form.title.trim()) errors.push('Add a title.');
  if (!form.description.trim()) errors.push('Add a description.');
  if (!form.examples.some(filled)) errors.push('Add at least one example.');
  if (!form.publicTestCases.some(filled)) errors.push('Add at least one public test case.');
  if (!(isEdit && form.keepHidden) && !form.hiddenTestCases.some(filled)) errors.push('Add at least one hidden test case.');

  if (isFunctionStyle(form)) {
    if (!IDENTIFIER.test(form.functionName.trim())) errors.push('The function name must be a valid identifier.');
    const names = form.params.map((p) => p.name.trim());
    if (names.some((n) => !IDENTIFIER.test(n))) errors.push('Every parameter needs a valid name.');
    if (new Set(names).size !== names.length) errors.push('Parameter names must be different.');
    const lines = form.params.length;
    const wrong = [...form.examples, ...form.publicTestCases, ...form.hiddenTestCases]
      .filter(filled)
      .some((c) => c.input.trim().split('\n').length !== lines);
    if (wrong) errors.push(`Each test input needs ${lines} line${lines === 1 ? '' : 's'}, one value per parameter.`);
  }
  if (!form.refCode.trim()) errors.push('Add a reference solution - it is run against every test case before saving.');
  return errors;
}

// API payload from the form. On edit with keepHidden, hidden test cases
// are left out so the stored ones stay.
export function buildPayload(form, { isEdit = false } = {}) {
  const cases = (list) => list.filter(filled).map((c) => ({ input: c.input.trimEnd(), output: c.output.trim() }));
  const payload = {
    title: form.title.trim(),
    difficulty: form.difficulty,
    description: form.description.trim(),
    constraints: splitLines(form.constraints),
    tags: form.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    examples: form.examples
      .filter(filled)
      .map((e) => ({ input: e.input.trimEnd(), output: e.output.trim(), explanation: e.explanation.trim() })),
    publicTestCases: cases(form.publicTestCases),
    outputOrder: form.outputOrder,
    signature: isFunctionStyle(form)
      ? {
          functionName: form.functionName.trim(),
          params: form.params.map((p) => ({ name: p.name.trim(), type: p.type })),
          returnType: form.returnType,
        }
      : null,
    editorial: {
      approach: form.approach.trim(),
      solutions: { python: form.solutions.python, cpp: form.solutions.cpp, java: form.solutions.java },
    },
    referenceSolution: { language: form.refLanguage, code: form.refCode },
  };
  if (!(isEdit && form.keepHidden)) payload.hiddenTestCases = cases(form.hiddenTestCases);
  if (!isEdit && payload.signature === null) delete payload.signature;
  return payload;
}
