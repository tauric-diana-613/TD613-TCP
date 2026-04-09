import assert from 'assert';
import { chooseHarbor, buildLedgerRow, HARBOR_LIBRARY } from '../app/engine/harbor.js';

assert.equal(
  chooseHarbor({
    routePressure: 0.78,
    branchPressure: 0.44,
    criticality: 0.66,
    badge: 'badge.holds',
    mirrorLogic: 'off',
    custodyArchive: 'witness',
    decision: 'criticality',
    routeAvailable: false
  }),
  'mirror.off'
);

assert.equal(
  chooseHarbor({
    routePressure: 0.5,
    branchPressure: 0.43,
    criticality: 0.34,
    badge: 'badge.holds',
    mirrorLogic: 'on',
    custodyArchive: 'institutional',
    decision: 'hold-branch',
    routeAvailable: false
  }),
  'receipt.capture'
);

assert.equal(
  chooseHarbor({
    routePressure: 0.28,
    branchPressure: 0.12,
    criticality: 0.1,
    badge: 'badge.holds',
    mirrorLogic: 'on',
    custodyArchive: 'institutional',
    decision: 'weak-signal',
    routeAvailable: false
  }),
  'provenance.seal'
);

assert.equal(
  chooseHarbor({
    routePressure: 0.52,
    branchPressure: 0.38,
    criticality: 0.46,
    badge: 'badge.holds',
    mirrorLogic: 'off',
    custodyArchive: 'institutional',
    decision: 'passage',
    routeAvailable: true,
    density: 0.34,
    recurrencePressure: 0.58,
    traceability: 0.82,
    explained: false,
    recognized: true
  }),
  'mirror.off'
);

const row = buildLedgerRow({
  eventId: 'evt-test',
  harborFunction: 'mirror.off',
  routePressure: 0.8,
  traceability: 0.7,
  branchPressure: 0.46,
  criticality: 0.69,
  density: 0.41,
  routeAvailable: false,
  custodyArchive: 'witness',
  decision: 'criticality',
  mirrorLogic: 'off',
  recurrencePressure: 0.58,
  badge: 'badge.holds',
  explained: false,
  recognized: true
});

assert.equal(row.harbor_function, 'mirror.off');
assert.equal(row.provenance_retention, HARBOR_LIBRARY['mirror.off'].provenance_retention);
assert.equal(row.effective_archive, 'A_W');
assert(row.group_size >= 1);
assert(row.solo_cost > row.shared_cost);
assert(row.reuse_gain > 0);
assert.equal(row.route_status, 'buffered');
assert.equal(row.route_available, false);
assert.equal(row.signal_density, 0.41);
assert.equal(row.route_pressure, 0.8);
assert.equal(row.branch_pressure, 0.46);
assert.equal(row.criticality_index, 0.69);
assert.equal(row.protocol_identity, 'TD613 Aperture');
assert.equal(row.observed_regime, 'PRCS-A');
assert.equal(row.anti_enforcement, true);
assert.equal(row.counter_recognition_required, true);
assert.equal(row.generative_passage_blocked, true);
assert(row.recapture_risk >= 0.46);

const passageRow = buildLedgerRow({
  eventId: 'evt-passage',
  harborFunction: 'receipt.capture',
  routePressure: 0.74,
  traceability: 0.93,
  branchPressure: 0.21,
  criticality: 0.37,
  density: 0.62,
  routeAvailable: true,
  custodyArchive: 'institutional',
  decision: 'passage',
  mirrorLogic: 'on',
  recurrencePressure: 0.18,
  badge: 'badge.holds',
  explained: true,
  recognized: true
});

assert.equal(passageRow.route_status, 'safe-passage achieved');
assert.equal(passageRow.generative_passage_blocked, false);

console.log('harbor.test.mjs passed');
