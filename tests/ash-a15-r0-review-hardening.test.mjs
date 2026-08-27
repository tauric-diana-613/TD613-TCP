import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_775_RECEIPT = '39b8f6e8ba319154378d03c28a1bf42c02870de1';
execFileSync('git', ['cat-file', '-e', `${PARENT_775_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_775_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const STRATA_LANTERN_FIXTURE = 'tests/fixtures/pedagogue/heterostratigraphic-holonomy-tomography-strata-lantern-v01.json';

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
  || path === STRATA_LANTERN_FIXTURE
));

const allowedCurrentChamberPaths = new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_BRIDGE_SPEC_V0_1.md',
  'app/dome-world/previews/a15-r0/heterostratigraphic-holonomy-tomography-bridge.js',
  'tests/ash-a15-r0-aperture-pedagogue-heterostratigraphic-holonomy-tomography-bridge.test.mjs',
  STRATA_LANTERN_FIXTURE,
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#775 heterostratigraphic chamber may not mutate receipt-witnessed or sibling A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `heterostratigraphic chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(changedA15R0.includes(path), true, `missing preregistered heterostratigraphic chamber path: ${path}`);
}

// Exact #775 receipt ancestry carries parent mathematical authority.
// Existing Loom/Moss-Lantern apparatus is ancestor repository state, not sibling-PR borrowing.
// Execute current chamber plus standing constitutional sentinels only.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-heterostratigraphic-holonomy-tomography-bridge.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 heterostratigraphic holonomy tomography bridge hardening tests passed.');
