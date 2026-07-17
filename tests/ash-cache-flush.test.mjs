import assert from 'node:assert/strict';
import fs from 'node:fs';

import { ASH_CACHE_FLUSH_EPOCH, runAshCacheFlush } from '../app/dome-world/ash-cache-flush.js';

const source = fs.readFileSync('app/dome-world/ash-cache-flush.js', 'utf8');
const keep = fs.readFileSync('app/dome-world/ash-keep.js', 'utf8');
const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));

assert.equal(ASH_CACHE_FLUSH_EPOCH, 'td613.ash.cache-flush/2026-07-17-premium-v1');
assert.equal(typeof runAshCacheFlush, 'function');
assert.match(source, /caches\.delete/);
assert.match(source, /getRegistrations/);
assert.match(source, /location\.replace/);
assert.match(keep, /^import '\.\/ash-cache-flush\.js';/);

for (const route of ['/dome-world/ash-(.*)', '/app/dome-world/ash-(.*)']) {
  const rule = vercel.headers.find(item => item.source === route);
  assert.ok(rule, `Missing no-store rule for ${route}`);
  const cache = rule.headers.find(item => item.key.toLowerCase() === 'cache-control');
  assert.equal(cache?.value, 'no-store, max-age=0');
}

console.log('ash-cache-flush.test.mjs passed');
