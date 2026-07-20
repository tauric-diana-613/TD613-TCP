import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = path => fs.readFileSync(path, 'utf8');

const receipts = Object.freeze({
  P8: {
    path: 'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P8_IMPLEMENTATION_RECEIPT_V0_1.md',
    sha: '1fa2c5f3c64d006c56b9c421496441ab67871eed'
  },
  P9: {
    path: 'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P9_IMPLEMENTATION_RECEIPT_V0_1.md',
    sha: 'f2478b157a062a8908592b93fe8e05cb74d657cf'
  },
  P10: {
    path: 'app/dome-world/docs/FLOWCORE_PEDAGOGUE_P10_IMPLEMENTATION_RECEIPT_V0_1.md',
    sha: '990daa1634161003b20ab5ddfbe7f86809dc21ed'
  }
});

const allPhaseShas = [
  'f56914d788fbb86ef5b9741d0065bf00d74aed84',
  'a3aebfad8c3232447cff0749aa7bcbbe040a3337',
  '9736206696f254a4b51148694d507a927b00b790',
  '91158eb4af827599273b8ca17a11bb9f89356b32',
  '4c995bd372702d748ed659ff7b6c5421ab5ba27e',
  '326efa021ac9f94c32f96d642c7011d5f4d2fc58',
  'fbbf1426234a5923489b9e3f166e6138240a6118',
  '1fa2c5f3c64d006c56b9c421496441ab67871eed',
  'f2478b157a062a8908592b93fe8e05cb74d657cf',
  '990daa1634161003b20ab5ddfbe7f86809dc21ed'
];

test('P8-P10 receipts retain merged ancestry and open human closure', () => {
  for (const [phase, record] of Object.entries(receipts)) {
    const source = read(record.path);
    assert.match(source, /MERGED TO MAIN/);
    assert.match(source, new RegExp(record.sha));
    assert.doesNotMatch(source, /READY FOR MERGE|REPOSITORY CI PENDING/);
    assert.match(source, /human closure required: true|HUMAN CLOSURE OPEN/);
    assert.match(source, /closure: OPEN/);
    assert.match(source, /𝌋‌/);
    assert.match(source, /⟐/);
    assert.ok(phase);
  }
  for (const phase of ['P8', 'P9']) {
    const source = read(receipts[phase].path);
    assert.match(source, /PHASE RELEASE GATE ACCEPTED/);
    assert.match(source, /TERMINAL RELEASE RECEIPT NOT OBSERVED/);
  }
});

test('completion ledger preserves P0-P10 ancestry and the current release posture', () => {
  const ledger = read('app/dome-world/docs/FLOWCORE_P0_P10_IMPLEMENTATION_COMPLETION_LEDGER_V0_1.md');
  assert.match(ledger, /U\+10D613/);
  for (const sha of allPhaseShas) assert.match(ledger, new RegExp(sha));
  assert.match(ledger, /IMPLEMENTATION COMPLETE THROUGH P10/);
  assert.match(ledger, /promotion state: HARDENED/);
  assert.match(ledger, /browser runtime matrix: PASS/);
  for (const browser of ['Chromium', 'Firefox', 'WebKit']) assert.match(ledger, new RegExp(`${browser}: PASS`));
  assert.match(ledger, /mobile landscape: PASS/);
  assert.match(ledger, /rotation-equivalent: PASS/);
  assert.match(ledger, /reduced motion: PASS/);
  assert.match(ledger, /high contrast: PASS/);
  assert.match(ledger, /human adult empirical evidence: absent/);
  assert.match(ledger, /empirical exit gate: held/);
  assert.match(ledger, /production probe: pending post-merge release/);
  assert.match(ledger, /fresh explicit production authorization/);
  assert.match(ledger, /one bounded release after merge/);
  assert.match(ledger, /human promotion required: true/);
  assert.match(ledger, /human closure required: true/);
  assert.match(ledger, /closure: OPEN/);
});

test('P9 retains the human-evidence hold', () => {
  const source = read(receipts.P9.path);
  assert.match(source, /HUMAN ADULT STUDY NOT EXECUTED/);
  assert.match(source, /EMPIRICAL EXIT GATE HELD/);
  assert.match(source, /human adult evidence present: false/);
  assert.match(source, /HUMAN_VOLUNTARY_ADULT_EVIDENCE_ABSENT/);
  assert.match(source, /synthetic pipeline counts as human evidence: false/);
});

test('P10 records browser observation while retaining HARDENED and production holds', () => {
  const source = read(receipts.P10.path);
  assert.match(source, /CURRENT STATE HARDENED/);
  assert.match(source, /BROWSER RUNTIME OBSERVED/);
  assert.match(source, /PRODUCTION PROBE PENDING/);
  assert.match(source, /current promotion state: HARDENED/);
  assert.match(source, /browser runtime observed: true/);
  assert.match(source, /production probe observed: false/);
  assert.match(source, /promotion complete: false/);
  assert.match(source, /state inferred from merge: false/);
  assert.match(source, /state inferred from deployment: false/);
  assert.match(source, /runtime evidence counts as human evidence: false/);
  assert.match(source, /feature enabled by packet: false/);
  assert.match(source, /public route promotion authorized: false/);
  assert.match(source, /program closure authorized by packet: false/);
});

test('runtime closure receipt and program index expose the observed evidence and held authority', () => {
  const receipt = read('app/dome-world/docs/FLOWCORE_RUNTIME_RELEASE_CLOSURE_RECEIPT_V0_1.md');
  const index = read('app/dome-world/docs/FLOWCORE_PEDAGOGUE_PROGRAM_INDEX_V0_1.md');
  for (const source of [receipt, index]) {
    assert.match(source, /Chromium.*PASS/s);
    assert.match(source, /Firefox.*PASS/s);
    assert.match(source, /WebKit.*PASS/s);
    assert.match(source, /human adult.*absent/is);
    assert.match(source, /public route promotion.*false|public route promotion.*not authorized/is);
    assert.match(source, /feature gate default: OFF/);
    assert.match(source, /closure: OPEN/);
  }
  assert.match(receipt, /125px/);
  assert.match(receipt, /217px/);
  assert.match(receipt, /source_packet_commit/);
  assert.match(index, /FLOWCORE_P0_P10_IMPLEMENTATION_COMPLETION_LEDGER_V0_1\.md/);
  assert.match(index, /FLOWCORE_RUNTIME_RELEASE_CLOSURE_RECEIPT_V0_1\.md/);
});

test('final closure introduces no temporary workflow or authority mutation', () => {
  const workflowNames = fs.readdirSync('.github/workflows');
  assert.equal(workflowNames.some(name => /reconcile-once|case-map-delta-repair|duplicate-rejection-repair/.test(name)), false);
  const ledger = read('app/dome-world/docs/FLOWCORE_P0_P10_IMPLEMENTATION_COMPLETION_LEDGER_V0_1.md');
  assert.match(ledger, /new serverless function: false/);
  assert.match(ledger, /new persistence: false/);
  assert.match(ledger, /Ash lifecycle changed: false/);
  assert.match(ledger, /canonical digest law changed: false/);
  assert.match(ledger, /station authority transferred: false/);
  assert.match(ledger, /automatic promotion: false/);
  assert.match(ledger, /automatic closure: false/);
});
