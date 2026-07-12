import {
  auditReturnedFlowCoreReceipt,
  compileRoundTripReceipt,
  replayRoundTripReceipt
} from '../app/engine/aperture-v3-reciprocal-bridge.js';

const base = (process.env.TD613_BASE_URL || process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const fetchTimeoutMs = Number(process.env.TD613_FETCH_TIMEOUT_MS || 15_000);

function boundedFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    signal: options.signal || AbortSignal.timeout(fetchTimeoutMs)
  });
}

function diagnostic(
  metrics,
  id = 'apdiag_phase4_live_probe',
  { route = 'REQUESTED_SYNTHESIS', runtime = 'BACKGROUND' } = {}
) {
  return {
    schema: 'td613.aperture.diagnostic-receipt/v3.0-alpha',
    receipt_id: id,
    instrument: 'TD613 Aperture',
    version: 'v3.0-alpha',
    firmwareSchema: 'td613-aperture/v3.0-alpha',
    posture: 'recommendation-not-command',
    taskIntent: {
      primary_route: route,
      runtime_materiality: runtime,
      automatic_redirect: false
    },
    source: { status: 'DERIVED' },
    runtime: { materiality: runtime },
    produced: { context_request: { metrics } }
  };
}

async function request(operation, payload, traceId = 'phase4-live-probe') {
  const response = await boundedFetch(`${base}/api/aperture-bridge`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ operation, traceId, payload })
  });
  let body;
  try {
    body = await response.json();
  } catch {
    body = { ok: false, error: `non-JSON response (${response.status})` };
  }
  return { response, body };
}

function post(receipt, traceId = 'phase4-live-probe') {
  return request(
    'aperture-bridge-contextualize',
    { diagnosticReceipt: receipt },
    traceId
  );
}

const readiness = await boundedFetch(`${base}/api/aperture-bridge`).then(async response => ({
  response,
  body: await response.json()
}));
if (!readiness.response.ok || !readiness.body.reciprocalReceipts) {
  throw new Error('Phase IV readiness failed');
}
if (readiness.body.contextReceiptSchema !== 'td613.flowcore.context-receipt/v0.1') {
  throw new Error('Phase IV did not adopt v0.1');
}
if (
  readiness.body.reciprocalAuthority !== false
  || readiness.body.artifactRelation !== false
  || readiness.body.automaticAshAction !== false
  || readiness.body.predictionAuthorized !== false
  || readiness.body.operatorClosureRequired !== true
  || readiness.body.openFieldAutoPromotion !== false
) {
  throw new Error('Phase IV authority boundary failed');
}

const metrics = {
  omissionPressure: 0.2,
  coherence: 0.75,
  divergence: 0.3,
  namingSensitivity: 0.4,
  rupturePressure: 0.1
};
const complete = diagnostic(metrics);
const run = await post(complete);
if (!run.response.ok || run.body.result?.schema !== 'td613.flowcore.context-receipt/v0.1') {
  throw new Error('Phase IV context return failed');
}
if (
  run.body.result?.bridge_integration_status !== 'PHASE_4_ACTIVE'
  || run.body.result?.artifact_reference !== null
  || run.body.result?.artifact_blind !== true
  || run.body.result?.reciprocal_authority !== false
  || run.body.result?.operator_closure_required !== true
) {
  throw new Error('Phase IV return posture failed');
}

const audit = auditReturnedFlowCoreReceipt(complete, run.body.result);
if (!audit.recommendation.startsWith('CONTEXT_RECEIPT_ADMISSIBLE')) {
  throw new Error('Phase IV returned audit failed');
}
const roundTrip = await compileRoundTripReceipt(complete, run.body.result, { audit });
const replay = await replayRoundTripReceipt(roundTrip);
if (!replay.status.startsWith('ROUND_TRIP_VERIFIED')) {
  throw new Error('Phase IV replay failed');
}
if (replay.network_called !== false || replay.weather_regenerated !== false || replay.storage_mutated !== false) {
  throw new Error('Phase IV replay crossed a forbidden boundary');
}

const tampered = structuredClone(roundTrip);
tampered.context.receipt.missingness = [
  ...(tampered.context.receipt.missingness || []),
  'phase4-live-probe-tamper'
];
const tamperReplay = await replayRoundTripReceipt(tampered);
if (tamperReplay.status !== 'ROUND_TRIP_HELD_TAMPER') {
  throw new Error('Phase IV tamper replay failed');
}

const incomplete = diagnostic(
  { omissionPressure: 0.2, divergence: 0.3 },
  'apdiag_phase4_abstain_probe'
);
const abstain = await post(incomplete, 'phase4-abstain-probe');
if (
  !abstain.response.ok
  || abstain.body.result?.status !== 'ABSTAIN'
  || abstain.body.result?.context_posture !== 'ABSTAIN_INSUFFICIENT_CONTEXT'
  || abstain.body.result?.modeled_weather !== null
) {
  throw new Error('Phase IV missing-context abstention failed');
}

const invalid = diagnostic(
  { omissionPressure: 0.2, coherence: 0.75, divergence: 1.2 },
  'apdiag_phase4_invalid_probe'
);
const invalidRun = await post(invalid, 'phase4-invalid-probe');
const invalidDivergence = invalidRun.body.result?.measurements?.find(item => item.name === 'divergence');
if (
  !invalidRun.response.ok
  || invalidRun.body.result?.status !== 'ABSTAIN'
  || invalidRun.body.result?.modeled_weather !== null
  || invalidDivergence?.value !== null
) {
  throw new Error('Phase IV invalid-range abstention failed');
}

const authorityAudit = auditReturnedFlowCoreReceipt(complete, {
  ...run.body.result,
  automatic_ash_action: true
});
if (authorityAudit.recommendation !== 'REJECT_AUTHORITY_BREACH') {
  throw new Error('Phase IV authority-injection audit failed');
}

const mismatchAudit = auditReturnedFlowCoreReceipt(complete, {
  ...run.body.result,
  diagnostic_receipt_reference: 'apdiag_wrong_reference'
});
if (mismatchAudit.recommendation !== 'HOLD_FOR_REPAIR') {
  throw new Error('Phase IV reference-mismatch audit failed');
}

const openFieldDiagnostic = diagnostic(
  metrics,
  'apdiag_phase4_open_field_probe',
  { route: 'OPEN_FIELD_SPECULATIVE_SYNTHESIS', runtime: 'BACKGROUND' }
);
const openFieldRun = await post(openFieldDiagnostic, 'phase4-open-field-probe');
const openFieldAudit = auditReturnedFlowCoreReceipt(openFieldDiagnostic, openFieldRun.body.result);
if (
  !openFieldRun.response.ok
  || openFieldRun.body.result?.task_intent?.primary_route !== 'OPEN_FIELD_SPECULATIVE_SYNTHESIS'
  || openFieldAudit.open_field_promotion !== false
  || openFieldAudit.runtime_materiality !== 'BACKGROUND'
  || openFieldAudit.runtime_surfaced !== false
  || !openFieldAudit.warnings.includes('context_available_not_promoted')
) {
  throw new Error('Phase IV Open Field or quiet-runtime boundary failed');
}

const injected = { ...complete, artifact_digest: 'sha256:must-reject' };
const rejection = await post(injected, 'phase4-artifact-rejection-probe');
if (rejection.response.status !== 400 || rejection.body?.ok !== false) {
  throw new Error('Phase IV artifact rejection failed');
}

const legacy = await request(
  'aperture-bridge-migrate-vnext',
  {
    contextReceipt: {
      schema: 'td613.flowcore.context-receipt/vNext',
      source_status: 'DERIVED',
      diagnostic_receipt_reference: 'apdiag_legacy_probe',
      artifact_reference: null
    }
  },
  'phase4-legacy-migration-probe'
);
if (
  !legacy.response.ok
  || legacy.body.result?.migration_status !== 'LEGACY_PROVISIONAL_NORMALIZED'
  || legacy.body.result?.native_v01 !== false
  || legacy.body.result?.bridge_integration_status !== 'LEGACY_PHASE_4_MIGRATION'
) {
  throw new Error('Phase IV legacy migration boundary failed');
}

console.log(JSON.stringify({
  base_url: base,
  readiness: readiness.body.status,
  context_schema: run.body.result.schema,
  context_receipt: run.body.result.receipt_id,
  audit: audit.recommendation,
  round_trip: roundTrip.receipt_id,
  replay: replay.status,
  tamper_replay: tamperReplay.status,
  abstention: abstain.body.result.context_posture,
  invalid_range: invalidRun.body.result.context_posture,
  authority_injection: authorityAudit.recommendation,
  reference_mismatch: mismatchAudit.recommendation,
  open_field: openFieldAudit.warnings,
  quiet_runtime_surfaced: openFieldAudit.runtime_surfaced,
  artifact_rejection: rejection.response.status,
  legacy_migration: legacy.body.result.migration_status,
  reciprocal_authority: false,
  automatic_ash_action: false,
  prediction_authorized: false
}, null, 2));
