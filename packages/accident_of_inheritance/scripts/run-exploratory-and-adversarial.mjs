#!/usr/bin/env node
/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Runner for Auxiliary Exploratory & Adversarial Suites (Independent of ACT2_CONFIRMATORY_192):
 *   1. Auxiliary 2x2 Source-Standing x Evidentiary-Reliability Factorial (96 worlds)
 *   2. Section VIII Exploratory Wing: "The Last Experiment of a Dead Civilization" (96 worlds)
 *   3. Section VII & XI Adversarial Falsification Counterexamples (`ADV_01`..`ADV_12`)
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSourceStandingFactorialAnalysis } from '../src/source-standing-factorial.mjs';
import { runDeadCivilizationExploratoryWing } from '../src/dead-civilization-wing.mjs';
import { runAdversarialCounterexamplesSuite } from '../src/adversarial-counterexamples.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPTS_DIR = path.resolve(__dirname, '..', 'receipts');
fs.mkdirSync(RECEIPTS_DIR, { recursive: true });

console.log('1/3 Running Auxiliary 2x2 Source-Standing x Reliability Factorial (96 worlds)...');
const standingReceipt = runSourceStandingFactorialAnalysis();
fs.writeFileSync(
  path.join(RECEIPTS_DIR, 'source-standing-factorial-receipt.json'),
  JSON.stringify(standingReceipt, null, 2) + '\n',
  'utf8'
);
for (const [pol, obj] of Object.entries(standingReceipt.policy_standing_contrasts)) {
  console.log(
    `  ${pol.padEnd(24)} | ΔU_status(Q_HIGH)=${obj.delta_u_status_given_Q_HIGH_calibrated.mean_diff.toFixed(4)} | ΔU_status(Q_LOW)=${obj.delta_u_status_given_Q_LOW_misleading.mean_diff.toFixed(4)} | 24-Perm MaxShift=${standingReceipt.exact_24_standing_permutation_audit[pol].max_abs_posterior_shift_across_24_standing_permutations.toFixed(4)}`
  );
}

console.log('\n2/3 Running Section VIII Dead Civilization Exploratory Wing (96 worlds, 384 episodes)...');
const deadCivReceipt = runDeadCivilizationExploratoryWing();
fs.writeFileSync(
  path.join(RECEIPTS_DIR, 'dead-civilization-wing-receipt.json'),
  JSON.stringify(deadCivReceipt, null, 2) + '\n',
  'utf8'
);
for (const [env, arms] of Object.entries(deadCivReceipt.summary_by_environment)) {
  console.log(
    `  ${env.padEnd(40)} | Desc=${arms.INHERIT_DESCRIPTIVE_FINDINGS.mean_utility.toFixed(4)} | Proc=${arms.INHERIT_PROCEDURAL_EXPERIMENTER.mean_utility.toFixed(4)} | SelfLim=${arms.INHERIT_SELF_LIMITING_PROCEDURE.mean_utility.toFixed(4)} (Revoke=${arms.INHERIT_SELF_LIMITING_PROCEDURE.ancestral_authority_withdrawn_rate.toFixed(2)}) | Uninh=${arms.CTRL_UNINHERITED_SUCCESSOR.mean_utility.toFixed(4)}`
  );
}

console.log('\n3/3 Running Section VII & XI Adversarial Falsification Counterexamples (ADV_01..ADV_12)...');
const advReceipt = runAdversarialCounterexamplesSuite();
fs.writeFileSync(
  path.join(RECEIPTS_DIR, 'adversarial-counterexamples-receipt.json'),
  JSON.stringify(advReceipt, null, 2) + '\n',
  'utf8'
);
for (const c of advReceipt.cases) {
  console.log(`  [${c.verified ? 'PASS' : 'FAIL'}] ${c.case_id}: ${c.title}`);
  if (!c.verified) {
    console.log('     Metrics:', JSON.stringify(c.metrics));
  }
}

if (!advReceipt.all_counterexamples_verified) {
  console.error('One or more adversarial counterexamples failed verification!');
  process.exit(1);
}
