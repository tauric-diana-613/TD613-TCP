import {
  compilePedagogueResearchTransferCard,
  hydratePedagogueResearch
} from '../../../engine/flowcore-pedagogue-core.js';

export const A15_R0_PEDAGOGUE_LITERATURE_HYDRATION_SCHEMA = 'td613.ash.a15-r0.pedagogue-literature-hydration/v0.1';

const REQUIRED_FOR = Object.freeze({
  ML1_REFERENCE_IDENTIFIABILITY: Object.freeze([
    'VISIBILITY_NOT_IDENTIFIABILITY',
    'REPRESENTATION_AFFECTS_IDENTIFIABILITY',
    'STRUCTURED_NONREPETITION_SUPPORTS_HIERARCHICAL_SIGNAL'
  ]),
  ML2_PROBE_DEPENDENCE: Object.freeze([
    'PROBE_DIVERSITY_NEEDS_DEPENDENCE_CONTROL',
    'VISIBILITY_NOT_IDENTIFIABILITY'
  ]),
  ML3_TEMPORAL_ORDER: Object.freeze([
    'ORDER_IS_PART_OF_PROCESS_STATE'
  ]),
  ML4_REGISTRY_SHIFT: Object.freeze([
    'REGISTRY_SHIFT_IS_DISTINCT_CONTROL_COORDINATE'
  ]),
  ML5_REPRESENTATION_TRANSFORM: Object.freeze([
    'REPRESENTATION_AFFECTS_IDENTIFIABILITY'
  ]),
  ML6_REPLAY_AND_HELDOUT: Object.freeze([
    'PROVENANCE_EVIDENCE_TYPES_ARE_NON_EQUIVALENT',
    'CROSS_DOMAIN_GENERALIZATION_REQUIRES_HELDOUT',
    'TARGET_REALIZATION_REQUIRES_VERIFICATION'
  ]),
  ML7_TRANSPORT_HELD: Object.freeze([
    'HOLONOMY_REQUIRES_DECLARED_TRANSPORT_AND_LOOP',
    'ANALOGUE_MAPPING_REQUIRES_EXPLICIT_NONIDENTITY'
  ])
});

function mechanismSet(hydration) {
  return new Set(hydration.mechanism_reviews.map(item => item.mechanism_id));
}

function assayCard(assayId, mechanisms, present, status, question, falsifier) {
  return Object.freeze({
    assay_id: assayId,
    required_mechanisms: mechanisms,
    mechanisms_present: mechanisms.every(item => present.has(item)),
    status,
    question,
    falsifier,
    promotion_authority: false,
    production_mutation_authorized: false,
    human_closure_required: true
  });
}

export function buildA15R0PedagogueLiteratureHydration(rawCards = []) {
  const cards = rawCards.map(compilePedagogueResearchTransferCard);
  const hydration = hydratePedagogueResearch(cards);
  const present = mechanismSet(hydration);

  const assayQueue = Object.freeze([
    assayCard(
      'ML1_REFERENCE_IDENTIFIABILITY',
      REQUIRED_FOR.ML1_REFERENCE_IDENTIFIABILITY,
      present,
      'NEXT_EXECUTABLE_WITH_CONTROLS',
      'Under matched observation budget, density, noise, and decoder, does structured nonclosure reduce reconstruction ambiguity relative to periodic repetition without claiming phi-specific optimality?',
      'The quasiperiodic condition fails to reduce ambiguity against the periodic control, or a generic aperiodic control equals/exceeds it so any result must be narrowed to nonrepetition rather than phi-specific advantage.'
    ),
    assayCard(
      'ML2_PROBE_DEPENDENCE',
      REQUIRED_FOR.ML2_PROBE_DEPENDENCE,
      present,
      'MINIMUM_CONTROL_REQUIRED_WITH_ML1',
      'Are apparent multi-probe gains independent information or correlated restatements of the same latent sensitivity?',
      'The gain disappears when correlated probes or joint dependence are modeled.'
    ),
    assayCard(
      'ML3_TEMPORAL_ORDER',
      REQUIRED_FOR.ML3_TEMPORAL_ORDER,
      present,
      'HELD_AFTER_ML1_ML2',
      'Can the observer distinguish same-state-set, same-endpoint routes whose temporal order differs?',
      'An order-agnostic model performs equivalently on held-out route permutations.'
    ),
    assayCard(
      'ML4_REGISTRY_SHIFT',
      REQUIRED_FOR.ML4_REGISTRY_SHIFT,
      present,
      'HELD_AFTER_ML1_ML2',
      'Can a declared reference-registry shift be distinguished from route-content mutation?',
      'Registry shift and route mutation remain observationally equivalent under admitted probes.'
    ),
    assayCard(
      'ML5_REPRESENTATION_TRANSFORM',
      REQUIRED_FOR.ML5_REPRESENTATION_TRANSFORM,
      present,
      'HELD_AFTER_NATIVE_RECONSTRUCTION',
      'Can an equivalence-preserving transform expose invariants without adding information or changing the admitted latent equivalence class?',
      'The transformed representation changes invariants, adds unavailable information, or fails held-out reconstruction.'
    ),
    assayCard(
      'ML6_REPLAY_AND_HELDOUT',
      REQUIRED_FOR.ML6_REPLAY_AND_HELDOUT,
      present,
      'RECEIPT_REQUIREMENT',
      'Does every admitted reconstruction retain typed provenance, alternatives, held-out prediction, and explicit defeat conditions?',
      'A reconstruction cannot be replayed or its support relation collapses when a held-out observation is introduced.'
    ),
    assayCard(
      'ML7_TRANSPORT_HELD',
      REQUIRED_FOR.ML7_TRANSPORT_HELD,
      present,
      'HELD_NO_IMPLEMENTATION',
      'Can a reusable local transport law and closed-loop residual observable be defined after route reconstruction is stable?',
      'No stable local transport operator predicts composition, or null/commuting loop controls erase the residual.'
    )
  ]);

  return Object.freeze({
    schema: A15_R0_PEDAGOGUE_LITERATURE_HYDRATION_SCHEMA,
    source_status: 'LITERATURE_DERIVED_RESEARCH_MAP',
    authority_class: 'A2_DERIVATIONAL',
    research_only: true,
    hydration,
    assay_queue: assayQueue,
    next_executable: Object.freeze(['ML1_REFERENCE_IDENTIFIABILITY', 'ML2_PROBE_DEPENDENCE']),
    moss_lantern_ui_required: false,
    live_ash_binding: false,
    proto_loom_implementation: false,
    transport_law_declared: false,
    geometric_holonomy_claim: false,
    phi_optimality_claim: false,
    quantum_behavior_claim: false,
    physical_realization_claim: false,
    promotion_authority: false,
    production_mutated: false,
    external_transmission: false,
    human_closure_required: true,
    finding: 'Pedagogue literature hydration converts recent cross-domain research into bounded assay candidates. ML1 plus minimum ML2 dependence controls is the next executable Moss Lantern research pass; temporal order, registry shift, representation transforms, and transport remain separately staged as hypotheses rather than collapsed into one omnibus assay.'
  });
}
