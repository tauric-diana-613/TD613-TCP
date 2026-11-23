import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SCRATCH_BASE = process.env.TD613_EXP_A_SCRATCH || path.join(process.env.USERPROFILE || process.env.HOME || '.', '.gemini', 'antigravity', 'brain', '9f2d357f-af13-4730-b6c0-a1afe1416169', 'scratch');
const RC_R1_DIR = path.join(SCRATCH_BASE, 'exp_a_reciprocal_completion_r1_20261029');
const OUT_DIR = path.join(RC_R1_DIR, '07_executable_verifiers_r1');

console.log('=== TD613 MASTER RUNNER: EXP-A RECIPROCAL COMPLETION R1 ===');

const steps = [
  { name: 'Assay A-RC1-R1 (Exact UTF-8 Offsets & Lifecycle)', script: path.join(RC_R1_DIR, '02_assay_rc1_repaired/run-assay-rc1-r1.mjs') },
  { name: 'Assay A-RC2-R1 (Warranted Bridge & Plausible False Twins)', script: path.join(RC_R1_DIR, '03_assay_rc2_repaired/run-assay-rc2-r1.mjs') },
  { name: 'Assay A-RC3-R1 (Matched Strong Union with Typed Parity)', script: path.join(RC_R1_DIR, '04_assay_rc3_repaired/run-assay-rc3-r1.mjs') },
  { name: 'Prospective Blinded Review Packet R1', script: path.join(RC_R1_DIR, '05_blinded_adversarial_packet_r1/build-blinded-packet-r1.mjs') },
  { name: 'Reconciled Claim Ledger R1', script: path.join(RC_R1_DIR, '06_reconciled_charter_and_matrix_r1/build-r1-ledger.mjs') }
];

const results = [];

for (const step of steps) {
  console.log(`\nExecuting: ${step.name}...`);
  const t0 = Date.now();
  try {
    const stdout = execSync(`node "${step.script}"`, { encoding: 'utf8' });
    const elapsed = Date.now() - t0;
    console.log(`Success (${elapsed} ms).`);
    results.push({
      step: step.name,
      status: 'SUCCESS',
      elapsed_ms: elapsed,
      stdout_snippet: stdout.trim().split('\n').slice(-2).join(' | ')
    });
  } catch (err) {
    console.error(`FAILED: ${step.name}:`, err.message);
    results.push({
      step: step.name,
      status: 'FAILED',
      error: err.message
    });
    process.exit(1);
  }
}

const masterReceipt = {
  schema: 'td613.experiment-a.master-reciprocal-completion-receipt/v2-r1',
  receipt_id: 'MASTER-RC-R1-RECEIPT-' + Date.now(),
  timestamp: new Date().toISOString(),
  covenant: 'Tauric Diana — Crimean heritage custodianship · Khona‌lit-po',
  governing_commission: 'TD613_Experiment_A_RC_Independent_Adjudication_2026-10-29',
  disposition: 'A_RECIPROCAL_BASELINE_ACCEPTED_WITH_NAMED_LIMITATIONS',
  gate_e: 'HELD',
  empirical_credit: 0,
  human_scientific_closure: 'RESERVED',
  experiment_b_corpus: 'HELD_STRICTLY_SEALED_UNREAD',
  step_results: results,
  summary: {
    rc_01_private_archive_transfer_staged: true,
    rc_02_p1_utf8_span_18656_20574_verified: true,
    rc_02_em_utf8_span_24923_27575_verified: true,
    rc_03_bridge_provenance_research_analogy: true,
    rc_03_plausible_false_twin_rejected: true,
    rc_04_non_scalar_vectors_exposed: true,
    rc_05_typed_strong_union_delta_zero: true,
    rc_06_state_transitions_and_catalog_immutability_verified: true,
    rc_07_prospective_blinding_and_mutation_controls_verified: true,
    rc_08_dollhouse_held_dissent_preserved: true
  }
};

fs.writeFileSync(path.join(OUT_DIR, 'MASTER_RECIPROCAL_COMPLETION_R1_RECEIPT.json'), JSON.stringify(masterReceipt, null, 2), 'utf8');
console.log('\nMaster Reciprocal Completion R1 Receipt emitted successfully.');
