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
import { dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate } from './dromological-holonomy-orbit-transport-witness-fiber-descent.js';

export const DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_SCHEMA =
  'td613.dome-world.dromological-holonomy-stabilizer-claim-authority-filtration/v0.1';
export const DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_PARENT_RECEIPT =
  '4c524665fd5a3d59b0ebcd8ec44144466b15ad31';

const ORBIT_TYPES = Object.freeze(['H', 'I', 'X']);
const EXPECTED_SETWISE = 576;
const EXPECTED_ACTIONS = 8;
const EXPECTED_KERNEL = 72;
const EXPECTED_SELECTED_LABEL_PREIMAGE = 144;
const EXPECTED_SETWISE_LABEL_CHECKS = 3 * 576 * 4;
const EXPECTED_SELECTED_LABEL_CHECKS = 3 * 4 * 144;
const EXPECTED_KERNEL_LABEL_CHECKS = 3 * 4 * 72;
const EXPECTED_ACTION_COMPOSITION_CHECKS = 3 * 8 * 8;
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

let cachedCoordinatePermutations = null;
let cachedPermutationIndex = null;
let cachedSetwiseElements = null;
let cachedCertificate = null;

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
      visit(
        [...prefix, remaining[index]],
        [...remaining.slice(0, index), ...remaining.slice(index + 1)],
      );
    }
  }
  visit([], values);
  return freeze(rows);
}

function coordinatePermutations() {
  if (!cachedCoordinatePermutations) {
    cachedCoordinatePermutations = permutations([0, 1, 2, 3, 4, 5, 6, 7]);
  }
  return cachedCoordinatePermutations;
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

function setKey(values) {
  return [...values].sort((left, right) => left - right).join(',');
}

function actionKey(action) {
  return action.join(',');
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
  if (!assignment) throw new Error(`unknown labelled orbit type ${type}`);
  const canonical = canonicalWords();
  return assignment.map(index => canonical[index]);
}

function applyWitness(value, witness) {
  return permuteInteger(value, witness.permutation) ^ witness.translation;
}

function composeWitness(left, right) {
  const permutation = left.permutation.map(index => right.permutation[index]);
  const permutation_index = permutationIndex().get(permutation.join(','));
  if (!Number.isInteger(permutation_index)) throw new Error('composed coordinate permutation absent from S8 atlas');
  return freeze({
    translation: permuteInteger(right.translation, left.permutation) ^ left.translation,
    permutation_index,
    permutation,
  });
}

function composeActions(left, right) {
  return right.map(index => left[index]);
}

function deriveSetwiseElements() {
  if (cachedSetwiseElements) return cachedSetwiseElements;
  const canonical = canonicalWords();
  const key = setKey(canonical);
  const rows = [];
  for (let permutation_index = 0; permutation_index < coordinatePermutations().length; permutation_index += 1) {
    const permutation = coordinatePermutations()[permutation_index];
    const transformed = canonical.map(value => permuteInteger(value, permutation));
    for (const translation of canonical) {
      const shifted = transformed.map(value => value ^ translation);
      if (setKey(shifted) !== key) continue;
      rows.push(freeze({ translation, permutation_index, permutation }));
    }
  }
  cachedSetwiseElements = freeze(rows);
  return cachedSetwiseElements;
}

function inducedLabelAction(witness, type) {
  const words = representativeWords(type);
  const index = new Map(words.map((value, position) => [value, position]));
  const action = words.map(value => index.get(applyWitness(value, witness)));
  if (!action.every(Number.isInteger)) throw new Error('setwise witness failed labelled codepoint action');
  return freeze(action);
}

function matchingEdges(type) {
  const words = representativeWords(type);
  const edges = [];
  for (let left = 0; left < words.length; left += 1) {
    for (let right = left + 1; right < words.length; right += 1) {
      if (hammingInteger(words[left], words[right]) === 6) edges.push([left, right]);
    }
  }
  return freeze(edges.map(edge => freeze(edge)));
}

function edgeSetKey(edges) {
  return edges
    .map(([left, right]) => left < right ? `${left}-${right}` : `${right}-${left}`)
    .sort()
    .join('|');
}

function preservesMatching(permutation, edges) {
  const target = edgeSetKey(edges);
  const moved = edges.map(([left, right]) => [permutation[left], permutation[right]]);
  return edgeSetKey(moved) === target;
}

function deriveMatchingAutomorphisms(type) {
  const ambient = permutations([0, 1, 2, 3]);
  const edges = matchingEdges(type);
  const automorphisms = ambient.filter(row => preservesMatching(row, edges));
  return freeze({
    ambient_permutations: ambient.length,
    matching_edges: edges,
    automorphisms: freeze(automorphisms),
    count: automorphisms.length,
    exact: edges.length === 2 && automorphisms.length === EXPECTED_ACTIONS,
  });
}

function actionFamily(type, setwise) {
  const rows = setwise.map(witness => freeze({
    witness,
    action: inducedLabelAction(witness, type),
  }));
  const byAction = new Map();
  for (const row of rows) {
    const key = actionKey(row.action);
    if (!byAction.has(key)) byAction.set(key, []);
    byAction.get(key).push(row.witness);
  }
  return { rows, byAction };
}

function fadtSingletonSignature(actions, label) {
  const supports = new Set(actions.map(action => action[label]));
  const intersectionNonempty = supports.size === 1;
  return freeze({
    union_labels: freeze([...supports].sort((left, right) => left - right)),
    union_size: supports.size,
    intersection_labels: freeze(intersectionNonempty ? [...supports] : []),
    intersection_empty: !intersectionNonempty,
    gamma_labels: freeze(intersectionNonempty ? [] : [...supports].sort((left, right) => left - right)),
    gamma_size: intersectionNonempty ? 0 : supports.size,
  });
}

function scheduleMap() {
  const letters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
  return new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [
    schedule.map(stratum => letters[stratum]).join('-'),
    schedule,
  ]));
}

function claimAuthorityCertificate() {
  const setwise = deriveSetwiseElements();
  const identityAction = freeze([0, 1, 2, 3]);
  let exact = setwise.length === EXPECTED_SETWISE;
  let setwiseLabelChecks = 0;
  let selectedLabelChecks = 0;
  let kernelLabelChecks = 0;
  let compositionChecks = 0;
  let matchingPredicateChecks = 0;
  const perType = {};

  for (const type of ORBIT_TYPES) {
    const family = actionFamily(type, setwise);
    const matching = deriveMatchingAutomorphisms(type);
    const matchingKeys = new Set(matching.automorphisms.map(actionKey));
    const actionKeys = new Set(family.byAction.keys());
    const actionRows = [...family.byAction.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, witnesses]) => freeze({
        action: freeze(key.split(',').map(Number)),
        multiplicity: witnesses.length,
      }));

    matchingPredicateChecks += matching.ambient_permutations;
    const actionSetEqualsMatchingAutomorphisms = actionKeys.size === matchingKeys.size
      && [...actionKeys].every(key => matchingKeys.has(key));
    const multiplicitiesExact = [...family.byAction.values()].every(rows => rows.length === EXPECTED_KERNEL);
    const kernelRows = family.rows.filter(row => same(row.action, identityAction));

    let localSetwiseLabelChecks = 0;
    let localSelectedLabelChecks = 0;
    let localKernelLabelChecks = 0;
    let localCompositionChecks = 0;

    const fullSetwiseFadt = [];
    const selectedLabels = [];

    for (let label = 0; label < 4; label += 1) {
      for (const row of family.rows) {
        setwiseLabelChecks += 1;
        localSetwiseLabelChecks += 1;
        if (!Number.isInteger(row.action[label]) || row.action[label] < 0 || row.action[label] > 3) exact = false;
      }

      const fullSignature = fadtSingletonSignature(family.rows.map(row => row.action), label);
      fullSetwiseFadt.push(freeze({ label, ...fullSignature }));
      if (fullSignature.union_size !== 4
          || !fullSignature.intersection_empty
          || fullSignature.gamma_size !== 4) exact = false;

      const selectedRows = family.rows.filter(row => row.action[label] === label);
      const selectedActionKeys = new Set(selectedRows.map(row => actionKey(row.action)));
      for (const row of selectedRows) {
        selectedLabelChecks += 1;
        localSelectedLabelChecks += 1;
        if (row.action[label] !== label) exact = false;
      }
      const selectedSignature = fadtSingletonSignature(selectedRows.map(row => row.action), label);
      const movesOtherWitness = selectedRows.find(row => row.action.some((target, index) => index !== label && target !== index));
      const outsideWitness = family.rows.find(row => row.action[label] !== label);
      const otherLabelMoved = Boolean(movesOtherWitness);
      const outsideMovesSelected = Boolean(outsideWitness);
      if (selectedRows.length !== EXPECTED_SELECTED_LABEL_PREIMAGE
          || selectedActionKeys.size !== 2
          || selectedSignature.union_size !== 1
          || selectedSignature.intersection_empty
          || selectedSignature.gamma_size !== 0
          || !otherLabelMoved
          || !outsideMovesSelected) exact = false;

      selectedLabels.push(freeze({
        label,
        repair_mask: REPAIR_MASK_DOMAIN[label],
        action_stabilizer_size: selectedActionKeys.size,
        receiver_preimage_size: selectedRows.length,
        fadt_signature: selectedSignature,
        nonidentity_selected_label_witness: movesOtherWitness ? freeze({
          translation: movesOtherWitness.witness.translation,
          permutation_index: movesOtherWitness.witness.permutation_index,
          action: movesOtherWitness.action,
        }) : null,
        outside_preimage_witness: outsideWitness ? freeze({
          translation: outsideWitness.witness.translation,
          permutation_index: outsideWitness.witness.permutation_index,
          action: outsideWitness.action,
        }) : null,
        selected_label_safe_but_not_global: otherLabelMoved,
        maximal_for_selected_label: outsideMovesSelected,
      }));

      for (const row of kernelRows) {
        kernelLabelChecks += 1;
        localKernelLabelChecks += 1;
        if (row.action[label] !== label) exact = false;
      }
    }

    const actionRepresentatives = new Map(
      [...family.byAction.entries()].map(([key, witnesses]) => [key, witnesses[0]]),
    );
    let noncommutingPair = null;
    for (const [leftKey, leftWitness] of actionRepresentatives.entries()) {
      for (const [rightKey, rightWitness] of actionRepresentatives.entries()) {
        const leftAction = leftKey.split(',').map(Number);
        const rightAction = rightKey.split(',').map(Number);
        const composedWitness = composeWitness(leftWitness, rightWitness);
        const induced = inducedLabelAction(composedWitness, type);
        const expected = composeActions(leftAction, rightAction);
        compositionChecks += 1;
        localCompositionChecks += 1;
        if (!same(induced, expected) || !actionKeys.has(actionKey(induced))) exact = false;
        if (!noncommutingPair) {
          const reverse = composeActions(rightAction, leftAction);
          if (!same(expected, reverse)) {
            noncommutingPair = freeze({ left: leftAction, right: rightAction, left_after_right: expected, right_after_left: reverse });
          }
        }
      }
    }

    const excludedPermutation = permutations([0, 1, 2, 3]).find(row => !preservesMatching(row, matching.matching_edges));
    const excludedAbsentFromImage = Boolean(excludedPermutation) && !actionKeys.has(actionKey(excludedPermutation));
    const everyNonkernelMovesSomeLabel = family.rows
      .filter(row => !same(row.action, identityAction))
      .every(row => row.action.some((target, index) => target !== index));
    const everySetwiseActionPreservesMatching = family.rows.every(row => preservesMatching(row.action, matching.matching_edges));

    if (!matching.exact
        || family.rows.length !== EXPECTED_SETWISE
        || actionRows.length !== EXPECTED_ACTIONS
        || !multiplicitiesExact
        || !actionSetEqualsMatchingAutomorphisms
        || kernelRows.length !== EXPECTED_KERNEL
        || !noncommutingPair
        || !excludedAbsentFromImage
        || !everyNonkernelMovesSomeLabel
        || !everySetwiseActionPreservesMatching
        || localSetwiseLabelChecks !== EXPECTED_SETWISE * 4
        || localSelectedLabelChecks !== 4 * EXPECTED_SELECTED_LABEL_PREIMAGE
        || localKernelLabelChecks !== 4 * EXPECTED_KERNEL
        || localCompositionChecks !== EXPECTED_ACTIONS * EXPECTED_ACTIONS) exact = false;

    perType[type] = freeze({
      setwise_stabilizer_size: family.rows.length,
      induced_action_count: actionRows.length,
      induced_actions: freeze(actionRows),
      matching_edges: matching.matching_edges,
      ambient_s4_permutation_count: matching.ambient_permutations,
      matching_automorphism_count: matching.count,
      image_equals_matching_automorphism_group: actionSetEqualsMatchingAutomorphisms,
      every_action_multiplicity_72: multiplicitiesExact,
      kernel_size: kernelRows.length,
      selected_label_authority: freeze(selectedLabels),
      full_setwise_fadt_signatures: freeze(fullSetwiseFadt),
      full_setwise_preserves_matching_geometry: everySetwiseActionPreservesMatching,
      full_setwise_preserves_complete_label_map: false,
      kernel_preserves_complete_label_map: kernelRows.every(row => same(row.action, identityAction)),
      every_nonkernel_element_moves_at_least_one_label: everyNonkernelMovesSomeLabel,
      excluded_matching_destroying_permutation: freeze(excludedPermutation),
      excluded_matching_destroying_permutation_absent_from_image: excludedAbsentFromImage,
      noncommuting_action_pair: noncommutingPair,
      executed_setwise_label_action_checks: localSetwiseLabelChecks,
      executed_selected_label_stabilizer_checks: localSelectedLabelChecks,
      executed_kernel_label_checks: localKernelLabelChecks,
      executed_action_composition_checks: localCompositionChecks,
      exact: matching.exact
        && family.rows.length === EXPECTED_SETWISE
        && actionRows.length === EXPECTED_ACTIONS
        && multiplicitiesExact
        && actionSetEqualsMatchingAutomorphisms
        && kernelRows.length === EXPECTED_KERNEL
        && selectedLabels.every(row => row.receiver_preimage_size === EXPECTED_SELECTED_LABEL_PREIMAGE
          && row.action_stabilizer_size === 2
          && row.fadt_signature.gamma_size === 0
          && row.selected_label_safe_but_not_global
          && row.maximal_for_selected_label)
        && fullSetwiseFadt.every(row => row.union_size === 4 && row.intersection_empty && row.gamma_size === 4)
        && everySetwiseActionPreservesMatching
        && everyNonkernelMovesSomeLabel
        && excludedAbsentFromImage
        && Boolean(noncommutingPair),
    });
  }

  const translation79 = (() => {
    const identityPermutation = [0, 1, 2, 3, 4, 5, 6, 7];
    const witness = freeze({
      translation: 79,
      permutation_index: permutationIndex().get(identityPermutation.join(',')),
      permutation: freeze(identityPermutation),
    });
    const action = inducedLabelAction(witness, 'H');
    return freeze({
      translation: 79,
      permutation: identityPermutation,
      H_action: action,
      moves_00_to_01: action[0] === 1,
      exact: same(action, [1, 0, 3, 2]),
    });
  })();
  if (!translation79.exact) exact = false;

  return freeze({
    ambient_coordinate_permutations_checked: coordinatePermutations().length,
    ambient_s4_permutation_count: 24,
    setwise_stabilizer_size: setwise.length,
    expected_setwise_stabilizer_size: EXPECTED_SETWISE,
    induced_action_count: EXPECTED_ACTIONS,
    full_repair_map_kernel_size: EXPECTED_KERNEL,
    selected_label_receiver_preimage_size: EXPECTED_SELECTED_LABEL_PREIMAGE,
    candidate_authority_filtration: freeze({
      matching_geometry: 576,
      one_selected_repair_label: 144,
      complete_four_label_repair_map: 72,
    }),
    per_type: freeze(perType),
    translation_79_control: translation79,
    executed_setwise_label_action_checks: setwiseLabelChecks,
    expected_setwise_label_action_checks: EXPECTED_SETWISE_LABEL_CHECKS,
    executed_selected_label_stabilizer_checks: selectedLabelChecks,
    expected_selected_label_stabilizer_checks: EXPECTED_SELECTED_LABEL_CHECKS,
    executed_kernel_label_checks: kernelLabelChecks,
    expected_kernel_label_checks: EXPECTED_KERNEL_LABEL_CHECKS,
    executed_action_composition_checks: compositionChecks,
    expected_action_composition_checks: EXPECTED_ACTION_COMPOSITION_CHECKS,
    executed_matching_predicate_checks: matchingPredicateChecks,
    expected_matching_predicate_checks: 3 * 24,
    exact: exact
      && coordinatePermutations().length === 40320
      && setwise.length === EXPECTED_SETWISE
      && setwiseLabelChecks === EXPECTED_SETWISE_LABEL_CHECKS
      && selectedLabelChecks === EXPECTED_SELECTED_LABEL_CHECKS
      && kernelLabelChecks === EXPECTED_KERNEL_LABEL_CHECKS
      && compositionChecks === EXPECTED_ACTION_COMPOSITION_CHECKS
      && matchingPredicateChecks === 72
      && ORBIT_TYPES.every(type => perType[type].exact)
      && translation79.exact,
  });
}

function downstreamControlCertificate() {
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
            if (!same(state, recovered)) exact = false;
          }
        }
      }
    }
  }

  const mixedClass = classes.find(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2);
  const ambiguityPreserved = Boolean(mixedClass)
    && same([...mixedClass.schedule_ids].sort(), ['H-I-P', 'I-H-P'].sort());

  return freeze({
    repair_policy_checks: replayChecks,
    robust_unimodular_checks: robustChecks,
    executed_state_reconstructions: reconstructions,
    expected_state_reconstructions: 750,
    witness_identity_enters_state_reconstruction: false,
    stabilizer_action_enters_state_reconstruction: false,
    receiver_action_acts_on_latent_state: false,
    receiver_action_acts_on_source_custody: false,
    receiver_action_acts_on_schedule_history: false,
    mixed_schedule_ambiguity_preserved: ambiguityPreserved,
    exact: exact && reconstructions === 750 && ambiguityPreserved,
  });
}

export function dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate() {
  if (cachedCertificate) return cachedCertificate;
  const parent = dromologicalHolonomyOrbitTransportWitnessFiberDescentCertificate();
  const authority = claimAuthorityCertificate();
  const downstream = downstreamControlCertificate();
  const passed = parent.passed && authority.exact && downstream.exact;
  cachedCertificate = freeze({
    schema: DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_SCHEMA,
    parent_receipt: DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_PARENT_RECEIPT,
    parent_schema: parent.schema,
    claim_authority_certificate: authority,
    downstream_control_certificate: downstream,
    passed,
    classifications: freeze(passed ? [
      'IN_THE_FIXED_WIDTH_EIGHT_S3_AIA_FIXTURE_THE_INDUCED_REPAIR_LABEL_ACTION_OF_THE_576_ELEMENT_UNLABELED_SET_STABILIZER_HAS_EXACTLY_EIGHT_MATCHING_PRESERVING_ACTIONS_WITH_72_ELEMENT_KERNEL',
      'MAXIMAL_SAFE_WITNESS_ERASURE_IS_CLAIM_RELATIVE_IN_THIS_FIXTURE_WITH_576_WITNESSES_PRESERVING_THE_DECLARED_DISTANCE_MATCHING_GEOMETRY_144_WITNESSES_PRESERVING_ONE_SELECTED_REPAIR_LABEL_AND_72_WITNESSES_PRESERVING_THE_COMPLETE_FOUR_LABEL_REPAIR_MAP',
      'THE_KERNEL_OF_THE_INDUCED_REPAIR_LABEL_ACTION_IS_EXACTLY_THE_MAXIMAL_SUBGROUP_THROUGH_WHICH_COMPLETE_REPAIR_LABEL_AUTHORITY_DESCENDS_WHILE_EACH_SINGLE_LABEL_ADMITS_THE_STRICTLY_LARGER_144_ELEMENT_PREIMAGE_OF_ITS_ACTION_STABILIZER',
      'CLAIM_GRANULARITY_CAN_CHANGE_THE_MAXIMUM_SAFE_FINITE_WITNESS_QUOTIENT_WITHOUT_CHANGING_SOURCE_INFORMATION_CUSTODY_OR_RECEIVER_AUTHORITY',
    ] : [
      'STABILIZER_CLAIM_AUTHORITY_FILTRATION_NOT_ESTABLISHED',
    ]),
    scars: freeze([
      'MATCHING_PRESERVATION != INDIVIDUAL_LABEL_PRESERVATION',
      'ONE_LABEL_STABILIZER != COMPLETE_REPAIR_MAP_STABILIZER',
      'MAXIMAL_SAFE_FOR_ONE_CLAIM != MAXIMAL_SAFE_FOR_ALL_CLAIMS',
      'ACTION_KERNEL != PHYSICAL_GAUGE_KERNEL',
      'ACTION_QUOTIENT != OPERATIONAL_GROUP_QUOTIENT',
      'FINITE_PERMUTATION_GROUP != PHYSICAL_SYMMETRY_GROUP',
      'CLAIM_AUTHORITY_FILTRATION != SEMANTIC_HIERARCHY',
      'REPAIR_LABEL_ACTION != SEMANTIC_ONTOLOGY',
      'WITNESS_ERASURE != SOURCE_STATE_ERASURE',
      'FULL_576_FADT_GAP != GLOBAL_INFORMATION_LOSS_METRIC',
      'FADT_INSTANTIATION_IN_THIS_FIXTURE != UNIVERSAL_AI_ARCHITECTURE_THEOREM',
      'MATCHING_AUTOMORPHISM != SENSOR_REWIRING',
      'MATHEMATICAL_RECEIVER_ISOMETRY_INVERSE != OPERATIONAL_INVERSE_ROUTE',
      'REPAIR_LABEL_PRESERVATION != COMPLETE_SCHEDULE_RECONSTRUCTION',
    ]),
  });
  return cachedCertificate;
}

export function compileDromologicalHolonomyStabilizerClaimAuthorityFiltrationProjection(receiver) {
  const certificate = dromologicalHolonomyStabilizerClaimAuthorityFiltrationCertificate();
  if (!certificate.passed) throw new Error('cannot project uncertified stabilizer claim-authority filtration');
  let payload;
  if (receiver === AIA_RECEIVERS.ASH) {
    payload = freeze({
      payload_schema: 'td613.dome-world.stabilizer-claim-authority-filtration-child-legible/v0.1',
      truths: freeze([
        'HOW_MUCH_ROUTE_DETAIL_IS_SAFE_TO_FORGET_DEPENDS_ON_WHAT_CLAIM_YOU_ARE_TRYING_TO_PRESERVE',
        'THE_WHOLE_FOUR_POINT_SHAPE_CAN_STAY_THE_SAME_EVEN_WHEN_ONE_POINT_LABEL_MOVES',
        'PRESERVING_ONE_CHOSEN_REPAIR_LABEL_ALLOWS_MORE_ROUTE_VARIATION_THAN_PRESERVING_ALL_FOUR_LABELS_AT_ONCE',
        'FORGETTING_RECEIVER_ROUTE_DETAIL_DOES_NOT_MOVE_THE_HIDDEN_STATE_OR_RESTORE_FORGOTTEN_SCHEDULE_ORDER',
      ]),
      full_stabilizer_table_exposed: false,
      action_multiplication_table_exposed: false,
      selected_label_witnesses_exposed: false,
      replay_vectors_exposed: false,
      latent_state_exposed: false,
      schedule_history_exposed: false,
    });
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    payload = freeze({
      payload_schema: 'td613.dome-world.stabilizer-claim-authority-filtration-loom-technical/v0.1',
      authority_filtration: certificate.claim_authority_certificate.candidate_authority_filtration,
      per_type_summary: freeze(Object.fromEntries(ORBIT_TYPES.map(type => [type, freeze({
        setwise_stabilizer_size: certificate.claim_authority_certificate.per_type[type].setwise_stabilizer_size,
        induced_action_count: certificate.claim_authority_certificate.per_type[type].induced_action_count,
        matching_automorphism_count: certificate.claim_authority_certificate.per_type[type].matching_automorphism_count,
        kernel_size: certificate.claim_authority_certificate.per_type[type].kernel_size,
        selected_label_authority: certificate.claim_authority_certificate.per_type[type].selected_label_authority,
        full_setwise_fadt_signatures: certificate.claim_authority_certificate.per_type[type].full_setwise_fadt_signatures,
      })]))),
      downstream_control: certificate.downstream_control_certificate,
      full_setwise_element_atlas_exposed: false,
      full_action_multiplication_table_exposed: false,
    });
  } else {
    throw new Error(`undeclared AIA receiver for stabilizer claim-authority filtration: ${receiver}`);
  }

  return freeze({
    schema: DROMOLOGICAL_HOLONOMY_STABILIZER_CLAIM_AUTHORITY_FILTRATION_SCHEMA,
    receiver,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    payload,
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
    source_state_transform: false,
    execution_ledger: freeze({
      setwise_label_action_checks: certificate.claim_authority_certificate.executed_setwise_label_action_checks,
      selected_label_stabilizer_checks: certificate.claim_authority_certificate.executed_selected_label_stabilizer_checks,
      kernel_label_checks: certificate.claim_authority_certificate.executed_kernel_label_checks,
      action_composition_checks: certificate.claim_authority_certificate.executed_action_composition_checks,
      state_reconstructions: certificate.downstream_control_certificate.executed_state_reconstructions,
      represented_large_cross_product_claimed_executed: false,
    }),
    claim_ceiling: freeze({
      fixed_fixture_claim_authority_filtration: true,
      universal_ai_architecture_theorem: false,
      universal_group_action_theorem: false,
      universal_coding_theorem: false,
      shannon_capacity: false,
      operational_path_groupoid: false,
      operational_inverse: false,
      physical_symmetry: false,
      physical_gauge: false,
      physical_holonomy: false,
      continuum_tomography: false,
      semantic_hierarchy: false,
      complete_schedule_reconstruction: false,
      source_state_mutation: false,
      production: false,
    }),
  });
}

export function rejectDromologicalHolonomyStabilizerClaimAuthorityFiltrationOverreach(candidate) {
  const authority = Object.values(candidate?.authority ?? {}).some(Boolean);
  const ceiling = candidate?.claim_ceiling ?? {};
  const overreach = ceiling.universal_ai_architecture_theorem === true
    || ceiling.universal_group_action_theorem === true
    || ceiling.universal_coding_theorem === true
    || ceiling.shannon_capacity === true
    || ceiling.operational_path_groupoid === true
    || ceiling.operational_inverse === true
    || ceiling.physical_symmetry === true
    || ceiling.physical_gauge === true
    || ceiling.physical_holonomy === true
    || ceiling.continuum_tomography === true
    || ceiling.semantic_hierarchy === true
    || ceiling.complete_schedule_reconstruction === true
    || ceiling.source_state_mutation === true;
  const claimCollapse = candidate?.matching_geometry_stabilizer_claimed_full_repair_safe === true
    || candidate?.selected_label_144_claimed_full_map_safe === true
    || candidate?.all_claim_levels_declared_equivalent === true;
  const gapOverclaim = candidate?.full_576_gamma_claimed_zero === true
    || candidate?.selected_label_144_global_gamma_claimed_zero === true;
  const gaugeOverclaim = candidate?.action_kernel_claimed_physical_gauge_kernel === true
    || candidate?.action_quotient_claimed_operational_group_quotient === true;
  const sourceMutation = candidate?.source_state_transform === true
    || candidate?.authority?.source_state_transform === true;
  const runtime = candidate?.runtime_binding === true;
  const ashLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.payload?.full_stabilizer_table_exposed === true
    || candidate?.payload?.action_multiplication_table_exposed === true
    || candidate?.payload?.selected_label_witnesses_exposed === true
    || candidate?.payload?.replay_vectors_exposed === true
    || candidate?.payload?.latent_state_exposed === true
    || candidate?.payload?.schedule_history_exposed === true
  );
  return freeze({
    accepted: !authority
      && !overreach
      && !claimCollapse
      && !gapOverclaim
      && !gaugeOverclaim
      && !sourceMutation
      && !runtime
      && !ashLeak,
  });
}
