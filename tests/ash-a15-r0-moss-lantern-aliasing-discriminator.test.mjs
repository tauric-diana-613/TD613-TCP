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
import {
  MOSS_LANTERN_ALIASING_DISCRIMINATOR_SCHEMA,
  runMossLanternAliasingDiscriminator
} from '../app/dome-world/previews/a15-r0/moss-lantern-aliasing-discriminator.js';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const literature = ['a', 'b', 'c', 'd'].flatMap(part => JSON.parse(
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

const assay = runMossLanternAliasingDiscriminator({ fixture, refinement });
assert.equal(assay.schema, MOSS_LANTERN_ALIASING_DISCRIMINATOR_SCHEMA);
assert.equal(assay.source_status, 'SIMULATED');
assert.equal(assay.authority_class, 'A2_DERIVATIONAL');
assert.equal(assay.manifestly_fictional, true);
assert.equal(assay.epistemic_kind, 'OPERATIONAL_CRITERION');
assert.equal(assay.formal_scope, 'FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL');
assert.equal(assay.criterion_empirical_truth_claim, false);
assert.equal(assay.criterion_empirically_discovered, false);
assert.equal(assay.latent_route_count, 24);
assert.equal(assay.observation_aperture_factor.rich, 'O_rich([u,v])=[u,v]');
assert.equal(assay.observation_aperture_factor.lossy, 'O_drop_v([u,v])=[u]');
assert.equal(assay.observation_aperture_factor.lossy_aperture_predeclared_in_spec, true);
assert.equal(assay.observation_aperture_factor.lossy_aperture_changed_after_results, false);

const A = assay.conditions.A_SEPARATING_RICH;
const B = assay.conditions.B_SEPARATING_DROP_V;
const C = assay.conditions.C_ERASING_RICH;
const D = assay.conditions.D_ERASING_DROP_V;
assert.deepEqual(A, {
  latent_route_count: 24,
  forward_unique_terminal_state_count: 24,
  observed_unique_signature_count: 24,
  forward_alias_deficit: 0,
  observation_alias_deficit: 0,
  exact_unique_route_recovery_rate: 1,
  mean_candidate_set_size: 1,
  maximum_candidate_set_size: 1,
  classification: 'SEPARATED'
});
assert.equal(B.forward_unique_terminal_state_count, 24);
assert.equal(B.observed_unique_signature_count, 18);
assert.equal(B.forward_alias_deficit, 0);
assert.equal(B.observation_alias_deficit, 6);
assert.equal(B.exact_unique_route_recovery_rate, 0.5);
assert.equal(B.mean_candidate_set_size, 1.5);
assert.equal(B.maximum_candidate_set_size, 2);
assert.equal(B.classification, 'OBSERVATIONAL_ALIASING');
assert.equal(C.forward_unique_terminal_state_count, 1);
assert.equal(C.observed_unique_signature_count, 1);
assert.equal(C.forward_alias_deficit, 23);
assert.equal(C.observation_alias_deficit, 0);
assert.equal(C.exact_unique_route_recovery_rate, 0);
assert.equal(C.mean_candidate_set_size, 24);
assert.equal(C.maximum_candidate_set_size, 24);
assert.equal(C.classification, 'DYNAMIC_ALIASING');
assert.deepEqual(D, C);

assert.equal(assay.findings.rich_aperture_preserves_separating_dynamics, true);
assert.equal(assay.findings.coordinate_ablation_creates_observational_aliasing, true);
assert.equal(assay.findings.commuting_forward_process_creates_dynamic_aliasing, true);
assert.equal(assay.findings.alias_location_instrument_validated, true);
assert.equal(assay.hypothesis_status.H_ALIAS_LOCATION_DISCRIMINATOR, 'INSTRUMENT_VALIDATED_IN_BOUNDED_FACTORIAL_FIXTURE');
assert.equal(assay.refinement_evaluation, 'INSTRUMENTATION_VALIDATED_FOR_OPERATIONAL_CRITERION');
assert.equal(assay.next_learning_action, 'TEST_SCOPE_BOUNDARY_OUTSIDE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL');
assert.equal(assay.observation_aperture.authority_effect, 'NONE');
assert.equal(assay.observation_aperture.practice_mode, true);
assert.ok(Object.values(assay.observer_firewall).every(value => value === false));
assert.equal(assay.parent_mechanism_replaced, false);
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
assert.match(assay.claim_ceiling, /criterion is not empirically discovered/i);

assert.throws(() => runMossLanternAliasingDiscriminator({ fixture: {}, refinement }), /canonical Moss Lantern/i);
assert.throws(() => runMossLanternAliasingDiscriminator({ fixture, refinement: {} }), /governed Pedagogue mechanism refinement/i);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/ASH_KEEP_A15_R0_MOSS_LANTERN_ML3_5_ALIASING_DISCRIMINATOR_SPEC_V0_1.md', 'utf8');
assert.match(spec, /O_drop_v\(\[u,v\]\) = \[u\]/);
assert.match(spec, /may not switch to `v`, parity, buckets, or another projection/i);
const epistemicSpec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_REFINEMENT_EPISTEMIC_KIND_SPEC_V0_1.md', 'utf8');
assert.match(epistemicSpec, /INSTRUMENTATION_VALIDATED_FOR_OPERATIONAL_CRITERION/);

console.log(JSON.stringify({
  ok: true,
  schema: assay.schema,
  epistemic_kind: assay.epistemic_kind,
  formal_scope: assay.formal_scope,
  criterion_empirically_discovered: assay.criterion_empirically_discovered,
  A_forward_states: A.forward_unique_terminal_state_count,
  A_observed_signatures: A.observed_unique_signature_count,
  A_classification: A.classification,
  B_forward_states: B.forward_unique_terminal_state_count,
  B_observed_signatures: B.observed_unique_signature_count,
  B_observation_alias_deficit: B.observation_alias_deficit,
  B_exact_unique_route_recovery_rate: B.exact_unique_route_recovery_rate,
  B_classification: B.classification,
  C_forward_states: C.forward_unique_terminal_state_count,
  C_forward_alias_deficit: C.forward_alias_deficit,
  C_classification: C.classification,
  D_classification: D.classification,
  instrument_status: assay.hypothesis_status.H_ALIAS_LOCATION_DISCRIMINATOR,
  refinement_evaluation: assay.refinement_evaluation,
  next_learning_action: assay.next_learning_action,
  pedagogue_law_promoted: assay.pedagogue_law_promoted,
  promotion_authority: assay.promotion_authority
}, null, 2));
