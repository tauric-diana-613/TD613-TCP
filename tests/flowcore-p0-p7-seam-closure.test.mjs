import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT = process.cwd();
const read = relative => fs.readFileSync(path.join(ROOT, relative), 'utf8');

const receiptPaths = [
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P0_IMPLEMENTATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P1_IMPLEMENTATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P2_IMPLEMENTATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P3_IMPLEMENTATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P4_IMPLEMENTATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P5_IMPLEMENTATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P6_IMPLEMENTATION_RECEIPT_V0_1.md',
  'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P7_IMPLEMENTATION_RECEIPT_V0_1.md'
];

const expectedCommits = Object.freeze({
  P0_P1: 'f56914d788fbb86ef5b9741d0065bf00d74aed84',
  P2: 'a3aebfad8c3232447cff0749aa7bcbbe040a3337',
  P3: '9736206696f254a4b51148694d507a927b00b790',
  P4: '91158eb4af827599273b8ca17a11bb9f89356b32',
  P5: '4c995bd372702d748ed659ff7b6c5421ab5ba27e',
  P6: '326efa021ac9f94c32f96d642c7011d5f4d2fc58',
  P7: 'fbbf1426234a5923489b9e3f166e6138240a6118'
});

test('P0-P7 receipts no longer carry branch-era CI or source holds', () => {
  for (const receiptPath of receiptPaths) {
    const source = read(receiptPath);
    assert.doesNotMatch(source, /REPOSITORY CI PENDING/);
    assert.doesNotMatch(source, /source packet on current main = false/);
    assert.doesNotMatch(source, /AUTHORIZED_AWAITING_EXACT_MAIN_SOURCE/);
    assert.match(source, /human closure required: true|HUMAN CLOSURE OPEN|HUMAN-CLOSURE OPEN/);
    assert.match(source, /closure: OPEN/);
  }
});

test('baseline evidence manifest preserves exact phase ancestry and bounded authority', () => {
  const manifest = JSON.parse(read('app/dome-world/fixtures/pedagogue/baselines/flowcore-p0-p7-baseline-evidence-v01.json'));
  assert.equal(manifest.schema, 'td613.flowcore.p0-p7-baseline-evidence/v0.1');
  assert.equal(manifest.namespace, 'U+10D613');
  assert.equal(manifest.unicode_normalization, 'NONE');
  assert.deepEqual(manifest.phase_main_commits, expectedCommits);
  assert.equal(manifest.baseline_media.mobile.viewport.width, 390);
  assert.equal(manifest.baseline_media.mobile.horizontal_overflow_allowed, false);
  assert.equal(manifest.baseline_media.reduced_motion.prefers_reduced_motion, true);
  assert.equal(manifest.baseline_media.reduced_motion.autoplay, false);
  assert.equal(manifest.ash_dom_fixture.chronology_root_index, 0);
  assert.equal(manifest.ash_dom_fixture.bytes_outside_case_map, true);
  assert.equal(manifest.authority.flowcore_commands_station, false);
  assert.equal(manifest.authority.automatic_ash_action, false);
  assert.equal(manifest.authority.station_authority_transferred, false);
  assert.equal(manifest.authority.human_closure_required, true);
  assert.equal(manifest.closure.status, 'OPEN');
});

test('desktop, mobile, and reduced-motion baselines are literal static media', () => {
  const media = [
    ['app/dome-world/fixtures/pedagogue/baselines/flowcore-desktop-1120.svg', 1120, 760],
    ['app/dome-world/fixtures/pedagogue/baselines/flowcore-mobile-390.svg', 390, 844],
    ['app/dome-world/fixtures/pedagogue/baselines/flowcore-reduced-motion-390.svg', 390, 844]
  ];
  for (const [relative, width, height] of media) {
    const source = read(relative);
    assert.match(source, new RegExp(`width="${width}"`));
    assert.match(source, new RegExp(`height="${height}"`));
    assert.match(source, /U\+10D613/);
    assert.doesNotMatch(source, /<script|<animate|requestAnimationFrame/i);
  }
  const reduced = read(media[2][0]);
  assert.match(reduced, /autoplay false/);
  assert.match(reduced, /flashing false/);
  assert.match(reduced, /oscillation false/);
  assert.match(reduced, /Rest · Replay · Return · Exit/);
});

test('Ash Custody Root DOM fixture answers the five consequence-first questions', () => {
  const source = read('app/dome-world/fixtures/pedagogue/baselines/ash-custody-root-dom-fixture.html');
  for (const heading of [
    'What stayed local',
    'What Ash created',
    'What changed in the case',
    'What did not become authorized',
    'What may happen next'
  ]) assert.match(source, new RegExp(heading));
  assert.match(source, /data-lifecycle-state="CASE_BOUND"/);
  assert.match(source, /data-bytes-outside-case-map="true"/);
  assert.match(source, /data-case-map-digest-changed="true"/);
  assert.match(source, /data-release-authorized="false"/);
  assert.match(source, /data-automatic-ash-action="false"/);
  assert.match(source, /data-station-authority-transferred="false"/);
  for (const control of ['data-rest', 'data-replay', 'data-return', 'data-exit']) assert.match(source, new RegExp(control));
});

test('closure ledger records repaired seams without closing the program', () => {
  const ledger = read('app/dome-world/docs/FLOWCORE_P0_P7_SEAM_CLOSURE_LEDGER_V0_1.md');
  for (const commit of Object.values(expectedCommits)) assert.match(ledger, new RegExp(commit));
  assert.match(ledger, /P6 initial-binding defect/);
  assert.match(ledger, /P7 rejection-test over-specification/);
  assert.match(ledger, /Temporary repair workflows/);
  assert.match(ledger, /human closure required: true/);
  assert.match(ledger, /closure: OPEN/);
});

test('no one-use Flow-Core repair workflow remains in the repository tree', () => {
  const workflows = fs.readdirSync(path.join(ROOT, '.github/workflows'));
  const residue = workflows.filter(name => /p0-p7-receipt-reconcile-once|p6-case-map-delta-repair|p7-duplicate-rejection-repair/.test(name));
  assert.deepEqual(residue, []);
});
