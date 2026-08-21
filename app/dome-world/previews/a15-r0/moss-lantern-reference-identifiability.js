import { compileObservationAperture } from '../../../engine/flowcore-observation-aperture.js';
import {
  MOSS_LANTERN_REFERENCE_LENGTH,
  MOSS_LANTERN_REFERENCE_ONES,
  MOSS_LANTERN_OBSERVATION_BUDGET,
  MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS,
  MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS,
  buildMossLanternReferenceFamily,
  conditionMetrics
} from './moss-lantern-reference-family.js';

export {
  MOSS_LANTERN_REFERENCE_LENGTH,
  MOSS_LANTERN_REFERENCE_ONES,
  MOSS_LANTERN_OBSERVATION_BUDGET,
  MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS,
  MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS,
  buildMossLanternReferenceFamily
};

export const MOSS_LANTERN_REFERENCE_IDENTIFIABILITY_SCHEMA = 'td613.ash.a15-r0.moss-lantern-reference-identifiability/v0.1';

const REFERENCE_IDS = Object.freeze([
  'PERIODIC',
  'PHI_IRRATIONAL_ROTATION',
  'DETERMINISTIC_APERIODIC_CONTROL',
  'PERIODIC_QUASIPERIODIC_CROSSOVER'
]);

const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

function validateMossFixture(fixture) {
  if (!fixture || fixture.fixture_id !== 'ash-loom.moss-lantern-calibration/v0.1') {
    throw new Error('Moss Lantern reference assay requires the canonical Moss Lantern calibration fixture.');
  }
  if (fixture.manifestly_fictional !== true || fixture.runtime_binding !== false) {
    throw new Error('Moss Lantern reference assay requires a fictional, non-runtime fixture.');
  }
  if (!Array.isArray(fixture.expected_route_steps) || fixture.expected_route_steps.length !== 5) {
    throw new Error('Moss Lantern canonical five-step route is required.');
  }
  return fixture;
}

export function runMossLanternReferenceIdentifiabilityAssay(fixture, options = {}) {
  validateMossFixture(fixture);
  const noiseRate = options.noise_rate ?? 0.10;
  const trialsPerState = options.trials_per_state ?? 48;
  const repeatsPerProbe = options.repeats_per_probe ?? 2;
  const seed = options.seed ?? 613;
  if (!Number.isFinite(noiseRate) || noiseRate < 0 || noiseRate >= 1) throw new Error('noise_rate must be finite in [0, 1).');
  if (!Number.isInteger(trialsPerState) || trialsPerState <= 0) throw new Error('trials_per_state must be a positive integer.');
  if (!Number.isInteger(repeatsPerProbe) || repeatsPerProbe <= 0) throw new Error('repeats_per_probe must be a positive integer.');
  if (!Number.isInteger(seed)) throw new Error('seed must be an integer.');

  const optionsResolved = freeze({
    noise_rate: noiseRate,
    trials_per_state: trialsPerState,
    repeats_per_probe: repeatsPerProbe,
    seed
  });
  const references = buildMossLanternReferenceFamily();
  const resultEntries = REFERENCE_IDS.map((referenceId, index) => {
    const reference = references[referenceId];
    return [referenceId, freeze({
      reference,
      independent_probes: conditionMetrics(
        reference,
        MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS,
        optionsResolved,
        index * 2 + 1
      ),
      redundant_probe_control: conditionMetrics(
        reference,
        MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS,
        optionsResolved,
        index * 2 + 2
      )
    })];
  });
  const results = freeze(Object.fromEntries(resultEntries));

  const periodic = results.PERIODIC.independent_probes;
  const quasi = results.PHI_IRRATIONAL_ROTATION.independent_probes;
  const aperiodic = results.DETERMINISTIC_APERIODIC_CONTROL.independent_probes;
  const crossover = results.PERIODIC_QUASIPERIODIC_CROSSOVER.independent_probes;
  const quasiRedundant = results.PHI_IRRATIONAL_ROTATION.redundant_probe_control;
  const aperiodicRedundant = results.DETERMINISTIC_APERIODIC_CONTROL.redundant_probe_control;

  const structuredNonclosureBeatsPeriodic = (
    quasi.mean_candidate_set_size < periodic.mean_candidate_set_size
    && quasi.noisy_exact_registry_recovery_rate > periodic.noisy_exact_registry_recovery_rate
  );
  const genericAperiodicBeatsPeriodic = (
    aperiodic.mean_candidate_set_size < periodic.mean_candidate_set_size
    && aperiodic.noisy_exact_registry_recovery_rate > periodic.noisy_exact_registry_recovery_rate
  );
  const phiSpecificAdvantage = (
    quasi.mean_candidate_set_size < aperiodic.mean_candidate_set_size
    && quasi.noisy_exact_registry_recovery_rate > aperiodic.noisy_exact_registry_recovery_rate
  );
  const probeDiversityMatters = (
    quasi.noisy_exact_registry_recovery_rate > quasiRedundant.noisy_exact_registry_recovery_rate
    && aperiodic.noisy_exact_registry_recovery_rate > aperiodicRedundant.noisy_exact_registry_recovery_rate
  );
  const crossoverIsIntermediate = (
    crossover.mean_candidate_set_size < periodic.mean_candidate_set_size
    && crossover.mean_candidate_set_size >= aperiodic.mean_candidate_set_size
  );
  const densityMatched = REFERENCE_IDS.every(referenceId => (
    references[referenceId].one_count === MOSS_LANTERN_REFERENCE_ONES
    && references[referenceId].density_millipoints === references.PERIODIC.density_millipoints
  ));

  const aperture = compileObservationAperture({
    source_ids: ['moss-lantern-practice-capsule'],
    source_count: 1,
    instrument_scope: ['pedagogue-research-hydration', 'moss-lantern-reference-identifiability'],
    condition_scope: [
      'periodic-reference',
      'phi-irrational-rotation-reference',
      'deterministic-aperiodic-control',
      'periodic-quasiperiodic-crossover',
      'independent-probe-map',
      'redundant-probe-control'
    ],
    matching_posture: 'DECLARED_REFERENCE_SYMBOL_EXACT',
    filter_flags: {
      live_ash_runtime: false,
      raw_source_transport: false,
      route_content_mutated: false
    },
    context_labels: ['A15-R0', 'Moss Lantern', 'ML1', 'ML2'],
    practice_mode: true,
    identity_redacted: true
  });

  const assayMechanismValidated = (
    densityMatched
    && structuredNonclosureBeatsPeriodic
    && genericAperiodicBeatsPeriodic
    && probeDiversityMatters
    && crossoverIsIntermediate
  );

  return freeze({
    schema: MOSS_LANTERN_REFERENCE_IDENTIFIABILITY_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    fixture_id: fixture.fixture_id,
    manifestly_fictional: true,
    route_content_fixed: true,
    expected_route_steps: freeze([...fixture.expected_route_steps]),
    expected_endpoint: fixture.expected_endpoint,
    latent_variable: 'REFERENCE_REGISTRY_OFFSET_ONLY',
    latent_state_count: MOSS_LANTERN_REFERENCE_LENGTH,
    reference_one_count: MOSS_LANTERN_REFERENCE_ONES,
    observation_budget: MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS.length * repeatsPerProbe,
    noise_model: freeze({
      kind: 'SEEDED_BINARY_SUBSTITUTION',
      substitution_probability: noiseRate,
      trials_per_state: trialsPerState,
      repeats_per_probe: repeatsPerProbe,
      seed
    }),
    observation_aperture: aperture,
    results,
    controls: freeze({
      density_matched: densityMatched,
      periodic_minimum_finite_period: references.PERIODIC.minimum_finite_period,
      phi_reference_minimum_finite_period: references.PHI_IRRATIONAL_ROTATION.minimum_finite_period,
      aperiodic_control_minimum_finite_period: references.DETERMINISTIC_APERIODIC_CONTROL.minimum_finite_period,
      crossover_minimum_finite_period: references.PERIODIC_QUASIPERIODIC_CROSSOVER.minimum_finite_period,
      independent_unique_probe_positions: new Set(MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS).size,
      redundant_unique_probe_positions: new Set(MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS).size
    }),
    findings: freeze({
      structured_nonclosure_beats_periodic: structuredNonclosureBeatsPeriodic,
      generic_aperiodic_beats_periodic: genericAperiodicBeatsPeriodic,
      phi_specific_advantage_over_generic_aperiodic: phiSpecificAdvantage,
      probe_diversity_matters_under_matched_budget: probeDiversityMatters,
      crossover_is_intermediate: crossoverIsIntermediate,
      assay_mechanism_validated: assayMechanismValidated
    }),
    hypothesis_status: freeze({
      H_NONREPETITION_REDUCES_REFERENCE_ALIASING: assayMechanismValidated
        ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE'
        : 'NOT_SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE',
      H_PHI_SPECIFIC_ANTI_ALIASING_ADVANTAGE: phiSpecificAdvantage
        ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE'
        : 'NOT_SUPPORTED_IN_BOUNDED_SYNTHETIC_REFERENCE_FIXTURE',
      H_TD613_PHI_ANTI_ALIASING: 'OPEN_UNMEASURED',
      H_TD613_TRIPLE_IDENTIFIABILITY_SYNERGY: 'OPEN_UNMEASURED'
    }),
    claim_ceiling: 'FINITE_MOSS_LANTERN_REFERENCE_REGISTRY_ASSAY_ONLY; may support bounded nonrepetition/anti-aliasing and probe-diversity conclusions in this synthetic fixture. It does not establish phi optimality, TD613 phi anti-aliasing, TD613 triple synergy, tomography of live Ash, physical phasons, quantum geometry, connection, curvature, holonomy, Berry structure, inverse physical design, A16, Proto-Loom, or production authority.',
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    proto_loom_implementation: false,
    transport_law_declared: false,
    geometric_holonomy_claim: false,
    physical_realization_claim: false,
    human_closure_required: true
  });
}
