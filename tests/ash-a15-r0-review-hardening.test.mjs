import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_746_RECEIPT = 'f15ab5e46c7ee7de43a44386c8fea36e272dba9b';
execFileSync('git', ['cat-file', '-e', `${PARENT_746_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_746_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_746_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FIXED_C1_JOINT_ROUTE_SEAM_FIBER_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FIXED_C1_JOINT_ROUTE_SEAM_FIBER_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FIXED_C1_JOINT_ROUTE_SEAM_FIBER_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-fixed-c1-joint-route-seam-fiber.js',
  'tests/ash-a15-r0-aperture-pedagogue-fixed-c1-joint-route-seam-fiber.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `current joint route-seam chamber may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Parent release-boundary obligations are carried by exact #746 receipt ancestry.
// Execute only the current science plus standing sharded and wedding sentinels;
// do not recursively reenact already-witnessed parent assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-fixed-c1-joint-route-seam-fiber.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 post-#746 joint route-seam current-chamber hardening tests passed.');