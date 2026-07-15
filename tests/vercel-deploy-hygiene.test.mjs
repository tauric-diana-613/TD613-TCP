import assert from 'assert';
import fs from 'fs';

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const gitignore = fs.readFileSync('.gitignore', 'utf8');
const configuredFunctions = Object.keys(vercel.functions || {}).sort();

function findRewrite(source) { return (vercel.rewrites || []).find(entry => entry.source === source); }
function findHeader(source) { return (vercel.headers || []).find(entry => entry.source === source); }
function cacheControlValue(source) {
  const entry = findHeader(source);
  return (entry?.headers || []).find(item => String(item.key || '').toLowerCase() === 'cache-control')?.value || '';
}
function assertRewrite(source, destination) {
  assert.equal(findRewrite(source)?.destination, destination, `missing Vercel rewrite: ${source} -> ${destination}`);
}
function assertRewriteBefore(earlier, later) {
  const rewrites = vercel.rewrites || [];
  const earlierIndex = rewrites.findIndex(entry => entry.source === earlier);
  const laterIndex = rewrites.findIndex(entry => entry.source === later);
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

assert.equal(vercel.version, 2);
assert.ok(configuredFunctions.length <= 12, `configured Vercel function budget exceeded: ${configuredFunctions.length}/12 — ${configuredFunctions.join(', ')}`);
assert.ok(!configuredFunctions.includes('api/aperture-bridge.py'), 'Phase IV must share the guarded Dome-World function');
assert.ok(!configuredFunctions.includes('api/aperture-bridge.js'), 'Phase IV must not allocate a new JavaScript function');
assert.ok(!configuredFunctions.includes('api/ash-keep-shell.js'), 'Ash Keep HTML must share the Dome shell function');
assert.ok(!configuredFunctions.includes('api/ash-keep-js-shell.js'), 'Ash Keep JavaScript must share the Dome shell function');
assert.equal(vercel.functions?.['api/hush-generate-strict.js']?.maxDuration, 60);
assert.equal(vercel.functions?.['api/hush-generate.js']?.maxDuration, 60);
assert.equal(vercel.functions?.['api/dome-world-shell.js']?.maxDuration, 10);
const domeShellIncludes = vercel.functions?.['api/dome-world-shell.js']?.includeFiles || '';
assert.match(domeShellIncludes, /app\/dome-world\/index\.html/);
assert.match(domeShellIncludes, /app\/dome-world\/ash-keep\.html/);
assert.match(domeShellIncludes, /app\/dome-world\/ash-keep\.js/);
assert.equal(vercel.functions?.['api/dome-world-engine.py']?.maxDuration, 60);
assert.equal(vercel.functions?.['api/dome-world-engine-guard.py']?.maxDuration, 60);
assert.equal(vercel.functions?.['api/ash-local-commitment.py']?.maxDuration, 60);
assert.equal(vercel.functions?.['api/ash-local-commitment-guard.py']?.maxDuration, 60);
for (const [name, config] of Object.entries(vercel.functions || {})) {
  if ('includeFiles' in config) assert.equal(typeof config.includeFiles, 'string', `${name}.includeFiles must be a string`);
  if ('excludeFiles' in config) assert.equal(typeof config.excludeFiles, 'string', `${name}.excludeFiles must be a string`);
}
assert.match(vercel.functions['api/ash-local-commitment.py'].includeFiles, /ash_\*\.py/);
assert.match(vercel.functions['api/ash-local-commitment-guard.py'].includeFiles, /ash_\*\.py/);
assert.ok(!vercel.functions?.['api/dome-world-engine-v07.py']);

assertRewrite('/api/dome-world/ash-custody-register', '/api/ash-local-commitment-guard');
assertRewrite('/api/dome-world/ash-custody-replay', '/api/ash-local-commitment-guard');
assertRewrite('/api/dome-world/ash-custody-migrate', '/api/ash-local-commitment-guard');
assertRewrite('/api/ash-local-commitment', '/api/ash-local-commitment-guard');
assertRewrite('/api/dome-world-engine', '/api/dome-world-engine-guard');
assertRewrite('/api/flowcore-context', '/api/dome-world-engine-guard?operation=flowcore-context');
assertRewrite('/api/dome-world/flowcore-context', '/api/dome-world-engine-guard?operation=flowcore-context');
assertRewrite('/api/aperture-bridge', '/api/dome-world-engine-guard?operation=aperture-bridge-readiness');
assertRewrite('/api/dome-world/aperture-bridge', '/api/dome-world-engine-guard?operation=aperture-bridge-readiness');
assertRewrite('/api/dome-world/ping', '/api/dome-world-engine-guard?operation=ping');
assertRewrite('/api/dome-world/readiness', '/api/dome-world-engine-guard?operation=readiness');
assertRewrite('/api/dome-world/step2-readiness', '/api/dome-world-engine-guard?operation=step2-readiness');
assertRewrite('/api/dome-world/(.*)', '/api/dome-world-engine-guard?operation=$1');
assertRewrite('/dome-world', '/api/dome-world-shell');
assertRewrite('/dome-world/', '/api/dome-world-shell');
assertRewrite('/dome-world/index.html', '/api/dome-world-shell');
assertRewrite('/app/dome-world/index.html', '/api/dome-world-shell');
assertRewrite('/dome-world/ash-keep.html', '/api/dome-world-shell?surface=ash-keep-html');
assertRewrite('/app/dome-world/ash-keep.html', '/api/dome-world-shell?surface=ash-keep-html');
assertRewrite('/dome-world/ash-keep.js', '/api/dome-world-shell?surface=ash-keep-js');
assertRewrite('/app/dome-world/ash-keep.js', '/api/dome-world-shell?surface=ash-keep-js');
assertRewrite('/dome-world/ash-custody.html', '/app/dome-world/ash-custody-v08.html');
assertRewrite('/app/dome-world/ash-custody.html', '/app/dome-world/ash-custody-v08.html');
assertRewrite('/dome-world/flow-core-context.html', '/app/dome-world/flow-core-context.html');
assertRewrite('/dome-world/reciprocal-bridge.html', '/app/dome-world/reciprocal-bridge.html');
assertRewrite('/dome-world/(.*)', '/app/dome-world/$1');
assertRewrite('/api/(.*)', '/api/$1');
assertRewrite('/safe-harbor/td613-flight.html', '/api/flight-html');
assertRewrite('/app/safe-harbor/td613-flight.html', '/api/flight-html');
assertRewrite('/app/(.*)', '/app/$1');
assertRewrite('/(.*)', '/app/$1');

for (const exact of [
  '/api/dome-world/ash-custody-register',
  '/api/dome-world/ash-custody-replay',
  '/api/dome-world/ash-custody-migrate',
  '/api/dome-world/flowcore-context',
  '/api/dome-world/aperture-bridge'
]) assertRewriteBefore(exact, '/api/dome-world/(.*)');
assertRewriteBefore('/api/ash-local-commitment', '/api/(.*)');
assertRewriteBefore('/api/dome-world-engine', '/api/(.*)');
assertRewriteBefore('/api/flowcore-context', '/api/(.*)');
assertRewriteBefore('/api/aperture-bridge', '/api/(.*)');
assertRewriteBefore('/dome-world', '/dome-world/(.*)');
assertRewriteBefore('/dome-world/', '/dome-world/(.*)');
assertRewriteBefore('/dome-world/index.html', '/dome-world/(.*)');
assertRewriteBefore('/dome-world/ash-keep.html', '/dome-world/(.*)');
assertRewriteBefore('/dome-world/ash-keep.js', '/dome-world/(.*)');
assertRewriteBefore('/dome-world/reciprocal-bridge.html', '/dome-world/(.*)');
assertRewriteBefore('/app/dome-world/index.html', '/app/(.*)');
assertRewriteBefore('/app/dome-world/ash-keep.html', '/app/(.*)');
assertRewriteBefore('/app/dome-world/ash-keep.js', '/app/(.*)');

[
  '/adversarial-bench.html', '/app/adversarial-bench.html',
  '/safe-harbor/td613-flight.html', '/app/safe-harbor/td613-flight.html',
  '/asset-versions.js', '/app/asset-versions.js',
  '/dome-world', '/dome-world/', '/app/dome-world/index.html',
  '/dome-world/ash-threshold.html', '/dome-world/ash-keep.html', '/dome-world/ash-keep.js', '/dome-world/ash-lifecycle.js',
  '/dome-world/ash-custody.html', '/app/dome-world/ash-custody-v07.html', '/app/dome-world/ash-custody-v08.html',
  '/dome-world/flow-core-context.html', '/app/dome-world/flow-core-context.html',
  '/dome-world/reciprocal-bridge.html', '/app/dome-world/reciprocal-bridge.html',
  '/dome-world/ash/local-commitment.js', '/app/dome-world/ash/local-commitment.js',
  '/dome-world/ash/canonical-json.js', '/app/dome-world/ash/canonical-json.js',
  '/api/aperture-bridge', '/api/dome-world/aperture-bridge',
  '/api/dome-world-engine', '/api/ash-local-commitment',
  '/api/flowcore-context', '/api/dome-world/flowcore-context',
  '/api/dome-world-engine-guard', '/api/ash-local-commitment-guard'
].forEach(assertNoStore);

[
  '/app/safe-harbor/td613-flight-android-scroll-fix.js',
  '/safe-harbor/td613-flight-android-scroll-fix.js',
  '/safe-harbor/app/safe-harbor-housekeeping.css',
  '/safe-harbor/app/safe-harbor-housekeeping.js',
  '/app/safe-harbor/app/safe-harbor-housekeeping.css',
  '/app/safe-harbor/app/safe-harbor-housekeeping.js',
  '/gateway-housekeeping.css', '/app/gateway-housekeeping.css',
  '/styles.css', '/app/styles.css',
  '/adversarial-bench.js', '/app/adversarial-bench.js',
  '/adversarial-bench-light.js', '/app/adversarial-bench-light.js',
  '/adversarial-bench.mjs', '/app/adversarial-bench.mjs',
  '/hush-(.*)', '/app/hush-(.*)', '/engine/(.*)', '/app/engine/(.*)', '/dome-world/(.*)'
].forEach(assertRevalidatingStatic);

assert.match(gitignore, /(^|\r?\n)\.env(\r?\n|$)/, '.env must remain ignored');
assert.doesNotMatch(gitignore, /(^|\r?\n)!\.env(\r?\n|$)/, '.env must not be negated');

console.log(`vercel-deploy-hygiene.test.mjs passed with ${configuredFunctions.length}/12 configured functions`);
