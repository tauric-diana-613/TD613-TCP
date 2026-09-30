import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  PEDAGOGUE_RESEARCH_DATE_PRECISIONS,
  PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA,
  PEDAGOGUE_RESEARCH_TRANSFER_CARD_SCHEMA,
  compilePedagogueResearchTransferCard,
  hydratePedagogueResearch
} from '../app/engine/flowcore-pedagogue-core.js';
import {
  A15_R0_PEDAGOGUE_LITERATURE_HYDRATION_SCHEMA,
  buildA15R0PedagogueLiteratureHydration
} from '../app/dome-world/previews/a15-r0/pedagogue-literature-hydration.js';

const fixtureA = JSON.parse(await readFile(
  new URL('./fixtures/pedagogue/pedagogue-research-literature-2026-v01-a.json', import.meta.url),
  'utf8'
));
const fixtureB = JSON.parse(await readFile(
  new URL('./fixtures/pedagogue/pedagogue-research-literature-2026-v01-b.json', import.meta.url),
  'utf8'
));
const fixture = {
  schema: fixtureA.schema,
  research_only: fixtureA.research_only && fixtureB.research_only,
  raw_source_content_included: fixtureA.raw_source_content_included || fixtureB.raw_source_content_included,
  cards: [...fixtureA.cards, ...fixtureB.cards]
};

test('Pedagogue research hydration structures literature without transferring source authority', () => {
  assert.equal(fixture.schema, 'td613.flowcore.pedagogue-research-literature-fixture/v0.1');
  assert.equal(fixture.research_only, true);
  assert.equal(fixture.raw_source_content_included, false);
  assert.equal(fixture.cards.length, 27);

  const cards = fixture.cards.map(compilePedagogueResearchTransferCard);
  assert.ok(cards.every(card => card.schema === PEDAGOGUE_RESEARCH_TRANSFER_CARD_SCHEMA));
  assert.ok(cards.every(card => PEDAGOGUE_RESEARCH_DATE_PRECISIONS.includes(card.source.publication_date_precision)));
  assert.ok(cards.every(card => card.evidence_posture.source_date_precision_preserved === true));
  assert.ok(cards.every(card => card.evidence_posture.raw_source_content_ingested === false));
  assert.ok(cards.every(card => card.evidence_posture.source_authority_transferred === false));
  assert.ok(cards.every(card => card.authority.promotion_authority === false));
  assert.ok(cards.every(card => card.authority.product_mutation_authorized === false));
  assert.ok(cards.every(card => card.authority.production_mutation_authorized === false));
  assert.ok(cards.every(card => card.authority.human_closure_required === true));

  const hydration = hydratePedagogueResearch(cards);
  assert.equal(hydration.schema, PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA);
  assert.equal(hydration.research_only, true);
  assert.equal(hydration.card_count, 27);
  assert.equal(hydration.unique_source_count, 26);
  assert.equal(hydration.domain_family_count, 21);
  assert.equal(hydration.peer_reviewed_count, 20);
  assert.equal(hydration.preprint_count, 6);
  assert.equal(
    hydration.source_date_precision_counts.YEAR
      + hydration.source_date_precision_counts.MONTH
      + hydration.source_date_precision_counts.DAY,
    hydration.card_count
  );
  assert.equal(hydration.pedagogue_learning_posture, 'HYPOTHESIS_GENERATION_AND_ASSAY_DESIGN_ONLY');
  assert.equal(hydration.promotion_authority, false);
  assert.equal(hydration.automatic_redesign, false);
  assert.equal(hydration.production_mutation_authorized, false);
  assert.equal(hydration.external_transmission_authorized, false);
  assert.equal(hydration.human_closure_required, true);

  const crossDomain = new Set(hydration.cross_domain_review_candidates);
  for (const candidate of [
    'ANALOGUE_MAPPING_REQUIRES_EXPLICIT_NONIDENTITY',
    'HOLONOMY_REQUIRES_DECLARED_TRANSPORT_AND_LOOP',
    'ORDER_IS_PART_OF_PROCESS_STATE',
    'PROBE_DIVERSITY_NEEDS_DEPENDENCE_CONTROL',
    'REPRESENTATION_AFFECTS_IDENTIFIABILITY',
    'SHARED_GRAMMAR_WITH_TASK_ADAPTERS',
    'TARGET_REALIZATION_REQUIRES_VERIFICATION',
    'VISIBILITY_NOT_IDENTIFIABILITY'
  ]) {
    assert.equal(crossDomain.has(candidate), true, `${candidate} should be reviewable across independent domain families.`);
  }
  assert.equal(crossDomain.has('REGISTRY_SHIFT_IS_DISTINCT_CONTROL_COORDINATE'), false);
  assert.equal(crossDomain.has('STRUCTURED_NONREPETITION_SUPPORTS_HIERARCHICAL_SIGNAL'), false);

  const registryShift = hydration.mechanism_reviews.find(item => item.mechanism_id === 'REGISTRY_SHIFT_IS_DISTINCT_CONTROL_COORDINATE');
  assert.equal(registryShift.witness_count, 2);
  assert.equal(registryShift.unique_source_count, 2);
  assert.equal(registryShift.domain_family_count, 1);
  assert.equal(registryShift.cross_domain_witness, false);
  assert.equal(registryShift.status, 'SINGLE_DOMAIN_OBSERVATION');
  assert.equal(registryShift.promotion_authority, false);
});

test('Pedagogue research hydration preserves source date precision and rejects invented precision', () => {
  assert.deepEqual([...PEDAGOGUE_RESEARCH_DATE_PRECISIONS], ['YEAR', 'MONTH', 'DAY']);
  const base = structuredClone(fixture.cards[0]);

  const yearOnly = structuredClone(base);
  yearOnly.card_id = 'date-precision-year';
  yearOnly.source.publication_date = '2026';
  const compiledYear = compilePedagogueResearchTransferCard(yearOnly);
  assert.equal(compiledYear.source.publication_date, '2026');
  assert.equal(compiledYear.source.publication_date_precision, 'YEAR');

  const monthOnly = structuredClone(base);
  monthOnly.card_id = 'date-precision-month';
  monthOnly.source.publication_date = '2026-07';
  const compiledMonth = compilePedagogueResearchTransferCard(monthOnly);
  assert.equal(compiledMonth.source.publication_date_precision, 'MONTH');

  const dayExact = structuredClone(base);
  dayExact.card_id = 'date-precision-day';
  dayExact.source.publication_date = '2026-07-06';
  const compiledDay = compilePedagogueResearchTransferCard(dayExact);
  assert.equal(compiledDay.source.publication_date_precision, 'DAY');

  for (const invalidDate of ['Spring 2026', '2026-13', '2026-02-30', '2026-00', '2026-04-00']) {
    const invalid = structuredClone(base);
    invalid.source.publication_date = invalidDate;
    assert.throws(
      () => compilePedagogueResearchTransferCard(invalid),
      /publication_date|calendar/i,
      `${invalidDate} must fail closed rather than inventing source precision.`
    );
  }
});

test('Pedagogue research hydration fails closed on fake authority, duplicate cards, and malformed source status', () => {
  const base = structuredClone(fixture.cards[0]);

  const forbidden = structuredClone(base);
  forbidden.user_id = 'researcher-1';
  assert.throws(() => compilePedagogueResearchTransferCard(forbidden), /prohibited/i);

  const badClass = structuredClone(base);
  badClass.source.source_class = 'BLOG_SUMMARY';
  assert.throws(() => compilePedagogueResearchTransferCard(badClass), /unsupported research source class/i);

  const badDate = structuredClone(base);
  badDate.source.publication_date = 'Spring 2026';
  assert.throws(() => compilePedagogueResearchTransferCard(badDate), /YYYY, YYYY-MM, or YYYY-MM-DD/i);

  const compiled = compilePedagogueResearchTransferCard(base);
  assert.throws(() => hydratePedagogueResearch([compiled, compiled]), /card_id values must be unique/i);
});

test('A15-R0 literature adapter keeps Moss Lantern as a calibration object and separates assay jobs', () => {
  const packet = buildA15R0PedagogueLiteratureHydration(fixture.cards);
  assert.equal(packet.schema, A15_R0_PEDAGOGUE_LITERATURE_HYDRATION_SCHEMA);
  assert.equal(packet.research_only, true);
  assert.deepEqual([...packet.next_executable], ['ML1_REFERENCE_IDENTIFIABILITY', 'ML2_PROBE_DEPENDENCE']);
  assert.equal(packet.moss_lantern_ui_required, false);
  assert.equal(packet.live_ash_binding, false);
  assert.equal(packet.proto_loom_implementation, false);
  assert.equal(packet.transport_law_declared, false);
  assert.equal(packet.geometric_holonomy_claim, false);
  assert.equal(packet.phi_optimality_claim, false);
  assert.equal(packet.quantum_behavior_claim, false);
  assert.equal(packet.physical_realization_claim, false);
  assert.equal(packet.promotion_authority, false);
  assert.equal(packet.production_mutated, false);
  assert.equal(packet.external_transmission, false);
  assert.equal(packet.human_closure_required, true);

  const byId = Object.fromEntries(packet.assay_queue.map(item => [item.assay_id, item]));
  assert.equal(byId.ML1_REFERENCE_IDENTIFIABILITY.status, 'NEXT_EXECUTABLE_WITH_CONTROLS');
  assert.equal(byId.ML2_PROBE_DEPENDENCE.status, 'MINIMUM_CONTROL_REQUIRED_WITH_ML1');
  assert.equal(byId.ML3_TEMPORAL_ORDER.status, 'HELD_AFTER_ML1_ML2');
  assert.equal(byId.ML4_REGISTRY_SHIFT.status, 'HELD_AFTER_ML1_ML2');
  assert.equal(byId.ML5_REPRESENTATION_TRANSFORM.status, 'HELD_AFTER_NATIVE_RECONSTRUCTION');
  assert.equal(byId.ML6_REPLAY_AND_HELDOUT.status, 'RECEIPT_REQUIREMENT');
  assert.equal(byId.ML7_TRANSPORT_HELD.status, 'HELD_NO_IMPLEMENTATION');
  assert.ok(packet.assay_queue.every(item => item.mechanisms_present === true));
  assert.ok(packet.assay_queue.every(item => item.promotion_authority === false));
  assert.ok(packet.assay_queue.every(item => item.production_mutation_authorized === false));
});
