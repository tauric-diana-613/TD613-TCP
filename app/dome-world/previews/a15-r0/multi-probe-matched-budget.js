import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const MULTI_PROBE_MATCHED_BUDGET_SCHEMA = 'td613.ash.a15-r0.multi-probe-matched-budget/v0.1';

const CANDIDATES = Object.freeze(['RX', 'RY', 'RZ']);
const PROBES = Object.freeze(['P1', 'P2', 'P3']);
const TOTAL_BUDGET = 300;
const ALPHA_FAMILY = 0.01;

const LAWS = Object.freeze({
  RX: Object.freeze({ P1: 0.70, P2: 0.70, P3: 0.30 }),
  RY: Object.freeze({ P1: 0.70, P2: 0.30, P3: 0.70 }),
  RZ: Object.freeze({ P1: 0.30, P2: 0.70, P3: 0.70 })
});

const OUTSIDE_LAW = Object.freeze({ P1: 0.70, P2: 0.95, P3: 0.95 });

function round15(value) {
  return Number(value.toFixed(15));
}

function hoeffdingRadius(sampleSize, cellCount) {
  const alphaCell = ALPHA_FAMILY / cellCount;
  return {
    alpha_cell: alphaCell,
    radius: Math.sqrt(Math.log(2 / alphaCell) / (2 * sampleSize))
  };
}

function sequenceLikelihood(p, ones, zeros) {
  return p ** ones * (1 - p) ** zeros;
}

function evaluateArm({ id, probeSamples, probeLawResolver, oracleTruth, classificationSurvive, classificationReject }) {
  const probeIds = Object.keys(probeSamples);
  const total = probeIds.reduce((sum, probeId) => sum + probeSamples[probeId].n, 0);
  const equalN = new Set(probeIds.map(probeId => probeSamples[probeId].n));
  if (equalN.size !== 1) throw new Error(`${id} requires equal per-probe n for its authored criterion.`);
  const perProbeN = probeSamples[probeIds[0]].n;
  const cellCount = CANDIDATES.length * probeIds.length;
  const criterion = hoeffdingRadius(perProbeN, cellCount);
  const distances = {};
  const likelihoods = {};

  for (const route of CANDIDATES) {
    distances[route] = {};
    likelihoods[route] = {};
    for (const probeId of probeIds) {
      const sample = probeSamples[probeId];
      const empirical = sample.ones / sample.n;
      const p = probeLawResolver(route, probeId);
      distances[route][probeId] = round15(Math.abs(empirical - p));
      likelihoods[route][probeId] = sequenceLikelihood(p, sample.ones, sample.n - sample.ones);
    }
  }

  const survivors = CANDIDATES.filter(route =>
    probeIds.every(probeId => distances[route][probeId] <= criterion.radius)
  );
  const rejected = survivors.length === 0;

  return freeze({
    id,
    total_budget: total,
    per_probe_n: perProbeN,
    observed_probe_count: probeIds.length,
    cell_count: cellCount,
    alpha_family: ALPHA_FAMILY,
    alpha_cell: criterion.alpha_cell,
    hoeffding_radius: round15(criterion.radius),
    probe_samples: freeze(Object.fromEntries(probeIds.map(probeId => {
      const sample = probeSamples[probeId];
      return [probeId, freeze({
        n: sample.n,
        ones: sample.ones,
        zeros: sample.n - sample.ones,
        empirical_rate: round15(sample.ones / sample.n)
      })];
    }))),
    candidate_distances: freeze(Object.fromEntries(CANDIDATES.map(route => [route, freeze(distances[route])]))),
    candidate_cell_likelihoods: freeze(Object.fromEntries(CANDIDATES.map(route => [route, freeze(likelihoods[route])]))),
    all_candidate_cell_likelihoods_nonzero: CANDIDATES.every(route =>
      probeIds.every(probeId => likelihoods[route][probeId] > 0)
    ),
    surviving_adequacy_set: freeze(survivors),
    survivor_count: survivors.length,
    open_set_rejection_earned: rejected,
    classification: rejected ? classificationReject : classificationSurvive,
    oracle_truth: oracleTruth,
    oracle_truth_in_candidate_family: CANDIDATES.includes(oracleTruth),
    oracle_truth_exposed_to_decoder: false
  });
}

function repeatedArmSamples(ones = 210) {
  return Object.freeze({ P1: Object.freeze({ n: 300, ones }) });
}

function diverseArmSamples({ P1, P2, P3 }) {
  return Object.freeze({
    P1: Object.freeze({ n: 100, ones: P1 }),
    P2: Object.freeze({ n: 100, ones: P2 }),
    P3: Object.freeze({ n: 100, ones: P3 })
  });
}

function redundantArmSamples(ones = 70) {
  return Object.freeze({
    Q1: Object.freeze({ n: 100, ones }),
    Q2: Object.freeze({ n: 100, ones }),
    Q3: Object.freeze({ n: 100, ones })
  });
}

function genuineLaw(route, probeId) {
  return LAWS[route][probeId];
}

function redundantLaw(route) {
  return LAWS[route].P1;
}

export function runMultiProbeMatchedBudgetGauntlet() {
  const admitted = freeze({
    repetition: evaluateArm({
      id: 'ADMITTED_REPETITION',
      probeSamples: repeatedArmSamples(210),
      probeLawResolver: genuineLaw,
      oracleTruth: 'RX',
      classificationSurvive: 'MATCHED_BUDGET_REPETITION_REMAINS_PARTIALLY_IDENTIFIED',
      classificationReject: 'ADMITTED_REPETITION_REJECTED_UNEXPECTEDLY'
    }),
    diversity: evaluateArm({
      id: 'ADMITTED_DIVERSITY',
      probeSamples: diverseArmSamples({ P1: 70, P2: 70, P3: 30 }),
      probeLawResolver: genuineLaw,
      oracleTruth: 'RX',
      classificationSurvive: 'MATCHED_BUDGET_PROBE_DIVERSITY_CONTRACTS_TO_SINGLETON',
      classificationReject: 'ADMITTED_DIVERSITY_REJECTED_UNEXPECTEDLY'
    }),
    redundant: evaluateArm({
      id: 'ADMITTED_REDUNDANT',
      probeSamples: redundantArmSamples(70),
      probeLawResolver: redundantLaw,
      oracleTruth: 'RX',
      classificationSurvive: 'REDUNDANT_PROBE_LABELS_DO_NOT_REPRODUCE_DIVERSITY_GAIN',
      classificationReject: 'ADMITTED_REDUNDANT_REJECTED_UNEXPECTEDLY'
    })
  });

  const outside = freeze({
    repetition: evaluateArm({
      id: 'OUTSIDE_REPETITION',
      probeSamples: repeatedArmSamples(210),
      probeLawResolver: genuineLaw,
      oracleTruth: 'RU',
      classificationSurvive: 'REPETITION_ARM_FAILS_TO_EARN_OPEN_SET_REJECTION',
      classificationReject: 'REPETITION_ARM_OPEN_SET_REJECTION_UNEXPECTEDLY_EARNED'
    }),
    diversity: evaluateArm({
      id: 'OUTSIDE_DIVERSITY',
      probeSamples: diverseArmSamples({ P1: 70, P2: 95, P3: 95 }),
      probeLawResolver: genuineLaw,
      oracleTruth: 'RU',
      classificationSurvive: 'DIVERSITY_ARM_FAILS_TO_EARN_EXPECTED_OPEN_SET_REJECTION',
      classificationReject: 'MATCHED_BUDGET_PROBE_DIVERSITY_EARNS_OPEN_SET_REJECTION'
    }),
    redundant: evaluateArm({
      id: 'OUTSIDE_REDUNDANT',
      probeSamples: redundantArmSamples(70),
      probeLawResolver: redundantLaw,
      oracleTruth: 'RU',
      classificationSurvive: 'REDUNDANT_MULTI_PROBE_CONTROL_FAILS_TO_EARN_OPEN_SET_REJECTION',
      classificationReject: 'REDUNDANT_MULTI_PROBE_CONTROL_REJECTED_UNEXPECTEDLY'
    })
  });

  const admittedDiversityQualified = freeze({
    ...admitted.diversity,
    point_identified_within_declared_probe_and_candidate_scope: admitted.diversity.survivor_count === 1,
    unconditional_truth_identification: false
  });
  const outsideDiversityQualified = freeze({
    ...outside.diversity,
    selected_route: 'NONE',
    open_set_state: 'OPEN_SET_UNRESOLVED',
    truth_identified: false
  });

  const admittedQualified = freeze({
    repetition: admitted.repetition,
    diversity: admittedDiversityQualified,
    redundant: admitted.redundant
  });
  const outsideQualified = freeze({
    repetition: outside.repetition,
    diversity: outsideDiversityQualified,
    redundant: outside.redundant
  });

  const duplicateProbeLedger = freeze({
    Q1: freeze({ duplicate_of: 'P1', measurement_law_distinct: false }),
    Q2: freeze({ duplicate_of: 'P1', measurement_law_distinct: false }),
    Q3: freeze({ duplicate_of: 'P1', measurement_law_distinct: false })
  });

  const gainLedger = freeze({
    admitted: freeze({
      repetition_survivor_count: admittedQualified.repetition.survivor_count,
      diversity_survivor_count: admittedQualified.diversity.survivor_count,
      redundant_survivor_count: admittedQualified.redundant.survivor_count
    }),
    outside: freeze({
      repetition_survivor_count: outsideQualified.repetition.survivor_count,
      diversity_survivor_count: outsideQualified.diversity.survivor_count,
      redundant_survivor_count: outsideQualified.redundant.survivor_count
    }),
    identifiability_gain_in_authored_fixture: admittedQualified.diversity.survivor_count < admittedQualified.repetition.survivor_count,
    open_set_rejection_gain_in_authored_fixture: outsideQualified.diversity.open_set_rejection_earned && !outsideQualified.repetition.open_set_rejection_earned,
    raw_sample_count_gain: false,
    probe_label_count_sufficient: false
  });

  const passed =
    round15(hoeffdingRadius(300, 3).radius) === 0.103254779188957 &&
    round15(hoeffdingRadius(100, 9).radius) === 0.193591605498331 &&
    admittedQualified.repetition.total_budget === TOTAL_BUDGET &&
    admittedQualified.diversity.total_budget === TOTAL_BUDGET &&
    admittedQualified.redundant.total_budget === TOTAL_BUDGET &&
    JSON.stringify(admittedQualified.repetition.surviving_adequacy_set) === JSON.stringify(['RX', 'RY']) &&
    JSON.stringify(admittedQualified.diversity.surviving_adequacy_set) === JSON.stringify(['RX']) &&
    JSON.stringify(admittedQualified.redundant.surviving_adequacy_set) === JSON.stringify(['RX', 'RY']) &&
    JSON.stringify(outsideQualified.repetition.surviving_adequacy_set) === JSON.stringify(['RX', 'RY']) &&
    outsideQualified.diversity.surviving_adequacy_set.length === 0 &&
    JSON.stringify(outsideQualified.redundant.surviving_adequacy_set) === JSON.stringify(['RX', 'RY']) &&
    admittedQualified.repetition.all_candidate_cell_likelihoods_nonzero &&
    admittedQualified.diversity.all_candidate_cell_likelihoods_nonzero &&
    outsideQualified.diversity.all_candidate_cell_likelihoods_nonzero &&
    gainLedger.identifiability_gain_in_authored_fixture &&
    gainLedger.open_set_rejection_gain_in_authored_fixture;

  if (!passed) throw new Error('Multi-probe matched-budget gauntlet violated an authored expectation.');

  return freeze({
    schema: MULTI_PROBE_MATCHED_BUDGET_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    candidate_family: freeze([...CANDIDATES]),
    probe_family: freeze([...PROBES]),
    candidate_probe_laws: LAWS,
    outside_probe_law: OUTSIDE_LAW,
    matched_budget: freeze({
      total_observations_per_arm: TOTAL_BUDGET,
      repetition_total: TOTAL_BUDGET,
      diversity_total: TOTAL_BUDGET,
      redundant_total: TOTAL_BUDGET,
      matched_total_budget: true
    }),
    criteria: freeze({
      role: 'FORMAL_DIAGNOSTIC',
      alpha_family: ALPHA_FAMILY,
      repetition: freeze({
        candidate_probe_cells: 3,
        alpha_cell: ALPHA_FAMILY / 3,
        sample_size_per_probe: 300,
        hoeffding_radius: round15(hoeffdingRadius(300, 3).radius)
      }),
      multi_probe: freeze({
        candidate_probe_cells: 9,
        alpha_cell: ALPHA_FAMILY / 9,
        sample_size_per_probe: 100,
        hoeffding_radius: round15(hoeffdingRadius(100, 9).radius)
      }),
      criterion_predeclared: true,
      budget_matched: true,
      multiplicity_correction_explicit: true,
      universal_optimality_claim: false,
      empirical_validation_claim: false
    }),
    duplicate_probe_ledger: duplicateProbeLedger,
    experiments: freeze({ admitted: admittedQualified, outside: outsideQualified }),
    gain_ledger: gainLedger,
    gauntlet_status: 'MATCHED_BUDGET_PROBE_DIVERSITY_GRAMMAR_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relation: 'under a matched observation budget, genuinely non-equivalent probe families can reduce alias ambiguity or expose out-of-model structure when repeated measurements of one projection cannot; the gain belongs to constraint diversity only when probe laws are actually nonredundant',
    next_learning_action: 'TEST_RELATIONAL_PROBE_RECONSTRUCTION_WITH_KNOWN_FORWARD_OPERATORS',
    claims: freeze({
      universal_measurement_diversity_superiority: false,
      mutual_information_gain_live_systems: false,
      universal_sample_efficiency_gain: false,
      empirical_live_data_calibration: false,
      tomography: false,
      blind_tomography: false,
      connection: false,
      curvature: false,
      holonomy: false,
      berry_structure: false,
      physical_phasons: false,
      quantum_behavior: false,
      proto_loom: false,
      production_authority: false
    }),
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    human_closure_required: true
  });
}
