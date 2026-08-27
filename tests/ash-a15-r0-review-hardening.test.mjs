import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_796_RECEIPT = '7639d5b15edc57aa3d76b8669aeefed6d86c12d6';
const PARENT_794_RECEIPT = '528f9b2f96bf3bc4c18242b0f0d910ca5323fdea';
const PARENT_792_RECEIPT = 'e15d6737f2d43e01835a643790b1c5f51a1dc711';
const BENCH_790_RECEIPT = 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb';
const FADT_752_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';

for (const receipt of [
  PARENT_796_RECEIPT,
  PARENT_794_RECEIPT,
  PARENT_792_RECEIPT,
  BENCH_790_RECEIPT,
  FADT_752_RECEIPT,
]) {
  execFileSync('git', ['cat-file', '-e', `${receipt}^{commit}`], { stdio: 'pipe' });
  execFileSync('git', ['merge-base', '--is-ancestor', receipt, 'HEAD'], { stdio: 'pipe' });
}

execFileSync('git', ['merge-base', '--is-ancestor', PARENT_794_RECEIPT, PARENT_796_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_792_RECEIPT, PARENT_794_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', BENCH_790_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', FADT_752_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_796_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_AIA_RECEIVER_INDEXED_DISTINGUISHABILITY_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js',
  'tests/ash-a15-r0-aperture-pedagogue-aia-receiver-indexed-distinguishability.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#796 AIA receiver-anisotropy chamber may not mutate inherited A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `AIA receiver-indexed distinguishability chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(
    changedA15R0.includes(path),
    true,
    `missing preregistered AIA receiver-anisotropy path: ${path}`,
  );
}

await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-research-bench.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-cech-nerve-descent-nonidentifiability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dome-world-constitutional-projection-faithfulness.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-aia-receiver-indexed-distinguishability.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 AIA receiver-indexed distinguishability hardening tests passed.');
