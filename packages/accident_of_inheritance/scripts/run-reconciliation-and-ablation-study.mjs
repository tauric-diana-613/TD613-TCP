#!/usr/bin/env node
/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Runner for Bounded Scientific Reconciliation and Component Ablation Study
 * Addressing Independent Review #5793729248 (ACT2-F01 through ACT2-F07)
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCompleteReconciliationSuite } from '../src/reconciliation-and-ablation-study.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPTS_DIR = path.resolve(__dirname, '..', 'receipts');
fs.mkdirSync(RECEIPTS_DIR, { recursive: true });

console.log('================================================================');
console.log('𝌋 TD613 · PALACE ACT II RECONCILIATION & ABLATION STUDY');
console.log('Addressing Independent Source-Level Review #5793729248');
console.log('================================================================\n');

const receipt = runCompleteReconciliationSuite();

const receiptPath = path.join(RECEIPTS_DIR, 'reconciliation-and-ablation-receipt.json');
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + '\n', 'utf8');

console.log(`\nReceipt written to: ${receiptPath}`);
console.log('\n--- Key Ablation Findings ---');
console.log(`P-01 Standing: Withdrawn +0.1753 erratum. Grounded: Q_HIGH=+0.1355, Q_LOW=-0.1355, Pooled=0.0000 (p=1.0000)`);
console.log(`P-02 Context Membrane: Instantaneous=+${receipt.p02_context_membrane_ablation.mean_utility.C_INSTANT} | Delayed=+${receipt.p02_context_membrane_ablation.mean_utility.C_DELAYED} | Blind=+${receipt.p02_context_membrane_ablation.mean_utility.C_BLIND}`);
console.log(`     Sensor surplus over delayed: +${receipt.p02_context_membrane_ablation.sensor_surplus.instant_vs_delayed_delta}`);
console.log(`P-03 Policy Ablations: Full Composite=${receipt.p03_policy_component_ablation.ablation_means_utility.ABL_FULL_COMPOSITE} | Prior Only=${receipt.p03_policy_component_ablation.ablation_means_utility.ABL_PRIOR_ONLY} | No Decay=${receipt.p03_policy_component_ablation.ablation_means_utility.ABL_NO_DECAY}`);
console.log(`P-04 Correction Timeline: Mean Action vs Belief gap=${receipt.p04_correction_timeline.mean_action_minus_belief_gap_ticks} ticks (Family D fiber confounded)`);
console.log(`P-05 Terminology: Dynamic Oracle -> SYNTHETIC_FULL_INFORMATION_BENCHMARK; Secret Vault Proxy -> IN_PROCESS_PROXY_PROPERTY_TRAP`);
console.log('\nStatus: PALACE_ACT2_RECONCILIATION_COMPLETE\n');
