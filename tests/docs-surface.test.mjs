import assert from 'assert';
import fs from 'fs';
import { detectReleaseOverclaim } from '../app/engine/release-manifest.js';

const requiredDocs = [
  'README.md',
  'docs/INDEX.md',
  'docs/TD613_MISSION_THESIS.md',
  'docs/OPERATOR_GUIDE.md',
  'docs/PHASE_MAP.md',
  'docs/KNOWN_LIMITATIONS.md',
  'docs/RESPONSIBLE_USE.md',
  'docs/CALIBRATION_REVIEW_CHECKLIST.md',
  'docs/RELEASE_NOTES_PHASE_0_10.md',
  'docs/WHISTLEBLOWER_POLICY_POSTURE.md',
  'docs/ANTI_SELECTIVE_ADMISSIBILITY.md',
  'docs/RUPTURE_AND_TONI_CLAUSE.md',
  'docs/PHASE_10_RELEASE_STATUS.md',
  'docs/HUSH_OPERATOR_MANUAL.md',
  'docs/HUSH_PRODUCT_SPINE_STATUS.md',
  'docs/HUSH_KNOWN_FAILURE_MODES.md',
  'docs/HUSH_TEST_FLIGHT_PROTOCOL.md',
  'docs/HUSH_EPISTEMICIDE_AUDIT.md'
];

const docsIndexMustLink = [
  'TD613_MISSION_THESIS.md',
  'PHASE_MAP.md',
  'KNOWN_LIMITATIONS.md',
  'RESPONSIBLE_USE.md',
  'WHISTLEBLOWER_POLICY_POSTURE.md',
  'ANTI_SELECTIVE_ADMISSIBILITY.md',
  'RUPTURE_AND_TONI_CLAUSE.md',
  'HUSH_OPERATOR_MANUAL.md',
  'HUSH_PRODUCT_SPINE_STATUS.md',
  'HUSH_KNOWN_FAILURE_MODES.md',
  'HUSH_TEST_FLIGHT_PROTOCOL.md',
  'HUSH_PHASE_21_28_STATUS.md',
  'HUSH_EPISTEMICIDE_AUDIT.md'
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
  '# TD613 Gateway',
  '## What this is',
  '## Mission thesis',
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
  'TD613 is a custodial AI-access protocol',
  'TD613 Hush',
  'TD613 Aperture',
  'TD613 Safe Harbor',
  'TD613 Flight',
  'TD613 Trainer',
  'Hush is not Safe Harbor or Flight',
  'app/index.html',
  'Phase 29.1 repairs the public documentation surface'
]);
assert(readme.includes('TD613 is a custody-aware authorship routing stack'));
assert(readme.includes('Older TCP chambers such as Homebase / Personas, Readout, and Deck remain in the repository as legacy/lab surfaces'));

const index = read('docs/INDEX.md');
for (const name of docsIndexMustLink) assert(index.includes(name), `docs index missing ${name}`);
assert(index.includes('Hush is not the whole repository'));
assert(index.includes('custodial AI-access'));
assert(index.includes('HUSH_EPISTEMICIDE_AUDIT.md'));

const phaseMap = read('docs/PHASE_MAP.md');
includesAll(phaseMap, 'docs/PHASE_MAP.md', [
  'Phase 29',
  '29.1',
  'app/hush.html',
  'Product Spine',
  'Public Memory Repair'
]);

const mission = read('docs/TD613_MISSION_THESIS.md');
includesAll(mission, 'docs/TD613_MISSION_THESIS.md', [
  'TD613 is a custodial AI-access protocol',
  'Custody before ingestion',
  'AI-led retrieval',
  'Countersurveillance for authorship-recognition pressure',
  'Infosec containment for AI-mediated transformation',
  'Provenance-preserving credentials for custodial handoff',
  'Anti-selective-admissibility audit doctrine',
  'AI may assist, but it must encounter custody'
]);

const operator = read('docs/OPERATOR_GUIDE.md');
includesAll(operator, 'docs/OPERATOR_GUIDE.md', [
  'Local seal means bounded local convergence',
  'Stable pseudonym vs rotating mask',
  'Hostile Pipeline Compression',
  'Belonging Without Collapse',
  'Emergency rule'
]);

const hushOperator = read('docs/HUSH_OPERATOR_MANUAL.md');
includesAll(hushOperator, 'docs/HUSH_OPERATOR_MANUAL.md', [
  'What Hush Cannot Promise',
  'Product Route',
  'Test Flight Protocol',
  'Stop Conditions'
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

const audit = read('docs/HUSH_EPISTEMICIDE_AUDIT.md');
includesAll(audit, 'docs/HUSH_EPISTEMICIDE_AUDIT.md', [
  'Report-to-UI drift',
  'Mask registry drift',
  'Export receipt lag',
  'Phase 30 candidate leap'
]);

console.log('docs-surface tests passed');
