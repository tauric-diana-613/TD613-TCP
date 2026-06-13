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

function assertNoStore(source) {
  const value = cacheControlValue(source);
  assert.match(value, /\bno-store\b/i, `missing no-store cache policy for ${source}`);
  assert.match(value, /\bmax-age=0\b/i, `missing max-age=0 cache policy for ${source}`);
}

assert.equal(vercel.version, 2, 'Vercel config should use version 2');
assert.equal(vercel.functions?.['api/hush-generate-strict.js']?.maxDuration, 60, 'strict Hush route should keep 60s function budget');
assert.equal(vercel.functions?.['api/hush-generate.js']?.maxDuration, 60, 'Hush route should keep 60s function budget');

assertRewrite('/api/(.*)', '/api/$1');
assertRewrite('/safe-harbor/td613-flight.html', '/api/flight-html');
assertRewrite('/app/safe-harbor/td613-flight.html', '/api/flight-html');
assertRewrite('/app/(.*)', '/app/$1');
assertRewrite('/(.*)', '/app/$1');

[
  '/adversarial-bench.html',
  '/app/adversarial-bench.html',
  '/safe-harbor/td613-flight.html',
  '/app/safe-harbor/td613-flight.html',
  '/safe-harbor/app/safe-harbor-housekeeping.css',
  '/safe-harbor/app/safe-harbor-housekeeping.js',
  '/app/safe-harbor/app/safe-harbor-housekeeping.css',
  '/app/safe-harbor/app/safe-harbor-housekeeping.js',
  '/hush-(.*)',
  '/app/hush-(.*)',
  '/engine/(.*)',
  '/app/engine/(.*)',
  '/asset-versions.js',
  '/app/asset-versions.js'
].forEach(assertNoStore);

assert.match(gitignore, /(^|\r?\n)\.env(\r?\n|$)/, '.env must remain ignored for Vercel/local secret hygiene');
assert.doesNotMatch(gitignore, /(^|\r?\n)!\.env(\r?\n|$)/, '.env must not be negated in .gitignore');

console.log('vercel-deploy-hygiene.test.mjs passed');
