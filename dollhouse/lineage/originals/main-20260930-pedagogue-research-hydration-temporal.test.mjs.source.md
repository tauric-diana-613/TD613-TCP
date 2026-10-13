import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilePedagogueResearchTransferCard, hydratePedagogueResearch } from '../app/engine/flowcore-pedagogue-core.js';

const fixtureA = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-a.json', 'utf8'));
const fixtureB = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-b.json', 'utf8'));
const fixtureC = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-c.json', 'utf8'));
const rawCards = [...fixtureA.cards, ...fixtureB.cards, ...fixtureC.cards];
const cards = rawCards.map(compilePedagogueResearchTransferCard);
const hydration = hydratePedagogueResearch(cards);

assert.equal(fixtureC.part, 'C');
assert.equal(fixtureC.research_only, true);
assert.equal(fixtureC.raw_source_content_included, false);
assert.equal(fixtureC.cards.length, 5);
assert.equal(hydration.card_count, 32);
assert.equal(hydration.unique_source_count, 31);
assert.equal(hydration.domain_family_count, 23);
assert.equal(hydration.peer_reviewed_count, 23);
assert.equal(hydration.preprint_count, 8);
assert.equal(hydration.promotion_authority, false);
assert.equal(hydration.production_mutation_authorized, false);
assert.equal(hydration.human_closure_required, true);

const order = hydration.mechanism_reviews.find(item => item.mechanism_id === 'ORDER_IS_PART_OF_PROCESS_STATE');
assert.ok(order);
assert.ok(order.unique_source_count >= 5);
assert.ok(order.domain_family_count >= 3);
assert.equal(order.cross_domain_witness, true);
assert.equal(order.status, 'CROSS_DOMAIN_REVIEW_CANDIDATE');
assert.equal(order.promotion_authority, false);

const probeSpan = hydration.mechanism_reviews.find(item => item.mechanism_id === 'PROBE_SPAN_NOT_PROBE_COUNT');
assert.ok(probeSpan);
assert.equal(probeSpan.witness_count, 1);
assert.equal(probeSpan.status, 'SINGLE_DOMAIN_OBSERVATION');
assert.equal(probeSpan.promotion_authority, false);

const trajectory = hydration.mechanism_reviews.find(item => item.mechanism_id === 'RECONSTRUCTION_TRAJECTORY_IS_FIRST_CLASS');
assert.ok(trajectory);
assert.equal(trajectory.witness_count, 1);
assert.equal(trajectory.status, 'SINGLE_DOMAIN_OBSERVATION');

const complexity = hydration.mechanism_reviews.find(item => item.mechanism_id === 'TEMPORAL_COMPLEXITY_CONTROLS_RECONSTRUCTION_BUDGET');
assert.ok(complexity);
assert.equal(complexity.witness_count, 1);
assert.equal(complexity.status, 'SINGLE_DOMAIN_OBSERVATION');

assert.ok(hydration.cross_domain_review_candidates.includes('ORDER_IS_PART_OF_PROCESS_STATE'));
assert.match(hydration.finding, /none is promoted into Pedagogue law/i);

console.log(JSON.stringify({
  ok: true,
  card_count: hydration.card_count,
  unique_source_count: hydration.unique_source_count,
  domain_family_count: hydration.domain_family_count,
  peer_reviewed_count: hydration.peer_reviewed_count,
  preprint_count: hydration.preprint_count,
  order_witness_count: order.unique_source_count,
  order_domain_family_count: order.domain_family_count,
  order_status: order.status,
  promotion_authority: hydration.promotion_authority
}, null, 2));
