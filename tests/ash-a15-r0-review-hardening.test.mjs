import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_765_RECEIPT = '4c8018df2aa1857456cde76e65a9ca694715926e';
execFileSync('git', ['cat-file', '-e', `${PARENT_765_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_765_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_765_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_OPEN_BAR_2_CELL_GAUGE_COVARIANCE_SEAM_CANCELLATION_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_OPEN_BAR_2_CELL_GAUGE_COVARIANCE_SEAM_CANCELLATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_OPEN_BAR_2_CELL_GAUGE_COVARIANCE_SEAM_CANCELLATION_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.js',
  'tests/ash-a15-r0-aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#765 chamber may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Parent authority is carried by exact #765 receipt ancestry.
// Execute only current science plus standing sharded and wedding sentinels;
// do not recursively reenact witnessed ancestor assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-open-bar-2-cell-gauge-covariance-seam-cancellation.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 #768 open bar-2-cell covariance and seam-cancellation hardening tests passed.');
