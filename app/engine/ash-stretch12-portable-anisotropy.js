import {
  freeze,
  integer,
  randomId,
  recordDigest,
  text,
  uniqueStrings,
  verifyRecord
} from './aperture-v31-core.js';

export const STRETCH12_ENDPOINT_SCHEMA = 'td613.ash.endpoint-posture-receipt/v0.1';
export const STRETCH12_READER_ENSEMBLE_SCHEMA = 'td613.aperture.reader-ensemble/v0.1';
export const STRETCH12_RECOVERABILITY_SCHEMA = 'td613.aperture.recoverability-tensor/v0.1';
export const STRETCH12_SEMANTIC_ASSAY_SCHEMA = 'td613.aperture.semantic-reconstruction-assay/v0.1';
export const STRETCH12_PORTABLE_ANISOTROPY_SCHEMA = 'td613.ash.portable-anisotropy-receipt/v0.1';

const ENDPOINT_DOMAIN = 'TD613:ASH:S12:ENDPOINT-POSTURE:v1';
const READER_DOMAIN = 'TD613:APERTURE:S12:READER-ENSEMBLE:v1';
const RECOVERABILITY_DOMAIN = 'TD613:APERTURE:S12:RECOVERABILITY-TENSOR:v1';
const ASSAY_DOMAIN = 'TD613:APERTURE:S12:SEMANTIC-ASSAY:v1';
const PORTABLE_DOMAIN = 'TD613:ASH:S12:PORTABLE-ANISOTROPY:v1';

export const PROTECTED_DIMENSIONS = Object.freeze([
  'identity',
  'institution',
  'source_identity',
  'relationships',
  'room_bridges',
  'chronology',
  'document_provenance',
  'source_style_linkage',
  'hypotheses',
  'next_actions',
  'lifecycle_state',
  'rare_fact_conjunctions'
]);

export const ENDPOINT_STATES = Object.freeze([
  'PERSONAL_UNMANAGED_DECLARED',
  'PERSONAL_UNMANAGED_UNVERIFIED',
  'MANAGED_CONFIRMED',
  'MANAGED_SUSPECTED',
  'PUBLIC_SECTOR_MANAGED',
  'SHARED_DEVICE',
  'EXTENSION_SURFACE_UNVERIFIED',
  'BROWSER_SYNC_UNVERIFIED',
  'OFFLINE_LOCAL_ATTESTED',
  'NETWORK_ISOLATION_UNVERIFIED',
  'ENDPOINT_UNRESOLVED'
]);

export const ROUTE_CLASSES = Object.freeze([
  'CONSUMER_CLOUD_PROVIDER',
  'MANAGED_ENTERPRISE_PROVIDER',
  'PUBLIC_SECTOR_MANAGED_PROVIDER',
  'OFFLINE_LOCAL_MODEL',
  'REMOTE_SELF_HOSTED_MODEL',
  'SHARED_DEVICE_ROUTE',
  'UNRESOLVED_ROUTE'
]);

const HARD_HOLD_STATES = new Set([
  'MANAGED_CONFIRMED',
  'MANAGED_SUSPECTED',
  'PUBLIC_SECTOR_MANAGED',
  'SHARED_DEVICE',
  'ENDPOINT_UNRESOLVED'
]);

const HARD_HOLD_ROUTES = new Set([
  'MANAGED_ENTERPRISE_PROVIDER',
  'PUBLIC_SECTOR_MANAGED_PROVIDER',
  'SHARED_DEVICE_ROUTE',
  'UNRESOLVED_ROUTE'
]);

const ROUTE_MISMATCH = new Set(['OFFLINE_LOCAL_MODEL', 'REMOTE_SELF_HOSTED_MODEL']);
const STATUS_VALUES = new Set(['RECOVERED', 'PARTIAL', 'MISSING', 'CONTRADICTORY', 'REJECTED', 'UNRESOLVED']);

function nowIso(value) {
  return value || new Date().toISOString();
}

function enumValue(value, allowed, label) {
  const normalized = String(value || '').trim().toUpperCase();
  if (!allowed.includes(normalized)) throw new Error(`${label} is unsupported.`);
  return normalized;
}

function bps(value, label) {
  return integer(value, label, { min: 0, max: 10000 });
}

function signedBps(value, label) {
  return integer(value, label, { min: -10000, max: 10000 });
}

function status(value) {
  const normalized = String(value || 'UNRESOLVED').trim().toUpperCase();
  return STATUS_VALUES.has(normalized) ? normalized : 'UNRESOLVED';
}

function metric(value = {}, label = 'Metric') {
  const lower = bps(value.lower_bps ?? value.lowerBps ?? 0, `${label} lower`);
  const point = bps(value.point_bps ?? value.pointBps ?? lower, `${label} point`);
  const upper = bps(value.upper_bps ?? value.upperBps ?? point, `${label} upper`);
  if (!(lower <= point && point <= upper)) throw new Error(`${label} interval must satisfy lower <= point <= upper.`);
  return {
    lower_bps: lower,
    point_bps: point,
    upper_bps: upper,
    status: status(value.status),
    observations: uniqueStrings(value.observations || [])
  };
}

function dimensionMap(value = {}, label = 'Reader') {
  const output = {};
  for (const dimension of PROTECTED_DIMENSIONS) output[dimension] = metric(value[dimension], `${label} ${dimension}`);
  return output;
}

function digestRef(value, label) {
  const output = String(value || '').trim();
  if (!/^sha256:[0-9a-f]{64}$/.test(output)) throw new Error(`${label} must be SHA-256.`);
  return output;
}

export function evaluateEndpointPosture({ endpointState, routeClass, providerAction = false } = {}) {
  const endpoint = enumValue(endpointState, ENDPOINT_STATES, 'Endpoint state');
  const route = enumValue(routeClass, ROUTE_CLASSES, 'Route class');
  const reasons = [];
  let decision = 'REVIEW_REQUIRED';

  if (HARD_HOLD_STATES.has(endpoint)) reasons.push(`Endpoint state ${endpoint} is held.`);
  if (HARD_HOLD_ROUTES.has(route)) reasons.push(`Route class ${route} is held.`);
  if (providerAction && ROUTE_MISMATCH.has(route)) reasons.push('A provider action cannot impersonate a local or separately hosted route.');
  if (route === 'OFFLINE_LOCAL_MODEL' && endpoint !== 'OFFLINE_LOCAL_ATTESTED') reasons.push('Offline-local route lacks an attested offline endpoint.');
  if (route === 'CONSUMER_CLOUD_PROVIDER' && endpoint === 'OFFLINE_LOCAL_ATTESTED') reasons.push('Cloud provider route conflicts with offline-local endpoint declaration.');

  if (reasons.length) decision = ROUTE_MISMATCH.has(route) && providerAction ? 'ROUTE_MISMATCH_HOLD' : 'HARD_HOLD';
  else if (route === 'OFFLINE_LOCAL_MODEL' && endpoint === 'OFFLINE_LOCAL_ATTESTED') decision = 'OFFLINE_LOCAL_ELIGIBLE';
  else if (route === 'CONSUMER_CLOUD_PROVIDER') decision = 'BOUNDED_PACKET_REVIEW';

  return freeze({ endpoint_state: endpoint, route_class: route, decision, hard_hold: decision.endsWith('HOLD'), reasons });
}

export async function compileEndpointPostureReceipt(input = {}, options = {}) {
  const evaluated = evaluateEndpointPosture(input);
  const record = {
    schema: STRETCH12_ENDPOINT_SCHEMA,
    endpoint_receipt_id: input.endpointReceiptId || randomId('endpoint_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: nowIso(input.createdAt),
    endpoint_state: evaluated.endpoint_state,
    route_class: evaluated.route_class,
    decision: evaluated.decision,
    hard_hold: evaluated.hard_hold,
    reasons: evaluated.reasons,
    evidence: uniqueStrings(input.evidence || []),
    unresolved_surfaces: uniqueStrings(input.unresolvedSurfaces || input.unresolved_surfaces || []),
    operator_declaration: text(input.operatorDeclaration || 'DECLARED_BY_OPERATOR', 'Operator declaration'),
    provider_action: Boolean(input.providerAction),
    cannot_establish: [
      'absence of endpoint compromise',
      'absence of device management',
      'absence of browser extension access',
      'absence of provider retention or human access',
      'physical erasure outside Ash custody'
    ],
    operator_closure: { required: true, status: String(input.operatorClosure || 'OPEN').toUpperCase() },
    receipt_digest: null
  };
  record.receipt_digest = await recordDigest(ENDPOINT_DOMAIN, record, 'receipt_digest', options);
  return freeze(record);
}

export const verifyEndpointPostureReceipt = (value, options = {}) => verifyRecord(ENDPOINT_DOMAIN, value, 'receipt_digest', STRETCH12_ENDPOINT_SCHEMA, options);

export async function compileReaderEnsemble(input = {}, options = {}) {
  const readers = (input.readers || []).map((reader, index) => ({
    reader_id: text(reader.reader_id || reader.readerId, `Reader ${index + 1} ID`),
    reader_class: text(reader.reader_class || reader.readerClass, `Reader ${index + 1} class`).toUpperCase(),
    version: text(reader.version || 'unversioned', `Reader ${index + 1} version`),
    context_class: text(reader.context_class || reader.contextClass || 'DECLARED', `Reader ${index + 1} context class`).toUpperCase(),
    controlled_variables: uniqueStrings(reader.controlled_variables || reader.controlledVariables || []),
    blind_spots: uniqueStrings(reader.blind_spots || reader.blindSpots || []),
    missingness: uniqueStrings(reader.missingness || []),
    source_status: text(reader.source_status || reader.sourceStatus || 'CONSTRUCTED', `Reader ${index + 1} source status`).toUpperCase()
  }));
  if (!readers.length) throw new Error('At least one declared Reader is required.');
  const record = {
    schema: STRETCH12_READER_ENSEMBLE_SCHEMA,
    ensemble_id: input.ensembleId || randomId('readers_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: nowIso(input.createdAt),
    readers,
    unknown_reader_preserved: input.unknownReaderPreserved !== false,
    universal_reader_claim: false,
    observations: uniqueStrings(input.observations || []),
    receipt_digest: null
  };
  record.receipt_digest = await recordDigest(READER_DOMAIN, record, 'receipt_digest', options);
  return freeze(record);
}

export const verifyReaderEnsemble = (value, options = {}) => verifyRecord(READER_DOMAIN, value, 'receipt_digest', STRETCH12_READER_ENSEMBLE_SCHEMA, options);

export function computePhasonSusceptibility({ baseline = {}, perturbed = {}, perturbation_norm_bps = 0, epsilon_bps = 1 } = {}) {
  const perturbation = bps(perturbation_norm_bps, 'Perturbation norm');
  const epsilon = integer(epsilon_bps, 'Phason epsilon', { min: 1, max: 10000 });
  let numerator = 0;
  for (const dimension of PROTECTED_DIMENSIONS) {
    const before = metric(baseline[dimension], `Baseline ${dimension}`).point_bps;
    const after = metric(perturbed[dimension], `Perturbed ${dimension}`).point_bps;
    numerator += Math.abs(after - before);
  }
  const denominator = perturbation + epsilon;
  return freeze({
    numerator_bps_l1: numerator,
    denominator_bps: denominator,
    decimal_display: (numerator / denominator).toFixed(6),
    state: numerator === 0 ? 'PHASON_INSENSITIVE' : numerator <= denominator ? 'PHASON_LINEAR_RESPONSE' : numerator <= denominator * 4 ? 'PHASON_NONLINEAR_RESPONSE' : 'PHASON_THRESHOLD_RESPONSE',
    nonclaim: 'computational route response is not a physical phonon or topological invariant'
  });
}

export async function compileRecoverabilityTensor(input = {}, options = {}) {
  const local = dimensionMap(input.localReader, 'Local Reader');
  const externalReaders = (input.externalReaders || []).map((reader, index) => {
    const dimensions = dimensionMap(reader.dimensions || reader, `External Reader ${index + 1}`);
    const anisotropy = {};
    for (const dimension of PROTECTED_DIMENSIONS) {
      anisotropy[dimension] = {
        conservative_bps: signedBps(local[dimension].lower_bps - dimensions[dimension].upper_bps, `Anisotropy ${dimension}`),
        point_bps: signedBps(local[dimension].point_bps - dimensions[dimension].point_bps, `Anisotropy ${dimension}`),
        local_interval_bps: [local[dimension].lower_bps, local[dimension].upper_bps],
        external_interval_bps: [dimensions[dimension].lower_bps, dimensions[dimension].upper_bps]
      };
    }
    return {
      reader_id: text(reader.reader_id || reader.readerId || `external-${index + 1}`, `External Reader ${index + 1} ID`),
      reader_class: text(reader.reader_class || reader.readerClass || 'DECLARED_EXTERNAL_READER', `External Reader ${index + 1} class`).toUpperCase(),
      dimensions,
      anisotropy
    };
  });
  if (!externalReaders.length) throw new Error('At least one external Reader result is required.');

  const variableCount = integer(input.variableCount ?? PROTECTED_DIMENSIONS.length, 'Variable count', { min: 1 });
  const designRank = integer(input.designRank ?? 0, 'Design rank', { min: 0, max: variableCount });
  const record = {
    schema: STRETCH12_RECOVERABILITY_SCHEMA,
    tensor_id: input.tensorId || randomId('tensor_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: nowIso(input.createdAt),
    dimensions: PROTECTED_DIMENSIONS,
    local_reader: local,
    external_readers: externalReaders,
    coverage: {
      design_rank: designRank,
      variable_count: variableCount,
      fraction_display: `${designRank}/${variableCount}`,
      state: designRank === variableCount ? 'COVERAGE_BOUNDED_COMPLETE' : designRank === 0 ? 'COVERAGE_SINGULAR' : 'COVERAGE_PARTIAL'
    },
    null_outcomes_preserved: true,
    contradictory_outcomes_preserved: true,
    unknown_readers_unmeasured: input.unknownReadersUnmeasured !== false,
    universal_score_emitted: false,
    observations: uniqueStrings(input.observations || []),
    receipt_digest: null
  };
  record.receipt_digest = await recordDigest(RECOVERABILITY_DOMAIN, record, 'receipt_digest', options);
  return freeze(record);
}

export const verifyRecoverabilityTensor = (value, options = {}) => verifyRecord(RECOVERABILITY_DOMAIN, value, 'receipt_digest', STRETCH12_RECOVERABILITY_SCHEMA, options);

function recommendationFor(input, tensor) {
  if (input.endpointDecision === 'HARD_HOLD' || input.endpointDecision === 'ROUTE_MISMATCH_HOLD') return 'KEEP_LOCAL';
  if (tensor.coverage.state !== 'COVERAGE_BOUNDED_COMPLETE') return 'INSUFFICIENT_COVERAGE';
  if (tensor.unknown_readers_unmeasured) return 'EXTERNAL_ROUTE_REVIEW_REQUIRED';
  for (const reader of tensor.external_readers) {
    for (const dimension of PROTECTED_DIMENSIONS) {
      if (reader.dimensions[dimension].upper_bps > (input.leakThresholds?.[dimension] ?? 2500)) return 'REDACT_AND_RETEST';
    }
  }
  return input.routeClass === 'OFFLINE_LOCAL_MODEL' ? 'OFFLINE_LOCAL_ONLY' : 'BOUNDED_PACKET_ELIGIBLE';
}

export async function compileSemanticReconstructionAssay(input = {}, options = {}) {
  const features = (input.features || []).map((feature, index) => ({
    feature_id: text(feature.feature_id || feature.featureId || `feature-${index + 1}`, `Feature ${index + 1} ID`),
    feature_class: text(feature.feature_class || feature.featureClass || 'UNCLASSIFIED', `Feature ${index + 1} class`).toUpperCase(),
    observed: feature.observed !== false,
    surprisal_millibits: integer(feature.surprisal_millibits ?? feature.surprisalMillibits ?? 0, `Feature ${index + 1} surprisal`, { min: 0 }),
    recovery_delta_bps: signedBps(feature.recovery_delta_bps ?? feature.recoveryDeltaBps ?? 0, `Feature ${index + 1} recovery delta`),
    protected_dimensions: uniqueStrings(feature.protected_dimensions || feature.protectedDimensions || []),
    notes: uniqueStrings(feature.notes || [])
  }));
  const tensor = input.tensor;
  if (!tensor || tensor.schema !== STRETCH12_RECOVERABILITY_SCHEMA) throw new Error('A recoverability tensor is required.');
  const phason = computePhasonSusceptibility(input.phason || {});
  const record = {
    schema: STRETCH12_SEMANTIC_ASSAY_SCHEMA,
    assay_id: input.assayId || randomId('assay_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: nowIso(input.createdAt),
    packet_digest: digestRef(input.packetDigest, 'Packet digest'),
    reader_ensemble_reference: text(input.readerEnsembleReference, 'Reader Ensemble reference'),
    reader_ensemble_digest: digestRef(input.readerEnsembleDigest, 'Reader Ensemble digest'),
    recoverability_tensor_reference: text(input.recoverabilityTensorReference, 'Recoverability Tensor reference'),
    recoverability_tensor_digest: digestRef(tensor.receipt_digest, 'Recoverability Tensor digest'),
    source_status: text(input.sourceStatus || 'CONSTRUCTED', 'Source status').toUpperCase(),
    features,
    phason_susceptibility: phason,
    marginal_consistency: {
      norm_millibits: integer(input.marginalConsistencyMillibits ?? 0, 'Marginal consistency norm', { min: 0 }),
      independently_estimated: Boolean(input.independentlyEstimatedMarginals),
      state: input.independentlyEstimatedMarginals ? 'OBSERVED' : 'UNRESOLVED'
    },
    held_out: {
      count: integer(input.heldOutCount ?? 0, 'Held-out count', { min: 0 }),
      error_bps: bps(input.heldOutErrorBps ?? 10000, 'Held-out error'),
      replicate_count: integer(input.replicateCount ?? 1, 'Replicate count', { min: 1 })
    },
    recommendation: recommendationFor(input, tensor),
    cannot_establish: [
      'universal anonymity',
      'resistance to unknown or future Readers',
      'absence of external joining corpora',
      'provider deletion',
      'endpoint integrity'
    ],
    operator_closure: { required: true, status: String(input.operatorClosure || 'OPEN').toUpperCase() },
    receipt_digest: null
  };
  record.receipt_digest = await recordDigest(ASSAY_DOMAIN, record, 'receipt_digest', options);
  return freeze(record);
}

export const verifySemanticReconstructionAssay = (value, options = {}) => verifyRecord(ASSAY_DOMAIN, value, 'receipt_digest', STRETCH12_SEMANTIC_ASSAY_SCHEMA, options);

export async function compilePortableAnisotropyReceipt(input = {}, options = {}) {
  const endpoint = input.endpointReceipt;
  const tensor = input.tensor;
  const assay = input.assay;
  if (!endpoint || endpoint.schema !== STRETCH12_ENDPOINT_SCHEMA) throw new Error('Endpoint Posture Receipt is required.');
  if (!tensor || tensor.schema !== STRETCH12_RECOVERABILITY_SCHEMA) throw new Error('Recoverability Tensor is required.');
  if (!assay || assay.schema !== STRETCH12_SEMANTIC_ASSAY_SCHEMA) throw new Error('Semantic Reconstruction Assay is required.');
  const inboundRank = integer(input.inboundRank, 'Inbound rank', { min: 0 });
  const outboundRank = integer(input.outboundRank, 'Outbound rank', { min: 0 });
  const directionalCondition = inboundRank > outboundRank;
  const record = {
    schema: STRETCH12_PORTABLE_ANISOTROPY_SCHEMA,
    portable_anisotropy_id: input.portableAnisotropyId || randomId('portable_', options.cryptoImpl || globalThis.crypto),
    case_id: text(input.caseId, 'Case ID'),
    created_at: nowIso(input.createdAt),
    origin_manifest_reference: text(input.originManifestReference, 'Origin Manifest reference'),
    origin_manifest_digest: digestRef(input.originManifestDigest, 'Origin Manifest digest'),
    endpoint_receipt_reference: text(input.endpointReceiptReference, 'Endpoint Receipt reference'),
    endpoint_receipt_digest: digestRef(endpoint.receipt_digest, 'Endpoint Receipt digest'),
    recoverability_tensor_reference: text(input.recoverabilityTensorReference, 'Recoverability Tensor reference'),
    recoverability_tensor_digest: digestRef(tensor.receipt_digest, 'Recoverability Tensor digest'),
    semantic_assay_reference: text(input.semanticAssayReference, 'Semantic Assay reference'),
    semantic_assay_digest: digestRef(assay.receipt_digest, 'Semantic Assay digest'),
    directional_rank: {
      inbound_authenticated_rank: inboundRank,
      outbound_projection_rank: outboundRank,
      condition_satisfied: directionalCondition
    },
    route_decision: endpoint.decision,
    semantic_recommendation: assay.recommendation,
    portable_anisotropy_demonstrated: Boolean(directionalCondition && !endpoint.hard_hold && assay.recommendation === 'BOUNDED_PACKET_ELIGIBLE'),
    capsule_is_provider_packet: false,
    flowcore_has_custody: false,
    universal_secrecy_claim: false,
    external_deletion_proven: false,
    operator_closure: { required: true, status: String(input.operatorClosure || 'OPEN').toUpperCase() },
    receipt_digest: null
  };
  record.receipt_digest = await recordDigest(PORTABLE_DOMAIN, record, 'receipt_digest', options);
  return freeze(record);
}

export const verifyPortableAnisotropyReceipt = (value, options = {}) => verifyRecord(PORTABLE_DOMAIN, value, 'receipt_digest', STRETCH12_PORTABLE_ANISOTROPY_SCHEMA, options);
