import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FLOWCORE_CONTEXT_SCHEMA,
  auditReturnedFlowCoreReceipt,
  compileRoundTripReceipt,
  migrateLegacyVNextReceipt,
  phase4RequestEnvelope,
  replayRoundTripReceipt
} from '../app/engine/aperture-v3-reciprocal-bridge.js';

function diagnostic(route = 'REQUESTED_SYNTHESIS', runtime = 'BACKGROUND') {
  return {
    schema: 'td613.aperture.diagnostic-receipt/v3.0-alpha',
    receipt_id: 'apdiag_0123456789abcdef0123',
    instrument: 'TD613 Aperture',
    version: 'v3.0-alpha',
    firmwareSchema: 'td613-aperture/v3.0-alpha',
    posture: 'recommendation-not-command',
    taskIntent: { primary_route: route, runtime_materiality: runtime, automatic_redirect: false },
    source: { status: 'DERIVED' },
    runtime: { materiality: runtime },
    produced: { context_request: { metrics: {
      omissionPressure: 0.2,
      coherence: 0.75,
      divergence: 0.3,
      namingSensitivity: 0.4,
      rupturePressure: 0.1
    } } }
  };
}

function context(status = 'OPEN') {
  const open = status === 'OPEN';
  return {
    status,
    schema: FLOWCORE_CONTEXT_SCHEMA,
    receipt_id: 'flowctx_0123456789abcdef0123',
    context_posture: open ? 'CONTEXT_READY' : 'ABSTAIN_INSUFFICIENT_CONTEXT',
    source_status: open ? 'DERIVED' : 'UNRESOLVED',
    sensor_id: 'flowcore-context-instrument',
    authority_class: open ? 'A2_DERIVATIONAL' : 'A1_OBSERVATIONAL',
    diagnostic_receipt_reference: 'apdiag_0123456789abcdef0123',
    artifact_reference: null,
    artifact_blind: true,
    measurements: open ? [
      { name: 'omissionPressure', value: 0.2, source_status: 'DERIVED', sensor_id: 'aperture-diagnostic-receipt', transformation_history: ['declared'], missingness: [], calibration: { status: 'DECLARED_NOT_INDEPENDENT' } },
      { name: 'coherence', value: 0.75, source_status: 'DERIVED', sensor_id: 'aperture-diagnostic-receipt', transformation_history: ['declared'], missingness: [], calibration: { status: 'DECLARED_NOT_INDEPENDENT' } },
      { name: 'divergence', value: 0.3, source_status: 'DERIVED', sensor_id: 'aperture-diagnostic-receipt', transformation_history: ['declared'], missingness: [], calibration: { status: 'DECLARED_NOT_INDEPENDENT' } }
    ] : [],
    modeled_weather: open ? { humidity: 0.2, visibility: 0.75, divergence: 0.3, routePressure: 0.2125, modeled: true } : null,
    weather: open ? { humidity: 0.2, visibility: 0.75, divergence: 0.3, routePressure: 0.2125, modeled: true } : null,
    missingness: open ? [] : ['required metric absent: coherence'],
    uncertainty: { class: open ? 'measurement-and-transformation-bounded' : 'insufficient-context', value: null },
    alternatives: [],
    privacy: { visibility: 'PRIVATE_LOCAL_DEFAULT', public_export: false, artifact_blind: true, persistent_server_storage: false },
    recommendation_not_command: true,
    automatic_ash_action: false,
    prediction_authorized: false,
    bridge_integration_status: 'PHASE_4_ACTIVE',
    reciprocal_authority: false
  };
}

const envelope = phase4RequestEnvelope(diagnostic(), { traceId: 'phase4-static-test' });
assert.equal(envelope.operation, 'aperture-bridge-contextualize');
assert.equal(envelope.payload.diagnosticReceipt.receipt_id, 'apdiag_0123456789abcdef0123');

const audit = auditReturnedFlowCoreReceipt(diagnostic(), context(), {
  auditId: 'apret_0123456789abcdef0123',
  createdAt: '2026-07-12T00:00:00.000Z'
});
assert.equal(audit.recommendation, 'CONTEXT_RECEIPT_ADMISSIBLE_FOR_BOUNDED_REVIEW');
assert.equal(audit.runtime_materiality, 'BACKGROUND');
assert.equal(audit.runtime_surfaced, false);
assert.equal(audit.open_field_promotion, false);

const abstainAudit = auditReturnedFlowCoreReceipt(diagnostic(), context('ABSTAIN'));
assert.ok(abstainAudit.recommendation.startsWith('CONTEXT_RECEIPT_ADMISSIBLE'));
assert.equal(abstainAudit.abstention_preserved, true);

const authorityAudit = auditReturnedFlowCoreReceipt(diagnostic(), { ...context(), automatic_ash_action: true });
assert.equal(authorityAudit.recommendation, 'REJECT_AUTHORITY_BREACH');

const speculativeAudit = auditReturnedFlowCoreReceipt(
  diagnostic('OPEN_FIELD_SPECULATIVE_SYNTHESIS'),
  context()
);
assert.equal(speculativeAudit.open_field_promotion, false);
assert.ok(speculativeAudit.warnings.includes('context_available_not_promoted'));

const roundTrip = await compileRoundTripReceipt(diagnostic(), context(), {
  audit,
  receiptId: 'aprt_0123456789abcdef0123',
  createdAt: '2026-07-12T00:00:01.000Z'
});
assert.match(roundTrip.round_trip_digest, /^sha256:[0-9a-f]{64}$/);
assert.equal(roundTrip.jurisdiction.reciprocal_authority, false);
assert.equal(roundTrip.jurisdiction.automatic_ash_action, false);

const replay = await replayRoundTripReceipt(roundTrip);
assert.equal(replay.status, 'ROUND_TRIP_VERIFIED');
assert.equal(replay.network_called, false);
assert.equal(replay.weather_regenerated, false);
assert.equal(replay.storage_mutated, false);

const tampered = structuredClone(roundTrip);
tampered.context.receipt.missingness = ['tampered'];
const held = await replayRoundTripReceipt(tampered);
assert.equal(held.status, 'ROUND_TRIP_HELD_TAMPER');
assert.ok(held.errors.includes('context_digest_mismatch'));

const migrated = migrateLegacyVNextReceipt({
  schema: 'td613.flowcore.context-receipt/vNext',
  source_status: 'DERIVED',
  artifact_reference: null
});
assert.equal(migrated.native_v01, false);
assert.equal(migrated.migration_status, 'LEGACY_PROVISIONAL_NORMALIZED');

const lab = fs.readFileSync('app/dome-world/reciprocal-bridge.html', 'utf8');
assert.match(lab, /I was broken into a circle/);
assert.match(lab, /Send explicitly/);
assert.match(lab, /Replay locally/);
assert.doesNotMatch(lab, /innerHTML/);

const shim = fs.readFileSync('app/aperture/index.html', 'utf8');
assert.match(shim, /aperture-v3-reciprocal-bridge\.js/);
assert.match(shim, /td613:phase4-reciprocal-bridge-ready/);

console.log('aperture-phase4-bridge.test.mjs passed');
