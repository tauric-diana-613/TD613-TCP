import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const baseProbeUrl = new URL('./ash-lifecycle-production-probe-base.mjs', import.meta.url);
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-lifecycle-deployed-observation');
const runtimeProbePath = path.join(artifactDir, 'ash-lifecycle-production-probe.runtime.mjs');
const brittleMarker = "  await page.locator('meta[name=\"ash-lifecycle\"][content=\"v0.1\"]').waitFor({ state: 'attached' });";
const runtimeMarker = "  await page.locator('#workspace-custody').waitFor({ state: 'attached' }); // td613 browser readiness: operator-visible lifecycle surface";

await fs.mkdir(artifactDir, { recursive: true });
const baseSource = await fs.readFile(baseProbeUrl, 'utf8');
if (!baseSource.includes(brittleMarker)) {
  throw new Error('Ash lifecycle base probe no longer contains the declared meta-readiness marker. Review the compiler contract before execution.');
}
const runtimeSource = baseSource.replace(brittleMarker, runtimeMarker);
if (runtimeSource.includes(brittleMarker) || !runtimeSource.includes('td613 browser readiness: operator-visible lifecycle surface')) {
  throw new Error('Ash lifecycle runtime probe compilation failed.');
}
await fs.writeFile(runtimeProbePath, runtimeSource);
await import(`${pathToFileURL(runtimeProbePath).href}?compiled=${Date.now()}`);
