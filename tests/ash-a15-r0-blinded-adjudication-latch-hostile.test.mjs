import assert from 'node:assert/strict';
import {
  auditBlindedPublicReceipt,
  commitBlindedAdjudication,
  openBlindedAdjudication
} from '../app/dome-world/previews/a15-r0/blinded-adjudication-latch.js';
import { canonicalPreregisteredLoomRoutePair } from '../app/dome-world/previews/a15-r0/loom-route-pair-preregistration.js';
import { canonicalCustodyEpisode, sealMeasurementCustodyLedger } from '../app/dome-world/previews/a15-r0/measurement-custody-ledger.js';

const prereg=canonicalPreregisteredLoomRoutePair();
const episode=canonicalCustodyEpisode();
const ledger=await sealMeasurementCustodyLedger(prereg,episode,'2026-09-02T00:03:10Z');
const good=await commitBlindedAdjudication(ledger,{nonce:'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',committed_at:'2026-09-02T00:03:11Z'});
assert.equal(good.public_receipt.status,'COMMITTED');

const badNonce=await commitBlindedAdjudication(ledger,{nonce:'deadbeef',committed_at:'2026-09-02T00:03:11Z'});
assert.equal(badNonce.public_receipt.status,'INADMISSIBLE');
assert.ok(badNonce.public_receipt.errors.includes('PRIVATE_256_BIT_HEX_NONCE_REQUIRED'));

const earlyCommit=await commitBlindedAdjudication(ledger,{nonce:'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',committed_at:'2026-09-02T00:03:09Z'});
assert.equal(earlyCommit.public_receipt.status,'INADMISSIBLE');
assert.ok(earlyCommit.public_receipt.errors.includes('COMMIT_MUST_FOLLOW_LEDGER_SEAL'));

const leaked={...good.public_receipt,nonce:'private',ledger_root:'private'};
const leakAudit=auditBlindedPublicReceipt(leaked);
assert.equal(leakAudit.status,'LEAK');
assert.ok(leakAudit.leaked.includes('nonce'));
assert.ok(leakAudit.leaked.includes('ledger_root'));

const wrongOpening=structuredClone(good.private_opening);
wrongOpening.nonce='ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const wrongOpen=await openBlindedAdjudication(prereg,ledger,wrongOpening,{opened_at:'2026-09-02T00:03:12Z',episode});
assert.equal(wrongOpen.status,'INADMISSIBLE');
assert.ok(wrongOpen.errors.includes('COMMITMENT_OPENING_MISMATCH'));
assert.equal(wrongOpen.outcome_revealed,false);

const earlyOpen=await openBlindedAdjudication(prereg,ledger,good.private_opening,{opened_at:'2026-09-02T00:03:11Z',episode});
assert.equal(earlyOpen.status,'INADMISSIBLE');
assert.ok(earlyOpen.errors.includes('OPEN_MUST_FOLLOW_COMMIT'));
assert.equal(earlyOpen.outcome_revealed,false);

const partialPass=canonicalCustodyEpisode({surfaces:['observer','reconstruction','joining']});
const partialPassLedger=await sealMeasurementCustodyLedger(prereg,partialPass,'2026-09-02T00:02:10Z');
const partialPassCommit=await commitBlindedAdjudication(partialPassLedger,{nonce:'111122223333444455556666777788889999aaaabbbbccccddddeeeeffff0000',committed_at:'2026-09-02T00:02:11Z'});
const partialFail=canonicalCustodyEpisode({surfaces:['observer','reconstruction','joining']});
partialFail.artifacts.flatMap(a=>a.measurements).find(m=>m.name==='observer').value=0.9;
const partialFailLedger=await sealMeasurementCustodyLedger(prereg,partialFail,'2026-09-02T00:02:10Z');
const partialFailCommit=await commitBlindedAdjudication(partialFailLedger,{nonce:'0000ffffeeeeddddccccbbbbaaaa999988887777666655554444333322221111',committed_at:'2026-09-02T00:02:11Z'});
for(const commit of [partialPassCommit,partialFailCommit]){
  assert.equal(commit.public_receipt.phase,'COLLECTING');
  assert.equal(auditBlindedPublicReceipt(commit.public_receipt).status,'BLINDED');
}
assert.deepEqual(Object.keys(partialPassCommit.public_receipt).sort(),Object.keys(partialFailCommit.public_receipt).sort(),'Passing and failing partial core measurements must expose the same public receipt shape.');
assert.equal(partialPassCommit.public_receipt.entry_count,partialFailCommit.public_receipt.entry_count);
const heldPass=await openBlindedAdjudication(prereg,partialPassLedger,partialPassCommit.private_opening,{opened_at:'2026-09-02T00:02:12Z',episode:partialPass});
const heldFail=await openBlindedAdjudication(prereg,partialFailLedger,partialFailCommit.private_opening,{opened_at:'2026-09-02T00:02:12Z',episode:partialFail});
for(const held of [heldPass,heldFail]){
  assert.equal(held.status,'HELD');
  assert.equal(held.outcome_revealed,false);
  assert.equal(held.adjudication_invoked,false);
  assert.equal(held.acquisition_status,null);
  assert.equal(held.thresholds_pass,null);
}

const otherEpisode=canonicalCustodyEpisode();
otherEpisode.artifacts[0].source_id='other-source';
const otherLedger=await sealMeasurementCustodyLedger(prereg,otherEpisode,'2026-09-02T00:03:10Z');
const crossOpen=await openBlindedAdjudication(prereg,otherLedger,good.private_opening,{opened_at:'2026-09-02T00:03:12Z',episode:otherEpisode});
assert.equal(crossOpen.status,'INADMISSIBLE');
assert.ok(crossOpen.errors.includes('COMMITMENT_OPENING_MISMATCH')||crossOpen.errors.includes('PRIVATE_OPENING_LEDGER_ROOT_MISMATCH'));
assert.equal(crossOpen.outcome_revealed,false);

console.log('A15-R0 blinded adjudication latch hostile tests passed.');
