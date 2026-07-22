import { LANGUAGES, DEFAULT_TIME_LIMIT_MS } from './config.js';
import { createWorkspace, writeSourceFile, cleanupWorkspace } from './workspace.js';
import { startSandbox, stopSandbox, readPeakMemoryKb } from './dockerRunner.js';
import { compile, run } from './executeCode.js';
import { withConcurrencyLimit } from './concurrencyLimiter.js';

// Ignores trailing whitespace per line and a trailing newline at the very
// end - the same leniency virtually every competitive judge applies, so a
// correct solution isn't marked wrong just for an extra newline.
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

// "Run Code" button - compiles + runs against one ad-hoc input. No
// test-case comparison, just raw output - lets a player sanity-check their
// code before submitting.
export function runCustomInput(params) {
  return withConcurrencyLimit(() => runCustomInputInner(params));
}

async function runCustomInputInner({ language, code, input }) {
  const langConfig = getLanguageConfig(language);
  const workDir = await createWorkspace();
  let containerName;

  try {
    await writeSourceFile(workDir, langConfig.fileName, code);
    containerName = await startSandbox({ image: langConfig.image, workDir, memoryMb: langConfig.memoryMb });

    const compileResult = await compile(langConfig, containerName);
    if (!compileResult.success) {
      return { status: 'Compilation Error', stdout: '', stderr: compileResult.stderr };
    }

    const runResult = await run(langConfig, containerName, input || '', DEFAULT_TIME_LIMIT_MS);
    if (runResult.timedOut) {
      return { status: 'Time Limit Exceeded', stdout: runResult.stdout, stderr: '' };
    }
    if (runResult.exitCode !== 0) {
      return { status: 'Runtime Error', stdout: runResult.stdout, stderr: runResult.stderr };
    }
    return { status: 'Success', stdout: runResult.stdout, stderr: runResult.stderr };
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
  timeLimitMs = DEFAULT_TIME_LIMIT_MS,
}) {
  const langConfig = getLanguageConfig(language);

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
    await writeSourceFile(workDir, langConfig.fileName, code);
    containerName = await startSandbox({ image: langConfig.image, workDir, memoryMb: langConfig.memoryMb });

    const compileResult = await compile(langConfig, containerName);
    if (!compileResult.success) {
      return {
        verdict: 'Compilation Error',
        passedCount: 0,
        totalCount: cases.length,
        compileError: compileResult.stderr,
      };
    }

    let passedCount = 0;
    let firstFailure = null;
    let lastRuntimeMs = null;

    for (const testCase of cases) {
      const result = await run(langConfig, containerName, testCase.input, timeLimitMs);
      lastRuntimeMs = result.durationMs;

      let caseVerdict;
      if (result.timedOut) {
        caseVerdict = 'Time Limit Exceeded';
      } else if (result.exitCode !== 0) {
        caseVerdict = 'Runtime Error';
      } else if (normalize(result.stdout) === normalize(testCase.output)) {
        caseVerdict = 'Accepted';
      } else {
        caseVerdict = 'Wrong Answer';
      }

      if (caseVerdict === 'Accepted') {
        passedCount += 1;
      } else if (!firstFailure) {
        firstFailure = {
          verdict: caseVerdict,
          ...(testCase.isPublic
            ? { input: testCase.input, expectedOutput: testCase.output, actualOutput: result.stdout }
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
