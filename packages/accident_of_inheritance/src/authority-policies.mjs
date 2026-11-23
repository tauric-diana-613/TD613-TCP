/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Common Bayesian Inference Engine, Four Epistemic Authority Civilizations &
 * Three Noncompeting Reference Controls
 *
 * Primary Conditions (Byte-Identical Permissible History, Common Engine, Matched Budgets):
 *   - A_MONUMENTALISTS      : Authority through inherited institutional standing
 *   - B_EVIDENTIALISTS      : Authority through empirical calibration & reproducibility
 *   - C_PROVISIONALISTS     : Low initial commitment, rapid recency-weighted revision
 *   - D_TEMPORAL_CUSTODIANS : Calibration + age + admission-lag + observable regime conditioning + CUSUM
 *
 * Noncompeting Reference Controls:
 *   - CTRL_NO_HISTORY       : Identical inference engine with historical archive withheld
 *   - CTRL_RANDOM           : Uniform random probe and consequential intervention baseline
 *   - CTRL_DYNAMIC_ORACLE   : Exhaustively verified dynamic upper bound (evaluated in evaluator-and-stats.mjs)
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { DeterministicRng, round4 } from './prng.mjs';
import { SLOT_IDS, PROBE_IDS, ACTION_IDS } from './world-generator.mjs';
import { assertPacketContainsNoSecrets } from './temporal-lattice.mjs';

export const PRIMARY_POLICIES = Object.freeze([
  'A_MONUMENTALISTS',
  'B_EVIDENTIALISTS',
  'C_PROVISIONALISTS',
  'D_TEMPORAL_CUSTODIANS',
]);

export const REFERENCE_CONTROLS = Object.freeze([
  'CTRL_NO_HISTORY',
  'CTRL_RANDOM',
  'CTRL_DYNAMIC_ORACLE',
]);

const STANDING_PRIOR_MULTIPLIERS = Object.freeze({
  FOUNDING_AUTHORITY: 2.40,
  ESTABLISHED_COUNCIL: 1.55,
  INDEPENDENT_AUDITOR: 0.55,
  JUNIOR_OR_CONTESTED: 0.25,
});

export function softmaxFromLogScores(logScoresObj) {
  const vals = SLOT_IDS.map(s => logScoresObj[s] ?? 0);
  const maxV = Math.max(...vals);
  const exps = vals.map(v => Math.exp(Math.max(-50, v - maxV)));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = {};
  SLOT_IDS.forEach((s, idx) => {
    probs[s] = exps[idx] / sum;
  });
  return probs;
}

export function shannonEntropyBits(probsObj) {
  let h = 0;
  for (const s of SLOT_IDS) {
    const p = probsObj[s] ?? 0;
    if (p > 1e-12) h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Common Gaussian observation log-likelihood model shared identically across ALL policies.
 */
export function computeObservationLogLikelihood(obsRecord, hypothesis) {
  if (obsRecord.obs_kind === 'AMBIENT_MONITOR') {
    const z = (obsRecord.scalar_value - hypothesis.ambient_mean) / hypothesis.ambient_sd;
    return -0.5 * z * z;
  }
  const mu = hypothesis.expected_probes[obsRecord.probe_id];
  const sd = hypothesis.probe_sd;
  const z = (obsRecord.scalar_value - mu) / sd;
  return -0.5 * z * z;
}

/**
 * Checks whether the public observation operator has full slot identifiability or an Aperture nullspace
 * (used for principled abstention when two distinct consequential-action classes have identical observation profiles).
 */
export function checkPublicObservationIdentifiability(candidateHypotheses) {
  for (let i = 0; i < candidateHypotheses.length; i++) {
    for (let j = i + 1; j < candidateHypotheses.length; j++) {
      const hi = candidateHypotheses[i];
      const hj = candidateHypotheses[j];
      const ambDiff = Math.abs(hi.ambient_mean - hj.ambient_mean);
      const maxProbeDiff = Math.max(
        ...PROBE_IDS.map(p => Math.abs(hi.expected_probes[p] - hj.expected_probes[p]))
      );
      const differentOptimalAction = hi.optimal_action_id !== hj.optimal_action_id;
      if (ambDiff < 1e-6 && maxProbeDiff < 1e-6 && differentOptimalAction) {
        return { globally_identifiable: false, indistinguishable_pair: [hi.slot_id, hj.slot_id] };
      }
    }
  }
  return { globally_identifiable: true, indistinguishable_pair: null };
}

/**
 * Computes historical log-prior scores over M_SLOT_0..M_SLOT_3 for policy `policyId` at tick `tDecision`.
 */
export function computeHistoricalLogPrior({
  policyId,
  historicalClaims,
  tDecision,
  currentContextEstimate = 'REGIME_SIG_ALPHA',
  authorityWeightScale = 1.0,
}) {
  const logPrior = { M_SLOT_0: 0, M_SLOT_1: 0, M_SLOT_2: 0, M_SLOT_3: 0 };
  if (policyId === 'CTRL_NO_HISTORY' || !historicalClaims || historicalClaims.length === 0) {
    return { logPrior, canonicalMonumentSlot: null };
  }

  for (const c of historicalClaims) {
    let w = 0;
    const cal = c.calibration_metrics;

    if (policyId === 'A_MONUMENTALISTS') {
      const prestige = STANDING_PRIOR_MULTIPLIERS[c.source_standing] ?? 0.5;
      w = 1.35 * authorityWeightScale * prestige;
    } else if (policyId === 'B_EVIDENTIALISTS') {
      // Strictly independent of c.source_standing!
      const calGate = cal.independently_calibrated ? 1.0 : 0.12;
      w =
        1.25 *
        authorityWeightScale *
        calGate *
        cal.measured_calibration_score *
        cal.measured_calibration_score *
        cal.reproducibility_pass_rate *
        (Math.log(1 + cal.sample_replicates) / 2.4);
    } else if (policyId === 'C_PROVISIONALISTS') {
      // Low initial commitment across all inherited claims
      w = 0.20 * authorityWeightScale * cal.measured_calibration_score;
    } else if (policyId === 'D_TEMPORAL_CUSTODIANS') {
      // Strictly independent of c.source_standing; incorporates calibration, age, admission lag, and observable regime tag
      const calGate = cal.independently_calibrated ? 1.0 : 0.10;
      const ageTicks = Math.max(0, tDecision - c.temporal_coordinates.t_observed);
      const ageFactor = Math.exp(-0.018 * ageTicks);
      const admLag = Math.max(
        0,
        c.temporal_coordinates.t_admitted - c.temporal_coordinates.t_observed
      );
      const admFactor = 1.0 / (1.0 + 0.06 * admLag);
      let regimeMatch = 0.55;
      if (c.conditioning_regime_tag === 'BASELINE_UNCALIBRATED') {
        regimeMatch = 0.08;
      } else if (c.conditioning_regime_tag === currentContextEstimate) {
        regimeMatch =
          currentContextEstimate === 'REGIME_SIG_BETA' ? 2.45 : 1.35;
      } else {
        // Dormant mismatch: suppressed while context differs, ready to reactivate if regime recurs!
        regimeMatch = 0.10;
      }
      w =
        1.20 *
        authorityWeightScale *
        calGate *
        cal.measured_calibration_score *
        cal.measured_calibration_score *
        cal.reproducibility_pass_rate *
        ageFactor *
        admFactor *
        regimeMatch;
    }

    for (const s of SLOT_IDS) {
      logPrior[s] += w * (c.log_likelihood_by_slot[s] ?? 0);
    }
  }

  let canonicalMonumentSlot = SLOT_IDS[0];
  let maxP = -Infinity;
  for (const s of SLOT_IDS) {
    if (logPrior[s] > maxP) {
      maxP = logPrior[s];
      canonicalMonumentSlot = s;
    }
  }

  return { logPrior, canonicalMonumentSlot };
}

/**
 * Selects optimal Expected Information Gain (EIG) diagnostic probe under current posterior `probs`
 * using equalized candidate evaluation across all 4 probes.
 */
function selectHighestEigProbe(candidateHypotheses, probs) {
  let bestProbe = PROBE_IDS[0];
  let bestScore = -Infinity;
  let evals = 0;

  for (const pId of PROBE_IDS) {
    evals += candidateHypotheses.length;
    // Compute expected posterior variance / pairwise KL separation across candidate hypotheses
    let meanMu = 0;
    for (const h of candidateHypotheses) {
      meanMu += probs[h.slot_id] * h.expected_probes[pId];
    }
    let betweenVar = 0;
    for (const h of candidateHypotheses) {
      const diff = h.expected_probes[pId] - meanMu;
      betweenVar += probs[h.slot_id] * diff * diff;
    }
    const noiseVar = candidateHypotheses[0].probe_sd * candidateHypotheses[0].probe_sd;
    const eigApprox = 0.5 * Math.log2(1.0 + betweenVar / noiseVar);
    if (eigApprox > bestScore) {
      bestScore = eigApprox;
      bestProbe = pId;
    }
  }
  return { bestProbe, evals };
}

/**
 * Selects Bayes-optimal consequential intervention maximizing E_P[V(a, m)] over ACTION_IDS.
 */
function selectBayesOptimalAction(candidateHypotheses, probs) {
  let bestAct = ACTION_IDS[0];
  let bestEU = -Infinity;
  let evals = 0;

  for (const aId of ACTION_IDS) {
    let eu = 0;
    for (const h of candidateHypotheses) {
      evals += 1;
      eu += probs[h.slot_id] * h.action_payoffs[aId];
    }
    if (eu > bestEU) {
      bestEU = eu;
      bestAct = aId;
    }
  }
  return { bestAct, bestEU, evals };
}

/**
 * Executes a complete multi-tick investigator episode (t = 1..horizonTicks) strictly through
 * `availabilityMembrane` with zero access to hidden state.
 */
export function runPolicyEpisode({
  policyId,
  publicPacket,
  availabilityMembrane,
  requestActiveProbeAtTick,
  observableContextAtTick,
  actionScheduleTicks,
  probeBudget = 6,
  horizonTicks = 24,
  episodeSeed,
  authorityWeightScale = 1.0,
}) {
  assertPacketContainsNoSecrets(publicPacket);
  const rng = new DeterministicRng(episodeSeed);
  const hyps = publicPacket.candidate_hypotheses;
  const identCheck = checkPublicObservationIdentifiability(hyps);
  const actionTickSet = new Set(actionScheduleTicks);

  let probesUsed = 0;
  let candidateEvaluations = 0;
  let archiveRecordsConsulted = 0;

  const beliefTrajectory = [];
  const probeActions = [];
  const consequentialDecisions = [];
  let residualCusum = 0;

  for (let t = 1; t <= horizonTicks; t++) {
    // 1. Query AvailabilityMembrane for all records lawfully available at t_decision = t
    const availableObs = availabilityMembrane.getAuthorizedRecordsAt(t, {
      onlyEpisodeObservations: true,
    });
    const availableHist =
      policyId === 'CTRL_NO_HISTORY' || policyId === 'CTRL_RANDOM'
        ? []
        : availabilityMembrane.getAuthorizedRecordsAt(t, {
            onlyEpisodeObservations: false,
          }).filter(r => r.record_kind === 'HISTORICAL_CLAIM');

    archiveRecordsConsulted = Math.max(archiveRecordsConsulted, availableHist.length);

    if (policyId === 'CTRL_RANDOM') {
      candidateEvaluations += hyps.length + PROBE_IDS.length + ACTION_IDS.length;
      if (probesUsed < probeBudget && rng.nextFloat() < 0.25) {
        const pId = rng.choice(PROBE_IDS);
        probesUsed += 1;
        requestActiveProbeAtTick(t, pId);
        probeActions.push({ t_decision: t, probe_id: pId });
      }
      const uniformProbs = { M_SLOT_0: 0.25, M_SLOT_1: 0.25, M_SLOT_2: 0.25, M_SLOT_3: 0.25 };
      beliefTrajectory.push({ tick: t, probs: uniformProbs, map_slot: SLOT_IDS[rng.nextInt(0, 4)] });
      if (actionTickSet.has(t)) {
        const chosenAct = rng.choice(ACTION_IDS);
        consequentialDecisions.push({
          t_decision: t,
          t_action: t,
          chosen_action_id: chosenAct,
          map_slot_at_decision: SLOT_IDS[rng.nextInt(0, 4)],
          stated_confidence: 0.25,
          available_obs_count: availableObs.length,
        });
      }
      continue;
    }

    // Estimate current observable context from latest available observations + current ambient tag
    const currentCtx = observableContextAtTick(t);
    let betaVotes = currentCtx === 'REGIME_SIG_BETA' ? 1.0 : 0.0;
    let totalVotes = 1.0;
    const recentObs = availableObs.slice(-3);
    for (const ro of recentObs) {
      totalVotes += 1.0;
      if (ro.observable_context_tag === 'REGIME_SIG_BETA') betaVotes += 1.0;
    }
    const smoothedContext = betaVotes / totalVotes >= 0.5 ? 'REGIME_SIG_BETA' : 'REGIME_SIG_ALPHA';

    // 2. Compute historical log-prior under policyId
    const { logPrior, canonicalMonumentSlot } = computeHistoricalLogPrior({
      policyId,
      historicalClaims: availableHist,
      tDecision: t,
      currentContextEstimate: smoothedContext,
      authorityWeightScale,
    });

    // Update observable prediction-error CUSUM strictly on observations newly becoming available at tick t!
    const newlyAvailableAtT = availableObs.filter(
      o => o.temporal_coordinates.t_available === t
    );
    if (newlyAvailableAtT.length > 0) {
      const prevTopSlot =
        beliefTrajectory.length > 0
          ? beliefTrajectory[beliefTrajectory.length - 1].map_slot
          : (canonicalMonumentSlot || 'M_SLOT_0');
      const prevHyp = hyps.find(h => h.slot_id === prevTopSlot) || hyps[0];
      for (const newObs of newlyAvailableAtT) {
        const llLatest = computeObservationLogLikelihood(newObs, prevHyp);
        const standardizedSurprise = Math.sqrt(Math.max(0, -2.0 * llLatest));
        residualCusum = Math.max(0, 0.78 * residualCusum + (standardizedSurprise - 1.25));
      }
    } else {
      residualCusum = 0.88 * residualCusum;
    }

    // Determine retention gamma for episode observations
    let gamma = 0.965;
    let obsWeightMultiplier = 1.0;
    if (policyId === 'A_MONUMENTALISTS') {
      gamma = 0.985;
      obsWeightMultiplier = 0.88;
    } else if (policyId === 'B_EVIDENTIALISTS') {
      gamma = 0.965;
      obsWeightMultiplier = 1.0;
    } else if (policyId === 'C_PROVISIONALISTS') {
      gamma = 0.66;
      obsWeightMultiplier = 1.35;
    } else if (policyId === 'D_TEMPORAL_CUSTODIANS') {
      // Adaptive memory contraction when observable residual CUSUM indicates regime shift
      gamma = residualCusum > 1.85 ? 0.65 : (residualCusum > 1.0 ? 0.82 : 0.95);
      obsWeightMultiplier = 1.06;
    } else if (policyId === 'CTRL_NO_HISTORY') {
      gamma = 0.94;
      obsWeightMultiplier = 1.0;
    }

    // 3. Accumulate log-likelihoods over lawfully available observations (equalized across all 4 hypotheses)
    const logPost = { ...logPrior };
    for (const obs of availableObs) {
      const age = Math.max(0, t - obs.temporal_coordinates.t_event);
      let ctxWeight = 1.0;
      if (
        policyId === 'D_TEMPORAL_CUSTODIANS' &&
        obs.observable_context_tag &&
        obs.observable_context_tag !== smoothedContext
      ) {
        ctxWeight = 0.30;
      }
      const wDecay = Math.pow(gamma, age) * obsWeightMultiplier * ctxWeight;
      for (const h of hyps) {
        candidateEvaluations += 1;
        logPost[h.slot_id] += wDecay * computeObservationLogLikelihood(obs, h);
      }
    }

    // Monumentalists revision gate: requires challenger log-evidence to overcome canonical inertia
    if (policyId === 'A_MONUMENTALISTS' && canonicalMonumentSlot) {
      const bestChallengerScore = Math.max(
        ...SLOT_IDS.filter(s => s !== canonicalMonumentSlot).map(s => logPost[s])
      );
      if (bestChallengerScore - logPost[canonicalMonumentSlot] < 3.40 * authorityWeightScale) {
        logPost[canonicalMonumentSlot] += 2.25 * authorityWeightScale;
      }
    }

    let probs = softmaxFromLogScores(logPost);
    let entropyBits = shannonEntropyBits(probs);

    // 4. Decide whether to deploy an active diagnostic probe at tick t (within matched probeBudget)
    // Equalized evaluation: always run selectHighestEigProbe so candidateEvaluations stay matched!
    const eigChoice = selectHighestEigProbe(hyps, probs);
    candidateEvaluations += eigChoice.evals;

    let shouldProbe = false;
    if (probesUsed < probeBudget) {
      if (policyId === 'A_MONUMENTALISTS') {
        shouldProbe = entropyBits > 0.82;
      } else if (policyId === 'B_EVIDENTIALISTS') {
        shouldProbe = entropyBits > 0.44 || (residualCusum > 1.65 && t % 2 === 1);
      } else if (policyId === 'C_PROVISIONALISTS') {
        // Eagerly probes on minor uncertainty or single-tick noise!
        shouldProbe = entropyBits > 0.16 || residualCusum > 0.35 || t <= 4;
      } else if (policyId === 'D_TEMPORAL_CUSTODIANS') {
        // Preserves >= 2 reserve probes for mid/late horizon unless high-CUSUM shift emergency triggers
        const reserveFloor = t <= 10 ? 2 : 0;
        if (probesUsed < probeBudget - reserveFloor) {
          shouldProbe = entropyBits > 0.45 || residualCusum > 1.25;
        } else {
          shouldProbe = residualCusum > 1.75 || (t >= 14 && entropyBits > 0.50);
        }
      } else if (policyId === 'CTRL_NO_HISTORY') {
        shouldProbe = entropyBits > 0.38 || t <= 2;
      }
    }

    if (shouldProbe) {
      probesUsed += 1;
      requestActiveProbeAtTick(t, eigChoice.bestProbe);
      probeActions.push({ t_decision: t, probe_id: eigChoice.bestProbe });

      // If infrastructure delay tau0 === 0, the newly acquired probe observation is immediately available at t_decision = t!
      const refreshedObs = availabilityMembrane.getAuthorizedRecordsAt(t, {
        onlyEpisodeObservations: true,
      });
      if (refreshedObs.length > availableObs.length) {
        const newest = refreshedObs[refreshedObs.length - 1];
        for (const h of hyps) {
          candidateEvaluations += 1;
          logPost[h.slot_id] += obsWeightMultiplier * computeObservationLogLikelihood(newest, h);
        }
        probs = softmaxFromLogScores(logPost);
        entropyBits = shannonEntropyBits(probs);
      }
    }

    // 5. Evaluate Bayes-optimal consequential intervention (equalized across all policies)
    const actChoice = selectBayesOptimalAction(hyps, probs);
    candidateEvaluations += actChoice.evals;

    let mapSlot = SLOT_IDS[0];
    let mapProb = -1;
    for (const s of SLOT_IDS) {
      if (probs[s] > mapProb) {
        mapProb = probs[s];
        mapSlot = s;
      }
    }

    beliefTrajectory.push({
      tick: t,
      probs: {
        M_SLOT_0: round4(probs.M_SLOT_0),
        M_SLOT_1: round4(probs.M_SLOT_1),
        M_SLOT_2: round4(probs.M_SLOT_2),
        M_SLOT_3: round4(probs.M_SLOT_3),
      },
      map_slot: mapSlot,
      entropy_bits: round4(entropyBits),
      cusum_surprise: round4(residualCusum),
    });

    if (actionTickSet.has(t)) {
      const chosenAction = !identCheck.globally_identifiable ? 'ACT_SAFE_HEDGE' : actChoice.bestAct;
      consequentialDecisions.push({
        t_decision: t,
        t_action: t,
        chosen_action_id: chosenAction,
        map_slot_at_decision: !identCheck.globally_identifiable ? 'ABSTAIN_UNIDENTIFIABLE' : mapSlot,
        stated_confidence: !identCheck.globally_identifiable ? 0.50 : round4(mapProb),
        available_obs_count: availabilityMembrane.getAuthorizedRecordsAt(t, {
          onlyEpisodeObservations: true,
        }).length,
      });
    }
  }

  const finalBelief = beliefTrajectory[beliefTrajectory.length - 1];
  const terminalDeclared = !identCheck.globally_identifiable
    ? 'ABSTAIN_UNIDENTIFIABLE'
    : finalBelief.map_slot;
  const terminalHypIdx = SLOT_IDS.indexOf(finalBelief.map_slot);
  const terminalConf = !identCheck.globally_identifiable
    ? 0.50
    : finalBelief.probs[finalBelief.map_slot];

  const holdoutPredictions = publicPacket.holdout_queries.map(q =>
    (q.input_phase + Math.max(0, terminalHypIdx) + q.regime_probe) % 2
  );

  return {
    policy_id: policyId,
    probes_used: probesUsed,
    probe_budget: probeBudget,
    probe_actions: probeActions,
    consequential_decisions: consequentialDecisions,
    terminal_declared_slot_or_abstain: terminalDeclared,
    terminal_stated_confidence: round4(terminalConf),
    holdout_predictions: holdoutPredictions,
    belief_trajectory: beliefTrajectory,
    candidate_evaluations: candidateEvaluations,
    archive_records_consulted: archiveRecordsConsulted,
    non_retroactivity_checks: availabilityMembrane.non_retroactivity_checks,
    withheld_future_records_count: availabilityMembrane.withheld_future_records_count,
  };
}
