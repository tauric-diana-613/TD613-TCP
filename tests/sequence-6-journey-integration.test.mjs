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
  recoverFromHold,
  exportRouteMemory,
  restoreRouteMemory,
  generateJourneyPresentation,
  mapStageToJurisdiction,
  mapStageToFlowcoreRelation,
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

  // Stage 2: Outbound authorization (INV-01, INV-02, INV-03)
  const auth = issueOutboundAuthorization(session, {
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT',
    operatorGestureId: 'user_click_send_01'
  });
  assert.equal(auth.single_shot_spent, false);
  assert.equal(auth.actor_class, 'INTERACTIVE_OPERATOR_DIRECT');
  assert.equal(auth.issue_691_posture, 'EXTERNAL_CARRIAGE_QUALIFYING_AUTHORIZATION');

  const outboundEnvelope = prepareOutboundHandoff(session);
  assert.equal(session.current_stage, 'EXPLICIT_OUTBOUND_AUTHORIZATION');
  assert.equal(session.jurisdiction, 'authorization_boundary');
  assert.equal(session.events.length, 1);
  assert.equal(session.outbound_authorization.single_shot_spent, true, 'Single-shot token is spent');
  assert.equal(outboundEnvelope.payload.documents.length, 1, 'Local-only doc-2 stayed outside transfer');

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

  // Stage 4 & 5: Return / Re-entry & Receipt Inspection
  const reEntryResult = processReturnPacket(session, returnPacket, {
    expectedHeadDigest: returnPacket.terminal_head_digest
  });
  assert.equal(reEntryResult.status, 'RECEIPT_INSPECTION');
  assert.equal(session.current_stage, 'RECEIPT_INSPECTION');
  assert.equal(session.jurisdiction, 'receipt_inspection');
  assert.equal(reEntryResult.headAnchorStatus, 'ANCHORED_MATCH');
  assert.equal(session.outbound_authorization, null, 'Outbound authorization strictly closed on return (INV-04)');

  // Verify Temporal Non-Retroactivity (INV-11)
  assert.ok(session.earlier_observed_state, 'Earlier observed state preserved');
  assert.ok(session.later_return_state, 'Later return state preserved');
  assert.ok(session.current_reconstructed_state, 'Current reconstructed state present');
  assert.notEqual(session.earlier_observed_state, session.current_reconstructed_state);
  assert.equal(session.current_reconstructed_state.loom_admission_status, 'NOT_YET_ADMITTED_AWAITING_EXPLICIT_GESTURE');

  // Stage 6: Explicit Local Admission
  admitCandidateToLoomLedger(session, {
    explicitAcknowledgment: true,
    operatorId: 'operator_1'
  });
  assert.equal(session.current_reconstructed_state.loom_admission_status, 'ADMITTED_INTO_LOCAL_LEDGER');
  assert.equal(session.events.length, 3);

  // Stage 7: Lawful Structural Rest (𝄐)
  enterStructuralRest(session, { reason: 'Review complete; obligation resolved.' });
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
  issueOutboundAuthorization(session);
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
  issueOutboundAuthorization(session);
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

test('4. Terminal-head mismatch when anchored transitions to HOLD', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Provide a contradictory expected head digest anchor
  const bogusExpectedHead = 'f'.repeat(64);
  const result = processReturnPacket(session, returnPacket, {
    expectedHeadDigest: bogusExpectedHead
  });

  assert.equal(result.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'TERMINAL_HEAD_MISMATCH');
  assert.equal(result.chainVerification.head_anchor_status, 'ANCHOR_MISMATCH');
});

test('5. Unanchored return surfaces UNANCHORED explicitly without fabricating authority', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Return with NO expected terminal head anchor (null)
  const result = processReturnPacket(session, returnPacket, {
    expectedHeadDigest: null
  });

  assert.equal(result.status, 'RECEIPT_INSPECTION');
  assert.equal(result.headAnchorStatus, 'UNANCHORED');
  assert.equal(session.current_reconstructed_state.head_anchor_status, 'UNANCHORED');
  assert.equal(session.current_reconstructed_state.loom_admission_status, 'NOT_YET_ADMITTED_AWAITING_EXPLICIT_GESTURE');
});

test('6. Stale route / invalid transition is rejected without corrupting state', () => {
  const session = createSequence6JourneySession();

  // Try to jump directly from LOOM_ORIGIN to MARROWLINE_CONTINUATION without outbound authorization
  assert.throws(() => {
    executeMarrowlineContinuation(session, {});
  }, /Invalid stage transition/);

  assert.equal(session.current_stage, 'LOOM_ORIGIN');
});

test('7. Retry after failure requires fresh authorization token and preserves deficit record', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const outboundEnvelope = prepareOutboundHandoff(session);
  const returnPacket = executeMarrowlineContinuation(session, outboundEnvelope);

  // Trigger HOLD via terminal head mismatch
  processReturnPacket(session, returnPacket, { expectedHeadDigest: '0'.repeat(64) });
  assert.equal(session.current_stage, 'HOLD');

  // Operator inspects deficit
  const inspectResult = recoverFromHold(session, 'INSPECT_DEFICIT');
  assert.equal(inspectResult.inspected, true);
  assert.equal(inspectResult.hold_state.defect_code, 'TERMINAL_HEAD_MISMATCH');

  // Operator triggers RETRY
  const retryResult = recoverFromHold(session, 'RETRY', { newPrompt: 'Revised task prompt' });
  assert.equal(retryResult.action, 'RETRY');
  assert.equal(session.current_stage, 'LOOM_ORIGIN');
  assert.equal(session.route_memory.retries_count, 1);
  assert.equal(session.outbound_authorization, null, 'Must re-authorize cleanly; no standing authority');
});

test('8. Reload before Send retains draft without granting standing outbound authority', () => {
  const session = createSequence6JourneySession({
    task: 'Draft task before send'
  });

  const serialized = exportRouteMemory(session);
  const restored = restoreRouteMemory(serialized);

  assert.equal(restored.current_stage, 'LOOM_ORIGIN');
  assert.equal(restored.earlier_observed_state.task, 'Draft task before send');
  assert.equal(restored.outbound_authorization, null, 'ROUTE_MEMORY != AUTHORITY_MEMORY');
});

test('9. Reload after Send preserves route memory but revokes Send authority', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  prepareOutboundHandoff(session);

  assert.equal(session.current_stage, 'EXPLICIT_OUTBOUND_AUTHORIZATION');

  // Serialize route memory (e.g., page reload or tab restore)
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

test('10. Back navigation preserves event history and prevents retroactive rewriting', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const envelope = prepareOutboundHandoff(session);
  const returnPkt = executeMarrowlineContinuation(session, envelope);
  processReturnPacket(session, returnPkt, { expectedHeadDigest: returnPkt.terminal_head_digest });

  assert.equal(session.current_stage, 'RECEIPT_INSPECTION');

  // Simulated back navigation to origin view
  const serialized = exportRouteMemory(session);
  const backSession = restoreRouteMemory(serialized);

  // Historical events remain untouched
  assert.equal(backSession.events.length, 2);
  assert.equal(backSession.earlier_observed_state.task, session.earlier_observed_state.task);
  assert.equal(backSession.later_return_state.result.answer, session.later_return_state.result.answer);
  assert.equal(backSession.outbound_authorization, null);
});

test('11. Restored tab enforces clean authority closure', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  prepareOutboundHandoff(session);

  const saved = exportRouteMemory(session);
  const restoredTab = restoreRouteMemory(saved);

  assert.equal(restoredTab.session_id, session.session_id);
  assert.equal(restoredTab.outbound_authorization, null, 'Restored tab has no outbound authority');
});

test('12. Duplicate return is detected and does not rewind or corrupt the chain', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const envelope = prepareOutboundHandoff(session);
  const returnPkt = executeMarrowlineContinuation(session, envelope);

  const res1 = processReturnPacket(session, returnPkt, { expectedHeadDigest: returnPkt.terminal_head_digest });
  assert.equal(res1.status, 'RECEIPT_INSPECTION');
  const head1 = session.head_digest;

  // Process same packet again
  const res2 = processReturnPacket(session, returnPkt, { expectedHeadDigest: returnPkt.terminal_head_digest });
  assert.equal(res2.status, 'RECEIPT_INSPECTION');
  assert.equal(session.head_digest, head1, 'Head digest unchanged on duplicate return');
  assert.equal(session.events.length, 2);
});

test('13. Contradictory receipt / non-monotonic timestamp triggers HOLD (INV-11)', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const envelope = prepareOutboundHandoff(session);
  const returnPkt = executeMarrowlineContinuation(session, envelope);

  // Inject a contradictory retrograde timestamp in the return event
  const eventsCopy = structuredClone(returnPkt.events);
  eventsCopy[1].measurement_time_iso = '2020-01-01T00:00:00.000Z';
  eventsCopy[1].recording_time_iso = '2020-01-01T00:00:00.000Z'; // Precedes event 0 (which is in 2026)
  const badPkt = { ...returnPkt, events: eventsCopy };

  const res = processReturnPacket(session, badPkt);
  assert.equal(res.status, 'HELD');
  assert.equal(session.current_stage, 'HOLD');
  assert.equal(session.hold_state.defect_code, 'CHRONOLOGY_NON_MONOTONIC');
});

test('14. Canonicalization parity rejects lone surrogates into HOLD', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const envelope = prepareOutboundHandoff(session);

  // Corrupt return payload with a lone surrogate
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

test('15. Long response is bounded, preserved, and verified', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const envelope = prepareOutboundHandoff(session);
  const longAnswer = 'Paragraph. '.repeat(500);

  const returnPkt = executeMarrowlineContinuation(session, envelope, {
    responseText: longAnswer
  });
  const res = processReturnPacket(session, returnPkt, {
    expectedHeadDigest: returnPkt.terminal_head_digest
  });

  assert.equal(res.status, 'RECEIPT_INSPECTION');
  assert.equal(session.later_return_state.result.answer.length, longAnswer.length);
});

test('16. Attachment present is bound into earlier observed state', () => {
  const session = createSequence6JourneySession({
    documents: [
      { id: 'att-1', name: 'Contract Annex.pdf', text: 'Stated migration fee: 9,600 credits once.', share: true }
    ]
  });

  assert.equal(session.earlier_observed_state.documents.length, 1);
  assert.equal(session.earlier_observed_state.documents[0].id, 'att-1');
  assert.ok(session.earlier_observed_state.genesis_digest);
});

test('17. Reduced motion preserves all 39 carriers in static calm frame', () => {
  const session = createSequence6JourneySession();
  const presentation = generateJourneyPresentation(session, { reducedMotion: true });

  assert.equal(presentation.carrier_count, 39);
  assert.equal(presentation.near_count, 6);
  assert.equal(presentation.mid_count, 13);
  assert.equal(presentation.far_count, 20);
  assert.ok(presentation.svg.includes('Reduced Motion: ENABLED'));
});

test('18. 390px portrait viewport preserves all 39 carriers and all 3 depth planes', () => {
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

test('19. Structural rest settles motion without erasing history or acting as confetti', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const env = prepareOutboundHandoff(session);
  const pkt = executeMarrowlineContinuation(session, env);
  processReturnPacket(session, pkt, { expectedHeadDigest: pkt.terminal_head_digest });
  admitCandidateToLoomLedger(session, { explicitAcknowledgment: true });

  enterStructuralRest(session, { reason: 'Diligence brief accepted.' });
  assert.equal(session.current_stage, 'STRUCTURAL_REST');
  assert.equal(session.jurisdiction, 'structural_rest');
  assert.equal(session.events.length, 3);
  assert.ok(session.structural_rest_at_iso);

  const pres = generateJourneyPresentation(session);
  assert.equal(pres.jurisdiction, 'structural_rest');
  assert.ok(pres.svg.includes('STRUCTURAL REST'));
  assert.ok(pres.svg.includes('KINETIC OBLIGATION RESOLVED'));
  assert.equal(pres.carrier_count, 39);
});

test('20. Return from HOLD offers actionable recovery options', () => {
  const session = createSequence6JourneySession();
  issueOutboundAuthorization(session);
  const env = prepareOutboundHandoff(session);
  const pkt = executeMarrowlineContinuation(session, env);

  // Induce HOLD
  processReturnPacket(session, pkt, { expectedHeadDigest: 'c'.repeat(64) });
  assert.equal(session.current_stage, 'HOLD');

  // Test ABORT_JOURNEY recovery
  const abortResult = recoverFromHold(session, 'ABORT_JOURNEY');
  assert.equal(abortResult.action, 'ABORT_JOURNEY');
  assert.equal(session.current_stage, 'LOOM_ORIGIN');
  assert.equal(session.jurisdiction, 'living_field');
  assert.equal(session.hold_state, null);
});

test('21. Issue #691 detached delegation gate conditional behavior', () => {
  const sessionInteractive = createSequence6JourneySession({
    actorClass: 'INTERACTIVE_OPERATOR_DIRECT'
  });
  const authInteractive = issueOutboundAuthorization(sessionInteractive);
  assert.equal(authInteractive.issue_691_posture, 'EXTERNAL_CARRIAGE_QUALIFYING_AUTHORIZATION');

  const sessionDetached = createSequence6JourneySession({
    actorClass: 'DETACHED_DELEGATED'
  });

  // Closed gate rejects detached delegation
  assert.throws(() => {
    issueOutboundAuthorization(sessionDetached, {
      detachedGateStatus: { status: 'CLOSED' }
    });
  }, /DETACHED_DELEGATION_GATE_CLOSED/);

  // Open gate verified admits detached delegation
  const authDetached = issueOutboundAuthorization(sessionDetached, {
    detachedGateStatus: { status: 'OPEN' }
  });
  assert.equal(authDetached.issue_691_posture, 'OPEN_VERIFIED_ISSUE_691');
});
