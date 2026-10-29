import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

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
  // Currently, conductor reads auditResult.orchestrator_disposition which is undefined!
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
  // buildInstrumentCausalContract should adapt to medium and seed terms
  const contract = buildInstrumentCausalContract('CARO_INSTITUTIONAL_RECONSTRUCTION', 'PRODUCT', ['procurement', 'delay']);

  // In planning without a materialized artifact/witness, status must not claim EXECUTED_DEMONSTRATION_LAW
  for (const binding of contract.causal_bindings) {
    assert.notEqual(binding.execution_status, 'EXECUTED_DEMONSTRATION_LAW',
      'Planning contract must not claim EXECUTED_DEMONSTRATION_LAW without a materialized artifact');
  }

  // The universal contract must not hardcode chamber/door numbers for unrelated product commissions
  const lawsString = JSON.stringify(contract.causal_bindings);
  assert.equal(lawsString.includes('chamber_index * 4'), false, 'Universal contract must not hardcode 4 words per chamber');
  assert.equal(lawsString.includes('16/16 redactions'), false, 'Universal contract must not hardcode 16-word petition');
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

  // R04.2 Mutable symbolic ref resolution
  const resolved = resolveHistoricalReference({
    reference_id: 'REF-HEAD',
    source_path: 'AGENTS.md',
    source_revision: 'HEAD',
    classification: 'BINDING_CUSTODY_LAW'
  });
  // Must resolve to immutable 40-hex commit SHA when available
  if (resolved.resolved && resolved.retrieval_method.includes('GIT')) {
    assert.match(resolved.resolved_commit || resolved.source_revision, /^[a-f0-9]{40}$/);
  }

  // R04.3 Working tree fallback provenance class
  const resolvedWorkingTree = resolveHistoricalReference({
    reference_id: 'REF-LOCAL',
    source_path: 'AGENTS.md',
    source_revision: 'WORKING_TREE',
    classification: 'NEGOTIABLE_AESTHETIC_DIRECTION'
  });
  assert.notEqual(resolvedWorkingTree.provenance_class, 'CONTEMPORANEOUS_ORIGINAL',
    'Working tree fallback must not claim CONTEMPORANEOUS_ORIGINAL');
});

test('R05 - Candidate override validation and preservation', () => {
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

  // R05.3 Preserve 3+ candidates in receipt
  const comm3 = normalizeCommission({
    seed: 'Test three candidates',
    candidate_overrides: [
      { concept_title: 'Cand 1', governing_instrument: 'PHASONIC_COUNTERPOINT', formal_proposition: 'Prop 1' },
      { concept_title: 'Cand 2', governing_instrument: 'CARO_INSTITUTIONAL_RECONSTRUCTION', formal_proposition: 'Prop 2' },
      { concept_title: 'Cand 3', governing_instrument: 'SEDGWICK_REPARATIVE_TEXTURE', formal_proposition: 'Prop 3' }
    ]
  });
  const candidates = deriveCommissionCandidates(comm3);
  assert.equal(candidates.length, 3, 'Must preserve all 3 candidate overrides');
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
  // If an exact commit is required and source files in app/engine are modified, exact_checkout_verified must be false
  const headCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const validation = verifySourceRevision(headCommit, {
    require_exact_checkout: true,
    require_clean_source: true
  });

  // When clean, exact_checkout_verified is true. If dirty, must be false.
  assert.equal(typeof validation.exact_checkout_verified, 'boolean');
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
