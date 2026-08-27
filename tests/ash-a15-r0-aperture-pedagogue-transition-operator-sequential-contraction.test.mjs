import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TRANSITION_OPERATOR_SEQUENTIAL_CONTRACTION_SCHEMA,
  buildInitialCompatiblePolygon,
  buildSequentialSelectionInput,
  buildTransitionOperatorSequentialContractionFixture,
  validateCompatiblePolygonRepresentation,
  validateSequentialProbeCandidate,
  validateSequentialGoal,
  validateSequentialSelectionInput,
  polygonArea,
  functionalInterval,
  applySequentialObservation,
  claimDiagnostics,
  sequentialClaimConditionedSelector,
  classifyHeldoutScalar,
  runTransitionOperatorSequentialContractionGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transition-operator-sequential-contraction.js';

const approx=(actual,expected,tolerance=1e-8,message='values differ')=>{
  assert.ok(Math.abs(actual-expected)<=tolerance,`${message}: actual=${actual} expected=${expected}`);
};

const specPath='app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TRANSITION_OPERATOR_SEQUENTIAL_CONTRACTION_GAUNTLET_SPEC_V0_1.md';
const implPath='app/dome-world/previews/a15-r0/aperture-pedagogue-transition-operator-sequential-contraction.js';
const spec=fs.readFileSync(specPath,'utf8');
const implementation=fs.readFileSync(implPath,'utf8');

assert.equal(
  TRANSITION_OPERATOR_SEQUENTIAL_CONTRACTION_SCHEMA,
  'td613.a15-r0.aperture-pedagogue-transition-operator-sequential-contraction/v0.1'
);

for (const phrase of [
  'claim-sufficient stopping != full raw operator identification',
  'more probes != more information',
  'complete compatible polygon != posterior credible region',
  'model-family defeat != mechanism identification',
  'bounded sequential system-identification assay != operator tomography',
  'operator tomography != path transport',
  'path transport != holonomy'
]) {
  assert.match(spec,new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
}

assert.match(spec,/area\(P1\) = 0\.39/);
assert.match(spec,/area\(P2\) = 0\.02/);
assert.match(spec,/claim_width_ceiling = 0\.25/);
assert.match(spec,/ABSTAIN_FROM_SILENT_MODEL_ORDER_UPGRADE/);
assert.match(spec,/PRESERVE_CONTRADICTION_AS_EVIDENCE/);
assert.doesNotMatch(spec,/Status:\s*IMPLEMENTED|Status:\s*WITNESSED/i);

const fixture=buildTransitionOperatorSequentialContractionFixture();
assert.equal(fixture.delta,0.1);
assert.equal(fixture.claim_width_ceiling,0.25);
assert.deepEqual(fixture.theta_star,[1,3]);
assert.deepEqual(fixture.exact_first_column,[2,1]);
assert.equal(fixture.candidates.length,4);

const candidate=id=>fixture.candidates.find(item=>item.candidate_id===id);
const goal=id=>fixture.goals[id];
for (const item of fixture.candidates) assert.equal(validateSequentialProbeCandidate(item),true);
for (const item of Object.values(fixture.goals)) assert.equal(validateSequentialGoal(item),true);

const p0=buildInitialCompatiblePolygon();
assert.equal(validateCompatiblePolygonRepresentation(p0),true);
approx(polygonArea(p0),4);
const p0Target=functionalInterval(p0,[1,1]);
const p0Guard=functionalInterval(p0,[1,-1]);
approx(p0Target.min,2);
approx(p0Target.max,6);
approx(p0Target.width,4);
approx(p0Guard.min,-4);
approx(p0Guard.max,0);
approx(p0Guard.width,4);

const selection0=sequentialClaimConditionedSelector(
  buildSequentialSelectionInput({polygon:p0,goal:goal('GOAL_TARGET_AND_GUARD')})
);
assert.equal(selection0.status,'SELECT_PROBE');
assert.equal(selection0.target_claim,'TARGET');
assert.equal(selection0.selected_candidate_id,'P_TARGET');
assert.equal(selection0.future_outputs_consulted,false);
assert.equal(selection0.automatic_execution,false);

const targetUpdate=applySequentialObservation(p0,candidate('P_TARGET'),4,fixture.delta);
assert.equal(targetUpdate.status,'COMPATIBLE_SET_CONTRACTED');
const p1=targetUpdate.polygon;
approx(polygonArea(p1),0.39,1e-8,'P1 area');
const p1d=claimDiagnostics(p1);
approx(p1d.TARGET.min,3.9);
approx(p1d.TARGET.max,4.1);
approx(p1d.TARGET.width,0.2);
assert.equal(p1d.TARGET.sufficient,true);
approx(p1d.GUARD.min,-4);
approx(p1d.GUARD.max,0);
approx(p1d.GUARD.width,4);
assert.equal(p1d.GUARD.sufficient,false);

const targetOnlyStop=sequentialClaimConditionedSelector(
  buildSequentialSelectionInput({polygon:p1,goal:goal('GOAL_TARGET_ONLY')})
);
assert.equal(targetOnlyStop.status,'STOP');
assert.equal(targetOnlyStop.stopping_status,'CLAIM_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET');
assert.ok(polygonArea(p1)>0);

const selection1=sequentialClaimConditionedSelector(
  buildSequentialSelectionInput({polygon:p1,goal:goal('GOAL_TARGET_AND_GUARD')})
);
assert.equal(selection1.status,'SELECT_PROBE');
assert.equal(selection1.target_claim,'GUARD');
assert.equal(selection1.selected_candidate_id,'P_GUARD');

const guardUpdate=applySequentialObservation(p1,candidate('P_GUARD'),-2,fixture.delta);
assert.equal(guardUpdate.status,'COMPATIBLE_SET_CONTRACTED');
const p2=guardUpdate.polygon;
approx(polygonArea(p2),0.02,1e-8,'P2 area');
assert.ok(polygonArea(p2)>0,'P2 must remain nonpoint');
const p2d=claimDiagnostics(p2);
approx(p2d.TARGET.min,3.9);
approx(p2d.TARGET.max,4.1);
approx(p2d.TARGET.width,0.2);
approx(p2d.GUARD.min,-2.1);
approx(p2d.GUARD.max,-1.9);
approx(p2d.GUARD.width,0.2);
assert.equal(p2d.TARGET.sufficient,true);
assert.equal(p2d.GUARD.sufficient,true);

const theta1=functionalInterval(p2,[1,0]);
const theta2=functionalInterval(p2,[0,1]);
approx(theta1.min,0.9);
approx(theta1.max,1.1);
approx(theta2.min,2.9);
approx(theta2.max,3.1);

const bothStop=sequentialClaimConditionedSelector(
  buildSequentialSelectionInput({polygon:p2,goal:goal('GOAL_TARGET_AND_GUARD')})
);
assert.equal(bothStop.status,'STOP');
assert.equal(bothStop.stopping_status,'DECLARED_CLAIM_SET_SUFFICIENT_STOP_WITH_NONPOINT_OPERATOR_SET');

const duplicate=applySequentialObservation(p1,candidate('P_TARGET_DUPLICATE'),4,fixture.delta);
assert.equal(duplicate.status,'REDUNDANT_BOUNDED_STRIP_NO_NEW_COMPATIBLE_SET_INFORMATION');
approx(duplicate.area_before,0.39);
approx(duplicate.area_after,0.39);
approx(duplicate.area_contraction,0);
const duplicateDiagnostics=claimDiagnostics(duplicate.polygon);
approx(duplicateDiagnostics.TARGET.width,0.2);
approx(duplicateDiagnostics.GUARD.width,4);

const noTheta=applySequentialObservation(p0,candidate('P_NO_THETA_INFORMATION'),2,fixture.delta);
assert.equal(noTheta.status,'NO_THETA_CONTRACTION');
approx(noTheta.area_before,4);
approx(noTheta.area_after,4);

const heldoutGuard=classifyHeldoutScalar({
  polygon:p1,
  x:[0,1],
  r:[1,-1],
  observed_center:-2,
  delta:fixture.delta,
  covered_status:'HELDOUT_GUARD_OBSERVATION_COVERED_BUT_NOT_NARROWLY_IDENTIFIED'
});
assert.equal(heldoutGuard.intersects,true);
assert.equal(heldoutGuard.status,'HELDOUT_GUARD_OBSERVATION_COVERED_BUT_NOT_NARROWLY_IDENTIFIED');
approx(heldoutGuard.prediction.min,-4);
approx(heldoutGuard.prediction.max,0);

const heldoutIn=classifyHeldoutScalar({
  polygon:p2,
  x:[0,1],
  r:[1,0],
  observed_center:1,
  delta:fixture.delta
});
assert.equal(heldoutIn.intersects,true);
assert.equal(heldoutIn.status,'HELDOUT_OBSERVATION_COMPATIBLE_WITH_CURRENT_OPERATOR_SET');
approx(heldoutIn.prediction.min,0.9);
approx(heldoutIn.prediction.max,1.1);

const heldoutOut=classifyHeldoutScalar({
  polygon:p2,
  x:[0,1],
  r:[1,0],
  observed_center:1.5,
  delta:fixture.delta
});
assert.equal(heldoutOut.intersects,false);
assert.equal(heldoutOut.status,'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION');
assert.equal(heldoutOut.silent_refit,false);
assert.equal(heldoutOut.silent_noise_inflation,false);
assert.equal(heldoutOut.silent_support_expansion,false);
assert.equal(heldoutOut.silent_model_order_upgrade,false);
approx(heldoutOut.observation.min,1.4);
approx(heldoutOut.observation.max,1.6);

const emptyControl=applySequentialObservation(p2,candidate('P_GUARD'),10,fixture.delta);
assert.equal(emptyControl.status,'DECLARED_MODEL_AND_OBSERVATION_CONSTRAINTS_INCONSISTENT');
assert.equal(emptyControl.polygon.status,'COMPATIBLE_SET_EMPTY');
approx(polygonArea(emptyControl.polygon),0);

for (const laundering of [
  {representation:'POINT_ESTIMATE',theta:[1,3]},
  {representation:'FINITE_SAMPLES',samples:[[1,3]]},
  {representation:'MONTE_CARLO_SAMPLES',samples:[[1,3]]},
  {representation:'POSTERIOR_CREDIBLE_REGION',center:[1,3]}
]) {
  assert.throws(()=>validateCompatiblePolygonRepresentation(laundering),/REJECT_COMPATIBLE_SET_LAUNDERING/);
}

assert.throws(
  ()=>validateSequentialProbeCandidate({...candidate('P_TARGET'),probe_cost:2}),
  /REJECT_SEQUENTIAL_PROBE_CANDIDATE_MUTATION/
);
assert.throws(
  ()=>validateSequentialGoal({...goal('GOAL_TARGET_ONLY'),required_claims:['TARGET','GUARD']}),
  /REJECT_SEQUENTIAL_GOAL_MUTATION/
);

const cleanSelectionInput=buildSequentialSelectionInput({polygon:p0,goal:goal('GOAL_TARGET_AND_GUARD')});
for (const forbidden of ['theta_star','T_star','synthetic_oracle','candidate_future_outputs','observed_centers','heldout_observations']) {
  assert.throws(
    ()=>validateSequentialSelectionInput({...structuredClone(cleanSelectionInput),[forbidden]:'forbidden'}),
    /REJECT_ORACLE_LEAKAGE_IN_SEQUENTIAL_PROBE_SELECTION/
  );
}
assert.equal('synthetic_observation_centers' in cleanSelectionInput,false);
assert.equal('theta_star' in cleanSelectionInput,false);
assert.ok(cleanSelectionInput.candidates.every(item=>!('observed_center' in item)));

assert.throws(
  ()=>validateSequentialSelectionInput({...structuredClone(cleanSelectionInput),declared_delta:0.2}),
  /REJECT_DECLARED_SEQUENTIAL_NOISE_BOUND_MUTATION/
);

const result=runTransitionOperatorSequentialContractionGauntlet();
assert.equal(result.schema,TRANSITION_OPERATOR_SEQUENTIAL_CONTRACTION_SCHEMA);
approx(result.initial.area,4);
approx(result.after_target.area,0.39);
approx(result.after_target_and_guard.area,0.02);
assert.equal(result.after_target_and_guard.nonpoint,true);
assert.equal(result.stopping.target_only.history.length,1);
assert.equal(result.stopping.target_only.history[0].selection.selected_candidate_id,'P_TARGET');
assert.equal(result.stopping.target_only.stop.status,'STOP');
assert.equal(result.stopping.target_and_guard.history.length,2);
assert.deepEqual(
  result.stopping.target_and_guard.history.map(step=>step.selection.selected_candidate_id),
  ['P_TARGET','P_GUARD']
);
assert.equal(result.stopping.target_and_guard.stop.status,'STOP');
assert.equal(result.redundancy.update_status,'REDUNDANT_BOUNDED_STRIP_NO_NEW_COMPATIBLE_SET_INFORMATION');
assert.equal(result.heldout.open_set_after_both.status,'DECLARED_LINEAR_TRANSITION_MODEL_DEFEATED_BY_HELDOUT_OBSERVATION');
assert.equal(result.empty_set_control.status,'DECLARED_MODEL_AND_OBSERVATION_CONSTRAINTS_INCONSISTENT');
assert.equal(result.hostiles.point_laundering_rejected,true);
assert.equal(result.hostiles.finite_sample_laundering_rejected,true);
assert.equal(result.hostiles.selector_oracle_leak_rejected,true);
assert.equal(result.fixture_immutable,true);
assert.equal(result.automatic_execution,false);
assert.equal(result.installed_aperture_mutation,false);
assert.equal(result.a16_reopened,false);
assert.equal(result.live_ash_mutation,false);
assert.equal(result.production_authority,false);
assert.equal(result.vercel_authority,false);
assert.equal(result.operator_tomography_earned,false);
assert.equal(result.path_transport_earned,false);
assert.equal(result.holonomy_earned,false);

assert.match(implementation,/future_outputs_consulted:false/);
assert.match(implementation,/silent_model_order_upgrade:false/);
assert.match(implementation,/operator_tomography_earned:false/);
assert.match(implementation,/path_transport_earned:false/);
assert.match(implementation,/holonomy_earned:false/);

console.log(JSON.stringify({
  schema:result.schema,
  initial_area:result.initial.area,
  after_target_area:result.after_target.area,
  after_both_area:result.after_target_and_guard.area,
  target_only_sequence:result.stopping.target_only.history.map(step=>step.selection.selected_candidate_id),
  target_guard_sequence:result.stopping.target_and_guard.history.map(step=>step.selection.selected_candidate_id),
  duplicate_status:result.redundancy.update_status,
  open_set_status:result.heldout.open_set_after_both.status,
  canonical_bounded_claim:result.canonical_bounded_claim
},null,2));
