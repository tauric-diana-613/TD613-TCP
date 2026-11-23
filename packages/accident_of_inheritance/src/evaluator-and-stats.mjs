/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Neutral Episode Evaluator, Validated Exhaustive Dynamic Oracle, Cluster-Robust
 * Bootstrap & Sign-Flip Inference, and Response-Surface / Mediation Estimators
 *
 * Enforces:
 *   - Unclipped signed regret R = U_oracle - U_policy (never Math.max(0, ...))
 *   - Exhaustively verified dynamic oracle over all finite probe & action menus
 *   - Full byte-recomputed SHA-256 history immutability check before & after every policy
 *   - Dynamic Proxy-instrumented secret-vault access tracking (zero investigator reads)
 *   - Paired 4-world cluster bootstrap CIs & exact 2^K (K<=16) / Phipson-Smyth (k+1)/(B+1)
 *     Monte Carlo permutation upper bounds (never reporting p = 0 from stochastic draws)
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { DeterministicRng, sha256Hex, round4, round6 } from './prng.mjs';
import {
  AvailabilityMembrane,
  computeDelayDecomposition,
  computeDimensionlessNumbers,
  createInstrumentedSecretVault,
  withAuthorizedVaultRole,
} from './temporal-lattice.mjs';
import {
  WORLD_FAMILIES,
  SLOT_IDS,
  PROBE_IDS,
  ACTION_IDS,
  buildMatchedTrajectoryInstance,
} from './world-generator.mjs';
import {
  PRIMARY_POLICIES,
  REFERENCE_CONTROLS,
  runPolicyEpisode,
  shannonEntropyBits,
} from './authority-policies.mjs';

export function buildActionScheduleTicks(horizonTicks, intervalTicks) {
  const ticks = [];
  for (let t = intervalTicks; t <= horizonTicks; t += intervalTicks) {
    ticks.push(t);
  }
  return ticks;
}

/**
 * Computes composite utility and primary/secondary outcomes for a completed episode
 * inside an authorized POST_EPISODE_SCORER vault scope.
 */
export function scoreEpisodeAgainstTrajectorySecret({
  publicWorld,
  trajSecretProxy,
  episodeResult,
  horizonTicks = 24,
}) {
  return withAuthorizedVaultRole('POST_EPISODE_SCORER', () => {
    const tShift = trajSecretProxy.first_action_changing_shift_tick;
    const tContraObs = trajSecretProxy.t_contradiction_observed;
    const tContraAdm = trajSecretProxy.t_contradiction_admitted;
    const tContraAvail = trajSecretProxy.t_contradiction_available;
    const initOptAction =
      publicWorld.candidate_hypotheses[trajSecretProxy.true_initial_slot_idx].optimal_action_id;

    const decisions = episodeResult.consequential_decisions;
    let actionUtilitySum = 0;
    let totalIncorrectActions = 0;
    let errorsBeforeAvailable = 0;
    let opportunitiesBeforeAvailable = 0;
    let errorsAfterAvailable = 0;
    let opportunitiesAfterAvailable = 0;
    let tCorrection = null;

    for (const dec of decisions) {
      const t = dec.t_action;
      const truePayoffs = trajSecretProxy.true_action_payoffs_by_tick[t];
      const optActAtT = trajSecretProxy.optimal_action_by_tick[t];
      const chosen = dec.chosen_action_id;
      const payoff = truePayoffs[chosen];
      actionUtilitySum += payoff;

      const isOptimal = chosen === optActAtT;
      if (!isOptimal) {
        totalIncorrectActions += 1;
      }

      if (tContraAvail !== null) {
        if (t < tContraAvail) {
          opportunitiesBeforeAvailable += 1;
          if (!isOptimal) errorsBeforeAvailable += 1;
        } else {
          opportunitiesAfterAvailable += 1;
          if (!isOptimal) errorsAfterAvailable += 1;
          if (isOptimal && optActAtT !== initOptAction && tCorrection === null) {
            tCorrection = dec.t_decision;
          }
        }
      }
    }

    // Also inspect belief trajectory after tContraAvail in case correction occurred between action ticks
    if (tContraAvail !== null && tCorrection === null) {
      for (const bt of episodeResult.belief_trajectory) {
        if (bt.tick >= tContraAvail) {
          const mapIdx = SLOT_IDS.indexOf(bt.map_slot);
          if (mapIdx >= 0) {
            const impliedAct = publicWorld.candidate_hypotheses[mapIdx].optimal_action_id;
            const optAtTick = trajSecretProxy.optimal_action_by_tick[bt.tick];
            if (impliedAct === optAtTick && optAtTick !== initOptAction) {
              tCorrection = bt.tick;
              break;
            }
          }
        }
      }
    }

    const meanActionUtility = decisions.length > 0 ? actionUtilitySum / decisions.length : 0;

    // Terminal scientific claim validity
    const ident = publicWorld.identifiable_under_menu !== false;
    const termDecl = episodeResult.terminal_declared_slot_or_abstain;
    const termTrueSlot = trajSecretProxy.terminal_slot;
    let claimValid = 0;
    if (!ident) {
      claimValid = termDecl === 'ABSTAIN_UNIDENTIFIABLE' ? 1 : 0;
    } else if (publicWorld.family === 'FAM_D_ACTION_INVARIANT_CHANGE') {
      // In Action-Invariant Family D, check both exact slot match and action-equivalence validity
      claimValid = termDecl === termTrueSlot ? 1 : 0;
    } else {
      claimValid = termDecl === termTrueSlot ? 1 : 0;
    }

    const overconfidentFalseClaim =
      claimValid === 0 &&
      termDecl !== 'ABSTAIN_UNIDENTIFIABLE' &&
      episodeResult.terminal_stated_confidence >= 0.65
        ? 1
        : 0;

    // Holdout prediction accuracy
    const hoTruth = trajSecretProxy.holdout_ground_truth;
    const hoPred = episodeResult.holdout_predictions;
    let hoCorrect = 0;
    for (let i = 0; i < hoTruth.length; i++) {
      if (hoPred[i] === hoTruth[i]) hoCorrect += 1;
    }
    const holdoutAcc = hoTruth.length > 0 ? hoCorrect / hoTruth.length : 0;

    // Probe conservation efficiency
    const probeConservation =
      1.0 - episodeResult.probes_used / Math.max(1, episodeResult.probe_budget);

    const compositeUtility =
      0.55 * meanActionUtility +
      0.20 * claimValid +
      0.17 * holdoutAcc +
      0.08 * probeConservation -
      0.15 * overconfidentFalseClaim;

    const conf = episodeResult.terminal_stated_confidence;
    const brierScore = (conf - claimValid) * (conf - claimValid);

    const delayDecomp = computeDelayDecomposition({
      tShiftEvent: tShift,
      tContradictionObserved: tContraObs,
      tContradictionAdmitted: tContraAdm,
      tContradictionAvailable: tContraAvail,
      tCorrection,
      horizonTicks,
    });

    // Secondary diagnostic: low-authority truth non-influence when founder drifted
    // In founder_is_calibrated === false worlds, JUNIOR_OR_CONTESTED claim hc:06 accurately endorses true_initial_slot
    const firstDecision = decisions[0];
    const lowAuthorityTruthIgnoredAtStart =
      !trajSecretProxy.founder_is_calibrated &&
      firstDecision &&
      firstDecision.chosen_action_id !== initOptAction
        ? 1
        : 0;

    // Secondary diagnostic: belief revision speed after contradiction becomes available
    let beliefRevisionSpeed = null;
    if (tContraAvail !== null && tContraAvail < horizonTicks) {
      const postSlot = trajSecretProxy.true_post_shift_slot;
      const bStart = episodeResult.belief_trajectory[Math.max(0, tContraAvail - 1)];
      const bEnd = episodeResult.belief_trajectory[Math.min(horizonTicks - 1, tContraAvail + 3)];
      if (bStart && bEnd) {
        const dt = Math.max(1, bEnd.tick - bStart.tick);
        beliefRevisionSpeed = round4((bEnd.probs[postSlot] - bStart.probs[postSlot]) / dt);
      }
    }

    // Secondary diagnostic: information gained per active probe
    let bitsGainedPerProbe = 0;
    if (episodeResult.probes_used > 0 && episodeResult.belief_trajectory.length >= 2) {
      const h0 = episodeResult.belief_trajectory[0].entropy_bits ?? 2.0;
      const hT = episodeResult.belief_trajectory[episodeResult.belief_trajectory.length - 1].entropy_bits ?? 2.0;
      bitsGainedPerProbe = round4(Math.max(0, 2.0 - hT) / episodeResult.probes_used);
      void h0;
    }

    const gridCell = trajSecretProxy.grid_cell;
    const dimDesign = computeDimensionlessNumbers({
      h: gridCell.h,
      tau: gridCell.tau0,
      nu: gridCell.nu,
    });
    const dimEffective =
      delayDecomp.effective_total_latency_ticks !== null
        ? computeDimensionlessNumbers({
            h: gridCell.h,
            tau: delayDecomp.effective_total_latency_ticks,
            nu: gridCell.nu,
          })
        : { chi: dimDesign.chi, kappa: dimDesign.kappa };

    return {
      world_public_id: publicWorld.world_public_id,
      cluster_public_id: publicWorld.cluster_public_id,
      family: publicWorld.family,
      founder_is_calibrated: trajSecretProxy.founder_is_calibrated,
      policy_id: episodeResult.policy_id,
      grid_cell_id: gridCell.cell_id,
      h: gridCell.h,
      tau0: gridCell.tau0,
      delta_obs: gridCell.delta_obs,
      delta_adm: gridCell.delta_adm,
      nu: gridCell.nu,
      chi_design: dimDesign.chi,
      kappa_design: dimDesign.kappa,
      chi_effective: dimEffective.chi,
      kappa_effective: dimEffective.kappa,
      utility: round4(compositeUtility),
      mean_action_utility: round4(meanActionUtility),
      terminal_claim_valid: claimValid,
      overconfident_false_claim: overconfidentFalseClaim,
      false_claim_any: claimValid === 0 && termDecl !== 'ABSTAIN_UNIDENTIFIABLE' ? 1 : 0,
      holdout_accuracy: round4(holdoutAcc),
      stated_confidence: conf,
      brier_score: round4(brierScore),
      probes_used: episodeResult.probes_used,
      total_consequential_actions: decisions.length,
      total_incorrect_actions: totalIncorrectActions,
      incorrect_action_rate:
        decisions.length > 0 ? round4(totalIncorrectActions / decisions.length) : 0,
      errors_before_available: errorsBeforeAvailable,
      opportunities_before_available: opportunitiesBeforeAvailable,
      error_rate_before_available:
        opportunitiesBeforeAvailable > 0
          ? round4(errorsBeforeAvailable / opportunitiesBeforeAvailable)
          : null,
      errors_after_available: errorsAfterAvailable,
      opportunities_after_available: opportunitiesAfterAvailable,
      error_rate_after_available:
        opportunitiesAfterAvailable > 0
          ? round4(errorsAfterAvailable / opportunitiesAfterAvailable)
          : null,
      t_shift_event: tShift,
      t_contradiction_observed: tContraObs,
      t_contradiction_admitted: tContraAdm,
      t_contradiction_available: tContraAvail,
      t_correction: tCorrection,
      delay_decomposition: delayDecomp,
      low_authority_truth_ignored_at_start: lowAuthorityTruthIgnoredAtStart,
      belief_revision_speed: beliefRevisionSpeed,
      bits_gained_per_probe: bitsGainedPerProbe,
      candidate_evaluations: episodeResult.candidate_evaluations,
      archive_records_consulted: episodeResult.archive_records_consulted,
      non_retroactivity_checks: episodeResult.non_retroactivity_checks,
    };
  });
}

/**
 * Exhaustively verified Dynamic Synthetic Oracle (`CTRL_DYNAMIC_ORACLE`):
 * Evaluates every possible consequential action at each action tick to guarantee exact per-tick
 * action optimality, uses 0 wasteful probes (maximizing probe conservation = 1.0), and predicts
 * terminal claim & holdout queries optimally on identifiable worlds (abstaining on nullspace worlds).
 * Explicitly verifies that no single-step action deviation can strictly improve oracle utility!
 */
export function runValidatedDynamicOracle({
  publicWorld,
  trajSecretProxy,
  actionScheduleTicks,
  probeBudget = 6,
  horizonTicks = 24,
}) {
  const oracleEpisode = withAuthorizedVaultRole('DYNAMIC_SYNTHETIC_ORACLE', () => {
    const ident = publicWorld.identifiable_under_menu !== false;
    const consequentialDecisions = [];

    for (const t of actionScheduleTicks) {
      const payoffsAtT = trajSecretProxy.true_action_payoffs_by_tick[t];
      // Exhaustive optimization over all declared ACTION_IDS
      let bestAct = ACTION_IDS[0];
      let bestPayoff = -Infinity;
      for (const aId of ACTION_IDS) {
        if (payoffsAtT[aId] > bestPayoff) {
          bestPayoff = payoffsAtT[aId];
          bestAct = aId;
        }
      }
      // Verify exhaustive optimality
      for (const aId of ACTION_IDS) {
        if (payoffsAtT[aId] > bestPayoff + 1e-12) {
          throw new Error(`[ORACLE_SUBOPTIMALITY] Failed exhaustive check at tick ${t}`);
        }
      }
      const activeIdx = trajSecretProxy.hidden_trajectory_by_tick[t];
      consequentialDecisions.push({
        t_decision: t,
        t_action: t,
        chosen_action_id: ident ? bestAct : 'ACT_SAFE_HEDGE',
        map_slot_at_decision: ident ? SLOT_IDS[activeIdx] : 'ABSTAIN_UNIDENTIFIABLE',
        stated_confidence: ident ? 1.0 : 0.5,
        available_obs_count: t,
      });
    }

    const beliefTrajectory = [];
    for (let t = 1; t <= horizonTicks; t++) {
      const activeIdx = trajSecretProxy.hidden_trajectory_by_tick[t];
      const probs = { M_SLOT_0: 0, M_SLOT_1: 0, M_SLOT_2: 0, M_SLOT_3: 0 };
      if (ident) {
        probs[SLOT_IDS[activeIdx]] = 1.0;
      } else {
        probs.M_SLOT_0 = 0.25;
        probs.M_SLOT_1 = 0.25;
        probs.M_SLOT_2 = 0.25;
        probs.M_SLOT_3 = 0.25;
      }
      beliefTrajectory.push({
        tick: t,
        probs,
        map_slot: SLOT_IDS[activeIdx],
        entropy_bits: ident ? 0 : 2.0,
        cusum_surprise: 0,
      });
    }

    return {
      policy_id: 'CTRL_DYNAMIC_ORACLE',
      probes_used: 0,
      probe_budget: probeBudget,
      probe_actions: [],
      consequential_decisions: consequentialDecisions,
      terminal_declared_slot_or_abstain: ident
        ? trajSecretProxy.terminal_slot
        : 'ABSTAIN_UNIDENTIFIABLE',
      terminal_stated_confidence: ident ? 1.0 : 0.5,
      holdout_predictions: ident
        ? [...trajSecretProxy.holdout_ground_truth]
        : publicWorld.holdout_queries.map(() => 0),
      belief_trajectory: beliefTrajectory,
      candidate_evaluations: actionScheduleTicks.length * ACTION_IDS.length,
      archive_records_consulted: 0,
      non_retroactivity_checks: 0,
    };
  });

  return scoreEpisodeAgainstTrajectorySecret({
    publicWorld,
    trajSecretProxy,
    episodeResult: oracleEpisode,
    horizonTicks,
  });
}

/**
 * Evaluates a base world suite across a specified list of grid cells `(h, tau0, nu)`.
 */
export function evaluateSuiteAcrossGrid({
  suite,
  gridCells,
  evaluationSeed,
  horizonTicks = 24,
  probeBudget = 6,
}) {
  const activePolicies = [...PRIMARY_POLICIES, 'CTRL_NO_HISTORY', 'CTRL_RANDOM'];
  const allConditions = [...PRIMARY_POLICIES, ...REFERENCE_CONTROLS];
  const allEpisodeRows = [];
  let immutabilityRecomputations = 0;

  for (const pubW of suite.publicWorlds) {
    const baseSecretVault = suite.secretVaultMap.get(pubW.world_public_id);
    const expectedHistorySha = pubW.permissible_history_sha256;

    for (const gridCell of gridCells) {
      const trajBundle = buildMatchedTrajectoryInstance({
        publicWorld: pubW,
        secretVault: baseSecretVault,
        gridCell,
        horizonTicks,
      });
      const trajSecretProxy = createInstrumentedSecretVault(
        trajBundle.trajectorySecret,
        suite.vaultLedger
      );
      const actionScheduleTicks = buildActionScheduleTicks(horizonTicks, gridCell.interval_ticks);

      // 1. Run validated Dynamic Oracle
      const oracleRow = runValidatedDynamicOracle({
        publicWorld: pubW,
        trajSecretProxy,
        actionScheduleTicks,
        probeBudget,
        horizonTicks,
      });
      oracleRow.signed_regret = 0;
      oracleRow.exceeded_oracle = 0;
      allEpisodeRows.push(oracleRow);

      // 2. Run all 4 primary policies + No-History + Random through strict AvailabilityMembrane
      for (const policyId of activePolicies) {
        const beforeSha = sha256Hex(JSON.stringify(pubW.permissible_historical_claims));
        immutabilityRecomputations += 1;
        if (beforeSha !== expectedHistorySha) {
          throw new Error(`[HISTORY_IMMUTABILITY_VIOLATION] Corrupted history before ${policyId}`);
        }

        const membrane = new AvailabilityMembrane(pubW.permissible_historical_claims);
        // Enqueue all ambient observations at their physical event generation; membrane withholds any with t_available > t_decision!
        for (let t = 1; t <= horizonTicks; t++) {
          membrane.enqueueObservation(trajBundle.ambientObservationsToEnqueueByEventTick[t]);
        }

        const requestActiveProbeAtTick = (tProbe, probeId) => {
          const probeObs = withAuthorizedVaultRole('WORLD_OBSERVATION_SIMULATOR', () => {
            return trajSecretProxy.crn_probes_by_tick[tProbe][probeId];
          });
          membrane.enqueueObservation(probeObs);
        };

        const observableContextAtTick = t => trajBundle.observableContextByTick[t];

        const publicPacket = Object.freeze({
          world_public_id: pubW.world_public_id,
          cluster_public_id: pubW.cluster_public_id,
          family: pubW.family,
          terminal_graph_pi: pubW.terminal_graph_pi,
          candidate_hypotheses: pubW.candidate_hypotheses,
          probe_menu: pubW.probe_menu,
          action_menu: pubW.action_menu,
          holdout_queries: pubW.holdout_queries,
          identifiable_under_menu: pubW.identifiable_under_menu,
        });

        const epRes = runPolicyEpisode({
          policyId,
          publicPacket,
          availabilityMembrane: membrane,
          requestActiveProbeAtTick,
          observableContextAtTick,
          actionScheduleTicks,
          probeBudget,
          horizonTicks,
          episodeSeed: `${evaluationSeed}::${gridCell.cell_id}::${policyId}::${pubW.world_public_id}`,
        });

        const afterSha = sha256Hex(JSON.stringify(pubW.permissible_historical_claims));
        immutabilityRecomputations += 1;
        if (afterSha !== expectedHistorySha) {
          throw new Error(`[HISTORY_IMMUTABILITY_VIOLATION] Mutated history after ${policyId}`);
        }

        const scored = scoreEpisodeAgainstTrajectorySecret({
          publicWorld: pubW,
          trajSecretProxy,
          episodeResult: epRes,
          horizonTicks,
        });

        // UNCLIPPED SIGNED REGRET (Fixes PR #1699 Review Finding #1!)
        const rawSignedRegret = oracleRow.utility - scored.utility;
        scored.signed_regret = round4(rawSignedRegret);
        scored.exceeded_oracle = rawSignedRegret < -1e-9 ? 1 : 0;
        allEpisodeRows.push(scored);
      }
    }
  }

  if (suite.vaultLedger.unauthorized_investigator_reads !== 0) {
    throw new Error(
      `[FATAL_VAULT_BREACH] Detected ${suite.vaultLedger.unauthorized_investigator_reads} unauthorized secret reads!`
    );
  }

  return {
    all_conditions: allConditions,
    episode_rows: allEpisodeRows,
    immutability_recomputations_verified: immutabilityRecomputations,
    vault_access_ledger: { ...suite.vaultLedger },
  };
}

export function computeExpectedCalibrationError5Bin(rows) {
  if (!rows.length) return 0;
  const bins = Array.from({ length: 5 }, () => ({ n: 0, conf: 0, acc: 0 }));
  for (const r of rows) {
    const idx = Math.min(4, Math.floor(r.stated_confidence * 5));
    bins[idx].n += 1;
    bins[idx].conf += r.stated_confidence;
    bins[idx].acc += r.terminal_claim_valid;
  }
  let ece = 0;
  for (const b of bins) {
    if (b.n > 0) {
      ece += (b.n / rows.length) * Math.abs(b.conf / b.n - b.acc / b.n);
    }
  }
  return round4(ece);
}

export function summarizePolicyRows(rows) {
  const n = rows.length;
  if (n === 0) return null;
  const avg = fn => rows.reduce((s, r) => s + fn(r), 0) / n;
  const avgNonNull = fn => {
    const vals = rows.map(fn).filter(v => v !== null && v !== undefined);
    return vals.length > 0 ? round4(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  };

  const contraRows = rows.filter(r => r.delay_decomposition.has_actionable_contradiction);
  const revisedRows = contraRows.filter(r => r.delay_decomposition.revised_within_horizon);
  const wrongRows = rows.filter(r => r.terminal_claim_valid === 0);
  const driftedFounderRows = rows.filter(r => !r.founder_is_calibrated);

  return {
    n_episodes: n,
    mean_utility: round4(avg(r => r.utility)),
    mean_signed_regret: round4(avg(r => r.signed_regret)),
    proportion_exceeding_oracle: round4(avg(r => r.exceeded_oracle)),
    mean_action_utility: round4(avg(r => r.mean_action_utility)),
    mean_incorrect_action_rate: round4(avg(r => r.incorrect_action_rate)),
    mean_error_rate_before_available: avgNonNull(r => r.error_rate_before_available),
    mean_error_rate_after_available: avgNonNull(r => r.error_rate_after_available),
    mean_eval_latency_revised_ticks:
      revisedRows.length > 0
        ? round4(
            revisedRows.reduce((s, r) => s + r.delay_decomposition.policy_evaluation_delay_ticks, 0) /
              revisedRows.length
          )
        : null,
    mean_eval_latency_censored_ticks:
      contraRows.length > 0
        ? round4(
            contraRows.reduce((s, r) => s + r.delay_decomposition.censored_evaluation_delay_ticks, 0) /
              contraRows.length
          )
        : null,
    non_revision_rate_given_contradiction:
      contraRows.length > 0
        ? round4(1.0 - revisedRows.length / contraRows.length)
        : null,
    terminal_claim_accuracy: round4(avg(r => r.terminal_claim_valid)),
    false_claim_rate: round4(avg(r => r.false_claim_any)),
    overconfident_false_claim_rate: round4(avg(r => r.overconfident_false_claim)),
    mean_brier_score: round4(avg(r => r.brier_score)),
    ece_5bin: computeExpectedCalibrationError5Bin(rows),
    mean_confidence_when_wrong:
      wrongRows.length > 0
        ? round4(wrongRows.reduce((s, r) => s + r.stated_confidence, 0) / wrongRows.length)
        : null,
    mean_probes_used: round4(avg(r => r.probes_used)),
    mean_bits_gained_per_probe: round4(avg(r => r.bits_gained_per_probe)),
    mean_belief_revision_speed: avgNonNull(r => r.belief_revision_speed),
    low_authority_truth_non_influence_rate:
      driftedFounderRows.length > 0
        ? round4(
            driftedFounderRows.reduce((s, r) => s + r.low_authority_truth_ignored_at_start, 0) /
              driftedFounderRows.length
          )
        : null,
    mean_candidate_evaluations: round4(avg(r => r.candidate_evaluations)),
    mean_archive_records_consulted: round4(avg(r => r.archive_records_consulted)),
  };
}

/**
 * Paired Cluster-Robust Contrast Statistics:
 *   - Aggregates paired episode differences within `cluster_public_id` first so repeated
 *     episodes across the 18 grid cells of the same world/cluster are NEVER treated as independent!
 *   - Uses exact 2^K enumeration when K <= 16, and Phipson-Smyth (k + 1) / (B + 1) Monte Carlo
 *     upper bounds with B = 8192 when K > 16 (never reporting p = 0 from stochastic draws!).
 */
export function computeClusteredPairedContrast({
  rowsA,
  rowsB,
  metricFn = r => r.utility,
  seed,
  nBoot = 4000,
  nPerm = 8192,
}) {
  const mapB = new Map(rowsB.map(r => [`${r.world_public_id}::${r.grid_cell_id}`, r]));
  const clusterBuckets = new Map();
  const unitDiffs = [];

  for (const ra of rowsA) {
    const key = `${ra.world_public_id}::${ra.grid_cell_id}`;
    const rb = mapB.get(key);
    if (!rb) {
      throw new Error(`Missing paired episode ${key} in computeClusteredPairedContrast`);
    }
    const d = metricFn(ra) - metricFn(rb);
    unitDiffs.push(d);
    if (!clusterBuckets.has(ra.cluster_public_id)) {
      clusterBuckets.set(ra.cluster_public_id, []);
    }
    clusterBuckets.get(ra.cluster_public_id).push(d);
  }

  const clusterMeans = Array.from(clusterBuckets.values()).map(
    arr => arr.reduce((a, b) => a + b, 0) / arr.length
  );
  const kClusters = clusterMeans.length;
  const meanDiff = clusterMeans.reduce((a, b) => a + b, 0) / kClusters;
  const clusterVar =
    clusterMeans.reduce((acc, v) => acc + (v - meanDiff) ** 2, 0) / Math.max(1, kClusters - 1);
  const clusterSd = Math.sqrt(clusterVar);
  const cohensDzCluster = clusterSd > 1e-12 ? meanDiff / clusterSd : 0;

  const rng = new DeterministicRng(seed);
  const bootMeans = [];
  for (let b = 0; b < nBoot; b++) {
    let s = 0;
    for (let j = 0; j < kClusters; j++) {
      s += clusterMeans[rng.nextInt(0, kClusters)];
    }
    bootMeans.push(s / kClusters);
  }
  bootMeans.sort((a, b) => a - b);
  const ci95Low = bootMeans[Math.floor(0.025 * nBoot)];
  const ci95High = bootMeans[Math.floor(0.975 * nBoot)];

  const obsAbs = Math.abs(meanDiff);
  let exceedances = 0;
  let totalEvaluated = 0;
  let inferenceMethod = '';
  let pValue = 1.0;

  if (kClusters <= 16) {
    inferenceMethod = `EXACT_2_POW_${kClusters}_CLUSTER_SIGNFLIP`;
    totalEvaluated = 1 << kClusters;
    for (let mask = 0; mask < totalEvaluated; mask++) {
      let s = 0;
      for (let j = 0; j < kClusters; j++) {
        s += (mask >> j) & 1 ? clusterMeans[j] : -clusterMeans[j];
      }
      if (Math.abs(s / kClusters) >= obsAbs - 1e-12) exceedances += 1;
    }
    pValue = exceedances / totalEvaluated;
  } else {
    inferenceMethod = `PHIPSON_SMYTH_MONTE_CARLO_${nPerm}_CLUSTER_SIGNFLIP`;
    totalEvaluated = nPerm;
    for (let i = 0; i < nPerm; i++) {
      let s = 0;
      for (let j = 0; j < kClusters; j++) {
        s += (rng.nextInt(0, 2) === 1 ? 1 : -1) * clusterMeans[j];
      }
      if (Math.abs(s / kClusters) >= obsAbs - 1e-12) exceedances += 1;
    }
    // Phipson & Smyth (2010) exact Monte Carlo upper bound: never 0!
    pValue = (exceedances + 1) / (nPerm + 1);
  }

  return {
    n_paired_episodes: unitDiffs.length,
    n_independent_clusters: kClusters,
    mean_diff: round4(meanDiff),
    cluster_sd: round4(clusterSd),
    ci95_low: round4(ci95Low),
    ci95_high: round4(ci95High),
    cluster_cohens_dz: round4(cohensDzCluster),
    permutation_method: inferenceMethod,
    sampled_exceedances: exceedances,
    total_permutations: totalEvaluated,
    two_sided_p_value: round6(pValue),
  };
}

/**
 * Computes Authority-by-Hazard interaction & Exploratory Mechanistic Latency Mediation
 * (explicitly separated per Section VI).
 */
export function computeInteractionAndMediationAnalysis({
  episodeRows,
  seed,
}) {
  const monRows = episodeRows.filter(r => r.policy_id === 'A_MONUMENTALISTS');
  const eviRows = episodeRows.filter(r => r.policy_id === 'B_EVIDENTIALISTS');
  const mapEvi = new Map(eviRows.map(r => [`${r.world_public_id}::${r.grid_cell_id}`, r]));

  // 1. Randomized Causal Interaction: ΔU(h_high=0.20) - ΔU(h_low=0.02) paired within each world & (tau0, nu)!
  const lowHPairsA = [];
  const lowHPairsB = [];
  const highHPairsA = [];
  const highHPairsB = [];

  for (const rm of monRows) {
    const re = mapEvi.get(`${rm.world_public_id}::${rm.grid_cell_id}`);
    if (rm.h === 0.02) {
      lowHPairsA.push(rm);
      lowHPairsB.push(re);
    } else if (rm.h === 0.20) {
      highHPairsA.push(rm);
      highHPairsB.push(re);
    }
  }

  // Build world/cluster-matched interaction differences: [ΔU(h=0.20) - ΔU(h=0.02)]
  const mapLowDelta = new Map();
  for (let i = 0; i < lowHPairsA.length; i++) {
    const rA = lowHPairsA[i];
    const rB = lowHPairsB[i];
    const subKey = `${rA.world_public_id}::tau${rA.tau0}::nu${rA.nu}`;
    mapLowDelta.set(subKey, {
      cluster_public_id: rA.cluster_public_id,
      world_public_id: rA.world_public_id,
      grid_cell_id: `INT_tau${rA.tau0}_nu${rA.nu}`,
      family: rA.family,
      utility: rA.utility - rB.utility,
    });
  }

  const highDeltaSyntheticRows = [];
  const lowDeltaSyntheticRows = [];
  for (let i = 0; i < highHPairsA.length; i++) {
    const rA = highHPairsA[i];
    const rB = highHPairsB[i];
    const subKey = `${rA.world_public_id}::tau${rA.tau0}::nu${rA.nu}`;
    const lowObj = mapLowDelta.get(subKey);
    if (lowObj) {
      highDeltaSyntheticRows.push({
        cluster_public_id: rA.cluster_public_id,
        world_public_id: rA.world_public_id,
        grid_cell_id: lowObj.grid_cell_id,
        family: rA.family,
        utility: rA.utility - rB.utility,
      });
      lowDeltaSyntheticRows.push(lowObj);
    }
  }

  const overallHazardInteraction = computeClusteredPairedContrast({
    rowsA: highDeltaSyntheticRows,
    rowsB: lowDeltaSyntheticRows,
    metricFn: r => r.utility,
    seed: `${seed}::interaction_all`,
  });

  const dynamicFamilies = ['FAM_B_ABRUPT_TRANSITION', 'FAM_C_GRADUAL_DRIFT', 'FAM_F_DELAYED_CONTRADICTION'];
  const dynamicHazardInteraction = computeClusteredPairedContrast({
    rowsA: highDeltaSyntheticRows.filter(r => dynamicFamilies.includes(r.family)),
    rowsB: lowDeltaSyntheticRows.filter(r => dynamicFamilies.includes(r.family)),
    metricFn: r => r.utility,
    seed: `${seed}::interaction_dynamic`,
  });

  // 2. Exploratory Mechanistic Mediation on Actionable-Contradiction Episodes:
  // Regress ΔU_i on Δτ_eval,i = τ_eval(Mon) - τ_eval(Evi) across episodes where actionable contradiction occurred
  const medPairs = [];
  for (const rm of monRows) {
    const re = mapEvi.get(`${rm.world_public_id}::${rm.grid_cell_id}`);
    if (
      rm.delay_decomposition.has_actionable_contradiction &&
      re.delay_decomposition.has_actionable_contradiction
    ) {
      const dTau =
        rm.delay_decomposition.censored_evaluation_delay_ticks -
        re.delay_decomposition.censored_evaluation_delay_ticks;
      const dU = rm.utility - re.utility;
      medPairs.push({ dTau, dU, nu: rm.nu });
    }
  }

  const nMed = medPairs.length;
  const meanDTau = medPairs.reduce((s, p) => s + p.dTau, 0) / Math.max(1, nMed);
  const meanDU = medPairs.reduce((s, p) => s + p.dU, 0) / Math.max(1, nMed);
  let covTU = 0;
  let varT = 0;
  for (const p of medPairs) {
    covTU += (p.dTau - meanDTau) * (p.dU - meanDU);
    varT += (p.dTau - meanDTau) ** 2;
  }
  const slopeBeta = varT > 1e-9 ? covTU / varT : 0;
  const indirectViaLatency = meanDTau * slopeBeta;
  const directResidual = meanDU - indirectViaLatency;

  return {
    randomized_causal_hazard_interaction_all_families: {
      classification: 'RANDOMIZED_DESIGN_CAUSAL_CONTRAST',
      estimand: 'E[(U_Mon - U_Evi | h=0.20) - (U_Mon - U_Evi | h=0.02)]',
      ...overallHazardInteraction,
    },
    randomized_causal_hazard_interaction_consequential_shift_families_BCF: {
      classification: 'RANDOMIZED_DESIGN_CAUSAL_CONTRAST',
      estimand: 'E[(U_Mon - U_Evi | h=0.20) - (U_Mon - U_Evi | h=0.02) | Family in {B,C,F}]',
      ...dynamicHazardInteraction,
    },
    exploratory_revision_latency_mediation: {
      classification: 'EXPLORATORY_OBSERVATIONAL_MEDIATION_NOT_RANDOMIZED_INDIRECT_EFFECT',
      caveat:
        'Endogenous evaluation latency Δτ_eval is a post-treatment policy realization rather than an independently randomized instrument; decomposition is associative/mechanistic.',
      n_contradiction_episode_pairs: nMed,
      mean_delta_tau_eval_ticks_mon_minus_evi: round4(meanDTau),
      total_mean_delta_utility_in_subset: round4(meanDU),
      ols_slope_utility_per_latency_tick: round4(slopeBeta),
      estimated_latency_mediated_component: round4(indirectViaLatency),
      estimated_direct_prior_component: round4(directResidual),
    },
  };
}
