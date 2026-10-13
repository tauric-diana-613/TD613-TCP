import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SELF_CALIBRATING_JOINT_STATE_OPERATOR_SCHEMA,
  jointForwardObservation,
  jointStateCalibrationJacobian,
  reconstructJointStateCalibration,
  selectDiscriminatingProbe,
  runSelfCalibratingJointStateOperatorGauntlet
} from '../app/dome-world/previews/a15-r0/self-calibrating-joint-state-operator.js';

assert.deepEqual(jointForwardObservation({ x:2, y:3, theta:2 }), { P1:8, P2:7, P3:-1 });
assert.deepEqual(jointStateCalibrationJacobian({ x:2, y:3, theta:2 }), [[1,2,3],[2,1,2],[1,-1,0]]);
assert.throws(() => jointForwardObservation({ x:Number.NaN, y:3, theta:2 }), /x must be finite/);
assert.throws(() => reconstructJointStateCalibration({ P1:8, P2:7, P3:-1 }, -1), /tolerance/);

const positive = reconstructJointStateCalibration({ P1:8, P2:7, P3:-1 });
assert.equal(positive.status, 'JOINT_STATE_CALIBRATION_RECONSTRUCTED_IN_DECLARED_SYNTHETIC_GEOMETRY');
assert.deepEqual(positive.reconstructed, { x:2, y:3, theta:2 });
assert.equal(positive.unique_within_declared_model, true);

const singular = reconstructJointStateCalibration({ P1:6, P2:6, P3:0 });
assert.equal(singular.status, 'JOINT_STATE_CALIBRATION_UNIDENTIFIED');
assert.equal(singular.reconstructed, null);
assert.equal(singular.unique_within_declared_model, false);

const family = [
  { candidate_id:'K0', x:2, y:2, theta:2 },
  { candidate_id:'K1', x:3, y:3, theta:1 },
  { candidate_id:'K2', x:1, y:1, theta:5 }
];
const proposal = selectDiscriminatingProbe(family);
assert.equal(proposal.oracle_identity_consulted, false);
assert.equal(proposal.selected_probe_id, 'C1');
assert.equal(proposal.selected_separation_fraction, 1);
assert.equal(proposal.automatic_measurement_execution, false);
assert.equal(proposal.primary_inverse_verdict_overwritten, false);
const C1 = proposal.scores.find(score => score.probe_id === 'C1');
const C2 = proposal.scores.find(score => score.probe_id === 'C2');
const C3 = proposal.scores.find(score => score.probe_id === 'C3');
assert.deepEqual(C1.outcomes, [4,3,5]);
assert.deepEqual(C2.outcomes, [4,6,2]);
assert.deepEqual(C3.outcomes, [6,6,6]);
assert.equal(C1.separation_fraction, 1);
assert.equal(C2.separation_fraction, 1);
assert.equal(C3.separation_fraction, 0);
assert.equal(C3.redundant_over_current_family, true);

const receipt = runSelfCalibratingJointStateOperatorGauntlet();
assert.equal(receipt.schema, SELF_CALIBRATING_JOINT_STATE_OPERATOR_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.forward_model.partially_unknown_forward_operator, true);
assert.equal(receipt.forward_model.hidden_parameter_id, 'theta');
assert.equal(receipt.positive.jacobian_rank, 3);
assert.equal(receipt.positive.jacobian_determinant, -3);
assert.deepEqual(receipt.positive.inverse.reconstructed, { x:2, y:3, theta:2 });
assert.equal(receipt.hostile_confound.jacobian_rank, 2);
assert.equal(receipt.hostile_confound.jacobian_determinant, 0);
assert.equal(receipt.hostile_confound.compatible_observations_match, true);
assert.equal(receipt.hostile_confound.compatible_family.length, 3);
assert.ok(receipt.hostile_confound.compatible_family.every(item => JSON.stringify(item.observation) === JSON.stringify({ P1:6, P2:6, P3:0 })));
assert.equal(receipt.hostile_confound.primary_verdict, 'JOINT_STATE_CALIBRATION_UNIDENTIFIED');
assert.match(receipt.hostile_confound.confound_classification, /OBSERVATIONALLY_EXCHANGEABLE/);
assert.equal(receipt.next_measurement_design.selected_probe_id, 'C1');
assert.equal(receipt.next_measurement_design.oracle_identity_consulted, false);
assert.equal(receipt.next_measurement_design.automatic_measurement_execution, false);
assert.equal(receipt.gauntlet_status, 'SELF_CALIBRATING_IDENTIFIABILITY_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relations[0], /state-instrument split/);
assert.match(receipt.reusable_relations[1], /discriminatory power/);
assert.equal(receipt.next_learning_action, 'EXECUTE_PREDECLARED_DISCRIMINATOR_WITHOUT_OVERWRITING_PRIMARY_UNIDENTIFIED_VERDICT');
assert.equal(receipt.claims.blind_tomography, false);
assert.equal(receipt.claims.operator_tomography, false);
assert.equal(receipt.claims.physical_tomography, false);
assert.equal(receipt.claims.live_td613_self_calibration, false);
assert.equal(receipt.claims.autonomous_experiment_execution, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_SELF_CALIBRATING_JOINT_STATE_OPERATOR_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /JOINT_STATE_CALIBRATION_UNIDENTIFIED/);
assert.match(spec, /state–instrument confound/i);
assert.match(spec, /C3\(x,y,θ\) = P1/);
assert.match(spec, /oracle identity/i);
assert.match(spec, /self-calibration has an identifiability boundary/i);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  positive_reconstruction:receipt.positive.inverse.reconstructed,
  positive_jacobian_rank:receipt.positive.jacobian_rank,
  hostile_primary_verdict:receipt.hostile_confound.primary_verdict,
  hostile_jacobian_rank:receipt.hostile_confound.jacobian_rank,
  compatible_family_size:receipt.hostile_confound.compatible_family.length,
  selected_next_probe:receipt.next_measurement_design.selected_probe_id,
  selected_separation_fraction:receipt.next_measurement_design.selected_separation_fraction,
  redundant_probe_separation_fraction:C3.separation_fraction,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
