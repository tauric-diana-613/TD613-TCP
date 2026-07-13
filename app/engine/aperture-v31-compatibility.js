import {
  APERTURE_DIAGNOSTIC_SCHEMA,
  ROUND_TRIP_RECEIPT_SCHEMA,
  compileRoundTripReceipt,
  validateApertureDiagnosticReceipt
} from './aperture-v3-reciprocal-bridge.js';

export const APERTURE_V31_PRODUCER_VERSION = 'v3.1-alpha';
export const APERTURE_V31_PRODUCER_SCHEMA = 'td613-aperture/v3.1-alpha';
export const APERTURE_V31_COMPATIBILITY_PROFILE = 'td613.aperture.v31-v30-bridge-compatibility/v0.1';

const FORBIDDEN_KEYS = new Set([
  'artifact_digest', 'artifactDigest', 'manifest_digest', 'manifestDigest',
  'receipt_digest', 'receiptDigest', 'content_hash', 'contentHash',
  'rawBytes', 'fileBytes', 'fileContent', 'rawText', 'sensitiveText'
]);
const ROUND_TRIP_KEYS = Object.freeze([
  'schema', 'bridge_contract', 'receipt_id', 'created_at', 'diagnostic',
  'context', 'audit', 'route', 'jurisdiction', 'status', 'round_trip_digest'
]);
const ROUTE_KEYS = Object.freeze(['task_intent', 'runtime_materiality', 'open_field_promotion']);
const JURISDICTION_KEYS = Object.freeze([
  'reciprocal_receipts', 'reciprocal_authority', 'artifact_relation',
  'automatic_ash_action', 'prediction_authorized', 'operator_closure_required'
]);

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function active(value) {
  return ![null, undefined, '', false].includes(value)
    && !(Array.isArray(value) && value.length === 0)
    && !(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
}

function rejectArtifactMaterial(value, path = '$') {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => rejectArtifactMaterial(entry, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (FORBIDDEN_KEYS.has(key) && active(child)) {
      throw new Error(`v3.1 compatibility projection is artifact-blind: ${childPath}`);
    }
    if (['artifact_reference', 'artifactReference'].includes(key) && active(child)) {
      throw new Error(`v3.1 compatibility projection cannot carry an artifact relation: ${childPath}`);
    }
    rejectArtifactMaterial(child, childPath);
  }
}

function randomId(prefix, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10);
  cryptoImpl.getRandomValues(bytes);
  return `${prefix}${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

function taskIntentOf(input = {}) {
  const task = input.taskIntent || input.task_intent || {};
  const primaryRoute = String(task.primary_route || task.primaryRoute || '').trim();
  if (!primaryRoute) throw new Error('v3.1 compatibility projection requires a task-intent route.');
  const runtimeMateriality = String(task.runtime_materiality || task.runtimeMateriality || 'BACKGROUND').toUpperCase();
  if (!['NONE', 'BACKGROUND', 'MATERIAL', 'DISPOSITIVE'].includes(runtimeMateriality)) {
    throw new Error('v3.1 compatibility projection received unsupported runtime materiality.');
  }
  if (task.automatic_redirect === true || task.automaticRedirect === true) {
    throw new Error('v3.1 compatibility projection cannot request automatic redirect.');
  }
  return {
    ...clone(task),
    primary_route: primaryRoute,
    runtime_materiality: runtimeMateriality,
    automatic_redirect: false
  };
}

function exactKeys(value, expected, label) {
  const actual = Object.keys(value || {}).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} contains fields outside the frozen v3.0 contract.`);
  }
}

export function assertStrictV30RoundTripShape(receipt) {
  if (!receipt || receipt.schema !== ROUND_TRIP_RECEIPT_SCHEMA) {
    throw new Error('Compatibility output is not a v3.0 round-trip receipt.');
  }
  exactKeys(receipt, ROUND_TRIP_KEYS, 'Round-trip receipt');
  exactKeys(receipt.route, ROUTE_KEYS, 'Round-trip route');
  exactKeys(receipt.jurisdiction, JURISDICTION_KEYS, 'Round-trip jurisdiction');
  for (const name of ['diagnostic', 'context', 'audit']) {
    exactKeys(receipt[name], ['receipt', 'digest'], `Round-trip ${name}`);
  }
  return true;
}

export function compileV31DiagnosticForV30Bridge(input = {}, { cryptoImpl = globalThis.crypto } = {}) {
  rejectArtifactMaterial(input);
  const sourceSchema = String(input.schema || APERTURE_V31_PRODUCER_SCHEMA);
  const sourceVersion = String(input.version || APERTURE_V31_PRODUCER_VERSION);
  const taskIntent = taskIntentOf(input);
  const projected = {
    schema: APERTURE_DIAGNOSTIC_SCHEMA,
    receipt_id: /^apdiag_[A-Za-z0-9_-]{6,128}$/.test(String(input.receipt_id || ''))
      ? input.receipt_id
      : randomId('apdiag_', cryptoImpl),
    instrument: 'TD613 Aperture',
    version: 'v3.0-alpha',
    firmwareSchema: 'td613-aperture/v3.0-alpha',
    posture: 'recommendation-not-command',
    taskIntent,
    source: clone(input.source || { status: 'DERIVED' }),
    runtime: clone(input.runtime || { materiality: taskIntent.runtime_materiality }),
    produced: clone(input.produced || { context_request: {} }),
    compatibility: {
      schema: APERTURE_V31_COMPATIBILITY_PROFILE,
      producer_version: APERTURE_V31_PRODUCER_VERSION,
      producer_schema: APERTURE_V31_PRODUCER_SCHEMA,
      source_version: sourceVersion,
      source_schema: sourceSchema,
      capability_profile: ['reciprocal-bridge', 'admissibility-tomography'],
      projection: 'v3.1-producer-to-frozen-v3.0-contract',
      fields_removed_from_strict_round_trip: true,
      authority_transfer: false
    }
  };
  validateApertureDiagnosticReceipt(projected);
  return freeze(projected);
}

export async function compileV31CompatibleRoundTrip(
  v31Diagnostic,
  contextReceipt,
  options = {}
) {
  const diagnosticReceipt = compileV31DiagnosticForV30Bridge(v31Diagnostic, options);
  const roundTripReceipt = await compileRoundTripReceipt(diagnosticReceipt, contextReceipt, options);
  assertStrictV30RoundTripShape(roundTripReceipt);
  return freeze({
    compatibility_profile: APERTURE_V31_COMPATIBILITY_PROFILE,
    producer_version: APERTURE_V31_PRODUCER_VERSION,
    diagnostic_receipt: diagnosticReceipt,
    round_trip_receipt: roundTripReceipt,
    schema_mutation: false,
    reciprocal_authority: false
  });
}
