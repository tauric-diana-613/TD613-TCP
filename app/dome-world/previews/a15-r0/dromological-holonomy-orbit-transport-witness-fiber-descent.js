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
import {
  buildDromologicalHolonomyOrbitTransportAtlas,
  dromologicalHolonomyOrbitTransportConjugacyCertificate,
} from './dromological-holonomy-orbit-transport-tomographic-conjugacy.js';

export const DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_SCHEMA =
  'td613.dome-world.dromological-holonomy-orbit-transport-witness-fiber-descent/v0.1';
export const DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_PARENT_RECEIPT =
  '17475d670e339d7b562194a4429fa979584da65a';

const ORBIT_TYPES = Object.freeze(['H', 'I', 'X']);
const GROUP_SIZE = 256 * 40320;
const EXPECTED_TARGETS_PER_ORBIT = 143360;
const EXPECTED_POINTWISE_STABILIZER = 72;
const EXPECTED_SETWISE_STABILIZER = 576;
const EXPECTED_INDUCED_ACTIONS = 8;
const EXPECTED_RECEIVED_PER_REPRESENTATIVE = 4 * (1 + 8 + 28);
const EXPECTED_STABILIZER_RECEIVER_CHECKS = 3 * EXPECTED_POINTWISE_STABILIZER * EXPECTED_RECEIVED_PER_REPRESENTATIVE;
const EXPECTED_REPRESENTED_WITNESS_INCIDENCES = 3 * EXPECTED_TARGETS_PER_ORBIT * EXPECTED_POINTWISE_STABILIZER;
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
let cachedSetwise = null;
let cachedCertificate = null;
const cachedPointwise = new Map();

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

function permutations(values) {
  const rows = [];
  function visit(prefix, remaining) {
    if (remaining.length === 0) {
      rows.push(freeze(prefix));
      return;
    }
    for (let index = 0; index < remaining.length; index += 1) {
      visit([...prefix, remaining[index]], [...remaining.slice(0, index), ...remaining.slice(index + 1)]);
    }
  }
  visit([], values);
  return freeze(rows);
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

function permuteInteger(value, permutation) {
  const bits = integerToWord(value);
  return wordToInteger(permutation.map(index => bits[index]));
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
  return (
    (words[0] & 0xff)
    | ((words[1] & 0xff) << 8)
    | ((words[2] & 0xff) << 16)
    | ((words[3] & 0xff) << 24)
  ) >>> 0;
}

function unpackWitness(packed) {
  const translation = Math.floor(packed / 40320);
  const permutation_index = packed % 40320;
  const permutation = coordinatePermutations()[permutation_index];
  if (!permutation) throw new Error('witness permutation index outside declared S8 atlas');
  return { translation, permutation_index, permutation };
}

function packWitness(witness) {
  return witness.translation * 40320 + witness.permutation_index;
}

function applyWitness(value, witness) {
  return permuteInteger(value, witness.permutation) ^ witness.translation;
}

function composeWitness(left, right) {
  const permutation = left.permutation.map(index => right.permutation[index]);
  const translation = permuteInteger(right.translation, left.permutation) ^ left.translation;
  const permutation_index = permutationIndex().get(permutation.join(','));
  if (!Number.isInteger(permutation_index)) throw new Error('composed permutation absent from S8 atlas');
  return { translation, permutation_index, permutation };
}

function invertWitness(witness) {
  const inverse = Array(8).fill(0);
  for (let index = 0; index < witness.permutation.length; index += 1) {
    inverse[witness.permutation[index]] = index;
  }
  const permutation_index = permutationIndex().get(inverse.join(','));
  if (!Number.isInteger(permutation_index)) throw new Error('inverse permutation absent from S8 atlas');
  return {
    translation: permuteInteger(witness.translation, inverse),
    permutation_index,
    permutation: inverse,
  };
}

function canonicalWords() {
  return canonicalEightBitRepairCode().map(row => wordToInteger(row.codeword));
}

function representativeAssignments() {
  return dromologicalHolonomyDoubleCorruptionIsometryCertificate()
    .labelled_repair_orbit_certificate.representative_assignments;
}

function representativeWords(type) {
  const assignment = representativeAssignments()[type];
  if (!assignment) throw new Error(`unknown orbit type ${type}`);
  const canonical = canonicalWords();
  return assignment.map(index => canonical[index]);
}

function nearestLabelled(received, words) {
  const ranked = words.map((word, index) => ({ index, distance: hammingInteger(received, word) }))
    .sort((left, right) => left.distance - right.distance || left.index - right.index);
  const minimum = ranked[0].distance;
  const winners = ranked.filter(row => row.distance === minimum);
  return freeze({
    unique: winners.length === 1,
    minimum_distance: minimum,
    repair_mask: winners.length === 1 ? [...REPAIR_MASK_DOMAIN[winners[0].index]] : null,
    codepoint_index: winners.length === 1 ? winners[0].index : null,
  });
}

function radiusTwo(word) {
  const rows = [word];
  for (let first = 0; first < 8; first += 1) rows.push(word ^ (1 << first));
  for (let first = 0; first < 8; first += 1) {
    for (let second = first + 1; second < 8; second += 1) rows.push(word ^ (1 << first) ^ (1 << second));
  }
  return rows;
}

function derivePointwiseStabilizer(type) {
  if (cachedPointwise.has(type)) return cachedPointwise.get(type);
  const source = representativeWords(type);
  const rows = [];
  for (let permutation_index = 0; permutation_index < coordinatePermutations().length; permutation_index += 1) {
    const permutation = coordinatePermutations()[permutation_index];
    const translation = source[0] ^ permuteInteger(source[0], permutation);
    if (source.every(value => (permuteInteger(value, permutation) ^ translation) === value)) {
      rows.push(freeze({ translation, permutation_index, permutation }));
    }
  }
  const result = freeze({
    type,
    elements: freeze(rows),
    size: rows.length,
    exact: rows.length === EXPECTED_POINTWISE_STABILIZER,
  });
  cachedPointwise.set(type, result);
  return result;
}

function deriveSetwiseStabilizer() {
  if (cachedSetwise) return cachedSetwise;
  const canonical = canonicalWords();
  const canonicalKey = setKey(canonical);
  const pointIndex = new Map(canonical.map((value, index) => [value, index]));
  const rows = [];
  const actions = new Map();
  for (let permutation_index = 0; permutation_index < coordinatePermutations().length; permutation_index += 1) {
    const permutation = coordinatePermutations()[permutation_index];
    const transformed = canonical.map(value => permuteInteger(value, permutation));
    for (const translation of canonical) {
      const shifted = transformed.map(value => value ^ translation);
      if (setKey(shifted) !== canonicalKey) continue;
      const action = shifted.map(value => pointIndex.get(value));
      if (!action.every(Number.isInteger)) throw new Error('setwise stabilizer failed codepoint action');
      const key = action.join(',');
      actions.set(key, (actions.get(key) ?? 0) + 1);
      rows.push(freeze({ translation, permutation_index, permutation, action: freeze(action) }));
    }
  }
  cachedSetwise = freeze({
    elements: freeze(rows),
    size: rows.length,
    induced_actions: freeze([...actions.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, multiplicity]) => freeze({ action: key.split(',').map(Number), multiplicity }))),
    exact: rows.length === EXPECTED_SETWISE_STABILIZER
      && actions.size === EXPECTED_INDUCED_ACTIONS
      && [...actions.values()].every(value => value === EXPECTED_POINTWISE_STABILIZER),
  });
  return cachedSetwise;
}

function chooseNontrivialTarget(type) {
  const atlas = buildDromologicalHolonomyOrbitTransportAtlas(type);
  const source = representativeWords(type);
  for (let index = 0; index < atlas.witness_packs.length; index += 1) {
    const witness = unpackWitness(atlas.witness_packs[index]);
    const identityPermutation = witness.permutation.every((value, position) => value === position);
    if (witness.translation === 0 || identityPermutation) continue;
    const targetWords = source.map(value => applyWitness(value, witness));
    if (packLabelledWords(targetWords) !== (atlas.target_keys[index] >>> 0)) continue;
    return freeze({
      target_key: atlas.target_keys[index] >>> 0,
      witness_pack: atlas.witness_packs[index],
      witness,
      target_words: freeze(targetWords),
    });
  }
  throw new Error(`no nontrivial target witness found for ${type}`);
}

function unsafeSetwiseCounterexample() {
  const canonical = canonicalWords();
  const identityPermutation = [0, 1, 2, 3, 4, 5, 6, 7];
  const witness = {
    translation: 79,
    permutation_index: permutationIndex().get(identityPermutation.join(',')),
    permutation: identityPermutation,
  };
  const shifted = canonical.map(value => applyWitness(value, witness));
  const action = shifted.map(value => canonical.indexOf(value));
  const unlabeledSetPreserved = setKey(shifted) === setKey(canonical);
  const identityDecode = nearestLabelled(canonical[0], canonical);
  const hostilePullbackDecode = nearestLabelled(applyWitness(canonical[0], invertWitness(witness)), canonical);
  const union = new Set([
    identityDecode.repair_mask?.join(','),
    hostilePullbackDecode.repair_mask?.join(','),
  ].filter(Boolean));
  const intersectionEmpty = !same(identityDecode.repair_mask, hostilePullbackDecode.repair_mask);
  return freeze({
    translation: 79,
    coordinate_permutation: freeze(identityPermutation),
    induced_codepoint_action: freeze(action),
    expected_induced_codepoint_action: freeze([1, 0, 3, 2]),
    unlabeled_set_preserved: unlabeledSetPreserved,
    identity_repair_mask: identityDecode.repair_mask,
    hostile_pullback_repair_mask: hostilePullbackDecode.repair_mask,
    union_support_size: union.size,
    intersection_empty: intersectionEmpty,
    gamma_size_for_two_witness_subfamily: intersectionEmpty ? union.size : 0,
    exact: unlabeledSetPreserved
      && same(action, [1, 0, 3, 2])
      && same(identityDecode.repair_mask, [0, 0])
      && same(hostilePullbackDecode.repair_mask, [0, 1])
      && union.size === 2
      && intersectionEmpty,
  });
}

function scheduleMap() {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [
    schedule.map(stratum => letters[stratum]).join('-'),
    schedule,
  ]));
}

function witnessFiberDescentCertificate() {
  const parent = dromologicalHolonomyOrbitTransportConjugacyCertificate();
  const setwise = deriveSetwiseStabilizer();
  let stabilizerReceiverChecks = 0;
  let alternativeTargetMapChecks = 0;
  let alternativePullbackChecks = 0;
  let replayChecks = 0;
  let exact = parent.passed && setwise.exact;
  const perType = {};

  for (const type of ORBIT_TYPES) {
    const source = representativeWords(type);
    const stabilizer = derivePointwiseStabilizer(type);
    const sample = chooseNontrivialTarget(type);
    const inversePrimary = invertWitness(sample.witness);
    let localStabilizerChecks = 0;
    let localPullbackChecks = 0;
    if (!stabilizer.exact) exact = false;

    for (const stabilizerElement of stabilizer.elements) {
      const alternative = composeWitness(sample.witness, stabilizerElement);
      const alternativeTarget = source.map(value => applyWitness(value, alternative));
      alternativeTargetMapChecks += 1;
      if (!same(alternativeTarget, sample.target_words)) exact = false;
      const inverseAlternative = invertWitness(alternative);

      for (let classIndex = 0; classIndex < source.length; classIndex += 1) {
        for (const received of radiusTwo(source[classIndex])) {
          const baseDecoded = nearestLabelled(received, source);
          const stabilizedReceived = applyWitness(received, stabilizerElement);
          const stabilizedDecoded = nearestLabelled(stabilizedReceived, source);
          stabilizerReceiverChecks += 1;
          localStabilizerChecks += 1;
          if (!baseDecoded.unique
              || !stabilizedDecoded.unique
              || baseDecoded.minimum_distance > 2
              || stabilizedDecoded.minimum_distance !== baseDecoded.minimum_distance
              || !same(baseDecoded.repair_mask, REPAIR_MASK_DOMAIN[classIndex])
              || !same(stabilizedDecoded.repair_mask, baseDecoded.repair_mask)) exact = false;

          const targetReceived = applyWitness(received, sample.witness);
          const primaryPullback = applyWitness(targetReceived, inversePrimary);
          const alternativePullback = applyWitness(targetReceived, inverseAlternative);
          const primaryDecoded = nearestLabelled(primaryPullback, source);
          const alternativeDecoded = nearestLabelled(alternativePullback, source);
          alternativePullbackChecks += 1;
          localPullbackChecks += 1;
          if (!primaryDecoded.unique
              || !alternativeDecoded.unique
              || !same(primaryDecoded.repair_mask, baseDecoded.repair_mask)
              || !same(alternativeDecoded.repair_mask, baseDecoded.repair_mask)) exact = false;

          const primaryReplay = decodeMinimumCostReplayFromRepairMask(primaryDecoded.repair_mask);
          const alternativeReplay = decodeMinimumCostReplayFromRepairMask(alternativeDecoded.repair_mask);
          replayChecks += 1;
          if (!same(primaryReplay, alternativeReplay)) exact = false;
        }
      }
    }

    perType[type] = freeze({
      pointwise_stabilizer_size: stabilizer.size,
      target_count: parent.transport_coverage_certificate.target_counts[type],
      witness_fibre_size: stabilizer.size,
      represented_witness_incidences: parent.transport_coverage_certificate.target_counts[type] * stabilizer.size,
      stabilizer_receiver_checks: localStabilizerChecks,
      alternative_witness_pullback_checks: localPullbackChecks,
      nontrivial_target_sample: freeze({
        target_key: sample.target_key,
        primary_witness_pack: sample.witness_pack,
      }),
      exact: stabilizer.exact
        && localStabilizerChecks === EXPECTED_POINTWISE_STABILIZER * EXPECTED_RECEIVED_PER_REPRESENTATIVE
        && localPullbackChecks === EXPECTED_POINTWISE_STABILIZER * EXPECTED_RECEIVED_PER_REPRESENTATIVE,
    });
  }

  const unsafe = unsafeSetwiseCounterexample();
  if (!unsafe.exact) exact = false;

  return freeze({
    per_type: freeze(perType),
    declared_group_size: GROUP_SIZE,
    labelled_pointwise_stabilizer_size: EXPECTED_POINTWISE_STABILIZER,
    unlabelled_set_stabilizer_size: setwise.size,
    induced_codepoint_actions: setwise.induced_actions,
    induced_codepoint_action_count: setwise.induced_actions.length,
    every_induced_action_has_multiplicity_72:
      setwise.induced_actions.every(row => row.multiplicity === EXPECTED_POINTWISE_STABILIZER),
    stabilizer_receiver_checks: stabilizerReceiverChecks,
    expected_stabilizer_receiver_checks: EXPECTED_STABILIZER_RECEIVER_CHECKS,
    alternative_target_map_checks: alternativeTargetMapChecks,
    alternative_witness_pullback_checks: alternativePullbackChecks,
    replay_policy_witness_independence_checks: replayChecks,
    represented_witness_incidences_total: ORBIT_TYPES.reduce(
      (sum, type) => sum + perType[type].represented_witness_incidences,
      0,
    ),
    expected_represented_witness_incidences_total: EXPECTED_REPRESENTED_WITNESS_INCIDENCES,
    represented_all_witness_incidences_executed: false,
    fadt_descent: freeze({
      antecedent_coordinate: 'DECLARED_RECEIVER_ISOMETRY_WITNESS_WITHIN_ONE_LABELLED_TARGET_FIBRE',
      surviving_coordinate: 'LABELLED_TARGET_ENCODING_PLUS_TARGET_RECEIVED_WORD',
      support: 'SINGLETON_EXACT_REPAIR_MASK',
      fibrewise_support_constant: exact,
      union_equals_intersection: exact,
      gamma_empty: exact,
    }),
    unsafe_setwise_counterexample: unsafe,
    exact: exact
      && stabilizerReceiverChecks === EXPECTED_STABILIZER_RECEIVER_CHECKS
      && alternativeTargetMapChecks === 3 * EXPECTED_POINTWISE_STABILIZER
      && alternativePullbackChecks === EXPECTED_STABILIZER_RECEIVER_CHECKS
      && replayChecks === EXPECTED_STABILIZER_RECEIVER_CHECKS
      && ORBIT_TYPES.every(type => perType[type].exact)
      && ORBIT_TYPES.every(type => perType[type].represented_witness_incidences === GROUP_SIZE)
      && setwise.size === EXPECTED_SETWISE_STABILIZER
      && setwise.induced_actions.length === EXPECTED_INDUCED_ACTIONS
      && unsafe.exact,
  });
}

function downstreamTomographyCertificate() {
  const classes = deriveDromologicalTerminalHolonomyClasses();
  const policies = dromologicalHolonomyClassReplayPolicy();
  const schedules = scheduleMap();
  let replayChecks = 0;
  let robustChecks = 0;
  let reconstructions = 0;
  let exact = true;

  for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
    const holonomyClass = classes[classIndex];
    const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
    const replay = decodeMinimumCostReplayFromRepairMask(mask);
    replayChecks += 1;
    if (!same(replay, policies[classIndex].replay_row)) exact = false;
    const rescue = classifyReplayAgainstHolonomyClass(holonomyClass, replay);
    robustChecks += 1;
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
            const recovered = invertReplayLocusObservation(observation, schedule, replay);
            reconstructions += 1;
            if (!same(recovered, state)) exact = false;
          }
        }
      }
    }
  }

  const mixedClass = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
  const ambiguityPreserved = Boolean(mixedClass)
    && same([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());

  return freeze({
    repair_class_replay_checks: replayChecks,
    class_robust_unimodular_checks: robustChecks,
    executed_state_reconstructions: reconstructions,
    expected_state_reconstructions: 6 * 125,
    damaged_receiver_word_enters_state_reconstruction: false,
    witness_identity_enters_state_reconstruction: false,
    receiver_witness_acts_on_latent_state: false,
    receiver_witness_acts_on_source_custody: false,
    receiver_witness_acts_on_schedule_history: false,
    receiver_witness_acts_on_raw_terminal_holonomy: false,
    receiver_witness_acts_on_physical_space: false,
    mixed_terminal_holonomy_schedule_ambiguity_preserved: ambiguityPreserved,
    exact: exact && reconstructions === 750 && ambiguityPreserved,
  });
}

export function dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyOrbitTransportConjugacyCertificate();
  const witness = witnessFiberDescentCertificate();
  const tomography = downstreamTomographyCertificate();
  const passed = parent.passed && witness.exact && tomography.exact;
  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_PARENT_RECEIPT,
    parent_schema: parent.schema,
    witness_fiber_descent_certificate: witness,
    downstream_tomography_certificate: tomography,
    passed,
    classification: passed
      ? 'IN_THE_FIXED_S3_AIA_FIXTURE_THE_72_FOLD_DECLARED_RECEIVER_ISOMETRY_WITNESS_FIBER_OVER_EACH_SUCCESSFUL_LABELLED_WIDTH_EIGHT_TARGET_HAS_ZERO_REPAIR_ADMISSIBILITY_GAP_AND_DESCENDS_TO_ONE_EXACT_REPAIR_AND_REPLAY_ASSISTED_TOMOGRAPHY_CLASS_WHILE_THE_576_ELEMENT_UNLABELLED_SET_STABILIZER_IS_TOO_COARSE_FOR_LABELLED_REPAIR_AUTHORITY'
      : 'ORBIT_TRANSPORT_WITNESS_FIBER_ADMISSIBILITY_DESCENT_NOT_ESTABLISHED',
    scars: freeze([
      'WITNESS_IDENTITY != SOURCE_IDENTITY',
      'WITNESS_ERASURE != SOURCE_STATE_ERASURE',
      'LABELLED_POINTWISE_STABILIZER_72 != UNLABELLED_SET_STABILIZER_576',
      'SETWISE_STABILIZATION != LABELLED_ADMISSIBILITY_EQUIVALENCE',
      'STABILIZER_QUOTIENT != GAUGE_QUOTIENT',
      'RECEIVER_WITNESS_COSET != PHYSICAL_ORBIT',
      'MATHEMATICAL_RECEIVER_ISOMETRY_INVERSE != OPERATIONAL_INVERSE_ROUTE',
      'WITNESS_CHOICE_INDEPENDENCE != COMPLETE_SCHEDULE_RECONSTRUCTION',
      'ZERO_WITNESS_FIBER_GAP != ZERO_INFORMATION_LOSS_GLOBALLY',
      'FADT_INSTANTIATION_IN_THIS_FIXTURE != UNIVERSAL_AI_ARCHITECTURE_THEOREM',
      'REPRESENTED_30965760_WITNESS_INCIDENCES != EXECUTED_30965760_WITNESS_INCIDENCES',
      'FINITE_STABILIZER != PHYSICAL_GAUGE_GROUP',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyOrbitTransportWitnessFiberDescentProjection(receiver) {
  const certificate = dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified witness-fiber descent chamber');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.orbit-transport-witness-fiber-descent-child-legible/v0.1',
      truths: freeze([
        'MANY_EXACT_RECEIVER_ROUTE_WITNESSES_CAN_NAME_THE_SAME_LABELLED_TARGET_HERE_WITHOUT_CHANGING_WHICH_REPAIR_MASK_IS_CORRECT',
        'ONLY_WITNESS_DIFFERENCES_THAT_FIX_THE_FOUR_LABELLED_CLUES_IN_PLACE_ARE_SAFE_TO_FORGET',
        'A_LARGER_SYMMETRY_THAT_ONLY_PRESERVES_THE_UNLABELLED_SET_CAN_CHANGE_REPAIR_MEANING',
        'FORGETTING_WITNESS_CHOICE_DOES_NOT_MOVE_THE_HIDDEN_STATE_OR_RECOVER_FORGOTTEN_SCHEDULE_ORDER',
      ]),
      pointwise_stabilizer_atlas_exposed: false,
      alternate_witnesses_exposed: false,
      setwise_counterexample_internals_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
      schedule_history_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.orbit-transport-witness-fiber-descent-loom-technical/v0.1',
      witness_fiber_summary: freeze({
        labelled_pointwise_stabilizer_size:
          certificate.witness_fiber_descent_certificate.labelled_pointwise_stabilizer_size,
        unlabelled_set_stabilizer_size:
          certificate.witness_fiber_descent_certificate.unlabelled_set_stabilizer_size,
        induced_codepoint_action_count:
          certificate.witness_fiber_descent_certificate.induced_codepoint_action_count,
        stabilizer_receiver_checks:
          certificate.witness_fiber_descent_certificate.stabilizer_receiver_checks,
        represented_witness_incidences_total:
          certificate.witness_fiber_descent_certificate.represented_witness_incidences_total,
        fadt_descent: certificate.witness_fiber_descent_certificate.fadt_descent,
        unsafe_setwise_counterexample:
          certificate.witness_fiber_descent_certificate.unsafe_setwise_counterexample,
      }),
      tomography_summary: certificate.downstream_tomography_certificate,
      full_stabilizer_atlas_exposed: false,
      full_alternate_witness_incidence_atlas_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for witness-fiber descent chamber: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_ORBIT_TRANSPORT_WITNESS_FIBER_DESCENT_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    execution_ledger: freeze({
      represented_witness_incidences: EXPECTED_REPRESENTED_WITNESS_INCIDENCES,
      represented_witness_incidences_claimed_executed: false,
      executed_stabilizer_receiver_checks:
        certificate.witness_fiber_descent_certificate.stabilizer_receiver_checks,
      executed_alternative_pullback_checks:
        certificate.witness_fiber_descent_certificate.alternative_witness_pullback_checks,
      executed_state_reconstructions:
        certificate.downstream_tomography_certificate.executed_state_reconstructions,
    }),
    claim_ceiling: freeze({
      fixed_fixture_witness_fiber_admissibility_descent: true,
      universal_ai_architecture_theorem: false,
      universal_coding_theorem: false,
      shannon_capacity: false,
      operational_path_groupoid: false,
      operational_inverse: false,
      physical_symmetry: false,
      physical_gauge: false,
      physical_holonomy: false,
      continuum_tomography: false,
      complete_schedule_reconstruction: false,
      source_state_mutation: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyOrbitTransportWitnessFiberDescentOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_ai_architecture_theorem === true
    || ceiling.universal_coding_theorem === true
    || ceiling.shannon_capacity === true
    || ceiling.operational_path_groupoid === true
    || ceiling.operational_inverse === true
    || ceiling.physical_symmetry === true
    || ceiling.physical_gauge === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.source_state_mutation === true;
  const runtime = candidate?.runtime_binding === true;
  const sourceMutation = candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true;
  const incidenceInflation = candidate?.execution_ledger?.represented_witness_incidences_claimed_executed === true
    || Number(candidate?.execution_ledger?.executed_stabilizer_receiver_checks ?? 0) > EXPECTED_STABILIZER_RECEIVER_CHECKS;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.pointwise_stabilizer_atlas_exposed === true
    || candidate?.payload?.alternate_witnesses_exposed === true
    || candidate?.payload?.setwise_counterexample_internals_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
    || candidate?.payload?.schedule_history_exposed === true
  );
  const badStabilizer = candidate?.labelled_pointwise_stabilizer_size === EXPECTED_SETWISE_STABILIZER
    || candidate?.setwise_stabilizer_claimed_safe === true;
  const sectionAuthority = candidate?.deterministic_section_has_scientific_authority === true;
  return freeze({
    accepted: !authority
      && !overreach
      && !runtime
      && !sourceMutation
      && !incidenceInflation
      && !ashLeak
      && !badStabilizer
      && !sectionAuthority,
  });
}
