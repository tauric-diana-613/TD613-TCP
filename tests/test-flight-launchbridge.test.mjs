import assert from 'node:assert/strict';
import test from 'node:test';

import { ControlledArchiveIntake } from '../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { HeterogeneousDiscoveryHarness } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs';
import { Stage2IndependentEvaluator } from '../docs/research/experiment-b-preflight/02_four_arm_harness/stage2-independent-evaluator.mjs';

test('Launchbridge Test 1: Controlled Archive Intake enforces fail-closed custody and synthetic admission', () => {
  const intake = new ControlledArchiveIntake({ syntheticMode: true, allowProtectedAdmission: false });

  // 1. Unauthorized invocation fails closed
  assert.throws(
    () => {
      intake.admitArchive('some/random/path.zip', {});
    },
    /ARCHIVE_ADMISSION_BLOCKED_UNAUTHORIZED/
  );

  // 2. Missing target fails closed
  assert.throws(
    () => {
      intake.admitArchive(null, { syntheticFixturePermitted: true });
    },
    /ARCHIVE_ADMISSION_TARGET_REQUIRED/
  );

  // 3. Attempting protected file in preflight fails closed
  assert.throws(
    () => {
      intake.admitArchive('protected_em_challenge_archive.zip', {
        operatorAuthorizationToken: 'TD613-OP-AUTH-TEST'
      });
    },
    /PROTECTED_CORPUS_ACCESS_HELD/
  );

  // 4. Authorized synthetic source-free admission succeeds
  const syntheticTarget = {
    syntheticDocuments: [
      { filename: 'specimen_alpha.md', content: '# Specimen Alpha\nEquation: E = mc^2' },
      { filename: 'specimen_beta.md', content: '# Specimen Beta\nEquation: F = ma' }
    ]
  };

  const receipt = intake.admitArchive(syntheticTarget, { syntheticFixturePermitted: true });
  assert.equal(receipt.document_count, 2);
  assert.equal(receipt.custody_status, 'SOURCE_FREE_SYNTHETIC_VERIFIED');
  assert.equal(receipt.quarantine_maintained, true);
  assert.ok(receipt.manifest_sha256.length === 64);
});

test('Launchbridge Test 2: Structured context continuity preserves propositions without 150-char truncation', async () => {
  const harness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true
  });

  await harness.establishPreExposureBaseline('Baseline axioms established.');

  const longEquation = 'H(x, p) = \\frac{p^2}{2m} + \\frac{1}{2}kx^2 + \\lambda x^4 + \\int_0^t \\Gamma(s) \\dot{x}(t-s) ds';
  const doc1 = {
    id: 'DOC-LONG-01',
    filename: 'long_formula_specimen.md',
    content: 'Full theoretical formulation of non-local dissipative oscillator.',
    mockResponse: `CHAMBER 2 DESCENT [DOC-LONG-01]:\nPROPOSITION: The exact non-local Hamiltonian satisfies ${longEquation}.\nUNCERTAINTY: Valid in weak coupling limit.`
  };

  await harness.ingestSequentialDocument(doc1, 1);

  // Verify that history formatting for turn 2 includes the complete proposition without blind truncation
  const historyForTurn2 = harness.formatHistoryForTurn(2);
  assert.ok(historyForTurn2.includes(longEquation), 'Long formula was truncated in context summary!');
  assert.ok(historyForTurn2.includes('Valid in weak coupling limit'));

  const ledger = harness.exportResearchLedger();
  assert.equal(ledger.context_strategy, 'STRUCTURED_PROPOSITION_CONTINUITY');
});

test('Launchbridge Test 3: Fail-closed resource ceilings halt execution when calls or token budgets are exceeded', async () => {
  // 1. Call limit ceiling test
  const callCappedHarness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true,
    maxCalls: 2 // Baseline consumes 1; turn 1 Chamber 1 consumes 2nd; Chamber 2 exceeds
  });

  await callCappedHarness.establishPreExposureBaseline();

  const doc = {
    id: 'DOC-01',
    filename: 'specimen.md',
    content: 'Test content.'
  };

  await assert.rejects(
    async () => {
      await callCappedHarness.ingestSequentialDocument(doc, 1);
    },
    /BUDGET_CEILING_EXCEEDED/
  );

  // 2. Token limit ceiling test
  const tokenCappedHarness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2B_MATCHED_UNION',
    mockMode: true,
    maxTokens: 50 // Baseline gives 75 tokens, exceeding 50
  });

  await tokenCappedHarness.establishPreExposureBaseline();

  await assert.rejects(
    async () => {
      await tokenCappedHarness.ingestSequentialDocument(doc, 1);
    },
    /BUDGET_CEILING_EXCEEDED/
  );
});

test('Launchbridge Test 4: Stage 1 to Stage 2 handoff and independent evaluation', () => {
  const evaluator = new Stage2IndependentEvaluator({
    evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION'
  });

  // Stage 1 candidate
  const stage1Candidate = {
    candidate_id: 'CAND-20261029-abc123',
    status: 'PROPOSED',
    warrant_class: 'WARRANT_PENDING_EVALUATION',
    proposition_summary: 'Dispersion relation omega(k) = c * k',
    adjudication_ancestry: {
      evaluator_tier: 'PENDING_INDEPENDENT_EVALUATION',
      rca01_cell: 'CELL_B_AUTH_DOLL'
    }
  };

  // Case A: Valid discovery enabled by lens (Cell B discovered, Cell A missed, negative control rejected)
  const resultA = evaluator.evaluateCandidate(stage1Candidate, {
    groundTruthWarrant: 'ISOMORPHISM',
    negativeControlRejected: true,
    discoveredInCellA: false,
    discoveredInCellB: true,
    isNovel: true,
    instrumentAnomalies: 'CLEAN_EXECUTION',
    evaluatorNotes: 'Rigorous derivation verified.'
  });

  const candA = resultA.adjudicated_candidate;
  assert.equal(candA.status, 'WARRANTED');
  assert.equal(candA.warrant_class, 'WARRANT_ISOMORPHISM');
  assert.equal(candA.adjudication_ancestry.evaluator_tier, 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION');
  assert.equal(candA.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'LENS_ENABLED');
  assert.equal(candA.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'WARRANTED_DISCOVERY');
  assert.ok(candA.adjudication_ancestry.rca01_outcome_archetypes.includes('OUTCOME_REPRESENTATION_ENABLED_DISCOVERY'));
  assert.ok(candA.adjudication_ancestry.rca01_outcome_archetypes.includes('OUTCOME_WARRANTED_MATHEMATICS'));

  // Case B: Adversarial negative control failure -> Manufactured emergence
  const resultB = evaluator.evaluateCandidate(stage1Candidate, {
    groundTruthWarrant: 'FORMAL_EQUIVALENCE',
    negativeControlRejected: false, // Fired on negative control!
    discoveredInCellA: false,
    discoveredInCellB: true
  });

  const candB = resultB.adjudicated_candidate;
  assert.equal(candB.status, 'FALSIFIED');
  assert.equal(candB.warrant_class, 'WARRANT_FALSIFIED');
  assert.equal(candB.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'SCAFFOLDING_ARTIFACT');
  assert.equal(candB.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'FALSIFIED_ARTIFACT');
  assert.ok(candB.adjudication_ancestry.rca01_outcome_archetypes.includes('OUTCOME_MANUFACTURED_EMERGENCE'));
});
