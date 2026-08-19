import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_RESEARCH_MECHANISM_REFINEMENT_SCHEMA,
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

const literature = ['a', 'b', 'c'].flatMap(part => JSON.parse(
  fs.readFileSync(`tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-${part}.json`, 'utf8')
).cards);
const hydration = hydratePedagogueResearch(literature.map(compilePedagogueResearchTransferCard));

const mossFixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const mossWitness = compileMossLanternMl3PedagogueWitness(runMossLanternTemporalOrderAssay(mossFixture));
const givingVerification = verifyGivingPracticeOrderSourceContract({
  contributorHandoffSource: fs.readFileSync('app/giving/history/giving-contributor-handoff.js', 'utf8'),
  directorySource: fs.readFileSync('app/giving/history/giving-practice-directory.js', 'utf8')
});
const givingWitness = compileGivingPracticeOrderPedagogueWitness(
  runGivingPracticeIndependentOrderAssay(givingVerification)
);
const review = reviewPedagogueResearchMechanism(
  hydration,
  [mossWitness, givingWitness],
  'ORDER_IS_PART_OF_PROCESS_STATE'
);

const refinement = buildOrderIdentifiabilityRefinement({ hydration, mechanism_review: review });
assert.equal(refinement.schema, PEDAGOGUE_RESEARCH_MECHANISM_REFINEMENT_SCHEMA);
assert.equal(refinement.proposal_id, ORDER_IDENTIFIABILITY_REFINEMENT_ID);
assert.equal(refinement.parent_mechanism_id, 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.equal(refinement.candidate_mechanism_id, ORDER_IDENTIFIABILITY_CANDIDATE_MECHANISM);
assert.equal(refinement.proposal_posture, 'PROPOSED_FROM_MULTI_CONTEXT_INTERNAL_ASSAYS');
assert.equal(refinement.refinement_status, 'INTERNALLY_SUPPORTED_REFINEMENT_CANDIDATE');
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
assert.equal(refinement.authority.parent_mechanism_replaced, false);
assert.equal(refinement.authority.pedagogue_law_promoted, false);
assert.equal(refinement.authority.automatic_confidence_aggregation, false);
assert.equal(refinement.authority.automatic_redesign, false);
assert.equal(refinement.authority.product_mutation_authorized, false);
assert.equal(refinement.authority.production_mutation_authorized, false);
assert.equal(refinement.authority.external_transmission_authorized, false);
assert.equal(refinement.authority.human_closure_required, true);
assert.match(refinement.claim_ceiling, /does not establish a universal law/i);

const oneContextReview = reviewPedagogueResearchMechanism(
  hydration,
  [mossWitness],
  'ORDER_IS_PART_OF_PROCESS_STATE'
);
assert.throws(() => buildOrderIdentifiabilityRefinement({ hydration, mechanism_review: oneContextReview }), /requires both ASH_CALIBRATION and GIVING_PRACTICE/i);

assert.throws(() => compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: review,
  proposal: {
    proposal_id: 'bad.same-parent/v0.1',
    parent_mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
    candidate_mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
    operational_definition: 'bad',
    scope_conditions: ['x'],
    failure_modes: ['x'],
    supporting_witness_ids: [mossWitness.witness_id, givingWitness.witness_id],
    supporting_context_families: ['ASH_CALIBRATION', 'GIVING_PRACTICE'],
    discriminating_assays: ['x'],
    counterexample_conditions: ['x'],
    alternative_explanations_remaining: ['x'],
    claim_ceiling: 'x'
  }
}), /distinct from the parent mechanism/i);

assert.throws(() => compilePedagogueResearchMechanismRefinement({
  hydration,
  mechanism_review: review,
  proposal: {
    proposal_id: 'bad.one-context/v0.1',
    parent_mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
    candidate_mechanism_id: 'ORDER_REQUIRES_SOMETHING_NARROWER',
    operational_definition: 'bad',
    scope_conditions: ['x'],
    failure_modes: ['x'],
    supporting_witness_ids: [mossWitness.witness_id],
    supporting_context_families: ['ASH_CALIBRATION'],
    discriminating_assays: ['x'],
    counterexample_conditions: ['x'],
    alternative_explanations_remaining: ['x'],
    claim_ceiling: 'x'
  }
}), /at least two bounded internal assay witnesses/i);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/PEDAGOGUE_ORDER_IDENTIFIABILITY_REFINEMENT_SPEC_V0_1.md', 'utf8');
assert.match(spec, /Dynamic aliasing/i);
assert.match(spec, /Observational aliasing/i);
assert.match(spec, /parent_mechanism_replaced = false/i);
assert.match(spec, /2×2 discriminator/i);

console.log(JSON.stringify({
  ok: true,
  schema: refinement.schema,
  parent_mechanism_id: refinement.parent_mechanism_id,
  candidate_mechanism_id: refinement.candidate_mechanism_id,
  proposal_posture: refinement.proposal_posture,
  refinement_status: refinement.refinement_status,
  supporting_witness_count: refinement.supporting_witness_count,
  distinct_context_family_count: refinement.distinct_context_family_count,
  failure_mode_count: refinement.failure_modes.length,
  next_learning_action: refinement.next_learning_action,
  parent_mechanism_replaced: refinement.authority.parent_mechanism_replaced,
  pedagogue_law_promoted: refinement.authority.pedagogue_law_promoted,
  promotion_authority: refinement.authority.production_mutation_authorized
}, null, 2));
