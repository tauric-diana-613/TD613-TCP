import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO_ROOT = process.cwd();
const PREFLIGHT_DIR = path.resolve(REPO_ROOT, 'docs/research/experiment-b-preflight');
const AUDIT_OUT_DIR = path.join(PREFLIGHT_DIR, '05_dollhouse_audit');

console.log('=== EXECUTING TD613 DOLLHOUSE SCIENTIFIC AUDIT ON PREFLIGHT B ===');

const dispatcherPath = path.join(REPO_ROOT, 'app/engine/dollhouse-skill-dispatcher.js');
const { runDollhouseSkillAudit } = await import(pathToFileURL(dispatcherPath).href);

const auditSpec = {
  source_revision: '700019741e708abfd2e53990fc2d8919995a70f1',
  task_scope: 'EXPERIMENT_B_SOURCE_FREE_PREFLIGHT_CALIBRATION_AUDIT',
  evidence_class: 'SOURCE_CODE_AUDIT',
  roles: ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'],
  include_orchestrator: true,
  evidence_references: [
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c1_damped_harmonic_oscillator.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c1_series_rlc_circuit.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c2_logistic_population_growth.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c2_michaelis_menten_kinetics.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c3_staged_resonance_perturbation.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c4_incomplete_boundary_system.json',
    'docs/research/experiment-b-preflight/02_four_arm_harness/reasoning-kernel.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/run-arm2a-modular.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/run-arm2b-matched-union.mjs',
    'docs/research/experiment-b-preflight/03_calibration_execution/CALIBRATION_EXECUTION_RECEIPT.json'
  ]
};

const auditResult = await runDollhouseSkillAudit(auditSpec);
const mr = auditResult.machine_receipt;

console.log(`Dollhouse Execution Complete:`);
console.log(`  - Invocation ID: ${mr.invocation_id}`);
console.log(`  - Specialists Evaluated: ${mr.roles_executed.join(', ')}`);
console.log(`  - Orchestrator Consensus: ${mr.orchestrator.consensus}`);
console.log(`  - Orchestrator Decision: ${mr.orchestrator.decision}`);
console.log(`  - Empirical Replication Count: ${mr.orchestrator.empirical_replication_count}`);
console.log(`  - Release Authority: ${mr.orchestrator.release_authority}`);
console.log(`  - Human Closure Required: ${mr.orchestrator.human_closure_required}`);

// Save Machine Receipt
const machineReceiptPath = path.join(AUDIT_OUT_DIR, 'DOLLHOUSE_AUDIT_PREFLIGHT_B_RECEIPT.json');
fs.writeFileSync(machineReceiptPath, JSON.stringify(mr, null, 2) + '\n', 'utf8');

// Save Human Report
const humanReportPath = path.join(AUDIT_OUT_DIR, 'DOLLHOUSE_AUDIT_PREFLIGHT_B_REPORT.md');
fs.writeFileSync(humanReportPath, auditResult.human_receipt + '\n', 'utf8');

console.log(`Machine receipt written to: ${machineReceiptPath}`);
console.log(`Human report written to: ${humanReportPath}`);
console.log('=== DOLLHOUSE AUDIT EXECUTED SUCCESSFULLY ===\n');
