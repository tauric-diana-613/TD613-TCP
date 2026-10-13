import assert from 'assert';
import {
  RELEASE_MANIFEST_VERSION,
  RELEASE_PRODUCT_NAME,
  RELEASE_SHORT_NAME,
  RELEASE_PHASES,
  RELEASE_CAPABILITIES,
  RELEASE_BOUNDARIES,
  buildReleaseManifest,
  summarizeReleaseManifest,
  validateReleaseManifest,
  detectReleaseOverclaim
} from '../app/engine/release-manifest.js';

assert.equal(RELEASE_MANIFEST_VERSION, 'phase-10');
assert.equal(RELEASE_PRODUCT_NAME, 'TD613 Hush');
assert.equal(RELEASE_SHORT_NAME, 'Hush');
assert.equal(RELEASE_PHASES.length, 11);
for (let phase = 0; phase <= 10; phase += 1) assert(RELEASE_PHASES.some((entry) => entry.phase === phase), `missing phase ${phase}`);
assert(RELEASE_CAPABILITIES.includes('local stylometry review'));
assert(RELEASE_CAPABILITIES.includes('local context-pressure simulation'));
assert(RELEASE_BOUNDARIES.includes('No private text export by default'));
assert(RELEASE_BOUNDARIES.includes('Hush is a toy inside The Cadence Playground, not the whole repository'));
assert(RELEASE_BOUNDARIES.includes('TD613 Flight and Safe Harbor remain adjacent systems, not Hush itself'));

const manifest = buildReleaseManifest();
assert.equal(manifest.version, 'phase-10');
assert.equal(manifest.productName, 'TD613 Hush');
assert.equal(manifest.repositoryContext, 'TD613-TCP repository');
assert.equal(manifest.localOnly, true);
assert.equal(manifest.releaseStatus, 'reviewable');
assert(manifest.requiredScripts.includes('test:release'));
assert(manifest.requiredScripts.includes('test:stylometry'));
assert(manifest.docs.includes('docs/OPERATOR_GUIDE.md'));
assert(manifest.docs.includes('docs/PHASE_10_RELEASE_STATUS.md'));
assert(manifest.tests.includes('tests/release-manifest.test.mjs'));
assert(manifest.limitations.some((line) => line.includes('Human review')));

const validation = validateReleaseManifest(manifest);
assert.equal(validation.valid, true, validation.failures.join(', '));
assert.equal(validation.status, 'pass');

const summary = summarizeReleaseManifest(manifest);
assert.equal(summary.productName, 'TD613 Hush');
assert.equal(summary.phaseCount, 11);
assert.equal(summary.localOnly, true);
assert.equal(summary.releaseStatus, 'reviewable');

for (const phrase of [
  'anonymous',
  'untraceable',
  'platform-proof',
  'guaranteed safe',
  'same author',
  'not same author',
  'identity proven',
  'identity disproven',
  'cannot be linked',
  'will evade detection',
  'safe to publish',
  'bypass classifier',
  'defeat scraper',
  'fool platform'
]) {
  const detection = detectReleaseOverclaim(`This output is ${phrase}.`);
  assert.equal(detection.hasOverclaim, true, `failed to catch ${phrase}`);
  assert.equal(detection.severity, 'block');
}

for (const safeLine of [
  'TD613 Hush does not claim anonymity.',
  'TD613 Hush does not prove identity.',
  'No platform-proof claims are permitted.',
  'The overclaim detector catches same author language in tests.',
  'Safe to publish is forbidden release language.',
  'Hush must not claim untraceability.'
]) {
  const detection = detectReleaseOverclaim(safeLine);
  assert.equal(detection.hasOverclaim, false, `safe context flagged: ${safeLine}`);
}

const broken = validateReleaseManifest({ ...manifest, productName: 'TD613-TCP' });
assert.equal(broken.valid, false);
assert(broken.failures.includes('product-name-mismatch'));

console.log('release-manifest tests passed');
