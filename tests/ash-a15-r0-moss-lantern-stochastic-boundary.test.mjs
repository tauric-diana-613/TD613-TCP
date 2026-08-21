import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  compilePedagogueResearchTransferCard,
  hydratePedagogueResearch,
  reviewPedagogueResearchMechanism
} from '../app/engine/flowcore-pedagogue-core.js';
import { runMossLanternTemporalOrderAssay } from '../app/dome-world/previews/a15-r0/moss-lantern-temporal-order-assay.js';
import { compileMossLanternMl3PedagogueWitness } from '../app/dome-world/previews/a15-r0/moss-lantern-temporal-pedagogue-witness.js';
import {
  compileGivingPracticeOrderPedagogueWitness,
  runGivingPracticeIndependentOrderAssay,
  verifyGivingPracticeOrderSourceContract
} from '../app/dome-world/previews/a15-r0/giving-practice-independent-order-assay.js';
import { buildOrderIdentifiabilityRefinement } from '../app/dome-world/previews/a15-r0/order-identifiability-refinement.js';
import { runMossLanternAliasingDiscriminator } from '../app/dome-world/previews/a15-r0/moss-lantern-aliasing-discriminator.js';
import {
  MOSS_LANTERN_STOCHASTIC_BOUNDARY_SCHEMA,
  MOSS_LANTERN_STOCHASTIC_DISTRIBUTIONS,
  runMossLanternStochasticIdentifiabilityBoundary
} from '../app/dome-world/previews/a15-r0/moss-lantern-stochastic-identifiability-boundary.js';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const literature = ['a', 'b', 'c', 'd', 'e'].flatMap(part => JSON.parse(
  fs.readFileSync(`tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-${part}.json`, 'utf8')
).cards);
const hydration = hydratePedagogueResearch(literature.map(compilePedagogueResearchTransferCard));
const mossWitness = compileMossLanternMl3PedagogueWitness(runMossLanternTemporalOrderAssay(fixture));
const givingVerification = verifyGivingPracticeOrderSourceContract({
  contributorHandoffSource: fs.readFileSync('app/giving/history/giving-contributor-handoff.js', 'utf8'),
  directorySource: fs.readFileSync('app/giving/history/giving-practice-directory.js', 'utf8')
});
const givingWitness = compileGivingPracticeOrderPedagogueWitness(runGivingPracticeIndependentOrderAssay(givingVerification));
const review = reviewPedagogueResearchMechanism(hydration, [mossWitness, givingWitness], 'ORDER_IS_PART_OF_PROCESS_STATE');
const refinement = buildOrderIdentifiabilityRefinement({ hydration, mechanism_review: review });
const ml35 = runMossLanternAliasingDiscriminator({ fixture, refinement });
const assay = runMossLanternStochasticIdentifiabilityBoundary({ fixture, refinement, ml35 });

assert.equal(assay.schema, MOSS_LANTERN_STOCHASTIC_BOUNDARY_SCHEMA);
assert.equal(assay.source_status, 'SIMULATED');
assert.equal(assay.authority_class, 'A2_DERIVATIONAL');
assert.equal(assay.manifestly_fictional, true);
assert.equal(assay.prerequisite_epistemic_kind, 'OPERATIONAL_CRITERION');
assert.equal(assay.exited_formal_scope, 'FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL');
assert.equal(assay.stochastic_model_scope, 'FINITE_ROUTE_CONDITIONED_DISCRETE_OBSERVATION_DISTRIBUTIONS');
assert.equal(assay.observation_object, 'ROUTE_CONDITIONED_PROBABILITY_DISTRIBUTION');
assert.deepEqual([...assay.observation_alphabet], [0, 1]);
assert.deepEqual([...assay.declared_sample_budgets], [1, 3]);
assert.equal(assay.deterministic_point_signature_applicable, false);
assert.deepEqual(assay.route_conditioned_distributions, MOSS_LANTERN_STOCHASTIC_DISTRIBUTIONS);

assert.equal(assay.distinguishable_pair.n1.base_support_equal, true);
assert.equal(assay.distinguishable_pair.n1.base_distributions_equal, false);
assert.equal(assay.distinguishable_pair.n1.product_distribution_equal, false);
assert.equal(assay.distinguishable_pair.n1.total_variation, 0.8);
assert.equal(assay.distinguishable_pair.n1.equal_prior_bayes_optimal_error, 0.1);
assert.equal(assay.distinguishable_pair.n3.total_variation, 0.944);
assert.equal(assay.distinguishable_pair.n3.equal_prior_bayes_optimal_error, 0.028);
assert.ok(assay.distinguishable_pair.n3.equal_prior_bayes_optimal_error < assay.distinguishable_pair.n1.equal_prior_bayes_optimal_error);

assert.equal(assay.identical_distribution_null.n1.base_support_equal, true);
assert.equal(assay.identical_distribution_null.n1.base_distributions_equal, true);
assert.equal(assay.identical_distribution_null.n1.product_distribution_equal, true);
assert.equal(assay.identical_distribution_null.n1.total_variation, 0);
assert.equal(assay.identical_distribution_null.n1.equal_prior_bayes_optimal_error, 0.5);
assert.equal(assay.identical_distribution_null.n3.total_variation, 0);
assert.equal(assay.identical_distribution_null.n3.equal_prior_bayes_optimal_error, 0.5);

assert.equal(assay.diagnostics.total_variation_is_formal_diagnostic, true);
assert.equal(assay.diagnostics.equal_prior_bayes_error_identity_is_formal_diagnostic, true);
assert.equal(assay.diagnostics.empirical_discovery_claim, false);
assert.equal(assay.diagnostics.monte_carlo_used, false);
assert.equal(assay.diagnostics.finite_sequence_enumeration_exact, true);
assert.equal(assay.findings.same_support_can_hide_distributional_difference, true);
assert.equal(assay.findings.repeated_samples_improve_declared_pair_discrimination, true);
assert.equal(assay.findings.identical_distributions_remain_indistinguishable, true);
assert.equal(assay.findings.deterministic_criterion_scope_boundary_demonstrated, true);
assert.equal(assay.hypothesis_status.H_DETERMINISTIC_CRITERION_SCOPE_BOUNDARY, 'SCOPE_BOUNDARY_DEMONSTRATED_IN_BOUNDED_STOCHASTIC_FIXTURE');
assert.equal(assay.previous_criterion_scope_status, 'VALID_INSIDE_DECLARED_DETERMINISTIC_SCOPE');
assert.equal(assay.scope_boundary_status, 'DETERMINISTIC_POINT_SIGNATURE_GRAMMAR_INSUFFICIENT_FOR_STOCHASTIC_OBSERVATION_MODEL');
assert.equal(assay.next_learning_action, 'AUTHOR_STOCHASTIC_IDENTIFIABILITY_CRITERION_CANDIDATES');
assert.equal(assay.equivalence_posture.support_equality_is_not_distribution_equality, true);
assert.equal(assay.equivalence_posture.distribution_equality_is_explicit_null_equivalence, true);
assert.equal(assay.equivalence_posture.partial_or_probabilistic_identifiability_must_remain_distinct_from_exact_recovery, true);
assert.equal(assay.parent_mechanism_replaced, false);
assert.equal(assay.previous_operational_criterion_falsified_inside_scope, false);
assert.equal(assay.pedagogue_law_promoted, false);
assert.equal(assay.statistical_independence_claim, false);
assert.equal(assay.connection_declared, false);
assert.equal(assay.curvature_claim, false);
assert.equal(assay.holonomy_claim, false);
assert.equal(assay.quantum_behavior_claim, false);
assert.equal(assay.physical_realization_claim, false);
assert.equal(assay.promotion_authority, false);
assert.equal(assay.production_mutated, false);
assert.equal(assay.live_ash_binding, false);
assert.equal(assay.proto_loom_implementation, false);
assert.equal(assay.external_transmission, false);
assert.equal(assay.human_closure_required, true);
assert.match(assay.claim_ceiling, /does not establish a universal stochastic identifiability theorem/i);

assert.throws(() => runMossLanternStochasticIdentifiabilityBoundary({ fixture: {}, refinement, ml35 }), /canonical Moss Lantern/i);
assert.throws(() => runMossLanternStochasticIdentifiabilityBoundary({ fixture, refinement: {}, ml35 }), /governed Pedagogue order-identifiability refinement/i);
assert.throws(() => runMossLanternStochasticIdentifiabilityBoundary({ fixture, refinement, ml35: {} }), /governed ML3.5 alias-location instrument receipt/i);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_MOSS_LANTERN_ML3_6_STOCHASTIC_BOUNDARY_SPEC_V0_1.md', 'utf8');
assert.match(spec, /deterministic_point_signature_applicable = false/);
assert.match(spec, /TV_3 = 0\.944/);
assert.match(spec, /BayesError_3 = 0\.028/);
assert.match(spec, /AUTHOR_STOCHASTIC_IDENTIFIABILITY_CRITERION_CANDIDATES/);

console.log(JSON.stringify({
  ok: true,
  schema: assay.schema,
  stochastic_model_scope: assay.stochastic_model_scope,
  observation_object: assay.observation_object,
  distinguishable_tv_n1: assay.distinguishable_pair.n1.total_variation,
  distinguishable_bayes_error_n1: assay.distinguishable_pair.n1.equal_prior_bayes_optimal_error,
  distinguishable_tv_n3: assay.distinguishable_pair.n3.total_variation,
  distinguishable_bayes_error_n3: assay.distinguishable_pair.n3.equal_prior_bayes_optimal_error,
  null_tv_n1: assay.identical_distribution_null.n1.total_variation,
  null_bayes_error_n1: assay.identical_distribution_null.n1.equal_prior_bayes_optimal_error,
  scope_boundary_status: assay.scope_boundary_status,
  next_learning_action: assay.next_learning_action,
  previous_operational_criterion_falsified_inside_scope: assay.previous_operational_criterion_falsified_inside_scope,
  pedagogue_law_promoted: assay.pedagogue_law_promoted,
  promotion_authority: assay.promotion_authority
}, null, 2));
