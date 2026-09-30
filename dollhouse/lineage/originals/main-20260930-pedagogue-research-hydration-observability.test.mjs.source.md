import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compilePedagogueResearchTransferCard, hydratePedagogueResearch } from '../app/engine/flowcore-pedagogue-core.js';

const fixtureD = JSON.parse(fs.readFileSync('tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-d.json', 'utf8'));
const literature = ['a', 'b', 'c', 'd'].flatMap(part => JSON.parse(
  fs.readFileSync(`tests/fixtures/pedagogue/pedagogue-research-literature-2026-v01-${part}.json`, 'utf8')
).cards);
const hydration = hydratePedagogueResearch(literature.map(compilePedagogueResearchTransferCard));

assert.equal(fixtureD.part, 'D');
assert.equal(fixtureD.research_only, true);
assert.equal(fixtureD.raw_source_content_included, false);
assert.equal(fixtureD.cards.length, 4);
assert.equal(hydration.card_count, 36);
assert.equal(hydration.unique_source_count, 35);
assert.equal(hydration.domain_family_count, 27);
assert.equal(hydration.peer_reviewed_count, 25);
assert.equal(hydration.preprint_count, 10);
assert.equal(hydration.promotion_authority, false);
assert.equal(hydration.production_mutation_authorized, false);
assert.equal(hydration.human_closure_required, true);

const representation = hydration.mechanism_reviews.find(item => item.mechanism_id === 'REPRESENTATION_AFFECTS_IDENTIFIABILITY');
assert.ok(representation);
assert.ok(representation.domain_families.includes('ROBOTICS_VLA'));
assert.equal(representation.cross_domain_witness, true);
assert.equal(representation.promotion_authority, false);

const probeDiversity = hydration.mechanism_reviews.find(item => item.mechanism_id === 'PROBE_DIVERSITY_NEEDS_DEPENDENCE_CONTROL');
assert.ok(probeDiversity);
assert.ok(probeDiversity.domain_families.includes('SENSOR_PLACEMENT'));
assert.equal(probeDiversity.cross_domain_witness, true);

const observationPattern = hydration.mechanism_reviews.find(item => item.mechanism_id === 'OBSERVATION_PATTERN_CAN_CREATE_OR_BREAK_ALIASING');
assert.ok(observationPattern);
assert.equal(observationPattern.witness_count, 1);
assert.equal(observationPattern.domain_family_count, 1);
assert.equal(observationPattern.status, 'SINGLE_DOMAIN_OBSERVATION');
assert.equal(observationPattern.promotion_authority, false);

const crossView = hydration.mechanism_reviews.find(item => item.mechanism_id === 'CROSS_VIEW_CONSISTENCY_TESTS_STRUCTURAL_STABILITY');
assert.ok(crossView);
assert.equal(crossView.witness_count, 1);
assert.equal(crossView.status, 'SINGLE_DOMAIN_OBSERVATION');
assert.equal(crossView.promotion_authority, false);

assert.match(hydration.finding, /none is promoted into Pedagogue law/i);

console.log(JSON.stringify({
  ok: true,
  card_count: hydration.card_count,
  unique_source_count: hydration.unique_source_count,
  domain_family_count: hydration.domain_family_count,
  peer_reviewed_count: hydration.peer_reviewed_count,
  preprint_count: hydration.preprint_count,
  representation_domain_family_count: representation.domain_family_count,
  probe_diversity_domain_family_count: probeDiversity.domain_family_count,
  observation_pattern_status: observationPattern.status,
  cross_view_status: crossView.status,
  promotion_authority: hydration.promotion_authority
}, null, 2));
