import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptsDir = path.join(repoRoot, 'scripts');
const browserName = process.env.TD613_BROWSER || 'chromium';
if (!['chromium', 'firefox', 'webkit'].includes(browserName)) throw new Error(`Unsupported browser: ${browserName}`);

for (const staleDirectory of ['ash-keep-production-closure', 'ash-keep-probe-runtime']) {
  await fs.rm(path.join(repoRoot, 'artifacts', staleDirectory), { recursive:true, force:true });
}

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

const tempDir = path.join(repoRoot, 'artifacts', `.ash-lifecycle-${browserName}-${process.pid}`);
await fs.mkdir(tempDir, { recursive:true });

let baseSource = await fs.readFile(path.join(scriptsDir, 'ash-lifecycle-production-probe-base.mjs'), 'utf8');
const generatorSource = await fs.readFile(path.join(scriptsDir, 'ash-lifecycle-production-probe.mjs'), 'utf8');

baseSource = replaceExactly(
  baseSource,
  "import { chromium } from 'playwright';",
  "import { chromium, firefox, webkit } from 'playwright';\n\nconst browserName = process.env.TD613_BROWSER || 'chromium';\nconst engine = { chromium, firefox, webkit }[browserName];\nif (!engine) throw new Error(`Unsupported browser: ${browserName}`);",
  'Playwright lifecycle engine import'
);
baseSource = replaceExactly(
  baseSource,
  'const browser = await chromium.launch({ headless: true });',
  'const browser = await engine.launch({ headless: true });',
  'Playwright lifecycle engine launch'
);
baseSource = replaceExactly(
  baseSource,
  "  browser: 'chromium-headless',",
  '  browser: `${browserName}-headless`,',
  'Playwright lifecycle engine evidence label'
);

await Promise.all([
  fs.writeFile(path.join(tempDir, 'ash-lifecycle-production-probe-base.mjs'), baseSource, 'utf8'),
  fs.writeFile(path.join(tempDir, 'ash-lifecycle-production-probe.mjs'), generatorSource, 'utf8')
]);

try {
  const adaptedGenerator = pathToFileURL(path.join(tempDir, 'ash-lifecycle-production-probe.mjs')).href;
  await import(`${adaptedGenerator}?engine=${browserName}&fixture=${Date.now()}`);
} finally {
  await fs.rm(tempDir, { recursive:true, force:true });
}
