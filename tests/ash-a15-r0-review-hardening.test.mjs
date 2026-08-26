import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_775_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
execFileSync('git', ['cat-file', '-e', `${PARENT_775_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_775_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_775_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_NONSPLIT_BIEBERBACH_AFFINE_FLAT_3_MANIFOLD_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-nonsplit-bieberbach-affine-flat-3-manifold.js',
  'tests/ash-a15-r0-aperture-pedagogue-nonsplit-bieberbach-affine-flat-3-manifold.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const unauthorizedMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  unauthorizedMutations,
  [],
  `post-#775 chamber may not mutate receipt-witnessed or unrelated A15-R0 paths: ${unauthorizedMutations.join(', ')}`,
);

// Exact #775 receipt ancestry carries the parent theorem authority.
// Execute the current theorem assay plus standing sentinels only.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-nonsplit-bieberbach-affine-flat-3-manifold.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 nonsplit Bieberbach affine flat 3-manifold hardening tests passed.');
