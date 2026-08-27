import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from './phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from './dromological-s3-schedule-atlas-first-stratum-gate.js';
import { observeReplayAssistedState } from './dromological-baseline-replay-rescue-aperture.js';
import { invertReplayLocusObservation } from './dromological-replay-transversality-unimodular-locus.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  dromologicalHolonomyClassReplayPolicy,
  classifyReplayAgainstHolonomyClass,
} from './dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  derivePrimaryHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
} from './dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import { REPAIR_MASK_DOMAIN } from './dromological-holonomy-parity-completion-erasure-robust-aia.js';
import { canonicalEightBitRepairCode } from './dromological-holonomy-double-corruption-correcting-aia.js';
import { dromologicalHolonomyDoubleCorruptionIsometryCertificate } from './dromological-holonomy-double-corruption-isometry-orbit.js';

export const DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_SCHEMA =
  'td613.dome-world.dromological-holonomy-orbit-transport-tomographic-conjugacy/v0.1';
export const DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_PARENT_RECEIPT =
  'a0d88e26860f4d9c25feed21ab2d080f70b45f20';

const ORBIT_TYPES = Object.freeze(['H', 'I', 'X']);
const GROUP_SIZE = 256 * 40320;
const EXPECTED_LABELLED_STABILIZER = 72;
const EXPECTED_LABELLED_ORBIT_SIZE = GROUP_SIZE / EXPECTED_LABELLED_STABILIZER;
const EXPECTED_TARGETS = 3 * EXPECTED_LABELLED_ORBIT_SIZE;
const EXPECTED_RECEIVED_CONDITIONS_PER_CODE = 4 * (1 + 8 + 28);
const EXPECTED_REPRESENTATIVE_CONDITIONS = 3 * EXPECTED_RECEIVED_CONDITIONS_PER_CODE;
const EXPECTED_REPRESENTED_RECEIVED_CONDITIONS = EXPECTED_TARGETS * EXPECTED_RECEIVED_CONDITIONS_PER_CODE;
const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'source_state_transform',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

let cachedPermutations = null;
let cachedPermutationIndex = null;
let cachedStructuralGeometry = null;
let cachedCertificate = null;
const cachedAtlases = new Map();

function freezeSmall(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(item => {
      if (item && typeof item === 'object' && !Array.isArray(item)) freezeSmall(item);
    });
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function zeroAuthority() {
  return freezeSmall(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function permutations(values) {
  const rows = [];
  function visit(prefix, remaining) {
    if (remaining.length === 0) {
      rows.push(Object.freeze(prefix));
      return;
    }
    for (let index = 0; index < remaining.length; index += 1) {
      visit(
        [...prefix, remaining[index]],
        [...remaining.slice(0, index), ...remaining.slice(index + 1)],
      );
    }
  }
  visit([], values);
  return Object.freeze(rows);
}

function coordinatePermutations() {
  if (!cachedPermutations) cachedPermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
  return cachedPermutations;
}

function permutationIndex() {
  if (!cachedPermutationIndex) {
    cachedPermutationIndex = new Map(coordinatePermutations().map((row, index) => [row.join(','), index]));
  }
  return cachedPermutationIndex;
}

function wordToInteger(word) {
  return word.reduce((value, bit) => (value << 1) | bit, 0);
}

function integerToWord(value, width = 8) {
  return Array.from({ length: width }, (_, index) => (value >> (width - 1 - index)) & 1);
}

function permuteIntegerWord(value, permutation) {
  const input = integerToWord(value);
  return wordToInteger(permutation.map(index => input[index]));
}

function hammingInteger(left, right) {
  let value = (left ^ right) >>> 0;
  let count = 0;
  while (value !== 0) {
    value &= value - 1;
    count += 1;
  }
  return count;
}

function setKey(words) {
  return [...words].sort((left, right) => left - right).join(',');
}

function packLabelledWords(words) {
  if (words.length !== 4) throw new Error('labelled target key requires four codewords');
  return (
    (words[0] & 0xff)
    | ((words[1] & 0xff) << 8)
    | ((words[2] & 0xff) << 16)
    | ((words[3] & 0xff) << 24)
  ) >>> 0;
}

function packWitness(translation, permutationIndexValue) {
  return translation * 40320 + permutationIndexValue;
}

function unpackWitness(packed) {
  const translation = Math.floor(packed / 40320);
  const permutation_index = packed % 40320;
  const permutation = coordinatePermutations()[permutation_index];
  return { translation, permutation_index, permutation };
}

function applyWitnessInteger(value, witness) {
  return permuteIntegerWord(value, witness.permutation) ^ witness.translation;
}

function composeWitness(left, right) {
  const permutation = left.permutation.map(index => right.permutation[index]);
  const translation = permuteIntegerWord(right.translation, left.permutation) ^ left.translation;
  const permutation_index = permutationIndex().get(permutation.join(','));
  if (!Number.isInteger(permutation_index)) throw new Error('composed coordinate permutation missing from S8 atlas');
  return { translation, permutation_index, permutation };
}

function canonicalIntegerWords() {
  return canonicalEightBitRepairCode().map(row => wordToInteger(row.codeword));
}

function representativeAssignments() {
  const parent = dromologicalHolonomyDoubleCorruptionIsometryCertificate();
  return parent.labelled_repair_orbit_certificate.representative_assignments;
}

function representativeWords(type) {
  const assignment = representativeAssignments()[type];
  if (!assignment) throw new Error(`unknown labelled orbit type: ${type}`);
  const canonical = canonicalIntegerWords();
  return assignment.map(index => canonical[index]);
}

function repairDifferenceType(leftMask, rightMask) {
  const dH = leftMask[0] ^ rightMask[0];
  const dI = leftMask[1] ^ rightMask[1];
  if (dH === 1 && dI === 0) return 'H';
  if (dH === 0 && dI === 1) return 'I';
  if (dH === 1 && dI === 1) return 'X';
  throw new Error('distinct repair masks required');
}

function labelledLongType(words) {
  const longTypes = [];
  for (let left = 0; left < words.length; left += 1) {
    for (let right = left + 1; right < words.length; right += 1) {
      if (hammingInteger(words[left], words[right]) === 6) {
        longTypes.push(repairDifferenceType(REPAIR_MASK_DOMAIN[left], REPAIR_MASK_DOMAIN[right]));
      }
    }
  }
  const unique = [...new Set(longTypes)];
  return longTypes.length === 2 && unique.length === 1 ? unique[0] : null;
}

function pairwiseDistanceSpectrum(words) {
  const distances = [];
  for (let left = 0; left < words.length; left += 1) {
    for (let right = left + 1; right < words.length; right += 1) {
      distances.push(hammingInteger(words[left], words[right]));
    }
  }
  return distances.sort((a, b) => a - b);
}

function isLexSmallerWitness(left, right) {
  if (!right) return true;
  if (left.translation !== right.translation) return left.translation < right.translation;
  for (let index = 0; index < left.permutation.length; index += 1) {
    if (left.permutation[index] !== right.permutation[index]) return left.permutation[index] < right.permutation[index];
  }
  return false;
}

function deriveUnlabelledStabilizerActions(canonical) {
  const canonicalSetKey = setKey(canonical);
  const pointIndex = new Map(canonical.map((value, index) => [value, index]));
  const induced = new Map();
  let fullSetStabilizer = 0;
  for (let permutation_index = 0; permutation_index < coordinatePermutations().length; permutation_index += 1) {
    const permutation = coordinatePermutations()[permutation_index];
    const transformed = canonical.map(value => permuteIntegerWord(value, permutation));
    for (const translation of canonical) {
      const shifted = transformed.map(value => value ^ translation);
      if (setKey(shifted) !== canonicalSetKey) continue;
      fullSetStabilizer += 1;
      const action = shifted.map(value => pointIndex.get(value));
      if (!action.every(Number.isInteger)) throw new Error('set stabilizer failed to induce canonical codepoint action');
      const key = action.join(',');
      const witness = { translation, permutation_index, permutation };
      const prior = induced.get(key);
      if (!prior || isLexSmallerWitness(witness, prior.witness)) induced.set(key, { action, witness });
    }
  }
  const rows = [...induced.values()].sort((left, right) => left.action.join(',').localeCompare(right.action.join(',')));
  return {
    full_set_stabilizer_count: fullSetStabilizer,
    induced_action_count: rows.length,
    action_representatives: rows,
    exact: fullSetStabilizer === 576 && rows.length === 8,
  };
}

function deriveNormalizedFlatWitnesses(canonical) {
  const flatMap = new Map();
  for (let permutation_index = 0; permutation_index < coordinatePermutations().length; permutation_index += 1) {
    const permutation = coordinatePermutations()[permutation_index];
    const transformed = canonical.map(value => permuteIntegerWord(value, permutation));
    const key = setKey(transformed);
    if (!flatMap.has(key)) {
      flatMap.set(key, {
        words: [...transformed].sort((a, b) => a - b),
        witness: { translation: 0, permutation_index, permutation },
      });
    }
  }
  return [...flatMap.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);
}

function deriveCosetRepresentatives(flatWords) {
  const cosets = new Map();
  for (let translation = 0; translation < 256; translation += 1) {
    const shifted = flatWords.map(value => value ^ translation);
    const key = setKey(shifted);
    if (!cosets.has(key)) cosets.set(key, { translation, words: [...shifted].sort((a, b) => a - b) });
  }
  return [...cosets.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);
}

function deriveLabelledStabilizer(type) {
  const source = representativeWords(type);
  const rows = [];
  for (let permutation_index = 0; permutation_index < coordinatePermutations().length; permutation_index += 1) {
    const permutation = coordinatePermutations()[permutation_index];
    const first = permuteIntegerWord(source[0], permutation);
    const translation = source[0] ^ first;
    const fixed = source.every(value => (permuteIntegerWord(value, permutation) ^ translation) === value);
    if (fixed) rows.push({ translation, permutation_index, permutation });
  }
  return {
    type,
    labelled_stabilizer_size: rows.length,
    orbit_size_from_stabilizer: rows.length > 0 ? GROUP_SIZE / rows.length : null,
    elements: rows,
    exact: rows.length === EXPECTED_LABELLED_STABILIZER
      && GROUP_SIZE / rows.length === EXPECTED_LABELLED_ORBIT_SIZE,
  };
}

function pureActionInsufficiency(type) {
  const source = representativeWords(type);
  const translationTargets = new Set();
  for (let translation = 0; translation < 256; translation += 1) {
    translationTargets.add(packLabelledWords(source.map(value => value ^ translation)));
  }
  const permutationTargets = new Set();
  for (const permutation of coordinatePermutations()) {
    permutationTargets.add(packLabelledWords(source.map(value => permuteIntegerWord(value, permutation))));
  }
  return {
    type,
    translation_only_target_count: translationTargets.size,
    permutation_only_target_count: permutationTargets.size,
    full_labelled_orbit_target_count: EXPECTED_LABELLED_ORBIT_SIZE,
    translation_only_insufficient: translationTargets.size < EXPECTED_LABELLED_ORBIT_SIZE,
    permutation_only_insufficient: permutationTargets.size < EXPECTED_LABELLED_ORBIT_SIZE,
  };
}

function structuralGeometry() {
  if (cachedStructuralGeometry) return cachedStructuralGeometry;
  const canonical = canonicalIntegerWords();
  const parent = dromologicalHolonomyDoubleCorruptionIsometryCertificate();
  const normalizedFlats = deriveNormalizedFlatWitnesses(canonical);
  const cosetCounts = normalizedFlats.map(row => deriveCosetRepresentatives(row.words).length);
  const unlabelledActions = deriveUnlabelledStabilizerActions(canonical);
  const stabilizers = Object.fromEntries(ORBIT_TYPES.map(type => [type, deriveLabelledStabilizer(type)]));
  const pureAction = Object.fromEntries(ORBIT_TYPES.map(type => [type, pureActionInsufficiency(type)]));
  const labelledMultiplicities = Object.fromEntries(
    ORBIT_TYPES.map(type => [type, stabilizers[type].orbit_size_from_stabilizer]),
  );
  cachedStructuralGeometry = Object.freeze({
    coordinate_permutations_checked: coordinatePermutations().length,
    declared_group_size: GROUP_SIZE,
    normalized_linear_two_flat_count: normalizedFlats.length,
    affine_cosets_per_flat: Object.freeze([...new Set(cosetCounts)].sort((a, b) => a - b)),
    induced_unlabelled_action_count: unlabelledActions.induced_action_count,
    full_unlabelled_set_stabilizer: unlabelledActions.full_set_stabilizer_count,
    labelled_stabilizer_sizes: freezeSmall(Object.fromEntries(
      ORBIT_TYPES.map(type => [type, stabilizers[type].labelled_stabilizer_size]),
    )),
    labelled_orbit_sizes_from_stabilizers: freezeSmall(labelledMultiplicities),
    parent_labelled_orbit_size: parent.labelled_repair_orbit_certificate.labelled_isometry_orbit_size,
    pure_action_insufficiency: freezeSmall(pureAction),
    factorized_target_count_per_type: normalizedFlats.length
      * cosetCounts[0]
      * unlabelledActions.induced_action_count,
    expected_target_count_per_type: EXPECTED_LABELLED_ORBIT_SIZE,
    exact: coordinatePermutations().length === 40320
      && normalizedFlats.length === 280
      && same([...new Set(cosetCounts)].sort((a, b) => a - b), [64])
      && unlabelledActions.exact
      && ORBIT_TYPES.every(type => stabilizers[type].exact)
      && ORBIT_TYPES.every(type => pureAction[type].translation_only_target_count === 256)
      && ORBIT_TYPES.every(type => pureAction[type].permutation_only_target_count === 560)
      && normalizedFlats.length * cosetCounts[0] * unlabelledActions.induced_action_count === 143360
      && parent.labelled_repair_orbit_certificate.labelled_isometry_orbit_size === 143360,
    _normalizedFlats: normalizedFlats,
    _unlabelledActions: unlabelledActions.action_representatives,
    _stabilizers: stabilizers,
  });
  return cachedStructuralGeometry;
}

function atlasHash(targetKeys, witnessPacks) {
  let hash = 2166136261 >>> 0;
  for (let index = 0; index < targetKeys.length; index += 1) {
    hash = Math.imul(hash ^ targetKeys[index], 16777619) >>> 0;
    hash = Math.imul(hash ^ witnessPacks[index], 16777619) >>> 0;
  }
  return hash >>> 0;
}

export function buildDromologicalHolonomyOrbitTransportAtlas(type) {
  if (!ORBIT_TYPES.includes(type)) throw new Error(`unknown labelled orbit type: ${type}`);
  if (cachedAtlases.has(type)) return cachedAtlases.get(type);
  const geometry = structuralGeometry();
  const source = representativeWords(type);
  const pairs = [];
  let generated = 0;
  let wrongType = 0;
  let wrongSpectrum = 0;
  const seen = new Set();
  for (const flat of geometry._normalizedFlats) {
    const cosets = deriveCosetRepresentatives(flat.words);
    for (const coset of cosets) {
      const base = {
        translation: coset.translation,
        permutation_index: flat.witness.permutation_index,
        permutation: flat.witness.permutation,
      };
      for (const action of geometry._unlabelledActions) {
        const witness = composeWitness(base, action.witness);
        const targetWords = source.map(value => applyWitnessInteger(value, witness));
        const targetKey = packLabelledWords(targetWords);
        generated += 1;
        if (labelledLongType(targetWords) !== type) wrongType += 1;
        if (!same(pairwiseDistanceSpectrum(targetWords), [5, 5, 5, 5, 6, 6])) wrongSpectrum += 1;
        if (!seen.has(targetKey)) {
          seen.add(targetKey);
          pairs.push([targetKey, packWitness(witness.translation, witness.permutation_index)]);
        }
      }
    }
  }
  pairs.sort((left, right) => left[0] - right[0]);
  const targetKeys = pairs.map(row => row[0]);
  const witnessPacks = pairs.map(row => row[1]);
  const atlas = Object.freeze({
    type,
    deterministic_normal_form:
      'LEX_FIRST_NORMALIZED_FLAT_PERMUTATION__MINIMUM_COSET_TRANSLATION__LEX_FIRST_INDUCED_LABEL_ACTION',
    generated_factorized_witnesses: generated,
    unique_target_count: targetKeys.length,
    duplicate_target_derivations: generated - targetKeys.length,
    wrong_orbit_type_count: wrongType,
    wrong_distance_spectrum_count: wrongSpectrum,
    target_keys: Object.freeze(targetKeys),
    witness_packs: Object.freeze(witnessPacks),
    atlas_hash_u32: atlasHash(targetKeys, witnessPacks),
    represented_stabilizer_multiplicity_per_target: geometry._stabilizers[type].labelled_stabilizer_size,
    exact: generated === EXPECTED_LABELLED_ORBIT_SIZE
      && targetKeys.length === EXPECTED_LABELLED_ORBIT_SIZE
      && generated - targetKeys.length === 0
      && wrongType === 0
      && wrongSpectrum === 0
      && geometry._stabilizers[type].labelled_stabilizer_size === 72,
  });
  cachedAtlases.set(type, atlas);
  return atlas;
}

export function validateDromologicalHolonomyOrbitTransportAtlas(candidate, type) {
  if (!candidate || candidate.type !== type) return freezeSmall({ accepted: false, reason: 'wrong orbit type' });
  if (candidate.target_keys?.length !== EXPECTED_LABELLED_ORBIT_SIZE
      || candidate.witness_packs?.length !== EXPECTED_LABELLED_ORBIT_SIZE) {
    return freezeSmall({ accepted: false, reason: 'coverage cardinality mismatch' });
  }
  const source = representativeWords(type);
  const seen = new Set();
  for (let index = 0; index < candidate.target_keys.length; index += 1) {
    const targetKey = candidate.target_keys[index] >>> 0;
    if (seen.has(targetKey)) return freezeSmall({ accepted: false, reason: 'duplicate target key' });
    seen.add(targetKey);
    const witness = unpackWitness(candidate.witness_packs[index]);
    const mapped = source.map(value => applyWitnessInteger(value, witness));
    if (packLabelledWords(mapped) !== targetKey) {
      return freezeSmall({ accepted: false, reason: 'witness does not map representative to target' });
    }
    if (labelledLongType(mapped) !== type) return freezeSmall({ accepted: false, reason: 'H/I/X role not preserved' });
  }
  return freezeSmall({
    accepted: seen.size === EXPECTED_LABELLED_ORBIT_SIZE,
    reason: seen.size === EXPECTED_LABELLED_ORBIT_SIZE ? null : 'incomplete target coverage',
  });
}

function nearestLabelledInteger(received, words) {
  const ranked = words.map((word, index) => ({ index, distance: hammingInteger(received, word) }))
    .sort((left, right) => left.distance - right.distance || left.index - right.index);
  const minimum = ranked[0].distance;
  const winners = ranked.filter(row => row.distance === minimum);
  return {
    unique: winners.length === 1,
    minimum_distance: minimum,
    repair_mask: winners.length === 1 ? [...REPAIR_MASK_DOMAIN[winners[0].index]] : null,
  };
}

function radiusTwoInteger(word) {
  const rows = [word];
  for (let first = 0; first < 8; first += 1) rows.push(word ^ (1 << first));
  for (let first = 0; first < 8; first += 1) {
    for (let second = first + 1; second < 8; second += 1) rows.push(word ^ (1 << first) ^ (1 << second));
  }
  return rows;
}

function scheduleMap() {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [
    schedule.map(stratum => letters[stratum]).join('-'),
    schedule,
  ]));
}

function chooseNontrivialSample(type) {
  const atlas = buildDromologicalHolonomyOrbitTransportAtlas(type);
  for (let index = 0; index < atlas.target_keys.length; index += 1) {
    const witness = unpackWitness(atlas.witness_packs[index]);
    const identityPermutation = witness.permutation.every((value, position) => value === position);
    if (witness.translation !== 0 && !identityPermutation) {
      return {
        target_key: atlas.target_keys[index],
        witness_pack: atlas.witness_packs[index],
        witness,
      };
    }
  }
  throw new Error(`no nontrivial translation-plus-permutation sample found for ${type}`);
}

function tomographicConjugacyCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policies = dromologicalHolonomyClassReplayPolicy();
  const schedules = scheduleMap();
  let receivedConditions = 0;
  let decoderCommutationChecks = 0;
  let replayPolicyChecks = 0;
  let robustRescueChecks = 0;
  let canonicalReconstructions = 0;
  let targetReconstructions = 0;
  let exact = true;
  const samples = {};

  for (const type of ORBIT_TYPES) {
    const sourceWords = representativeWords(type);
    const sample = chooseNontrivialSample(type);
    samples[type] = freezeSmall({
      target_key: sample.target_key,
      witness_pack: sample.witness_pack,
      translation: sample.witness.translation,
      permutation: [...sample.witness.permutation],
    });
    const targetWords = sourceWords.map(value => applyWitnessInteger(value, sample.witness));
    if (packLabelledWords(targetWords) !== sample.target_key || labelledLongType(targetWords) !== type) exact = false;

    for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
      const holonomyClass = classes[classIndex];
      const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
      const maskIndex = REPAIR_MASK_DOMAIN.findIndex(row => same(row, mask));
      if (maskIndex < 0) {
        exact = false;
        continue;
      }
      const sourceCodeword = sourceWords[maskIndex];
      for (const received of radiusTwoInteger(sourceCodeword)) {
        receivedConditions += 1;
        const targetReceived = applyWitnessInteger(received, sample.witness);
        const canonicalDecoded = nearestLabelledInteger(received, sourceWords);
        const targetDecoded = nearestLabelledInteger(targetReceived, targetWords);
        decoderCommutationChecks += 1;
        if (!canonicalDecoded.unique
            || !targetDecoded.unique
            || canonicalDecoded.minimum_distance > 2
            || targetDecoded.minimum_distance > 2
            || !same(canonicalDecoded.repair_mask, mask)
            || !same(targetDecoded.repair_mask, mask)) exact = false;

        const replay = decodeMinimumCostReplayFromRepairMask(targetDecoded.repair_mask);
        replayPolicyChecks += 1;
        if (!same(replay, policies[classIndex].replay_row)) exact = false;
        const rescue = classifyReplayAgainstHolonomyClass(holonomyClass, replay);
        robustRescueChecks += 1;
        if (!rescue.actual_class_robust_unimodular_rescue) exact = false;

        for (const id of holonomyClass.schedule_ids) {
          const schedule = schedules.get(id);
          if (!schedule) {
            exact = false;
            continue;
          }
          for (let x1 = -2; x1 <= 2; x1 += 1) {
            for (let x2 = -2; x2 <= 2; x2 += 1) {
              for (let x3 = -2; x3 <= 2; x3 += 1) {
                const state = [x1, x2, x3];
                const observation = observeReplayAssistedState(state, schedule, replay);
                const canonicalRecovered = invertReplayLocusObservation(observation, schedule, replay);
                canonicalReconstructions += 1;
                const targetRecovered = invertReplayLocusObservation(observation, schedule, replay);
                targetReconstructions += 1;
                if (!same(canonicalRecovered, state)
                    || !same(targetRecovered, state)
                    || !same(canonicalRecovered, targetRecovered)) exact = false;
              }
            }
          }
        }
      }
    }
  }

  const mixedClass = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
  const scheduleAmbiguityPreserved = Boolean(mixedClass)
    && same([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());
  return freezeSmall({
    nontrivial_transport_samples: samples,
    executed_transport_received_conditions: receivedConditions,
    expected_executed_transport_received_conditions: EXPECTED_REPRESENTATIVE_CONDITIONS,
    decoder_commutation_checks: decoderCommutationChecks,
    replay_policy_checks: replayPolicyChecks,
    class_robust_unimodular_checks: robustRescueChecks,
    canonical_path_state_reconstructions: canonicalReconstructions,
    target_path_state_reconstructions: targetReconstructions,
    total_two_path_state_reconstructions: canonicalReconstructions + targetReconstructions,
    expected_reconstructions_per_path: 83250,
    represented_all_labelled_received_conditions: EXPECTED_REPRESENTED_RECEIVED_CONDITIONS,
    represented_full_cross_product_executed: false,
    receiver_transport_acts_on_latent_state: false,
    receiver_transport_acts_on_source_custody: false,
    receiver_transport_acts_on_formal_schedule_history: false,
    receiver_transport_acts_on_raw_terminal_holonomy: false,
    receiver_transport_acts_on_physical_space: false,
    mixed_terminal_holonomy_schedule_ambiguity_preserved: scheduleAmbiguityPreserved,
    exact: exact
      && receivedConditions === 444
      && decoderCommutationChecks === 444
      && replayPolicyChecks === 444
      && robustRescueChecks === 444
      && canonicalReconstructions === 83250
      && targetReconstructions === 83250
      && scheduleAmbiguityPreserved,
  });
}

function coverageCertificate() {
  const geometry = structuralGeometry();
  const atlases = Object.fromEntries(ORBIT_TYPES.map(type => [type, buildDromologicalHolonomyOrbitTransportAtlas(type)]));
  const validations = Object.fromEntries(ORBIT_TYPES.map(type => [
    type,
    validateDromologicalHolonomyOrbitTransportAtlas(atlases[type], type),
  ]));
  const H = new Set(atlases.H.target_keys);
  const I = new Set(atlases.I.target_keys);
  const X = new Set(atlases.X.target_keys);
  let crossOrbitCollisions = 0;
  for (const key of H) if (I.has(key) || X.has(key)) crossOrbitCollisions += 1;
  for (const key of I) if (X.has(key)) crossOrbitCollisions += 1;
  return freezeSmall({
    target_counts: freezeSmall(Object.fromEntries(ORBIT_TYPES.map(type => [type, atlases[type].unique_target_count]))),
    target_total: ORBIT_TYPES.reduce((sum, type) => sum + atlases[type].unique_target_count, 0),
    expected_target_total: EXPECTED_TARGETS,
    atlas_hashes_u32: freezeSmall(Object.fromEntries(ORBIT_TYPES.map(type => [type, atlases[type].atlas_hash_u32]))),
    stabilizer_multiplicity_per_target: geometry.labelled_stabilizer_sizes,
    all_atlases_validate: ORBIT_TYPES.every(type => validations[type].accepted),
    H_I_X_cross_orbit_target_collisions: crossOrbitCollisions,
    deterministic_normal_form: atlases.H.deterministic_normal_form,
    exact: ORBIT_TYPES.every(type => atlases[type].exact)
      && ORBIT_TYPES.every(type => validations[type].accepted)
      && ORBIT_TYPES.every(type => atlases[type].unique_target_count === 143360)
      && crossOrbitCollisions === 0
      && EXPECTED_TARGETS === 430080,
  });
}

export function dromologicalHolonomyOrbitTransportConjugacyCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyDoubleCorruptionIsometryCertificate();
  const geometry = structuralGeometry();
  const coverage = coverageCertificate();
  const tomography = tomographicConjugacyCertificate();
  const passed = parent.passed && geometry.exact && coverage.exact && tomography.exact;
  cachedCertificate = freezeSmall({
    schema: DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_PARENT_RECEIPT,
    parent_schema: parent.schema,
    transport_geometry_certificate: geometry,
    transport_coverage_certificate: coverage,
    tomographic_conjugacy_certificate: tomography,
    passed,
    classification: passed
      ? 'EXACT_REPAIR_DECODING_AND_REPLAY_ASSISTED_TOMOGRAPHY_CAN_BE_TRANSPORTED_ACROSS_THE_DECLARED_MINIMAL_WIDTH_EIGHT_LABELLED_RECEIVER_ISOMETRY_ORBITS_BY_EXPLICIT_FINITE_REPRESENTATION_WITNESSES_WITHOUT_ACTING_ON_THE_SOURCE_STATE_OR_WIDENING_RECEIVER_AUTHORITY_IN_THE_FIXED_S3_AIA_FIXTURE'
      : 'ORBIT_TRANSPORT_TOMOGRAPHIC_CONJUGACY_NOT_ESTABLISHED',
    scars: Object.freeze([
      'ORBIT_TRANSPORT != PHYSICAL_MOTION',
      'HYPERCUBE_ISOMETRY != PHYSICAL_SYMMETRY',
      'RECEIVER_CONJUGACY != GAUGE_EQUIVALENCE',
      'CODEWORD_TRANSLATION != SOURCE_STATE_TRANSLATION',
      'COORDINATE_PERMUTATION != SENSOR_REWIRING',
      'LABEL_ACTION != SEMANTIC_ONTOLOGY',
      'TOMOGRAPHY_EQUIVARIANCE_IN_THIS_FIXTURE != CONTINUUM_TOMOGRAPHY_COVARIANCE',
      'FINITE_TRANSPORT_WITNESS != UNIVERSAL_CODING_EQUIVALENCE',
      'ORBIT_REPRESENTATIVE_REDUCTION != EXECUTED_FULL_430080_CROSS_PRODUCT',
      'REPRESENTED_63651840_RECEIVER_CASES != EXECUTED_63651840_RECEIVER_CASES',
      'REPAIR_MASK_TRANSPORT != COMPLETE_SCHEDULE_RECONSTRUCTION',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyOrbitTransportConjugacyProjection(receiver) {
  const certificate = dromologicalHolonomyOrbitTransportConjugacyCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified orbit-transport conjugacy chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freezeSmall({
      payload_schema: 'td613.dome-world.orbit-transport-conjugacy-child-legible/v0.1',
      truths: Object.freeze([
        'EVERY_GOOD_LABELLED_EIGHT_CLUE_RECEIVER_HERE_HAS_AN_EXACT_ROUTE_BACK_TO_ONE_OF_THREE_CANONICAL_ROLE_PATTERNS',
        'REPAIR_DECODING_COMMUTES_WITH_THOSE_DECLARED_RECEIVER_REPRESENTATION_ROUTES',
        'THE_REPLAY_STEP_STILL_DEPENDS_ONLY_ON_THE_RECOVERED_REPAIR_MASK',
        'MOVING_THE_RECEIVER_REPRESENTATION_DOES_NOT_MOVE_THE_HIDDEN_STATE_OR_RECOVER_FORGOTTEN_SCHEDULE_ORDER',
      ]),
      transport_atlas_exposed: false,
      stabilizer_atlas_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
      schedule_history_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freezeSmall({
      payload_schema: 'td613.dome-world.orbit-transport-conjugacy-loom-technical/v0.1',
      transport_summary: certificate.transport_coverage_certificate,
      geometry_summary: {
        group_size: certificate.transport_geometry_certificate.declared_group_size,
        labelled_stabilizer_sizes: certificate.transport_geometry_certificate.labelled_stabilizer_sizes,
        labelled_orbit_sizes: certificate.transport_geometry_certificate.labelled_orbit_sizes_from_stabilizers,
        translation_only_target_counts: freezeSmall(Object.fromEntries(ORBIT_TYPES.map(type => [
          type,
          certificate.transport_geometry_certificate.pure_action_insufficiency[type].translation_only_target_count,
        ]))),
        permutation_only_target_counts: freezeSmall(Object.fromEntries(ORBIT_TYPES.map(type => [
          type,
          certificate.transport_geometry_certificate.pure_action_insufficiency[type].permutation_only_target_count,
        ]))),
      },
      tomography_summary: certificate.tomographic_conjugacy_certificate,
      full_transport_atlas_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for orbit-transport conjugacy chamber: ${receiver}`);
  }
  return freezeSmall({
    schema: DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_CONJUGACY_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    label_collapse: false,
    execution_ledger: freezeSmall({
      represented_receiver_conditions: EXPECTED_REPRESENTED_RECEIVED_CONDITIONS,
      executed_receiver_conditions: certificate.tomographic_conjugacy_certificate.executed_transport_received_conditions,
      represented_receiver_conditions_claimed_executed: false,
      executed_state_reconstructions: certificate.tomographic_conjugacy_certificate.total_two_path_state_reconstructions,
    }),
    claim_ceiling: freezeSmall({
      fixed_fixture_orbit_transport_conjugacy: true,
      universal_coding_equivalence: false,
      physical_motion: false,
      physical_symmetry: false,
      physical_geometry: false,
      physical_gauge_equivalence: false,
      physical_sensor_rewiring: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      operational_inverse_route: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyOrbitTransportConjugacyOverreach(candidate) {
  const certificate = dromologicalHolonomyOrbitTransportConjugacyCertificate();
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_coding_equivalence === true
    || ceiling.physical_motion === true
    || ceiling.physical_symmetry === true
    || ceiling.physical_geometry === true
    || ceiling.physical_gauge_equivalence === true
    || ceiling.physical_sensor_rewiring === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.operational_inverse_route === true;
  const runtime = candidate?.runtime_binding === true;
  const sourceMutation = candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true;
  const labelCollapse = candidate?.label_collapse === true;
  const representedInflation = candidate?.execution_ledger?.represented_receiver_conditions_claimed_executed === true
    || Number(candidate?.execution_ledger?.executed_receiver_conditions ?? 0)
      > certificate.tomographic_conjugacy_certificate.executed_transport_received_conditions;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.transport_atlas_exposed === true
    || candidate?.payload?.stabilizer_atlas_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
    || candidate?.payload?.schedule_history_exposed === true
  );
  const invalidBitMap = candidate?.non_hamming_isometry_bit_map === true;
  return freezeSmall({
    accepted: !authority
      && !overreach
      && !runtime
      && !sourceMutation
      && !labelCollapse
      && !representedInflation
      && !ashLeak
      && !invalidBitMap,
  });
}
