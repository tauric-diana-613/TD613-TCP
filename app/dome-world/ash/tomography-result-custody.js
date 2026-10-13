import { canonicalDigest } from './canonical-json.js';

export const ASH_TOMOGRAPHY_RESULT_CUSTODY_SCHEMA = 'td613.ash.tomography-result-custody/v0.2';
export const ASH_TOMOGRAPHY_RESULT_CUSTODY_LEGACY_SCHEMA = 'td613.ash.tomography-result-custody/v0.1';
export const ASH_TOMOGRAPHY_RESULT_CUSTODY_DOMAIN = 'TD613:V31:ASH-TOMOGRAPHY-RESULT-CUSTODY:v2';
export const ASH_TOMOGRAPHY_RESULT_CUSTODY_LEGACY_DOMAIN = 'TD613:V31:ASH-TOMOGRAPHY-RESULT-CUSTODY:v1';

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const clone = value => JSON.parse(JSON.stringify(value));
const freeze = value => { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.values(value).forEach(freeze); return Object.freeze(value); };
const digestSubject = value => { const subject = clone(value); delete subject.custody_digest; return subject; };
const requireText = (value, label) => { const text = String(value || '').trim(); if (!text) throw new Error(`${label} is required.`); return text; };
const requireDigest = (value, label) => { const text = String(value || ''); if (!DIGEST.test(text)) throw new Error(`${label} must be SHA-256.`); return text; };
const randomId = cryptoImpl => { const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes); return `ashtomo_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`; };

export async function compileAshTomographyResultCustody(input, options = {}) {
  const receipt = {
    schema: ASH_TOMOGRAPHY_RESULT_CUSTODY_SCHEMA,
    custody_id: input.custodyId || randomId(options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    experiment_manifest_reference: requireText(input.experimentManifestReference, 'Experiment manifest reference'),
    snapshot_batch_reference: requireText(input.snapshotBatchReference, 'Snapshot batch reference'),
    tomography_receipt_reference: requireText(input.tomographyReceiptReference, 'Tomography receipt reference'),
    tomography_receipt_digest: requireDigest(input.tomographyReceiptDigest, 'Tomography receipt digest'),
    source_drift_status: requireText(input.sourceDriftStatus, 'Source drift status'),
    coverage_status: requireText(input.coverageStatus, 'Coverage status'),
    tamper_status: requireText(input.tamperStatus, 'Tamper status'),
    raw_artifact_content_present: false,
    raw_observation_content_present: false,
    derivative_present: false,
    cinder_present: false,
    transport_authorized: false,
    automatic_export: false,
    automatic_ash_action: false,
    source_status: 'SUPPLIED', evidence_basis: ['tomography receipt digest', 'source drift status', 'coverage status', 'tamper status'],
    observations: [], missingness: [], alternatives: [], open_questions: [], operator_notes: [], closure: { required: true, status: 'OPEN' },
    custody_digest: null
  };
  receipt.custody_digest = await canonicalDigest(ASH_TOMOGRAPHY_RESULT_CUSTODY_DOMAIN, digestSubject(receipt), options);
  return freeze(receipt);
}

export async function verifyAshTomographyResultCustody(receipt, options = {}) {
  if (!receipt || ![ASH_TOMOGRAPHY_RESULT_CUSTODY_SCHEMA, ASH_TOMOGRAPHY_RESULT_CUSTODY_LEGACY_SCHEMA].includes(receipt.schema)) return false;
  const domain = receipt.schema === ASH_TOMOGRAPHY_RESULT_CUSTODY_SCHEMA ? ASH_TOMOGRAPHY_RESULT_CUSTODY_DOMAIN : ASH_TOMOGRAPHY_RESULT_CUSTODY_LEGACY_DOMAIN;
  return receipt.custody_digest === await canonicalDigest(domain, digestSubject(receipt), options);
}
