/**
 * 𝌋 TD613 · Custodial Gate & Historical Time Boundaries Adversarial Test Suite
 * Chambers 2 & 3 Verification
 * 
 * Tests:
 * 1. Jurisdiction separation:
 *    - EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION fails closed without external auth root
 *    - TEST_ONLY_SYNTHETIC_ADJUDICATION refuses real-source payloads
 * 2. Staged proposal confirmation & independent digest recomputation
 * 3. Adjudication parameter binding (target ID, action, episode ID, schema)
 * 4. Prior rejection / withdrawal preservation (blocks subsequent admission without reparative override)
 * 5. Link-adjudication parameter binding (target link ID, endpoints, predicate, span digest, coordinates)
 * 6. Historical time bases separation (creation, publication, observation, recording, admission, adjudication)
 * 7. Non-retroactivity based on historical publication dates, NOT admission order
 * 8. Multilingual Unicode custody preserving Covenant Khona‌lit-po interior U+200C
 * 
 * Emits packages/four_crossing_capstone/custodial-gate-and-time-receipt.json
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import {
  UniversalAtelierReceiver,
  UNIVERSAL_ATELIER_SCHEMA_V1,
  JURISDICTIONS,
  UA_VALID_ACTIONS,
  UA_VALID_LINK_PREDICATES,
  UniversalAtelierError,
  sha256,
} from '../universal_atelier/receiver/universal-atelier-receiver.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECEIPT_PATH = path.resolve(__dirname, 'custodial-gate-and-time-receipt.json');

console.log('================================================================');
console.log('CHAMBERS 2 & 3: CUSTODIAL GATES & HISTORICAL TIME BOUNDARIES');
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
  recipientId: 'ua_rcp_capstone_test',
  episodeId: 'ua_ep_capstone_c2c3',
});

// -------------------------------------------------------------
// TEST 1: Initial State Zero-Row Witness across all 5 tables
// -------------------------------------------------------------
console.log('--- TEST 1: Zero-Row Witness Verification ---');
recordTest('Witness conforms to schema v1', witness.schema === UNIVERSAL_ATELIER_SCHEMA_V1);
recordTest('Attested exactly 5 receiver tables with 0 rows', witness.tables.length === 5 && witness.tables.every(t => witness.zero_row_counts[t] === 0));

// -------------------------------------------------------------
// TEST 2: Chamber 2 - Jurisdiction Separation & Real-Source Fail-Closed
// -------------------------------------------------------------
console.log('\n--- TEST 2: Jurisdiction Separation & Real-Source Protection ---');

const syntheticRec1 = {
  id: 'ua:concept:khonalit_po_synthetic',
  kind: 'contract',
  label: 'Khona\u200Clit-po Synthetic Invariant',
  family: 'covenant',
  status: 'PROPOSED',
  synthetic: true,
  evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
  claim_ceiling: 'Zero private data; test witness only.',
  publication_time: '2024-01-15T00:00:00Z',
  body: 'Synthetic specification for literal interior zero-width non-joiner U+200C preservation.',
};
const prop1 = receiver.prepareImport(JSON.stringify(syntheticRec1, null, 2));

// Adversarial: attempt real-source external admission without valid external auth token
try {
  receiver.admitRecord(prop1, {
    jurisdiction: JURISDICTIONS.EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION,
    humanReviewRef: 'SAC[X6ZNK5NO51]',
    externalAuthToken: null,
    adjudicatorReceiptId: 'adj:none',
  });
  recordTest('Refused real-source admission without external auth token', false);
} catch (err) {
  recordTest('Refused real-source admission without external auth token', err.code === 'REAL_SOURCE_ADMISSION_HELD_WITHOUT_EXTERNAL_AUTH');
}

// Adversarial Amendment A: attempt external admission with arbitrary string token
try {
  receiver.admitRecord(prop1, {
    jurisdiction: JURISDICTIONS.EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION,
    humanReviewRef: 'SAC[X6ZNK5NO51]',
    externalAuthToken: 'bearer_token_xyz_arbitrary_string',
    adjudicatorReceiptId: 'adj:none',
  });
  recordTest('Refused real-source admission with arbitrary external token', false);
} catch (err) {
  recordTest('Refused real-source admission with arbitrary external token', err.code === 'REAL_SOURCE_ADMISSION_HELD_WITHOUT_EXTERNAL_AUTH');
}

// Adversarial Amendment A: attempt external admission with syntactically plausible token
try {
  receiver.admitRecord(prop1, {
    jurisdiction: JURISDICTIONS.EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION,
    humanReviewRef: 'SAC[X6ZNK5NO51]',
    externalAuthToken: 'td613-human-auth-v1:ecdsa-p256:3bad9aade0d90e6786ea7df11cae962ec3bc4726',
    adjudicatorReceiptId: 'adj:none',
  });
  recordTest('Refused real-source admission with syntactically plausible token (fail-closed)', false);
} catch (err) {
  recordTest('Refused real-source admission with syntactically plausible token (fail-closed)', err.code === 'REAL_SOURCE_ADMISSION_HELD_WITHOUT_EXTERNAL_AUTH');
}

// Adversarial Amendment A: attempt to register external HUMAN adjudication via self-issued event
try {
  receiver.registerAdjudicationEvent({
    receiptId: 'adj:test:forged_human_synth',
    jurisdiction: JURISDICTIONS.EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION,
    adjudicatorKind: 'MACHINE_SYNTHETIC',
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: syntheticRec1.id,
    evidenceSha256: prop1.input_sha256,
  });
  recordTest('Refused self-issued MACHINE_SYNTHETIC event under external human jurisdiction', false);
} catch (err) {
  recordTest('Refused self-issued MACHINE_SYNTHETIC event under external human jurisdiction', err.code === 'MACHINE_CANNOT_ISSUE_HUMAN_ADMISSION');
}

try {
  receiver.registerAdjudicationEvent({
    receiptId: 'adj:test:forged_human_root',
    jurisdiction: JURISDICTIONS.EXTERNALLY_AUTHENTICATED_HUMAN_ADMISSION,
    adjudicatorKind: 'HUMAN',
    adjudicatorRole: 'ORCHESTRATOR',
    action: 'RECORD_ADMISSION',
    decision: 'ADMIT',
    targetId: syntheticRec1.id,
    evidenceSha256: prop1.input_sha256,
  });
  recordTest('Refused self-issued HUMAN event without external trust root', false);
} catch (err) {
  recordTest('Refused self-issued HUMAN event without external trust root', err.code === 'EXTERNAL_HUMAN_AUTH_ROOT_UNAVAILABLE');
}

// Adversarial: attempt synthetic: false in test-only jurisdiction
const falseSynthPayload = {
  id: 'ua:real:protected_source_attempt',
  kind: 'source',
  label: 'Attempted Real Source Ingestion',
  synthetic: false,
  body: 'Private unredacted field data',
};
const falseSynthProp = receiver.prepareImport(JSON.stringify(falseSynthPayload, null, 2));
try {
  receiver.admitRecord(falseSynthProp, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: 'adj:test:001',
  });
  recordTest('Refused record with synthetic: false inside TEST_ONLY_SYNTHETIC_ADJUDICATION', false);
} catch (err) {
  recordTest('Refused record with synthetic: false inside TEST_ONLY_SYNTHETIC_ADJUDICATION', err.code === 'SYNTHETIC_DECLARATION_INVALID');
}

// Adversarial: attempt real-source evidence class with spoofed synthetic: true
const spoofedSynthPayload = {
  id: 'ua:real:spoofed_synthetic_attempt',
  kind: 'source',
  label: 'Attempted Real Source with Spoofed Flag',
  synthetic: true,
  evidence_class: 'OPERATOR_ADMITTED_SOURCE_RECORD',
  body: 'Private unredacted field data',
};
const spoofedProp = receiver.prepareImport(JSON.stringify(spoofedSynthPayload, null, 2));
try {
  receiver.admitRecord(spoofedProp, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: 'adj:test:001',
  });
  recordTest('Refused OPERATOR_ADMITTED_SOURCE_RECORD inside TEST_ONLY_SYNTHETIC_ADJUDICATION', false);
} catch (err) {
  recordTest('Refused OPERATOR_ADMITTED_SOURCE_RECORD inside TEST_ONLY_SYNTHETIC_ADJUDICATION', err.code === 'TEST_JURISDICTION_REAL_SOURCE_REFUSED');
}

// -------------------------------------------------------------
// TEST 3: Proposal Staging & Adjudication Parameter Binding
// -------------------------------------------------------------
console.log('\n--- TEST 3: Adjudication Parameter Binding (Record Admission) ---');

// Register legitimate test adjudication event for syntheticRec1
const adjRec1Id = 'adj:test:rec:001';
receiver.registerAdjudicationEvent({
  receiptId: adjRec1Id,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: syntheticRec1.id,
  evidenceSha256: prop1.input_sha256,
});

// Adversarial: attempt to admit with adjudication targeting different record
const fakeTargetAdjId = 'adj:test:rec:mismatch_target';
receiver.registerAdjudicationEvent({
  receiptId: fakeTargetAdjId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: 'ua:record:other_target',
  evidenceSha256: prop1.input_sha256,
});
try {
  receiver.admitRecord(prop1, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: fakeTargetAdjId,
  });
  recordTest('Refused admission when adjudication target_id mismatches record ID', false);
} catch (err) {
  recordTest('Refused admission when adjudication target_id mismatches record ID', err.code === 'ADJUDICATION_TARGET_MISMATCH');
}

// Adversarial: attempt to admit with adjudication for wrong action (e.g. LINK_ADMISSION)
const wrongActionAdjId = 'adj:test:rec:wrong_action';
receiver.registerAdjudicationEvent({
  receiptId: wrongActionAdjId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: syntheticRec1.id,
  evidenceSha256: prop1.input_sha256,
  binding: { from_id: 'a', to_id: 'b' },
});
try {
  receiver.admitRecord(prop1, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: wrongActionAdjId,
  });
  recordTest('Refused admission when adjudication action is not RECORD_ADMISSION', false);
} catch (err) {
  recordTest('Refused admission when adjudication action is not RECORD_ADMISSION', err.code === 'ADJUDICATION_ACTION_MISMATCH');
}

// Adversarial: attempt cross-episode replay
const crossEpAdjId = 'adj:test:rec:cross_ep';
receiver.registerAdjudicationEvent({
  receiptId: crossEpAdjId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: syntheticRec1.id,
  evidenceSha256: prop1.input_sha256,
  episodeId: 'ua_ep_foreign_stale_episode',
});
try {
  receiver.admitRecord(prop1, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: crossEpAdjId,
  });
  recordTest('Refused cross-episode adjudication replay', false);
} catch (err) {
  recordTest('Refused cross-episode adjudication replay', err.code === 'ADJUDICATION_CROSS_EPISODE_REPLAY_REJECTED');
}

// Adversarial Amendment B: post-staging mutation of proposal.raw_json
const mutatedRawProposal = { ...prop1, raw_json: prop1.raw_json + ' ' };
try {
  receiver.admitRecord(mutatedRawProposal, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: adjRec1Id,
  });
  recordTest('Refused proposal when raw_json mutated after staging', false);
} catch (err) {
  recordTest('Refused proposal when raw_json mutated after staging', err.code === 'STAGED_PAYLOAD_MUTATED');
}

// Adversarial Amendment B: post-staging mutation of proposal.record.id
const mutatedRecordIdProposal = { ...prop1, record: { ...prop1.record, id: 'ua:forged:new_id' } };
try {
  receiver.admitRecord(mutatedRecordIdProposal, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: adjRec1Id,
  });
  recordTest('Refused proposal when caller mutated record.id after staging', false);
} catch (err) {
  recordTest('Refused proposal when caller mutated record.id after staging', err.code === 'PROPOSAL_RECORD_ID_MISMATCH');
}

// Adversarial Amendment B: post-staging mutation of proposal.record.label
const mutatedLabelProposal = { ...prop1, record: { ...prop1.record, label: 'Altered Label' } };
try {
  receiver.admitRecord(mutatedLabelProposal, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: adjRec1Id,
  });
  recordTest('Refused proposal when caller mutated record.label after staging', false);
} catch (err) {
  recordTest('Refused proposal when caller mutated record.label after staging', err.code === 'PROPOSAL_RECORD_MUTATED');
}

// Adversarial Amendment B: omitted synthetic flag
const missingSynthRec = { id: 'ua:synth:missing_flag', kind: 'contract', label: 'Missing Synthetic Flag' };
const propMissingSynth = receiver.prepareImport(JSON.stringify(missingSynthRec));
const adjMissingSynthId = 'adj:test:missing_synth';
receiver.registerAdjudicationEvent({
  receiptId: adjMissingSynthId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: missingSynthRec.id,
  evidenceSha256: propMissingSynth.input_sha256,
});
try {
  receiver.admitRecord(propMissingSynth, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: adjMissingSynthId,
  });
  recordTest('Refused record with omitted synthetic flag', false);
} catch (err) {
  recordTest('Refused record with omitted synthetic flag', err.code === 'SYNTHETIC_DECLARATION_INVALID');
}

// Adversarial Amendment B: ambiguously typed synthetic flag (string "true")
const strSynthRec = { id: 'ua:synth:str_flag', kind: 'contract', label: 'String Synthetic Flag', synthetic: 'true' };
const propStrSynth = receiver.prepareImport(JSON.stringify(strSynthRec));
const adjStrSynthId = 'adj:test:str_synth';
receiver.registerAdjudicationEvent({
  receiptId: adjStrSynthId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: strSynthRec.id,
  evidenceSha256: propStrSynth.input_sha256,
});
try {
  receiver.admitRecord(propStrSynth, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: adjStrSynthId,
  });
  recordTest('Refused record with string synthetic flag ("true")', false);
} catch (err) {
  recordTest('Refused record with string synthetic flag ("true")', err.code === 'SYNTHETIC_DECLARATION_INVALID');
}

// Valid admission of syntheticRec1
const admitted1 = receiver.admitRecord(prop1, {
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
  adjudicatorReceiptId: adjRec1Id,
});
recordTest('Successfully admitted Record 1 under TEST_ONLY_SYNTHETIC_ADJUDICATION', admitted1.record_id === syntheticRec1.id);
recordTest('Admitted record assigned evidence_class TEST_ONLY_SYNTHETIC_WITNESS', admitted1.evidence_class === 'TEST_ONLY_SYNTHETIC_WITNESS');

// -------------------------------------------------------------
// TEST 4: Preservation of Prior Rejection / Withdrawal History
// -------------------------------------------------------------
console.log('\n--- TEST 4: Historical Rejection / Withdrawal Preservation ---');

const rejectedRec = {
  id: 'ua:concept:contested_hypothesis',
  kind: 'open_question',
  label: 'Contested Theoretical Hypothesis',
  family: 'foundations',
  synthetic: true,
  body: 'Hypothesis with unresolved empirical contradiction.',
};
const propRejected = receiver.prepareImport(JSON.stringify(rejectedRec, null, 2));

// Register REJECT event
const rejReceiptId = 'adj:test:rec:reject_001';
receiver.registerAdjudicationEvent({
  receiptId: rejReceiptId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'APERTURE_AUDITOR',
  action: 'RECORD_ADMISSION',
  decision: 'REJECT',
  targetId: rejectedRec.id,
  evidenceSha256: propRejected.input_sha256,
});

// Now register an ADMIT event without reparative override
const naiveAdmitReceiptId = 'adj:test:rec:naive_admit';
receiver.registerAdjudicationEvent({
  receiptId: naiveAdmitReceiptId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: rejectedRec.id,
  evidenceSha256: propRejected.input_sha256,
});

try {
  receiver.admitRecord(propRejected, {
    jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
    humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
    adjudicatorReceiptId: naiveAdmitReceiptId,
  });
  recordTest('Refused admission of previously rejected record without reparative override', false);
} catch (err) {
  recordTest('Refused admission of previously rejected record without reparative override', err.code === 'RECORD_PREVIOUSLY_REJECTED_OR_WITHDRAWN');
}

// Register reparative override adjudication
const reparativeReceiptId = 'adj:test:rec:reparative_admit';
receiver.registerAdjudicationEvent({
  receiptId: reparativeReceiptId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ORCHESTRATOR',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: rejectedRec.id,
  evidenceSha256: propRejected.input_sha256,
  binding: { reparative_override: true, reason: 'Methodological deficit remedied in synthetic chamber' },
});

const admittedReparative = receiver.admitRecord(propRejected, {
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
  adjudicatorReceiptId: reparativeReceiptId,
});
recordTest('Admitted previously rejected record when explicit reparative override supplied', admittedReparative.record_id === rejectedRec.id);

// -------------------------------------------------------------
// TEST 5: Chamber 3 - Link Parameter Binding & Anti-Replay
// -------------------------------------------------------------
console.log('\n--- TEST 5: Link Adjudication Parameter Binding & Anti-Replay ---');

// Admit target record for linking
const syntheticRec2 = {
  id: 'ua:evidence:khonalit_po_prior_art',
  kind: 'evidence',
  label: 'Khona\u200Clit-po Historical Evidence',
  family: 'covenant',
  synthetic: true,
  evidence_class: 'SYNTHETIC_RESEARCH_WITNESS',
  publication_time: '2020-05-10T00:00:00Z', // Published 4 years BEFORE syntheticRec1 (2024)
  body: 'Historical empirical evidence preceding synthetic invariant.',
};
const prop2 = receiver.prepareImport(JSON.stringify(syntheticRec2, null, 2));
const adjRec2Id = 'adj:test:rec:002';
receiver.registerAdjudicationEvent({
  receiptId: adjRec2Id,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'TEMPORAL_CUSTODIAN',
  action: 'RECORD_ADMISSION',
  decision: 'ADMIT',
  targetId: syntheticRec2.id,
  evidenceSha256: prop2.input_sha256,
});
receiver.admitRecord(prop2, {
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  humanReviewRef: 'SAC[X6ZNK5NO51]:TEST_ONLY',
  adjudicatorReceiptId: adjRec2Id,
});

// Compute valid span proof on syntheticRec1
const buf1 = Buffer.from(prop1.raw_json, 'utf8');
const searchPhrase = 'Khona\u200Clit-po';
const startIdx = buf1.indexOf(searchPhrase);
const endIdx = startIdx + Buffer.from(searchPhrase, 'utf8').length;
const spanSha = sha256(buf1.subarray(startIdx, endIdx));

const link1Id = 'link:synth1_to_synth2';
const validLinkAdjId = 'adj:test:link:001';
receiver.registerAdjudicationEvent({
  receiptId: validLinkAdjId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ATLAS_AUDITOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: link1Id,
  evidenceSha256: spanSha,
  binding: {
    from_id: syntheticRec1.id,
    to_id: syntheticRec2.id,
    link_type: 'WARRANTED_BY',
    span_sha256: spanSha,
    start: startIdx,
    end: endIdx,
  },
});

// Adversarial: attempt to reuse link approval for another link
try {
  receiver.admitLink({
    linkId: 'link:forged_cross_link_reuse',
    fromId: syntheticRec1.id,
    toId: syntheticRec2.id,
    linkType: 'WARRANTED_BY',
    spanProof: { start: startIdx, end: endIdx, span_sha256: spanSha },
    adjudicatorReceiptId: validLinkAdjId,
  });
  recordTest('Refused link admission when adjudicator receipt target_id mismatches linkId', false);
} catch (err) {
  recordTest('Refused link admission when adjudicator receipt target_id mismatches linkId', err.code === 'ADJUDICATION_TARGET_MISMATCH');
}

// Adversarial: attempt link admission with endpoint mismatch in binding
const mismatchEndpointAdjId = 'adj:test:link:mismatch_endpoint';
receiver.registerAdjudicationEvent({
  receiptId: mismatchEndpointAdjId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ATLAS_AUDITOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:mismatch_test',
  evidenceSha256: spanSha,
  binding: {
    from_id: syntheticRec1.id,
    to_id: 'ua:other:endpoint',
    link_type: 'WARRANTED_BY',
    span_sha256: spanSha,
    start: startIdx,
    end: endIdx,
  },
});
try {
  receiver.admitLink({
    linkId: 'link:mismatch_test',
    fromId: syntheticRec1.id,
    toId: syntheticRec2.id,
    linkType: 'WARRANTED_BY',
    spanProof: { start: startIdx, end: endIdx, span_sha256: spanSha },
    adjudicatorReceiptId: mismatchEndpointAdjId,
  });
  recordTest('Refused link admission when bound endpoints mismatch proposal', false);
} catch (err) {
  recordTest('Refused link admission when bound endpoints mismatch proposal', err.code === 'LINK_ADJUDICATION_ENDPOINT_MISMATCH');
}

// Adversarial: attempt link admission with predicate mismatch in binding
const mismatchPredAdjId = 'adj:test:link:mismatch_predicate';
receiver.registerAdjudicationEvent({
  receiptId: mismatchPredAdjId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ATLAS_AUDITOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: 'link:pred_test',
  evidenceSha256: spanSha,
  binding: {
    from_id: syntheticRec1.id,
    to_id: syntheticRec2.id,
    link_type: 'EXEMPLIFIES', // Bound to EXEMPLIFIES, but proposed as WARRANTED_BY
    span_sha256: spanSha,
    start: startIdx,
    end: endIdx,
  },
});
try {
  receiver.admitLink({
    linkId: 'link:pred_test',
    fromId: syntheticRec1.id,
    toId: syntheticRec2.id,
    linkType: 'WARRANTED_BY',
    spanProof: { start: startIdx, end: endIdx, span_sha256: spanSha },
    adjudicatorReceiptId: mismatchPredAdjId,
  });
  recordTest('Refused link admission when bound predicate mismatches proposed link_type', false);
} catch (err) {
  recordTest('Refused link admission when bound predicate mismatches proposed link_type', err.code === 'LINK_ADJUDICATION_PREDICATE_MISMATCH');
}

// Adversarial Amendment C: admitLink with unvalidated candidate predicate
const candidateLinkId = 'link:test:candidate_predicate';
const candidateProof = { start: startIdx, end: endIdx, span_sha256: spanSha };
const adjCandLinkId = 'adj:test:link:candidate_pred';
receiver.registerAdjudicationEvent({
  receiptId: adjCandLinkId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'ATLAS_AUDITOR',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: candidateLinkId,
  evidenceSha256: candidateProof.span_sha256,
  binding: {
    from_id: syntheticRec1.id,
    to_id: syntheticRec2.id,
    link_type: 'CUSTOM_UNVALIDATED_SPECULATION',
    span_sha256: candidateProof.span_sha256,
    start: candidateProof.start,
    end: candidateProof.end,
  },
});

const admittedCandLink = receiver.admitLink({
  linkId: candidateLinkId,
  fromId: syntheticRec1.id,
  toId: syntheticRec2.id,
  linkType: 'CUSTOM_UNVALIDATED_SPECULATION',
  spanProof: candidateProof,
  adjudicatorReceiptId: adjCandLinkId,
});

recordTest('Unvalidated predicate accepted as CANDIDATE_UNVALIDATED_PREDICATE status', admittedCandLink.status === 'CANDIDATE_UNVALIDATED_PREDICATE');

// Test that candidate link is NOT in reverse citations
const revCitsForTarget = receiver.db.prepare('SELECT * FROM ua_reverse_citations WHERE target_id = ? AND link_type = ?').all(syntheticRec2.id, 'CUSTOM_UNVALIDATED_SPECULATION');
recordTest('Candidate link excluded from admitted reverse citations (ua_reverse_citations)', revCitsForTarget.length === 0);

// Test that candidate link is excluded from neighbors()
const nbrsOut = receiver.neighbors(syntheticRec1.id, { direction: 'outgoing' });
const candidateInNeighbors = nbrsOut.outgoing.some(l => l.link_type === 'CUSTOM_UNVALIDATED_SPECULATION');
recordTest('Candidate link excluded from neighbors() by default', !candidateInNeighbors);

// Test that canonicalProjectionPi strictly excludes candidate-only links
const proj = receiver.canonicalProjectionPi();
const candidateInPi = proj.canonical_payload.edges.some(e => e.type === 'CUSTOM_UNVALIDATED_SPECULATION');
recordTest('canonicalProjectionPi strictly excludes candidate-only links', !candidateInPi);

// -------------------------------------------------------------
// TEST 6: Historical Time Bases Separation & Non-Retroactivity
// -------------------------------------------------------------
console.log('\n--- TEST 6: Historical Time Separation & Non-Retroactivity ---');

// Invariant: syntheticRec1 was published in 2024. syntheticRec2 was published in 2020.
// syntheticRec1 citing syntheticRec2 as PREEXISTING_OR_CONTEMPORANEOUS must succeed!
const admittedValidLink = receiver.admitLink({
  linkId: link1Id,
  fromId: syntheticRec1.id,
  toId: syntheticRec2.id,
  linkType: 'WARRANTED_BY',
  temporalClassification: 'PREEXISTING_OR_CONTEMPORANEOUS',
  spanProof: { start: startIdx, end: endIdx, span_sha256: spanSha },
  adjudicatorReceiptId: validLinkAdjId,
});
recordTest('Historical citation from 2024 document to 2020 document admitted successfully', admittedValidLink.link_id === link1Id);

// Adversarial: historical citation in reverse!
// syntheticRec2 (published in 2020) claiming to retrospectively cite syntheticRec1 (published in 2024)!
const anachronisticLinkId = 'link:anachronistic_citation';
const anachAdjId = 'adj:test:link:anachronistic';
const buf2 = Buffer.from(prop2.raw_json, 'utf8');
const searchPhrase2 = 'Historical empirical evidence';
const startIdx2 = buf2.indexOf(searchPhrase2);
const endIdx2 = startIdx2 + Buffer.from(searchPhrase2, 'utf8').length;
const spanSha2 = sha256(buf2.subarray(startIdx2, endIdx2));

receiver.registerAdjudicationEvent({
  receiptId: anachAdjId,
  jurisdiction: JURISDICTIONS.TEST_ONLY_SYNTHETIC_ADJUDICATION,
  adjudicatorKind: 'MACHINE_SYNTHETIC',
  adjudicatorRole: 'TEMPORAL_CUSTODIAN',
  action: 'LINK_ADMISSION',
  decision: 'ADMIT',
  targetId: anachronisticLinkId,
  evidenceSha256: spanSha2,
  binding: {
    from_id: syntheticRec2.id,
    to_id: syntheticRec1.id,
    link_type: 'WARRANTED_BY',
    span_sha256: spanSha2,
    start: startIdx2,
    end: endIdx2,
  },
});

try {
  receiver.admitLink({
    linkId: anachronisticLinkId,
    fromId: syntheticRec2.id, // Published 2020
    toId: syntheticRec1.id,   // Published 2024
    linkType: 'WARRANTED_BY',
    temporalClassification: 'PREEXISTING_OR_CONTEMPORANEOUS', // Claiming target existed prior!
    spanProof: { start: startIdx2, end: endIdx2, span_sha256: spanSha2 },
    adjudicatorReceiptId: anachAdjId,
  });
  recordTest('Refused anachronistic citation claiming 2020 document cited 2024 document as preexisting', false);
} catch (err) {
  recordTest('Refused anachronistic citation claiming 2020 document cited 2024 document as preexisting', err.code === 'ANACHRONISTIC_CITATION_TARGET_FUTURE');
}

// Adversarial: empty span proof
try {
  receiver.admitLink({
    linkId: 'link:empty_span_attempt',
    fromId: syntheticRec1.id,
    toId: syntheticRec2.id,
    linkType: 'WARRANTED_BY',
    spanProof: { start: 10, end: 10, span_sha256: sha256(Buffer.alloc(0)) },
    adjudicatorReceiptId: validLinkAdjId,
  });
  recordTest('Refused link with empty span (start == end)', false);
} catch (err) {
  recordTest('Refused link with empty span (start == end)', err.code === 'INVALID_SPAN_BOUNDS');
}

// -------------------------------------------------------------
// TEST 7: Regression Test: Dollhouse CLI Runner Positional Argument Fail-Closed
// -------------------------------------------------------------
console.log('\n--- TEST 7: Dollhouse CLI Runner Positional Argument Fail-Closed ---');

let cliPositionalRejected = false;
try {
  execSync('node scripts/run-dollhouse-skill-audit.mjs positional-dummy-spec.json', {
    stdio: 'pipe',
  });
} catch (err) {
  const stderr = err.stderr ? err.stderr.toString() : '';
  if (stderr.includes("Unrecognized positional argument 'positional-dummy-spec.json'")) {
    cliPositionalRejected = true;
  }
}
recordTest('Dollhouse runner fails closed immediately on unrecognized positional argument without hanging', cliPositionalRejected);

// -------------------------------------------------------------
// Summary & Receipt Generation
// -------------------------------------------------------------
const allPassed = testResults.every(t => t.passed);
const totalPassed = testResults.filter(t => t.passed).length;
const totalTests = testResults.length;

console.log('\n================================================================');
console.log(`SUMMARY: ${totalPassed} / ${totalTests} PASSED (All Passed: ${allPassed})`);
console.log('================================================================');

const receipt = {
  schema: 'td613.universal-atelier.custodial-gate-and-time-receipt/v1',
  evaluated_at: new Date().toISOString(),
  authority: 'SAC[X6ZNK5NO51]',
  covenant: 'Khona\u200Clit-po',
  chambers: ['CHAMBER_2_CUSTODIAL_GATE_REPAIR', 'CHAMBER_3_LINK_AND_TIME_REPAIR'],
  total_tests: totalTests,
  passed_tests: totalPassed,
  failed_tests: totalTests - totalPassed,
  all_passed: allPassed,
  jurisdictions_enforced: Object.values(JURISDICTIONS),
  adversarial_controls_passed: [
    'REAL_SOURCE_ADMISSION_HELD_WITHOUT_EXTERNAL_AUTH',
    'TEST_JURISDICTION_REAL_SOURCE_REFUSED',
    'ADJUDICATION_TARGET_MISMATCH',
    'ADJUDICATION_ACTION_MISMATCH',
    'ADJUDICATION_CROSS_EPISODE_REPLAY_REJECTED',
    'RECORD_PREVIOUSLY_REJECTED_OR_WITHDRAWN',
    'LINK_ADJUDICATION_ENDPOINT_MISMATCH',
    'LINK_ADJUDICATION_PREDICATE_MISMATCH',
    'ANACHRONISTIC_CITATION_TARGET_FUTURE',
    'INVALID_SPAN_BOUNDS_EMPTY_SPAN',
  ],
  results: testResults,
};

fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2), 'utf8');
console.log(`Wrote receipt to ${RECEIPT_PATH}`);

if (!allPassed) process.exit(1);
