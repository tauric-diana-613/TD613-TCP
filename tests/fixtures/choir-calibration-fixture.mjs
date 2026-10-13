import { canonicalDigest } from '../../app/dome-world/ash/canonical-json.js';
import {
  compileCaseMap,
  compileReaderProfile,
  compileRouteMemory
} from '../../app/engine/ash-keep-core.js';
import { compileMoireRebuildAssay } from '../../app/engine/ash-keep-moire.js';
import {
  compileReaderAdapterRegistry,
  compileReaderResultProvenance
} from '../../app/engine/ash-keep-reader-adapters.js';
import { compileReaderDisagreementLedger } from '../../app/engine/ash-keep-reader-disagreement.js';
import { compileMatchedBenignControlBank } from '../../app/engine/ash-keep-benign-controls.js';

export const createdAt = '2026-07-16T06:00:00.000Z';
const resultSchema = 'td613.test.choir-calibration-reader-summary/v0.1';
const inputContractDigest = await canonicalDigest('TD613:TEST:CHOIR-CALIBRATION-INPUT-CONTRACT', {
  purpose: 'receipt-bound calibration fixture',
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
  registryId: 'registry_choir_calibration_fixture',
  createdAt,
  adapters: [
    {
      adapter_id: 'adapter_choir_deterministic',
      label: 'Choir deterministic adapter',
      adapter_class: 'DETERMINISTIC_REFERENCE',
      accepted_reader_classes: ['deterministic-baseline'],
      allowed_acquisition_routes: ['LOCAL_GENERATED'],
      allowed_execution_environments: ['NODE_LOCAL']
    },
    {
      adapter_id: 'adapter_choir_synthetic',
      label: 'Choir synthetic adapter',
      adapter_class: 'SYNTHETIC_FIXTURE',
      accepted_reader_classes: ['synthetic-external-provider'],
      allowed_acquisition_routes: ['SYNTHETIC_FIXTURE'],
      allowed_execution_environments: ['DECLARED_FIXTURE']
    }
  ]
});

export const readers = [
  await compileReaderProfile({
    readerId: 'reader_choir_alpha',
    label: 'Choir Reader Alpha',
    readerClass: 'deterministic-baseline',
    createdAt,
    repeatCount: 4,
    seeded: true,
    evidenceBasis: ['Choir calibration deterministic fixture']
  }),
  await compileReaderProfile({
    readerId: 'reader_choir_beta',
    label: 'Choir Reader Beta',
    readerClass: 'synthetic-external-provider',
    createdAt,
    seeded: true,
    evidenceBasis: ['Choir calibration synthetic fixture']
  })
];

export function moireResults(readerId, variant = 0) {
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

export async function buildFixture(fixtureId, summaries, overrides = {}) {
  const caseMap = await compileCaseMap({
    caseId: `case_${fixtureId}`,
    profile: 'research',
    title: `Choir calibration fixture ${fixtureId}`,
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
    evidenceBasis: ['Choir calibration fixture']
  });
  const routeMemory = await compileRouteMemory({
    caseId: caseMap.case_id,
    createdAt,
    entries: [],
    evidenceBasis: ['Choir calibration route fixture']
  });
  const moireAssays = [];
  for (let index = 0; index < readers.length; index += 1) {
    moireAssays.push(await compileMoireRebuildAssay({
      assayId: `moire_${fixtureId}_${readers[index].reader_id}`,
      createdAt,
      caseMap,
      routeMemory,
      reader: readers[index],
      sourceDriftState: overrides.source_drift_state || 'SOURCE_HELD',
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

  const readerInputDigest = await canonicalDigest('TD613:TEST:CHOIR-CALIBRATION-READER-INPUT', {
    fixture_id: fixtureId,
    input_contract_digest: overrides.input_contract_digest || inputContractDigest
  });
  const provenances = [];
  for (let index = 0; index < readers.length; index += 1) {
    const reader = readers[index];
    const isAlpha = index === 0;
    const resultDigest = await canonicalDigest('TD613:TEST:CHOIR-CALIBRATION-READER-RESULT', {
      fixture_id: fixtureId,
      reader_id: reader.reader_id,
      summary: isAlpha ? summaries.alpha : summaries.beta
    });
    provenances.push(await compileReaderResultProvenance({
      provenanceId: `readerprov_${fixtureId}_${reader.reader_id}`,
      createdAt,
      registry,
      adapterId: isAlpha ? 'adapter_choir_deterministic' : 'adapter_choir_synthetic',
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
      fixtureStatus: isAlpha ? 'DECLARED_FIXTURE' : 'SYNTHETIC'
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
    evidenceBasis: ['Choir calibration disagreement fixture']
  });

  return {
    caseMap,
    routeMemory,
    fixture: {
      fixture_id: fixtureId,
      fixture_class: overrides.fixture_class || 'BENIGN_CONTROL',
      document_digest: await canonicalDigest('TD613:TEST:CHOIR-CALIBRATION-DOCUMENT', { fixture_id: fixtureId }),
      source_provenance_digest: await canonicalDigest('TD613:TEST:CHOIR-CALIBRATION-SOURCE', { fixture_id: fixtureId }),
      source_status: 'CONSTRUCTED_FIXTURE',
      input_contract_digest: overrides.input_contract_digest || inputContractDigest,
      match_profile: { ...matchProfile, ...(overrides.match_profile || {}) },
      moire_assays: moireAssays,
      provenances,
      disagreement_ledger: disagreementLedger,
      residual_confounds: overrides.residual_confounds || [],
      operator_notes: []
    }
  };
}

export const targetSummaries = {
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
export const controlZero = {
  alpha: { node_ids: ['node_shared', 'node_right'], relationship_ids: ['edge_bridge'], chronology_millipoints: 500, source_style_linkage_millipoints: 500 },
  beta: { node_ids: ['node_shared', 'node_right'], relationship_ids: ['edge_bridge'], chronology_millipoints: 500, source_style_linkage_millipoints: 500 }
};
export const controlOne = {
  alpha: { node_ids: ['node_shared', 'node_right', 'node_left'], relationship_ids: ['edge_bridge'], chronology_millipoints: 550, source_style_linkage_millipoints: 450 },
  beta: { node_ids: ['node_shared', 'node_right'], relationship_ids: ['edge_bridge'], chronology_millipoints: 500, source_style_linkage_millipoints: 500 }
};
export const controlTwo = {
  alpha: { node_ids: ['node_shared', 'node_right'], relationship_ids: ['edge_bridge'], chronology_millipoints: 400, source_style_linkage_millipoints: 600 },
  beta: { node_ids: ['node_shared', 'node_right', 'node_action'], relationship_ids: ['edge_bridge', 'edge_action'], chronology_millipoints: 600, source_style_linkage_millipoints: 450 }
};

