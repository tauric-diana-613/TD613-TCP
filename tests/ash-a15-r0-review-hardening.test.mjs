import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const FADT_752_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';
const BENCH_790_RECEIPT = 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb';

for (const receipt of [FADT_752_RECEIPT, BENCH_790_RECEIPT]) {
  execFileSync('git', ['cat-file', '-e', `${receipt}^{commit}`], { stdio: 'pipe' });
  execFileSync('git', ['merge-base', '--is-ancestor', receipt, 'HEAD'], { stdio: 'pipe' });
}

// FADT must be genuine ancestry of the witnessed research bench, not a sibling citation.
execFileSync('git', ['merge-base', '--is-ancestor', FADT_752_RECEIPT, BENCH_790_RECEIPT], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${BENCH_790_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FADT_HOLONOMY_LOOM_CONSTITUTIONAL_DESCENT_MEMBRANE_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/fadt-holonomy-loom-constitutional-descent-membrane.js',
  'tests/ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#790 FADT constitutional membrane may not mutate witnessed bench or historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `FADT Holonomy Loom constitutional membrane must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(changedA15R0.includes(path), true, `missing preregistered FADT Loom constitutional path: ${path}`);
}

// #752 and #790 are already witnessed exact receipts. This chamber applies the former at the latter's
// bounded claim-support boundary; it does not promote #788 scientific authority or any live runtime.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 FADT Holonomy Loom constitutional descent membrane hardening tests passed.');
