import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const STACKED_PARENT_789 = 'c5c354413f721277760baefe946f602db8624b15';
execFileSync('git', ['cat-file', '-e', `${STACKED_PARENT_789}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', STACKED_PARENT_789, 'HEAD'], { stdio: 'pipe' });

const BENCH_FIXTURE = 'tests/fixtures/pedagogue/holonomy-loom-heterostratigraphic-research-bench-v01.json';

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${STACKED_PARENT_789}..HEAD`,
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
  || path === BENCH_FIXTURE
));

const allowedCurrentChamberPaths = new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_HOLONOMY_LOOM_HETEROSTRATIGRAPHIC_RESEARCH_BENCH_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-research-bench.js',
  'tests/ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-research-bench.test.mjs',
  BENCH_FIXTURE,
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#789 research bench may not mutate frozen adapter, bridge, or historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `Holonomy Loom research bench chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(changedA15R0.includes(path), true, `missing preregistered Holonomy Loom research bench path: ${path}`);
}

// #789 is an explicitly unevaluated stacked engineering parent over unevaluated #788.
// This chamber does not promote either scientific or engineering authority status.
// Execute the current research-bench assay plus standing constitutional sentinels only.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-research-bench.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 Holonomy Loom heterostratigraphic research bench hardening tests passed.');
