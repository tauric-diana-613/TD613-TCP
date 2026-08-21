import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_REPLAY_SENSITIVITY_GATE_SCHEMA,
  runAperturePedagogueReplaySensitivityGateGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-replay-sensitivity-gate.js';
import { APERTURE_V32_REPLAY_STABILITY } from '../app/engine/aperture-v32-typed-epistemic-deficit.js';

const receipt=runAperturePedagogueReplaySensitivityGateGauntlet();
assert.equal(receipt.schema,APERTURE_PEDAGOGUE_REPLAY_SENSITIVITY_GATE_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
const {F1,F2,F3,F4,F5}=receipt.fixtures;
assert.equal(F1.replay_policy_disposition,'PROPOSE_STABLE_WITHIN_DECLARED_REPLAY_ENVELOPE');
assert.equal(F1.measurement_admissibility,'STABLE_VALID');
assert.equal(F1.selection_stability,'STABLE');
assert.equal(F2.replay_policy_disposition,'PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION');
assert.equal(F2.replay_sensitivity_axis,'MEASUREMENT_MODEL');
assert.equal(F2.measurement_admissibility,'STABLE_VALID');
assert.equal(F2.selection_stability,'SENSITIVE');
assert.equal(F3.replay_policy_disposition,'PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION');
assert.equal(F3.replay_sensitivity_axis,'DECISION_SPECIFICATION');
assert.equal(F3.measurement_admissibility,'STABLE_VALID');
assert.equal(F3.selection_stability,'SENSITIVE');
assert.equal(F4.replay_policy_disposition,'ABSTAIN_CANDIDATE_ADMISSIBILITY_NOT_STABLE');
assert.equal(F4.measurement_admissibility,'NOT_STABLE_ACROSS_DECLARED_ENVELOPE');
assert.deepEqual(F4.envelope_evaluations.map(item=>item.rank_lift),[0,1,1]);
assert.ok(F4.envelope_evaluations.every(item=>item.covariance_status==='VALID_SYMMETRIC_POSITIVE_DEFINITE_COVARIANCE'));
assert.equal(F5.undeclared.status,'NO_SELECTION_UNDECLARED_DECISION_LOSS');
assert.equal(F5.conflict.status,'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE');
assert.equal(F5.posthoc.status,'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY');
assert.ok(receipt.anti_equivalences.includes('value contingency != epistemic deficit'));
assert.ok(receipt.anti_equivalences.includes('replay-sensitive selection != automatic abstention'));
assert.equal(receipt.no_scalar_crown,true);
assert.equal(receipt.related_unresolved_pr_evidence.pr_number,677);
assert.equal(receipt.related_unresolved_pr_evidence.hypothesis_status_mutated,false);
assert.equal(receipt.sibling_pr_684_posture.pr_number,684);
assert.equal(receipt.sibling_pr_684_posture.mutated,false);
assert.equal(receipt.sibling_pr_677_mutated,false);
assert.equal(receipt.sibling_pr_684_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.value_inference,false);
assert.equal(receipt.preference_learning,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.standalone_aperture_ui_mutated,false);
assert.equal(receipt.human_closure_required,true);
assert.equal(APERTURE_V32_REPLAY_STABILITY,'HELD_NOT_YET_WITNESSED');
for(const claim of Object.values(receipt.claims)) assert.equal(claim,false);
const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_REPLAY_SENSITIVITY_GATE_VS_ANNOTATION_SPEC_V0_1.md','utf8');
assert.match(spec,/value-contingent question choice != epistemic insufficiency/);
assert.match(spec,/PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION/);
assert.match(spec,/ABSTAIN_CANDIDATE_ADMISSIBILITY_NOT_STABLE/);
assert.match(spec,/value contingency != epistemic deficit/);
assert.match(spec,/#686 evidence != #677 hypothesis promotion/);
console.log(JSON.stringify({ok:true,schema:receipt.schema,stable_posture:F1.replay_policy_disposition,measurement_sensitive_posture:F2.replay_policy_disposition,measurement_sensitive_axis:F2.replay_sensitivity_axis,decision_sensitive_posture:F3.replay_policy_disposition,decision_sensitive_axis:F3.replay_sensitivity_axis,admissibility_instability_posture:F4.replay_policy_disposition,admissibility_rank_lifts:F4.envelope_evaluations.map(item=>item.rank_lift),undeclared_status:F5.undeclared.status,conflict_status:F5.conflict.status,posthoc_status:F5.posthoc.status,next_learning_action:receipt.next_learning_action,promotion_authority:receipt.promotion_authority},null,2));

import './ash-a15-r0-aperture-pedagogue-typed-multi-axis-replay.test.mjs';
