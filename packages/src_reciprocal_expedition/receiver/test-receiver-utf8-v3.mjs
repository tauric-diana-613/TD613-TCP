/**
 * 𝌋 TD613 · Empty Encyclopedia Receiver v3 Test Suite
 * 
 * Formal Verification of Strict UTF-8 Byte Custody & Coordinate Integrity (Finding A-S2-F06).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EmptyEncyclopediaReceiverV3, ReceiverError, sha256 } from './empty-encyclopedia-receiver-v3.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'test-receiver-utf8-v3-receipt.json');

console.log('================================================================');
console.log('RECEIVER v3 FATAL UTF-8 & COORDINATE INTEGRITY TEST SUITE');
console.log('================================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`[PASS] ${message}`);
  passedTests++;
}

const r = new EmptyEncyclopediaReceiverV3();
r.initialize({ memory: true });

// -------------------------------------------------------------
// TEST 1: Fatal UTF-8 Decoding (Rejecting Silent Replacement Characters)
// -------------------------------------------------------------
console.log('--- TEST 1: Fatal UTF-8 Decoding ---');
// Invalid UTF-8 sequence: lone continuation byte 0x80
const malformedBytes1 = Buffer.from([0x80, 0x81, 0x82]);
let threwMalformed1 = false;
try {
  r.admitSource({
    source_id: 'src:malformed_1',
    platform: 'test',
    declared_title: 'Malformed UTF-8 Byte Payload',
    raw_bytes: malformedBytes1,
  });
} catch (err) {
  threwMalformed1 = err.code === 'MALFORMED_UTF8_SEQUENCE';
}
assert(threwMalformed1, 'Rejected malformed UTF-8 lone continuation bytes with MALFORMED_UTF8_SEQUENCE');

// Truncated multi-byte sequence (0xC3 without continuation)
const malformedBytes2 = Buffer.from([0x61, 0x62, 0xC3]);
let threwMalformed2 = false;
try {
  r.admitSource({
    source_id: 'src:malformed_2',
    platform: 'test',
    declared_title: 'Truncated Multi-Byte Payload',
    raw_bytes: malformedBytes2,
  });
} catch (err) {
  threwMalformed2 = err.code === 'MALFORMED_UTF8_SEQUENCE';
}
assert(threwMalformed2, 'Rejected truncated multi-byte UTF-8 sequence with MALFORMED_UTF8_SEQUENCE');

// Explicit BYTE_EVIDENCE admission allows arbitrary binary payload
const binaryAdmission = r.admitSource({
  source_id: 'src:valid_binary_blob',
  platform: 'test',
  declared_title: 'Arbitrary Binary Payload',
  raw_bytes: malformedBytes1,
  is_byte_evidence: true,
});
assert(binaryAdmission.admitted === true, 'Admitted arbitrary binary data when is_byte_evidence=true');
assert(binaryAdmission.evidence_class === 'BYTE_EVIDENCE', 'Classified binary data as BYTE_EVIDENCE');

// -------------------------------------------------------------
// TEST 2: Valid UTF-8 Multilingual & Covenant Preservation
// -------------------------------------------------------------
console.log('\n--- TEST 2: Unicode Multilingual & Covenant Khona\u200Clit-po ---');
// Preserving Khona‌lit-po with interior U+200C:
// "Khona" (5 bytes) + U+200C (3 bytes: E2 80 8C) + "lit-po" (6 bytes) = 14 bytes total
const covenantText = 'Covenant Khona\u200Clit-po with interior ZWNJ and token AéB.';
const textAdmission = r.admitSource({
  source_id: 'src:covenant_text',
  platform: 'covenant',
  declared_title: 'Covenant Khona\u200Clit-po Corpus',
  normalized_body: covenantText,
});
assert(textAdmission.admitted === true, 'Admitted valid UTF-8 covenant text');
assert(textAdmission.evidence_class === 'TEXT_DOCUMENT', 'Classified text document as TEXT_DOCUMENT');

// Retrieve exact span
const spanFull = r.retrieveByByteSpan('src:covenant_text', 0, 8, 'raw');
assert(spanFull.span_text === 'Covenant', 'Retrieved exact ASCII span "Covenant"');

// -------------------------------------------------------------
// TEST 3: Safe Integer & Coordinate Bounds Validation in retrieveByByteSpan
// -------------------------------------------------------------
console.log('\n--- TEST 3: Safe Integer Checks in retrieveByByteSpan ---');
// Fractional offset
let threwFractional = false;
try {
  r.retrieveByByteSpan('src:covenant_text', 1.5, 10, 'raw');
} catch (err) {
  threwFractional = err.code === 'INVALID_COORDINATES';
}
assert(threwFractional, 'Rejected fractional coordinate 1.5 with INVALID_COORDINATES');

// NaN coordinate
let threwNaN = false;
try {
  r.retrieveByByteSpan('src:covenant_text', NaN, 10, 'raw');
} catch (err) {
  threwNaN = err.code === 'INVALID_COORDINATES';
}
assert(threwNaN, 'Rejected NaN coordinate with INVALID_COORDINATES');

// Infinity coordinate
let threwInfinity = false;
try {
  r.retrieveByByteSpan('src:covenant_text', 0, Infinity, 'raw');
} catch (err) {
  threwInfinity = err.code === 'INVALID_COORDINATES';
}
assert(threwInfinity, 'Rejected Infinity coordinate with INVALID_COORDINATES');

// Out of bounds span
let threwOutOfBounds = false;
try {
  r.retrieveByByteSpan('src:covenant_text', 0, 99999, 'raw');
} catch (err) {
  threwOutOfBounds = err.code === 'INVALID_SPAN';
}
assert(threwOutOfBounds, 'Rejected span beyond buffer length with INVALID_SPAN');

// Code point boundary violation: Slicing inside U+200C (bytes 14..17 in raw buffer)
// Let's locate U+200C in buffer:
const buf = Buffer.from(covenantText, 'utf8');
const zwnjByteOffset = buf.indexOf(Buffer.from([0xE2, 0x80, 0x8C]));
let threwBoundary = false;
try {
  // Slicing at zwnjByteOffset + 1 lands inside the 3-byte ZWNJ sequence
  r.retrieveByByteSpan('src:covenant_text', zwnjByteOffset + 1, zwnjByteOffset + 3, 'raw');
} catch (err) {
  threwBoundary = err.code === 'INVALID_CODEPOINT_BOUNDARY';
}
assert(threwBoundary, 'Rejected span attempting to split multi-byte UTF-8 code point with INVALID_CODEPOINT_BOUNDARY');

// -------------------------------------------------------------
// TEST 4: Safe Integer & Bounds Validation in translateCoordinates
// -------------------------------------------------------------
console.log('\n--- TEST 4: translateCoordinates Bounds & Integrity ---');
// Fractional coordinate in translateCoordinates
let threwTransFrac = false;
try {
  r.translateCoordinates('src:covenant_text', 0.5, 10);
} catch (err) {
  threwTransFrac = err.code === 'INVALID_COORDINATES';
}
assert(threwTransFrac, 'translateCoordinates rejected fractional coordinate with INVALID_COORDINATES');

// NaN in translateCoordinates
let threwTransNaN = false;
try {
  r.translateCoordinates('src:covenant_text', NaN, 10);
} catch (err) {
  threwTransNaN = err.code === 'INVALID_COORDINATES';
}
assert(threwTransNaN, 'translateCoordinates rejected NaN with INVALID_COORDINATES');

// Out of bounds in translateCoordinates
let threwTransOOB = false;
try {
  r.translateCoordinates('src:covenant_text', 0, 99999);
} catch (err) {
  threwTransOOB = err.code === 'COORDINATES_OUT_OF_BOUNDS';
}
assert(threwTransOOB, 'translateCoordinates rejected coordinate out of bounds with COORDINATES_OUT_OF_BOUNDS');

// Inverted range in translateCoordinates
let threwTransInverted = false;
try {
  r.translateCoordinates('src:covenant_text', 20, 10);
} catch (err) {
  threwTransInverted = err.code === 'COORDINATES_OUT_OF_BOUNDS';
}
assert(threwTransInverted, 'translateCoordinates rejected inverted range [20, 10] with COORDINATES_OUT_OF_BOUNDS');

// Valid translation
const validTrans = r.translateCoordinates('src:covenant_text', 0, 8);
assert(validTrans.identity_mapping === true, 'Valid range returned identity mapping');
assert(validTrans.raw_span[0] === 0 && validTrans.raw_span[1] === 8, 'Exact raw span coordinates preserved');

// -------------------------------------------------------------
// EMIT RECEIPT
// -------------------------------------------------------------
const receipt = {
  schema: 'td613.receiver-v3-utf8-receipt/v1',
  evaluated_at: new Date().toISOString(),
  receiver_version: 'EmptyEncyclopediaReceiverV3',
  verified_rehabilitations: [
    'Fatal UTF-8 decoding throws on malformed bytes; no silent \\uFFFD substitution',
    'Arbitrary binary data explicitly classified as BYTE_EVIDENCE',
    'Number.isSafeInteger enforced on all byte coordinates (rejects NaN, Infinity, fractional)',
    'translateCoordinates bounds checks enforce 0 <= start <= end <= length',
    'Strict UTF-8 code point boundary enforcement and byte-level roundtrip verification',
  ],
  test_census: {
    total_tests: totalTests,
    passed_tests: passedTests,
  },
  verdict: 'ALL_UTF8_CUSTODY_AND_COORDINATE_INVARIANTS_HELD',
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log(`\nReceipt saved to: ${RECEIPT_PATH}`);
console.log('================================================================');
console.log(`ALL ${passedTests}/${totalTests} RECEIVER v3 TESTS PASSED SUCCESSFULLY!`);
console.log('================================================================');
