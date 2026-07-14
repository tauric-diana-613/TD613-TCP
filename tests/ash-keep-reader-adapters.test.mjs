import assert from 'node:assert/strict';
import { canonicalDigest } from '../app/dome-world/ash/canonical-json.js';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  READER_ADAPTER_REGISTRY_SCHEMA,
  READER_RESULT_PROVENANCE_REPLAY_SCHEMA,
  READER_RESULT_PROVENANCE_SCHEMA,
  compileReaderAdapterRegistry,
  compileReaderResultProvenance,
  replayReaderResultProvenance,
  verifyReaderAdapterRegistry,
  verifyReaderResultProvenance,
  verifyReaderResultProvenanceReplay
} from '../app/engine/ash-keep-reader-adapters.js';

const createdAt = '2026-07-14T21:15:00.000Z';
const caseMap = await compileCaseMap({
  caseId: 'case_reader_provenance',
  profile: 'research',
  title: 'Reader provenance fixture',
  createdAt,
  rooms: [{ id: 'room_source', label: 'Source room' }],
  nodes: [{ id: 'node_source', type: 'source', label: 'Source', room_id: 'room_source' }],
  relationships: [],
  evidenceBasis: ['fixture']
});
const routeMemory = await compileRouteMemory({
  caseId: caseMap.case_id,
  createdAt,
  entries: [],
  evidenceBasis: ['fixture route memory']
});
const deterministicReader = await compileReaderProfile({
  readerId: 'reader_provenance_local',
  label: 'Local deterministic Reader',
  readerClass: 'deterministic-baseline',
  repeatCount: 4,
  seeded: true,
  createdAt,
  evidenceBasis: ['local deterministic fixture']
});
const importedReader = await compileReaderProfile({
  readerId: 'reader_provenance_external',
  label: 'Imported provider Reader',
  readerClass: 'imported-provider-output',
  repeatCount: 1,
  seeded: false,
  createdAt,
  evidenceBasis: ['imported provider fixture']
});

const registry = await compileReaderAdapterRegistry({
  registryId: 'registry_reader_fixture',
  createdAt,
  adapters: [
    {
      adapter_id: 'adapter_local_deterministic',
      label: 'Local deterministic adapter',
      adapter_class: 'DETERMINISTIC_REFERENCE',
      accepted_reader_classes: ['deterministic-baseline'],
      allowed_acquisition_routes: ['LOCAL_GENERATED'],
      allowed_execution_environments: ['NODE_LOCAL'],
      requires_provider_receipt: false
    },
    {
      adapter_id: 'adapter_imported_provider',
      label: 'Imported provider result adapter',
      adapter_class: 'IMPORTED_RESULT',
      accepted_reader_classes: ['imported-provider-output'],
      allowed_acquisition_routes: ['PROVIDER_RECEIPT_REFERENCE', 'IMPORTED_FILE'],
      allowed_execution_environments: ['EXTERNAL_PROVIDER'],
      requires_provider_receipt: true
    }
  ],
  evidenceBasis: ['declared test adapters']
});

assert.equal(registry.schema, READER_ADAPTER_REGISTRY_SCHEMA);
assert.equal(registry.reader_execution_performed, false);
assert.equal(registry.provider_call_performed, false);
assert.equal(registry.transport_authorized, false);
assert.equal(registry.release_authorized, false);
assert.equal(await verifyReaderAdapterRegistry(registry), true);

const inputDigest = await canonicalDigest('TD613:TEST:READER-INPUT', { references: ['node_source'] });
const resultDigest = await canonicalDigest('TD613:TEST:READER-RESULT', { recovered: ['node_source'] });

const localProvenance = await compileReaderResultProvenance({
  provenanceId: 'readerprov_local_fixture',
  createdAt,
  registry,
  adapterId: 'adapter_local_deterministic',
  reader: deterministicReader,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: resultDigest,
  resultSchema: 'td613.test.reader-result/v0.1',
  resultReference: 'result_local_fixture',
  resultState: 'OBSERVED',
  acquisitionRoute: 'LOCAL_GENERATED',
  executionEnvironment: 'NODE_LOCAL',
  declaredExecutorClass: 'DETERMINISTIC_TEST_RUNTIME'
});

assert.equal(localProvenance.schema, READER_RESULT_PROVENANCE_SCHEMA);
assert.equal(localProvenance.provenance_state, 'PROVENANCE_BOUND');
assert.equal(localProvenance.provider_receipt_required, false);
assert.equal(localProvenance.input_content_present, false);
assert.equal(localProvenance.result_content_present, false);
assert.equal(localProvenance.reader_execution_performed_by_registry, false);
assert.equal(localProvenance.provider_call_performed_by_registry, false);
assert.equal(localProvenance.identity_inference_authorized, false);
assert.equal(localProvenance.authorship_attribution_authorized, false);
assert.equal(localProvenance.surveillance_probability_authorized, false);
assert.equal(await verifyReaderResultProvenance(localProvenance), true);

const incompleteExternal = await compileReaderResultProvenance({
  provenanceId: 'readerprov_external_incomplete',
  createdAt,
  registry,
  adapterId: 'adapter_imported_provider',
  reader: importedReader,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: resultDigest,
  resultState: 'OBSERVED',
  acquisitionRoute: 'IMPORTED_FILE',
  executionEnvironment: 'EXTERNAL_PROVIDER',
  declaredExecutorClass: 'EXTERNAL_PROVIDER'
});
assert.equal(incompleteExternal.provenance_state, 'PROVENANCE_INCOMPLETE');
assert.equal(incompleteExternal.provider_receipt_required, true);
assert.equal(incompleteExternal.provider_receipt_reference, null);
assert.ok(incompleteExternal.missingness.includes('provider receipt reference'));
assert.equal(await verifyReaderResultProvenance(incompleteExternal), true);

const boundExternal = await compileReaderResultProvenance({
  provenanceId: 'readerprov_external_bound',
  createdAt,
  registry,
  adapterId: 'adapter_imported_provider',
  reader: importedReader,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: resultDigest,
  resultState: 'OBSERVED',
  acquisitionRoute: 'PROVIDER_RECEIPT_REFERENCE',
  acquisitionReceiptReference: 'acquisition_receipt_613',
  executionEnvironment: 'EXTERNAL_PROVIDER',
  declaredExecutorClass: 'EXTERNAL_PROVIDER',
  executionReceiptReference: 'execution_receipt_613',
  providerReceiptReference: 'provider_receipt_613'
});
assert.equal(boundExternal.provenance_state, 'PROVENANCE_BOUND');
assert.equal(boundExternal.provider_receipt_reference, 'provider_receipt_613');
assert.equal(await verifyReaderResultProvenance(boundExternal), true);

const tampered = structuredClone(boundExternal);
tampered.reader_result_digest = inputDigest;
assert.equal(await verifyReaderResultProvenance(tampered), false);

const replay = await replayReaderResultProvenance(boundExternal, registry, {
  replayId: 'readerprovreplay_bound_fixture',
  createdAt
});
assert.equal(replay.schema, READER_RESULT_PROVENANCE_REPLAY_SCHEMA);
assert.equal(replay.status, 'READER_RESULT_PROVENANCE_REPLAY_VERIFIED');
assert.equal(replay.reader_reexecuted, false);
assert.equal(replay.provider_called, false);
assert.equal(replay.network_called, false);
assert.equal(replay.storage_mutated, false);
assert.equal(await verifyReaderResultProvenanceReplay(replay), true);

const changedRegistry = structuredClone(registry);
changedRegistry.adapters[1].version = '2';
const heldReplay = await replayReaderResultProvenance(boundExternal, changedRegistry, {
  replayId: 'readerprovreplay_held_fixture',
  createdAt
});
assert.equal(heldReplay.status, 'READER_RESULT_PROVENANCE_REPLAY_HELD');
assert.equal(heldReplay.reader_reexecuted, false);
assert.equal(heldReplay.provider_called, false);

await assert.rejects(
  compileReaderResultProvenance({
    registry,
    adapterId: 'adapter_local_deterministic',
    reader: importedReader,
    caseMap,
    routeMemory,
    readerInputDigest: inputDigest,
    readerResultDigest: resultDigest,
    acquisitionRoute: 'LOCAL_GENERATED',
    executionEnvironment: 'NODE_LOCAL'
  }),
  /not accepted by adapter/
);

await assert.rejects(
  compileReaderResultProvenance({
    registry,
    adapterId: 'adapter_imported_provider',
    reader: importedReader,
    caseMap,
    routeMemory,
    readerInputDigest: inputDigest,
    readerResultDigest: resultDigest,
    acquisitionRoute: 'LOCAL_GENERATED',
    executionEnvironment: 'EXTERNAL_PROVIDER'
  }),
  /does not allow acquisition route/
);

console.log('ash-keep-reader-adapters.test.mjs passed');
