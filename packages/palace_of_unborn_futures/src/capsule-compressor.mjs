/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Calibration-Only Inheritance Capsule Compressor (Condition III — THE HEIRS)
 *
 * Implements a discrete Information-Bottleneck / 0-1 Knapsack feature & quantization
 * learner trained EXCLUSIVELY on the 48-world calibration/pilot set (PILOT_48).
 *
 * Objective on PILOT_48:
 *   maximize   Σ_{j ∈ S} [ I_pilot(f_j(H); M | Family) + DirectionalAlignment_pilot(f_j) - λ_priv * I_pilot(f_j(H); Sensitive_S) ]
 *   subject to serialized_utf8_bytes(header + encode(S)) <= B_budget
 *              and mutually exclusive quantization groups (coarse vs continuous).
 *
 * Enforces hard fail-closed byte limit verification on every emitted capsule:
 *   Buffer.byteLength(capsuleJson, 'utf8') <= budgetBytes.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { sha256Hex } from './prng.mjs';

export const MEMORY_BUDGETS = Object.freeze({
  B_TIGHT: 96,
  B_STANDARD: 256,
});

function round2(x) {
  return Math.round(x * 100) / 100;
}

/**
 * Computes exact discrete empirical Mutual Information I(X; Y) in bits from paired arrays.
 */
export function computeEmpiricalMutualInformationBits(xs, ys) {
  if (xs.length !== ys.length || xs.length === 0) return 0;
  const n = xs.length;
  const xCounts = new Map();
  const yCounts = new Map();
  const xyCounts = new Map();

  for (let i = 0; i < n; i++) {
    const xk = String(xs[i]);
    const yk = String(ys[i]);
    const xyk = `${xk}|||${yk}`;
    xCounts.set(xk, (xCounts.get(xk) || 0) + 1);
    yCounts.set(yk, (yCounts.get(yk) || 0) + 1);
    xyCounts.set(xyk, (xyCounts.get(xyk) || 0) + 1);
  }

  let mi = 0;
  for (const [xyk, cxy] of xyCounts.entries()) {
    const [xk, yk] = xyk.split('|||');
    const pxy = cxy / n;
    const px = xCounts.get(xk) / n;
    const py = yCounts.get(yk) / n;
    if (pxy > 0 && px > 0 && py > 0) {
      mi += pxy * Math.log2(pxy / (px * py));
    }
  }
  return Math.max(0, mi);
}

/**
 * Computes Miller-Madow finite-sample bias-corrected Mutual Information in bits:
 *   I_MM(X; Y) = max(0, I_plugin(X; Y) - ((|X_obs| - 1)(|Y_obs| - 1)) / (2 * N * ln 2))
 * Prevents high-cardinality random hashes (e.g. F8_ADMIN_DIGEST) from receiving spurious
 * finite-sample MI on small pilot calibration splits (N = 12 per family / 48 total).
 */
export function computeMillerMadowMutualInformationBits(xs, ys) {
  if (xs.length !== ys.length || xs.length === 0) return 0;
  const rawMi = computeEmpiricalMutualInformationBits(xs, ys);
  const kx = new Set(xs.map(String)).size;
  const ky = new Set(ys.map(String)).size;
  const mmPenaltyBits = ((kx - 1) * (ky - 1)) / (2 * xs.length * Math.LN2);
  return Math.max(0, rawMi - mmPenaltyBits);
}

/**
 * Extracts raw candidate feature atoms from a permissible history array H (without secret access).
 */
export function extractCandidateHistoryAtoms(historyRecords) {
  const byCat = new Map();
  for (const rec of historyRecords || []) {
    byCat.set(rec.category, rec);
  }

  const cal = byCat.get('CAT_CALIBRATED_REJECTIONS')?.payload || {};
  const temp = byCat.get('CAT_TEMPORAL_LEDGER')?.payload || {};
  const res = byCat.get('CAT_RESIDUAL_ANOMALIES')?.payload || {};
  const ep0 = byCat.get('CAT_EPOCH0_DRIFT_TRIALS')?.payload || {};
  const prov = byCat.get('CAT_PROVENANCE_AND_SENSITIVE')?.payload || {};
  const adm = byCat.get('CAT_ADMINISTRATIVE_CLUTTER')?.payload || {};

  const slots = ['M_SLOT_0', 'M_SLOT_1', 'M_SLOT_2', 'M_SLOT_3'];
  const calVec = slots.map(s => round2(Number(cal.calibrated_log_support?.[s] ?? 0)));
  // Top-1 argmax index of calibrated support (ultra-compact 1-digit summary)
  let calArgmax = 0;
  for (let i = 1; i < 4; i++) {
    if (calVec[i] > calVec[calArgmax]) calArgmax = i;
  }
  // Coarse 3-level quantized calibrated support in {-1, 0, 1}
  const calCoarse = calVec.map(v => (v > 0.45 ? 1 : (v < -0.45 ? -1 : 0)));

  const tempCompact = [
    Number(temp.withdrawn_claims_count ?? 0),
    temp.precursor_obs_before_primary ? 1 : 0,
  ];

  // Coarse binary anomaly code (0=normal/noisy, 1=nullspace, 2=rupture_or_synergy)
  let resCoarseCode = 0;
  if (res.exterior_nullspace_flag) resCoarseCode = 1;
  else if ((res.path_loop_gap ?? 0) > 0.4 || (res.triad_synergy_excess ?? 0) > 0.4 || ((res.within_cell_var ?? 1) < 0.09 && (res.between_cell_var ?? 0) > 0.14)) {
    resCoarseCode = 2;
  }

  const resFull = [
    round2(Number(res.within_cell_var ?? 0.05)),
    round2(Number(res.between_cell_var ?? 0.05)),
    round2(Number(res.triad_synergy_excess ?? 0)),
    round2(Number(res.path_loop_gap ?? 0)),
    res.exterior_nullspace_flag ? 1 : 0,
    Number(res.dominant_single_coord ?? 0),
  ];

  const ep0Vec = slots.map(s => round2(Number(ep0.legacy_pooled_log_scores?.[s] ?? 0)));
  let ep0Argmax = 0;
  for (let i = 1; i < 4; i++) {
    if (ep0Vec[i] > ep0Vec[ep0Argmax]) ep0Argmax = i;
  }

  const provCode = String(prov.custody_cohort_code || 'NONE').slice(-5);
  const provJitterMod = Number(prov.provenance_jitter_ms ?? 0) % 4;
  const adminPrefix = String(adm.desk_signatures_sha256 || '').slice(0, 6);

  return {
    F1_CAL_COARSE: { group: 'CAL', key: 'cc', value: calCoarse, discreteBin: calCoarse.join(',') },
    F2_CAL_EXACT: { group: 'CAL', key: 'ce', value: calVec, discreteBin: `${calArgmax}:${calCoarse.join(',')}` },
    F3_TEMP_LEDGER: { group: 'TEMP', key: 'tl', value: tempCompact, discreteBin: tempCompact.join(':') },
    F4_RES_COARSE: { group: 'RES', key: 'rc', value: resCoarseCode, discreteBin: String(resCoarseCode) },
    F5_RES_FULL: { group: 'RES', key: 'rf', value: resFull, discreteBin: `${resCoarseCode}:${resFull[0] < 0.09 ? 'L' : 'H'}:${resFull[3] > 0.4 ? 'P' : 'S'}` },
    F6_EPOCH0_DRIFT: { group: 'EP0', key: 'e0', value: ep0Argmax, discreteBin: String(ep0Argmax) },
    F7_PROVENANCE_SENS: { group: 'PROV', key: 'pv', value: [provCode, provJitterMod], discreteBin: `${provCode}:${provJitterMod}` },
    F8_ADMIN_DIGEST: { group: 'ADM', key: 'ad', value: adminPrefix, discreteBin: adminPrefix.slice(0, 1) },
  };
}

/**
 * Trains the Inheritance Capsule Codec EXCLUSIVELY on PILOT_48.
 * Never touches confirmatory worlds.
 */
export function trainCapsuleCodecOnPilot(pilotPublicWorlds, pilotSecretVaultMap, { privacyLambda = 1.25 } = {}) {
  const atomIds = [
    'F1_CAL_COARSE',
    'F2_CAL_EXACT',
    'F3_TEMP_LEDGER',
    'F4_RES_COARSE',
    'F5_RES_FULL',
    'F6_EPOCH0_DRIFT',
    'F7_PROVENANCE_SENS',
    'F8_ADMIN_DIGEST',
  ];

  const extractedPerWorld = pilotPublicWorlds.map(w => ({
    worldId: w.world_public_id,
    family: w.family,
    atoms: extractCandidateHistoryAtoms(w.permissible_full_history),
    secret: pilotSecretVaultMap.get(w.world_public_id),
  }));

  const atomDiagnostics = {};

  const families = ['A_CAUSAL_LOOKALIKES', 'B_HIGHER_ORDER_RELATIONS', 'C_TEMPORAL_INHERITANCE', 'D_IMPOSSIBLE_LIBRARY'];
  const slotIndexedAtoms = new Set(['F1_CAL_COARSE', 'F2_CAL_EXACT', 'F6_EPOCH0_DRIFT']);

  for (const atomId of atomIds) {
    // Compute family-averaged Miller-Madow bias-corrected MI with the 4-class true mechanism target
    let familyMiSum = 0;
    let rawPluginMiSum = 0;
    for (const fam of families) {
      const sub = extractedPerWorld.filter(x => x.family === fam);
      const bins = sub.map(x => x.atoms[atomId].discreteBin);
      const targets = slotIndexedAtoms.has(atomId)
        ? sub.map(x => x.secret.true_mechanism_slot)
        : sub.map(x => x.secret.true_mechanism_archetype);
      rawPluginMiSum += computeEmpiricalMutualInformationBits(bins, targets);
      familyMiSum += computeMillerMadowMutualInformationBits(bins, targets);
    }
    const rawPluginMiBits = round2(rawPluginMiSum / families.length);
    const taskMiBits = round2(familyMiSum / families.length);

    // Compute empirical directional alignment on PILOT_48 (penalizes misleading anti-correlated drift!)
    let directionalGain = 0;
    if (atomId === 'F1_CAL_COARSE' || atomId === 'F2_CAL_EXACT') {
      let hits = 0;
      let marginSum = 0;
      for (const x of extractedPerWorld) {
        const trueIdx = Number(x.secret.true_mechanism_slot.replace('M_SLOT_', ''));
        const vec = x.atoms[atomId].value;
        const maxVal = Math.max(...vec);
        const tieCount = vec.filter(v => v === maxVal).length;
        if (vec[trueIdx] === maxVal) hits += 1 / tieCount;
        const meanOthers = (vec.reduce((a, b) => a + b, 0) - vec[trueIdx]) / 3;
        marginSum += Math.max(-1, Math.min(1.5, (vec[trueIdx] - meanOthers) * 0.35));
      }
      const hitLift = (hits / extractedPerWorld.length) - 0.25;
      const marginAvg = marginSum / extractedPerWorld.length;
      directionalGain = round2(hitLift + 0.55 * marginAvg);
    } else if (atomId === 'F6_EPOCH0_DRIFT') {
      let hits = 0;
      for (const x of extractedPerWorld) {
        const trueIdx = Number(x.secret.true_mechanism_slot.replace('M_SLOT_', ''));
        if (x.atoms.F6_EPOCH0_DRIFT.value === trueIdx) hits += 1;
      }
      const hitRate = hits / extractedPerWorld.length;
      // Relative to uniform 0.25 + 1*SE(N=48) = 0.3125 threshold: negative/zero when founder drift misleads!
      directionalGain = round2(hitRate - 0.32);
    } else if (atomId === 'F3_TEMP_LEDGER') {
      const famC = extractedPerWorld.filter(x => x.family === 'C_TEMPORAL_INHERITANCE');
      const cMi = computeMillerMadowMutualInformationBits(
        famC.map(x => x.atoms.F3_TEMP_LEDGER.discreteBin),
        famC.map(x => x.secret.true_mechanism_archetype)
      );
      directionalGain = round2(0.45 * cMi);
    } else if (atomId === 'F4_RES_COARSE' || atomId === 'F5_RES_FULL') {
      const famBD = extractedPerWorld.filter(
        x => x.family === 'B_HIGHER_ORDER_RELATIONS' || x.family === 'D_IMPOSSIBLE_LIBRARY'
      );
      const bdMi = computeMillerMadowMutualInformationBits(
        famBD.map(x => x.atoms[atomId].discreteBin),
        famBD.map(x => x.secret.true_mechanism_archetype)
      );
      directionalGain = round2((atomId === 'F5_RES_FULL' ? 0.55 : 0.42) * bdMi);
    }

    // Privacy leakage MI (Miller-Madow corrected + raw observable check) against true_sensitive_attribute_S
    const allBins = extractedPerWorld.map(x => x.atoms[atomId].discreteBin);
    const allS = extractedPerWorld.map(x => x.secret.true_sensitive_attribute_S);
    const privacyMiBits = round2(computeMillerMadowMutualInformationBits(allBins, allS));

    // Worst-case JSON fragment byte cost across pilot
    let maxFragmentBytes = 0;
    for (const x of extractedPerWorld) {
      const frag = `"${x.atoms[atomId].key}":${JSON.stringify(x.atoms[atomId].value)},`;
      const b = Buffer.byteLength(frag, 'utf8');
      if (b > maxFragmentBytes) maxFragmentBytes = b;
    }

    const netObjective = round2(taskMiBits + directionalGain - privacyLambda * privacyMiBits);

    atomDiagnostics[atomId] = {
      atom_id: atomId,
      group: extractedPerWorld[0].atoms[atomId].group,
      key: extractedPerWorld[0].atoms[atomId].key,
      pilot_raw_plugin_mi_bits: rawPluginMiBits,
      pilot_task_mi_bits: taskMiBits,
      pilot_directional_gain: directionalGain,
      pilot_privacy_mi_bits: privacyMiBits,
      net_bottleneck_score: netObjective,
      eligible_positive_alignment: directionalGain > 0.06 && netObjective > 0.12,
      worst_case_fragment_bytes: maxFragmentBytes,
    };
  }

  // Solve exact 0-1 subset selection over eligible positive-utility atoms for each budget tier
  const selectedByBudget = {};
  const baseEnvelopeWorstBytes = Buffer.byteLength('{"s":"td613.z1","w":"CONFIRMATORY_96_D_Q99_W3"}', 'utf8') + 2;

  for (const [budgetName, budgetBytes] of Object.entries(MEMORY_BUDGETS)) {
    const availPayloadBytes = budgetBytes - baseEnvelopeWorstBytes;
    const positiveAtoms = atomIds.filter(id => atomDiagnostics[id].eligible_positive_alignment);

    let bestSubset = [];
    let bestScore = -Infinity;

    const totalMasks = 1 << positiveAtoms.length;
    for (let mask = 0; mask < totalMasks; mask++) {
      const chosen = [];
      const seenGroups = new Set();
      let valid = true;
      let bytesUsed = 0;
      let score = 0;

      for (let bit = 0; bit < positiveAtoms.length; bit++) {
        if ((mask >> bit) & 1) {
          const id = positiveAtoms[bit];
          const diag = atomDiagnostics[id];
          if (seenGroups.has(diag.group)) {
            valid = false; // mutually exclusive quantization tiers per group
            break;
          }
          seenGroups.add(diag.group);
          chosen.push(id);
          bytesUsed += diag.worst_case_fragment_bytes;
          score += diag.net_bottleneck_score;
        }
      }

      if (valid && bytesUsed <= availPayloadBytes && score > bestScore) {
        bestScore = score;
        bestSubset = chosen;
      }
    }

    selectedByBudget[budgetName] = {
      budget_bytes: budgetBytes,
      available_payload_bytes: availPayloadBytes,
      selected_atoms: bestSubset,
      objective_score: round2(bestScore),
    };
  }

  const codecPayload = {
    schema: 'td613.palace.trained-capsule-codec/v1',
    trained_exclusively_on_suite: 'PILOT_48',
    pilot_worlds_count: pilotPublicWorlds.length,
    confirmatory_worlds_touched: 0,
    privacy_penalty_lambda: privacyLambda,
    atom_diagnostics: atomDiagnostics,
    selected_subsets_by_budget: selectedByBudget,
  };

  return Object.freeze({
    ...codecPayload,
    codec_sha256: sha256Hex(JSON.stringify(codecPayload)),
  });
}

/**
 * Encodes a single world's permissible history H into a strict-budget JSON capsule Z.
 * Throws fail-closed error if serialized UTF-8 bytes exceed budgetBytes.
 */
export function encodeInheritanceCapsule({ worldPublicId, historyRecords, trainedCodec, budgetBytes }) {
  const budgetKey = budgetBytes <= MEMORY_BUDGETS.B_TIGHT ? 'B_TIGHT' : 'B_STANDARD';
  const plan = trainedCodec.selected_subsets_by_budget[budgetKey];
  if (!plan) {
    throw new Error(`No trained capsule plan found for budget ${budgetBytes}`);
  }

  const atoms = extractCandidateHistoryAtoms(historyRecords);
  const capsuleObj = {
    s: 'td613.z1',
    w: worldPublicId,
  };

  for (const atomId of plan.selected_atoms) {
    const atom = atoms[atomId];
    capsuleObj[atom.key] = atom.value;
  }

  const capsuleJson = JSON.stringify(capsuleObj);
  const byteLen = Buffer.byteLength(capsuleJson, 'utf8');
  if (byteLen > budgetBytes) {
    throw new Error(
      `[CAPSULE_BUDGET_EXCEEDED] Capsule for ${worldPublicId} is ${byteLen} bytes > limit ${budgetBytes} bytes.`
    );
  }

  return {
    capsule_object: capsuleObj,
    capsule_json: capsuleJson,
    byte_length: byteLen,
  };
}
