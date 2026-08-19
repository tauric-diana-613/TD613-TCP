import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_RESEARCH_CRITERION_FAMILY_SCHEMA,
  PEDAGOGUE_RESEARCH_CRITERION_ROLES,
  compilePedagogueResearchCriterionFamily
} from '../app/engine/flowcore-pedagogue-core.js';
import {
  STOCHASTIC_CRITERION_HOSTILE_ASSAY_SCHEMA,
  buildStochasticIdentifiabilityCriterionFamily,
  runStochasticCriterionFamilyHostileAssay
} from '../app/dome-world/previews/a15-r0/stochastic-identifiability-criterion-family.js';

const family = buildStochasticIdentifiabilityCriterionFamily();
assert.equal(family.schema, PEDAGOGUE_RESEARCH_CRITERION_FAMILY_SCHEMA);
assert.deepEqual([...family.roles_present], [...PEDAGOGUE_RESEARCH_CRITERION_ROLES].sort());
assert.equal(family.arithmetic_authority, false);
assert.equal(family.metric_crowning_authority, false);
assert.equal(family.empirical_confirmation_authority, false);
assert.equal(family.authority.pedagogue_law_promoted, false);
assert.equal(family.authority.promotion_authority, false);
assert.equal(family.authority.production_mutation_authorized, false);
assert.equal(family.authority.human_closure_required, true);

const members = Object.fromEntries(family.members.map(member => [member.criterion_id, member]));
assert.equal(members.STOCHASTIC_OBSERVATIONAL_EQUIVALENCE_BY_DISTRIBUTION.role, 'POPULATION_EQUIVALENCE');
assert.equal(members.STOCHASTIC_OBSERVATIONAL_EQUIVALENCE_BY_DISTRIBUTION.epistemic_kind, 'OPERATIONAL_CRITERION');
assert.equal(members.STOCHASTIC_BAYES_DECISION_RECOVERABILITY_AT_BUDGET.role, 'FINITE_BUDGET_DECISION');
assert.equal(members.TOTAL_VARIATION_PAIRWISE_DIAGNOSTIC.role, 'FORMAL_DIAGNOSTIC');
assert.equal(members.TOTAL_VARIATION_PAIRWISE_DIAGNOSTIC.epistemic_kind, 'FORMAL_IDENTITY');
assert.equal(members.EQUAL_PRIOR_BINARY_BAYES_ERROR_DIAGNOSTIC.epistemic_kind, 'FORMAL_IDENTITY');
assert.equal(members.HELDOUT_STOCHASTIC_DECODER_RECOVERABILITY.role, 'EMPIRICAL_VALIDATION');
assert.equal(members.HELDOUT_STOCHASTIC_DECODER_RECOVERABILITY.epistemic_kind, 'DESIGN_HEURISTIC');

const assay = runStochasticCriterionFamilyHostileAssay();
assert.equal(assay.schema, STOCHASTIC_CRITERION_HOSTILE_ASSAY_SCHEMA);
assert.equal(assay.source_status, 'SIMULATED');
assert.equal(assay.authority_class, 'A2_DERIVATIONAL');
assert.equal(assay.manifestly_fictional, true);
assert.equal(assay.criterion_family_status, 'CRITERION_FAMILY_SEPARATION_VALIDATED_IN_HOSTILE_FIXTURE');

assert.deepEqual(assay.cases.A.population_equivalence_classes, [['A0'], ['A1']]);
assert.equal(assay.cases.A.sample_budget, 1);
assert.equal(assay.cases.A.support_equal, true);
assert.equal(assay.cases.A.distributions_equal, false);
assert.equal(assay.cases.A.total_variation, 0.2);
assert.equal(assay.cases.A.bayes_error, 0.4);

assert.deepEqual(assay.cases.B.population_equivalence_classes, [['A0'], ['A1']]);
assert.equal(assay.cases.B.sample_budget, 3);
assert.equal(assay.cases.B.total_variation, 0.296);
assert.equal(assay.cases.B.bayes_error, 0.352);
assert.ok(assay.cases.B.bayes_error < assay.cases.A.bayes_error);
assert.deepEqual(assay.cases.B.population_equivalence_classes, assay.cases.A.population_equivalence_classes);

assert.deepEqual(assay.cases.C.population_equivalence_classes, [['C0', 'C1']]);
assert.equal(assay.cases.C.n1.total_variation, 0);
assert.equal(assay.cases.C.n1.bayes_error, 0.5);
assert.equal(assay.cases.C.n3.total_variation, 0);
assert.equal(assay.cases.C.n3.bayes_error, 0.5);

assert.deepEqual(assay.cases.D.population_equivalence_classes, [['D0'], ['D1'], ['D2']]);
assert.equal(assay.cases.D.pairwise_diagnostics.length, 3);
for (const pair of assay.cases.D.pairwise_diagnostics) {
  assert.equal(pair.total_variation, 0.7);
  assert.equal(pair.equal_prior_binary_bayes_error, 0.15);
}
assert.equal(assay.cases.D.binary_pairwise_diagnostic_as_multiclass_criterion, 'NOT_APPLICABLE');
assert.equal(assay.cases.D.multiclass_bayes_accuracy, 0.8);
assert.equal(assay.cases.D.multiclass_bayes_error, 0.2);

assert.equal(assay.empirical_validation_status, 'UNEXECUTED_EMPIRICAL_VALIDATION');
assert.equal(assay.formal_enumeration_relabelled_as_empirical, false);
assert.equal(assay.population_equivalence_depends_on_sample_budget, false);
assert.equal(assay.promotion_authority, false);
assert.equal(assay.production_mutated, false);
assert.equal(assay.live_ash_binding, false);
assert.equal(assay.human_closure_required, true);
assert.equal(assay.claims.universal_stochastic_identifiability_theorem, false);
assert.equal(assay.claims.privileged_divergence, false);
assert.equal(assay.claims.connection, false);
assert.equal(assay.claims.curvature, false);
assert.equal(assay.claims.holonomy, false);
assert.equal(assay.claims.berry_structure, false);
assert.equal(assay.claims.quantum_behavior, false);
assert.equal(assay.claims.proto_loom, false);
assert.equal(assay.claims.production_authority, false);
assert.match(assay.claim_ceiling, /does not establish a universal stochastic identifiability theorem/i);

const invalidRoleKind = structuredClone({
  family_id: family.family_id,
  research_question: family.research_question,
  parent_scope_boundary_reference: family.parent_scope_boundary_reference,
  model_class: family.model_class,
  observation_object: family.observation_object,
  equivalence_relation: family.equivalence_relation,
  members: family.members.map(member => ({ ...member })),
  forbidden_collapses: [...family.forbidden_collapses],
  claim_ceiling: family.claim_ceiling,
  next_learning_action: family.next_learning_action
});
invalidRoleKind.members.find(member => member.role === 'FORMAL_DIAGNOSTIC').epistemic_kind = 'EMPIRICAL_RELATION';
assert.throws(() => compilePedagogueResearchCriterionFamily(invalidRoleKind), /FORMAL_DIAGNOSTIC may not be compiled as EMPIRICAL_RELATION/);

const missingRole = structuredClone(invalidRoleKind);
missingRole.members = family.members.filter(member => member.role !== 'EMPIRICAL_VALIDATION').map(member => ({ ...member }));
assert.throws(() => compilePedagogueResearchCriterionFamily(missingRole), /missing required role EMPIRICAL_VALIDATION/);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_STOCHASTIC_CRITERION_FAMILY_HOSTILE_ASSAY_SPEC_V0_1.md', 'utf8');
assert.match(spec, /TV\(A0\^3,A1\^3\) = 0\.296/);
assert.match(spec, /equal-prior binary Bayes error = 0\.15/);
assert.match(spec, /multiclass Bayes error = 0\.2/);
assert.match(spec, /UNEXECUTED_EMPIRICAL_VALIDATION/);

console.log(JSON.stringify({
  ok: true,
  schema: assay.schema,
  family_schema: family.schema,
  case_a_bayes_error: assay.cases.A.bayes_error,
  case_b_bayes_error: assay.cases.B.bayes_error,
  case_c_equivalence_classes: assay.cases.C.population_equivalence_classes,
  case_d_pairwise_bayes_error: assay.cases.D.pairwise_diagnostics[0].equal_prior_binary_bayes_error,
  case_d_multiclass_bayes_error: assay.cases.D.multiclass_bayes_error,
  empirical_validation_status: assay.empirical_validation_status,
  criterion_family_status: assay.criterion_family_status,
  next_learning_action: assay.next_learning_action,
  promotion_authority: assay.promotion_authority
}, null, 2));
