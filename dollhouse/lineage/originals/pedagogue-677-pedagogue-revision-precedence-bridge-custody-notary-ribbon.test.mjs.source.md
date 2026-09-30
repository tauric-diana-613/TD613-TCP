import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_REVISION_PRECEDENCE_BRIDGE_CUSTODY_SCHEMA,
  evaluateRevisionPrecedenceBridgeCustody,
  sealRevisionPrecedenceBridge,
  requestSealedRevisionPrecedenceBridgeMutation,
  runPedagogueNotaryRibbonGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-revision-precedence-bridge-custody-notary-ribbon.js';

const receipt = runPedagogueNotaryRibbonGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_REVISION_PRECEDENCE_BRIDGE_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c9_two_stamps_verdict,
  'MEMBERSHIP_EPOCH_BUNDLE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_TWO_STAMPS_SAME_MINUTE');
assert.ok([
  'MEMBERSHIP_EPOCH_BUNDLE_C9_FALSIFIED_AS_BRIDGE_AWARE_SUFFICIENT_FORM',
  'C9_BRIDGE_AWARE_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c9_bridge_aware_verdict));
assert.equal(receipt.candidate, 'C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_NOTARY_RIBBON',
  'REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_NOTARY_RIBBON'
].includes(receipt.candidate_verdict));
assert.equal(receipt.synthetic_digest_is_cryptographic_claim, false);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'nr01','nr02','nr03','nr04','nr05','nr06','nr07','nr08','nr09','nr10','nr11','nr12'
]);

if (receipt.candidate_verdict ===
  'REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_NOTARY_RIBBON') {
  assert.equal(receipt.inherited_c9_bridge_aware_verdict,
    'MEMBERSHIP_EPOCH_BUNDLE_C9_FALSIFIED_AS_BRIDGE_AWARE_SUFFICIENT_FORM');
  assert.equal(receipt.c9_bridge_aware_insufficiency_established, true);
  assert.deepEqual(receipt.defeat_conditions, []);

  const { nr01, nr02, nr03, nr04, nr05, nr06, nr07, nr08, nr09, nr10, nr11, nr12 } = receipt.rooms;

  assert.equal(nr01.c9.status, 'ABSTAIN_CONFLICTING_SAME_EPOCH_EVENT_MEMBERSHIP');
  assert.equal(nr01.same_visible_precedence_payload, true);
  assert.equal(nr01.valid_receipt.status, 'ADMIT_WITNESSED_REVISION_PRECEDENCE_BRIDGE');
  assert.equal(nr01.valid_receipt.admitted, true);
  assert.equal(nr01.carbon_receipt.status, 'REFUSE_UNWITNESSED_REVISION_PRECEDENCE_BRIDGE');
  assert.equal(nr01.carbon_receipt.admitted, false);
  assert.equal(nr01.blue.status, 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE');
  assert.equal(nr01.blue.current_active, true);

  assert.equal(nr02.withdraw_fingerprint_equal, true);
  assert.equal(nr02.admit_fingerprint_equal, true);
  assert.equal(nr02.blue.status, 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE');
  assert.equal(nr02.blue.current_active, true);

  assert.equal(nr03.status_equal, true);
  assert.equal(nr03.current_set_equal, true);

  assert.equal(nr04.blue.status, 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE');
  assert.equal(nr04.blue.current_active, false);

  assert.equal(nr05.blue.status, 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE');
  assert.equal(nr05.blue.current_active, null);

  assert.ok(nr06.blue.bridge_receipts.some(item =>
    item.status === 'REFUSE_UNWITNESSED_REVISION_PRECEDENCE_BRIDGE'));
  assert.equal(nr06.blue.current_membership_identified, false);

  assert.ok(nr07.blue.bridge_receipts.some(item =>
    item.status === 'REFUSE_REVOKED_REVISION_PRECEDENCE_BRIDGE'));
  assert.equal(nr07.blue.current_membership_identified, false);

  assert.ok(nr08.blue.bridge_receipts.some(item =>
    item.status === 'REFUSE_OUT_OF_BUNDLE_REVISION_PRECEDENCE_BRIDGE'));
  assert.equal(nr08.blue.current_membership_identified, false);

  assert.equal(nr09.blue.status, 'UNIFORM_ACTIVE_MEMBERSHIP_EPOCH_BUNDLE');
  assert.equal(nr09.blue.current_active, true);
  assert.equal(nr09.blue.bridge_precedence_required, false);

  assert.equal(nr10.inherited_status, 'ABSTAIN_CONFLICTING_EVENT_MEMBERSHIP');
  assert.equal(nr10.inherited_current_edge_count, 0);

  assert.equal(nr11.precedence_payload_equal, true);
  assert.equal(nr11.provenance_equal, false);
  assert.equal(nr11.compact_bridge_authority, false);

  assert.equal(nr12.mutation.status, 'SEALED_REVISION_PRECEDENCE_BRIDGE_IMMUTABLE');
  assert.equal(nr12.mutation.mutated, false);
  assert.equal(nr12.sealed_still_frozen, true);
} else {
  assert.ok(receipt.defeat_conditions.length > 0 ||
    receipt.inherited_c9_bridge_aware_verdict === 'C9_BRIDGE_AWARE_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN');
}

const empty = evaluateRevisionPrecedenceBridgeCustody({ membership_records: [], precedence_bridges: [] });
assert.deepEqual(empty.current_semantic_events, []);
assert.equal(empty.membership_id_authority, false);
assert.equal(empty.bridge_id_authority, false);
assert.equal(empty.input_order_authority, false);
assert.equal(empty.scalar_aggregation_used, false);

const sealed = sealRevisionPrecedenceBridge({ bridge_id: 'CONTROL' });
assert.equal(Object.isFrozen(sealed), true);
const mutation = requestSealedRevisionPrecedenceBridgeMutation(sealed, { relation: 'AFTER' });
assert.equal(mutation.status, 'SEALED_REVISION_PRECEDENCE_BRIDGE_IMMUTABLE');
assert.equal(mutation.mutated, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_NOTARY_RIBBON_REVISION_PRECEDENCE_BRIDGE_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Notary Ribbon/i);
assert.match(spec, /C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY/);
assert.match(spec, /membership_id != revision identity/i);
assert.match(spec, /declared revision precedence != witnessed revision precedence/i);
assert.match(spec, /visible bridge payload equality != bridge custody equality/i);
assert.match(spec, /RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE/);
assert.match(spec, /REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_NOTARY_RIBBON/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-notary-ribbon-revision-precedence-bridge-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate_descendant, 'C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.membership_id_in_fingerprint, false);
assert.equal(fixture.strong_falsifier.required_c10_posture,
  'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE');
assert.equal(fixture.promotion_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c9_bridge_aware_verdict: receipt.inherited_c9_bridge_aware_verdict,
  c9_bridge_aware_insufficiency_established: receipt.c9_bridge_aware_insufficiency_established,
  c10_verdict: receipt.candidate_verdict,
  c10_defeat_conditions: receipt.defeat_conditions,
  NR01_c9_status: receipt.rooms.nr01.c9.status,
  NR01_valid_bridge: receipt.rooms.nr01.valid_receipt.status,
  NR01_carbon_bridge: receipt.rooms.nr01.carbon_receipt.status,
  NR01_current_active: receipt.rooms.nr01.blue.current_active,
  NR02_fingerprint_invariant: receipt.rooms.nr02.withdraw_fingerprint_equal && receipt.rooms.nr02.admit_fingerprint_equal,
  NR04_reverse_current_active: receipt.rooms.nr04.blue.current_active,
  NR05_status: receipt.rooms.nr05.blue.status,
  NR09_uniform_status: receipt.rooms.nr09.blue.status,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
