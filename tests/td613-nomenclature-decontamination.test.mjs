import assert from 'node:assert/strict';
import fs from 'node:fs';

const fixtureUrl = new URL('./fixtures/pedagogue/td613-nomenclature-decontamination-v01.json', import.meta.url);
const ledger = JSON.parse(fs.readFileSync(fixtureUrl, 'utf8'));

assert.equal(ledger.schema, 'td613.nomenclature-decontamination/v0.1');
assert.equal(ledger.state, 'PREREGISTERED_CHAMBER_0');
assert.equal(ledger.authority.donor_corpus_admitted, false);
assert.equal(ledger.authority.external_donor_authority, false);
assert.equal(ledger.authority.automatic_ontology_promotion, false);
assert.equal(ledger.authority.automatic_novelty_promotion, false);
assert.equal(ledger.authority.automatic_ontology_deletion, false);
assert.equal(ledger.authority.analogy_demote_requires_human_review, true);
assert.equal(ledger.authority.human_closure_required, true);

assert.equal(
  ledger.bases.historical_pre_donor_lineage_base,
  '419201a9fbb8e15044139f021c4b93a538a67f5b'
);
assert.equal(
  ledger.bases.current_execution_base_after_pr1100,
  'b0e8cdca1447e2643d5f5401de106bcbf668b674'
);
assert.equal(
  ledger.bases.pr1100_merge_commit,
  'c74aaa7c989fa52498d4fb0832db764fecc2c948'
);

const laws = new Set(ledger.laws);
for (const required of [
  'NOVEL_TO_THIS_CONVERSATION != NOVEL_TO_SCHOLARSHIP',
  'TERM_PROVENANCE != CONSTRUCT_NOVELTY',
  'CONVENTIONAL_NEIGHBOR != EXACT_EQUIVALENT',
  'LITERATURE_OVERLAP != MECHANISM_IDENTITY',
  'COINAGE != DISCOVERY',
  'DONOR_INPUT != LITERATURE_AUTHORITY',
  'RECOGNITION != PROMOTION',
  'NOMENCLATURE_AUDIT != ONTOLOGY_DELETION',
  'KNOWN_COMPONENT != REDUNDANT_COMPOSITION',
  'ANALOGICAL_BORROWING != FAILED_ANALOGY',
  'EXTERNAL_CONVERGENCE != RETROACTIVE_ORIGIN_PROOF',
  'FAMILIAR_TERM != INVALID_TD613_USE',
  'DEMYSTIFICATION != DEMOBILIZATION'
]) assert.ok(laws.has(required), `missing nomenclature law: ${required}`);

assert.ok(Array.isArray(ledger.external_sources) && ledger.external_sources.length >= 8);
const sourceById = new Map(ledger.external_sources.map(source => [source.id, source]));
assert.equal(sourceById.size, ledger.external_sources.length, 'source IDs must be unique');
for (const source of ledger.external_sources) {
  assert.ok(source.source_family);
  assert.ok(source.title);
  assert.ok(source.url_or_doi);
  assert.ok(source.supports_term);
}

const allowedTermProvenance = new Set([
  'TD613_COINAGE',
  'TD613_COINAGE_WITH_ANALOGICAL_BORROWING',
  'ANALOGICAL_BORROWING',
  'TD613_GOVERNANCE_COMPOSITION'
]);

const allowedConstructStatus = new Set([
  'HELD_FOR_RESIDUAL_NOVELTY_AUDIT',
  'LIKELY_KNOWN_PATTERN_HELD_FOR_EXACT_MAPPING',
  'NO_NOVELTY_CLAIM_FROM_VOCABULARY',
  'HELD_FOR_GOVERNANCE_CROSSWALK',
  'RESIDUAL_NOVELTY_CANDIDATE',
  'KNOWN_COMPONENT',
  'KNOWN_COMPOSITION',
  'REJECTED_NOVELTY'
]);

assert.ok(Array.isArray(ledger.entries) && ledger.entries.length >= 8);

let residualNoveltyCount = 0;
for (const entry of ledger.entries) {
  assert.ok(entry.id);
  assert.ok(entry.td613_term);
  assert.ok(Array.isArray(entry.td613_source_refs) && entry.td613_source_refs.length > 0);
  assert.ok(allowedTermProvenance.has(entry.term_provenance), `${entry.id}: unsupported term provenance`);
  assert.ok(allowedConstructStatus.has(entry.construct_status), `${entry.id}: unsupported construct status`);
  assert.ok(
    Array.isArray(entry.candidate_external_neighborhoods) &&
      entry.candidate_external_neighborhoods.length >= 2,
    `${entry.id}: conventional-neighborhood search cannot be skipped`
  );
  assert.ok(entry.what_literature_already_explains);
  assert.ok(entry.residual_question);
  assert.ok(entry.near_miss_or_falsification_target);

  for (const neighbor of entry.candidate_external_neighborhoods) {
    assert.ok(neighbor.term);
    assert.ok(neighbor.relation);
    assert.ok(Array.isArray(neighbor.source_ids));
    for (const sourceId of neighbor.source_ids) {
      assert.ok(sourceById.has(sourceId), `${entry.id}: unknown source ${sourceId}`);
    }
  }

  if (entry.construct_status === 'RESIDUAL_NOVELTY_CANDIDATE') {
    residualNoveltyCount += 1;
    const boundSources = new Set(
      entry.candidate_external_neighborhoods.flatMap(neighbor => neighbor.source_ids)
    );
    const sourceFamilies = new Set(
      [...boundSources].map(sourceId => sourceById.get(sourceId)?.source_family).filter(Boolean)
    );
    assert.ok(entry.candidate_external_neighborhoods.length >= 3);
    assert.ok(boundSources.size >= 3);
    assert.ok(sourceFamilies.size >= 2);
    assert.ok(entry.near_miss_or_falsification_target);
  }
}

// Term provenance and construct status are orthogonal. The fixture must contain at
// least one coined TD613 label that is nevertheless classified toward a known-pattern
// mapping, proving that coinage cannot bootstrap novelty.
assert.ok(
  ledger.entries.some(entry =>
    entry.term_provenance === 'TD613_COINAGE' &&
    entry.construct_status === 'LIKELY_KNOWN_PATTERN_HELD_FOR_EXACT_MAPPING'
  ),
  'fixture must demonstrate coined-label / likely-known-pattern independence'
);

// The inverse error is forbidden too: recognizing a borrowed word cannot bury an
// operationally unresolved TD613 relation. Analogy fidelity is a third coordinate.
const borrowed = ledger.entries.find(entry => entry.id === 'PHASONIC_TOMOGRAPHY_LANGUAGE');
assert.ok(borrowed, 'borrowed-language audit entry required');
assert.equal(borrowed.term_provenance, 'ANALOGICAL_BORROWING');
assert.equal(borrowed.construct_status, 'NO_NOVELTY_CLAIM_FROM_VOCABULARY');
assert.equal(borrowed.analogy_fidelity_status, 'HELD_FOR_STRUCTURE_PRESERVING_ANALOGY_AUDIT');
assert.equal(borrowed.retention_rule, 'DO_NOT_DELETE_FROM_TD613_ON_NOMENCLATURE_GROUNDS');
assert.match(borrowed.near_miss_or_falsification_target, /operator mismatch|discriminating|predictive/i);

assert.equal(ledger.retention_rule.automatic_deletion, false);
assert.equal(ledger.retention_rule.automatic_metaphor_demotion, false);
assert.equal(ledger.retention_rule.human_closure_required, true);
assert.ok(Array.isArray(ledger.retention_rule.requirements) && ledger.retention_rule.requirements.length >= 5);

const validationRoute = ledger.cross_domain_validation_route;
assert.equal(validationRoute.state, 'OPEN_FOR_SOURCE_BOUND_CANDIDATES');
assert.equal(validationRoute.unbound_external_alignment, 'HELD_FOR_EXTERNAL_SOURCE_BINDING');
assert.deepEqual(validationRoute.sequence, [
  'FREEZE_PREEXISTING_TD613_ARTIFACT',
  'BIND_EXTERNAL_SOURCE_AND_PUBLICATION_TIME',
  'SEPARATE_TERM_OVERLAP_FROM_OPERATOR_OVERLAP',
  'BLIND_MAP_INPUTS_OPERATORS_OBSERVABLES_AND_FAILURES',
  'RECORD_MATCHES_AND_MISMATCHES',
  'TEST_STRUCTURE_PRESERVING_TRANSFER',
  'CLASSIFY_ANALOGY_FIDELITY',
  'PRESERVE_TEMPORAL_NON_RETROACTIVITY',
  'RETURN_TO_HUMAN'
]);
assert.match(validationRoute.claim_ceiling, /cannot by itself prove novelty, causation, copying/i);

// Chamber 0 is hostile to novelty inflation, not to exploration. It begins with zero
// promoted residual-novelty claims while keeping unresolved operational analogies live.
assert.equal(residualNoveltyCount, 0);

const serialized = JSON.stringify(ledger);
for (const phrase of ledger.promotion_rule.forbidden_unqualified_language) {
  assert.ok(phrase);
}
assert.ok(!serialized.includes('"donor_corpus_admitted":true'));
assert.deepEqual(
  ledger.route_through_recognition.sequence,
  [
    'RECOGNIZE_EXISTING_CONSTRUCT',
    'BIND_TD613_SOURCE',
    'SEARCH_CONVENTIONAL_NEIGHBORS',
    'RECORD_NEAR_MISSES',
    'CLASSIFY_TERM_PROVENANCE',
    'CLASSIFY_CONSTRUCT_STATUS',
    'TEST_OPERATIONAL_ANALOGY_FIDELITY',
    'TEST_RESIDUAL',
    'PROMOTE_DEMOTE_OR_RETAIN',
    'RETURN_CONTROL_TO_HUMAN'
  ]
);
assert.match(
  ledger.route_through_recognition.repair_criterion,
  /reduces dependence on bespoke vocabulary/
);
assert.match(
  ledger.route_through_recognition.repair_criterion,
  /without .*deleting an operationally useful TD613 relation/i
);

console.log('TD613 nomenclature decontamination Chamber 0 passed.');
