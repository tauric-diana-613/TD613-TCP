import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
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
