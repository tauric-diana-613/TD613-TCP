export const WEDDING_IDENTIFIABILITY_ASSAY_SCHEMA = 'td613.ash.a15-r0.wedding-identifiability-assay/v0.1';

export const WEDDING_PROBES = Object.freeze(['D', 'Q', 'M']);
export const WEDDING_ALPHABET = Object.freeze([0, 1, 2]);
export const WEDDING_OBSERVATION_BUDGET = 12;

const CONDITION_DEFINITIONS = Object.freeze([
  Object.freeze({ condition_id: 'D', probes: Object.freeze(['D']), shuffled: false }),
  Object.freeze({ condition_id: 'Q', probes: Object.freeze(['Q']), shuffled: false }),
  Object.freeze({ condition_id: 'M', probes: Object.freeze(['M']), shuffled: false }),
  Object.freeze({ condition_id: 'D+Q', probes: Object.freeze(['D', 'Q']), shuffled: false }),
  Object.freeze({ condition_id: 'D+M', probes: Object.freeze(['D', 'M']), shuffled: false }),
  Object.freeze({ condition_id: 'Q+M', probes: Object.freeze(['Q', 'M']), shuffled: false }),
  Object.freeze({ condition_id: 'D+Q+M', probes: Object.freeze(['D', 'Q', 'M']), shuffled: false }),
  Object.freeze({ condition_id: 'SHUFFLED(D+Q+M)', probes: Object.freeze(['D', 'Q', 'M']), shuffled: true })
]);

const mod3 = value => ((value % 3) + 3) % 3;
const round6 = value => Number(value.toFixed(6));

function freezeRecord(value) {
  return Object.freeze({ ...value });
}

export function buildWeddingLatentStates() {
  const states = [];
  for (const a of WEDDING_ALPHABET) {
    for (const b of WEDDING_ALPHABET) {
      for (const t of WEDDING_ALPHABET) {
        states.push(freezeRecord({
          state_id: `S_${a}${b}${t}`,
          a,
          b,
          t
        }));
      }
    }
  }
  return Object.freeze(states);
}

export function weddingForwardObservation(state, fixture = 'RELATIONAL_POSITIVE_CONTROL') {
  if (!state || !WEDDING_ALPHABET.includes(state.a) || !WEDDING_ALPHABET.includes(state.b) || !WEDDING_ALPHABET.includes(state.t)) {
    throw new Error('weddingForwardObservation requires a declared Z3 latent state');
  }

  if (fixture === 'RELATIONAL_POSITIVE_CONTROL') {
    return freezeRecord({
      D: state.a,
      Q: state.b,
      M: mod3(state.t - state.a - state.b)
    });
  }

  if (fixture === 'REDUNDANT_NEGATIVE_CONTROL') {
    return freezeRecord({
      D: state.a,
      Q: state.b,
      M: state.a
    });
  }

  throw new Error(`Unknown Wedding fixture: ${fixture}`);
}

function buildRelationshipShuffle(states, fixture) {
  const observations = states.map(state => weddingForwardObservation(state, fixture));
  const shuffled = new Map();
  states.forEach((state, index) => {
    const donor = observations[(index + 1) % observations.length];
    shuffled.set(state.state_id, freezeRecord({
      ...observations[index],
      M: donor.M
    }));
  });
  return shuffled;
}

function histogram(values) {
  const counts = Object.fromEntries(WEDDING_ALPHABET.map(value => [String(value), 0]));
  values.forEach(value => {
    counts[String(value)] += 1;
  });
  return freezeRecord(counts);
}

function probeMarginals(states, fixture, shuffle = null) {
  const rows = states.map(state => shuffle?.get(state.state_id) || weddingForwardObservation(state, fixture));
  return freezeRecord({
    D: histogram(rows.map(row => row.D)),
    Q: histogram(rows.map(row => row.Q)),
    M: histogram(rows.map(row => row.M))
  });
}

function sameMarginals(left, right) {
  return WEDDING_PROBES.every(probe => (
    WEDDING_ALPHABET.every(value => left[probe][String(value)] === right[probe][String(value)])
  ));
}

function expectedObservation(state, fixture) {
  return weddingForwardObservation(state, fixture);
}

function observedForState(state, fixture, shuffle, condition) {
  if (condition.shuffled) return shuffle.get(state.state_id);
  return expectedObservation(state, fixture);
}

function matchingCandidates(states, fixture, condition, observed) {
  return states.filter(candidate => {
    const expected = expectedObservation(candidate, fixture);
    return condition.probes.every(probe => expected[probe] === observed[probe]);
  });
}

function exactConditionMetrics(states, fixture, shuffle, condition) {
  let uniqueCorrect = 0;
  let candidateTotal = 0;
  let candidateMax = 0;

  states.forEach(state => {
    const observed = observedForState(state, fixture, shuffle, condition);
    const candidates = matchingCandidates(states, fixture, condition, observed);
    candidateTotal += candidates.length;
    candidateMax = Math.max(candidateMax, candidates.length);
    if (candidates.length === 1 && candidates[0].state_id === state.state_id) uniqueCorrect += 1;
  });

  return freezeRecord({
    exact_unique_recovery_rate: round6(uniqueCorrect / states.length),
    mean_candidate_set_size: round6(candidateTotal / states.length),
    maximum_candidate_set_size: candidateMax
  });
}

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function noisySymbol(symbol, noiseRate, rng) {
  if (rng() >= noiseRate) return symbol;
  return mod3(symbol + (rng() < 0.5 ? 1 : 2));
}

function repetitionsPerProbe(condition, observationBudget) {
  if (observationBudget % condition.probes.length !== 0) {
    throw new Error('observation budget must divide evenly across active probe families');
  }
  return observationBudget / condition.probes.length;
}

function generateNoisyReadings(state, fixture, shuffle, condition, observationBudget, noiseRate, seed) {
  const rng = makeRng(seed);
  const source = observedForState(state, fixture, shuffle, condition);
  const repeats = repetitionsPerProbe(condition, observationBudget);
  const readings = [];

  condition.probes.forEach(probe => {
    for (let index = 0; index < repeats; index += 1) {
      readings.push(freezeRecord({ probe, value: noisySymbol(source[probe], noiseRate, rng) }));
    }
  });

  return Object.freeze(readings);
}

function decodeReadings(states, fixture, readings) {
  let bestMismatch = Infinity;
  const best = [];

  states.forEach(candidate => {
    const expected = expectedObservation(candidate, fixture);
    const mismatch = readings.reduce((sum, reading) => sum + Number(expected[reading.probe] !== reading.value), 0);
    if (mismatch < bestMismatch) {
      bestMismatch = mismatch;
      best.length = 0;
      best.push(candidate);
    } else if (mismatch === bestMismatch) {
      best.push(candidate);
    }
  });

  return Object.freeze({
    mismatch: bestMismatch,
    candidates: Object.freeze([...best])
  });
}

function noisyConditionMetrics(states, fixture, shuffle, condition, options) {
  let exactCorrect = 0;
  let ambiguous = 0;
  let wrongUnique = 0;
  const total = states.length * options.trials_per_state;

  states.forEach((state, stateIndex) => {
    for (let trial = 0; trial < options.trials_per_state; trial += 1) {
      const seed = options.seed + stateIndex * 1009 + trial * 9176 + condition.condition_id.length * 131;
      const readings = generateNoisyReadings(
        state,
        fixture,
        shuffle,
        condition,
        options.observation_budget,
        options.noise_rate,
        seed
      );
      const decoded = decodeReadings(states, fixture, readings);
      if (decoded.candidates.length !== 1) {
        ambiguous += 1;
      } else if (decoded.candidates[0].state_id === state.state_id) {
        exactCorrect += 1;
      } else {
        wrongUnique += 1;
      }
    }
  });

  return freezeRecord({
    noisy_exact_recovery_rate: round6(exactCorrect / total),
    ambiguous_decode_rate: round6(ambiguous / total),
    wrong_unique_decode_rate: round6(wrongUnique / total)
  });
}

function runFixture(states, fixture, options) {
  const shuffle = buildRelationshipShuffle(states, fixture);
  const conditions = CONDITION_DEFINITIONS.map(condition => freezeRecord({
    condition_id: condition.condition_id,
    probes: condition.probes,
    shuffled: condition.shuffled,
    repetitions_per_probe: repetitionsPerProbe(condition, options.observation_budget),
    ...exactConditionMetrics(states, fixture, shuffle, condition),
    ...noisyConditionMetrics(states, fixture, shuffle, condition, options)
  }));
  const byId = Object.fromEntries(conditions.map(condition => [condition.condition_id, condition]));
  const singles = ['D', 'Q', 'M'].map(id => byId[id]);
  const pairs = ['D+Q', 'D+M', 'Q+M'].map(id => byId[id]);
  const bestSingle = [...singles].sort((a, b) => b.noisy_exact_recovery_rate - a.noisy_exact_recovery_rate)[0];
  const bestPair = [...pairs].sort((a, b) => b.noisy_exact_recovery_rate - a.noisy_exact_recovery_rate)[0];
  const intact = byId['D+Q+M'];
  const shuffled = byId['SHUFFLED(D+Q+M)'];

  return Object.freeze({
    fixture,
    conditions: Object.freeze(conditions),
    best_single_condition: bestSingle.condition_id,
    best_single_noisy_recovery_rate: bestSingle.noisy_exact_recovery_rate,
    best_pair_condition: bestPair.condition_id,
    best_pair_exact_recovery_rate: bestPair.exact_unique_recovery_rate,
    best_pair_noisy_recovery_rate: bestPair.noisy_exact_recovery_rate,
    intact_triple_exact_recovery_rate: intact.exact_unique_recovery_rate,
    intact_triple_noisy_recovery_rate: intact.noisy_exact_recovery_rate,
    shuffled_triple_exact_recovery_rate: shuffled.exact_unique_recovery_rate,
    shuffled_triple_noisy_recovery_rate: shuffled.noisy_exact_recovery_rate,
    exact_gain_over_best_pair: round6(intact.exact_unique_recovery_rate - bestPair.exact_unique_recovery_rate),
    noisy_gain_over_best_pair: round6(intact.noisy_exact_recovery_rate - bestPair.noisy_exact_recovery_rate),
    noisy_gain_over_shuffled_triple: round6(intact.noisy_exact_recovery_rate - shuffled.noisy_exact_recovery_rate)
  });
}

export function runWeddingIdentifiabilityAssay(options = {}) {
  const observationBudget = options.observation_budget ?? WEDDING_OBSERVATION_BUDGET;
  const noiseRate = options.noise_rate ?? 0.12;
  const trialsPerState = options.trials_per_state ?? 24;
  const seed = options.seed ?? 613;

  if (!Number.isInteger(observationBudget) || observationBudget <= 0 || observationBudget % 6 !== 0) {
    throw new Error('observation_budget must be a positive integer divisible by 6');
  }
  if (!Number.isFinite(noiseRate) || noiseRate < 0 || noiseRate >= 1) {
    throw new Error('noise_rate must be finite in [0, 1)');
  }
  if (!Number.isInteger(trialsPerState) || trialsPerState <= 0) {
    throw new Error('trials_per_state must be a positive integer');
  }
  if (!Number.isInteger(seed)) throw new Error('seed must be an integer');

  const states = buildWeddingLatentStates();
  const positiveShuffle = buildRelationshipShuffle(states, 'RELATIONAL_POSITIVE_CONTROL');
  const positiveMarginals = probeMarginals(states, 'RELATIONAL_POSITIVE_CONTROL');
  const shuffledMarginals = probeMarginals(states, 'RELATIONAL_POSITIVE_CONTROL', positiveShuffle);
  const relationshipShuffleMarginalsPreserved = sameMarginals(positiveMarginals, shuffledMarginals);
  const assayOptions = Object.freeze({
    observation_budget: observationBudget,
    noise_rate: noiseRate,
    trials_per_state: trialsPerState,
    seed
  });

  const positiveControl = runFixture(states, 'RELATIONAL_POSITIVE_CONTROL', assayOptions);
  const negativeControl = runFixture(states, 'REDUNDANT_NEGATIVE_CONTROL', assayOptions);

  const positivePass = (
    positiveControl.intact_triple_exact_recovery_rate > positiveControl.best_pair_exact_recovery_rate
    && positiveControl.intact_triple_noisy_recovery_rate > positiveControl.best_pair_noisy_recovery_rate
    && positiveControl.intact_triple_noisy_recovery_rate > positiveControl.shuffled_triple_noisy_recovery_rate
  );
  const negativePass = negativeControl.intact_triple_noisy_recovery_rate <= negativeControl.best_pair_noisy_recovery_rate;
  const assayMechanismValidated = positivePass && negativePass && relationshipShuffleMarginalsPreserved;

  return Object.freeze({
    schema: WEDDING_IDENTIFIABILITY_ASSAY_SCHEMA,
    source_status: 'SIMULATED',
    fixture_class: 'DECLARED_SYNTHETIC_POSITIVE_AND_NEGATIVE_CONTROLS',
    authority_class: 'A2_DERIVATIONAL',
    state_count: states.length,
    probe_alphabet: WEDDING_ALPHABET,
    observation_budget: observationBudget,
    noise_model: freezeRecord({
      kind: 'SEEDED_CATEGORICAL_SUBSTITUTION_Z3',
      substitution_probability: noiseRate,
      trials_per_state: trialsPerState,
      seed
    }),
    conditions: Object.freeze(CONDITION_DEFINITIONS.map(condition => condition.condition_id)),
    positive_control: positiveControl,
    negative_control: negativeControl,
    positive_probe_marginals: positiveMarginals,
    shuffled_probe_marginals: shuffledMarginals,
    relationship_shuffle_marginals_preserved: relationshipShuffleMarginalsPreserved,
    assay_mechanism_validated: assayMechanismValidated,
    hypothesis_id: 'H_TRIPLE_IDENTIFIABILITY_SYNERGY',
    hypothesis_status: 'OPEN_UNMEASURED',
    promotion_authority: false,
    production_mutated: false,
    external_transmission: false,
    partial_information_decomposition_claim: false,
    emergence_claim: false,
    physical_geometry_claim: false,
    claim_ceiling: 'FINITE_Z3_SYNTHETIC_ASSAY_MECHANISM_ONLY; does not establish TD613 triple synergy, quasiperiodic anti-aliasing, emergence, PID, geometry, connection, curvature, holonomy, Berry structure, quantum behavior, physical realization, A16, Proto-Loom, or Golden Egg authority.',
    finding: assayMechanismValidated
      ? 'The declared finite synthetic assay distinguishes an authored three-probe relational dependency from matched singles/pairs, a marginal-preserving relationship shuffle, and a redundant triple negative control. The live TD613 triple hypothesis remains OPEN_UNMEASURED.'
      : 'The synthetic assay mechanism failed at least one declared positive, shuffle, or negative-control gate; no relational identifiability claim is admitted.'
  });
}
