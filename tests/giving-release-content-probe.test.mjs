import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  GIVING_RELEASE_CONTENT_SCHEMA,
  GIVING_PRACTICE_CRITICAL_ASSETS,
  extractBootstrapReference,
  extractAssetEpoch,
  remotePathFor
} from '../scripts/giving-release-content-probe.mjs';

assert.equal(GIVING_RELEASE_CONTENT_SCHEMA, 'td613.giving.production-content-observation/v0.1-practice-critical');
for (const required of [
  'app/giving/history/index.html',
  'app/giving/history/giving-bootstrap.js',
  'app/giving/history/giving-ux-resilience-shell.js',
  'app/giving/history/giving-ux-resilience.css',
  'app/giving/history/giving-contact-queue-v2.js',
  'app/giving/history/giving-app.js',
  'app/giving/history/giving-search-controls.js',
  'app/giving/history/giving-dossier-help.js'
]) {
  assert.ok(GIVING_PRACTICE_CRITICAL_ASSETS.includes(required), `practice-critical closure omitted ${required}`);
  assert.equal(fs.existsSync(required), true, `practice-critical source missing ${required}`);
}

const index = fs.readFileSync('app/giving/history/index.html', 'utf8');
const bootstrap = fs.readFileSync('app/giving/history/giving-bootstrap.js', 'utf8');
const bootstrapReference = extractBootstrapReference(index);
const assetEpoch = extractAssetEpoch(bootstrap);
assert.match(bootstrapReference, /^\.\/giving-bootstrap\.js\?v=[A-Za-z0-9._-]+$/);
assert.match(assetEpoch, /^[A-Za-z0-9._-]+$/);
assert.equal(remotePathFor('app/giving/history/index.html', { bootstrapReference, assetEpoch }), '/giving/history/');
assert.equal(
  remotePathFor('app/giving/history/giving-bootstrap.js', { bootstrapReference, assetEpoch }),
  `/giving/history/${bootstrapReference.slice(2)}`
);
assert.equal(
  remotePathFor('app/giving/history/giving-ux-resilience-shell.js', { bootstrapReference, assetEpoch }),
  `/giving/history/giving-ux-resilience-shell.js?v=${encodeURIComponent(assetEpoch)}`
);

const probeSource = fs.readFileSync('scripts/giving-release-content-probe.mjs', 'utf8');
assert.match(probeSource, /td613_source_packet/);
assert.match(probeSource, /td613_giving_probe_attempt/);
assert.match(probeSource, /practice_critical_surface_exact_source:\s*true/);
assert.match(probeSource, /does not match source/);
assert.match(probeSource, /counts_as_human_evidence:\s*false/);

console.log('giving-release-content-probe.test.mjs passed');
