/**
 * Test Suite for TD613 Empty Encyclopedia Receiver
 * 
 * Verifies all receiver contracts on source-free fixtures:
 * 1. Demonstrable 0-state & initial-state witness
 * 2. First admission & span indexing
 * 3. Multiple related admissions
 * 4. Duplicate source refusal
 * 5. Deliberate duplicate body detection & ancestral refusal
 * 6. Unsupported graph link (missing endpoint) refusal
 * 7. Duplicate relation refusal
 * 8. Byte-span retrieval & hash verification
 * 9. Grounded search
 * 10. Native method registration, invocation, readback & return package
 * 11. Complete failed operations log preservation
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EmptyEncyclopediaReceiver, ReceiverError, sha256 } from './empty-encyclopedia-receiver.mjs';
import { runProjectiveRouting } from '../native_atlas/src-native-methods.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('TEST SUITE: INDEPENDENTLY EMPTY ENCYCLOPEDIA RECEIVER');
console.log('================================================================\n');

function assert(condition, message) {
  if (!condition) {
    throw new Error(`TEST_ASSERTION_FAILED: ${message}`);
  }
}

const testResults = [];

// 1. TEST_EMPTY_STATE
console.log('[TEST 1] Verifying Demonstrable 0-State & Initial-State Witness...');
const dbPath = path.resolve(__dirname, 'test-scratch-receiver.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const receiver = new EmptyEncyclopediaReceiver(dbPath);
const witness = receiver.initialize({ memory: false });

assert(witness.initial_counts.sources === 0, 'Sources count must be 0');
assert(witness.initial_counts.captures === 0, 'Captures count must be 0');
assert(witness.initial_counts.chunks === 0, 'Chunks count must be 0');
assert(witness.initial_counts.relations === 0, 'Relations count must be 0');
assert(witness.witness_sha256 && witness.witness_sha256.length === 64, 'Witness hash must be 64-char sha256');

testResults.push({ test: 1, name: 'DEMONSTRABLE_ZERO_STATE', status: 'PASS', witness });
console.log('  -> PASS: 0-state confirmed with cryptographic initial witness.\n');

// 2. TEST_FIRST_ADMISSION
console.log('[TEST 2] Testing First Admission & Span Indexing...');
const adm1 = receiver.admitSource({
  source_id: 'rec:source:001',
  canonical_url: 'https://zenodo.org/record/001',
  platform: 'zenodo',
  declared_title: 'Projective Traversal Coordinates and Dual Gradients',
  created_at: '2026-08-10T10:00:00Z',
  normalized_body: 'This is the first admitted body text. Explore Second Specimen Coordinates. In semantic space.',
});

assert(adm1.admitted === true, 'Admission 1 must succeed');
assert(adm1.chunk_count > 0, 'Chunks must be generated');
const countsAfterAdm1 = receiver.getCounts();
assert(countsAfterAdm1.sources === 1, 'Sources count must be 1');
assert(countsAfterAdm1.captures === 1, 'Captures count must be 1');

testResults.push({ test: 2, name: 'FIRST_ADMISSION_AND_SPAN_INDEXING', status: 'PASS', adm1 });
console.log('  -> PASS: First admission succeeded, chunks indexed.\n');

// 3. TEST_MULTIPLE_RELATED_ADMISSIONS
console.log('[TEST 3] Testing Multiple Related Admissions...');
const adm2 = receiver.admitSource({
  source_id: 'rec:source:002',
  canonical_url: 'https://zenodo.org/record/002',
  platform: 'zenodo',
  declared_title: 'Second Specimen Coordinates and Traversal',
  created_at: '2026-08-12T14:00:00Z',
  normalized_body: 'Second admitted text body with genuine topological markers.',
});
assert(adm2.admitted === true, 'Admission 2 must succeed');

// Register relation between 001 and 002
const rel1 = receiver.registerRelation({
  from_source_id: 'rec:source:001',
  to_source_id: 'rec:source:002',
  relation_type: 'PROJECTIVE_EXPLORE_LINK',
  evidence_class: 'QUALIFIED_WITNESS',
});
assert(rel1.registered === true, 'Relation registration must succeed');
assert(receiver.getCounts().relations === 1, 'Relations count must be 1');

testResults.push({ test: 3, name: 'MULTIPLE_RELATED_ADMISSIONS', status: 'PASS', rel1 });
console.log('  -> PASS: Related admission and relation registered.\n');

// 4. TEST_DUPLICATE_SOURCE_REFUSAL
console.log('[TEST 4] Testing Duplicate Source ID Refusal...');
let dupRefused = false;
try {
  receiver.admitSource({
    source_id: 'rec:source:001', // Already exists!
    platform: 'zenodo',
    declared_title: 'Duplicate Source Attempt',
    normalized_body: 'Different body but duplicate ID.',
  });
} catch (err) {
  if (err.code === 'DUPLICATE_SOURCE_REFUSED') {
    dupRefused = true;
  }
}
assert(dupRefused, 'Duplicate source ID must be refused with DUPLICATE_SOURCE_REFUSED');

testResults.push({ test: 4, name: 'DUPLICATE_SOURCE_REFUSAL', status: 'PASS' });
console.log('  -> PASS: Duplicate source ID rejected as expected.\n');

// 5. TEST_DELIBERATE_DUPLICATE_BODY
console.log('[TEST 5] Testing Deliberate Duplicate Body Detection...');
const adm3DupBody = receiver.admitSource({
  source_id: 'rec:source:003_mirror',
  platform: 'github',
  declared_title: 'Mirror Copy of Source 001 Body',
  created_at: '2026-08-14T08:00:00Z',
  normalized_body: 'This is the first admitted body text. Explore Second Specimen Coordinates. In semantic space.', // Exact body from source 001!
});

assert(adm3DupBody.identical_body_detected === true, 'Must detect identical normalized body');
assert(adm3DupBody.ancestral_lineage_refused === true, 'Must refuse ancestral independence claim');

testResults.push({ test: 5, name: 'DELIBERATE_DUPLICATE_BODY_DETECTION', status: 'PASS', adm3DupBody });
console.log('  -> PASS: Duplicate body detected, ancestral independence refused.\n');

// 6. TEST_UNSUPPORTED_GRAPH_LINK
console.log('[TEST 6] Testing Unsupported Graph Link (Missing Endpoint Refusal)...');
let missingEndpointRefused = false;
try {
  receiver.registerRelation({
    from_source_id: 'rec:source:001',
    to_source_id: 'rec:source:MISSING_NONEXISTENT',
    relation_type: 'PROJECTIVE_EXPLORE_LINK',
  });
} catch (err) {
  if (err.code === 'UNSUPPORTED_GRAPH_LINK') {
    missingEndpointRefused = true;
  }
}
assert(missingEndpointRefused, 'Missing endpoint must be refused with UNSUPPORTED_GRAPH_LINK');

testResults.push({ test: 6, name: 'UNSUPPORTED_GRAPH_LINK_REFUSAL', status: 'PASS' });
console.log('  -> PASS: Missing endpoint relation registration rejected.\n');

// 7. TEST_DUPLICATE_RELATION_REFUSAL
console.log('[TEST 7] Testing Duplicate Relation Refusal...');
let dupRelRefused = false;
try {
  receiver.registerRelation({
    from_source_id: 'rec:source:001',
    to_source_id: 'rec:source:002',
    relation_type: 'PROJECTIVE_EXPLORE_LINK', // already registered!
  });
} catch (err) {
  if (err.code === 'DUPLICATE_RELATION_REFUSED') {
    dupRelRefused = true;
  }
}
assert(dupRelRefused, 'Duplicate relation must be refused with DUPLICATE_RELATION_REFUSED');

testResults.push({ test: 7, name: 'DUPLICATE_RELATION_REFUSAL', status: 'PASS' });
console.log('  -> PASS: Duplicate relation registration rejected.\n');

// 8. TEST_SPAN_RETRIEVAL_AND_VERIFICATION
console.log('[TEST 8] Testing Byte-Span Retrieval & Hash Verification...');
const spanRes = receiver.retrieveBySpan('rec:source:001', 0, 36);
assert(spanRes.span_text === 'This is the first admitted body text', 'Span text mismatch');
assert(spanRes.span_sha256 === sha256('This is the first admitted body text'), 'Span sha256 mismatch');
assert(spanRes.verified === true, 'Span verified flag must be true');

// Out of range check
let outOfRangeRefused = false;
try {
  receiver.retrieveBySpan('rec:source:001', 0, 999999);
} catch (err) {
  if (err.code === 'INVALID_SPAN') {
    outOfRangeRefused = true;
  }
}
assert(outOfRangeRefused, 'Out-of-range span must be refused with INVALID_SPAN');

testResults.push({ test: 8, name: 'SPAN_RETRIEVAL_AND_VERIFICATION', status: 'PASS', spanRes });
console.log('  -> PASS: Byte span retrieval and boundary enforcement verified.\n');

// 9. TEST_SEARCH_ENTITIES
console.log('[TEST 9] Testing Grounded Entity Search...');
const searchRes = receiver.searchEntities('Coordinates');
assert(searchRes.match_count >= 2, 'Search for Coordinates must return matches');
assert(searchRes.title_matches.some(m => m.source_id === 'rec:source:001'), 'Must match source 001 title');

testResults.push({ test: 9, name: 'GROUNDED_ENTITY_SEARCH', status: 'PASS', match_count: searchRes.match_count });
console.log('  -> PASS: Grounded search verified.\n');

// 10. TEST_REGISTERED_METHOD_INVOCATION_AND_READBACK
console.log('[TEST 10] Testing Registered Native Method Invocation & Return Package...');
receiver.registerMethod('SRC_PROJECTIVE_ROUTING', ({ receiver, params }) => {
  // Query all admitted sources from receiver db
  const sources = receiver.db.prepare(`
    SELECT s.source_id as record_id, s.declared_title as title, s.created_at, cap.normalized_body as body
    FROM sources s
    JOIN captures cap ON s.source_id = cap.source_id
  `).all();

  return runProjectiveRouting(sources);
}, 'v1', 'STRICT_SRC_PROJECTIVE_CONTRACT');

const invRes = receiver.invokeMethod('SRC_PROJECTIVE_ROUTING', { scope: 'ALL_ADMITTED' });
assert(invRes.result.document_count === 3, 'Expected 3 documents processed');
assert(invRes.result_sha256 && invRes.result_sha256.length === 64, 'Must have 64-char sha256');

// Readback verification
const readback = receiver.readbackResults(invRes.invocation_id);
assert(readback.integrity_verified === true, 'Readback integrity must be verified');

// Return package formatting
const returnPkg = receiver.formatReturnPackage(invRes.invocation_id);
assert(returnPkg.schema === 'td613.empty-encyclopedia-return/v1', 'Return schema mismatch');
assert(returnPkg.initial_state_witness.witness_sha256 === witness.witness_sha256, 'Initial witness must match');

testResults.push({ test: 10, name: 'METHOD_INVOCATION_AND_READBACK', status: 'PASS', returnPkgId: returnPkg.return_receipt_id });
console.log('  -> PASS: Method registration, invocation, readback and return packaging verified.\n');

// 11. TEST_FAILED_OPERATIONS_PRESERVATION
console.log('[TEST 11] Verifying Complete Failed Operations Log Preservation...');
const failures = receiver.getFailedOperations();
assert(failures.length >= 4, `Expected at least 4 logged failures, got ${failures.length}`);

const errorCodes = failures.map(f => f.error_code);
assert(errorCodes.includes('DUPLICATE_SOURCE_REFUSED'), 'Must include DUPLICATE_SOURCE_REFUSED');
assert(errorCodes.includes('UNSUPPORTED_GRAPH_LINK'), 'Must include UNSUPPORTED_GRAPH_LINK');
assert(errorCodes.includes('DUPLICATE_RELATION_REFUSED'), 'Must include DUPLICATE_RELATION_REFUSED');

testResults.push({ test: 11, name: 'FAILED_OPERATIONS_PRESERVATION', status: 'PASS', failures_logged: failures.length });
console.log(`  -> PASS: All ${failures.length} failed operations preserved in log with error codes.\n`);

receiver.close();

console.log('================================================================');
console.log('ALL 11 RECEIVER TESTS PASSED SUCCESSFULLY');
console.log('================================================================');

const summaryOutput = {
  schema: 'td613.empty-encyclopedia-receiver-test-receipt/v1',
  timestamp: new Date().toISOString(),
  environment: 'Node.js ' + process.version,
  total_tests: testResults.length,
  passed_tests: testResults.filter(t => t.status === 'PASS').length,
  results: testResults,
};

const receiptPath = path.resolve(__dirname, 'test-empty-receiver-receipt.json');
fs.writeFileSync(receiptPath, JSON.stringify(summaryOutput, null, 2), 'utf8');
console.log(`Receipt saved to: ${receiptPath}`);
