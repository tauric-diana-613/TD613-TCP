import assert from 'node:assert/strict';
import { canonicalDigest } from '../app/dome-world/ash/canonical-json.js';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  compileReaderAdapterRegistry,
  compileReaderResultProvenance,
  verifyReaderAdapterRegistry,
  verifyReaderResultProvenance
} from '../app/engine/ash-keep-reader-adapters.js';

const createdAt = '2026-07-14T22:00:00.000Z';
const adapterDefinition = {
  adapter_id: 'adapter_case_invariant',
  label: 'Case invariant adapter',
  adapter_class: 'LOCAL_RUNTIME',
  version: '1',
  accepted_reader_classes: ['local-hush'],
  allowed_acquisition_routes: ['LOCAL_GENERATED'],
  allowed_execution_environments: ['BROWSER_LOCAL'],
  requires_provider_receipt: false
};
const canonicalRegistry = await compileReaderAdapterRegistry({
  registryId: 'registry_case_invariant',
  createdAt,
  adapters: [adapterDefinition],
  evidenceBasis: ['case normalization fixture']
});
const mixedCaseRegistry = await compileReaderAdapterRegistry({
  registryId: 'registry_case_invariant',
  createdAt,
  adapters: [{
    ...adapterDefinition,
    adapter_class: 'local_runtime',
    accepted_reader_classes: ['LOCAL-HUSH'],
    allowed_acquisition_routes: ['local_generated'],
    allowed_execution_environments: ['browser_local']
  }],
  evidenceBasis: ['case normalization fixture']
});
assert.deepEqual(mixedCaseRegistry.adapters, canonicalRegistry.adapters);
assert.equal(mixedCaseRegistry.registry_digest, canonicalRegistry.registry_digest);
assert.equal(await verifyReaderAdapterRegistry(mixedCaseRegistry), true);

const caseMap = await compileCaseMap({
  caseId: 'case_adapter_classes',
  profile: 'research',
  title: 'Adapter class fixtures',
  createdAt,
  rooms: [{ id: 'room_fixture', label: 'Fixture room' }],
  nodes: [{ id: 'node_fixture', type: 'claim', label: 'Fixture node', room_id: 'room_fixture' }],
  relationships: [],
  evidenceBasis: ['adapter class fixture']
});
const routeMemory = await compileRouteMemory({
  caseId: caseMap.case_id,
  createdAt,
  entries: [],
  evidenceBasis: ['adapter class fixture']
});
const registry = await compileReaderAdapterRegistry({
  registryId: 'registry_adapter_classes',
  createdAt,
  adapters: [
    {
      adapter_id: 'adapter_local_runtime',
      label: 'Local runtime adapter',
      adapter_class: 'LOCAL_RUNTIME',
      accepted_reader_classes: ['local-hush'],
      allowed_acquisition_routes: ['LOCAL_GENERATED'],
      allowed_execution_environments: ['BROWSER_LOCAL']
    },
    {
      adapter_id: 'adapter_synthetic_fixture',
      label: 'Synthetic fixture adapter',
      adapter_class: 'SYNTHETIC_FIXTURE',
      accepted_reader_classes: ['synthetic-external-provider'],
      allowed_acquisition_routes: ['SYNTHETIC_FIXTURE'],
      allowed_execution_environments: ['DECLARED_FIXTURE']
    }
  ]
});
const localReader = await compileReaderProfile({
  readerId: 'reader_local_runtime',
  label: 'Local Hush Reader',
  readerClass: 'local-hush',
  createdAt,
  evidenceBasis: ['local runtime fixture']
});
const syntheticReader = await compileReaderProfile({
  readerId: 'reader_synthetic_fixture',
  label: 'Synthetic provider Reader',
  readerClass: 'synthetic-external-provider',
  createdAt,
  seeded: true,
  evidenceBasis: ['declared synthetic fixture']
});
const inputDigest = await canonicalDigest('TD613:TEST:ADAPTER-INPUT', { case_id: caseMap.case_id });
const localResultDigest = await canonicalDigest('TD613:TEST:LOCAL-RESULT', { node_ids: ['node_fixture'] });
const syntheticResultDigest = await canonicalDigest('TD613:TEST:SYNTHETIC-RESULT', { node_ids: [] });

const localProvenance = await compileReaderResultProvenance({
  provenanceId: 'readerprov_local_runtime',
  createdAt,
  registry,
  adapterId: 'adapter_local_runtime',
  reader: localReader,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: localResultDigest,
  resultSchema: 'td613.test.reader-summary/v0.1',
  resultState: 'OBSERVED',
  acquisitionRoute: 'local_generated',
  executionEnvironment: 'browser_local',
  declaredExecutorClass: 'BROWSER_LOCAL_RUNTIME'
});
assert.equal(localProvenance.provenance_state, 'PROVENANCE_BOUND');
assert.equal(localProvenance.acquisition_route, 'LOCAL_GENERATED');
assert.equal(localProvenance.execution_environment, 'BROWSER_LOCAL');
assert.equal(localProvenance.provider_call_performed_by_registry, false);
assert.equal(await verifyReaderResultProvenance(localProvenance), true);

const syntheticProvenance = await compileReaderResultProvenance({
  provenanceId: 'readerprov_synthetic_fixture',
  createdAt,
  registry,
  adapterId: 'adapter_synthetic_fixture',
  reader: syntheticReader,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: syntheticResultDigest,
  resultSchema: 'td613.test.reader-summary/v0.1',
  resultState: 'OBSERVED',
  acquisitionRoute: 'synthetic_fixture',
  executionEnvironment: 'declared_fixture',
  declaredExecutorClass: 'DECLARED_FIXTURE',
  fixtureStatus: 'synthetic'
});
assert.equal(syntheticProvenance.provenance_state, 'PROVENANCE_BOUND');
assert.equal(syntheticProvenance.fixture_status, 'SYNTHETIC');
assert.equal(syntheticProvenance.source_status, 'SIMULATED');
assert.equal(syntheticProvenance.reader_execution_performed_by_registry, false);
assert.equal(await verifyReaderResultProvenance(syntheticProvenance), true);

console.log('ash-keep-reader-adapter-hardening.test.mjs passed');
