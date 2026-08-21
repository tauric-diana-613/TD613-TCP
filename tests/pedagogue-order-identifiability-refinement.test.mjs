import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_RESEARCH_MECHANISM_REFINEMENT_SCHEMA,
  PEDAGOGUE_RESEARCH_REFINEMENT_EPISTEMIC_KINDS,
  compilePedagogueResearchMechanismRefinement,
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
import {
  ORDER_IDENTIFIABILITY_CANDIDATE_MECHANISM,
  ORDER_IDENTIFIABILITY_REFINEMENT_ID,
  buildOrderIdentifiabilityRefinement
} from '../app/dome-world/previews/a15-r0/order-identifiability-refinement.js';

const literature = ['a', 'b', 'c', 'd'].flatMap(part => JSON.parse(
  fs.readFileSync(`tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-${part}.json`, 'utf8')
).cards);
const hydration = hydratePedagogueResearch(literature.map(compilePedagogueResearchTransferCard));
const mossFixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const mossWitness = compileMossLanternMl3PedagogueWitness(runMossLanternTemporalOrderAssay(mossFixture));
const givingVerification = verifyGivingPracticeOrderSourceContract({
  contributorHandoffSource: fs.readFileSync('app/giving/history/giving-contributor-handoff.js', 'utf8'),
  directorySource: fs.readFileSync('app/giving/history/giving-practice-directory.js', 'utf8')
});
const givingWitness = compileGivingPracticeOrderPedagogueWitness(runGivingPracticeIndependentOrderAssay(givingVerification));
const review = reviewPedagogueResearchMechanism(hydration, [mossWitness, givingWitness], 'ORDER_IS_PART_OF_PROCESS_STATE');

assert.deepEqual([...PEDAGOGUE_RESEARCH_REFINEMENT_EPISTEMIC_KINDS], [
  'EMPIRICAL_RELATION',
  'OPERATIONAL_CRITERION',
  'FORMAL_IDENTITY',
  'DESIGN_HEURISTIC'
]);

const refinement = buildOrderIdentifiabilityRefinement({ hydration, mechanism_review: review });
assert.equal(refinement.schema, PEDAGOGUE_RESEARCH_MECHANISM_REFINEMENT_SCHEMA);
assert.equal(refinement.proposal_id, ORDER_IDENTIFIABILITY_REFINEMENT_ID);
assert.equal(refinement.parent_mechanism_id, 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.equal(refinement.candidate_mechanism_id, ORDER_IDENTIFIABILITY_CANDIDATE_MECHANISM);
assert.equal(refinement.proposal_posture, 'PROPOSED_FROM_MULTI_CONTEXT_INTERNAL_ASSAYS');
assert.equal(refinement.refinement_status, 'MULTI_CONTEXT_MOTIVATED_OPERATIONAL_CRITERION');
assert.equal(refinement.epistemic_kind, 'OPERATIONAL_CRITERION');
assert.equal(refinement.formal_scope, 'FINITE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL');
assert.equal(refinement.empirical_truth_claim, false);
assert.equal(refinement.instrumentation_validation_applicable, true);
assert.equal(refinement.boundary_testing_required, true);
assert.equal(refinement.supporting_witness_count, 2);
assert.equal(refinement.distinct_context_family_count, 2);
assert.equal(refinement.supported_bounded_count, 2);
assert.equal(refinement.counterexampled_bounded_count, 0);
assert.deepEqual([...refinement.supporting_context_families], ['ASH_CALIBRATION', 'GIVING_PRACTICE']);
assert.ok(refinement.failure_modes.some(item => item.startsWith('DYNAMIC_ALIASING:')));
assert.ok(refinement.failure_modes.some(item => item.startsWith('OBSERVATIONAL_ALIASING:')));
assert.match(refinement.operational_definition, /S\(r\)=O\(F_r\(x0\)\)/);
assert.match(refinement.operational_definition, /injective/i);
assert.equal(refinement.next_learning_action, 'RUN_DISCRIMINATING_APERTURE_ASSAY');
assert.equal(refinement.evidence_posture.internal_multi_context_assay_derived, true);
assert.equal(refinement.evidence_posture.context_family_distinctness_only, true);
assert.equal(refinement.evidence_posture.statistical_independence_claim, false);
assert.equal(refinement.evidence_posture.parent_mechanism_revalidated, false);
assert.equal(refinement.evidence_posture.candidate_mechanism_is_law, false);
assert.equal(refinement.evidence_posture.empirical_discovery_claim, false);
assert.equal(refinement.authority.parent_mechanism_replaced, false);
assert.equal(refinement.authority.pedagogue_law_promoted, false);
assert.equal(refinement.authority.automatic_confidence_aggregation, false);
assert.equal(refinement.authority.automatic_redesign, false);
assert.equal(refinement.authority.product_mutation_authorized, false);
assert.equal(refinement.authority.production_mutation_authorized, false);
assert.equal(refinement.authority.external_transmission_authorized, false);
assert.equal(refinement.authority.human_closure_required, true);
assert.match(refinement.claim_ceiling, /not an empirically discovered law/i);
assert.match(refinement.finding, /operational identifiability criterion/i);

const oneContextReview = reviewPedagogueResearchMechanism(hydration, [mossWitness], 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.throws(() => buildOrderIdentifiabilityRefinement({ hydration, mechanism_review: oneContextReview }), /requires both ASH_CALIBRATION and GIVING_PRACTICE/i);

const proposalBase = {
  proposal_id: 'test.refinement/v0.1',
  parent_mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
  candidate_mechanism_id: 'ORDER_REQUIRES_SOMETHING_NARROWER',
  epistemic_kind: 'OPERATIONAL_CRITERION',
  formal_scope: 'FINITE_TEST_SCOPE',
  empirical_truth_claim: false,
  instrumentation_validation_applicable: true,
  boundary_testing_required: true,
  operational_definition: 'test',
  scope_conditions: ['x'],
  failure_modes: ['x'],
  supporting_witness_ids: [mossWitness.witness_id, givingWitness.witness_id],
  supporting_context_families: ['ASH_CALIBRATION', 'GIVING_PRACTICE'],
  discriminating_assays: ['x'],
  counterexample_conditions: ['x'],
  alternative_explanations_remaining: ['x'],
  claim_ceiling: 'x'
};

assert.throws(() => compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: review,
  proposal: { ...proposalBase, candidate_mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE' }
}), /distinct from the parent mechanism/i);
assert.throws(() => compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: review,
  proposal: { ...proposalBase, epistemic_kind: 'SCIENTIFIC_TRUTH' }
}), /unsupported Pedagogue refinement epistemic kind/i);
assert.throws(() => compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: review,
  proposal: { ...proposalBase, empirical_truth_claim: true }
}), /may not declare an empirical truth claim/i);
assert.throws(() => compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: review,
  proposal: { ...proposalBase, supporting_witness_ids: [mossWitness.witness_id], supporting_context_families: ['ASH_CALIBRATION'] }
}), /at least two bounded internal assay witnesses/i);

const epistemicSpec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_REFINEMENT_EPISTEMIC_KIND_SPEC_V0_1.md', 'utf8');
assert.match(epistemicSpec, /OPERATIONAL_CRITERION/);
assert.match(epistemicSpec, /criterion_empirically_discovered = false/);
assert.match(epistemicSpec, /TEST_SCOPE_BOUNDARY_OUTSIDE_DETERMINISTIC_TERMINAL_SIGNATURE_MODEL/);

console.log(JSON.stringify({
  ok: true,
  schema: refinement.schema,
  epistemic_kind: refinement.epistemic_kind,
  formal_scope: refinement.formal_scope,
  empirical_truth_claim: refinement.empirical_truth_claim,
  refinement_status: refinement.refinement_status,
  next_learning_action: refinement.next_learning_action,
  parent_mechanism_replaced: refinement.authority.parent_mechanism_replaced,
  pedagogue_law_promoted: refinement.authority.pedagogue_law_promoted
}, null, 2));
