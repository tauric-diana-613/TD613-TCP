import assert from 'node:assert/strict';
import fs from 'node:fs';

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const khonapolitEntry = fs.readFileSync('api/khonapolit.js', 'utf8');
const rewrites = vercel.rewrites || [];
const rewrite = (source) => rewrites.find((entry) => entry.source === source);
const before = (earlier, later) => {
  const a = rewrites.findIndex((entry) => entry.source === earlier);
  const b = rewrites.findIndex((entry) => entry.source === later);
  assert.ok(a >= 0, `missing ${earlier}`);
  assert.ok(b >= 0, `missing ${later}`);
  assert.ok(a < b, `${earlier} must precede ${later}`);
};

assert.equal(vercel.functions['api/hush-generate-quality.js']?.maxDuration, 60);
assert.equal(vercel.functions['api/khonapolit.js']?.maxDuration, 60);
assert.equal(vercel.functions['api/gemini-readiness.js']?.maxDuration, 20);
assert.ok(!vercel.functions['api/hush-generate.js']);
assert.ok(!vercel.functions['api/khonapolit-quality.js']);

assert.equal(rewrite('/api/hush-generate')?.destination, '/api/hush-generate-quality');
assert.equal(rewrite('/api/hush-generate-budgeted')?.destination, '/api/hush-generate-quality');
assert.equal(rewrite('/api/hush-generate-strict-pr124')?.destination, '/api/hush-generate-strict');
assert.equal(rewrite('/api/khonapolit'), undefined);
assert.equal(rewrite('/api/khonapolit-quality')?.destination, '/api/khonapolit');
assert.equal(rewrite('/api/dome-world/khonapolit')?.destination, '/api/khonapolit');
assert.match(khonapolitEntry, /server\/khonapolit-quality\.js/);

before('/api/hush-generate', '/api/(.*)');
before('/api/hush-generate-budgeted', '/api/(.*)');
before('/api/hush-generate-strict-pr124', '/api/(.*)');
before('/api/khonapolit-quality', '/api/(.*)');
before('/api/dome-world/khonapolit', '/api/dome-world/(.*)');

for (const source of ['/api/hush-generate', '/api/hush-generate-budgeted', '/api/hush-generate-quality', '/api/gemini-readiness', '/api/khonapolit', '/api/khonapolit-quality']) {
  const header = (vercel.headers || []).find((entry) => entry.source === source);
  const value = header?.headers?.find((item) => String(item.key).toLowerCase() === 'cache-control')?.value || '';
  assert.match(value, /no-store/);
}

console.log('gemini-quality-routing-vercel.test.mjs passed');
