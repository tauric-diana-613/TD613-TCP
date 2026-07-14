import assert from 'node:assert/strict';
import { canonicalDigest } from '../app/dome-world/ash/canonical-json.js';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRouteMemory
} from '../app/engine/ash-keep-core.js';
import { compileMoireRebuildAssay } from '../app/engine/ash-keep-moire.js';
import {
  compileReaderAdapterRegistry,
  compileReaderResultProvenance
} from '../app/engine/ash-keep-reader-adapters.js';
import { compileReaderDisagreementLedger } from '../app/engine/ash-keep-reader-disagreement.js';
import {
  MATCHED_BENIGN_CONTROL_BANK_SCHEMA,
  MATCHED_BENIGN_CONTROL_REPLAY_SCHEMA,
  compileMatchedBenignControlBank,
  replayMatchedBenignControlBank,
  verifyMatchedBenignControlBank,
  verifyMatchedBenignControlReplay
} from '../app/engine/ash-keep-benign-controls.js';

const createdAt = '2026-07-14T23:00:00.000Z';
const resultSchema = 'td613.test.matched-control-reader-summary/v0.1';
const inputContractDigest = await canonicalDigest('TD613:TEST:MATCHED-CONTROL-INPUT-CONTRACT', {
  purpose: 'same verified Reader ensemble and purpose-shaped output contract',
  version: 'v0.1'
});
const matchProfile = {
  topic: 'public archive custody',
  genre: 'research memorandum',
  template: 'two-room case map',
  register: 'forensic academic',
  approximate_length_band: '800-1200-words',
  source_conditions: ['declared fixture', 'same-language', 'same-document-class']
};

const registry = await compileReaderAdapterRegistry({
  registryId: 'registry_matched_control_fixture',
  createdAt,
  adapters: [
    {
      adapter_id: 'adapter_control_deterministic',
      label: 'Control deterministic adapter',
      adapter_class: 'DETERMINISTIC_REFERENCE',
      accepted_reader_classes: ['deterministic-baseline'],
      allowed_acquisition_routes: ['LOCAL_GENERATED'],
      allowed_execution_environments: ['NODE_LOCAL']
    },
    {
      adapter_id: 'adapter_control_synthetic',
      label: 'Control synthetic adapter',
      adapter_class: 'SYNTHETIC_FIXTURE',
      accepted_reader_classes: ['synthetic-external-provider'],
      allowed_acquisition_routes: ['SYNTHETIC_FIXTURE'],
      allowed_execution_environments: ['DECLARED_FIXTURE']
    }
  ]
});

const readerA = await compileReaderProfile({
  readerId: 'reader_control_alpha',
  label: 'Control Reader Alpha',
  readerClass: 'deterministic-baseline',
  createdAt,
  repeatCount: 4,
  seeded: true,
  evidenceBasis: ['matched control deterministic fixture']
});
const readerB = await compileReaderProfile({
  readerId: 'reader_control_beta',
  label: 'Control Reader Beta',
  readerClass: 'synthetic-external-provider',
  createdAt,
  seeded: true,
  evidenceBasis: ['matched control synthetic fixture']
});

function moireResults(readerId, variant = 0) {
  const chronology = 300 + variant * 10;
  return [
    {
      observation_id: `moire_${readerId}_baseline`,
      projection_ids: [],
      state: 'OBSERVED',
      recovered: { node_ids: ['node_shared'], relationship_ids: [], chronology, source_style_linkage: 200 },
      benign_control: true
    },
    {
      observation_id: `moire_${readerId}_left`,
      projection_ids: ['projection_left'],
      state: 'OBSERVED',
      recovered: { node_ids: ['node_shared', 'node_left'], relationship_ids: ['edge_left'], chronology: chronology + 50, source_style_linkage: 250 }
    },
    {
      observation_id: `moire_${readerId}_right`,
      projection_ids: ['projection_right'],
      state: 'OBSERVED',
      recovered: { node_ids: ['node_shared', 'node_right'], relationship_ids: ['edge_bridge'], chronology: chronology + 100, source_style_linkage: 300 }
    },
    {
      observation_id: `moire_${readerId}_pair`,
      projection_ids: ['projection_left', 'projection_right'],
      state: 'OBSERVED',
      recovered: {
        node_ids: ['node_shared', 'node_left', 'node_right', 'node_action'],
        relationship_ids: ['edge_left', 'edge_bridge', 'edge_action'],
        chronology: chronology + 200,
        source_style_linkage: 400
      },
      held_out: true
    }
  ];
}

async function buildFixture(fixtureId, summaries, overrides = {}) {
  const caseMap = await compileCaseMap({
    caseId: `case_${fixtureId}`,
    profile: 'research',
    title: `Matched control fixture ${fixtureId}`,
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
    evidenceBasis: ['matched control fixture']
  });
  const routeMemory = await compileRouteMemory({
    caseId: caseMap.case_id,
    createdAt,
    entries: [],
    evidenceBasis: ['matched control route fixture']
  });
  const readers = [readerA, readerB];
  const moireAssays = [];
  for (let index = 0; index < readers.length; index += 1) {
    moireAssays.push(await compileMoireRebuildAssay({
      assayId: `moire_${fixtureId}_${readers[index].reader_id}`,
      createdAt,
      caseMap,
      routeMemory,
      reader: readers[index],
      projections: [
        {
          projection_id: 'projection_left',
          disclosed_opaque_references: ['node_left'],
          route_id: 'route_left',
          purpose: 'left projection',
          source_status: 'SUPPLIED'
        },
        {
          projection_id: 'projection_right',
          disclosed_opaque_references: ['node_right'],
          route_id: 'route_right',
          purpose: 'right projection',
          source_status: 'SUPPLIED'
        }
      ],
      results: moireResults(readers[index].reader_id, index),
      calibration: {
        preregisteredFixture: true,
        benignControl: true,
        heldOut: true,
        sourceDriftCheck: true,
        alternativeReader: true,
        exactThresholds: { minimum_observed_pairs: 1 }
      }
    }));
  }

  const readerInputDigest = await canonicalDigest('TD613:TEST:MATCHED-CONTROL-READER-INPUT', {
    fixture_id: fixtureId,
    input_contract_digest: overrides.input_contract_digest || inputContractDigest
  });
  const provenances = [];
  for (let index = 0; index < readers.length; index += 1) {
    const reader = readers[index];
    const isAlpha = index === 0;
    const resultDigest = await canonicalDigest('TD613:TEST:MATCHED-CONTROL-READER-RESULT', {
      fixture_id: fixtureId,
      reader_id: reader.reader_id,
      summary: isAlpha ? summaries.alpha : summaries.beta
    });
    provenances.push(await compileReaderResultProvenance({
      provenanceId: `readerprov_${fixtureId}_${reader.reader_id}`,
      createdAt,
      registry,
      adapterId: isAlpha ? 'adapter_control_deterministic' : 'adapter_control_synthetic',
      reader,
      caseMap,
      routeMemory,
      readerInputDigest,
      readerResultDigest: resultDigest,
      resultSchema,
      resultReference: `result_${fixtureId}_${reader.reader_id}`,
      resultState: 'OBSERVED',
      acquisitionRoute: isAlpha ? 'LOCAL_GENERATED' : 'SYNTHETIC_FIXTURE',
      executionEnvironment: isAlpha ? 'NODE_LOCAL' : 'DECLARED_FIXTURE',
      declaredExecutorClass: isAlpha ? 'DETERMINISTIC_FIXTURE' : 'DECLARED_FIXTURE',
      fixtureStatus: isAlpha ? 'REFERENCE' : 'SYNTHETIC'
    }));
  }

  const disagreementLedger = await compileReaderDisagreementLedger({
    ledgerId: `readerdisagree_${fixtureId}`,
    createdAt,
    registry,
    caseMap,
    routeMemory,
    entries: [
      { provenance: provenances[0], summary: summaries.alpha },
      { provenance: provenances[1], summary: summaries.beta }
    ],
    evidenceBasis: ['matched control disagreement fixture']
  });

  return {
    fixture_id: fixtureId,
    fixture_class: overrides.fixture_class || 'BENIGN_CONTROL',
    document_digest: await canonicalDigest('TD613:TEST:MATCHED-CONTROL-DOCUMENT', { fixture_id: fixtureId }),
    source_provenance_digest: await canonicalDigest('TD613:TEST:MATCHED-CONTROL-SOURCE-PROVENANCE', { fixture_id: fixtureId }),
    source_status: overrides.source_status || 'CONSTRUCTED_FIXTURE',
    input_contract_digest: overrides.input_contract_digest || inputContractDigest,
    match_profile: { ...matchProfile, ...(overrides.match_profile || {}) },
    moire_assays: moireAssays,
    provenances,
    disagreement_ledger: disagreementLedger,
    residual_confounds: overrides.residual_confounds || [],
    operator_notes: overrides.operator_notes || []
  };
}

const targetSummaries = {
  alpha: {
    node_ids: ['node_shared', 'node_left', 'node_right'],
    relationship_ids: ['edge_bridge', 'edge_left'],
    chronology_millipoints: 800,
    source_style_linkage_millipoints: 200
  },
  beta: {
    node_ids: ['node_shared', 'node_right', 'node_action'],
    relationship_ids: ['edge_action'],
    chronology_millipoints: 300,
    source_style_linkage_millipoints: 800
  }
};
const controlZero = {
  alpha: {
    node_ids: ['node_shared', 'node_right'],
    relationship_ids: ['edge_bridge'],
    chronology_millipoints: 500,
    source_style_linkage_millipoints: 500
  },
  beta: {
    node_ids: ['node_shared', 'node_right'],
    relationship_ids: ['edge_bridge'],
    chronology_millipoints: 500,
    source_style_linkage_millipoints: 500
  }
};
const controlOne = {
  alpha: {
    node_ids: ['node_shared', 'node_right', 'node_left'],
    relationship_ids: ['edge_bridge'],
    chronology_millipoints: 550,
    source_style_linkage_millipoints: 450
  },
  beta: {
    node_ids: ['node_shared', 'node_right'],
    relationship_ids: ['edge_bridge'],
    chronology_millipoints: 500,
    source_style_linkage_millipoints: 500
  }
};
const controlTwo = {
  alpha: {
    node_ids: ['node_shared', 'node_right'],
    relationship_ids: ['edge_bridge'],
    chronology_millipoints: 400,
    source_style_linkage_millipoints: 600
  },
  beta: {
    node_ids: ['node_shared', 'node_right', 'node_action'],
    relationship_ids: ['edge_bridge', 'edge_action'],
    chronology_millipoints: 600,
    source_style_linkage_millipoints: 450
  }
};

const target = await buildFixture('fixture_target', targetSummaries, {
  fixture_class: 'TARGET',
  residual_confounds: ['Target supplied as a constructed research fixture.']
});
const controlA = await buildFixture('fixture_control_a', controlZero);
const controlB = await buildFixture('fixture_control_b', controlOne);
const controlC = await buildFixture('fixture_control_c', controlTwo);

const calibrated = await compileMatchedBenignControlBank({
  bankId: 'controlbank_calibrated_fixture',
  createdAt,
  target,
  controls: [controlC, controlA, controlB],
  evidenceBasis: ['three matched benign adjacent-document controls']
});

assert.equal(calibrated.schema, MATCHED_BENIGN_CONTROL_BANK_SCHEMA);
assert.equal(calibrated.bank_state, 'CALIBRATED_MATCHED_CONTROL_BANK');
assert.equal(calibrated.calibration_eligible, true);
assert.equal(calibrated.eligible_control_count, 3);
assert.equal(calibrated.excluded_control_count, 0);
assert.deepEqual(calibrated.reader_ids, ['reader_control_alpha', 'reader_control_beta']);
assert.deepEqual(calibrated.controls.map(control => control.fixture_id), [
  'fixture_control_a', 'fixture_control_b', 'fixture_control_c'
]);
assert.equal(calibrated.set_component_comparisons.node_ids.target_value, 2);
assert.deepEqual(calibrated.set_component_comparisons.node_ids.control_values.map(row => row.value), [0, 1, 1]);
assert.equal(calibrated.set_component_comparisons.node_ids.target_position, 'ABOVE_CONTROL_RANGE');
assert.equal(calibrated.numeric_component_comparisons.chronology_millipoints.target_value, 500);
assert.deepEqual(calibrated.numeric_component_comparisons.chronology_millipoints.control_values.map(row => row.value), [0, 50, 200]);
assert.equal(calibrated.numeric_component_comparisons.chronology_millipoints.target_position, 'ABOVE_CONTROL_RANGE');
assert.equal(calibrated.universal_control_score, null);
assert.equal(calibrated.real_surveillance_probability, null);
assert.equal(calibrated.raw_document_present, false);
assert.equal(calibrated.readers_executed_by_bank, false);
assert.equal(calibrated.provider_call_performed, false);
assert.equal(calibrated.transport_authorized, false);
assert.equal(calibrated.release_authorized, false);
assert.equal(calibrated.truth_adjudication_authorized, false);
assert.equal(calibrated.automatic_hold, false);
assert.equal(await verifyMatchedBenignControlBank(calibrated), true);

const replay = await replayMatchedBenignControlBank(calibrated, {
  replayId: 'controlbankreplay_calibrated',
  createdAt,
  target,
  controls: [controlA, controlB, controlC]
});
assert.equal(replay.schema, MATCHED_BENIGN_CONTROL_REPLAY_SCHEMA);
assert.equal(replay.status, 'MATCHED_CONTROL_REPLAY_VERIFIED');
assert.equal(replay.control_distribution_recomputed, false);
assert.equal(replay.raw_documents_restored, false);
assert.equal(replay.readers_reexecuted, false);
assert.equal(replay.provider_called, false);
assert.equal(await verifyMatchedBenignControlReplay(replay), true);

const tampered = structuredClone(calibrated);
tampered.set_component_comparisons.node_ids.target_value = 0;
assert.equal(await verifyMatchedBenignControlBank(tampered), false);
const tamperedControl = structuredClone(controlA);
tamperedControl.disagreement_ledger.ledger_digest = controlB.disagreement_ledger.ledger_digest;
const heldReplay = await replayMatchedBenignControlBank(calibrated, {
  replayId: 'controlbankreplay_held',
  createdAt,
  target,
  controls: [tamperedControl, controlB, controlC]
});
assert.equal(heldReplay.status, 'MATCHED_CONTROL_REPLAY_HELD');
assert.equal(heldReplay.readers_reexecuted, false);

const mismatched = await buildFixture('fixture_control_mismatch', controlZero, {
  match_profile: { register: 'press release' },
  residual_confounds: ['Register intentionally mismatched for exclusion fixture.']
});
const partial = await compileMatchedBenignControlBank({
  bankId: 'controlbank_partial_fixture',
  createdAt,
  target,
  controls: [controlA, controlB, controlC, mismatched]
});
assert.equal(partial.bank_state, 'PARTIAL_MATCHED_CONTROL_BANK');
assert.equal(partial.calibration_eligible, true);
assert.equal(partial.eligible_control_count, 3);
assert.equal(partial.excluded_control_count, 1);
const excluded = partial.controls.find(control => control.fixture_id === 'fixture_control_mismatch');
assert.equal(excluded.control_eligible, false);
assert.ok(excluded.matching_failures.includes('MATCH_MISMATCH:register'));
assert.ok(partial.residual_confounds.includes('fixture_control_mismatch:MATCH_MISMATCH:register'));

const held = await compileMatchedBenignControlBank({
  bankId: 'controlbank_held_fixture',
  createdAt,
  target,
  controls: [controlA, controlB, mismatched]
});
assert.equal(held.bank_state, 'CONTROL_BANK_HELD');
assert.equal(held.calibration_eligible, false);
assert.equal(held.eligible_control_count, 2);
assert.equal(held.set_component_comparisons.node_ids.eligible_control_count, 2);
assert.ok(held.missingness.includes('Eligible controls 2/3'));

await assert.rejects(
  compileMatchedBenignControlBank({
    target: { ...target, raw_document: 'forbidden raw content' },
    controls: [controlA, controlB, controlC]
  }),
  /must not carry raw document or Reader content/
);
await assert.rejects(
  compileMatchedBenignControlBank({ target, controls: [controlA, controlB] }),
  /at least three benign controls/
);

const contractMismatch = await buildFixture('fixture_control_contract_mismatch', controlZero, {
  input_contract_digest: await canonicalDigest('TD613:TEST:OTHER-CONTROL-CONTRACT', { version: 'v0.1' })
});
const excludedContract = await compileMatchedBenignControlBank({
  bankId: 'controlbank_contract_mismatch',
  createdAt,
  target,
  controls: [controlA, controlB, controlC, contractMismatch]
});
assert.equal(excludedContract.eligible_control_count, 3);
assert.ok(excludedContract.controls
  .find(control => control.fixture_id === 'fixture_control_contract_mismatch')
  .matching_failures.includes('MATCH_MISMATCH:input_contract_digest'));

console.log('ash-keep-benign-controls.test.mjs passed');
