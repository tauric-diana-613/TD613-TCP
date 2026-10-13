export const MOSS_LANTERN_REFERENCE_LENGTH = 30;
export const MOSS_LANTERN_REFERENCE_ONES = 12;
export const MOSS_LANTERN_OBSERVATION_BUDGET = 18;
export const MOSS_LANTERN_INDEPENDENT_PROBE_OFFSETS = Object.freeze([0, 1, 2, 4, 7, 11, 16, 23, 27]);
export const MOSS_LANTERN_REDUNDANT_PROBE_OFFSETS = Object.freeze([0, 0, 1, 1, 2, 2, 4, 4, 7]);

const PHI = (1 + Math.sqrt(5)) / 2;
const REFERENCE_IDS = Object.freeze([
  'PERIODIC',
  'PHI_IRRATIONAL_ROTATION',
  'DETERMINISTIC_APERIODIC_CONTROL',
  'PERIODIC_QUASIPERIODIC_CROSSOVER'
]);

const round6 = value => Number(value.toFixed(6));
const mod = (value, modulus) => ((value % modulus) + modulus) % modulus;
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

function finiteIrrationalRotationReference() {
  const scores = Array.from({ length: MOSS_LANTERN_REFERENCE_LENGTH }, (_, index) => ({
    index,
    score: mod((index + 1) / PHI, 1)
  }));
  scores.sort((left, right) => left.score - right.score || left.index - right.index);
  const selected = new Set(scores.slice(0, MOSS_LANTERN_REFERENCE_ONES).map(item => item.index));
  return Array.from({ length: MOSS_LANTERN_REFERENCE_LENGTH }, (_, index) => Number(selected.has(index)));
}

function deterministicAperiodicScore(index) {
  let value = Math.imul(index + 1, 0x9e3779b1) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x85ebca77) >>> 0;
  value ^= value >>> 13;
  return value >>> 0;
}

function deterministicAperiodicReference() {
  const ranked = Array.from({ length: MOSS_LANTERN_REFERENCE_LENGTH }, (_, index) => ({
    index,
    score: deterministicAperiodicScore(index)
  })).sort((left, right) => left.score - right.score || left.index - right.index);
  const selected = new Set(ranked.slice(0, MOSS_LANTERN_REFERENCE_ONES).map(item => item.index));
  return Array.from({ length: MOSS_LANTERN_REFERENCE_LENGTH }, (_, index) => Number(selected.has(index)));
}

function periodicReference() {
  return Array.from(
    { length: MOSS_LANTERN_REFERENCE_LENGTH },
    (_, index) => Number(index % 5 === 0 || index % 5 === 2)
  );
}

function crossoverReference(periodic, quasiperiodic) {
  const out = [...periodic];
  const removable = [];
  const addable = [];
  for (let index = 0; index < out.length; index += 1) {
    if (periodic[index] === 1 && quasiperiodic[index] === 0) removable.push(index);
    if (periodic[index] === 0 && quasiperiodic[index] === 1) addable.push(index);
  }
  const swaps = Math.min(4, removable.length, addable.length);
  for (let index = 0; index < swaps; index += 1) {
    out[removable[index]] = 0;
    out[addable[index]] = 1;
  }
  return out;
}

function minimumPeriod(sequence) {
  for (let period = 1; period < sequence.length; period += 1) {
    let matches = true;
    for (let index = 0; index < sequence.length; index += 1) {
      if (sequence[index] !== sequence[index % period]) {
        matches = false;
        break;
      }
    }
    if (matches) return period;
  }
  return sequence.length;
}

export function buildMossLanternReferenceFamily() {
  const periodic = periodicReference();
  const quasiperiodic = finiteIrrationalRotationReference();
  const aperiodic = deterministicAperiodicReference();
  const crossover = crossoverReference(periodic, quasiperiodic);
  const references = {
    PERIODIC: periodic,
    PHI_IRRATIONAL_ROTATION: quasiperiodic,
    DETERMINISTIC_APERIODIC_CONTROL: aperiodic,
    PERIODIC_QUASIPERIODIC_CROSSOVER: crossover
  };
  for (const [referenceId, sequence] of Object.entries(references)) {
    if (sequence.length !== MOSS_LANTERN_REFERENCE_LENGTH) throw new Error(`${referenceId} length drifted.`);
    if (sequence.reduce((sum, value) => sum + value, 0) !== MOSS_LANTERN_REFERENCE_ONES) {
      throw new Error(`${referenceId} density drifted.`);
    }
  }
  return freeze(Object.fromEntries(Object.entries(references).map(([referenceId, sequence]) => [
    referenceId,
    freeze({
      reference_id: referenceId,
      sequence: freeze([...sequence]),
      one_count: sequence.reduce((sum, value) => sum + value, 0),
      density_millipoints: Math.round(1000 * MOSS_LANTERN_REFERENCE_ONES / MOSS_LANTERN_REFERENCE_LENGTH),
      minimum_finite_period: minimumPeriod(sequence),
      phi_specific: referenceId === 'PHI_IRRATIONAL_ROTATION',
      generic_aperiodic_control: referenceId === 'DETERMINISTIC_APERIODIC_CONTROL',
      crossover_control: referenceId === 'PERIODIC_QUASIPERIODIC_CROSSOVER'
    })
  ])));
}

function pattern(reference, registryOffset, probeOffsets) {
  return probeOffsets.map(offset => reference.sequence[mod(registryOffset + offset, reference.sequence.length)]);
}

function exactMetrics(reference, probeOffsets) {
  const observed = Array.from({ length: MOSS_LANTERN_REFERENCE_LENGTH }, (_, registryOffset) => (
    pattern(reference, registryOffset, probeOffsets)
  ));
  const candidateSizes = observed.map(target => observed.filter(candidate => (
    candidate.every((value, index) => value === target[index])
  )).length);
  return freeze({
    unique_registry_recovery_rate: round6(candidateSizes.filter(size => size === 1).length / candidateSizes.length),
    mean_candidate_set_size: round6(candidateSizes.reduce((sum, size) => sum + size, 0) / candidateSizes.length),
    maximum_candidate_set_size: Math.max(...candidateSizes)
  });
}

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function generateReadings(reference, registryOffset, probeOffsets, repeatsPerProbe, noiseRate, seed) {
  const rng = makeRng(seed);
  const readings = [];
  probeOffsets.forEach(offset => {
    const expected = reference.sequence[mod(registryOffset + offset, reference.sequence.length)];
    for (let repeat = 0; repeat < repeatsPerProbe; repeat += 1) {
      readings.push(freeze({
        offset,
        value: rng() < noiseRate ? 1 - expected : expected
      }));
    }
  });
  return freeze(readings);
}

function decodeReadings(reference, readings) {
  let bestMismatch = Infinity;
  const candidates = [];
  for (let registryOffset = 0; registryOffset < reference.sequence.length; registryOffset += 1) {
    const mismatch = readings.reduce((sum, reading) => (
      sum + Number(reference.sequence[mod(registryOffset + reading.offset, reference.sequence.length)] !== reading.value)
    ), 0);
    if (mismatch < bestMismatch) {
      bestMismatch = mismatch;
      candidates.length = 0;
      candidates.push(registryOffset);
    } else if (mismatch === bestMismatch) {
      candidates.push(registryOffset);
    }
  }
  return freeze({ mismatch: bestMismatch, candidates: freeze(candidates) });
}

function noisyMetrics(reference, probeOffsets, options, conditionSalt) {
  const total = reference.sequence.length * options.trials_per_state;
  let exact = 0;
  let ambiguous = 0;
  let wrongUnique = 0;
  for (let registryOffset = 0; registryOffset < reference.sequence.length; registryOffset += 1) {
    for (let trial = 0; trial < options.trials_per_state; trial += 1) {
      const seed = options.seed
        + registryOffset * 1009
        + trial * 9176
        + conditionSalt * 131;
      const readings = generateReadings(
        reference,
        registryOffset,
        probeOffsets,
        options.repeats_per_probe,
        options.noise_rate,
        seed
      );
      const decoded = decodeReadings(reference, readings);
      if (decoded.candidates.length !== 1) ambiguous += 1;
      else if (decoded.candidates[0] === registryOffset) exact += 1;
      else wrongUnique += 1;
    }
  }
  return freeze({
    noisy_exact_registry_recovery_rate: round6(exact / total),
    ambiguous_decode_rate: round6(ambiguous / total),
    wrong_unique_decode_rate: round6(wrongUnique / total)
  });
}

export function conditionMetrics(reference, probeOffsets, options, conditionSalt) {
  return freeze({
    unique_probe_position_count: new Set(probeOffsets).size,
    total_probe_position_count: probeOffsets.length,
    observation_budget: probeOffsets.length * options.repeats_per_probe,
    ...exactMetrics(reference, probeOffsets),
    ...noisyMetrics(reference, probeOffsets, options, conditionSalt)
  });
}
