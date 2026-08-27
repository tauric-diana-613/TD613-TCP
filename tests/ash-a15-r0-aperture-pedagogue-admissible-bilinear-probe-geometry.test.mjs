import assert from 'node:assert/strict';
import {
  ADMISSIBLE_BILINEAR_PROBE_SCHEMA,
  bilinearRow,
  coefficientAudit,
  candidateAudit,
  unrestrictedGreedySelector,
  admissibilityAwareSelector,
  transformBilinearProbe,
  buildAdmissibleBilinearProbeFixture,
  runAdmissibleBilinearProbeGeometryGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-admissible-bilinear-probe-geometry.js';

const fixture=buildAdmissibleBilinearProbeFixture();
assert.equal(fixture.schema,ADMISSIBLE_BILINEAR_PROBE_SCHEMA);
assert.deepEqual(fixture.A3,[[1,1,0,0],[0,0,1,1],[1,0,1,0]]);
assert.deepEqual(fixture.current_null_direction,[1,-1,-1,1]);
assert.equal(Object.isFrozen(fixture),true);

const trace=fixture.candidates.find(c=>c.candidate_id==='Q_UNRESTRICTED_TRACE');
const good=fixture.candidates.find(c=>c.candidate_id==='Q_ADMISSIBLE_GOOD');
const blind=fixture.candidates.find(c=>c.candidate_id==='Q_ADMISSIBLE_BLIND');

assert.deepEqual(bilinearRow(good.r,good.x),[1,0,0,0]);
assert.deepEqual(bilinearRow(blind.r,blind.x),[0,1,0,1]);

const traceAudit=coefficientAudit(trace);
assert.deepEqual(traceAudit.coefficient_matrix,[[1,0],[0,1]]);
assert.equal(traceAudit.determinant,1);
assert.equal(traceAudit.factorization_present,false);
assert.equal(traceAudit.admissible_as_one_declared_bilinear_probe,false);

const goodAudit=candidateAudit(good,fixture.current_null_direction);
assert.equal(goodAudit.coefficient.determinant,0);
assert.equal(goodAudit.coefficient.factorization_present,true);
assert.equal(goodAudit.coefficient.factorization_matches,true);
assert.equal(goodAudit.coefficient.admissible_as_one_declared_bilinear_probe,true);
assert.equal(goodAudit.nullspace_dot,1);
assert.equal(goodAudit.normalized_nullspace_sensitivity,1);
assert.equal(goodAudit.rank_after_probe,4);
assert.equal(goodAudit.contracts_current_nullspace,true);

const blindAudit=candidateAudit(blind,fixture.current_null_direction);
assert.equal(blindAudit.coefficient.determinant,0);
assert.equal(blindAudit.coefficient.admissible_as_one_declared_bilinear_probe,true);
assert.equal(blindAudit.nullspace_dot,0);
assert.equal(blindAudit.normalized_nullspace_sensitivity,0);
assert.equal(blindAudit.rank_after_probe,3);
assert.equal(blindAudit.contracts_current_nullspace,false);

const unrestricted=unrestrictedGreedySelector(fixture.candidates,fixture.current_null_direction);
assert.equal(unrestricted.selected_candidate_id,'Q_UNRESTRICTED_TRACE');
const traceRanked=unrestricted.audits.find(a=>a.candidate_id==='Q_UNRESTRICTED_TRACE');
assert.ok(Math.abs(traceRanked.normalized_nullspace_sensitivity-Math.SQRT2)<1e-10);

const corrected=admissibilityAwareSelector({candidates:fixture.candidates,current_null_direction:fixture.current_null_direction});
assert.equal(corrected.status,'ADMISSIBLE_BILINEAR_PROBE_SELECTED_AFTER_ACTION_SET_FILTER');
assert.equal(corrected.selected_candidate_id,'Q_ADMISSIBLE_GOOD');

assert.throws(()=>admissibilityAwareSelector({candidates:fixture.candidates,current_null_direction:fixture.current_null_direction,T_star:[[2,1],[1,3]]}),/REJECT_ORACLE_LEAKAGE/);
assert.throws(()=>admissibilityAwareSelector({candidates:fixture.candidates,current_null_direction:fixture.current_null_direction,future_responses:[1]}),/REJECT_ORACLE_LEAKAGE/);
assert.throws(()=>admissibilityAwareSelector({candidates:fixture.candidates,current_null_direction:fixture.current_null_direction,synthetic_oracle:{}}),/REJECT_ORACLE_LEAKAGE/);

const fakeFactoredTrace={candidate_id:'FAKE_TRACE',probe_cost:1,h:[1,0,0,1],r:[1,0],x:[1,0]};
const fakeAudit=coefficientAudit(fakeFactoredTrace);
assert.equal(fakeAudit.factorization_matches,false);
assert.equal(fakeAudit.admissible_as_one_declared_bilinear_probe,false);

const transformedGood=transformBilinearProbe(good,fixture.coordinate_transform);
assert.equal(transformedGood.audit.determinant,0);
assert.equal(transformedGood.audit.factorization_matches,true);
assert.equal(transformedGood.audit.admissible_as_one_declared_bilinear_probe,true);

const result=runAdmissibleBilinearProbeGeometryGauntlet();
assert.equal(result.naming_criteria_satisfied,true);
for(const [name,value] of Object.entries(result.naming_criteria))assert.equal(value,true,`${name} must hold`);
assert.equal(result.unrestricted_selector.selected_candidate_id,'Q_UNRESTRICTED_TRACE');
assert.equal(result.admissibility_aware_selector.selected_candidate_id,'Q_ADMISSIBLE_GOOD');
assert.equal(result.canonical_bounded_scientific_claim,'AN_UNRESTRICTED_LINEAR_FUNCTIONAL_ON_VEC_T_CAN_RESOLVE_THE_CURRENT_OPERATOR_NULLSPACE_WHILE_REMAINING_INADMISSIBLE_AS_ANY_SINGLE_DECLARED_BILINEAR_INPUT_READOUT_PROBE_AND_MATCHED_ACTION_COUNT_ADMISSIBLE_BILINEAR_PROBES_CAN_DIFFER_IN_NULLSPACE_CONTRACTION_IN_THE_AUTHORED_FINITE_FIXTURE');
assert.equal(result.next_learning_action,'HELD_FOR_MULTI_PROBE_COMPOSITION_PREREGISTRATION_AFTER_WITNESS_RECEIPT');

for(const key of [
  'general_optimal_experiment_design_earned',
  'canonical_operator_tomography_promotion_authority',
  'operator_tomography_general_theorem_earned',
  'blind_tomography_earned',
  'physical_tomography_earned',
  'path_category_earned',
  'path_transport_earned',
  'holonomy_earned',
  'curvature_earned',
  'berry_structure_earned',
  'quantum_behavior_earned',
  'proto_loom_earned',
  'a16_reopened',
  'live_ash_mutation',
  'merge_authority',
  'production_authority',
  'vercel_authority'
]) assert.equal(result[key],false,`${key} must remain false`);

console.log(JSON.stringify({
  schema:result.schema,
  unrestricted_selector:result.unrestricted_selector.selected_candidate_id,
  admissibility_aware_selector:result.admissibility_aware_selector.selected_candidate_id,
  trace_score:traceRanked.normalized_nullspace_sensitivity,
  good_score:goodAudit.normalized_nullspace_sensitivity,
  blind_score:blindAudit.normalized_nullspace_sensitivity,
  claim:result.canonical_bounded_scientific_claim,
  next_learning_action:result.next_learning_action
}));
