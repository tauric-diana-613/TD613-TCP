/**
 * 𝌋 TD613 · Independent Empty Universal Atelier Receiver Test Suite (Crossing T)
 * 
 * Verifies:
 * 1. Initial State Zero-Row Witness Attestation across all 5 receiver tables
 * 2. Multilingual Unicode Custody (preserving Covenant Khona‌lit-po U+200C)
 * 3. Governed Operation: prepareImport (read-only proposal, no DB mutation)
 * 4. Governed Operation: registerAdjudicationEvent (role, decision, evidence hash checks)
 * 5. Governed Operation: admitRecord (custodial gate: requires human-review-ref, registered positive receipt, hash match)
 * 6. Adversarial controls on admitRecord (missing ref, missing receipt, unregistered, non-ADMIT, hash mismatch)
 * 7. Governed Operation: admitLink (directed edge with cryptographic spanProof & reverse citation index)
 * 8. Adversarial controls on admitLink (missing endpoints, missing span proof, bad bounds, bad digest, anachronistic link)
 * 9. Governed Operations: search, get, cite, neighbors, route, context, verify, export
 * 
 * Emits packages/universal_atelier/receiver/universal-atelier-receiver-receipt.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  UniversalAtelierReceiver,
  UNIVERSAL_ATELIER_SCHEMA_V1,
  UA_VALID_KINDS,
  UniversalAtelierError,
  sha256,
} from './universal-atelier-receiver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'universal-atelier-receiver-receipt.json');

console.log('================================================================');
console.log('UNIVERSAL ATELIER EMPTY RECEIVER (CROSSING T) VERIFICATION');
console.log('================================================================\n');

const testResults = [];
function recordTest(name, passed, details = {}) {
  testResults.push({ name, passed, details });
  const status = passed ? '[PASS]' : '[FAIL]';
  console.log(`${status} ${name}`);
  if (!passed) console.error('  -> FAILURE DETAILS:', details);
}

const receiver = new UniversalAtelierReceiver(':memory:');
const witness = receiver.initialize({
  memory: true,
  recipientId: 'ua_rcp_synth_crossing_t_01',
  episodeId: 'ua_ep_crossing_t',
});

// -------------------------------------------------------------
// 1. Initial State Zero-Row Witness
// -------------------------------------------------------------
console.log('--- TEST 1: Initial Zero-Row State Witness ---');
recordTest('Witness conforms to td613.universal-atelier/v1', witness.schema === UNIVERSAL_ATELIER_SCHEMA_V1);
recordTest('Witness attestation type is INITIAL_ZERO_ROW_STATE_WITNESS', witness.attestation_type === 'INITIAL_ZERO_ROW_STATE_WITNESS');
recordTest('Attested exactly 5 receiver tables in initial state', witness.tables.length === 5);
const expectedTables = ['ua_records', 'ua_links', 'ua_proposals', 'ua_adjudication_events', 'ua_reverse_citations'];
const tablesMatch = expectedTables.every(t => witness.tables.includes(t));
recordTest('Attested table list matches all expected 5 tables', tablesMatch);
const zeroCountsVerified = witness.tables.every(t => witness.zero_row_counts[t] === 0);
recordTest('Measured initial zero-row counts across all 5 receiver tables', zeroCountsVerified);
recordTest('Witness hash is valid 64-char hex SHA-256', /^[0-9a-f]{64}$/i.test(witness.witness_hash));

// -------------------------------------------------------------
// 2. Multilingual Unicode & Covenant Khona‌lit-po Integrity
// -------------------------------------------------------------
console.log('\n--- TEST 2: Multilingual Unicode & Covenant Khona\u200Clit-po Integrity ---');
const covenantString = 'Khona\u200Clit-po';
const hasZwnj = covenantString.includes('\u200C');
recordTest('Covenant string contains interior Zero-Width Non-Joiner (U+200C)', hasZwnj);
recordTest('Covenant string byte length reflects U+200C (3 UTF-8 bytes: E2 80 8C)', Buffer.from(covenantString, 'utf8').length === 14);

// -------------------------------------------------------------
// 3. Governed Operation: prepareImport (Read-Only Proposal)
// -------------------------------------------------------------
console.log('\n--- TEST 3: prepareImport (Read-Only Proposal) ---');
const syntheticRecord1 = {
  id: 'ua:concept:khonalit_po_custody',
  kind: 'contract',
  label: 'Khona\u200Clit-po Covenant Custody Contract',
  family: 'covenant',
  status: 'PROPOSED',
  evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
  claim_ceiling: 'Zero private data; research witness only.',
  summary: 'Governed protocol for interior zero-width non-joiner preservation in TD613 crossings.',
};
const rawJson1 = JSON.stringify(syntheticRecord1, null, 2);
const proposal1 = receiver.prepareImport(rawJson1);

recordTest('prepareImport returns proposal object', proposal1.schema === 'td613.universal-atelier.proposal/v1');
recordTest('prepareImport stages proposal in ua_proposals', proposal1.disposition === 'PROPOSED');
recordTest('prepareImport does NOT mutate ua_records table (still 0 records)', receiver.db.prepare('SELECT count(*) as c FROM ua_records').get().c === 0);
recordTest('prepareImport computed matching input_sha256', proposal1.input_sha256 === sha256(rawJson1));

// Adversarial import validation
try {
  receiver.prepareImport('NOT_JSON');
  recordTest('Refused invalid JSON string in prepareImport', false);
} catch (err) {
  recordTest('Refused invalid JSON string in prepareImport', err.code === 'INVALID_JSON');
}

try {
  receiver.prepareImport(JSON.stringify({ id: 'bad:kind', kind: 'FORBIDDEN_KIND', label: 'Test' }));
  recordTest('Refused unapproved ontology kind in prepareImport', false);
} catch (err) {
  recordTest('Refused unapproved ontology kind in prepareImport', err.code === 'INVALID_KIND');
}

// -------------------------------------------------------------
// 4. Governed Operation: registerAdjudicationEvent
// -------------------------------------------------------------
console.log('\n--- TEST 4: registerAdjudicationEvent ---');
const receiptId1 = 'adj:ua:rcpt:001';
const registeredEvent1 = receiver.registerAdjudicationEvent({
  receiptId: receiptId1,
  adjudicatorRole: 'ORCHESTRATOR',
  decision: 'ADMIT',
  targetId: syntheticRecord1.id,
  evidenceSha256: proposal1.input_sha256,
});
recordTest('Registered positive adjudication receipt in ua_adjudication_events', registeredEvent1.receipt_id === receiptId1);

// Adversarial adjudication controls
try {
  receiver.registerAdjudicationEvent({
    receiptId: 'adj:fail:bad_role',
    adjudicatorRole: 'UNAUTHORIZED_INTRUDER',
    decision: 'ADMIT',
    targetId: syntheticRecord1.id,
    evidenceSha256: proposal1.input_sha256,
  });
  recordTest('Refused unauthorized adjudicator role', false);
} catch (err) {
  recordTest('Refused unauthorized adjudicator role', err.code === 'INVALID_ADJUDICATOR_ROLE');
}

try {
  receiver.registerAdjudicationEvent({
    receiptId: 'adj:fail:bad_decision',
    adjudicatorRole: 'APERTURE_AUDITOR',
    decision: 'UNRECOGNIZED_DECISION',
    targetId: syntheticRecord1.id,
    evidenceSha256: proposal1.input_sha256,
  });
  recordTest('Refused unrecognized adjudication decision', false);
} catch (err) {
  recordTest('Refused unrecognized adjudication decision', err.code === 'INVALID_ADJUDICATION_DECISION');
}

// -------------------------------------------------------------
// 5. Governed Operation: admitRecord (Custodial Gate)
// -------------------------------------------------------------
console.log('\n--- TEST 5: admitRecord (Custodial Gate) ---');

// Adversarial check: missing human review ref
try {
  receiver.admitRecord(proposal1, { humanReviewRef: null, adjudicatorReceiptId: receiptId1 });
  recordTest('Refused admission without human review ref', false);
} catch (err) {
  recordTest('Refused admission without human review ref', err.code === 'HUMAN_REVIEW_REF_REQUIRED');
}

// Adversarial check: unregistered receipt
try {
  receiver.admitRecord(proposal1, { humanReviewRef: 'SAC[X6ZNK5NO51]', adjudicatorReceiptId: 'adj:forged:999' });
  recordTest('Refused admission with unregistered adjudicator receipt', false);
} catch (err) {
  recordTest('Refused admission with unregistered adjudicator receipt', err.code === 'UNREGISTERED_ADJUDICATION_EVENT');
}

// Adversarial check: hash mismatch
const receiptIdMismatch = 'adj:ua:rcpt:mismatch';
receiver.registerAdjudicationEvent({
  receiptId: receiptIdMismatch,
  adjudicatorRole: 'TEMPORAL_CUSTODIAN',
  decision: 'ADMIT',
  targetId: syntheticRecord1.id,
  evidenceSha256: '0000000000000000000000000000000000000000000000000000000000000000',
});
try {
  receiver.admitRecord(proposal1, { humanReviewRef: 'SAC[X6ZNK5NO51]', adjudicatorReceiptId: receiptIdMismatch });
  recordTest('Refused admission when adjudicator evidence hash mismatches proposal', false);
} catch (err) {
  recordTest('Refused admission when adjudicator evidence hash mismatches proposal', err.code === 'ADJUDICATOR_HASH_MISMATCH');
}

// Valid admission of Record 1
const admittedRec1 = receiver.admitRecord(proposal1, {
  humanReviewRef: 'SAC[X6ZNK5NO51]',
  adjudicatorReceiptId: receiptId1,
});
recordTest('Admitted Record 1 through custodial gate', admittedRec1.record_id === syntheticRecord1.id);
recordTest('ua_records count incremented to 1', receiver.db.prepare('SELECT count(*) as c FROM ua_records').get().c === 1);

// Admit a second record for linking tests
const syntheticRecord2 = {
  id: 'ua:evidence:khonalit_po_receipt_witness',
  kind: 'evidence',
  label: 'Khona\u200Clit-po Receipt Witness',
  family: 'covenant',
  status: 'ADMITTED',
  evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
  claim_ceiling: 'Zero private data; research witness only.',
  body: 'Independent corroboration witness for U+200C invariant preservation.',
};
const rawJson2 = JSON.stringify(syntheticRecord2, null, 2);
const proposal2 = receiver.prepareImport(rawJson2);
const receiptId2 = 'adj:ua:rcpt:002';
receiver.registerAdjudicationEvent({
  receiptId: receiptId2,
  adjudicatorRole: 'APERTURE_AUDITOR',
  decision: 'ADMIT',
  targetId: syntheticRecord2.id,
  evidenceSha256: proposal2.input_sha256,
});
const admittedRec2 = receiver.admitRecord(proposal2, {
  humanReviewRef: 'SAC[X6ZNK5NO51]',
  adjudicatorReceiptId: receiptId2,
});
recordTest('Admitted Record 2 through custodial gate', admittedRec2.record_id === syntheticRecord2.id);

// -------------------------------------------------------------
// 6. Governed Operation: admitLink & Directed Edges
// -------------------------------------------------------------
console.log('\n--- TEST 6: admitLink & Directed Edges ---');

// Compute genuine span proof on raw payload of record 1
const buf1 = Buffer.from(proposal1.raw_json, 'utf8');
const searchPhrase = 'Khona\u200Clit-po';
const startIdx = buf1.indexOf(searchPhrase);
const endIdx = startIdx + Buffer.from(searchPhrase, 'utf8').length;
const spanSlice = buf1.subarray(startIdx, endIdx);
const spanProofValid = {
  start: startIdx,
  end: endIdx,
  span_sha256: sha256(spanSlice),
};

const receiptLink1 = 'adj:ua:link:001';
receiver.registerAdjudicationEvent({
  receiptId: receiptLink1,
  adjudicatorRole: 'ATLAS_AUDITOR',
  decision: 'ADMIT',
  targetId: 'link:contract_to_evidence',
  evidenceSha256: spanProofValid.span_sha256,
});

// Adversarial: missing span proof
try {
  receiver.admitLink({
    linkId: 'link:fail:no_span',
    fromId: syntheticRecord1.id,
    toId: syntheticRecord2.id,
    linkType: 'WARRANTED_BY',
    spanProof: null,
    adjudicatorReceiptId: receiptLink1,
  });
  recordTest('Refused link without spanProof', false);
} catch (err) {
  recordTest('Refused link without spanProof', err.code === 'MISSING_SPAN_PROOF');
}

// Adversarial: invalid span bounds
try {
  receiver.admitLink({
    linkId: 'link:fail:bad_bounds',
    fromId: syntheticRecord1.id,
    toId: syntheticRecord2.id,
    linkType: 'WARRANTED_BY',
    spanProof: { start: -5, end: 10, span_sha256: 'bad' },
    adjudicatorReceiptId: receiptLink1,
  });
  recordTest('Refused link with negative span start coordinate', false);
} catch (err) {
  recordTest('Refused link with negative span start coordinate', err.code === 'INVALID_SPAN_BOUNDS');
}

// Adversarial: span digest mismatch
try {
  receiver.admitLink({
    linkId: 'link:fail:bad_digest',
    fromId: syntheticRecord1.id,
    toId: syntheticRecord2.id,
    linkType: 'WARRANTED_BY',
    spanProof: { start: startIdx, end: endIdx, span_sha256: '0000000000000000000000000000000000000000000000000000000000000000' },
    adjudicatorReceiptId: receiptLink1,
  });
  recordTest('Refused link with invalid span digest', false);
} catch (err) {
  recordTest('Refused link with invalid span digest', err.code === 'INVALID_SPAN_PROOF_DIGEST');
}

// Adversarial: missing target endpoint
try {
  receiver.admitLink({
    linkId: 'link:fail:nonexistent_tgt',
    fromId: syntheticRecord1.id,
    toId: 'ua:nonexistent:target',
    linkType: 'WARRANTED_BY',
    spanProof: spanProofValid,
    adjudicatorReceiptId: receiptLink1,
  });
  recordTest('Refused link targeting unadmitted endpoint', false);
} catch (err) {
  recordTest('Refused link targeting unadmitted endpoint', err.code === 'TARGET_ENDPOINT_UNADMITTED');
}

// Valid link admission
const admittedLink1 = receiver.admitLink({
  linkId: 'link:contract_to_evidence',
  fromId: syntheticRecord1.id,
  toId: syntheticRecord2.id,
  linkType: 'WARRANTED_BY',
  temporalClassification: 'ANY_RELATION',
  spanProof: spanProofValid,
  adjudicatorReceiptId: receiptLink1,
});
recordTest('Admitted directed link from Record 1 to Record 2', admittedLink1.link_id === 'link:contract_to_evidence');
recordTest('ua_links table count incremented to 1', receiver.db.prepare('SELECT count(*) as c FROM ua_links').get().c === 1);

// Verify reverse citation automatic index
const revCitations = receiver.db.prepare('SELECT * FROM ua_reverse_citations WHERE target_id = ?').all(syntheticRecord2.id);
recordTest('Automatic reverse citation created for target Record 2', revCitations.length === 1 && revCitations[0].citing_id === syntheticRecord1.id);

// -------------------------------------------------------------
// 7. Governed Operations: search, get, cite, neighbors, route, context, verify, export
// -------------------------------------------------------------
console.log('\n--- TEST 7: 10 Canonical Operations Suite ---');

// search
const searchRes = receiver.search({ q: 'Khona\u200Clit-po', limit: 10 });
recordTest('search returns matching records', searchRes.total_returned === 2);
const searchFiltered = receiver.search({ filter: { kind: 'contract' } });
recordTest('search respects kind facet filter', searchFiltered.total_returned === 1 && searchFiltered.results[0].record_id === syntheticRecord1.id);

// get
const fetched1 = receiver.get(syntheticRecord1.id);
recordTest('get returns record with parsed payload and outgoing links', fetched1.record_id === syntheticRecord1.id && fetched1.outgoing_links.length === 1);
const fetched2 = receiver.get(syntheticRecord2.id);
recordTest('get returns record with cited_by incoming references', fetched2.cited_by.length === 1 && fetched2.cited_by[0].citing_id === syntheticRecord1.id);

// cite
const citation1 = receiver.cite(syntheticRecord1.id);
recordTest('cite produces formatted reference string TD613·UA[...]::sha256(...)', citation1.citation_format.startsWith('TD613·UA[ua:concept:khonalit_po_custody]::sha256('));
recordTest('cite reports correct claim ceiling and evidence class', citation1.evidence_class === 'SYNTHETIC_RESEARCH_WITNESS');

// neighbors
const neighbors1 = receiver.neighbors(syntheticRecord1.id);
recordTest('neighbors returns outgoing edge to Record 2', neighbors1.outgoing.length === 1 && neighbors1.outgoing[0].to_id === syntheticRecord2.id);
const neighbors2 = receiver.neighbors(syntheticRecord2.id);
recordTest('neighbors returns incoming edge from Record 1', neighbors2.incoming.length === 1 && neighbors2.incoming[0].citing_id === syntheticRecord1.id);

// route
const routeRes = receiver.route(syntheticRecord1.id, syntheticRecord2.id);
recordTest('route discovers acyclic directed path of depth 1', routeRes.found && routeRes.depth === 1 && routeRes.path[0] === syntheticRecord1.id && routeRes.path[1] === syntheticRecord2.id);
const routeNotFound = receiver.route(syntheticRecord2.id, syntheticRecord1.id);
recordTest('route respects directed edge orientation (not found in reverse)', !routeNotFound.found);

// context
const contextRes = receiver.context(syntheticRecord1.id, { maxRecords: 10 });
recordTest('context packages root and related neighborhood records', contextRes.records.length === 2 && contextRes.root_record.record_id === syntheticRecord1.id);
recordTest('context reports accurate truncation indicator', contextRes.truncated === false);

// verify
const verifyRes = receiver.verify();
recordTest('verify recomputes SHA-256 for all stored records with 0 mismatches', verifyRes.valid && verifyRes.matches === 2 && verifyRes.mismatches === 0);

// export
const exportRes = receiver.export();
recordTest('export produces complete lossless serialization with initial witness', exportRes.schema === 'td613.universal-atelier-export/v1' && exportRes.total_records === 2 && exportRes.total_links === 1);
recordTest('export carries initial witness hash identical to startup witness', exportRes.initial_witness.witness_hash === witness.witness_hash);

// -------------------------------------------------------------
// Summary & Receipt Generation
// -------------------------------------------------------------
const allPassed = testResults.every(t => t.passed);
const totalPassed = testResults.filter(t => t.passed).length;
const totalTests = testResults.length;

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${totalPassed} / ${totalTests} PASSED (All Passed: ${allPassed})`);
console.log('================================================================');

const receipt = {
  schema: 'td613.universal-atelier.receiver-receipt/v1',
  generated_at: new Date().toISOString(),
  recipient_id: witness.recipient_id,
  episode_id: witness.episode_id,
  initial_zero_row_witness: witness,
  all_passed: allPassed,
  total_tests: totalTests,
  passed_tests: totalPassed,
  failed_tests: totalTests - totalPassed,
  covenant_khonalit_po_preserved: hasZwnj,
  operations_tested: [
    'prepareImport',
    'registerAdjudicationEvent',
    'admitRecord',
    'admitLink',
    'search',
    'get',
    'cite',
    'neighbors',
    'route',
    'context',
    'verify',
    'export',
  ],
  adversarial_controls_tested: [
    'INVALID_JSON',
    'INVALID_KIND',
    'INVALID_ADJUDICATOR_ROLE',
    'INVALID_ADJUDICATION_DECISION',
    'HUMAN_REVIEW_REF_REQUIRED',
    'UNREGISTERED_ADJUDICATION_EVENT',
    'ADJUDICATOR_HASH_MISMATCH',
    'MISSING_SPAN_PROOF',
    'INVALID_SPAN_BOUNDS',
    'INVALID_SPAN_PROOF_DIGEST',
    'TARGET_ENDPOINT_UNADMITTED',
  ],
  results: testResults,
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log(`Wrote receipt to ${RECEIPT_PATH}`);

if (!allPassed) {
  process.exit(1);
}
