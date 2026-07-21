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

const legacyEpoch = 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v7';
const massEpoch = 'td613.ash.cache-flush/2026-07-20-aia3-mass-eviction-v2';
const assetEpoch = '20260720-aia3-mass-eviction-v2';

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

const allowedKeysPattern = /const ALLOWED_LOCAL_KEYS = new Set\(\[[\s\S]*?\n\]\);/;
const allowedKeysReplacement = `const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences',
  'td613.ash.cache-flush.epoch',
  'td613.ash.cache-flush.aia3.epoch',
  'td613.ash.cache-preflight.epoch',
  'td613.ash.session.epoch'
]);`;

const navigationTarget = `  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  // ASH_CACHE_EPOCH_STABLE: the one-time eviction may navigate after first paint.
  await page.waitForURL(url => url.searchParams.has('ash_flush'), { timeout: 60_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    const epoch = localStorage.getItem('td613.ash.cache-flush.epoch');
    const url = new URL(location.href);
    return Boolean(epoch)
      && url.searchParams.get('ash_flush') === epoch
      && window.__td613AshCacheTransition?.epoch === epoch;
  }, { timeout: 60_000 });`;

const navigationReplacement = `  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  // ASH_AIA3_MASS_EVICTION_STABLE: one pre-module replacement admits the current asset graph.
  await page.waitForURL(url => url.searchParams.get('ash_epoch') === ${JSON.stringify(assetEpoch)}, { timeout: 60_000 });
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(({ legacyEpoch, massEpoch, assetEpoch }) => {
    const url = new URL(location.href);
    const transition = window.__td613AshCacheTransition;
    return url.searchParams.get('ash_epoch') === assetEpoch
      && localStorage.getItem('td613.ash.cache-flush.epoch') === legacyEpoch
      && localStorage.getItem('td613.ash.cache-flush.aia3.epoch') === massEpoch
      && localStorage.getItem('td613.ash.cache-preflight.epoch') === massEpoch
      && transition?.superseded_by_mass_eviction === true
      && transition?.active_session_reset === false;
  }, { legacyEpoch:${JSON.stringify(legacyEpoch)}, massEpoch:${JSON.stringify(massEpoch)}, assetEpoch:${JSON.stringify(assetEpoch)} }, { timeout: 60_000 });`;

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

const maintenanceEntries = {
  'td613.ash.cache-flush.epoch':legacyEpoch,
  'td613.ash.cache-flush.aia3.epoch':massEpoch,
  'td613.ash.cache-preflight.epoch':massEpoch
};

const cleanArrivalReplacement = `  const cleanEntries = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const cleanKeys = Object.keys(cleanEntries);
  const cleanMaintenanceEntries = ${JSON.stringify(maintenanceEntries)};
  const cleanMaintenanceKeys = new Set(Object.keys(cleanMaintenanceEntries));
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.every(key => cleanMaintenanceKeys.has(key)), 'Clean arrival wrote case-adjacent localStorage before operator action');
  for (const [key, value] of Object.entries(cleanMaintenanceEntries)) {
    assert(cleanEntries[key] === value, \`Clean arrival carried an unknown maintenance epoch for \${key}\`);
  }
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    maintenance_entries: cleanEntries,
    permitted_maintenance_entries: cleanMaintenanceEntries,
    cache_navigation_replaced: window.__td613AshCacheTransition?.navigation_replaced ?? null,
    mass_eviction_superseded_legacy_reset: window.__td613AshCacheTransition?.superseded_by_mass_eviction === true,
    case_adjacent_storage_written: false,
    non_read_requests: initialNonGet
  };`;

const premiumMarker = 'const premiumCommandInstrument = await page.evaluate';
const allowlistMarker = "'td613.ash.session.epoch'";
const cacheMarker = 'const cleanMaintenanceEntries =';
const navigationMarker = 'ASH_AIA3_MASS_EVICTION_STABLE';
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

if (!prepared.includes(allowlistMarker)) {
  const matches = prepared.match(allowedKeysPattern) || [];
  if (matches.length !== 1) throw new Error(`Mass-eviction fixture expected one localStorage allowlist declaration; observed ${matches.length}.`);
  prepared = prepared.replace(allowedKeysPattern, allowedKeysReplacement);
  transformations.push('ALLOW_ONLY_NAMED_MAINTENANCE_KEYS_AFTER_OPERATOR_ACTION');
}

if (!prepared.includes(navigationMarker)) {
  const count = prepared.split(navigationTarget).length - 1;
  if (count !== 1) throw new Error(`Mass-eviction fixture expected one navigation seam; observed ${count}.`);
  prepared = prepared.replace(navigationTarget, navigationReplacement);
  transformations.push('REQUIRE_ONE_EXACT_PRE_MODULE_ASSET_REPLACEMENT');
}

if (!prepared.includes(cacheMarker)) {
  const count = prepared.split(cleanArrivalTarget).length - 1;
  if (count !== 1) throw new Error(`Mass-eviction fixture expected one clean-arrival assertion seam; observed ${count}.`);
  prepared = prepared.replace(cleanArrivalTarget, cleanArrivalReplacement);
  transformations.push('ALLOW_ONLY_THREE_EXACT_NON_CASE_MAINTENANCE_MARKERS');
}

for (const required of [premiumMarker, navigationMarker, cacheMarker, 'mass_eviction_superseded_legacy_reset', allowlistMarker]) {
  if (!prepared.includes(required)) throw new Error(`Premium/mass-eviction fixture omitted ${required}.`);
}

if (prepared !== original) await fs.writeFile(probePath, prepared, 'utf8');
await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify({
  schema:'td613.ash-keep.premium-production-closure-fixture/v0.8-aia3-mass-eviction',
  source_probe:path.relative(repoRoot, probePath),
  posture:transformations.length ? 'PREPARED_NOW' : 'ALREADY_PREPARED',
  source_sha256:sha256(original),
  prepared_sha256:sha256(prepared),
  transformations,
  permitted_clean_arrival_local_storage:{
    entries:maintenanceEntries,
    classification:'EXACT_NON_CASE_MAINTENANCE_MARKERS'
  },
  cache_navigation_required:true,
  active_document_replacement_allowed:'ONE_EXACT_ASH_EPOCH_REPLACEMENT',
  case_pointer_allowed_before_operator_action:false,
  lifecycle_record_allowed_before_operator_action:false,
  receipt_allowed_before_operator_action:false,
  preferences_allowed_before_operator_action:false,
  source_file_mutated_in_ephemeral_ci_checkout_only:true,
  product_ui_mutated:false,
  promotion_authorized:false,
  transport_authorized:false,
  cinder_authorized:false
}, null, 2)}\n`);

console.log(`prepare-ash-premium-closure-fixture.mjs passed · ${transformations.length ? 'PREPARED_NOW' : 'ALREADY_PREPARED'}`);
