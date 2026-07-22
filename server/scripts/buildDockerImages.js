// Builds the sandboxed language images once, up front, rather than paying
// an install cost on every submission. Re-run after editing any Dockerfile
// under docker/images/.
//
// Usage: npm run docker:build
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../docker/images');

const images = [
  { tag: 'codearena-cpp', dir: 'cpp' },
  { tag: 'codearena-java', dir: 'java' },
  { tag: 'codearena-python', dir: 'python' },
];

for (const { tag, dir } of images) {
  console.log(`\nBuilding ${tag}...`);
  execSync(`docker build -t ${tag} "${path.join(imagesDir, dir)}"`, { stdio: 'inherit' });
}

console.log('\nAll execution images built.');
