import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import {
  inspectChoirCalibrationReceiptSet,
  rejectFreeCalibrationClaims,
  uniqueSorted
} from './ash-keep-choir-calibration-inspect.js';

export const CHOIR_CALIBRATION_BINDING_SCHEMA = 'td613.aperture.choir-calibration-binding/v0.1';
const BINDING_DOMAIN = 'TD613:ASH-KEEP:CHOIR-CALIBRATION-BINDING:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

export async function compileChoirCalibrationBinding(input = {}, options = {}) {
  rejectFreeCalibrationClaims(input);
  const inspected = await inspectChoirCalibrationReceiptSet(input, options);
  const eligible = inspected.state === 'CALIBRATION_ELIGIBLE';
  const record = {
    schema: CHOIR_CALIBRATION_BINDING_SCHEMA,
    version: 'v0.1',
    binding_id: input.bindingId || randomId('choircal_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    mode: 'RECEIPT_BOUND_CHOIR_CALIBRATION',
    case_id: inspected.activeCaseId,
    case_map_digest: inspected.activeCaseMapDigest,
    route_memory_digest: inspected.activeRouteMemoryDigest,
    receipt_references: inspected.references,
    reader_ids: inspected.readers.assays,
    verification: inspected.verified,
    binding_checks: inspected.checks,
    binding_state: inspected.state,
    calibration_eligible: eligible,
    review_state: eligible ? 'OPERATOR_REVIEW_REQUIRED' : 'EVIDENCE_HELD_FOR_REPAIR',
    failed_checks: inspected.failedChecks,
    componentwise_comparison: {
      source: 'MATCHED_BENIGN_CONTROL_BANK',
      set_components: clone(inspected.controlBank?.set_component_comparisons || {}),
      numeric_components: clone(inspected.controlBank?.numeric_component_comparisons || {}),
      pairwise_disagreement: clone(inspected.controlBank?.pairwise_disagreement_comparison || {})
    },
    free_calibration_booleans_accepted: false,
    universal_calibration_score: null,
    real_surveillance_probability: null,
    readers_executed_by_binding: false,
    provider_call_performed: false,
    network_called: false,
    storage_mutated: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    recommendation_not_command: true,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    evidence_basis: uniqueSorted(input.evidenceBasis || [
      'verified current custody-bound Case Map',
      'verified current Route Memory',
      'verified Moiré assay receipts',
      'verified Reader-result provenance receipts',
      'verified Reader Disagreement Ledger',
      'verified matched benign control bank'
    ]),
    missingness: uniqueSorted([
      ...(input.missingness || []),
      ...inspected.failedChecks.map(value => `binding check failed: ${value}`)
    ]),
    alternatives: uniqueSorted(input.alternatives || [
      'repair receipt references without rerunning Readers',
      'rebuild against the current custody-bound Case Map',
      'preserve source drift as a hold',
      'collect additional matched controls'
    ]),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    binding_digest: null
  };
  record.binding_digest = await canonicalDigest(BINDING_DOMAIN, without(record, 'binding_digest'), options);
  return freeze(record);
}

export async function verifyChoirCalibrationBinding(value, options = {}) {
  return Boolean(value
    && value.schema === CHOIR_CALIBRATION_BINDING_SCHEMA
    && SHA256.test(String(value.binding_digest || ''))
    && value.binding_digest === await canonicalDigest(BINDING_DOMAIN, without(value, 'binding_digest'), options));
}
