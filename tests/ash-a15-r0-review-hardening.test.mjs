import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_794_RECEIPT = '528f9b2f96bf3bc4c18242b0f0d910ca5323fdea';
const PARENT_792_RECEIPT = 'e15d6737f2d43e01835a643790b1c5f51a1dc711';
const BENCH_790_RECEIPT = 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb';
const FADT_752_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';

for (const receipt of [PARENT_794_RECEIPT, PARENT_792_RECEIPT, BENCH_790_RECEIPT, FADT_752_RECEIPT]) {
  execFileSync('git', ['cat-file', '-e', `${receipt}^{commit}`], { stdio: 'pipe' });
  execFileSync('git', ['merge-base', '--is-ancestor', receipt, 'HEAD'], { stdio: 'pipe' });
}

// Exact witnessed ancestry membrane: #794 -> #792 -> #790, with witnessed FADT #752 already admitted.
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_792_RECEIPT, PARENT_794_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', BENCH_790_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', FADT_752_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_794_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_DOME_WORLD_CONSTITUTIONAL_PROJECTION_FAITHFULNESS_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/dome-world-constitutional-projection-faithfulness.js',
  'tests/ash-a15-r0-aperture-pedagogue-dome-world-constitutional-projection-faithfulness.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#794 Dome-World constitutional projection chamber may not mutate inherited A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `Dome-World constitutional projection chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(
    changedA15R0.includes(path),
    true,
    `missing preregistered Dome-World constitutional projection path: ${path}`,
  );
}

// Parent receipts carry authority; this chamber attacks the actual inherited Dome-World/Ash compiler and
// proves a fail-closed source-custody exactification without rewriting the inherited adapter or bench.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-research-bench.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-cech-nerve-descent-nonidentifiability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dome-world-constitutional-projection-faithfulness.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 Dome-World constitutional projection faithfulness hardening tests passed.');
