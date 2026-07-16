import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';

export const APERTURE_COMPOSITION_VERSION = 'v0.1';
export const APERTURE_COMPOSITION_PLAN_SCHEMA = 'td613.aperture.composition-plan/v0.1';
export const APERTURE_COMPOSITION_RECEIPT_SCHEMA = 'td613.aperture.composition-receipt/v0.1';
export const APERTURE_PRESENTATION_PROJECTION_SCHEMA = 'td613.aperture.presentation-projection/v0.1';
export const APERTURE_COMPOSITION_REPLAY_SCHEMA = 'td613.aperture.composition-replay/v0.1';

export const APERTURE_COMPOSITION_DOMAINS = Object.freeze({
  plan: 'TD613:APERTURE:COMPOSITION-PLAN:v1',
  receipt: 'TD613:APERTURE:COMPOSITION-RECEIPT:v1',
  projection: 'TD613:APERTURE:PRESENTATION-PROJECTION:v1',
  replay: 'TD613:APERTURE:COMPOSITION-REPLAY:v1'
});

export const APERTURE_COMPOSITION_ORDER = Object.freeze([
  'AUTHORITY_CONTEXT',
  'CONTROLLED_SOURCE',
  'INSTRUMENT_ENSEMBLE',
  'SNAPSHOT_LATTICE',
  'EXPERIMENT_RUN',
  'TOMOGRAPHY_RECEIPT',
  'CHOIR_CALIBRATION_BINDING',
  'HUSH_INTERVENTION_RECEIPT',
  'PRESENTATION_PROJECTION'
]);

export const APERTURE_COMPOSITION_STATES = Object.freeze([
  'COMPOSITION_ELIGIBLE',
  'MISSING_LAYER_HOLD',
  'TAMPER_HOLD',
  'STALE_AUTHORITY_HOLD',
  'LAYER_ORDER_HOLD',
  'SOURCE_BINDING_HOLD',
  'EXPERIMENT_BINDING_HOLD',
  'TOMOGRAPHY_HOLD',
  'CHOIR_BINDING_HOLD',
  'HUSH_BINDING_HOLD',
  'PRESENTATION_BOUNDARY_HOLD'
]);

const TRUTHY_AUTHORITY_KEYS = new Set([
  'mountUi', 'mount_ui', 'renderNow', 'render_now', 'autoSelect', 'auto_select',
  'automaticInstrumentSelection', 'automatic_instrument_selection',
  'automaticModelSelection', 'automatic_model_selection',
  'promote', 'promotionAuthorized', 'promotion_authorized',
  'release', 'releaseAuthorized', 'release_authorized',
  'transport', 'transportAuthorized', 'transport_authorized',
  'cinder', 'cinderActionAuthorized', 'cinder_action_authorized',
  'automaticHold', 'automatic_hold', 'automaticAshAction', 'automatic_ash_action'
]);

const FORBIDDEN_PROJECTION_KEYS = new Set([
  'raw_source', 'rawSource', 'raw_text', 'rawText', 'source_text', 'sourceText',
  'candidate_body', 'candidateBody', 'case_map', 'caseMap',
  'route_memory', 'routeMemory', 'room_keys', 'roomKeys',
  'private_alias_table', 'privateAliasTable', 'provider_log', 'providerLog',
  'reader_result_body', 'readerResultBody'
]);

function isActive(value) {
  return ![null, undefined, '', false].includes(value)
    && !(Array.isArray(value) && value.length === 0)
    && !(value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);
}

function scanKeys(value, forbidden, path = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanKeys(entry, forbidden, `${path}[${index}]`, found));
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  for (const [key, child] of Object.entries(value)) {
    const next = `${path}.${key}`;
    if (forbidden.has(key) && isActive(child)) found.push(next);
    scanKeys(child, forbidden, next, found);
  }
  return found;
}

export function rejectCompositionAuthorityClaims(value) {
  const paths = scanKeys(value, TRUTHY_AUTHORITY_KEYS);
  if (paths.length) throw new Error(`Aperture composition cannot acquire execution authority: ${paths.join(', ')}`);
}

export function forbiddenProjectionPaths(value) {
  return scanKeys(value, FORBIDDEN_PROJECTION_KEYS);
}

export function exactCompositionOrder(value) {
  return Array.isArray(value)
    && value.length === APERTURE_COMPOSITION_ORDER.length
    && value.every((entry, index) => entry === APERTURE_COMPOSITION_ORDER[index]);
}

export function uniqueSorted(values = []) {
  return [...new Set(values.map(String).filter(Boolean))].sort();
}

export async function sealCompositionRecord(domain, record, digestField, options = {}) {
  const subject = clone(record);
  delete subject[digestField];
  record[digestField] = await canonicalDigest(domain, subject, options);
  return freeze(record);
}

export async function verifyCompositionRecord(domain, value, digestField, schema, options = {}) {
  if (!value || value.schema !== schema || !/^sha256:[0-9a-f]{64}$/.test(String(value[digestField] || ''))) return false;
  const subject = clone(value);
  const expected = subject[digestField];
  delete subject[digestField];
  return expected === await canonicalDigest(domain, subject, options);
}

export function compositionId(prefix, supplied, options = {}) {
  return supplied || randomId(prefix, options.cryptoImpl || globalThis.crypto);
}
