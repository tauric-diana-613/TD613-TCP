import { buildOpenResearchHypothesisRegistry } from './open-research-hypothesis-registry.js';
import { runWeddingIdentifiabilityAssay } from './wedding-identifiability-assay.js';

export const IDENTIFIABILITY_FRONTIER_REGISTRY_SCHEMA = 'td613.ash.a15-r0.identifiability-frontier-registry/v0.1';

const freezeHypothesis = value => Object.freeze({
  ...value,
  evidence: Object.freeze({ ...value.evidence }),
  claim_ceiling: String(value.claim_ceiling)
});

export function buildIdentifiabilityFrontierRegistry(options = {}) {
  const baseRegistry = options.baseRegistry || buildOpenResearchHypothesisRegistry();
  const wedding = options.wedding || runWeddingIdentifiabilityAssay();

  if (baseRegistry.sequence_authority !== false || baseRegistry.next_stage !== null || baseRegistry.promotion_authority !== false) {
    throw new Error('Identifiability frontier requires the phase-free A15-R0 registry boundary');
  }

  const extensionHypotheses = Object.freeze([
    freezeHypothesis({
      hypothesis_id: 'H_WEDDING_ASSAY_MECHANISM_VALID',
      question: 'Can the declared finite synthetic Wedding assay distinguish an authored three-probe dependency from matched single/pair baselines, a marginal-preserving relationship shuffle, and a redundant triple negative control?',
      falsifier: 'The positive intact triple fails to beat its best pair or relationship-shuffled control, the shuffle changes declared marginals, or the redundant negative-control triple falsely acquires a gain.',
      evidence: {
        source_status: wedding.source_status,
        fixture_class: wedding.fixture_class,
        relationship_shuffle_marginals_preserved: wedding.relationship_shuffle_marginals_preserved,
        positive_exact_gain_over_best_pair: wedding.positive_control.exact_gain_over_best_pair,
        positive_noisy_gain_over_best_pair_positive: wedding.positive_control.noisy_gain_over_best_pair > 0,
        positive_noisy_gain_over_shuffled_positive: wedding.positive_control.noisy_gain_over_shuffled_triple > 0,
        negative_noisy_gain_over_best_pair: wedding.negative_control.noisy_gain_over_best_pair,
        assay_mechanism_validated: wedding.assay_mechanism_validated
      },
      status: wedding.assay_mechanism_validated
        ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_FAMILY'
        : 'FALSIFIED_IN_SYNTHETIC_FIELD',
      claim_ceiling: 'FINITE_Z3_SYNTHETIC_ASSAY_MECHANISM_ONLY'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_TRIPLE_IDENTIFIABILITY_SYNERGY',
      question: 'Does the lab-authored TD613 reference + structured-nonclosure + relational-probe architecture provide stable latent-state identifiability unavailable to matched singles, pairs, and relationship-shuffled triples?',
      falsifier: 'Under a declared live/synthetic TD613 forward model and matched observation budget, the intact triple fails to outperform the best pair, or any gain survives destruction of cross-regime relationships while marginals are preserved.',
      evidence: {
        synthetic_assay_mechanism_validated: wedding.assay_mechanism_validated,
        synthetic_positive_exact_gain_over_best_pair: wedding.positive_control.exact_gain_over_best_pair,
        synthetic_relationship_shuffle_marginals_preserved: wedding.relationship_shuffle_marginals_preserved,
        td613_d3_phi_m_forward_model: 'UNDECLARED',
        td613_d3_phi_m_measurement: 'UNMEASURED',
        td613_relationship_shuffled_control: 'UNMEASURED',
        physical_realization: 'UNMEASURED'
      },
      status: 'OPEN_UNMEASURED',
      claim_ceiling: 'ASSAY_CALIBRATION_EXISTS; TD613_TRIPLE_IDENTIFIABILITY_AND_SYNERGY_UNMEASURED'
    })
  ]);

  const boundedSupport = extensionHypotheses
    .filter(item => item.status.startsWith('SUPPORTED'))
    .map(item => item.hypothesis_id);
  const closedByCounterexample = extensionHypotheses
    .filter(item => item.status.startsWith('FALSIFIED'))
    .map(item => item.hypothesis_id);
  const researchFrontier = extensionHypotheses
    .filter(item => item.status.startsWith('OPEN'))
    .map(item => item.hypothesis_id);

  return Object.freeze({
    schema: IDENTIFIABILITY_FRONTIER_REGISTRY_SCHEMA,
    source_status: 'DERIVED_FROM_SIMULATED_FIELD',
    authority_class: 'A2_DERIVATIONAL',
    base_registry_schema: baseRegistry.schema,
    base_hypothesis_count: baseRegistry.hypotheses.length,
    extension_hypotheses: extensionHypotheses,
    bounded_support: Object.freeze(boundedSupport),
    closed_by_counterexample: Object.freeze(closedByCounterexample),
    research_frontier: Object.freeze(researchFrontier),
    sequence_authority: false,
    next_stage: null,
    stage_unlocks: Object.freeze([]),
    promotion_authority: false,
    production_mutated: false,
    external_transmission: false,
    human_closure_required: true,
    finding: wedding.assay_mechanism_validated
      ? 'The Wedding assay mechanism survives its declared finite synthetic positive, shuffle, and negative controls. The TD613 triple identifiability hypothesis remains OPEN_UNMEASURED and receives no promotion authority.'
      : 'The Wedding assay mechanism failed a declared finite synthetic control. The TD613 triple identifiability hypothesis remains OPEN_UNMEASURED and receives no promotion authority.'
  });
}
