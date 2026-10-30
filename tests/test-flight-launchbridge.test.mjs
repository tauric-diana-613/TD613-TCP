import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

import { ControlledArchiveIntake } from '../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { HeterogeneousDiscoveryHarness } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs';
import { Stage2IndependentEvaluator, verifyWitnessAttestation } from '../docs/research/experiment-b-preflight/02_four_arm_harness/stage2-independent-evaluator.mjs';

// Load Three-Lineage Schema to validate all test candidate outputs
const schemaPath = path.resolve('docs/research/experiment-b-preflight/04_evaluation_and_preregistration/THREE_LINEAGE_DISCOVERY_SCHEMA.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const validStatusEnum = schema.properties.status.enum;
const validWarrantEnum = schema.properties.warrant_class.enum;

function validateCandidateAgainstSchemaEnums(cand) {
  assert.ok(
    validStatusEnum.includes(cand.status),
    `Candidate status '${cand.status}' is not in THREE_LINEAGE_DISCOVERY_SCHEMA status enum: ${JSON.stringify(validStatusEnum)}`
  );
  assert.ok(
    validWarrantEnum.includes(cand.warrant_class),
    `Candidate warrant_class '${cand.warrant_class}' is not in THREE_LINEAGE_DISCOVERY_SCHEMA warrant_class enum: ${JSON.stringify(validWarrantEnum)}`
  );
}

test('L1 Repair Test 1: Stage 2 Evaluator rejects empty candidates and ungrounded witness tier requests', () => {
  // 1. Refuses null or missing candidate
  const defaultEvaluator = new Stage2IndependentEvaluator();
  assert.throws(
    () => defaultEvaluator.evaluateCandidate(null),
    /STAGE2_EVALUATOR_NO_CANDIDATE/
  );

  // 2. Refuses candidate without ID or with NO_SUBSTANTIVE_CANDIDATE status
  assert.throws(
    () => defaultEvaluator.evaluateCandidate({ status: 'NO_SUBSTANTIVE_CANDIDATE', proposition_summary: 'NO_SUBSTANTIVE_CANDIDATE_GENERATED' }),
    /STAGE2_EVALUATOR_NO_CANDIDATE/
  );

  // 3. Forged evaluator tier request without authentic attestation is strictly rejected fail-closed
  assert.throws(
    () => new Stage2IndependentEvaluator({
      evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION'
    }),
    /STAGE2_EVALUATOR_FORGED_WITNESS_REJECTED/
  );

  // 4. Forged/fake signature string (e.g. 'VALID_ATTESTED_HMAC_SIG_01') is strictly rejected
  const mockKey = 'EMERGENCE_HQ_ROOT_SECRET_KEY_2026';
  assert.throws(
    () => new Stage2IndependentEvaluator({
      evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION',
      trustedWitnessKeys: {
        EMERGENCE_HQ_WITNESS_01: mockKey
      },
      attestedWitness: {
        witnessId: 'EMERGENCE_HQ_WITNESS_01',
        signature: 'VALID_ATTESTED_HMAC_SIG_01', // Fake uncomputed signature!
        payload: 'WITNESS_SESSION:EMERGENCE_HQ_WITNESS_01'
      }
    }),
    /STAGE2_EVALUATOR_FORGED_WITNESS_REJECTED/
  );

  // 5. Genuine cryptographic HMAC signature verification succeeds
  const sessionPayload = 'WITNESS_SESSION:EMERGENCE_HQ_WITNESS_01';
  const validHmacSig = crypto.createHmac('sha256', mockKey).update(sessionPayload).digest('hex');

  const authenticatedEvaluator = new Stage2IndependentEvaluator({
    evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION',
    trustedWitnessKeys: {
      EMERGENCE_HQ_WITNESS_01: mockKey
    },
    attestedWitness: {
      witnessId: 'EMERGENCE_HQ_WITNESS_01',
      signature: validHmacSig,
      payload: sessionPayload
    }
  });

  assert.equal(authenticatedEvaluator.evaluatorTier, 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION');
  assert.equal(authenticatedEvaluator.isWitnessAttested, true);
  assert.equal(authenticatedEvaluator.authenticatedWitnessId, 'EMERGENCE_HQ_WITNESS_01');
});

test('L1 Repair Test 2: Incomplete evidence fails closed to PENDING/HELD; scientific promotion requires proof receipt', () => {
  const defaultEvaluator = new Stage2IndependentEvaluator();

  const validStage1 = {
    candidate_id: 'CAND-20261030-def456',
    status: 'PROPOSED',
    warrant_class: 'WARRANT_PENDING_EVALUATION',
    proposition_summary: 'Conserved Hamiltonian flow under symplectic group Sp(2n, R)',
    adjudication_ancestry: {
      evaluator_tier: 'PENDING_INDEPENDENT_EVALUATION',
      rca01_cell: 'CELL_B_AUTH_DOLL'
    }
  };

  // 1. Incomplete evidence criteria (no defaults allowed) fails closed to HELD
  const heldResult = defaultEvaluator.evaluateCandidate(validStage1, {
    groundTruthWarrant: 'ISOMORPHISM',
    negativeControlRejected: true
    // missing discoveredInCellA, discoveredInCellB, isNovel, instrumentAnomalies
  });

  const heldCand = heldResult.adjudicated_candidate;
  assert.equal(heldCand.status, 'HELD_INSUFFICIENT_DATA');
  assert.equal(heldCand.warrant_class, 'WARRANT_PENDING_EVALUATION');
  assert.equal(heldCand.adjudication_ancestry.disposition, 'EVALUATION_HELD_INSUFFICIENT_EVIDENCE');
  assert.ok(heldCand.adjudication_ancestry.missing_evidence_fields.includes('discoveredInCellA'));
  assert.ok(heldCand.adjudication_ancestry.missing_evidence_fields.includes('isNovel'));
  validateCandidateAgainstSchemaEnums(heldCand);

  // 2. Unattested Result Assembler: Complete criteria WITHOUT authenticated proof cannot self-certify warrant
  const unverifiedResult = defaultEvaluator.evaluateCandidate(validStage1, {
    groundTruthWarrant: 'ISOMORPHISM',
    negativeControlRejected: true,
    discoveredInCellA: true,
    discoveredInCellB: true,
    isNovel: true,
    instrumentAnomalies: 'CLEAN_EXECUTION'
  });

  const unverifiedCand = unverifiedResult.adjudicated_candidate;
  // Must NOT promote to WARRANTED or WARRANTED_DISCOVERY without authenticated witness & proof receipt!
  assert.equal(unverifiedCand.status, 'PROPOSED');
  assert.equal(unverifiedCand.warrant_class, 'WARRANT_PENDING_EVALUATION');
  assert.equal(unverifiedCand.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'EXPLORATORY_FINDING');
  assert.equal(unverifiedResult.adjudication_receipt.disposition, 'UNATTESTED_ASSESSMENT_ASSEMBLED');
  validateCandidateAgainstSchemaEnums(unverifiedCand);

  // 3. Authenticated Witness + Verified Proof Receipt enables legitimate warrant promotion
  const mockKey = 'EMERGENCE_HQ_PROOF_KEY_2026';
  const sessionPayload = 'WITNESS_SESSION:PROOF_WITNESS_01';
  const validSig = crypto.createHmac('sha256', mockKey).update(sessionPayload).digest('hex');

  const authenticatedEvaluator = new Stage2IndependentEvaluator({
    evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION',
    trustedWitnessKeys: {
      PROOF_WITNESS_01: mockKey
    },
    attestedWitness: {
      witnessId: 'PROOF_WITNESS_01',
      signature: validSig,
      payload: sessionPayload
    }
  });

  const dummyProofSha = crypto.createHash('sha256').update('MATHEMATICAL_DERIVATION_PROOF_BYTES').digest('hex');
  const promotedResult = authenticatedEvaluator.evaluateCandidate(validStage1, {
    groundTruthWarrant: 'ISOMORPHISM',
    negativeControlRejected: true,
    discoveredInCellA: false,
    discoveredInCellB: true,
    isNovel: true,
    instrumentAnomalies: 'CLEAN_EXECUTION',
    independentProofReceipt: {
      receipt_id: 'INDEPENDENT-PROOF-RECEIPT-20261030-01',
      proof_sha256: dummyProofSha
    }
  });

  const warCand = promotedResult.adjudicated_candidate;
  assert.equal(warCand.status, 'WARRANTED');
  assert.equal(warCand.warrant_class, 'WARRANT_MATHEMATICAL_ISOMORPHISM');
  assert.equal(warCand.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'WARRANTED_DISCOVERY');
  assert.equal(warCand.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'LENS_ENABLED');
  assert.equal(warCand.adjudication_ancestry.unblinding_phase, 'BLINDED_PENDING_UNBLINDING'); // Default remains blinded
  validateCandidateAgainstSchemaEnums(warCand);

  // 4. Negative control failure -> status FALSIFIED with warrant_class WARRANT_UNPRODUCED
  const falsifiedResult = defaultEvaluator.evaluateCandidate(validStage1, {
    groundTruthWarrant: 'ISOMORPHISM',
    negativeControlRejected: false, // Falsified by negative control
    discoveredInCellA: false,
    discoveredInCellB: true,
    isNovel: true,
    instrumentAnomalies: 'CLEAN_EXECUTION'
  });

  const falCand = falsifiedResult.adjudicated_candidate;
  assert.equal(falCand.status, 'FALSIFIED');
  assert.equal(falCand.warrant_class, 'WARRANT_UNPRODUCED');
  assert.equal(falCand.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'SCAFFOLDING_ARTIFACT');
  assert.ok(falCand.adjudication_ancestry.rca01_outcome_archetypes.includes('OUTCOME_MANUFACTURED_EMERGENCE'));
  validateCandidateAgainstSchemaEnums(falCand);
});

test('L1 Repair Test 3: Controlled Archive Intake blocks physical paths and requires trusted synthetic fixtures', () => {
  const intake = new ControlledArchiveIntake({ syntheticMode: true, allowProtectedAdmission: false });

  // 1. Physical paths (strings) are strictly blocked in preflight with zero file IO
  assert.throws(
    () => intake.admitArchive('C:/any/confidential/directory', { syntheticFixturePermitted: true }),
    /ARCHIVE_ADMISSION_PHYSICAL_PATH_BLOCKED/
  );

  assert.throws(
    () => intake.admitArchive('some_archive.zip', { operatorAuthorizationToken: 'TD613-OP-AUTH-ANY' }),
    /ARCHIVE_ADMISSION_PHYSICAL_PATH_BLOCKED/
  );

  // 2. Missing target fails closed
  assert.throws(
    () => intake.admitArchive(null, { trustedSyntheticFixture: true }),
    /ARCHIVE_ADMISSION_TARGET_REQUIRED/
  );

  // 3. Synthetic mode requires trustedSyntheticFixture=true
  assert.throws(
    () => intake.admitArchive({ syntheticDocuments: [] }, { trustedSyntheticFixture: false }),
    /ARCHIVE_ADMISSION_BLOCKED_UNAUTHORIZED/
  );

  // 4. Trusted in-memory synthetic admission succeeds with zero physical IO
  const trustedFixture = {
    syntheticDocuments: [
      { filename: 'syn_01.md', content: 'Synthetic formula 1' },
      { filename: 'syn_02.md', content: 'Synthetic formula 2' }
    ]
  };

  const receipt = intake.admitArchive(trustedFixture, { trustedSyntheticFixture: true });
  assert.equal(receipt.document_count, 2);
  assert.equal(receipt.custody_status, 'SOURCE_FREE_SYNTHETIC_VERIFIED');
  assert.equal(receipt.quarantine_maintained, true);
  assert.equal(receipt.physical_io_executed, false);
});

test('L1 Repair Test 4: Resource ceilings enforce post-call overshoot protection, attempt accounting, and dollar limit', async () => {
  // 1. Attempt ceiling tracking (counts all attempts, not just successes)
  const harness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true,
    maxCalls: 2 // Baseline consumes 1 attempt; turn 1 chamber 1 consumes 2nd attempt; chamber 2 fails pre-call
  });

  await harness.establishPreExposureBaseline();
  assert.equal(harness.providerAttempts, 1);

  const doc = { id: 'DOC-TEST', filename: 'test.md', content: 'Testing content' };
  await assert.rejects(
    async () => {
      await harness.ingestSequentialDocument(doc, 1);
    },
    /BUDGET_CEILING_EXCEEDED.*Maximum call ceiling/
  );

  // 2. Post-call token overshoot check
  const overshootHarness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2B_MATCHED_UNION',
    mockMode: true,
    maxTokens: 50 // Baseline will produce 75 tokens, overshooting 50 in post-call check!
  });

  await assert.rejects(
    async () => {
      await overshootHarness.establishPreExposureBaseline();
    },
    /BUDGET_CEILING_EXCEEDED.*overshot maximum token ceiling/
  );

  // 3. Financial ceiling check
  const costHarness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2B_MATCHED_UNION',
    mockMode: true,
    maxCostUSD: 0.000001 // Impossibly tiny dollar ceiling
  });

  await assert.rejects(
    async () => {
      await costHarness.establishPreExposureBaseline();
    },
    /BUDGET_CEILING_EXCEEDED.*overshot maximum financial ceiling/
  );
});

test('L1 Repair Test 5: Context projection is declared as lossy, preserving propositions and uncertainty', async () => {
  const harness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true
  });

  await harness.establishPreExposureBaseline();

  const formula = 'E^2 = (pc)^2 + (m_0 c^2)^2';
  const doc = {
    id: 'DOC-REL-01',
    filename: 'relativistic_energy.md',
    content: 'Full derivation of relativistic energy-momentum invariant.',
    mockResponse: `CHAMBER 2 DESCENT [DOC-REL-01]:\nPROPOSITION: Relativistic invariant satisfies ${formula}.\nUNCERTAINTY: Restricted to flat spacetime.`
  };

  await harness.ingestSequentialDocument(doc, 1);

  const historySummary = harness.formatHistoryForTurn(2);
  assert.ok(historySummary.includes(formula));
  assert.ok(historySummary.includes('Restricted to flat spacetime'));

  const ledger = harness.exportResearchLedger();
  assert.equal(ledger.context_strategy, 'DECLARED_LOSSY_PROJECTION_PROPOSITION_FOCUS');
  assert.equal(ledger.context_projection_declaration.is_lossless, false);
  assert.equal(ledger.candidates[0].presentation_ancestry.context_projection_loss_declaration.is_lossless, false);
});

test('L1 Repair Test 6: Flight runner script exists, runs dry-run, and refuses physical flight in preflight', () => {
  const scriptPath = path.resolve('scripts/run-experiment-b-flight.mjs');
  assert.ok(fs.existsSync(scriptPath), 'scripts/run-experiment-b-flight.mjs must exist on branch!');

  // Dry run succeeds
  const dryRunOut = execSync('node scripts/run-experiment-b-flight.mjs --dry-run', { encoding: 'utf8' });
  assert.ok(dryRunOut.includes('Source-Free Dry Run Complete'));

  // Physical path without authorization fails closed
  assert.throws(
    () => {
      execSync('node scripts/run-experiment-b-flight.mjs --archive-path "C:/path/to/archive.zip"', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
    },
    /FLIGHT_EXECUTION_BLOCKED_IN_PREFLIGHT/
  );
});
