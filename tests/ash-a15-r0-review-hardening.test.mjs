import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PARENT_843_RECEIPT = 'a7726078034328d9cad811ff9d8f73f52fd26729';
const PARENT_841_RECEIPT = 'e0cc001a7b25b2e03deb08a9972d10ab7e47f4f5';
const PARENT_839_RECEIPT = '4c524665fd5a3d59b0ebcd8ec44144466b15ad31';
const PARENT_837_RECEIPT = '17475d670e339d7b562194a4429fa979584da65a';
const PARENT_834_RECEIPT = 'a0d88e26860f4d9c25feed21ab2d080f70b45f20';
const PARENT_830_RECEIPT = '3877139365041453bab85741eb09ba2f5839eed6';
const PARENT_828_RECEIPT = '9a76b7594ba8d9093d8c6ef9428c669dbb2581f1';
const PARENT_826_RECEIPT = 'de878502536c2a61a354ec898d07d5802bfcca5f';
const PARENT_824_RECEIPT = '68d700999c69c4bbb663904a8fafb47683e4032e';
const PARENT_822_RECEIPT = '012024d9a0d7bdb21721ede40dfe9f029de09717';
const PARENT_820_RECEIPT = '7693b0823968d5e20dca8fdc9145452934377fc0';
const PARENT_818_RECEIPT = '4cb6cf23c8fbb0b596e75f0827e5a8c8436d08b5';
const PARENT_812_RECEIPT = '2cc95613969951afc96c638c316ae70007560f16';
const PARENT_810_RECEIPT = '79a6533843c4133345bec3c1e83477c621230b09';
const PARENT_807_RECEIPT = '5fcaf191b7dbed9529687ed3c072107a37a54814';
const PARENT_804_RECEIPT = 'a51afae88292878de2c02ca0a086ad1e88f73cfb';
const PARENT_802_RECEIPT = 'f9d5ee89b8555175d0797893fdd8c91b5395ea8b';
const PARENT_800_RECEIPT = '40dfba93d2577bceba0f66022ac5f42934cdbd06';
const PARENT_798_RECEIPT = '9c92b4269fe2cd277799d8e885caf7765cbdfecb';
const PARENT_796_RECEIPT = '7639d5b15edc57aa3d76b8669aeefed6d86c12d6';
const PARENT_794_RECEIPT = '528f9b2f96bf3bc4c18242b0f0d910ca5323fdea';
const PARENT_792_RECEIPT = 'e15d6737f2d43e01835a643790b1c5f51a1dc711';
const BENCH_790_RECEIPT = 'a1e59ec70fb9217e0e581a8c0eeeeb0f9b9d8cdb';
const FADT_752_RECEIPT = '11eec2d52c7e1aa722e8664c0df4cd1a61d704f1';

for (const receipt of [
  PARENT_843_RECEIPT,
  PARENT_841_RECEIPT,
  PARENT_839_RECEIPT,
  PARENT_837_RECEIPT,
  PARENT_834_RECEIPT,
  PARENT_830_RECEIPT,
  PARENT_828_RECEIPT,
  PARENT_826_RECEIPT,
  PARENT_824_RECEIPT,
  PARENT_822_RECEIPT,
  PARENT_820_RECEIPT,
  PARENT_818_RECEIPT,
  PARENT_812_RECEIPT,
  PARENT_810_RECEIPT,
  PARENT_807_RECEIPT,
  PARENT_804_RECEIPT,
  PARENT_802_RECEIPT,
  PARENT_800_RECEIPT,
  PARENT_798_RECEIPT,
  PARENT_796_RECEIPT,
  PARENT_794_RECEIPT,
  PARENT_792_RECEIPT,
  BENCH_790_RECEIPT,
  FADT_752_RECEIPT,
]) {
  execFileSync('git', ['cat-file', '-e', `${receipt}^{commit}`], { stdio: 'pipe' });
  execFileSync('git', ['merge-base', '--is-ancestor', receipt, 'HEAD'], { stdio: 'pipe' });
}

execFileSync('git', ['merge-base', '--is-ancestor', PARENT_841_RECEIPT, PARENT_843_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_839_RECEIPT, PARENT_841_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_837_RECEIPT, PARENT_839_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_834_RECEIPT, PARENT_837_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_830_RECEIPT, PARENT_834_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_828_RECEIPT, PARENT_830_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_826_RECEIPT, PARENT_828_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_824_RECEIPT, PARENT_826_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_822_RECEIPT, PARENT_824_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_820_RECEIPT, PARENT_822_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_818_RECEIPT, PARENT_820_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_812_RECEIPT, PARENT_818_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_810_RECEIPT, PARENT_812_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_807_RECEIPT, PARENT_810_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_804_RECEIPT, PARENT_807_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_802_RECEIPT, PARENT_804_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_800_RECEIPT, PARENT_802_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_798_RECEIPT, PARENT_800_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_796_RECEIPT, PARENT_798_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_794_RECEIPT, PARENT_796_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', PARENT_792_RECEIPT, PARENT_794_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', BENCH_790_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });
execFileSync('git', ['merge-base', '--is-ancestor', FADT_752_RECEIPT, PARENT_792_RECEIPT], { stdio: 'pipe' });

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_843_RECEIPT}..HEAD`,
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
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_DROMOLOGICAL_HOLONOMY_SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_STARTUP_V0_1.md',
  'app/dome-world/docs/ash/experiments/a15-r0/SAFE_AUTHORITY_CLOSURE_CORRESPONDENCE_STARTUP_HOOK_V0_1.json',
  'app/dome-world/previews/a15-r0/dromological-holonomy-safe-authority-closure-correspondence.js',
  'tests/ash-a15-r0-aperture-pedagogue-dromological-holonomy-safe-authority-closure-correspondence.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
assert.deepEqual(
  historicalMutations,
  [],
  `post-#843 safe-authority closure correspondence chamber may not mutate inherited A15-R0 paths: ${historicalMutations.join(', ')}`,
);
assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `safe-authority closure correspondence chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(changedA15R0.includes(path), true, `missing preregistered safe-authority closure path: ${path}`);
}

execFileSync(process.execPath, ['tests/ash-a15-r0-review-hardening-sharded.test.mjs'], { stdio: 'inherit' });
await import('./ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-research-bench.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-cech-nerve-descent-nonidentifiability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dome-world-constitutional-projection-faithfulness.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-aia-receiver-indexed-distinguishability.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-phasonic-supermoire-dromological-tomography.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-s3-schedule-atlas-first-stratum-gate.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-schedule-state-identifiability-lag.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-baseline-replay-rescue-aperture.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-replay-transversality-unimodular-locus.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-replay-repair-quotient-canonical-section.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-coarsened-robust-replay-inverse-design.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-minimal-coordinate-repair-routing-aperture.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-raw-aperture-cut-anisotropic-redundancy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-parity-completion-erasure-robust-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-single-corruption-correcting-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-corruption-plus-erasure-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-double-corruption-aia.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-double-corruption-isometry-orbit.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-orbit-transport-tomographic-conjugacy.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-orbit-transport-witness-fiber-descent.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-stabilizer-claim-authority-filtration.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-repair-label-partition-safe-erasure-lattice.test.mjs');
await import('./ash-a15-r0-aperture-pedagogue-dromological-holonomy-safe-authority-closure-correspondence.test.mjs');
await import('./ash-a15-r0-wedding-identifiability.test.mjs');

console.log('Ash A15-R0 dromological holonomy safe-authority closure correspondence hardening tests passed.');
