import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_773_RECEIPT = '50ada0bb0e7b25f9c1bde7e2feafeebbb5067a8f';
execFileSync('git', ['cat-file', '-e', `${PARENT_773_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_773_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_773_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FILTERED_H2_TWO_TORSION_HOLONOMY_BLINDNESS_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-filtered-h2-two-torsion-holonomy-blindness.js',
  'tests/ash-a15-r0-aperture-pedagogue-filtered-h2-two-torsion-holonomy-blindness.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#773 chamber may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Parent authority is carried by exact #773 receipt ancestry.
// Execute only current science plus standing sharded and wedding sentinels;
// do not recursively reenact receipt-witnessed ancestor assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-filtered-h2-two-torsion-holonomy-blindness.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 filtered H2 two-torsion and integer-holonomy blindness hardening tests passed.');
