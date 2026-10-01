import { spawn, execFile } from 'child_process';
import { randomUUID } from 'crypto';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

// Stop reading a process's output past this size - a submission that tries
// to print gigabytes of garbage shouldn't be able to blow up server memory
// just because its container is otherwise well-behaved.
const MAX_OUTPUT_BYTES = 64 * 1024;

// Starts a long-lived, idle sandboxed container for one submission. Test
// cases run inside it via execInSandbox (docker exec) rather than each
// spinning up its own container - container creation has real overhead
// (image layer mount, network namespace, cgroup setup, worse under
// Docker Desktop/WSL2 on Windows), and paying that cost once per
// submission instead of once per test case avoids that startup time being
// mistaken for the submitted program itself being slow.
//
// Every flag below exists to stop untrusted code from doing anything
// beyond "read stdin, compute, write stdout" inside its own sandbox:
export async function startSandbox({ image, workDir, memoryMb }) {
  const containerName = `codearena-${randomUUID()}`;

  const args = [
    'run',
    '-d', // detached - stays alive in the background until stopSandbox
    '--rm',
    '--name', containerName,
    '--network', 'none', // no internet, no reaching the host or other containers
    `--memory=${memoryMb}m`,
    `--memory-swap=${memoryMb}m`, // = memory limit -> no swap headroom to exploit
    '--cpus=0.5',
    '--pids-limit=64', // caps fork bombs
    '--cap-drop=ALL', // drop every Linux capability (no raw sockets, no chown, ...)
    '--security-opt=no-new-privileges',
    '--read-only', // root filesystem is immutable
    '--tmpfs', '/tmp:rw,nosuid,size=64m', // small writable scratch space some toolchains need
    '-v', `${workDir}:/box:rw`, // the only other writable path - this submission's own workspace
    '-w', '/box',
    image,
    'sh', '-c', 'sleep 3600', // idles until stopSandbox tears it down
  ];

  await execFileAsync('docker', args);
  return containerName;
}

export async function stopSandbox(containerName) {
  // --rm above means stopping also removes it. Errors are swallowed - if
  // the container already exited (e.g. OOM-killed) there's nothing to stop.
  await execFileAsync('docker', ['stop', '-t', '0', containerName]).catch(() => {});
}

// Runs `command` inside an already-started sandbox container via `docker
// exec`. `timeout` runs *inside* the container and owns killing the
// process on expiry - this is what actually determines Time Limit
// Exceeded, not a wall-clock race on the Node side, which would also
// count `docker exec`'s own overhead against the submitted program's time
// budget.
//
// Note: exit code 137 (SIGKILL) is ambiguous between "timed out" and "hit
// the --memory cap and was OOM-killed by the kernel" - both are reported
// as Time Limit Exceeded here. Distinguishing them would need an extra
// `docker inspect` round-trip per test case, which isn't worth the added
// latency for this project.
export function execInSandbox({ containerName, command, stdin = '', timeoutSec }) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const wrapped = `timeout -k 1 ${timeoutSec} sh -c ${JSON.stringify(command)}`;
    const args = ['exec', '-i', containerName, 'sh', '-c', wrapped];

    const child = spawn('docker', args);

    let stdout = '';
    let stderr = '';
    let settled = false;

    // Fail-safe only, covering `docker exec` itself hanging (a daemon-level
    // issue) - normal program timeouts are already handled by `timeout`
    // above, which exits well within this window.
    const failSafe = setTimeout(() => child.kill('SIGKILL'), (timeoutSec + 5) * 1000);

    child.stdout.on('data', (chunk) => {
      if (stdout.length < MAX_OUTPUT_BYTES) stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      if (stderr.length < MAX_OUTPUT_BYTES) stderr += chunk.toString();
    });

    child.stdin.write(stdin);
    child.stdin.end();

    child.on('close', (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(failSafe);
      const timedOut = exitCode === 124 || exitCode === 137;
      resolve({ stdout, stderr, exitCode, timedOut, durationMs: Date.now() - startedAt });
    });

    child.on('error', (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(failSafe);
      resolve({ stdout, stderr: err.message, exitCode: 1, timedOut: false, durationMs: Date.now() - startedAt });
    });
  });
}

// Best-effort peak memory read via the container's cgroup v2 accounting
// (verified available under Docker Desktop/WSL2 - see startSandbox). This
// reflects peak usage across the WHOLE sandbox session up to this point
// (compile + every test case run so far), not one isolated test case -
// cgroup v2 has no reliable per-exec reset on most kernels. Treated as an
// approximation for the AI Coach's memory feedback and the dynamic scoring
// bonus, not an exact per-run measurement. Returns null if unavailable
// (e.g. a host on cgroup v1, or the read fails for any reason).
export async function readPeakMemoryKb(containerName) {
  try {
    const result = await execFileAsync('docker', [
      'exec', containerName, 'cat', '/sys/fs/cgroup/memory.peak',
    ]);
    const bytes = parseInt(result.stdout.trim(), 10);
    return Number.isNaN(bytes) ? null : Math.round(bytes / 1024);
  } catch {
    return null;
  }
}
