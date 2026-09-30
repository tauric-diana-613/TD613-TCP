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
  GIVING_PRACTICE_INDEPENDENT_ORDER_SCHEMA,
  compileGivingPracticeOrderPedagogueWitness,
  runGivingPracticeIndependentOrderAssay,
  verifyGivingPracticeOrderSourceContract
} from '../app/dome-world/previews/a15-r0/giving-practice-independent-order-assay.js';

const contributorHandoffSource = fs.readFileSync('app/giving/history/giving-contributor-handoff.js', 'utf8');
const directorySource = fs.readFileSync('app/giving/history/giving-practice-directory.js', 'utf8');
const sourceVerification = verifyGivingPracticeOrderSourceContract({ contributorHandoffSource, directorySource });

assert.equal(sourceVerification.verified, true);
assert.equal(sourceVerification.production_behavior_mutated, false);
assert.equal(sourceVerification.browser_runtime_executed, false);
assert.equal(sourceVerification.real_retrieval_executed, false);
assert.ok(Object.values(sourceVerification.checks).every(Boolean));

const assay = runGivingPracticeIndependentOrderAssay(sourceVerification);
assert.equal(assay.schema, GIVING_PRACTICE_INDEPENDENT_ORDER_SCHEMA);
assert.equal(assay.source_status, 'SOURCE_CONTRACT_DERIVED_SIMULATION');
assert.equal(assay.context_family, 'GIVING_PRACTICE');
assert.equal(assay.source_contract_verified, true);
assert.equal(assay.latent_route_count, 2);
assert.equal(assay.positive_unique_terminal_witness_count, 2);
assert.equal(assay.null_unique_terminal_witness_count, 1);
assert.equal(assay.same_operation_multiset, true);
assert.equal(assay.same_coarse_endpoint, true);
assert.equal(assay.coarse_endpoint, 'INDIVIDUAL_CONTRIBUTOR_PREPARED');
assert.equal(assay.real_retrieval_executed, false);
assert.equal(assay.giving_runtime_executed, false);
assert.equal(assay.giving_runtime_mutated, false);
assert.equal(assay.production_mutated, false);
assert.equal(assay.browser_evidence_claim, false);
assert.equal(assay.promotion_authority, false);
assert.equal(assay.findings.positive_order_distinguishable, true);
assert.equal(assay.findings.matched_null_erases_order, true);
assert.equal(assay.findings.assay_mechanism_validated, true);
assert.equal(assay.hypothesis_status.H_GIVING_PRACTICE_ORDER_CONTEXT, 'SUPPORTED_IN_BOUNDED_SOURCE_CONTRACT_DERIVED_FIXTURE');
assert.deepEqual(assay.positive_terminal_states, [
  {
    prepared: true,
    search_started_on_prepared_route: true,
    coarse_endpoint: 'INDIVIDUAL_CONTRIBUTOR_PREPARED'
  },
  {
    prepared: true,
    search_started_on_prepared_route: false,
    coarse_endpoint: 'INDIVIDUAL_CONTRIBUTOR_PREPARED'
  }
]);
assert.deepEqual(assay.null_terminal_states, [
  {
    prepared: true,
    search_started_on_prepared_route: true,
    coarse_endpoint: 'INDIVIDUAL_CONTRIBUTOR_PREPARED'
  },
  {
    prepared: true,
    search_started_on_prepared_route: true,
    coarse_endpoint: 'INDIVIDUAL_CONTRIBUTOR_PREPARED'
  }
]);

assert.throws(() => runGivingPracticeIndependentOrderAssay({ verified: false }), /requires a verified existing source contract/i);
const driftedVerification = verifyGivingPracticeOrderSourceContract({
  contributorHandoffSource: contributorHandoffSource.replace('searched: false', 'searched: maybe'),
  directorySource
});
assert.equal(driftedVerification.verified, false);
assert.equal(driftedVerification.checks.prepare_renders_unsearched, false);

const givingWitness = compileGivingPracticeOrderPedagogueWitness(assay);
assert.equal(givingWitness.mechanism_id, 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.equal(givingWitness.context_family, 'GIVING_PRACTICE');
assert.equal(givingWitness.outcome, 'SUPPORTED_BOUNDED');
assert.equal(givingWitness.authority.promotion_authority, false);

const mossFixture = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json', 'utf8'));
const mossWitness = compileMossLanternMl3PedagogueWitness(runMossLanternTemporalOrderAssay(mossFixture));
assert.equal(mossWitness.context_family, 'ASH_CALIBRATION');

const literature = ['a', 'b', 'c'].flatMap(part => JSON.parse(
  fs.readFileSync(`tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-${part}.json`, 'utf8')
).cards);
const hydration = hydratePedagogueResearch(literature.map(compilePedagogueResearchTransferCard));
const review = reviewPedagogueResearchMechanism(
  hydration,
  [mossWitness, givingWitness],
  'ORDER_IS_PART_OF_PROCESS_STATE'
);
assert.equal(review.external_research_status, 'CROSS_DOMAIN_REVIEW_CANDIDATE');
assert.equal(review.internal_assay_witness_count, 2);
assert.equal(review.internal_context_family_count, 2);
assert.deepEqual([...review.internal_context_families], ['ASH_CALIBRATION', 'GIVING_PRACTICE']);
assert.equal(review.internal_supported_bounded_count, 2);
assert.equal(review.internal_counterexampled_bounded_count, 0);
assert.equal(review.learning_state, 'CROSS_DOMAIN_PLUS_MULTI_CONTEXT_INTERNAL_BOUNDED_ASSAY_WITNESSES');
assert.equal(review.next_learning_action, 'SEEK_ADVERSARIAL_COUNTEREXAMPLE');
assert.equal(review.context_family_distinctness_only, true);
assert.equal(review.statistical_independence_claim, false);
assert.equal(review.pedagogue_law_status, 'NOT_PROMOTED');
assert.equal(review.promotion_authority, false);
assert.equal(review.production_mutation_authorized, false);
assert.equal(review.human_closure_required, true);

const spec = fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/GIVING_PEDAGOGUE_INDEPENDENT_ORDER_ASSAY_SPEC_V0_1.md', 'utf8');
assert.match(spec, /internal witness count[\s\S]*!=[\s\S]*independent internal context count/i);
assert.match(spec, /Giving runtime mutated = false/i);
assert.match(spec, /SEEK_ADVERSARIAL_COUNTEREXAMPLE/);

console.log(JSON.stringify({
  ok: true,
  schema: assay.schema,
  source_contract_verified: assay.source_contract_verified,
  latent_route_count: assay.latent_route_count,
  positive_unique_terminal_witness_count: assay.positive_unique_terminal_witness_count,
  null_unique_terminal_witness_count: assay.null_unique_terminal_witness_count,
  same_operation_multiset: assay.same_operation_multiset,
  same_coarse_endpoint: assay.same_coarse_endpoint,
  hypothesis_status: assay.hypothesis_status.H_GIVING_PRACTICE_ORDER_CONTEXT,
  internal_assay_witness_count: review.internal_assay_witness_count,
  internal_context_family_count: review.internal_context_family_count,
  learning_state: review.learning_state,
  next_learning_action: review.next_learning_action,
  statistical_independence_claim: review.statistical_independence_claim,
  pedagogue_law_status: review.pedagogue_law_status,
  promotion_authority: review.promotion_authority
}, null, 2));
