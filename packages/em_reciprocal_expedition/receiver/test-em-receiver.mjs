/**
 * Test Suite for EmEmptyEncyclopediaReceiver (Crossing E)
 * 
 * Verifies:
 * 1. Initial State Witness & Unique Custody Record
 * 2. Fatal UTF-8 Decoding & Raw Binary Partition
 * 3. Safe-Integer Coordinate Integrity & Span Boundary Safety
 * 4. Source vs. Derivative Separation
 * 5. Work Route vs. Manifestation Invariant
 * 6. Contextual Role vs. Intrinsic Prohibition Invariant
 * 7. Admitted Relation with Cryptographic Span Proof
 * 
 * Emits packages/em_reciprocal_expedition/receiver/em-receiver-receipt.json
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  EmEmptyEncyclopediaReceiver,
  EM_RECEIVER_SCHEMA_V1,
  sha256,
} from './em-empty-receiver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'em-receiver-receipt.json');

console.log('================================================================');
console.log('EM EMPTY ENCYCLOPEDIA RECEIVER (CROSSING E) VERIFICATION SUITE');
console.log('================================================================\n');

const testResults = [];

function recordTest(name, passed, details = {}) {
  testResults.push({ name, passed, details });
  const status = passed ? '[PASS]' : '[FAIL]';
  console.log(`${status} ${name}`);
  if (!passed) {
    console.error(`  -> FAILURE DETAILS:`, details);
  }
}

const receiver = new EmEmptyEncyclopediaReceiver(':memory:');
const witness = receiver.initialize({ memory: true });

// -------------------------------------------------------------
// 1. Initial State Witness
// -------------------------------------------------------------
console.log('--- TEST 1: Initial State Witness ---');
recordTest('Unique initial witness created', Boolean(witness.witness_hash && witness.entropy), {
  schema: witness.schema,
  witness_hash: witness.witness_hash,
});

recordTest('Schema conforms to td613.em-empty-receiver/v1', witness.schema === EM_RECEIVER_SCHEMA_V1);

// -------------------------------------------------------------
// 2. Fatal UTF-8 Decoding & Binary Partition
// -------------------------------------------------------------
console.log('\n--- TEST 2: Fatal UTF-8 Decoding & Binary Evidence ---');

// 2.1 Malformed UTF-8 rejected
let malformedRejected = false;
try {
  receiver.admitSource({
    sourceId: 'src:malformed_utf8',
    filename: 'bad.txt',
    relativePath: 'bad.txt',
    rawBytes: Buffer.from([0x80, 0x81, 0xFF]), // Lone continuation / invalid bytes
    isByteEvidence: false,
  });
} catch (err) {
  if (err.code === 'MALFORMED_UTF8_SEQUENCE') {
    malformedRejected = true;
  }
}
recordTest('Rejected malformed UTF-8 lone continuation bytes with MALFORMED_UTF8_SEQUENCE', malformedRejected);

// 2.2 Valid UTF-8 with Covenant Khona‌lit-po admitted
const covenantText = 'Covenant Khona\u200Clit-po (preserving interior U+200C)';
const covSource = receiver.admitSource({
  sourceId: 'src:covenant_text',
  filename: 'covenant.txt',
  relativePath: 'covenant.txt',
  rawBytes: Buffer.from(covenantText, 'utf8'),
  isByteEvidence: false,
});
recordTest('Admitted valid UTF-8 text containing Covenant Khona‌lit-po', covSource.evidence_class === 'TEXT_DOCUMENT');

// 2.3 Raw binary admitted under isByteEvidence: true
const rawBinaryBytes = Buffer.from([0x00, 0xFF, 0xFE, 0x80, 0xC0, 0xDE]);
const binSource = receiver.admitSource({
  sourceId: 'src:raw_binary',
  filename: 'firmware.bin',
  relativePath: 'firmware.bin',
  rawBytes: rawBinaryBytes,
  isByteEvidence: true,
});
recordTest('Classified binary data as BYTE_EVIDENCE', binSource.evidence_class === 'BYTE_EVIDENCE');

// -------------------------------------------------------------
// 3. Safe Integer & Span Bounds Checks
// -------------------------------------------------------------
console.log('\n--- TEST 3: Safe-Integer Coordinates & Span Bounds ---');

let fracRejected = false;
try {
  receiver.retrieveByteSpan('src:covenant_text', 1.5, 5);
} catch (err) {
  if (err.code === 'INVALID_COORDINATES') fracRejected = true;
}
recordTest('Rejected fractional coordinate with INVALID_COORDINATES', fracRejected);

let nanRejected = false;
try {
  receiver.retrieveByteSpan('src:covenant_text', NaN, 5);
} catch (err) {
  if (err.code === 'INVALID_COORDINATES') nanRejected = true;
}
recordTest('Rejected NaN coordinate with INVALID_COORDINATES', nanRejected);

let outOfBoundsRejected = false;
try {
  receiver.retrieveByteSpan('src:covenant_text', 0, 9999);
} catch (err) {
  if (err.code === 'INVALID_SPAN') outOfBoundsRejected = true;
}
recordTest('Rejected out-of-bounds span with INVALID_SPAN', outOfBoundsRejected);

// Binary span readback is lossless and text decoding is refused (span_text: null)
const binSpan = receiver.retrieveByteSpan('src:raw_binary', 1, 4);
recordTest('Refused text decoding on BYTE_EVIDENCE span (span_text is null)', binSpan.span_text === null);
recordTest('Exact raw binary bytes roundtrip losslessly', Buffer.compare(binSpan.span_bytes, rawBinaryBytes.subarray(1, 4)) === 0);

// Text span readback
const textSpan = receiver.retrieveByteSpan('src:covenant_text', 0, 8);
recordTest('Text span correctly decoded', textSpan.span_text === 'Covenant');

// -------------------------------------------------------------
// 4. Source vs. Derivative Separation
// -------------------------------------------------------------
console.log('\n--- TEST 4: Source vs. Derivative Invariant ---');

const derivative = receiver.admitDerivative({
  derivativeId: 'der:covenant_extract',
  sourceId: 'src:covenant_text',
  extractionStatus: 'EXTRACTED_NATIVE_TEXT',
  extractedText: 'Extracted plain text view of covenant',
});
recordTest('Extracted derivative registered linking parent source', derivative.source_id === 'src:covenant_text');

let missingParentRejected = false;
try {
  receiver.admitDerivative({
    derivativeId: 'der:orphan',
    sourceId: 'src:nonexistent_source',
    extractionStatus: 'EXTRACTED_NATIVE_TEXT',
    extractedText: 'Orphan text',
  });
} catch (err) {
  if (err.code === 'PARENT_SOURCE_NOT_FOUND') missingParentRejected = true;
}
recordTest('Rejected derivative for nonexistent source with PARENT_SOURCE_NOT_FOUND', missingParentRejected);

// -------------------------------------------------------------
// 5. Work Route vs. Manifestation Invariant
// -------------------------------------------------------------
console.log('\n--- TEST 5: Work Route vs. Manifestation Invariant ---');

// Singleton work route
const singleWork = receiver.admitWorkRoute({
  workId: 'emwork_singleton_1',
  declaredTitle: 'First Work Singleton',
  identityStatus: 'SINGLETON_WORK_SURFACE',
  humanGateRequired: false,
});
recordTest('Singleton Work route admitted without human gate', singleWork.human_gate_required === false);

// Human-gated paired work route
const gatedWork = receiver.admitWorkRoute({
  workId: 'emwork_gated_pair_1',
  declaredTitle: 'Ambiguous Manifestation Pair',
  identityStatus: 'SAME_WORK_SUPPORTED',
  humanGateRequired: true,
  minContribution: 1,
  maxContribution: 2,
});
recordTest('Paired Work route admitted with human gate required', gatedWork.human_gate_required === true);

// Invalid identity status rejected
let invalidWorkRejected = false;
try {
  receiver.admitWorkRoute({
    workId: 'emwork_invalid',
    declaredTitle: 'Invalid',
    identityStatus: 'INVENTED_STATUS',
  });
} catch (err) {
  if (err.code === 'INVALID_WORK_IDENTITY_STATUS') invalidWorkRejected = true;
}
recordTest('Rejected invalid work identity status with INVALID_WORK_IDENTITY_STATUS', invalidWorkRejected);

// Link manifestation to work route
const manLink = receiver.linkManifestation({
  manifestationId: 'man:covenant_doc',
  workId: 'emwork_singleton_1',
  sourceId: 'src:covenant_text',
});
recordTest('Linked manifestation with cryptographic evidence hash', Boolean(manLink.link_evidence));

// -------------------------------------------------------------
// 6. Contextual Role vs. Intrinsic Prohibition
// -------------------------------------------------------------
console.log('\n--- TEST 6: Contextual Role vs. Intrinsic Prohibition ---');

const role = receiver.assertContextualRole({
  assertionId: 'role:pass1_entity',
  entityId: 'entity:hypervisor_01',
  compilerPass: 'pass:phase2_tomography',
  contextualRole: 'CONTROL_SETPOINT',
  scope: 'LOCAL_MODULE',
  intrinsicPromotion: false,
});
recordTest('Contextual role asserted with compiler-pass scoping', role.contextual_role === 'CONTROL_SETPOINT');

let intrinsicRejected = false;
try {
  receiver.assertContextualRole({
    assertionId: 'role:intrinsic_illegal',
    entityId: 'entity:hypervisor_01',
    compilerPass: 'pass:phase2_tomography',
    contextualRole: 'CONTROL_SETPOINT',
    intrinsicPromotion: true,
  });
} catch (err) {
  if (err.code === 'INTRINSIC_ROLE_PROMOTION_FORBIDDEN') intrinsicRejected = true;
}
recordTest('Rejected intrinsic role promotion with INTRINSIC_ROLE_PROMOTION_FORBIDDEN', intrinsicRejected);

// -------------------------------------------------------------
// 7. Grounded Relation with Cryptographic Span Proof
// -------------------------------------------------------------
console.log('\n--- TEST 7: Grounded Relations with Cryptographic Span Proof ---');

const spanProof = {
  source_id: 'src:covenant_text',
  start: 0,
  end: 8,
  span_sha256: textSpan.span_sha256,
  witnessed_text: 'Covenant',
};

const rel = receiver.admitRelation({
  relationId: 'rel:cov_to_bin',
  fromId: 'src:covenant_text',
  toId: 'src:raw_binary',
  relationType: 'HISTORICAL_CITATION',
  temporalClassification: 'PREEXISTING_OR_CONTEMPORANEOUS',
  warrantId: 'WARRANT_GROUNDED_SPAN_EVIDENCE',
  sourceCaptureSpanProof: spanProof,
});
recordTest('Admitted relation with cryptographic span proof', Boolean(rel.source_capture_span_proof.span_sha256));

let missingProofRejected = false;
try {
  receiver.admitRelation({
    relationId: 'rel:unproven',
    fromId: 'src:covenant_text',
    toId: 'src:raw_binary',
    relationType: 'HISTORICAL_CITATION',
    temporalClassification: 'PREEXISTING_OR_CONTEMPORANEOUS',
    warrantId: 'WARRANT_GROUNDED_SPAN_EVIDENCE',
    sourceCaptureSpanProof: null,
  });
} catch (err) {
  if (err.code === 'MISSING_SPAN_PROOF') missingProofRejected = true;
}
recordTest('Rejected relation missing span proof with MISSING_SPAN_PROOF', missingProofRejected);

receiver.close();

// Compile Receipt
const allPassed = testResults.every(t => t.passed);
const receipt = {
  schema: 'td613.em-receiver-receipt/v1',
  evaluated_at: new Date().toISOString(),
  receiver_schema: EM_RECEIVER_SCHEMA_V1,
  total_tests: testResults.length,
  passed_tests: testResults.filter(t => t.passed).length,
  failed_tests: testResults.filter(t => !t.passed).length,
  all_passed: allPassed,
  initial_state_witness: witness,
  test_census: testResults,
  governing_covenant: 'Khona\u200Clit-po',
  disposition: allPassed ? 'EM_EMPTY_RECEIVER_VERIFIED_CLEAN' : 'VERIFICATION_FAILED',
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log('\n================================================================');
console.log(`EM RECEIVER VERIFICATION COMPLETE. Receipt written to ${RECEIPT_PATH}`);
console.log(`Summary: ${receipt.passed_tests}/${receipt.total_tests} passed.`);
console.log('================================================================');

if (!allPassed) {
  process.exit(1);
}
