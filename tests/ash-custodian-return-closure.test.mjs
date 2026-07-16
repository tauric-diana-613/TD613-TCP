import assert from 'node:assert/strict';

import {
  compileReturnHoldReceipt,
  compileReturnProductionObservation,
  compileReturnReplayReceipt,
  verifyReturnHoldReceipt,
  verifyReturnProductionObservation,
  verifyReturnReadyBundle,
  verifyReturnReplayReceipt
} from '../app/engine/ash-custodian-return-closure.js';
import { decryptAshCapsule } from '../app/engine/ash-keep-continuity.js';
import { buildSyntheticReturnFixtures } from '../scripts/ash-custodian-return-fixture.mjs';

const fixtures = await buildSyntheticReturnFixtures();

const validPayload = await decryptAshCapsule(fixtures.validCapsule, fixtures.passphrase);
const validBundle = validPayload.case_bundle.returnReadyBundle;
const valid = await verifyReturnReadyBundle(validBundle);
assert.equal(valid.valid, true, valid.holds.join(', '));
assert.equal(valid.state, 'VERIFIED');

await assert.rejects(
  () => decryptAshCapsule(fixtures.validCapsule, 'wrong-passphrase'),
  /authentication failed/i
);

const tamperedPayload = await decryptAshCapsule(fixtures.tamperedCapsule, fixtures.passphrase);
const tampered = await verifyReturnReadyBundle(tamperedPayload.case_bundle.returnReadyBundle);
assert.equal(tampered.valid, false);
assert.equal(tampered.state, 'TAMPER_HOLD');

const stalePayload = await decryptAshCapsule(fixtures.staleCapsule, fixtures.passphrase);
const stale = await verifyReturnReadyBundle(stalePayload.case_bundle.returnReadyBundle);
assert.equal(stale.valid, false);
assert.equal(stale.state, 'STALE_RECEIPT_HOLD');

const partialPayload = await decryptAshCapsule(fixtures.partialCapsule, fixtures.passphrase);
assert.equal(partialPayload.case_bundle.returnReadyBundle, undefined);

const hold = await compileReturnHoldReceipt({
  caseId: fixtures.caseId,
  failureClass: 'INTERRUPTED_IMPORT_HOLD',
  capsuleDigest: fixtures.validCapsule.capsule_digest,
  bundleDigest: fixtures.validBundle.bundle_digest,
  failedChecks: ['sandbox_import'],
  observations: ['synthetic interruption']
});
assert.equal(await verifyReturnHoldReceipt(hold), true);
assert.equal(hold.live_case_mutated, false);
assert.equal(hold.recipient_transport_performed, false);

const replay = await compileReturnReplayReceipt({
  caseId: fixtures.caseId,
  returnReceiptReference: 'return_fixture',
  returnReceiptDigest: `sha256:${'d'.repeat(64)}`,
  anisotropyReceiptReference: 'anis_fixture',
  anisotropyReceiptDigest: `sha256:${'e'.repeat(64)}`,
  returnReadyBundleDigest: fixtures.validBundle.bundle_digest,
  sandboxRecordFound: true
});
assert.equal(await verifyReturnReplayReceipt(replay), true);
assert.equal(replay.reconstruction_reexecuted, false);

const observation = await compileReturnProductionObservation({
  observedBaseUrl: 'http://127.0.0.1:6130',
  observedCommit: 'synthetic',
  matrix: {
    valid_return: 'PASS',
    wrong_passphrase: 'PASS',
    tamper: 'PASS',
    partial_capsule: 'PASS',
    stale_receipt: 'PASS',
    interrupted_import: 'PASS',
    replay: 'PASS'
  },
  responsiveSurfaces: { desktop: 'PASS', mobile: 'PASS', reduced_motion: 'PASS' },
  accessibility: { live_status: true, labelled_panel: true }
});
assert.equal(await verifyReturnProductionObservation(observation), true);
assert.equal(observation.promotion_authorized, false);
assert.equal(observation.operator_closure_required, true);

console.log('Ash Custodian Return production-closure contracts: PASS');
