import assert from 'assert';
import fs from 'fs';

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const gitignore = fs.readFileSync('.gitignore', 'utf8');

function findRewrite(source) {
  return (vercel.rewrites || []).find((entry) => entry.source === source);
}

function findHeader(source) {
  return (vercel.headers || []).find((entry) => entry.source === source);
}

function cacheControlValue(source) {
  const entry = findHeader(source);
  const header = (entry?.headers || []).find((item) => String(item.key || '').toLowerCase() === 'cache-control');
  return header?.value || '';
}

function assertRewrite(source, destination) {
  assert.equal(findRewrite(source)?.destination, destination, `missing Vercel rewrite: ${source} -> ${destination}`);
}

function assertRewriteBefore(earlier, later) {
  const rewrites = vercel.rewrites || [];
  const earlierIndex = rewrites.findIndex((entry) => entry.source === earlier);
  const laterIndex = rewrites.findIndex((entry) => entry.source === later);
  assert.ok(earlierIndex >= 0, `missing exact rewrite: ${earlier}`);
  assert.ok(laterIndex >= 0, `missing fallback rewrite: ${later}`);
  assert.ok(earlierIndex < laterIndex, `${earlier} must precede ${later}`);
}

function assertNoStore(source) {
  const value = cacheControlValue(source);
  assert.match(value, /\bno-store\b/i, `missing no-store cache policy for ${source}`);
  assert.match(value, /\bmax-age=0\b/i, `missing max-age=0 cache policy for ${source}`);
}

function assertRevalidatingStatic(source) {
  const value = cacheControlValue(source);
  assert.doesNotMatch(value, /\bno-store\b/i, `static asset should not force no-store: ${source}`);
  assert.match(value, /\bpublic\b/i, `static asset should be publicly cacheable with validation: ${source}`);
  assert.match(value, /\bmax-age=0\b/i, `static asset should require freshness validation: ${source}`);
  assert.match(value, /\bmust-revalidate\b/i, `static asset should revalidate instead of going stale: ${source}`);
}

assert.equal(vercel.version, 2, 'Vercel config should use version 2');
assert.equal(vercel.functions?.['api/hush-generate-strict.js']?.maxDuration, 60, 'strict Hush route should keep 60s function budget');
assert.equal(vercel.functions?.['api/hush-generate.js']?.maxDuration, 60, 'Hush route should keep 60s function budget');
assert.equal(vercel.functions?.['api/dome-world-engine.py']?.maxDuration, 60, 'Dome exact lineage route should keep 60s function budget');
assert.equal(vercel.functions?.['api/dome-world-engine-guard.py']?.maxDuration, 60, 'guarded Dome route should keep 60s function budget');
assert.equal(vercel.functions?.['api/ash-local-commitment.py']?.maxDuration, 60, 'Ash local commitment lineage route should keep 60s function budget');
assert.equal(vercel.functions?.['api/ash-local-commitment-guard.py']?.maxDuration, 60, 'guarded Ash commitment route should keep 60s function budget');
assert.equal(typeof vercel.functions?.['api/dome-world-engine-guard.py']?.includeFiles, 'string', 'guard includeFiles must remain a Vercel-valid string');
assert.equal(typeof vercel.functions?.['api/ash-local-commitment-guard.py']?.includeFiles, 'string', 'Ash guard includeFiles must remain a Vercel-valid string');
assert.ok(!vercel.functions?.['api/dome-world-engine-v07.py'], 'removed coupled v0.7 adapter must not return');

assertRewrite('/api/dome-world/ash-custody-register', '/api/ash-local-commitment-guard');
assertRewrite('/api/dome-world/ash-custody-replay', '/api/ash-local-commitment-guard');
assertRewrite('/api/ash-local-commitment', '/api/ash-local-commitment-guard');
assertRewrite('/api/dome-world-engine', '/api/dome-world-engine-guard');
assertRewrite('/api/dome-world/ping', '/api/dome-world-engine-guard?operation=ping');
assertRewrite('/api/dome-world/readiness', '/api/dome-world-engine-guard?operation=readiness');
assertRewrite('/api/dome-world/step2-readiness', '/api/dome-world-engine-guard?operation=step2-readiness');
assertRewrite('/api/dome-world/(.*)', '/api/dome-world-engine-guard?operation=$1');
assertRewrite('/dome-world', '/app/dome-world/index.html');
assertRewrite('/dome-world/', '/app/dome-world/index.html');
assertRewrite('/dome-world/ash-custody.html', '/app/dome-world/ash-custody-v07.html');
assertRewrite('/app/dome-world/ash-custody.html', '/app/dome-world/ash-custody-v07.html');
assertRewrite('/dome-world/(.*)', '/app/dome-world/$1');
assertRewrite('/api/(.*)', '/api/$1');
assertRewrite('/safe-harbor/td613-flight.html', '/api/flight-html');
assertRewrite('/app/safe-harbor/td613-flight.html', '/api/flight-html');
assertRewrite('/app/(.*)', '/app/$1');
assertRewrite('/(.*)', '/app/$1');

assertRewriteBefore('/api/dome-world/ash-custody-register', '/api/dome-world/(.*)');
assertRewriteBefore('/api/dome-world/ash-custody-replay', '/api/dome-world/(.*)');
assertRewriteBefore('/api/ash-local-commitment', '/api/(.*)');
assertRewriteBefore('/api/dome-world-engine', '/api/(.*)');
assert.ok(!findRewrite('/dome-world/ash/local-commitment.js'), 'canonical commitment module should be served by the ordinary Dome-World asset route');
assert.ok(!findRewrite('/app/dome-world/ash/local-commitment.js'), 'canonical app asset should not be redirected to a duplicate implementation');
assert.ok(!(vercel.rewrites || []).some((entry) => String(entry.destination).includes('local-commitment-v071.js')));

[
  '/adversarial-bench.html',
  '/app/adversarial-bench.html',
  '/safe-harbor/td613-flight.html',
  '/app/safe-harbor/td613-flight.html',
  '/asset-versions.js',
  '/app/asset-versions.js',
  '/dome-world',
  '/dome-world/',
  '/app/dome-world/index.html',
  '/dome-world/ash-custody.html',
  '/app/dome-world/ash-custody-v07.html',
  '/dome-world/ash/local-commitment.js',
  '/app/dome-world/ash/local-commitment.js',
  '/api/dome-world-engine',
  '/api/ash-local-commitment',
  '/api/dome-world-engine-guard',
  '/api/ash-local-commitment-guard'
].forEach(assertNoStore);

[
  '/app/safe-harbor/td613-flight-android-scroll-fix.js',
  '/safe-harbor/td613-flight-android-scroll-fix.js',
  '/safe-harbor/app/safe-harbor-housekeeping.css',
  '/safe-harbor/app/safe-harbor-housekeeping.js',
  '/app/safe-harbor/app/safe-harbor-housekeeping.css',
  '/app/safe-harbor/app/safe-harbor-housekeeping.js',
  '/gateway-housekeeping.css',
  '/app/gateway-housekeeping.css',
  '/styles.css',
  '/app/styles.css',
  '/adversarial-bench.js',
  '/app/adversarial-bench.js',
  '/adversarial-bench-light.js',
  '/app/adversarial-bench-light.js',
  '/adversarial-bench.mjs',
  '/app/adversarial-bench.mjs',
  '/hush-(.*)',
  '/app/hush-(.*)',
  '/engine/(.*)',
  '/app/engine/(.*)',
  '/dome-world/(.*)'
].forEach(assertRevalidatingStatic);

assert.match(gitignore, /(^|\r?\n)\.env(\r?\n|$)/, '.env must remain ignored for Vercel/local secret hygiene');
assert.doesNotMatch(gitignore, /(^|\r?\n)!\.env(\r?\n|$)/, '.env must not be negated in .gitignore');

console.log('vercel-deploy-hygiene.test.mjs passed');
