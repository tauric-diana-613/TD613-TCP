import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, noForbidden, object, strings, text } from './flowcore-pedagogue-utils.js';

export const PEDAGOGUE_RESEARCH_TRANSFER_CARD_SCHEMA = 'td613.flowcore.pedagogue-research-transfer-card/v0.1';
export const PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA = 'td613.flowcore.pedagogue-research-hydration/v0.1';

export const PEDAGOGUE_RESEARCH_SOURCE_CLASSES = Object.freeze([
  'PRIMARY_PEER_REVIEWED',
  'PRIMARY_ACCEPTED',
  'PRIMARY_PREPRINT'
]);

const DATE_RE = /^\d{4}-\d{2}(?:-\d{2})?$/;
const MECHANISM_RE = /^[A-Z][A-Z0-9_]{2,95}$/;
const DOMAIN_FAMILY_RE = /^[A-Z][A-Z0-9_]{2,63}$/;

function source(input) {
  const value = object(input, 'source');
  const source_class = text(value.source_class, 'source.source_class').toUpperCase();
  if (!PEDAGOGUE_RESEARCH_SOURCE_CLASSES.includes(source_class)) {
    throw new Error(`Unsupported research source class: ${source_class}`);
  }
  const publication_date = text(value.publication_date, 'source.publication_date');
  if (!DATE_RE.test(publication_date)) throw new Error('source.publication_date must be YYYY-MM or YYYY-MM-DD.');
  return freeze({
    title: text(value.title, 'source.title'),
    venue: text(value.venue, 'source.venue'),
    publication_date,
    source_class,
    source_reference: text(value.source_reference, 'source.source_reference'),
    peer_reviewed: source_class === 'PRIMARY_PEER_REVIEWED',
    preprint: source_class === 'PRIMARY_PREPRINT'
  });
}

export function compilePedagogueResearchTransferCard(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const mechanism_id = text(value.mechanism_id, 'mechanism_id').toUpperCase();
  if (!MECHANISM_RE.test(mechanism_id)) throw new Error('mechanism_id must be an uppercase generic relation identifier.');
  const card = {
    schema: PEDAGOGUE_RESEARCH_TRANSFER_CARD_SCHEMA,
    card_id: text(value.card_id, 'card_id'),
    source: source(value.source),
    domain_family: text(value.domain_family, 'domain_family').toUpperCase(),
    domain_tags: strings(value.domain_tags, 'domain_tags', 1),
    mechanism_id,
    observed_relation: text(value.observed_relation, 'observed_relation'),
    transferable_relation: text(value.transferable_relation, 'transferable_relation'),
    admissible_assays: strings(value.admissible_assays, 'admissible_assays', 1),
    alternative_explanations: strings(value.alternative_explanations, 'alternative_explanations', 1),
    falsifiers: strings(value.falsifiers, 'falsifiers', 1),
    forbidden_inferences: strings(value.forbidden_inferences, 'forbidden_inferences', 1),
    evidence_posture: freeze({
      external_literature_observation: true,
      td613_transfer_is_hypothesis: true,
      raw_source_content_ingested: false,
      source_authority_transferred: false,
      domain_ontology_promoted: false
    }),
    authority: freeze({
      promotion_authority: false,
      automatic_redesign: false,
      product_mutation_authorized: false,
      production_mutation_authorized: false,
      external_transmission_authorized: false,
      human_closure_required: true
    }),
    claim_ceiling: text(value.claim_ceiling, 'claim_ceiling')
  };
  if (!DOMAIN_FAMILY_RE.test(card.domain_family)) throw new Error('domain_family must be an uppercase generic family identifier.');
  canonicalJson(card);
  return freeze(card);
}

function summarizeMechanism(mechanismId, cards) {
  const domainFamilies = [...new Set(cards.map(card => card.domain_family))].sort();
  const domainTags = [...new Set(cards.flatMap(card => card.domain_tags))].sort();
  const sourceClasses = [...new Set(cards.map(card => card.source.source_class))].sort();
  const sourceReferences = [...new Set(cards.map(card => card.source.source_reference))].sort();
  const peerReviewedCount = cards.filter(card => card.source.peer_reviewed).length;
  const preprintCount = cards.filter(card => card.source.preprint).length;
  const crossDomainWitness = sourceReferences.length >= 2 && domainFamilies.length >= 2;
  return freeze({
    mechanism_id: mechanismId,
    witness_count: cards.length,
    unique_source_count: sourceReferences.length,
    domain_family_count: domainFamilies.length,
    domain_families: domainFamilies,
    domain_tags: domainTags,
    source_classes: sourceClasses,
    peer_reviewed_count: peerReviewedCount,
    preprint_count: preprintCount,
    cross_domain_witness: crossDomainWitness,
    status: crossDomainWitness ? 'CROSS_DOMAIN_REVIEW_CANDIDATE' : 'SINGLE_DOMAIN_OBSERVATION',
    promotion_authority: false,
    human_closure_required: true
  });
}

export function hydratePedagogueResearch(cards = []) {
  if (!Array.isArray(cards) || cards.length < 2) throw new Error('Research hydration requires at least two transfer cards.');
  const compiled = cards.map(card => card?.schema === PEDAGOGUE_RESEARCH_TRANSFER_CARD_SCHEMA
    ? freeze(clone(card))
    : compilePedagogueResearchTransferCard(card));
  const ids = compiled.map(card => card.card_id);
  if (new Set(ids).size !== ids.length) throw new Error('Research hydration card_id values must be unique.');
  compiled.forEach(noForbidden);

  const byMechanism = new Map();
  compiled.forEach(card => {
    const list = byMechanism.get(card.mechanism_id) || [];
    list.push(card);
    byMechanism.set(card.mechanism_id, list);
  });

  const mechanisms = [...byMechanism.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mechanismId, mechanismCards]) => summarizeMechanism(mechanismId, mechanismCards));
  const crossDomainCandidates = mechanisms
    .filter(item => item.cross_domain_witness)
    .map(item => item.mechanism_id);
  const sourceReferences = [...new Set(compiled.map(card => card.source.source_reference))].sort();
  const domainFamilies = [...new Set(compiled.map(card => card.domain_family))].sort();
  const domainTags = [...new Set(compiled.flatMap(card => card.domain_tags))].sort();

  const hydration = {
    schema: PEDAGOGUE_RESEARCH_HYDRATION_SCHEMA,
    source_status: 'EXTERNAL_LITERATURE_STRUCTURED',
    research_only: true,
    card_count: compiled.length,
    unique_source_count: sourceReferences.length,
    domain_family_count: domainFamilies.length,
    domain_families: domainFamilies,
    domain_tags: domainTags,
    peer_reviewed_count: compiled.filter(card => card.source.peer_reviewed).length,
    preprint_count: compiled.filter(card => card.source.preprint).length,
    cards: freeze(compiled),
    mechanism_reviews: freeze(mechanisms),
    cross_domain_review_candidates: freeze(crossDomainCandidates),
    pedagogue_learning_posture: 'HYPOTHESIS_GENERATION_AND_ASSAY_DESIGN_ONLY',
    promotion_authority: false,
    automatic_redesign: false,
    product_mutation_authorized: false,
    production_mutation_authorized: false,
    external_transmission_authorized: false,
    human_closure_required: true,
    finding: crossDomainCandidates.length
      ? 'Cross-domain transferable-relation candidates were identified for independent testing; none is promoted into Pedagogue law.'
      : 'No transferable relation has enough cross-domain witnesses for review; no Pedagogue law is promoted.'
  };
  noForbidden(hydration);
  canonicalJson(hydration);
  return freeze(hydration);
}
