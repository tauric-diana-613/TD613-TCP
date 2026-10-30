/**
 * run-dollhouse-audit-launchbridge.mjs
 *
 * TD613 Native Dollhouse Skill Scientific Audit on Experiment B Flight Launchbridge.
 * Evaluates all five specialist roles and Orchestrator consensus over the source-free
 * Launchbridge assets, controlled archive intake, structured context continuity, and Stage 2 evaluator.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO_ROOT = process.cwd();
const PREFLIGHT_DIR = path.resolve(REPO_ROOT, 'docs/research/experiment-b-preflight');
const AUDIT_OUT_DIR = path.join(PREFLIGHT_DIR, '05_dollhouse_audit');

console.log('=== EXECUTING TD613 DOLLHOUSE SCIENTIFIC AUDIT ON FLIGHT LAUNCHBRIDGE ===');

const dispatcherPath = path.join(REPO_ROOT, 'app/engine/dollhouse-skill-dispatcher.js');
const { runDollhouseSkillAudit } = await import(pathToFileURL(dispatcherPath).href);

const auditSpec = {
  source_revision: 'c4bd0401b432f5adda55c62ddca2bd99d4f3cc92',
  task_scope: 'EXPERIMENT_B_SOURCE_FREE_FLIGHT_LAUNCHBRIDGE_AUDIT',
  evidence_class: 'SOURCE_FREE_LAUNCHBRIDGE_VERIFICATION',
  roles: ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'],
  include_orchestrator: true,
  evidence_references: [
    'docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/gemini-live-client.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/stage2-independent-evaluator.mjs',
    'docs/research/experiment-b-preflight/04_evaluation_and_preregistration/RCA01_REPRESENTATION_CAUSALITY_ASSAY.md',
    'docs/research/experiment-b-preflight/04_evaluation_and_preregistration/THREE_LINEAGE_CUSTODY_PROTOCOL.md',
    'docs/research/experiment-b-preflight/04_evaluation_and_preregistration/THREE_LINEAGE_DISCOVERY_SCHEMA.json',
    'docs/research/experiment-b-preflight/06_custody_and_governance/FLIGHT_AUTHORIZATION_DECISION_SHEET.md',
    'docs/research/experiment-b-preflight/06_custody_and_governance/FLIGHT_EXECUTION_CAPABILITY_ASSESSMENT.md',
    'docs/research/experiment-b-preflight/06_custody_and_governance/FLIGHT_LAUNCHBRIDGE_DECISION_RECORD.md'
  ],
  domain_inputs: {
    PEDAGOGUE: {
      events: [
        { phase: 'NOTICE', at: 10, description: 'Protected challenge corpus held sealed in Downloads; autonomous scanning refused' },
        { phase: 'ACT', at: 20, description: 'Operator issues contemporaneous launch gesture; ControlledArchiveIntake admits designated target' },
        { phase: 'WORLD_ANSWERS', at: 30, description: 'Sequential exposure proceeds under permutation; structured context continuity preserves full propositions' },
        { phase: 'NAME', at: 40, description: 'Stage 1 emits candidate with pending status; Stage 2 independently evaluates warrant without self-certification' }
      ]
    },
    APERTURE: {
      current_operator: [
        [1.0, 0.0, -0.5],
        [0.0, 1.0, -0.2]
      ],
      noise_covariance: [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0]
      ],
      uncertainty_status: 'VALID_DECLARED',
      candidate_probes: [
        [0.0, 0.0, 1.0]
      ]
    },
    ATLAS: {
      trajectoryA: {
        endpoint: 'LAUNCHBRIDGE_ROUTE_CONTINUITY_ARM2A',
        winding: 0
      },
      trajectoryB: {
        endpoint: 'LAUNCHBRIDGE_ROUTE_CONTINUITY_ARM2A',
        winding: 0
      }
    },
    FADT: {
      fiberRows: [
        {
          condition: 'STAGE1_CANDIDATE_GENERATION_FIBER',
          support: ['status: PROPOSED', 'evaluator_tier: PENDING_INDEPENDENT_EVALUATION']
        },
        {
          condition: 'STAGE2_INDEPENDENT_VALIDATION_FIBER',
          support: ['warrant: FORMAL_EQUIVALENCE', 'control: NEGATIVE_CONTROL_REJECTED']
        }
      ],
      attempts_unconditioned_action: false
    },
    TEMPORAL_CUSTODIAN: {
      required_phases: [
        'PREFLIGHT_MERGED_PREDECESSOR',
        'CONTROLLED_INTAKE_STAGED',
        'CONTEXT_CONTINUITY_VERIFIED',
        'STAGE2_INDEPENDENT_EVALUATOR_STAGED',
        'LAUNCHBRIDGE_DECISION_RECORDED'
      ],
      phases: {
        PREFLIGHT_MERGED_PREDECESSOR: {
          entry_id: 'PRED-MAIN-C4BD04',
          status: 'PASS'
        },
        CONTROLLED_INTAKE_STAGED: {
          entry_id: 'INTAKE-01',
          status: 'PASS'
        },
        CONTEXT_CONTINUITY_VERIFIED: {
          entry_id: 'CONTEXT-02',
          status: 'PASS'
        },
        STAGE2_INDEPENDENT_EVALUATOR_STAGED: {
          entry_id: 'STAGE2-03',
          status: 'PASS'
        },
        LAUNCHBRIDGE_DECISION_RECORDED: {
          entry_id: 'DECISION-04',
          status: 'PASS'
        }
      }
    }
  }
};

const auditResult = await runDollhouseSkillAudit(auditSpec);
const mr = auditResult.machine_receipt;

console.log(`Dollhouse Execution Complete:`);
console.log(`  - Invocation ID: ${mr.invocation_id}`);
console.log(`  - Specialists Evaluated: ${mr.roles_executed.join(', ')}`);
console.log(`  - Specialist Findings:`, mr.specialist_findings.map(f => `${f.role}: ${f.verdict} (${f.status})`));
console.log(`  - Orchestrator Consensus: ${mr.orchestrator.consensus}`);
console.log(`  - Orchestrator Decision: ${mr.orchestrator.decision}`);
console.log(`  - Empirical Replication Count: ${mr.orchestrator.empirical_replication_count}`);
console.log(`  - Release Authority: ${mr.orchestrator.release_authority}`);
console.log(`  - Human Closure Required: ${mr.orchestrator.human_closure_required}`);

// Save Launchbridge Machine Receipt
const machineReceiptPath = path.join(AUDIT_OUT_DIR, 'DOLLHOUSE_AUDIT_LAUNCHBRIDGE_RECEIPT.json');
fs.writeFileSync(machineReceiptPath, JSON.stringify(mr, null, 2) + '\n', 'utf8');

// Save Launchbridge Human Report
const humanReportPath = path.join(AUDIT_OUT_DIR, 'DOLLHOUSE_AUDIT_LAUNCHBRIDGE_REPORT.md');
fs.writeFileSync(humanReportPath, auditResult.human_receipt + '\n', 'utf8');

console.log(`Machine receipt written to: ${machineReceiptPath}`);
console.log(`Human report written to: ${humanReportPath}`);
console.log('=== DOLLHOUSE LAUNCHBRIDGE AUDIT EXECUTED CLEANLY ===\n');
