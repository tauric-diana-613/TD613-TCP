import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PEDAGOGUE_RESEARCH_ASSAY_WITNESS_SCHEMA,
  PEDAGOGUE_RESEARCH_MECHANISM_REVIEW_SCHEMA,
  compilePedagogueResearchAssayWitness,
  compilePedagogueResearchTransferCard,
  hydratePedagogueResearch,
  reviewPedagogueResearchMechanism
} from '../app/engine/flowcore-pedagogue-core.js';
import { runMossLanternTemporalOrderAssay } from '../app/dome-world/previews/a15-r0/moss-lantern-temporal-order-assay.js';
import { compileMossLanternMl3PedagogueWitness } from '../app/dome-world/previews/a15-r0/moss-lantern-temporal-pedagogue-witness.js';

const fixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const literature = ['a', 'b', 'c'].flatMap(part => JSON.parse(
  fs.readFileSync(`tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-${part}.json`, 'utf8')
).cards);
const hydration = hydratePedagogueResearch(literature.map(compilePedagogueResearchTransferCard));
const assay = runMossLanternTemporalOrderAssay(fixture);
const witness = compileMossLanternMl3PedagogueWitness(assay);

assert.equal(witness.schema, PEDAGOGUE_RESEARCH_ASSAY_WITNESS_SCHEMA);
assert.equal(witness.mechanism_id, 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.equal(witness.outcome, 'SUPPORTED_BOUNDED');
assert.equal(witness.evidence_posture.internal_bounded_assay_witness, true);
assert.equal(witness.evidence_posture.assay_result_is_not_law, true);
assert.equal(witness.evidence_posture.source_authority_transferred, false);
assert.equal(witness.authority.promotion_authority, false);
assert.equal(witness.authority.product_mutation_authorized, false);
assert.equal(witness.authority.production_mutation_authorized, false);
assert.equal(witness.authority.human_closure_required, true);

const review = reviewPedagogueResearchMechanism(hydration, [witness], 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.equal(review.schema, PEDAGOGUE_RESEARCH_MECHANISM_REVIEW_SCHEMA);
assert.equal(review.external_research_status, 'CROSS_DOMAIN_REVIEW_CANDIDATE');
assert.equal(review.external_cross_domain_witness, true);
assert.equal(review.external_unique_source_count, 5);
assert.equal(review.external_domain_family_count, 4);
assert.equal(review.internal_assay_witness_count, 1);
assert.equal(review.internal_supported_bounded_count, 1);
assert.equal(review.internal_counterexampled_bounded_count, 0);
assert.equal(review.internal_inconclusive_count, 0);
assert.equal(review.learning_state, 'CROSS_DOMAIN_PLUS_INTERNAL_BOUNDED_ASSAY_WITNESS');
assert.equal(review.next_learning_action, 'SEEK_INDEPENDENT_CONTEXT_AND_ADVERSARIAL_COUNTEREXAMPLE');
assert.equal(review.pedagogue_law_status, 'NOT_PROMOTED');
assert.equal(review.relation_identity_claim, false);
assert.equal(review.universal_equivalence_claim, false);
assert.equal(review.automatic_confidence_aggregation, false);
assert.equal(review.promotion_authority, false);
assert.equal(review.production_mutation_authorized, false);
assert.equal(review.human_closure_required, true);

const counterexample = compilePedagogueResearchAssayWitness({
  witness_id: 'synthetic.counterexample.order/v0.1',
  mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
  assay_reference: 'independently authored commuting/order-erasing control family',
  assay_schema: 'td613.test.counterexample/v0.1',
  assay_source_status: 'SIMULATED',
  outcome: 'COUNTEREXAMPLED_BOUNDED',
  declared_controls: ['same latent route family'],
  observations: ['order-aware and order-blind observers tie under this authored control'],
  falsifier_outcome: 'The broad relation fails if stated without an order-sensitive forward-process condition.',
  alternative_explanations_remaining: ['The counterexample targets the broad relation, not the conditional relation.'],
  claim_ceiling: 'TEST_ONLY_BOUNDED_COUNTEREXAMPLE'
});
const mixed = reviewPedagogueResearchMechanism(
  hydration,
  [witness, counterexample],
  'ORDER_IS_PART_OF_PROCESS_STATE'
);
assert.equal(mixed.learning_state, 'CROSS_DOMAIN_WITH_MIXED_INTERNAL_ASSAYS');
assert.equal(mixed.internal_supported_bounded_count, 1);
assert.equal(mixed.internal_counterexampled_bounded_count, 1);
assert.equal(mixed.next_learning_action, 'DESIGN_DISCRIMINATING_ASSAY');
assert.equal(mixed.automatic_confidence_aggregation, false);
assert.equal(mixed.pedagogue_law_status, 'NOT_PROMOTED');
assert.equal(mixed.promotion_authority, false);

assert.throws(() => compilePedagogueResearchAssayWitness({
  witness_id: 'bad',
  mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
  assay_reference: 'bad',
  assay_schema: 'bad',
  assay_source_status: 'SIMULATED',
  outcome: 'PROVEN',
  declared_controls: ['x'],
  observations: ['x'],
  falsifier_outcome: 'x',
  alternative_explanations_remaining: ['x'],
  claim_ceiling: 'x'
}), /unsupported Pedagogue research assay outcome/i);

assert.throws(() => reviewPedagogueResearchMechanism(
  hydration,
  [witness, { ...witness, witness_id: 'other', mechanism_id: 'VISIBILITY_NOT_IDENTIFIABILITY' }],
  'ORDER_IS_PART_OF_PROCESS_STATE'
), /may not mix assay witnesses/i);

assert.throws(() => reviewPedagogueResearchMechanism(
  hydration,
  [witness, witness],
  'ORDER_IS_PART_OF_PROCESS_STATE'
), /witness_id values must be unique/i);

console.log(JSON.stringify({
  ok: true,
  witness_schema: witness.schema,
  mechanism_id: review.mechanism_id,
  external_status: review.external_research_status,
  internal_assay_witness_count: review.internal_assay_witness_count,
  learning_state: review.learning_state,
  next_learning_action: review.next_learning_action,
  mixed_state: mixed.learning_state,
  mixed_next_action: mixed.next_learning_action,
  pedagogue_law_status: review.pedagogue_law_status,
  promotion_authority: review.promotion_authority
}, null, 2));
