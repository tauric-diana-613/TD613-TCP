import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runAshCacheFlush } from '../app/dome-world/ash-cache-flush.js';
import { runAshAia3CacheEviction } from '../app/dome-world/ash-cache-eviction-aia3.js';

function storage() {
  const map = new Map();
  return {
    get length(){ return map.size; },
    key(index){ return [...map.keys()][index] ?? null; },
    getItem(key){ return map.has(key) ? map.get(key) : null; },
    setItem(key,value){ map.set(String(key),String(value)); },
    removeItem(key){ map.delete(String(key)); },
    clear(){ map.clear(); },
    snapshot(){ return new Map(map); }
  };
}

const localStorage = storage();
const sessionStorage = storage();
let cacheEnumerations = 0;
let cacheDeletes = 0;
let workerEnumerations = 0;
let workerUnregisters = 0;
let fetchCalls = 0;
let redirects = 0;
const host = {
  location:{href:'https://td613.com/dome-world/ash-threshold.html'},
  history:{replaceState(){}},
  localStorage,
  sessionStorage,
  caches:{
    async keys(){cacheEnumerations += 1; return ['legacy'];},
    async delete(){cacheDeletes += 1; return true;}
  },
  navigator:{serviceWorker:{
    async getRegistrations(){workerEnumerations += 1; return [{async unregister(){workerUnregisters += 1; return true;}}];}
  }},
  async fetch(){fetchCalls += 1; return {ok:true,status:200,headers:{get(){return '"cache"';}}};},
  document:{documentElement:{classList:{remove(){}},dataset:{}},body:{dataset:{}}},
  crypto:{randomUUID(){return 'should-not-be-used';}}
};
host.location.replace=()=>{redirects += 1;};

const baseReceipt = await runAshCacheFlush(host);
const aia3Receipt = await runAshAia3CacheEviction(host);

for (const receipt of [baseReceipt,aia3Receipt]) {
  assert.equal(receipt.performed,false);
  assert.equal(receipt.retired,true);
  assert.equal(receipt.superseded_by_sitewide_epoch,true);
}
assert.equal(cacheEnumerations,0);
assert.equal(cacheDeletes,0);
assert.equal(workerEnumerations,0);
assert.equal(workerUnregisters,0);
assert.equal(fetchCalls,0);
assert.equal(redirects,0);
for (const key of localStorage.snapshot().keys()) {
  assert.doesNotMatch(key,/td613\.ash\.cache-(?:flush|preflight)/);
}

const shell = fs.readFileSync('lib/dome-world-shell-core.js','utf8');
const siteReset = fs.readFileSync('app/site-epoch-reset.js','utf8');
const reobserveExists = fs.existsSync('.github/workflows/vercel-production-reobserve.yml');
assert.match(shell,/RETIRED_SITE_EPOCH_AUTHORITY/);
assert.match(shell,/sitewide_epoch_authoritative:true/);
assert.match(shell,/window\.__td613AshAia3Preflight=Promise\.resolve\(receipt\)/);
assert.doesNotMatch(shell,/Clear-Site-Data|caches\?\.keys|serviceWorker\?\.getRegistrations|location\.replace\(recoveryBridge\)|searchParams\.set\('surface','cache-evict'\)/);
assert.doesNotMatch(siteReset,/td613\.ash\.cache-(?:flush|preflight)/);
assert.equal(reobserveExists,false);

console.log('ash-eviction-retirement.test.mjs passed: site epoch is sole stale-client eviction authority');
