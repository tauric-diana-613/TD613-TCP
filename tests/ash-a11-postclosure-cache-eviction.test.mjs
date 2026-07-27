import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ASH_LIFECYCLE_ASSET_EPOCH,
  ASH_MASS_EVICTION_EPOCH,
  injectAshKeepLifecycle
} from '../api/dome-world-shell.js';

const assetEpoch = '20260727-a15-postclosure-v1';
const cacheEpoch = 'td613.ash.cache-flush/2026-07-27-a15-postclosure-v1';
const marker = 'a15-postclosure-v1';
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const shell = read('api/dome-world-shell.js');
const shellCore = read('lib/dome-world-shell-core.js');
const eviction = read('app/dome-world/ash-cache-eviction-aia3.js');
const flush = read('app/dome-world/ash-cache-flush.js');
const lifecycle = read('app/dome-world/ash-lifecycle.js');
const recovery = read('app/safe-harbor/ash-keep-recovery.html');
const keep = read('app/dome-world/ash-keep.html');
const amendment = read('app/dome-world/docs/ASH_KEEP_A12_A15_OPERATOR_AMENDMENT_V0_1.md');
const receipt = read('app/dome-world/docs/ASH_KEEP_A15_POSTCLOSURE_MASS_EVICTION_MUTATION_RECEIPT_V0_1.md');
const vercel = JSON.parse(read('vercel.json'));

assert.equal(ASH_LIFECYCLE_ASSET_EPOCH, assetEpoch);
assert.equal(ASH_MASS_EVICTION_EPOCH, cacheEpoch);
assert.match(shell, /dome-world-shell-core\.js/);
assert.match(shell, /replaceAll\(OLD_ASSET_EPOCH, ASH_LIFECYCLE_ASSET_EPOCH\)/);
assert.match(shell, /replaceAll\(OLD_MASS_EVICTION_EPOCH, ASH_MASS_EVICTION_EPOCH\)/);
assert.match(shellCore, /Clear-Site-Data/);
assert.match(shellCore, /indexeddb_preserved:true/);
assert.match(shellCore, /active_session_reset:false/);

assert.match(eviction, new RegExp(cacheEpoch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(eviction, new RegExp(assetEpoch));
assert.match(eviction, /clearCacheStorage/);
assert.match(eviction, /unregisterWorkers/);
assert.match(eviction, /requestHttpEviction/);
assert.match(eviction, /indexeddb_preserved:true/);
assert.match(eviction, /case_data_preserved:true/);
assert.match(eviction, /active_session_reset:false/);
assert.match(eviction, /storage_cleared:false/);
assert.doesNotMatch(eviction, /indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/);

assert.match(flush, /ash-cache-flush-core\.js/);
assert.match(flush, /superseded_by_mass_eviction:true/);
assert.match(flush, /active_session_reset:false/);
assert.match(lifecycle, new RegExp(assetEpoch));
assert.match(recovery, new RegExp(assetEpoch));
assert.match(recovery, new RegExp(cacheEpoch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

const rendered = injectAshKeepLifecycle(keep);
assert.match(rendered, new RegExp(assetEpoch));
assert.match(rendered, new RegExp(cacheEpoch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.match(rendered, new RegExp(`name="ash-cache-preflight" content="${marker}"`));
assert.match(rendered, /indexeddb_preserved:true/);
assert.match(rendered, /case_data_preserved:true/);
assert.match(rendered, /active_session_reset:false/);
assert.doesNotMatch(rendered, /2026-07-24-a11-postclosure-v1/);

assert.match(amendment, /final tested source mutation before the A15 production release/);
assert.match(receipt, /PRE-RELEASE \/ PRE-RELOCK/);
assert.match(receipt, /final A12–A15 production-closure dossier remains mandatory/);
assert.equal(vercel.git?.deploymentEnabled, false);

console.log(JSON.stringify({
  ok:true,
  schema:'td613.ash.a15-postclosure-mass-eviction-contract/v0.1',
  lifecycle_asset_epoch:assetEpoch,
  cache_epoch:cacheEpoch,
  graph_wide_mass_eviction_reserved_and_applied:true,
  browser_cache_eviction_enabled:true,
  same_origin_worker_unregistration_enabled:true,
  indexeddb_preserved:true,
  custody_and_case_data_preserved:true,
  active_session_reset:false,
  deployment_count:0,
  vercel_gate:'CLOSED',
  human_closure_required:true
}, null, 2));
