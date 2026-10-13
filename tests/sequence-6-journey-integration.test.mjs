import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createSequence6JourneySession,
  issueOutboundAuthorization,
  prepareOutboundHandoff,
  executeMarrowlineContinuation,
  processReturnPacket,
  admitCandidateToLoomLedger,
  enterStructuralRest,
  concludeJourneyWithRest,
  recoverFromHold,
  exportRouteMemory,
  restoreRouteMemory,
  generateJourneyPresentation,
  mapStageToJurisdiction,
  mapStageToFlowcoreRelation,
  toLoomAiTaskInput,
  JOURNEY_STAGES,
  ACTOR_CLASSES,
  SEQUENCE_6_JOURNEY_SCHEMA,
  SEQUENCE_6_OUTBOUND_ENVELOPE_SCHEMA,
  SEQUENCE_6_RETURN_PACKET_SCHEMA,
  SEQUENCE_6_RECONSTRUCTED_STATE_SCHEMA
} from '../app/engine/sequence-6-journey.js';

import {
  canonicalizeJson,
  computeEventDigest,
  computeGenesisDigest,
  computePayloadDigest,
  createGovernedEvent,
  verifyGovernedEventChain,
  GOVERNED_EVENT_SCHEMA
} from '../app/engine/governed-event-chain.js';

import {
  CARRIER_COUNT,
  NEAR_CARRIER_COUNT,
  MID_CARRIER_COUNT,
  FAR_CARRIER_COUNT,
  classifyCarrier
} from '../app/engine/flowcore-semantic-motion-bridge.js';

import {
  createLoomAiHandoff,
  consumeLoomAiHandoff
} from '../app/dome-world/holonomy-loom/ai-handoff.js';

const operatorGesture = {
  gesture_id: 'gest_operator_action_101',
  type: 'CLICK',
  target: 'authorize_and_send_button',
  timestamp: new Date().toISOString()
};

test('1. Normal successful round trip across all 6 journey stages', () => {
  const session = createSequence6JourneySession({
    task: 'Reconcile fictional vendor offers and migration risk.',
    documents: [
      { id: 'doc-1', name: 'Vendor A Offer', text: 'Backup retention permitted up to 45 days.', share: true },
      { id: 'doc-2', name: 'Private Internal Notes', text: 'Local evaluation only.', share: false }
    ],
    rules: ['Preserve source modality: backup retention up to 45 days is a contractual limit.']
  });

  assert.equal(session.current_stage, 'LOOM_ORIGIN');
  assert.equal(session.jurisdiction, 'living_field');
  assert.equal(session.flowcore_relation, 'gathering');
  assert.equal(session.earlier_observed_state.documents.length, 2);
  assert.equal(session.outbound_authorization, null, 'Default-deny in force');

  // Stage 2: Outbound authorization with qualifying operator gesture (INV-01, INV-02, INV-03)
  const auth = issueOutboundAuthorization(session, {
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    operatorGesture
  });
  assert.equal(auth.single_shot_spent, false);
  assert.equal(auth.actor_class, 'INTERACTIVE_OPERATOR_DIRECT');
  assert.equal(auth.operator_gesture_id, 'gest_operator_action_101');
  assert.equal(auth.issue_691_posture, 'EXTERNAL_CARRIAGE_QUALIFYING_AUTHORIZATION');

  const outboundEnvelope = prepareOutboundHandoff(session);
  assert.equal(session.current_stage, 'EXPLICIT_OUTBOUND_AUTHORIZATION');
  assert.equal(session.jurisdiction, 'authorization_boundary');
  assert.equal(session.events.length, 1);
  assert.equal(session.outbound_authorization.single_shot_spent, true, 'Single-shot token is spent');
  assert.equal(outboundEnvelope.payload.documents.length, 1, 'Local-only doc-2 stayed outside transfer');
  assert.ok(outboundEnvelope.outbound_payload_digest, 'Payload content digest bound');

  // Verify single-shot enforcement (INV-03)
  assert.throws(() => {
    prepareOutboundHandoff(session);
  }, /INV_03_VIOLATION/);

  // Stage 3: Marrowline continuation
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope, {
    responseText: 'Reconciled 12-month stated fees: Vendor A requires 137,591.52 credits.',
    usedDocumentIds: ['doc-1'],
    missingInformation: ['Connector engineering discovery pending.']
  });
  assert.equal(session.current_stage, 'MARROWLINE_CONTINUATION');
  assert.equal(session.jurisdiction, 'living_field');
  assert.equal(session.events.length, 2);

  // Stage 4: Return / Re-entry (Candidate Waiting at Loom Threshold)
  const reEntryResult = processReturnPacket(session, returnPacket);
  assert.equal(reEntryResult.status, 'RETURNED_CANDIDATE');
  assert.equal(session.current_stage, 'RETURN_REENTRY');
  assert.equal(session.jurisdiction, 'receipt_inspection');
  assert.equal(reEntryResult.declaredHeadStatus, 'DECLARED_HEAD_MATCH');
  assert.equal(reEntryResult.headAnchorStatus, 'UNANCHORED');
  assert.equal(session.outbound_authorization, null, 'Outbound authorization strictly closed on return (INV-04)');
  assert.equal(session.current_reconstructed_state.loom_admission_status, 'NOT_YET_ADMITTED_AWAITING_EXPLICIT_GESTURE');

  // Verify Temporal Non-Retroactivity (INV-11)
  assert.ok(session.earlier_observed_state, 'Earlier observed state preserved');
  assert.ok(session.later_return_state, 'Later return state preserved');
  assert.ok(session.current_reconstructed_state, 'Current reconstructed state present');
  assert.notEqual(session.earlier_observed_state, session.current_reconstructed_state);

  // Verify candidate presentation is distinct from admitted receipt presentation (Section X)
  const candidatePres = generateJourneyPresentation(session);
  assert.ok(candidatePres.svg.includes('CANDIDATE AT THRESHOLD'));
  assert.ok(candidatePres.svg.includes('[CANDIDATE]'));
  assert.ok(candidatePres.svg.includes('RECEIVER_LOCAL != LOOM_ADMISSION'));

  // Stage 5: Explicit Local Admission
  admitCandidateToLoomLedger(session, {
    explicitAcknowledgment: true,
    operatorId: 'operator_1'
  });
  assert.equal(session.current_stage, 'RECEIPT_INSPECTION');
  assert.equal(session.current_reconstructed_state.loom_admission_status, 'ADMITTED_INTO_LOCAL_LEDGER');
  assert.equal(session.events.length, 3);

  const admittedPres = generateJourneyPresentation(session);
  assert.ok(admittedPres.svg.includes('TD613 EVIDENCE &amp; RECEIPT LEDGER // APERTURE REGISTER'));
  assert.ok(admittedPres.svg.includes('[OBSERVED]'));
  assert.ok(admittedPres.svg.includes('50 SACRIFICIAL UNITS'));
  assert.notEqual(candidatePres.svg, admittedPres.svg, 'Section X: RETURN_REENTRY != RECEIPT_INSPECTION presentation');

  // Stage 6: Lawful Structural Rest (𝄐)
  concludeJourneyWithRest(session, { reason: 'Review complete; obligation resolved.' });
  assert.equal(session.current_stage, 'STRUCTURAL_REST');
  assert.equal(session.jurisdiction, 'structural_rest');
  assert.equal(session.flowcore_relation, 'structural_rest');

  // Verify presentation preserves all 39 carriers at every stage
  const presentation = generateJourneyPresentation(session);
  assert.equal(presentation.carrier_count, 39);
  assert.equal(presentation.near_count, 6);
  assert.equal(presentation.mid_count, 13);
  assert.equal(presentation.far_count, 20);
});

test('2. Missing return evidence transitions to inspectable HOLD', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Corrupt packet: remove events array
  const corruptedPacket = { ...returnPacket, events: null };
  const result = processReturnPacket(session, corruptedPacket);

  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.jurisdiction, 'hold');
  assert.equal(session.flowcore_relation, 'protected_continuity');
  assert.equal(session.hold_state.defect_code, 'MALFORMED_RETURN_PACKET');
  assert.ok(session.hold_state.missing_evidence);
});

test('3. Tampered predecessor digest transitions to HOLD (INV-05)', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Tamper with predecessor digest of continuation event
  const tamperedEvents = structuredClone(returnPacket.events);
  tamperedEvents[1].predecessor_digest = 'a'.repeat(64);

  const tamperedPacket = {
    ...returnPacket,
    events: tamperedEvents
  };

  const result = processReturnPacket(session, tamperedPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.jurisdiction, 'hold');
  assert.equal(session.hold_state.defect_code, 'PREDECESSOR_DIGEST_MISMATCH');
});

test('4. Declared head mismatch triggers HOLD (Section III)', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Tamper declared terminal head digest
  const badDeclaredPacket = {
    ...returnPacket,
    terminal_head_digest: 'b'.repeat(64)
  };

  const result = processReturnPacket(session, badDeclaredPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'DECLARED_HEAD_MISMATCH');
});

test('5. Independent head anchor match vs mismatch (Section III)', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // 1. Independent anchor mismatch fails closed
  const bogusExpectedHead = 'f'.repeat(64);
  const mismatchResult = processReturnPacket(session, returnPacket, {
    independentExpectedHeadDigest: bogusExpectedHead
  });
  assert.equal(mismatchResult.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'INDEPENDENT_HEAD_ANCHOR_MISMATCH');

  // 2. Independent anchor match succeeds
  const cleanSession = createSequence6JourneySession();
  issueOutboundAuthorization(cleanSession, { operatorGesture });
  const cleanEnv = prepareOutboundHandoff(cleanSession);
  const cleanPkt = executeMarrowlineContinuation(cleanSession, cleanEnv);

  const matchResult = processReturnPacket(cleanSession, cleanPkt, {
    independentExpectedHeadDigest: cleanPkt.terminal_head_digest
  });
  assert.equal(matchResult.status, 'RETURNED_CANDIDATE');
  assert.equal(matchResult.headAnchorStatus, 'ANCHORED_MATCH');
});

test('6. Section II Hostile Test 1: Mutating outbound task text fails closed', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Tamper with outbound task text in returned packet
  const tamperedPacket = {
    ...returnPacket,
    outbound_payload: {
      ...returnPacket.outbound_payload,
      task: 'Mutated malicious outbound task instruction'
    }
  };

  const result = processReturnPacket(session, tamperedPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'PAYLOAD_CONTENT_DIGEST_MISMATCH');
});

test('7. Section II Hostile Test 2: Mutating selected document text fails closed', () => {
  const session = createSequence6JourneySession({
    documents: [{ id: 'doc-1', name: 'Doc 1', text: 'Original safe text', share: true }]
  });
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Tamper with document content
  const tamperedPacket = {
    ...returnPacket,
    outbound_payload: {
      ...returnPacket.outbound_payload,
      documents: [{ id: 'doc-1', name: 'Doc 1', text: 'Injected hostile text', share: true }]
    }
  };

  const result = processReturnPacket(session, tamperedPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'PAYLOAD_CONTENT_DIGEST_MISMATCH');
});

test('8. Section II Hostile Test 3: Mutating returned answer fails closed', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Tamper returned answer text without updating event
  const tamperedPacket = {
    ...returnPacket,
    result: {
      ...returnPacket.result,
      answer: 'Forged model answer with manufactured truth claims'
    }
  };

  const result = processReturnPacket(session, tamperedPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'PAYLOAD_CONTENT_DIGEST_MISMATCH');
});

test('9. Section II Hostile Test 4: Mutating missing-information list fails closed', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Tamper missing information
  const tamperedPacket = {
    ...returnPacket,
    result: {
      ...returnPacket.result,
      missing_information: ['Secretly added deficit item']
    }
  };

  const result = processReturnPacket(session, tamperedPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'PAYLOAD_CONTENT_DIGEST_MISMATCH');
});

test('10. Section II Hostile Test 5: Mutating receiver metadata fails closed', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Tamper receiver metadata
  const tamperedPacket = {
    ...returnPacket,
    receiver_metadata: {
      ...returnPacket.receiver_metadata,
      receiver_type: 'TAMPERED_FOREIGN_RECEIVER'
    }
  };

  const result = processReturnPacket(session, tamperedPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'PAYLOAD_CONTENT_DIGEST_MISMATCH');
});

test('11. Section IV Hostile Test: Temporal Non-Retroactivity on Retry preserves Attempt 1', () => {
  const session = createSequence6JourneySession({
    task: 'Original task 1 prompt',
    documents: [{ id: 'd-1', name: 'D1', text: 'T1', share: true }]
  });
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  const initialTask = session.earlier_observed_state.task;
  const initialObservedAt = session.earlier_observed_state.observed_at_iso;
  const initialGenesis = session.earlier_observed_state.genesis_digest;
  const initialDocsLength = session.earlier_observed_state.documents.length;

  // Trigger HOLD
  processReturnPacket(session, returnPacket, { independentExpectedHeadDigest: '0'.repeat(64) });
  assert.equal(session.current_stage, 'HOLD');

  // Trigger RETRY with brand new prompt
  const retryResult = recoverFromHold(session, 'RETRY', { newPrompt: 'Brand new retry prompt for attempt 2' });
  assert.equal(retryResult.action, 'RETRY');
  assert.equal(session.current_stage, 'LOOM_ORIGIN');
  assert.equal(session.route_memory.retries_count, 1);

  // CRITICAL LAW: Layer 1 earlier_observed_state must remain byte-semantically untouched!
  assert.equal(session.earlier_observed_state.task, initialTask, 'Attempt 1 task MUST NOT be rewritten');
  assert.equal(session.earlier_observed_state.observed_at_iso, initialObservedAt, 'Attempt 1 timestamp unchanged');
  assert.equal(session.earlier_observed_state.genesis_digest, initialGenesis, 'Attempt 1 genesis unchanged');
  assert.equal(session.earlier_observed_state.documents.length, initialDocsLength, 'Attempt 1 documents unchanged');

  // Attempt 1 must be archived in attempts history
  assert.equal(session.attempts.length, 1);
  assert.equal(session.attempts[0].earlier_observed_state.task, initialTask);

  // Current attempt origin must carry the new prompt
  assert.equal(session.current_origin_state.task, 'Brand new retry prompt for attempt 2');
  assert.equal(session.current_origin_state.attempt_index, 2);
});

test('12. Section V Hostile Test: Outbound authorization denied without explicit operator gesture', () => {
  const session = createSequence6JourneySession();

  // 1. Missing operatorGesture throws
  assert.throws(() => {
    issueOutboundAuthorization(session, {});
  }, /AUTHORIZATION_DENIED/);

  // 2. Empty gesture string throws
  assert.throws(() => {
    issueOutboundAuthorization(session, { operatorGesture: { gesture_id: '   ' } });
  }, /AUTHORIZATION_DENIED/);

  // 3. Valid gesture succeeds
  const auth = issueOutboundAuthorization(session, { operatorGesture });
  assert.ok(auth.authorization_token_id.startsWith('auth_'));
});

test('13. Section VI Hostile Test 1: Return session ID mismatch fails closed', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Wrong session ID
  const wrongSessionPacket = {
    ...returnPacket,
    session_id: 'sess_completely_different_foreign_session'
  };

  const result = processReturnPacket(session, wrongSessionPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'SESSION_ID_MISMATCH');
});

test('14. Section VI Hostile Test 2: Genesis digest mismatch fails closed', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Wrong genesis digest
  const wrongGenesisPacket = {
    ...returnPacket,
    genesis_digest: '9'.repeat(64)
  };

  const result = processReturnPacket(session, wrongGenesisPacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'GENESIS_DIGEST_MISMATCH');
});

test('15. Section VI Hostile Test 3: Route identity mismatch fails closed', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Wrong route identity
  const wrongRoutePacket = {
    ...returnPacket,
    origin_route: '/wrong/origin/chamber'
  };

  const result = processReturnPacket(session, wrongRoutePacket);
  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'ROUTE_IDENTITY_MISMATCH');
});

test('16. Section VII Hostile Test: Route memory restore revalidates predecessor chain and payload', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  prepareOutboundHandoff(session);

  const exported = exportRouteMemory(session);

  // 1. Clean restore succeeds
  const restoredClean = restoreRouteMemory(exported);
  assert.equal(restoredClean.restored_history_verified, true);
  assert.equal(restoredClean.custody_status, 'RESTORED_VERIFIED');
  assert.equal(restoredClean.outbound_authorization, null, 'ROUTE_MEMORY != AUTHORITY_MEMORY');

  // 2. Tampered event in localStorage JSON fails closed into HOLD
  const parsed = JSON.parse(exported);
  parsed.events[0].payload_envelope_digest = '7'.repeat(64);
  const restoredTampered = restoreRouteMemory(JSON.stringify(parsed));
  assert.equal(restoredTampered.restored_history_verified, false);
  assert.equal(restoredTampered.current_stage, 'HOLD');
  assert.equal(restoredTampered.hold_state.defect_code, 'RESTORED_CHAIN_CORRUPT');

  // 3. Tampered outbound payload fails closed into HOLD
  const parsedPayload = JSON.parse(exported);
  parsedPayload.outbound_payload.task = 'Tampered restored task';
  const restoredTamperedPayload = restoreRouteMemory(JSON.stringify(parsedPayload));
  assert.equal(restoredTamperedPayload.restored_history_verified, false);
  assert.equal(restoredTamperedPayload.current_stage, 'HOLD');
  assert.equal(restoredTamperedPayload.hold_state.defect_code, 'RESTORED_CHAIN_CORRUPT');
});

test('17. Section VIII Integration: Actual createLoomAiHandoff and consumeLoomAiHandoff wiring', async () => {
  const session = createSequence6JourneySession({
    task: 'Integrated diligent analysis',
    documents: [{ id: 'doc-1', name: 'Contract', text: 'Contract terms', share: true }],
    rules: ['Rule 1']
  });
  issueOutboundAuthorization(session, { operatorGesture });
  const outboundEnvelope = prepareOutboundHandoff(session);

  // Emulate browser sessionStorage environment for real product handoff
  const mockStorage = new Map();
  const loomEnvironment = {
    location: { pathname: '/dome-world/holonomy-loom.html', origin: 'http://localhost', protocol: 'http:' },
    crypto: globalThis.crypto,
    sessionStorage: {
      getItem: k => mockStorage.get(k) || null,
      setItem: (k, v) => mockStorage.set(k, v),
      removeItem: k => mockStorage.delete(k)
    }
  };

  // 1. Create real Loom AI handoff using product module
  const loomInput = toLoomAiTaskInput(outboundEnvelope.payload);
  const handoffUri = await createLoomAiHandoff(loomInput, loomEnvironment);
  assert.ok(handoffUri.startsWith('/dome-world/marrowline.html#loom='));
  const token = handoffUri.split('=')[1];
  assert.equal(mockStorage.size, 1, 'Handoff record stored in sessionStorage');

  // 2. Consume real Loom AI handoff in Marrowline using product module
  const marrowlineEnvironment = {
    location: { pathname: '/dome-world/marrowline.html', origin: 'http://localhost', protocol: 'http:' },
    crypto: globalThis.crypto,
    sessionStorage: loomEnvironment.sessionStorage,
    opener: null
  };
  const consumedPacket = await consumeLoomAiHandoff(token, marrowlineEnvironment);
  assert.equal(consumedPacket.task, 'Integrated diligent analysis');
  assert.equal(mockStorage.size, 0, 'Single-use token burned upon consumption');
});

test('18. Reload before Send retains draft without granting standing outbound authority', () => {
  const session = createSequence6JourneySession({
    task: 'Draft task before send'
  });

  const serialized = exportRouteMemory(session);
  const restored = restoreRouteMemory(serialized);

  assert.equal(restored.current_stage, 'LOOM_ORIGIN');
  assert.equal(restored.earlier_observed_state.task, 'Draft task before send');
  assert.equal(restored.outbound_authorization, null, 'ROUTE_MEMORY != AUTHORITY_MEMORY');
});

test('19. Reload after Send preserves route memory but revokes Send authority', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  prepareOutboundHandoff(session);

  assert.equal(session.current_stage, 'EXPLICIT_OUTBOUND_AUTHORIZATION');

  const serialized = exportRouteMemory(session);
  const restored = restoreRouteMemory(serialized);

  assert.equal(restored.current_stage, 'EXPLICIT_OUTBOUND_AUTHORIZATION');
  assert.equal(restored.outbound_authorization, null, 'No standing authority after reload');
  assert.equal(restored.events.length, 1);
  assert.equal(restored.head_digest, session.head_digest);

  // Attempting to send again fails without fresh authorization
  assert.throws(() => {
    prepareOutboundHandoff(restored);
  }, /INV_01_VIOLATION/);
});

test('20. Back navigation preserves event history and prevents retroactive rewriting', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const envelope = prepareOutboundHandoff(session);
  const returnPkt = executeMarrowlineContinuation(session, envelope);
  processReturnPacket(session, returnPkt);
  admitCandidateToLoomLedger(session, { explicitAcknowledgment: true });

  assert.equal(session.current_stage, 'RECEIPT_INSPECTION');

  const serialized = exportRouteMemory(session);
  const backSession = restoreRouteMemory(serialized);

  assert.equal(backSession.events.length, 3);
  assert.equal(backSession.earlier_observed_state.task, session.earlier_observed_state.task);
  assert.equal(backSession.later_return_state.result.answer, session.later_return_state.result.answer);
  assert.equal(backSession.outbound_authorization, null);
});

test('21. Duplicate return is detected and does not rewind or corrupt the chain', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const envelope = prepareOutboundHandoff(session);
  const returnPkt = executeMarrowlineContinuation(session, envelope);

  const res1 = processReturnPacket(session, returnPkt);
  assert.equal(res1.status, 'RETURNED_CANDIDATE');
  const head1 = session.head_digest;

  // Process same packet again
  const res2 = processReturnPacket(session, returnPkt);
  assert.equal(res2.status, 'RETURNED_CANDIDATE');
  assert.equal(session.head_digest, head1, 'Head digest unchanged on duplicate return');
  assert.equal(session.events.length, 2);
});

test('22. Contradictory receipt / non-monotonic timestamp triggers HOLD (INV-11)', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const envelope = prepareOutboundHandoff(session);
  const returnPkt = executeMarrowlineContinuation(session, envelope);

  // Inject a retrograde timestamp in the return event
  const eventsCopy = structuredClone(returnPkt.events);
  eventsCopy[1].measurement_time_iso = '2020-01-01T00:00:00.000Z';
  eventsCopy[1].recording_time_iso = '2020-01-01T00:00:00.000Z';
  const badPkt = { ...returnPkt, events: eventsCopy };

  const res = processReturnPacket(session, badPkt);
  assert.equal(res.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'CHRONOLOGY_NON_MONOTONIC');
});

test('23. Canonicalization parity rejects lone surrogates into HOLD', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const envelope = prepareOutboundHandoff(session);

  const returnPkt = executeMarrowlineContinuation(session, envelope);
  const badResult = {
    answer: 'Corrupted \uD800 answer with lone surrogate',
    used_document_ids: [],
    missing_information: [],
    suggested_next_step: ''
  };
  const badPkt = { ...returnPkt, result: badResult };

  const res = processReturnPacket(session, badPkt);
  assert.equal(res.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'RETURN_CANONICALIZATION_FAILED');
});

test('24. Long response is bounded, preserved, and verified', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const envelope = prepareOutboundHandoff(session);
  const longAnswer = 'Paragraph. '.repeat(500);

  const returnPkt = executeMarrowlineContinuation(session, envelope, {
    responseText: longAnswer
  });
  const res = processReturnPacket(session, returnPkt);

  assert.equal(res.status, 'RETURNED_CANDIDATE');
  assert.equal(session.later_return_state.result.answer.length, longAnswer.length);
});

test('25. Attachment present is bound into earlier observed state', () => {
  const session = createSequence6JourneySession({
    documents: [
      { id: 'att-1', name: 'Contract Annex.pdf', text: 'Stated migration fee: 9,600 credits once.', share: true }
    ]
  });

  assert.equal(session.earlier_observed_state.documents.length, 1);
  assert.equal(session.earlier_observed_state.documents[0].id, 'att-1');
  assert.ok(session.earlier_observed_state.genesis_digest);
});

test('26. Reduced motion preserves all 39 carriers in static calm frame', () => {
  const session = createSequence6JourneySession();
  const presentation = generateJourneyPresentation(session, { reducedMotion: true });

  assert.equal(presentation.carrier_count, 39);
  assert.equal(presentation.near_count, 6);
  assert.equal(presentation.mid_count, 13);
  assert.equal(presentation.far_count, 20);
  assert.ok(presentation.svg.includes('Reduced Motion: ENABLED'));
});

test('27. 390px portrait viewport preserves all 39 carriers and all 3 depth planes', () => {
  const session = createSequence6JourneySession();
  const presentation = generateJourneyPresentation(session, {
    viewport: { width: 390, height: 844, compact: true, is_portrait_mobile: true }
  });

  assert.equal(presentation.carrier_count, 39);
  assert.equal(presentation.near_count, 6);
  assert.equal(presentation.mid_count, 13);
  assert.equal(presentation.far_count, 20);
  assert.ok(presentation.svg.includes('width="390"'));
  assert.ok(presentation.svg.includes('height="844"'));
  assert.ok(presentation.svg.includes('viewBox="200 -220 600 1120"'));
});

test('28. Structural rest settles motion without erasing history or acting as confetti', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const env = prepareOutboundHandoff(session);
  const pkt = executeMarrowlineContinuation(session, env);
  processReturnPacket(session, pkt);
  admitCandidateToLoomLedger(session, { explicitAcknowledgment: true });

  enterStructuralRest(session, { reason: 'Diligence brief accepted.' });
  assert.equal(session.current_stage, 'STRUCTURAL_REST');
  assert.equal(session.jurisdiction, 'structural_rest');
  assert.equal(session.events.length, 4);
  assert.ok(session.structural_rest_at_iso);

  const pres = generateJourneyPresentation(session);
  assert.equal(pres.jurisdiction, 'structural_rest');
  assert.ok(pres.svg.includes('STRUCTURAL REST'));
  assert.ok(pres.svg.includes('KINETIC OBLIGATION RESOLVED'));
  assert.equal(pres.carrier_count, 39);
});

test('29. Return from HOLD offers actionable recovery options', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session, { operatorGesture });
  const env = prepareOutboundHandoff(session);
  const pkt = executeMarrowlineContinuation(session, env);

  // Induce HOLD
  processReturnPacket(session, pkt, { independentExpectedHeadDigest: 'c'.repeat(64) });
  assert.equal(session.current_stage, 'HOLD');

  // Test ABORT_JOURNEY recovery
  const abortResult = recoverFromHold(session, 'ABORT_JOURNEY');
  assert.equal(abortResult.action, 'ABORT_JOURNEY');
  assert.equal(session.current_stage, 'LOOM_ORIGIN');
  assert.equal(session.jurisdiction, 'living_field');
  assert.equal(session.hold_state, null);
});

test('30. Issue #691 detached delegation gate conditional behavior', () => {
  const sessionInteractive = createSequence6JourneySession({
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT'
  });
  const authInteractive = issueOutboundAuthorization(sessionInteractive, { operatorGesture });
  assert.equal(authInteractive.issue_691_posture, 'EXTERNAL_CARRIAGE_QUALIFYING_AUTHORIZATION');

  const sessionDetached = createSequence6JourneySession({
    actorClass: 'DETACHED_DELEGATED'
  });

  // Closed gate rejects detached delegation
  assert.throws(() => {
    issueOutboundAuthorization(sessionDetached, {
      operatorGesture,
      detachedGateStatus: { status: 'CLOSED' }
    });
  }, /DETACHED_DELEGATION_GATE_CLOSED/);

  // Open gate verified admits detached delegation
  const authDetached = issueOutboundAuthorization(sessionDetached, {
    operatorGesture,
    detachedGateStatus: { status: 'OPEN' }
  });
  assert.equal(authDetached.issue_691_posture, 'OPEN_VERIFIED_ISSUE_691');
});
