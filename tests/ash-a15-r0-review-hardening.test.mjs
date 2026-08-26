import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_770_RECEIPT = '05fb09366ad2dcfd631013d786dd0f41083aae7b';
execFileSync('git', ['cat-file', '-e', `${PARENT_770_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_770_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_770_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FORMAL_BAR_CHAIN_2_GROUPOID_HOLONOMY_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FORMAL_BAR_CHAIN_2_GROUPOID_HOLONOMY_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_FORMAL_BAR_CHAIN_2_GROUPOID_HOLONOMY_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-formal-bar-chain-2-groupoid-holonomy.js',
  'tests/ash-a15-r0-aperture-pedagogue-formal-bar-chain-2-groupoid-holonomy.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#770 chamber may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Initial routed witness run 2305 / 33015421847 was green but deliberately
// withheld from naming promotion after post-witness audit found one missing
// explicit hostile: the formal C1 1-cell inverse/group law required by the
// word "2-groupoid". Repair 001 was preregistered before the hostile update,
// changed no theorem equation, and is now included in the current test file.
// This frozen head therefore requires a fresh exact-head witness.

// Parent authority is carried by exact #770 receipt ancestry.
// Execute only current science plus standing sharded and wedding sentinels;
// do not recursively reenact witnessed ancestor assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-formal-bar-chain-2-groupoid-holonomy.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 #772 repaired formal bar-chain 2-groupoid and 2-holonomy hardening tests passed.');
