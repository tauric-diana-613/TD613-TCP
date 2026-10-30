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
  assert.ok(chronOut.includes('Arm 1 Complete: 2 docs indexed'));
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
