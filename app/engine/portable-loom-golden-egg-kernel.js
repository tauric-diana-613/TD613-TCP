import { analyzeFiniteChannel } from '../dome-world/holonomy-loom/observer-channel.js';
import { evaluateGoldenEggEpisodeCandidate } from './dollhouse-claim-lift-runtime.js';

export const PORTABLE_LOOM_GOLDEN_EGG_KERNEL_SCHEMA = 'td613.loom.portable-golden-egg-research/v0.1';

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

// Contract, rather than a verdict. The portable session has no observer population,
// distribution, hostile trace or observed matched return merely by being exported.
export function createPortableLoomGoldenEggKernel() {
  return freeze({
    schema: PORTABLE_LOOM_GOLDEN_EGG_KERNEL_SCHEMA,
    status: 'HELD_UNMEASURED',
    golden_egg_earned: false,
    evidence_class: 'RESEARCH_CONTRACT_ONLY',
    empirical_credit: 0,
    mathematical_target: {
      surfaces: ['L', 'R', 'J', 'G', 'C'],
      same_immutable_episode_required: true,
      common_departure_and_comparison_frame_required: true,
      continuous_custody_required: true,
      distinct_preregistered_control_and_protected_routes_required: true,
      distinct_observed_matched_returns_required: true,
      thresholds: { leakage_bits_max: 0.5, reconstruction_distance_max: 0.2, joining_synergy_bits_max: 0.1 },
      L: 'Historical L is observer leakage defined on the preregistered target secret, distribution, observer and measured channel. Total I(H;Z) and conditional I(H;Z|B,K) are different estimands; the latter cannot silently replace historical L.',
      R: 'Distance between intended authorized operation or structure and receiver reconstruction under a registered transform family; never substitute hostile reconstruction of the protected target.',
      J: 'Preregister a joining-synergy estimand and observer trace groups. The finite chamber reports a signed excess diagnostic; that diagnostic alone is not the inherited Golden Egg J surface. The sign and higher-order interactions matter.',
      G: 'Preregistered geometric object, empirical measurement map, calibration, uncertainty and independent binding; glyphs and route names are not measurements.',
      C: 'Control and protected returns actually observed on distinct routes under the same comparison frame.'
    },
    mathematical_method: {
      finite_channel_kernel: 'app/dome-world/holonomy-loom/observer-channel.js',
      empirical_episode_evaluator: 'app/engine/dollhouse-claim-lift-runtime.js',
      finite_entropy: 'H(X)=-sum_x p(x) log2 p(x); positive safe-integer masses define the full synthetic law.',
      conditional_leakage: 'I(H;Z|B,K)=I(H;B,K,Z)-I(H;B,K). This proposed baseline refinement is distinct from inherited unconditional L; do not use it as a replacement for the historical threshold without preregistered reconciliation.',
      reconstruction: 'R requires independently specified ground truth and a registered operation-relative distance. Receiver utility and hostile reconstruction are different quantities.',
      joined_information: 'Finite signed excess = I(H;A,B|B0,K)-I(H;A|B0,K)-I(H;B|B0,K), where B0 is the stated observer baseline. This synthetic diagnostic is not automatically the empirical J estimand or a curvature.',
      caveats: ['No population distribution means no measured mutual information.', 'Synthetic finite enumeration has zero empirical credit.', 'Marginal or separate-episode passes do not jointly qualify.', 'The finite chamber signed-excess diagnostic cannot be relabeled as Golden Egg J.', 'Conditional baseline refinement cannot silently replace inherited observer leakage L.', 'A matching local digest does not authenticate outside origin or privacy.', 'Provider access to selected inputs is outside any claim of observer blindness.']
    },
    observation: { L: null, R: null, J: null, G: null, C: null },
    claim_ceiling: 'The kernel defines how evidence could be evaluated. Exporting it proves neither privacy nor a five-surface empirical result.'
  });
}

// The existing two mathematical evaluators do the work. No proxy scalarization,
// threshold fabrication or synthetic-to-empirical promotion occurs here.
export function evaluatePortableLoomGoldenEggEvidence({
  finite_channel_model = null, selected_channels, empirical_episode = null
} = {}) {
  const contract = createPortableLoomGoldenEggKernel();
  const finite = finite_channel_model === null
    ? null : analyzeFiniteChannel(finite_channel_model, selected_channels);
  const episode = empirical_episode === null
    ? null : evaluateGoldenEggEpisodeCandidate(empirical_episode);
  return freeze({
    schema: 'td613.loom.portable-golden-egg-evaluation/v0.1',
    status: episode ? episode.status : 'HELD_NO_EMPIRICAL_EPISODE',
    finite_synthetic_calculation: finite,
    local_episode_evaluation: episode,
    five_surface_empirical_observation: null,
    empirical_credit: 0,
    golden_egg_earned: false,
    source_contract: contract.schema,
    claim_ceiling: 'These local calculations neither authenticate empirical sources nor award the Golden Egg.'
  });
}
