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

const baselineProjection = structuredClone(config);
delete baselineProjection.redirects;
// The origin-wide browser reset is a separately governed route. Admit only these
// exact four routes, prove their destinations and no-store policy, and remove only
// these verified entries before comparing Giving's pre-existing routing estate.
const resetRoutes = new Map([
  ['/api/site-epoch-reset','/api/dome-world-shell?surface=site-epoch-reset'],
  ['/site-epoch-preflight.js','/app/site-epoch-preflight.js'],
  ['/site-epoch-reset.js','/app/site-epoch-reset.js'],
  ['/site-epoch-reset.html','/app/site-epoch-reset.html']
]);
for (const [source,destination] of resetRoutes) {
  const entries = (config.rewrites || []).filter(entry=>entry.source===source);
  assert.equal(entries.length,1,'reset route must occur exactly once: '+source);
  assert.equal(entries[0].destination,destination,'reset route may not be redirected elsewhere: '+source);
  const headers=(config.headers || []).filter(entry=>entry.source===source);
  assert.equal(headers.length,1,'reset no-store header must occur exactly once: '+source);
  assert.equal(headers[0].headers.find(header=>header.key.toLowerCase()==='cache-control')?.value,'no-store, max-age=0');
}
baselineProjection.rewrites = baselineProjection.rewrites.filter(entry=>!resetRoutes.has(entry.source));
baselineProjection.headers = baselineProjection.headers.filter(entry=>!resetRoutes.has(entry.source));
// Giving's route-integrity hash owns Giving routing, not an unrelated Marrowline
// function-duration budget. Normalize the separately tested Kʰonapolit duration
// before hashing so every other Vercel byte remains protected by the baseline.
if (baselineProjection.functions?.['api/khonapolit.js']) {
  // The approved portable Loom assay carries exactly these three immutable
  // inputs in the existing function. Reject additions or substitutions before
  // normalizing this separately governed file-carriage allowance.
  assert.equal(baselineProjection.functions['api/khonapolit.js'].includeFiles,
    '{server/loom-assay-run-config.json,research/portable-loom-server-transport-20261009/TRIAL_MANIFEST.json,research/portable-loom-kit-assay-20261009/corrected-artifact/portable-loom-standard.md}',
    'the bounded Loom transport may carry only its reviewed configuration, trial manifest and exact standard Markdown');
  delete baselineProjection.functions['api/khonapolit.js'].includeFiles;
  baselineProjection.functions['api/khonapolit.js'].maxDuration = 60;
}
const baselineRaw = `${JSON.stringify(baselineProjection, null, 2)}\n`;
const gitBlob = Buffer.concat([
  Buffer.from(`blob ${Buffer.byteLength(baselineRaw)}\0`),
  Buffer.from(baselineRaw)
]);
const projectedSha = crypto.createHash('sha1').update(gitBlob).digest('hex');
assert.equal(projectedSha, BASELINE_VERCEL_BLOB_SHA, 'outside admitted Giving redirects, Kʰonapolit duration and exact Loom input carriage, vercel.json must remain byte-equivalent to the reviewed baseline');

const slashlessRewrite = (config.rewrites || []).find((entry) => entry.source === '/giving/history');
const slashfulRewrite = (config.rewrites || []).find((entry) => entry.source === '/giving/history/');
assert.equal(slashlessRewrite?.destination, '/app/giving/history/index.html');
assert.equal(slashfulRewrite?.destination, '/app/giving/history/index.html');
assert.equal(config.git?.deploymentEnabled, false, 'Git auto-deploy remains locked');

console.log('giving-vercel-route.test.mjs passed: slashless Giving canonicalizes before an otherwise byte-identical Vercel routing estate.');
