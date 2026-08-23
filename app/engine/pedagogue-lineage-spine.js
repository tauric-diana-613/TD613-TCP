import { canonicalJson } from '../dome-world/ash/canonical-json.js';
import { freeze, noForbidden, object, strings, text } from './flowcore-pedagogue-utils.js';

export const PEDAGOGUE_LINEAGE_SPINE_SCHEMA = 'td613.flowcore.pedagogue-lineage-spine/v0.2';
export const PEDAGOGUE_LINEAGE_REVIEW_SCHEMA = 'td613.flowcore.pedagogue-lineage-review/v0.1';

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

const AUTHORITY_CEILING = 'PROVENANCE_AND_QUESTION_FORMATION_ONLY';
const QUARANTINED_AUTHORITY = 'PROVENANCE_ONLY_RUNTIME_AUTHORITY_FORBIDDEN';
const ASP_PRECISION = 'DOCUMENTED_AT_OR_BEFORE_SUPPLIED_ASP_EXCERPT_EARLIER_SPINE_STATE_UNRESOLVED';
const FLOW_PRECISION = 'DOCUMENTED_IN_SUPPLIED_FLOW_CORE_GOVERNANCE_CORPUS';
const DOME_PRECISION = 'DOCUMENTED_IN_SUPPLIED_DOME_WORLD_CHILD_LIBERATION_CORPUS';

function relation(relation_id, source_concept, potato_synthesis, operationalized_as, options = {}) {
  return freeze({
    relation_id,
    source_concept,
    potato_synthesis,
    operationalized_as: freeze([...operationalized_as]),
    tensions: freeze([...(options.tensions || [])]),
    authority_ceiling: options.authority_ceiling || AUTHORITY_CEILING
  });
}

function provenanceNode({ node_id, display_name, kind, first_documented_in, introduction_precision, routed_through, sources, relations, evolution_note = null }) {
  return freeze({
    node_id,
    display_name,
    kind,
    first_documented_in,
    introduction_precision,
    routed_through: freeze([...routed_through]),
    evolution_note,
    sources: freeze([...sources]),
    relations: freeze([...relations])
  });
}

export const PEDAGOGUE_LINEAGE_NODES = Object.freeze([
  provenanceNode({
    node_id: 'MONTESSORI',
    display_name: 'Maria Montessori',
    kind: 'THINKER',
    first_documented_in: 'ASP_DOCUMENTED_CONSTELLATION',
    introduction_precision: ASP_PRECISION,
    routed_through: ['DOME_WORLD_CHILD_LIBERATION', 'TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: [
      'Montessori prepared-environment tradition',
      'Marshall 2017 npj Science of Learning review · doi:10.1038/s41539-017-0012-7'
    ],
    relations: [
      relation('PREPARED_ENVIRONMENT', 'Prepared environments can support self-directed engagement and legible action.', 'Environment should carry part of the teaching burden instead of escalating command.', ['PREPARED_ENVIRONMENT', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY']),
      relation('UNINTERRUPTED_ENGAGEMENT', 'Sustained self-directed work is structurally supported by time, space, and accessible materials.', 'Deep engagement should not be broken solely for institutional convenience.', ['RHYTHM_AND_CADENCE', 'TEMPORAL_SOVEREIGNTY'])
    ]
  }),
  provenanceNode({
    node_id: 'MALAGUZZI',
    display_name: 'Loris Malaguzzi / Reggio Emilia',
    kind: 'THINKER_AND_PEDAGOGICAL_TRADITION',
    first_documented_in: 'ASP_DOCUMENTED_CONSTELLATION',
    introduction_precision: ASP_PRECISION,
    routed_through: ['DOME_WORLD_CHILD_LIBERATION', 'TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: [
      'Reggio Emilia environment-as-third-teacher tradition',
      'Strong-Wilson & Ellis · doi:10.1080/00405840709336547',
      'Schroeder-Yu · doi:10.1080/15411790801910735'
    ],
    relations: [
      relation('ENVIRONMENT_AS_THIRD_TEACHER', 'Spatial and material organization participates in learning.', 'The world should answer through legible consequence rather than explanation alone.', ['THIRD_TEACHER_DOCUMENTATION', 'PREPARED_ENVIRONMENT']),
      relation('PEDAGOGICAL_DOCUMENTATION', 'Documentation can make inquiry and process visible rather than reduce them to a score.', 'Receipts should preserve route/process and permit later reflection or replay.', ['THIRD_TEACHER_DOCUMENTATION', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'])
    ]
  }),
  provenanceNode({
    node_id: 'STEINER',
    display_name: 'Rudolf Steiner',
    kind: 'THINKER_CONTESTED_MULTI_ROUTE',
    first_documented_in: 'ASP_DOCUMENTED_CONSTELLATION',
    introduction_precision: ASP_PRECISION,
    routed_through: ['DOME_WORLD_CHILD_LIBERATION', 'TD613_PEDAGOGUE_OPERATIONALIZATION'],
    evolution_note: 'Later TD613 routing separates pedagogy, Anthroposophic metaphysics, epistemic-refraction use, and racial-hierarchy quarantine instead of treating the corpus as one authority object.',
    sources: [
      'Steiner/Waldorf educational tradition',
      'Anthroposophic metaphysical corpus',
      'Staudenmaier 2008 Nova Religio · doi:10.1525/nr.2008.11.3.4',
      'Hansson 2025 Aura · doi:10.31265/aura.791'
    ],
    relations: [
      relation('RHYTHM_AND_CADENCE', 'Learning is organized through rhythm and developmental/experiential cadence rather than administrative interruption.', 'Sequence validity includes timing; a valid relation can be named too early or a process interrupted before consequence becomes available.', ['RHYTHM_AND_CADENCE', 'TEMPORAL_SOVEREIGNTY'], { tensions: ['Seven-year developmental schemes are not runtime authority and are not learner-ranking inputs.'] }),
      relation('INTEGRATED_ACTIVITY', 'Artistic, practical, and intellectual activity are integrated rather than treated as isolated channels.', 'Multiple representations may support one route without being collapsed into one scalar or modality.', ['EXPERIENCE_CONTINUITY']),
      relation('ANTHROPOSOPHIC_METAPHYSICS', 'Anthroposophy contains metaphysical claims about supersensible history, memory, and spiritual development.', 'Retain as routed metaphysical provenance and a source of questions about observation beyond ordinary documentary surfaces; do not silently convert metaphysical claims into empirical measurements.', ['EPISTEMIC_REFRACTION'], { tensions: ['Metaphysical claim != empirical verification.'] }),
      relation('EPISTEMIC_REFRACTION', 'A claimed mode of access and the interpretation placed upon what is accessed are non-identical.', 'Use Steiner as a forensic training case for access != interpretation != authority; preserve conditions and inherited ontology in the receipt.', ['EPISTEMIC_REFRACTION', 'THIRD_TEACHER_DOCUMENTATION'], { tensions: ['Useful access or observation does not sanitize source interpretation.'] }),
      relation('RACIAL_HIERARCHY_QUARANTINE', 'Steiner’s corpus includes racial/evolutionary hierarchy documented in scholarly criticism.', 'Preserve the historical contamination as provenance while forbidding racial hierarchy, developmental racial ranking, or inherited racial ontology from runtime logic.', ['RACIAL_HIERARCHY_QUARANTINE'], { authority_ceiling: QUARANTINED_AUTHORITY, tensions: ['Quarantine != erasure; salvage != exoneration.'] })
    ]
  }),
  provenanceNode({
    node_id: 'DEWEY',
    display_name: 'John Dewey',
    kind: 'THINKER',
    first_documented_in: 'DOME_WORLD_CHILD_LIBERATION',
    introduction_precision: DOME_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['Experience and Education (1938)'],
    relations: [
      relation('EXPERIENCE_CONTINUITY', 'Learning arises through continuity and interaction with lived experience.', 'A route should connect consequence to later transfer rather than fragment experience into administratively convenient tasks.', ['EXPERIENCE_CONTINUITY', 'TEMPORAL_SOVEREIGNTY'])
    ]
  }),
  provenanceNode({
    node_id: 'MILLER',
    display_name: 'Alice Miller',
    kind: 'THINKER',
    first_documented_in: 'ASP_DOCUMENTED_CONSTELLATION',
    introduction_precision: ASP_PRECISION,
    routed_through: ['DOME_WORLD_CHILD_LIBERATION', 'TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['For Your Own Good'],
    relations: [
      relation('ANTI_PATHOLOGIZATION', 'Distress or resistance may be intelligible inside coercive relational conditions rather than evidence of a defective child.', 'Interrogate environmental and relational structure before locating failure inside a person.', ['ANTI_PATHOLOGIZATION', 'RELATIONAL_SAFETY'])
    ]
  }),
  provenanceNode({
    node_id: 'LAING',
    display_name: 'R. D. Laing',
    kind: 'THINKER',
    first_documented_in: 'ASP_DOCUMENTED_CONSTELLATION',
    introduction_precision: ASP_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['ASP advocacy lineage as supplied by Potato; exact source work unresolved in current corpus'],
    relations: [
      relation('ANTI_PATHOLOGIZATION', 'Behavior can become intelligible when reconstructed within its relational situation.', 'Do not infer psychological defect from an observation when contextual explanation remains unresolved.', ['ANTI_PATHOLOGIZATION'], { tensions: ['Current corpus preserves lineage attribution but requires source-specific scholarly verification before stronger historical claims.'] })
    ]
  }),
  provenanceNode({
    node_id: 'GRAEBER',
    display_name: 'David Graeber',
    kind: 'THINKER',
    first_documented_in: 'ASP_DOCUMENTED_CONSTELLATION',
    introduction_precision: ASP_PRECISION,
    routed_through: ['FLOW_CORE_GOVERNANCE', 'DOME_WORLD_CHILD_LIBERATION', 'TD613_PEDAGOGUE_OPERATIONALIZATION'],
    evolution_note: 'The supplied ASP formulation already names Graeber; later Flow-Core/Dome-World work substantially reweights his role toward claims on Time, bureaucracy, interpretive labor, category calcification, and release. Exact first-entry date before the supplied ASP record remains unresolved.',
    sources: ['Debt: The First 5,000 Years', 'The Utopia of Rules', 'Dead Zones of the Imagination'],
    relations: [
      relation('INTERPRETIVE_LABOR', 'Bureaucratic power can distribute explanation, waiting, translation, and imaginative labor asymmetrically.', 'Measure route burden and who must perform interpretive work for a system to function.', ['INTERPRETIVE_LABOR', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY']),
      relation('CLAIM_ON_TIME', 'Administrative obligation can function as a claim on human time.', 'Institutional Time audits should expose which clock controls action, registration, waiting, and release.', ['TEMPORAL_SOVEREIGNTY', 'INSTITUTIONAL_TIME']),
      relation('CATEGORY_CALCIFICATION', 'Bureaucratic process can become self-sealing as accumulated procedure perpetuates its own necessity.', 'Treat categories as revisable states; preserve release, contradiction, and route out of a hardened classification.', ['LEGIBILITY_WITHOUT_EXPERT_MONOPOLY', 'DROMOLOGICAL_COMPRESSION'])
    ]
  }),
  provenanceNode({
    node_id: 'GRAEBER_WENGROW',
    display_name: 'David Graeber & David Wengrow',
    kind: 'THINKER_PAIR',
    first_documented_in: 'FLOW_CORE_GOVERNANCE',
    introduction_precision: FLOW_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['The Dawn of Everything (2021)'],
    relations: [
      relation('NOVEL_ENCOUNTER_EDGE', 'Novel social possibilities can emerge at encounters among non-identical forms.', 'Cross-domain recurrence may generate a research candidate, never automatic ontology.', ['EXPERIENCE_CONTINUITY'])
    ]
  }),
  provenanceNode({
    node_id: 'GATTO',
    display_name: 'John Taylor Gatto',
    kind: 'THINKER_CONTESTED',
    first_documented_in: 'DOME_WORLD_CHILD_LIBERATION',
    introduction_precision: DOME_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['Dumbing Us Down (1992)'],
    relations: [
      relation('FRAGMENTED_INSTITUTIONAL_TIME_CRITIQUE', 'Compulsory schooling is criticized as fragmenting attention and subordinating judgment to external scheduling.', 'Use only as a provenance route for Institutional Time questions; historical-causal claims require independent evidence.', ['TEMPORAL_SOVEREIGNTY', 'DROMOLOGICAL_COMPRESSION'], { tensions: ['Polemic lineage != established causal history.'] })
    ]
  }),
  provenanceNode({
    node_id: 'JACOBS',
    display_name: 'Jane Jacobs',
    kind: 'THINKER',
    first_documented_in: 'DOME_WORLD_CHILD_LIBERATION',
    introduction_precision: DOME_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['The Death and Life of Great American Cities (1961)'],
    relations: [
      relation('RELATIONAL_SAFETY', 'Everyday presence and distributed social relation can support public safety without totalizing institutional surveillance.', 'Audit whether safety comes from legible relation and distributed witness or opaque containment alone.', ['RELATIONAL_SAFETY', 'COMMUNITY_EMBEDDEDNESS'])
    ]
  }),
  provenanceNode({
    node_id: 'ASHIWI_SPATIAL_KNOWLEDGE',
    display_name: 'A:shiwi / Zuni spatial knowledge as routed by Potato',
    kind: 'ROUTED_LIVING_KNOWLEDGE',
    first_documented_in: 'DOME_WORLD_CHILD_LIBERATION',
    introduction_precision: DOME_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['Potato Phase 3 routed architectural discussion; living knowledge not directly represented by TD613'],
    relations: [
      relation('COMMUNITY_EMBEDDEDNESS', 'Potato reads multigenerational, multi-use, community-embedded space as a counterexample to age-segregated institutional learning.', 'Keep learning inside one navigable shared world rather than building a sealed specialist children’s world.', ['COMMUNITY_EMBEDDEDNESS', 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY'], { tensions: ['Routed knowledge != direct representation; relation != permission to universalize a people.'] })
    ]
  }),
  provenanceNode({
    node_id: 'INDIGENOUS_RELATIONAL_EPISTEMOLOGIES_ROUTED',
    display_name: 'Indigenous relational epistemologies as routed by Potato',
    kind: 'ROUTED_KNOWLEDGE_FAMILY',
    first_documented_in: 'FLOW_CORE_GOVERNANCE',
    introduction_precision: FLOW_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['Potato Phase 3: engaged through reflective study rather than direct representation'],
    relations: [
      relation('RELATIONAL_EPISTEMOLOGY', 'Meaning and knowledge are routed as relational rather than detached from conditions of transmission.', 'Preserve source relation, protocol, and limits instead of stripping a claim into an ownerless primitive.', ['THIRD_TEACHER_DOCUMENTATION', 'COMMUNITY_EMBEDDEDNESS'], { tensions: ['No pan-Indigenous generalization or direct representation authority.'] })
    ]
  }),
  provenanceNode({
    node_id: 'TRADITIONAL_CHINESE_PROCESS_LINEAGE_ROUTED',
    display_name: 'Traditional Chinese process-oriented thought as routed by Potato',
    kind: 'ROUTED_KNOWLEDGE_FAMILY',
    first_documented_in: 'FLOW_CORE_GOVERNANCE',
    introduction_precision: FLOW_PRECISION,
    routed_through: ['TD613_PEDAGOGUE_OPERATIONALIZATION'],
    sources: ['Potato Phase 3: process-oriented understandings of balance and flow in traditional Chinese medical thought'],
    relations: [
      relation('PROCESS_OVER_STATIC_CATEGORY', 'Potato uses process-oriented balance/flow as a route away from static categorical capture.', 'Model transitions, release, and changing state rather than treating categories as terminal ontology.', ['DROMOLOGICAL_COMPRESSION'], { tensions: ['Routed analogy != medical claim or authority.'] })
    ]
  })
]);

export const PEDAGOGUE_LINEAGE_LENSES = Object.freeze([
  freeze({ lens_id: 'PREPARED_ENVIRONMENT', question: 'Could the environment make the appropriate action legible without additional command?', provenance_nodes: freeze(['MONTESSORI', 'MALAGUZZI']) }),
  freeze({ lens_id: 'THIRD_TEACHER_DOCUMENTATION', question: 'What is the environment teaching through its structure, and is the process witnessed rather than merely scored?', provenance_nodes: freeze(['MALAGUZZI', 'INDIGENOUS_RELATIONAL_EPISTEMOLOGIES_ROUTED']) }),
  freeze({ lens_id: 'EXPERIENCE_CONTINUITY', question: 'Does this route connect lived consequence to later transfer rather than fragment experience into isolated tasks?', provenance_nodes: freeze(['DEWEY', 'STEINER', 'GRAEBER_WENGROW']) }),
  freeze({ lens_id: 'RHYTHM_AND_CADENCE', question: 'Is a valid process being temporally coerced, prematurely named, or interrupted before its consequence becomes available?', provenance_nodes: freeze(['STEINER', 'MONTESSORI']) }),
  freeze({ lens_id: 'ANTI_PATHOLOGIZATION', question: 'Are we locating failure inside a person when the observed response may be structurally or relationally intelligible?', provenance_nodes: freeze(['MILLER', 'LAING']) }),
  freeze({ lens_id: 'INTERPRETIVE_LABOR', question: 'Who must explain, translate, wait, appeal, or comply for the system to function?', provenance_nodes: freeze(['GRAEBER']) }),
  freeze({ lens_id: 'RELATIONAL_SAFETY', question: 'Is safety produced through legible relation and mutual accountability, or merely through opaque containment?', provenance_nodes: freeze(['JACOBS', 'MILLER']) }),
  freeze({ lens_id: 'COMMUNITY_EMBEDDEDNESS', question: 'Is knowledge embedded in a navigable shared world or segregated into a managed specialist zone?', provenance_nodes: freeze(['ASHIWI_SPATIAL_KNOWLEDGE', 'MALAGUZZI', 'JACOBS']) }),
  freeze({ lens_id: 'TEMPORAL_SOVEREIGNTY', question: 'Whose clock controls the transition, and can rest, dwell, and exit remain structurally available?', provenance_nodes: freeze(['STEINER', 'MONTESSORI', 'DEWEY', 'GRAEBER', 'GATTO']) }),
  freeze({ lens_id: 'LEGIBILITY_WITHOUT_EXPERT_MONOPOLY', question: 'Can a participant inspect enough of the mechanism to participate without surrendering interpretive sovereignty?', provenance_nodes: freeze(['MONTESSORI', 'MALAGUZZI', 'GRAEBER', 'ASHIWI_SPATIAL_KNOWLEDGE']) }),
  freeze({ lens_id: 'EPISTEMIC_REFRACTION', question: 'What is the difference between an access claim, the interpretation imposed on it, and the authority later granted to that interpretation?', provenance_nodes: freeze(['STEINER']) }),
  freeze({ lens_id: 'RACIAL_HIERARCHY_QUARANTINE', question: 'Does any derived mechanism import racial hierarchy, racialized developmental ranking, or authority from a contaminated source route?', provenance_nodes: freeze(['STEINER']) }),
  freeze({ lens_id: 'INSTITUTIONAL_TIME', question: 'Did institutional action begin before registration or causal context caught up, and which actor clock governed the consequence?', provenance_nodes: freeze(['GRAEBER', 'GATTO', 'DEWEY']) }),
  freeze({ lens_id: 'DROMOLOGICAL_COMPRESSION', question: 'Which relational distinctions disappeared when a process was compressed into an administratively cheaper registered state?', provenance_nodes: freeze(['GRAEBER', 'GATTO', 'TRADITIONAL_CHINESE_PROCESS_LINEAGE_ROUTED']) })
]);

export const PEDAGOGUE_LINEAGE_CHALLENGE_CARDS = Object.freeze([
  freeze({ card_id: 'challenge-montessori-evidence-review-2017', target_node: 'MONTESSORI', relation: 'SUPPORTS_AND_BOUNDS', source_reference: 'doi:10.1038/s41539-017-0012-7', finding: 'Review identifies prepared environment and self-directed engagement as central Montessori elements while noting limits in the evaluation evidence base.', authority_ceiling: 'SCHOLARLY_CHALLENGE_ONLY' }),
  freeze({ card_id: 'challenge-reggio-third-teacher-2007', target_node: 'MALAGUZZI', relation: 'SUPPORTS', source_reference: 'doi:10.1080/00405840709336547', finding: 'Scholarship explicitly examines Reggio Emilia environment-as-third-teacher as educational provocation and spatial pedagogy.', authority_ceiling: 'SCHOLARLY_CHALLENGE_ONLY' }),
  freeze({ card_id: 'challenge-reggio-documentation-2008', target_node: 'MALAGUZZI', relation: 'SUPPORTS', source_reference: 'doi:10.1080/15411790801910735', finding: 'Documentation is treated as a dynamic classroom practice that makes process visible rather than serving decoration alone.', authority_ceiling: 'SCHOLARLY_CHALLENGE_ONLY' }),
  freeze({ card_id: 'challenge-steiner-race-2008', target_node: 'STEINER', relation: 'QUARANTINES', source_reference: 'doi:10.1525/nr.2008.11.3.4', finding: 'Historical scholarship documents racial and ethnic hierarchy inside Steiner’s Anthroposophic corpus.', authority_ceiling: 'QUARANTINE_SUPPORT_ONLY' }),
  freeze({ card_id: 'challenge-steiner-race-2025', target_node: 'STEINER', relation: 'QUARANTINES', source_reference: 'doi:10.31265/aura.791', finding: 'Recent scholarly analysis documents Steiner racial teachings and traces their reception in Anthroposophical movements.', authority_ceiling: 'QUARANTINE_SUPPORT_ONLY' }),
  freeze({ card_id: 'challenge-waldorf-curriculum-2024', target_node: 'STEINER', relation: 'COMPLICATES', source_reference: 'doi:10.3389/feduc.2024.1306092', finding: 'Contemporary Waldorf scholarship treats the curriculum as historically transmitted and continually adapted rather than a frozen original.', authority_ceiling: 'SCHOLARLY_CHALLENGE_ONLY' })
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
      later_reweighting_does_not_rewrite_earlier_presence: true
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
  return freeze({
    schema: 'td613.flowcore.pedagogue-lineage-trace/v0.2',
    node,
    challenge_cards: freeze(challenges),
    synthesis_owner: 'POTATO_FLOW_CORE_DOME_WORLD',
    authority: freeze({ promotion_authority: false, runtime_authority_transferred: false, human_closure_required: true })
  });
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
          routed_through: node.routed_through
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
