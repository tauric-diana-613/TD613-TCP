import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_739_RECEIPT = 'ffa5756d63f10fa6dc211e4cb07f38fbdc4bee0a';
execFileSync('git', ['cat-file', '-e', `${PARENT_739_RECEIPT}^{commit}`], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_739_RECEIPT, 'HEAD'], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_739_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_SPEC_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_RECEIPT_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_MINIMUM_FIRST_MOMENT_CUSTODY_BOUND_WITNESS_ROUTING_NOTE.md',
  'app/dome-world/previews/a15-r0/aperture-pedagogue-minimum-first-moment-custody-bound.js',
  'tests/ash-a15-r0-aperture-pedagogue-minimum-first-moment-custody-bound.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter((path) => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `#740 may not mutate receipt-witnessed historical A15-R0 paths: ${historicalMutations.join(', ')}`,
);

// Parent release-boundary obligations are carried by exact #739 receipt ancestry.
// This chamber executes only current science plus the standing sharded and wedding sentinels;
// it does not recursively reenact already-witnessed parent assays.
await import('./ash-a15-r0-review-hardening-sharded.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-minimum-first-moment-custody-bound.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 #740 receipt-backed current-chamber hardening tests passed.');
