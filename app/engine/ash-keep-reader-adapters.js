import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import {
  CASE_MAP_SCHEMA,
  OBSERVATION_STATES,
  READER_CLASSES,
  READER_PROFILE_SCHEMA,
  ROUTE_MEMORY_SCHEMA,
  verifyCaseMap,
  verifyReaderProfile,
  verifyRouteMemory
} from './ash-keep-core.js';

export const READER_ADAPTER_REGISTRY_SCHEMA = 'td613.aperture.reader-adapter-registry/v0.1';
export const READER_RESULT_PROVENANCE_SCHEMA = 'td613.aperture.reader-result-provenance/v0.1';
export const READER_RESULT_PROVENANCE_REPLAY_SCHEMA = 'td613.aperture.reader-result-provenance-replay/v0.1';

const REGISTRY_DOMAIN = 'TD613:ASH-KEEP:READER-ADAPTER-REGISTRY:v1';
const PROVENANCE_DOMAIN = 'TD613:ASH-KEEP:READER-RESULT-PROVENANCE:v1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:READER-RESULT-PROVENANCE-REPLAY:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const OPAQUE_ID = /^[a-z][a-z0-9_]{2,127}$/;

const ADAPTER_CLASSES = new Set([
  'DETERMINISTIC_REFERENCE',
  'LOCAL_RUNTIME',
  'IMPORTED_RESULT',
  'SYNTHETIC_FIXTURE'
]);

const ACQUISITION_ROUTES = new Set([
  'LOCAL_GENERATED',
  'IMPORTED_FILE',
  'IMPORTED_TEXT',
  'PROVIDER_RECEIPT_REFERENCE',
  'SYNTHETIC_FIXTURE'
]);

const EXECUTION_ENVIRONMENTS = new Set([
  'BROWSER_LOCAL',
  'NODE_LOCAL',
  'EXTERNAL_PROVIDER',
  'DECLARED_FIXTURE'
]);

const FIXTURE_STATUSES = new Set([
  'NONE',
  'SYNTHETIC',
  'DECLARED_FIXTURE',
  'BENIGN_CONTROL',
  'HELD_OUT'
]);

function now(value) {
  return value || new Date().toISOString();
}

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

function uniqueSorted(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))].sort();
}

function uniqueSortedLower(values = []) {
  return uniqueSorted(values.map(value => String(value).trim().toLowerCase()));
}

function uniqueSortedUpper(values = []) {
  return uniqueSorted(values.map(value => String(value).trim().toUpperCase()));
}

function requireOpaqueId(value, label) {
  const output = String(value || '').trim();
  if (!OPAQUE_ID.test(output)) throw new Error(`${label} must be an opaque identifier.`);
  return output;
}

function requireDigest(value, label) {
  const output = String(value || '');
  if (!SHA256.test(output)) throw new Error(`${label} must be SHA-256.`);
  return output;
}

function requireEnum(value, allowed, label) {
  const output = String(value || '').trim().toUpperCase();
  if (!allowed.has(output)) throw new Error(`${label} is unsupported: ${output || '(empty)'}`);
  return output;
}

function normalizeAdapter(adapter, index) {
  const adapterId = requireOpaqueId(adapter?.adapter_id, `Adapter ${index} ID`);
  const adapterClass = requireEnum(adapter?.adapter_class, ADAPTER_CLASSES, `Adapter ${adapterId} class`);
  const acceptedReaderClasses = uniqueSortedLower(adapter?.accepted_reader_classes || []);
  if (!acceptedReaderClasses.length) throw new Error(`Adapter ${adapterId} requires at least one Reader class.`);
  for (const readerClass of acceptedReaderClasses) {
    if (!READER_CLASSES.includes(readerClass)) throw new Error(`Adapter ${adapterId} references unsupported Reader class: ${readerClass}`);
  }
  const acquisitionRoutes = uniqueSortedUpper(adapter?.allowed_acquisition_routes || []);
  if (!acquisitionRoutes.length) throw new Error(`Adapter ${adapterId} requires at least one acquisition route.`);
  for (const route of acquisitionRoutes) requireEnum(route, ACQUISITION_ROUTES, `Adapter ${adapterId} acquisition route`);
  const executionEnvironments = uniqueSortedUpper(adapter?.allowed_execution_environments || []);
  if (!executionEnvironments.length) throw new Error(`Adapter ${adapterId} requires at least one execution environment.`);
  for (const environment of executionEnvironments) requireEnum(environment, EXECUTION_ENVIRONMENTS, `Adapter ${adapterId} execution environment`);
  return {
    adapter_id: adapterId,
    label: String(adapter?.label || adapterId),
    adapter_class: adapterClass,
    version: String(adapter?.version || '1'),
    accepted_reader_classes: acceptedReaderClasses,
    allowed_acquisition_routes: acquisitionRoutes,
    allowed_execution_environments: executionEnvironments,
    requires_provider_receipt: Boolean(adapter?.requires_provider_receipt),
    source_status: String(adapter?.source_status || 'SUPPLIED').toUpperCase(),
    reader_execution_performed_by_registry: false,
    provider_call_performed_by_registry: false,
    transport_authorized: false,
    release_authorized: false,
    identity_inference_authorized: false,
    authorship_attribution_authorized: false,
    surveillance_probability_authorized: false,
    automatic_hold: false
  };
}

export async function compileReaderAdapterRegistry(input = {}, options = {}) {
  const adapters = (input.adapters || []).map(normalizeAdapter)
    .sort((left, right) => left.adapter_id.localeCompare(right.adapter_id));
  if (!adapters.length) throw new Error('Reader Adapter Registry requires at least one adapter.');
  if (new Set(adapters.map(adapter => adapter.adapter_id)).size !== adapters.length) {
    throw new Error('Reader Adapter IDs must be unique.');
  }
  const record = {
    schema: READER_ADAPTER_REGISTRY_SCHEMA,
    version: 'v0.1',
    registry_id: input.registryId || randomId('registry_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    adapters,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    evidence_basis: uniqueSorted(input.evidenceBasis || ['declared Reader adapter contracts']),
    missingness: uniqueSorted(input.missingness || []),
    alternatives: uniqueSorted(input.alternatives || [
      'direct local Reader execution',
      'operator-preserved provider receipt',
      'synthetic fixture only'
    ]),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    reader_execution_performed: false,
    provider_call_performed: false,
    transport_authorized: false,
    release_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    registry_digest: null
  };
  record.registry_digest = await canonicalDigest(REGISTRY_DOMAIN, without(record, 'registry_digest'), options);
  return freeze(record);
}

export async function verifyReaderAdapterRegistry(value, options = {}) {
  return Boolean(value
    && value.schema === READER_ADAPTER_REGISTRY_SCHEMA
    && SHA256.test(String(value.registry_digest || ''))
    && value.registry_digest === await canonicalDigest(REGISTRY_DOMAIN, without(value, 'registry_digest'), options));
}

export async function compileReaderResultProvenance(input = {}, options = {}) {
  const registry = input.registry;
  if (!await verifyReaderAdapterRegistry(registry, options)) throw new Error('Reader result provenance requires a verified adapter registry.');
  if (!input.reader || input.reader.schema !== READER_PROFILE_SCHEMA || !await verifyReaderProfile(input.reader, options)) {
    throw new Error('Reader result provenance requires a verified Reader profile.');
  }
  if (!input.caseMap || input.caseMap.schema !== CASE_MAP_SCHEMA || !await verifyCaseMap(input.caseMap, options)) {
    throw new Error('Reader result provenance requires a verified Case Map.');
  }
  if (!input.routeMemory || input.routeMemory.schema !== ROUTE_MEMORY_SCHEMA || !await verifyRouteMemory(input.routeMemory, options)) {
    throw new Error('Reader result provenance requires verified Route Memory.');
  }
  if (input.caseMap.case_id !== input.routeMemory.case_id) throw new Error('Case Map and Route Memory case IDs must match.');

  const adapterId = requireOpaqueId(input.adapterId, 'Reader adapter ID');
  const adapter = registry.adapters.find(candidate => candidate.adapter_id === adapterId);
  if (!adapter) throw new Error(`Reader adapter is not registered: ${adapterId}`);
  if (!adapter.accepted_reader_classes.includes(input.reader.reader_class)) {
    throw new Error(`Reader class ${input.reader.reader_class} is not accepted by adapter ${adapterId}.`);
  }

  const acquisitionRoute = requireEnum(input.acquisitionRoute, ACQUISITION_ROUTES, 'Reader result acquisition route');
  if (!adapter.allowed_acquisition_routes.includes(acquisitionRoute)) {
    throw new Error(`Adapter ${adapterId} does not allow acquisition route ${acquisitionRoute}.`);
  }
  const executionEnvironment = requireEnum(input.executionEnvironment, EXECUTION_ENVIRONMENTS, 'Reader execution environment');
  if (!adapter.allowed_execution_environments.includes(executionEnvironment)) {
    throw new Error(`Adapter ${adapterId} does not allow execution environment ${executionEnvironment}.`);
  }
  const fixtureStatus = requireEnum(input.fixtureStatus || 'NONE', FIXTURE_STATUSES, 'Reader result fixture status');
  const resultState = String(input.resultState || 'OBSERVED').toUpperCase();
  if (!OBSERVATION_STATES.includes(resultState)) throw new Error(`Unsupported Reader result state: ${resultState}`);

  const providerReceiptRequired = adapter.requires_provider_receipt
    || acquisitionRoute === 'PROVIDER_RECEIPT_REFERENCE'
    || executionEnvironment === 'EXTERNAL_PROVIDER';
  const providerReceiptReference = input.providerReceiptReference
    || input.reader.provider_receipt_reference
    || null;
  const missingness = uniqueSorted([
    ...(input.missingness || []),
    ...(providerReceiptRequired && !providerReceiptReference ? ['provider receipt reference'] : []),
    ...(resultState !== 'OBSERVED' ? [`Reader result state: ${resultState}`] : [])
  ]);
  const provenanceBound = !providerReceiptRequired || Boolean(providerReceiptReference);

  const record = {
    schema: READER_RESULT_PROVENANCE_SCHEMA,
    version: 'v0.1',
    provenance_id: input.provenanceId || randomId('readerprov_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    registry_reference: registry.registry_digest,
    adapter: {
      adapter_id: adapter.adapter_id,
      adapter_class: adapter.adapter_class,
      adapter_version: adapter.version
    },
    reader: {
      reader_id: input.reader.reader_id,
      reader_class: input.reader.reader_class,
      reader_version: input.reader.version,
      reader_digest: input.reader.reader_digest
    },
    case_id: input.caseMap.case_id,
    case_map_digest: input.caseMap.case_map_digest,
    route_memory_digest: input.routeMemory.route_memory_digest,
    reader_input_digest: requireDigest(input.readerInputDigest, 'Reader input digest'),
    reader_result_digest: requireDigest(input.readerResultDigest, 'Reader result digest'),
    result_schema: input.resultSchema ? String(input.resultSchema) : null,
    result_reference: input.resultReference ? String(input.resultReference) : null,
    result_state: resultState,
    acquisition_route: acquisitionRoute,
    acquisition_receipt_reference: input.acquisitionReceiptReference ? String(input.acquisitionReceiptReference) : null,
    execution_environment: executionEnvironment,
    declared_executor_class: String(input.declaredExecutorClass || 'UNKNOWN').toUpperCase(),
    execution_receipt_reference: input.executionReceiptReference ? String(input.executionReceiptReference) : null,
    execution_observed_by_registry: false,
    provider_receipt_required: providerReceiptRequired,
    provider_receipt_reference: providerReceiptReference ? String(providerReceiptReference) : null,
    fixture_status: fixtureStatus,
    source_status: String(input.sourceStatus || (fixtureStatus === 'NONE' ? 'SUPPLIED' : 'SIMULATED')).toUpperCase(),
    provenance_state: provenanceBound ? 'PROVENANCE_BOUND' : 'PROVENANCE_INCOMPLETE',
    evidence_basis: uniqueSorted(input.evidenceBasis || [
      'verified Reader profile',
      'verified Case Map',
      'verified Route Memory',
      'registered adapter contract',
      'operator-supplied input and result digests'
    ]),
    observations: clone(input.observations || []),
    missingness,
    alternatives: uniqueSorted(input.alternatives || [
      'result imported under a different adapter',
      'provider receipt unavailable',
      'synthetic fixture rather than external execution',
      'operator transcription error'
    ]),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    input_content_present: false,
    result_content_present: false,
    reader_execution_performed_by_registry: false,
    provider_call_performed_by_registry: false,
    network_called_by_registry: false,
    storage_mutated_by_registry: false,
    transport_authorized: false,
    release_authorized: false,
    identity_inference_authorized: false,
    authorship_attribution_authorized: false,
    surveillance_probability_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    recommendation_not_command: true,
    provenance_digest: null
  };
  record.provenance_digest = await canonicalDigest(PROVENANCE_DOMAIN, without(record, 'provenance_digest'), options);
  return freeze(record);
}

export async function verifyReaderResultProvenance(value, options = {}) {
  return Boolean(value
    && value.schema === READER_RESULT_PROVENANCE_SCHEMA
    && SHA256.test(String(value.provenance_digest || ''))
    && value.provenance_digest === await canonicalDigest(PROVENANCE_DOMAIN, without(value, 'provenance_digest'), options));
}

export async function replayReaderResultProvenance(value, registry, input = {}, options = {}) {
  const provenanceVerified = await verifyReaderResultProvenance(value, options);
  const registryVerified = await verifyReaderAdapterRegistry(registry, options);
  const adapter = registryVerified
    ? registry.adapters.find(candidate => candidate.adapter_id === value?.adapter?.adapter_id)
    : null;
  const relationVerified = Boolean(adapter
    && registry.registry_digest === value?.registry_reference
    && adapter.adapter_class === value?.adapter?.adapter_class
    && adapter.version === value?.adapter?.adapter_version
    && adapter.accepted_reader_classes.includes(value?.reader?.reader_class));
  const verified = provenanceVerified && registryVerified && relationVerified;
  const record = {
    schema: READER_RESULT_PROVENANCE_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('readerprovreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    source_provenance_id: value?.provenance_id || null,
    source_provenance_digest: value?.provenance_digest || null,
    registry_reference: registry?.registry_digest || null,
    status: verified ? 'READER_RESULT_PROVENANCE_REPLAY_VERIFIED' : 'READER_RESULT_PROVENANCE_REPLAY_HELD',
    provenance_digest_verified: provenanceVerified,
    registry_digest_verified: registryVerified,
    adapter_relation_verified: relationVerified,
    input_content_restored: false,
    result_content_restored: false,
    reader_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    transport_authorized: false,
    release_authorized: false,
    identity_inference_authorized: false,
    authorship_attribution_authorized: false,
    surveillance_probability_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    recommendation_not_command: true,
    observations: verified
      ? ['Reader result provenance and adapter relation verified without Reader re-execution.']
      : ['Reader result provenance replay held for digest or adapter-relation repair.'],
    missingness: [],
    alternatives: [],
    open_questions: verified ? [] : ['Which provenance, registry, or adapter field changed after sealing?'],
    closure: { required: true, status: 'OPEN' },
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyReaderResultProvenanceReplay(value, options = {}) {
  return Boolean(value
    && value.schema === READER_RESULT_PROVENANCE_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
