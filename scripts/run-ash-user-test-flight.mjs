import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceUrl = new URL('./ash-user-test-flight.mjs', import.meta.url);
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-user-test-flight');
const runtimePath = path.join(artifactDir, 'ash-user-test-flight.runtime.mjs');

const navigationTarget = `async function bootAsh(page, { throughThreshold = true } = {}) {
  await page.goto(throughThreshold ? thresholdUrl : keepUrl, { waitUntil: 'networkidle' });
  await page.waitForURL(/\\/dome-world\\/ash-keep\\.html/, { timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.__td613AshLifecycleRefresh === 'function'
    && typeof window.TD613AshConvergence?.authorize === 'function'
    && Boolean(document.querySelector('.work-tab[data-workspace="custody"]')),
  null, { timeout: 60000 });
}`;

const navigationReplacement = `async function bootAsh(page, { throughThreshold = true } = {}) {
  await page.goto(throughThreshold ? thresholdUrl : keepUrl, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.__td613AshLifecycleRefresh === 'function'
    && typeof window.TD613AshConvergence?.authorize === 'function'
    && Boolean(document.querySelector('.work-tab[data-workspace="custody"]')),
  null, { timeout: 60000 });
  const route = new URL(page.url()).pathname;
  if (!['/dome-world/ash-threshold.html', '/dome-world/ash-keep.html'].includes(route)) {
    throw new Error(\`Ash composed arrival resolved to an unexpected route: \${route}\`);
  }
}`;

const exportStatusTarget = `await page.waitForFunction(() => /Encrypted copy exported/.test(document.getElementById('capsuleStatus')?.textContent || ''));`;
const exportStatusReplacement = `await page.waitForFunction(() => /encrypted copy exported/i.test(document.getElementById('capsuleStatus')?.textContent || ''));`;

await fs.mkdir(artifactDir, { recursive: true });
const source = await fs.readFile(sourceUrl, 'utf8');
const navigationCount = source.split(navigationTarget).length - 1;
const exportStatusCount = source.split(exportStatusTarget).length - 1;
if (navigationCount !== 1) throw new Error(`Ash user flight expected one pathname-dependent arrival seam; observed ${navigationCount}.`);
if (exportStatusCount !== 1) throw new Error(`Ash user flight expected one legacy capsule export status seam; observed ${exportStatusCount}.`);
const runtime = source
  .replace(navigationTarget, navigationReplacement)
  .replace(exportStatusTarget, exportStatusReplacement);
if (runtime.includes('page.waitForURL(/\\/dome-world\\/ash-keep\\.html/')) throw new Error('Ash user flight retained pathname-dependent arrival logic.');
if (runtime.includes('/Encrypted copy exported/')) throw new Error('Ash user flight retained case-sensitive legacy capsule status logic.');
await fs.writeFile(runtimePath, runtime, 'utf8');
await import(`${pathToFileURL(runtimePath).href}?flight=${Date.now()}`);
