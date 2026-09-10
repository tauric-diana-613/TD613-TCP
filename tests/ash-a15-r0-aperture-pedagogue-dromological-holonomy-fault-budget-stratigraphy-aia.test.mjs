import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import { PHASONIC_CUPOLA_CUSTODY_WITNESS } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { observeReplayAssistedState } from '../app/dome-world/previews/a15-r0/dromological-baseline-replay-rescue-aperture.js';
import { invertReplayLocusObservation } from '../app/dome-world/previews/a15-r0/dromological-replay-transversality-unimodular-locus.js';
import {
  deriveDromologicalTerminalHolonomyClasses,
  classifyReplayAgainstHolonomyClass,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-coarsened-robust-replay-inverse-design.js';
import {
  derivePrimaryHolonomyRepairMask,
  decodeMinimumCostReplayFromRepairMask,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-minimal-coordinate-repair-routing-aperture.js';
import {
  REPAIR_MASK_DOMAIN,
  EVEN_PARITY_IMAGE,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-parity-completion-erasure-robust-aia.js';
import { canonicalFiveBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-single-corruption-correcting-aia.js';
import { canonicalSixBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-corruption-plus-erasure-aia.js';
import { canonicalEightBitRepairCode } from '../app/dome-world/previews/a15-r0/dromological-holonomy-double-corruption-correcting-aia.js';
import {
  DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_SCHEMA,
  DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_PARENT_RECEIPT,
  dromologicalHolonomyFaultBudgetStratigraphyCertificate,
  compileDromologicalHolonomyFaultBudgetProjection,
  rejectDromologicalHolonomyFaultBudgetOverreach,
} from '../app/dome-world/previews/a15-r0/dromological-holonomy-fault-budget-stratigraphy-aia.js';

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function hamming(left, right) {
  assert.equal(left.length, right.length);
  return left.reduce((sum, bit, index) => sum + (bit === right[index] ? 0 : 1), 0);
}

function pairwiseDistances(code) {
  const rows = [];
  for (let left = 0; left < code.length; left += 1) {
    for (let right = left + 1; right < code.length; right += 1) {
      rows.push(hamming(code[left].codeword, code[right].codeword));
    }
  }
  return rows.sort((a, b) => a - b);
}

function subsets(width, choose) {
  const rows = [];
  function visit(start, picked) {
    if (picked.length === choose) {
      rows.push([...picked]);
      return;
    }
    for (let index = start; index < width; index += 1) visit(index + 1, [...picked, index]);
  }
  visit(0, []);
  return rows;
}

function puncture(word, erasedIndices) {
  const erased = new Set(erasedIndices);
  return word.filter((_, index) => !erased.has(index));
}

function receivedAtMost(word, radius) {
  const rows = [];
  for (let flips = 0; flips <= radius; flips += 1) {
    for (const indices of subsets(word.length, flips)) {
      const received = [...word];
      for (const index of indices) received[index] ^= 1;
      rows.push(received);
    }
  }
  return rows;
}

function independentDecode(received, code, erasedIndices) {
  const ranked = code.map(row => ({
    repair_mask: row.repair_mask,
    punctured: puncture(row.codeword, erasedIndices),
  })).map(row => ({
    ...row,
    distance: hamming(received, row.punctured),
  })).sort((a, b) => a.distance - b.distance);
  const minimum = ranked[0].distance;
  const nearest = ranked.filter(row => row.distance === minimum);
  return {
    unique: nearest.length === 1,
    repair_mask: nearest.length === 1 ? nearest[0].repair_mask : null,
    minimum_distance: minimum,
    tie_count: nearest.length,
  };
}

function independentProfileAudit(code, erasures, corruptionRadius) {
  let audits = 0;
  let exact = true;
  let firstAmbiguity = null;
  for (const erasedIndices of subsets(code[0].codeword.length, erasures)) {
    for (const row of code) {
      const source = puncture(row.codeword, erasedIndices);
      for (const received of receivedAtMost(source, corruptionRadius)) {
        const decoded = independentDecode(received, code, erasedIndices);
        audits += 1;
        const rowExact = decoded.unique && same(decoded.repair_mask, row.repair_mask);
        if (!rowExact) {
          exact = false;
          if (!firstAmbiguity) firstAmbiguity = { erasedIndices, expected: row.repair_mask, source, received, decoded };
        }
      }
    }
  }
  return { exact, audits, firstAmbiguity };
}

function parityCode() {
  return REPAIR_MASK_DOMAIN.map((repairMask, index) => ({
    repair_mask: repairMask,
    codeword: EVEN_PARITY_IMAGE[index],
  }));
}

const ladder = [
  { id: 824, code: parityCode(), width: 3, dmin: 2, positive: 2, failing: 8 },
  { id: 826, code: canonicalFiveBitRepairCode(), width: 5, dmin: 3, positive: 4, failing: 17 },
  { id: 828, code: canonicalSixBitRepairCode(), width: 6, dmin: 4, positive: 6, failing: 22 },
  { id: 830, code: canonicalEightBitRepairCode(), width: 8, dmin: 5, positive: 9, failing: 36 },
];

const certificate = dromologicalHolonomyFaultBudgetStratigraphyCertificate();
assert.equal(certificate.schema, DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_SCHEMA);
assert.equal(DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_PARENT_RECEIPT,
  '3877139365041453bab85741eb09ba2f5839eed6');
assert.equal(certificate.parent_receipt, DROMOLOGICAL_HOLONOMY_FAULT_BUDGET_STRATIGRAPHY_PARENT_RECEIPT);
assert.equal(certificate.ancestors_passed, true);

let independentDecoderAudits = 0;
const independentRows = [];
for (const representation of ladder) {
  const distances = pairwiseDistances(representation.code);
  assert.equal(Math.min(...distances), representation.dmin);
  const budget = representation.dmin - 1;
  let positives = 0;
  let failures = 0;
  const positiveProfiles = [];
  const boundaryFailures = [];

  for (let erasures = 0; erasures <= representation.width; erasures += 1) {
    for (let corruptions = 0; corruptions <= representation.width - erasures; corruptions += 1) {
      const audit = independentProfileAudit(representation.code, erasures, corruptions);
      independentDecoderAudits += audit.audits;
      const expected = (erasures + 2 * corruptions) <= budget;
      assert.equal(audit.exact, expected,
        `PR #${representation.id} profile (${erasures},${corruptions}) disagrees with finite preregistered budget`);
      if (audit.exact) {
        positives += 1;
        positiveProfiles.push([erasures, corruptions]);
      } else {
        failures += 1;
      }
      if ((erasures + 2 * corruptions) === budget + 1) {
        assert.equal(audit.exact, false);
        assert.ok(audit.firstAmbiguity);
        boundaryFailures.push([erasures, corruptions]);
      }
    }
  }

  assert.equal(positives, representation.positive);
  assert.equal(failures, representation.failing);
  assert.ok(boundaryFailures.length > 0);
  independentRows.push({ id: representation.id, budget, positiveProfiles, boundaryFailures });
}

assert.equal(independentDecoderAudits, 107784);
assert.deepEqual(independentRows.map(row => row.budget), [1, 2, 3, 4]);
assert.deepEqual(independentRows[3].positiveProfiles, [
  [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1], [3, 0], [4, 0],
]);
assert.deepEqual(independentRows[3].boundaryFailures, [[1, 2], [3, 1], [5, 0]]);

const implementationLadder = certificate.fault_budget_ladder_certificate;
assert.equal(implementationLadder.exact, true);
assert.equal(implementationLadder.total_profile_decoder_audits, 107784);
assert.deepEqual(implementationLadder.observed_repair_budgets, [1, 2, 3, 4]);
assert.equal(implementationLadder.width_eight_positive_profiles_exact, true);
assert.equal(implementationLadder.width_eight_maximal_positive_profiles_exact, true);
assert.deepEqual(implementationLadder.representations.map(row => row.positive_profile_count), [2, 4, 6, 9]);
assert.deepEqual(implementationLadder.representations.map(row => row.failing_profile_count), [8, 17, 22, 36]);
assert.ok(implementationLadder.representations.every(row => row.budget_predicate_agrees_with_every_exhaustive_profile));
assert.ok(implementationLadder.representations.every(row => row.boundary_failures_have_explicit_ambiguities));

const widthEight = certificate.width_eight_positive_profile_certificate;
assert.equal(widthEight.exact, true);
assert.equal(widthEight.positive_profile_decoder_cases, 1876);
assert.equal(widthEight.maximal_profile_decoder_cases, 1212);
assert.deepEqual(widthEight.maximal_profiles, [[0, 2], [2, 1], [4, 0]]);

const classes = deriveDromologicalTerminalHolonomyClasses();
const code8 = canonicalEightBitRepairCode();
const classByMask = new Map(classes.map(row => [
  JSON.stringify(derivePrimaryHolonomyRepairMask(row.terminal_formal_holonomy)), row,
]));
const maximalProfiles = [[0, 2], [2, 1], [4, 0]];
let independentMaximalCases = 0;
let independentReplayChecks = 0;
let independentRobustChecks = 0;
for (const [erasures, corruptions] of maximalProfiles) {
  for (const erasedIndices of subsets(8, erasures)) {
    for (const row of code8) {
      const source = puncture(row.codeword, erasedIndices);
      for (const received of receivedAtMost(source, corruptions)) {
        const decoded = independentDecode(received, code8, erasedIndices);
        independentMaximalCases += 1;
        assert.equal(decoded.unique, true);
        assert.deepEqual(decoded.repair_mask, row.repair_mask);
        const replay = decodeMinimumCostReplayFromRepairMask(decoded.repair_mask);
        const expectedReplay = decodeMinimumCostReplayFromRepairMask(row.repair_mask);
        independentReplayChecks += 1;
        assert.deepEqual(replay, expectedReplay);
        const holonomyClass = classByMask.get(JSON.stringify(row.repair_mask));
        assert.ok(holonomyClass);
        const assessment = classifyReplayAgainstHolonomyClass(holonomyClass, replay);
        independentRobustChecks += 1;
        assert.equal(assessment.actual_class_robust_unimodular_rescue, true);
      }
    }
  }
}
assert.equal(independentMaximalCases, 1212);
assert.equal(independentReplayChecks, 1212);
assert.equal(independentRobustChecks, 1212);

const scheduleLetters = { PHI_PAIR_WIRE: 'P', HEXAGONAL_MOIRE: 'H', ICOSAHEDRAL_PHASON: 'I' };
const schedulesById = new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule => [
  schedule.map(stratum => scheduleLetters[stratum]).join('-'), schedule,
]));
let independentReconstructions = 0;
for (const holonomyClass of classes) {
  const mask = derivePrimaryHolonomyRepairMask(holonomyClass.terminal_formal_holonomy);
  const replay = decodeMinimumCostReplayFromRepairMask(mask);
  for (const id of holonomyClass.schedule_ids) {
    const schedule = schedulesById.get(id);
    assert.ok(schedule);
    for (let x1 = -2; x1 <= 2; x1 += 1) {
      for (let x2 = -2; x2 <= 2; x2 += 1) {
        for (let x3 = -2; x3 <= 2; x3 += 1) {
          const state = [x1, x2, x3];
          const observed = observeReplayAssistedState(state, schedule, replay);
          const recovered = invertReplayLocusObservation(observed, schedule, replay);
          independentReconstructions += 1;
          assert.deepEqual(recovered, state);
        }
      }
    }
  }
}
assert.equal(independentReconstructions, 750);
assert.ok(classes.some(row => row.schedule_ids.length === 2 && row.defect_directions.length === 2));

const tomography = certificate.factored_tomography_certificate;
assert.equal(tomography.exact, true);
assert.equal(tomography.maximal_profile_receiver_cases, 1212);
assert.equal(tomography.replay_policy_checks, 1212);
assert.equal(tomography.class_robust_unimodular_checks, 1212);
assert.equal(tomography.executed_state_reconstructions, 750);
assert.equal(tomography.represented_full_receiver_by_state_cross_product_cardinality, 227250);
assert.equal(tomography.full_cross_product_executed, false);
assert.equal(tomography.damaged_receiver_word_enters_state_reconstruction_function, false);
assert.equal(tomography.receiver_layer_exact, true);
assert.equal(tomography.state_layer_exact, true);
assert.equal(tomography.mixed_class_schedule_ambiguity_preserved, true);

assert.equal(certificate.passed, true);
assert.equal(certificate.fault_budget_classification,
  'IN_THE_FOUR_EARNED_CANONICAL_AIA_RECEIVER_REPRESENTATIONS_ONE_KNOWN_ERASURE_CONSUMES_ONE_UNIT_AND_ONE_UNKNOWN_CORRUPTION_CONSUMES_TWO_UNITS_OF_THE_FINITE_REPAIR_BUDGET_DMIN_MINUS_ONE');
assert.equal(certificate.factorization_law,
  'EXHAUSTIVE_RECEIVER_FAULT_DECODING_CAN_FACTOR_FROM_EXACT_REPLAY_ASSISTED_STATE_RECONSTRUCTION_WHEN_THE_DOWNSTREAM_REPLAY_ROUTE_DEPENDS_ONLY_ON_THE_RECOVERED_REPAIR_MASK_IN_THIS_FIXED_S3_AIA_FIXTURE');
assert.ok(certificate.scars.includes('FACTORED_TOMOGRAPHY_CLOSURE != EXECUTED_FULL_CROSS_PRODUCT'));
assert.ok(certificate.scars.includes('KNOWN_ERASURE_POSITION != UNKNOWN_CORRUPTION_POSITION'));

const ash = compileDromologicalHolonomyFaultBudgetProjection(AIA_RECEIVERS.ASH);
const loom = compileDromologicalHolonomyFaultBudgetProjection(AIA_RECEIVERS.LOOM);
assert.equal(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.ok(Object.values(ash.authority).every(value => value === false));
assert.ok(Object.values(loom.authority).every(value => value === false));
assert.equal(ash.runtime_binding, false);
assert.equal(loom.runtime_binding, false);
assert.equal(ash.payload.profile_lattice_exposed, false);
assert.equal(ash.payload.ambiguity_witnesses_exposed, false);
assert.equal(ash.payload.replay_vectors_exposed, false);
assert.equal(ash.payload.latent_state_exposed, false);
assert.deepEqual(loom.payload.repair_budgets, [1, 2, 3, 4]);
assert.equal(loom.payload.factored_tomography_certificate.executed_state_reconstructions, 750);

assert.equal(rejectDromologicalHolonomyFaultBudgetOverreach(ash).accepted, true);
assert.equal(rejectDromologicalHolonomyFaultBudgetOverreach(loom).accepted, true);
assert.equal(rejectDromologicalHolonomyFaultBudgetOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, universal_coding_theorem: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyFaultBudgetOverreach({
  ...loom,
  claim_ceiling: { ...loom.claim_ceiling, physical_holonomy: true },
}).accepted, false);
assert.equal(rejectDromologicalHolonomyFaultBudgetOverreach({ ...loom, runtime_binding: true }).accepted, false);
assert.equal(rejectDromologicalHolonomyFaultBudgetOverreach({
  ...ash,
  payload: { ...ash.payload, latent_state_exposed: true },
}).accepted, false);
