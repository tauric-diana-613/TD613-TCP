import assert from 'node:assert/strict';
import {
  MEASUREMENT_CUSTODY_LEDGER_CERTIFICATE as C,
  canonicalCustodyEpisode,
  sealMeasurementCustodyLedger,
  verifyMeasurementCustodyLedger,
  adjudicateSealedMeasurementCustody
} from '../app/dome-world/previews/a15-r0/measurement-custody-ledger.js';
import { canonicalPreregisteredLoomRoutePair } from '../app/dome-world/previews/a15-r0/loom-route-pair-preregistration.js';

assert.equal(C.passed,true,'Measurement custody ledger certificate must pass.');
assert.equal(C.exact_parent,'a425d0f27ce36de84b45917b6a84261ac1e7251c');
assert.equal(C.partial_ledger.status,'SEALED');
assert.equal(C.partial_ledger.entry_count,2);
assert.equal(C.complete_ledger.status,'SEALED');
assert.equal(C.complete_ledger.entry_count,5);
assert.equal(C.complete_ledger.predecessor_root,C.partial_ledger.ledger_root);
assert.equal(C.verification.status,'VERIFIED');
assert.equal(C.adjudication.status,'CANDIDATE');
assert.equal(C.golden_egg_earned,false);

const prereg=canonicalPreregisteredLoomRoutePair();
const full=canonicalCustodyEpisode();
const ledger=await sealMeasurementCustodyLedger(prereg,full,'2026-09-02T00:02:10Z');
assert.equal(ledger.status,'SEALED');
assert.equal(ledger.entries.length,5);
assert.ok(ledger.entries.every(e=>/^sha256:[0-9a-f]{64}$/.test(e.digest)),'Every exact measurement must carry a SHA-256 envelope digest.');
assert.match(ledger.ledger_root,/^sha256:[0-9a-f]{64}$/);
const verified=await verifyMeasurementCustodyLedger(prereg,ledger,full);
assert.equal(verified.status,'VERIFIED');
const adjudication=await adjudicateSealedMeasurementCustody(prereg,ledger,full);
assert.equal(adjudication.status,'CANDIDATE');
assert.equal(adjudication.empirical_credit_from_ledger,0);
assert.equal(adjudication.golden_egg_earned,false);

console.log('A15-R0 same-episode measurement custody ledger canonical tests passed.');
