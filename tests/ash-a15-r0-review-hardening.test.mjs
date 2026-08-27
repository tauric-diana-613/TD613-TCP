import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const STACKED_PARENT_788 = 'aad04e9cbb4532b4fc63dea16ef179f2e66200ed';
execFileSync('git', ['cat-file', '-e', `${STACKED_PARENT_788}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', STACKED_PARENT_788, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${STACKED_PARENT_788}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_HOLONOMY_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_ADAPTER_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-apparatus-adapter.js',
  'tests/ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-apparatus-adapter.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#788 apparatus adapter may not mutate frozen bridge or historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `apparatus adapter chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(changedA15R0.includes(path), true, `missing preregistered apparatus adapter path: ${path}`);
}

// #788 is an explicitly unevaluated stacked engineering parent.
// This chamber does not promote its theorem status; exact ancestry only preserves byte custody.
// Execute the current adapter assay plus standing constitutional sentinels.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-apparatus-adapter.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 Holonomy Loom heterostratigraphic apparatus adapter hardening tests passed.');
