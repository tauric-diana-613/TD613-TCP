import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compilePedagogueRecurrenceAudit,
  tracePedagogueMathematicalCounterpoint
} from '../app/engine/flowcore-pedagogue-core.js';

test('recurrence audit refuses to collapse Rudolf and Jakob Steiner into one coordinate', () => {
  const receipt = compilePedagogueRecurrenceAudit({
    coordinate_id: 'STEINER_SURNAME_CONTROL',
    canonical_entity_id: 'RUDOLF_STEINER_1861_1925',
    entity_candidates: ['RUDOLF_STEINER_1861_1925', 'JAKOB_STEINER_1796_1863'],
    mentions: [
      {
        route_id: 'potato-pedagogy',
        observed_token: 'Steiner',
        entity_id: 'RUDOLF_STEINER_1861_1925',
        exposure_class: 'DIRECT_KNOWN_EXPOSURE',
        evidence_posture: 'SUPPLIED_PRIMARY',
        provenance_reference: 'Potato ASP / Dome-World pedagogy corpus',
        mechanism_tags: ['RHYTHM_AND_CADENCE'],
        domain_tags: ['PEDAGOGY']
      },
      {
        route_id: 'td613-projective-control',
        observed_token: 'Steiner',
        entity_id: 'JAKOB_STEINER_1796_1863',
        exposure_class: 'NO_KNOWN_EXPOSURE',
        evidence_posture: 'SCHOLARLY_SOURCE',
        provenance_reference: 'Jakob Steiner projective-geometry counterpoint introduced by TD613 in PR #697',
        mechanism_tags: ['PROJECTIVE_DEPENDENCE'],
        domain_tags: ['PROJECTIVE_GEOMETRY']
      }
    ],
    breadth_control: {
      high_degree_coordinate_declared: true,
      expected_recurrence_in_transdisciplinary_search: true,
      note: 'The surname token spans unrelated people and must not be treated as a mechanism.'
    }
  });

  assert.equal(receipt.identity_control.alias_collision_detected, true);
  assert.equal(receipt.identity_control.identity_disambiguation_required, true);
  assert.equal(receipt.classification, 'IDENTITY_DISAMBIGUATION_REQUIRED');
  assert.equal(receipt.claim_ceiling.alias_collision_may_be_interpreted_as_convergence, false);
  assert.equal(receipt.authority.ontology_promotion_authorized, false);
});

test('recurrence audit can distinguish independent functional recurrence from exposure and breadth effects', () => {
  const receipt = compilePedagogueRecurrenceAudit({
    coordinate_id: 'RUDOLF_STEINER_RECURRENCE',
    canonical_entity_id: 'RUDOLF_STEINER_1861_1925',
    mentions: [
      {
        route_id: 'potato-rhythm',
        observed_token: 'Rudolf Steiner',
        entity_id: 'RUDOLF_STEINER_1861_1925',
        exposure_class: 'DIRECT_KNOWN_EXPOSURE',
        evidence_posture: 'SUPPLIED_PRIMARY',
        provenance_reference: 'Potato ASP / Dome-World pedagogy corpus',
        mechanism_tags: ['DELAYED_INTERPRETATION', 'RHYTHM_AND_CADENCE'],
        domain_tags: ['PEDAGOGY']
      },
      {
        route_id: 'td613-observation-grammar',
        observed_token: 'Rudolf Steiner',
        entity_id: 'RUDOLF_STEINER_1861_1925',
        exposure_class: 'NO_KNOWN_EXPOSURE',
        evidence_posture: 'DERIVED',
        provenance_reference: 'TD613 observation/model separation before explicit Steiner comparison',
        mechanism_tags: ['DELAYED_INTERPRETATION', 'OBSERVATION_BEFORE_NAMING'],
        domain_tags: ['INFORMATION_ARCHITECTURE']
      },
      {
        route_id: 'independent-goethean-method-card',
        observed_token: 'Rudolf Steiner',
        entity_id: 'RUDOLF_STEINER_1861_1925',
        exposure_class: 'NO_KNOWN_EXPOSURE',
        evidence_posture: 'SCHOLARLY_SOURCE',
        provenance_reference: 'Goethean active-observation scholarship',
        mechanism_tags: ['DELAYED_INTERPRETATION', 'TRANSFORMATION_FOLLOWING'],
        domain_tags: ['HISTORY_OF_SCIENCE']
      }
    ],
    breadth_control: {
      high_degree_coordinate_declared: true,
      expected_recurrence_in_transdisciplinary_search: true,
      note: 'Rudolf Steiner has a broad transdisciplinary corpus, so recurrence count alone is not probative.'
    }
  });

  assert.equal(receipt.identity_control.alias_collision_detected, false);
  assert.equal(receipt.exposure_control.unknown_exposure_count, 0);
  assert.ok(receipt.functional_control.independent_functional_pair_count >= 1);
  assert.equal(receipt.breadth_control.high_degree_coordinate_declared, true);
  assert.equal(receipt.breadth_control.expected_recurrence_in_transdisciplinary_search, true);
  assert.equal(receipt.classification, 'INDEPENDENT_FUNCTIONAL_RECURRENCE_CANDIDATE');
  assert.equal(receipt.claim_ceiling.recurrence_is_common_cause_proof, false);
  assert.equal(receipt.claim_ceiling.recurrence_is_metaphysical_proof, false);
  assert.equal(receipt.claim_ceiling.high_degree_breadth_may_be_ignored, false);
});

test('unknown exposure never counts as independent convergence', () => {
  const receipt = compilePedagogueRecurrenceAudit({
    coordinate_id: 'UNKNOWN_EXPOSURE_CONTROL',
    canonical_entity_id: 'RUDOLF_STEINER_1861_1925',
    mentions: [
      {
        route_id: 'route-a',
        observed_token: 'Rudolf Steiner',
        entity_id: 'RUDOLF_STEINER_1861_1925',
        exposure_class: 'UNKNOWN',
        evidence_posture: 'SUPPLIED',
        provenance_reference: 'unresolved route a',
        mechanism_tags: ['DELAYED_INTERPRETATION'],
        domain_tags: ['A']
      },
      {
        route_id: 'route-b',
        observed_token: 'Rudolf Steiner',
        entity_id: 'RUDOLF_STEINER_1861_1925',
        exposure_class: 'UNKNOWN',
        evidence_posture: 'SUPPLIED',
        provenance_reference: 'unresolved route b',
        mechanism_tags: ['DELAYED_INTERPRETATION'],
        domain_tags: ['B']
      }
    ]
  });
  assert.equal(receipt.exposure_control.unknown_exposure_count, 2);
  assert.equal(receipt.exposure_control.independence_may_be_claimed_for_unknown_exposure, false);
  assert.equal(receipt.functional_control.independent_functional_pair_count, 0);
  assert.notEqual(receipt.classification, 'INDEPENDENT_FUNCTIONAL_RECURRENCE_CANDIDATE');
});

test('Jakob Steiner projective and combinatorial counterpoints remain non-ancestral and non-authoritative', () => {
  const projective = tracePedagogueMathematicalCounterpoint('JAKOB_STEINER_PROJECTIVE_DEPENDENCE');
  const combinatorial = tracePedagogueMathematicalCounterpoint('JAKOB_STEINER_COMBINATORIAL_COVERAGE');

  assert.equal(projective.provenance_class, 'TD613_DERIVED_RESEARCH_COORDINATE_NOT_POTATO_LINEAGE');
  assert.equal(combinatorial.provenance_class, 'TD613_DERIVED_RESEARCH_COORDINATE_NOT_POTATO_LINEAGE');
  assert.equal(projective.lineage_ancestry_mutated, false);
  assert.equal(combinatorial.lineage_ancestry_mutated, false);
  assert.match(projective.counterpoint.entity_disambiguation, /not Rudolf Steiner/i);
  assert.equal(combinatorial.counterpoint.naming_provenance.exclusive_authorship_claim, false);
  assert.equal(combinatorial.counterpoint.naming_provenance.name_equals_complete_provenance, false);
  assert.ok(combinatorial.counterpoint.forbidden_inferences.includes('combinatorial balance implies epistemic optimality'));
  assert.equal(projective.ontology_promotion_authorized, false);
  assert.equal(combinatorial.production_mutation_authorized, false);
  assert.equal(projective.human_closure_required, true);
});
