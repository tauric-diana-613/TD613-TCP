import assert from 'node:assert/strict';
import fs from 'node:fs';

const ingress = fs.readFileSync('app/dome-world/ash-ingress-layout-hydration.js','utf8');
const cache = fs.readFileSync('app/dome-world/ash-cache-flush.js','utf8');
const lifecycle = fs.readFileSync('app/dome-world/ash-lifecycle.js','utf8');
const bridge = fs.readFileSync('app/dome-world/ash-workspace-bridge.js','utf8');
const control = fs.readFileSync('app/dome-world/ash-research-demo-control-state.js','utf8');
const evict = fs.readFileSync('app/dome-world/ash-cache-evict.html','utf8');
const shell = fs.readFileSync('api/dome-world-shell.js','utf8');

assert.match(ingress,/overflow-y:auto/);
assert.match(ingress,/scrollbar-gutter:stable/);
assert.match(ingress,/max-height:calc\(100dvh - 44px\)/);
assert.match(ingress,/margin:auto/);
assert.match(ingress,/horizontal_overflow/);
assert.doesNotMatch(ingress,/localStorage|indexedDB|fetch\(/);

assert.match(cache,/2026-07-17-research-ingress-v2/);
assert.match(cache,/LOCAL_HOSTS/);
assert.match(cache,/LOCAL_BOUNDED_RUNTIME_HAS_NO_VERCEL_HEADER_SURFACE/);
assert.match(cache,/caches\.keys/);
assert.match(cache,/registration\.unregister/);
assert.match(cache,/cache:'reload'/);
assert.match(cache,/\/api\/dome-world-shell\?surface=cache-evict/);
assert.match(cache,/indexeddb_preserved:true/);
assert.match(cache,/storage_cleared:false/);
assert.match(cache,/physical_http_cache_erasure_verified:false/);
assert.doesNotMatch(cache,/indexedDB\.deleteDatabase|localStorage\.clear|sessionStorage\.clear/);

assert.match(lifecycle,/ash-ingress-layout-hydration\.js\?v=20260717-research-ingress-v2/);
assert.match(lifecycle,/ash-research-demo-hydration\.js\?v=20260717-research-v1/);
assert.match(bridge,/ash-research-demo-hydration\.js\?v=20260717-research-v1/);
assert.match(bridge,/ash-research-demo-control-state\.js\?v=20260717-research-v1/);
assert.match(bridge,/import '\.\/ash-profile-demo-hydration\.js';/);
assert.match(bridge,/ash-guided-trust-boundary-court\.js\?v=20260717-trust-boundary-v1/);
assert.match(control,/aria-disabled/);
assert.match(control,/aria-busy/);
assert.match(control,/MutationObserver/);
assert.match(control,/data.*ashResearchControlState|ashResearchControlState/);
assert.match(evict,/performs no storage deletion/);
assert.match(shell,/cache-evict/);
assert.match(shell,/Clear-Site-Data/);
assert.match(shell,/"cache"/);
assert.doesNotMatch(shell,/Clear-Site-Data[^\n]*storage/i);

console.log('ash-ingress-cache-eviction.test.mjs passed');
