import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';

const BASELINE_VERCEL_BLOB_SHA = 'f8e033a7416c8c64830c22a79187fa8cedd5422b';
const raw = fs.readFileSync('vercel.json', 'utf8');
const config = JSON.parse(raw);

const givingRedirects = (config.redirects || []).filter((entry) => entry.source.startsWith('/giving/history'));
assert.deepEqual(givingRedirects, [{
  source: '/giving/history',
  destination: '/giving/history/',
  permanent: true
}], 'the only admitted Giving redirect is the canonical trailing-slash redirect');

const baselineProjection = { ...config };
delete baselineProjection.redirects;
const baselineRaw = `${JSON.stringify(baselineProjection, null, 2)}\n`;
const gitBlob = Buffer.concat([
  Buffer.from(`blob ${Buffer.byteLength(baselineRaw)}\0`),
  Buffer.from(baselineRaw)
]);
const projectedSha = crypto.createHash('sha1').update(gitBlob).digest('hex');
assert.equal(projectedSha, BASELINE_VERCEL_BLOB_SHA, 'outside the admitted redirects, vercel.json must remain byte-equivalent to the reviewed baseline');

const slashlessRewrite = (config.rewrites || []).find((entry) => entry.source === '/giving/history');
const slashfulRewrite = (config.rewrites || []).find((entry) => entry.source === '/giving/history/');
assert.equal(slashlessRewrite?.destination, '/app/giving/history/index.html');
assert.equal(slashfulRewrite?.destination, '/app/giving/history/index.html');
assert.equal(config.git?.deploymentEnabled, false, 'Git auto-deploy remains locked');

console.log('giving-vercel-route.test.mjs passed: slashless Giving canonicalizes before an otherwise byte-identical Vercel routing estate.');
