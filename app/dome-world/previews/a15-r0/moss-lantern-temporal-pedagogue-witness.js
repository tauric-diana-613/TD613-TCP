import { compilePedagogueResearchAssayWitness } from '../../../engine/flowcore-pedagogue-core.js';

export const MOSS_LANTERN_ML3_PEDAGOGUE_WITNESS_ID = 'moss-lantern.ml3.temporal-order/v0.1';

export function compileMossLanternMl3PedagogueWitness(assay) {
  if (!assay || assay.schema !== 'td613.ash.a15-r0.moss-lantern-temporal-order/v0.1') {
    throw new Error('ML3 Pedagogue witness requires the governed Moss Lantern temporal-order assay.');
  }
  if (assay.promotion_authority !== false || assay.production_mutated !== false || assay.live_ash_binding !== false) {
    throw new Error('ML3 Pedagogue witness requires closed promotion, production, and live-Ash authority.');
  }
  const supported = assay.findings?.assay_mechanism_validated === true;
  return compilePedagogueResearchAssayWitness({
    witness_id: MOSS_LANTERN_ML3_PEDAGOGUE_WITNESS_ID,
    mechanism_id: 'ORDER_IS_PART_OF_PROCESS_STATE',
    assay_reference: 'A15-R0 Moss Lantern ML3 temporal-order tomography calibration',
    assay_schema: assay.schema,
    assay_source_status: assay.source_status,
    outcome: supported ? 'SUPPORTED_BOUNDED' : 'COUNTEREXAMPLED_BOUNDED',
    declared_controls: [
      'same operation multiset across all 24 latent routes',
      'same endpoint and fixed route boundaries',
      'two-coordinate observation budget',
      'commuting operator null',
      'order-blind multiset/endpoint null',
      'observer receives no route labels or timestamps',
      'Pedagogue full route-memory comparator excluded from observer'
    ],
    observations: [
      `positive unique signatures = ${assay.positive_control.unique_signature_count}/${assay.latent_route_count}`,
      `positive noisy exact recovery = ${assay.positive_control.noisy_exact_recovery_rate}`,
      `positive pairwise noncommuting matrix pairs = ${assay.positive_control.pairwise_noncommuting_pair_count}`,
      `commuting-null unique signatures = ${assay.commuting_null.unique_signature_count}`,
      `commuting-null mean candidate set size = ${assay.commuting_null.mean_candidate_set_size}`,
      `commuting-null ambiguous decode rate = ${assay.commuting_null.ambiguous_decode_rate}`,
      `order-blind candidate set size = ${assay.order_blind_aggregate_null.candidate_set_size}`
    ],
    falsifier_outcome: supported
      ? 'Declared positive, commuting-null, order-blind, and observer-firewall gates all passed in the bounded synthetic fixture.'
      : 'At least one declared positive, null, or observer-firewall gate failed; the bounded transferable-relation witness is counterexampled rather than supported.',
    alternative_explanations_remaining: [
      'The authored finite operator family may be unusually well separated relative to other classical process families.',
      'The two-coordinate witness construction may not transfer to a live TD613 forward operator.',
      'Order sensitivity may disappear under larger latent families, different noise models, or independently authored operators.'
    ],
    claim_ceiling: 'INTERNAL_BOUNDED_CLASSICAL_TEMPORAL_ORDER_ASSAY_WITNESS_ONLY; does not establish a Pedagogue law, live TD613 temporal-order identifiability, physical noncommutativity, quantum temporal tomography, connection, curvature, or holonomy.'
  });
}
