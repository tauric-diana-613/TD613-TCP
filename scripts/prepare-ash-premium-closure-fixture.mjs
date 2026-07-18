import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const probePath = path.join(here, 'ash-keep-production-probe.mjs');
const manifestPath = path.resolve(
  process.env.TD613_PREMIUM_CLOSURE_FIXTURE_MANIFEST
    || path.join(repoRoot, 'artifacts', 'ash-keep-probe-runtime', 'premium-fixture-manifest.json')
);

const capsuleTarget = `  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);

  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));`;

const capsuleReplacement = `  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);

  const premiumCommandInstrument = await page.evaluate(() => Boolean(window.__td613AshPremiumUI?.version));
  if (premiumCommandInstrument) {
    await page.evaluate(() => window.__td613AshPremiumUI.open('save'));
    await page.waitForFunction(() => document.getElementById('workspace-save')?.classList.contains('active'));
  }

  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));`;

const allowedKeysTarget = `const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences'
]);`;
const allowedKeysReplacement = `const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences',
  'td613.ash.cache-flush.epoch'
]);`;

const cleanArrivalTarget = `  const cleanKeys = await page.evaluate(() => Object.keys(localStorage));
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.length === 0, 'Clean arrival wrote localStorage before operator action');
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    non_read_requests: initialNonGet
  };`;

const permittedEpochs = [
  'td613.ash.cache-flush/2026-07-17-premium-v1',
  'td613.ash.cache-flush/2026-07-17-research-ingress-v2'
];

const cleanArrivalReplacement = `  const cleanEntries = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const cleanKeys = Object.keys(cleanEntries);
  const cleanMaintenanceKeys = new Set(['td613.ash.cache-flush.epoch']);
  const permittedCacheEpochs = new Set(${JSON.stringify(permittedEpochs)});
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.every(key => cleanMaintenanceKeys.has(key)), 'Clean arrival wrote case-adjacent localStorage before operator action');
  if (cleanEntries['td613.ash.cache-flush.epoch']) {
    assert(permittedCacheEpochs.has(cleanEntries['td613.ash.cache-flush.epoch']), 'Clean arrival carried an unknown cache-maintenance epoch');
  }
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    one_time_cache_epoch: cleanEntries['td613.ash.cache-flush.epoch'] || null,
    permitted_cache_epochs: [...permittedCacheEpochs],
    case_adjacent_storage_written: false,
    non_read_requests: initialNonGet
  };`;

const premiumMarker = 'const premiumCommandInstrument = await page.evaluate';
const cacheMarker = 'const cleanMaintenanceKeys = new Set';
const cacheSetMarker = 'const permittedCacheEpochs = new Set';
const sha256 = value => `sha256:${createHash('sha256').update(value).digest('hex')}`;

const original = (await fs.readFile(probePath, 'utf8')).replace(/\r\n/g, '\n');
let prepared = original;
const transformations = [];

if (!prepared.includes(premiumMarker)) {
  const count = prepared.split(capsuleTarget).length - 1;
  if (count !== 1) throw new Error(`Premium closure fixture expected one authenticated-import seam; observed ${count}.`);
  prepared = prepared.replace(capsuleTarget, capsuleReplacement);
  transformations.push('REOPEN_EXACT_SAVE_AFTER_AUTHENTICATED_CAPSULE_BEFORE_TAMPER_ASSAY');
}

if (!prepared.includes("'td613.ash.cache-flush.epoch'")) {
  const count = prepared.split(allowedKeysTarget).length - 1;
  if (count !== 1) throw new Error(`Cache closure fixture expected one localStorage allowlist seam; observed ${count}.`);
  prepared = prepared.replace(allowedKeysTarget, allowedKeysReplacement);
  transformations.push('ALLOW_NAMED_CACHE_EPOCH_AFTER_OPERATOR_ACTION');
}

if (!prepared.includes(cacheSetMarker)) {
  const count = prepared.split(cleanArrivalTarget).length - 1;
  if (count !== 1) throw new Error(`Cache closure fixture expected one clean-arrival assertion seam; observed ${count}.`);
  prepared = prepared.replace(cleanArrivalTarget, cleanArrivalReplacement);
  transformations.push('ALLOW_ONLY_EXACT_NON_CASE_CACHE_EPOCHS_ON_CLEAN_ARRIVAL');
}

if (!prepared.includes(premiumMarker)
  || !prepared.includes("window.__td613AshPremiumUI.open('save')")
  || !prepared.includes(cacheMarker)
  || !prepared.includes(cacheSetMarker)
  || !prepared.includes('case_adjacent_storage_written: false')
  || !prepared.includes("'td613.ash.cache-flush.epoch'")) {
  throw new Error('Premium/cache closure fixture did not materialize every bounded observation seam.');
}

if (prepared !== original) await fs.writeFile(probePath, prepared, 'utf8');
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema: 'td613.ash-keep.premium-production-closure-fixture/v0.3-cache-epoch-set',
  source_probe: path.relative(repoRoot, probePath),
  posture: transformations.length ? 'PREPARED_NOW' : 'ALREADY_PREPARED',
  source_sha256: sha256(original),
  prepared_sha256: sha256(prepared),
  transformations,
  permitted_clean_arrival_local_storage: {
    key: 'td613.ash.cache-flush.epoch',
    values: permittedEpochs,
    classification: 'EXACT_NON_CASE_ONE_TIME_MAINTENANCE_MARKER_SET'
  },
  case_pointer_allowed_before_operator_action: false,
  lifecycle_record_allowed_before_operator_action: false,
  receipt_allowed_before_operator_action: false,
  preferences_allowed_before_operator_action: false,
  source_file_mutated_in_ephemeral_ci_checkout_only: true,
  product_ui_mutated: false,
  promotion_authorized: false,
  transport_authorized: false,
  cinder_authorized: false
}, null, 2)}\n`);

console.log(`prepare-ash-premium-closure-fixture.mjs passed · ${transformations.length ? 'PREPARED_NOW' : 'ALREADY_PREPARED'}`);
