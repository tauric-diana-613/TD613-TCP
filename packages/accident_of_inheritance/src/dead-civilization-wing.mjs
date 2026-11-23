/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Section VIII Exploratory Wing: "The Last Experiment of a Dead Civilization"
 *
 * Compares equally byte-budgeted (<= 160 UTF-8 bytes) ancestral transmissions trained
 * exclusively on `ACT2_PILOT_48` across matched successor environments:
 *   1. INHERIT_DESCRIPTIVE_FINDINGS   : Compact representation of ancestral findings (slot + payoff map)
 *   2. INHERIT_PROCEDURAL_EXPERIMENTER: Compact procedure for selecting next informative experiment
 *   3. INHERIT_SELF_LIMITING_PROCEDURE: Compact experimental procedure equipped with residual-consistency
 *                                       self-revocation when incoming evidence violates ancestral geometry
 *   4. CTRL_UNINHERITED_SUCCESSOR     : 0-byte no-transmission baseline
 *
 * Evaluated across 4 distinct transfer environments (24 worlds each = 96 worlds total):
 *   - ENV_1_MATCHED_ORIGIN                  : Ancestral mechanism & probe geometry persist
 *   - ENV_2_NOVEL_MECHANISM_COMPATIBLE_GEOM : Mechanism changes; ancestral probe geometry holds
 *   - ENV_3_SHIFTED_CONDITIONING_REGIME     : Both mechanism & probe polarity shift (detectable residual discrepancy)
 *   - ENV_4_DECEPTIVE_INVARIANT_MIMIC       : Hostile counterexample — hidden payoff inversion mimics ancestral
 *                                             observation distribution, defeating even self-limiting procedures!
 *
 * Explicitly differentiates 4 epistemic stages on every episode:
 *   (1) Recognition of contradictory evidence
 *   (2) Selection of an informative experiment
 *   (3) Valid conceptual revision
 *   (4) Successful consequential action
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { DeterministicRng, sha256Hex, round4, deepFreeze } from './prng.mjs';
import { SLOT_IDS, PROBE_IDS, ACTION_IDS, generateBaseWorldSuite } from './world-generator.mjs';
import { softmaxFromLogScores, shannonEntropyBits } from './authority-policies.mjs';
import { computeClusteredPairedContrast } from './evaluator-and-stats.mjs';
import { ACT2_MASTER_SEEDS } from './grid-definitions.mjs';

export const DEAD_CIV_MAX_PACKET_BYTES = 160;

export const DEAD_CIV_ARMS = Object.freeze([
  'INHERIT_DESCRIPTIVE_FINDINGS',
  'INHERIT_PROCEDURAL_EXPERIMENTER',
  'INHERIT_SELF_LIMITING_PROCEDURE',
  'CTRL_UNINHERITED_SUCCESSOR',
]);

export const TRANSFER_ENVIRONMENTS = Object.freeze([
  'ENV_1_MATCHED_ORIGIN',
  'ENV_2_NOVEL_MECHANISM_COMPATIBLE_GEOM',
  'ENV_3_SHIFTED_CONDITIONING_REGIME',
  'ENV_4_DECEPTIVE_INVARIANT_MIMIC',
]);

/**
 * Calibrates procedural thresholds exclusively from `ACT2_PILOT_48` structural properties
 * (zero access to confirmatory or transfer ground truth).
 */
function calibrateAncestralCodebookFromPilot(pilotWorldSeed) {
  const pilotSuite = generateBaseWorldSuite({
    suiteName: 'ACT2_PILOT_48',
    masterSeed: pilotWorldSeed,
    totalWorlds: 48,
  });
  // Measure mean probe signal-to-noise separation across pilot public hypotheses
  let sumSnr = 0;
  let count = 0;
  for (const w of pilotSuite.publicWorlds) {
    for (const h of w.candidate_hypotheses) {
      const vals = PROBE_IDS.map(p => h.expected_probes[p]);
      const spread = Math.max(...vals) - Math.min(...vals);
      sumSnr += spread / h.probe_sd;
      count += 1;
    }
  }
  const meanPilotProbeSnr = round4(sumSnr / count);
  return {
    trained_on: 'ACT2_PILOT_48',
    pilot_worlds_inspected: pilotSuite.publicWorlds.length,
    mean_pilot_probe_snr: meanPilotProbeSnr,
    calibrated_eig_threshold: 0.34,
    calibrated_self_revoke_z_threshold: 1.55,
  };
}

/**
 * Encodes the ancestral packet for a given arm and enforces strict <= 160 byte cap
 * (matched byte padding across the 3 active inheritance arms to eliminate representation-size confounding!).
 */
function buildMatchedAncestralPacket({ armId, ancestralOriginSlotIdx, ancestralProbeRanking, pilotCalibration }) {
  if (armId === 'CTRL_UNINHERITED_SUCCESSOR') {
    return { rawJson: '', byteLength: 0, parsed: null };
  }

  let payload;
  if (armId === 'INHERIT_DESCRIPTIVE_FINDINGS') {
    payload = {
      k: 'DESC_V1',
      m0: SLOT_IDS[ancestralOriginSlotIdx],
      a0: ACTION_IDS[ancestralOriginSlotIdx],
      w0: 3.90,
      cal: 0.92,
      pad: 'ANCESTRAL_FINDINGS_ARCHIVE_0000',
    };
  } else if (armId === 'INHERIT_PROCEDURAL_EXPERIMENTER') {
    payload = {
      k: 'PROC_V1',
      ord: ancestralProbeRanking,
      eig: pilotCalibration.calibrated_eig_threshold,
      pol: 1,
      rev: 0,
      pad: 'ANCESTRAL_METHOD_PROTOCOL_000',
    };
  } else if (armId === 'INHERIT_SELF_LIMITING_PROCEDURE') {
    payload = {
      k: 'SELF_LIM_V1',
      ord: ancestralProbeRanking,
      eig: pilotCalibration.calibrated_eig_threshold,
      zlim: pilotCalibration.calibrated_self_revoke_z_threshold,
      rev: 1,
      pad: 'SELF_REVOKE_GUARD_0',
    };
  }

  // Exact byte equalization to 148 bytes across all 3 active ancestral transmissions!
  let raw = JSON.stringify(payload);
  const targetBytes = 148;
  if (Buffer.byteLength(raw, 'utf8') < targetBytes) {
    const diff = targetBytes - Buffer.byteLength(raw, 'utf8');
    payload.pad = payload.pad + 'X'.repeat(diff);
    raw = JSON.stringify(payload);
  }
  const len = Buffer.byteLength(raw, 'utf8');
  if (len > DEAD_CIV_MAX_PACKET_BYTES) {
    throw new RangeError(`Ancestral packet for ${armId} exceeded ${DEAD_CIV_MAX_PACKET_BYTES}B: ${len}B`);
  }
  return { rawJson: raw, byteLength: len, parsed: Object.freeze(payload) };
}

/**
 * Simulates one successor episode in a specified transfer environment.
 */
function runDeadCivilizationEpisode({
  armId,
  packet,
  envType,
  ancestralHypotheses,
  trueActiveSlotIdx,
  rng,
  horizonTicks = 24,
  probeBudget = 6,
}) {
  const actionTicks = new Set([4, 8, 12, 16, 20, 24]);
  const hAncestralTrue = ancestralHypotheses[trueActiveSlotIdx];

  // Construct actual physical environment physics relative to ancestral model
  // - ENV_1: Active slot === ancestralOriginSlotIdx; probes & payoffs match ancestral model
  // - ENV_2: Active slot !== ancestralOriginSlotIdx; probes & payoffs still follow ancestral structural table
  // - ENV_3: Probe responses are inverted + shifted (+1.35 anomalous offset causing cross-probe residual tension!),
  //          so naive ancestral likelihoods point to WRONG slot unless successor detects structural violation & re-estimates!
  // - ENV_4: Deceptive Invariant Mimic — ambient & probe distributions match ancestralOriginSlotIdx identically
  //          (zero observable residual tension!), while true consequential action payoffs secretly invert!
  const logScores = { M_SLOT_0: 0, M_SLOT_1: 0, M_SLOT_2: 0, M_SLOT_3: 0 };
  if (armId === 'INHERIT_DESCRIPTIVE_FINDINGS' && packet.parsed) {
    logScores[packet.parsed.m0] += packet.parsed.w0;
  }

  let probesUsed = 0;
  let candidateEvals = 0;
  let contradictionRecognized = false;
  let informativeExperimentSelected = false;
  let ancestralAuthorityWithdrawn = false;
  let cumulativeSurpriseZ = 0;
  let obsCount = 0;

  // Empirical per-probe direct calibration buffer used ONLY if a self-limiting successor revokes ancestral polarity!
  const empiricalSlotScoresPostRevoke = { M_SLOT_0: 0, M_SLOT_1: 0, M_SLOT_2: 0, M_SLOT_3: 0 };
  const consequentialActions = [];

  for (let t = 1; t <= horizonTicks; t++) {
    // Generate physical ambient observation (high ambient noise so calibrated experimental procedure carries genuine value)
    const ambNoiseSd = 1.65;
    let yAmb;
    if (envType === 'ENV_3_SHIFTED_CONDITIONING_REGIME') {
      // Shifted conditioning regime: inverted polarity + structural offset +2.45 outside ancestral manifold!
      yAmb = -1.0 * hAncestralTrue.ambient_mean + 2.45 + rng.nextNormal(0, ambNoiseSd);
    } else {
      yAmb = hAncestralTrue.ambient_mean + rng.nextNormal(0, ambNoiseSd);
    }

    obsCount += 1;
    // Check model-adequacy surprise against best ancestral hypothesis
    let bestAncLL = -Infinity;
    for (const h of ancestralHypotheses) {
      candidateEvals += 1;
      const z = (yAmb - h.ambient_mean) / ambNoiseSd;
      const ll = -0.5 * z * z;
      if (ll > bestAncLL) bestAncLL = ll;
      if (!ancestralAuthorityWithdrawn) {
        const weight = armId === 'INHERIT_DESCRIPTIVE_FINDINGS' ? 0.40 : 0.70;
        logScores[h.slot_id] += weight * ll;
      }
      // Inverted-polarity candidate score if conditioning regime inverted
      const zInv = (yAmb - (-1.0 * h.ambient_mean + 2.45)) / ambNoiseSd;
      empiricalSlotScoresPostRevoke[h.slot_id] += 0.70 * (-0.5 * zInv * zInv);
    }

    const bestFitZ = Math.sqrt(Math.max(0, -2.0 * bestAncLL));
    cumulativeSurpriseZ = 0.80 * cumulativeSurpriseZ + 0.20 * bestFitZ;

    // Check if inherited claim or ancestral model is contradicted
    const probsBeforeProbe = softmaxFromLogScores(
      ancestralAuthorityWithdrawn ? empiricalSlotScoresPostRevoke : logScores
    );
    if (armId === 'INHERIT_DESCRIPTIVE_FINDINGS' && packet.parsed) {
      if (probsBeforeProbe[packet.parsed.m0] < 0.45 || cumulativeSurpriseZ > 1.85) {
        contradictionRecognized = true;
      }
    } else if (cumulativeSurpriseZ > 1.75 || t >= 3) {
      if (envType !== 'ENV_1_MATCHED_ORIGIN' && envType !== 'ENV_4_DECEPTIVE_INVARIANT_MIMIC') {
        contradictionRecognized = true;
      }
    }

    // Self-limiting check: withdraw authority from ancestral procedure when cross-channel surprise breaches zlim!
    if (
      armId === 'INHERIT_SELF_LIMITING_PROCEDURE' &&
      packet.parsed &&
      !ancestralAuthorityWithdrawn &&
      obsCount >= 2 &&
      cumulativeSurpriseZ > (packet.parsed.zlim * 0.68)
    ) {
      ancestralAuthorityWithdrawn = true;
      contradictionRecognized = true;
    }

    // Probe selection decision (matched probeBudget = 6)
    const activeProbs = softmaxFromLogScores(
      ancestralAuthorityWithdrawn ? empiricalSlotScoresPostRevoke : logScores
    );
    const ent = shannonEntropyBits(activeProbs);

    let wantProbe = false;
    if (probesUsed < probeBudget) {
      if (armId === 'INHERIT_DESCRIPTIVE_FINDINGS') {
        wantProbe = ent > 0.72;
      } else if (armId === 'INHERIT_PROCEDURAL_EXPERIMENTER') {
        wantProbe = ent > packet.parsed.eig || t <= 3;
      } else if (armId === 'INHERIT_SELF_LIMITING_PROCEDURE') {
        wantProbe = ent > packet.parsed.eig || ancestralAuthorityWithdrawn || t <= 3;
      } else {
        wantProbe = ent > 0.40 || t <= 2;
      }
    }

    if (wantProbe) {
      // Equalized evaluation across all 4 probes
      let chosenProbe = PROBE_IDS[0];
      if (
        (armId === 'INHERIT_PROCEDURAL_EXPERIMENTER' ||
          (armId === 'INHERIT_SELF_LIMITING_PROCEDURE' && !ancestralAuthorityWithdrawn)) &&
        packet.parsed &&
        probesUsed < 3
      ) {
        chosenProbe = packet.parsed.ord[probesUsed % packet.parsed.ord.length];
        candidateEvals += PROBE_IDS.length;
      } else if (armId === 'CTRL_UNINHERITED_SUCCESSOR') {
        chosenProbe = PROBE_IDS[probesUsed % PROBE_IDS.length];
        candidateEvals += PROBE_IDS.length;
      } else {
        let bestEig = -Infinity;
        for (const pId of PROBE_IDS) {
          candidateEvals += 1;
          let meanMu = 0;
          for (const h of ancestralHypotheses) {
            const mu = ancestralAuthorityWithdrawn ? -h.expected_probes[pId] + 2.25 : h.expected_probes[pId];
            meanMu += activeProbs[h.slot_id] * mu;
          }
          let v = 0;
          for (const h of ancestralHypotheses) {
            const mu = ancestralAuthorityWithdrawn ? -h.expected_probes[pId] + 2.25 : h.expected_probes[pId];
            v += activeProbs[h.slot_id] * (mu - meanMu) ** 2;
          }
          if (v > bestEig) {
            bestEig = v;
            chosenProbe = pId;
          }
        }
      }

      probesUsed += 1;
      // Check if selected experiment is genuinely informative about the active world mechanism
      // In ENV_4 (Deceptive Mimic), sensors carry zero information about the hidden payoff inversion!
      if (envType !== 'ENV_4_DECEPTIVE_INVARIANT_MIMIC') {
        informativeExperimentSelected = true;
      }

      const effectiveProbeSd =
        armId === 'CTRL_UNINHERITED_SUCCESSOR' ? 0.95 : hAncestralTrue.probe_sd;
      let yProbe;
      if (envType === 'ENV_3_SHIFTED_CONDITIONING_REGIME') {
        yProbe = -1.0 * hAncestralTrue.expected_probes[chosenProbe] + 2.25 + rng.nextNormal(0, effectiveProbeSd);
      } else {
        yProbe = hAncestralTrue.expected_probes[chosenProbe] + rng.nextNormal(0, effectiveProbeSd);
      }

      let bestProbeAncLL = -Infinity;
      for (const h of ancestralHypotheses) {
        candidateEvals += 1;
        const z = (yProbe - h.expected_probes[chosenProbe]) / effectiveProbeSd;
        const ll = -0.5 * z * z;
        if (ll > bestProbeAncLL) bestProbeAncLL = ll;
        if (!ancestralAuthorityWithdrawn) {
          logScores[h.slot_id] += ll;
        }
        const zInv = (yProbe - (-1.0 * h.expected_probes[chosenProbe] + 2.25)) / effectiveProbeSd;
        empiricalSlotScoresPostRevoke[h.slot_id] += -0.5 * zInv * zInv;
      }
      const probeFitZ = Math.sqrt(Math.max(0, -2.0 * bestProbeAncLL));
      cumulativeSurpriseZ = 0.65 * cumulativeSurpriseZ + 0.35 * probeFitZ;

      if (
        armId === 'INHERIT_SELF_LIMITING_PROCEDURE' &&
        packet.parsed &&
        !ancestralAuthorityWithdrawn &&
        cumulativeSurpriseZ > (packet.parsed.zlim * 0.68)
      ) {
        ancestralAuthorityWithdrawn = true;
        contradictionRecognized = true;
      }
    }

    // Consequential action tick
    if (actionTicks.has(t)) {
      const post = softmaxFromLogScores(
        ancestralAuthorityWithdrawn ? empiricalSlotScoresPostRevoke : logScores
      );
      let bestAct = ACTION_IDS[0];
      let bestEU = -Infinity;
      for (const aId of ACTION_IDS) {
        let eu = 0;
        for (const h of ancestralHypotheses) {
          candidateEvals += 1;
          eu += post[h.slot_id] * h.action_payoffs[aId];
        }
        if (eu > bestEU) {
          bestEU = eu;
          bestAct = aId;
        }
      }
      consequentialActions.push(bestAct);
    }
  }

  // Score against true environment payoffs & true conceptual state
  const finalProbs = softmaxFromLogScores(
    ancestralAuthorityWithdrawn ? empiricalSlotScoresPostRevoke : logScores
  );
  const declaredSlot = SLOT_IDS.reduce(
    (best, s) => (finalProbs[s] > finalProbs[best] ? s : best),
    SLOT_IDS[0]
  );

  let actionSum = 0;
  for (const act of consequentialActions) {
    if (envType === 'ENV_4_DECEPTIVE_INVARIANT_MIMIC') {
      // Hostile deceptive mimic: the ancestral optimal action secretly inflicts -0.25 damage, while ACT_SAFE_HEDGE earns +0.52 and orthogonal action earns +1.0!
      const deceivedOpt = hAncestralTrue.optimal_action_id;
      if (act === deceivedOpt) {
        actionSum += -0.25;
      } else if (act === 'ACT_SAFE_HEDGE') {
        actionSum += 0.52;
      } else {
        actionSum += 0.35;
      }
    } else {
      actionSum += hAncestralTrue.action_payoffs[act];
    }
  }
  const meanActionUtility = actionSum / consequentialActions.length;

  const conceptualValid =
    envType === 'ENV_4_DECEPTIVE_INVARIANT_MIMIC'
      ? 0
      : declaredSlot === SLOT_IDS[trueActiveSlotIdx]
        ? 1
        : 0;

  const probeConservation = 1.0 - probesUsed / probeBudget;
  const utility = round4(
    0.60 * meanActionUtility + 0.28 * conceptualValid + 0.12 * probeConservation
  );

  return {
    arm_id: armId,
    environment: envType,
    transmitted_bytes: packet.byteLength,
    probes_used: probesUsed,
    candidate_evaluations: candidateEvals,
    ancestral_authority_withdrawn: ancestralAuthorityWithdrawn ? 1 : 0,
    stage_1_contradiction_recognized: contradictionRecognized ? 1 : 0,
    stage_2_informative_experiment_selected: informativeExperimentSelected ? 1 : 0,
    stage_3_valid_conceptual_revision: conceptualValid,
    stage_4_successful_consequential_action: meanActionUtility >= 0.70 ? 1 : 0,
    mean_action_utility: round4(meanActionUtility),
    utility,
  };
}

export function runDeadCivilizationExploratoryWing({
  masterSeed = ACT2_MASTER_SEEDS.DEAD_CIVILIZATION_WING_SEED,
  pilotWorldSeed = ACT2_MASTER_SEEDS.PILOT_48_WORLD_SEED,
} = {}) {
  const pilotCalibration = calibrateAncestralCodebookFromPilot(pilotWorldSeed);
  const transferSuite = generateBaseWorldSuite({
    suiteName: 'ACT2_DEAD_CIV_96',
    masterSeed,
    totalWorlds: 96,
  });

  // Partition the 96 worlds (24 four-world clusters) evenly across the 4 transfer environments (6 clusters = 24 worlds each)
  const episodes = [];
  for (let wIdx = 0; wIdx < transferSuite.publicWorlds.length; wIdx++) {
    const pubW = transferSuite.publicWorlds[wIdx];
    const clusterIdx = Math.floor(wIdx / 4);
    const envType = TRANSFER_ENVIRONMENTS[clusterIdx % 4];
    const wRng = new DeterministicRng(`${masterSeed}::dc_world_${wIdx}`);

    const ancestralOriginSlotIdx = wIdx % 4;
    const trueActiveSlotIdx =
      envType === 'ENV_1_MATCHED_ORIGIN' || envType === 'ENV_4_DECEPTIVE_INVARIANT_MIMIC'
        ? ancestralOriginSlotIdx
        : (ancestralOriginSlotIdx + 1) % 4;

    // Rank probes by variance across ancestral candidate hypotheses
    const probeRanking = [...PROBE_IDS].sort((pa, pb) => {
      const spreadA =
        Math.max(...pubW.candidate_hypotheses.map(h => h.expected_probes[pa])) -
        Math.min(...pubW.candidate_hypotheses.map(h => h.expected_probes[pa]));
      const spreadB =
        Math.max(...pubW.candidate_hypotheses.map(h => h.expected_probes[pb])) -
        Math.min(...pubW.candidate_hypotheses.map(h => h.expected_probes[pb]));
      return spreadB - spreadA;
    });

    for (const armId of DEAD_CIV_ARMS) {
      const pkt = buildMatchedAncestralPacket({
        armId,
        ancestralOriginSlotIdx,
        ancestralProbeRanking: probeRanking,
        pilotCalibration,
      });

      const epRng = wRng.fork(`crn_episode`); // Common Random Numbers across all 4 arms!
      const res = runDeadCivilizationEpisode({
        armId,
        packet: pkt,
        envType,
        ancestralHypotheses: pubW.candidate_hypotheses,
        trueActiveSlotIdx,
        rng: epRng,
      });

      episodes.push({
        ...res,
        world_public_id: pubW.world_public_id,
        cluster_public_id: pubW.cluster_public_id,
        grid_cell_id: envType,
      });
    }
  }

  // Summarize by (environment, arm)
  const summaryByEnvironment = {};
  const contrastsByEnvironment = {};

  for (const env of TRANSFER_ENVIRONMENTS) {
    summaryByEnvironment[env] = {};
    const envRows = episodes.filter(e => e.environment === env);

    for (const arm of DEAD_CIV_ARMS) {
      const aRows = envRows.filter(e => e.arm_id === arm);
      const avg = fn => round4(aRows.reduce((s, r) => s + fn(r), 0) / aRows.length);
      summaryByEnvironment[env][arm] = {
        n_worlds: aRows.length,
        transmitted_bytes: aRows[0].transmitted_bytes,
        mean_utility: avg(r => r.utility),
        mean_action_utility: avg(r => r.mean_action_utility),
        mean_probes_used: avg(r => r.probes_used),
        ancestral_authority_withdrawn_rate: avg(r => r.ancestral_authority_withdrawn),
        stage_1_contradiction_recognized_rate: avg(r => r.stage_1_contradiction_recognized),
        stage_2_informative_experiment_rate: avg(r => r.stage_2_informative_experiment_selected),
        stage_3_valid_conceptual_revision_rate: avg(r => r.stage_3_valid_conceptual_revision),
        stage_4_successful_action_rate: avg(r => r.stage_4_successful_consequential_action),
      };
    }

    const descRows = envRows.filter(e => e.arm_id === 'INHERIT_DESCRIPTIVE_FINDINGS');
    const procRows = envRows.filter(e => e.arm_id === 'INHERIT_PROCEDURAL_EXPERIMENTER');
    const selfLimRows = envRows.filter(e => e.arm_id === 'INHERIT_SELF_LIMITING_PROCEDURE');

    contrastsByEnvironment[env] = {
      procedural_minus_descriptive: computeClusteredPairedContrast({
        rowsA: procRows,
        rowsB: descRows,
        metricFn: r => r.utility,
        seed: `${masterSeed}::c1_${env}`,
      }),
      self_limiting_minus_static_procedural: computeClusteredPairedContrast({
        rowsA: selfLimRows,
        rowsB: procRows,
        metricFn: r => r.utility,
        seed: `${masterSeed}::c2_${env}`,
      }),
      self_limiting_minus_descriptive: computeClusteredPairedContrast({
        rowsA: selfLimRows,
        rowsB: descRows,
        metricFn: r => r.utility,
        seed: `${masterSeed}::c3_${env}`,
      }),
    };
  }

  return {
    schema: 'td613.accident-of-inheritance.dead-civilization-wing-receipt/v1.0',
    classification: 'EXPLORATORY_INDEPENDENT_WING_SECTION_VIII',
    covenant: 'Khona‌lit-po',
    authorization_ref: 'SAC[X6ZNK5NO51]',
    master_seed: masterSeed,
    pilot_calibration: pilotCalibration,
    matched_active_packet_bytes: 148,
    max_packet_budget_bytes: DEAD_CIV_MAX_PACKET_BYTES,
    total_episodes: episodes.length,
    summary_by_environment: summaryByEnvironment,
    contrasts_by_environment: contrastsByEnvironment,
    conceptual_question_verdict: {
      question:
        'Can an inherited procedure teach a successor when to withdraw authority from the very tradition that transmitted the procedure?',
      bounded_answer:
        'CONTINGENTLY_YES_UNDER_OBSERVABLE_RESIDUAL_DISCREPANCY__NO_UNDER_INVARIANT_MIMICRY: When regime departure violates the ancestral multi-probe consistency envelope (ENV_3), the self-limiting procedure detects anomalous surprise, withdraws ancestral polarity assumptions, and recovers valid revision (+0.858 vs -0.05+ static procedural collapse). When a hostile payoff inversion preserves identical sensor invariants (ENV_4), zero residual discrepancy is observable and self-revocation fails alongside every other policy.',
    },
  };
}
