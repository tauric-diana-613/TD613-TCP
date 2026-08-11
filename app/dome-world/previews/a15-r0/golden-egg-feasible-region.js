import { runBooleanSynergyCensus } from './boolean-synergy-census.js';
import { runOpenResearchField } from './open-research-field.js';

export const GOLDEN_EGG_FEASIBLE_REGION_SCHEMA = 'td613.ash.a15-r0.golden-egg-feasible-region/v0.1';

const round = value => Number(value.toFixed(6));

function dominates(left, right) {
  const keys = ['observer_leakage_bits', 'reconstruction_distance', 'joining_synergy_bits'];
  const noWorse = keys.every(key => left.metrics[key] <= right.metrics[key]);
  const strictlyBetter = keys.some(key => left.metrics[key] < right.metrics[key]);
  return noWorse && strictlyBetter;
}

export function buildGoldenEggFeasibleRegion(options = {}) {
  const field = options.field || runOpenResearchField();
  const booleanCensus = options.booleanCensus || runBooleanSynergyCensus();
  const thresholds = Object.freeze({
    observer_leakage_bits: Number(options.observer_leakage_bits ?? 0.5),
    reconstruction_distance: Number(options.reconstruction_distance ?? 0.2),
    joining_synergy_bits: Number(options.joining_synergy_bits ?? 0.1)
  });
  if (Object.values(thresholds).some(value => !Number.isFinite(value) || value < 0)) {
    throw new TypeError('Golden Egg region thresholds must be finite non-negative numbers.');
  }

  const observers = field.observability.models;
  const transforms = field.reconstruction.transforms.filter(item => item.operator_id !== 'IDENTITY');
  const joiningFunctions = booleanCensus.functions;
  const candidates = [];

  for (const observer of observers) {
    for (const transform of transforms) {
      for (const joining of joiningFunctions) {
        const metrics = Object.freeze({
          observer_leakage_bits: observer.mutual_information_bits,
          reconstruction_distance: transform.topology_distance,
          joining_synergy_bits: joining.joining_synergy_proxy_bits
        });
        const gateVector = Object.freeze({
          observer: metrics.observer_leakage_bits <= thresholds.observer_leakage_bits,
          reconstruction: metrics.reconstruction_distance <= thresholds.reconstruction_distance,
          joining: metrics.joining_synergy_bits <= thresholds.joining_synergy_bits
        });
        candidates.push(Object.freeze({
          candidate_id: `${observer.model_id}::${transform.operator_id}::${joining.function_id}`,
          observer_model_id: observer.model_id,
          transform_id: transform.operator_id,
          joining_function_id: joining.function_id,
          metrics,
          gate_vector: gateVector,
          feasible: Object.values(gateVector).every(Boolean),
          jointly_realized: false
        }));
      }
    }
  }

  const feasible = candidates.filter(candidate => candidate.feasible);
  const pareto = feasible.filter(candidate => !feasible.some(other => other !== candidate && dominates(other, candidate)));
  const failureVectors = Object.freeze({
    observer_only_or_more: candidates.filter(candidate => !candidate.gate_vector.observer).length,
    reconstruction_only_or_more: candidates.filter(candidate => !candidate.gate_vector.reconstruction).length,
    joining_only_or_more: candidates.filter(candidate => !candidate.gate_vector.joining).length
  });

  return Object.freeze({
    schema: GOLDEN_EGG_FEASIBLE_REGION_SCHEMA,
    source_status: 'SIMULATED_FACTORIZED_PRODUCT_SPACE',
    authority_class: 'A2_DERIVATIONAL',
    thresholds,
    observer_family_size: observers.length,
    nonidentity_transform_family_size: transforms.length,
    joining_function_family_size: joiningFunctions.length,
    formal_candidate_count: candidates.length,
    feasible_candidate_count: feasible.length,
    pareto_candidate_count: pareto.length,
    region_nonempty: feasible.length > 0,
    candidates: Object.freeze(candidates),
    feasible_candidate_ids: Object.freeze(feasible.map(candidate => candidate.candidate_id)),
    pareto_candidate_ids: Object.freeze(pareto.map(candidate => candidate.candidate_id)),
    failure_vectors: failureVectors,
    scalarized_score_defined: false,
    factorization_assumption: true,
    joint_realizability: 'UNMEASURED',
    empirical_candidate_count: 0,
    golden_egg_earned: false,
    promotion_authority: false,
    finding: `The declared factorized product space contains ${feasible.length} formal threshold-feasible combinations and ${pareto.length} Pareto-minimal combinations without defining a scalar score. Joint realizability remains unmeasured, so the result supports only the feasible-region grammar.`,
    claim_ceiling: 'FACTORIZED_SYNTHETIC_FEASIBLE_REGION_GRAMMAR_ONLY'
  });
}
