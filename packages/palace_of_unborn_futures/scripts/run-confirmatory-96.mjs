/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Phase 2A Runner: Frozen 96-World Confirmatory Suite & Privacy Disclosure Assay
 *
 * Enforces Section V & VI chronological separation:
 *   1. Verifies byte-for-byte SHA-256 digests of all frozen source modules and
 *      the PILOT_48-trained capsule codec against preregistration/frozen-confirmatory-lock.json
 *      (committed in Git Commit 24b57b1b2d0b69ccaf94bdcea9c4a8e7ef73247c prior to confirmatory scoring).
 *   2. Generates CONFIRMATORY_96 (96 worlds = 24 Iso-Π Quartets = 24 worlds per family)
 *      and verifies cryptographic disjointness from PILOT_48.
 *   3. Evaluates all 6 competing heirs + 2 noncompeting controls across B_TIGHT (96B)
 *      and B_STANDARD (256B) with ZERO adaptation of codec or scoring rules.
 *   4. Executes the out-of-sample Privacy-Sensitive Synthetic Reconstruction Assay.
 *   5. Emits receipts/confirmatory-96-receipt.json and receipts/privacy-disclosure-receipt.json.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { FAMILIES, generateSyntheticWorldSuite } from '../src/world-generator.mjs';
import {
  PREREGISTERED_NONINFERIORITY_MARGIN,
  evaluateWorldSuiteAcrossBudgets,
  computePairedContrastStatistics,
} from '../src/evaluator.mjs';
import { runPrivacyDisclosureAssay } from '../src/privacy-disclosure-assay.mjs';
import { sha256Hex } from '../src/prng.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const RECEIPTS_DIR = path.join(PKG_ROOT, 'receipts');
const LOCK_PATH = path.join(PKG_ROOT, 'preregistration', 'frozen-confirmatory-lock.json');
const FROZEN_PROTOCOL_COMMIT_SHA = '24b57b1b2d0b69ccaf94bdcea9c4a8e7ef73247c';

console.log('================================================================');
console.log('THE PALACE OF UNBORN FUTURES · 96-WORLD CONFIRMATORY EVALUATION');
console.log('================================================================\n');

// Step 0: Verify Frozen Protocol Lock fail-closed
const lockManifest = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
const lockVerifications = [];
for (const [relPath, expected] of Object.entries(lockManifest.locked_artifacts)) {
  const absPath = path.join(PKG_ROOT, relPath);
  const rawBytes = fs.readFileSync(absPath);
  const actualSha = sha256Hex(rawBytes);
  if (rawBytes.length !== expected.bytes || actualSha !== expected.sha256) {
    throw new Error(
      `[CONFIRMATORY_LOCK_MISMATCH] ${relPath}: expected (${expected.bytes}B, ${expected.sha256}), got (${rawBytes.length}B, ${actualSha})`
    );
  }
  lockVerifications.push({
    artifact: relPath,
    bytes: rawBytes.length,
    sha256: actualSha,
    matched_frozen_lock: true,
  });
}
console.log(`[0/5] Verified ${lockVerifications.length}/${lockVerifications.length} locked artifacts against frozen-confirmatory-lock.json (Commit ${FROZEN_PROTOCOL_COMMIT_SHA.slice(0, 9)}).`);

// Load frozen calibration-trained codec (NO retraining!)
const codecPath = path.join(RECEIPTS_DIR, 'trained-capsule-codec-v1.json');
const trainedCodec = JSON.parse(fs.readFileSync(codecPath, 'utf8'));

// Regenerate PILOT_48 strictly for disjointness audit & privacy-adversary training split
const pilotSuite = generateSyntheticWorldSuite({
  suiteName: 'PILOT_48',
  masterSeed: 'TD613_PALACE_PILOT_48_SEED_V1',
  totalWorlds: 48,
});

// Step 1: Generate held-out 96-world confirmatory suite
const confirmatorySuite = generateSyntheticWorldSuite({
  suiteName: lockManifest.confirmatory_suite_target.suite_name,
  masterSeed: lockManifest.confirmatory_suite_target.master_seed,
  totalWorlds: lockManifest.confirmatory_suite_target.total_worlds,
});

const pilotIds = new Set(pilotSuite.publicWorlds.map(w => w.world_public_id));
const pilotPi = new Set(pilotSuite.publicWorlds.map(w => w.terminal_graph_pi.projection_digest));
const pilotHist = new Set(pilotSuite.publicWorlds.map(w => w.permissible_history_digest));

let sharedIds = 0;
let sharedPi = 0;
let sharedHist = 0;
for (const w of confirmatorySuite.publicWorlds) {
  if (pilotIds.has(w.world_public_id)) sharedIds++;
  if (pilotPi.has(w.terminal_graph_pi.projection_digest)) sharedPi++;
  if (pilotHist.has(w.permissible_history_digest)) sharedHist++;
}
if (sharedIds > 0 || sharedPi > 0 || sharedHist > 0) {
  throw new Error(`[SPLIT_CONTAMINATION] Overlap detected between PILOT_48 and CONFIRMATORY_96!`);
}

console.log(`[1/5] Generated ${confirmatorySuite.total_worlds} confirmatory worlds across ${confirmatorySuite.quartet_verifications.length} Iso-Π Quartets.`);
console.log(`      All 24 Quartet Π(G) digests equal: ${confirmatorySuite.quartet_verifications.every(q => q.all_four_pi_equal)}`);
console.log(`      Disjointness vs PILOT_48: shared_ids=${sharedIds}, shared_pi=${sharedPi}, shared_hist=${sharedHist}`);

// Step 2: Evaluate CONFIRMATORY_96 across B_TIGHT (96B) and B_STANDARD (256B)
const confEval = evaluateWorldSuiteAcrossBudgets({
  suite: confirmatorySuite,
  trainedCodec,
  budgets: [96, 256],
  evaluationSeed: lockManifest.confirmatory_suite_target.evaluation_seed,
});

// Compute per-family paired contrasts & failure case diagnostics so heterogeneous behavior is never collapsed
const enrichedResultsByBudget = {};
for (const [bKey, bVal] of Object.entries(confEval.results_by_budget)) {
  const rowsByCond = bVal.episode_rows_by_condition;
  const perFamilyContrasts = {};

  for (const fam of FAMILIES) {
    const fRows = cond => rowsByCond[cond].filter(r => r.family === fam);
    const zVsH = computePairedContrastStatistics(
      fRows('III_HEIRS'),
      fRows('II_ARCHIVISTS'),
      r => r.utility,
      `fam_boot::${bKey}::${fam}::ZvsH`
    );
    perFamilyContrasts[fam] = {
      delta_U_H_archivists_minus_amnesiacs: computePairedContrastStatistics(
        fRows('II_ARCHIVISTS'),
        fRows('I_AMNESIACS'),
        r => r.utility,
        `fam_boot::${bKey}::${fam}::dUH`
      ),
      delta_U_Z_heirs_minus_amnesiacs: computePairedContrastStatistics(
        fRows('III_HEIRS'),
        fRows('I_AMNESIACS'),
        r => r.utility,
        `fam_boot::${bKey}::${fam}::dUZ`
      ),
      heirs_minus_archivists: {
        ...zVsH,
        noninferiority_supported_in_family: zVsH.ci95_low > -PREREGISTERED_NONINFERIORITY_MARGIN,
      },
      revisionists_minus_archivists: computePairedContrastStatistics(
        fRows('VI_REVISIONISTS'),
        fRows('II_ARCHIVISTS'),
        r => r.utility,
        `fam_boot::${bKey}::${fam}::RevVsArch`
      ),
      exiles_minus_amnesiacs: computePairedContrastStatistics(
        fRows('V_EXILES'),
        fRows('I_AMNESIACS'),
        r => r.utility,
        `fam_boot::${bKey}::${fam}::ExVsAmn`
      ),
      false_prophets_minus_amnesiacs: computePairedContrastStatistics(
        fRows('IV_FALSE_PROPHETS'),
        fRows('I_AMNESIACS'),
        r => r.utility,
        `fam_boot::${bKey}::${fam}::FPVsAmn`
      ),
    };
  }

  // Extract explicit failure cases for inspection (Deliverable 5 & 8)
  const archivistFailures = rowsByCond.II_ARCHIVISTS
    .filter(r => r.terminal_correct_binary === 0)
    .slice(0, 8)
    .map(r => ({
      world_public_id: r.world_public_id,
      family: r.family,
      archetype: r.archetype,
      has_strong_epoch0_drift: r.has_strong_epoch0_drift,
      chosen_probe_id: r.chosen_probe_id,
      declared: r.declared_mechanism_or_abstain,
      stated_confidence: r.stated_confidence,
      utility: r.utility,
    }));

  const heirsFailures = rowsByCond.III_HEIRS
    .filter(r => r.terminal_correct_binary === 0)
    .slice(0, 8)
    .map(r => ({
      world_public_id: r.world_public_id,
      family: r.family,
      archetype: r.archetype,
      chosen_probe_id: r.chosen_probe_id,
      declared: r.declared_mechanism_or_abstain,
      stated_confidence: r.stated_confidence,
      utility: r.utility,
    }));

  const revisionistFailures = rowsByCond.VI_REVISIONISTS
    .filter(r => r.terminal_correct_binary === 0)
    .slice(0, 8)
    .map(r => ({
      world_public_id: r.world_public_id,
      family: r.family,
      archetype: r.archetype,
      chosen_probe_id: r.chosen_probe_id,
      declared: r.declared_mechanism_or_abstain,
      stated_confidence: r.stated_confidence,
      utility: r.utility,
    }));

  enrichedResultsByBudget[bKey] = {
    budget_bytes: bVal.budget_bytes,
    condition_summaries: bVal.condition_summaries,
    by_family_summaries: bVal.by_family_summaries,
    paired_contrasts: bVal.paired_contrasts,
    per_family_paired_contrasts: perFamilyContrasts,
    sample_failure_cases: {
      II_ARCHIVISTS: archivistFailures,
      III_HEIRS: heirsFailures,
      VI_REVISIONISTS: revisionistFailures,
    },
    episode_table_sha256: sha256Hex(JSON.stringify(rowsByCond)),
  };
}

console.log('\n[2/5] Confirmatory Results Summary — B_STANDARD (256B):');
for (const [cond, sum] of Object.entries(enrichedResultsByBudget.B_STANDARD_256B.condition_summaries)) {
  console.log(
    `  ${cond.padEnd(20)} | U=${sum.mean_utility.toFixed(4)} | Regret=${sum.mean_regret_vs_oracle.toFixed(4)} | ID=${String(sum.identifiable_mechanism_success_rate).padEnd(6)} | AbstainD3=${String(sum.unidentifiable_correct_abstention_rate).padEnd(6)} | FalseClaim=${sum.false_scientific_claim_rate.toFixed(4)} | Brier=${sum.mean_brier_score.toFixed(4)} | ConfWrong=${String(sum.mean_confidence_when_wrong).padEnd(6)} | Bytes=${sum.mean_retained_bytes.toFixed(1)}`
  );
}

console.log('\n      Confirmatory Results Summary — B_TIGHT (96B):');
for (const [cond, sum] of Object.entries(enrichedResultsByBudget.B_TIGHT_96B.condition_summaries)) {
  console.log(
    `  ${cond.padEnd(20)} | U=${sum.mean_utility.toFixed(4)} | Regret=${sum.mean_regret_vs_oracle.toFixed(4)} | ID=${String(sum.identifiable_mechanism_success_rate).padEnd(6)} | AbstainD3=${String(sum.unidentifiable_correct_abstention_rate).padEnd(6)} | FalseClaim=${sum.false_scientific_claim_rate.toFixed(4)} | Brier=${sum.mean_brier_score.toFixed(4)} | ConfWrong=${String(sum.mean_confidence_when_wrong).padEnd(6)} | Bytes=${sum.mean_retained_bytes.toFixed(1)}`
  );
}

console.log('\n[3/5] Key Confirmatory Contrasts (256B vs 96B):');
for (const bKey of ['B_STANDARD_256B', 'B_TIGHT_96B']) {
  const pc = enrichedResultsByBudget[bKey].paired_contrasts;
  console.log(`  --- ${bKey} ---`);
  console.log(`    ΔU_H (Archivists - Amnesiacs)   : ${pc.delta_U_H_archivists_minus_amnesiacs.mean_diff}  95% CI [${pc.delta_U_H_archivists_minus_amnesiacs.ci95_low}, ${pc.delta_U_H_archivists_minus_amnesiacs.ci95_high}]  dz=${pc.delta_U_H_archivists_minus_amnesiacs.cohens_dz}  p=${pc.delta_U_H_archivists_minus_amnesiacs.two_sided_signflip_p}`);
  console.log(`    ΔU_Z (Heirs - Amnesiacs)        : ${pc.delta_U_Z_heirs_minus_amnesiacs.mean_diff}  95% CI [${pc.delta_U_Z_heirs_minus_amnesiacs.ci95_low}, ${pc.delta_U_Z_heirs_minus_amnesiacs.ci95_high}]  dz=${pc.delta_U_Z_heirs_minus_amnesiacs.cohens_dz}  p=${pc.delta_U_Z_heirs_minus_amnesiacs.two_sided_signflip_p}`);
  console.log(`    Heirs - Archivists (NI >-0.05)  : ${pc.heirs_minus_archivists_noninferiority.mean_diff}  95% CI [${pc.heirs_minus_archivists_noninferiority.ci95_low}, ${pc.heirs_minus_archivists_noninferiority.ci95_high}]  NI=${pc.heirs_minus_archivists_noninferiority.noninferiority_supported}`);
  console.log(`    Revisionists - Archivists       : ${pc.revisionists_minus_archivists.mean_diff}  95% CI [${pc.revisionists_minus_archivists.ci95_low}, ${pc.revisionists_minus_archivists.ci95_high}]  p=${pc.revisionists_minus_archivists.two_sided_signflip_p}`);
  console.log(`    False Prophets - Amnesiacs      : ${pc.false_prophets_minus_amnesiacs.mean_diff}  95% CI [${pc.false_prophets_minus_amnesiacs.ci95_low}, ${pc.false_prophets_minus_amnesiacs.ci95_high}]  p=${pc.false_prophets_minus_amnesiacs.two_sided_signflip_p}`);
  console.log(`    Exiles - Amnesiacs              : ${pc.exiles_minus_amnesiacs.mean_diff}  95% CI [${pc.exiles_minus_amnesiacs.ci95_low}, ${pc.exiles_minus_amnesiacs.ci95_high}]  p=${pc.exiles_minus_amnesiacs.two_sided_signflip_p}`);
  console.log(`    Exiles - False Prophets (Brier) : ${pc.exiles_minus_false_prophets_brier_error.mean_diff}  95% CI [${pc.exiles_minus_false_prophets_brier_error.ci95_low}, ${pc.exiles_minus_false_prophets_brier_error.ci95_high}]`);
}

// Step 3: Out-of-Sample Privacy-Sensitive Synthetic Reconstruction Assay
const privacyReceipt = runPrivacyDisclosureAssay({
  pilotSuite,
  confirmatorySuite,
  trainedCodec,
});

console.log('\n[4/5] Privacy-Sensitive Synthetic Attribute S Reconstruction (Out-of-Sample on CONFIRMATORY_96):');
for (const [repId, rep] of Object.entries(privacyReceipt.representations)) {
  const a2 = rep.attacks_on_confirmatory_96.ATK_2_DIRECT_TAG_SCAN;
  const a3 = rep.attacks_on_confirmatory_96.ATK_3_STRONG_BAYESIAN_SIDECHANNEL;
  console.log(
    `  ${repId.padEnd(28)} | Bytes=${String(rep.mean_serialized_bytes).padEnd(8)} | DirectAcc=${a2.attack_accuracy.toFixed(4)} | StrongBayesAcc=${a3.attack_accuracy.toFixed(4)} [${a3.accuracy_ci95[0]}, ${a3.accuracy_ci95[1]}] | MM_MI=${a3.miller_madow_corrected_mi_bits.toFixed(4)} bits`
  );
}

const confirmatoryReceipt = {
  schema: 'td613.palace.confirmatory-96-receipt/v1',
  authority: 'SAC[X6ZNK5NO51]',
  covenant: 'Khona‌lit-po',
  supervision_mode: 'INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL',
  independent_external_blinding: false,
  frozen_protocol_commit_sha: FROZEN_PROTOCOL_COMMIT_SHA,
  lock_verifications: lockVerifications,
  disjointness_audit_vs_pilot_48: {
    pilot_worlds: pilotSuite.total_worlds,
    confirmatory_worlds: confirmatorySuite.total_worlds,
    shared_world_ids: sharedIds,
    shared_terminal_pi_digests: sharedPi,
    shared_history_digests: sharedHist,
  },
  suite_name: confirmatorySuite.suite_name,
  master_seed: confirmatorySuite.master_seed,
  total_worlds: confirmatorySuite.total_worlds,
  quartet_verifications: confirmatorySuite.quartet_verifications,
  trained_codec_sha256: trainedCodec.codec_sha256,
  vault_access_audit_log: {
    supervision_classification: confEval.vault_access_audit_log.supervision_classification,
    independent_external_blinding: confEval.vault_access_audit_log.independent_external_blinding,
    competing_conditions_secret_access_count: confEval.vault_access_audit_log.competing_conditions_secret_access_count,
    random_control_secret_access_count: confEval.vault_access_audit_log.random_control_secret_access_count,
    oracle_control_secret_access_count: confEval.vault_access_audit_log.oracle_control_secret_access_count,
  },
  results_by_budget: enrichedResultsByBudget,
};

const confReceiptPath = path.join(RECEIPTS_DIR, 'confirmatory-96-receipt.json');
const privReceiptPath = path.join(RECEIPTS_DIR, 'privacy-disclosure-receipt.json');
fs.writeFileSync(confReceiptPath, JSON.stringify(confirmatoryReceipt, null, 2) + '\n', 'utf8');
fs.writeFileSync(privReceiptPath, JSON.stringify(privacyReceipt, null, 2) + '\n', 'utf8');

console.log(`\n[5/5] Wrote Confirmatory Receipt (${confReceiptPath}) and Privacy Receipt (${privReceiptPath}).`);
