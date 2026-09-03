import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  A16_REVIEW_WAIVER_CONTRADICTION_CERTIFICATE as C,
  classifyReviewWaiverState,
  enumerateReviewWaiverStates,
  runA16ReviewWaiverContradiction
} from '../app/dome-world/previews/a15-r0/a16-review-waiver-contradiction.js';

assert.equal(C.status,'A16_REVIEW_WAIVER_CONTRADICTION_EARNED');
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.mandatory_review_rule_present,true);
assert.equal(C.start_before_review_forbidden_rule_present,true);
assert.equal(C.terminal_review_or_waiver_rule_present,true);
assert.equal(C.state_count,4);
assert.equal(C.contradiction_count,1);
assert.equal(C.explicit_precedence_or_override_rule_detected,false);
assert.equal(C.waiver_branch_self_executing,false);
assert.equal(C.contradiction_requires_governance_adjudication_or_textual_repair,true);
assert.equal(C.stricter_rule_silently_promoted_to_canonical_precedence,false);
assert.equal(C.operator_review_recorded,false);
assert.equal(C.operator_review_admitted,false);
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
assert.match(C.contradiction_digest,/^[0-9a-f]{64}$/);

const states=enumerateReviewWaiverStates();
assert.equal(states.length,4);
const contradiction=states.filter(x=>x.contradictory);
assert.equal(contradiction.length,1);
assert.deepEqual(contradiction[0],C.waiver_only_state);
assert.equal(contradiction[0].review_recorded,false);
assert.equal(contradiction[0].explicitly_waived,true);
assert.equal(contradiction[0].section1_allows_start,false);
assert.equal(contradiction[0].section13_review_coordinate_passes,true);
assert.equal(contradiction[0].classification,'CONTRADICTORY_HELD');

const neither=classifyReviewWaiverState({review_recorded:false,explicitly_waived:false});
assert.equal(neither.contradictory,false);
assert.equal(neither.classification,'REVIEW_RULES_CONCORDANT_HOLD');

const reviewed=classifyReviewWaiverState({review_recorded:true,explicitly_waived:false});
assert.equal(reviewed.contradictory,false);
assert.equal(reviewed.classification,'REVIEW_RULES_CONCORDANT_ALLOW');

const reviewedAndWaived=classifyReviewWaiverState({review_recorded:true,explicitly_waived:true});
assert.equal(reviewedAndWaived.contradictory,false);
assert.equal(reviewedAndWaived.classification,'REVIEW_RULES_CONCORDANT_ALLOW');

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/A16_REVIEW_WAIVER_CONTRADICTION_RECEIPT_V0_1.md','utf8');
for(const law of [
  'MANDATORY REVIEW != WAIVER SUBSTITUTE',
  'TERMINAL ENTRY COORDINATE != EARLIER MANDATORY RULE',
  'WAIVER-ONLY STATE = CONTRADICTORY',
  'CONTRADICTION DETECTION != GOVERNANCE REPAIR',
  'STRICTER INTERPRETATION != CANONICAL PRECEDENCE',
  'WITNESS SOCKET != WAIVER AUTHORITY',
  'CONTRACT CONTRADICTION != A16 ADMISSION',
  'STRUCTURAL GOVERNANCE CONFLICT != WESTERN HORIZON SUCCESSOR'
]) assert.match(receipt,new RegExp(law.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));

const rerun=runA16ReviewWaiverContradiction();
assert.equal(rerun.status,C.status);
assert.equal(rerun.contradiction_digest,C.contradiction_digest);

console.log('A16 review-waiver contradiction tests passed.');
