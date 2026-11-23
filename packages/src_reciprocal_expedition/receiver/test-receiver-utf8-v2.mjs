/**
 * Adversarial Unicode & UTF-8 Byte Coordinate Test Suite for Receiver v2
 * 
 * Verifies that empty-encyclopedia-receiver-v2.mjs resolves Review Finding F03:
 * - Direct counterexample 1: 'AéB' (4 UTF-8 bytes vs 3 UTF-16 code units)
 * - Direct counterexample 2: 'Khona‌lit-po' with literal interior U+200C (14 UTF-8 bytes vs 12 UTF-16 code units)
 * - Combining characters (e + \u0301)
 * - Supplementary plane 4-byte characters ('𝌋' U+1D30B)
 * - ASCII control characters
 * - Multilingual text (Cyrillic, Greek, Arabic, CJK)
 * - Long bodies crossing chunk boundaries without splitting multi-byte characters
 * - Boundary rejection for improper code-point splits
 * - Coordinate divergence tracking for NFD vs NFC inputs
 * - Cryptographic roundtrip byte integrity
 */

import { EmptyEncyclopediaReceiverV2, sha256 } from './empty-encyclopedia-receiver-v2.mjs';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'test-receiver-utf8-v2-receipt.json');

console.log('================================================================');
console.log('ADVERSARIAL UNICODE & UTF-8 BYTE-SPAN TEST SUITE (RECEIVER V2)');
console.log('================================================================\n');

const receiver = new EmptyEncyclopediaReceiverV2();
receiver.initialize({ memory: true });

const results = [];

function recordTest(testId, description, status, details = {}) {
  results.push({ test_id: testId, description, status, details, timestamp: new Date().toISOString() });
  console.log(`[${testId}] ${description}`);
  console.log(`  -> ${status}: ${JSON.stringify(details)}\n`);
}

// -------------------------------------------------------------
// TEST 1: Direct Counterexample 1 - 'AéB'
// UTF-8 bytes: [0x41, 0xC3, 0xA9, 0x42] (length: 4)
// UTF-16 length: 3 ('A', 'é', 'B')
// -------------------------------------------------------------
try {
  const text = 'AéB';
  const buf = Buffer.from(text, 'utf8');
  assert.strictEqual(buf.length, 4, 'AéB must be 4 UTF-8 bytes');
  assert.strictEqual(text.length, 3, 'AéB must be 3 UTF-16 code units');

  const adm = receiver.admitSource({
    source_id: 'doc:counterexample_ae_b',
    platform: 'test_synthetic',
    declared_title: 'Counterexample AéB',
    normalized_body: text,
  });

  assert.strictEqual(adm.raw_byte_length, 4);

  // Exact retrieval of 'A': byte interval [0, 1)
  const spanA = receiver.retrieveByByteSpan('doc:counterexample_ae_b', 0, 1);
  assert.strictEqual(spanA.span_text, 'A');
  assert.strictEqual(spanA.byte_length, 1);

  // Exact retrieval of 'é': byte interval [1, 3) (2 bytes: 0xC3, 0xA9)
  // In v1, slice(1, 3) returned 'éB'!
  const spanE = receiver.retrieveByByteSpan('doc:counterexample_ae_b', 1, 3);
  assert.strictEqual(spanE.span_text, 'é', 'Byte interval [1, 3) must decode strictly to "é", not "éB"');
  assert.strictEqual(spanE.byte_length, 2);

  // Exact retrieval of 'B': byte interval [3, 4)
  const spanB = receiver.retrieveByByteSpan('doc:counterexample_ae_b', 3, 4);
  assert.strictEqual(spanB.span_text, 'B');
  assert.strictEqual(spanB.byte_length, 1);

  // Invalid boundary: interval [1, 2) splits 0xC3 and 0xA9!
  let invalidBoundaryCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:counterexample_ae_b', 1, 2);
  } catch (err) {
    if (err.code === 'INVALID_CODEPOINT_BOUNDARY') {
      invalidBoundaryCaught = true;
    }
  }
  assert.ok(invalidBoundaryCaught, 'Interval [1, 2) must be rejected with INVALID_CODEPOINT_BOUNDARY');

  recordTest('TEST_01_AE_B_COUNTEREXAMPLE', 'AéB exact byte intervals vs string slices', 'PASS', {
    raw_byte_length: 4,
    code_unit_length: 3,
    span_A: spanA.span_text,
    span_E_exact: spanE.span_text,
    span_B: spanB.span_text,
    invalid_split_rejected: true,
  });
} catch (e) {
  recordTest('TEST_01_AE_B_COUNTEREXAMPLE', 'AéB exact byte intervals vs string slices', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 2: Direct Counterexample 2 - Canonical Covenant String 'Khona‌lit-po'
// Contains literal U+200C ZERO WIDTH NON-JOINER
// In UTF-8:
// 'Khona' = 5 bytes (0..5)
// '\u200C' = 3 bytes: 0xE2 0x80 0x8C (bytes 5..8)
// 'lit-po' = 6 bytes (bytes 8..14)
// Total UTF-8 byte length: 14 bytes
// String length (UTF-16): 12 code units
// -------------------------------------------------------------
try {
  const covenantText = 'Khona\u200Clit-po';
  const covBuf = Buffer.from(covenantText, 'utf8');
  assert.strictEqual(covBuf.length, 14, 'Khona‌lit-po must be 14 UTF-8 bytes');
  assert.strictEqual(covenantText.length, 12, 'Khona‌lit-po must be 12 UTF-16 code units');

  const adm = receiver.admitSource({
    source_id: 'doc:covenant_khonalit_po',
    platform: 'covenant_custody',
    declared_title: 'Covenant Khona‌lit-po Canonical String',
    normalized_body: covenantText,
  });

  assert.strictEqual(adm.raw_byte_length, 14);

  // Retrieve prefix 'Khona' [0, 5)
  const spanPrefix = receiver.retrieveByByteSpan('doc:covenant_khonalit_po', 0, 5);
  assert.strictEqual(spanPrefix.span_text, 'Khona');

  // Retrieve isolated U+200C [5, 8) (3 bytes)
  const spanZwnj = receiver.retrieveByByteSpan('doc:covenant_khonalit_po', 5, 8);
  assert.strictEqual(spanZwnj.span_text, '\u200C');
  assert.strictEqual(spanZwnj.byte_length, 3);
  assert.strictEqual(spanZwnj.span_bytes_sha256, sha256(Buffer.from([0xE2, 0x80, 0x8C])));

  // Retrieve suffix 'lit-po' [8, 14)
  const spanSuffix = receiver.retrieveByByteSpan('doc:covenant_khonalit_po', 8, 14);
  assert.strictEqual(spanSuffix.span_text, 'lit-po');

  // Invalid split: [5, 7) splits the 3-byte sequence [0xE2, 0x80, 0x8C]
  let zwnjSplitCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:covenant_khonalit_po', 5, 7);
  } catch (err) {
    if (err.code === 'INVALID_CODEPOINT_BOUNDARY') {
      zwnjSplitCaught = true;
    }
  }
  assert.ok(zwnjSplitCaught, 'Splitting U+200C at byte 7 must be rejected');

  recordTest('TEST_02_COVENANT_KHONALIT_PO', 'Khona‌lit-po U+200C 3-byte custody', 'PASS', {
    total_bytes: 14,
    zwnj_byte_span: [5, 8],
    zwnj_bytes_hex: 'e2808c',
    zwnj_split_rejected: true,
  });
} catch (e) {
  recordTest('TEST_02_COVENANT_KHONALIT_PO', 'Khona‌lit-po U+200C 3-byte custody', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 3: Supplementary Plane Character - Tetragram '𝌋' (U+1D30B)
// UTF-8 bytes: 4 bytes [0xF0, 0x9D, 0x8C, 0x8B]
// UTF-16: surrogate pair of 2 code units (\uD834\uDF0B)
// -------------------------------------------------------------
try {
  const tetraText = 'Seal: 𝌋 Marker';
  const tetraBuf = Buffer.from(tetraText, 'utf8');
  // 'Seal: ' = 6 bytes [0..6)
  // '𝌋' = 4 bytes [6..10)
  // ' Marker' = 7 bytes [10..17)
  assert.strictEqual(tetraBuf.length, 17);

  receiver.admitSource({
    source_id: 'doc:supplementary_tetragram',
    platform: 'astronomy_seal',
    declared_title: 'Tetragram Seal',
    normalized_body: tetraText,
  });

  const spanTetra = receiver.retrieveByByteSpan('doc:supplementary_tetragram', 6, 10);
  assert.strictEqual(spanTetra.span_text, '𝌋');
  assert.strictEqual(spanTetra.byte_length, 4);

  // Reject middle of surrogate/4-byte sequence [6, 8)
  let tetraSplitCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:supplementary_tetragram', 6, 8);
  } catch (err) {
    if (err.code === 'INVALID_CODEPOINT_BOUNDARY') tetraSplitCaught = true;
  }
  assert.ok(tetraSplitCaught);

  recordTest('TEST_03_SUPPLEMENTARY_TETRAGRAM', 'Supplementary plane 4-byte character custody', 'PASS', {
    tetra_span: [6, 10],
    tetra_text: spanTetra.span_text,
    surrogate_split_rejected: true,
  });
} catch (e) {
  recordTest('TEST_03_SUPPLEMENTARY_TETRAGRAM', 'Supplementary plane 4-byte character custody', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 4: Combining Marks (NFD Decomposition)
// 'e' (1 byte) + '\u0301' (COMBINING ACUTE ACCENT, 2 bytes: 0xCC 0x81)
// Total 3 bytes for visual 'é'
// -------------------------------------------------------------
try {
  const combiningText = 'e\u0301';
  const combBuf = Buffer.from(combiningText, 'utf8');
  assert.strictEqual(combBuf.length, 3);
  assert.strictEqual(combBuf[0], 0x65); // 'e'
  assert.strictEqual(combBuf[1], 0xCC); // combining acute lead
  assert.strictEqual(combBuf[2], 0x81); // combining acute continuation

  receiver.admitSource({
    source_id: 'doc:combining_mark',
    platform: 'linguistics',
    declared_title: 'Combining Acute Accent',
    raw_bytes: combBuf,
    normalized_body: combiningText,
    normalization_form: null, // preserve raw NFD
  });

  const spanBase = receiver.retrieveByByteSpan('doc:combining_mark', 0, 1);
  assert.strictEqual(spanBase.span_text, 'e');

  const spanMark = receiver.retrieveByByteSpan('doc:combining_mark', 1, 3);
  assert.strictEqual(spanMark.span_text, '\u0301');

  // Reject splitting combining mark byte 1 and 2
  let combSplitCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:combining_mark', 1, 2);
  } catch (err) {
    if (err.code === 'INVALID_CODEPOINT_BOUNDARY') combSplitCaught = true;
  }
  assert.ok(combSplitCaught);

  recordTest('TEST_04_COMBINING_MARKS', 'Combining marks explicit byte separation', 'PASS', {
    base_span: [0, 1],
    mark_span: [1, 3],
    mark_split_rejected: true,
  });
} catch (e) {
  recordTest('TEST_04_COMBINING_MARKS', 'Combining marks explicit byte separation', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 5: Multilingual Text Custody
// Cyrillic ('Таврида'), Greek ('Ταῦροι'), Arabic ('سلام'), CJK ('百科全书')
// -------------------------------------------------------------
try {
  const multiText = 'Cyrillic: Таврида | Greek: Ταῦροι | Arabic: سلام | CJK: 百科全书';
  const multiBuf = Buffer.from(multiText, 'utf8');

  receiver.admitSource({
    source_id: 'doc:multilingual_corpus',
    platform: 'multilingual_archive',
    declared_title: 'Multilingual Evidence Corpus',
    normalized_body: multiText,
  });

  // Search CJK entity
  const searchRes = receiver.searchEntities('百科全书');
  assert.ok(searchRes.total_matches > 0);

  // Retrieve exact Cyrillic 'Таврида'
  const cyrillicStart = multiBuf.indexOf(Buffer.from('Таврида', 'utf8'));
  const cyrillicEnd = cyrillicStart + Buffer.byteLength('Таврида', 'utf8');
  const spanCyrillic = receiver.retrieveByByteSpan('doc:multilingual_corpus', cyrillicStart, cyrillicEnd);
  assert.strictEqual(spanCyrillic.span_text, 'Таврида');

  // Retrieve exact Arabic 'سلام'
  const arabicStart = multiBuf.indexOf(Buffer.from('سلام', 'utf8'));
  const arabicEnd = arabicStart + Buffer.byteLength('سلام', 'utf8');
  const spanArabic = receiver.retrieveByByteSpan('doc:multilingual_corpus', arabicStart, arabicEnd);
  assert.strictEqual(spanArabic.span_text, 'سلام');

  recordTest('TEST_05_MULTILINGUAL_CORPUS', 'Multilingual scripts exact byte offsets', 'PASS', {
    cyrillic_bytes: [cyrillicStart, cyrillicEnd],
    arabic_bytes: [arabicStart, arabicEnd],
    cjk_search_matched: true,
  });
} catch (e) {
  recordTest('TEST_05_MULTILINGUAL_CORPUS', 'Multilingual scripts exact byte offsets', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 6: Long Bodies & Chunk Boundary Multi-byte Integrity
// Deliberately position a 3-byte or 4-byte character exactly across chunk_byte_size
// -------------------------------------------------------------
try {
  // Construct text where a 4-byte '𝌋' would cross a boundary if split naively
  // chunk_byte_size = 30.
  // 28 ASCII bytes ('A' x 28) + '𝌋' (4 bytes: 28..32) + 'B' x 28
  const longText = 'A'.repeat(28) + '𝌋' + 'B'.repeat(28);
  const adm = receiver.admitSource({
    source_id: 'doc:chunk_boundary_torture',
    platform: 'boundary_test',
    declared_title: 'Boundary Torture Corpus',
    normalized_body: longText,
    chunk_byte_size: 30,
  });

  // Chunks must NOT split the '𝌋' character!
  // Chunk 0 must end either at 28 or 32 (advancing to complete the code point)
  const chunks = receiver.db.prepare('SELECT * FROM chunks WHERE capture_id = ? ORDER BY ordinal ASC').all(adm.capture_id);
  assert.ok(chunks.length >= 2);

  for (const chk of chunks) {
    const chkBuf = Buffer.from(chk.text_span, 'utf8');
    assert.strictEqual(chkBuf.length, chk.byte_length);
    assert.strictEqual(sha256(chkBuf), chk.span_bytes_sha256);
  }

  // The '𝌋' was kept intact in one chunk
  const chunkWithTetra = chunks.find(c => c.text_span.includes('𝌋'));
  assert.ok(chunkWithTetra, '𝌋 must be fully preserved in a chunk without truncation');

  recordTest('TEST_06_CHUNK_BOUNDARY_INTEGRITY', 'Chunk boundary code point split prevention', 'PASS', {
    chunk_count: chunks.length,
    chunk_0_bytes: [chunks[0].byte_start, chunks[0].byte_end],
    chunk_1_bytes: [chunks[1].byte_start, chunks[1].byte_end],
  });
} catch (e) {
  recordTest('TEST_06_CHUNK_BOUNDARY_INTEGRITY', 'Chunk boundary code point split prevention', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 7: Empty Body Capture
// -------------------------------------------------------------
try {
  const admEmpty = receiver.admitSource({
    source_id: 'doc:empty_body',
    platform: 'empty_manifest',
    declared_title: 'Empty Document',
    normalized_body: '',
  });

  assert.strictEqual(admEmpty.raw_byte_length, 0);
  assert.strictEqual(admEmpty.chunk_count, 0);

  recordTest('TEST_07_EMPTY_BODY', 'Zero-length body capture handling', 'PASS', {
    chunk_count: 0,
    raw_byte_length: 0,
  });
} catch (e) {
  recordTest('TEST_07_EMPTY_BODY', 'Zero-length body capture handling', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 8: Invalid Range & Negative Bounds Rejection
// -------------------------------------------------------------
try {
  let negativeStartCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:counterexample_ae_b', -1, 2);
  } catch (err) {
    if (err.code === 'INVALID_SPAN') negativeStartCaught = true;
  }
  assert.ok(negativeStartCaught);

  let endExceedsCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:counterexample_ae_b', 0, 100);
  } catch (err) {
    if (err.code === 'INVALID_SPAN') endExceedsCaught = true;
  }
  assert.ok(endExceedsCaught);

  let invertedRangeCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:counterexample_ae_b', 3, 1);
  } catch (err) {
    if (err.code === 'INVALID_SPAN') invertedRangeCaught = true;
  }
  assert.ok(invertedRangeCaught);

  recordTest('TEST_08_INVALID_RANGES', 'Range bounds validation', 'PASS', {
    negative_start_caught: true,
    out_of_bounds_caught: true,
    inverted_range_caught: true,
  });
} catch (e) {
  recordTest('TEST_08_INVALID_RANGES', 'Range bounds validation', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 9: ASCII Controls Handling
// -------------------------------------------------------------
try {
  const asciiControls = 'Control\x00Null\x07Bell\tTab\nNewline\rCR';
  const ctlBuf = Buffer.from(asciiControls, 'utf8');

  receiver.admitSource({
    source_id: 'doc:ascii_controls',
    platform: 'system_log',
    declared_title: 'ASCII Controls Test',
    normalized_body: asciiControls,
  });

  const spanNull = receiver.retrieveByByteSpan('doc:ascii_controls', 7, 8);
  assert.strictEqual(spanNull.span_text, '\x00');
  assert.strictEqual(spanNull.byte_length, 1);

  recordTest('TEST_09_ASCII_CONTROLS', 'ASCII control characters byte custody', 'PASS', {
    null_byte_span: [7, 8],
    null_retrieved: true,
  });
} catch (e) {
  recordTest('TEST_09_ASCII_CONTROLS', 'ASCII control characters byte custody', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 10: Coordinate Divergence - NFD vs NFC Normalization
// Original raw bytes in NFD ('e\u0301', 3 bytes) vs normalized NFC ('é', 2 bytes)
// Receiver tracks coordinate divergence and refuses unsupported coordinate translation
// -------------------------------------------------------------
try {
  const nfdText = 'e\u0301'; // 3 bytes
  const nfcText = nfdText.normalize('NFC'); // 'é', 2 bytes

  const admDiverged = receiver.admitSource({
    source_id: 'doc:diverged_normalization',
    platform: 'unicode_standard',
    declared_title: 'Diverged Normalization Document',
    raw_bytes: Buffer.from(nfdText, 'utf8'),
    normalized_body: nfcText,
    normalization_form: 'NFC',
  });

  assert.strictEqual(admDiverged.raw_byte_length, 3);
  assert.strictEqual(admDiverged.normalized_byte_length, 2);
  assert.strictEqual(admDiverged.coordinates_diverged, true);

  // Retrieve raw span: [0, 3) gives 3 bytes
  const rawSpan = receiver.retrieveByByteSpan('doc:diverged_normalization', 0, 3, { target: 'raw' });
  assert.strictEqual(rawSpan.byte_length, 3);
  assert.strictEqual(rawSpan.span_text, nfdText);

  // Retrieve normalized span: [0, 2) gives 2 bytes
  const normSpan = receiver.retrieveByByteSpan('doc:diverged_normalization', 0, 2, { target: 'normalized' });
  assert.strictEqual(normSpan.byte_length, 2);
  assert.strictEqual(normSpan.span_text, nfcText);

  // Translation between diverged coordinates without explicit map is refused
  let transRefused = false;
  try {
    receiver.translateCoordinates('doc:diverged_normalization', 0, 3);
  } catch (err) {
    if (err.code === 'COORDINATE_TRANSLATION_UNSUPPORTED') transRefused = true;
  }
  assert.ok(transRefused);

  recordTest('TEST_10_COORDINATE_DIVERGENCE', 'NFD raw vs NFC normalized coordinate custody', 'PASS', {
    raw_byte_len: 3,
    normalized_byte_len: 2,
    coordinates_diverged: true,
    unsupported_translation_refused: true,
  });
} catch (e) {
  recordTest('TEST_10_COORDINATE_DIVERGENCE', 'NFD raw vs NFC normalized coordinate custody', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 11: Duplicate Body Detection with Different Carrier Identities
// -------------------------------------------------------------
try {
  const admCarrierA = receiver.admitSource({
    source_id: 'doc:carrier_alpha',
    platform: 'carrier_network_1',
    declared_title: 'Duplicate Content Alpha',
    normalized_body: 'Identical body payload across distinct carriers.',
  });
  assert.strictEqual(admCarrierA.identical_body_detected, false);

  const admCarrierB = receiver.admitSource({
    source_id: 'doc:carrier_beta',
    platform: 'carrier_network_2',
    declared_title: 'Duplicate Content Beta',
    normalized_body: 'Identical body payload across distinct carriers.',
  });
  assert.strictEqual(admCarrierB.identical_body_detected, true);
  assert.strictEqual(admCarrierB.ancestral_lineage_refused, true);

  recordTest('TEST_11_DUPLICATE_BODY_CARRIER_ISOLATION', 'Duplicate body detected across distinct carriers', 'PASS', {
    carrier_a_id: 'doc:carrier_alpha',
    carrier_b_id: 'doc:carrier_beta',
    identical_body_detected: true,
    ancestral_lineage_refused: true,
  });
} catch (e) {
  recordTest('TEST_11_DUPLICATE_BODY_CARRIER_ISOLATION', 'Duplicate body detected across distinct carriers', 'FAIL', { error: e.message });
  throw e;
}

// -------------------------------------------------------------
// TEST 12: Source Identity & Version Verification on Evidence Spans
// -------------------------------------------------------------
try {
  const span = receiver.retrieveByByteSpan('doc:counterexample_ae_b', 1, 3);
  assert.strictEqual(span.source_id, 'doc:counterexample_ae_b');
  assert.ok(span.capture_id.startsWith('cap-'));
  assert.strictEqual(span.verified, true);

  // Attempting retrieval on unknown source
  let notFoundCaught = false;
  try {
    receiver.retrieveByByteSpan('doc:non_existent_source', 0, 1);
  } catch (err) {
    if (err.code === 'SOURCE_NOT_FOUND') notFoundCaught = true;
  }
  assert.ok(notFoundCaught);

  recordTest('TEST_12_SOURCE_IDENTITY_VERIFICATION', 'Evidence span source and capture verification', 'PASS', {
    verified: span.verified,
    capture_id_present: true,
    non_existent_source_rejected: true,
  });
} catch (e) {
  recordTest('TEST_12_SOURCE_IDENTITY_VERIFICATION', 'Evidence span source and capture verification', 'FAIL', { error: e.message });
  throw e;
}

// Write machine receipt
const receipt = {
  schema: 'td613.test-receiver-utf8-v2-receipt/v1',
  generated_at: new Date().toISOString(),
  test_count: results.length,
  all_passed: results.every(r => r.status === 'PASS'),
  results,
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');

console.log('================================================================');
console.log(`ALL ${results.length} ADVERSARIAL UNICODE & UTF-8 TESTS PASSED`);
console.log(`Receipt saved to: ${RECEIPT_PATH}`);
console.log('================================================================');
receiver.close();
