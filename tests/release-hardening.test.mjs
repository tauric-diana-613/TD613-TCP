import assert from 'assert';
import fs from 'fs';
import { buildReleaseManifest, detectReleaseOverclaim, summarizeReleaseManifest, validateReleaseManifest } from '../app/engine/release-manifest.js';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
assert(pkg.scripts['test:release'], 'package.json missing test:release');
assert(pkg.scripts['test:release'].includes('release-manifest.test.mjs'));
assert(pkg.scripts['test:release'].includes('docs-surface.test.mjs'));
assert(pkg.scripts['test:release'].includes('release-hardening.test.mjs'));
assert(pkg.scripts.test.includes('test:release') || pkg.scripts['test:stylometry'].includes('test:release'), 'release tests must be part of maintained suite');

const manifest = buildReleaseManifest();
const validation = validateReleaseManifest(manifest);
assert.equal(validation.valid, true, validation.failures.join(', '));
const summary = summarizeReleaseManifest(manifest);
assert.equal(summary.releaseStatus, 'reviewable');
assert.equal(summary.productName, 'TD613 Hush');
assert.equal(summary.localOnly, true);

for (const boundary of [
  'No identity verdicts',
  'No anonymity claims',
  'No untraceability claims',
  'No platform-proof claims',
  'No platform outcome prediction',
  'No hidden classifier access claims',
  'No publication safety guarantee',
  'No private text export by default',
  'Hush is a toy inside The Cadence Playground, not the whole repository',
  'TD613 Flight and Safe Harbor remain adjacent systems, not Hush itself'
]) assert(manifest.boundaries.includes(boundary), `missing boundary ${boundary}`);

for (const capability of [
  'local stylometry review',
  'authorship-recognition pressure measurement',
  'claim ceiling evaluation',
  'calibration fixture regression',
  'local context-pressure simulation'
]) assert(manifest.capabilities.includes(capability), `missing capability ${capability}`);

const docs = manifest.docs.map((path) => [path, fs.readFileSync(path, 'utf8')]);
for (const [path, text] of docs) {
  assert(text.includes('Hush') || path === 'README.md', `${path} should name or route to Hush`);
  const detection = detectReleaseOverclaim(text);
  assert.equal(detection.hasOverclaim, false, `${path} contains release overclaim: ${JSON.stringify(detection.matches)}`);
}

const combined = docs.map(([path, text]) => `\n--- ${path} ---\n${text}`).join('\n');
assert(combined.includes('privacy by default') || combined.includes('Privacy defaults'));
assert(combined.includes('Human review'));
assert(combined.includes('Calibration drift'));
assert(combined.includes('Recognition Field simulation models local context pressure'));
assert(combined.includes('Claim Ladder'));
assert(combined.includes('Whistleblower Policy Posture') || combined.includes('Whistleblower policy posture'));
assert(combined.includes('Selective admissibility occurs'));
assert(combined.includes('Toni Morrison'));
assert(combined.includes('TD613 Flight'));
assert(combined.includes('Safe Harbor'));

assert.equal(detectReleaseOverclaim('This is a platform-proof system.').hasOverclaim, true);
assert.equal(detectReleaseOverclaim('No platform-proof claims are supported.').hasOverclaim, false);
assert.equal(detectReleaseOverclaim('The tool will evade detection.').hasOverclaim, true);
assert.equal(detectReleaseOverclaim('The tool does not claim it will evade detection.').hasOverclaim, false);

console.log('release-hardening tests passed');
