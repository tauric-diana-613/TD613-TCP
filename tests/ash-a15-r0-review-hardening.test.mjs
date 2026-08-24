import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_734_RECEIPT = '6bc000024f02e5780910ee24694561d5dc542003';
execFileSync('git', ['cat-file', '-e', `${PARENT_734_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_734_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_734_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_POST_WITNESS_REPAIR_PREREGISTRATION_001.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_QUOTIENT_OBSTRUCTION_BAR_CYCLE_COHOMOLOGY_POST_WITNESS_REPAIR_PREREGISTRATION_002.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.js',
  'tests/ash-a15-r0-aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `#735 may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Parent release-boundary obligations are carried by the exact #734 receipt ancestry.
// This chamber executes only current science plus the standing sharded and wedding sentinels;
// it does not recursively reenact already-witnessed parent assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-quotient-obstruction-bar-cycle-cohomology.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 #735 receipt-backed current-chamber hardening tests passed.');