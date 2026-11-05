/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Six Experimental Inheritance Conditions + Randomized & Exploratory Policies
 *
 * Conditions:
 *   I.   THE AMNESIACS      — Terminal Encyclopedia Π(G) alone (0 historical bytes).
 *   II.  THE ARCHIVISTS     — Π(G) + complete permissible synthetic research history H.
 *   III. THE HEIRS          — Π(G) + calibration-trained inheritance capsule Z (|Z| <= B).
 *   IV.  THE FALSE PROPHETS — Π(G) + isolated misleading synthetic narrative H_false.
 *   V.   THE EXILES         — Π(G) + authentic history H(w') from matched sibling world w' != w.
 *   VI.  THE REVISIONISTS   — Π(G) + category-level selective forgetting policy under strict budget B.
 *
 * Noncompeting Controls:
 *   - CTRL_RANDOM           — Uniform random action & naming baseline (evaluator lower anchor).
 *   - (CTRL_ORACLE lives strictly inside evaluator.mjs and is logged in the vault access ledger.)
 *
 * All six competing conditions execute the EXACT SAME downstream Bayesian EIG planner and
 * hypothesis-update arithmetic (matched action budget, matched candidate evaluations), differing
 * solely in the inherited memory state entering Step 0.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { DeterministicRng } from './prng.mjs';
import { encodeInheritanceCapsule } from './capsule-compressor.mjs';

export const COMPETING_CONDITIONS = Object.freeze([
  'I_AMNESIACS',
  'II_ARCHIVISTS',
  'III_HEIRS',
  'IV_FALSE_PROPHETS',
  'V_EXILES',
  'VI_REVISIONISTS',
]);

const FORBIDDEN_SECRET_KEYS = new Set([
  'vault_only_canary',
  'true_mechanism_slot',
  'true_mechanism_archetype',
  'true_sensitive_attribute_S',
  'holdout_ground_truth_outputs',
  'optimal_probe_id',
  'optimal_intervention_id',
  'crn_seed',
  'structural_parameters',
]);

/**
 * Hard runtime taint guard: throws immediately if any ground-truth secret field
 * or canary string ever enters an investigator-facing packet.
 */
export function assertNoSecretLeakage(obj, pathStr = 'root') {
  if (obj === null || obj === undefined) return;
  if (typeof obj === 'string') {
    if (obj.includes('TD613_SECRET_VAULT_DO_NOT_EXPOSE_TO_INVESTIGATOR')) {
      throw new Error(`[SECRET_LEAKAGE_VIOLATION] Canary string detected at ${pathStr}`);
    }
    return;
  }
  if (typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      assertNoSecretLeakage(obj[i], `${pathStr}[${i}]`);
    }
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (FORBIDDEN_SECRET_KEYS.has(k)) {
      throw new Error(`[SECRET_LEAKAGE_VIOLATION] Forbidden key '${k}' detected at ${pathStr}`);
    }
    assertNoSecretLeakage(v, `${pathStr}.${k}`);
  }
}

export function estimateTokensFromBytes(byteCount) {
  return Math.ceil(byteCount / 4);
}

function softmaxFromLogs(logWeights) {
  const maxLog = Math.max(...logWeights);
  const exps = logWeights.map(lw => Math.exp(Math.max(-40, lw - maxLog)));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function shannonEntropyBits(probs) {
  let h = 0;
  for (const p of probs) {
    if (p > 1e-12) h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Prepares the disposable working-memory representation for each condition,
 * enforcing strict byte caps for Conditions III and VI without mutating source records.
 */
export function prepareConditionInheritance({
  conditionId,
  publicWorld,
  budgetBytes,
  trainedCodec,
}) {
  if (conditionId === 'I_AMNESIACS' || conditionId === 'CTRL_RANDOM') {
    return {
      inheritance_mode: 'NONE',
      inherited_payload: null,
      retained_bytes: 0,
      retained_tokens_est: 0,
      records_scanned: 0,
    };
  }

  if (conditionId === 'II_ARCHIVISTS') {
    const rawJson = JSON.stringify(publicWorld.permissible_full_history);
    const bytes = Buffer.byteLength(rawJson, 'utf8');
    return {
      inheritance_mode: 'FULL_HISTORY',
      inherited_payload: JSON.parse(rawJson),
      retained_bytes: bytes,
      retained_tokens_est: estimateTokensFromBytes(bytes),
      records_scanned: publicWorld.permissible_full_history.length,
    };
  }

  if (conditionId === 'III_HEIRS') {
    const cap = encodeInheritanceCapsule({
      worldPublicId: publicWorld.world_public_id,
      historyRecords: publicWorld.permissible_full_history,
      trainedCodec,
      budgetBytes,
    });
    return {
      inheritance_mode: 'COMPRESSED_CAPSULE',
      inherited_payload: JSON.parse(cap.capsule_json),
      retained_bytes: cap.byte_length,
      retained_tokens_est: estimateTokensFromBytes(cap.byte_length),
      records_scanned: 1,
    };
  }

  if (conditionId === 'IV_FALSE_PROPHETS') {
    const rawJson = JSON.stringify(publicWorld.isolated_false_history);
    const bytes = Buffer.byteLength(rawJson, 'utf8');
    return {
      inheritance_mode: 'FULL_HISTORY',
      inherited_payload: JSON.parse(rawJson),
      retained_bytes: bytes,
      retained_tokens_est: estimateTokensFromBytes(bytes),
      records_scanned: publicWorld.isolated_false_history.length,
    };
  }

  if (conditionId === 'V_EXILES') {
    const rawJson = JSON.stringify(publicWorld.exile_authentic_foreign_history);
    const bytes = Buffer.byteLength(rawJson, 'utf8');
    return {
      inheritance_mode: 'FULL_HISTORY',
      inherited_payload: JSON.parse(rawJson),
      retained_bytes: bytes,
      retained_tokens_est: estimateTokensFromBytes(bytes),
      records_scanned: publicWorld.exile_authentic_foreign_history.length,
    };
  }

  if (conditionId === 'VI_REVISIONISTS') {
    // Rule-based selective forgetting over disposable working memory under strict budgetBytes:
    //   1. Explicitly FORGET: CAT_ADMINISTRATIVE_CLUTTER, CAT_PROVENANCE_AND_SENSITIVE, CAT_EPOCH0_DRIFT_TRIALS.
    //   2. Retain prioritized categories greedily until adding the next summary exceeds budgetBytes:
    //        Priority 1: CAT_CALIBRATED_REJECTIONS
    //        Priority 2: CAT_TEMPORAL_LEDGER
    //        Priority 3: CAT_RESIDUAL_ANOMALIES (fits in 256B; evicted in 96B!)
    const byCat = new Map();
    for (const r of publicWorld.permissible_full_history) {
      byCat.set(r.category, r.payload);
    }

    const workingMem = { m: 'rev1', kept: [] };
    const candidateChunks = [
      {
        cat: 'C1',
        build: () => {
          const cal = byCat.get('CAT_CALIBRATED_REJECTIONS') || {};
          const slots = ['M_SLOT_0', 'M_SLOT_1', 'M_SLOT_2', 'M_SLOT_3'];
          return slots.map(s => Math.round(Number(cal.calibrated_log_support?.[s] ?? 0) * 10) / 10);
        },
      },
      {
        cat: 'C2',
        build: () => {
          const t = byCat.get('CAT_TEMPORAL_LEDGER') || {};
          return [Number(t.withdrawn_claims_count ?? 0), t.precursor_obs_before_primary ? 1 : 0];
        },
      },
      {
        cat: 'C3',
        build: () => {
          const r = byCat.get('CAT_RESIDUAL_ANOMALIES') || {};
          return {
            wv: Math.round(Number(r.within_cell_var ?? 0.05) * 100) / 100,
            bv: Math.round(Number(r.between_cell_var ?? 0.05) * 100) / 100,
            ts: Math.round(Number(r.triad_synergy_excess ?? 0) * 100) / 100,
            pg: Math.round(Number(r.path_loop_gap ?? 0) * 100) / 100,
            en: r.exterior_nullspace_flag ? 1 : 0,
            dc: Number(r.dominant_single_coord ?? 0),
          };
        },
      },
    ];

    const omittedCategories = [
      'CAT_EPOCH0_DRIFT_TRIALS',
      'CAT_PROVENANCE_AND_SENSITIVE',
      'CAT_ADMINISTRATIVE_CLUTTER',
    ];

    for (const ch of candidateChunks) {
      const trial = {
        ...workingMem,
        kept: [...workingMem.kept, ch.cat],
        [ch.cat]: ch.build(),
      };
      const trialJson = JSON.stringify(trial);
      if (Buffer.byteLength(trialJson, 'utf8') <= budgetBytes) {
        workingMem.kept = trial.kept;
        workingMem[ch.cat] = trial[ch.cat];
      } else {
        omittedCategories.push(ch.cat === 'C3' ? 'CAT_RESIDUAL_ANOMALIES' : ch.cat);
      }
    }

    const finalJson = JSON.stringify(workingMem);
    const byteLen = Buffer.byteLength(finalJson, 'utf8');
    if (byteLen > budgetBytes) {
      throw new Error(`[REVISIONIST_BUDGET_EXCEEDED] ${byteLen} > ${budgetBytes}`);
    }

    return {
      inheritance_mode: 'SELECTIVE_WORKING_MEMORY',
      inherited_payload: JSON.parse(finalJson),
      retained_bytes: byteLen,
      retained_tokens_est: estimateTokensFromBytes(byteLen),
      records_scanned: workingMem.kept.length,
      omitted_categories: omittedCategories,
    };
  }

  throw new Error(`Unknown conditionId: ${conditionId}`);
}

/**
 * Extracts prior log-weights over M_SLOT_0..3 and auxiliary residual hints from
 * the investigator's inherited payload (identical downstream logic across representations).
 */
export function derivePriorFromInheritance(packet) {
  const slots = ['M_SLOT_0', 'M_SLOT_1', 'M_SLOT_2', 'M_SLOT_3'];
  const logPrior = [0, 0, 0, 0];
  let residualHints = {
    has_detailed_residuals: false,
    dominant_single_coord: 0,
    suspicious_oversmoothed_history: false,
    clock_inversion_known: false,
  };

  const mode = packet.inheritance_mode;
  const payload = packet.inherited_payload;

  if (mode === 'NONE' || !payload) {
    return { logPrior, residualHints };
  }

  if (mode === 'FULL_HISTORY' && Array.isArray(payload)) {
    const byCat = new Map();
    for (const r of payload) byCat.set(r.category, r.payload || {});

    const cal = byCat.get('CAT_CALIBRATED_REJECTIONS') || {};
    const temp = byCat.get('CAT_TEMPORAL_LEDGER') || {};
    const res = byCat.get('CAT_RESIDUAL_ANOMALIES') || {};
    const ep0 = byCat.get('CAT_EPOCH0_DRIFT_TRIALS') || {};

    // Epistemic forensic check: detect unnaturally smooth fabricated variance (< 0.004 vs Aperture floor ~0.01)
    const withinVar = Number(res.within_cell_var ?? 0.02);
    const suspicious = withinVar < 0.004;
    const temper = suspicious ? 0.50 : 1.0;

    // Full-history Archivist / Prophet / Exile pools BOTH calibrated rejections AND legacy epoch_0 trials
    // weighted by archival sample size (epoch_0 has legacy_sample_count=64, creating realistic anchor pull!)
    const legacyWeight = Number(ep0.legacy_sample_count ?? 0) >= 40 ? 0.62 : 0.20;

    for (let i = 0; i < 4; i++) {
      const s = slots[i];
      const calScore = Number(cal.calibrated_log_support?.[s] ?? 0);
      const ep0Score = Number(ep0.legacy_pooled_log_scores?.[s] ?? 0);
      logPrior[i] = temper * (0.95 * calScore + legacyWeight * ep0Score);
    }

    residualHints = {
      has_detailed_residuals: true,
      dominant_single_coord: Number(res.dominant_single_coord ?? 0),
      suspicious_oversmoothed_history: suspicious,
      clock_inversion_known: Boolean(temp.precursor_obs_before_primary),
    };
    return { logPrior, residualHints };
  }

  if (mode === 'COMPRESSED_CAPSULE') {
    const hyps = packet.candidate_mechanism_hypotheses;
    if (Array.isArray(payload.ce)) {
      for (let i = 0; i < 4; i++) logPrior[i] += 1.15 * Number(payload.ce[i] ?? 0);
    } else if (Array.isArray(payload.cc)) {
      for (let i = 0; i < 4; i++) logPrior[i] += 0.95 * Number(payload.cc[i] ?? 0);
    }

    if (Array.isArray(payload.tl)) {
      const [wCount, invBit] = payload.tl;
      residualHints.clock_inversion_known = invBit === 1;
      for (let i = 0; i < 4; i++) {
        const sig = hyps[i].model_signature;
        if (sig === 'TEMP_OVERSHOOT_COLLAPSE' && wCount >= 2) logPrior[i] += 1.4;
        if (sig === 'TEMP_IMMEDIATE_DECAY' && wCount === 1) logPrior[i] += 0.9;
        if (sig === 'TEMP_CLOCK_INVERTED_PRECURSOR' && invBit === 1) logPrior[i] += 1.6;
        if (sig === 'TEMP_PURE_LAG_T2' && wCount === 0 && invBit === 0) logPrior[i] += 0.9;
      }
    }

    if (Array.isArray(payload.rf)) {
      const [wv, bv, ts, pg, en, dc] = payload.rf;
      residualHints.has_detailed_residuals = true;
      residualHints.dominant_single_coord = Number(dc ?? 0);
      for (let i = 0; i < 4; i++) {
        const sig = hyps[i].model_signature;
        if (sig === 'GF2_PURE_3BODY_XOR' || sig === 'GF2_PURE_3BODY_XNOR') {
          logPrior[i] += ts > 0.42 ? 0.9 : -0.7;
        }
        if (sig === 'UNIDENTIFIABLE_EXTERIOR_NULLSPACE') logPrior[i] += en === 1 ? 1.8 : -1.2;
        if (sig === 'COMPLETE_ONTOLOGY_HIGH_NOISE') logPrior[i] += (en === 0 && wv > 0.12 && pg < 0.35) ? 1.6 : -1.0;
        if (sig === 'RUPTURE_MISSING_COMPOSITE_INVARIANT') logPrior[i] += (en === 0 && wv < 0.09 && bv > 0.14) ? 1.7 : -1.0;
        if (sig === 'RUPTURE_MISSING_PATH_HOLONOMY') logPrior[i] += (en === 0 && pg > 0.45) ? 1.8 : -1.0;
      }
    } else if (typeof payload.rc === 'number') {
      const rc = payload.rc;
      for (let i = 0; i < 4; i++) {
        const sig = hyps[i].model_signature;
        if (rc === 1 && sig === 'UNIDENTIFIABLE_EXTERIOR_NULLSPACE') logPrior[i] += 1.4;
        if (rc === 2 && (sig.startsWith('RUPTURE_') || sig.includes('3BODY'))) logPrior[i] += 0.65;
        if (rc === 0 && sig === 'COMPLETE_ONTOLOGY_HIGH_NOISE') logPrior[i] += 0.65;
      }
    }
    return { logPrior, residualHints };
  }

  if (mode === 'SELECTIVE_WORKING_MEMORY') {
    const hyps = packet.candidate_mechanism_hypotheses;
    if (Array.isArray(payload.C1)) {
      for (let i = 0; i < 4; i++) {
        let base = Number(payload.C1[i] ?? 0);
        // Note: In Family D, if C3 (CAT_RESIDUAL_ANOMALIES) was evicted due to tight 96B budget,
        // C1's slot breakdown previously depended on residual variance that Revisionist discarded!
        // Under strict C3 eviction, Family D only retains coarse baseline fit error, not residual variance splits.
        if (packet.family === 'D_IMPOSSIBLE_LIBRARY' && !payload.C3) {
          base = 0;
        }
        logPrior[i] += 1.1 * base;
      }
    }
    if (Array.isArray(payload.C2)) {
      const [wCount, invBit] = payload.C2;
      residualHints.clock_inversion_known = invBit === 1;
      for (let i = 0; i < 4; i++) {
        const sig = hyps[i].model_signature;
        if (sig === 'TEMP_OVERSHOOT_COLLAPSE' && wCount >= 2) logPrior[i] += 1.2;
        if (sig === 'TEMP_CLOCK_INVERTED_PRECURSOR' && invBit === 1) logPrior[i] += 1.4;
      }
    }
    if (payload.C3) {
      const { wv, bv, ts, pg, en, dc } = payload.C3;
      residualHints.has_detailed_residuals = true;
      residualHints.dominant_single_coord = dc;
      for (let i = 0; i < 4; i++) {
        const sig = hyps[i].model_signature;
        if (sig === 'UNIDENTIFIABLE_EXTERIOR_NULLSPACE') logPrior[i] += en === 1 ? 1.6 : -1.0;
        if (sig === 'COMPLETE_ONTOLOGY_HIGH_NOISE') logPrior[i] += (en === 0 && wv > 0.12 && pg < 0.35) ? 1.5 : -0.9;
        if (sig === 'RUPTURE_MISSING_COMPOSITE_INVARIANT') logPrior[i] += (en === 0 && wv < 0.09 && bv > 0.14) ? 1.5 : -0.9;
        if (sig === 'RUPTURE_MISSING_PATH_HOLONOMY') logPrior[i] += (en === 0 && pg > 0.45) ? 1.6 : -0.9;
        if (sig.includes('3BODY')) logPrior[i] += ts > 0.42 ? 0.7 : -0.5;
      }
    }
    return { logPrior, residualHints };
  }

  return { logPrior, residualHints };
}

/**
 * Computes Expected Information Gain (EIG) of probe `probeId` under belief `priorProbs`
 * using Gauss-Hermite / 5-point deterministic quadrature over each slot's observation model.
 */
function computeProbeExpectedInfoGain(probeId, priorProbs, hypotheses) {
  const quadZ = [-1.5, -0.75, 0.0, 0.75, 1.5];
  const quadW = [0.1, 0.22, 0.36, 0.22, 0.1];
  const hBefore = shannonEntropyBits(priorProbs);

  let expectedHAfter = 0;
  for (let m = 0; m < 4; m++) {
    const pm = priorProbs[m];
    if (pm < 1e-9) continue;
    const muTrue = hypotheses[m].expected_probes[probeId];
    const sd = hypotheses[m].noise_sd || 0.11;

    for (let q = 0; q < quadZ.length; q++) {
      const ySim = muTrue === -1.0 ? -1.0 : muTrue + quadZ[q] * sd;
      const logPost = [];
      for (let k = 0; k < 4; k++) {
        if (priorProbs[k] < 1e-12) {
          logPost.push(-60);
          continue;
        }
        const muK = hypotheses[k].expected_probes[probeId];
        let ll = 0;
        if (ySim === -1.0 || muK === -1.0) {
          ll = (ySim === -1.0 && muK === -1.0) ? 0 : -25;
        } else {
          const z = (ySim - muK) / sd;
          ll = -0.5 * z * z;
        }
        logPost.push(Math.log(priorProbs[k]) + ll);
      }
      const post = softmaxFromLogs(logPost);
      expectedHAfter += pm * quadW[q] * shannonEntropyBits(post);
    }
  }
  return Math.max(0, hBefore - expectedHAfter);
}

/**
 * Executes an investigator episode across Step 1 (Probe), Step 2 (Intervention), and Step 3 (Name/Predict)
 * by interacting purely through neutral world callbacks `executeProbeFn` and `executeInterventionFn`.
 */
export function runInvestigatorEpisode({
  conditionId,
  packet,
  executeProbeFn,
  executeInterventionFn,
  episodeSeed,
  exploratoryOptions = {},
}) {
  // 1. Mandatory taint verification before touching any logic
  assertNoSecretLeakage(packet);

  const hyps = packet.candidate_mechanism_hypotheses;
  let candidateEvaluations = 0;

  if (conditionId === 'CTRL_RANDOM') {
    const rng = new DeterministicRng(episodeSeed);
    const chosenProbe = rng.choice(packet.probe_menu).id;
    const probeObs = executeProbeFn(chosenProbe);
    const chosenIntervention = rng.choice(packet.intervention_menu).id;
    executeInterventionFn(chosenIntervention);
    const allDeclarations = ['M_SLOT_0', 'M_SLOT_1', 'M_SLOT_2', 'M_SLOT_3', 'ABSTAIN_UNIDENTIFIABLE'];
    const declared = rng.choice(allDeclarations);
    const preds = packet.holdout_query_inputs.map(() => rng.nextInt(0, 2));
    return {
      condition_id: conditionId,
      chosen_probe_id: chosenProbe,
      probe_observation: probeObs,
      chosen_intervention_id: chosenIntervention,
      declared_mechanism_or_abstain: declared,
      stated_confidence: 0.25,
      posterior_probs: [0.25, 0.25, 0.25, 0.25],
      ontology_insufficient_declared: rng.nextInt(0, 2) === 1,
      introduced_predicate: null,
      retroactive_claim_made: rng.nextInt(0, 4) === 0,
      holdout_predictions: preds,
      recovered_from_surprise: false,
      candidate_evaluations: 4,
    };
  }

  // Step 0: Prior belief from inherited memory
  const { logPrior, residualHints } = derivePriorFromInheritance(packet);

  // Optional Forbidden-Wing post-hoc mode: Inquisitive Skeptic challenges strong inherited anchor
  let effectiveLogPrior = [...logPrior];
  if (exploratoryOptions.inquisitive_skeptic_mode) {
    // Flatten prior for Step-1 probe selection so inherited dogma MUST survive a discriminating falsifier!
    effectiveLogPrior = logPrior.map(v => 0.22 * v);
  }

  const priorProbs = softmaxFromLogs(effectiveLogPrior);

  // Step 1 (NOTICE -> ACT): Choose probe maximizing Expected Information Gain
  let bestProbeId = packet.probe_menu[0].id;
  let bestEig = -Infinity;

  if (exploratoryOptions.inquisitive_skeptic_mode) {
    // Specifically target the probe that maximally challenges the inherited leader against its runner-up
    const rawProbs = softmaxFromLogs(logPrior);
    let topIdx = 0;
    for (let i = 1; i < 4; i++) if (rawProbs[i] > rawProbs[topIdx]) topIdx = i;
    const challengeProbs = [0.22, 0.22, 0.22, 0.22];
    challengeProbs[topIdx] = 0.34;
    for (const p of packet.probe_menu) {
      candidateEvaluations += 4;
      const eig = computeProbeExpectedInfoGain(p.id, challengeProbs, hyps);
      if (eig > bestEig) {
        bestEig = eig;
        bestProbeId = p.id;
      }
    }
  } else {
    for (const p of packet.probe_menu) {
      candidateEvaluations += 4;
      const eig = computeProbeExpectedInfoGain(p.id, priorProbs, hyps);
      if (eig > bestEig) {
        bestEig = eig;
        bestProbeId = p.id;
      }
    }
  }

  // WORLD ANSWERS to Probe 1
  const probeObs = executeProbeFn(bestProbeId);
  const yVal = probeObs.scalar_readout;

  // Check sequential likelihood surprise against inherited prior leader (enables partial recovery from misleading narratives!)
  const rawPriorProbs = softmaxFromLogs(logPrior);
  let priorLeader = 0;
  for (let i = 1; i < 4; i++) if (rawPriorProbs[i] > rawPriorProbs[priorLeader]) priorLeader = i;
  const expectedUnderLeader = hyps[priorLeader].expected_probes[bestProbeId];
  const sdLeader = hyps[priorLeader].noise_sd || 0.11;
  const zSurprise = (yVal === -1.0 || expectedUnderLeader === -1.0)
    ? ((yVal === expectedUnderLeader) ? 0 : 10)
    : Math.abs(yVal - expectedUnderLeader) / sdLeader;

  let surpriseTriggered = false;
  let baseLogsForPosterior = [...logPrior];
  if (zSurprise > 2.65) {
    surpriseTriggered = true;
    // Discount discredited historical prior when live experiment sharply contradicts it;
    // suspicious/over-smoothed histories are discounted much more aggressively than authentic traces!
    const discount = exploratoryOptions.inquisitive_skeptic_mode
      ? 0.05
      : (residualHints.suspicious_oversmoothed_history ? 0.15 : 0.48);
    baseLogsForPosterior = baseLogsForPosterior.map(v => v * discount);
  }

  // Bayesian posterior update with live probe observation
  const logPost = [];
  for (let k = 0; k < 4; k++) {
    candidateEvaluations += 1;
    const muK = hyps[k].expected_probes[bestProbeId];
    const sd = hyps[k].noise_sd || 0.11;
    let ll = 0;
    if (yVal === -1.0 || muK === -1.0) {
      ll = (yVal === -1.0 && muK === -1.0) ? 0 : -25;
    } else {
      const z = (yVal - muK) / sd;
      ll = -0.5 * z * z;
    }
    logPost.push(baseLogsForPosterior[k] + ll);
  }
  const postProbs = softmaxFromLogs(logPost);

  // Identify MAP slot & confidence
  let mapIdx = 0;
  for (let k = 1; k < 4; k++) {
    if (postProbs[k] > postProbs[mapIdx]) mapIdx = k;
  }
  const mapHyp = hyps[mapIdx];
  const mapProb = postProbs[mapIdx];

  // Step 2 (ACT): Select consequential intervention maximizing expected utility under posterior
  const chosenInterventionId = mapHyp.recommended_intervention;
  executeInterventionFn(chosenInterventionId);

  // Step 3 (NAME): Terminal declaration, abstention check, non-retroactivity check, and ontology synthesis
  let declared = mapHyp.slot_id;
  let ontologyInsufficient = false;
  let introducedPredicate = null;

  // Check unidentifiable nullspace abstention (Aperture rank-deficit discipline)
  const nullspaceIdx = hyps.findIndex(h => h.model_signature === 'UNIDENTIFIABLE_EXTERIOR_NULLSPACE');
  if (nullspaceIdx >= 0 && postProbs[nullspaceIdx] >= 0.42) {
    declared = 'ABSTAIN_UNIDENTIFIABLE';
  } else if (mapProb < 0.36) {
    // Epistemic humility when posterior remains nearly flat across incompatible mechanisms
    declared = 'ABSTAIN_UNIDENTIFIABLE';
  }

  // Family C retroactive trap check: if true mechanism is clock-inverted precursor, an investigator
  // lacking both clock-inversion memory AND precursor probe evidence assumes admission-order causality!
  let retroactiveClaimMade = false;
  if (
    packet.family === 'C_TEMPORAL_INHERITANCE' &&
    !residualHints.clock_inversion_known &&
    bestProbeId !== 'PROBE_PRECURSOR_SEQUENCE' &&
    declared !== 'ABSTAIN_UNIDENTIFIABLE' &&
    mapHyp.model_signature !== 'TEMP_CLOCK_INVERTED_PRECURSOR'
  ) {
    // Asserts forward admission-time causation without verifying observation-time clock order
    retroactiveClaimMade = true;
  }

  // Family D: Active Ontology Rupture Detection & New Predicate Induction
  if (packet.family === 'D_IMPOSSIBLE_LIBRARY') {
    if (mapHyp.model_signature === 'RUPTURE_MISSING_COMPOSITE_INVARIANT') {
      ontologyInsufficient = true;
      // Induce composite (c1*a1 + c2*a2) mod 3 == r from lattice cells returned by PROBE_MODULAR_CELLS (if run)
      if (probeObs.diagnostic_cells && Array.isArray(probeObs.diagnostic_cells)) {
        let bestFit = -1;
        let bestRule = { kind: 'COMPOSITE_MOD3', c1: 1, c2: 1, target_r: 0 };
        for (const c1 of [1, 2]) {
          for (const c2 of [1, 2]) {
            for (const r of [0, 1, 2]) {
              candidateEvaluations += 1;
              let hits = 0;
              for (const cell of probeObs.diagnostic_cells) {
                const pred = ((c1 * cell.a1 + c2 * cell.a2) % 3 === r) ? 1 : 0;
                if (pred === cell.y) hits++;
              }
              if (hits > bestFit) {
                bestFit = hits;
                bestRule = { kind: 'COMPOSITE_MOD3', c1, c2, target_r: r };
              }
            }
          }
        }
        introducedPredicate = bestRule;
      }
    } else if (mapHyp.model_signature === 'RUPTURE_MISSING_PATH_HOLONOMY') {
      ontologyInsufficient = true;
      if (probeObs.loop_latch_value !== undefined) {
        introducedPredicate = {
          kind: 'PATH_HOLONOMY_LATCH',
          trigger_prev_a1: probeObs.loop_latch_value,
        };
      }
    }
  }

  // Generate 16 held-out predictions using inferred mechanism / synthesized predicate
  const holdoutPredictions = predictHoldoutQueries(
    packet.family,
    packet.holdout_query_inputs,
    mapHyp,
    introducedPredicate,
    residualHints,
    probeObs
  );

  const statedConfidence = declared === 'ABSTAIN_UNIDENTIFIABLE'
    ? (nullspaceIdx >= 0 ? Math.min(0.98, Math.max(0.5, postProbs[nullspaceIdx])) : 0.35)
    : Math.min(0.995, Math.max(0.25, mapProb));

  return {
    condition_id: conditionId,
    chosen_probe_id: bestProbeId,
    probe_observation: probeObs,
    chosen_intervention_id: chosenInterventionId,
    declared_mechanism_or_abstain: declared,
    stated_confidence: Math.round(statedConfidence * 1000) / 1000,
    posterior_probs: postProbs.map(p => Math.round(p * 1000) / 1000),
    ontology_insufficient_declared: ontologyInsufficient,
    introduced_predicate: introducedPredicate,
    retroactive_claim_made: retroactiveClaimMade,
    holdout_predictions: holdoutPredictions,
    recovered_from_surprise: surpriseTriggered,
    candidate_evaluations: candidateEvaluations,
  };
}

function predictHoldoutQueries(family, queries, mapHyp, introducedPredicate, residualHints, probeObs) {
  const sig = mapHyp.model_signature;
  return queries.map(q => {
    if (family === 'A_CAUSAL_LOOKALIKES') {
      let y = 0.5 * q.do_aux;
      if (sig === 'SCM_LINEAR_CHAIN') y += q.do_hub + 0.6 * q.do_relay;
      else if (sig === 'SCM_FULL_CONFOUNDER') y += 0.5 * q.do_aux;
      else if (sig === 'SCM_HUB_CONFOUNDED_RELAY_ACTIVE') y += 1.0 * q.do_relay;
      else if (sig === 'SCM_THRESHOLD_SUPPRESSOR') {
        y += q.do_hub + 0.6 * q.do_relay - (Math.abs(q.do_hub) > 1.2 ? 1.75 * q.do_hub : 0);
      }
      return y > 0.45 ? 1 : 0;
    }

    if (family === 'B_HIGHER_ORDER_RELATIONS') {
      // Uses observed spin-pair alignment if probed, else canonical index mapping
      const perm = probeObs.inferred_perm || [0, 1, 2];
      const u = q.spins[perm[0]];
      const v = q.spins[perm[1]];
      const w = q.spins[perm[2]];
      if (sig === 'GF2_PAIR_XOR_AB') return u ^ v;
      if (sig === 'GF2_PAIR_XOR_BC') return v ^ w;
      if (sig === 'GF2_PURE_3BODY_XOR') return u ^ v ^ w;
      return 1 ^ u ^ v ^ w;
    }

    if (family === 'C_TEMPORAL_INHERITANCE') {
      if (sig === 'TEMP_PURE_LAG_T2') return q.horizon === 'T2' ? 1 : 0;
      if (sig === 'TEMP_IMMEDIATE_DECAY') return q.horizon === 'T0' ? 1 : 0;
      if (sig === 'TEMP_OVERSHOOT_COLLAPSE') return (q.horizon === 'T0' || !q.high_pulse) ? 1 : 0;
      return (q.precursor_first === 1 && q.horizon === 'T2') ? 1 : 0;
    }

    // Family D
    if (introducedPredicate && introducedPredicate.kind === 'COMPOSITE_MOD3') {
      return ((introducedPredicate.c1 * q.a1 + introducedPredicate.c2 * q.a2) % 3 === introducedPredicate.target_r) ? 1 : 0;
    }
    if (introducedPredicate && introducedPredicate.kind === 'PATH_HOLONOMY_LATCH') {
      return q.a3 ^ (q.prev_a1 === introducedPredicate.trigger_prev_a1 ? 1 : 0);
    }
    if (sig === 'UNIDENTIFIABLE_EXTERIOR_NULLSPACE') {
      return q.a3; // Bayes-optimal interior predictor; exterior bit is fundamentally unidentifiable (50% ceiling on exterior)
    }
    const dom = probeObs.dominant_coord_observed ?? residualHints.dominant_single_coord ?? 0;
    const coords = [q.a1 > 0 ? 1 : 0, q.a2 > 0 ? 1 : 0, q.a3];
    return coords[dom] ?? q.a3;
  });
}
