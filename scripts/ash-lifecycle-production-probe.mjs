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
  "const ALLOWED_LOCAL_KEYS = new Set([\n  'td613.ash-keep.current-case',\n  'td613.ash-keep.preferences'\n]);",
  "const ALLOWED_LOCAL_KEYS = new Set([\n  'td613.ash-keep.current-case',\n  'td613.ash-keep.preferences',\n  'td613.ash.cache-flush.epoch'\n]);",
  'bounded cache epoch allowance'
);
runtime = replaceExactly(
  runtime,
  "async function openWorkspace(page, name) {\n  await page.locator(`.work-tab[data-workspace=\"${name}\"]`).click();\n  await page.locator(`#workspace-${name}`).waitFor({ state: 'visible' });\n}",
  "async function openWorkspace(page, name) {\n  await page.evaluate(workspace => {\n    const open = window.__td613AshPremiumUI?.open\n      || window.__td613OpenAshWorkspace\n      || window.__td613AshKeep?.openWorkspace;\n    if (typeof open !== 'function') throw new Error('Ash guided workspace API is unavailable.');\n    open(workspace);\n  }, name);\n  await page.waitForFunction(workspace => document.getElementById(`workspace-${workspace}`)?.classList.contains('active'), name);\n}",
  'guided workspace navigation'
);
runtime = replaceExactly(
  runtime,
  "      selected_workspace: document.querySelector('.work-tab[aria-selected=\"true\"]')?.dataset.workspace || null,",
  "      selected_workspace: document.documentElement.dataset.ashPremiumWorkspace || document.querySelector('.workspace.active')?.id?.replace('workspace-', '') || null,",
  'active workspace receipt'
);
runtime = replaceExactly(
  runtime,
  "  await page.locator('#startDemo').click();\n  await page.locator('#launch').waitFor({ state: 'hidden' });\n  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);",
  "  await page.locator('#newProfile').selectOption('political_campaign');\n  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled && /Political Campaign/.test(document.getElementById('startDemo')?.textContent || ''));\n  await page.locator('#startDemo').click();\n  await page.locator('#launch').waitFor({ state: 'hidden' });\n  await waitForText(page, '#caseTitle', /Harbor City Mayoral Campaign/);",
  'explicit synthetic profile launch'
);
runtime = replaceExactly(
  runtime,
  "  await page.locator('.work-tab[data-workspace=\"test\"]').click();\n  await page.locator('#workspace-custody').waitFor({ state: 'visible' });\n  const heldMessage = await waitForText(page, '#custodyStatus', /Test held/i);\n  report.pre_custody_hold = { test_workspace_held: true, message: heldMessage, state: await page.evaluate(() => document.body.dataset.ashLifecycle) };",
  "  await openWorkspace(page, 'test');\n  await page.locator('#workspace-test').waitFor({ state: 'visible' });\n  const preCustodyExactState = await page.evaluate(() => document.body.dataset.ashLifecycle || null);\n  assert(preCustodyExactState === 'READINESS_OBSERVED', `Guided Test opened under unexpected lifecycle state: ${preCustodyExactState}`);\n  await page.locator('#runTest').click();\n  await page.locator('#workspace-custody').waitFor({ state: 'visible' });\n  const heldMessage = await waitForText(page, '#custodyStatus', /held/i);\n  report.pre_custody_hold = { test_workspace_navigable: true, test_action_held: true, pre_custody_exact_state: preCustodyExactState, message: heldMessage, state: await page.evaluate(() => document.body.dataset.ashLifecycle) };",
  'workspace navigation and held action observation'
);
runtime = replaceExactly(
  runtime,
  "  await openWorkspace(page, 'draft');\n  await page.locator('#keepDraft').click();",
  "  await openWorkspace(page, 'draft');\n  await page.locator('#draftBody').fill(SYNTHETIC_DRAFT);\n  await page.locator('#draftRefs').fill('node_kickoff, node_launch_message, node_press_inquiry');\n  await page.locator('#keepDraft').click();",
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
  "  const passphrase = 'td613-ash-lifecycle-production-probe';\n  await page.locator('#capsulePassphrase').fill(passphrase);\n  const downloadPromise = page.waitForEvent('download');\n  await page.locator('#exportCapsule').click();\n  const download = await downloadPromise;\n  const capsulePath = path.join(artifactDir, 'ash-lifecycle-probe-capsule.json');\n  await download.saveAs(capsulePath);\n  await waitForText(page, '#capsuleStatus', /Encrypted copy exported/);\n  await page.locator('#capsuleFile').setInputFiles(capsulePath);\n  await page.locator('#capsulePassphrase').fill('wrong-passphrase');\n  await page.locator('#importCapsule').click();\n  const wrongPassphrase = await waitForText(page, '#capsuleStatus', /nothing was imported|authentication failed/i);\n  await page.locator('#capsuleFile').setInputFiles(capsulePath);\n  await page.locator('#capsulePassphrase').fill(passphrase);\n  await page.locator('#importCapsule').click();\n  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);\n  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));\n  capsule.ciphertext = `${capsule.ciphertext.slice(0, -2)}AA`;\n  const tamperedPath = path.join(artifactDir, 'ash-lifecycle-probe-capsule-tampered.json');\n  await fs.writeFile(tamperedPath, `${JSON.stringify(capsule, null, 2)}\\n`);\n  await page.locator('#capsuleFile').setInputFiles(tamperedPath);\n  await page.locator('#capsulePassphrase').fill(passphrase);\n  await page.locator('#importCapsule').click();\n  const tamper = await waitForText(page, '#capsuleStatus', /verification failed|nothing was imported/i);",
  "  const passphrase = 'td613-ash-lifecycle-production-probe';\n  await openWorkspace(page, 'capsule');\n  await page.locator('#premiumCapsulePassphrase').waitFor({ state: 'visible' });\n  await page.locator('#premiumCapsulePassphrase').fill(passphrase);\n  const downloadPromise = page.waitForEvent('download');\n  await page.locator('#premiumExportCapsule').click();\n  const download = await downloadPromise;\n  const capsulePath = path.join(artifactDir, 'ash-lifecycle-probe-capsule.json');\n  await download.saveAs(capsulePath);\n  await waitForText(page, '#capsuleStatus', /(?:return-ready\\s+)?encrypted copy exported/i);\n  await openWorkspace(page, 'capsule');\n  await page.locator('#premiumCapsuleFile').setInputFiles(capsulePath);\n  await page.locator('#premiumCapsulePassphrase').fill('wrong-passphrase');\n  await page.locator('#premiumImportCapsule').click();\n  const wrongPassphrase = await waitForText(page, '#capsuleStatus', /nothing was imported|authentication failed/i);\n  await openWorkspace(page, 'capsule');\n  await page.locator('#premiumCapsuleFile').setInputFiles(capsulePath);\n  await page.locator('#premiumCapsulePassphrase').fill(passphrase);\n  await page.locator('#premiumImportCapsule').click();\n  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);\n  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));\n  capsule.ciphertext = `${capsule.ciphertext.slice(0, -2)}AA`;\n  const tamperedPath = path.join(artifactDir, 'ash-lifecycle-probe-capsule-tampered.json');\n  await fs.writeFile(tamperedPath, `${JSON.stringify(capsule, null, 2)}\\n`);\n  await openWorkspace(page, 'capsule');\n  await page.locator('#premiumCapsuleFile').setInputFiles(tamperedPath);\n  await page.locator('#premiumCapsulePassphrase').fill(passphrase);\n  await page.locator('#premiumImportCapsule').click();\n  const tamper = await waitForText(page, '#capsuleStatus', /verification failed|nothing was imported/i);",
  'guided Capsule continuity observation'
);
runtime = replaceExactly(
  runtime,
  "  assert(providerOrTransport.length === 0, 'Lifecycle probe reached a provider or recipient transport route');",
  "  assert(providerOrTransport.length === 0, 'Lifecycle probe reached a provider or recipient transport route');\n  assert(!requests.some(item => item.post_data?.includes(SYNTHETIC_DRAFT)), 'Synthetic draft entered a request body');",
  'draft request boundary'
);
if (!runtime.includes(syntheticDraft)
  || !runtime.includes("selectOption('political_campaign')")
  || !runtime.includes('Ash guided workspace API is unavailable.')
  || !runtime.includes('td613.ash.cache-flush.epoch')
  || !runtime.includes('pre_custody_exact_state: preCustodyExactState')
  || runtime.includes("#workspace-test .workspace-lifecycle-note")
  || !runtime.includes('draft_body_sha256')
  || !runtime.includes('item.body === SYNTHETIC_DRAFT')
  || !runtime.includes('test_workspace_navigable: true')
  || !runtime.includes("openWorkspace(page, 'capsule')")
  || !runtime.includes("locator('#premiumCapsulePassphrase')")
  || !runtime.includes("locator('#premiumCapsuleFile')")
  || !runtime.includes("locator('#premiumExportCapsule')")
  || !runtime.includes("locator('#premiumImportCapsule')")
  || runtime.includes("locator('#capsulePassphrase').fill(passphrase)")) throw new Error('Synthetic guided lifecycle fixture compilation failed.');
await fs.writeFile(runtimeProbePath, runtime);
await import(`${pathToFileURL(runtimeProbePath).href}?fixture=${Date.now()}`);
