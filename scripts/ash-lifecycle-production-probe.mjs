import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CORE_PROBE = new URL('./ash-lifecycle-production-probe-core.mjs', import.meta.url);
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-lifecycle-deployed-observation';
const runtimePath = path.resolve(artifactDir, 'ash-lifecycle-production-probe-runtime.mjs');
const SYNTHETIC_DRAFT_BODY = 'TD613 synthetic lifecycle draft — local evidence only; no recipient route or transport authority.';

const PROBE_CONTRACT_MARKERS = Object.freeze([
  'td613.ash.lifecycle-production-observation/v0.1',
  'ARRIVAL_UNPERSISTED',
  'READINESS_OBSERVED',
  'CASE_BOUND',
  'REBUILD_ELIGIBLE',
  'RELEASE_ELIGIBLE',
  'CONTINUITY_SEALED',
  'ash-custody-register',
  'raw_artifact_in_request_body',
  'provider_or_transport_requests',
  'ash-lifecycle-mobile-portrait.png',
  'ash-lifecycle-mobile-landscape.png',
  'promotion_authorized: false',
  'readiness is not custody',
  'continuity is not transport'
]);

const draftSeam = [
  "  await openWorkspace(page, 'draft');",
  "  await page.locator('#keepDraft').click();"
].join('\n');
const repairedDraftSeam = [
  "  await openWorkspace(page, 'draft');",
  `  await page.locator('#draftBody').fill(${JSON.stringify(SYNTHETIC_DRAFT_BODY)});`,
  "  await page.locator('#keepDraft').click();"
].join('\n');

await fs.mkdir(artifactDir, { recursive: true });
const source = await fs.readFile(CORE_PROBE, 'utf8');
for (const marker of PROBE_CONTRACT_MARKERS) {
  if (!source.includes(marker)) throw new Error(`Lifecycle probe core omitted contract marker: ${marker}`);
}
const seamCount = source.split(draftSeam).length - 1;
if (seamCount !== 1) {
  throw new Error(`Lifecycle probe draft seam drifted: expected 1 match, observed ${seamCount}`);
}
const runtimeSource = source.replace(draftSeam, repairedDraftSeam);
if (!runtimeSource.includes("page.locator('#draftBody').fill")) {
  throw new Error('Lifecycle probe runtime omitted synthetic draft input');
}
await fs.writeFile(runtimePath, runtimeSource);
await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
