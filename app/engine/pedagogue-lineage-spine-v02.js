import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, noForbidden, object, strings, text } from './flowcore-pedagogue-utils.js';
import {
  PEDAGOGUE_LINEAGE_NODES as BASE_NODES,
  PEDAGOGUE_LINEAGE_LENSES,
  PEDAGOGUE_LINEAGE_CHALLENGE_CARDS as BASE_CHALLENGE_CARDS
} from './pedagogue-lineage-spine.js';

export const PEDAGOGUE_LINEAGE_SPINE_SCHEMA = 'td613.flowcore.pedagogue-lineage-spine/v0.2';
export const PEDAGOGUE_LINEAGE_REVIEW_SCHEMA = 'td613.flowcore.pedagogue-lineage-review/v0.2';

export const PEDAGOGUE_LINEAGE_STAGES = Object.freeze([
  'ASP_DOCUMENTED_CONSTELLATION',
  'FLOW_CORE_GOVERNANCE',
  'DOME_WORLD_CHILD_LIBERATION',
  'TD613_PEDAGOGUE_OPERATIONALIZATION'
]);

export const PEDAGOGUE_LINEAGE_FINDING_POSTURES = Object.freeze([
  'CONVERGENCE',
  'DIVERGENCE',
  'NORMATIVE_ASSUMPTION',
  'EMPIRICAL_CLAIM',
  'DERIVATIONAL_CLAIM',
  'UNVERIFIED_SOURCE_CLAIM'
]);

function extensionEvolutionNote(node) {
  if (node.node_id === 'STEINER') {
    return 'Later TD613 routing separates pedagogy, Anthroposophic metaphysics, epistemic-refraction use, active-observation recurrence, and racial-hierarchy quarantine instead of treating the corpus as one authority object.';
  }
  return node.evolution_note;
}

export const PEDAGOGUE_LINEAGE_NODES = Object.freeze(BASE_NODES.map((node) => freeze({
  ...node,
  routed_through: freeze([...node.routed_through]),
  evolution_note: extensionEvolutionNote(node)
})));

export const PEDAGOGUE_LINEAGE_CHALLENGE_CARDS = Object.freeze([
  ...BASE_CHALLENGE_CARDS,
  freeze({
    card_id: 'challenge-steiner-goethe-organism-2025',
    target_node: 'STEINER',
    relation: 'COMPLICATES_AND_EXTENDS',
    source_reference: 'doi:10.1007/s40656-025-00681-7',
    finding: 'A 2025 history-and-philosophy-of-life-sciences paper reconstructs the Goethe-to-Steiner route as sustained observation plus imaginative re-enactment of transformation before conceptual articulation. This is philosophical/historical support for a method lineage, not empirical validation of Anthroposophic metaphysical claims.',
    authority_ceiling: 'SCHOLARLY_CHALLENGE_ONLY'
  }),
  freeze({
    card_id: 'challenge-waldorf-active-observation-2026',
    target_node: 'STEINER',
    relation: 'SUPPORTS_AND_BOUNDS',
    source_reference: 'doi:10.1007/s44217-026-01523-9',
    finding: 'A 2026 Discover Education perspective characterizes Waldorf science teaching by direct sensory observation and postponement of theoretical judgment, while explicitly describing the comparison as preliminary and calling for empirical study. It can challenge Pedagogue cadence/order mechanisms but cannot establish outcome superiority.',
    authority_ceiling: 'SCHOLARLY_CHALLENGE_ONLY'
  }),
  freeze({
    card_id: 'challenge-goethean-imagination-2026',
    target_node: 'STEINER',
    relation: 'COMPLICATES',
    source_reference: 'doi:10.1177/00221678261421324',
    finding: 'A 2026 phenomenology/Goethean-science paper treats cultivated imagination as a disciplined qualitative investigative tool intertwined with perception. This supports a question about transformation-following and observer activity; it does not authorize hidden-state claims or metaphysical verification.',
    authority_ceiling: 'SCHOLARLY_CHALLENGE_ONLY'
  })
]);

function nodeById(id) {
  return PEDAGOGUE_LINEAGE_NODES.find((node) => node.node_id === id);
}

function lensById(id) {
  return PEDAGOGUE_LINEAGE_LENSES.find((lens) => lens.lens_id === id);
}

export function compilePedagogueLineageSpine() {
  const spine = {
    schema: PEDAGOGUE_LINEAGE_SPINE_SCHEMA,
    version: '0.2',
    synthesis_owner: 'POTATO_FLOW_CORE_DOME_WORLD',
    stages: PEDAGOGUE_LINEAGE_STAGES,
    nodes: PEDAGOGUE_LINEAGE_NODES,
    lenses: PEDAGOGUE_LINEAGE_LENSES,
    challenge_cards: PEDAGOGUE_LINEAGE_CHALLENGE_CARDS,
    genealogy_rule: 'SOURCE_LINEAGES_TO_POTATO_SYNTHESIS_TO_PEDAGOGUE_OPERATIONALIZATION',
    chronology_semantics: freeze({
      first_documented_in_is_not_proven_first_introduction: true,
      undocumented_earlier_states_remain_possible: true,
      later_reweighting_does_not_rewrite_earlier_presence: true,
      base_spine_chronology_safe: true,
      scholarly_extension_does_not_rewrite_base_chronology: true
    }),
    flat_saint_list_forbidden: true,
    thinker_vote_forbidden: true,
    convergence_is_truth: false,
    lineage_is_runtime_authority: false,
    promotion_authority: false,
    automatic_redesign: false,
    human_closure_required: true
  };
  canonicalJson(spine);
  return freeze(spine);
}

export function tracePedagogueLineage(nodeId) {
  const node = nodeById(text(nodeId, 'nodeId').toUpperCase());
  if (!node) throw new Error(`Unknown Pedagogue lineage node: ${nodeId}`);
  const challenges = PEDAGOGUE_LINEAGE_CHALLENGE_CARDS.filter((card) => card.target_node === node.node_id);
  const trace = {
    schema: 'td613.flowcore.pedagogue-lineage-trace/v0.2',
    node,
    challenge_cards: freeze(challenges),
    synthesis_owner: 'POTATO_FLOW_CORE_DOME_WORLD',
    chronology_semantics: freeze({
      first_documented_in_is_not_first_introduction_claim: true,
      later_reweighting_preserved: node.evolution_note !== null
    }),
    authority: freeze({ promotion_authority: false, runtime_authority_transferred: false, human_closure_required: true })
  };
  canonicalJson(trace);
  return freeze(trace);
}

export function compilePedagogueLineageReview(input = {}) {
  noForbidden(input);
  const value = object(input, 'input');
  const selected = strings(value.selected_lenses, 'selected_lenses', 1).map((id) => id.toUpperCase());
  const unique = [...new Set(selected)];
  const lenses = unique.map((id) => {
    const lens = lensById(id);
    if (!lens) throw new Error(`Unknown Pedagogue lineage lens: ${id}`);
    return freeze({
      ...lens,
      provenance: freeze(lens.provenance_nodes.map((nodeId) => {
        const node = nodeById(nodeId);
        return freeze({
          node_id: node.node_id,
          display_name: node.display_name,
          first_documented_in: node.first_documented_in,
          introduction_precision: node.introduction_precision,
          routed_through: node.routed_through,
          evolution_note: node.evolution_note
        });
      }))
    });
  });

  const findings = Array.isArray(value.findings) ? value.findings.map((finding, index) => {
    const f = object(finding, `findings[${index}]`);
    const lens_id = text(f.lens_id, `findings[${index}].lens_id`).toUpperCase();
    if (!unique.includes(lens_id)) throw new Error(`Finding references lens not selected for review: ${lens_id}`);
    const posture = text(f.posture, `findings[${index}].posture`).toUpperCase();
    if (!PEDAGOGUE_LINEAGE_FINDING_POSTURES.includes(posture)) throw new Error(`Unsupported lineage finding posture: ${posture}`);
    return freeze({ lens_id, posture, note: text(f.note, `findings[${index}].note`) });
  }) : [];

  const review = {
    schema: PEDAGOGUE_LINEAGE_REVIEW_SCHEMA,
    review_id: text(value.review_id, 'review_id'),
    selected_lenses: freeze(lenses),
    findings: freeze(findings),
    convergence_count: findings.filter((finding) => finding.posture === 'CONVERGENCE').length,
    divergence_count: findings.filter((finding) => finding.posture === 'DIVERGENCE').length,
    convergence_creates_authority: false,
    thinker_vote_forbidden: true,
    recommendation_only: true,
    automatic_redesign: false,
    product_mutation_authorized: false,
    production_mutation_authorized: false,
    human_closure_required: true
  };
  canonicalJson(review);
  return freeze(review);
}
