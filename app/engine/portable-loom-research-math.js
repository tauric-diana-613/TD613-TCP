import { buildGoldenEggFeasibleRegion } from '../dome-world/previews/a15-r0/golden-egg-feasible-region.js';
import { evaluateGoldenEggEpisodeCandidate, DOLLHOUSE_GOLDEN_EGG_SCHEMA } from './dollhouse-claim-lift-runtime.js';

export const PORTABLE_LOOM_RESEARCH_MATH_SCHEMA = 'td613.loom.portable-research-math/v0.1';
const FIVE_SURFACES = Object.freeze(['L', 'R', 'J', 'G', 'C']);
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

/**
 * Recompute the quantitative source kernel instead of copying constants or
 * promoting synthetic factor combinations into an empirical Loom result.
 *
 * This is a research appendix, NOT a task packet, privacy certification,
 * source of receiver authority, or replacement for an origin-side evaluator.
 */
export function buildPortableLoomResearchMathContract() {
  const region = buildGoldenEggFeasibleRegion();
  const absentEpisode = evaluateGoldenEggEpisodeCandidate({});
  const limits = absentEpisode.thresholds;
  if (absentEpisode.schema !== DOLLHOUSE_GOLDEN_EGG_SCHEMA
    || absentEpisode.status === 'CANDIDATE'
    || region.joint_realizability !== 'UNMEASURED'
    || region.empirical_candidate_count !== 0
    || region.golden_egg_earned !== false
    || region.promotion_authority !== false
    || limits.L_max !== region.thresholds.observer_leakage_bits
    || limits.R_max !== region.thresholds.reconstruction_distance
    || limits.J_max !== region.thresholds.joining_synergy_bits) {
    throw new Error('PORTABLE_RESEARCH_MATH_KERNEL_MISMATCH');
  }
  return freeze({
    schema: PORTABLE_LOOM_RESEARCH_MATH_SCHEMA,
    purpose: 'Bounded research mathematics for evaluating an independently captured matched episode',
    mathematical_kernels: {
      feasible_region: region.schema,
      empirical_episode_evaluator: DOLLHOUSE_GOLDEN_EGG_SCHEMA
    },
    surfaces: [...FIVE_SURFACES],
    equations: {
      L: 'I(H;Z) for a declared protected target, observer, channel, and distribution; identify prior information separately',
      R: 'd_T(T(s),s) for declared intended-structure reconstruction; this is not hostile reconstruction of H',
      J: 'I(H;X,Y) - I(H;X) - I(H;Y) under the specified synthetic Boolean model; a signed joint-information excess, not a universal PID',
      G: 'A preregistered geometric object with measured map, calibration, uncertainty and independent binding is required',
      C: 'Observed distinct control and protected returns bound to the same episode, custody, departure and comparison frame'
    },
    thresholds: {...limits},
    calculated_synthetic_region: {
      source_status: region.source_status,
      authority_class: region.authority_class,
      formal_candidate_count: region.formal_candidate_count,
      feasible_candidate_count: region.feasible_candidate_count,
      pareto_candidate_count: region.pareto_candidate_count,
      failure_vectors: {...region.failure_vectors},
      factorization_assumption: region.factorization_assumption,
      jointly_realized: false,
      joint_realizability: region.joint_realizability,
      empirical_candidate_count: region.empirical_candidate_count,
      claim_ceiling: region.claim_ceiling
    },
    empirical_episode_contract: {
      evaluator: 'evaluateGoldenEggEpisodeCandidate',
      preregister_before_acquisition: true,
      immutable_episode_required: true,
      continuous_custody_required: true,
      common_comparison_frame_required: true,
      common_departure_required: true,
      distinct_preregistered_control_and_protected_routes_required: true,
      both_actual_returns_required: true,
      complete_source_and_measurement_bindings_required: true,
      statistical_channel_and_uncertainty_model_required: true,
      geometry_requires_empirical_binding: true,
      status_without_acquisition: 'NOT_RUN'
    },
    receiver_math_is_declaration_only: true,
    locally_measured_episode: false,
    measured_surface_count: 0,
    episode_evaluation_status: 'NOT_RUN',
    earned_empirical_result: false,
    authority_transferred: false
  });
}

export function evaluatePortableLoomResearchEpisode(spec) {
  // Operates on actual supplied records. It never supplies fabricated
  // metrics, routes or exteriority to complete the five-surface contract.
  return evaluateGoldenEggEpisodeCandidate(spec);
}
