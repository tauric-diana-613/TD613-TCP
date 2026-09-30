import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SCHEMA,
  evaluateInternalProvenanceNonBootstrapClaimCeiling,
  runPedagogueNoWindowGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-internal-provenance-non-bootstrap-claim-ceiling-no-window.js';

const receipt = runPedagogueNoWindowGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SCHEMA);
assert.equal(receipt.inherited_c13_verdict,
  'PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_KNEW_THE_QUESTION');
assert.equal(receipt.inherited_c13_survived, true);
assert.equal(receipt.candidate, 'C14_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SURVIVES_BOUNDED_NO_WINDOW',
  'INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_FALSIFIED_IN_BOUNDED_NO_WINDOW'
].includes(receipt.candidate_verdict));
assert.equal(receipt.external_anchor_introduction, false);
assert.equal(receipt.external_source_adapter, false);
assert.equal(receipt.external_provenance_identified, false);
assert.equal(receipt.claim_is_universal_impossibility_theorem, false);
assert.equal(receipt.closed_surface_only, true);
assert.equal(receipt.scalar_aggregation_used, false);
assert.equal(receipt.H2, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.H3, 'HELD_NOT_TESTED_HERE');
assert.equal(receipt.intersections, 'HELD_NOT_OPENED_HERE');
assert.equal(receipt.APERTURE_V32_REPLAY_STABILITY, 'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.product_mutation, false);
assert.equal(receipt.shared_pedagogue_engine_mutation, false);
assert.equal(receipt.browser_execution, false);
assert.equal(receipt.workflow_mutation, false);
assert.equal(receipt.merge_performed, false);
assert.equal(receipt.deployment_performed, false);
assert.equal(receipt.release_authority, false);
assert.equal(receipt.vercel_release_requires_issue_405_and_new_explicit_operator_gesture, true);
assert.equal(receipt.promotion_authority, false);
assert.deepEqual(Object.keys(receipt.rooms).sort(), [
  'nw01','nw02','nw03','nw04','nw05','nw06','nw07','nw08','nw09','nw10','nw11','nw12'
]);

if (receipt.candidate_verdict === 'INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_SURVIVES_BOUNDED_NO_WINDOW') {
  assert.deepEqual(receipt.defeat_conditions, []);
  const { nw01, nw02, nw03, nw04, nw05, nw06, nw07, nw08, nw09, nw10, nw11, nw12 } = receipt.rooms;

  assert.equal(nw01.oracle_origin_is_evaluator_input, false);
  assert.equal(nw01.admitted_internal_transcript_equal, true);
  assert.equal(nw01.posture_equal, true);
  assert.equal(nw01.genuine.external_provenance_status, 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR');
  assert.equal(nw01.fabricated.external_provenance_status, 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR');
  assert.equal(nw01.genuine.external_provenance_identified, false);
  assert.equal(nw01.fabricated.external_provenance_identified, false);

  assert.equal(nw02.result.external_provenance_status,
    'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE');
  assert.equal(nw02.result.external_provenance_identified, false);

  assert.equal(nw03.external_posture_equal, true);
  assert.equal(nw03.paperwork.internal_receipt_count, 4);
  assert.equal(nw03.paperwork.internal_receipt_depth_is_external_provenance, false);

  assert.equal(nw04.inherited_current_set_equal, true);
  assert.equal(nw04.external_posture_equal, true);
  assert.equal(nw05.external_posture_equal, true);
  assert.equal(nw06.external_posture_equal, true);

  assert.equal(nw07.result.self_computed_integrity_field_present, true);
  assert.equal(nw07.result.self_computed_integrity_field_is_exogenous_anchor, false);
  assert.equal(nw07.result.external_provenance_identified, false);

  assert.equal(nw08.visible_origin_label_equal, true);
  assert.equal(nw08.posture_equal, true);
  assert.equal(nw08.genuine.external_provenance_status,
    'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE');
  assert.equal(nw08.fabricated.external_provenance_status,
    'REFUSE_INTERNAL_SELF_ATTESTED_EXTERNAL_PROVENANCE');

  assert.equal(nw09.result.external_provenance_status, 'UNIDENTIFIED_NO_EXOGENOUS_ANCHOR');
  assert.equal(nw10.result.external_provenance_status, 'ABSTAIN_EXTERNAL_PROVENANCE_ANCHOR_UNOBSERVED');
  assert.equal(nw11.result.internal_non_anticipation_witnessed, true);
  assert.equal(nw11.result.external_provenance_identified, false);
  assert.equal(nw12.result.internal_non_anticipation_witnessed, false);
  assert.equal(nw12.result.external_provenance_identified, false);
} else {
  assert.ok(receipt.defeat_conditions.length > 0);
}

const explicitOutside = evaluateInternalProvenanceNonBootstrapClaimCeiling({
  internal_result: null,
  exogenous_anchor_present: true
});
assert.equal(explicitOutside.status, 'REFUSE_EXTERNAL_ANCHOR_OUTSIDE_ASSAY_JURISDICTION');
assert.equal(explicitOutside.external_provenance_identified, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_NO_WINDOW_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /No Window/i);
assert.match(spec, /C14_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING/);
assert.match(spec, /claim ceiling, not an impossibility theorem/i);
assert.match(spec, /Twin Worlds Behind One Wall/i);
assert.match(spec, /UNIDENTIFIED_NO_EXOGENOUS_ANCHOR/);
assert.match(spec, /external source adapter = NOT OPENED/i);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-no-window-internal-provenance-non-bootstrap-claim-ceiling-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate, 'C14_INTERNAL_PROVENANCE_NON_BOOTSTRAP_CLAIM_CEILING');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.strong_falsifier.internal_transcript_equal, true);
assert.equal(fixture.external_anchor_introduction, false);
assert.equal(fixture.external_source_adapter, false);
assert.equal(fixture.promotion_authority, false);
assert.equal(fixture.release_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c13_verdict: receipt.inherited_c13_verdict,
  c14_verdict: receipt.candidate_verdict,
  c14_defeat_conditions: receipt.defeat_conditions,
  NW01_posture_equal: receipt.rooms.nw01.posture_equal,
  NW01_external_status: receipt.rooms.nw01.genuine.external_provenance_status,
  NW02_status: receipt.rooms.nw02.result.external_provenance_status,
  NW07_self_integrity_is_anchor: receipt.rooms.nw07.result.self_computed_integrity_field_is_exogenous_anchor,
  NW10_status: receipt.rooms.nw10.result.external_provenance_status,
  NW11_internal_non_anticipation_witnessed: receipt.rooms.nw11.result.internal_non_anticipation_witnessed,
  external_anchor_introduction: receipt.external_anchor_introduction,
  external_source_adapter: receipt.external_source_adapter,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
