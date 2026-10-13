import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA,
  acquirePrecedenceWitnessEpisode,
  createPrecedenceBridgeProposal,
  evaluateNonAnticipatingPrecedenceWitnessCustody,
  requestSealedAcquisitionEpisodeMutation,
  requestSealedBridgeProposalMutation,
  runPedagogueWitnessKnewTheQuestionGauntlet
} from '../app/dome-world/previews/a15-r0/pedagogue-precedence-witness-non-anticipating-acquisition-custody-witness-knew-the-question.js';

const receipt = runPedagogueWitnessKnewTheQuestionGauntlet();

assert.equal(receipt.schema, PEDAGOGUE_PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA);
assert.equal(receipt.inherited_c12_witness_arrived_verdict,
  'PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT');
assert.ok([
  'PRECEDENCE_WITNESS_PRE_ADMISSION_C12_FALSIFIED_AS_NON_ANTICIPATION_SUFFICIENT_FORM',
  'C12_JUST_IN_TIME_PRE_ADMISSION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN'
].includes(receipt.inherited_c12_non_anticipation_verdict));
assert.equal(receipt.candidate, 'C13_PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY');
assert.equal(receipt.candidate_status, 'ATTACK_ONLY_NOT_PROMOTED');
assert.ok([
  'PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_KNEW_THE_QUESTION',
  'PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_WITNESS_KNEW_THE_QUESTION'
].includes(receipt.candidate_verdict));
assert.equal(receipt.non_anticipation_relative_to_internal_proposal_only, true);
assert.equal(receipt.external_provenance_claim, false);
assert.equal(receipt.source_honesty_claim, false);
assert.equal(receipt.unbiased_sampling_claim, false);
assert.equal(receipt.physical_acquisition_time_claim, false);
assert.equal(receipt.runtime_capability_is_durable_provenance_claim, false);
assert.equal(receipt.proposal_id_authority, false);
assert.equal(receipt.bridge_id_authority, false);
assert.equal(receipt.membership_id_authority, false);
assert.equal(receipt.witness_id_lexical_authority, false);
assert.equal(receipt.input_order_authority, false);
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
  'kq01','kq02','kq03','kq04','kq05','kq06','kq07','kq08','kq09','kq10','kq11','kq12'
]);

if (receipt.candidate_verdict ===
  'PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_KNEW_THE_QUESTION') {
  assert.equal(receipt.inherited_c12_non_anticipation_verdict,
    'PRECEDENCE_WITNESS_PRE_ADMISSION_C12_FALSIFIED_AS_NON_ANTICIPATION_SUFFICIENT_FORM');
  assert.equal(receipt.c12_just_in_time_pre_admission_insufficiency_established, true);
  assert.deepEqual(receipt.defeat_conditions, []);

  const { kq01, kq02, kq03, kq04, kq05, kq06, kq07, kq08, kq09, kq10, kq11, kq12 } = receipt.rooms;

  assert.equal(kq01.c12_post_proposal_pre_submission_witness_admitted, true);
  assert.equal(kq01.c13_post_proposal_witness_admitted, false);
  assert.equal(kq01.postResult.status, 'REFUSE_POST_PROPOSAL_PRECEDENCE_WITNESS');
  assert.equal(kq01.postResult.inherited_c12_admitted, true);
  assert.equal(kq01.c13_pre_proposal_witness_admitted, true);
  assert.equal(kq01.preResult.status, 'ADMIT_NON_ANTICIPATING_PRECEDENCE_WITNESS');
  assert.equal(kq01.preBlue.status, 'RESOLVED_BY_WITNESSED_REVISION_PRECEDENCE');
  assert.equal(kq01.preBlue.current_active, true);

  assert.equal(kq02.visible_fields_equal, true);
  assert.equal(kq02.result.status, 'REFUSE_UNRECOGNIZED_ACQUISITION_EPISODE');
  assert.equal(kq02.result.admitted, false);

  assert.equal(kq03.mutation.status, 'SEALED_ACQUISITION_EPISODE_IMMUTABLE');
  assert.equal(kq03.mutation.mutated, false);
  assert.equal(kq03.episode_still_frozen, true);
  assert.equal(kq03.ledger_still_frozen, true);

  for (const room of [kq04, kq05, kq06, kq07]) {
    assert.equal(room.result.status, 'ADMIT_NON_ANTICIPATING_PRECEDENCE_WITNESS');
    assert.equal(room.result.admitted, true);
    assert.equal(room.current_set_equal, true);
  }

  assert.equal(kq08.visible_fields_equal, true);
  assert.equal(kq08.result.status, 'REFUSE_UNRECOGNIZED_BRIDGE_PROPOSAL');
  assert.equal(kq08.result.admitted, false);

  assert.equal(kq09.result.status, 'REFUSE_MISBOUND_PRECEDENCE_WITNESS_RECORD');
  assert.equal(kq09.result.admitted, false);

  assert.equal(kq10.blue.status, 'ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE');
  assert.equal(kq10.blue.current_active, null);

  assert.equal(kq11.result.status, 'REFUSE_REVOKED_PRECEDENCE_WITNESS_RECORD');
  assert.equal(kq11.result.admitted, false);

  assert.equal(kq12.result.status, 'NO_BRIDGE_NO_PRECEDENCE_CONSEQUENCE');
  assert.equal(kq12.result.admitted, false);
  assert.equal(kq12.admitted_bridge_count, 0);
} else {
  assert.ok(receipt.defeat_conditions.length > 0 ||
    receipt.inherited_c12_non_anticipation_verdict === 'C12_JUST_IN_TIME_PRE_ADMISSION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN');
}

const counterfeitAcquisition = Object.freeze({
  schema: `${PEDAGOGUE_PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_SCHEMA}/acquisition-episode`,
  acquisition_sequence: -1000,
  witness_ledger: [],
  episode_label: 'CALLER_DECLARED_EARLY_ACQUISITION'
});
const proposal = createPrecedenceBridgeProposal({ proposal_id: 'CONTROL', membership_records: [], precedence_bridges: [] });
const counterfeitResult = evaluateNonAnticipatingPrecedenceWitnessCustody({
  acquisition_episode: counterfeitAcquisition, bridge_proposal: proposal
});
assert.equal(counterfeitResult.status, 'REFUSE_UNRECOGNIZED_ACQUISITION_EPISODE');

const acquisition = acquirePrecedenceWitnessEpisode({ witness_ledger: [] });
assert.equal(Object.isFrozen(acquisition), true);
const acquisitionMutation = requestSealedAcquisitionEpisodeMutation(acquisition, { witness_ledger: [{ witness_id: 'LATE' }] });
assert.equal(acquisitionMutation.status, 'SEALED_ACQUISITION_EPISODE_IMMUTABLE');
assert.equal(acquisitionMutation.mutated, false);

const proposalMutation = requestSealedBridgeProposalMutation(proposal, { precedence_bridges: [{ bridge_id: 'LATE' }] });
assert.equal(proposalMutation.status, 'SEALED_BRIDGE_PROPOSAL_IMMUTABLE');
assert.equal(proposalMutation.mutated, false);

const spec = fs.readFileSync(
  'docs/pedagogue/PEDAGOGUE_WITNESS_KNEW_THE_QUESTION_NON_ANTICIPATING_PRECEDENCE_WITNESS_ACQUISITION_CUSTODY_HOSTILE_ASSAY_V0_1.md',
  'utf8'
);
assert.match(spec, /Witness Knew the Question/i);
assert.match(spec, /C13_PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY/);
assert.match(spec, /admitted before bridge submission != acquired before bridge proposal/i);
assert.match(spec, /pre-admitted != non-anticipating acquisition/i);
assert.match(spec, /pre-proposal acquisition in protocol != honest external source/i);
assert.match(spec, /ADMIT_NON_ANTICIPATING_PRECEDENCE_WITNESS/);
assert.match(spec, /REFUSE_POST_PROPOSAL_PRECEDENCE_WITNESS/);
assert.match(spec, /PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_KNEW_THE_QUESTION/);
assert.match(spec, /vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true/i);

const fixture = JSON.parse(fs.readFileSync(
  'docs/pedagogue/pedagogue-witness-knew-the-question-non-anticipating-precedence-witness-acquisition-custody-hostile-assay-v0.1.json',
  'utf8'
));
assert.equal(fixture.candidate_descendant, 'C13_PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY');
assert.equal(fixture.presumption_of_survival, false);
assert.equal(fixture.claim_ceiling.non_anticipation_relative_to_internal_bridge_proposal, true);
assert.equal(fixture.claim_ceiling.external_provenance, false);
assert.equal(fixture.strong_falsifier.c13_post_proposal_expected,
  'REFUSE_POST_PROPOSAL_PRECEDENCE_WITNESS');
assert.equal(fixture.promotion_authority, false);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  inherited_c12_non_anticipation_verdict: receipt.inherited_c12_non_anticipation_verdict,
  c12_just_in_time_pre_admission_insufficiency_established:
    receipt.c12_just_in_time_pre_admission_insufficiency_established,
  c13_verdict: receipt.candidate_verdict,
  c13_defeat_conditions: receipt.defeat_conditions,
  KQ01_c12_post_proposal_pre_submission_witness_admitted:
    receipt.rooms.kq01.c12_post_proposal_pre_submission_witness_admitted,
  KQ01_c13_post_proposal_status: receipt.rooms.kq01.postResult.status,
  KQ01_c13_pre_proposal_status: receipt.rooms.kq01.preResult.status,
  KQ02_status: receipt.rooms.kq02.result.status,
  KQ08_status: receipt.rooms.kq08.result.status,
  KQ09_status: receipt.rooms.kq09.result.status,
  KQ10_status: receipt.rooms.kq10.blue?.status ?? null,
  KQ11_status: receipt.rooms.kq11.result.status,
  non_anticipation_relative_to_internal_proposal_only:
    receipt.non_anticipation_relative_to_internal_proposal_only,
  runtime_capability_is_durable_provenance_claim:
    receipt.runtime_capability_is_durable_provenance_claim,
  deployment_performed: receipt.deployment_performed,
  release_authority: receipt.release_authority
}, null, 2));
