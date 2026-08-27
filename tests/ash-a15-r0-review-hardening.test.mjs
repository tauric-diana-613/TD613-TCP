import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const DIAGNOSTIC_PATH = 'a15-r0-step19.log';
function appendDiagnostic(label, value) {
  const rendered = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  fs.appendFileSync(DIAGNOSTIC_PATH, `${label}: ${rendered}\n`);
}

fs.writeFileSync(DIAGNOSTIC_PATH, 'A15-R0 step 19 P-first side-minor exact-checkout diagnostic\n');
process.on('uncaughtExceptionMonitor', (error, origin) => {
  try {
    appendDiagnostic('UNCAUGHT_ORIGIN', origin);
    appendDiagnostic('UNCAUGHT_ERROR', error?.stack ?? String(error));
  } catch {
    // Diagnostic preservation must never alter the original failure semantics.
  }
});

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

appendDiagnostic('CHECKOUT_HEAD', execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim());
appendDiagnostic('GITHUB_SHA', process.env.GITHUB_SHA ?? 'UNSET');
appendDiagnostic('GITHUB_EVENT_PATH', process.env.GITHUB_EVENT_PATH ?? 'UNSET');

for (const receipt of [
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
appendDiagnostic('ANCESTRY_SENTINEL', 'PASS');

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
appendDiagnostic('RECEIPT_CHAIN', 'PASS');

const changedA15R0 = execFileSync(
  'git',
  [
    'diff',
    '--name-only',
    `${PARENT_812_RECEIPT}..HEAD`,
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
appendDiagnostic('CHANGED_A15_R0_FROM_812_TO_CHECKOUT_HEAD', changedA15R0);

const allowedCurrentChamberPaths = new Set([
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_P_FIRST_SIDE_MINOR_REPLAY_IDENTIFIABILITY_STARTUP_V0_1.md',
  'app/dome-world/previews/a15-r0/p-first-side-minor-replay-identifiability.js',
  'tests/ash-a15-r0-aperture-pedagogue-p-first-side-minor-replay-identifiability.test.mjs',
  'tests/ash-a15-r0-review-hardening.test.mjs',
]);

const historicalMutations = changedA15R0.filter(path => !allowedCurrentChamberPaths.has(path));
appendDiagnostic('HISTORICAL_MUTATIONS', historicalMutations);
assert.deepEqual(
  historicalMutations,
  [],
  `post-#812 P-first side-minor chamber may not mutate inherited A15-R0 paths: ${historicalMutations.join(', ')}`,
);

assert.equal(
  changedA15R0.length,
  allowedCurrentChamberPaths.size,
  `P-first side-minor chamber must contain exactly ${allowedCurrentChamberPaths.size} live paths; observed ${changedA15R0.length}`,
);
for (const path of allowedCurrentChamberPaths) {
  assert.equal(changedA15R0.includes(path), true, `missing preregistered P-first side-minor path: ${path}`);
}
appendDiagnostic('HARDENING_SENTINEL', 'PASS');

async function diagnosticImport(label, path) {
  appendDiagnostic(`IMPORT_${label}`, 'START');
  await import(path);
  appendDiagnostic(`IMPORT_${label}`, 'PASS');
}

await diagnosticImport('review_hardening_sharded', './ash-a15-r0-review-hardening-sharded.test.mjs');
await diagnosticImport('holonomy_loom_research_bench', './ash-a15-r0-aperture-pedagogue-holonomy-loom-heterostratigraphic-research-bench.test.mjs');
await diagnosticImport('fadt_holonomy_descent', './ash-a15-r0-aperture-pedagogue-fadt-holonomy-loom-constitutional-descent-membrane.test.mjs');
await diagnosticImport('cech_nonidentifiability', './ash-a15-r0-aperture-pedagogue-cech-nerve-descent-nonidentifiability.test.mjs');
await diagnosticImport('dome_projection', './ash-a15-r0-aperture-pedagogue-dome-world-constitutional-projection-faithfulness.test.mjs');
await diagnosticImport('aia', './ash-a15-r0-aperture-pedagogue-aia-receiver-indexed-distinguishability.test.mjs');
await diagnosticImport('phasonic_tomography', './ash-a15-r0-aperture-pedagogue-phasonic-supermoire-dromological-tomography.test.mjs');
await diagnosticImport('s3_schedule_atlas', './ash-a15-r0-aperture-pedagogue-dromological-s3-schedule-atlas-first-stratum-gate.test.mjs');
await diagnosticImport('schedule_state_lag', './ash-a15-r0-aperture-pedagogue-dromological-schedule-state-identifiability-lag.test.mjs');
await diagnosticImport('baseline_replay_rescue', './ash-a15-r0-aperture-pedagogue-dromological-baseline-replay-rescue-aperture.test.mjs');
await diagnosticImport('replay_transversality', './ash-a15-r0-aperture-pedagogue-dromological-replay-transversality-unimodular-locus.test.mjs');
await diagnosticImport('replay_repair_quotient', './ash-a15-r0-aperture-pedagogue-dromological-replay-repair-quotient-canonical-section.test.mjs');
await diagnosticImport('p_first_side_minor', './ash-a15-r0-aperture-pedagogue-p-first-side-minor-replay-identifiability.test.mjs');
await diagnosticImport('wedding_identifiability', './ash-a15-r0-wedding-identifiability.test.mjs');

appendDiagnostic('A15_R0_STEP19', 'PASS');
console.log('Ash A15-R0 P-first side-minor replay identifiability hardening tests passed.');
