import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Every submission gets its own throwaway folder here, bind-mounted into
// its container as /box. Lives under server/docker/tmp/, which is already
// gitignored (see root .gitignore) so it can never end up committed.
const TMP_ROOT = path.join(__dirname, '../../docker/tmp');

export async function createWorkspace() {
  await mkdir(TMP_ROOT, { recursive: true });
  return mkdtemp(path.join(TMP_ROOT, 'run-'));
}

export async function writeSourceFile(workDir, fileName, code) {
  await writeFile(path.join(workDir, fileName), code, 'utf8');
}

export async function cleanupWorkspace(workDir) {
  await rm(workDir, { recursive: true, force: true });
}
