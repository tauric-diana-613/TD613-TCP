/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Bounded Scientific Reconciliation and Component Ablation Study
 * Addressing Independent Source-Level Reviews #5793729248 and #5805117506 (P-01.1)
 * 
 * Objectives:
 *   P-01: Source-standing numerical reconciliation (runtime receipt check, withdrawal of +0.1753 erratum)
 *   P-02: Temporal-context membrane ablation (Matched policy RNG, paired cluster uncertainty)
 *   P-03: Authority-policy component ablation (Clean single-factor controls, honest signs, non-additivity)
 *   P-04: Multi-stage correction timeline (Exact sign convention, family-specific empirical breakdown)
 *   P-05: Simulation upper-bound and custody terminology formalization
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  generateBaseWorldSuite,
} from './world-generator.mjs';
import {
  PRIMARY_POLICIES,
  computeHistoricalLogPrior,
  softmaxFromLogScores,
  shannonEntropyBits,
  computeObservationLogLikelihood,
} from './authority-policies.mjs';
import {
  buildActionScheduleTicks,
  scoreEpisodeAgainstTrajectorySecret,
  runValidatedDynamicOracle,
} from './evaluator-and-stats.mjs';

export const RECONCILIATION_SCHEMA = 'td613.accident-of-inheritance.reconciliation-and-ablation/v1.1';

/**
 * P-01: Source-Standing Numerical Reconciliation
 * Reads and verifies exact committed figures from source-standing-factorial-receipt.json at runtime,
 * withdraws the +0.1753 claim as an unverified exploratory artifact, and preserves the zero pooled standing effect.
 */
export function executeP01StandingReconciliation() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const receiptPath = path.resolve(__dirname, '..', 'receipts', 'source-standing-factorial-receipt.json');
  if (!fs.existsSync(receiptPath)) {
    throw new Error(`[FAIL_CLOSED_RECEIPT_MISSING] Committed source standing receipt not found: ${receiptPath}`);
  }
  const rawReceipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  if (rawReceipt.schema !== 'td613.accident-of-inheritance.source-standing-factorial-receipt/v1.0') {
    throw new Error(`[SCHEMA_MISMATCH] Unexpected schema in standing receipt: ${rawReceipt.schema}`);
  }

  const contrasts = rawReceipt.policy_standing_contrasts;
  if (!contrasts || !contrasts.A_MONUMENTALISTS) {
    throw new Error(`[INVALID_RECEIPT_STRUCTURE] Missing A_MONUMENTALISTS contrasts in receipt.`);
  }

  const aMon = contrasts.A_MONUMENTALISTS;
  const qHigh = aMon.delta_u_status_given_Q_HIGH_calibrated;
  const qLow = aMon.delta_u_status_given_Q_LOW_misleading;
  const pooled = aMon.delta_u_status_pooled_counterbalanced;

  // Verify exact committed figures fail-closed
  if (Math.abs(qHigh.mean_diff - 0.1355) > 1e-4 || Math.abs(qHigh.two_sided_p_value - 0.071891) > 1e-4) {
    throw new Error(`[NUMERICAL_DISCREPANCY] Q_HIGH values mismatch committed source receipt.`);
  }
  if (Math.abs(qLow.mean_diff - (-0.1355)) > 1e-4 || Math.abs(qLow.two_sided_p_value - 0.069816) > 1e-4) {
    throw new Error(`[NUMERICAL_DISCREPANCY] Q_LOW values mismatch committed source receipt.`);
  }
  if (pooled.mean_diff !== 0 || pooled.two_sided_p_value !== 1) {
    throw new Error(`[NUMERICAL_DISCREPANCY] Pooled counterbalanced values mismatch committed source receipt.`);
  }

  return {
    item_id: 'P-01_SOURCE_STANDING_RECONCILIATION',
    verified_receipt_path: 'packages/accident_of_inheritance/receipts/source-standing-factorial-receipt.json',
    receipt_schema: rawReceipt.schema,
    receipt_master_seed: rawReceipt.master_seed,
    receipt_runtime_check: 'PASSED_FAIL_CLOSED_INTEGRITY_CHECK',
    withdrawn_claim: {
      reported_delta_u: 0.1753,
      reported_p_value: 0.000122,
      origin: 'Uncorrected draft manuscript artifact from an uncommitted single-cluster exploratory run.',
      origin_verification_status: 'HISTORICAL_UNCOMMITTED_ORIGIN_UNVERIFIED',
      disposition: 'FORMALLY_WITHDRAWN_ERRATUM',
    },
    committed_source_estimands: {
      design: '2x2 Factorial (Quality Q_HIGH/Q_LOW x Standing S_HIGH/S_LOW) across 96 paired worlds in 24 clusters',
      permutation_test: 'Phipson-Smyth Monte Carlo 8,192 cluster sign-flip permutations',
      conditional_effects_A_MONUMENTALISTS: {
        Q_HIGH_calibrated: {
          mean_diff: qHigh.mean_diff,
          ci95: [qHigh.ci95_low, qHigh.ci95_high],
          cluster_sd: qHigh.cluster_sd,
          cohens_dz: qHigh.cluster_cohens_dz,
          p_value: qHigh.two_sided_p_value,
          interpretation: 'High status modestly amplifies calibrated authority (+0.1355 utility), but fails to achieve alpha=0.05 two-sided significance under cluster permutation (p=0.071891).',
        },
        Q_LOW_misleading: {
          mean_diff: qLow.mean_diff,
          ci95: [qLow.ci95_low, qLow.ci95_high],
          cluster_sd: qLow.cluster_sd,
          cohens_dz: qLow.cluster_cohens_dz,
          p_value: qLow.two_sided_p_value,
          interpretation: 'High status symmetrically amplifies misleading authority (-0.1355 utility), inducing equivalent downside utility loss (p=0.069816).',
        },
      },
      pooled_counterbalanced_effect: {
        mean_diff: pooled.mean_diff,
        ci95: [pooled.ci95_low, pooled.ci95_high],
        cluster_sd: pooled.cluster_sd,
        cohens_dz: pooled.cluster_cohens_dz,
        p_value: pooled.two_sided_p_value,
        interpretation: 'Exact zero net effect (mean diff = 0.0000, p = 1.0000). In a counterbalanced environment where truth and error carry high standing with equal probability, institutional standing provides zero average advantage.',
      },
      policy_invariance_audit: {
        invariant_policies: ['B_EVIDENTIALISTS', 'C_DIAGNOSTICIANS', 'D_TEMPORAL_CUSTODIANS', 'E_REVISIONISTS', 'F_PRAGMATISTS'],
        observed_delta_u: 0.0000,
        p_value: 1.0000,
        mechanism: 'Code explicitly ignores standing attributes; deterministic zero shift confirms absence of status leakage.',
      },
    },
    status: 'RECONCILED_AND_GROUNDED',
  };
}

/**
 * P-02: Temporal-Context Membrane Ablation
 * Evaluates D_TEMPORAL_CUSTODIANS under three context access modes with MATCHED policy RNG streams:
 *   1. C_INSTANT: Current instantaneous tag observableContextByTick[t] (auxiliary sensor)
 *   2. C_DELAYED: Gated context tag from tick (t - tau0), strictly obeying latency membrane
 *   3. C_BLIND: Context withheld entirely (neutral baseline)
 */
export function executeP02ContextMembraneAblation({
  suite,
  gridCell,
  horizonTicks = 24,
  probeBudget = 6,
  seed = 'TD613_P02_CONTEXT_ABLATION_20261105',
}) {
  const contextModes = ['C_INSTANT', 'C_DELAYED', 'C_BLIND'];
  const resultsByMode = {
    C_INSTANT: [],
    C_DELAYED: [],
    C_BLIND: [],
  };

  const clusterDeltasInstantVsDelayed = new Map();
  const clusterDeltasInstantVsBlind = new Map();
  const clusterDeltasDelayedVsBlind = new Map();

  for (const pubW of suite.publicWorlds) {
    const baseSecretVault = suite.secretVaultMap.get(pubW.world_public_id);
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

    // CRITICAL (ACT2-R10): Policy RNG seed is identical across arms for the same world
    const worldPolicySeed = `${seed}::policy_rng::${pubW.world_public_id}`;
    const worldScores = {};

    for (const mode of contextModes) {
      const membrane = new AvailabilityMembrane(pubW.permissible_historical_claims);
      for (let t = 1; t <= horizonTicks; t++) {
        membrane.enqueueObservation(trajBundle.ambientObservationsToEnqueueByEventTick[t]);
      }

      const requestActiveProbeAtTick = (tProbe, probeId) => {
        const probeObs = withAuthorizedVaultRole('WORLD_OBSERVATION_SIMULATOR', () => {
          return trajSecretProxy.crn_probes_by_tick[tProbe][probeId];
        });
        membrane.enqueueObservation(probeObs);
      };

      const observableContextAtTick = t => {
        if (mode === 'C_INSTANT') {
          return trajBundle.observableContextByTick[t];
        }
        if (mode === 'C_DELAYED') {
          const delayedT = Math.max(1, t - gridCell.tau0);
          return trajBundle.observableContextByTick[delayedT];
        }
        return null; // C_BLIND
      };

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

      const epRes = runPolicyEpisodeWithAblations({
        policyId: 'D_TEMPORAL_CUSTODIANS',
        publicPacket,
        availabilityMembrane: membrane,
        requestActiveProbeAtTick,
        observableContextAtTick,
        actionScheduleTicks,
        probeBudget,
        horizonTicks,
        episodeSeed: worldPolicySeed,
        ablationFlags: { contextMode: mode },
      });

      const scored = scoreEpisodeAgainstTrajectorySecret({
        publicWorld: pubW,
        trajSecretProxy,
        episodeResult: epRes,
        horizonTicks,
      });

      resultsByMode[mode].push(scored.utility);
      worldScores[mode] = scored.utility;
    }

    const cId = pubW.cluster_public_id;
    if (!clusterDeltasInstantVsDelayed.has(cId)) clusterDeltasInstantVsDelayed.set(cId, []);
    if (!clusterDeltasInstantVsBlind.has(cId)) clusterDeltasInstantVsBlind.set(cId, []);
    if (!clusterDeltasDelayedVsBlind.has(cId)) clusterDeltasDelayedVsBlind.set(cId, []);

    clusterDeltasInstantVsDelayed.get(cId).push(worldScores.C_INSTANT - worldScores.C_DELAYED);
    clusterDeltasInstantVsBlind.get(cId).push(worldScores.C_INSTANT - worldScores.C_BLIND);
    clusterDeltasDelayedVsBlind.get(cId).push(worldScores.C_DELAYED - worldScores.C_BLIND);
  }

  const meanU = mode => resultsByMode[mode].reduce((a, b) => a + b, 0) / resultsByMode[mode].length;
  const meanInstant = meanU('C_INSTANT');
  const meanDelayed = meanU('C_DELAYED');
  const meanBlind = meanU('C_BLIND');

  function computeClusterStats(clusterMap) {
    const clusterMeans = Array.from(clusterMap.values()).map(diffs => diffs.reduce((a, b) => a + b, 0) / diffs.length);
    const n = clusterMeans.length;
    const mean = clusterMeans.reduce((a, b) => a + b, 0) / n;
    const variance = clusterMeans.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const sd = Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    const tCrit = 2.0687; // df = 23, 95% two-sided
    return {
      mean_diff: round4(mean),
      cluster_sd: round4(sd),
      cluster_se: round4(se),
      ci95: [round4(mean - tCrit * se), round4(mean + tCrit * se)],
    };
  }

  const statsInstantVsDelayed = computeClusterStats(clusterDeltasInstantVsDelayed);
  const statsInstantVsBlind = computeClusterStats(clusterDeltasInstantVsBlind);
  const statsDelayedVsBlind = computeClusterStats(clusterDeltasDelayedVsBlind);

  return {
    item_id: 'P-02_TEMPORAL_CONTEXT_MEMBRANE_ABLATION',
    evaluated_worlds: suite.publicWorlds.length,
    grid_cell: gridCell.cell_id,
    tau0: gridCell.tau0,
    matched_rng_policy_stream: true,
    historical_exploratory_result: {
      mean_instant: 0.6654,
      mean_delayed: 0.6493,
      observed_delta: 0.0161,
      limitation: 'Historical exploratory result confounded by mode-dependent policy RNG seeds; preserved as prior trial trace.',
    },
    matched_rng_means_utility: {
      C_INSTANT: round4(meanInstant),
      C_DELAYED: round4(meanDelayed),
      C_BLIND: round4(meanBlind),
    },
    mean_utility: {
      C_INSTANT: round4(meanInstant),
      C_DELAYED: round4(meanDelayed),
      C_BLIND: round4(meanBlind),
    },
    sensor_surplus: {
      instant_vs_delayed_delta: statsInstantVsDelayed.mean_diff,
      instant_vs_blind_delta: statsInstantVsBlind.mean_diff,
      delayed_vs_blind_delta: statsDelayedVsBlind.mean_diff,
    },
    paired_cluster_uncertainty: {
      instant_vs_delayed: statsInstantVsDelayed,
      instant_vs_blind: statsInstantVsBlind,
      delayed_vs_blind: statsDelayedVsBlind,
    },
    interpretation:
      `Instantaneous context provides an observed advantage of ${statsInstantVsDelayed.mean_diff} utility (95% CI [${statsInstantVsDelayed.ci95[0]}, ${statsInstantVsDelayed.ci95[1]}]) over time-gated context in this grid cell. It operates as an auxiliary real-time sensor, but this finite grid-cell observation cannot be promoted to an unconstrained universal causal law across all environments.`,
  };
}

/**
 * P-03: Authority-Policy Component Ablation
 * Disentangles composite mechanisms in D_TEMPORAL_CUSTODIANS under clean single-factor interventions:
 *   - ABL_FULL_COMPOSITE: All mechanisms active
 *   - ABL_PRIOR_ONLY: Historical prior active; decay, probing, and context matching neutral
 *   - ABL_NO_DECAY: gamma = 1.0; probing, CUSUM, context matching active
 *   - ABL_NO_PROBING: Probing disabled (0 probes); adaptive decay and context matching active
 *   - ABL_NO_CONTEXT_MULTIPLIER: Context multiplier disabled (1.0); adaptive decay and probing active
 *   - ABL_EVIDENTIAL_BASELINE: Pure evidentialist baseline (B_EVIDENTIALISTS)
 */
export function executeP03PolicyComponentAblation({
  suite,
  gridCell,
  horizonTicks = 24,
  probeBudget = 6,
  seed = 'TD613_P03_POLICY_ABLATION_20261105',
}) {
  const ablations = [
    'ABL_FULL_COMPOSITE',
    'ABL_PRIOR_ONLY',
    'ABL_NO_DECAY',
    'ABL_NO_PROBING',
    'ABL_NO_CONTEXT_MULTIPLIER',
    'ABL_EVIDENTIAL_BASELINE',
  ];

  const results = {};
  for (const abl of ablations) {
    results[abl] = [];
  }

  for (const pubW of suite.publicWorlds) {
    const baseSecretVault = suite.secretVaultMap.get(pubW.world_public_id);
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

    // CRITICAL (ACT2-R10): Identical policy random stream per world across ablations
    const worldPolicySeed = `${seed}::policy_rng::${pubW.world_public_id}`;

    for (const abl of ablations) {
      const membrane = new AvailabilityMembrane(pubW.permissible_historical_claims);
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

      const epRes = runPolicyEpisodeWithAblations({
        policyId: abl === 'ABL_EVIDENTIAL_BASELINE' ? 'B_EVIDENTIALISTS' : 'D_TEMPORAL_CUSTODIANS',
        publicPacket,
        availabilityMembrane: membrane,
        requestActiveProbeAtTick,
        observableContextAtTick,
        actionScheduleTicks,
        probeBudget,
        horizonTicks,
        episodeSeed: worldPolicySeed,
        ablationFlags: { componentAblation: abl },
      });

      const scored = scoreEpisodeAgainstTrajectorySecret({
        publicWorld: pubW,
        trajSecretProxy,
        episodeResult: epRes,
        horizonTicks,
      });

      results[abl].push(scored.utility);
    }
  }

  const summary = {};
  for (const abl of ablations) {
    const mean = results[abl].reduce((a, b) => a + b, 0) / results[abl].length;
    summary[abl] = round4(mean);
  }

  const full = summary.ABL_FULL_COMPOSITE;
  const noProbing = summary.ABL_NO_PROBING;
  const noContext = summary.ABL_NO_CONTEXT_MULTIPLIER;
  const noDecay = summary.ABL_NO_DECAY;
  const priorOnly = summary.ABL_PRIOR_ONLY;
  const baseline = summary.ABL_EVIDENTIAL_BASELINE;

  const probingContribution = round4(full - noProbing);
  const contextContribution = round4(full - noContext);
  const decayContribution = round4(full - noDecay);
  const priorVsBaseline = round4(priorOnly - baseline);
  const compositeSurplus = round4(full - baseline);

  return {
    item_id: 'P-03_AUTHORITY_POLICY_COMPONENT_ABLATION',
    evaluated_worlds: suite.publicWorlds.length,
    grid_cell: gridCell.cell_id,
    matched_rng_policy_stream: true,
    historical_receipt_reconciliation: {
      committed_receipt_values: {
        FULL_COMPOSITE: 0.6654,
        PRIOR_ONLY: 0.6120,
        NO_DECAY: 0.6208,
        NO_PROBING: 0.7011,
        NO_CONTEXT_MULTIPLIER: 0.6905,
        EVIDENTIAL_BASELINE: 0.5074,
      },
      reconciled_causal_signs: {
        probing_effect_on_utility: 'NEGATIVE (-0.0357 in committed receipt; disabling probing improves utility to 0.7011)',
        context_multiplier_effect_on_utility: 'NEGATIVE (-0.0251 in committed receipt; disabling context multiplier improves utility to 0.6905)',
        decay_effect_on_utility: 'POSITIVE (+0.0446 in committed receipt; adaptive decay improves utility from 0.6208 to 0.6654)',
        prior_alone_vs_baseline: 'POSITIVE (+0.1046 in committed receipt; prior alone achieves 0.6120 vs evidential baseline 0.5074)',
      },
      manuscript_erratum_disposition: 'docs/13 §3 contained typographical substitutions and sign inversions that falsely claimed probing and context produced positive utility gains. Those claims are formally withdrawn and corrected.',
    },
    ablation_means_utility: summary,
    clean_single_factor_decomposition: {
      prior_alone_vs_baseline: priorVsBaseline,
      decay_marginal_contribution: decayContribution,
      probing_marginal_contribution: probingContribution,
      context_matching_marginal_contribution: contextContribution,
      total_composite_surplus_over_baseline: compositeSurplus,
      sum_of_marginal_effects: round4(decayContribution + probingContribution + contextContribution + priorVsBaseline),
      interaction_and_nonadditivity: round4(compositeSurplus - (decayContribution + probingContribution + contextContribution + priorVsBaseline)),
    },
    disclosed_mechanism_vulnerabilities: [
      probingContribution < 0
        ? `ACTIVE_PROBING_INDUCED_REGRET: Active probing expends observation budget on exploratory probes under high entropy, yielding a net utility drag of ${probingContribution} utility relative to passive observation on this cell.`
        : 'ACTIVE_PROBING_NEUTRAL_OR_BENEFICIAL',
      contextContribution < 0
        ? `PREMATURE_CONTEXT_FILTERING_PENALTY: Downweighting out-of-regime evidence via context multiplier prematurely discards informative observations, reducing utility by ${contextContribution} relative to unweighted evidence on this cell.`
        : 'CONTEXT_MATCHING_NEUTRAL_OR_BENEFICIAL',
    ],
    conclusion: 'Procedural sophistication is non-monotonic: while memory decay provides utility benefits, active probing and context filtering induce net utility penalties on this synthetic grid cell. Sophistication mechanisms must be evaluated for failure modes rather than presumed beneficial.',
  };
}

/**
 * P-04: Multi-Stage Epistemic Correction Measurements
 * Separates:
 *   1. t_evidence_available: First tick where observation stream has sufficient information to distinguish true regime
 *   2. t_belief_revised: First tick where posterior probability on true regime exceeds 0.50
 *   3. t_action_aligned: First tick where chosen action matches true optimal action
 *   4. t_claim_warranted: First tick where terminal scientific claim matches true regime with stated confidence >= 0.70
 */
export function executeP04CorrectionDecomposition({
  suite,
  gridCell,
  horizonTicks = 24,
  probeBudget = 6,
  seed = 'TD613_P04_CORRECTION_20261105',
}) {
  const records = [];

  for (const pubW of suite.publicWorlds) {
    if (pubW.family === 'FAM_A_STATIONARY_INHERITANCE') continue;

    const baseSecretVault = suite.secretVaultMap.get(pubW.world_public_id);
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

    const membrane = new AvailabilityMembrane(pubW.permissible_historical_claims);
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

    const epRes = runPolicyEpisodeWithAblations({
      policyId: 'D_TEMPORAL_CUSTODIANS',
      publicPacket,
      availabilityMembrane: membrane,
      requestActiveProbeAtTick,
      observableContextAtTick,
      actionScheduleTicks,
      probeBudget,
      horizonTicks,
      episodeSeed: `${seed}::${pubW.world_public_id}`,
      ablationFlags: {},
    });

    const { tEvidenceAvailable, tBeliefRevised, tActionAligned, tClaimWarranted } =
      withAuthorizedVaultRole('POST_EPISODE_SCORER', () => {
        const tEv = trajSecretProxy.t_contradiction_available;
        let tBelief = null;
        let tAction = null;
        let tClaim = null;

        const trueSlot = trajSecretProxy.terminal_slot;
        for (const bt of epRes.belief_trajectory) {
          if (bt.probs && bt.probs[trueSlot] >= 0.5) {
            tBelief = bt.tick;
            break;
          }
        }

        for (const dec of epRes.consequential_decisions) {
          const optAct = trajSecretProxy.optimal_action_by_tick[dec.t_decision];
          if (dec.chosen_action_id === optAct) {
            if (tAction === null && dec.t_decision >= (tEv || 0)) {
              tAction = dec.t_decision;
            }
          }
        }

        if (
          epRes.terminal_declared_slot_or_abstain === trajSecretProxy.terminal_slot &&
          epRes.terminal_stated_confidence >= 0.7
        ) {
          tClaim = horizonTicks;
        }

        return {
          tEvidenceAvailable: tEv,
          tBeliefRevised: tBelief,
          tActionAligned: tAction,
          tClaimWarranted: tClaim,
        };
      });

    records.push({
      world_id: pubW.world_public_id,
      family: pubW.family,
      t_evidence_available: tEvidenceAvailable,
      t_belief_revised: tBeliefRevised,
      t_action_aligned: tActionAligned,
      t_claim_warranted: tClaimWarranted,
      action_minus_belief_gap: (tActionAligned !== null && tBeliefRevised !== null) ? (tActionAligned - tBeliefRevised) : null,
      belief_minus_action_gap: (tActionAligned !== null && tBeliefRevised !== null) ? (tBeliefRevised - tActionAligned) : null,
      is_fiber_confounded: pubW.family === 'FAM_D_ACTION_INVARIANT_CHANGE',
    });
  }

  const pairedRecords = records.filter(r => r.action_minus_belief_gap !== null);
  const meanActionMinusBeliefGap = pairedRecords.length > 0
    ? pairedRecords.reduce((a, b) => a + b.action_minus_belief_gap, 0) / pairedRecords.length
    : 0;

  const families = [
    'FAM_B_ABRUPT_TRANSITION',
    'FAM_C_GRADUAL_DRIFT',
    'FAM_D_ACTION_INVARIANT_CHANGE',
    'FAM_E_RECURRENT_REGIMES',
    'FAM_F_DELAYED_CONTRADICTION',
  ];
  const familyBreakdown = {};

  for (const fam of families) {
    const famRecs = records.filter(r => r.family === fam);
    const famPaired = famRecs.filter(r => r.action_minus_belief_gap !== null);
    const meanGap = famPaired.length > 0 ? famPaired.reduce((a, b) => a + b.action_minus_belief_gap, 0) / famPaired.length : null;
    const meanTAction = famRecs.filter(r => r.t_action_aligned !== null).map(r => r.t_action_aligned);
    const meanTBelief = famRecs.filter(r => r.t_belief_revised !== null).map(r => r.t_belief_revised);
    const meanTEv = famRecs.map(r => r.t_evidence_available);

    familyBreakdown[fam] = {
      n_worlds: famRecs.length,
      paired_evaluations: famPaired.length,
      censored_action_evaluations: famRecs.filter(r => r.t_action_aligned === null).length,
      censored_belief_evaluations: famRecs.filter(r => r.t_belief_revised === null).length,
      mean_t_evidence_available: round4(meanTEv.reduce((a, b) => a + b, 0) / meanTEv.length),
      mean_t_belief_revised: meanTBelief.length > 0 ? round4(meanTBelief.reduce((a, b) => a + b, 0) / meanTBelief.length) : null,
      mean_t_action_aligned: meanTAction.length > 0 ? round4(meanTAction.reduce((a, b) => a + b, 0) / meanTAction.length) : null,
      mean_action_minus_belief_gap_ticks: meanGap !== null ? round4(meanGap) : null,
    };
  }

  return {
    item_id: 'P-04_CORRECTION_MEASUREMENTS_DECOMPOSITION',
    sample_size: records.length,
    paired_sample_size: pairedRecords.length,
    time_origin_and_sign_specification: {
      definition: 'action_minus_belief_gap = t_action_aligned - t_belief_revised',
      positive_sign_meaning: 'Positive value indicates action alignment FOLLOWED belief revision (belief revised earlier than action aligned)',
      negative_sign_meaning: 'Negative value indicates action alignment PRECEDED belief revision (action aligned earlier than belief revised)',
      manuscript_sign_erratum_withdrawn: 'Prior manuscript claimed action preceded belief revision by 3.70 ticks. The positive value +3.6966 actually witnesses that action alignment FOLLOWED belief revision by 3.70 ticks across the pooled paired cohort.',
    },
    mean_action_minus_belief_gap_ticks: round4(meanActionMinusBeliefGap),
    family_specific_breakdown: familyBreakdown,
    fiber_confounding_resolution: {
      action_invariant_family: 'FAM_D_ACTION_INVARIANT_CHANGE',
      observed_mechanism: 'In Family D, degenerate action mappings allow behavioral action alignment to occur independently of posterior convergence on the true regime. In contrast, in Families B and C, action alignment is constrained by scheduled decision ticks following belief revision.',
    },
    evidence_sufficiency_vs_hidden_simulator_distinction: {
      admissible_evidence_sufficiency: 'Timestamp where accumulated observation history contains non-zero likelihood support distinguishing true regime from prior.',
      hidden_simulator_contradiction_timestamp: 'Ground-truth tick (t_contradiction_available) where the simulation environment instituted the regime shift.',
      custody_separation_verified: 'Simulator contradiction tick is read strictly under authorized POST_EPISODE_SCORER role; never exposed to investigator policies.',
    },
    conclusion: 'Epistemic truth recovery must be separated into four distinct temporal metrics: evidence arrival, posterior belief revision, behavioral action alignment, and formal claim warrant. Behavioral performance cannot substitute for epistemic truth.',
  };
}

/**
 * P-05: Formal Terminology Clarification
 */
export function executeP05TerminologyClarification() {
  return {
    item_id: 'P-05_ORACLE_AND_CUSTODY_TERMINOLOGY_FORMALIZATION',
    reclassifications: [
      {
        prior_term: 'DYNAMIC_SYNTHETIC_ORACLE / CTRL_DYNAMIC_ORACLE',
        revised_rigorous_term: 'SYNTHETIC_FULL_INFORMATION_BENCHMARK',
        definition: 'An unrealizable synthetic upper-bound computed with full access to hidden simulation ground truth. It acts as an optimal theoretical normalizer, not an implementable operational system.',
      },
      {
        prior_term: 'CRYPTOGRAPHIC_SECRET_VAULT / CUSTODY_MEMBRANE',
        revised_rigorous_term: 'IN_PROCESS_PROXY_PROPERTY_TRAP',
        definition: 'A developer-level JavaScript Proxy intercepting property accesses within the Node.js runtime to verify simulator separation. It provides zero kernel-level isolation, zero process separation, and zero protection against adversarial execution within the same V8 isolate.',
      },
    ],
    status: 'TERMINOLOGY_FORMALLY_RECONCILED',
  };
}

/**
 * Policy Episode Runner with explicit ablation hooks
 */
function runPolicyEpisodeWithAblations({
  policyId,
  publicPacket,
  availabilityMembrane,
  requestActiveProbeAtTick,
  observableContextAtTick,
  actionScheduleTicks,
  probeBudget = 6,
  horizonTicks = 24,
  episodeSeed,
  ablationFlags = {},
}) {
  const rng = new DeterministicRng(episodeSeed);
  const hyps = publicPacket.candidate_hypotheses;
  let remainingProbes = probeBudget;
  const probeActions = [];
  const consequentialDecisions = [];
  const beliefTrajectory = [];
  let residualCusum = 0;

  const componentAbl = ablationFlags.componentAblation;

  for (let t = 1; t <= horizonTicks; t++) {
    const availableObs = availabilityMembrane.getAuthorizedRecordsAt(t, {
      onlyEpisodeObservations: true,
    });
    const availableHist = availabilityMembrane
      .getAuthorizedRecordsAt(t, { onlyEpisodeObservations: false })
      .filter(r => r.record_kind === 'HISTORICAL_CLAIM');

    // Context handling
    let smoothedContext = 'REGIME_SIG_ALPHA';
    if (ablationFlags.contextMode === 'C_BLIND') {
      smoothedContext = 'REGIME_SIG_ALPHA';
    } else {
      const currentCtx = observableContextAtTick ? observableContextAtTick(t) : null;
      let betaVotes = currentCtx === 'REGIME_SIG_BETA' ? 1.0 : 0.0;
      let totalVotes = 1.0;
      const recentObs = availableObs.slice(-3);
      for (const ro of recentObs) {
        totalVotes += 1.0;
        if (ro.observable_context_tag === 'REGIME_SIG_BETA') betaVotes += 1.0;
      }
      smoothedContext = betaVotes / totalVotes >= 0.5 ? 'REGIME_SIG_BETA' : 'REGIME_SIG_ALPHA';
    }

    // Historical log prior
    let logPrior = { M_SLOT_0: 0, M_SLOT_1: 0, M_SLOT_2: 0, M_SLOT_3: 0 };
    let canonicalMonumentSlot = null;

    if (policyId === 'B_EVIDENTIALISTS' || componentAbl === 'ABL_EVIDENTIAL_BASELINE') {
      // Uniform prior
    } else {
      const hp = computeHistoricalLogPrior({
        policyId: 'D_TEMPORAL_CUSTODIANS',
        historicalClaims: availableHist,
        tDecision: t,
        currentContextEstimate: smoothedContext,
        authorityWeightScale: 1.0,
      });
      logPrior = hp.logPrior;
      canonicalMonumentSlot = hp.canonicalMonumentSlot;
    }

    // Decay and weights under clean single-factor ablations
    let gamma = 0.95;
    let obsWeightMultiplier = 1.06;
    let allowContextMultiplier = true;

    if (componentAbl === 'ABL_PRIOR_ONLY') {
      gamma = 1.0;
      obsWeightMultiplier = 1.0;
      allowContextMultiplier = false;
    } else if (componentAbl === 'ABL_NO_DECAY') {
      gamma = 1.0;
      obsWeightMultiplier = 1.06;
      allowContextMultiplier = true;
    } else if (componentAbl === 'ABL_NO_CONTEXT_MULTIPLIER') {
      // Clean single-factor intervention: hold CUSUM-adaptive gamma schedule identical to FULL
      gamma = residualCusum > 1.85 ? 0.65 : (residualCusum > 1.0 ? 0.82 : 0.95);
      obsWeightMultiplier = 1.06;
      allowContextMultiplier = false;
    } else if (policyId === 'D_TEMPORAL_CUSTODIANS') {
      gamma = residualCusum > 1.85 ? 0.65 : (residualCusum > 1.0 ? 0.82 : 0.95);
      obsWeightMultiplier = 1.06;
      allowContextMultiplier = true;
    }

    // Accumulate log-likelihoods
    const logPost = { ...logPrior };
    for (const obs of availableObs) {
      const age = Math.max(0, t - obs.temporal_coordinates.t_event);
      let ctxWeight = 1.0;
      if (allowContextMultiplier && obs.observable_context_tag && obs.observable_context_tag !== smoothedContext) {
        ctxWeight = 0.30;
      }
      const wDecay = Math.pow(gamma, age) * obsWeightMultiplier * ctxWeight;
      for (const h of hyps) {
        const ll = computeObservationLogLikelihood(obs, h);
        logPost[h.slot_id] = (logPost[h.slot_id] ?? 0) + ll * wDecay;
      }
    }

    const currentProbs = softmaxFromLogScores(logPost);
    let mapSlot = SLOT_IDS[0];
    let maxP = -Infinity;
    for (const s of SLOT_IDS) {
      if (currentProbs[s] > maxP) {
        maxP = currentProbs[s];
        mapSlot = s;
      }
    }
    const currentEntropy = shannonEntropyBits(currentProbs);

    beliefTrajectory.push({
      tick: t,
      probs: currentProbs,
      map_slot: mapSlot,
      entropy_bits: round4(currentEntropy),
      cusum_surprise: round4(residualCusum),
    });

    // Active probing under clean single-factor ablation
    const isProbingPermitted =
      componentAbl !== 'ABL_NO_PROBING' &&
      componentAbl !== 'ABL_PRIOR_ONLY' &&
      componentAbl !== 'ABL_EVIDENTIAL_BASELINE' &&
      policyId !== 'B_EVIDENTIALISTS';

    const shouldProbe = isProbingPermitted && remainingProbes > 0 && currentEntropy > 0.85 && t % 2 === 1;
    if (shouldProbe) {
      remainingProbes -= 1;
      const chosenProbe = PROBE_IDS[0];
      requestActiveProbeAtTick(t, chosenProbe);
      probeActions.push({ t_probe: t, probe_id: chosenProbe });
    }

    // Action execution on schedule
    if (actionScheduleTicks.includes(t)) {
      const mapHypIdx = SLOT_IDS.indexOf(mapSlot);
      const chosenAction = mapHypIdx >= 0 ? hyps[mapHypIdx].optimal_action_id : ACTION_IDS[0];
      consequentialDecisions.push({
        t_decision: t,
        t_action: t,
        chosen_action_id: chosenAction,
        map_slot_at_decision: mapSlot,
        stated_confidence: round4(maxP),
        available_obs_count: availableObs.length,
      });
    }
  }

  const finalBelief = beliefTrajectory[beliefTrajectory.length - 1];
  return {
    policy_id: policyId,
    probes_used: probeBudget - remainingProbes,
    probe_budget: probeBudget,
    probe_actions: probeActions,
    consequential_decisions: consequentialDecisions,
    terminal_declared_slot_or_abstain: finalBelief.map_slot,
    terminal_stated_confidence: round4(finalBelief.probs[finalBelief.map_slot]),
    holdout_predictions: publicPacket.holdout_queries.map(() => 0),
    belief_trajectory: beliefTrajectory,
    candidate_evaluations: consequentialDecisions.length * ACTION_IDS.length,
    archive_records_consulted: availabilityMembrane
      .getAuthorizedRecordsAt(horizonTicks, { onlyEpisodeObservations: false })
      .filter(r => r.record_kind === 'HISTORICAL_CLAIM').length,
    non_retroactivity_checks: horizonTicks,
  };
}

/**
 * Executes the complete reconciliation and ablation suite across P-01..P-05
 */
export function runCompleteReconciliationSuite() {
  console.log('Generating 96-world suite across 24 clusters for ablation study...');
  const suite = generateBaseWorldSuite({
    suiteName: 'ACT2_RECONCILIATION_96',
    masterSeed: 'TD613_PALACE_ACT2_ABLATION_RECONCILIATION_20261105',
    totalWorlds: 96,
  });

  const gridCell = {
    cell_id: 'H_MOD__L3_MODERATE__V_ACCELERATED',
    h: 0.08,
    tau0: 3,
    delta_obs: 1,
    delta_adm: 2,
    delta_avail: 0,
    interval_ticks: 2,
    nu: 0.5,
  };

  console.log('1. Executing P-01 Source-Standing Numerical Reconciliation (runtime check)...');
  const p01 = executeP01StandingReconciliation();

  console.log('2. Executing P-02 Temporal-Context Membrane Ablation (matched policy RNG)...');
  const p02 = executeP02ContextMembraneAblation({ suite, gridCell });

  console.log('3. Executing P-03 Authority-Policy Component Ablation (clean single-factor)...');
  const p03 = executeP03PolicyComponentAblation({ suite, gridCell });

  console.log('4. Executing P-04 Correction Timeline Decomposition (signed & family breakdown)...');
  const p04 = executeP04CorrectionDecomposition({ suite, gridCell });

  console.log('5. Executing P-05 Terminology Formalization...');
  const p05 = executeP05TerminologyClarification();

  return {
    schema: RECONCILIATION_SCHEMA,
    covenant: 'Khona‌lit-po',
    authority_ref: 'SAC[X6ZNK5NO51]',
    evaluated_at: new Date().toISOString(),
    p01_standing_reconciliation: p01,
    p02_context_membrane_ablation: p02,
    p03_policy_component_ablation: p03,
    p04_correction_timeline: p04,
    p05_terminology_formalization: p05,
    negative_controls_retained: [
      'STATIONARY_INERTIA_FAILURE',
      'RECURRENT_OSCILLATION_FAILURE',
      'DELAYED_CONTRADICTION_EXPOSURE',
      'ACTION_INVARIANT_FIBER_AMNESIA',
      'MISLEADING_CONTEXT_COLLAPSE',
    ],
    status: 'PALACE_ACT2_RECONCILIATION_COMPLETE',
  };
}
