import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, text } from './flowcore-pedagogue-utils.js';

export const PEDAGOGUE_MATHEMATICAL_COUNTERPOINT_SCHEMA = 'td613.flowcore.pedagogue-mathematical-counterpoint/v0.1';

export const PEDAGOGUE_MATHEMATICAL_COUNTERPOINTS = Object.freeze([
  freeze({
    card_id: 'JAKOB_STEINER_PROJECTIVE_DEPENDENCE',
    display_name: 'Jakob Steiner · projective dependence and synthetic geometry',
    entity_id: 'JAKOB_STEINER_1796_1863',
    entity_disambiguation: 'Swiss mathematician and projective geometer; not Rudolf Steiner.',
    source_route: freeze([
      'Jakob Steiner, Systematische Entwickelung der Abhängigkeit geometrischer Gestalten voneinander (1832)',
      'MacTutor History of Mathematics · Jakob Steiner biography'
    ]),
    source_kind: 'HISTORICAL_MATHEMATICAL_COUNTERPOINT',
    observed_relation: 'Steiner sought simple projective relations through which dependence among geometric figures and transfer of properties from simple to complex configurations become legible.',
    td613_candidate_relation: 'Multiple non-equivalent projections may preserve a bounded relational invariant without requiring a total-field view or coordinate crown.',
    admissible_assays: freeze([
      'AIA projection-family invariant preservation under non-equivalent surface projections',
      'projective relation recovery from bounded local views',
      'hostile test in which superficial visual similarity is preserved while the governed projective relation is broken'
    ]),
    falsifiers: freeze([
      'the proposed invariant is not actually preserved across the declared projection family',
      'the same result follows from a weaker non-projective relation under matched conditions',
      'the mapping requires hidden total-field information unavailable to the declared observer'
    ]),
    forbidden_inferences: freeze([
      'Jakob Steiner is an ancestor in Potato’s pedagogue spine',
      'projective geometry proves TD613 ontology',
      'projective invariance implies semantic equivalence',
      'shared surname with Rudolf Steiner implies intellectual relation'
    ]),
    promotion_authority: false,
    automatic_redesign: false,
    human_closure_required: true
  }),
  freeze({
    card_id: 'JAKOB_STEINER_COMBINATORIAL_COVERAGE',
    display_name: 'Jakob Steiner · combinatorial systems as a coverage-design counterpoint',
    entity_id: 'JAKOB_STEINER_1796_1863',
    entity_disambiguation: 'Swiss mathematician; historical source of an 1853 combinatorial problem later associated with Steiner systems.',
    source_route: freeze([
      'Jakob Steiner, Combinatorische Aufgaben (1853)',
      'Encyclopedia of Mathematics · Steiner system / Steiner triple system'
    ]),
    source_kind: 'HISTORICAL_MATHEMATICAL_COUNTERPOINT',
    observed_relation: 'Modern Steiner systems are block designs with tightly controlled subset incidence; the historical naming is broader than Jakob Steiner’s own 1853 problem and must not be treated as exclusive authorship.',
    td613_candidate_relation: 'A probe family may be designed for declared combinatorial coverage so that required low-order relations are represented with controlled redundancy under a fixed observation budget.',
    admissible_assays: freeze([
      'compare repeated, arbitrary-diverse, and block-design probe schedules under matched observation budgets',
      'measure uncovered declared relation classes and duplicate coverage counts',
      'test whether combinatorial coverage improves identifiability without assuming optimality'
    ]),
    falsifiers: freeze([
      'matched random or greedy probe schedules achieve equal or better declared relation coverage',
      'block-design coverage does not improve the target identifiability or replay criterion',
      'the chosen incidence structure encodes a relation irrelevant to the actual inverse problem'
    ]),
    naming_provenance: freeze({
      modern_name: 'STEINER_SYSTEM',
      exclusive_authorship_claim: false,
      historical_caveat: 'The modern name does not imply that Jakob Steiner originated the full modern theory; related triple-system results predate his 1853 paper.',
      name_equals_complete_provenance: false
    }),
    forbidden_inferences: freeze([
      'combinatorial balance implies epistemic optimality',
      'uniform coverage implies equal decision value',
      'Steiner-system naming establishes exclusive historical authorship',
      'Jakob Steiner and Rudolf Steiner are the same provenance coordinate'
    ]),
    promotion_authority: false,
    automatic_experiment_execution: false,
    human_closure_required: true
  })
]);

export function tracePedagogueMathematicalCounterpoint(cardId) {
  const id = text(cardId, 'cardId').toUpperCase();
  const card = PEDAGOGUE_MATHEMATICAL_COUNTERPOINTS.find((item) => item.card_id === id);
  if (!card) throw new Error(`Unknown Pedagogue mathematical counterpoint: ${id}`);
  const receipt = {
    schema: PEDAGOGUE_MATHEMATICAL_COUNTERPOINT_SCHEMA,
    counterpoint: card,
    provenance_class: 'TD613_DERIVED_RESEARCH_COORDINATE_NOT_POTATO_LINEAGE',
    lineage_ancestry_mutated: false,
    source_authority_transferred: false,
    ontology_promotion_authorized: false,
    production_mutation_authorized: false,
    human_closure_required: true
  };
  canonicalJson(receipt);
  return freeze(receipt);
}
