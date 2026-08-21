import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, noForbidden, object, strings, text } from './flowcore-pedagogue-utils.js';
import {
  PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA
} from './pedagogue-research-transfer.js';

export const PEDAGOGUE_RESEARCH_ASSAY_WITNESS_SCHEMA = 'td613.flowcore.pedagogue-research-assay-witness/v0.1';
export const PEDAGOGUE_RESEARCH_MECHANISM_REVIEW_SCHEMA = 'td613.flowcore.pedagogue-research-mechanism-review/v0.1';
export const PEDAGOGUE_RESEARCH_ASSAY_OUTCOMES = Object.freeze([
  'SUPPORTED_BOUNDED',
  'COUNTEREXAMPLED_BOUNDED',
  'INCONCLUSIVE'
]);

const MECHANISM_RE = /^[A-Z][A-Z0-9_]{2,95}$/;
const CONTEXT_RE = /^[A-Z][A-Z0-9_]{2,63}$/;

export function compilePedagogueResearchAssayWitness(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const mechanism_id = text(value.mechanism_id, 'mechanism_id').toUpperCase();
  if (!MECHANISM_RE.test(mechanism_id)) {
    throw new Error('mechanism_id must be an uppercase generic relation identifier.');
  }
  const context_family = text(value.context_family, 'context_family').toUpperCase();
  if (!CONTEXT_RE.test(context_family)) {
    throw new Error('context_family must be an uppercase generic context identifier.');
  }
  const outcome = text(value.outcome, 'outcome').toUpperCase();
  if (!PEDAGOGUE_RESEARCH_ASSAY_OUTCOMES.includes(outcome)) {
    throw new Error(`Unsupported Pedagogue research assay outcome: ${outcome}`);
  }

  const witness = {
    schema: PEDAGOGUE_RESEARCH_ASSAY_WITNESS_SCHEMA,
    witness_id: text(value.witness_id, 'witness_id'),
    mechanism_id,
    context_family,
    assay_reference: text(value.assay_reference, 'assay_reference'),
    assay_schema: text(value.assay_schema, 'assay_schema'),
    assay_source_status: text(value.assay_source_status, 'assay_source_status').toUpperCase(),
    outcome,
    declared_controls: strings(value.declared_controls, 'declared_controls', 1),
    observations: strings(value.observations, 'observations', 1),
    falsifier_outcome: text(value.falsifier_outcome, 'falsifier_outcome'),
    alternative_explanations_remaining: strings(
      value.alternative_explanations_remaining,
      'alternative_explanations_remaining',
      1
    ),
    claim_ceiling: text(value.claim_ceiling, 'claim_ceiling'),
    evidence_posture: freeze({
      internal_bounded_assay_witness: true,
      context_family_is_declared_distinctness_only: true,
      statistical_independence_claim: false,
      assay_result_is_not_law: true,
      source_authority_transferred: false,
      domain_ontology_promoted: false,
      external_literature_revalidated: false
    }),
    authority: freeze({
      promotion_authority: false,
      automatic_redesign: false,
      product_mutation_authorized: false,
      production_mutation_authorized: false,
      external_transmission_authorized: false,
      human_closure_required: true
    })
  };
  canonicalJson(witness);
  return freeze(witness);
}

function reviewStatus(external, supported, counterexampled, inconclusive, contextCount) {
  const prefix = external.cross_domain_witness ? 'CROSS_DOMAIN' : 'SINGLE_DOMAIN';
  if (supported > 0 && counterexampled > 0) return `${prefix}_WITH_MIXED_INTERNAL_ASSAYS`;
  if (counterexampled > 0) return `${prefix}_WITH_INTERNAL_BOUNDED_COUNTEREXAMPLE`;
  if (supported > 0 && contextCount >= 2) return `${prefix}_PLUS_MULTI_CONTEXT_INTERNAL_BOUNDED_ASSAY_WITNESSES`;
  if (supported > 0) return `${prefix}_PLUS_INTERNAL_BOUNDED_ASSAY_WITNESS`;
  if (inconclusive > 0) return `${prefix}_WITH_INTERNAL_INCONCLUSIVE_ASSAY`;
  return external.status;
}

function nextLearningAction(supported, counterexampled, inconclusive, contextCount) {
  if (supported > 0 && counterexampled > 0) return 'DESIGN_DISCRIMINATING_ASSAY';
  if (counterexampled > 0) return 'REVISE_OR_NARROW_TRANSFERABLE_RELATION';
  if (supported > 0 && contextCount >= 2) return 'SEEK_ADVERSARIAL_COUNTEREXAMPLE';
  if (supported > 0) return 'SEEK_INDEPENDENT_CONTEXT_AND_ADVERSARIAL_COUNTEREXAMPLE';
  if (inconclusive > 0) return 'REDESIGN_ASSAY_FOR_IDENTIFIABILITY';
  return 'RUN_BOUNDED_INTERNAL_ASSAY';
}

export function reviewPedagogueResearchMechanism(hydration, witnesses = [], mechanismId) {
  noForbidden(hydration);
  if (!hydration || hydration.schema !== PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA) {
    throw new Error('Pedagogue mechanism review requires a governed research hydration object.');
  }
  const mechanism_id = text(mechanismId, 'mechanismId').toUpperCase();
  const external = hydration.mechanism_reviews.find(item => item.mechanism_id === mechanism_id);
  if (!external) throw new Error(`Mechanism ${mechanism_id} is absent from the research hydration.`);

  const compiled = witnesses.map(witness => (
    witness?.schema === PEDAGOGUE_RESEARCH_ASSAY_WITNESS_SCHEMA
      ? freeze(clone(witness))
      : compilePedagogueResearchAssayWitness(witness)
  ));
  const ids = compiled.map(item => item.witness_id);
  if (new Set(ids).size !== ids.length) throw new Error('Pedagogue assay witness_id values must be unique.');
  const relevant = compiled.filter(item => item.mechanism_id === mechanism_id);
  if (relevant.length !== compiled.length) {
    throw new Error('Pedagogue mechanism review may not mix assay witnesses from different mechanisms.');
  }

  const supported = relevant.filter(item => item.outcome === 'SUPPORTED_BOUNDED').length;
  const counterexampled = relevant.filter(item => item.outcome === 'COUNTEREXAMPLED_BOUNDED').length;
  const inconclusive = relevant.filter(item => item.outcome === 'INCONCLUSIVE').length;
  const contextFamilies = [...new Set(relevant.map(item => item.context_family))].sort();

  const review = {
    schema: PEDAGOGUE_RESEARCH_MECHANISM_REVIEW_SCHEMA,
    mechanism_id,
    external_research_status: external.status,
    external_cross_domain_witness: external.cross_domain_witness,
    external_unique_source_count: external.unique_source_count,
    external_domain_family_count: external.domain_family_count,
    internal_assay_witness_count: relevant.length,
    internal_context_family_count: contextFamilies.length,
    internal_context_families: freeze(contextFamilies),
    internal_supported_bounded_count: supported,
    internal_counterexampled_bounded_count: counterexampled,
    internal_inconclusive_count: inconclusive,
    internal_assay_witnesses: freeze(relevant),
    learning_state: reviewStatus(external, supported, counterexampled, inconclusive, contextFamilies.length),
    next_learning_action: nextLearningAction(supported, counterexampled, inconclusive, contextFamilies.length),
    pedagogue_law_status: 'NOT_PROMOTED',
    context_family_distinctness_only: true,
    statistical_independence_claim: false,
    relation_identity_claim: false,
    universal_equivalence_claim: false,
    automatic_confidence_aggregation: false,
    promotion_authority: false,
    automatic_redesign: false,
    product_mutation_authorized: false,
    production_mutation_authorized: false,
    external_transmission_authorized: false,
    human_closure_required: true,
    finding: relevant.length
      ? 'Internal bounded assay evidence has been attached to the hydrated transferable relation. Distinct context-family labels prevent repeated fixtures from masquerading as cross-context replication, but those labels do not establish statistical independence. Evidence may support, counterexample, or complicate the relation without promoting it into Pedagogue law.'
      : 'The hydrated transferable relation has no internal bounded assay witness. No Pedagogue law is promoted.'
  };
  noForbidden(review);
  canonicalJson(review);
  return freeze(review);
}
