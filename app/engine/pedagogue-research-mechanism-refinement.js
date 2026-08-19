import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, noForbidden, object, strings, text } from './flowcore-pedagogue-utils.js';
import { PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA } from './pedagogue-research-transfer.js';
import {
  PEDAGOGUE_RESEARCH_ASSAY_WITNESS_SCHEMA,
  PEDAGOGUE_RESEARCH_MECHANISM_REVIEW_SCHEMA
} from './pedagogue-research-assay-witness.js';

export const PEDAGOGUE_RESEARCH_MECHANISM_REFINEMENT_SCHEMA = 'td613.flowcore.pedagogue-research-mechanism-refinement/v0.1';
export const PEDAGOGUE_RESEARCH_REFINEMENT_POSTURES = Object.freeze([
  'PROPOSED_FROM_MULTI_CONTEXT_INTERNAL_ASSAYS',
  'PROPOSED_FROM_MIXED_INTERNAL_ASSAYS'
]);

const MECHANISM_RE = /^[A-Z][A-Z0-9_]{2,127}$/;

function uniqueStrings(values, label) {
  const out = strings(values, label, 1);
  if (new Set(out).size !== out.length) throw new Error(`${label} values must be unique.`);
  return out;
}

export function compilePedagogueResearchMechanismRefinement(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const hydration = object(value.hydration, 'hydration');
  const review = object(value.mechanism_review, 'mechanism_review');
  const proposal = object(value.proposal, 'proposal');

  if (hydration.schema !== PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA) {
    throw new Error('Mechanism refinement requires a governed Pedagogue research hydration.');
  }
  if (review.schema !== PEDAGOGUE_RESEARCH_MECHANISM_REVIEW_SCHEMA) {
    throw new Error('Mechanism refinement requires a governed Pedagogue mechanism review.');
  }
  if (review.pedagogue_law_status !== 'NOT_PROMOTED' || review.promotion_authority !== false) {
    throw new Error('Mechanism refinement requires an unpromoted parent review with closed promotion authority.');
  }

  const parent_mechanism_id = text(proposal.parent_mechanism_id, 'proposal.parent_mechanism_id').toUpperCase();
  const candidate_mechanism_id = text(proposal.candidate_mechanism_id, 'proposal.candidate_mechanism_id').toUpperCase();
  if (!MECHANISM_RE.test(parent_mechanism_id) || !MECHANISM_RE.test(candidate_mechanism_id)) {
    throw new Error('Mechanism identifiers must be uppercase generic relation identifiers.');
  }
  if (candidate_mechanism_id === parent_mechanism_id) {
    throw new Error('Candidate refinement must be narrower than and distinct from the parent mechanism identifier.');
  }
  if (review.mechanism_id !== parent_mechanism_id) {
    throw new Error('Mechanism refinement parent must match the governed mechanism review.');
  }
  if (!hydration.mechanism_reviews.some(item => item.mechanism_id === parent_mechanism_id)) {
    throw new Error('Mechanism refinement parent is absent from the governed research hydration.');
  }

  const supportingWitnessIds = uniqueStrings(proposal.supporting_witness_ids, 'proposal.supporting_witness_ids');
  if (supportingWitnessIds.length < 2) {
    throw new Error('Multi-context mechanism refinement requires at least two bounded internal assay witnesses.');
  }
  const witnessMap = new Map((review.internal_assay_witnesses || []).map(witness => [witness.witness_id, witness]));
  const witnesses = supportingWitnessIds.map(id => {
    const witness = witnessMap.get(id);
    if (!witness || witness.schema !== PEDAGOGUE_RESEARCH_ASSAY_WITNESS_SCHEMA) {
      throw new Error(`Supporting witness ${id} is absent from the governed mechanism review.`);
    }
    if (witness.mechanism_id !== parent_mechanism_id) {
      throw new Error('Supporting witnesses may not mix parent mechanisms.');
    }
    return witness;
  });

  const contextFamilies = [...new Set(witnesses.map(witness => witness.context_family))].sort();
  if (contextFamilies.length < 2) {
    throw new Error('Multi-context mechanism refinement requires at least two declared context families.');
  }
  const declaredContexts = uniqueStrings(proposal.supporting_context_families, 'proposal.supporting_context_families').sort();
  if (JSON.stringify(declaredContexts) !== JSON.stringify(contextFamilies)) {
    throw new Error('Declared supporting context families must exactly match the selected bounded witnesses.');
  }

  const supported = witnesses.filter(witness => witness.outcome === 'SUPPORTED_BOUNDED').length;
  const counterexampled = witnesses.filter(witness => witness.outcome === 'COUNTEREXAMPLED_BOUNDED').length;
  const inconclusive = witnesses.filter(witness => witness.outcome === 'INCONCLUSIVE').length;
  if (counterexampled === 0 && supported < 2) {
    throw new Error('A convergent multi-context refinement requires at least two supported bounded witnesses.');
  }
  if (counterexampled > 0 && supported < 1) {
    throw new Error('A mixed-evidence refinement requires at least one supported bounded witness.');
  }

  const posture = counterexampled > 0
    ? 'PROPOSED_FROM_MIXED_INTERNAL_ASSAYS'
    : 'PROPOSED_FROM_MULTI_CONTEXT_INTERNAL_ASSAYS';
  const refinementStatus = counterexampled > 0
    ? 'MIXED_EVIDENCE_REFINEMENT_CANDIDATE'
    : 'INTERNALLY_SUPPORTED_REFINEMENT_CANDIDATE';

  const refinement = {
    schema: PEDAGOGUE_RESEARCH_MECHANISM_REFINEMENT_SCHEMA,
    proposal_id: text(proposal.proposal_id, 'proposal.proposal_id'),
    parent_mechanism_id,
    candidate_mechanism_id,
    proposal_posture: posture,
    refinement_status: refinementStatus,
    operational_definition: text(proposal.operational_definition, 'proposal.operational_definition'),
    scope_conditions: freeze(strings(proposal.scope_conditions, 'proposal.scope_conditions', 1)),
    failure_modes: freeze(strings(proposal.failure_modes, 'proposal.failure_modes', 1)),
    supporting_witness_ids: freeze([...supportingWitnessIds]),
    supporting_context_families: freeze([...contextFamilies]),
    supporting_witness_count: witnesses.length,
    distinct_context_family_count: contextFamilies.length,
    supported_bounded_count: supported,
    counterexampled_bounded_count: counterexampled,
    inconclusive_count: inconclusive,
    discriminating_assays: freeze(strings(proposal.discriminating_assays, 'proposal.discriminating_assays', 1)),
    counterexample_conditions: freeze(strings(proposal.counterexample_conditions, 'proposal.counterexample_conditions', 1)),
    alternative_explanations_remaining: freeze(strings(
      proposal.alternative_explanations_remaining,
      'proposal.alternative_explanations_remaining',
      1
    )),
    next_learning_action: counterexampled > 0
      ? 'RUN_DISCRIMINATING_ASSAY'
      : 'RUN_DISCRIMINATING_APERTURE_ASSAY',
    claim_ceiling: text(proposal.claim_ceiling, 'proposal.claim_ceiling'),
    evidence_posture: freeze({
      internal_multi_context_assay_derived: true,
      context_family_distinctness_only: true,
      statistical_independence_claim: false,
      parent_mechanism_revalidated: false,
      candidate_mechanism_is_law: false
    }),
    authority: freeze({
      parent_mechanism_replaced: false,
      pedagogue_law_promoted: false,
      relation_identity_claim: false,
      universal_equivalence_claim: false,
      automatic_confidence_aggregation: false,
      automatic_redesign: false,
      product_mutation_authorized: false,
      production_mutation_authorized: false,
      external_transmission_authorized: false,
      human_closure_required: true
    }),
    finding: counterexampled > 0
      ? 'Multi-context internal assay evidence is mixed. The candidate refinement is retained only as a discriminating-assay target; contradiction remains visible and no Pedagogue law is promoted.'
      : 'At least two declared internal context families support the narrower operational mechanism as a refinement candidate. Context labels do not establish statistical independence, the parent relation is not replaced, and no Pedagogue law is promoted.'
  };

  noForbidden(refinement);
  canonicalJson(refinement);
  return freeze(refinement);
}
