import { runBoundedTransformationEnvelope } from './bounded-transformation-envelope.js';
import { runBooleanSynergyCensus } from './boolean-synergy-census.js';
import { runInformationGeometryCalibration } from './information-geometry-calibration.js';
import { runOpenResearchField } from './open-research-field.js';

export const OPEN_RESEARCH_HYPOTHESIS_REGISTRY_SCHEMA = 'td613.ash.a15-r0.open-research-hypothesis-registry/v0.1';

const freezeHypothesis = value => Object.freeze({
  ...value,
  evidence: Object.freeze({ ...value.evidence }),
  claim_ceiling: String(value.claim_ceiling)
});

export function buildOpenResearchHypothesisRegistry(options = {}) {
  const field = options.field || runOpenResearchField();
  const envelope = options.envelope || runBoundedTransformationEnvelope({ field });
  const booleanCensus = options.booleanCensus || runBooleanSynergyCensus();
  const geometry = options.geometry || runInformationGeometryCalibration();
  const rankCases = Object.fromEntries(field.rank_leakage_non_equivalence.cases.map(item => [item.case_id, item]));
  const rankOne = rankCases.RANK1_DISTINGUISHABLE_SCALAR;
  const rankThree = rankCases.RANK3_OBSERVER_INDEPENDENT;
  const nullGap = field.observability.null_policy_observer_model_gap_bits;
  const joining = field.joining_key_synergy;
  const reconstruction = field.reconstruction;

  const hypotheses = Object.freeze([
    freezeHypothesis({
      hypothesis_id: 'H_OBSERVER_INVARIANT_NULL',
      question: 'Does null-content emission remain low-information when the declared observer model expands?',
      falsifier: 'A declared observer model produces higher mutual information than the content-only observer under the same null policy.',
      evidence: {
        content_only_bits: field.observability.null_policy_best_case_information_bits,
        expanded_observer_bits: field.observability.null_policy_worst_case_information_bits,
        observer_gap_bits: nullGap
      },
      status: nullGap > 0 ? 'FALSIFIED_IN_SYNTHETIC_FIELD' : 'OPEN',
      claim_ceiling: 'FINITE_SYNTHETIC_OBSERVER_FAMILY_ONLY'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_RANK_ORDERS_LEAKAGE',
      question: 'Does larger structural projection rank imply larger observer mutual information?',
      falsifier: 'A lower-rank case yields higher mutual information than a higher-rank case.',
      evidence: {
        lower_rank: rankOne.structural_rank,
        lower_rank_information_bits: rankOne.mutual_information_bits,
        higher_rank: rankThree.structural_rank,
        higher_rank_information_bits: rankThree.mutual_information_bits
      },
      status: rankOne.structural_rank < rankThree.structural_rank && rankOne.mutual_information_bits > rankThree.mutual_information_bits
        ? 'FALSIFIED_IN_SYNTHETIC_FIELD'
        : 'OPEN',
      claim_ceiling: 'DECLARED_SYNTHETIC_CHANNELS_ONLY'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_MARGINAL_SAFETY_IMPLIES_JOINT_SAFETY',
      question: 'Do individually uninformative features remain uninformative after joining?',
      falsifier: 'Both marginal mutual informations are zero while joint mutual information is positive.',
      evidence: {
        feature_a_bits: joining.feature_a_information_bits,
        feature_b_bits: joining.feature_b_information_bits,
        joint_bits: joining.joint_information_bits,
        synergy_proxy_bits: joining.joining_synergy_proxy_bits
      },
      status: joining.feature_a_information_bits === 0 && joining.feature_b_information_bits === 0 && joining.joint_information_bits > 0
        ? 'FALSIFIED_IN_SYNTHETIC_FIELD'
        : 'OPEN',
      claim_ceiling: 'BALANCED_XOR_FIXTURE_ONLY'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_MEAN_ARI_SUFFICIENT',
      question: 'Can a favorable mean reconstruction score stand in for transform-wise robustness?',
      falsifier: 'Mean ARI remains high while at least one declared transform falls outside epsilon.',
      evidence: {
        ari_mean: reconstruction.anisotropic_reconstruction_invariance,
        ari_floor: reconstruction.anisotropic_reconstruction_floor,
        worst_transform: reconstruction.worst_case_transform,
        all_transforms_pass: reconstruction.all_nonidentity_transforms_within_epsilon
      },
      status: reconstruction.anisotropic_reconstruction_invariance >= 0.8 && !reconstruction.all_nonidentity_transforms_within_epsilon
        ? 'FALSIFIED_IN_SYNTHETIC_FIELD'
        : 'OPEN',
      claim_ceiling: 'DECLARED_SYNTHETIC_TRANSFORM_FAMILY_ONLY'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_BOUNDED_ENVELOPE_PREVENTS_SELF_PROMOTION',
      question: 'Can the bounded envelope keep metric success separate from evidence class and human promotion authority?',
      falsifier: 'A simulated field acquires promotion authority or Golden Egg status solely because metric gates pass.',
      evidence: {
        default_metric_gates_pass: envelope.all_declared_metric_gates_pass,
        promotion_gates_pass: envelope.all_promotion_gates_pass,
        promotion_authority: envelope.promotion_authority,
        golden_egg_earned: envelope.golden_egg_earned
      },
      status: envelope.promotion_authority === false && envelope.golden_egg_earned === false
        ? 'SUPPORTED_BY_SYNTHETIC_CONTRACT'
        : 'FALSIFIED_BY_IMPLEMENTATION',
      claim_ceiling: 'ARCHITECTURAL_CONTRACT_ONLY'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_JOINING_SYNERGY_GENERALIZES',
      question: 'Does positive joining synergy persist beyond the XOR/XNOR seed construction?',
      falsifier: 'The complete declared held-out Boolean family contains no non-parity function with positive joint-information excess.',
      evidence: {
        declared_function_family: booleanCensus.function_family,
        complete_declared_family: booleanCensus.complete_declared_family,
        seed_parity_function_count: booleanCensus.seed_parity_function_count,
        held_out_non_parity_function_count: booleanCensus.held_out_non_parity_function_count,
        positive_held_out_non_parity_count: booleanCensus.positive_held_out_non_parity_count,
        maximum_held_out_non_parity_excess_bits: booleanCensus.maximum_held_out_non_parity_excess_bits,
        pure_synergy_count: booleanCensus.pure_synergy_count
      },
      status: booleanCensus.complete_declared_family && booleanCensus.positive_held_out_non_parity_count > 0
        ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_FAMILY'
        : 'FALSIFIED_IN_SYNTHETIC_FIELD',
      claim_ceiling: 'UNIFORM_DETERMINISTIC_TWO_INPUT_BOOLEAN_FAMILY_ONLY'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_INFORMATION_CURVATURE_GEOMETRIC',
      question: 'Can relational residue be promoted from an information-synergy proxy into a defensible geometric curvature quantity?',
      falsifier: 'No stable metric, connection, invariant, or geometry preserves the proposed curvature quantity across admissible reparameterizations.',
      evidence: {
        current_quantity: 'JOINING_SYNERGY_PROXY_BITS',
        fisher_rao_positive_control_scalar_curvature: geometry.analytic_scalar_curvature,
        fisher_metric_covariance_check_pass: geometry.metric_covariance_check_pass,
        synergy_relabel_invariant_in_fixture: geometry.joining_synergy_relabel_invariant_in_fixture,
        synergy_manifold_metric_declared: geometry.joining_synergy_has_declared_manifold_metric,
        synergy_connection_declared: geometry.joining_synergy_has_declared_connection,
        intrinsic_curvature_claim_supported: geometry.joining_synergy_intrinsic_curvature_claim_supported
      },
      status: 'OPEN_RESEARCH_PROGRAM',
      claim_ceiling: 'FISHER_RAO_CALIBRATION_DOES_NOT_PROMOTE_SYNERGY_PROXY_TO_CURVATURE'
    }),
    freezeHypothesis({
      hypothesis_id: 'H_GOLDEN_EGG_BOUNDED_REGION',
      question: 'Can Golden Egg be reformulated as a bounded feasible region over non-equivalent leakage, joining, and reconstruction surfaces rather than as a scalar or stage?',
      falsifier: 'The proposed feasible-region grammar collapses materially distinct failure modes, cannot preserve counterexamples, or acquires promotion semantics from synthetic metrics.',
      evidence: {
        envelope_status: envelope.status,
        golden_egg_earned: envelope.golden_egg_earned,
        metric_gate_count: envelope.metric_gates.length,
        independent_metric_gate_count: envelope.metric_gates.length,
        empirical_candidate_count: 0
      },
      status: 'OPEN_RESEARCH_PROGRAM',
      claim_ceiling: 'CRITERION_RESEARCH_ONLY'
    })
  ]);

  const closedByCounterexample = hypotheses
    .filter(item => item.status.startsWith('FALSIFIED'))
    .map(item => item.hypothesis_id);
  const boundedSupport = hypotheses
    .filter(item => item.status.startsWith('SUPPORTED'))
    .map(item => item.hypothesis_id);
  const researchFrontier = hypotheses
    .filter(item => item.status.startsWith('OPEN'))
    .map(item => item.hypothesis_id);

  return Object.freeze({
    schema: OPEN_RESEARCH_HYPOTHESIS_REGISTRY_SCHEMA,
    source_status: 'DERIVED_FROM_SIMULATED_FIELD',
    authority_class: 'A2_DERIVATIONAL',
    hypotheses,
    closed_by_counterexample: Object.freeze(closedByCounterexample),
    bounded_support: Object.freeze(boundedSupport),
    research_frontier: Object.freeze(researchFrontier),
    sequence_authority: false,
    next_stage: null,
    stage_unlocks: Object.freeze([]),
    promotion_authority: false,
    human_closure_required: true,
    finding: 'The research program advances by surviving or failing explicit falsifiers, not by unlocking a numbered next stage. Bounded support remains separately typed from empirical generalization.'
  });
}
