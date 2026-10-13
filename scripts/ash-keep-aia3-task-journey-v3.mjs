import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_EPOCH = '20260721-legal-demo-ux-v1';
const SOURCE_CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-21-legal-demo-ux-v1';
const RELEASE_EPOCH = '20260723-a2-a5-release-v1';
const RELEASE_CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-23-a2-a5-release-v1';
const sourcePath = new URL('./ash-keep-aia3-task-journey-v3.source.mjs', import.meta.url);
const runtimePath = path.resolve('scripts/.ash-keep-aia3-task-journey-v3.runtime.mjs');

let source = await fs.readFile(sourcePath, 'utf8');
const replacements = [
  [`const EPOCH = '${SOURCE_EPOCH}';`, `const EPOCH = '${RELEASE_EPOCH}';`],
  [`const CACHE_EPOCH = '${SOURCE_CACHE_EPOCH}';`, `const CACHE_EPOCH = '${RELEASE_CACHE_EPOCH}';`],
  [
    "async function waitReady(page) {\n  await page.waitForFunction(epoch => document.documentElement.dataset.ashAia3Ready === 'true'\n    && window.__td613AshAia3Composition?.current?.().membrane_ready === true\n    && document.querySelector('#newProfile')?.value === 'investigation'\n    && location.search.includes(`ash_epoch=${epoch}`), EPOCH);\n}",
    "async function waitReady(page) {\n  await page.waitForFunction(({ epoch, cacheEpoch }) => document.documentElement.dataset.ashAia3Ready === 'true'\n    && window.__td613AshAia3Composition?.current?.().membrane_ready === true\n    && document.querySelector('#newProfile')?.value === 'investigation'\n    && location.pathname === '/dome-world/ash-threshold.html'\n    && location.search === ''\n    && window.__td613AshAia3PreflightReceipt?.asset_epoch === epoch\n    && window.__td613AshAia3PreflightReceipt?.epoch === cacheEpoch, { epoch:EPOCH, cacheEpoch:CACHE_EPOCH });\n}"
  ],
  [
    "      && location.search.includes(`ash_epoch=${epoch}`);",
    "      && location.pathname === '/dome-world/ash-threshold.html'\n      && location.search === ''\n      && window.__td613AshAia3PreflightReceipt?.asset_epoch === epoch;"
  ]
];

for (const [before, after] of replacements) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`AIA3 release-epoch adapter expected one source seam; observed ${count}: ${before.slice(0, 72)}`);
  source = source.replace(before, after);
}

if (!source.includes(`const EPOCH = '${RELEASE_EPOCH}';`)
  || !source.includes(`const CACHE_EPOCH = '${RELEASE_CACHE_EPOCH}';`)
  || !source.includes("location.pathname === '/dome-world/ash-threshold.html'")
  || !source.includes("location.search === ''")
  || source.includes('location.search.includes(`ash_epoch=${epoch}`)')) {
  throw new Error('AIA3 release-epoch adapter did not materialize the clean canonical journey.');
}

await fs.writeFile(runtimePath, source, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?release_epoch=${encodeURIComponent(RELEASE_EPOCH)}&run=${Date.now()}`);
