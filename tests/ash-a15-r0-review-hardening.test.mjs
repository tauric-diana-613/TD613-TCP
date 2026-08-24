import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_750_RECEIPT = 'de1cc600b330e90fa237c8984379ee08a787b0f7';
execFileSync('git', ['cat-file', '-e', `${PARENT_750_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_750_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_750_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_ROUTE_ERASURE_ADMISSIBILITY_DESCENT_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_ROUTE_ERASURE_ADMISSIBILITY_DESCENT_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_ROUTE_ERASURE_ADMISSIBILITY_DESCENT_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-route-erasure-admissibility-descent.js',
  'tests/ash-a15-r0-aperture-pedagogue-route-erasure-admissibility-descent.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `#751 may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Parent release-boundary obligations are carried by exact #750 receipt ancestry.
// Execute only current science plus standing sharded and wedding sentinels;
// do not recursively reenact witnessed parent assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-route-erasure-admissibility-descent.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 #751 route-erasure admissibility descent hardening tests passed.');
