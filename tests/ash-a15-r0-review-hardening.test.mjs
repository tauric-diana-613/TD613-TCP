import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_753_RECEIPT = 'c75459509bc9c948d2a7b7ff21d8de93328b76d7';
execFileSync('git', ['cat-file', '-e', `${PARENT_753_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_753_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_753_RECEIPT}..HEAD`,
    '--',
    'app/dome-world/docs/ash/experiments/a15-r0',
    'app/dome-world/previews/a15-r0',
    'tests',
  ],
  { encoding: 'utf8' },
).trim().split('\n').filter(Boolean).filter((path) => (
  path.startsWith('app/dome-world/docs/ash/experiments/a15-r0/')
  || path.startsWith('app/dome-world/previews/a15-r0/')
  || path.startsWith('tests/ash-a15-r0-')
));

const allowedCurrentChamberPaths = new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FINITE_CLAIM_AUTHORITY_DISCRETION_CONSERVATION_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FINITE_CLAIM_AUTHORITY_DISCRETION_CONSERVATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FINITE_CLAIM_AUTHORITY_DISCRETION_CONSERVATION_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-finite-claim-authority-discretion-conservation.js',
  'tests/ash-a15-r0-aperture-pedagogue-finite-claim-authority-discretion-conservation.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#753 chamber may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Parent authority is carried by exact #753 receipt ancestry.
// Execute only current science plus standing sharded and wedding sentinels;
// do not recursively reenact witnessed ancestor assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-finite-claim-authority-discretion-conservation.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 finite claim-authority discretion conservation hardening tests passed.');
