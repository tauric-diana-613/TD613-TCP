import assert from 'node:assert/strict';
import fs from 'node:fs';

const inheritedAssetEpoch = '20260724-a12-release-v1';
const reviewAssetEpoch = '20260727-a15-review-release-v1';
const registryAssetEpoch = '20260726-a15-empirical-v1';
const cacheEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';

const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const eviction = fs.readFileSync(new URL('../app/dome-world/ash-cache-eviction-aia3.js', import.meta.url), 'utf8');
const lifecycle = fs.readFileSync(new URL('../app/dome-world/ash-lifecycle.js', import.meta.url), 'utf8');
const workspace = fs.readFileSync(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');
const profile = fs.readFileSync(new URL('../app/dome-world/ash-profile-demo-hydration.js', import.meta.url), 'utf8');
const registry = fs.readFileSync(new URL('../app/dome-world/ash-demo-registry.js', import.meta.url), 'utf8');
const archive = fs.readFileSync(new URL('../app/dome-world/ash-archive-profile-demo.js', import.meta.url), 'utf8');
const empirical = fs.readFileSync(new URL('../app/dome-world/ash-a15-empirical-profile-journeys.js', import.meta.url), 'utf8');
const recompiler = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const recovery = fs.readFileSync(new URL('../app/safe-harbor/ash-keep-recovery.html', import.meta.url), 'utf8');
const deferral = fs.readFileSync(new URL('../app/dome-world/docs/ASH_KEEP_A15_A19_MASS_EVICTION_DEFERRAL_AMENDMENT_V0_1.md', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

assert.ok(shell.includes(`ASH_LIFECYCLE_ASSET_EPOCH = '${reviewAssetEpoch}'`));
assert.ok(shell.includes(`ASH_MASS_EVICTION_EPOCH = '${cacheEpoch}'`));
assert.ok(shell.includes('content="a11-postclosure-v1"'));
assert.match(shell, /Clear-Site-Data', '"cache"'/);
assert.match(shell, /indexeddb_preserved:true/);
assert.match(shell, /case_data_preserved:true/);
assert.match(shell, /active_session_reset:false/);
assert.match(shell, /local_case_pointer_preserved/);
assert.match(shell, /session_epoch_preserved_or_migrated/);

assert.ok(eviction.includes(`ASH_AIA3_CACHE_EPOCH = '${cacheEpoch}'`));
assert.ok(eviction.includes(`ASH_AIA3_ASSET_EPOCH = '${inheritedAssetEpoch}'`));
assert.match(eviction, /clearCacheStorage/);
assert.match(eviction, /unregisterWorkers/);
assert.match(eviction, /requestHttpEviction/);
assert.match(eviction, /indexeddb_preserved:true/);
assert.match(eviction, /case_data_preserved:true/);
assert.match(eviction, /local_case_pointer_preserved:pointerAfter === pointerBefore/);
assert.match(eviction, /session_epoch_preserved:sessionAfter === sessionBefore/);
assert.match(eviction, /storage_cleared:false/);
assert.match(eviction, /reload_required:false/);
assert.doesNotMatch(eviction, /indexedDB\.deleteDatabase/);
assert.doesNotMatch(eviction, /localStorage\.clear/);
assert.doesNotMatch(eviction, /sessionStorage\.clear/);

assert.ok(lifecycle.includes(reviewAssetEpoch), 'lifecycle missing A15 review asset epoch');
for (const [name, source] of Object.entries({ recompiler, recovery })) {
  assert.ok(source.includes(inheritedAssetEpoch) || name === 'recovery', `${name} missing the inherited A12 component epoch`);
}
assert.ok(profile.includes(registryAssetEpoch), 'profile façade missing the A15 registry asset epoch');
assert.ok(registry.includes(registryAssetEpoch), 'registry missing its A15 asset epoch');
assert.ok(workspace.includes(`ash-profile-demo-hydration.js?v=${registryAssetEpoch}`));
assert.ok(recovery.includes(cacheEpoch));
assert.equal((workspace.match(new RegExp(inheritedAssetEpoch, 'g')) || []).length >= 25, true, 'inherited workspace graph lost broad versioning');
for (const stage of ['ash-a9-work-recompilation.js','ash-a10-choir-recompilation.js','ash-a11-capsule-recompilation.js']) {
  assert.ok(recompiler.includes(`${stage}?v=${inheritedAssetEpoch}`), `recompiler missing ${stage} inherited live version`);
}
assert.match(deferral, /accepted mass-eviction epoch during A15 review release/);
assert.match(deferral, /new A15 graph-wide cache flush: false/);
assert.match(deferral, /reserved for \*\*A19 postclosure\*\*/);
assert.doesNotMatch(profile + registry + archive + empirical, /caches\.|serviceWorker|ash_epoch|deleteDatabase|localStorage\.clear|sessionStorage\.clear/);
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a15-review-release-with-a11-mass-epoch/v0.2',
  inherited_component_epoch:inheritedAssetEpoch,
  review_asset_epoch:reviewAssetEpoch,
  registry_asset_epoch:registryAssetEpoch,
  cache_epoch:cacheEpoch,
  ordinary_review_asset_version_advanced:true,
  graph_wide_mass_eviction_reexecuted:false,
  mass_eviction_deferred_to:'A19_POSTCLOSURE',
  browser_cache_cleared_for_a15:false,
  service_workers_unregistered_for_a15:false,
  indexeddb_preserved:true,
  active_case_pointer_preserved:true,
  session_epoch_preserved:true,
  custody_and_case_data_preserved:true,
  active_session_reset:false,
  second_deployment_attempt_created:false,
  vercel_gate:'CLOSED'
}, null, 2));
