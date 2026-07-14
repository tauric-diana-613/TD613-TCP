import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import {
  CASE_MAP_SCHEMA,
  READER_PROFILE_SCHEMA,
  ROUTE_MEMORY_SCHEMA,
  runDeterministicReader
} from './ash-keep-core.js';

export const MOIRE_REBUILD_ASSAY_SCHEMA = 'td613.aperture.moire-rebuild-assay/v0.1';
export const MOIRE_REBUILD_REPLAY_SCHEMA = 'td613.aperture.moire-rebuild-replay/v0.1';
export const MOIRE_REBUILD_VERSION = 'v0.1';

const ASSAY_DOMAIN = 'TD613:ASH-KEEP:MOIRE-REBUILD-ASSAY:v1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:MOIRE-REBUILD-REPLAY:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const OPAQUE_ID = /^[a-z][a-z0-9_]{2,127}$/;
const OBSERVATION_STATES = new Set([
  'OBSERVED', 'NULL', 'REJECTED', 'MISSING', 'CONTRADICTORY',
  'UNCAPTURED', 'ENCODER_REQUIRED', 'UNRESOLVED'
]);

function now(value) {
  return value || new Date().toISOString();
}

function unique(values = []) {
  return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
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

function normalizeProjection(projection, index) {
  return {
    projection_id: requireOpaqueId(projection?.projection_id, `Projection ${index} ID`),
    disclosed_opaque_references: unique(projection?.disclosed_opaque_references || [])
      .map(value => requireOpaqueId(value, `Projection ${index} reference`)),
    route_id: projection?.route_id ? requireOpaqueId(projection.route_id, `Projection ${index} route ID`) : null,
    purpose: String(projection?.purpose || ''),
    source_status: String(projection?.source_status || 'SUPPLIED').toUpperCase()
  };
}

function normalizeRecovered(recovered = {}) {
  return {
    node_ids: unique(recovered.node_ids || []).map(value => requireOpaqueId(value, 'Recovered node ID')),
    relationship_ids: unique(recovered.relationship_ids || []).map(value => requireOpaqueId(value, 'Recovered relationship ID')),
    chronology: Math.max(0, Math.min(1000, Number.isFinite(Number(recovered.chronology)) ? Math.trunc(Number(recovered.chronology)) : 0)),
    source_style_linkage: Math.max(0, Math.min(1000, Number.isFinite(Number(recovered.source_style_linkage)) ? Math.trunc(Number(recovered.source_style_linkage)) : 0))
  };
}

function normalizeResult(result, index) {
  const projectionIds = unique(result?.projection_ids || []).map(value => requireOpaqueId(value, `Result ${index} projection ID`)).sort();
  if (projectionIds.length > 2) throw new Error('Moiré v0.1 accepts baseline, singleton, or pair observations only.');
  const state = String(result?.state || 'OBSERVED').toUpperCase();
  if (!OBSERVATION_STATES.has(state)) throw new Error(`Unsupported Moiré observation state: ${state}`);
  return {
    observation_id: result?.observation_id || `moire_observation_${index + 1}`,
    projection_ids: projectionIds,
    state,
    recovered: normalizeRecovered(result?.recovered || {}),
    benign_control: Boolean(result?.benign_control),
    held_out: Boolean(result?.held_out),
    observations: clone(result?.observations || []),
    missingness: unique(result?.missingness || [])
  };
}

function keyFor(projectionIds = []) {
  return [...projectionIds].sort().join('+');
}

function difference(left = [], ...rights) {
  const excluded = new Set(rights.flat());
  return unique(left).filter(value => !excluded.has(value));
}

function pairwise(projections) {
  const output = [];
  for (let left = 0; left < projections.length; left += 1) {
    for (let right = left + 1; right < projections.length; right += 1) {
      output.push([projections[left], projections[right]]);
    }
  }
  return output;
}

function emptyResidue() {
  return {
    node_ids: [],
    relationship_ids: [],
    room_bridge_ids: [],
    hypothesis_ids: [],
    next_action_ids: [],
    chronology_millipoints: 0,
    source_style_linkage_millipoints: 0
  };
}

function residueFor({ caseMap, baseline, left, right, pair }) {
  if ([baseline, left, right, pair].some(observation => observation.state !== 'OBSERVED')) {
    return { state: 'UNRESOLVED', residue: emptyResidue() };
  }
  const recoveredNodes = difference(
    pair.recovered.node_ids,
    baseline.recovered.node_ids,
    left.recovered.node_ids,
    right.recovered.node_ids
  );
  const recoveredRelationships = difference(
    pair.recovered.relationship_ids,
    baseline.recovered.relationship_ids,
    left.recovered.relationship_ids,
    right.recovered.relationship_ids
  );
  const nodeById = new Map(caseMap.nodes.map(node => [node.id, node]));
  const relationshipById = new Map(caseMap.relationships.map(edge => [edge.id, edge]));
  const roomBridgeIds = recoveredRelationships.filter(id => {
    const edge = relationshipById.get(id);
    return edge && nodeById.get(edge.from)?.room_id !== nodeById.get(edge.to)?.room_id;
  });
  return {
    state: 'OBSERVED',
    residue: {
      node_ids: recoveredNodes,
      relationship_ids: recoveredRelationships,
      room_bridge_ids: roomBridgeIds,
      hypothesis_ids: recoveredNodes.filter(id => nodeById.get(id)?.type === 'hypothesis'),
      next_action_ids: recoveredNodes.filter(id => nodeById.get(id)?.type === 'intended-action'),
      chronology_millipoints: Math.max(
        0,
        pair.recovered.chronology - Math.max(
          baseline.recovered.chronology,
          left.recovered.chronology,
          right.recovered.chronology
        )
      ),
      source_style_linkage_millipoints: Math.max(
        0,
        pair.recovered.source_style_linkage - Math.max(
          baseline.recovered.source_style_linkage,
          left.recovered.source_style_linkage,
          right.recovered.source_style_linkage
        )
      )
    }
  };
}

function hasEmergentTopology(residue) {
  return residue.node_ids.length > 0
    || residue.relationship_ids.length > 0
    || residue.room_bridge_ids.length > 0
    || residue.hypothesis_ids.length > 0
    || residue.next_action_ids.length > 0
    || residue.chronology_millipoints > 0
    || residue.source_style_linkage_millipoints > 0;
}

function projectionCoverage(projections, resultByKey) {
  const singletonComplete = projections.every(projection => resultByKey.has(projection.projection_id));
  const pairComplete = pairwise(projections).every(([left, right]) => resultByKey.has(keyFor([left.projection_id, right.projection_id])));
  return { baseline: resultByKey.has(''), singleton: singletonComplete, pair: pairComplete };
}

export async function compileMoireRebuildAssay(input = {}, options = {}) {
  if (!input.caseMap || input.caseMap.schema !== CASE_MAP_SCHEMA) throw new Error('Moiré Rebuild Assay requires a Case Map.');
  if (!input.routeMemory || input.routeMemory.schema !== ROUTE_MEMORY_SCHEMA) throw new Error('Moiré Rebuild Assay requires Route Memory.');
  if (!input.reader || input.reader.schema !== READER_PROFILE_SCHEMA) throw new Error('Moiré Rebuild Assay requires a Reader profile.');
  requireDigest(input.caseMap.case_map_digest, 'Case Map digest');
  requireDigest(input.routeMemory.route_memory_digest, 'Route Memory digest');
  requireDigest(input.reader.reader_digest, 'Reader digest');

  const projections = (input.projections || []).map(normalizeProjection).sort((left, right) => left.projection_id.localeCompare(right.projection_id));
  if (projections.length < 2) throw new Error('Moiré Rebuild Assay requires at least two projections.');
  if (projections.length > 32) throw new Error('Moiré Rebuild Assay v0.1 supports at most 32 projections.');
  if (new Set(projections.map(projection => projection.projection_id)).size !== projections.length) throw new Error('Projection IDs must be unique.');

  const results = (input.results || []).map(normalizeResult);
  const resultByKey = new Map();
  for (const result of results) {
    const key = keyFor(result.projection_ids);
    if (resultByKey.has(key)) throw new Error(`Duplicate Moiré observation for projection key: ${key || 'baseline'}`);
    resultByKey.set(key, result);
  }
  const coverage = projectionCoverage(projections, resultByKey);
  if (!coverage.baseline) throw new Error('Moiré Rebuild Assay requires one baseline observation.');

  const baseline = resultByKey.get('');
  const pairwiseResidue = pairwise(projections).map(([leftProjection, rightProjection]) => {
    const left = resultByKey.get(leftProjection.projection_id);
    const right = resultByKey.get(rightProjection.projection_id);
    const pairKey = keyFor([leftProjection.projection_id, rightProjection.projection_id]);
    const pair = resultByKey.get(pairKey);
    if (!left || !right || !pair) {
      return {
        pair_id: `pair_${leftProjection.projection_id}__${rightProjection.projection_id}`,
        projection_ids: [leftProjection.projection_id, rightProjection.projection_id],
        state: 'UNRESOLVED',
        residue: emptyResidue(),
        emergent_topology_detected: false,
        missingness: ['singleton or pair observation']
      };
    }
    const computed = residueFor({ caseMap: input.caseMap, baseline, left, right, pair });
    return {
      pair_id: `pair_${leftProjection.projection_id}__${rightProjection.projection_id}`,
      projection_ids: [leftProjection.projection_id, rightProjection.projection_id],
      state: computed.state,
      residue: computed.residue,
      emergent_topology_detected: computed.state === 'OBSERVED' && hasEmergentTopology(computed.residue),
      missingness: computed.state === 'OBSERVED' ? [] : unique([
        ...baseline.missingness,
        ...left.missingness,
        ...right.missingness,
        ...pair.missingness
      ])
    };
  });

  const calibration = {
    preregistered_fixture: Boolean(input.calibration?.preregisteredFixture),
    complete_baseline: coverage.baseline,
    complete_singleton_coverage: coverage.singleton,
    complete_pair_coverage: coverage.pair,
    benign_control: results.some(result => result.benign_control) || Boolean(input.calibration?.benignControl),
    held_out: results.some(result => result.held_out) || Boolean(input.calibration?.heldOut),
    source_drift_check: Boolean(input.calibration?.sourceDriftCheck),
    alternative_reader: Boolean(input.calibration?.alternativeReader),
    exact_thresholds: clone(input.calibration?.exactThresholds || {})
  };
  const calibrated = calibration.preregistered_fixture
    && calibration.complete_baseline
    && calibration.complete_singleton_coverage
    && calibration.complete_pair_coverage
    && calibration.benign_control
    && calibration.held_out
    && calibration.source_drift_check
    && calibration.alternative_reader
    && Object.keys(calibration.exact_thresholds).length > 0;

  const record = {
    schema: MOIRE_REBUILD_ASSAY_SCHEMA,
    version: MOIRE_REBUILD_VERSION,
    assay_id: input.assayId || randomId('moire_', options.cryptoImpl || globalThis.crypto),
    case_id: input.caseMap.case_id,
    case_map_digest: input.caseMap.case_map_digest,
    route_memory_reference: input.routeMemory.route_memory_digest,
    reader: {
      reader_id: input.reader.reader_id,
      reader_class: input.reader.reader_class,
      reader_digest: input.reader.reader_digest
    },
    created_at: now(input.createdAt),
    mode: 'PAIRWISE_MOIRE_REBUILD',
    source_drift_state: String(input.sourceDriftState || 'SOURCE_HELD').toUpperCase(),
    projections,
    observations: results,
    pairwise_residue: pairwiseResidue,
    calibration,
    calibration_state: calibrated ? 'CALIBRATED_FOR_NAMED_FIXTURE' : 'NOT_ENOUGH_TEST_DATA',
    review_state: calibrated ? 'OPERATOR_REVIEW_REQUIRED' : 'OBSERVATIONS_AVAILABLE',
    emergent_pair_count: pairwiseResidue.filter(row => row.emergent_topology_detected).length,
    unresolved_pair_count: pairwiseResidue.filter(row => row.state !== 'OBSERVED').length,
    frequencies_are_named_reader_results: true,
    real_surveillance_probability: null,
    provider_acquisition_route: 'UNKNOWN',
    automatic_hold: false,
    automatic_ash_action: false,
    prediction_authorized: false,
    recommendation_not_command: true,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    evidence_basis: unique(input.evidenceBasis || ['Case Map', 'Route Memory', 'named Reader observations']),
    missingness: unique(input.missingness || []),
    alternatives: unique(input.alternatives || [
      'ordinary topic overlap',
      'shared templates',
      'incomplete Route Memory',
      'Reader-specific reconstruction behavior'
    ]),
    open_questions: unique(input.openQuestions || []),
    operator_notes: unique(input.operatorNotes || []),
    closure: { required: true, status: input.closureStatus || 'OPEN' },
    assay_digest: null
  };
  record.assay_digest = await canonicalDigest(ASSAY_DOMAIN, without(record, 'assay_digest'), options);
  return freeze(record);
}

export async function runDeterministicMoireAssay(input = {}, options = {}) {
  const projections = (input.projections || []).map(normalizeProjection);
  const baseline = runDeterministicReader({
    caseMap: input.caseMap,
    routeMemory: input.routeMemory,
    proposedReferences: []
  });
  const results = [{
    observation_id: 'moire_baseline',
    projection_ids: [],
    state: 'OBSERVED',
    recovered: baseline.after,
    benign_control: true,
    observations: ['Deterministic baseline preserved the existing Route Memory field.']
  }];
  for (const projection of projections) {
    const run = runDeterministicReader({
      caseMap: input.caseMap,
      routeMemory: input.routeMemory,
      proposedReferences: projection.disclosed_opaque_references
    });
    results.push({
      observation_id: `moire_single_${projection.projection_id}`,
      projection_ids: [projection.projection_id],
      state: 'OBSERVED',
      recovered: run.after,
      observations: ['Named deterministic Reader completed one singleton projection.']
    });
  }
  for (const [left, right] of pairwise(projections)) {
    const run = runDeterministicReader({
      caseMap: input.caseMap,
      routeMemory: input.routeMemory,
      proposedReferences: unique([
        ...left.disclosed_opaque_references,
        ...right.disclosed_opaque_references
      ])
    });
    results.push({
      observation_id: `moire_pair_${left.projection_id}__${right.projection_id}`,
      projection_ids: [left.projection_id, right.projection_id],
      state: 'OBSERVED',
      recovered: run.after,
      held_out: Boolean(input.heldOutPairIds?.includes(keyFor([left.projection_id, right.projection_id]))),
      observations: ['Named deterministic Reader completed one pairwise projection.']
    });
  }
  return compileMoireRebuildAssay({
    ...input,
    projections,
    results,
    evidenceBasis: unique([
      ...(input.evidenceBasis || []),
      'deterministic Ash Keep Reader',
      'exact pairwise projection combinations'
    ])
  }, options);
}

export async function verifyMoireRebuildAssay(value, options = {}) {
  return Boolean(value
    && value.schema === MOIRE_REBUILD_ASSAY_SCHEMA
    && SHA256.test(String(value.assay_digest || ''))
    && value.assay_digest === await canonicalDigest(ASSAY_DOMAIN, without(value, 'assay_digest'), options));
}

export async function replayMoireRebuildAssay(value, input = {}, options = {}) {
  const verified = await verifyMoireRebuildAssay(value, options);
  const record = {
    schema: MOIRE_REBUILD_REPLAY_SCHEMA,
    replay_id: input.replayId || randomId('moirereplay_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    source_assay_id: value?.assay_id || null,
    source_assay_digest: value?.assay_digest || null,
    status: verified ? 'MOIRE_REPLAY_VERIFIED' : 'MOIRE_REPLAY_HELD',
    assay_content_restored: false,
    reconstruction_reexecuted: false,
    network_called: false,
    storage_mutated: false,
    automatic_ash_action: false,
    prediction_authorized: false,
    recommendation_not_command: true,
    observations: verified ? ['Moiré assay digest verified.'] : ['Moiré assay digest verification failed.'],
    missingness: [],
    alternatives: [],
    open_questions: verified ? [] : ['Which field changed after the assay was sealed?'],
    closure: { required: true, status: 'OPEN' },
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyMoireRebuildReplay(value, options = {}) {
  return Boolean(value
    && value.schema === MOIRE_REBUILD_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
