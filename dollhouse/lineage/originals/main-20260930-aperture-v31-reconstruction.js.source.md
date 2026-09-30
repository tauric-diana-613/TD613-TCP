import { freeze, randomId, recordDigest, verifyRecord } from './aperture-v31-core.js';
import { auditSourceInvariance } from './aperture-v31-controlled-source.js';

export const TOMOGRAPHY_RECEIPT_SCHEMA = 'td613.aperture.admissibility-tomography-receipt/v0.2';
export const TOMOGRAPHY_RECEIPT_LEGACY_SCHEMA = 'td613.aperture.admissibility-tomography-receipt/v0.1';
export const TOMOGRAPHY_RECEIPT_DOMAIN = 'TD613:V31:ADMISSIBILITY-TOMOGRAPHY:v2';
export const TOMOGRAPHY_RECEIPT_LEGACY_DOMAIN = 'TD613:V31:ADMISSIBILITY-TOMOGRAPHY:v1';

function assurance(lattice, ensemble, heldout) {
  if (lattice.environment_count >= 2 && heldout?.status === 'PASS') return 'AT4_CROSS_ENVIRONMENT';
  if (lattice.time_count >= 2 && lattice.heldout_count > 0 && heldout?.status === 'PASS') return 'AT3_MULTI_TIME_TOMOGRAPHY';
  if (ensemble.declared_dimensions.length >= 2 && lattice.replication_present) return 'AT2_FACTORIAL_REGISTRY';
  if (ensemble.declared_dimensions.length >= 1 && lattice.replication_present) return 'AT1_SINGLE_COORDINATE';
  return 'AT0_DESCRIPTIVE_CONSTELLATION';
}

export async function compileTomographyReceipt(input, options = {}) {
  const sourceAudit = auditSourceInvariance(input.source, input.lattice.entries.map(value => value.source_commitment));
  const heldout = input.heldoutValidation || { status: 'NOT_RUN', error: null, target: null };
  const holds = [];
  if (sourceAudit.status !== 'SOURCE_HELD') holds.push('HOLD_SOURCE_DRIFT');
  if (!input.lattice.replication_present) holds.push('ABSTAIN_NO_REPLICATION');
  if (input.lattice.coverage.state !== 'COVERAGE_BOUNDED_COMPLETE') holds.push('HOLD_INSUFFICIENT_COVERAGE');
  if (heldout.status !== 'PASS') holds.push('HOLD_HELDOUT_FAILURE');
  if (input.residualLedger.state === 'STRUCTURED_UNEXPLAINED') holds.push('HOLD_RESIDUAL_STRUCTURE');
  const blocking = holds.some(value => value !== 'HOLD_RESIDUAL_STRUCTURE');
  const receipt = {
    schema: TOMOGRAPHY_RECEIPT_SCHEMA,
    receipt_id: input.receiptId || randomId('attomo_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    aperture_version: 'v3.1-alpha',
    experiment_id: input.experimentId,
    assurance_class: assurance(input.lattice, input.ensemble, heldout),
    status: blocking ? 'ABSTAIN' : holds.length ? 'TOMOGRAPHY_READY_WITH_WARNINGS' : 'TOMOGRAPHY_READY',
    source_commitment: { source_id: input.source.source_id, source_digest: input.source.source_digest, invariance: sourceAudit },
    instrument_ensemble: { ensemble_id: input.ensemble.ensemble_id, ensemble_digest: input.ensemble.ensemble_digest, instrument_count: input.ensemble.instrument_count },
    snapshot_lattice: { lattice_id: input.lattice.lattice_id, lattice_digest: input.lattice.lattice_digest, snapshot_count: input.lattice.snapshot_count },
    coverage: input.lattice.coverage,
    reference_layers: input.referenceLayers,
    registry_model: input.registryModel,
    shared_layer_relaxation: input.sharedLayerRelaxation,
    phason_susceptibility: input.phasonSusceptibility,
    temporal_route_object: input.temporalRouteObject,
    signed_residual_ledger: input.residualLedger,
    heldout_validation: heldout,
    alternative_models: (input.alternativeModels || []).map(String),
    benign_controls: (input.benignControls || []).map(String),
    missingness: input.lattice.entries.filter(value => value.missingness.length || value.observed_value == null).map(value => ({ snapshot_id: value.snapshot_id, state: value.state, missingness: value.missingness })),
    holds,
    abstention_reason: blocking ? holds.join('; ') : null,
    automatic_ash_action: false,
    prediction_authorized: false,
    derivative_authorized: false,
    source_status: 'DERIVED',
    evidence_basis: ['declared controlled source', 'snapshot lattice', 'held-out validation', 'signed residual ledger'],
    observations: {
      source_invariance: sourceAudit.status,
      replication_present: input.lattice.replication_present,
      coverage_state: input.lattice.coverage.state,
      heldout_status: heldout.status
    },
    alternatives: (input.alternativeModels || []).map(String),
    open_questions: blocking ? holds.map(value => `What additional observation would resolve ${value}?`) : [],
    operator_notes: [],
    closure: { required: true, status: 'OPEN' },
    receipt_digest: null
  };
  receipt.receipt_digest = await recordDigest(TOMOGRAPHY_RECEIPT_DOMAIN, receipt, 'receipt_digest', options);
  return freeze(receipt);
}

export const verifyTomographyReceipt = (value, options = {}) => {
  if (value?.schema === TOMOGRAPHY_RECEIPT_SCHEMA) {
    return verifyRecord(TOMOGRAPHY_RECEIPT_DOMAIN, value, 'receipt_digest', TOMOGRAPHY_RECEIPT_SCHEMA, options);
  }
  if (value?.schema === TOMOGRAPHY_RECEIPT_LEGACY_SCHEMA) {
    return verifyRecord(TOMOGRAPHY_RECEIPT_LEGACY_DOMAIN, value, 'receipt_digest', TOMOGRAPHY_RECEIPT_LEGACY_SCHEMA, options);
  }
  return false;
};
