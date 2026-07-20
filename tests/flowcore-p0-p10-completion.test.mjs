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

test('P8-P10 receipts record merged state and keep terminal releases unconfirmed', () => {
  for (const [phase, record] of Object.entries(receipts)) {
    const source = read(record.path);
    assert.match(source, /MERGED TO MAIN/);
    assert.match(source, new RegExp(record.sha));
    assert.match(source, /PHASE RELEASE GATE ACCEPTED/);
    assert.match(source, /TERMINAL RELEASE RECEIPT NOT OBSERVED/);
    assert.doesNotMatch(source, /READY FOR MERGE|REPOSITORY CI PENDING/);
    assert.match(source, /human closure required: true|HUMAN CLOSURE OPEN/);
    assert.match(source, /closure: OPEN/);
    assert.match(source, /𝌋‌/);
    assert.match(source, /⟐/);
    assert.ok(phase);
  }
});

test('completion ledger preserves the entire P0-P10 ancestry', () => {
  const ledger = read('app/dome-world/docs/FLOWCORE_P0_P10_IMPLEMENTATION_COMPLETION_LEDGER_V0_1.md');
  assert.match(ledger, /U\+10D613/);
  for (const sha of allPhaseShas) assert.match(ledger, new RegExp(sha));
  assert.match(ledger, /IMPLEMENTATION COMPLETE THROUGH P10/);
  assert.match(ledger, /promotion state: HARDENED/);
  assert.match(ledger, /human adult empirical evidence: absent/);
  assert.match(ledger, /empirical exit gate: held/);
  assert.match(ledger, /production probe: not observed/);
  assert.match(ledger, /additional release attempt is authorized by this ledger|additional release attempt authorized by this ledger: false|additional release attempt authorized here: false/);
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

test('P10 retains HARDENED rather than runtime or production demonstration', () => {
  const source = read(receipts.P10.path);
  assert.match(source, /CURRENT STATE HARDENED/);
  assert.match(source, /RUNTIME AND PRODUCTION DEMONSTRATION HELD/);
  assert.match(source, /current promotion state: HARDENED/);
  assert.match(source, /promotion complete: false/);
  assert.match(source, /state inferred from merge: false/);
  assert.match(source, /state inferred from deployment: false/);
  assert.match(source, /feature enabled by packet: false/);
  assert.match(source, /program closure authorized by packet: false/);
});

test('final stitch introduces no temporary workflow or implementation mutation', () => {
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
