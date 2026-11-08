/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Phase 1 Runner: 48-World Source-Free Pilot & Calibration Codec Training (PILOT_48)
 *
 * Executes exclusively on PILOT_48:
 *   1. Generates 48 synthetic worlds (12 per family = 3 Iso-Π Quartets x 4 mechanisms).
 *   2. Verifies exact SHA-256 terminal graph equality across every Iso-Π Quartet.
 *   3. Trains Condition III's Inheritance Capsule Codec exclusively on PILOT_48.
 *   4. Evaluates all 6 inheritance conditions + 2 controls across B_TIGHT (96B) and B_STANDARD (256B).
 *   5. Checks for floor/ceiling pathologies and records pilot diagnostics.
 *   6. Emits receipts/trained-capsule-codec-v1.json and receipts/pilot-48-receipt.json.
 *
 * Does NOT generate, inspect, or score CONFIRMATORY_96.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateSyntheticWorldSuite } from '../src/world-generator.mjs';
import { trainCapsuleCodecOnPilot } from '../src/capsule-compressor.mjs';
import { evaluateWorldSuiteAcrossBudgets } from '../src/evaluator.mjs';
import { sha256Hex } from '../src/prng.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const RECEIPTS_DIR = path.join(PKG_ROOT, 'receipts');

console.log('================================================================');
console.log('THE PALACE OF UNBORN FUTURES · 48-WORLD SOURCE-FREE PILOT');
console.log('================================================================\n');

const pilotSuite = generateSyntheticWorldSuite({
  suiteName: 'PILOT_48',
  masterSeed: 'TD613_PALACE_PILOT_48_SEED_V1',
  totalWorlds: 48,
});

console.log(`[1/4] Generated ${pilotSuite.total_worlds} pilot worlds across ${pilotSuite.quartet_verifications.length} Iso-Π Quartets.`);
console.log(`      All Quartet Π(G) digests verified equal: ${pilotSuite.quartet_verifications.every(q => q.all_four_pi_equal)}`);

const trainedCodec = trainCapsuleCodecOnPilot(pilotSuite.publicWorlds, pilotSuite.secretVaultMap);
const codecPath = path.join(RECEIPTS_DIR, 'trained-capsule-codec-v1.json');
fs.writeFileSync(codecPath, JSON.stringify(trainedCodec, null, 2) + '\n', 'utf8');

console.log(`[2/4] Trained Capsule Codec exclusively on PILOT_48 (SHA-256: ${trainedCodec.codec_sha256.slice(0, 16)}...)`);
console.log(`      B_TIGHT (96B) selected atoms   : ${trainedCodec.selected_subsets_by_budget.B_TIGHT.selected_atoms.join(', ')}`);
console.log(`      B_STANDARD (256B) selected atoms: ${trainedCodec.selected_subsets_by_budget.B_STANDARD.selected_atoms.join(', ')}`);

const pilotEval = evaluateWorldSuiteAcrossBudgets({
  suite: pilotSuite,
  trainedCodec,
  budgets: [96, 256],
  evaluationSeed: 'TD613_PALACE_PILOT_48_EVAL_V1',
});

console.log('\n[3/4] Pilot Evaluation Summary (B_STANDARD_256B):');
for (const [cond, sum] of Object.entries(pilotEval.results_by_budget.B_STANDARD_256B.condition_summaries)) {
  console.log(
    `  ${cond.padEnd(20)} | U=${sum.mean_utility.toFixed(4)} | Regret=${sum.mean_regret_vs_oracle.toFixed(4)} | ID=${String(sum.identifiable_mechanism_success_rate).padEnd(6)} | AbstainD3=${String(sum.unidentifiable_correct_abstention_rate).padEnd(6)} | FalseClaim=${sum.false_scientific_claim_rate.toFixed(4)} | Bytes=${sum.mean_retained_bytes.toFixed(1)}`
  );
}

console.log('\n      Pilot Evaluation Summary (B_TIGHT_96B):');
for (const [cond, sum] of Object.entries(pilotEval.results_by_budget.B_TIGHT_96B.condition_summaries)) {
  console.log(
    `  ${cond.padEnd(20)} | U=${sum.mean_utility.toFixed(4)} | Regret=${sum.mean_regret_vs_oracle.toFixed(4)} | ID=${String(sum.identifiable_mechanism_success_rate).padEnd(6)} | AbstainD3=${String(sum.unidentifiable_correct_abstention_rate).padEnd(6)} | FalseClaim=${sum.false_scientific_claim_rate.toFixed(4)} | Bytes=${sum.mean_retained_bytes.toFixed(1)}`
  );
}

// Strip bulky episode-by-episode arrays into summary digest while preserving quartet checks & aggregate tables
const compactResultsByBudget = {};
for (const [bKey, bVal] of Object.entries(pilotEval.results_by_budget)) {
  const episodeDigest = sha256Hex(JSON.stringify(bVal.episode_rows_by_condition));
  compactResultsByBudget[bKey] = {
    budget_bytes: bVal.budget_bytes,
    condition_summaries: bVal.condition_summaries,
    by_family_summaries: bVal.by_family_summaries,
    paired_contrasts: bVal.paired_contrasts,
    episode_table_sha256: episodeDigest,
  };
}

const pilotReceipt = {
  schema: 'td613.palace.pilot-48-receipt/v1',
  authority: 'SAC[X6ZNK5NO51]',
  covenant: 'Khona‌lit-po',
  supervision_mode: 'INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL',
  independent_external_blinding: false,
  suite_name: 'PILOT_48',
  master_seed: 'TD613_PALACE_PILOT_48_SEED_V1',
  total_worlds: pilotSuite.total_worlds,
  confirmatory_worlds_evaluated: 0,
  quartet_verifications: pilotSuite.quartet_verifications,
  trained_codec_sha256: trainedCodec.codec_sha256,
  vault_access_audit_log: {
    competing_conditions_secret_access_count: pilotEval.vault_access_audit_log.competing_conditions_secret_access_count,
    random_control_secret_access_count: pilotEval.vault_access_audit_log.random_control_secret_access_count,
    oracle_control_secret_access_count: pilotEval.vault_access_audit_log.oracle_control_secret_access_count,
  },
  results_by_budget: compactResultsByBudget,
};

const receiptPath = path.join(RECEIPTS_DIR, 'pilot-48-receipt.json');
fs.writeFileSync(receiptPath, JSON.stringify(pilotReceipt, null, 2) + '\n', 'utf8');
console.log(`\n[4/4] Wrote Pilot Receipt to ${receiptPath}`);
