/**
 * 𝌋 TD613 · Wendbine Empty Encyclopedia Receiver Test Suite (Crossing W)
 * 
 * Verifies:
 * 1. Initial State Zero-Row Witness Attestation across all 7 tables
 * 2. Bounded Scope & Refusal of Full Post Bodies (selftext, body, source_body, full_text, nested JSON, unallowlisted fields)
 * 3. Fatal UTF-8 Decoding & Raw Binary Partition
 * 4. Concept Declaration & Co-occurrence Overlay Engine
 * 5. 9-Graph Relation Registry (G_A .. G_X) Default-Deny & Declared Concept Verification
 * 6. Live Raw Byte Cryptographic Span Verification & Version-Bound Adjudicator Receipts
 * 7. Multilingual Unicode & Covenant Khona‌lit-po Integrity
 * 
 * Emits packages/wendbine_reciprocal_expedition/receiver/wendbine-receiver-receipt.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  WendbineEmptyEncyclopediaReceiver,
  WB_RECEIVER_SCHEMA_V1,
  WENDBINE_NINE_GRAPH_VOCABULARY,
  sha256,
} from './wendbine-empty-receiver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'wendbine-receiver-receipt.json');

console.log('================================================================');
console.log('WENDBINE EMPTY ENCYCLOPEDIA RECEIVER (CROSSING W) VERIFICATION');
console.log('================================================================\n');

const testResults = [];
function recordTest(name, passed, details = {}) {
  testResults.push({ name, passed, details });
  const status = passed ? '[PASS]' : '[FAIL]';
  console.log(`${status} ${name}`);
  if (!passed) console.error('  -> FAILURE DETAILS:', details);
}

const receiver = new WendbineEmptyEncyclopediaReceiver(':memory:');
const witness = receiver.initialize({
  memory: true,
  recipientId: 'wb_rcp_synth_expedition_01',
  episodeId: 'wb_ep_crossing_w',
});

// -------------------------------------------------------------
// 1. Initial State Zero-Row Witness
// -------------------------------------------------------------
console.log('--- TEST 1: Initial Zero-Row State Witness ---');
recordTest('Witness conforms to td613.wendbine-empty-receiver/v1', witness.schema === WB_RECEIVER_SCHEMA_V1);
recordTest('Witness attestation type is INITIAL_ZERO_ROW_STATE_WITNESS', witness.attestation_type === 'INITIAL_ZERO_ROW_STATE_WITNESS');
recordTest('Attested exactly 7 receiver tables in initial state', witness.tables.length === 7);
const zeroCountsVerified = witness.tables.every(t => witness.zero_row_counts[t] === 0);
recordTest('Measured initial zero-row counts across all 7 receiver tables', zeroCountsVerified);

// -------------------------------------------------------------
// 2. Refusal of Full Post Bodies (Public Bounded Scope)
// -------------------------------------------------------------
console.log('\n--- TEST 2: Refusal of Full Post Bodies & Raw Payload Boundaries ---');
let selftextRejected = false;
try {
  receiver.admitPostSource({
    source_id: 'reddit:t3_forbidden_body',
    public_date: '2026-08-01',
    selftext: 'This is the private full body text that should be refused.',
  });
} catch (err) {
  if (err.code === 'WENDBINE_FULL_BODY_FIELD_REFUSED') selftextRejected = true;
}
recordTest('Rejected post with selftext field (WENDBINE_FULL_BODY_FIELD_REFUSED)', selftextRejected);

let bodyRejected = false;
try {
  receiver.admitPostSource({
    source_id: 'reddit:t3_forbidden_body_2',
    public_date: '2026-08-01',
    body: 'Alternative full body representation.',
  });
} catch (err) {
  if (err.code === 'WENDBINE_FULL_BODY_FIELD_REFUSED') bodyRejected = true;
}
recordTest('Rejected post with body field (WENDBINE_FULL_BODY_FIELD_REFUSED)', bodyRejected);

// Nested JSON payload containing forbidden body field
let nestedBodyRejected = false;
try {
  receiver.admitPostSource({
    source_id: 'reddit:t3_nested_body_post',
    public_date: '2026-08-01',
    raw_payload: JSON.stringify({
      title: 'Valid metadata title',
      nested_data: { selftext: 'Smuggled body copy in nested object' },
    }),
  });
} catch (err) {
  if (err.code === 'WENDBINE_FULL_BODY_FIELD_REFUSED') nestedBodyRejected = true;
}
recordTest('Rejected post with nested selftext in raw_payload (WENDBINE_FULL_BODY_FIELD_REFUSED)', nestedBodyRejected);

// Serialized escaped JSON inside raw_payload
let escapedBodyRejected = false;
let escapedErr = null;
try {
  receiver.admitPostSource({
    source_id: 'reddit:t3_escaped_body_post',
    public_date: '2026-08-01',
    raw_payload: JSON.stringify({
      title: 'Valid metadata title',
      evidence: '{"body": "Smuggled inside serialized JSON string"}',
    }),
  });
} catch (err) {
  escapedErr = err;
  if (err.code === 'WENDBINE_FULL_BODY_FIELD_REFUSED') escapedBodyRejected = true;
}
recordTest('Rejected post with escaped body string in raw_payload (WENDBINE_FULL_BODY_FIELD_REFUSED)', escapedBodyRejected, { error: escapedErr ? { code: escapedErr.code, msg: escapedErr.message } : 'NO_ERROR_THROWN' });

// Unallowlisted field in payload
let unallowlistedRejected = false;
try {
  receiver.admitPostSource({
    source_id: 'reddit:t3_unallowlisted_post',
    public_date: '2026-08-01',
    raw_payload: JSON.stringify({
      title: 'Valid Title',
      unauthorized_secret_field: 'arbitrary payload injection',
    }),
  });
} catch (err) {
  if (err.code === 'WENDBINE_UNALLOWLISTED_PAYLOAD_FIELD') unallowlistedRejected = true;
}
recordTest('Rejected unallowlisted field in payload (WENDBINE_UNALLOWLISTED_PAYLOAD_FIELD)', unallowlistedRejected);

// -------------------------------------------------------------
// 3. Fatal UTF-8 Decoding & Binary Evidence
// -------------------------------------------------------------
console.log('\n--- TEST 3: Fatal UTF-8 Decoding & Binary Evidence ---');

let malformedRejected = false;
try {
  receiver.admitPostSource({
    source_id: 'reddit:t3_bad_utf8',
    public_date: '2026-08-01',
    raw_payload: Buffer.from([0x80, 0x81, 0xFF]),
    is_byte_evidence: false,
  });
} catch (err) {
  if (err.code === 'MALFORMED_UTF8_SEQUENCE') malformedRejected = true;
}
recordTest('Rejected malformed UTF-8 lone continuation bytes with MALFORMED_UTF8_SEQUENCE', malformedRejected);

// Admitting valid UTF-8 post source with Covenant Khona‌lit-po
const covenantPayload = JSON.stringify({
  source_id: 'reddit:t3_covenant_post',
  canonical_url: 'https://www.reddit.com/r/Wendbine/comments/covenant_post/',
  public_date: '2026-08-01',
  title: 'Covenant Khona\u200Clit-po (preserving interior U+200C)',
  declared_concepts: ['concept:covenant', 'concept:topological_closure'],
});

const admittedPost1 = receiver.admitPostSource({
  source_id: 'reddit:t3_covenant_post',
  canonical_url: 'https://www.reddit.com/r/Wendbine/comments/covenant_post/',
  public_date: '2026-08-01',
  raw_payload: covenantPayload,
  is_byte_evidence: false,
});
recordTest('Admitted valid UTF-8 source with Covenant Khona‌lit-po', admittedPost1.evidence_class === 'TEXT_METADATA');

// Second post for co-occurrence testing
const post2Payload = JSON.stringify({
  source_id: 'reddit:t3_second_post',
  canonical_url: 'https://www.reddit.com/r/Wendbine/comments/second_post/',
  public_date: '2026-08-02',
  title: 'Homeostatic Setpoint Post',
  declared_concepts: ['concept:covenant', 'concept:homeostasis'],
});
receiver.admitPostSource({
  source_id: 'reddit:t3_second_post',
  canonical_url: 'https://www.reddit.com/r/Wendbine/comments/second_post/',
  public_date: '2026-08-02',
  raw_payload: post2Payload,
  is_byte_evidence: false,
});

// Binary source
const rawBinaryBytes = Buffer.from([0x00, 0xDE, 0xAD, 0xBE, 0xEF, 0xFF]);
const admittedBin = receiver.admitPostSource({
  source_id: 'reddit:t3_binary_source',
  canonical_url: 'https://www.reddit.com/r/Wendbine/comments/binary_source/',
  public_date: '2026-08-03',
  raw_payload: rawBinaryBytes,
  is_byte_evidence: true,
});
recordTest('Classified binary source as BYTE_EVIDENCE', admittedBin.evidence_class === 'BYTE_EVIDENCE');

// -------------------------------------------------------------
// 4. Concept Declarations & Co-occurrence Overlay
// -------------------------------------------------------------
console.log('\n--- TEST 4: Concept Declarations & Co-occurrence Overlay ---');

receiver.declareConcept('reddit:t3_covenant_post', 'concept:covenant');
receiver.declareConcept('reddit:t3_covenant_post', 'concept:topological_closure');
receiver.declareConcept('reddit:t3_second_post', 'concept:covenant');
receiver.declareConcept('reddit:t3_second_post', 'concept:topological_closure'); // Both posts declare covenant & topological_closure

const overlay = receiver.computeCooccurrenceOverlay(2);
recordTest('Computed concept co-occurrence overlay with minThreshold=2', overlay.length === 1);
recordTest('Identified pair concept:covenant <-> concept:topological_closure with weight 2', overlay[0].weight === 2);

// -------------------------------------------------------------
// 5. 9-Graph Relation Registry (G_A .. G_X) with Mandatory Span Proof & Registered Receipts
// -------------------------------------------------------------
console.log('\n--- TEST 5: 9-Graph Relation Registry Verification ---');

const spanSlice = Buffer.from(covenantPayload).subarray(10, 40);
const spanHash = sha256(spanSlice);

// Register adjudication event for valid relation
receiver.registerAdjudicationEvent({
  receiptId: 'rec:adj_wendbine_001',
  adjudicatorRole: 'ORCHESTRATOR',
  decision: 'ADMIT',
  relationId: 'rel:cov_bounds_closure',
  spanSha256: spanHash,
});

const validRel = receiver.admitTypedRelation({
  relationId: 'rel:cov_bounds_closure',
  sourceId: 'reddit:t3_covenant_post',
  graphFamily: 'G_A',
  fromConcept: 'concept:covenant',
  relationPredicate: 'BOUNDS',
  toConcept: 'concept:topological_closure',
  evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
  adjudicatorReceiptId: 'rec:adj_wendbine_001',
  spanProof: {
    start: 10,
    end: 40,
    span_sha256: spanHash,
  },
});
recordTest('Admitted valid G_A relation BOUNDS with live span proof and registered adjudication receipt', validRel.relation_predicate === 'BOUNDS');

// Exercise all other 8 graph families with valid predicates and proofs
const graphFamiliesToTest = [
  { family: 'G_D', predicate: 'CONNECTS_TO' },
  { family: 'G_F', predicate: 'PROPAGATES_ACROSS' },
  { family: 'G_I', predicate: 'SUPPORTS' },
  { family: 'G_O', predicate: 'PROJECTS_TO' },
  { family: 'G_P', predicate: 'CONSTRAINS' },
  { family: 'G_R', predicate: 'SHAPES' },
  { family: 'G_T', predicate: 'CAN_INITIATE' },
  { family: 'G_X', predicate: 'TRACKS' },
];

for (const { family, predicate } of graphFamiliesToTest) {
  const relId = `rel:test_${family}`;
  const receiptId = `rec:adj_${family}`;
  receiver.registerAdjudicationEvent({
    receiptId,
    adjudicatorRole: 'APERTURE_AUDITOR',
    decision: 'ADMIT',
    relationId: relId,
    spanSha256: spanHash,
  });

  const r = receiver.admitTypedRelation({
    relationId: relId,
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: family,
    fromConcept: 'concept:covenant',
    relationPredicate: predicate,
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_SYNTHESIS',
    adjudicatorReceiptId: receiptId,
    spanProof: {
      start: 10,
      end: 40,
      span_sha256: spanHash,
    },
  });
  recordTest(`Admitted valid relation for family ${family} (${predicate})`, r.relation_predicate === predicate);
}

// -------------------------------------------------------------
// 6. Adversarial Negative Controls (Default-Deny)
// -------------------------------------------------------------
console.log('\n--- TEST 6: Adversarial Negative Controls ---');

// 6.1 Unsupported predicate
let unsuppPred = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:bad_predicate',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'MAGIC_TELEPORTATION',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_bad_001',
    spanProof: { start: 10, end: 40, span_sha256: spanHash },
  });
} catch (err) {
  if (err.code === 'WENDBINE_UNSUPPORTED_GRAPH_RELATION') unsuppPred = true;
}
recordTest('Rejected unsupported predicate with WENDBINE_UNSUPPORTED_GRAPH_RELATION', unsuppPred);

// 6.2 Unsupported graph family
let unsuppFam = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:bad_fam',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_UNKNOWN_ZZZ',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_bad_002',
    spanProof: { start: 10, end: 40, span_sha256: spanHash },
  });
} catch (err) {
  if (err.code === 'WENDBINE_UNSUPPORTED_GRAPH_FAMILY') unsuppFam = true;
}
recordTest('Rejected unsupported graph family with WENDBINE_UNSUPPORTED_GRAPH_FAMILY', unsuppFam);

// 6.3 Missing span proof (eliminating default-allow fallback)
let missingSpan = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:no_span',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_wendbine_001',
    spanProof: null,
  });
} catch (err) {
  if (err.code === 'MISSING_SPAN_PROOF') missingSpan = true;
}
recordTest('Rejected relation missing span proof with MISSING_SPAN_PROOF', missingSpan);

// 6.4 Undeclared concept endpoint
let undeclaredConcept = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:undeclared_concept',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:invented_nonexistent',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_wendbine_001',
    spanProof: { start: 10, end: 40, span_sha256: spanHash },
  });
} catch (err) {
  if (err.code === 'CONCEPT_NOT_DECLARED_FOR_SOURCE') undeclaredConcept = true;
}
recordTest('Rejected relation with undeclared concept with CONCEPT_NOT_DECLARED_FOR_SOURCE', undeclaredConcept);

// 6.5 Unregistered adjudicator receipt
let unregisteredAdj = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:unregistered_adj',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_unregistered_999',
    spanProof: { start: 10, end: 40, span_sha256: spanHash },
  });
} catch (err) {
  if (err.code === 'UNREGISTERED_ADJUDICATION_EVENT') unregisteredAdj = true;
}
recordTest('Rejected unregistered adjudicator receipt with UNREGISTERED_ADJUDICATION_EVENT', unregisteredAdj);

// 6.6 Adjudication decision not ADMIT
receiver.registerAdjudicationEvent({
  receiptId: 'rec:adj_rejected_case',
  adjudicatorRole: 'TEMPORAL_CUSTODIAN',
  decision: 'REJECT',
  relationId: 'rel:rejected_adj',
  spanSha256: spanHash,
});
let rejectAdj = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:rejected_adj',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_rejected_case',
    spanProof: { start: 10, end: 40, span_sha256: spanHash },
  });
} catch (err) {
  if (err.code === 'ADJUDICATION_DECISION_NOT_ADMIT') rejectAdj = true;
}
recordTest('Rejected relation with non-ADMIT adjudication with ADJUDICATION_DECISION_NOT_ADMIT', rejectAdj);

// 6.7 Adjudication span hash mismatch
receiver.registerAdjudicationEvent({
  receiptId: 'rec:adj_mismatch_hash',
  adjudicatorRole: 'PEDAGOGUE_AUDITOR',
  decision: 'ADMIT',
  relationId: 'rel:hash_mismatch_rel',
  spanSha256: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
});
let mismatchSpanHash = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:hash_mismatch_rel',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_mismatch_hash',
    spanProof: { start: 10, end: 40, span_sha256: spanHash },
  });
} catch (err) {
  if (err.code === 'ADJUDICATOR_SPAN_HASH_MISMATCH') mismatchSpanHash = true;
}
recordTest('Rejected relation with mismatched adjudicator span hash with ADJUDICATOR_SPAN_HASH_MISMATCH', mismatchSpanHash);

// 6.8 Fabricated span SHA-256
let forgedSpan = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:forged_span',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_wendbine_001',
    spanProof: {
      start: 10,
      end: 40,
      span_sha256: '0000000000000000000000000000000000000000000000000000000000000000',
    },
  });
} catch (err) {
  if (err.code === 'INVALID_SPAN_PROOF_DIGEST') forgedSpan = true;
}
recordTest('Rejected fabricated span SHA-256 with INVALID_SPAN_PROOF_DIGEST', forgedSpan);

// 6.9 Unadmitted source endpoint
let unadmittedSrc = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:unadmitted_src',
    sourceId: 'reddit:t3_unadmitted_post_999',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_wendbine_001',
    spanProof: { start: 10, end: 40, span_sha256: spanHash },
  });
} catch (err) {
  if (err.code === 'SOURCE_ENDPOINT_UNADMITTED') unadmittedSrc = true;
}
recordTest('Rejected unadmitted source with SOURCE_ENDPOINT_UNADMITTED', unadmittedSrc);

// 6.10 Out-of-bounds span
let oobSpan = false;
try {
  receiver.admitTypedRelation({
    relationId: 'rel:oob_span',
    sourceId: 'reddit:t3_covenant_post',
    graphFamily: 'G_A',
    fromConcept: 'concept:covenant',
    relationPredicate: 'BOUNDS',
    toConcept: 'concept:topological_closure',
    evidenceClass: 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    adjudicatorReceiptId: 'rec:adj_wendbine_001',
    spanProof: {
      start: 0,
      end: 999999,
      span_sha256: 'dummy',
    },
  });
} catch (err) {
  if (err.code === 'INVALID_SPAN_BOUNDS') oobSpan = true;
}
recordTest('Rejected out-of-bounds span coordinates with INVALID_SPAN_BOUNDS', oobSpan);

receiver.close();

// Compile Receipt
const allPassed = testResults.every(t => t.passed);
const receipt = {
  schema: 'td613.wendbine-receiver-receipt/v1',
  evaluated_at: new Date().toISOString(),
  receiver_schema: WB_RECEIVER_SCHEMA_V1,
  total_tests: testResults.length,
  passed_tests: testResults.filter(t => t.passed).length,
  failed_tests: testResults.filter(t => !t.passed).length,
  all_passed: allPassed,
  initial_state_witness: witness,
  test_census: testResults,
  governing_covenant: 'Khona\u200Clit-po',
  disposition: allPassed ? 'WENDBINE_EMPTY_RECEIVER_VERIFIED_CLEAN' : 'VERIFICATION_FAILED',
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log('\n================================================================');
console.log(`WENDBINE RECEIVER VERIFICATION COMPLETE. Receipt written to ${RECEIPT_PATH}`);
console.log(`Summary: ${receipt.passed_tests}/${receipt.total_tests} passed.`);
console.log('================================================================');

if (!allPassed) process.exit(1);
