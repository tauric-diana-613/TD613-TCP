import { buildOpenResearchHypothesisRegistry } from './open-research-hypothesis-registry.js';
import { runWeddingIdentifiabilityAssay } from './wedding-identifiability-assay.js';

export const IDENTIFIABILITY_FRONTIER_REGISTRY_SCHEMA = 'td613.ash.a15-r0.identifiability-frontier-registry/v0.1';

const freezeHypothesis = value => Object.freeze({
  ...value,
  evidence: Object.freeze({ ...value.evidence }),
  claim_ceiling: String(value.claim_ceiling)
});

function buildMossLanternHypotheses(moss) {
  if (!moss) return [];
  if (moss.schema !== 'td613.ash.a15-r0.moss-lantern-reference-identifiability/v0.1') {
    throw new Error('Identifiability frontier received an unsupported Moss Lantern assay schema');
  }
  if (moss.promotion_authority !== false || moss.production_mutated !== false || moss.live_ash_binding !== false) {
    throw new Error('Moss Lantern frontier evidence must remain research-only with closed promotion and production authority');
  }

  const nonrepetitionSupported = moss.findings?.assay_mechanism_validated === true
    && moss.findings?.structured_nonclosure_beats_periodic === true
    && moss.findings?.generic_aperiodic_beats_periodic === true
    && moss.findings?.probe_diversity_matters_under_matched_budget === true;
  const phiSpecificAdvantage = moss.findings?.phi_specific_advantage_over_generic_aperiodic === true;

  return [
    freezeHypothesis({
      hypothesis_id: 'H_MOSS_LANTERN_NONREPETITION_REFERENCE_ASSAY',
      question: 'Inside the finite Moss Lantern reference-registry fixture, does breaking short periodic repetition reduce registry aliasing under matched density, observation budget, noise, decoder, and probe-dependence controls?',
      falsifier: 'The structured-nonclosure and generic aperiodic conditions fail to reduce ambiguity and improve noisy recovery relative to periodic repetition, or the apparent gain disappears when probe-position diversity is reduced under the same observation budget.',
      evidence: {
        source_status: moss.source_status,
        fixture_id: moss.fixture_id,
        observation_budget: moss.observation_budget,
        periodic_mean_candidate_set_size: moss.results.PERIODIC.independent_probes.mean_candidate_set_size,
        phi_mean_candidate_set_size: moss.results.PHI_IRRATIONAL_ROTATION.independent_probes.mean_candidate_set_size,
        aperiodic_mean_candidate_set_size: moss.results.DETERMINISTIC_APERIODIC_CONTROL.independent_probes.mean_candidate_set_size,
        periodic_noisy_exact_registry_recovery_rate: moss.results.PERIODIC.independent_probes.noisy_exact_registry_recovery_rate,
        phi_noisy_exact_registry_recovery_rate: moss.results.PHI_IRRATIONAL_ROTATION.independent_probes.noisy_exact_registry_recovery_rate,
        aperiodic_noisy_exact_registry_recovery_rate: moss.results.DETERMINISTIC_APERIODIC_CONTROL.independent_probes.noisy_exact_registry_recovery_rate,
        density_matched: moss.controls.density_matched,
        probe_diversity_matters_under_matched_budget: moss.findings.probe_diversity_matters_under_matched_budget
      },
      status: nonrepetitionSupported
        ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE'
        : 'FALSIFIED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE',
      claim_ceiling: 'FINITE_MOSS_LANTERN_REFERENCE_REGISTRY_ASSAY_ONLY; generic nonrepetition/anti-aliasing inside this fixture, not phi optimality or live TD613 geometry.'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_PHI_SPECIFIC_ANTI_ALIASING_ADVANTAGE',
      question: 'Inside this matched finite synthetic reference fixture, does the phi/irrational-rotation reference outperform the deterministic non-phi aperiodic control?',
      falsifier: 'The matched deterministic non-phi aperiodic control equals or exceeds the phi reference on candidate ambiguity or noisy exact registry recovery.',
      evidence: {
        phi_mean_candidate_set_size: moss.results.PHI_IRRATIONAL_ROTATION.independent_probes.mean_candidate_set_size,
        aperiodic_mean_candidate_set_size: moss.results.DETERMINISTIC_APERIODIC_CONTROL.independent_probes.mean_candidate_set_size,
        phi_noisy_exact_registry_recovery_rate: moss.results.PHI_IRRATIONAL_ROTATION.independent_probes.noisy_exact_registry_recovery_rate,
        aperiodic_noisy_exact_registry_recovery_rate: moss.results.DETERMINISTIC_APERIODIC_CONTROL.independent_probes.noisy_exact_registry_recovery_rate,
        phi_specific_advantage_over_generic_aperiodic: moss.findings.phi_specific_advantage_over_generic_aperiodic
      },
      status: phiSpecificAdvantage
        ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE'
        : 'FALSIFIED_AS_PHI_SPECIFIC_SUPERIORITY_IN_BOUNDED_SYNTHETIC_FIXTURE',
      claim_ceiling: 'COUNTEREXAMPLE_SCOPE_IS_THIS_FINITE_SYNTHETIC_REFERENCE_FIXTURE_ONLY; does not falsify all phi/quasiperiodic architectures or establish generic aperiodic optimality.'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_TD613_PHI_ANTI_ALIASING',
      question: 'Does the lab-authored TD613 structured-nonclosure regime provide stable anti-aliasing or identifiability benefit beyond matched periodic and generic non-phi aperiodic controls under an explicitly declared TD613 forward model?',
      falsifier: 'Under a declared TD613 forward operator, matched controls, held-out latent states, and dependence-aware probes, the phi/quasiperiodic regime fails to improve stable identifiability beyond periodic and generic aperiodic alternatives.',
      evidence: {
        moss_lantern_nonrepetition_fixture_support: nonrepetitionSupported,
        moss_lantern_phi_specific_superiority: phiSpecificAdvantage,
        td613_phi_forward_model: 'UNDECLARED',
        td613_phi_measurement: 'UNMEASURED',
        td613_generic_aperiodic_control: 'UNMEASURED',
        held_out_td613_latent_states: 'UNMEASURED'
      },
      status: 'OPEN_UNMEASURED',
      claim_ceiling: 'MOSS_LANTERN_CALIBRATION_EXISTS; LIVE_TD613_PHI_ANTI_ALIASING_UNMEASURED'
    })
  ];
}

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
    }),
    ...buildMossLanternHypotheses(options.moss)
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

  const mossIncluded = Boolean(options.moss);
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
    finding: mossIncluded
      ? 'Wedding calibration and Moss Lantern ML1+ML2 provide bounded synthetic assay evidence. Generic nonrepetition reduced reference aliasing in the Moss fixture, while phi-specific superiority was counterexampled there. Live TD613 phi anti-aliasing and triple identifiability remain OPEN_UNMEASURED with no promotion authority.'
      : wedding.assay_mechanism_validated
        ? 'The Wedding assay mechanism survives its declared finite synthetic positive, shuffle, and negative controls. The TD613 triple identifiability hypothesis remains OPEN_UNMEASURED and receives no promotion authority.'
        : 'The Wedding assay mechanism failed a declared finite synthetic control. The TD613 triple identifiability hypothesis remains OPEN_UNMEASURED and receives no promotion authority.'
  });
}
