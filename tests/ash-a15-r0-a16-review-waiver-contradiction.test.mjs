import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  A16_REVIEW_WAIVER_CONTRADICTION_CERTIFICATE as C,
  classifyReviewWaiverState,
  enumerateReviewWaiverStates,
  runA16ReviewWaiverContradiction
} from '../app/dome-world/previews/a15-r0/a16-review-waiver-contradiction.js';

assert.equal(C.status,'A16_WAIVER_EPISTEMIC_SEPARATION_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.preserved_red_parent,'c0270599fdc118c2ca9e1bd775fb02c75349e986');
assert.equal(C.mandatory_review_wording_present,true);
assert.equal(C.start_before_review_forbidden_wording_present,true);
assert.equal(C.terminal_handoff_waiver_path_present,true);
assert.equal(C.predecessor_dossier_waiver_path_present,true);
assert.equal(C.inherited_waiver_path_established,true);
assert.equal(C.prior_global_waiver_path_absence_claim_falsified,true);
assert.equal(C.state_count,4);
assert.equal(C.local_handoff_tension_count,1);
assert.equal(C.waiver_can_satisfy_review_entry_coordinate,true);
assert.equal(C.waiver_creates_operator_review_record,false);
assert.equal(C.waiver_creates_human_observation,false);
assert.equal(C.waiver_creates_empirical_evidence,false);
assert.equal(C.waiver_opens_full_a16_gate,false);
assert.equal(C.governing_pair_names_waiver_principal,false);
assert.equal(C.governing_pair_names_waiver_receipt_schema,false);
assert.equal(C.khonapolit_cross_lineage_waiver_preserves_absence_precedent,true);
assert.equal(C.khonapolit_controls_a16_waiver_semantics,false);
assert.equal(C.permission_state_separable_from_evidence_state,true);
assert.equal(C.operator_review_recorded,false);
assert.equal(C.operator_review_admitted,false);
assert.equal(C.explicit_a16_review_waiver_recorded,false);
assert.equal(C.a16_gate_open,false);
assert.equal(C.a16_readmission_earned,false);
assert.equal(C.a16_implementation_authority,false);
assert.equal(C.a16_product_mutation_authority,false);
assert.equal(C.western_horizon_successor_stage_claimed,false);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.merge_authority,false);
assert.equal(C.production_authority,false);
assert.equal(C.deployment_authority,false);
assert.equal(C.publication_authority,false);
assert.match(C.separation_digest,/^[0-9a-f]{64}$/);

const states=enumerateReviewWaiverStates();
assert.equal(states.length,4);
const tensions=states.filter(x=>x.local_handoff_tension);
assert.equal(tensions.length,1);
assert.deepEqual(tensions[0],C.waiver_only_state);
assert.equal(tensions[0].review_recorded,false);
assert.equal(tensions[0].explicitly_waived,true);
assert.equal(tensions[0].section1_literal_allows_start,false);
assert.equal(tensions[0].terminal_review_coordinate_passes,true);
assert.equal(tensions[0].governance_review_coordinate_satisfied,true);
assert.equal(tensions[0].observation_evidence_present,false);
assert.equal(tensions[0].waiver_changes_permission_without_creating_review,true);
assert.equal(tensions[0].classification,'WAIVER_COORDINATE_SATISFIED_OBSERVATION_ABSENT');

const neither=classifyReviewWaiverState({review_recorded:false,explicitly_waived:false});
assert.equal(neither.local_handoff_tension,false);
assert.equal(neither.governance_review_coordinate_satisfied,false);
assert.equal(neither.classification,'REVIEW_COORDINATE_HELD');

const reviewed=classifyReviewWaiverState({review_recorded:true,explicitly_waived:false});
assert.equal(reviewed.local_handoff_tension,false);
assert.equal(reviewed.observation_evidence_present,true);
assert.equal(reviewed.classification,'REVIEW_RECORDED_COORDINATE_SATISFIED');

const reviewedAndWaived=classifyReviewWaiverState({review_recorded:true,explicitly_waived:true});
assert.equal(reviewedAndWaived.local_handoff_tension,false);
assert.equal(reviewedAndWaived.observation_evidence_present,true);
assert.equal(reviewedAndWaived.classification,'REVIEW_RECORDED_COORDINATE_SATISFIED');

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/A16_REVIEW_WAIVER_CONTRADICTION_RECEIPT_V0_1.md','utf8');
for(const law of [
  'LOCAL WORDING TENSION != GLOBAL WAIVER-PATH ABSENCE',
  'WAIVER PATH EXISTS != WAIVER EXECUTED',
  'WAIVER != OPERATOR REVIEW',
  'WAIVER != HUMAN OBSERVATION',
  'WAIVER != EMPIRICAL EVIDENCE',
  'GOVERNANCE PERMISSION != EPISTEMIC SATISFACTION',
  'REVIEW COORDINATE SATISFIED != FULL A16 ENTRY',
  'WAIVER PATH != WAIVER PRINCIPAL',
  'WAIVER PATH != WAIVER RECEIPT SCHEMA',
  'CROSS-LINEAGE WAIVER PRECEDENT != A16 AUTHORITY',
  'DESCENDANT REPAIR != RED ERASURE',
  'WAIVER-EPISTEMIC SEPARATION != WESTERN HORIZON SUCCESSOR'
]) assert.match(receipt,new RegExp(law.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
assert.match(receipt,/c0270599fdc118c2ca9e1bd775fb02c75349e986/);
assert.match(receipt,/A16 mutation = FORBIDDEN UNTIL REVIEW IS RECORDED OR EXPLICITLY WAIVED/);
assert.match(receipt,/operator visual review recorded or explicitly waived = true/);

const rerun=runA16ReviewWaiverContradiction();
assert.equal(rerun.status,C.status);
assert.equal(rerun.separation_digest,C.separation_digest);

console.log('A16 waiver-epistemic separation tests passed.');
