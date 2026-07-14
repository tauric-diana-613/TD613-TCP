import { canonicalDigest } from './canonical-json.js';

export const ASH_EXPERIMENT_CUSTODY_SCHEMA = 'td613.ash.experiment-custody-manifest/v0.2';
export const ASH_EXPERIMENT_CUSTODY_LEGACY_SCHEMA = 'td613.ash.experiment-custody-manifest/v0.1';
export const ASH_EXPERIMENT_CUSTODY_DOMAIN = 'TD613:V31:ASH-EXPERIMENT-CUSTODY:v2';
export const ASH_EXPERIMENT_CUSTODY_LEGACY_DOMAIN = 'TD613:V31:ASH-EXPERIMENT-CUSTODY:v1';

const DIGEST = /^sha256:[0-9a-f]{64}$/;
const REF = /^[A-Za-z][A-Za-z0-9_-]{5,127}$/;

const clone = value => JSON.parse(JSON.stringify(value));
const freeze = value => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};
const digestSubject = value => { const subject = clone(value); delete subject.manifest_digest; return subject; };
const required = (value, pattern, label) => {
  const text = String(value || '');
  if (!pattern.test(text)) throw new Error(`${label} is missing or malformed.`);
  return text;
};
const randomId = cryptoImpl => {
  if (!cryptoImpl?.getRandomValues) throw new Error('Secure random values are unavailable.');
  const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes);
  return `ashexp_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};

export async function compileAshExperimentCustodyManifest(input, options = {}) {
  const cryptoImpl = options.cryptoImpl || globalThis.crypto;
  const manifest = {
    schema: ASH_EXPERIMENT_CUSTODY_SCHEMA,
    manifest_id: input.manifestId || randomId(cryptoImpl),
    created_at: input.createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    experiment_id: required(input.experimentId, /^atx_[A-Za-z0-9_-]{6,128}$/, 'Experiment ID'),
    source_custody: {
      receipt_reference: required(input.sourceReceiptReference, /^ashc_[A-Za-z0-9_-]{6,128}$/, 'Source custody receipt reference'),
      receipt_digest: required(input.sourceReceiptDigest, DIGEST, 'Source custody receipt digest'),
      independently_verified: input.sourceCustodyVerified === true
    },
    pre_registration_digest: required(input.preRegistrationDigest, DIGEST, 'Pre-registration digest'),
    instrument_ensemble_digest: required(input.instrumentEnsembleDigest, DIGEST, 'Instrument ensemble digest'),
    snapshot_batch_reference: input.snapshotBatchReference == null ? null : required(input.snapshotBatchReference, /^ashsnap_[A-Za-z0-9_-]{6,128}$/, 'Snapshot batch reference'),
    tomography_result_reference: input.tomographyResultReference == null ? null : required(input.tomographyResultReference, /^ashtomo_[A-Za-z0-9_-]{6,128}$/, 'Tomography result reference'),
    raw_artifact_content_present: false,
    raw_observation_content_present: false,
    public_stable_artifact_handle: false,
    server_persistence: false,
    automatic_derivative_construction: false,
    automatic_export: false,
    automatic_cinder_action: false,
    source_status: 'SUPPLIED', evidence_basis: ['source custody receipt', 'pre-registration digest', 'instrument ensemble digest'],
    observations: [], missingness: [], alternatives: [], open_questions: [], operator_notes: [], closure: { required: true, status: 'OPEN' },
    manifest_digest: null
  };
  manifest.manifest_digest = await canonicalDigest(ASH_EXPERIMENT_CUSTODY_DOMAIN, digestSubject(manifest), options);
  return freeze(manifest);
}

export async function verifyAshExperimentCustodyManifest(manifest, options = {}) {
  if (!manifest || ![ASH_EXPERIMENT_CUSTODY_SCHEMA, ASH_EXPERIMENT_CUSTODY_LEGACY_SCHEMA].includes(manifest.schema)) return false;
  const domain = manifest.schema === ASH_EXPERIMENT_CUSTODY_SCHEMA ? ASH_EXPERIMENT_CUSTODY_DOMAIN : ASH_EXPERIMENT_CUSTODY_LEGACY_DOMAIN;
  return manifest.manifest_digest === await canonicalDigest(domain, digestSubject(manifest), options);
}
