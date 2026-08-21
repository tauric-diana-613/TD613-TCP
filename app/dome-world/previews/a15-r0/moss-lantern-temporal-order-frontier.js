import { buildIdentifiabilityFrontierRegistry } from './identifiability-frontier-registry.js';

export const MOSS_LANTERN_TEMPORAL_ORDER_FRONTIER_SCHEMA = 'td613.ash.a15-r0.moss-lantern-temporal-order-frontier/v0.1';

const freeze = value => Object.freeze({ ...value, evidence: Object.freeze({ ...(value.evidence || {}) }) });

export function buildMossLanternTemporalOrderFrontier({ baseFrontier = null, temporal }) {
  if (!temporal || temporal.schema !== 'td613.ash.a15-r0.moss-lantern-temporal-order/v0.1') {
    throw new Error('Temporal-order frontier requires a governed Moss Lantern ML3 assay receipt.');
  }
  if (temporal.promotion_authority !== false || temporal.production_mutated !== false || temporal.live_ash_binding !== false) {
    throw new Error('Temporal-order frontier requires closed promotion, production, and live-Ash authority.');
  }
  const base = baseFrontier || buildIdentifiabilityFrontierRegistry();
  if (base.sequence_authority !== false || base.next_stage !== null || base.promotion_authority !== false) {
    throw new Error('Temporal-order frontier requires the phase-free A15-R0 frontier boundary.');
  }

  const supported = temporal.findings?.assay_mechanism_validated === true;
  const extensionHypotheses = Object.freeze([
    freeze({
      hypothesis_id: 'H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY',
      question: 'Can the finite Moss Lantern ML3 inverse model reconstruct the order of the same four operations from a terminal two-coordinate witness while boundaries, endpoint, operation multiset, and observation budget are fixed?',
      falsifier: 'The order-sensitive operator family fails to separate all 24 permutations or fails the noisy calibration threshold, the commuting null acquires order information, or route/timestamp information leaks through the observer firewall.',
      evidence: {
        source_status: temporal.source_status,
        latent_route_count: temporal.latent_route_count,
        observation_budget: temporal.observation_budget,
        positive_unique_signature_count: temporal.positive_control.unique_signature_count,
        positive_noisy_exact_recovery_rate: temporal.positive_control.noisy_exact_recovery_rate,
        positive_noncommuting_pair_count: temporal.positive_control.pairwise_noncommuting_pair_count,
        null_unique_signature_count: temporal.commuting_null.unique_signature_count,
        null_ambiguous_decode_rate: temporal.commuting_null.ambiguous_decode_rate,
        order_blind_candidate_set_size: temporal.order_blind_aggregate_null.candidate_set_size,
        observer_firewall_intact: Object.entries(temporal.controls.observer_firewall)
          .filter(([key]) => key !== 'observation_budget_coordinates')
          .every(([, value]) => value === false)
      },
      status: supported ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_TEMPORAL_FIXTURE' : 'FALSIFIED_IN_BOUNDED_SYNTHETIC_TEMPORAL_FIXTURE',
      claim_ceiling: 'FINITE_CLASSICAL_MOSS_LANTERN_TEMPORAL_ORDER_CALIBRATION_ONLY'
    }),
    freeze({
      hypothesis_id: 'H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY',
      question: 'Does a declared TD613 process retain stable, reconstructable temporal-order information beyond endpoint and state-set equivalence under admitted measurements?',
      falsifier: 'Under a declared TD613 forward operator, matched state-set/endpoint controls, held-out route orders, and leakage-free observation, order-aware reconstruction fails to outperform temporally flattened and commuting/order-erasing controls.',
      evidence: {
        moss_lantern_ml3_supported: supported,
        td613_forward_operator: 'UNDECLARED',
        td613_temporal_measurement: 'UNMEASURED',
        td613_order_blind_control: 'UNMEASURED',
        td613_order_erasing_control: 'UNMEASURED',
        held_out_td613_route_orders: 'UNMEASURED'
      },
      status: 'OPEN_UNMEASURED',
      claim_ceiling: 'MOSS_LANTERN_TEMPORAL_CALIBRATION_EXISTS; LIVE_TD613_TEMPORAL_ORDER_IDENTIFIABILITY_UNMEASURED'
    })
  ]);

  const boundedSupport = Object.freeze([
    ...(base.bounded_support || []),
    ...(supported ? ['H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY'] : [])
  ]);
  const closedByCounterexample = Object.freeze([
    ...(base.closed_by_counterexample || []),
    ...(!supported ? ['H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY'] : [])
  ]);
  const researchFrontier = Object.freeze([
    ...(base.research_frontier || []),
    'H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY'
  ]);

  return Object.freeze({
    schema: MOSS_LANTERN_TEMPORAL_ORDER_FRONTIER_SCHEMA,
    source_status: 'DERIVED_FROM_SIMULATED_FIELD',
    authority_class: 'A2_DERIVATIONAL',
    base_frontier_schema: base.schema,
    base_extension_hypothesis_count: base.extension_hypotheses?.length ?? 0,
    extension_hypotheses: extensionHypotheses,
    bounded_support: boundedSupport,
    closed_by_counterexample: closedByCounterexample,
    research_frontier: researchFrontier,
    sequence_authority: false,
    next_stage: null,
    stage_unlocks: Object.freeze([]),
    promotion_authority: false,
    production_mutated: false,
    external_transmission: false,
    human_closure_required: true,
    finding: supported
      ? 'Moss Lantern ML3 provides a bounded classical synthetic temporal-order reconstruction witness. It adds assay evidence for ORDER_IS_PART_OF_PROCESS_STATE while live TD613 temporal-order identifiability remains OPEN_UNMEASURED.'
      : 'Moss Lantern ML3 failed at least one declared calibration control. Live TD613 temporal-order identifiability remains OPEN_UNMEASURED and no research relation is promoted.'
  });
}
