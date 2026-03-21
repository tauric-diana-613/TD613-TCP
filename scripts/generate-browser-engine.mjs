import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const enginePath = path.join(repoRoot, 'app', 'engine', 'stylometry.js');
const browserEnginePath = path.join(repoRoot, 'app', 'browser-engine.js');

const engineSource = fs.readFileSync(enginePath, 'utf8');
const browserSource = fs.readFileSync(browserEnginePath, 'utf8');
const boundary = 'function solveQuadratic(';
const tailIndex = browserSource.indexOf(boundary);

if (tailIndex < 0) {
  throw new Error('Could not find browser-engine harbor boundary.');
}

const transformedEngine = engineSource
  .replace(/^export\s+/gm, '')
  .trimEnd();

const harborTail = browserSource.slice(tailIndex).trimStart();
const generated = [
  '(function () {',
  '// GENERATED FROM app/engine/stylometry.js BY scripts/generate-browser-engine.mjs',
  transformedEngine,
  '',
  harborTail
].join('\n');

fs.writeFileSync(browserEnginePath, `${generated}\n`, 'utf8');
console.log('browser-engine.js regenerated from stylometry.js');
