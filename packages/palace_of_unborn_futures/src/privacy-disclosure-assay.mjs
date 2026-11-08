/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Privacy-Sensitive Synthetic Reconstruction Assay (Deliverable 6)
 *
 * Evaluates adversarial recovery of the synthetic 4-class sensitive attribute S ∈ {0,1,2,3}
 * (balanced prior P(S = s) = 1/4, H(S) = 2.000 bits) from:
 *   1. Complete Permissible History H (Condition II: THE ARCHIVISTS)
 *   2. Naive Key-Redacted History (strips explicit cohort & box serial keys, leaving timing/stylometric side-channels)
 *   3. Inheritance Capsule Z at B_STANDARD = 256B (Condition III: THE HEIRS)
 *   4. Inheritance Capsule Z at B_TIGHT = 96B (Condition III: THE HEIRS)
 *   5. Selective Working Memory at B_STANDARD = 256B (Condition VI: THE REVISIONISTS)
 *   6. Selective Working Memory at B_TIGHT = 96B (Condition VI: THE REVISIONISTS)
 *   7. Terminal Encyclopedia Π(G) Alone (Condition I: THE AMNESIACS)
 *
 * Attack baselines trained EXCLUSIVELY on PILOT_48 and evaluated out-of-sample on CONFIRMATORY_96:
 *   - ATK_1_TRIVIAL_MAJORITY : Predicts pilot modal class (chance = 25%).
 *   - ATK_2_DIRECT_TAG_SCAN  : Regex scan for explicit cohort codes & box serial offsets.
 *   - ATK_3_STRONG_BAYES     : Laplace-smoothed Multinomial Naive Bayes over word bigrams,
 *                              millisecond jitter mod 4, byte-length bins, and JSON keys.
 *
 * Explicit non-equivalence boundary:
 *   Low synthetic reconstruction accuracy does NOT establish real-world confidentiality.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import { prepareConditionInheritance } from './heirs-and-policies.mjs';
import { computeEmpiricalMutualInformationBits } from './capsule-compressor.mjs';
import { DeterministicRng } from './prng.mjs';

function round4(x) {
  return Math.round(x * 10000) / 10000;
}

function buildNaiveKeyRedactedHistory(fullHistory) {
  const clone = JSON.parse(JSON.stringify(fullHistory));
  for (const r of clone) {
    if (r.payload) {
      delete r.payload.custody_cohort_code;
      delete r.payload.archive_box_serial;
      // Leaves intake_clerk_note phrasing and timestamp millisecond jitter intact!
    }
  }
  return clone;
}

function serializeRepresentation(repId, pubW, trainedCodec) {
  if (repId === 'FULL_HISTORY_ARCHIVISTS') {
    return JSON.stringify(pubW.permissible_full_history);
  }
  if (repId === 'NAIVE_KEY_REDACTED_CONTROL') {
    return JSON.stringify(buildNaiveKeyRedactedHistory(pubW.permissible_full_history));
  }
  if (repId === 'HEIRS_CAPSULE_256B') {
    const inh = prepareConditionInheritance({
      conditionId: 'III_HEIRS',
      publicWorld: pubW,
      budgetBytes: 256,
      trainedCodec,
    });
    return JSON.stringify(inh.inherited_payload);
  }
  if (repId === 'HEIRS_CAPSULE_96B') {
    const inh = prepareConditionInheritance({
      conditionId: 'III_HEIRS',
      publicWorld: pubW,
      budgetBytes: 96,
      trainedCodec,
    });
    return JSON.stringify(inh.inherited_payload);
  }
  if (repId === 'REVISIONISTS_MEM_256B') {
    const inh = prepareConditionInheritance({
      conditionId: 'VI_REVISIONISTS',
      publicWorld: pubW,
      budgetBytes: 256,
      trainedCodec,
    });
    return JSON.stringify(inh.inherited_payload);
  }
  if (repId === 'REVISIONISTS_MEM_96B') {
    const inh = prepareConditionInheritance({
      conditionId: 'VI_REVISIONISTS',
      publicWorld: pubW,
      budgetBytes: 96,
      trainedCodec,
    });
    return JSON.stringify(inh.inherited_payload);
  }
  if (repId === 'AMNESIACS_TERMINAL_PI') {
    return pubW.terminal_graph_pi.canonical_json;
  }
  throw new Error(`Unknown representation ID: ${repId}`);
}

/**
 * Extracts discrete stylometric, timing-modulo, structural, and lexical tokens from serialized text.
 */
function extractAdversarialTokens(serializedText) {
  const tokens = [];
  // 1. Word unigrams & bigrams
  const words = serializedText
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length >= 2 && !w.startsWith('pilot_') && !w.startsWith('confirmatory_'));

  for (let i = 0; i < words.length; i++) {
    tokens.push(`u:${words[i]}`);
    if (i + 1 < words.length) {
      tokens.push(`b:${words[i]}_${words[i + 1]}`);
    }
  }

  // 2. Timestamp millisecond modulo 4 side-channel (e.g. .514Z -> 514 % 4)
  const msMatches = serializedText.matchAll(/\.(\d{3})Z/g);
  for (const m of msMatches) {
    const msVal = Number(m[1]);
    tokens.push(`ms_mod4:${msVal % 4}`);
  }

  // 3. Byte-length coarse quantile
  const bLen = Buffer.byteLength(serializedText, 'utf8');
  tokens.push(`len_bin:${Math.floor(bLen / 64)}`);

  return tokens;
}

function trainStrongBayesianAdversary(trainTexts, trainLabels) {
  const numClasses = 4;
  const classCounts = [0, 0, 0, 0];
  const tokenCountsByClass = [new Map(), new Map(), new Map(), new Map()];
  const totalTokensByClass = [0, 0, 0, 0];
  const vocab = new Set();

  for (let i = 0; i < trainTexts.length; i++) {
    const y = trainLabels[i];
    classCounts[y] += 1;
    const toks = extractAdversarialTokens(trainTexts[i]);
    for (const t of toks) {
      vocab.add(t);
      tokenCountsByClass[y].set(t, (tokenCountsByClass[y].get(t) || 0) + 1);
      totalTokensByClass[y] += 1;
    }
  }

  let modalClass = 0;
  for (let c = 1; c < numClasses; c++) {
    if (classCounts[c] > classCounts[modalClass]) modalClass = c;
  }

  return {
    modalClass,
    classCounts,
    tokenCountsByClass,
    totalTokensByClass,
    vocabSize: Math.max(1, vocab.size),
    totalDocs: trainTexts.length,
  };
}

function predictDirectTagScan(serializedText, fallbackClass = 0) {
  if (serializedText.includes('COHORT_CHERSONESOS_ALPHA')) return 0;
  if (serializedText.includes('COHORT_BOSPORAN_BETA')) return 1;
  if (serializedText.includes('COHORT_OLBIA_GAMMA')) return 2;
  if (serializedText.includes('COHORT_THEODOSIA_DELTA')) return 3;
  return fallbackClass;
}

function predictStrongBayesian(model, serializedText) {
  const toks = extractAdversarialTokens(serializedText);
  let bestClass = 0;
  let bestLogProb = -Infinity;

  for (let c = 0; c < 4; c++) {
    let lp = Math.log((model.classCounts[c] + 1) / (model.totalDocs + 4));
    const denom = model.totalTokensByClass[c] + 0.5 * model.vocabSize;
    const cmap = model.tokenCountsByClass[c];
    for (const t of toks) {
      if (cmap.has(t)) {
        lp += Math.log((cmap.get(t) + 0.5) / denom);
      } else {
        lp += Math.log(0.5 / denom);
      }
    }
    if (lp > bestLogProb) {
      bestLogProb = lp;
      bestClass = c;
    }
  }
  return bestClass;
}

/**
 * Miller-Madow bias-corrected discrete mutual information I(S; S_hat) in bits
 * over 4x4 confusion table under observed finite sample N.
 */
function computeConfusionMutualInfo(trueS, predS) {
  const rawMi = computeEmpiricalMutualInformationBits(trueS, predS);
  const occupiedCells = new Set(trueS.map((s, i) => `${s}:${predS[i]}`)).size;
  const occupiedRows = new Set(trueS).size;
  const occupiedCols = new Set(predS).size;
  const df = Math.max(0, occupiedCells - occupiedRows - occupiedCols + 1);
  const mmBias = df / (2 * trueS.length * Math.LN2);
  return {
    plugin_mi_bits: round4(rawMi),
    miller_madow_corrected_mi_bits: round4(Math.max(0, rawMi - mmBias)),
  };
}

function bootstrapAccuracyCi(correctFlags, seed) {
  const rng = new DeterministicRng(seed);
  const n = correctFlags.length;
  const boots = [];
  for (let b = 0; b < 2000; b++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += correctFlags[rng.nextInt(0, n)];
    boots.push(s / n);
  }
  boots.sort((a, b) => a - b);
  return [round4(boots[50]), round4(boots[1950])];
}

export function runPrivacyDisclosureAssay({ pilotSuite, confirmatorySuite, trainedCodec }) {
  const representations = [
    'FULL_HISTORY_ARCHIVISTS',
    'NAIVE_KEY_REDACTED_CONTROL',
    'HEIRS_CAPSULE_256B',
    'HEIRS_CAPSULE_96B',
    'REVISIONISTS_MEM_256B',
    'REVISIONISTS_MEM_96B',
    'AMNESIACS_TERMINAL_PI',
  ];

  const pilotLabels = pilotSuite.publicWorlds.map(
    w => pilotSuite.secretVaultMap.get(w.world_public_id).true_sensitive_attribute_S
  );
  const confLabels = confirmatorySuite.publicWorlds.map(
    w => confirmatorySuite.secretVaultMap.get(w.world_public_id).true_sensitive_attribute_S
  );

  const reportByRepresentation = {};

  for (const repId of representations) {
    const trainTexts = pilotSuite.publicWorlds.map(w => serializeRepresentation(repId, w, trainedCodec));
    const testTexts = confirmatorySuite.publicWorlds.map(w => serializeRepresentation(repId, w, trainedCodec));
    const avgBytes = testTexts.reduce((s, t) => s + Buffer.byteLength(t, 'utf8'), 0) / testTexts.length;

    const nbModel = trainStrongBayesianAdversary(trainTexts, pilotLabels);

    const predTrivial = testTexts.map(() => nbModel.modalClass);
    const predDirect = testTexts.map(t => predictDirectTagScan(t, nbModel.modalClass));
    const predStrong = testTexts.map(t => predictStrongBayesian(nbModel, t));

    const scoreAttack = (preds, tag) => {
      const flags = preds.map((p, i) => (p === confLabels[i] ? 1 : 0));
      const acc = flags.reduce((a, b) => a + b, 0) / flags.length;
      const [ciLow, ciHigh] = bootstrapAccuracyCi(flags, `priv_boot::${repId}::${tag}`);
      const mi = computeConfusionMutualInfo(confLabels, preds);
      return {
        attack_accuracy: round4(acc),
        accuracy_ci95: [ciLow, ciHigh],
        excess_over_chance_25pct: round4(acc - 0.25),
        ...mi,
      };
    };

    reportByRepresentation[repId] = {
      representation_id: repId,
      mean_serialized_bytes: round4(avgBytes),
      chance_accuracy_theoretical: 0.25,
      source_entropy_bits_theoretical: 2.0,
      attacks_on_confirmatory_96: {
        ATK_1_TRIVIAL_MAJORITY: scoreAttack(predTrivial, 'trivial'),
        ATK_2_DIRECT_TAG_SCAN: scoreAttack(predDirect, 'direct'),
        ATK_3_STRONG_BAYESIAN_SIDECHANNEL: scoreAttack(predStrong, 'strong'),
      },
    };
  }

  return {
    schema: 'td613.palace.privacy-disclosure-receipt/v1',
    authority: 'SAC[X6ZNK5NO51]',
    covenant: 'Khona‌lit-po',
    probability_model_declaration: {
      sensitive_attribute: 'S ∈ {0, 1, 2, 3} discrete synthetic custodian-cohort signature',
      generating_distribution: 'Independent discrete uniform DiscreteUniform({0,1,2,3}) per world via seeded HMAC-SHA256 PRNG',
      mutual_information_estimator: 'Discrete 4x4 confusion-matrix plug-in MI I(S; S_hat) and Miller-Madow finite-sample bias-corrected MI on held-out CONFIRMATORY_96',
      mandatory_warning: 'Low measured reconstruction accuracy on synthetic tasks does NOT establish real-world confidentiality or cryptographic secrecy.',
    },
    representations: reportByRepresentation,
  };
}
