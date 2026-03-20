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
  decision: 'criticality'
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
assert.equal(row.branch_pressure, 0.46);
assert.equal(row.criticality_index, 0.69);

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
  decision: 'passage'
});

assert.equal(passageRow.route_status, 'safe-passage achieved');

console.log('harbor.test.mjs passed');
