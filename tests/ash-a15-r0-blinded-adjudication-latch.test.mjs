import assert from 'node:assert/strict';
import {
  BLINDED_ADJUDICATION_LATCH_CERTIFICATE as C,
  auditBlindedPublicReceipt,
  commitBlindedAdjudication,
  openBlindedAdjudication
} from '../app/dome-world/previews/a15-r0/blinded-adjudication-latch.js';
import { canonicalPreregisteredLoomRoutePair } from '../app/dome-world/previews/a15-r0/loom-route-pair-preregistration.js';
import { canonicalCustodyEpisode, sealMeasurementCustodyLedger } from '../app/dome-world/previews/a15-r0/measurement-custody-ledger.js';

assert.equal(C.passed,true,'Blinded adjudication latch certificate must pass.');
assert.equal(C.exact_parent,'78443279853b95ab0bf54eed1decd1b5eeadf78c');
assert.equal(C.partial_public_receipt.phase,'COLLECTING');
assert.equal(C.partial_audit.status,'BLINDED');
assert.equal(C.partial_opening_attempt.status,'HELD');
assert.equal(C.partial_opening_attempt.adjudication_invoked,false);
assert.equal(C.partial_opening_attempt.outcome_revealed,false);
assert.equal(C.complete_public_receipt.phase,'SEALED_COMPLETE');
assert.equal(C.complete_audit.status,'BLINDED');
assert.equal(C.opened.status,'OPENED');
assert.equal(C.opened.acquisition_status,'CANDIDATE');
assert.equal(C.golden_egg_earned,false);

for(const receipt of [C.partial_public_receipt,C.complete_public_receipt]){
  const text=JSON.stringify(receipt);
  for(const token of ['ledger_root','nonce','source_id','measurement_id','measured_at','recorded_at','thresholds_pass','parent_acquisition_status','envelope','digest','"value"'])assert.equal(text.includes(token),false,`Public receipt must not expose ${token}.`);
  assert.equal(auditBlindedPublicReceipt(receipt).status,'BLINDED');
}

const prereg=canonicalPreregisteredLoomRoutePair();
const episode=canonicalCustodyEpisode();
const ledger=await sealMeasurementCustodyLedger(prereg,episode,'2026-09-02T00:03:10Z');
const a=await commitBlindedAdjudication(ledger,{nonce:'1111111111111111222222222222222233333333333333334444444444444444',committed_at:'2026-09-02T00:03:11Z'});
const b=await commitBlindedAdjudication(ledger,{nonce:'5555555555555555666666666666666677777777777777778888888888888888',committed_at:'2026-09-02T00:03:11Z'});
assert.notEqual(a.public_receipt.commitment,b.public_receipt.commitment,'Distinct private nonces must blind the same ledger to distinct public commitments.');
assert.deepEqual(Object.keys(a.public_receipt).sort(),Object.keys(b.public_receipt).sort(),'Nonce choice must not change public receipt shape.');
const opened=await openBlindedAdjudication(prereg,ledger,a.private_opening,{opened_at:'2026-09-02T00:03:12Z',episode});
assert.equal(opened.status,'OPENED');
assert.equal(opened.acquisition_status,'CANDIDATE');
assert.equal(opened.empirical_credit_from_latch,0);
assert.equal(opened.golden_egg_earned,false);

const failedEpisode=canonicalCustodyEpisode();
failedEpisode.artifacts.flatMap(x=>x.measurements).find(x=>x.name==='observer').value=0.9;
const failedLedger=await sealMeasurementCustodyLedger(prereg,failedEpisode,'2026-09-02T00:03:10Z');
const failedCommit=await commitBlindedAdjudication(failedLedger,{nonce:'9999999999999999aaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbcccccccccccccccc',committed_at:'2026-09-02T00:03:11Z'});
assert.equal(failedCommit.public_receipt.phase,'SEALED_COMPLETE');
assert.equal(auditBlindedPublicReceipt(failedCommit.public_receipt).status,'BLINDED');
const failedOpen=await openBlindedAdjudication(prereg,failedLedger,failedCommit.private_opening,{opened_at:'2026-09-02T00:03:12Z',episode:failedEpisode});
assert.equal(failedOpen.status,'OPENED');
assert.equal(failedOpen.acquisition_status,'FAILED','Latch must reveal an inherited failure honestly after complete valid opening.');

console.log('A15-R0 blinded adjudication latch canonical tests passed.');
