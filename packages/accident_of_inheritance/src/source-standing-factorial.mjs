/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Auxiliary 2x2 Randomized Source-Standing x Evidentiary-Reliability Factorial Analysis
 * & Exact 24-Permutation Source-Status Invariance Verifier (Section III, VI, IX.6)
 *
 * Estimand:
 *   ΔU_status(Q) = E[U | S_HIGH (FOUNDING_AUTHORITY), Q] - E[U | S_LOW (JUNIOR_OR_CONTESTED), Q]
 *   holding observational content, timestamps, log-likelihood vectors, and CRN realizations
 *   100% byte-identical across status swaps.
 *
 * Synthetic Boundary:
 *   All source labels (`FOUNDING_AUTHORITY`, `ESTABLISHED_COUNCIL`, `INDEPENDENT_AUDITOR`,
 *   `JUNIOR_OR_CONTESTED`) are purely formal institutional-role treatments in a synthetic
 *   decision model. They never represent demographic or social identities.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { sha256Hex, round4, deepFreeze } from './prng.mjs';
import {
  AvailabilityMembrane,
  createTemporalStamp,
  createInstrumentedSecretVault,
  withAuthorizedVaultRole,
} from './temporal-lattice.mjs';
import {
  SLOT_IDS,
  SOURCE_STANDINGS,
  generateBaseWorldSuite,
  buildMatchedTrajectoryInstance,
} from './world-generator.mjs';
import {
  PRIMARY_POLICIES,
  computeHistoricalLogPrior,
  softmaxFromLogScores,
  runPolicyEpisode,
} from './authority-policies.mjs';
import {
  buildActionScheduleTicks,
  scoreEpisodeAgainstTrajectorySecret,
  computeClusteredPairedContrast,
} from './evaluator-and-stats.mjs';
import { ACT2_MASTER_SEEDS, CONFIRMATORY_GRID_18 } from './grid-definitions.mjs';

/**
 * Constructs matched 2x2 factorial historical claim sets for a base world:
 *   - `Q_HIGH_CALIBRATED`: Focal claim `fc_0` endorses `true_initial_slot` with high measured
 *     calibration (q = 0.92, r = 0.93, n = 36, calibrated = true); competing claim `fc_1` endorses
 *     `drift_rival_slot` with poor calibration (q = 0.22, r = 0.30, n = 36, calibrated = false).
 *   - `Q_LOW_MISLEADING`: Focal claim `fc_0` endorses `drift_rival_slot` (false/misleading) with
 *     poor measured calibration (q = 0.22, r = 0.30, n = 36, calibrated = false); competing claim
 *     `fc_1` endorses `true_initial_slot` with high calibration (q = 0.92, r = 0.93, n = 36, calibrated = true).
 *
 * Within each Q level, `S_HIGH` assigns `FOUNDING_AUTHORITY` to `fc_0` and `JUNIOR_OR_CONTESTED` to `fc_1`,
 * while `S_LOW` assigns `JUNIOR_OR_CONTESTED` to `fc_0` and `FOUNDING_AUTHORITY` to `fc_1` — keeping every
 * other byte (log-likelihoods, calibration_metrics, temporal_coordinates) strictly identical!
 */
function buildFactorialClaimQuad({ worldId, initSlotIdx, rivalSlotIdx }) {
  function makeDeterministicLL(targetIdx, strength) {
    const out = {};
    for (let i = 0; i < 4; i++) {
      out[SLOT_IDS[i]] = i === targetIdx ? strength : round4(-0.45 * strength);
    }
    return out;
  }

  const calHigh = Object.freeze({
    measured_calibration_score: 0.92,
    sample_replicates: 36,
    reproducibility_pass_rate: 0.93,
    residual_variance: 0.042,
    independently_calibrated: true,
  });

  const calLow = Object.freeze({
    measured_calibration_score: 0.22,
    sample_replicates: 36,
    reproducibility_pass_rate: 0.30,
    residual_variance: 0.39,
    independently_calibrated: false,
  });

  const stamp0 = createTemporalStamp(
    { t_event: -30, t_observed: -29, t_admitted: -26, t_available: -26 },
    `${worldId}:fact:0`
  );
  const stamp1 = createTemporalStamp(
    { t_event: -28, t_observed: -27, t_admitted: -24, t_available: -24 },
    `${worldId}:fact:1`
  );
  const stamp2 = createTemporalStamp(
    { t_event: -20, t_observed: -19, t_admitted: -17, t_available: -17 },
    `${worldId}:fact:2`
  );
  const stamp3 = createTemporalStamp(
    { t_event: -16, t_observed: -15, t_admitted: -13, t_available: -13 },
    `${worldId}:fact:3`
  );

  // Neutral balanced background claims so total archive depth = 4 claims across all 4 standings
  const neutralClaims = [
    {
      record_kind: 'HISTORICAL_CLAIM',
      claim_id: `${worldId}:fact:bg2`,
      world_public_id: worldId,
      endorsed_slot_id: SLOT_IDS[initSlotIdx],
      log_likelihood_by_slot: makeDeterministicLL(initSlotIdx, 0.35),
      source_standing: 'ESTABLISHED_COUNCIL',
      calibration_metrics: {
        measured_calibration_score: 0.62,
        sample_replicates: 16,
        reproducibility_pass_rate: 0.65,
        residual_variance: 0.14,
        independently_calibrated: true,
      },
      conditioning_regime_tag: 'REGIME_SIG_ALPHA',
      temporal_coordinates: stamp2,
    },
    {
      record_kind: 'HISTORICAL_CLAIM',
      claim_id: `${worldId}:fact:bg3`,
      world_public_id: worldId,
      endorsed_slot_id: SLOT_IDS[rivalSlotIdx],
      log_likelihood_by_slot: makeDeterministicLL(rivalSlotIdx, 0.35),
      source_standing: 'INDEPENDENT_AUDITOR',
      calibration_metrics: {
        measured_calibration_score: 0.62,
        sample_replicates: 16,
        reproducibility_pass_rate: 0.65,
        residual_variance: 0.14,
        independently_calibrated: true,
      },
      conditioning_regime_tag: 'REGIME_SIG_ALPHA',
      temporal_coordinates: stamp3,
    },
  ];

  function buildArmClaims({ qLevel, focalStanding, rivalStanding }) {
    const focalIsHighQ = qLevel === 'Q_HIGH_CALIBRATED';
    const focalTarget = focalIsHighQ ? initSlotIdx : rivalSlotIdx;
    const compTarget = focalIsHighQ ? rivalSlotIdx : initSlotIdx;

    return deepFreeze([
      {
        record_kind: 'HISTORICAL_CLAIM',
        claim_id: `${worldId}:fact:fc0`,
        world_public_id: worldId,
        endorsed_slot_id: SLOT_IDS[focalTarget],
        log_likelihood_by_slot: makeDeterministicLL(focalTarget, 1.65),
        source_standing: focalStanding,
        calibration_metrics: focalIsHighQ ? calHigh : calLow,
        conditioning_regime_tag: focalIsHighQ ? 'REGIME_SIG_ALPHA' : 'BASELINE_UNCALIBRATED',
        temporal_coordinates: stamp0,
      },
      {
        record_kind: 'HISTORICAL_CLAIM',
        claim_id: `${worldId}:fact:fc1`,
        world_public_id: worldId,
        endorsed_slot_id: SLOT_IDS[compTarget],
        log_likelihood_by_slot: makeDeterministicLL(compTarget, 1.65),
        source_standing: rivalStanding,
        calibration_metrics: focalIsHighQ ? calLow : calHigh,
        conditioning_regime_tag: focalIsHighQ ? 'BASELINE_UNCALIBRATED' : 'REGIME_SIG_ALPHA',
        temporal_coordinates: stamp1,
      },
      ...neutralClaims,
    ]);
  }

  return {
    Q_HIGH__S_HIGH: buildArmClaims({
      qLevel: 'Q_HIGH_CALIBRATED',
      focalStanding: 'FOUNDING_AUTHORITY',
      rivalStanding: 'JUNIOR_OR_CONTESTED',
    }),
    Q_HIGH__S_LOW: buildArmClaims({
      qLevel: 'Q_HIGH_CALIBRATED',
      focalStanding: 'JUNIOR_OR_CONTESTED',
      rivalStanding: 'FOUNDING_AUTHORITY',
    }),
    Q_LOW__S_HIGH: buildArmClaims({
      qLevel: 'Q_LOW_MISLEADING',
      focalStanding: 'FOUNDING_AUTHORITY',
      rivalStanding: 'JUNIOR_OR_CONTESTED',
    }),
    Q_LOW__S_LOW: buildArmClaims({
      qLevel: 'Q_LOW_MISLEADING',
      focalStanding: 'JUNIOR_OR_CONTESTED',
      rivalStanding: 'FOUNDING_AUTHORITY',
    }),
  };
}

function generateAllPermutations(arr) {
  if (arr.length <= 1) return [arr];
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of generateAllPermutations(rest)) {
      res.push([arr[i], ...p]);
    }
  }
  return res;
}

/**
 * Executes the complete 96-world (24-cluster) 2x2 Source-Standing x Reliability Exploratory Factorial
 * + Exact 24-Permutation Source-Status Invariance Audit.
 */
export function runSourceStandingFactorialAnalysis({
  masterSeed = ACT2_MASTER_SEEDS.STANDING_FACTORIAL_96_SEED,
  totalWorlds = 96,
  horizonTicks = 24,
  probeBudget = 6,
} = {}) {
  const suite = generateBaseWorldSuite({
    suiteName: 'ACT2_STANDING_FACTORIAL_96',
    masterSeed,
    totalWorlds,
  });

  const focalGridCell = CONFIRMATORY_GRID_18.find(
    c => c.cell_id === 'H_MOD__L3_MODERATE__V_ACCELERATED'
  );
  const actionScheduleTicks = buildActionScheduleTicks(horizonTicks, focalGridCell.interval_ticks);
  const armKeys = ['Q_HIGH__S_HIGH', 'Q_HIGH__S_LOW', 'Q_LOW__S_HIGH', 'Q_LOW__S_LOW'];

  const armRowsByPolicy = {};
  for (const pol of PRIMARY_POLICIES) {
    armRowsByPolicy[pol] = {
      Q_HIGH__S_HIGH: [],
      Q_HIGH__S_LOW: [],
      Q_LOW__S_HIGH: [],
      Q_LOW__S_LOW: [],
    };
  }

  let contentByteIdentityVerifiedCount = 0;

  for (const pubW of suite.publicWorlds) {
    const baseSecret = suite.secretVaultMap.get(pubW.world_public_id);
    const { initIdx, rivalIdx } = withAuthorizedVaultRole('WORLD_OBSERVATION_SIMULATOR', () => {
      const iIdx = baseSecret.true_initial_slot_idx;
      const postIdx = baseSecret.true_post_shift_slot_idx;
      // Pick a genuinely erroneous slot distinct from BOTH true_initial_slot and true_post_shift_slot!
      let errIdx = (iIdx + 2) % 4;
      if (errIdx === postIdx) errIdx = (iIdx + 3) % 4;
      return { initIdx: iIdx, rivalIdx: errIdx };
    });

    const claimQuad = buildFactorialClaimQuad({
      worldId: pubW.world_public_id,
      initSlotIdx: initIdx,
      rivalSlotIdx: rivalIdx,
    });

    // Verify that stripping `source_standing` leaves Q_HIGH__S_HIGH and Q_HIGH__S_LOW 100% byte-identical!
    const stripStanding = claims =>
      JSON.stringify(claims.map(({ source_standing, ...rest }) => rest));
    if (
      stripStanding(claimQuad.Q_HIGH__S_HIGH) !== stripStanding(claimQuad.Q_HIGH__S_LOW) ||
      stripStanding(claimQuad.Q_LOW__S_HIGH) !== stripStanding(claimQuad.Q_LOW__S_LOW)
    ) {
      throw new Error(`Factorial content byte-identity failed on ${pubW.world_public_id}`);
    }
    contentByteIdentityVerifiedCount += 1;

    const trajBundle = buildMatchedTrajectoryInstance({
      publicWorld: pubW,
      secretVault: baseSecret,
      gridCell: focalGridCell,
      horizonTicks,
    });
    const trajSecretProxy = createInstrumentedSecretVault(
      trajBundle.trajectorySecret,
      suite.vaultLedger
    );

    const publicPacket = Object.freeze({
      world_public_id: pubW.world_public_id,
      cluster_public_id: pubW.cluster_public_id,
      family: pubW.family,
      terminal_graph_pi: pubW.terminal_graph_pi,
      candidate_hypotheses: pubW.candidate_hypotheses,
      probe_menu: pubW.probe_menu,
      action_menu: pubW.action_menu,
      holdout_queries: pubW.holdout_queries,
      identifiable_under_menu: true,
    });

    for (const pol of PRIMARY_POLICIES) {
      for (const armKey of armKeys) {
        const armClaims = claimQuad[armKey];
        const membrane = new AvailabilityMembrane(armClaims);
        for (let t = 1; t <= horizonTicks; t++) {
          membrane.enqueueObservation(trajBundle.ambientObservationsToEnqueueByEventTick[t]);
        }

        const requestActiveProbeAtTick = (tProbe, probeId) => {
          const pObs = withAuthorizedVaultRole(
            'WORLD_OBSERVATION_SIMULATOR',
            () => trajSecretProxy.crn_probes_by_tick[tProbe][probeId]
          );
          membrane.enqueueObservation(pObs);
        };

        // IMPORTANT: Use identical episodeSeed across S_HIGH and S_LOW so CRN + RNG state match 100%!
        const qBaseKey = armKey.startsWith('Q_HIGH') ? 'Q_HIGH' : 'Q_LOW';
        const epRes = runPolicyEpisode({
          policyId: pol,
          publicPacket,
          availabilityMembrane: membrane,
          requestActiveProbeAtTick,
          observableContextAtTick: t => trajBundle.observableContextByTick[t],
          actionScheduleTicks,
          probeBudget,
          horizonTicks,
          episodeSeed: `${masterSeed}::${qBaseKey}::${pol}::${pubW.world_public_id}`,
        });

        const scored = scoreEpisodeAgainstTrajectorySecret({
          publicWorld: pubW,
          trajSecretProxy,
          episodeResult: epRes,
          horizonTicks,
        });

        const initPrior = computeHistoricalLogPrior({
          policyId: pol,
          historicalClaims: armClaims,
          tDecision: 1,
          currentContextEstimate: 'REGIME_SIG_ALPHA',
        });
        const initProbs = softmaxFromLogScores(initPrior.logPrior);
        const focalEndorsedSlot = armClaims[0].endorsed_slot_id;

        armRowsByPolicy[pol][armKey].push({
          ...scored,
          grid_cell_id: focalGridCell.cell_id,
          focal_prior_prob_t1: round4(initProbs[focalEndorsedSlot]),
          first_probe_id: epRes.probe_actions[0]?.probe_id ?? 'NONE',
          decisions_digest: sha256Hex(JSON.stringify(epRes.consequential_decisions)),
        });
      }
    }
  }

  // Compute ΔU_status contrasts and posterior/probe/latency shifts for every policy
  const policyStandingContrasts = {};
  for (const pol of PRIMARY_POLICIES) {
    const qHighContrast = computeClusteredPairedContrast({
      rowsA: armRowsByPolicy[pol].Q_HIGH__S_HIGH,
      rowsB: armRowsByPolicy[pol].Q_HIGH__S_LOW,
      metricFn: r => r.utility,
      seed: `${masterSeed}::stat_qhigh_${pol}`,
    });

    const qLowContrast = computeClusteredPairedContrast({
      rowsA: armRowsByPolicy[pol].Q_LOW__S_HIGH,
      rowsB: armRowsByPolicy[pol].Q_LOW__S_LOW,
      metricFn: r => r.utility,
      seed: `${masterSeed}::stat_qlow_${pol}`,
    });

    // Pooled unconditional standing effect across balanced Q_HIGH + Q_LOW
    const pooledHigh = [
      ...armRowsByPolicy[pol].Q_HIGH__S_HIGH.map(r => ({ ...r, grid_cell_id: 'QH' })),
      ...armRowsByPolicy[pol].Q_LOW__S_HIGH.map(r => ({ ...r, grid_cell_id: 'QL' })),
    ];
    const pooledLow = [
      ...armRowsByPolicy[pol].Q_HIGH__S_LOW.map(r => ({ ...r, grid_cell_id: 'QH' })),
      ...armRowsByPolicy[pol].Q_LOW__S_LOW.map(r => ({ ...r, grid_cell_id: 'QL' })),
    ];
    const pooledContrast = computeClusteredPairedContrast({
      rowsA: pooledHigh,
      rowsB: pooledLow,
      metricFn: r => r.utility,
      seed: `${masterSeed}::stat_pooled_${pol}`,
    });

    // Compute mean posterior shift on focal claim, probe-count shift, decision-sequence change rate, and latency shift
    const calcMechanismShifts = (hiArr, loArr) => {
      let sumPriorShift = 0;
      let sumProbeDiff = 0;
      let sumLatencyDiff = 0;
      let latencyPairs = 0;
      let decisionDiffCount = 0;

      for (let i = 0; i < hiArr.length; i++) {
        const hi = hiArr[i];
        const lo = loArr[i];
        sumPriorShift += hi.focal_prior_prob_t1 - lo.focal_prior_prob_t1;
        sumProbeDiff += hi.probes_used - lo.probes_used;
        if (hi.decisions_digest !== lo.decisions_digest) decisionDiffCount += 1;
        if (
          hi.delay_decomposition.has_actionable_contradiction &&
          lo.delay_decomposition.has_actionable_contradiction
        ) {
          sumLatencyDiff +=
            hi.delay_decomposition.censored_evaluation_delay_ticks -
            lo.delay_decomposition.censored_evaluation_delay_ticks;
          latencyPairs += 1;
        }
      }
      return {
        mean_focal_prior_prob_shift: round4(sumPriorShift / hiArr.length),
        mean_probes_used_shift: round4(sumProbeDiff / hiArr.length),
        decision_trajectory_changed_rate: round4(decisionDiffCount / hiArr.length),
        mean_censored_eval_latency_shift_ticks:
          latencyPairs > 0 ? round4(sumLatencyDiff / latencyPairs) : 0,
      };
    };

    const avgUtil = arr => round4(arr.reduce((s, r) => s + r.utility, 0) / arr.length);

    policyStandingContrasts[pol] = {
      cell_means_utility: {
        Q_HIGH__S_HIGH: avgUtil(armRowsByPolicy[pol].Q_HIGH__S_HIGH),
        Q_HIGH__S_LOW: avgUtil(armRowsByPolicy[pol].Q_HIGH__S_LOW),
        Q_LOW__S_HIGH: avgUtil(armRowsByPolicy[pol].Q_LOW__S_HIGH),
        Q_LOW__S_LOW: avgUtil(armRowsByPolicy[pol].Q_LOW__S_LOW),
      },
      delta_u_status_given_Q_HIGH_calibrated: qHighContrast,
      delta_u_status_given_Q_LOW_misleading: qLowContrast,
      delta_u_status_pooled_counterbalanced: pooledContrast,
      mechanism_shifts_given_Q_HIGH: calcMechanismShifts(
        armRowsByPolicy[pol].Q_HIGH__S_HIGH,
        armRowsByPolicy[pol].Q_HIGH__S_LOW
      ),
      mechanism_shifts_given_Q_LOW: calcMechanismShifts(
        armRowsByPolicy[pol].Q_LOW__S_HIGH,
        armRowsByPolicy[pol].Q_LOW__S_LOW
      ),
    };
  }

  // Exact 4! = 24 Source-Status Permutation Check across 4 matched claims of identical empirical Q
  const all24Perms = generateAllPermutations([...SOURCE_STANDINGS]);
  const sampleWorld = suite.publicWorlds[0];
  const baseMatchedClaims = SLOT_IDS.map((sl, idx) => ({
    record_kind: 'HISTORICAL_CLAIM',
    claim_id: `perm_check_${idx}`,
    world_public_id: sampleWorld.world_public_id,
    endorsed_slot_id: sl,
    log_likelihood_by_slot: {
      M_SLOT_0: idx === 0 ? 1.4 : -0.4,
      M_SLOT_1: idx === 1 ? 1.2 : -0.35,
      M_SLOT_2: idx === 2 ? 1.0 : -0.3,
      M_SLOT_3: idx === 3 ? 0.8 : -0.25,
    },
    source_standing: SOURCE_STANDINGS[idx],
    calibration_metrics: {
      measured_calibration_score: 0.85,
      sample_replicates: 25,
      reproducibility_pass_rate: 0.88,
      residual_variance: 0.05,
      independently_calibrated: true,
    },
    conditioning_regime_tag: 'REGIME_SIG_ALPHA',
    temporal_coordinates: createTemporalStamp({
      t_event: -20,
      t_observed: -19,
      t_admitted: -17,
      t_available: -17,
    }),
  }));

  const permutationInvarianceAudit = {};
  for (const pol of PRIMARY_POLICIES) {
    let refProbs = null;
    let maxAbsProbDiff = 0;
    const distinctTopSlots = new Set();

    for (const perm of all24Perms) {
      const permutedClaims = baseMatchedClaims.map((c, idx) => ({
        ...c,
        source_standing: perm[idx],
      }));
      const { logPrior } = computeHistoricalLogPrior({
        policyId: pol,
        historicalClaims: permutedClaims,
        tDecision: 1,
        currentContextEstimate: 'REGIME_SIG_ALPHA',
      });
      const probs = softmaxFromLogScores(logPrior);
      const topSlot = SLOT_IDS.reduce((best, s) => (probs[s] > probs[best] ? s : best), SLOT_IDS[0]);
      distinctTopSlots.add(topSlot);

      if (!refProbs) {
        refProbs = probs;
      } else {
        for (const s of SLOT_IDS) {
          maxAbsProbDiff = Math.max(maxAbsProbDiff, Math.abs(probs[s] - refProbs[s]));
        }
      }
    }

    permutationInvarianceAudit[pol] = {
      permutations_evaluated: all24Perms.length,
      max_abs_posterior_shift_across_24_standing_permutations: round4(maxAbsProbDiff),
      exact_standing_invariance_verified: maxAbsProbDiff < 1e-12,
      distinct_induced_map_slots: distinctTopSlots.size,
    };
  }

  return {
    schema: 'td613.accident-of-inheritance.source-standing-factorial-receipt/v1.0',
    classification: 'AUXILIARY_RANDOMIZED_SYNTHETIC_FACTORIAL_ANALYSIS',
    covenant: 'Khona‌lit-po',
    authorization_ref: 'SAC[X6ZNK5NO51]',
    master_seed: masterSeed,
    n_worlds: totalWorlds,
    n_clusters: totalWorlds / 4,
    evaluated_grid_cell: focalGridCell,
    content_byte_identity_verified_worlds: contentByteIdentityVerifiedCount,
    vault_access_ledger: { ...suite.vaultLedger },
    synthetic_attribution_boundary:
      'Interpreted strictly within the randomized synthetic assignment procedure. Source labels are formal institutional-role treatments and never represent real-world demographic or social groups.',
    policy_standing_contrasts: policyStandingContrasts,
    exact_24_standing_permutation_audit: permutationInvarianceAudit,
  };
}
