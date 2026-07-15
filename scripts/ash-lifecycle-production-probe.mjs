import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-lifecycle-deployed-observation');
const baseProbeUrl = new URL('./ash-lifecycle-production-probe-base.mjs', import.meta.url);
const runtimeProbePath = path.join(artifactDir, 'ash-lifecycle-production-probe.runtime.mjs');
const syntheticDraft = 'Synthetic public index request derived from the custody-bound case; no recipient route.';

function replaceExactly(source, marker, replacement, label) {
  const count = source.split(marker).length - 1;
  if (count !== 1) throw new Error(`${label} expected exactly one marker; observed ${count}`);
  return source.replace(marker, replacement);
}

await fs.mkdir(artifactDir, { recursive: true });
let runtime = await fs.readFile(baseProbeUrl, 'utf8');
runtime = replaceExactly(
  runtime,
  "const SYNTHETIC_ARTIFACT = 'TD613 ASH LIFECYCLE PROBE — synthetic local artifact; no recipient route.';",
  "const SYNTHETIC_ARTIFACT = 'TD613 ASH LIFECYCLE PROBE — synthetic local artifact; no recipient route.';\nconst SYNTHETIC_DRAFT = 'Synthetic public index request derived from the custody-bound case; no recipient route.';",
  'synthetic draft declaration'
);
runtime = replaceExactly(
  runtime,
  "  await openWorkspace(page, 'draft');\n  await page.locator('#keepDraft').click();",
  "  await openWorkspace(page, 'draft');\n  await page.locator('#draftBody').fill(SYNTHETIC_DRAFT);\n  await page.locator('#draftRefs').fill('node_archive, node_claim');\n  await page.locator('#keepDraft').click();",
  'draft fixture entry'
);
runtime = replaceExactly(
  runtime,
  "  const draft = afterDraft.drafts.map(item => item.value).find(item => item.case_id === caseMap.case_id);",
  "  const draft = afterDraft.drafts.map(item => item.value).find(item => item.case_id === caseMap.case_id && item.body === SYNTHETIC_DRAFT);",
  'declared draft selection'
);
runtime = replaceExactly(
  runtime,
  "  assert(draft?.case_map_digest === caseMap.case_map_digest, 'Draft is not bound to the custody-root Case Map');",
  "  assert(draft?.case_map_digest === caseMap.case_map_digest, 'Draft is not bound to the custody-root Case Map');\n  assert(draft?.body === SYNTHETIC_DRAFT, 'Kept draft does not match the declared synthetic derivative');",
  'draft fixture verification'
);
runtime = replaceExactly(
  runtime,
  '    draft_case_map_digest: draft.case_map_digest,',
  '    draft_case_map_digest: draft.case_map_digest,\n    draft_body_sha256: sha256(SYNTHETIC_DRAFT),',
  'draft digest evidence'
);
runtime = replaceExactly(
  runtime,
  "  assert(providerOrTransport.length === 0, 'Lifecycle probe reached a provider or recipient transport route');",
  "  assert(providerOrTransport.length === 0, 'Lifecycle probe reached a provider or recipient transport route');\n  assert(!requests.some(item => item.post_data?.includes(SYNTHETIC_DRAFT)), 'Synthetic draft entered a request body');",
  'draft request boundary'
);
if (!runtime.includes(syntheticDraft) || !runtime.includes('draft_body_sha256') || !runtime.includes('item.body === SYNTHETIC_DRAFT')) throw new Error('Synthetic draft fixture compilation failed.');
await fs.writeFile(runtimeProbePath, runtime);
await import(`${pathToFileURL(runtimeProbePath).href}?fixture=${Date.now()}`);
