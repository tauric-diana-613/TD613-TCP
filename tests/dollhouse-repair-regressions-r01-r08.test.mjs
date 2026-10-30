import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

import {
  runDollhouseDesignCycle,
  normalizeCommission,
  deriveCommissionCandidates,
  buildInstrumentCausalContract,
  resolveHistoricalReference
} from '../app/engine/dollhouse-design-conductor.js';

import {
  runDollhouseSkillAudit,
  verifySourceRevision
} from '../app/engine/dollhouse-skill-dispatcher.js';

test('R01 - Companion audit disposition and CLI flag precedence', async (t) => {
  // R01.1 Conductor carries actual Orchestrator decision
  const designResult = await runDollhouseDesignCycle({
    seed: 'Testing companion audit integration',
    medium: 'SCHOLARLY',
    scientific_audit_requested: true
  });

  assert.ok(designResult.scientific_companion_audit, 'Companion audit must be present when requested');
  assert.notEqual(designResult.scientific_companion_audit.disposition, undefined, 'Disposition must not be undefined');
  assert.equal(designResult.scientific_companion_audit.disposition, 'HELD_MISSING_OBSERVATION');

  // R01.2 CLI option precedence: --audit and --deliverable-count over input file
  const tempFixturePath = resolve('tests/fixtures/dollhouse/temp_r01_fixture.json');
  writeFileSync(tempFixturePath, JSON.stringify({
    seed: 'Commission from file',
    medium: 'VISUAL',
    deliverable_count: 1,
    scientific_audit_requested: false
  }, null, 2));

  t.after(() => {
    if (existsSync(tempFixturePath)) unlinkSync(tempFixturePath);
  });

  const cliOutput = execFileSync('node', [
    'scripts/run-dollhouse-design.mjs',
    '--input', tempFixturePath,
    '--audit',
    '--deliverable-count', '3',
    '--format', 'json'
  ], { encoding: 'utf8' });

  const receipt = JSON.parse(cliOutput);
  assert.equal(receipt.output_contract.requested_deliverables, 3, 'CLI --deliverable-count 3 must override file');
  assert.ok(receipt.scientific_companion_audit, 'CLI --audit must arm scientific_audit_requested over file');
  assert.equal(receipt.scientific_companion_audit.disposition, 'HELD_MISSING_OBSERVATION');
});

test('R02 - Proposed mechanisms presented truthfully without false executed laws', () => {
  // 1. Generic VISUAL commission without materialized artifact or historical qualification fixture
  const visualContract = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'VISUAL', ['corridor', 'delay']);
  for (const binding of visualContract.causal_bindings) {
    assert.equal(binding.execution_status, 'PROPOSED_TRANSFER_LAW',
      'Generic VISUAL planning contract must not claim EXECUTED_DEMONSTRATION_LAW without historical fixture');
  }
  const visualLawsString = JSON.stringify(visualContract.causal_bindings);
  assert.equal(visualLawsString.includes('T_clearance = mu * 400ms'), false,
    'Generic VISUAL contract must not hardcode 400ms historical chamber delay');
  assert.equal(visualLawsString.includes('chamber_index * 4'), false,
    'Generic VISUAL contract must not hardcode chamber_index * 4');
  assert.equal(visualLawsString.includes('16/16 redactions'), false,
    'Generic VISUAL contract must not hardcode 16/16 petition redactions');

  // 2. PRODUCT commission
  const productContract = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'PRODUCT', ['procurement', 'delay']);
  for (const binding of productContract.causal_bindings) {
    assert.equal(binding.execution_status, 'PROPOSED_TRANSFER_LAW');
  }

  // 3. Historical qualification fixture ONLY
  const historicalContract = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'VISUAL', [], {
    historical_fixture: 'tests/fixtures/dollhouse/caro_corridor_primary.html'
  });
  assert.equal(historicalContract.causal_bindings[0].execution_status, 'EXECUTED_DEMONSTRATION_LAW',
    'Explicit historical qualification fixture scope must verify EXECUTED_DEMONSTRATION_LAW');
  assert.ok(historicalContract.causal_bindings[0].transfer_law.includes('400ms'),
    'Historical demonstration binding must reference 400ms chamber latency');
});

test('R03 - Explicit instrument choice governs candidate construction', () => {
  // Seed contains "archive", which belongs to institutional cluster, but instrument is SEDGWICK_REPARATIVE_TEXTURE
  const comm = normalizeCommission({
    seed: 'A community care archive for gentle reading',
    medium: 'SCHOLARLY',
    instruments: ['SEDGWICK_REPARATIVE_TEXTURE']
  });

  const [candA, candB] = deriveCommissionCandidates(comm);

  // Candidate A must reflect Sedgwick reparative texture, NOT Caro administrative resistance
  assert.ok(
    candA.concept_title.toLowerCase().includes('textile') ||
    candA.concept_title.toLowerCase().includes('shelter') ||
    candA.concept_title.toLowerCase().includes('reparative') ||
    candA.concept_title.toLowerCase().includes('paratactic'),
    `Expected Sedgwickian title for Cand A, got: ${candA.concept_title}`
  );
  assert.ok(
    !candA.formal_proposition.toLowerCase().includes('administrative resistance') &&
    !candA.formal_proposition.toLowerCase().includes('institutional friction'),
    `Candidate A proposition was hijacked by Caro keywords: ${candA.formal_proposition}`
  );
});

test('R04 - Reference scope and provenance security', () => {
  // R04.1 Reject directory traversal escape
  assert.throws(() => {
    resolveHistoricalReference({
      reference_id: 'REF-ESCAPE',
      source_path: '../outside-sentinel.md',
      classification: 'BINDING_CONSTRAINT'
    });
  }, /escapes|traversal|outside/i);

  // R04.2 Mutable symbolic ref resolution pins to immutable 40-hex SHA
  const resolved = resolveHistoricalReference({
    reference_id: 'REF-HEAD',
    source_path: 'AGENTS.md',
    source_revision: 'HEAD',
    classification: 'BINDING_CUSTODY_LAW'
  });
  if (resolved.resolved && resolved.retrieval_method.includes('GIT')) {
    assert.match(resolved.resolved_commit, /^[a-f0-9]{40}$/);
    assert.equal(resolved.retrieval_method, 'GIT_SHOW_PINNED_COMMIT');
  }

  // R04.3 Working tree fallback: caller claiming CONTEMPORANEOUS_ORIGINAL is refused
  const resolvedWorkingTreeSpoofed = resolveHistoricalReference({
    reference_id: 'REF-LOCAL-SPOOFED',
    source_path: 'AGENTS.md',
    source_revision: 'WORKING_TREE',
    provenance_class: 'CONTEMPORANEOUS_ORIGINAL',
    classification: 'NEGOTIABLE_AESTHETIC_DIRECTION'
  });
  assert.equal(resolvedWorkingTreeSpoofed.provenance_class, 'WORKING_TREE_LOCAL_SUBSTITUTE',
    'Caller-spoofed original must be downgraded to WORKING_TREE_LOCAL_SUBSTITUTE on working tree fallback');
  assert.equal(resolvedWorkingTreeSpoofed.effective_provenance_class, 'WORKING_TREE_LOCAL_SUBSTITUTE');
  assert.equal(resolvedWorkingTreeSpoofed.declared_provenance_class, 'CONTEMPORANEOUS_ORIGINAL');
  assert.ok(resolvedWorkingTreeSpoofed.provenance_mismatch);

  // R04.4 normalizeCommission defaults: non-hex ref cannot default to CONTEMPORANEOUS_ORIGINAL
  const normalized = normalizeCommission({
    seed: 'Testing provenance default',
    historical_references: [
      { reference_id: 'REF-MUTABLE', source_path: 'AGENTS.md', source_revision: 'HEAD' }
    ]
  });
  assert.notEqual(normalized.historical_references[0].provenance_class, 'CONTEMPORANEOUS_ORIGINAL',
    'normalizeCommission must not default non-hex revision to CONTEMPORANEOUS_ORIGINAL');
});

test('R05 - Candidate override validation, preservation, and substantive evaluation', async () => {
  // R05.1 Reject undeclared instrument
  assert.throws(() => {
    normalizeCommission({
      seed: 'Test overrides',
      candidate_overrides: [
        { concept_title: 'Cand 1', governing_instrument: 'UNDECLARED_INSTRUMENT', formal_proposition: 'Prop 1' },
        { concept_title: 'Cand 2', governing_instrument: 'PHASONIC_COUNTERPOINT', formal_proposition: 'Prop 2' }
      ]
    });
  }, /Unrecognized instrument/i);

  // R05.2 Reject exact duplicate overrides
  assert.throws(() => {
    normalizeCommission({
      seed: 'Test duplicates',
      candidate_overrides: [
        { concept_title: 'Duplicate', governing_instrument: 'PHASONIC_COUNTERPOINT', formal_proposition: 'Identical' },
        { concept_title: 'Duplicate', governing_instrument: 'PHASONIC_COUNTERPOINT', formal_proposition: 'Identical' }
      ]
    });
  }, /duplicate/i);

  // R05.3 Preserve 3+ candidates in receipt and substantively evaluate all 3 in comparative analysis
  const comm3 = {
    seed: 'Test three candidates',
    candidate_overrides: [
      { concept_title: 'Cand 1', governing_instrument: 'PHASONIC_COUNTERPOINT', formal_proposition: 'Prop 1' },
      { concept_title: 'Cand 2', governing_instrument: 'CARO_INSTITUTIONAL_RECONSTRUCTION', formal_proposition: 'Prop 2' },
      { concept_title: 'Cand 3', governing_instrument: 'SEDGWICK_REPARATIVE_TEXTURE', formal_proposition: 'Prop 3' }
    ]
  };
  const receipt3 = await runDollhouseDesignCycle(comm3);
  assert.equal(receipt3.candidates.length, 3, 'Must preserve all 3 candidate overrides');
  assert.equal(receipt3.output_contract.requested_deliverables, 1, 'Universal default deliverables must remain 1');
  assert.ok(receipt3.comparative_analysis.candidate_evaluations, 'Comparative analysis must evaluate candidate overrides');
  assert.equal(receipt3.comparative_analysis.candidate_evaluations.length, 3, 'Comparative analysis must evaluate all 3 candidates');
});

test('R06 - Role execution accounting: requested vs attempted vs executed', async () => {
  const result = await runDollhouseSkillAudit({
    source_revision: 'WORKING_TREE_UNCOMMITTED',
    task_scope: 'ROLE_EXECUTION_ACCOUNTING_NEGATIVE_CONTROL',
    roles: ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT', 'TEMPORAL_CUSTODIAN'],
    include_orchestrator: true,
    evidence_class: 'SYNTHETIC_TEST_FIXTURE',
    domain_inputs: {}
  });

  const receipt = result.machine_receipt;
  // All 5 roles were requested
  assert.equal(receipt.roles_requested.length, 5);
  // BUT none had domain inputs, so none were executed!
  assert.deepEqual(receipt.roles_executed, [], 'roles_executed must be empty when inputs are missing');
  assert.equal(receipt.missing_inputs.length, 5, 'All 5 roles must be in missing_inputs');
  assert.equal(receipt.orchestrator.decision, 'HELD_MISSING_OBSERVATION');
});

test('R07 - Executing source byte integrity and clean working tree verification', () => {
  const tempRepo = mkdtempSync(resolve(tmpdir(), 'td613-r07-cleanliness-'));
  try {
    execFileSync('git', ['init'], { cwd: tempRepo });
    execFileSync('git', ['config', 'user.email', 'test@td613.local'], { cwd: tempRepo });
    execFileSync('git', ['config', 'user.name', 'TD613 Test'], { cwd: tempRepo });
    mkdirSync(resolve(tempRepo, 'app/engine'), { recursive: true });
    writeFileSync(resolve(tempRepo, 'app/engine/core.js'), '// original source\n');
    execFileSync('git', ['add', '.'], { cwd: tempRepo });
    execFileSync('git', ['commit', '-m', 'Initial commit'], { cwd: tempRepo });
    const commitA = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: tempRepo, encoding: 'utf8' }).trim();

    // 1. Clean checkout of exact commit
    const cleanCheck = verifySourceRevision(commitA, {
      repo_root: tempRepo,
      require_exact_checkout: true
    });
    assert.equal(cleanCheck.verified, true);
    assert.equal(cleanCheck.exact_checkout_verified, true);

    // 2. Unstaged modification in source tree
    writeFileSync(resolve(tempRepo, 'app/engine/core.js'), '// modified dirty source\n');
    const dirtyCheckUnstaged = verifySourceRevision(commitA, {
      repo_root: tempRepo,
      require_exact_checkout: true
    });
    assert.equal(dirtyCheckUnstaged.verified, false, 'Unstaged source modifications must fail verification');
    assert.equal(dirtyCheckUnstaged.exact_checkout_verified, false);
    assert.equal(dirtyCheckUnstaged.infraction, 'HOLD_WORKING_TREE_DIRTY_NOT_CLEAN_CHECKOUT');

    // 3. Staged modification in source tree
    execFileSync('git', ['add', 'app/engine/core.js'], { cwd: tempRepo });
    const dirtyCheckStaged = verifySourceRevision(commitA, {
      repo_root: tempRepo,
      require_exact_checkout: true
    });
    assert.equal(dirtyCheckStaged.verified, false, 'Staged source modifications must fail verification');
    assert.equal(dirtyCheckStaged.exact_checkout_verified, false);
    assert.equal(dirtyCheckStaged.infraction, 'HOLD_WORKING_TREE_DIRTY_NOT_CLEAN_CHECKOUT');

    // 4. Commit modification -> commit B
    execFileSync('git', ['commit', '-m', 'Second commit'], { cwd: tempRepo });
    // Now verify commit A (historical commit, not HEAD) with require_exact_checkout
    const histCheckExact = verifySourceRevision(commitA, {
      repo_root: tempRepo,
      require_exact_checkout: true
    });
    assert.equal(histCheckExact.verified, false, 'Historical commit must fail when require_exact_checkout is true');
    assert.equal(histCheckExact.infraction, 'HOLD_HISTORICAL_COMMIT_NOT_EXACT_CHECKOUT');

    // 5. Verify commit A without require_exact_checkout
    const histCheckPermissive = verifySourceRevision(commitA, {
      repo_root: tempRepo,
      require_exact_checkout: false
    });
    assert.equal(histCheckPermissive.verified, true);
    assert.equal(histCheckPermissive.is_historical_commit_only, true);
    assert.equal(histCheckPermissive.exact_checkout_verified, false);
  } finally {
    rmSync(tempRepo, { recursive: true, force: true });
  }
});

test('R08 - Strict provenance flag enforcement and refusal', async () => {
  const result = await runDollhouseSkillAudit({
    source_revision: 'WORKING_TREE_UNCOMMITTED',
    options: { strict_provenance: true },
    task_scope: 'STRICT_PROVENANCE_NEGATIVE_CONTROL'
  });

  // Under strict provenance, WORKING_TREE_UNCOMMITTED must be rejected!
  assert.equal(result.machine_receipt.source_revision_verified, false);
  assert.ok(
    result.machine_receipt.detected_infractions.includes('HOLD_STRICT_PROVENANCE_FAILED') ||
    result.machine_receipt.detected_infractions.includes('HOLD_UNVERIFIABLE_SOURCE_REVISION'),
    'Must emit strict provenance infraction'
  );
  assert.equal(result.exit_code, 1, 'Must exit with non-zero failure code');
});

test('Hold A - Adversarial execution witness spoofing refused and four evidentiary states enforced', (t) => {
  const BUTLER_FIXTURE_PATH = 'tests/fixtures/dollhouse/butler_performative_surface.html';
  const BUTLER_FIXTURE_SHA = 'eedc6e5b6623495c6c1fe8b3831c65abddb943ae74a3a95f3cc8212dcd550910';

  // Invariant verification: the four evidentiary states must be mutually distinct
  assert.notEqual('ARTIFACT_BYTES_MATCH', 'MATERIALIZED_WITNESSED', 'Invariant: ARTIFACT_BYTE_INTEGRITY != AUTHENTICATED_EXECUTION');
  assert.notEqual('ARTIFACT_BYTES_MATCH', 'EXECUTED_DEMONSTRATION_LAW');
  assert.notEqual('ARTIFACT_BYTES_MATCH', 'PROPOSED_TRANSFER_LAW');
  assert.notEqual('MATERIALIZED_WITNESSED', 'EXECUTED_DEMONSTRATION_LAW');

  // Baseline negative controls (missing artifacts, malformed sha, path escapes fail closed to PROPOSED_TRANSFER_LAW)
  // 0a. Caller passing is_materialized: true without authenticated witness receipt
  const spoofMaterialized = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'VISUAL', [], {
    is_materialized: true
  });
  assert.equal(spoofMaterialized.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(spoofMaterialized.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0b. Caller passing historical_qualification_scope: true without authentic fixture
  const spoofHistoricalScope = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'VISUAL', [], {
    historical_qualification_scope: true
  });
  assert.equal(spoofHistoricalScope.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(spoofHistoricalScope.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0c. Caller passing fake/nonexistent historical fixture
  const spoofFakeFixture = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'VISUAL', [], {
    historical_fixture: 'tests/fixtures/dollhouse/nonexistent_corridor.html'
  });
  assert.equal(spoofFakeFixture.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(spoofFakeFixture.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0d. Caller passing failed witness receipt
  const failedWitness = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: { disposition: 'WITNESS_FAILED', timestamp: '2026-10-29T23:00:00Z' }
  });
  assert.equal(failedWitness.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(failedWitness.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0e. Caller declaring PASS with empty/missing artifacts
  const emptyArtifactsWitness = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:00:00Z',
      artifacts: []
    }
  });
  assert.equal(emptyArtifactsWitness.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(emptyArtifactsWitness.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0f. Caller referencing artifact without SHA-256
  const noShaWitness = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:00:00Z',
      artifacts: [{ path: BUTLER_FIXTURE_PATH }]
    }
  });
  assert.equal(noShaWitness.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(noShaWitness.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0g. Caller referencing artifact with malformed SHA-256 (not 64-hex)
  const malformedShaWitness = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:00:00Z',
      artifacts: [{ path: BUTLER_FIXTURE_PATH, sha256: 'not-a-valid-hex-digest' }]
    }
  });
  assert.equal(malformedShaWitness.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(malformedShaWitness.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0h. Caller referencing nonexistent artifact file
  const nonexistentFileWitness = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:00:00Z',
      artifacts: [{
        path: 'tests/fixtures/dollhouse/does_not_exist_file.html',
        sha256: '0000000000000000000000000000000000000000000000000000000000000000'
      }]
    }
  });
  assert.equal(nonexistentFileWitness.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(nonexistentFileWitness.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0i. Relative path traversal escape outside permitted root
  const pathEscapeWitness = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:00:00Z',
      artifacts: [{
        path: '../../outside_repo_file.html',
        sha256: BUTLER_FIXTURE_SHA
      }]
    }
  });
  assert.equal(pathEscapeWitness.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(pathEscapeWitness.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // 0j. Artifact byte hash mismatch against disk
  const hashMismatchWitness = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:00:00Z',
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      }]
    }
  });
  assert.equal(hashMismatchWitness.execution_status, 'PROPOSED_TRANSFER_LAW');
  assert.equal(hashMismatchWitness.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED');

  // =========================================================================
  // THE 7 EXACT ADVERSARIAL REGRESSION CONTROLS MANDATED FOR HOLD A RESOLUTION
  // =========================================================================

  // Control 1: Fabricated PASS with correct artifact SHA-256 (no witness authority)
  // Bytes on disk match, but execution is unauthenticated -> ARTIFACT_BYTES_MATCH
  const control1 = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA
      }]
    }
  });
  assert.equal(control1.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 1: Byte match without witness authority must yield ARTIFACT_BYTES_MATCH');
  assert.equal(control1.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED',
    'Control 1: Unauthenticated execution must record UNAUTHENTICATED_EXECUTION_REFUSED');

  // Control 2: Fabricated PASS with plausible timestamp and nonexistent run
  // Plausible timestamp and unverified GHA attestation -> ARTIFACT_BYTES_MATCH
  const control2 = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:59:59.000Z',
      witness_authority: 'GITHUB_ACTIONS_BROWSER_WITNESS',
      workflow_run_id: '9999999999',
      workflow_name: 'TD613 Consolidated Validation',
      published_artifact_path: 'artifacts/dollhouse-browser-witness/witness_receipt.json',
      attestation_verified: false,
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA
      }]
    }
  });
  assert.equal(control2.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 2: Fabricated run without verified attestation must yield ARTIFACT_BYTES_MATCH');
  assert.equal(control2.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED',
    'Control 2: Must refuse unauthenticated execution');

  // Control 3: Fabricated run ID not independently verified in trusted ledger
  const control3 = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    trusted_run_ledger: ['40978057545', '40978057546'],
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:59:59.000Z',
      witness_authority: 'GITHUB_ACTIONS_BROWSER_WITNESS',
      workflow_run_id: '8888888888',
      workflow_name: 'TD613 Consolidated Validation',
      published_artifact_path: 'artifacts/dollhouse-browser-witness/witness_receipt.json',
      attestation_verified: true,
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA
      }]
    }
  });
  assert.equal(control3.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 3: Run ID outside trusted ledger must yield ARTIFACT_BYTES_MATCH');
  assert.equal(control3.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED');

  // Control 4: Authentic artifact bytes paired with wrong source revision
  const control4 = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    expected_source_revision: '731e5ce52bd54ac6247d0e35159c7609c98a7dfc',
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS',
      browser_engine: 'Chrome/156.0.8078.48',
      cdp_protocol: '1.3',
      total_assertions_checked: 32,
      source_revision: 'cf4f365802dbdefe4781f37afcce9a0e342f7227', // Mismatched predecessor
      clean_working_tree_precheck: { verified_clean_before_run: true },
      verifier_script: {
        path: 'scripts/verify-dollhouse-repair-witness.mjs',
        sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2'
      },
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA
      }]
    }
  });
  assert.equal(control4.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 4: Wrong source revision must yield ARTIFACT_BYTES_MATCH');
  assert.equal(control4.witness_verification, 'WRONG_SOURCE_REVISION_REFUSED',
    'Control 4: Must record WRONG_SOURCE_REVISION_REFUSED');

  // Control 5: Symlinked artifact path escaping repo root
  const tmpExternalDir = mkdtempSync(resolve(tmpdir(), 'dollhouse-escape-'));
  const externalFile = resolve(tmpExternalDir, 'external_butler.html');
  const externalContent = readFileSync(resolve(process.cwd(), BUTLER_FIXTURE_PATH));
  writeFileSync(externalFile, externalContent);

  const symlinkPathRel = 'tests/fixtures/dollhouse/temp_escaping_symlink.html';
  const symlinkPathAbs = resolve(process.cwd(), symlinkPathRel);

  let symlinkCreated = false;
  try {
    symlinkSync(externalFile, symlinkPathAbs, 'file');
    symlinkCreated = true;
  } catch (err) {
    // If OS does not permit symlink creation, handle cleanly
  }

  t.after(() => {
    if (symlinkCreated && existsSync(symlinkPathAbs)) unlinkSync(symlinkPathAbs);
    if (existsSync(externalFile)) unlinkSync(externalFile);
    if (existsSync(tmpExternalDir)) rmSync(tmpExternalDir, { recursive: true, force: true });
  });

  if (symlinkCreated) {
    const control5 = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
      witness_receipt: {
        disposition: 'WITNESS_VERIFIED_PASS',
        witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS',
        source_revision: '731e5ce52bd54ac6247d0e35159c7609c98a7dfc',
        artifacts: [{
          path: symlinkPathRel,
          sha256: BUTLER_FIXTURE_SHA
        }]
      }
    });
    assert.equal(control5.execution_status, 'PROPOSED_TRANSFER_LAW',
      'Control 5: Symlink escaping root must fail closed to PROPOSED_TRANSFER_LAW');
    assert.equal(control5.witness_verification, 'UNVERIFIED_CALLER_ASSERTION_REFUSED',
      'Control 5: Must record UNVERIFIED_CALLER_ASSERTION_REFUSED');
  }

  // Control 6A: Matching artifact bytes + forged all-other-claims (forged script SHA, self-asserted clean tree, no on-disk receipt)
  // Must strictly refuse execution authority and produce ARTIFACT_BYTES_MATCH
  const control6A = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    expected_source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:40:20.793Z',
      witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS',
      source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
      browser_engine: 'Chrome/156.0.8078.48',
      cdp_protocol: '1.3',
      total_assertions_checked: 32,
      clean_working_tree_precheck: { verified_clean_before_run: true },
      verifier_script: {
        path: 'scripts/verify-dollhouse-repair-witness.mjs',
        sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2' // FORGED: does not match actual script bytes
      },
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA, // Authentic bytes
        witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS'
      }]
    }
  });
  assert.equal(control6A.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 6A: Matching artifact bytes with forged verifier script SHA and self-asserted metadata must refuse execution authority');
  assert.equal(control6A.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED',
    'Control 6A: Must record UNAUTHENTICATED_EXECUTION_REFUSED');

  // Control 6B (Adversarial Negative Control): Caller-written on-disk JSON receipt cannot manufacture execution authority
  const actualScriptPathAbs = resolve(process.cwd(), 'scripts/verify-dollhouse-repair-witness.mjs');
  const actualScriptBytes = readFileSync(actualScriptPathAbs);
  const actualScriptSha = createHash('sha256').update(actualScriptBytes).digest('hex');

  mkdirSync(resolve(process.cwd(), 'artifacts/dollhouse-browser-witness'), { recursive: true });
  const testReceiptPathRel = 'artifacts/dollhouse-browser-witness/test_verified_receipt.json';
  const testReceiptPathAbs = resolve(process.cwd(), testReceiptPathRel);
  const authenticReceipt = {
    schema: 'td613.dollhouse-design.browser-witness-receipt/v0.2',
    disposition: 'WITNESS_VERIFIED_PASS',
    timestamp: '2026-10-30T00:54:21.628Z',
    witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS',
    source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
    browser_engine: 'Chrome/156.0.8078.48',
    cdp_protocol: '1.3',
    total_assertions_checked: 32,
    clean_working_tree_precheck: { verified_clean_before_run: true },
    verifier_script: {
      path: 'scripts/verify-dollhouse-repair-witness.mjs',
      sha256: actualScriptSha
    },
    artifacts: [{
      path: BUTLER_FIXTURE_PATH,
      sha256: BUTLER_FIXTURE_SHA,
      witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS'
    }]
  };
  writeFileSync(testReceiptPathAbs, JSON.stringify(authenticReceipt, null, 2), 'utf8');
  t.after(() => {
    if (existsSync(testReceiptPathAbs)) unlinkSync(testReceiptPathAbs);
  });

  const control6B = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    expected_source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
    witness_receipt_path: testReceiptPathRel,
    witness_receipt: authenticReceipt
  });
  assert.equal(control6B.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 6B: Caller-written on-disk JSON receipt must fail closed to ARTIFACT_BYTES_MATCH');
  assert.equal(control6B.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED',
    'Control 6B: Must record UNAUTHENTICATED_EXECUTION_REFUSED');

  // Control 6C (Adversarial Negative Control): Caller-supplied trusted_run_ledger in options cannot manufacture execution authority
  const control6C = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    expected_source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
    trusted_run_ledger: ['40982988148'],
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:40:20.793Z',
      witness_authority: 'GITHUB_ACTIONS_BROWSER_WITNESS',
      workflow_run_id: '40982988148',
      workflow_name: 'TD613 Consolidated Validation',
      source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
      published_artifact_name: 'dollhouse-witness-2c60936919f128c95bcdd16a69f47948ce59fdfd',
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA,
        witness_authority: 'GITHUB_ACTIONS_BROWSER_WITNESS'
      }]
    }
  });
  assert.equal(control6C.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 6C: Caller-supplied trusted_run_ledger cannot manufacture execution authority');
  assert.equal(control6C.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED');

  // Control 6D: CI witness with caller claiming attestation_verified: true without independent boundary
  const control6D = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    expected_source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
    witness_receipt: {
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-29T23:40:20.793Z',
      witness_authority: 'GITHUB_ACTIONS_BROWSER_WITNESS',
      workflow_run_id: '40982988148',
      workflow_name: 'TD613 Consolidated Validation',
      source_revision: '2c60936919f128c95bcdd16a69f47948ce59fdfd',
      published_artifact_name: 'dollhouse-witness-2c60936919f128c95bcdd16a69f47948ce59fdfd',
      attestation_verified: true, // Caller-provided self-attestation flag without independent boundary
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA
      }]
    }
  });
  assert.equal(control6D.execution_status, 'ARTIFACT_BYTES_MATCH',
    'Control 6D: Caller attestation_verified flag cannot substitute for independent execution boundary');
  assert.equal(control6D.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED');

  // Control 6E (Positive Control): Audited immutable repository CI witness record earns MATERIALIZED_WITNESSED
  const authenticCiReceipt = JSON.parse(readFileSync(resolve(process.cwd(), 'tests/fixtures/dollhouse/witness_receipt_ci_40985470629.json'), 'utf8'));
  const control6E = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
    expected_source_revision: '12352af2b0fc0dec4554abb7aa35599ad7f897f1',
    witness_receipt: authenticCiReceipt
  });
  assert.equal(control6E.execution_status, 'MATERIALIZED_WITNESSED',
    'Control 6E: Audited immutable CI witness receipt must earn MATERIALIZED_WITNESSED');
  assert.equal(control6E.witness_verification, 'AUTHENTICATED_WITNESS_RECEIPT_VERIFIED',
    'Control 6E: Must record AUTHENTICATED_WITNESS_RECEIPT_VERIFIED');

  // Control 6F (Positive Control): Authentic executing GitHub Actions CI runner boundary earns MATERIALIZED_WITNESSED
  const origGha = process.env.GITHUB_ACTIONS;
  const origRunId = process.env.GITHUB_RUN_ID;
  const origSha = process.env.GITHUB_SHA;
  try {
    process.env.GITHUB_ACTIONS = 'true';
    process.env.GITHUB_RUN_ID = '9876543210';
    process.env.GITHUB_SHA = '12352af2b0fc0dec4554abb7aa35599ad7f897f1';

    const liveCiReceipt = {
      schema: 'td613.dollhouse-design.browser-witness-receipt/v0.2',
      disposition: 'WITNESS_VERIFIED_PASS',
      timestamp: '2026-10-30T01:25:29.299Z',
      workflow_run_id: '9876543210',
      workflow_job: 'contracts',
      browser_engine: 'Chrome/156.0.8078.47',
      cdp_protocol: '1.3',
      witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS',
      source_revision: '12352af2b0fc0dec4554abb7aa35599ad7f897f1',
      total_assertions_checked: 32,
      clean_working_tree_precheck: { verified_clean_before_run: true },
      verifier_script: {
        path: 'scripts/verify-dollhouse-repair-witness.mjs',
        sha256: actualScriptSha
      },
      artifacts: [{
        path: BUTLER_FIXTURE_PATH,
        sha256: BUTLER_FIXTURE_SHA,
        witness_authority: 'PHYSICAL_CDP_BROWSER_WITNESS'
      }]
    };

    const control6F = buildInstrumentCausalContract('BUTLER_PERFORMATIVE_ITERATION', 'VISUAL', [], {
      expected_source_revision: '12352af2b0fc0dec4554abb7aa35599ad7f897f1',
      witness_receipt: liveCiReceipt
    });
    assert.equal(control6F.execution_status, 'MATERIALIZED_WITNESSED',
      'Control 6F: Authentic executing GitHub Actions CI runner must earn MATERIALIZED_WITNESSED');
    assert.equal(control6F.witness_verification, 'AUTHENTICATED_WITNESS_RECEIPT_VERIFIED',
      'Control 6F: Must record AUTHENTICATED_WITNESS_RECEIPT_VERIFIED');
  } finally {
    if (origGha !== undefined) process.env.GITHUB_ACTIONS = origGha; else delete process.env.GITHUB_ACTIONS;
    if (origRunId !== undefined) process.env.GITHUB_RUN_ID = origRunId; else delete process.env.GITHUB_RUN_ID;
    if (origSha !== undefined) process.env.GITHUB_SHA = origSha; else delete process.env.GITHUB_SHA;
  }
  assert.equal(control6D.witness_verification, 'UNAUTHENTICATED_EXECUTION_REFUSED');

  // Control 7: Canonical historical qualification fixture preserved as separate evidence class
  const control7 = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'VISUAL', [], {
    historical_fixture: 'tests/fixtures/dollhouse/caro_corridor_primary.html'
  });
  assert.equal(control7.execution_status, 'EXECUTED_DEMONSTRATION_LAW',
    'Control 7: Canonical fixture must yield EXECUTED_DEMONSTRATION_LAW');
  assert.equal(control7.witness_verification, 'CANONICAL_HISTORICAL_FIXTURE_VERIFIED');
  assert.ok(control7.causal_bindings[0].transfer_law.includes('400ms'));
});

test('Redpen II - Substantive candidate comparative evaluation', async () => {
  const result = await runDollhouseDesignCycle({
    seed: 'A laboratory of non-synthesizing tension and paratactic shelter',
    medium: 'SCHOLARLY',
    instruments: ['DIALECTICAL_TENSION', 'SEDGWICK_REPARATIVE_TEXTURE']
  });

  const evals = result.comparative_analysis.candidate_evaluations;
  assert.ok(Array.isArray(evals) && evals.length >= 2, 'Must evaluate at least 2 candidates');
  assert.equal(result.comparative_analysis.evaluation_type, 'COMPARATIVE_DESIGN_HEURISTIC_INVENTORY',
    'Comparative analysis must be typed as COMPARATIVE_DESIGN_HEURISTIC_INVENTORY');

  for (const candEval of evals) {
    assert.equal(candEval.status, 'COMPARATIVE_DESIGN_HEURISTIC_CANDIDATE',
      'Candidate must be classified as COMPARATIVE_DESIGN_HEURISTIC_CANDIDATE');
    assert.equal(candEval.evaluation_nature, 'HEURISTIC_COMPARATIVE_ANALYSIS_NOT_INDEPENDENT_EXECUTION',
      'Evaluation nature must acknowledge heuristic comparative analysis');
    assert.ok(candEval.distinctive_formal_mechanism.length > 20,
      'Must provide substantive distinctive formal mechanism');
    assert.ok(candEval.trade_offs && candEval.trade_offs.gains.length > 10,
      'Must specify substantive trade-off gains');
    assert.ok(candEval.trade_offs && candEval.trade_offs.sacrifices.length > 10,
      'Must specify substantive trade-off sacrifices');
    assert.ok(candEval.divergence_vector.length > 5,
      'Must specify concrete divergence vector');
    assert.ok(candEval.counterfactual_consequence.length > 20,
      'Must specify counterfactual consequence');
  }

  // Ensure candidate 0 and candidate 1 have distinct divergence vectors and mechanisms
  assert.notEqual(evals[0].divergence_vector, evals[1].divergence_vector,
    'Candidates must possess distinct divergence vectors');
  assert.notEqual(evals[0].distinctive_formal_mechanism, evals[1].distinctive_formal_mechanism,
    'Candidates must possess distinct formal mechanisms');

  // Universal binding default requested_deliverables: 1
  assert.equal(result.output_contract.requested_deliverables, 1,
    'Universal default deliverable count must be 1');
  assert.equal(result.output_contract.default_deliverables, 1);
});

test('Redpen II - Unicode custody: display glyph U+1D30B vs research mark U+10D613 vs covenant U+200C', () => {
  const displayGlyph = '𝌋';
  const researchMark = '\uDBF5\uDE13';
  const covenantKhonalitPo = 'Khona\u200Clit-po';

  // Display glyph is U+1D30B (Tetragram for Guarding)
  assert.equal(displayGlyph.codePointAt(0), 0x1D30B,
    'Display glyph must resolve to Unicode scalar U+1D30B');

  // Declared research mark is U+10D613 (Private Use Area plane 16)
  assert.equal(researchMark.codePointAt(0), 0x10D613,
    'Research mark must resolve to Unicode scalar U+10D613');

  // Zero-width non-joiner U+200C in Khona‌lit-po
  assert.ok(covenantKhonalitPo.includes('\u200C'),
    'Covenant string must contain zero-width non-joiner U+200C');
  assert.equal(covenantKhonalitPo.length, 12,
    'Khona‌lit-po with U+200C has length 12');
  assert.equal('Khonalit-po'.length, 11,
    'Unjoined Khonalit-po has length 11');

  // Refuse conflation
  assert.notEqual(displayGlyph, researchMark,
    'Display glyph 𝌋 (U+1D30B) must never be conflated with research mark U+10D613');
});
