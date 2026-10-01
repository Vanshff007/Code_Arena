import { LANGUAGES, DEFAULT_TIME_LIMIT_MS } from './config.js';
import { createWorkspace, writeSourceFile, cleanupWorkspace } from './workspace.js';
import { startSandbox, stopSandbox, readPeakMemoryKb } from './dockerRunner.js';
import { compile, run } from './executeCode.js';
import { withConcurrencyLimit } from './concurrencyLimiter.js';
import { buildProgram, remapLineNumbers, extractResult, outputsMatch } from '../harness/index.js';

// Ignores trailing whitespace per line and a trailing newline at the very
// end - the same leniency virtually every competitive judge applies, so a
// correct solution isn't marked wrong just for an extra newline. Used for
// full-program (legacy) problems only; function-style problems compare
// returned values instead (harness/compare.js).
function normalize(output) {
  return output
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}

function getLanguageConfig(language) {
  const langConfig = LANGUAGES[language];
  if (!langConfig) throw new Error(`Unsupported language: ${language}`);
  return langConfig;
}

// Turns the player's code into the file that actually runs. With a
// signature, the player wrote only a Solution class and the harness wraps
// it; without one (older admin-made problems), the code is a full program.
function prepareSource(language, code, signature) {
  if (!signature) return { source: code, fixLines: (text) => text, wrapped: false };
  const program = buildProgram(language, signature, code);
  return {
    source: program.source,
    fixLines: (text) => remapLineNumbers(language, text, program),
    wrapped: true,
  };
}

// For one run of the program: the verdict, the player's own printed output,
// and (for function-style problems) the value their method returned.
function interpretRun(result, prepared) {
  if (result.timedOut) return { verdict: 'Time Limit Exceeded', output: result.stdout, returned: null };
  if (!prepared.wrapped) {
    return {
      verdict: result.exitCode === 0 ? null : 'Runtime Error',
      output: result.stdout,
      returned: null,
      stderr: result.stderr,
    };
  }
  const { output, result: returned } = extractResult(result.stdout);
  if (result.exitCode !== 0 || returned === null) {
    return { verdict: 'Runtime Error', output, returned: null, stderr: prepared.fixLines(result.stderr) };
  }
  return { verdict: null, output, returned, stderr: result.stderr };
}

// "Run Code" button - compiles + runs against one ad-hoc input. No
// test-case comparison, just raw output - lets a player sanity-check their
// code before submitting.
export function runCustomInput(params) {
  return withConcurrencyLimit(() => runCustomInputInner(params));
}

async function runCustomInputInner({ language, code, input, signature }) {
  const langConfig = getLanguageConfig(language);
  const prepared = prepareSource(language, code, signature);
  const workDir = await createWorkspace();
  let containerName;

  try {
    await writeSourceFile(workDir, langConfig.fileName, prepared.source);
    containerName = await startSandbox({ image: langConfig.image, workDir, memoryMb: langConfig.memoryMb });

    const compileResult = await compile(langConfig, containerName);
    if (!compileResult.success) {
      return { status: 'Compilation Error', stdout: '', stderr: prepared.fixLines(compileResult.stderr) };
    }

    const runResult = await run(langConfig, containerName, input || '', DEFAULT_TIME_LIMIT_MS);
    const outcome = interpretRun(runResult, prepared);
    return {
      status: outcome.verdict ?? 'Success',
      stdout: outcome.output,
      stderr: outcome.verdict === 'Time Limit Exceeded' ? '' : outcome.stderr ?? '',
      ...(prepared.wrapped && outcome.returned !== null ? { result: outcome.returned } : {}),
    };
  } finally {
    if (containerName) await stopSandbox(containerName);
    await cleanupWorkspace(workDir);
  }
}

// "Submit" button - compiles once, then runs against every public + hidden
// test case for a problem and returns an aggregate verdict. This is the
// only function in the codebase that touches hiddenTestCases content, and
// it never lets that content leave: even for the first failing case, the
// actual/expected output is only included in the result when that case is
// public.
export function judgeSubmission(params) {
  return withConcurrencyLimit(() => judgeSubmissionInner(params));
}

async function judgeSubmissionInner({
  language,
  code,
  publicTestCases,
  hiddenTestCases,
  signature,
  outputOrder = 'exact',
  timeLimitMs = DEFAULT_TIME_LIMIT_MS,
}) {
  const langConfig = getLanguageConfig(language);
  const prepared = prepareSource(language, code, signature);
  const anyOrder = outputOrder === 'any';

  // publicTestCases/hiddenTestCases are Mongoose subdocuments, not plain
  // objects - spreading one (`{...tc}`) does not reliably copy its schema
  // fields, so input/output must be pulled out explicitly here.
  const cases = [
    ...publicTestCases.map((tc) => ({ input: tc.input, output: tc.output, isPublic: true })),
    ...hiddenTestCases.map((tc) => ({ input: tc.input, output: tc.output, isPublic: false })),
  ];

  const workDir = await createWorkspace();
  let containerName;

  try {
    await writeSourceFile(workDir, langConfig.fileName, prepared.source);
    containerName = await startSandbox({ image: langConfig.image, workDir, memoryMb: langConfig.memoryMb });

    const compileResult = await compile(langConfig, containerName);
    if (!compileResult.success) {
      return {
        verdict: 'Compilation Error',
        passedCount: 0,
        totalCount: cases.length,
        compileError: prepared.fixLines(compileResult.stderr),
      };
    }

    let passedCount = 0;
    let firstFailure = null;
    let lastRuntimeMs = null;

    for (const testCase of cases) {
      const result = await run(langConfig, containerName, testCase.input, timeLimitMs);
      lastRuntimeMs = result.durationMs;
      const outcome = interpretRun(result, prepared);

      let caseVerdict = outcome.verdict;
      if (!caseVerdict) {
        const correct = prepared.wrapped
          ? outputsMatch(outcome.returned, testCase.output, { anyOrder })
          : normalize(outcome.output) === normalize(testCase.output);
        caseVerdict = correct ? 'Accepted' : 'Wrong Answer';
      }

      if (caseVerdict === 'Accepted') {
        passedCount += 1;
      } else if (!firstFailure) {
        firstFailure = {
          verdict: caseVerdict,
          ...(testCase.isPublic
            ? {
                input: testCase.input,
                expectedOutput: testCase.output,
                actualOutput: prepared.wrapped ? outcome.returned ?? '' : outcome.output,
                ...(prepared.wrapped && outcome.output ? { stdout: outcome.output } : {}),
                ...(caseVerdict === 'Runtime Error' && outcome.stderr ? { stderr: outcome.stderr } : {}),
              }
            : {}),
        };
      }
    }

    const verdict = passedCount === cases.length ? 'Accepted' : firstFailure.verdict;
    // See readPeakMemoryKb - peak across the whole judging session, a
    // reasonable approximation rather than a per-test-case measurement.
    const memoryKb = await readPeakMemoryKb(containerName);

    return {
      verdict,
      passedCount,
      totalCount: cases.length,
      runtimeMs: lastRuntimeMs,
      memoryKb,
      ...(verdict !== 'Accepted' ? { failedCase: firstFailure } : {}),
    };
  } finally {
    if (containerName) await stopSandbox(containerName);
    await cleanupWorkspace(workDir);
  }
}
