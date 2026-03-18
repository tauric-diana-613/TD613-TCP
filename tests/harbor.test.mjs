import assert from 'assert';
import { chooseHarbor, buildLedgerRow, HARBOR_LIBRARY } from '../app/engine/harbor.js';

assert.equal(
  chooseHarbor({
    routePressure: 0.8,
    badge: 'badge.holds',
    mirrorLogic: 'off',
    custodyArchive: 'witness',
    decision: 'criticality'
  }),
  'mirror.off'
);
assert.equal(
  chooseHarbor({
    routePressure: 0.5,
    badge: 'badge.holds',
    mirrorLogic: 'on',
    custodyArchive: 'institutional',
    decision: 'hold-branch'
  }),
  'receipt.capture'
);

const row = buildLedgerRow({
  eventId: 'evt-test',
  harborFunction: 'mirror.off',
  routePressure: 0.8,
  traceability: 0.7,
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

console.log('harbor.test.mjs passed');
