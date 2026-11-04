import fs from 'fs';
import path from 'path';

const SCRATCH_BASE = process.env.TD613_EXP_A_SCRATCH || path.join(process.env.USERPROFILE || process.env.HOME || '.', '.gemini', 'antigravity', 'brain', '9f2d357f-af13-4730-b6c0-a1afe1416169', 'scratch');
const RC_DIR = path.join(SCRATCH_BASE, 'exp_a_reciprocal_completion_20261029');
const RC_R1_DIR = path.join(SCRATCH_BASE, 'exp_a_reciprocal_completion_r1_20261029');
const OUT_DIR = path.join(RC_R1_DIR, '06_reconciled_charter_and_matrix_r1');

const rcLedgerPath = path.join(RC_DIR, '06_reconciled_scientific_charter/CORRECTED_BOUNDED_SCIENCE_CLAIM_LEDGER_RC.json');
const rcLedger = JSON.parse(fs.readFileSync(rcLedgerPath, 'utf8'));

const updatedClaims = rcLedger.claims.map(c => {
  const claim = { ...c };

  if (claim.claim_id === 'CLAIM_UNBRIDGED_POLYCOMPILER_REFUSAL') {
    claim.statement = 'The polycompiler strictly refuses cross-chamber compilation on unbridged graphs, admits exactly 1 path when a validated research analogy bridge (B1) is provided with exact UTF-8 offsets (18656..20574 and 24923..27575), and rejects both obvious and plausible type-compatible false twins.';
    claim.redpen_correction = 'Reconciled RC-02 and RC-03 in Assay A-RC2-R1. Tested plausible false twin (B_rival_plausible connecting P1 capacity to Flowmeter K-factor), proving structural evaluation beyond superficial scalar typing. Autonomous discovery credit remains 0.';
    claim.witness_reference = '03_assay_rc2_repaired/ASSAY_RC2_R1_RECEIPT.json';
  }

  if (claim.claim_id === 'CLAIM_ROLE_COUNT_EMERGENCE_SURPLUS') {
    claim.statement = 'In a matched strong-union benchmark with typed namespace parity (TYPED_STRONG_UNION_BALANCED), emergence surplus Delta = V(Modular) - V(TypedStrongUnion) is exactly 0 across all tested budgets (1024..65536 B). The earlier Delta = 3 difference over untyped union is fully accounted for by engineering namespace protection, not ontological third-machine emergence.';
    claim.redpen_correction = 'Reconciled RC-04 and RC-05 in Assay A-RC3-R1. Emergence credit is confirmed as 0; honest empirical nulls are fully preserved across all budgets.';
    claim.witness_reference = '04_assay_rc3_repaired/ASSAY_RC3_R1_RECEIPT.json';
  }

  if (claim.claim_id === 'CLAIM_MANIFEST_TRAJECTORIES_M0_M4') {
    claim.statement = 'Two-way isolated recipient operation (A-RC1-R1) confirmed: Atelier receiver isolates P1 with exact UTF-8 Section 6 body (18656..20574, SHA-256 e9d259d7...); Encyclopedia receiver admits 147 candidate items with persistent idempotence. Reverse staging proves lexical queryability while maintaining catalog immutability (147 records) and zero autonomous cross-chamber edge synthesis.';
    claim.redpen_correction = 'Reconciled RC-02 and RC-06 in Assay A-RC1-R1 with exact UTF-8 offsets and verified lifecycle transitions.';
    claim.witness_reference = '02_assay_rc1_repaired/ASSAY_RC1_R1_RECEIPT.json';
  }

  return claim;
});

const r1Ledger = {
  schema: 'td613.experiment-a.corrected-bounded-science-claim-ledger/v3-r1',
  authored_at: new Date().toISOString(),
  commission_reference: 'TD613_Experiment_A_RC_Independent_Adjudication_2026-10-29',
  covenant: 'Tauric Diana — Crimean heritage custodianship · Khona‌lit-po',
  epistemic_categories: rcLedger.epistemic_categories,
  claims: updatedClaims
};

fs.writeFileSync(path.join(OUT_DIR, 'CORRECTED_BOUNDED_SCIENCE_CLAIM_LEDGER_R1.json'), JSON.stringify(r1Ledger, null, 2), 'utf8');
console.log('CORRECTED_BOUNDED_SCIENCE_CLAIM_LEDGER_R1.json built successfully.');
