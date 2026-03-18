import assert from 'assert';
import { chooseHarbor, buildLedgerRow, HARBOR_LIBRARY } from '../app/engine/harbor.js';
assert.equal(chooseHarbor({ routePressure: 0.8, badge: 'badge.holds', mirrorLogic: 'off' }), 'mirror.off');
assert.equal(chooseHarbor({ routePressure: 0.5, badge: 'badge.holds', mirrorLogic: 'on' }), 'receipt.capture');
const row = buildLedgerRow({ eventId: 'evt-test', harborFunction: 'mirror.off', routePressure: 0.8, traceability: 0.7, custodyArchive: 'witness' });
assert.equal(row.harbor_function, 'mirror.off');
assert.equal(row.provenance_retention, HARBOR_LIBRARY['mirror.off'].provenance_retention);
console.log('harbor.test.mjs passed');
