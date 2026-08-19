import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PARTIAL_IDENTIFICATION_CONTRACTION_SCHEMA,
  runPartialIdentificationContractionGauntlet
} from '../app/dome-world/previews/a15-r0/partial-identification-contraction.js';

const receipt = runPartialIdentificationContractionGauntlet();
assert.equal(receipt.schema, PARTIAL_IDENTIFICATION_CONTRACTION_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.target, 'R0');
assert.equal(receipt.route_count, 4);

assert.deepEqual(receipt.baseline.identified_set, ['R0', 'R1', 'R2']);
assert.equal(receipt.baseline.size, 3);
assert.equal(receipt.baseline.classification, 'PARTIALLY_IDENTIFIED');
assert.equal(receipt.baseline.point_identified, false);

assert.deepEqual(receipt.cases.A.identified_set, ['R0', 'R1']);
assert.equal(receipt.cases.A.size, 2);
assert.equal(receipt.cases.A.contraction_source, 'PREDECLARED_MODEL_RESTRICTION');
assert.equal(receipt.cases.A.classification, 'ASSUMPTION_CONDITIONED_PARTIAL_IDENTIFICATION');
assert.equal(receipt.cases.A.point_identified, false);
assert.equal(receipt.cases.A.new_observation_added, false);
assert.equal(receipt.cases.A.model_class_narrowed, true);
assert.equal(receipt.cases.A.excluded_route_empirically_disproved_by_Y, false);
assert.equal(receipt.cases.A.restriction.predeclared_before_target_evaluation, true);
assert.equal(receipt.cases.A.restriction.independent_empirical_support, false);

assert.deepEqual(receipt.cases.B.identified_set, ['R0', 'R2']);
assert.equal(receipt.cases.B.size, 2);
assert.equal(receipt.cases.B.contraction_source, 'OBSERVATION_EXPANSION');
assert.equal(receipt.cases.B.classification, 'OBSERVATION_CONDITIONED_PARTIAL_IDENTIFICATION');
assert.equal(receipt.cases.B.point_identified, false);
assert.equal(receipt.cases.B.new_observation_added, true);
assert.equal(receipt.cases.B.model_class_narrowed, false);
assert.equal(receipt.cases.B.conditional_independence_declared, true);

assert.deepEqual(receipt.cases.C.identified_set, ['R0']);
assert.equal(receipt.cases.C.size, 1);
assert.equal(receipt.cases.C.contraction_source, 'COMBINED_OBSERVATION_AND_PREDECLARED_RESTRICTION');
assert.equal(receipt.cases.C.classification, 'POINT_IDENTIFIED_WITHIN_DECLARED_OBSERVATION_AND_MODEL_SCOPE');
assert.equal(receipt.cases.C.point_identified, true);
assert.equal(receipt.cases.C.unconditional_point_identification, false);
assert.deepEqual(receipt.cases.C.observation_scope, ['Y', 'Z']);
assert.equal(receipt.cases.C.assumption_scope, 'H_PRE');
assert.match(receipt.cases.C.required_qualified_language, /inside the declared finite candidate family/);

assert.deepEqual(receipt.cases.D.arithmetic_intersection, ['R0']);
assert.deepEqual(receipt.cases.D.governed_identified_set, ['R0', 'R1', 'R2']);
assert.equal(receipt.cases.D.governed_size, 3);
assert.equal(receipt.cases.D.contraction_source, 'POSTHOC_RESTRICTION_REJECTED');
assert.equal(receipt.cases.D.classification, 'ASSUMPTION_LAUNDERING_REJECTED');
assert.equal(receipt.cases.D.point_identification_earned, false);
assert.equal(receipt.cases.D.posthoc_restriction_modified_governed_verdict, false);
assert.equal(receipt.cases.D.restriction.predeclared_before_target_evaluation, false);
assert.equal(receipt.cases.D.restriction.provenance_class, 'POSTHOC_TARGET_SELECTED_RESTRICTION');

assert.equal(receipt.monotonicity.nested_observation, true);
assert.equal(receipt.monotonicity.nested_model_restriction, true);
assert.equal(receipt.monotonicity.universal_monotonicity_claim, false);
assert.equal(receipt.identification_scope_required, true);
assert.equal(receipt.cardinality_alone_sufficient_for_provenance, false);
assert.equal(receipt.gauntlet_status, 'PARTIAL_IDENTIFICATION_CONTRACTION_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.equal(receipt.reusable_relation_status, 'RESEARCH_REFINEMENT_CANDIDATE_ONLY');
assert.match(receipt.reusable_relation, /observation scope \+ candidate model \+ assumption provenance/);
assert.equal(receipt.next_learning_action, 'TEST_IDENTIFICATION_UNDER_MODEL_MISSPECIFICATION_AND_HELDOUT_OBSERVATION');
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutated, false);
assert.equal(receipt.live_ash_binding, false);
assert.equal(receipt.human_closure_required, true);
assert.equal(receipt.claims.universal_partial_identification_theorem, false);
assert.equal(receipt.claims.causal_identification, false);
assert.equal(receipt.claims.live_td613_stochastic_behavior, false);
assert.equal(receipt.claims.connection, false);
assert.equal(receipt.claims.curvature, false);
assert.equal(receipt.claims.holonomy, false);
assert.equal(receipt.claims.berry_structure, false);
assert.equal(receipt.claims.quantum_behavior, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_PARTIAL_IDENTIFICATION_CONTRACTION_GAUNTLET_SPEC_V0_1.md', 'utf8');
assert.match(spec, /I_Y = \{R0,R1,R2\}/);
assert.match(spec, /I_\(Y,H_pre\)[\s\S]*\{R0,R1\}/);
assert.match(spec, /I_\(Y,Z\) = \{R0,R2\}/);
assert.match(spec, /POINT_IDENTIFIED_WITHIN_DECLARED_OBSERVATION_AND_MODEL_SCOPE/);
assert.match(spec, /ASSUMPTION_LAUNDERING_REJECTED/);
assert.match(spec, /cardinality/i);

console.log(JSON.stringify({
  ok: true,
  schema: receipt.schema,
  baseline: receipt.baseline.identified_set,
  case_a: receipt.cases.A.identified_set,
  case_b: receipt.cases.B.identified_set,
  case_c: receipt.cases.C.identified_set,
  case_d_governed: receipt.cases.D.governed_identified_set,
  case_d_arithmetic: receipt.cases.D.arithmetic_intersection,
  gauntlet_status: receipt.gauntlet_status,
  next_learning_action: receipt.next_learning_action,
  promotion_authority: receipt.promotion_authority
}, null, 2));
