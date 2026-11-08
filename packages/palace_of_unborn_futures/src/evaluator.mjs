/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Separated Neutral Evaluator, CRN World Simulator, Non-Renaming Gate & Bootstrap Inference
 *
 * Strictly separated from heirs-and-policies.mjs:
 *   - Competing conditions NEVER receive secretVault entries (0 vault accesses).
 *   - CTRL_ORACLE is evaluated here as a noncompeting upper bound, with every vault read logged.
 *   - Scoring depends EXCLUSIVELY on external actions (probeId, interventionId), terminal claims,
 *     and unseen held-out predictions — zero condition-label bias.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { DeterministicRng } from './prng.mjs';
import {
  COMPETING_CONDITIONS,
  prepareConditionInheritance,
  runInvestigatorEpisode,
} from './heirs-and-policies.mjs';
import { computeEmpiricalMutualInformationBits } from './capsule-compressor.mjs';

export const PREREGISTERED_NONINFERIORITY_MARGIN = 0.05;

function round4(x) {
  return Math.round(x * 10000) / 10000;
}

/**
 * Simulates WORLD ANSWERS to diagnostic probe `probeId` using Common Random Numbers (CRN)
 * keyed strictly by `(secret.crn_seed, probeId)`.
 */
export function simulateWorldProbeResponse(publicWorld, secret, probeId) {
  const crn = new DeterministicRng(`${secret.crn_seed}::PROBE::${probeId}`);
  const trueHyp = publicWorld.candidate_mechanism_hypotheses.find(
    h => h.slot_id === secret.true_mechanism_slot
  );
  if (!trueHyp) {
    throw new Error(`True slot ${secret.true_mechanism_slot} missing from world ${publicWorld.world_public_id}`);
  }

  const mu = trueHyp.expected_probes[probeId];
  const sd = trueHyp.noise_sd || 0.11;
  const scalarReadout = mu === -1.0 ? -1.0 : Math.round((mu + crn.nextNormal(0, sd)) * 1000) / 1000;

  const extra = {};

  if (publicWorld.family === 'B_HIGHER_ORDER_RELATIONS') {
    if (probeId === 'PROBE_PAIR_AB' || probeId === 'PROBE_PAIR_BC' || probeId === 'PROBE_TRIAD_ONES') {
      // Joint clamp experiment reveals physical channel alignment alongside correlation/parity readout
      extra.inferred_perm = [...secret.structural_parameters.parity_perm];
    }
  }

  if (publicWorld.family === 'D_IMPOSSIBLE_LIBRARY') {
    const sp = secret.structural_parameters;
    if (probeId === 'PROBE_MODULAR_CELLS') {
      const cells = [];
      for (let a1 = 0; a1 < 3; a1++) {
        for (let a2 = 0; a2 < 3; a2++) {
          let y = 0;
          if (secret.true_mechanism_archetype === 'ARCH_D1_MODULAR_INVARIANT') {
            y = ((sp.mod_c1 * a1 + sp.mod_c2 * a2) % 3 === sp.mod_target) ? 1 : 0;
            if (crn.nextFloat() < 0.03) y ^= 1;
          } else if (secret.true_mechanism_archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY') {
            // Uncontrolled previous state scrambles static lattice!
            y = crn.nextFloat() < 0.5 ? 1 : 0;
          } else {
            const coords = [a1 > 0 ? 1 : 0, a2 > 0 ? 1 : 0, 0];
            y = coords[sp.noisy_coord] ?? 0;
            if (secret.true_mechanism_archetype === 'ARCH_D4_COMPLETE_NOISY_ONTOLOGY' && crn.nextFloat() < 0.28) {
              y ^= 1;
            }
          }
          cells.push({ a1, a2, y });
        }
      }
      extra.diagnostic_cells = cells;
    } else if (probeId === 'PROBE_HYSTERESIS_LOOP') {
      if (secret.true_mechanism_archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY') {
        extra.loop_latch_value = 2;
      }
    } else if (probeId === 'PROBE_REPEATABILITY_CHECK') {
      extra.dominant_coord_observed = sp.noisy_coord;
    }
  }

  return {
    probe_id: probeId,
    scalar_readout: scalarReadout,
    ...extra,
  };
}

/**
 * Computes objective probe discriminability score in [0, 1] from uniform baseline
 * using the realized world observation `probeObs`.
 */
export function scoreObjectiveProbeInformation(publicWorld, probeObs) {
  const hyps = publicWorld.candidate_mechanism_hypotheses;
  const y = probeObs.scalar_readout;
  const logL = hyps.map(h => {
    const mu = h.expected_probes[probeObs.probe_id];
    const sd = h.noise_sd || 0.11;
    if (y === -1.0 || mu === -1.0) return (y === -1.0 && mu === -1.0) ? 0 : -25;
    const z = (y - mu) / sd;
    return -0.5 * z * z;
  });
  const maxL = Math.max(...logL);
  const exps = logL.map(v => Math.exp(Math.max(-40, v - maxL)));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map(e => e / sum);
  let hAfter = 0;
  for (const p of probs) {
    if (p > 1e-12) hAfter -= p * Math.log2(p);
  }
  return Math.max(0, Math.min(1, (2.0 - hAfter) / 2.0));
}

/**
 * Computes realized consequential intervention accuracy in [0, 1].
 */
export function scoreInterventionAccuracy(publicWorld, secret, interventionId) {
  if (interventionId === secret.optimal_intervention_id) {
    return 1.0;
  }
  const arch = secret.true_mechanism_archetype;
  // Partial credit vs catastrophic hazard matrix grounded in mechanism physics
  if (arch === 'ARCH_A4_NONLINEAR_SUPPRESSOR' && interventionId === 'INT_HUB_HIGH') return 0.0; // triggers negative suppressor crash!
  if (arch === 'ARCH_C3_DELAYED_COLLAPSE_HAZARD' && interventionId === 'INT_PULSE_AND_WAIT') return 0.0; // triggers T+2 collapse!
  if (arch === 'ARCH_D3_UNIDENTIFIABLE_EXTERIOR' && interventionId !== 'INT_SAFE_INTERIOR_HEDGE') return 0.25; // unhedged exterior exposure
  if (publicWorld.family === 'A_CAUSAL_LOOKALIKES' && interventionId === 'INT_CLAMPED_MOD_PAIR' && arch === 'ARCH_A1_CAUSAL_CHAIN') return 0.65;
  if (publicWorld.family === 'C_TEMPORAL_INHERITANCE' && interventionId === 'INT_DAMPED_RAMP') return 0.45;
  return 0.15;
}

/**
 * Verifies that an introduced ontology predicate is NOT merely a renaming / monotone bijection
 * of an existing single inherited variable (Section IV & Adversarial Challenge #8).
 */
export function verifyPredicateNonRenaming(introducedPredicate) {
  if (!introducedPredicate || typeof introducedPredicate !== 'object') {
    return { valid_extension: false, is_trivial_renaming: false, min_conditional_mi_bits: 0 };
  }

  const states = [];
  for (let a1 = 0; a1 < 3; a1++) {
    for (let a2 = 0; a2 < 3; a2++) {
      for (let a3 = 0; a3 < 2; a3++) {
        for (let p1 = 0; p1 < 3; p1++) {
          states.push({ a1, a2, a3, prev_a1: p1 });
        }
      }
    }
  }

  const psiVals = states.map(s => {
    if (introducedPredicate.kind === 'COMPOSITE_MOD3') {
      return ((introducedPredicate.c1 * s.a1 + introducedPredicate.c2 * s.a2) % 3 === introducedPredicate.target_r) ? 1 : 0;
    }
    if (introducedPredicate.kind === 'PATH_HOLONOMY_LATCH') {
      return s.a3 ^ (s.prev_a1 === introducedPredicate.trigger_prev_a1 ? 1 : 0);
    }
    if (introducedPredicate.kind === 'RENAMED_SINGLE_COORD') {
      // Explicit adversarial renaming probe used in Challenge #8
      const raw = [s.a1, s.a2, s.a3][introducedPredicate.coord_idx ?? 0];
      return introducedPredicate.invert ? (raw > 0 ? 0 : 1) : (raw > 0 ? 1 : 0);
    }
    return 0;
  });

  // Compute H(psi) and max I(psi; single_coord) across static inherited coordinates A1, A2, A3
  const p1Count = psiVals.filter(v => v === 1).length;
  const p1 = p1Count / psiVals.length;
  const p0 = 1 - p1;
  const hPsi = (p1 > 0 ? -p1 * Math.log2(p1) : 0) + (p0 > 0 ? -p0 * Math.log2(p0) : 0);
  if (hPsi < 0.05) {
    return { valid_extension: false, is_trivial_renaming: true, min_conditional_entropy_bits: 0 };
  }

  const singleCoords = [
    states.map(s => s.a1),
    states.map(s => s.a2),
    states.map(s => s.a3),
  ];

  let minCondEntropy = Infinity;
  for (const sc of singleCoords) {
    const mi = computeEmpiricalMutualInformationBits(psiVals, sc);
    const condH = Math.max(0, hPsi - mi);
    if (condH < minCondEntropy) minCondEntropy = condH;
  }

  const isTrivialRenaming = minCondEntropy < 0.20;
  return {
    valid_extension: !isTrivialRenaming,
    is_trivial_renaming: isTrivialRenaming,
    min_conditional_entropy_bits: round4(minCondEntropy),
  };
}

/**
 * Scores a completed episode against the GroundTruthSecretVault under preregistered weights
 * (or custom sensitivity weights for Adversarial Challenge #7).
 */
export function scoreCompletedEpisode(publicWorld, secret, episode, inheritedMeta, customWeights = null) {
  const wProbe = customWeights?.wProbe ?? 0.20;
  const wIntervene = customWeights?.wIntervene ?? 0.35;
  const wIdentify = customWeights?.wIdentify ?? 0.25;
  const wHoldout = customWeights?.wHoldout ?? 0.20;
  const wFalseClaimPenalty = customWeights?.wFalseClaimPenalty ?? 0.20;

  const probeInfoGain = scoreObjectiveProbeInformation(publicWorld, episode.probe_observation);
  const interventionAcc = scoreInterventionAccuracy(publicWorld, secret, episode.chosen_intervention_id);

  // Holdout accuracy across 16 unseen states
  const truth = secret.holdout_ground_truth_outputs;
  const preds = episode.holdout_predictions;
  let holdoutCorrect = 0;
  for (let i = 0; i < truth.length; i++) {
    if (preds[i] === truth[i]) holdoutCorrect++;
  }
  const holdoutAcc = holdoutCorrect / truth.length;

  const ident = secret.identifiable_under_action_menu;
  const decl = episode.declared_mechanism_or_abstain;
  const abstained = decl === 'ABSTAIN_UNIDENTIFIABLE';

  const nonRenaming = episode.introduced_predicate
    ? verifyPredicateNonRenaming(episode.introduced_predicate)
    : { valid_extension: false, is_trivial_renaming: false, min_conditional_entropy_bits: 0 };

  let identifiedCorrectly = false;
  let abstainedCorrectly = false;
  let falseScientificClaim = false;

  if (ident) {
    identifiedCorrectly = decl === secret.true_mechanism_slot;
    if (!abstained && !identifiedCorrectly) {
      falseScientificClaim = true;
    }
    if (episode.retroactive_claim_made && secret.true_mechanism_archetype === 'ARCH_C4_CLOCK_INVERTED_FEEDBACK') {
      falseScientificClaim = true;
    }
    if (episode.introduced_predicate && nonRenaming.is_trivial_renaming) {
      falseScientificClaim = true;
    }
    if (
      secret.true_mechanism_archetype === 'ARCH_D4_COMPLETE_NOISY_ONTOLOGY' &&
      episode.ontology_insufficient_declared
    ) {
      falseScientificClaim = true;
    }
  } else {
    // Deliberately unidentifiable world (ARCH_D3_UNIDENTIFIABLE_EXTERIOR)
    abstainedCorrectly = abstained;
    if (!abstained || episode.introduced_predicate) {
      falseScientificClaim = true;
    }
  }

  let utility = 0;
  if (ident) {
    utility =
      wProbe * probeInfoGain +
      wIntervene * interventionAcc +
      wIdentify * (identifiedCorrectly ? 1.0 : 0.0) +
      wHoldout * holdoutAcc -
      wFalseClaimPenalty * (falseScientificClaim ? 1.0 : 0.0);
  } else {
    utility =
      wProbe * probeInfoGain +
      wIntervene * interventionAcc +
      (wIdentify + wHoldout) * (abstainedCorrectly ? 1.0 : 0.0) -
      (wFalseClaimPenalty + 0.05) * (falseScientificClaim ? 1.0 : 0.0);
  }

  const terminalCorrectOutcome = ident ? (identifiedCorrectly ? 1 : 0) : (abstainedCorrectly ? 1 : 0);
  const conf = episode.stated_confidence;
  const brierScore = (conf - terminalCorrectOutcome) * (conf - terminalCorrectOutcome);

  const trueOntologyRupture =
    secret.true_mechanism_archetype === 'ARCH_D1_MODULAR_INVARIANT' ||
    secret.true_mechanism_archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY';

  return {
    world_public_id: publicWorld.world_public_id,
    quartet_public_id: publicWorld.quartet_public_id,
    family: publicWorld.family,
    archetype: secret.true_mechanism_archetype,
    identifiable: ident,
    has_strong_epoch0_drift: secret.has_strong_epoch0_drift,
    condition_id: episode.condition_id,
    chosen_probe_id: episode.chosen_probe_id,
    chosen_intervention_id: episode.chosen_intervention_id,
    declared_mechanism_or_abstain: decl,
    utility: round4(utility),
    probe_info_gain: round4(probeInfoGain),
    intervention_accuracy: round4(interventionAcc),
    identified_correctly: identifiedCorrectly,
    abstained_correctly: abstainedCorrectly,
    abstained_any: abstained,
    false_scientific_claim: falseScientificClaim,
    holdout_accuracy: round4(holdoutAcc),
    stated_confidence: conf,
    terminal_correct_binary: terminalCorrectOutcome,
    brier_score: round4(brierScore),
    recovered_from_surprise: episode.recovered_from_surprise,
    true_ontology_rupture: trueOntologyRupture,
    ontology_insufficient_declared: episode.ontology_insufficient_declared,
    valid_new_predicate_invented: Boolean(
      trueOntologyRupture &&
      episode.introduced_predicate &&
      nonRenaming.valid_extension &&
      holdoutAcc >= 0.85
    ),
    trivial_renaming_rejected: nonRenaming.is_trivial_renaming,
    retained_bytes: inheritedMeta.retained_bytes,
    retained_tokens_est: inheritedMeta.retained_tokens_est,
    records_scanned: inheritedMeta.records_scanned,
    candidate_evaluations: episode.candidate_evaluations,
  };
}

/**
 * Runs the noncompeting CTRL_ORACLE upper bound (with explicit vault access logging).
 */
function runOracleUpperBound(publicWorld, secret, vaultAccessLog, budgetBytes) {
  vaultAccessLog.oracle_control_secret_access_count += 1;
  vaultAccessLog.oracle_access_records.push({
    world_public_id: publicWorld.world_public_id,
    budget_bytes: budgetBytes,
    purpose: 'NONCOMPETING_SYNTHETIC_UPPER_BOUND_EVALUATION',
  });

  const probeObs = simulateWorldProbeResponse(publicWorld, secret, secret.optimal_probe_id);
  const ident = secret.identifiable_under_action_menu;
  const trueRupture =
    secret.true_mechanism_archetype === 'ARCH_D1_MODULAR_INVARIANT' ||
    secret.true_mechanism_archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY';

  let predObj = null;
  if (secret.true_mechanism_archetype === 'ARCH_D1_MODULAR_INVARIANT') {
    predObj = {
      kind: 'COMPOSITE_MOD3',
      c1: secret.structural_parameters.mod_c1,
      c2: secret.structural_parameters.mod_c2,
      target_r: secret.structural_parameters.mod_target,
    };
  } else if (secret.true_mechanism_archetype === 'ARCH_D2_HYSTERETIC_HOLONOMY') {
    predObj = { kind: 'PATH_HOLONOMY_LATCH', trigger_prev_a1: 2 };
  }

  // Note: on unidentifiable D3, even an honest Oracle constrained to observable inputs predicts interior optimally
  const oracleEpisode = {
    condition_id: 'CTRL_ORACLE',
    chosen_probe_id: secret.optimal_probe_id,
    probe_observation: probeObs,
    chosen_intervention_id: secret.optimal_intervention_id,
    declared_mechanism_or_abstain: ident ? secret.true_mechanism_slot : 'ABSTAIN_UNIDENTIFIABLE',
    stated_confidence: 0.99,
    ontology_insufficient_declared: trueRupture,
    introduced_predicate: predObj,
    retroactive_claim_made: false,
    holdout_predictions: [...secret.holdout_ground_truth_outputs],
    recovered_from_surprise: false,
    candidate_evaluations: 1,
  };

  return scoreCompletedEpisode(
    publicWorld,
    secret,
    oracleEpisode,
    { retained_bytes: 0, retained_tokens_est: 0, records_scanned: 0 }
  );
}

/**
 * Computes Expected Calibration Error (ECE) over 5 bins in [0, 1].
 */
export function computeExpectedCalibrationError(rows) {
  if (!rows.length) return 0;
  const bins = Array.from({ length: 5 }, () => ({ count: 0, confSum: 0, accSum: 0 }));
  for (const r of rows) {
    const idx = Math.min(4, Math.floor(r.stated_confidence * 5));
    bins[idx].count += 1;
    bins[idx].confSum += r.stated_confidence;
    bins[idx].accSum += r.terminal_correct_binary;
  }
  let ece = 0;
  for (const b of bins) {
    if (b.count > 0) {
      const avgConf = b.confSum / b.count;
      const avgAcc = b.accSum / b.count;
      ece += (b.count / rows.length) * Math.abs(avgConf - avgAcc);
    }
  }
  return round4(ece);
}

/**
 * Quartet-clustered paired bootstrap 95% confidence interval + Cohen's d_z + exact sign-flip p-value.
 */
export function computePairedContrastStatistics(rowsA, rowsB, metricFn, bootstrapSeed, nResamples = 3000) {
  const byWorldB = new Map(rowsB.map(r => [r.world_public_id, r]));
  const quartetDiffs = new Map();
  const unitDiffs = [];

  for (const ra of rowsA) {
    const rb = byWorldB.get(ra.world_public_id);
    if (!rb) throw new Error(`Missing paired world ${ra.world_public_id}`);
    const d = metricFn(ra) - metricFn(rb);
    unitDiffs.push(d);
    if (!quartetDiffs.has(ra.quartet_public_id)) {
      quartetDiffs.set(ra.quartet_public_id, []);
    }
    quartetDiffs.get(ra.quartet_public_id).push(d);
  }

  const n = unitDiffs.length;
  const meanDiff = unitDiffs.reduce((a, b) => a + b, 0) / n;
  const variance = unitDiffs.reduce((acc, d) => acc + (d - meanDiff) ** 2, 0) / Math.max(1, n - 1);
  const sd = Math.sqrt(variance);
  const cohensDz = sd > 1e-12 ? meanDiff / sd : 0;

  // Quartet-level cluster means for clustered bootstrap & exact/Monte-Carlo sign-flip p-value
  const clusterMeans = Array.from(quartetDiffs.values()).map(
    arr => arr.reduce((a, b) => a + b, 0) / arr.length
  );
  const kClusters = clusterMeans.length;

  const rng = new DeterministicRng(bootstrapSeed);
  const bootMeans = [];
  for (let b = 0; b < nResamples; b++) {
    let sum = 0;
    for (let j = 0; j < kClusters; j++) {
      sum += clusterMeans[rng.nextInt(0, kClusters)];
    }
    bootMeans.push(sum / kClusters);
  }
  bootMeans.sort((a, b) => a - b);
  const ciLow = bootMeans[Math.floor(0.025 * nResamples)];
  const ciHigh = bootMeans[Math.floor(0.975 * nResamples)];

  // Two-sided cluster sign-flip permutation p-value (exact if K <= 14, else 4096 deterministic flips)
  const obsAbs = Math.abs(meanDiff);
  let extremeCount = 0;
  let totalFlips = 0;
  if (kClusters <= 14) {
    totalFlips = 1 << kClusters;
    for (let mask = 0; mask < totalFlips; mask++) {
      let s = 0;
      for (let j = 0; j < kClusters; j++) {
        s += ((mask >> j) & 1) ? clusterMeans[j] : -clusterMeans[j];
      }
      if (Math.abs(s / kClusters) >= obsAbs - 1e-12) extremeCount++;
    }
  } else {
    totalFlips = 4096;
    for (let i = 0; i < totalFlips; i++) {
      let s = 0;
      for (let j = 0; j < kClusters; j++) {
        s += (rng.nextInt(0, 2) === 1 ? 1 : -1) * clusterMeans[j];
      }
      if (Math.abs(s / kClusters) >= obsAbs - 1e-12) extremeCount++;
    }
  }
  const pValue = extremeCount / totalFlips;

  return {
    n_worlds: n,
    n_quartet_clusters: kClusters,
    mean_diff: round4(meanDiff),
    sd_diff: round4(sd),
    ci95_low: round4(ciLow),
    ci95_high: round4(ciHigh),
    cohens_dz: round4(cohensDz),
    two_sided_signflip_p: round4(pValue),
  };
}

/**
 * Summarizes a set of scored episode rows for one condition (overall or within a family).
 */
export function summarizeConditionRows(rows, fullHistoryAvgBytes = 0) {
  const n = rows.length;
  const identRows = rows.filter(r => r.identifiable);
  const unidentRows = rows.filter(r => !r.identifiable);
  const ruptureRows = rows.filter(r => r.true_ontology_rupture);
  const wrongRows = rows.filter(r => r.terminal_correct_binary === 0);

  const avg = fn => (rows.length ? rows.reduce((s, r) => s + fn(r), 0) / rows.length : 0);
  const avgSub = (arr, fn) => (arr.length ? arr.reduce((s, r) => s + fn(r), 0) / arr.length : null);

  const avgBytes = avg(r => r.retained_bytes);
  const compressionRatio = avgBytes > 0 && fullHistoryAvgBytes > 0
    ? round4(fullHistoryAvgBytes / avgBytes)
    : (avgBytes === 0 ? null : 1.0);

  return {
    n_worlds: n,
    mean_utility: round4(avg(r => r.utility)),
    mean_regret_vs_oracle: round4(avg(r => r.regret_vs_oracle ?? 0)),
    identifiable_mechanism_success_rate: identRows.length
      ? round4(avgSub(identRows, r => (r.identified_correctly ? 1 : 0)))
      : null,
    unidentifiable_correct_abstention_rate: unidentRows.length
      ? round4(avgSub(unidentRows, r => (r.abstained_correctly ? 1 : 0)))
      : null,
    false_scientific_claim_rate: round4(avg(r => (r.false_scientific_claim ? 1 : 0))),
    mean_probe_info_gain: round4(avg(r => r.probe_info_gain)),
    mean_intervention_accuracy: round4(avg(r => r.intervention_accuracy)),
    mean_holdout_accuracy: round4(avg(r => r.holdout_accuracy)),
    mean_brier_score: round4(avg(r => r.brier_score)),
    ece_5bin: computeExpectedCalibrationError(rows),
    mean_confidence_overall: round4(avg(r => r.stated_confidence)),
    mean_confidence_when_wrong: wrongRows.length
      ? round4(avgSub(wrongRows, r => r.stated_confidence))
      : null,
    surprise_recovery_rate: round4(avg(r => (r.recovered_from_surprise ? 1 : 0))),
    ontology_rupture_detection_rate: ruptureRows.length
      ? round4(avgSub(ruptureRows, r => (r.ontology_insufficient_declared ? 1 : 0)))
      : null,
    valid_ontology_invention_rate: ruptureRows.length
      ? round4(avgSub(ruptureRows, r => (r.valid_new_predicate_invented ? 1 : 0)))
      : null,
    mean_retained_bytes: round4(avgBytes),
    mean_retained_tokens_est: round4(avg(r => r.retained_tokens_est)),
    compression_ratio_vs_full_history: compressionRatio,
    mean_records_scanned: round4(avg(r => r.records_scanned)),
    mean_candidate_evaluations: round4(avg(r => r.candidate_evaluations)),
  };
}

/**
 * Executes the complete multi-budget evaluation across all 6 competing conditions + 2 controls.
 */
export function evaluateWorldSuiteAcrossBudgets({
  suite,
  trainedCodec,
  budgets = [96, 256],
  evaluationSeed,
}) {
  const vaultAccessLog = {
    supervision_classification: 'INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL',
    independent_external_blinding: false,
    competing_conditions_secret_access_count: 0,
    random_control_secret_access_count: 0,
    oracle_control_secret_access_count: 0,
    oracle_access_records: [],
  };

  const allConditions = [...COMPETING_CONDITIONS, 'CTRL_RANDOM'];
  const resultsByBudget = {};

  for (const budgetBytes of budgets) {
    const budgetLabel = budgetBytes <= 96 ? 'B_TIGHT_96B' : 'B_STANDARD_256B';
    const rowsByCondition = new Map();
    for (const c of [...allConditions, 'CTRL_ORACLE']) {
      rowsByCondition.set(c, []);
    }

    for (const pubW of suite.publicWorlds) {
      const secret = suite.secretVaultMap.get(pubW.world_public_id);
      const beforeDigest = pubW.permissible_history_digest;

      // 1. Evaluate Oracle upper bound
      const oracleRow = runOracleUpperBound(pubW, secret, vaultAccessLog, budgetBytes);
      oracleRow.regret_vs_oracle = 0;
      rowsByCondition.get('CTRL_ORACLE').push(oracleRow);

      // 2. Evaluate all 6 competing heirs + Random control via strictly separated packets
      for (const condId of allConditions) {
        const inh = prepareConditionInheritance({
          conditionId: condId,
          publicWorld: pubW,
          budgetBytes,
          trainedCodec,
        });

        // Verify source immutability after disposable working-memory / deletion preparation
        const afterDigest = JSON.stringify(pubW.permissible_full_history);
        if (afterDigest.length === 0 || pubW.permissible_history_digest !== beforeDigest) {
          throw new Error(`Immutable history mutated during ${condId} on ${pubW.world_public_id}`);
        }

        const investigatorPacket = Object.freeze({
          world_public_id: pubW.world_public_id,
          quartet_public_id: pubW.quartet_public_id,
          family: pubW.family,
          terminal_graph_pi: pubW.terminal_graph_pi,
          candidate_mechanism_hypotheses: pubW.candidate_mechanism_hypotheses,
          probe_menu: pubW.probe_menu,
          intervention_menu: pubW.intervention_menu,
          inherited_vocabulary: pubW.inherited_vocabulary,
          holdout_query_inputs: pubW.holdout_query_inputs,
          memory_budget_bytes: budgetBytes,
          inheritance_mode: inh.inheritance_mode,
          inherited_payload: inh.inherited_payload,
        });

        let probesUsed = 0;
        let interventionsUsed = 0;
        const executeProbeFn = probeId => {
          probesUsed += 1;
          if (probesUsed > 1) throw new Error(`Action budget exceeded (probe) by ${condId}`);
          return simulateWorldProbeResponse(pubW, secret, probeId);
        };
        const executeInterventionFn = intId => {
          interventionsUsed += 1;
          if (interventionsUsed > 1) throw new Error(`Action budget exceeded (intervention) by ${condId}`);
          return { intervention_id: intId, status: 'EXECUTED' };
        };

        const ep = runInvestigatorEpisode({
          conditionId: condId,
          packet: investigatorPacket,
          executeProbeFn,
          executeInterventionFn,
          episodeSeed: `${evaluationSeed}::${budgetLabel}::${condId}::${pubW.world_public_id}`,
        });

        const scored = scoreCompletedEpisode(pubW, secret, ep, inh);
        scored.regret_vs_oracle = round4(Math.max(0, oracleRow.utility - scored.utility));
        rowsByCondition.get(condId).push(scored);
      }
    }

    const archivistRows = rowsByCondition.get('II_ARCHIVISTS');
    const fullHistoryAvgBytes = archivistRows.reduce((s, r) => s + r.retained_bytes, 0) / archivistRows.length;

    const conditionSummaries = {};
    const byFamilySummaries = {};
    for (const [condId, rows] of rowsByCondition.entries()) {
      conditionSummaries[condId] = summarizeConditionRows(rows, fullHistoryAvgBytes);
      byFamilySummaries[condId] = {};
      for (const fam of ['A_CAUSAL_LOOKALIKES', 'B_HIGHER_ORDER_RELATIONS', 'C_TEMPORAL_INHERITANCE', 'D_IMPOSSIBLE_LIBRARY']) {
        byFamilySummaries[condId][fam] = summarizeConditionRows(
          rows.filter(r => r.family === fam),
          fullHistoryAvgBytes
        );
      }
    }

    // Key paired contrasts with clustered bootstrap 95% CIs
    const amnesiacs = rowsByCondition.get('I_AMNESIACS');
    const archivists = rowsByCondition.get('II_ARCHIVISTS');
    const heirs = rowsByCondition.get('III_HEIRS');
    const falseProphets = rowsByCondition.get('IV_FALSE_PROPHETS');
    const exiles = rowsByCondition.get('V_EXILES');
    const revisionists = rowsByCondition.get('VI_REVISIONISTS');

    const deltaUH = computePairedContrastStatistics(
      archivists,
      amnesiacs,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::dUH`
    );
    const deltaUZ = computePairedContrastStatistics(
      heirs,
      amnesiacs,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::dUZ`
    );
    const capsuleVsFullHistory = computePairedContrastStatistics(
      heirs,
      archivists,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::ZvsH`
    );
    const falseProphetsVsAmnesiacs = computePairedContrastStatistics(
      falseProphets,
      amnesiacs,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::FPvsAmn`
    );
    const exilesVsAmnesiacs = computePairedContrastStatistics(
      exiles,
      amnesiacs,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::ExvsAmn`
    );
    const exilesVsFalseProphetsUtility = computePairedContrastStatistics(
      exiles,
      falseProphets,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::ExvsFPU`
    );
    const exilesVsFalseProphetsBrier = computePairedContrastStatistics(
      exiles,
      falseProphets,
      r => r.brier_score,
      `${evaluationSeed}::boot::${budgetLabel}::ExvsFPBrier`
    );
    const revisionistsVsArchivists = computePairedContrastStatistics(
      revisionists,
      archivists,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::RevVsArch`
    );
    const revisionistsVsAmnesiacs = computePairedContrastStatistics(
      revisionists,
      amnesiacs,
      r => r.utility,
      `${evaluationSeed}::boot::${budgetLabel}::RevVsAmn`
    );

    const noninferiorityMet = capsuleVsFullHistory.ci95_low > -PREREGISTERED_NONINFERIORITY_MARGIN;

    resultsByBudget[budgetLabel] = {
      budget_bytes: budgetBytes,
      condition_summaries: conditionSummaries,
      by_family_summaries: byFamilySummaries,
      paired_contrasts: {
        delta_U_H_archivists_minus_amnesiacs: deltaUH,
        delta_U_Z_heirs_minus_amnesiacs: deltaUZ,
        heirs_minus_archivists_noninferiority: {
          ...capsuleVsFullHistory,
          preregistered_margin: -PREREGISTERED_NONINFERIORITY_MARGIN,
          noninferiority_supported: noninferiorityMet,
        },
        false_prophets_minus_amnesiacs: falseProphetsVsAmnesiacs,
        exiles_minus_amnesiacs: exilesVsAmnesiacs,
        exiles_minus_false_prophets_utility: exilesVsFalseProphetsUtility,
        exiles_minus_false_prophets_brier_error: exilesVsFalseProphetsBrier,
        revisionists_minus_archivists: revisionistsVsArchivists,
        revisionists_minus_amnesiacs: revisionistsVsAmnesiacs,
      },
      episode_rows_by_condition: Object.fromEntries(rowsByCondition.entries()),
    };
  }

  return {
    suite_name: suite.suite_name,
    total_worlds: suite.total_worlds,
    vault_access_audit_log: vaultAccessLog,
    results_by_budget: resultsByBudget,
  };
}
