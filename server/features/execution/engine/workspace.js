import { chmod, mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Every submission gets its own throwaway folder here, bind-mounted into
// its container as /box. Lives under server/features/execution/tmp/, which is already
// gitignored (see root .gitignore) so it can never end up committed.
const TMP_ROOT = path.join(__dirname, '../tmp');

export async function createWorkspace() {
  await mkdir(TMP_ROOT, { recursive: true });
  const workDir = await mkdtemp(path.join(TMP_ROOT, 'run-'));
  // mkdtemp creates the folder as owner-only (0700). The sandbox runs as
  // its own user (uid 1000 in the images), which on Linux is not the host
  // user running this server - so it could neither read the source nor
  // write the compiled program ("Permission denied"). Docker Desktop on
  // Windows/macOS hides this. The folder is per-submission, random-named
  // and deleted right after judging.
  await chmod(workDir, 0o777);
  return workDir;
}

export async function writeSourceFile(workDir, fileName, code) {
  await writeFile(path.join(workDir, fileName), code, 'utf8');
}

export async function cleanupWorkspace(workDir) {
  await rm(workDir, { recursive: true, force: true });
}
