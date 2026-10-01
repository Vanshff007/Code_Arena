import { execInSandbox } from './dockerRunner.js';
import { COMPILE_TIME_LIMIT_MS } from './config.js';

// Compiles the submitted source inside the already-running sandbox
// container (a no-op for interpreted languages like Python). Run once per
// submission and the resulting binary is reused across every test case.
export async function compile(langConfig, containerName) {
  if (!langConfig.compileCommand) {
    return { success: true, stderr: '' };
  }

  const result = await execInSandbox({
    containerName,
    command: langConfig.compileCommand,
    timeoutSec: Math.ceil(COMPILE_TIME_LIMIT_MS / 1000),
  });

  return { success: result.exitCode === 0 && !result.timedOut, stderr: result.stderr };
}

// Runs the already-compiled (or interpreted) program once against a single
// stdin input, inside the same long-lived sandbox container.
export function run(langConfig, containerName, stdin, timeLimitMs) {
  return execInSandbox({
    containerName,
    command: langConfig.runCommand,
    stdin,
    timeoutSec: Math.ceil(timeLimitMs / 1000),
  });
}
