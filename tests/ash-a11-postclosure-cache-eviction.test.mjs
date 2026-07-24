import assert from 'node:assert/strict';
import fs from 'node:fs';

const assetEpoch = '20260724-a11-postclosure-v1';
const cacheEpoch = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';

const shell = fs.readFileSync(new URL('../api/dome-world-shell.js', import.meta.url), 'utf8');
const eviction = fs.readFileSync(new URL('../app/dome-world/ash-cache-eviction-aia3.js', import.meta.url), 'utf8');
const lifecycle = fs.readFileSync(new URL('../app/dome-world/ash-lifecycle.js', import.meta.url), 'utf8');
const workspace = fs.readFileSync(new URL('../app/dome-world/ash-workspace-bridge.js', import.meta.url), 'utf8');
const profile = fs.readFileSync(new URL('../app/dome-world/ash-profile-demo-hydration.js', import.meta.url), 'utf8');
const recompiler = fs.readFileSync(new URL('../app/dome-world/ash-a7-a11-recompiler-core.js', import.meta.url), 'utf8');
const recovery = fs.readFileSync(new URL('../app/safe-harbor/ash-keep-recovery.html', import.meta.url), 'utf8');
const vercel = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));

assert.ok(shell.includes(`ASH_LIFECYCLE_ASSET_EPOCH = '${assetEpoch}'`));
assert.ok(shell.includes(`ASH_MASS_EVICTION_EPOCH = '${cacheEpoch}'`));
assert.ok(shell.includes('content="a11-postclosure-v1"'));
assert.match(shell, /Clear-Site-Data', '\"cache\"'/);
assert.match(shell, /indexeddb_preserved:true/);
assert.match(shell, /case_data_preserved:true/);
assert.match(shell, /active_session_reset:false/);
assert.match(shell, /local_case_pointer_preserved/);
assert.match(shell, /session_epoch_preserved_or_migrated/);

assert.ok(eviction.includes(`ASH_AIA3_CACHE_EPOCH = '${cacheEpoch}'`));
assert.ok(eviction.includes(`ASH_AIA3_ASSET_EPOCH = '${assetEpoch}'`));
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

for (const [name, source] of Object.entries({ lifecycle, workspace, profile, recompiler, recovery })) {
  assert.ok(source.includes(assetEpoch), `${name} missing A11 postclosure asset epoch`);
}
assert.ok(recovery.includes(cacheEpoch));
assert.equal((workspace.match(new RegExp(assetEpoch, 'g')) || []).length >= 30, true, 'workspace graph was not versioned broadly enough');
for (const stage of ['ash-a9-work-recompilation.js','ash-a10-choir-recompilation.js','ash-a11-capsule-recompilation.js']) {
  assert.ok(recompiler.includes(`${stage}?v=${assetEpoch}`), `recompiler missing ${stage} postclosure version`);
}

assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a11-postclosure-cache-eviction-contract/v0.1',
  asset_epoch:assetEpoch,
  cache_epoch:cacheEpoch,
  graph_wide_versioning:true,
  cache_storage_evicted:true,
  same_origin_workers_unregistered:true,
  http_cache_eviction_requested:true,
  indexeddb_preserved:true,
  active_case_pointer_preserved:true,
  session_epoch_preserved:true,
  custody_and_case_data_preserved:true,
  active_session_reset:false,
  second_deployment_attempt_created:false,
  vercel_gate:'CLOSED'
}, null, 2));
