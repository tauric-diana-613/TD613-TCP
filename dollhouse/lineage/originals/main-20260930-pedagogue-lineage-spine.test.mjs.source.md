import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PEDAGOGUE_LINEAGE_SPINE_SCHEMA,
  compilePedagogueLineageSpine,
  tracePedagogueLineage,
  compilePedagogueLineageReview
} from '../app/engine/flowcore-pedagogue-core.js';

test('Pedagogue lineage spine preserves Potato as synthesis layer without false first-introduction precision', () => {
  const spine = compilePedagogueLineageSpine();
  assert.equal(spine.schema, PEDAGOGUE_LINEAGE_SPINE_SCHEMA);
  assert.equal(spine.synthesis_owner, 'POTATO_FLOW_CORE_DOME_WORLD');
  assert.equal(spine.genealogy_rule, 'SOURCE_LINEAGES_TO_POTATO_SYNTHESIS_TO_PEDAGOGUE_OPERATIONALIZATION');
  assert.equal(spine.chronology_semantics.first_documented_in_is_not_proven_first_introduction, true);
  assert.equal(spine.chronology_semantics.undocumented_earlier_states_remain_possible, true);
  assert.equal(spine.chronology_semantics.later_reweighting_does_not_rewrite_earlier_presence, true);
  assert.equal(spine.chronology_semantics.base_spine_chronology_safe, true);
  assert.equal(spine.chronology_semantics.scholarly_extension_does_not_rewrite_base_chronology, true);
  assert.equal(spine.flat_saint_list_forbidden, true);
  assert.equal(spine.thinker_vote_forbidden, true);
  assert.equal(spine.convergence_is_truth, false);
  assert.equal(spine.lineage_is_runtime_authority, false);
  assert.equal(spine.promotion_authority, false);

  const byId = Object.fromEntries(spine.nodes.map((node) => [node.node_id, node]));
  for (const nodeId of ['MONTESSORI', 'MALAGUZZI', 'MILLER', 'LAING', 'STEINER', 'GRAEBER']) {
    assert.equal(byId[nodeId].first_documented_in, 'ASP_DOCUMENTED_CONSTELLATION');
    assert.match(byId[nodeId].introduction_precision, /EARLIER_SPINE_STATE_UNRESOLVED/);
    assert.equal(Object.hasOwn(byId[nodeId], 'introduced_in'), false);
  }
  assert.ok(byId.GRAEBER.routed_through.includes('FLOW_CORE_GOVERNANCE'));
  assert.match(byId.GRAEBER.evolution_note, /reweights his role/i);
  assert.match(byId.GRAEBER.evolution_note, /first-entry date.*unresolved/i);
  assert.equal(byId.DEWEY.first_documented_in, 'DOME_WORLD_CHILD_LIBERATION');
  assert.equal(byId.GATTO.first_documented_in, 'DOME_WORLD_CHILD_LIBERATION');
  assert.equal(byId.JACOBS.first_documented_in, 'DOME_WORLD_CHILD_LIBERATION');
  assert.equal(byId.ASHIWI_SPATIAL_KNOWLEDGE.kind, 'ROUTED_LIVING_KNOWLEDGE');
});

test('Steiner remains multi-route while racial hierarchy is separately quarantined', () => {
  const trace = tracePedagogueLineage('STEINER');
  const relations = Object.fromEntries(trace.node.relations.map((item) => [item.relation_id, item]));

  for (const relationId of [
    'RHYTHM_AND_CADENCE',
    'INTEGRATED_ACTIVITY',
    'ANTHROPOSOPHIC_METAPHYSICS',
    'EPISTEMIC_REFRACTION',
    'RACIAL_HIERARCHY_QUARANTINE'
  ]) assert.ok(relations[relationId], `${relationId} must remain separately routed.`);

  assert.equal(relations.RACIAL_HIERARCHY_QUARANTINE.authority_ceiling, 'PROVENANCE_ONLY_RUNTIME_AUTHORITY_FORBIDDEN');
  assert.notEqual(relations.RHYTHM_AND_CADENCE.authority_ceiling, relations.RACIAL_HIERARCHY_QUARANTINE.authority_ceiling);
  assert.match(relations.ANTHROPOSOPHIC_METAPHYSICS.tensions.join(' '), /empirical verification/i);
  assert.match(relations.EPISTEMIC_REFRACTION.potato_synthesis, /access != interpretation != authority/i);
  assert.match(trace.node.evolution_note, /active-observation recurrence/i);
  assert.equal(trace.chronology_semantics.first_documented_in_is_not_first_introduction_claim, true);
  assert.equal(trace.authority.runtime_authority_transferred, false);

  const challengeRefs = new Set(trace.challenge_cards.map((card) => card.source_reference));
  assert.ok(challengeRefs.has('doi:10.1525/nr.2008.11.3.4'));
  assert.ok(challengeRefs.has('doi:10.31265/aura.791'));
  assert.ok(challengeRefs.has('doi:10.1007/s40656-025-00681-7'));
  assert.ok(challengeRefs.has('doi:10.1007/s44217-026-01523-9'));
  assert.ok(challengeRefs.has('doi:10.1177/00221678261421324'));
  assert.ok(trace.challenge_cards.filter((card) => card.relation === 'QUARANTINES').length >= 2);
  assert.ok(trace.challenge_cards.some((card) => /not empirical validation/i.test(card.finding)));
});

test('lineage review carries provenance lenses without thinker voting or automatic redesign', () => {
  const review = compilePedagogueLineageReview({
    review_id: 'provenance-test-1',
    selected_lenses: ['RHYTHM_AND_CADENCE', 'INTERPRETIVE_LABOR', 'COMMUNITY_EMBEDDEDNESS', 'EPISTEMIC_REFRACTION'],
    findings: [
      { lens_id: 'RHYTHM_AND_CADENCE', posture: 'CONVERGENCE', note: 'Declared process is interrupted before consequence becomes available.' },
      { lens_id: 'INTERPRETIVE_LABOR', posture: 'DERIVATIONAL_CLAIM', note: 'Appeal burden is structurally assigned to the affected route.' },
      { lens_id: 'COMMUNITY_EMBEDDEDNESS', posture: 'NORMATIVE_ASSUMPTION', note: 'Shared-world participation is the declared design value.' },
      { lens_id: 'EPISTEMIC_REFRACTION', posture: 'DIVERGENCE', note: 'Access claim and later interpretation do not carry the same warrant.' }
    ]
  });
  assert.equal(review.selected_lenses.length, 4);
  assert.equal(review.convergence_count, 1);
  assert.equal(review.divergence_count, 1);
  assert.equal(review.convergence_creates_authority, false);
  assert.equal(review.thinker_vote_forbidden, true);
  assert.equal(review.automatic_redesign, false);
  assert.equal(review.product_mutation_authorized, false);
  assert.equal(review.production_mutation_authorized, false);
  assert.equal(review.human_closure_required, true);

  const rhythm = review.selected_lenses.find((lens) => lens.lens_id === 'RHYTHM_AND_CADENCE');
  const steiner = rhythm.provenance.find((node) => node.node_id === 'STEINER');
  assert.ok(steiner);
  assert.equal(steiner.first_documented_in, 'ASP_DOCUMENTED_CONSTELLATION');
  assert.match(steiner.introduction_precision, /EARLIER_SPINE_STATE_UNRESOLVED/);
  assert.ok(rhythm.provenance.some((node) => node.node_id === 'MONTESSORI'));

  assert.throws(() => compilePedagogueLineageReview({
    review_id: 'bad-age',
    age: 7,
    selected_lenses: ['RHYTHM_AND_CADENCE']
  }), /prohibited/i);
});
