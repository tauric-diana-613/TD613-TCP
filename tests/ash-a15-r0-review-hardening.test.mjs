import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_792_RECEIPT = 'e15d6737f2d43e01835a643790b1c5f51a1dc711';
const FADT_752_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';
const BENCH_790_RECEIPT = 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb';

for (const receipt of [PARENT_792_RECEIPT, FADT_752_RECEIPT, BENCH_790_RECEIPT]) {
  execFileSync('git', ['cat-file', '-e', `${receipt}^{commit}`], { stdio: 'pipe' });
  execFileSync('git', ['merge-base', '--is-ancestor', receipt, 'HEAD'], { stdio: 'pipe' });
}

// #792 is the exact scientific/constitutional parent and already pins #752 FADT + #790 bench ancestry.
execFileSync('git', ['merge-base', '--is-ancestor', FADT_752_RECEIPT, BENCH_790_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', BENCH_790_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', FADT_752_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_792_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_CECH_NERVE_DESCENT_NONIDENTIFIABILITY_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/cech-nerve-descent-nonidentifiability.js',
  'tests/ash-a15-r0-aperture-pedagogue-cech-nerve-descent-nonidentifiability.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#792 Cech-nerve chamber may not mutate parent or historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `Cech-nerve descent nonidentifiability chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(changedA15R0.includes(path), true, `missing preregistered Cech-nerve chamber path: ${path}`);
}

// Re-run the inherited #792 membrane assay because the theorem consumes its exact support fixture,
// then run the new same-nerve/opposite-verdict hostile assay. No #788 promotion is imported.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-cech-nerve-descent-nonidentifiability.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 Cech-nerve descent nonidentifiability hardening tests passed.');
