import assert from 'node:assert/strict';
import { canonicalDigest } from '../app/dome-world/ash/canonical-json.js';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRouteMemory
} from '../app/engine/ash-keep-core.js';
import {
  compileReaderAdapterRegistry,
  compileReaderResultProvenance
} from '../app/engine/ash-keep-reader-adapters.js';
import {
  READER_DISAGREEMENT_LEDGER_SCHEMA,
  READER_DISAGREEMENT_REPLAY_SCHEMA,
  compileReaderDisagreementLedger,
  replayReaderDisagreementLedger,
  verifyReaderDisagreementLedger,
  verifyReaderDisagreementReplay
} from '../app/engine/ash-keep-reader-disagreement.js';

const createdAt = '2026-07-14T22:15:00.000Z';
const caseMap = await compileCaseMap({
  caseId: 'case_reader_disagreement',
  profile: 'research',
  title: 'Reader disagreement fixture',
  createdAt,
  rooms: [
    { id: 'room_left', label: 'Left room' },
    { id: 'room_right', label: 'Right room' }
  ],
  nodes: [
    { id: 'node_shared', type: 'entity', label: 'Shared entity', room_id: 'room_left' },
    { id: 'node_left', type: 'claim', label: 'Left claim', room_id: 'room_left' },
    { id: 'node_right', type: 'hypothesis', label: 'Right hypothesis', room_id: 'room_right' },
    { id: 'node_action', type: 'intended-action', label: 'Action', room_id: 'room_right' }
  ],
  relationships: [
    { id: 'edge_bridge', from: 'node_shared', to: 'node_right', type: 'suggests' },
    { id: 'edge_left', from: 'node_shared', to: 'node_left', type: 'supports' },
    { id: 'edge_action', from: 'node_right', to: 'node_action', type: 'suggests' }
  ],
  evidenceBasis: ['disagreement fixture']
});
const routeMemory = await compileRouteMemory({
  caseId: caseMap.case_id,
  createdAt,
  entries: [],
  evidenceBasis: ['matched route fixture']
});
const registry = await compileReaderAdapterRegistry({
  registryId: 'registry_disagreement_fixture',
  createdAt,
  adapters: [
    {
      adapter_id: 'adapter_deterministic',
      label: 'Deterministic adapter',
      adapter_class: 'DETERMINISTIC_REFERENCE',
      accepted_reader_classes: ['deterministic-baseline'],
      allowed_acquisition_routes: ['LOCAL_GENERATED'],
      allowed_execution_environments: ['NODE_LOCAL']
    },
    {
      adapter_id: 'adapter_synthetic',
      label: 'Synthetic adapter',
      adapter_class: 'SYNTHETIC_FIXTURE',
      accepted_reader_classes: ['synthetic-external-provider'],
      allowed_acquisition_routes: ['SYNTHETIC_FIXTURE'],
      allowed_execution_environments: ['DECLARED_FIXTURE']
    },
    {
      adapter_id: 'adapter_imported',
      label: 'Imported provider adapter',
      adapter_class: 'IMPORTED_RESULT',
      accepted_reader_classes: ['imported-provider-output'],
      allowed_acquisition_routes: ['IMPORTED_FILE'],
      allowed_execution_environments: ['EXTERNAL_PROVIDER'],
      requires_provider_receipt: true
    }
  ]
});
const readerA = await compileReaderProfile({
  readerId: 'reader_alpha',
  label: 'Reader Alpha',
  readerClass: 'deterministic-baseline',
  createdAt,
  repeatCount: 4,
  seeded: true,
  evidenceBasis: ['deterministic fixture']
});
const readerB = await compileReaderProfile({
  readerId: 'reader_beta',
  label: 'Reader Beta',
  readerClass: 'synthetic-external-provider',
  createdAt,
  seeded: true,
  evidenceBasis: ['synthetic fixture']
});
const readerC = await compileReaderProfile({
  readerId: 'reader_gamma',
  label: 'Reader Gamma',
  readerClass: 'imported-provider-output',
  createdAt,
  evidenceBasis: ['incomplete provider fixture']
});
const inputDigest = await canonicalDigest('TD613:TEST:DISAGREEMENT-INPUT', {
  case_id: caseMap.case_id,
  purpose: 'matched comparison'
});
const resultSchema = 'td613.test.reader-recovery-summary/v0.1';
const resultDigestA = await canonicalDigest('TD613:TEST:DISAGREEMENT-RESULT', { reader: 'alpha' });
const resultDigestB = await canonicalDigest('TD613:TEST:DISAGREEMENT-RESULT', { reader: 'beta' });
const resultDigestC = await canonicalDigest('TD613:TEST:DISAGREEMENT-RESULT', { reader: 'gamma' });

const provenanceA = await compileReaderResultProvenance({
  provenanceId: 'readerprov_disagreement_alpha',
  createdAt,
  registry,
  adapterId: 'adapter_deterministic',
  reader: readerA,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: resultDigestA,
  resultSchema,
  resultReference: 'result_alpha',
  resultState: 'OBSERVED',
  acquisitionRoute: 'LOCAL_GENERATED',
  executionEnvironment: 'NODE_LOCAL',
  declaredExecutorClass: 'DETERMINISTIC_FIXTURE'
});
const provenanceB = await compileReaderResultProvenance({
  provenanceId: 'readerprov_disagreement_beta',
  createdAt,
  registry,
  adapterId: 'adapter_synthetic',
  reader: readerB,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: resultDigestB,
  resultSchema,
  resultReference: 'result_beta',
  resultState: 'OBSERVED',
  acquisitionRoute: 'SYNTHETIC_FIXTURE',
  executionEnvironment: 'DECLARED_FIXTURE',
  declaredExecutorClass: 'DECLARED_FIXTURE',
  fixtureStatus: 'SYNTHETIC'
});
const provenanceC = await compileReaderResultProvenance({
  provenanceId: 'readerprov_disagreement_gamma',
  createdAt,
  registry,
  adapterId: 'adapter_imported',
  reader: readerC,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: resultDigestC,
  resultSchema,
  resultReference: 'result_gamma',
  resultState: 'MISSING',
  acquisitionRoute: 'IMPORTED_FILE',
  executionEnvironment: 'EXTERNAL_PROVIDER',
  declaredExecutorClass: 'EXTERNAL_PROVIDER'
});
assert.equal(provenanceC.provenance_state, 'PROVENANCE_INCOMPLETE');

const summaryA = {
  node_ids: ['node_shared', 'node_left', 'node_right'],
  relationship_ids: ['edge_bridge', 'edge_left'],
  chronology_millipoints: 700,
  source_style_linkage_millipoints: 300
};
const summaryB = {
  node_ids: ['node_shared', 'node_right', 'node_action'],
  relationship_ids: ['edge_action'],
  chronology_millipoints: 500,
  source_style_linkage_millipoints: 700
};

const ledger = await compileReaderDisagreementLedger({
  ledgerId: 'readerdisagree_fixture',
  createdAt,
  registry,
  caseMap,
  routeMemory,
  entries: [
    { provenance: provenanceB, summary: summaryB },
    { provenance: provenanceA, summary: summaryA }
  ],
  evidenceBasis: ['matched purpose-shaped fixture']
});

assert.equal(ledger.schema, READER_DISAGREEMENT_LEDGER_SCHEMA);
assert.equal(ledger.comparison_state, 'OBSERVED_READER_DISAGREEMENT');
assert.equal(ledger.reader_count, 2);
assert.equal(ledger.observed_reader_count, 2);
assert.deepEqual(ledger.entries.map(entry => entry.reader_id), ['reader_alpha', 'reader_beta']);
assert.deepEqual(ledger.set_components.node_ids.consensus_ids, ['node_right', 'node_shared']);
assert.deepEqual(ledger.set_components.node_ids.disagreement_ids, ['node_action', 'node_left']);
assert.deepEqual(ledger.set_components.hypothesis_ids.consensus_ids, ['node_right']);
assert.deepEqual(ledger.set_components.next_action_ids.disagreement_ids, ['node_action']);
assert.deepEqual(ledger.set_components.room_bridge_ids.disagreement_ids, ['edge_bridge']);
assert.equal(ledger.numeric_components.chronology_millipoints.spread, 200);
assert.equal(ledger.numeric_components.source_style_linkage_millipoints.spread, 400);
assert.equal(ledger.pairwise.length, 1);
assert.equal(ledger.pairwise[0].comparison_state, 'OBSERVED');
assert.equal(ledger.pairwise[0].disagreement_detected, true);
assert.equal(ledger.disagreement_detected, true);
assert.equal(ledger.universal_disagreement_score, null);
assert.equal(ledger.real_surveillance_probability, null);
assert.equal(ledger.readers_executed_by_ledger, false);
assert.equal(ledger.provider_call_performed, false);
assert.equal(ledger.transport_authorized, false);
assert.equal(ledger.release_authorized, false);
assert.equal(ledger.identity_inference_authorized, false);
assert.equal(ledger.authorship_attribution_authorized, false);
assert.equal(ledger.ownership_inference_authorized, false);
assert.equal(ledger.automatic_hold, false);
assert.equal(await verifyReaderDisagreementLedger(ledger), true);

const replay = await replayReaderDisagreementLedger(
  ledger,
  registry,
  [provenanceB, provenanceA],
  { replayId: 'readerdisagreereplay_fixture', createdAt }
);
assert.equal(replay.schema, READER_DISAGREEMENT_REPLAY_SCHEMA);
assert.equal(replay.status, 'READER_DISAGREEMENT_REPLAY_VERIFIED');
assert.equal(replay.readers_reexecuted, false);
assert.equal(replay.provider_called, false);
assert.equal(replay.network_called, false);
assert.equal(replay.storage_mutated, false);
assert.equal(await verifyReaderDisagreementReplay(replay), true);

const tamperedLedger = structuredClone(ledger);
tamperedLedger.set_components.node_ids.disagreement_ids = [];
assert.equal(await verifyReaderDisagreementLedger(tamperedLedger), false);
const tamperedProvenance = structuredClone(provenanceA);
tamperedProvenance.reader_result_digest = resultDigestB;
const heldReplay = await replayReaderDisagreementLedger(
  ledger,
  registry,
  [tamperedProvenance, provenanceB],
  { replayId: 'readerdisagreereplay_held', createdAt }
);
assert.equal(heldReplay.status, 'READER_DISAGREEMENT_REPLAY_HELD');
assert.equal(heldReplay.readers_reexecuted, false);

const partialLedger = await compileReaderDisagreementLedger({
  ledgerId: 'readerdisagree_partial',
  createdAt,
  registry,
  caseMap,
  routeMemory,
  entries: [
    { provenance: provenanceA, summary: summaryA },
    { provenance: provenanceB, summary: summaryB },
    { provenance: provenanceC, summary: {} }
  ]
});
assert.equal(partialLedger.comparison_state, 'PARTIAL_READER_DISAGREEMENT');
assert.equal(partialLedger.incomplete_provenance_count, 1);
assert.equal(partialLedger.unresolved_result_count, 1);
assert.equal(partialLedger.observed_reader_count, 2);
assert.equal(partialLedger.pairwise.filter(row => row.comparison_state === 'UNRESOLVED').length, 2);
assert.ok(partialLedger.missingness.includes('1 incomplete provenance receipt(s)'));
assert.ok(partialLedger.missingness.includes('1 unresolved Reader result(s)'));

const mismatchedInput = await compileReaderResultProvenance({
  provenanceId: 'readerprov_disagreement_mismatch',
  createdAt,
  registry,
  adapterId: 'adapter_synthetic',
  reader: readerB,
  caseMap,
  routeMemory,
  readerInputDigest: await canonicalDigest('TD613:TEST:DISAGREEMENT-INPUT', { purpose: 'different' }),
  readerResultDigest: resultDigestB,
  resultSchema,
  resultState: 'OBSERVED',
  acquisitionRoute: 'SYNTHETIC_FIXTURE',
  executionEnvironment: 'DECLARED_FIXTURE',
  fixtureStatus: 'SYNTHETIC'
});
await assert.rejects(
  compileReaderDisagreementLedger({
    registry,
    caseMap,
    routeMemory,
    entries: [
      { provenance: provenanceA, summary: summaryA },
      { provenance: mismatchedInput, summary: summaryB }
    ]
  }),
  /matched Reader input digest/
);

const mismatchedSchema = await compileReaderResultProvenance({
  provenanceId: 'readerprov_disagreement_schema',
  createdAt,
  registry,
  adapterId: 'adapter_synthetic',
  reader: readerB,
  caseMap,
  routeMemory,
  readerInputDigest: inputDigest,
  readerResultDigest: resultDigestB,
  resultSchema: 'td613.test.other-summary/v0.1',
  resultState: 'OBSERVED',
  acquisitionRoute: 'SYNTHETIC_FIXTURE',
  executionEnvironment: 'DECLARED_FIXTURE',
  fixtureStatus: 'SYNTHETIC'
});
await assert.rejects(
  compileReaderDisagreementLedger({
    registry,
    caseMap,
    routeMemory,
    entries: [
      { provenance: provenanceA, summary: summaryA },
      { provenance: mismatchedSchema, summary: summaryB }
    ]
  }),
  /matched result schema/
);

await assert.rejects(
  compileReaderDisagreementLedger({
    registry,
    caseMap,
    routeMemory,
    entries: [
      { provenance: provenanceA, summary: summaryA },
      { provenance: provenanceA, summary: summaryA }
    ]
  }),
  /unique Reader IDs/
);

await assert.rejects(
  compileReaderDisagreementLedger({
    registry,
    caseMap,
    routeMemory,
    entries: [
      { provenance: provenanceA, summary: summaryA },
      { provenance: provenanceB, summary: { node_ids: ['node_unknown'] } }
    ]
  }),
  /unknown Case Map node/
);

await assert.rejects(
  compileReaderDisagreementLedger({
    registry,
    caseMap,
    routeMemory,
    entries: [
      { provenance: provenanceA, summary: summaryA },
      { provenance: provenanceC, summary: { node_ids: ['node_shared'] } }
    ]
  }),
  /cannot carry observed disagreement summary content/
);

console.log('ash-keep-reader-disagreement.test.mjs passed');
