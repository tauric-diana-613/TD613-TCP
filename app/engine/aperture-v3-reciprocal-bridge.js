import { canonicalDigest } from '../dome-world/ash/canonical-json.js';

export const PHASE4_BRIDGE_CONTRACT = 'td613.phase4.reciprocal-bridge/v0.1';
export const APERTURE_DIAGNOSTIC_SCHEMA = 'td613.aperture.diagnostic-receipt/v3.0-alpha';
export const FLOWCORE_CONTEXT_SCHEMA = 'td613.flowcore.context-receipt/v0.1';
export const RETURNED_CONTEXT_AUDIT_SCHEMA = 'td613.aperture.returned-context-audit/v0.1';
export const ROUND_TRIP_RECEIPT_SCHEMA = 'td613.aperture.round-trip-receipt/v3.0-alpha';
export const LEGACY_CONTEXT_SCHEMA = 'td613.flowcore.context-receipt/vNext';
export const LEGACY_MIGRATION_SCHEMA = 'td613.flowcore.context-receipt-migration/v0.1';

export const PHASE4_DIGEST_DOMAINS = Object.freeze({
  diagnostic: 'TD613:PHASE4:DIAGNOSTIC:v1',
  context: 'TD613:PHASE4:CONTEXT:v1',
  audit: 'TD613:PHASE4:AUDIT:v1',
  roundTrip: 'TD613:PHASE4:ROUNDTRIP:v1'
});

const RUNTIME_LEVELS = new Set(['NONE', 'BACKGROUND', 'MATERIAL', 'DISPOSITIVE']);
const OPEN_FIELD_ROUTES = new Set([
  'OPEN_FIELD_SPECULATIVE_SYNTHESIS',
  'OPEN_FIELD_CREATIVE_SYNTHESIS'
]);
const REQUIRED_METRICS = ['omissionPressure', 'coherence', 'divergence'];
const FORBIDDEN_KEYS = new Set([
  'artifact_digest', 'artifactDigest', 'manifest_digest', 'manifestDigest',
  'receipt_digest', 'receiptDigest', 'content_hash', 'contentHash',
  'rawBytes', 'fileBytes', 'fileContent', 'rawText', 'sensitiveText'
]);

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function active(value) {
  return ![null, undefined, '', false].includes(value)
    && !(Array.isArray(value) && value.length === 0)
    && !(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function randomId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10);
  cryptoImpl.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

function now() {
  return new Date().toISOString();
}

function walk(value, visit, path = '$') {
  if (Array.isArray(value)) {
    value.forEach((child, index) => walk(child, visit, `${path}[${index}]`));
    return;
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) => {
      const childPath = `${path}.${key}`;
      visit(key, child, childPath);
      walk(child, visit, childPath);
    });
  }
}

function rejectArtifactMaterial(value) {
  walk(value, (key, child, path) => {
    if (FORBIDDEN_KEYS.has(key) && active(child)) {
      throw new Error(`Phase IV is artifact-blind; prohibited field: ${path}`);
    }
    if ((key === 'artifact_reference' || key === 'artifactReference') && active(child)) {
      throw new Error(`Phase IV cannot accept an artifact relation: ${path}`);
    }
  });
}

function taskIntentOf(diagnostic) {
  const task = plainObject(diagnostic?.taskIntent || diagnostic?.task_intent);
  const primaryRoute = String(task.primary_route || task.primaryRoute || '').trim();
  if (!primaryRoute) throw new Error('Diagnostic receipt requires a task-intent route.');
  const runtimeMateriality = String(
    task.runtime_materiality || task.runtimeMateriality || 'BACKGROUND'
  ).toUpperCase();
  if (!RUNTIME_LEVELS.has(runtimeMateriality)) {
    throw new Error('Diagnostic receipt has unsupported runtime materiality.');
  }
  if (task.automatic_redirect === true || task.automaticRedirect === true) {
    throw new Error('Diagnostic receipt cannot request automatic redirect.');
  }
  return Object.freeze({
    ...clone(task),
    primary_route: primaryRoute,
    runtime_materiality: runtimeMateriality,
    automatic_redirect: false
  });
}

export function validateApertureDiagnosticReceipt(receipt) {
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
    throw new TypeError('Phase IV requires an Aperture diagnostic receipt object.');
  }
  rejectArtifactMaterial(receipt);
  if (receipt.schema !== APERTURE_DIAGNOSTIC_SCHEMA) throw new Error('Unsupported diagnostic schema.');
  if (!/^apdiag_[A-Za-z0-9_-]{6,128}$/.test(String(receipt.receipt_id || receipt.receiptId || ''))) {
    throw new Error('Diagnostic receipt ID is missing or malformed.');
  }
  if (receipt.instrument != null && receipt.instrument !== 'TD613 Aperture') {
    throw new Error('Diagnostic instrument identity mismatch.');
  }
  if (receipt.version != null && receipt.version !== 'v3.0-alpha') {
    throw new Error('Diagnostic Aperture version mismatch.');
  }
  const firmware = receipt.firmwareSchema ?? receipt.firmware_schema;
  if (firmware != null && firmware !== 'td613-aperture/v3.0-alpha') {
    throw new Error('Diagnostic firmware schema mismatch.');
  }
  if (receipt.posture != null && receipt.posture !== 'recommendation-not-command') {
    throw new Error('Diagnostic posture must remain recommendation-not-command.');
  }
  taskIntentOf(receipt);
  return receipt;
}

export function phase4RequestEnvelope(diagnosticReceipt, { traceId = null, conditions = [], alternatives = [] } = {}) {
  validateApertureDiagnosticReceipt(diagnosticReceipt);
  return Object.freeze({
    operation: 'aperture-bridge-contextualize',
    traceId: traceId || randomId('phase4_'),
    apertureContext: Object.freeze({
      version: 'v3.0-alpha',
      schema: 'td613-aperture/v3.0-alpha',
      observedRegime: 'PRCS-A'
    }),
    payload: Object.freeze({
      diagnosticReceipt: clone(diagnosticReceipt),
      conditions: clone(conditions),
      alternatives: clone(alternatives)
    })
  });
}

export async function sendApertureDiagnosticReceipt(
  diagnosticReceipt,
  { endpoint = '/api/aperture-bridge', fetchImpl = globalThis.fetch, ...options } = {}
) {
  if (typeof fetchImpl !== 'function') throw new Error('Fetch is unavailable.');
  const envelope = phase4RequestEnvelope(diagnosticReceipt, options);
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(envelope)
  });
  const body = await response.json();
  if (!response.ok || !body?.ok) {
    throw new Error(body?.error || `Phase IV bridge failed with HTTP ${response.status}.`);
  }
  return body.result;
}

function auditCore(diagnosticReceipt, contextReceipt) {
  const diagnostic = validateApertureDiagnosticReceipt(diagnosticReceipt);
  const context = plainObject(contextReceipt);
  const taskIntent = taskIntentOf(diagnostic);
  const rejected = [];
  const contradictions = [];
  const warnings = [];
  const accepted = [];

  if (context.schema !== FLOWCORE_CONTEXT_SCHEMA) rejected.push('context_schema_must_be_v0_1');
  const diagnosticId = diagnostic.receipt_id || diagnostic.receiptId;
  if (context.diagnostic_receipt_reference !== diagnosticId) rejected.push('diagnostic_reference_mismatch');
  if (context.artifact_reference !== null) rejected.push('artifact_reference_must_remain_null');
  if (context.artifact_blind !== true) rejected.push('artifact_blind_must_remain_true');
  if (context.recommendation_not_command !== true) rejected.push('recommendation_not_command_must_remain_true');
  if (context.automatic_ash_action !== false) rejected.push('automatic_ash_action_must_remain_false');
  if (context.prediction_authorized !== false) rejected.push('prediction_authorized_must_remain_false');
  if (context.privacy?.visibility !== 'PRIVATE_LOCAL_DEFAULT') rejected.push('privacy_must_remain_private_local_default');
  if (context.privacy?.public_export !== false) rejected.push('public_export_must_remain_false');
  if (context.privacy?.persistent_server_storage !== false) rejected.push('persistent_server_storage_must_remain_false');
  if (context.reciprocal_authority === true) rejected.push('reciprocal_authority_must_remain_false');

  if (context.status === 'ABSTAIN') {
    if (context.context_posture !== 'ABSTAIN_INSUFFICIENT_CONTEXT') {
      contradictions.push('abstain_posture_mismatch');
    }
    if (context.modeled_weather != null || context.weather != null) {
      contradictions.push('abstain_must_withhold_weather');
    }
  } else if (context.status === 'OPEN') {
    if (context.context_posture !== 'CONTEXT_READY') contradictions.push('open_posture_mismatch');
    const unresolvedRequired = (context.measurements || []).filter(item =>
      REQUIRED_METRICS.includes(item?.name)
      && (item?.value == null || item?.source_status === 'UNRESOLVED' || (item?.missingness || []).length)
    );
    if (unresolvedRequired.length) contradictions.push('context_ready_contains_unresolved_required_metric');
  } else {
    rejected.push('unsupported_context_status');
  }

  for (const item of context.measurements || []) {
    if (item?.declared_sensor_id === 'simulated-fixture' && item?.source_status === 'OBSERVED') {
      contradictions.push('simulated_sensor_presented_as_observed');
    }
    if (['DERIVED', 'SIMULATED', 'INFERRED'].includes(item?.source_status)
      && !(item?.transformation_history || []).length) {
      contradictions.push(`missing_transformation_history:${item?.name || 'unknown'}`);
    }
  }

  if ((context.missingness || []).length) warnings.push('missingness_present');
  if ((context.alternatives || []).length) warnings.push('alternatives_present');
  if ((context.measurements || []).some(item => item?.calibration?.status === 'UNDECLARED')) {
    warnings.push('calibration_undeclared');
  }
  if (OPEN_FIELD_ROUTES.has(taskIntent.primary_route)) warnings.push('context_available_not_promoted');

  if (!rejected.length && !contradictions.length) {
    accepted.push('schema_and_provenance');
    accepted.push('authority_nontransfer');
    accepted.push(context.status === 'ABSTAIN' ? 'abstention_preserved' : 'bounded_context_ready');
  }

  const authorityBreach = rejected.some(item => /artifact|authority|ash|prediction|public_export|storage|command/.test(item));
  const recommendation = authorityBreach
    ? 'REJECT_AUTHORITY_BREACH'
    : rejected.length || contradictions.length
      ? 'HOLD_FOR_REPAIR'
      : warnings.length
        ? 'CONTEXT_RECEIPT_ADMISSIBLE_WITH_WARNINGS'
        : 'CONTEXT_RECEIPT_ADMISSIBLE_FOR_BOUNDED_REVIEW';

  return Object.freeze({
    schema: RETURNED_CONTEXT_AUDIT_SCHEMA,
    diagnostic_receipt_reference: diagnosticId,
    context_receipt_reference: context.receipt_id || null,
    context_schema: context.schema || null,
    task_intent_route: taskIntent.primary_route,
    runtime_materiality: taskIntent.runtime_materiality,
    runtime_surfaced: ['MATERIAL', 'DISPOSITIVE'].includes(taskIntent.runtime_materiality),
    open_field_promotion: false,
    received: Object.freeze(['diagnostic_receipt', 'context_receipt']),
    accepted: Object.freeze(accepted),
    rejected: Object.freeze(rejected),
    contradictions: Object.freeze(contradictions),
    warnings: Object.freeze(warnings),
    missingness_preserved: Array.isArray(context.missingness),
    abstention_preserved: context.status !== 'ABSTAIN'
      || (context.context_posture === 'ABSTAIN_INSUFFICIENT_CONTEXT' && context.modeled_weather == null),
    authority_transfer_detected: authorityBreach,
    artifact_relation_detected: context.artifact_reference !== null,
    recommendation,
    recommendation_not_command: true,
    automatic_ash_action: false,
    prediction_authorized: false,
    operator_closure_required: true
  });
}

export function auditReturnedFlowCoreReceipt(
  diagnosticReceipt,
  contextReceipt,
  { auditId = null, createdAt = null } = {}
) {
  return Object.freeze({
    ...auditCore(diagnosticReceipt, contextReceipt),
    audit_id: auditId || randomId('apret_'),
    created_at: createdAt || now()
  });
}

function normalizeForDigest(value, path = '$') {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Object.is(value, -0)) throw new TypeError(`${path} contains an invalid number.`);
    if (Number.isSafeInteger(value)) return value;
    return value.toString();
  }
  if (Array.isArray(value)) return value.map((item, index) => normalizeForDigest(item, `${path}[${index}]`));
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value)) out[key] = normalizeForDigest(value[key], `${path}.${key}`);
    return out;
  }
  throw new TypeError(`${path} contains an unsupported value.`);
}

async function digest(domain, value, options = {}) {
  return canonicalDigest(domain, normalizeForDigest(value), options);
}

function roundTripDigestSubject(receipt) {
  const subject = clone(receipt);
  delete subject.round_trip_digest;
  return subject;
}

export async function compileRoundTripReceipt(
  diagnosticReceipt,
  contextReceipt,
  {
    audit = null,
    receiptId = null,
    createdAt = null,
    cryptoImpl = globalThis.crypto,
    TextEncoderImpl = globalThis.TextEncoder
  } = {}
) {
  const returnedAudit = audit || auditReturnedFlowCoreReceipt(diagnosticReceipt, contextReceipt);
  const digestOptions = { cryptoImpl, TextEncoderImpl };
  const diagnosticDigest = await digest(PHASE4_DIGEST_DOMAINS.diagnostic, diagnosticReceipt, digestOptions);
  const contextDigest = await digest(PHASE4_DIGEST_DOMAINS.context, contextReceipt, digestOptions);
  const auditDigest = await digest(PHASE4_DIGEST_DOMAINS.audit, returnedAudit, digestOptions);
  const taskIntent = taskIntentOf(diagnosticReceipt);
  const receipt = {
    schema: ROUND_TRIP_RECEIPT_SCHEMA,
    bridge_contract: PHASE4_BRIDGE_CONTRACT,
    receipt_id: receiptId || randomId('aprt_', cryptoImpl),
    created_at: createdAt || now(),
    diagnostic: { receipt: clone(diagnosticReceipt), digest: diagnosticDigest },
    context: { receipt: clone(contextReceipt), digest: contextDigest },
    audit: { receipt: clone(returnedAudit), digest: auditDigest },
    route: {
      task_intent: clone(taskIntent),
      runtime_materiality: taskIntent.runtime_materiality,
      open_field_promotion: false
    },
    jurisdiction: {
      reciprocal_receipts: true,
      reciprocal_authority: false,
      artifact_relation: false,
      automatic_ash_action: false,
      prediction_authorized: false,
      operator_closure_required: true
    },
    status: returnedAudit.recommendation === 'REJECT_AUTHORITY_BREACH'
      ? 'ROUND_TRIP_HELD_AUTHORITY_BREACH'
      : returnedAudit.recommendation === 'HOLD_FOR_REPAIR'
        ? 'ROUND_TRIP_HELD_PROVENANCE'
        : returnedAudit.warnings?.length
          ? 'ROUND_TRIP_VERIFIED_WITH_WARNINGS'
          : 'ROUND_TRIP_VERIFIED'
  };
  receipt.round_trip_digest = await digest(
    PHASE4_DIGEST_DOMAINS.roundTrip,
    roundTripDigestSubject(receipt),
    digestOptions
  );
  return Object.freeze(receipt);
}

export async function replayRoundTripReceipt(
  receipt,
  { cryptoImpl = globalThis.crypto, TextEncoderImpl = globalThis.TextEncoder } = {}
) {
  if (!receipt || receipt.schema !== ROUND_TRIP_RECEIPT_SCHEMA) {
    return Object.freeze({ status: 'ROUND_TRIP_HELD_PROVENANCE', errors: ['unsupported_round_trip_schema'] });
  }
  const digestOptions = { cryptoImpl, TextEncoderImpl };
  const errors = [];
  const expectedDiagnostic = await digest(PHASE4_DIGEST_DOMAINS.diagnostic, receipt.diagnostic?.receipt, digestOptions);
  const expectedContext = await digest(PHASE4_DIGEST_DOMAINS.context, receipt.context?.receipt, digestOptions);
  const expectedAudit = await digest(PHASE4_DIGEST_DOMAINS.audit, receipt.audit?.receipt, digestOptions);
  const expectedRoundTrip = await digest(PHASE4_DIGEST_DOMAINS.roundTrip, roundTripDigestSubject(receipt), digestOptions);
  if (expectedDiagnostic !== receipt.diagnostic?.digest) errors.push('diagnostic_digest_mismatch');
  if (expectedContext !== receipt.context?.digest) errors.push('context_digest_mismatch');
  if (expectedAudit !== receipt.audit?.digest) errors.push('audit_digest_mismatch');
  if (expectedRoundTrip !== receipt.round_trip_digest) errors.push('round_trip_digest_mismatch');

  const replayedAudit = auditReturnedFlowCoreReceipt(
    receipt.diagnostic?.receipt,
    receipt.context?.receipt,
    {
      auditId: receipt.audit?.receipt?.audit_id,
      createdAt: receipt.audit?.receipt?.created_at
    }
  );
  const replayedAuditDigest = await digest(PHASE4_DIGEST_DOMAINS.audit, replayedAudit, digestOptions);
  if (replayedAuditDigest !== receipt.audit?.digest) errors.push('returned_audit_replay_mismatch');
  if (receipt.jurisdiction?.reciprocal_authority !== false
    || receipt.jurisdiction?.artifact_relation !== false
    || receipt.jurisdiction?.automatic_ash_action !== false
    || receipt.jurisdiction?.prediction_authorized !== false) {
    errors.push('jurisdiction_boundary_mismatch');
  }

  const authority = replayedAudit.recommendation === 'REJECT_AUTHORITY_BREACH'
    || errors.includes('jurisdiction_boundary_mismatch');
  return Object.freeze({
    status: authority
      ? 'ROUND_TRIP_HELD_AUTHORITY_BREACH'
      : errors.length
        ? 'ROUND_TRIP_HELD_TAMPER'
        : receipt.status,
    errors: Object.freeze(errors),
    network_called: false,
    weather_regenerated: false,
    storage_mutated: false,
    replayed_audit: replayedAudit,
    expected_round_trip_digest: expectedRoundTrip
  });
}

export function migrateLegacyVNextReceipt(receipt) {
  if (!receipt || receipt.schema !== LEGACY_CONTEXT_SCHEMA) {
    throw new Error('Legacy migration requires a vNext context receipt.');
  }
  rejectArtifactMaterial(receipt);
  return Object.freeze({
    schema: LEGACY_MIGRATION_SCHEMA,
    legacy_schema: LEGACY_CONTEXT_SCHEMA,
    migration_status: 'LEGACY_PROVISIONAL_NORMALIZED',
    native_v01: false,
    source_status: receipt.source_status || 'DERIVED',
    diagnostic_receipt_reference: receipt.diagnostic_receipt_reference || null,
    legacy_receipt: clone(receipt),
    calibration: { status: 'UNDECLARED', independent: false },
    bridge_integration_status: 'LEGACY_PHASE_4_MIGRATION',
    recommendation_not_command: true,
    automatic_ash_action: false,
    prediction_authorized: false,
    artifact_reference: null
  });
}

export function saveRoundTripReceipt(receipt, { storage = globalThis.localStorage } = {}) {
  if (!storage?.setItem) throw new Error('Local storage is unavailable.');
  storage.setItem(`td613.phase4.round-trip.${receipt.receipt_id}`, JSON.stringify(receipt));
  return receipt.receipt_id;
}

export function exportRoundTripReceipt(receipt, { documentImpl = globalThis.document, URLImpl = globalThis.URL } = {}) {
  if (!documentImpl || !URLImpl?.createObjectURL) throw new Error('Browser export is unavailable.');
  const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
  const url = URLImpl.createObjectURL(blob);
  const anchor = documentImpl.createElement('a');
  anchor.href = url;
  anchor.download = `td613-phase4-round-trip-${receipt.receipt_id}.json`;
  anchor.click();
  URLImpl.revokeObjectURL(url);
}

export const TD613_PHASE4_RECIPROCAL_BRIDGE = Object.freeze({
  version: 'v0.1',
  schema: PHASE4_BRIDGE_CONTRACT,
  reciprocalReceipts: true,
  reciprocalAuthority: false,
  artifactRelation: false,
  automaticAshAction: false,
  predictionAuthorized: false,
  operatorClosureRequired: true,
  runtimeDefault: 'BACKGROUND',
  openFieldAutoPromotion: false,
  validateApertureDiagnosticReceipt,
  phase4RequestEnvelope,
  sendApertureDiagnosticReceipt,
  auditReturnedFlowCoreReceipt,
  compileRoundTripReceipt,
  replayRoundTripReceipt,
  migrateLegacyVNextReceipt,
  saveRoundTripReceipt,
  exportRoundTripReceipt
});

if (typeof globalThis !== 'undefined') {
  globalThis.TD613_PHASE4_RECIPROCAL_BRIDGE = TD613_PHASE4_RECIPROCAL_BRIDGE;
}
