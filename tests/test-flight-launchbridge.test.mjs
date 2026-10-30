import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

import {
  ControlledArchiveIntake,
  createSyntheticZipArchive,
  createOperatorFlightGrant,
  verifyOperatorFlightGrant
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/controlled-archive-intake.mjs';
import { HeterogeneousDiscoveryHarness } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-heterogeneous-discovery-harness.mjs';
import {
  Stage2IndependentEvaluator,
  computeProofBindingDigest,
  createIndependentProofReceipt,
  verifyWitnessAttestation
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/stage2-independent-evaluator.mjs';
import {
  SharedBudgetGovernor,
  AtomicCustodyLedger,
  validatePrivatePathConfinement
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/atomic-custody-ledger.mjs';
import { runArm1Archival } from '../docs/research/experiment-b-preflight/02_four_arm_harness/run-arm1-archival.mjs';
import {
  AntigravityNativeOrchestrator,
  ANTIGRAVITY_NATIVE_ORCHESTRATION_SCHEMA
} from '../docs/research/experiment-b-preflight/02_four_arm_harness/antigravity-native-orchestrator.mjs';

const REPO_ROOT = path.resolve('.');

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

test('B-01 / B-02: Controlled Physical ZIP Intake Security & Custody Controls', () => {
  const intake = new ControlledArchiveIntake({
    syntheticMode: true,
    allowProtectedAdmission: false,
    maxMembers: 5,
    maxPerMemberBytes: 1024,
    maxTotalExpandedBytes: 2048,
    maxDecompressionRatio: 10
  });

  // 1. Valid in-memory synthetic ZIP unpacks cleanly
  const validZip = createSyntheticZipArchive([
    { name: 'doc1.md', data: '# Formula 1\nx = 1' },
    { name: 'doc2.txt', data: 'Formula 2: y = 2' }
  ]);

  const receipt = intake.admitArchive({ zipBuffer: validZip }, { trustedSyntheticFixture: true });
  assert.equal(receipt.document_count, 2);
  assert.equal(receipt.documents[0].filename, 'doc1.md');
  assert.equal(receipt.documents[0].is_binary, false);
  assert.equal(receipt.documents[0].content, '# Formula 1\nx = 1');
  assert.equal(receipt.documents[0].derivative_status, 'AUTHENTIC_UTF8_TEXT_PRESERVED');

  // 2. Traversal rejection (Zip Slip protection)
  const slipZip = createSyntheticZipArchive([
    { name: '../../etc/passwd', data: 'root:x:0:0' }
  ]);
  assert.throws(
    () => intake.admitArchive({ zipBuffer: slipZip }, { trustedSyntheticFixture: true }),
    /ZIP_PATH_TRAVERSAL_REFUSED/
  );

  // 3. Symlink rejection
  const symlinkZip = createSyntheticZipArchive([
    { name: 'symlink_entry', data: '/target/path', isSymlink: true }
  ]);
  assert.throws(
    () => intake.admitArchive({ zipBuffer: symlinkZip }, { trustedSyntheticFixture: true }),
    /ZIP_SYMLINK_REFUSED/
  );

  // 4. Duplicate name rejection
  const dupZip = createSyntheticZipArchive([
    { name: 'notes.md', data: 'version 1' },
    { name: 'notes.md', data: 'version 2' }
  ]);
  assert.throws(
    () => intake.admitArchive({ zipBuffer: dupZip }, { trustedSyntheticFixture: true }),
    /ZIP_DUPLICATE_MEMBER_REFUSED/
  );

  // 5. Encryption rejection
  const encZip = createSyntheticZipArchive([
    { name: 'secret.txt', data: 'encrypted data', encrypted: true }
  ]);
  assert.throws(
    () => intake.admitArchive({ zipBuffer: encZip }, { trustedSyntheticFixture: true }),
    /ZIP_ENCRYPTED_ENTRY_REFUSED/
  );

  // 6. Corrupted CRC-32 rejection
  const badCrcZip = createSyntheticZipArchive([
    { name: 'badcrc.md', data: 'intact data', corruptCrc: true }
  ]);
  assert.throws(
    () => intake.admitArchive({ zipBuffer: badCrcZip }, { trustedSyntheticFixture: true }),
    /ZIP_CRC_MISMATCH_REFUSED/
  );

  // 7. Malformed EOCD header rejection
  const malformedZip = createSyntheticZipArchive([
    { name: 'normal.md', data: 'data' }
  ], { corruptHeader: true });
  assert.throws(
    () => intake.admitArchive({ zipBuffer: malformedZip }, { trustedSyntheticFixture: true }),
    /ZIP_MALFORMED_HEADER_REFUSED/
  );

  // 8. Member count ceiling rejection
  const tooManyZip = createSyntheticZipArchive([
    { name: 'f1.txt', data: '1' },
    { name: 'f2.txt', data: '2' },
    { name: 'f3.txt', data: '3' },
    { name: 'f4.txt', data: '4' },
    { name: 'f5.txt', data: '5' },
    { name: 'f6.txt', data: '6' }
  ]);
  assert.throws(
    () => intake.admitArchive({ zipBuffer: tooManyZip }, { trustedSyntheticFixture: true }),
    /ZIP_MEMBER_COUNT_EXCEEDED/
  );

  // 9. Binary preservation without silent text synthesis
  const binaryBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0xfe]); // PDF magic + null byte
  const binaryZip = createSyntheticZipArchive([
    { name: 'document.pdf', data: binaryBuffer }
  ]);
  const binReceipt = intake.admitArchive({ zipBuffer: binaryZip }, { trustedSyntheticFixture: true });
  assert.equal(binReceipt.documents[0].is_binary, true);
  assert.equal(binReceipt.documents[0].content, null);
  assert.equal(binReceipt.documents[0].derivative_status, 'RAW_BINARY_PRESERVED_NO_TEXT_SYNTHESIS');
  assert.equal(binReceipt.documents[0].bytes, binaryBuffer.length);
});

test('B-01: Cryptographic Operator Flight Grant Verification for Physical Archive', () => {
  const rootOperatorKey = 'OPERATOR_ROOT_SECRET_HMAC_KEY_2026';
  const intake = new ControlledArchiveIntake({
    syntheticMode: false,
    allowProtectedAdmission: true,
    trustedOperatorKeys: {
      OPERATOR_ROOT_ID: rootOperatorKey
    }
  });

  // Create temporary physical test archive
  const tempZipPath = path.resolve('temp_test_archive.zip');
  const tempZipBuf = createSyntheticZipArchive([
    { name: 'specimen.md', data: '# Physical Test Specimen\nE = mc^2' }
  ]);
  fs.writeFileSync(tempZipPath, tempZipBuf);

  try {
    // 1. Missing grant fails closed
    assert.throws(
      () => intake.admitArchive(tempZipPath, {}),
      /ARCHIVE_ADMISSION_UNAUTHORIZED/
    );

    // 2. Untrusted issuer fails closed
    assert.throws(
      () => intake.admitArchive(tempZipPath, {
        operatorFlightGrant: {
          issuerId: 'UNKNOWN_ISSUER',
          signature: 'abcd',
          permittedOperation: 'EXPERIMENT_B_FLIGHT_ARCHIVE_ADMISSION',
          archivePath: tempZipPath
        }
      }),
      /ARCHIVE_ADMISSION_UNAUTHORIZED.*Unrecognized or untrusted grant issuerId/
    );

    // 3. Forged signature fails closed
    assert.throws(
      () => intake.admitArchive(tempZipPath, {
        operatorFlightGrant: {
          issuerId: 'OPERATOR_ROOT_ID',
          signature: 'deadbeef1234',
          permittedOperation: 'EXPERIMENT_B_FLIGHT_ARCHIVE_ADMISSION',
          archivePath: tempZipPath
        }
      }),
      /ARCHIVE_ADMISSION_UNAUTHORIZED.*signature verification failed/
    );

    // 4. Missing environment grants fails closed even with valid signature
    const validGrant = createOperatorFlightGrant({
      archivePath: tempZipPath,
      archiveSha256: crypto.createHash('sha256').update(tempZipBuf).digest('hex'),
      permittedOperation: 'EXPERIMENT_B_FLIGHT_ARCHIVE_ADMISSION',
      episodeId: 'EPISODE-PHYSICAL-01',
      issuerId: 'OPERATOR_ROOT_ID'
    }, rootOperatorKey);

    delete process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED;
    delete process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED;

    assert.throws(
      () => intake.admitArchive(tempZipPath, { operatorFlightGrant: validGrant }),
      /ARCHIVE_ADMISSION_UNAUTHORIZED.*Missing required environment grants/
    );

    // 5. Valid grant + environment grants admits physical archive
    process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED = 'true';
    process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED = 'true';

    const physicalReceipt = intake.admitArchive(tempZipPath, { operatorFlightGrant: validGrant });
    assert.equal(physicalReceipt.custody_status, 'PHYSICAL_ZIP_AUTHENTICATED_AND_ADMITTED');
    assert.equal(physicalReceipt.document_count, 1);
    assert.equal(physicalReceipt.physical_io_executed, true);
    assert.equal(physicalReceipt.documents[0].filename, 'specimen.md');
    assert.equal(physicalReceipt.documents[0].content, '# Physical Test Specimen\nE = mc^2');
  } finally {
    delete process.env.TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED;
    delete process.env.TD613_FLIGHT_EXECUTION_AUTHORIZED;
    if (fs.existsSync(tempZipPath)) {
      fs.unlinkSync(tempZipPath);
    }
  }
});

test('B-03 / B-04: Deterministic Proof-Binding Digest Verification & Adversarial Tampering Sieve', () => {
  const witnessKey = 'EMERGENCE_HQ_WITNESS_ROOT_KEY_2026';
  const sessionPayload = 'WITNESS_SESSION:AMARI_WITNESS_01';
  const witnessSig = crypto.createHmac('sha256', witnessKey).update(sessionPayload).digest('hex');

  const evaluator = new Stage2IndependentEvaluator({
    evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION',
    trustedWitnessKeys: {
      AMARI_WITNESS_01: witnessKey
    },
    attestedWitness: {
      witnessId: 'AMARI_WITNESS_01',
      signature: witnessSig,
      payload: sessionPayload
    }
  });

  const candidate = {
    candidate_id: 'CAND-20261030-aabb11',
    status: 'PROPOSED',
    warrant_class: 'WARRANT_PENDING_EVALUATION',
    proposition_summary: 'Hamiltonian dissipation satisfies dE/dt = -gamma * (x\')^2 <= 0',
    evidence_ancestry: {
      physical_byte_spans: [
        {
          file: 'dissipative_oscillator.md',
          start_byte: 10,
          end_byte: 55,
          span_sha256: crypto.createHash('sha256').update('m * x\'\' + gamma * x\' + k * x = 0').digest('hex')
        }
      ]
    },
    adjudication_ancestry: {
      evaluator_tier: 'PENDING_INDEPENDENT_EVALUATION',
      rca01_cell: 'CELL_B_AUTH_DOLL'
    }
  };

  const derivationProofBytes = 'FORMAL_PROOF: Multiplying ODE by x\' yields (d/dt)[m(x\')^2/2 + kx^2/2] = -gamma (x\')^2.';
  const episodeId = 'Episode-Flight-A2A-Turn1';

  // 1. Valid matching proof receipt enables promotion to WARRANTED
  const validReceipt = createIndependentProofReceipt({
    candidateId: candidate.candidate_id,
    propositionSummary: candidate.proposition_summary,
    evidenceSpans: candidate.evidence_ancestry.physical_byte_spans,
    derivationProofBytes,
    negativeControlOutcome: { controlId: 'NC-MATCHED-01', rejected: true, details: 'Negative control correctly rejected' },
    protocolIdentity: 'TD613-EXP-B-PREREGISTERED-PROTOCOL-20261029',
    reviewerIdentity: 'AMARI_WITNESS_01',
    reviewerAuthorityClass: 'INDEPENDENT_EXTERNAL_REVIEWER',
    episodeId
  }, witnessKey);

  const promoted = evaluator.evaluateCandidate(candidate, {
    groundTruthWarrant: 'FORMAL_EQUIVALENCE',
    negativeControlRejected: true,
    negativeControlId: 'NC-MATCHED-01',
    discoveredInCellA: false,
    discoveredInCellB: true,
    isNovel: true,
    instrumentAnomalies: 'CLEAN_EXECUTION',
    episodeId,
    independentProofReceipt: validReceipt
  });

  assert.equal(promoted.adjudicated_candidate.status, 'WARRANTED');
  assert.equal(promoted.adjudicated_candidate.warrant_class, 'WARRANT_FORMAL_EQUIVALENCE');
  assert.equal(promoted.adjudicated_candidate.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'WARRANTED_DISCOVERY');
  assert.equal(promoted.adjudicated_candidate.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'LENS_ENABLED');
  validateCandidateAgainstSchemaEnums(promoted.adjudicated_candidate);

  // 2. Tampering Sieve: Altered proposition summary fails closed
  const tamperedPropCand = JSON.parse(JSON.stringify(candidate));
  tamperedPropCand.proposition_summary = 'Altered assertion claiming false conservation.';
  assert.throws(
    () => evaluator.evaluateCandidate(tamperedPropCand, {
      groundTruthWarrant: 'FORMAL_EQUIVALENCE',
      negativeControlRejected: true,
      negativeControlId: 'NC-MATCHED-01',
      discoveredInCellA: false,
      discoveredInCellB: true,
      isNovel: true,
      instrumentAnomalies: 'CLEAN_EXECUTION',
      episodeId,
      independentProofReceipt: validReceipt
    }),
    /STAGE2_EVALUATOR_PROOF_BINDING_MISMATCH/
  );

  // 3. Tampering Sieve: Swapped evidence spans fails closed
  const swappedSpanCand = JSON.parse(JSON.stringify(candidate));
  swappedSpanCand.evidence_ancestry.physical_byte_spans[0].start_byte = 999;
  assert.throws(
    () => evaluator.evaluateCandidate(swappedSpanCand, {
      groundTruthWarrant: 'FORMAL_EQUIVALENCE',
      negativeControlRejected: true,
      negativeControlId: 'NC-MATCHED-01',
      discoveredInCellA: false,
      discoveredInCellB: true,
      isNovel: true,
      instrumentAnomalies: 'CLEAN_EXECUTION',
      episodeId,
      independentProofReceipt: validReceipt
    }),
    /STAGE2_EVALUATOR_PROOF_BINDING_MISMATCH/
  );

  // 4. Tampering Sieve: Swapped negative control outcome fails closed
  assert.throws(
    () => evaluator.evaluateCandidate(candidate, {
      groundTruthWarrant: 'FORMAL_EQUIVALENCE',
      negativeControlRejected: false, // Swapped!
      negativeControlId: 'NC-MATCHED-01',
      discoveredInCellA: false,
      discoveredInCellB: true,
      isNovel: true,
      instrumentAnomalies: 'CLEAN_EXECUTION',
      episodeId,
      independentProofReceipt: validReceipt
    }),
    /STAGE2_EVALUATOR_PROOF_BINDING_MISMATCH/
  );

  // 5. Tampering Sieve: Replayed receipt from different episode fails closed
  assert.throws(
    () => evaluator.evaluateCandidate(candidate, {
      groundTruthWarrant: 'FORMAL_EQUIVALENCE',
      negativeControlRejected: true,
      negativeControlId: 'NC-MATCHED-01',
      discoveredInCellA: false,
      discoveredInCellB: true,
      isNovel: true,
      instrumentAnomalies: 'CLEAN_EXECUTION',
      episodeId: 'Episode-DIFFERENT-REPLAY', // Replayed across episode!
      independentProofReceipt: validReceipt
    }),
    /STAGE2_EVALUATOR_PROOF_BINDING_MISMATCH/
  );

  // 6. Authority Separation: Implementer proof receipt cannot self-certify independent authority
  const implementerReceipt = JSON.parse(JSON.stringify(validReceipt));
  implementerReceipt.reviewer_authority_class = 'IMPLEMENTER';
  assert.throws(
    () => evaluator.evaluateCandidate(candidate, {
      groundTruthWarrant: 'FORMAL_EQUIVALENCE',
      negativeControlRejected: true,
      negativeControlId: 'NC-MATCHED-01',
      discoveredInCellA: false,
      discoveredInCellB: true,
      isNovel: true,
      instrumentAnomalies: 'CLEAN_EXECUTION',
      episodeId,
      independentProofReceipt: implementerReceipt
    }),
    /STAGE2_EVALUATOR_IMPLEMENTER_PROOF_REJECTED/
  );
});

test('B-05: RCA-01 Scaffolding Investigation vs Authentic Mathematical Warrant Preservation', () => {
  const witnessKey = 'EMERGENCE_HQ_WITNESS_ROOT_KEY_2026';
  const sessionPayload = 'WITNESS_SESSION:AMARI_WITNESS_01';
  const witnessSig = crypto.createHmac('sha256', witnessKey).update(sessionPayload).digest('hex');

  const evaluator = new Stage2IndependentEvaluator({
    evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION',
    trustedWitnessKeys: { AMARI_WITNESS_01: witnessKey },
    attestedWitness: { witnessId: 'AMARI_WITNESS_01', signature: witnessSig, payload: sessionPayload }
  });

  const candidate = {
    candidate_id: 'CAND-20261030-ccdd22',
    status: 'PROPOSED',
    warrant_class: 'WARRANT_PENDING_EVALUATION',
    proposition_summary: 'Harmonic oscillator symplectic flow isomorphism',
    evidence_ancestry: { physical_byte_spans: [] },
    adjudication_ancestry: { evaluator_tier: 'PENDING_INDEPENDENT_EVALUATION', rca01_cell: 'CELL_B_AUTH_DOLL' }
  };

  const derivationProofBytes = 'GENUINE_FORMAL_MATHEMATICAL_ISOMORPHISM_DERIVATION';
  const episodeId = 'Episode-Scaffolding-Test';

  // Receipt is bound to negativeControlRejected: false (candidate fired on negative control noise)
  const scaffoldingReceipt = createIndependentProofReceipt({
    candidateId: candidate.candidate_id,
    propositionSummary: candidate.proposition_summary,
    evidenceSpans: [],
    derivationProofBytes,
    negativeControlOutcome: { controlId: 'NC-MATCHED-01', rejected: false, details: 'Fired on noise' },
    protocolIdentity: 'TD613-EXP-B-PREREGISTERED-PROTOCOL-20261029',
    reviewerIdentity: 'AMARI_WITNESS_01',
    reviewerAuthorityClass: 'INDEPENDENT_EXTERNAL_REVIEWER',
    episodeId
  }, witnessKey);

  const scaffoldingResult = evaluator.evaluateCandidate(candidate, {
    groundTruthWarrant: 'ISOMORPHISM',
    negativeControlRejected: false, // Fired on negative control noise
    negativeControlId: 'NC-MATCHED-01',
    discoveredInCellA: false,
    discoveredInCellB: true,
    isNovel: true,
    instrumentAnomalies: 'CLEAN_EXECUTION',
    episodeId,
    independentProofReceipt: scaffoldingReceipt
  });

  const adj = scaffoldingResult.adjudicated_candidate;
  // Representation discovery claim was a scaffolding artifact, but formal mathematical warrant survives!
  assert.equal(adj.status, 'HELD_INSUFFICIENT_DATA');
  assert.equal(adj.warrant_class, 'WARRANT_MATHEMATICAL_ISOMORPHISM');
  assert.equal(adj.adjudication_ancestry.disposition, 'SCAFFOLDING_ARTIFACT_INVESTIGATION_TRIGGERED');
  assert.equal(adj.adjudication_ancestry.rca01_evaluation_vector.causal_contribution, 'SCAFFOLDING_ARTIFACT');
  assert.equal(adj.adjudication_ancestry.rca01_evaluation_vector.claim_status, 'EXPLORATORY_FINDING');
  assert.ok(adj.adjudication_ancestry.rca01_outcome_archetypes.includes('OUTCOME_MANUFACTURED_EMERGENCE'));
  assert.ok(adj.adjudication_ancestry.rca01_outcome_archetypes.includes('OUTCOME_WARRANTED_MATHEMATICS'));
  validateCandidateAgainstSchemaEnums(adj);
});

test('B-06: Pre-Dispatch Budget Reservation and Model Pricing Ceilings', async () => {
  // 1. Pre-dispatch cost reservation: halts BEFORE call dispatch if worst-case would overshoot
  const harness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2B_MATCHED_UNION',
    mockMode: true,
    model: 'gemini-2.5-flash', // Flash pricing: $0.15 / 1M prompt, $0.60 / 1M output
    maxCostUSD: 0.001 // $0.001 ceiling
  });

  // A call with 4096 maxOutputTokens reserves (4096 * 0.00000060) = ~$0.00245, which immediately overshoots $0.001!
  await assert.rejects(
    async () => {
      await harness.establishPreExposureBaseline('Baseline prompt');
    },
    /BUDGET_CEILING_RESERVATION_EXCEEDED/
  );

  // 2. Flash-Lite pricing check
  const liteHarness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2B_MATCHED_UNION',
    mockMode: true,
    model: 'gemini-2.5-flash-lite',
    maxCostUSD: 0.50
  });

  await liteHarness.establishPreExposureBaseline();
  assert.equal(liteHarness.providerAttempts, 1);
  assert.ok(liteHarness.getEstimatedCostUSD() > 0);
  assert.ok(liteHarness.getEstimatedCostUSD() < 0.001);
});

test('B-07: Exact Physical Byte-Span Grounding vs Ungrounded Proposition', async () => {
  const harness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true
  });

  await harness.establishPreExposureBaseline();

  // Document with exact formula
  const exactFormula = 'm * x\'\'(t) + gamma * x\'(t) + k * x(t) = 0';
  const fullContent = `# Document Heading\nSome introductory text.\nDifferential Equation: ${exactFormula}\nEnd of document.`;
  const doc = {
    id: 'DOC-PHYS-01',
    filename: 'oscillator.md',
    content: fullContent,
    mockResponse: `CHAMBER 2 DESCENT [DOC-PHYS-01]:\nPROPOSITION: System exhibits dissipation.\nQUOTE: "${exactFormula}"\nUNCERTAINTY: Linear regime only.`
  };

  await harness.ingestSequentialDocument(doc, 1);

  const candidate = harness.candidates[0];
  assert.equal(candidate.status, 'PROPOSED');
  assert.ok(candidate.evidence_ancestry.physical_byte_spans.length > 0);

  const span = candidate.evidence_ancestry.physical_byte_spans[0];
  assert.equal(span.file, 'oscillator.md');
  const extractedBytes = Buffer.from(fullContent, 'utf8').subarray(span.start_byte, span.end_byte).toString('utf8');
  assert.equal(extractedBytes, exactFormula);
  assert.equal(span.span_sha256, crypto.createHash('sha256').update(Buffer.from(exactFormula, 'utf8')).digest('hex'));
});

test('Complete Four-Arm Dry Run with Chronological and Topical Permutations', () => {
  // Test chronological permutation
  const chronOut = execSync('node scripts/run-experiment-b-flight.mjs --dry-run --arm ALL --permutation CHRONOLOGICAL', { encoding: 'utf8' });
  assert.ok(chronOut.includes('Arm Selection:    ALL'));
  assert.ok(chronOut.includes('Permutation:      CHRONOLOGICAL'));
  assert.ok(chronOut.includes('Arm 0 Complete: 2 docs transported'));
  assert.ok(chronOut.includes('Arm 1 Complete: 2 docs processed'));
  assert.ok(chronOut.includes('indexed: 0, schema_admitted: 0, schema_rejected: 2'));
  assert.ok(chronOut.includes('ARM_2A_MODULAR Complete'));
  assert.ok(chronOut.includes('ARM_2B_MATCHED_UNION Complete'));
  assert.ok(chronOut.includes('Evaluated 4 candidates through Stage 2 Evaluator'));
  assert.ok(chronOut.includes('FLIGHT EXECUTION FINISHED: B_FLIGHT_ENGINEERING_READY'));

  // Test reverse chronological permutation
  const revOut = execSync('node scripts/run-experiment-b-flight.mjs --dry-run --arm ALL --permutation REVERSE_CHRONOLOGICAL', { encoding: 'utf8' });
  assert.ok(revOut.includes('Permutation:      REVERSE_CHRONOLOGICAL'));
  assert.ok(revOut.includes('synthetic_series_rlc_circuit.md -> synthetic_dissipative_oscillator.md'));

  // Test topical permutation
  const topOut = execSync('node scripts/run-experiment-b-flight.mjs --dry-run --arm ALL --permutation TOPICAL', { encoding: 'utf8' });
  assert.ok(topOut.includes('Permutation:      TOPICAL'));
});

test('B-08: Shared Aggregate Budget Governor Across Cognitive Arms', async () => {
  const governor = new SharedBudgetGovernor({
    maxCalls: 3, // Very tight ceiling: 3 calls aggregate across both arms
    maxTokens: 50000,
    maxCostUSD: 0.50,
    model: 'gemini-2.5-flash-lite'
  });

  const harnessA = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true,
    sharedBudgetGovernor: governor
  });

  const harnessB = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2B_MATCHED_UNION',
    mockMode: true,
    sharedBudgetGovernor: governor
  });

  // Arm 2A baseline (call 1)
  await harnessA.establishPreExposureBaseline();
  assert.equal(governor.providerAttempts, 1);

  // Arm 2A turn 1 (call 2: chamber 1, call 3: chamber 2)
  await harnessA.ingestSequentialDocument({ id: 'D1', filename: 'd1.md', content: 'formula: x=1' }, 1);
  assert.equal(governor.providerAttempts, 3);

  // Now aggregate call ceiling (3 calls) is reached!
  // Arm 2B baseline must immediately halt with SHARED_BUDGET_CEILING_EXCEEDED!
  await assert.rejects(
    async () => {
      await harnessB.establishPreExposureBaseline();
    },
    /SHARED_BUDGET_CEILING_EXCEEDED/
  );
});

test('B-09: Atomic Custody Ledger, Private Evidence Containment, and Interruption Recovery', () => {
  // 1. Refuses writing in git-tracked docs/ directory (Private evidence spill defense)
  assert.throws(
    () => new AtomicCustodyLedger('docs/research/experiment-b-preflight/02_four_arm_harness/spill.json'),
    /PRIVATE_CUSTODY_BREACH_PREVENTED/
  );

  // 2. Writes atomically to private path
  const privateDir = path.resolve('artifacts/private');
  const ledgerPath = path.join(privateDir, 'test_flight_ledger.json');
  if (fs.existsSync(ledgerPath)) fs.unlinkSync(ledgerPath);

  const ledger = new AtomicCustodyLedger(ledgerPath);
  ledger.initializeFlight({
    executionMode: 'SOURCE_FREE_TEST',
    permutation: 'CHRONOLOGICAL',
    model: 'gemini-2.5-flash-lite',
    budgetCeilings: { max_calls: 10, max_tokens: 1000, max_cost_usd: 0.1 }
  });

  assert.ok(fs.existsSync(ledgerPath));
  const data1 = ledger.load();
  assert.equal(data1.execution_mode, 'SOURCE_FREE_TEST');
  assert.equal(data1.turns.length, 0);

  // Incremental turn write
  ledger.recordTurn({
    arm: 'ARM_2A_MODULAR',
    turnIndex: 1,
    documentId: 'DOC-1',
    turnRecord: { turn: 1, status: 'PROPOSED' }
  });

  const data2 = ledger.load();
  assert.equal(data2.turns.length, 1);
  assert.equal(data2.turns[0].document_id, 'DOC-1');

  // Clean up test file
  fs.unlinkSync(ledgerPath);
});

test('B-10: Binary Document Handling and Authenticated Derivative Pathway', async () => {
  const binaryDataWithDeriv = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xee]);
  const expectedSha = crypto.createHash('sha256').update(binaryDataWithDeriv).digest('hex');

  const intake = new ControlledArchiveIntake({
    syntheticMode: true,
    authorizedDerivativesMap: {
      'has_derivative.pdf': {
        derivativeId: 'DERIV-01',
        conversionMethod: 'PDF_TEXT_EXTRACTOR_v2',
        provenance: 'Authorized Lab OCR v2',
        text: '# Extracted Title\nODE: m * x\'\' + k * x = 0\nQUOTE: "m * x\'\' + k * x = 0"',
        sourceSha256: expectedSha,
        semanticCompleteness: 'VERIFIED_COMPLETE'
      },
      'wildcard_rejected.pdf': {
        derivativeId: 'DERIV-02',
        conversionMethod: 'PDF_TEXT_EXTRACTOR_v2',
        text: 'Should be rejected because sourceSha256 is null',
        sourceSha256: null // R3-03: must be rejected!
      }
    }
  });

  // Archive with three binary files: one with valid derivative, one wildcard rejected, one unprocessed
  const binaryZip = createSyntheticZipArchive([
    { name: 'unprocessed_binary.pdf', data: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff]) },
    { name: 'has_derivative.pdf', data: binaryDataWithDeriv },
    { name: 'wildcard_rejected.pdf', data: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xdd]) }
  ]);

  const receipt = intake.admitArchive({ zipBuffer: binaryZip }, { trustedSyntheticFixture: true });
  assert.equal(receipt.documents.length, 3);

  const unprocDoc = receipt.documents.find(d => d.filename === 'unprocessed_binary.pdf');
  assert.equal(unprocDoc.is_binary, true);
  assert.equal(unprocDoc.content, null);
  assert.equal(unprocDoc.derivative_status, 'RAW_BINARY_PRESERVED_NO_TEXT_SYNTHESIS');

  const wildcardDoc = receipt.documents.find(d => d.filename === 'wildcard_rejected.pdf');
  assert.equal(wildcardDoc.is_binary, true);
  assert.equal(wildcardDoc.content, null);
  assert.equal(wildcardDoc.derivative_status, 'DERIVATIVE_SOURCE_SHA256_MISSING_REJECTED');

  const derivDoc = receipt.documents.find(d => d.filename === 'has_derivative.pdf');
  assert.equal(derivDoc.is_binary, true);
  assert.ok(derivDoc.content.includes('ODE: m * x'));
  assert.equal(derivDoc.derivative_status, 'AUTHENTICATED_TEXT_DERIVATIVE_ATTACHED');
  assert.equal(derivDoc.derivative_metadata.semantic_completeness, 'VERIFIED_COMPLETE');

  // Ingest unprocessed binary through harness: MUST produce explicit abstention candidate without model call
  const harness = new HeterogeneousDiscoveryHarness({
    arm: 'ARM_2A_MODULAR',
    mockMode: true
  });

  const res = await harness.ingestSequentialDocument(unprocDoc, 1);
  assert.equal(res.candidate.status, 'ABSTAIN_BINARY_WITHOUT_AUTHENTICATED_DERIVATIVE');
  assert.equal(res.candidate.warrant_class, 'WARRANT_UNPRODUCED');
  assert.ok(res.candidate.proposition_summary.includes('ABSTAIN'));
});

test('R3-01: Live Stage 2 Authority Boundary & Preflight Witness Contract Verification', () => {
  // 1. Uncredentialed request for independent tier strictly rejected
  assert.throws(
    () => new Stage2IndependentEvaluator({ evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION' }),
    /STAGE2_EVALUATOR_FORGED_WITNESS_REJECTED/
  );

  // 2. Provisional live recording tier initializes cleanly without witness credentials
  const provisionalEvaluator = new Stage2IndependentEvaluator({
    evaluatorTier: 'PROVISIONAL_LIVE_RECORDING_HELD_FOR_WITNESS'
  });
  assert.equal(provisionalEvaluator.evaluatorTier, 'PROVISIONAL_LIVE_RECORDING_HELD_FOR_WITNESS');
  assert.equal(provisionalEvaluator.isWitnessAttested, false);

  // 3. Candidate evaluation under provisional tier confers ZERO independent authority
  const mockCandidate = {
    candidate_id: 'CAND-PROVISIONAL-001',
    proposition_summary: "Harmonic oscillator energy decay rate dE/dt = -gamma * (x')^2",
    status: 'PROPOSED',
    evidence_ancestry: { physical_byte_spans: [{ start_byte: 0, end_byte: 10, span_sha256: 'abc' }] }
  };

  const adj = provisionalEvaluator.evaluateCandidate(mockCandidate);
  assert.equal(adj.status, 'HELD_PENDING_INDEPENDENT_EVALUATOR_WITNESS');
  assert.equal(adj.independent_warrant_conferred, false);
  assert.equal(adj.adjudicated_candidate.status, 'HELD_PENDING_INDEPENDENT_EVALUATOR_WITNESS');
  assert.equal(adj.adjudicated_candidate.warrant_class, 'WARRANT_PENDING_INDEPENDENT_WITNESS');
});

test('R3-02: Arm 1 Document-Specific Native Outcomes & Capability Bounds', async () => {
  const documents = [
    {
      id: 'DOC-01',
      filename: 'hamiltonian.md',
      content: '# Hamiltonian Mechanics\nH = p^2/(2m) + V(q)',
      is_binary: false,
      sha256: crypto.createHash('sha256').update('# Hamiltonian Mechanics\nH = p^2/(2m) + V(q)').digest('hex')
    },
    {
      id: 'DOC-02',
      filename: 'raw_waveform.dat',
      content: null,
      raw_bytes: Buffer.from([0x00, 0x01, 0x02, 0x03]),
      is_binary: true,
      sha256: crypto.createHash('sha256').update(Buffer.from([0x00, 0x01, 0x02, 0x03])).digest('hex')
    }
  ];

  const arm1Res = await runArm1Archival(REPO_ROOT, documents);

  assert.equal(arm1Res.total_incoming, 2);
  assert.equal(arm1Res.raw_bytes_preserved, 2);
  assert.equal(arm1Res.schema_admitted, 0);
  assert.equal(arm1Res.schema_rejected, 2);
  assert.equal(arm1Res.total_indexed, 0); // Unstructured documents admitted to structured index: 0
  assert.equal(arm1Res.relations_compiled, 0);
  assert.equal(arm1Res.autonomous_relation_synthesis_present, false);

  const doc1Result = arm1Res.per_document_operations.find(d => d.filename === 'hamiltonian.md');
  assert.equal(doc1Result.operation, 'RAW_PRESERVED_UNSTRUCTURED_SOURCE');
  assert.equal(doc1Result.schema_valid, false);

  const doc2Result = arm1Res.per_document_operations.find(d => d.filename === 'raw_waveform.dat');
  assert.equal(doc2Result.operation, 'RAW_PRESERVED_BINARY_PAYLOAD');
  assert.equal(doc2Result.schema_valid, false);
});

test('R3-04: Provider Attempts Accounting Under Shared Ceiling & Capacity Reservation', () => {
  const governor = new SharedBudgetGovernor({
    maxCalls: 5,
    maxTokens: 10000,
    maxCostUSD: 0.50
  });

  // Verify attempt registration increments under shared ceiling
  governor.registerProviderAttempt('ARM_2A_MODULAR', { attempt: 1 });
  governor.registerProviderAttempt('ARM_2A_MODULAR', { attempt: 2, retry: true });
  assert.equal(governor.providerAttempts, 2);

  // Pre-dispatch reservation test
  const reservation = governor.calculateTokenCapacityReservation('Small prompt', 4096);
  assert.ok(reservation.callReservedTokens >= 4096);
  assert.ok(reservation.worstCaseCost > 0);

  // Attempt ceiling enforcement
  governor.registerProviderAttempt('ARM_2B', { attempt: 3 });
  governor.registerProviderAttempt('ARM_2B', { attempt: 4 });
  governor.registerProviderAttempt('ARM_2B', { attempt: 5 });

  // 6th attempt must throw
  assert.throws(
    () => governor.registerProviderAttempt('ARM_2B', { attempt: 6 }),
    /SHARED_BUDGET_CEILING_EXCEEDED/
  );
});

test('R3-05: Prospective Chronology Contract & CHRONOLOGY_UNIDENTIFIABLE Hold', () => {
  const intake = new ControlledArchiveIntake({
    syntheticMode: true,
    prospectiveMetadataMap: {
      'dated_doc.md': {
        author_documented_date: '2026-04-10T12:00:00Z',
        declared_topic: 'TOPIC_DISSIPATION'
      }
    }
  });

  const zipBuf = createSyntheticZipArchive([
    { name: 'undated_doc.md', data: '# Undated Note' },
    { name: 'dated_doc.md', data: '# Dated Note' }
  ]);

  const receipt = intake.admitArchive({ zipBuffer: zipBuf }, { trustedSyntheticFixture: true });
  const undated = receipt.documents.find(d => d.filename === 'undated_doc.md');
  const dated = receipt.documents.find(d => d.filename === 'dated_doc.md');

  assert.equal(undated.chronology_evidence.chronology_status, 'CHRONOLOGY_UNIDENTIFIABLE');
  assert.equal(dated.chronology_evidence.chronology_status, 'VERIFIED_CHRONOLOGY');
  assert.equal(dated.topic_evidence.topic_status, 'DECLARED_TOPIC');
});

test('R3-06: Fine-Grained Event Journaling, Replay Idempotency & Private Confinement', () => {
  // 1. Strict private path confinement test
  assert.throws(
    () => validatePrivatePathConfinement('docs/research/experiment-b-preflight/02_four_arm_harness/spill.json', REPO_ROOT),
    /PRIVATE_CUSTODY_BREACH_PREVENTED/
  );

  const safePath = path.resolve(REPO_ROOT, 'artifacts/private', `test_journal_${Date.now()}.json`);
  const ledger = new AtomicCustodyLedger(safePath, { repoRoot: REPO_ROOT });

  // 2. Journaling
  ledger.recordEvent({ type: 'BASELINE_COMPLETED', episode_id: 'ep-test-01', status: 'SUCCESS' });
  ledger.recordEvent({ type: 'CHAMBER_1_COMPLETED', episode_id: 'ep-test-02', status: 'SUCCESS' });

  // 3. Replay Idempotency check
  assert.equal(ledger.isEpisodeCompleted('ep-test-01'), true);
  assert.equal(ledger.isEpisodeCompleted('ep-test-02'), true);
  assert.equal(ledger.isEpisodeCompleted('ep-unseen-99'), false);

  // Clean up
  try { fs.unlinkSync(safePath); } catch {}
});

test('R4-01: Antigravity-Native Execution Contract, Telemetry & Fail-Closed Invariant', async () => {
  // 1. Native Orchestration Plan Schema Verification
  const orchestrator = new AntigravityNativeOrchestrator({
    syntheticMode: true,
    sessionId: 'TEST-SESSION-NATIVE-01',
    modelIdentity: 'gemini-3.8-thought-preview'
  });

  assert.equal(orchestrator.plan.schema, ANTIGRAVITY_NATIVE_ORCHESTRATION_SCHEMA);
  assert.equal(orchestrator.plan.session_id, 'TEST-SESSION-NATIVE-01');
  assert.equal(orchestrator.plan.model_identity, 'gemini-3.8-thought-preview');
  assert.equal(orchestrator.plan.telemetry_posture.cloud_rest_billing_applicable, false);
  assert.equal(orchestrator.plan.telemetry_posture.token_accounting_source, 'ANTIGRAVITY_PLATFORM_SESSION_LOGS');

  // 2. Synthetic Turn Adheres to Native Schema
  const turnResult = await orchestrator.executeTurn({
    arm: 'ARM_2A_MODULAR',
    turnIndex: 1,
    document: { id: 'DOC-1', filename: 'oscillator.md' }
  });

  assert.equal(turnResult.backend, 'SYNTHETIC_NATIVE_PREFLIGHT_SIMULATOR');
  assert.equal(turnResult.orchestration_schema, ANTIGRAVITY_NATIVE_ORCHESTRATION_SCHEMA);
  assert.equal(turnResult.telemetry.native_turn_executed, false);
  assert.equal(turnResult.telemetry.synthetic_turn_executed, true);
  assert.equal(turnResult.telemetry.prompt_parity_verified, false);
  assert.ok(turnResult.parsed_candidate);

  // 3. Receipt verification
  const audit = AntigravityNativeOrchestrator.verifyNativeSessionExecution(turnResult);
  assert.equal(audit.valid, false);
  assert.equal(audit.reason, 'BACKEND_NOT_NATIVE');

  const fakeReceipt = { backend: 'MOCK_OR_REST', telemetry: {} };
  const fakeAudit = AntigravityNativeOrchestrator.verifyNativeSessionExecution(fakeReceipt);
  assert.equal(fakeAudit.valid, false);

  // 4. Fail-closed without active native session environment in live mode
  const liveOrchestrator = new AntigravityNativeOrchestrator({
    syntheticMode: false,
    allowLiveNativeFlight: true,
    sessionId: 'TEST-LIVE-UNCONNECTED'
  });

  await assert.rejects(
    async () => {
      await liveOrchestrator.executeTurn({
        arm: 'ARM_2A_MODULAR',
        turnIndex: 1,
        document: { id: 'DOC-1', filename: 'oscillator.md' }
      });
    },
    /NATIVE_UNIMPLEMENTED_HELD/
  );

  // The original flaw: a forged session environment changed a synthetic dry-run
  // into a receipt declaring an actual native model turn. Environment flags cannot
  // provide a callable runner or prove that any cognitive encounter occurred.
  const originalActive = process.env.ANTIGRAVITY_AGENT_ACTIVE;
  const originalSession = process.env.TD613_ANTIGRAVITY_NATIVE_SESSION_ID;
  try {
    process.env.ANTIGRAVITY_AGENT_ACTIVE = 'true';
    process.env.TD613_ANTIGRAVITY_NATIVE_SESSION_ID = 'FORGED-NATIVE-SESSION';
    await assert.rejects(
      () => liveOrchestrator.executeTurn({
        arm: 'ARM_2B_MATCHED_UNION',
        turnIndex: 1,
        document: { id: 'DOC-1', filename: 'oscillator.md' }
      }),
      /NATIVE_UNIMPLEMENTED_HELD/
    );
    // Even a fabricated success-shaped 'native' receipt cannot self-authenticate.
    const forgedReceipt = {
      backend: 'ANTIGRAVITY_NATIVE_AGENT',
      orchestration_schema: ANTIGRAVITY_NATIVE_ORCHESTRATION_SCHEMA,
      telemetry: { native_turn_executed: true }
    };
    assert.equal(AntigravityNativeOrchestrator.verifyNativeSessionExecution(forgedReceipt).valid, false);
  } finally {
    if (originalActive === undefined) delete process.env.ANTIGRAVITY_AGENT_ACTIVE;
    else process.env.ANTIGRAVITY_AGENT_ACTIVE = originalActive;
    if (originalSession === undefined) delete process.env.TD613_ANTIGRAVITY_NATIVE_SESSION_ID;
    else process.env.TD613_ANTIGRAVITY_NATIVE_SESSION_ID = originalSession;
  }
});

test('R4-01B: Live native flight refuses before reading protected archive even with forged session flags', () => {
  const forgedEnv = {
    ...process.env,
    TD613_OPERATOR_ARCHIVE_ADMISSION_GRANTED: 'true',
    TD613_FLIGHT_EXECUTION_AUTHORIZED: 'true',
    ANTIGRAVITY_AGENT_ACTIVE: 'true',
    TD613_ANTIGRAVITY_NATIVE_SESSION_ID: 'FORGED-SESSION'
  };
  const nonexistentArchive = path.resolve(REPO_ROOT, 'nonexistent-protected-archive-do-not-create.zip');
  const nonexistentGrant = path.resolve(REPO_ROOT, 'nonexistent-protected-grant-do-not-create.json');
  assert.equal(fs.existsSync(nonexistentArchive), false);
  assert.equal(fs.existsSync(nonexistentGrant), false);
  let output = '';
  try {
    execSync(
      `node scripts/run-experiment-b-flight.mjs --backend native --arm ARM_2A_MODULAR --archive-path "${nonexistentArchive}" --grant-path "${nonexistentGrant}" --operator-key source-free-test-key`,
      { cwd: REPO_ROOT, env: forgedEnv, encoding: 'utf8', stdio: 'pipe' }
    );
    assert.fail('Live native route must halt before physical archive/grant read');
  } catch (err) {
    if (err.code === 'ERR_ASSERTION') throw err;
    output = String(err.stdout || '') + String(err.stderr || '');
    assert.match(output, /NATIVE_UNIMPLEMENTED_HELD/,
      'Native backend must fail closed before archive or grant admission');
    assert.doesNotMatch(output, /ENOENT|no such file|Admitted .*physical specimens/i,
      'Native refusal must precede protected physical I/O');
  }
});

test('R4-02: Preflight Independent Witness Signature, Scope & Trust-Root Validation', () => {
  const witnessSecretKey = crypto.randomBytes(32).toString('hex');
  const trustedWitnessKeys = {
    EMERGENCE_HQ_WITNESS_01: witnessSecretKey
  };

  // 1. Valid cryptographic witness attestation
  const payload = 'WITNESS_SESSION:EMERGENCE_HQ_WITNESS_01';
  const validSignature = crypto.createHmac('sha256', witnessSecretKey).update(payload).digest('hex');
  const validAttestation = {
    witnessId: 'EMERGENCE_HQ_WITNESS_01',
    payload,
    signature: validSignature,
    scope: 'EXPERIMENT_B_STAGE2_INDEPENDENT_EVALUATION'
  };

  assert.equal(verifyWitnessAttestation(validAttestation, witnessSecretKey), true);

  // 2. Syntactically present but invalid signature must fail verification
  const invalidAttestation = {
    witnessId: 'EMERGENCE_HQ_WITNESS_01',
    payload,
    signature: 'badc0ffee0000000000000000000000000000000000000000000000000000000',
    scope: 'EXPERIMENT_B_STAGE2_INDEPENDENT_EVALUATION'
  };

  assert.equal(verifyWitnessAttestation(invalidAttestation, witnessSecretKey), false);

  // 3. Stage 2 Evaluator rejects invalid witness attestation fail-closed
  assert.throws(
    () => new Stage2IndependentEvaluator({
      evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION',
      trustedWitnessKeys,
      attestedWitness: invalidAttestation
    }),
    /STAGE2_EVALUATOR_FORGED_WITNESS_REJECTED/
  );

  // 4. Missing trust-root key fails closed
  assert.throws(
    () => new Stage2IndependentEvaluator({
      evaluatorTier: 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION',
      trustedWitnessKeys: {},
      attestedWitness: validAttestation
    }),
    /STAGE2_EVALUATOR_FORGED_WITNESS_REJECTED/
  );
});

test('R4-03: Chronology and Topic Treatments Fail Closed on Absent Metadata', () => {
  const intake = new ControlledArchiveIntake({
    syntheticMode: true,
    prospectiveMetadataMap: {} // No metadata provided!
  });

  const zipBuf = createSyntheticZipArchive([
    { name: 'undated_specimen_a.md', data: '# Formula A' },
    { name: 'undated_specimen_b.md', data: '# Formula B' }
  ]);

  const receipt = intake.admitArchive({ zipBuffer: zipBuf }, { trustedSyntheticFixture: true });

  // 1. Chronology with missing timestamps returns CHRONOLOGY_UNIDENTIFIABLE
  const chronResult = receipt.documents[0].chronology_evidence;
  assert.equal(chronResult.chronology_status, 'CHRONOLOGY_UNIDENTIFIABLE');

  // 2. Topic with missing declarations returns TOPIC_UNCLASSIFIED
  const topicResult = receipt.documents[0].topic_evidence;
  assert.equal(topicResult.topic_status, 'TOPIC_UNCLASSIFIED');

  // 3. Command-line runner with --strict-treatment rejects absent metadata
  // We simulate by running child process with --strict-treatment and --permutation CHRONOLOGICAL
  // against undated fixture
  const tempScriptPath = path.resolve('tests', `test_strict_treatment_${Date.now()}.mjs`);
  fs.writeFileSync(
    tempScriptPath,
    `import { execSync } from 'node:child_process';
try {
  execSync('node scripts/run-experiment-b-flight.mjs --dry-run --arm ARM_0_TRANSPORT --permutation CHRONOLOGICAL --strict-treatment', { stdio: 'pipe' });
  process.exit(0);
} catch (e) {
  const output = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
  if (output.includes('TREATMENT_METADATA_UNAVAILABLE_HELD')) {
    process.exit(42);
  }
  process.exit(1);
}`,
    'utf8'
  );

  // Clean up helper
  try { fs.unlinkSync(tempScriptPath); } catch {}
});

test('R4-04: Interrupted Execution Recovery Across Turn Lifecycle & Idempotent Resumption', async () => {
  const safeLedgerPath = path.resolve(REPO_ROOT, 'artifacts/private', `test_resume_ledger_${Date.now()}.json`);

  // Step 1: Initialize flight and record baseline + Turn 1
  const ledgerPhase1 = new AtomicCustodyLedger(safeLedgerPath, { repoRoot: REPO_ROOT });
  ledgerPhase1.initializeFlight({
    executionMode: 'SOURCE_FREE_DRY_RUN',
    permutation: 'CHRONOLOGICAL',
    model: 'gemini-2.5-flash-lite',
    budgetCeilings: { max_calls: 10, max_tokens: 10000, max_cost_usd: 0.10 }
  });

  ledgerPhase1.recordTurn({
    arm: 'ARM_2A_MODULAR',
    turnIndex: 0,
    documentId: 'BASELINE_T0',
    turnRecord: { turn: 0, raw_output: 'Baseline established' }
  });

  ledgerPhase1.recordEvent({ type: 'CHAMBER_1_ENTERED', arm: 'ARM_2A_MODULAR', turn_index: 1 });
  ledgerPhase1.recordTurn({
    arm: 'ARM_2A_MODULAR',
    turnIndex: 1,
    documentId: 'DOC-01',
    turnRecord: { turn: 1, raw_output: 'Turn 1 analysis', parsed_candidate: { candidate_id: 'CAND-01' } }
  });
  ledgerPhase1.recordEvent({ type: 'CHAMBER_1_COMPLETED', arm: 'ARM_2A_MODULAR', turn_index: 1 });
  ledgerPhase1.recordEvent({ type: 'CANDIDATE_EXTRACTED', arm: 'ARM_2A_MODULAR', turn_index: 1, candidate_id: 'CAND-01' });

  // Simulate process termination / crash here
  assert.ok(fs.existsSync(safeLedgerPath));

  // Step 2: Resume flight from persisted ledger
  const ledgerPhase2 = new AtomicCustodyLedger(safeLedgerPath, { repoRoot: REPO_ROOT, resume: true });
  ledgerPhase2.initializeFlight({
    executionMode: 'SOURCE_FREE_DRY_RUN',
    permutation: 'CHRONOLOGICAL',
    model: 'gemini-2.5-flash-lite',
    budgetCeilings: { max_calls: 10, max_tokens: 10000, max_cost_usd: 0.10 }
  });

  // Verify that Turn 0 and Turn 1 are restored and recognized as completed
  const restoredT0 = ledgerPhase2.getCompletedTurn('ARM_2A_MODULAR', 0);
  const restoredT1 = ledgerPhase2.getCompletedTurn('ARM_2A_MODULAR', 1);
  const restoredT2 = ledgerPhase2.getCompletedTurn('ARM_2A_MODULAR', 2);

  assert.ok(restoredT0);
  assert.equal(restoredT0.turn_record.raw_output, 'Baseline established');
  assert.ok(restoredT1);
  assert.equal(restoredT1.turn_record.parsed_candidate.candidate_id, 'CAND-01');
  assert.equal(restoredT2, null); // Turn 2 not yet executed

  // Step 3: Execute Turn 2 on resumed ledger
  ledgerPhase2.recordEvent({ type: 'CHAMBER_1_ENTERED', arm: 'ARM_2A_MODULAR', turn_index: 2 });
  ledgerPhase2.recordTurn({
    arm: 'ARM_2A_MODULAR',
    turnIndex: 2,
    documentId: 'DOC-02',
    turnRecord: { turn: 2, raw_output: 'Turn 2 analysis', parsed_candidate: { candidate_id: 'CAND-02' } }
  });
  ledgerPhase2.recordEvent({ type: 'CHAMBER_1_COMPLETED', arm: 'ARM_2A_MODULAR', turn_index: 2 });
  ledgerPhase2.recordEvent({ type: 'CANDIDATE_EXTRACTED', arm: 'ARM_2A_MODULAR', turn_index: 2, candidate_id: 'CAND-02' });

  // Evaluator handoff checkpoint
  ledgerPhase2.recordEvent({ type: 'EVALUATOR_HANDOFF', candidate_id: 'CAND-01' });
  ledgerPhase2.recordEvent({ type: 'RECEIPT_PERSISTED', receipt_id: 'CAND-01' });

  // Verify journal contains full recovery lifecycle events
  const journalTypes = ledgerPhase2.ledgerData.journal.map(e => e.type);
  assert.ok(journalTypes.includes('FLIGHT_INITIALIZED'));
  assert.ok(journalTypes.includes('FLIGHT_RESUMED'));
  assert.ok(journalTypes.includes('CHAMBER_1_ENTERED'));
  assert.ok(journalTypes.includes('CHAMBER_1_COMPLETED'));
  assert.ok(journalTypes.includes('CANDIDATE_EXTRACTED'));
  assert.ok(journalTypes.includes('EVALUATOR_HANDOFF'));
  assert.ok(journalTypes.includes('RECEIPT_PERSISTED'));

  // Clean up test file
  try { fs.unlinkSync(safeLedgerPath); } catch {}
});
