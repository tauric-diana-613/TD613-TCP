/**
 * @fileoverview TD613 Dollhouse Native Antigravity Skill Verification Test Suite.
 *
 * Verifies all positive, adversarial, and governance requirements specified in
 * THE CONVERGENCE COVENANT — REVISION 2 and Human Operator / TD613 Heritage Custodian's Artifact 38 Corrective Redline:
 *   1. Standalone invocation of each of the 5 specialists
 *   2. Successful Orchestrator invocation with actual specialist results
 *   3. Distinct role-specific findings retained without collapsing
 *   4. Single shared acquisition earns zero additional replication credit
 *   5. A specialist veto survives four favorable findings
 *   6. Missing specialist input remains explicitly unexamined
 *   7. Caller-authored concerns cannot masquerade as executable domain findings
 *   8. Synthetic evidence cannot become independently observed empirical evidence
 *   9. Out-of-order chronology triggers a Temporal Custodian hold
 *   10. Atlas detects unverified history or incompatible serialization profiles
 *   11. FADT detects an inadmissible widened action
 *   12. Aperture retains numerical instability or missing observability
 *   13. Pedagogue retains premature naming, compressed consequence, or withheld rest
 *   14. Orchestrator cannot claim approval when required input class is absent
 *   15. Deterministic, parseable, bounded receipts produced
 *   16. Static skill discovery: YAML frontmatter, schema, and portable relative references
 *   17. Unavailable engine produces explicit failure/hold rather than invented PASS
 *   18. Strict boundary: zero release/deployment authority, human closure required
 *   19. Standalone elimination of false SUPPORTED outcomes on missing observations (Redline Item 2)
 *   20. Executed specialist extension failures strictly govern Orchestrator disposition (Redline Item 1)
 *   21. Source revision provenance verification and strict git history checking (Redline Item 3)
 *   22. Evidence reference provenance verification (Redline Item 3)
 *   23. Artifact write fail-closed on unauthorized overwrite (Redline Item 4)
 *   24. Elimination of workstation-specific absolute paths from all .agents/ documents (Redline Item 5)
 *   25. Host-independent JSON CLI interface and stdin streaming (Redline Item 6)
 *   26. Strict distinction between synthetic fault injection and observed source defects (Redline Item 7)
 *   27. Canonical fixture execution suite (focused, complete, and readiness)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync, unlinkSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import {
  runDollhouseSkillAudit,
  writeReceiptArtifact,
  verifySourceRevision,
  verifyEvidenceReferences,
  DOLLHOUSE_SKILL_RECEIPT_SCHEMA,
  CANONICAL_SPECIALIST_ROLES,
  ALL_CANONICAL_ROLES
} from '../app/engine/dollhouse-skill-dispatcher.js';
import {
  FIVE_ROLES,
  ROLE_INFRACTIONS
} from '../app/engine/dollhouse-ablation-harness.js';

// Canonical benign inputs for all 5 roles
const BENIGN_PEDAGOGUE_INPUT = Object.freeze({
  events: [
    { phase: 'NOTICE', at: 10 },
    { phase: 'ACT', at: 20 },
    { phase: 'WORLD_ANSWERS', at: 30 },
    { phase: 'NAME', at: 40 }
  ]
});

const BENIGN_APERTURE_INPUT = Object.freeze({
  current_operator: [
    [1.0, 0.0],
    [0.0, 1.0]
  ],
  noise_covariance: [
    [1.0, 0.0],
    [0.0, 1.0]
  ]
});

const BENIGN_ATLAS_INPUT = Object.freeze({
  trajectoryA: {
    endpoint: 'REST_CUSTODY_ORIGIN',
    winding: 0
  },
  trajectoryB: {
    endpoint: 'REST_CUSTODY_ORIGIN',
    winding: 0
  }
});

const BENIGN_FADT_INPUT = Object.freeze({
  fiberRows: [
    { support: ['READ', 'VERIFY'], condition: 'A' },
    { support: ['READ', 'VERIFY'], condition: 'B' }
  ],
  attempts_unconditioned_action: false
});

const BENIGN_TEMPORAL_INPUT = Object.freeze({
  phases: {
    INGRESS: { status: 'PASS', entry_id: 'entry-001' },
    EXECUTION: { status: 'PASS', entry_id: 'entry-002' },
    RELOCK: { status: 'PASS', entry_id: 'entry-003' }
  },
  required_phases: ['INGRESS', 'EXECUTION', 'RELOCK']
});

const ALL_BENIGN_DOMAIN_INPUTS = Object.freeze({
  PEDAGOGUE: BENIGN_PEDAGOGUE_INPUT,
  APERTURE: BENIGN_APERTURE_INPUT,
  ATLAS: BENIGN_ATLAS_INPUT,
  FADT: BENIGN_FADT_INPUT,
  TEMPORAL_CUSTODIAN: BENIGN_TEMPORAL_INPUT
});

test('TD613 Dollhouse Native Skill & Six-Role Orchestration Test Battery', async (t) => {

  // -------------------------------------------------------------------------
  // 1. Standalone invocation of each of the five specialists
  // -------------------------------------------------------------------------
  await t.test('1. Successful standalone invocation of each of the five specialists', async () => {
    for (const role of CANONICAL_SPECIALIST_ROLES) {
      const res = await runDollhouseSkillAudit({
        roles: [role],
        include_orchestrator: false,
        domain_inputs: {
          [role]: ALL_BENIGN_DOMAIN_INPUTS[role]
        }
      });

      assert.equal(res.exit_code, 0, `Standalone invocation for ${role} must succeed`);
      assert.equal(res.machine_receipt.roles_executed.length, 1);
      assert.equal(res.machine_receipt.roles_executed[0], role);
      assert.equal(res.machine_receipt.specialist_findings.length, 1);
      assert.equal(res.machine_receipt.specialist_findings[0].verdict, 'SUPPORTED');
      assert.equal(res.machine_receipt.orchestrator, null, 'Orchestrator must be null when include_orchestrator: false');
    }
  });

  // -------------------------------------------------------------------------
  // 2. Successful Orchestrator invocation with actual specialist results
  // -------------------------------------------------------------------------
  await t.test('2. Successful Orchestrator invocation with actual specialist results', async () => {
    const res = await runDollhouseSkillAudit({
      roles: [...CANONICAL_SPECIALIST_ROLES, 'ORCHESTRATOR'],
      include_orchestrator: true,
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(res.exit_code, 0);
    assert.ok(res.machine_receipt.orchestrator);
    assert.equal(res.machine_receipt.orchestrator.decision, 'SUPPORTED');
    assert.equal(res.machine_receipt.orchestrator.consensus, 'UNANIMOUS_SUPPORT');
    assert.equal(res.machine_receipt.orchestrator.active_roles.length, 5);
    assert.equal(res.machine_receipt.orchestrator.findings_count, 5);
  });

  // -------------------------------------------------------------------------
  // 3. Distinct role-specific findings retained without collapsing
  // -------------------------------------------------------------------------
  await t.test('3. Distinct role-specific findings retained without collapsing into one generic verdict', async () => {
    const res = await runDollhouseSkillAudit({
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    const rolesFound = res.machine_receipt.specialist_findings.map(f => f.role);
    assert.deepEqual(rolesFound, CANONICAL_SPECIALIST_ROLES);

    // Verify jurisdictions are distinct
    const jurisdictions = new Set(res.machine_receipt.specialist_findings.map(f => f.jurisdiction));
    assert.equal(jurisdictions.size, 5, 'All five specialists must have distinct domain jurisdictions');
  });

  // -------------------------------------------------------------------------
  // 4. Single shared acquisition earns zero additional replication credit
  // -------------------------------------------------------------------------
  await t.test('4. A single shared acquisition reviewed by all five specialists earns zero additional replication credit', async () => {
    const res = await runDollhouseSkillAudit({
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS,
      evidence_class: 'SYNTHETIC_TEST_FIXTURE'
    });

    assert.equal(res.machine_receipt.empirical_replication_count, 0);
    assert.equal(res.machine_receipt.replication_status, 'SYNTHETIC_OFFLINE_FIXTURE');
  });

  // -------------------------------------------------------------------------
  // 5. A specialist veto survives four favorable findings
  // -------------------------------------------------------------------------
  await t.test('5. A specialist veto survives four favorable findings', async () => {
    const defectiveInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      PEDAGOGUE: {
        events: [
          { phase: 'NOTICE', at: 10 },
          { phase: 'ACT', at: 20 },
          { phase: 'NAME', at: 25 }, // FAULT: naming before world answers
          { phase: 'WORLD_ANSWERS', at: 30 }
        ]
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: defectiveInputs
    });

    assert.equal(res.exit_code, 1);
    assert.equal(res.machine_receipt.orchestrator.decision, 'HELD');
    assert.equal(res.machine_receipt.orchestrator.consensus, 'HELD_DISSENT');

    const pedFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'PEDAGOGUE');
    assert.equal(pedFinding.verdict, 'HELD');
    assert.equal(pedFinding.status, 'VIOLATION_DETECTED');

    // The other 4 still passed within their respective jurisdictions
    const apertureFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(apertureFinding.verdict, 'SUPPORTED');
  });

  // -------------------------------------------------------------------------
  // 6. Missing specialist input remains explicitly unexamined
  // -------------------------------------------------------------------------
  await t.test('6. A missing specialist input remains explicitly unexamined', async () => {
    const incompleteInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      FADT: null // unsupplied
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: incompleteInputs
    });

    assert.equal(res.exit_code, 1);
    assert.ok(res.machine_receipt.missing_inputs.includes('FADT'));

    const fadtFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'FADT');
    assert.equal(fadtFinding.verdict, 'NOT_EVALUATED');
    assert.equal(fadtFinding.status, 'INPUT_MISSING');

    assert.equal(res.machine_receipt.orchestrator.decision, 'HELD_MISSING_OBSERVATION');
  });

  // -------------------------------------------------------------------------
  // 7. Caller-authored concerns cannot masquerade as executable domain findings
  // -------------------------------------------------------------------------
  await t.test('7. Caller-authored concerns cannot masquerade as executable domain findings', async () => {
    const untypedInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      PEDAGOGUE: {
        concern: 'Caller claims this UI is bad without providing events array'
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: untypedInputs
    });

    const pedFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'PEDAGOGUE');
    assert.equal(pedFinding.verdict, 'HELD');
    assert.equal(pedFinding.status, 'MALFORMED_OBSERVATION_SCHEMA');
    assert.ok(pedFinding.infractions.includes('MALFORMED_OBSERVATION_SCHEMA'));
  });

  // -------------------------------------------------------------------------
  // 8. Synthetic evidence cannot become independently observed empirical evidence
  // -------------------------------------------------------------------------
  await t.test('8. Synthetic evidence cannot become independently observed empirical evidence', async () => {
    const res = await runDollhouseSkillAudit({
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS,
      evidence_class: 'EMPIRICAL_ACQUISITION'
    });

    assert.equal(res.machine_receipt.empirical_replication_count, 0);
    assert.equal(res.machine_receipt.synthetic_vs_empirical, 'EMPIRICAL_UNAUTHENTICATED_IN_OFFLINE_ESTATE');
  });

  // -------------------------------------------------------------------------
  // 9. Out-of-order chronology triggers a Temporal Custodian hold
  // -------------------------------------------------------------------------
  await t.test('9. Out-of-order chronology triggers a Temporal Custodian hold', async () => {
    const chronologyFaultInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      TEMPORAL_CUSTODIAN: {
        phases: {
          INGRESS: { status: 'HELD', entry_id: 'entry-001' },
          EXECUTION: { status: 'PASS', entry_id: 'entry-002' }
        },
        required_phases: ['INGRESS', 'EXECUTION']
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: chronologyFaultInputs
    });

    const tcFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'TEMPORAL_CUSTODIAN');
    assert.equal(tcFinding.verdict, 'HELD');
    assert.equal(tcFinding.status, 'VIOLATION_DETECTED');
    assert.ok(res.machine_receipt.detected_infractions.includes('UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION'));
  });

  // -------------------------------------------------------------------------
  // 10. Atlas detects unverified history or incompatible serialization profiles
  // -------------------------------------------------------------------------
  await t.test('10. Atlas detects unverified history or incompatible serialization profiles', async () => {
    const parityMismatchInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      ATLAS: {
        trajectoryA: { endpoint: 'REST_CUSTODY_ORIGIN', winding: 0 },
        trajectoryB: { endpoint: 'REST_CUSTODY_ORIGIN', winding: 1 } // FAULT: winding parity mismatch
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: parityMismatchInputs
    });

    const atlasFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'ATLAS');
    assert.equal(atlasFinding.verdict, 'HELD');
    assert.equal(atlasFinding.status, 'VIOLATION_DETECTED');
    assert.ok(res.machine_receipt.detected_infractions.includes('HOLD_HOLONOMY_HISTORY_PARITY_FAILED'));
  });

  // -------------------------------------------------------------------------
  // 11. FADT detects an inadmissible widened action
  // -------------------------------------------------------------------------
  await t.test('11. FADT detects an inadmissible widened action', async () => {
    const widenedActionInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      FADT: {
        fiberRows: [
          { support: ['ACTION_A', 'ACTION_B'] },
          { support: ['ACTION_A'] }
        ],
        attempts_unconditioned_action: true
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: widenedActionInputs
    });

    const fadtFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'FADT');
    assert.equal(fadtFinding.verdict, 'HELD');
    assert.equal(fadtFinding.status, 'VIOLATION_DETECTED');
    assert.ok(res.machine_receipt.detected_infractions.includes('ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING'));
  });

  // -------------------------------------------------------------------------
  // 12. Aperture retains numerical instability or missing observability
  // -------------------------------------------------------------------------
  await t.test('12. Aperture retains numerical instability or missing observability', async () => {
    const illConditionedInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      APERTURE: {
        current_operator: [
          [1.0, 0.0],
          [1.0, 1e-5]
        ]
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: illConditionedInputs
    });

    const apertureFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(apertureFinding.verdict, 'HELD');
    assert.equal(apertureFinding.status, 'VIOLATION_DETECTED');
    assert.ok(res.machine_receipt.detected_infractions.includes('NUMERICAL_STABILITY_DEFICIT'));
  });

  // -------------------------------------------------------------------------
  // 13. Pedagogue retains premature naming, compressed consequence, or withheld rest
  // -------------------------------------------------------------------------
  await t.test('13. Pedagogue retains premature naming, compressed consequence, or withheld rest', async () => {
    const pedFaultInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      PEDAGOGUE: {
        events: [
          { phase: 'NOTICE', at: 10 },
          { phase: 'ACT', at: 20 },
          { phase: 'NAME', at: 25 },
          { phase: 'WORLD_ANSWERS', at: 30 }
        ]
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: pedFaultInputs
    });

    const pedFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'PEDAGOGUE');
    assert.equal(pedFinding.verdict, 'HELD');
    assert.equal(pedFinding.status, 'VIOLATION_DETECTED');
  });

  // -------------------------------------------------------------------------
  // 14. The Orchestrator cannot claim approval when the required input class is absent
  // -------------------------------------------------------------------------
  await t.test('14. The Orchestrator cannot claim approval when the required input class is absent', async () => {
    const res = await runDollhouseSkillAudit({
      roles: ['PEDAGOGUE', 'APERTURE'],
      include_orchestrator: true,
      domain_inputs: {}
    });

    assert.equal(res.exit_code, 1);
    assert.equal(res.machine_receipt.orchestrator.decision, 'HELD_MISSING_OBSERVATION');
  });

  // -------------------------------------------------------------------------
  // 15. The skill produces deterministic, parseable, bounded receipts
  // -------------------------------------------------------------------------
  await t.test('15. The skill produces deterministic, parseable, bounded receipts', async () => {
    const res = await runDollhouseSkillAudit({
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS,
      source_revision: 'ba90d24ecfd3311ed05cebf92d363195339a6270',
      task_scope: 'DETERMINISTIC_PARSE_TEST'
    });

    assert.equal(res.machine_receipt.schema, DOLLHOUSE_SKILL_RECEIPT_SCHEMA);
    assert.equal(res.machine_receipt.source_revision, 'ba90d24ecfd3311ed05cebf92d363195339a6270');

    // JSON serialize and deserialize roundtrip
    const serialized = JSON.stringify(res.machine_receipt);
    const parsed = JSON.parse(serialized);
    assert.deepEqual(parsed, res.machine_receipt);

    // Human receipt must be non-empty and contain key sections
    assert.ok(res.human_receipt.includes('TD613 Dollhouse Scientific Audit Receipt'));
    assert.ok(res.human_receipt.includes('Executive Disposition & Summary'));
    assert.ok(res.human_receipt.includes('Specialist Findings'));
    assert.ok(res.human_receipt.includes('Permitted Next Operator Action'));
  });

  // -------------------------------------------------------------------------
  // 16. Static skill discovery: YAML frontmatter, schema, and relative paths
  // -------------------------------------------------------------------------
  await t.test('16. Static skill discovery: YAML frontmatter, schema, and portable relative references', () => {
    const skillPath = resolve('.agents/skills/dollhouse-audit/SKILL.md');
    assert.ok(existsSync(skillPath), 'SKILL.md must exist in .agents/skills/dollhouse-audit/');

    const content = readFileSync(skillPath, 'utf8');
    assert.ok(content.startsWith('---'), 'SKILL.md must start with YAML frontmatter');
    assert.ok(content.includes('name: dollhouse-audit'), 'Skill name must be dollhouse-audit');
    assert.ok(content.includes('description:'), 'Skill must define a description');
    assert.ok(content.includes('scripts/run-dollhouse-skill-audit.mjs'), 'Must reference canonical CLI runner');

    // Verify subagent definition files exist
    assert.ok(existsSync(resolve('.agents/agents/dollhouse-pedagogue.md')));
    assert.ok(existsSync(resolve('.agents/agents/dollhouse-aperture.md')));
    assert.ok(existsSync(resolve('.agents/agents/dollhouse-atlas.md')));
    assert.ok(existsSync(resolve('.agents/agents/dollhouse-fadt.md')));
    assert.ok(existsSync(resolve('.agents/agents/dollhouse-temporal-custodian.md')));
    assert.ok(existsSync(resolve('.agents/agents/dollhouse-orchestrator.md')));
  });

  // -------------------------------------------------------------------------
  // 17. An unavailable engine produces an explicit failure/hold rather than an invented PASS
  // -------------------------------------------------------------------------
  await t.test('17. An unavailable engine produces an explicit failure/hold rather than an invented PASS', async () => {
    const res = await runDollhouseSkillAudit({
      roles: ['NONEXISTENT_ROLE_SIX'],
      domain_inputs: {}
    });

    assert.equal(res.exit_code, 1);
    assert.ok(res.machine_receipt.detected_infractions.includes('UNKNOWN_ROLE_REJECTED'));
    assert.equal(res.machine_receipt.orchestrator.decision, 'HELD_UNKNOWN_ROLE');
    assert.equal(res.machine_receipt.specialist_findings[0].verdict, 'HELD');
  });

  // -------------------------------------------------------------------------
  // 18. No invocation can silently launch provider acquisition, production trial, release, or deployment
  // -------------------------------------------------------------------------
  await t.test('18. No invocation can silently launch a provider acquisition, production trial, release, or deployment', async () => {
    // Under supported condition
    const resSupported = await runDollhouseSkillAudit({
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });
    assert.equal(resSupported.machine_receipt.orchestrator.release_authority, false);
    assert.equal(resSupported.machine_receipt.orchestrator.deployment_authority, false);
    assert.equal(resSupported.machine_receipt.orchestrator.human_closure_required, true);

    // Under held condition
    const resHeld = await runDollhouseSkillAudit({
      domain_inputs: {}
    });
    assert.equal(resHeld.machine_receipt.orchestrator.release_authority, false);
    assert.equal(resHeld.machine_receipt.orchestrator.deployment_authority, false);
    assert.equal(resHeld.machine_receipt.orchestrator.human_closure_required, true);
  });

  // -------------------------------------------------------------------------
  // 19. Standalone elimination of false SUPPORTED outcomes on missing observations (Redline Item 2)
  // -------------------------------------------------------------------------
  await t.test('19. Standalone elimination of false SUPPORTED outcomes on missing observations', async () => {
    // Standalone invocation without Orchestrator, but missing observation
    const res = await runDollhouseSkillAudit({
      roles: ['ATLAS'],
      include_orchestrator: false,
      domain_inputs: {} // missing observation for ATLAS
    });

    assert.equal(res.exit_code, 1, 'Missing standalone observation must exit 1');
    assert.equal(res.machine_receipt.specialist_findings[0].verdict, 'NOT_EVALUATED');
    assert.equal(res.machine_receipt.specialist_findings[0].status, 'INPUT_MISSING');
    assert.ok(res.human_receipt.includes('Auditing held fail-closed'));
  });

  // -------------------------------------------------------------------------
  // 20. Executed specialist extension failures strictly govern Orchestrator disposition (Redline Item 1)
  // -------------------------------------------------------------------------
  await t.test('20. Executed specialist extension failures strictly govern Orchestrator disposition', async () => {
    // Input where base Aperture is benign, but matrix SVD extension explodes condition number
    const extFailureInputs = {
      ...ALL_BENIGN_DOMAIN_INPUTS,
      APERTURE: {
        ...BENIGN_APERTURE_INPUT,
        matrix: [
          [1.0, 0.0],
          [1.0, 1e-5] // condition number ~200,000 > ceiling 1,000
        ]
      }
    };

    const res = await runDollhouseSkillAudit({
      domain_inputs: extFailureInputs
    });

    assert.equal(res.exit_code, 1);
    assert.equal(res.machine_receipt.orchestrator.decision, 'HELD');
    assert.equal(res.machine_receipt.orchestrator.consensus, 'HELD_DISSENT');

    const apertureFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(apertureFinding.verdict, 'HELD');
    assert.equal(apertureFinding.status, 'VIOLATION_DETECTED');
    assert.ok(apertureFinding.infractions.includes('NUMERICAL_STABILITY_DEFICIT'));
  });

  // -------------------------------------------------------------------------
  // 21. Source revision provenance verification and strict git history checking (Redline Item 3)
  // -------------------------------------------------------------------------
  await t.test('21. Source revision provenance verification and strict git history checking', async () => {
    // Malformed source revision format
    const resMalformed = await runDollhouseSkillAudit({
      source_revision: 'not-a-40-char-hex-commit-sha',
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resMalformed.exit_code, 1);
    assert.equal(resMalformed.machine_receipt.source_revision_verified, false);
    assert.ok(resMalformed.machine_receipt.detected_infractions.includes('HOLD_UNVERIFIABLE_SOURCE_REVISION'));

    // Valid format helper verification
    const validCheck = verifySourceRevision('ba90d24ecfd3311ed05cebf92d363195339a6270');
    assert.equal(validCheck.verified, true);
    assert.equal(validCheck.source_revision, 'ba90d24ecfd3311ed05cebf92d363195339a6270');
  });

  // -------------------------------------------------------------------------
  // 22. Evidence reference provenance verification (Redline Item 3)
  // -------------------------------------------------------------------------
  await t.test('22. Evidence reference provenance verification', async () => {
    // Reference to a non-existent file
    const resBadRef = await runDollhouseSkillAudit({
      evidence_references: ['nonexistent/path/to/missing-artifact.js'],
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resBadRef.exit_code, 1);
    assert.ok(resBadRef.machine_receipt.detected_infractions.includes('UNVERIFIED_EVIDENCE_REFERENCE'));
    assert.equal(resBadRef.machine_receipt.evidence_manifest[0].verified, false);

    // Reference to an existing file
    const resGoodRef = await runDollhouseSkillAudit({
      evidence_references: ['app/engine/dollhouse-skill-dispatcher.js'],
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resGoodRef.exit_code, 0);
    assert.equal(resGoodRef.machine_receipt.evidence_manifest[0].verified, true);
  });

  // -------------------------------------------------------------------------
  // 23. Artifact write fail-closed on unauthorized overwrite (Redline Item 4)
  // -------------------------------------------------------------------------
  await t.test('23. Artifact write fail-closed on unauthorized overwrite', async () => {
    const tempDir = join(tmpdir(), `td613-dollhouse-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const targetFile = join(tempDir, 'receipt.json');

    // Pre-create file
    writeFileSync(targetFile, JSON.stringify({ existing: true }), 'utf8');

    // Attempt overwrite without authorization
    const resBlocked = await runDollhouseSkillAudit({
      artifact_path: targetFile,
      allow_overwrite: false,
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resBlocked.exit_code, 1);
    assert.ok(resBlocked.machine_receipt.detected_infractions.includes('HOLD_ARTIFACT_WRITE_FAILED'));
    assert.ok(resBlocked.machine_receipt.artifact_write_error.includes('HOLD_ARTIFACT_EXISTS_OVERWRITE_PREVENTED'));

    // Attempt with explicit authorization
    const resAllowed = await runDollhouseSkillAudit({
      artifact_path: targetFile,
      allow_overwrite: true,
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resAllowed.exit_code, 0);
    const updated = JSON.parse(readFileSync(targetFile, 'utf8'));
    assert.equal(updated.schema, DOLLHOUSE_SKILL_RECEIPT_SCHEMA);

    // Cleanup
    try { unlinkSync(targetFile); } catch {}
  });

  // -------------------------------------------------------------------------
  // 24. Elimination of workstation-specific absolute paths from all .agents/ documents (Redline Item 5)
  // -------------------------------------------------------------------------
  await t.test('24. Elimination of workstation-specific absolute paths from all .agents/ documents', () => {
    const filesToCheck = [
      '.agents/skills/dollhouse-audit/SKILL.md',
      '.agents/skills/dollhouse-audit/references/specialists.md',
      '.agents/skills/dollhouse-audit/references/cli.md',
      '.agents/skills/dollhouse-audit/references/examples.md',
      '.agents/agents/dollhouse-pedagogue.md',
      '.agents/agents/dollhouse-aperture.md',
      '.agents/agents/dollhouse-atlas.md',
      '.agents/agents/dollhouse-fadt.md',
      '.agents/agents/dollhouse-temporal-custodian.md',
      '.agents/agents/dollhouse-orchestrator.md'
    ];

    for (const relPath of filesToCheck) {
      const fullPath = resolve(relPath);
      assert.ok(existsSync(fullPath), `File must exist: ${relPath}`);
      const content = readFileSync(fullPath, 'utf8');
      assert.ok(!content.includes('c:/Users'), `File ${relPath} must not contain absolute Windows user path`);
      assert.ok(!content.includes('OneDrive'), `File ${relPath} must not contain OneDrive path`);
      assert.ok(!content.includes('file:///c:'), `File ${relPath} must not contain absolute file:/// URI`);
    }
  });

  // -------------------------------------------------------------------------
  // 25. Host-independent JSON CLI interface and stdin streaming (Redline Item 6)
  // -------------------------------------------------------------------------
  await t.test('25. Host-independent JSON CLI interface and stdin streaming', () => {
    // Execute CLI runner with --format json
    const stdout = execSync('node scripts/run-dollhouse-skill-audit.mjs --input tests/fixtures/dollhouse/examples/focused-custody-audit.json --format json', {
      encoding: 'utf8'
    });

    const parsed = JSON.parse(stdout.trim());
    assert.equal(parsed.schema, DOLLHOUSE_SKILL_RECEIPT_SCHEMA);
    assert.equal(parsed.task_scope, 'CUSTODY_RELATION_DESCENT_AUDIT');
    assert.equal(parsed.orchestrator.decision, 'SUPPORTED');
  });

  // -------------------------------------------------------------------------
  // 26. Strict distinction between synthetic fault injection and observed source defects
  // -------------------------------------------------------------------------
  await t.test('26. Strict distinction between synthetic fault injection and observed source defects', async () => {
    // 1. Caller-supplied mathematical violation under declared SOURCE_CODE_AUDIT without source-bound witness
    const callerSuppliedDefect = await runDollhouseSkillAudit({
      evidence_class: 'SOURCE_CODE_AUDIT',
      evidence_references: ['app/engine/dollhouse-skill-dispatcher.js'],
      domain_inputs: {
        ...ALL_BENIGN_DOMAIN_INPUTS,
        APERTURE: {
          current_operator: [[1.0, 0.0], [1.0, 1e-5]]
        }
      }
    });

    const callerFinding = callerSuppliedDefect.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(callerFinding.verdict, 'HELD');
    assert.equal(callerFinding.defect_class, 'CALLER_SUPPLIED_MATHEMATICAL_VIOLATION');
    assert.equal(callerFinding.is_synthetic_injection, false);

    // 2. Caller-authored source-bound flags and unverified snippets cannot manufacture a source-observed defect.
    const authenticDefect = await runDollhouseSkillAudit({
      evidence_class: 'SOURCE_CODE_AUDIT',
      evidence_references: ['app/engine/dollhouse-skill-dispatcher.js'],
      domain_inputs: {
        ...ALL_BENIGN_DOMAIN_INPUTS,
        APERTURE: {
          source_bound: true,
          source_file: 'app/engine/dollhouse-skill-dispatcher.js',
          code_witness: 'const op = [[1.0, 0.0], [1.0, 1e-5]];',
          current_operator: [[1.0, 0.0], [1.0, 1e-5]]
        }
      }
    });

    const observedFinding = authenticDefect.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(observedFinding.verdict, 'HELD');
    assert.equal(observedFinding.defect_class, 'CALLER_SUPPLIED_MATHEMATICAL_VIOLATION');
    assert.equal(observedFinding.is_synthetic_injection, false);

    // 3. Synthetic fault injection fixture
    const syntheticDefect = await runDollhouseSkillAudit({
      domain_inputs: {
        ...ALL_BENIGN_DOMAIN_INPUTS,
        APERTURE: {
          fixture_class: 'SYNTHETIC_FAULT_INJECTION',
          concern: 'Synthetic test fault'
        }
      },
      options: { allow_synthetic_fault_injection: true }
    });

    const syntheticFinding = syntheticDefect.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(syntheticFinding.verdict, 'HELD');
    assert.equal(syntheticFinding.defect_class, 'SYNTHETIC_FAULT_INJECTION');
    assert.equal(syntheticFinding.is_synthetic_injection, true);
  });

  // -------------------------------------------------------------------------
  // 27. Canonical fixture execution suite (focused, complete, and readiness)
  // -------------------------------------------------------------------------
  await t.test('27. Canonical fixture execution suite verifies all 3 scenarios', async () => {
    // 1. Focused custody audit
    const focusedContent = JSON.parse(readFileSync('tests/fixtures/dollhouse/examples/focused-custody-audit.json', 'utf8'));
    const resFocused = await runDollhouseSkillAudit(focusedContent);
    assert.equal(resFocused.exit_code, 0);
    assert.equal(resFocused.machine_receipt.orchestrator.decision, 'SUPPORTED');

    // 2. Complete five-specialist audit
    const completeContent = JSON.parse(readFileSync('tests/fixtures/dollhouse/examples/complete-five-specialist-audit.json', 'utf8'));
    const resComplete = await runDollhouseSkillAudit(completeContent);
    assert.equal(resComplete.exit_code, 0);
    assert.equal(resComplete.machine_receipt.orchestrator.decision, 'SUPPORTED');
    assert.equal(resComplete.machine_receipt.orchestrator.consensus, 'UNANIMOUS_SUPPORT');

    // 3. Milestone 2 Loom Gate readiness (contains synthetic faults)
    const readinessContent = JSON.parse(readFileSync('tests/fixtures/dollhouse/examples/milestone-2-loom-gate-readiness.json', 'utf8'));
    const resReadiness = await runDollhouseSkillAudit(readinessContent);
    assert.equal(resReadiness.exit_code, 1);
    assert.equal(resReadiness.machine_receipt.orchestrator.decision, 'HELD');
    assert.equal(resReadiness.machine_receipt.orchestrator.consensus, 'UNANIMOUS_HOLD');
    assert.equal(resReadiness.machine_receipt.detected_infractions.length, 5);
  });

  // =========================================================================
  // ARTIFACT 39 MANDATORY REGRESSION COUNTEREXAMPLES (11 REQUIRED CASES)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 28. (Artifact 39 C1) Atlas valid seam recorded without false hold from missing .verified
  // -------------------------------------------------------------------------
  await t.test('28. (Artifact 39 C1) Atlas valid seam recorded without false hold from missing .verified', async () => {
    const payload = { fold: 4, weather_phase: 'cyclonic' };
    const digest = 'fnv32:22f3e8eb'; // Atlas v1 typed digest
    const res = await runDollhouseSkillAudit({
      roles: ['ATLAS'],
      include_orchestrator: false,
      domain_inputs: {
        ATLAS: {
          previous: {
            payload,
            metadata: { artifact_digest: digest, profile: 'atlas-v1' },
            projection: { view: 'PRIMARY' }
          },
          current: {
            payload,
            metadata: { artifact_digest: digest, profile: 'atlas-v1' },
            projection: { view: 'SECONDARY' }
          }
        }
      }
    });

    assert.equal(res.exit_code, 0);
    const atlasFinding = res.machine_receipt.specialist_findings[0];
    assert.equal(atlasFinding.verdict, 'SUPPORTED');
    assert.equal(atlasFinding.status, 'SEAM_DETECTED');
    assert.ok(atlasFinding.extensions?.phason_custody_diff);
    assert.equal(atlasFinding.extensions.phason_custody_diff.status, 'SEAM_DETECTED');
    assert.equal(atlasFinding.extensions.phason_custody_diff.content_invariant, true);
    assert.equal(atlasFinding.extensions.phason_custody_diff.projection_changed, true);
  });

  // -------------------------------------------------------------------------
  // 29. (Artifact 39 C2) Atlas invalid or corrupted seam produces expected hold
  // -------------------------------------------------------------------------
  await t.test('29. (Artifact 39 C2) Atlas invalid or corrupted seam produces expected hold', async () => {
    const payload = { fold: 4, weather_phase: 'cyclonic' };
    const corruptedDigest = 'fnv32:ffffffff';
    const res = await runDollhouseSkillAudit({
      roles: ['ATLAS'],
      include_orchestrator: false,
      domain_inputs: {
        ATLAS: {
          previous: {
            payload,
            metadata: { artifact_digest: corruptedDigest, profile: 'atlas-v1' }
          },
          current: {
            payload,
            metadata: { artifact_digest: corruptedDigest, profile: 'atlas-v1' }
          }
        }
      }
    });

    assert.equal(res.exit_code, 1);
    const atlasFinding = res.machine_receipt.specialist_findings[0];
    assert.equal(atlasFinding.verdict, 'HELD');
    assert.equal(atlasFinding.status, 'VIOLATION_DETECTED');
    assert.ok(res.machine_receipt.detected_infractions.includes('HOLD_DIGEST_PAYLOAD_MISMATCH'));
  });

  // -------------------------------------------------------------------------
  // 30. (Artifact 39 C3) FADT coordinate recovery handles two-argument signature correctly
  // -------------------------------------------------------------------------
  await t.test('30. (Artifact 39 C3) FADT coordinate recovery handles two-argument signature correctly', async () => {
    const collidingFiberRows = [
      { support: ['READ'], antecedent: { x: 0, y: 1 } },
      { support: ['WRITE'], antecedent: { x: 1, y: 1 } }
    ];
    const candidateCoordinates = ['x'];

    const res = await runDollhouseSkillAudit({
      roles: ['FADT'],
      include_orchestrator: false,
      domain_inputs: {
        FADT: {
          collidingFiberRows,
          candidateCoordinates
        }
      }
    });

    assert.equal(res.exit_code, 0);
    const fadtFinding = res.machine_receipt.specialist_findings[0];
    assert.equal(fadtFinding.verdict, 'SUPPORTED');
    assert.equal(fadtFinding.status, 'RESTORING_COORDINATE_EXTENSION_FOUND');
    assert.ok(fadtFinding.extensions?.coordinate_recovery);
    assert.deepEqual(fadtFinding.extensions.coordinate_recovery.best_extension, ['x']);
  });

  // -------------------------------------------------------------------------
  // 31. (Artifact 39 C4) FADT recovery rejects searches exceeding 10,000 combinations with UNSUPPORTED_SEARCH_SIZE
  // -------------------------------------------------------------------------
  await t.test('31. (Artifact 39 C4) FADT recovery rejects searches exceeding 10,000 combinations with UNSUPPORTED_SEARCH_SIZE', async () => {
    const collidingFiberRows = [
      { support: ['READ'], antecedent: { x: 0, y: 1 } },
      { support: ['WRITE'], antecedent: { x: 1, y: 1 } }
    ];
    // 14 candidate coordinates => 2^14 - 1 = 16,383 > 10,000 budget limit
    const candidateCoordinates = Array.from({ length: 14 }, (_, i) => `c_${i}`);

    const res = await runDollhouseSkillAudit({
      roles: ['FADT'],
      include_orchestrator: false,
      domain_inputs: {
        FADT: {
          collidingFiberRows,
          candidateCoordinates
        }
      }
    });

    assert.equal(res.exit_code, 1);
    const fadtFinding = res.machine_receipt.specialist_findings[0];
    assert.equal(fadtFinding.verdict, 'HELD');
    assert.equal(fadtFinding.status, 'VIOLATION_DETECTED');
    assert.ok(res.machine_receipt.detected_infractions.includes('UNSUPPORTED_SEARCH_SIZE'));
    assert.equal(fadtFinding.extensions.coordinate_recovery.status, 'UNSUPPORTED_SEARCH_SIZE');
    assert.equal(fadtFinding.extensions.coordinate_recovery.budget_exceeded, true);
  });

  // -------------------------------------------------------------------------
  // 32. (Artifact 39 C5) Temporal Custodian ledger/chronology defect triggers binding hold via actual schema properties
  // -------------------------------------------------------------------------
  await t.test('32. (Artifact 39 C5) Temporal Custodian ledger/chronology defect triggers binding hold via actual schema properties', async () => {
    const fixture = JSON.parse(readFileSync('tests/fixtures/dollhouse/bounded-orchestrator-case.json', 'utf8')).temporal;
    // Mutate baseline historical field (retroactive historical mutation)
    fixture.ledger_entries[0].state = 'MUTATED_BASELINE_FIELD';

    const res = await runDollhouseSkillAudit({
      roles: ['TEMPORAL_CUSTODIAN'],
      include_orchestrator: false,
      domain_inputs: {
        TEMPORAL_CUSTODIAN: {
          temporal_input: fixture
        }
      }
    });

    assert.equal(res.exit_code, 1);
    const temporalFinding = res.machine_receipt.specialist_findings[0];
    assert.equal(temporalFinding.verdict, 'HELD');
    assert.equal(temporalFinding.status, 'VIOLATION_DETECTED');
    assert.ok(temporalFinding.extensions?.temporal_audit);
    assert.equal(temporalFinding.extensions.temporal_audit.verdict, 'FAIL');
    assert.ok(temporalFinding.infractions.includes('RETROACTIVE_HISTORICAL_MUTATION'));
  });

  // -------------------------------------------------------------------------
  // 33. (Artifact 39 C6) Nonexistent git commit SHA produces git_commit_verified: false and explicit hold
  // -------------------------------------------------------------------------
  await t.test('33. (Artifact 39 C6) Nonexistent git commit SHA produces git_commit_verified: false and explicit hold', async () => {
    const nonexistentCommit = '0123456789abcdef0123456789abcdef01234567';
    const res = await runDollhouseSkillAudit({
      source_revision: nonexistentCommit,
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(res.exit_code, 1);
    assert.equal(res.machine_receipt.source_revision_verified, false);
    assert.ok(res.machine_receipt.detected_infractions.includes('HOLD_SOURCE_REVISION_NOT_IN_LOCAL_HISTORY'));
  });

  // -------------------------------------------------------------------------
  // 34. (Artifact 39 C7) Standalone 64-character digest without file bytes marked unverified
  // -------------------------------------------------------------------------
  await t.test('34. (Artifact 39 C7) Standalone 64-character digest without file bytes marked unverified', async () => {
    const standaloneHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const validation = verifyEvidenceReferences([standaloneHash]);

    assert.equal(validation.all_verified, false);
    assert.equal(validation.manifest.length, 1);
    assert.equal(validation.manifest[0].type, 'STANDALONE_CONTENT_DIGEST');
    assert.equal(validation.manifest[0].verified, false);
    assert.equal(validation.manifest[0].byte_digest_verified, false);
    assert.equal(validation.manifest[0].provenance_tier, 'UNVERIFIED_DIGEST_DECLARATION');
    assert.ok(validation.infractions.includes('HOLD_UNVERIFIED_STANDALONE_DIGEST'));
  });

  // -------------------------------------------------------------------------
  // 35. (Artifact 39 C8) Failed dossier creation produces binding hold when requested
  // -------------------------------------------------------------------------
  await t.test('35. (Artifact 39 C8) Failed dossier creation produces binding hold when requested', async () => {
    const res = await runDollhouseSkillAudit({
      create_case_dossier: true,
      dossier_spec: null, // missing dossier spec triggers failure
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(res.exit_code, 1);
    assert.ok(res.machine_receipt.detected_infractions.includes('HOLD_CASE_DOSSIER_CREATION_FAILED'));
    assert.equal(res.machine_receipt.orchestrator.decision, 'HELD');
    assert.ok(res.machine_receipt.case_dossier.error);
  });

  // -------------------------------------------------------------------------
  // 36. (Artifact 39 C9) Receipt writing rejects symlink redirection and unauthorized overwrites
  // -------------------------------------------------------------------------
  await t.test('36. (Artifact 39 C9) Receipt writing rejects symlink redirection and unauthorized overwrites', async () => {
    const tempDir = join(tmpdir(), `td613-dollhouse-symlink-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const targetFile = join(tempDir, 'existing-receipt.json');
    writeFileSync(targetFile, JSON.stringify({ protected: true }), 'utf8');

    // 1. Unauthorized overwrite must throw HOLD_ARTIFACT_EXISTS_OVERWRITE_PREVENTED
    await assert.rejects(
      async () => {
        await writeReceiptArtifact(targetFile, { test: 1 }, '# Receipt', {
          operator_authorized_overwrite: false
        });
      },
      /HOLD_ARTIFACT_EXISTS_OVERWRITE_PREVENTED/
    );

    // 2. Symlink redirection check
    const symlinkPath = join(tempDir, 'receipt-symlink.json');
    let symlinkCreated = false;
    try {
      const { symlinkSync } = await import('node:fs');
      symlinkSync(targetFile, symlinkPath);
      symlinkCreated = true;
    } catch {}

    if (symlinkCreated) {
      await assert.rejects(
        async () => {
          await writeReceiptArtifact(symlinkPath, { test: 1 }, '# Receipt', {
            operator_authorized_overwrite: true
          });
        },
        /HOLD_ARTIFACT_SYMLINK_REDIRECTION_REJECTED/
      );
    }
  });

  // -------------------------------------------------------------------------
  // 37. (Artifact 39 C10) Synthetic fixture violation labeled SYNTHETIC_MATHEMATICAL_VIOLATION
  // -------------------------------------------------------------------------
  await t.test('37. (Artifact 39 C10) Synthetic fixture violation labeled SYNTHETIC_MATHEMATICAL_VIOLATION', async () => {
    const res = await runDollhouseSkillAudit({
      evidence_class: 'SYNTHETIC_TEST_FIXTURE',
      domain_inputs: {
        ...ALL_BENIGN_DOMAIN_INPUTS,
        APERTURE: {
          current_operator: [[1.0, 0.0], [1.0, 1e-5]]
        }
      }
    });

    const apertureFinding = res.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(apertureFinding.verdict, 'HELD');
    assert.equal(apertureFinding.defect_class, 'SYNTHETIC_MATHEMATICAL_VIOLATION');
    assert.equal(apertureFinding.is_synthetic_injection, false);
  });

  // -------------------------------------------------------------------------
  // 38. (Artifact 39 C11) Documentation links in .agents/ resolve to existing files
  // -------------------------------------------------------------------------
  await t.test('38. (Artifact 39 C11) Documentation links in .agents/ resolve to existing files', async () => {
    const { readdirSync, statSync, readFileSync: rfs, existsSync: exs } = await import('node:fs');
    const { resolve: rsv, dirname: dnm, join: jn } = await import('node:path');

    function collectMarkdownFiles(dir) {
      let results = [];
      for (const entry of readdirSync(dir)) {
        const full = jn(dir, entry);
        if (statSync(full).isDirectory()) {
          results.push(...collectMarkdownFiles(full));
        } else if (full.endsWith('.md')) {
          results.push(full);
        }
      }
      return results;
    }

    const mdFiles = collectMarkdownFiles('.agents');
    assert.ok(mdFiles.length >= 10, 'Expected at least 10 markdown documentation files in .agents/');

    let brokenLinks = 0;
    const brokenList = [];

    for (const file of mdFiles) {
      const content = rfs(file, 'utf8');
      const fileDir = dnm(rsv(file));
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(content)) !== null) {
        const rawLink = match[2].trim();
        if (rawLink.startsWith('http') || rawLink.startsWith('#') || rawLink.startsWith('mailto')) continue;
        const cleanPath = rawLink.split('#')[0];
        if (!cleanPath) continue;
        const targetPath = rsv(fileDir, cleanPath);
        if (!exs(targetPath)) {
          brokenLinks++;
          brokenList.push(`${file} -> ${rawLink} (resolved: ${targetPath})`);
        }
      }
    }

    assert.equal(brokenLinks, 0, `All links in .agents/ must resolve to existing files. Broken: ${brokenList.join('; ')}`);
  });

  // =========================================================================
  // ARTIFACT 40 RETURN NOTES PRE-MERGE ADMISSION TESTS (3 REQUIRED CASES)
  // =========================================================================

  // -------------------------------------------------------------------------
  // 39. (Artifact 40 C1) Canonical Orchestrator veto preserves DIVERGENT_ROLE_OBSERVATION_CONFLICT in both Orchestrator and standalone modes
  // -------------------------------------------------------------------------
  await t.test('39. (Artifact 40 C1) Canonical Orchestrator veto preserves DIVERGENT_ROLE_OBSERVATION_CONFLICT in both Orchestrator and standalone modes', async () => {
    // Divergent Pedagogue observations using keys PEDAGOGUE and pedagogue
    const divergentInput = {
      roles: ['PEDAGOGUE', 'ORCHESTRATOR'],
      domain_inputs: {
        PEDAGOGUE: {
          events: [
            { type: 'NOTICE', payload: 'Notice 1' },
            { type: 'ACT', payload: 'Act 1' }
          ]
        },
        pedagogue: {
          events: [
            { type: 'ACT', payload: 'Act Divergent' }
          ]
        }
      }
    };

    // 1. With Orchestrator enabled
    const resOrch = await runDollhouseSkillAudit(divergentInput);
    assert.equal(resOrch.exit_code, 1);
    assert.equal(resOrch.machine_receipt.orchestrator.decision, 'HELD');
    assert.ok(resOrch.machine_receipt.detected_infractions.includes('DIVERGENT_ROLE_OBSERVATION_CONFLICT'));
    assert.equal(resOrch.machine_receipt.orchestrator.replication_status, 'DIVERGENT_OBSERVATION_REJECTED');

    // 2. Standalone mode (without Orchestrator)
    const resStandalone = await runDollhouseSkillAudit({
      ...divergentInput,
      roles: ['PEDAGOGUE'],
      include_orchestrator: false
    });
    assert.equal(resStandalone.exit_code, 1);
    assert.ok(resStandalone.machine_receipt.detected_infractions.includes('DIVERGENT_ROLE_OBSERVATION_CONFLICT'));
    const pedagogueFinding = resStandalone.machine_receipt.specialist_findings.find(f => f.role === 'PEDAGOGUE');
    assert.equal(pedagogueFinding.verdict, 'HELD');
  });

  // -------------------------------------------------------------------------
  // 40. (Artifact 40 C2) Source-observed evidence requires source-bound observation; historical commit distinguished from exact checkout
  // -------------------------------------------------------------------------
  await t.test('40. (Artifact 40 C2) Source-observed evidence requires source-bound observation; historical commit distinguished from exact checkout', async () => {
    // 1. Unrelated Aperture matrix under SOURCE_CODE_AUDIT does not claim OBSERVED_SOURCE_DEFECT
    const resUnrelated = await runDollhouseSkillAudit({
      evidence_class: 'SOURCE_CODE_AUDIT',
      evidence_references: ['app/engine/dollhouse-skill-dispatcher.js'],
      domain_inputs: {
        ...ALL_BENIGN_DOMAIN_INPUTS,
        APERTURE: {
          current_operator: [[1.0, 0.0], [1.0, 1e-5]]
        }
      }
    });

    const apertureFinding = resUnrelated.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(apertureFinding.verdict, 'HELD');
    assert.equal(apertureFinding.defect_class, 'CALLER_SUPPLIED_MATHEMATICAL_VIOLATION');
    assert.notEqual(apertureFinding.defect_class, 'OBSERVED_SOURCE_DEFECT');

    // 2. Historical commit exists in git history but differs from executing checkout
    const historicalCommit = 'b24f72c973ef7eb0c5d2de52639dc43020f1bb0b';
    const resHistory = await runDollhouseSkillAudit({
      source_revision: historicalCommit,
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resHistory.machine_receipt.source_revision, historicalCommit);
    assert.equal(resHistory.machine_receipt.git_commit_verified, true);
    assert.equal(resHistory.machine_receipt.is_exact_checkout_match, false);
    assert.equal(resHistory.machine_receipt.exact_checkout_verified, false);
    assert.equal(resHistory.machine_receipt.is_historical_commit_only, true);
  });

  // -------------------------------------------------------------------------
  // 41. (Artifact 40 C3) Complete evidence and output-file custody: directories fail byte verification; path escape, symlink components and untrusted JSON overwrite rejected
  // -------------------------------------------------------------------------
  await t.test('41. (Artifact 40 C3) Complete evidence and output-file custody: directories fail byte verification; path escape, symlink components and untrusted JSON overwrite rejected', async () => {
    // 1. Existing directory cannot establish byte-verifiable evidence
    const resDir = await runDollhouseSkillAudit({
      evidence_references: ['tests'],
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resDir.machine_receipt.evidence_manifest[0].byte_digest_verified, false);
    assert.equal(resDir.machine_receipt.evidence_manifest[0].reason, 'NOT_A_REGULAR_FILE');
    assert.ok(resDir.machine_receipt.detected_infractions.includes('HOLD_NON_REGULAR_FILE_REFERENCE'));

    // 2. Output destination custody: cannot write receipt into protected source file (e.g. package.json)
    await assert.rejects(
      async () => {
        await writeReceiptArtifact('package.json', { test: 1 }, '# Receipt', {
          operator_authorized_overwrite: true
        });
      },
      /HOLD_ARTIFACT_DESTINATION_NOT_AUTHORIZED/
    );

    // 3. Output destination custody: cannot write into app/ source directory
    await assert.rejects(
      async () => {
        await writeReceiptArtifact('app/engine/fake-receipt.json', { test: 1 }, '# Receipt');
      },
      /HOLD_ARTIFACT_DESTINATION_NOT_AUTHORIZED/
    );

    // 4. Symlink directory component rejected along path
    const tempDir = join(tmpdir(), `td613-dollhouse-symlink-dir-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    const realSubDir = join(tempDir, 'real-subdir');
    mkdirSync(realSubDir, { recursive: true });
    const symlinkDir = join(tempDir, 'symlink-subdir');

    let symlinkDirCreated = false;
    try {
      const { symlinkSync } = await import('node:fs');
      symlinkSync(realSubDir, symlinkDir, 'junction');
      symlinkDirCreated = true;
    } catch {}

    if (symlinkDirCreated) {
      const targetInSymlinkDir = join(symlinkDir, 'receipt.json');
      await assert.rejects(
        async () => {
          await writeReceiptArtifact(targetInSymlinkDir, { test: 1 }, '# Receipt');
        },
        /HOLD_ARTIFACT_SYMLINK_REDIRECTION_REJECTED/
      );
    }

    // 5. Untrusted caller JSON allow_overwrite cannot grant independent authorization
    const targetFile = join(tempDir, 'existing.json');
    writeFileSync(targetFile, JSON.stringify({ protected: true }), 'utf8');

    const resUntrusted = await runDollhouseSkillAudit({
      artifact_path: targetFile,
      allow_overwrite: true,
      options: { untrusted_caller_json: true },
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });

    assert.equal(resUntrusted.exit_code, 1);
    assert.ok(resUntrusted.machine_receipt.detected_infractions.includes('HOLD_ARTIFACT_WRITE_FAILED'));
    assert.ok(resUntrusted.machine_receipt.artifact_write_error.includes('HOLD_ARTIFACT_EXISTS_OVERWRITE_PREVENTED'));
  });
  // 42. Caller-declared source-bound flags never substitute for inspected bytes.
  await t.test('42. Caller source-bound declarations cannot promote mathematical failures to observed source defects', async () => {
    const res = await runDollhouseSkillAudit({
      evidence_class: 'SOURCE_CODE_AUDIT',
      evidence_references: ['app/engine/dollhouse-skill-dispatcher.js'],
      domain_inputs: {
        ...ALL_BENIGN_DOMAIN_INPUTS,
        APERTURE: {
          current_operator: [[1, 0], [1, 0.00001]],
          source_bound: true,
          inspected_code_witness: true,
          source_file: 'app/engine/dollhouse-skill-dispatcher.js',
          source_snippet: 'caller supplied and not independently inspected'
        }
      }
    });
    const finding = res.machine_receipt.specialist_findings.find(f => f.role === 'APERTURE');
    assert.equal(finding.verdict, 'HELD');
    assert.equal(finding.defect_class, 'CALLER_SUPPLIED_MATHEMATICAL_VIOLATION');
    assert.notEqual(finding.defect_class, 'OBSERVED_SOURCE_DEFECT');
  });

  // 43. Typed references must reach the byte verifier without stringification.
  await t.test('43. Typed evidence references verify matching bytes and reject digest mismatch', async () => {
    const { createHash } = await import('node:crypto');
    const evidencePath = 'app/engine/dollhouse-skill-dispatcher.js';
    const sha256 = createHash('sha256').update(readFileSync(evidencePath)).digest('hex');
    const valid = await runDollhouseSkillAudit({
      evidence_references: [{ path: evidencePath, sha256 }],
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });
    assert.equal(valid.exit_code, 0);
    assert.equal(valid.machine_receipt.evidence_manifest[0].verified, true);
    assert.equal(valid.machine_receipt.evidence_manifest[0].byte_digest_verified, true);
    assert.equal(valid.machine_receipt.evidence_manifest[0].sha256, sha256);
    assert.equal(valid.machine_receipt.evidence_references[0].path, evidencePath);

    const invalid = await runDollhouseSkillAudit({
      evidence_references: [{ path: evidencePath, sha256: '0'.repeat(64) }],
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });
    assert.equal(invalid.exit_code, 1);
    assert.ok(invalid.machine_receipt.detected_infractions.includes('EVIDENCE_BYTE_DIGEST_MISMATCH'));
  });

  // 44. Untrusted output-authority flags cannot widen destination permissions.
  await t.test('44. Caller-authored output destination overrides cannot write into source tree', async () => {
    await assert.rejects(async () => {
      await writeReceiptArtifact('app/engine/untrusted-audit-output.js', { schema: 'test' }, '# Test', {
        authorized_output_destination: true,
        operator_authorized_overwrite: true
      });
    }, /HOLD_ARTIFACT_DESTINATION_NOT_AUTHORIZED/);
  });

  // 45. Source-code audit without a declared evidence reference fails closed.
  await t.test('45. Source code audit requires references even without strict provenance option', async () => {
    const res = await runDollhouseSkillAudit({
      evidence_class: 'SOURCE_CODE_AUDIT',
      domain_inputs: ALL_BENIGN_DOMAIN_INPUTS
    });
    assert.equal(res.exit_code, 1);
    assert.ok(res.machine_receipt.detected_infractions.includes('SOURCE_CODE_AUDIT_MISSING_EVIDENCE_REFERENCES'));
  });

  // 46. A dangling symlink is an existing filesystem object even when existsSync returns false.
  await t.test('46. Dangling symlink target cannot redirect receipt write', async () => {
    const { symlinkSync } = await import('node:fs');
    const dir = join(tmpdir(), `td613-dollhouse-dangling-link-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const linkPath = join(dir, 'receipt.json');
    const missingTarget = join(dir, 'missing-outside-target.json');
    try {
      symlinkSync(missingTarget, linkPath);
    } catch (err) {
      if (process.platform === 'win32' && (err.code === 'EPERM' || err.code === 'EACCES')) return;
      throw err;
    }
    await assert.rejects(
      () => writeReceiptArtifact(linkPath, { test: true }, '# Receipt', { operator_authorized_overwrite: true }),
      /HOLD_ARTIFACT_SYMLINK_REDIRECTION_REJECTED/
    );
    assert.ok(!existsSync(missingTarget));
  });

  // 47. Atlas executes Five-Chamber mathematical capabilities via skill dispatcher
  await t.test('47. Atlas executes Five-Chamber mathematical capabilities via skill dispatcher when domain input is supplied', async () => {
    const res = await runDollhouseSkillAudit({
      roles: ['ATLAS'],
      include_orchestrator: false,
      domain_inputs: {
        ATLAS: {
          ...BENIGN_ATLAS_INPUT,
          temporal_fiber: {},
          higher_order_parity: {},
          ghz_stabilizer: {},
          modular_vs_real_svd: {},
          causal_morphism_control: {},
          ontology_free_surprise: {},
          visibility_inverse: {},
          measurement_context: {},
          notation_normalization: {}
        }
      }
    });

    assert.equal(res.exit_code, 0);
    const atlasFinding = res.machine_receipt.specialist_findings[0];
    assert.equal(atlasFinding.verdict, 'SUPPORTED');
    assert.ok(atlasFinding.extensions?.temporal_fiber);
    assert.equal(atlasFinding.extensions.temporal_fiber.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.higher_order_parity);
    assert.equal(atlasFinding.extensions.higher_order_parity.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.ghz_stabilizer);
    assert.equal(atlasFinding.extensions.ghz_stabilizer.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.modular_vs_real_svd);
    assert.equal(atlasFinding.extensions.modular_vs_real_svd.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.causal_morphism_control);
    assert.equal(atlasFinding.extensions.causal_morphism_control.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.ontology_free_surprise);
    assert.equal(atlasFinding.extensions.ontology_free_surprise.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.visibility_inverse);
    assert.equal(atlasFinding.extensions.visibility_inverse.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.measurement_context);
    assert.equal(atlasFinding.extensions.measurement_context.positive_control.passed, true);
    assert.ok(atlasFinding.extensions?.notation_normalization);
    assert.equal(atlasFinding.extensions.notation_normalization.positive_control.passed, true);
  });

});
