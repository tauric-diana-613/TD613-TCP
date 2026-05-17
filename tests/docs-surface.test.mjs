import assert from 'assert';
import fs from 'fs';
import { detectReleaseOverclaim } from '../app/engine/release-manifest.js';

const requiredDocs = [
  'README.md',
  'docs/INDEX.md',
  'docs/OPERATOR_GUIDE.md',
  'docs/PHASE_MAP.md',
  'docs/KNOWN_LIMITATIONS.md',
  'docs/RESPONSIBLE_USE.md',
  'docs/CALIBRATION_REVIEW_CHECKLIST.md',
  'docs/RELEASE_NOTES_PHASE_0_10.md',
  'docs/WHISTLEBLOWER_POLICY_POSTURE.md',
  'docs/ANTI_SELECTIVE_ADMISSIBILITY.md',
  'docs/RUPTURE_AND_TONI_CLAUSE.md',
  'docs/PHASE_10_RELEASE_STATUS.md'
];

function read(path) {
  assert(fs.existsSync(path), `missing ${path}`);
  return fs.readFileSync(path, 'utf8');
}

function includesAll(text, path, needles) {
  for (const needle of needles) assert(text.includes(needle), `${path} missing ${needle}`);
}

for (const path of requiredDocs) {
  const text = read(path);
  assert(text.trim().length > 80, `${path} too short`);
  const overclaim = detectReleaseOverclaim(text);
  assert.equal(overclaim.hasOverclaim, false, `${path} has overclaim: ${JSON.stringify(overclaim.matches)}`);
}

const readme = read('README.md');
includesAll(readme, 'README.md', [
  '# TCP — The Cadence Playground',
  '## What this is',
  '## What this is not',
  '## Core workflow',
  '## Phase map',
  '## Local-only posture',
  '## Privacy defaults',
  '## Claim Ladder',
  '## Recognition Field',
  '## Fixtures and calibration',
  '## Operator safety',
  '## Whistleblower policy posture',
  '## Running tests',
  '## Documentation index',
  'TD613 Hush',
  'Hush is not TD613 Flight',
  'Hush is not Safe Harbor'
]);
assert(readme.includes('The repository is named `TD613-TCP`, but the Phase 0–10 Toy-to-Tool instrument should be presented as TD613 Hush'));

const index = read('docs/INDEX.md');
for (const doc of requiredDocs.filter((path) => path !== 'README.md')) {
  const name = doc.replace('docs/', '');
  assert(index.includes(name), `docs index missing ${name}`);
}
assert(index.includes('Hush is not the whole repository'));

const operator = read('docs/OPERATOR_GUIDE.md');
includesAll(operator, 'docs/OPERATOR_GUIDE.md', [
  'Local seal means bounded local convergence',
  'Stable pseudonym vs rotating mask',
  'Hostile Pipeline Compression',
  'Belonging Without Collapse',
  'Emergency rule'
]);

const limitations = read('docs/KNOWN_LIMITATIONS.md');
includesAll(limitations, 'docs/KNOWN_LIMITATIONS.md', [
  'Platform uncertainty',
  'Human review requirement',
  'Calibration drift',
  'Recognition Field simulation models local context pressure'
]);

const responsible = read('docs/RESPONSIBLE_USE.md');
includesAll(responsible, 'docs/RESPONSIBLE_USE.md', [
  'Appropriate uses',
  'Prohibited or unsupported uses',
  'Private text handling',
  'Human review'
]);

const policy = read('docs/WHISTLEBLOWER_POLICY_POSTURE.md');
includesAll(policy, 'docs/WHISTLEBLOWER_POLICY_POSTURE.md', [
  'Protective authorship tools should not promise invisibility',
  'Authorship pressure as retaliation surface',
  'Evidence preservation',
  'Communication masking limits'
]);

const anti = read('docs/ANTI_SELECTIVE_ADMISSIBILITY.md');
includesAll(anti, 'docs/ANTI_SELECTIVE_ADMISSIBILITY.md', [
  'Selective admissibility occurs',
  'short sample insufficiency',
  'AI-smoothed flattening',
  'Persona overfit',
  'Claim Ladder caps'
]);

const rupture = read('docs/RUPTURE_AND_TONI_CLAUSE.md');
includesAll(rupture, 'docs/RUPTURE_AND_TONI_CLAUSE.md', [
  'If you have freedom, you must free someone else',
  'Rupture is the visible failure',
  'The tool honors rupture by keeping the break visible'
]);

const notes = read('docs/RELEASE_NOTES_PHASE_0_10.md');
for (let phase = 0; phase <= 10; phase += 1) assert(notes.includes(`Phase ${phase}`), `release notes missing Phase ${phase}`);
assert(notes.includes('What changed from toy to tool'));
assert(notes.includes('Current release posture'));
assert(notes.includes('Recommended next work after Phase 10'));

const status = read('docs/PHASE_10_RELEASE_STATUS.md');
assert(status.includes('release instrument should be presented as TD613 Hush or Hush'));
assert(status.includes('Release posture'));
assert(status.includes('Naming posture'));

console.log('docs-surface tests passed');
