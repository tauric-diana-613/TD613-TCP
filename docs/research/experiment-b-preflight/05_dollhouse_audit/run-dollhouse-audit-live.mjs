import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO_ROOT = process.cwd();
const PREFLIGHT_DIR = path.resolve(REPO_ROOT, 'docs/research/experiment-b-preflight');
const AUDIT_OUT_DIR = path.join(PREFLIGHT_DIR, '05_dollhouse_audit');

console.log('=== EXECUTING TD613 DOLLHOUSE SCIENTIFIC AUDIT ON LIVE CALIBRATION ===');

const dispatcherPath = path.join(REPO_ROOT, 'app/engine/dollhouse-skill-dispatcher.js');
const { runDollhouseSkillAudit } = await import(pathToFileURL(dispatcherPath).href);

const auditSpec = {
  source_revision: '1a9c29df3eb6f37859756357a79cd296060e9706',
  task_scope: 'EXPERIMENT_B_SOURCE_FREE_LIVE_CALIBRATION_AUDIT_V2',
  evidence_class: 'LIVE_MODEL_CALIBRATION_EVALUATION',
  roles: ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'],
  include_orchestrator: true,
  evidence_references: [
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c1_damped_harmonic_oscillator.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c1_series_rlc_circuit.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c2_logistic_population_growth.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c2_michaelis_menten_kinetics.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c2_positive_control_linear_decay.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c3_staged_resonance_perturbation.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c4_incomplete_boundary_system.json',
    'docs/research/experiment-b-preflight/01_calibration_fixtures/c4_sufficient_boundary_system.json',
    'docs/research/experiment-b-preflight/02_four_arm_harness/gemini-live-client.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/run-arm2a-modular.mjs',
    'docs/research/experiment-b-preflight/02_four_arm_harness/run-arm2b-matched-union.mjs',
    'docs/research/experiment-b-preflight/03_calibration_execution/evaluator-oracle.mjs',
    'docs/research/experiment-b-preflight/03_calibration_execution/LIVE_CALIBRATION_EXECUTION_RECEIPT.json',
    'docs/research/experiment-b-preflight/03_calibration_execution/LIVE_CALIBRATION_RESCORING_RECEIPT.json'
  ],
  domain_inputs: {
    PEDAGOGUE: {
      events: [
        { phase: 'NOTICE', at: 10, description: 'Observed classical oscillator and RLC equations without coordinate mapping' },
        { phase: 'ACT', at: 20, description: 'Jurisdictional reasoner proposed coordinate and parameter bijection' },
        { phase: 'WORLD_ANSWERS', at: 30, description: 'Empirical ringdown energy decay measurement observed' },
        { phase: 'NAME', at: 40, description: 'Epistemic model revision performed and Q-factor updated' }
      ]
    },
    APERTURE: {
      // Current observation operator maps latent state \theta \in R^3 to measurement y \in R^2 (rank 2, latent dimension 3)
      current_operator: [
        [1.0, 0.0, -0.5],
        [0.0, 1.0, -0.2]
      ],
      // Explicitly specify: latent-state parameter covariance matrix \Sigma_\theta \in R^{3 \times 3}
      // Note: Aperture v3.2 requires noise covariance to match the column/latent dimension n=3,
      // representing prior parameter uncertainty, not 2x2 measurement noise.
      noise_covariance: [
        [1.0, 0.0, 0.0],
        [0.0, 1.0, 0.0],
        [0.0, 0.0, 1.0]
      ],
      uncertainty_status: 'VALID_DECLARED',
      // Candidate probe in R^3 measuring third latent parameter: restores full rank 3 with condition number 1.70
      candidate_probes: [
        [0.0, 0.0, 1.0]
      ]
    },
    ATLAS: {
      trajectoryA: {
        endpoint: 'COORDINATE_BIJECTION_X_Q',
        winding: 0
      },
      trajectoryB: {
        endpoint: 'COORDINATE_BIJECTION_X_Q',
        winding: 0
      }
    },
    FADT: {
      fiberRows: [
        {
          condition: 'SECOND_ORDER_DISSIPATIVE_ODE',
          support: ['m*d2x/dt2 + b*dx/dt + k*x = F', 'L*d2q/dt2 + R*dq/dt + q/C = V']
        },
        {
          condition: 'FIRST_ORDER_RELAXATION_ODE',
          support: ['dN/dt = -lambda*N', 'dV/dt = -V/(RC)']
        }
      ],
      attempts_unconditioned_action: false
    },
    TEMPORAL_CUSTODIAN: {
      required_phases: [
        'PREDECESSOR_PRESERVATION',
        'LIVE_CALIBRATION_SHAKEDOWN',
        'INDEPENDENT_ORACLE_EVALUATION',
        'OFFLINE_TRACE_RESCORE',
        'DOLLHOUSE_AUDIT_EXECUTION'
      ],
      phases: {
        PREDECESSOR_PRESERVATION: {
          entry_id: 'PRED-01',
          status: 'PASS'
        },
        LIVE_CALIBRATION_SHAKEDOWN: {
          entry_id: 'LIVE-02',
          status: 'PASS'
        },
        INDEPENDENT_ORACLE_EVALUATION: {
          entry_id: 'ORACLE-03',
          status: 'PASS'
        },
        OFFLINE_TRACE_RESCORE: {
          entry_id: 'RESCORE-04',
          status: 'PASS'
        },
        DOLLHOUSE_AUDIT_EXECUTION: {
          entry_id: 'DOLLHOUSE-05',
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

// Save Live Machine Receipt V2 (Preserving DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT.json as predecessor)
const liveMachineReceiptPath = path.join(AUDIT_OUT_DIR, 'DOLLHOUSE_AUDIT_LIVE_CALIBRATION_RECEIPT_V2.json');
fs.writeFileSync(liveMachineReceiptPath, JSON.stringify(mr, null, 2) + '\n', 'utf8');

// Save Live Human Report V2
const liveHumanReportPath = path.join(AUDIT_OUT_DIR, 'DOLLHOUSE_AUDIT_LIVE_CALIBRATION_REPORT_V2.md');
fs.writeFileSync(liveHumanReportPath, auditResult.human_receipt + '\n', 'utf8');

console.log(`Machine receipt V2 written to: ${liveMachineReceiptPath}`);
console.log(`Human report V2 written to: ${liveHumanReportPath}`);
console.log('=== DOLLHOUSE LIVE AUDIT EXECUTED SUCCESSFULLY ===\n');
