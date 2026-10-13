import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilePedagogueResearchTransferCard, hydratePedagogueResearch } from '../app/engine/flowcore-pedagogue-core.js';

const fixtureE = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-e.json', 'utf8'));
const literature = ['a', 'b', 'c', 'd', 'e'].flatMap(part => JSON.parse(
  fs.readFileSync(`tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-${part}.json`, 'utf8')
).cards);
const hydration = hydratePedagogueResearch(literature.map(compilePedagogueResearchTransferCard));

assert.equal(fixtureE.part, 'E');
assert.equal(fixtureE.research_only, true);
assert.equal(fixtureE.raw_source_content_included, false);
assert.equal(fixtureE.cards.length, 4);
assert.equal(hydration.card_count, 40);
assert.equal(hydration.unique_source_count, 39);
assert.equal(hydration.domain_family_count, 31);
assert.equal(hydration.peer_reviewed_count, 28);
assert.equal(hydration.preprint_count, 11);
assert.equal(hydration.promotion_authority, false);
assert.equal(hydration.production_mutation_authorized, false);
assert.equal(hydration.human_closure_required, true);

const observationObject = hydration.mechanism_reviews.find(item => item.mechanism_id === 'IDENTIFIABILITY_DEPENDS_ON_OBSERVATION_OBJECT');
assert.ok(observationObject);
assert.equal(observationObject.witness_count, 1);
assert.equal(observationObject.domain_family_count, 1);
assert.equal(observationObject.status, 'SINGLE_DOMAIN_OBSERVATION');
assert.equal(observationObject.promotion_authority, false);

const assumptionScoped = hydration.mechanism_reviews.find(item => item.mechanism_id === 'IDENTIFIABILITY_IS_ASSUMPTION_SCOPED');
assert.ok(assumptionScoped);
assert.equal(assumptionScoped.witness_count, 3);
assert.equal(assumptionScoped.unique_source_count, 3);
assert.equal(assumptionScoped.domain_family_count, 3);
assert.equal(assumptionScoped.cross_domain_witness, true);
assert.equal(assumptionScoped.status, 'CROSS_DOMAIN_REVIEW_CANDIDATE');
assert.equal(assumptionScoped.promotion_authority, false);
assert.ok(hydration.cross_domain_review_candidates.includes('IDENTIFIABILITY_IS_ASSUMPTION_SCOPED'));
assert.match(hydration.finding, /none is promoted into Pedagogue law/i);

console.log(JSON.stringify({
  ok: true,
  card_count: hydration.card_count,
  unique_source_count: hydration.unique_source_count,
  domain_family_count: hydration.domain_family_count,
  peer_reviewed_count: hydration.peer_reviewed_count,
  preprint_count: hydration.preprint_count,
  observation_object_status: observationObject.status,
  assumption_scoped_status: assumptionScoped.status,
  assumption_scoped_domain_family_count: assumptionScoped.domain_family_count,
  promotion_authority: hydration.promotion_authority
}, null, 2));
