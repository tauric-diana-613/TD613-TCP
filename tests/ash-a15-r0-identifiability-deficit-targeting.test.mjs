import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  IDENTIFIABILITY_DEFICIT_TARGETING_SCHEMA,
  matrixRank,
  nullspaceBasis,
  evaluatePredeclaredProbeLibrary,
  runIdentifiabilityDeficitTargetingGauntlet
} from '../app/dome-world/previews/a15-r0/identifiability-deficit-targeting.js';

assert.equal(matrixRank([[1,2,2],[2,1,2],[1,-1,0]]), 2);
assert.equal(matrixRank([[1,1,0],[1,1,0],[1,1,0]]), 1);
assert.equal(nullspaceBasis([[1,2,2],[2,1,2],[1,-1,0]]).length, 1);
assert.equal(nullspaceBasis([[1,1,0],[1,1,0],[1,1,0]]).length, 2);
assert.throws(() => matrixRank([[1,2],[3]]), /rectangular/);
assert.throws(() => nullspaceBasis([[1,Number.NaN]]), /finite/);

const confoundedJ = [[1,2,2],[2,1,2],[1,-1,0]];
const confoundedProbes = [
  { probe_id:'C1', definition:'theta*x', gradient:[2,0,2] },
  { probe_id:'C2', definition:'x+y', gradient:[1,1,0] },
  { probe_id:'C3', definition:'x+theta*y', gradient:[1,2,2] }
];
const confounded = evaluatePredeclaredProbeLibrary(confoundedJ, confoundedProbes);
assert.equal(confounded.current_rank, 2);
assert.equal(confounded.current_nullity, 1);
assert.equal(confounded.current_nullspace_basis.length, 1);
assert.equal(confounded.oracle_identity_consulted, false);
assert.equal(confounded.predeclared_library_only, true);
assert.equal(confounded.selected_probe_id, 'C1');
assert.equal(confounded.selected_rank_lift, 1);
assert.equal(confounded.selected_nullity_after, 0);
const C1 = confounded.scores.find(score => score.probe_id === 'C1');
const C2 = confounded.scores.find(score => score.probe_id === 'C2');
const C3 = confounded.scores.find(score => score.probe_id === 'C3');
assert.equal(C1.rank_lift, 1);
assert.equal(C2.rank_lift, 1);
assert.equal(C3.rank_lift, 0);
assert.equal(C1.sensitive_to_current_nullspace, true);
assert.equal(C2.sensitive_to_current_nullspace, true);
assert.equal(C3.sensitive_to_current_nullspace, false);
assert.equal(C3.locally_redundant, true);

const repeated = [[1,1,0],[1,1,0],[1,1,0]];
const repeatedProbes = [
  { probe_id:'G_13', definition:'x+z', gradient:[1,0,1] },
  { probe_id:'G_23', definition:'y+z', gradient:[0,1,1] },
  { probe_id:'G_DUP', definition:'renamed x+y', gradient:[1,1,0] }
];
const first = evaluatePredeclaredProbeLibrary(repeated, repeatedProbes);
assert.equal(first.current_rank, 1);
assert.equal(first.current_nullity, 2);
assert.equal(first.selected_probe_id, 'G_13');
assert.equal(first.selected_rank_lift, 1);
assert.equal(first.scores.find(score => score.probe_id === 'G_DUP').rank_lift, 0);

const receipt = runIdentifiabilityDeficitTargetingGauntlet();
assert.equal(receipt.schema, IDENTIFIABILITY_DEFICIT_TARGETING_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.operational_scope, 'LOCAL_LINEARIZED_PREDECLARED_PROBE_LIBRARY');
assert.equal(receipt.context_a_state_instrument.rank_before, 2);
assert.equal(receipt.context_a_state_instrument.nullity_before, 1);
assert.deepEqual(receipt.context_a_state_instrument.canonical_null_direction, [2,2,-3]);
assert.deepEqual(receipt.context_a_state_instrument.canonical_null_residual, [0,0,0]);
assert.deepEqual(receipt.context_a_state_instrument.canonical_probe_sensitivities, { C1:-2, C2:4, C3:0 });
assert.equal(receipt.context_a_state_instrument.selected_probe_id, 'C1');
assert.equal(receipt.context_a_state_instrument.selected_rank_lift, 1);
assert.equal(receipt.context_b_known_forward.initial_rank, 1);
assert.equal(receipt.context_b_known_forward.initial_nullity, 2);
assert.equal(receipt.context_b_known_forward.first_selected_probe_id, 'G_13');
assert.equal(receipt.context_b_known_forward.rank_after_first, 2);
assert.equal(receipt.context_b_known_forward.nullity_after_first, 1);
assert.equal(receipt.context_b_known_forward.second_selected_probe_id, 'G_23');
assert.equal(receipt.context_b_known_forward.final_rank, 3);
assert.equal(receipt.context_b_known_forward.final_nullity, 0);
assert.equal(receipt.context_b_known_forward.duplicate_probe_never_lifts_rank, true);
assert.equal(receipt.cross_context.internal_context_family_count, 2);
assert.deepEqual(receipt.cross_context.context_families, ['KNOWN_FORWARD_RELATIONAL_STATE','PARTIALLY_UNKNOWN_STATE_INSTRUMENT']);
assert.equal(receipt.cross_context.criterion_status, 'IDENTIFIABILITY_DEFICIT_TARGETING_VALIDATED_IN_TWO_BOUNDED_SYNTHETIC_CONTEXTS');
assert.equal(receipt.cross_context.candidate_mechanism_id, 'LOCAL_IDENTIFIABILITY_DEFICIT_GUIDES_PREDECLARED_PROBE_SELECTION');
assert.equal(receipt.cross_context.oracle_identity_consulted, false);
assert.equal(receipt.cross_context.pedagogue_law_promoted, false);
assert.equal(receipt.next_learning_action, 'TEST_CONDITIONING_AND_NOISY_NEAR_SINGULAR_CASES_BEFORE_ANY_DESIGN_HEURISTIC_PROMOTION');
assert.equal(receipt.claims.optimal_experimental_design, false);
assert.equal(receipt.claims.active_learning_theorem, false);
assert.equal(receipt.claims.global_identifiability, false);
assert.equal(receipt.claims.stability_guarantee, false);
assert.equal(receipt.claims.blind_tomography, false);
assert.equal(receipt.claims.operator_tomography, false);
assert.equal(receipt.claims.physical_sensor_control, false);
assert.equal(receipt.claims.autonomous_experiment_execution, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_IDENTIFIABILITY_DEFICIT_TARGETING_SPEC_V0_1.md', 'utf8');
assert.match(spec, /current nullspace/i);
assert.match(spec, /rank-lift score/i);
assert.match(spec, /g_k · n != 0/);
assert.match(spec, /renamed\/repeated probe/i);
assert.match(spec, /global identifiability/i);
assert.match(spec, /physical sensor control = false/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  context_a_rank_before:receipt.context_a_state_instrument.rank_before,
  context_a_nullity_before:receipt.context_a_state_instrument.nullity_before,
  context_a_null_direction:receipt.context_a_state_instrument.canonical_null_direction,
  context_a_selected_probe:receipt.context_a_state_instrument.selected_probe_id,
  context_a_selected_rank_lift:receipt.context_a_state_instrument.selected_rank_lift,
  context_b_initial_rank:receipt.context_b_known_forward.initial_rank,
  context_b_initial_nullity:receipt.context_b_known_forward.initial_nullity,
  context_b_first_probe:receipt.context_b_known_forward.first_selected_probe_id,
  context_b_second_probe:receipt.context_b_known_forward.second_selected_probe_id,
  context_b_final_rank:receipt.context_b_known_forward.final_rank,
  context_b_final_nullity:receipt.context_b_known_forward.final_nullity,
  cross_context_status:receipt.cross_context.criterion_status,
  candidate_mechanism_id:receipt.cross_context.candidate_mechanism_id,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
