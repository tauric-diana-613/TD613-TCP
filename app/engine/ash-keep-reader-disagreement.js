import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import {
  CASE_MAP_SCHEMA,
  ROUTE_MEMORY_SCHEMA,
  verifyCaseMap,
  verifyRouteMemory
} from './ash-keep-core.js';
import {
  READER_RESULT_PROVENANCE_SCHEMA,
  verifyReaderAdapterRegistry,
  verifyReaderResultProvenance
} from './ash-keep-reader-adapters.js';

export const READER_DISAGREEMENT_LEDGER_SCHEMA = 'td613.aperture.reader-disagreement-ledger/v0.1';
export const READER_DISAGREEMENT_REPLAY_SCHEMA = 'td613.aperture.reader-disagreement-replay/v0.1';

const LEDGER_DOMAIN = 'TD613:ASH-KEEP:READER-DISAGREEMENT-LEDGER:v1';
const SUMMARY_DOMAIN = 'TD613:ASH-KEEP:READER-DISAGREEMENT-SUMMARY:v1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:READER-DISAGREEMENT-REPLAY:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const SUMMARY_RELATION = 'DECLARED_PURPOSE_SHAPED_SUMMARY';
const SET_COMPONENTS = Object.freeze([
  'node_ids',
  'relationship_ids',
  'room_bridge_ids',
  'hypothesis_ids',
  'next_action_ids'
]);
const NUMERIC_COMPONENTS = Object.freeze([
  'chronology_millipoints',
  'source_style_linkage_millipoints'
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

function requireDigest(value, label) {
  const output = String(value || '');
  if (!SHA256.test(output)) throw new Error(`${label} must be SHA-256.`);
  return output;
}

function boundedMillipoints(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(1000, Math.trunc(numeric)));
}

function hasSummaryContent(summary) {
  return SET_COMPONENTS.some(field => summary[field].length > 0)
    || NUMERIC_COMPONENTS.some(field => summary[field] > 0);
}

function normalizeSummary(value, caseMap, resultState) {
  const nodeById = new Map(caseMap.nodes.map(node => [node.id, node]));
  const relationshipById = new Map(caseMap.relationships.map(edge => [edge.id, edge]));
  const nodeIds = uniqueSorted(value?.node_ids || []);
  const relationshipIds = uniqueSorted(value?.relationship_ids || []);
  for (const id of nodeIds) {
    if (!nodeById.has(id)) throw new Error(`Reader disagreement summary references unknown Case Map node: ${id}`);
  }
  for (const id of relationshipIds) {
    if (!relationshipById.has(id)) throw new Error(`Reader disagreement summary references unknown Case Map relationship: ${id}`);
  }
  const summary = {
    node_ids: nodeIds,
    relationship_ids: relationshipIds,
    room_bridge_ids: relationshipIds.filter(id => {
      const edge = relationshipById.get(id);
      return nodeById.get(edge.from)?.room_id !== nodeById.get(edge.to)?.room_id;
    }),
    hypothesis_ids: nodeIds.filter(id => nodeById.get(id)?.type === 'hypothesis'),
    next_action_ids: nodeIds.filter(id => nodeById.get(id)?.type === 'intended-action'),
    chronology_millipoints: boundedMillipoints(value?.chronology_millipoints),
    source_style_linkage_millipoints: boundedMillipoints(value?.source_style_linkage_millipoints)
  };
  if (resultState !== 'OBSERVED' && hasSummaryContent(summary)) {
    throw new Error(`Reader result state ${resultState} cannot carry observed disagreement summary content.`);
  }
  return summary;
}

function verifyAdapterRelation(provenance, registry) {
  const adapter = registry.adapters.find(candidate => candidate.adapter_id === provenance?.adapter?.adapter_id);
  return Boolean(adapter
    && registry.registry_digest === provenance.registry_reference
    && adapter.adapter_class === provenance.adapter.adapter_class
    && adapter.version === provenance.adapter.adapter_version
    && adapter.accepted_reader_classes.includes(provenance.reader.reader_class));
}

function assertMatched(entries, field, label) {
  const values = new Set(entries.map(entry => entry.provenance[field]));
  if (values.size !== 1) throw new Error(`Reader disagreement requires matched ${label}.`);
  return entries[0].provenance[field];
}

function setSupport(entries, field) {
  const observed = entries.filter(entry => entry.result_state === 'OBSERVED');
  const support = new Map();
  for (const entry of observed) {
    for (const id of entry.summary[field]) {
      if (!support.has(id)) support.set(id, []);
      support.get(id).push(entry.reader_id);
    }
  }
  const rows = [...support.entries()]
    .map(([id, readerIds]) => ({
      id,
      reader_ids: readerIds.sort(),
      count: readerIds.length,
      denominator: observed.length
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  return {
    observed_reader_count: observed.length,
    union_ids: rows.map(row => row.id),
    consensus_ids: observed.length
      ? rows.filter(row => row.count === observed.length).map(row => row.id)
      : [],
    disagreement_ids: observed.length > 1
      ? rows.filter(row => row.count > 0 && row.count < observed.length).map(row => row.id)
      : [],
    support: rows
  };
}

function numericSupport(entries, field) {
  const observed = entries.filter(entry => entry.result_state === 'OBSERVED');
  const values = observed.map(entry => ({
    reader_id: entry.reader_id,
    value: entry.summary[field]
  }));
  const numericValues = values.map(row => row.value);
  const minimum = numericValues.length ? Math.min(...numericValues) : 0;
  const maximum = numericValues.length ? Math.max(...numericValues) : 0;
  return {
    observed_reader_count: observed.length,
    values,
    minimum,
    maximum,
    spread: maximum - minimum
  };
}

function setPair(left, right, field) {
  const leftSet = new Set(left.summary[field]);
  const rightSet = new Set(right.summary[field]);
  return {
    shared_ids: [...leftSet].filter(id => rightSet.has(id)).sort(),
    only_left_ids: [...leftSet].filter(id => !rightSet.has(id)).sort(),
    only_right_ids: [...rightSet].filter(id => !leftSet.has(id)).sort()
  };
}

function pairwise(entries) {
  const rows = [];
  for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
      const left = entries[leftIndex];
      const right = entries[rightIndex];
      const comparable = left.result_state === 'OBSERVED' && right.result_state === 'OBSERVED';
      const sets = Object.fromEntries(SET_COMPONENTS.map(field => [
        field,
        comparable ? setPair(left, right, field) : {
          shared_ids: [],
          only_left_ids: [],
          only_right_ids: []
        }
      ]));
      const numerics = Object.fromEntries(NUMERIC_COMPONENTS.map(field => [
        field,
        {
          left_value: comparable ? left.summary[field] : 0,
          right_value: comparable ? right.summary[field] : 0,
          absolute_delta: comparable ? Math.abs(left.summary[field] - right.summary[field]) : 0
        }
      ]));
      rows.push({
        pair_id: `readerpair_${left.reader_id}__${right.reader_id}`,
        reader_ids: [left.reader_id, right.reader_id],
        comparison_state: comparable ? 'OBSERVED' : 'UNRESOLVED',
        set_components: sets,
        numeric_components: numerics,
        disagreement_detected: comparable && (
          Object.values(sets).some(value => value.only_left_ids.length || value.only_right_ids.length)
          || Object.values(numerics).some(value => value.absolute_delta > 0)
        ),
        missingness: comparable ? [] : uniqueSorted([
          ...(left.missingness || []),
          ...(right.missingness || []),
          `Reader states: ${left.result_state}, ${right.result_state}`
        ])
      });
    }
  }
  return rows;
}

export async function compileReaderDisagreementLedger(input = {}, options = {}) {
  if (!input.caseMap || input.caseMap.schema !== CASE_MAP_SCHEMA || !await verifyCaseMap(input.caseMap, options)) {
    throw new Error('Reader disagreement requires a verified Case Map.');
  }
  if (!input.routeMemory || input.routeMemory.schema !== ROUTE_MEMORY_SCHEMA || !await verifyRouteMemory(input.routeMemory, options)) {
    throw new Error('Reader disagreement requires verified Route Memory.');
  }
  if (input.caseMap.case_id !== input.routeMemory.case_id) throw new Error('Case Map and Route Memory case IDs must match.');
  if (!await verifyReaderAdapterRegistry(input.registry, options)) {
    throw new Error('Reader disagreement requires a verified Reader Adapter Registry.');
  }

  const sourceEntries = input.entries || [];
  if (sourceEntries.length < 2) throw new Error('Reader disagreement requires at least two Reader entries.');
  const entries = [];
  for (let index = 0; index < sourceEntries.length; index += 1) {
    const source = sourceEntries[index];
    const provenance = source?.provenance;
    if (!provenance || provenance.schema !== READER_RESULT_PROVENANCE_SCHEMA || !await verifyReaderResultProvenance(provenance, options)) {
      throw new Error(`Reader disagreement entry ${index} requires verified Reader result provenance.`);
    }
    if (!verifyAdapterRelation(provenance, input.registry)) {
      throw new Error(`Reader disagreement entry ${index} failed adapter-to-Reader relation verification.`);
    }
    if (provenance.case_map_digest !== input.caseMap.case_map_digest || provenance.case_id !== input.caseMap.case_id) {
      throw new Error('Reader disagreement provenance does not match the supplied Case Map.');
    }
    if (provenance.route_memory_digest !== input.routeMemory.route_memory_digest) {
      throw new Error('Reader disagreement provenance does not match the supplied Route Memory.');
    }
    if (!provenance.result_schema) throw new Error('Reader disagreement requires a declared result schema for every entry.');
    const summary = normalizeSummary(source.summary || {}, input.caseMap, provenance.result_state);
    const summaryDigest = await canonicalDigest(SUMMARY_DOMAIN, {
      provenance_digest: provenance.provenance_digest,
      upstream_result_digest: provenance.reader_result_digest,
      summary_relation: SUMMARY_RELATION,
      summary
    }, options);
    entries.push({
      reader_id: provenance.reader.reader_id,
      reader_class: provenance.reader.reader_class,
      reader_digest: provenance.reader.reader_digest,
      provenance_id: provenance.provenance_id,
      provenance_digest: provenance.provenance_digest,
      provenance_state: provenance.provenance_state,
      result_state: provenance.result_state,
      upstream_result_digest: provenance.reader_result_digest,
      result_schema: provenance.result_schema,
      summary_relation: SUMMARY_RELATION,
      summary,
      summary_digest: summaryDigest,
      missingness: uniqueSorted(provenance.missingness || [])
    });
  }
  entries.sort((left, right) => left.reader_id.localeCompare(right.reader_id));
  if (new Set(entries.map(entry => entry.reader_id)).size !== entries.length) {
    throw new Error('Reader disagreement requires unique Reader IDs.');
  }

  const provenanceEntries = sourceEntries.map(entry => entry.provenance);
  const matched = {
    case_id: assertMatched(provenanceEntries.map(provenance => ({ provenance })), 'case_id', 'case ID'),
    case_map_digest: assertMatched(provenanceEntries.map(provenance => ({ provenance })), 'case_map_digest', 'Case Map digest'),
    route_memory_digest: assertMatched(provenanceEntries.map(provenance => ({ provenance })), 'route_memory_digest', 'Route Memory digest'),
    reader_input_digest: assertMatched(provenanceEntries.map(provenance => ({ provenance })), 'reader_input_digest', 'Reader input digest'),
    result_schema: assertMatched(provenanceEntries.map(provenance => ({ provenance })), 'result_schema', 'result schema'),
    registry_reference: assertMatched(provenanceEntries.map(provenance => ({ provenance })), 'registry_reference', 'registry reference')
  };

  const setComponents = Object.fromEntries(SET_COMPONENTS.map(field => [field, setSupport(entries, field)]));
  const numericComponents = Object.fromEntries(NUMERIC_COMPONENTS.map(field => [field, numericSupport(entries, field)]));
  const pairwiseRows = pairwise(entries);
  const incompleteProvenanceCount = entries.filter(entry => entry.provenance_state !== 'PROVENANCE_BOUND').length;
  const unresolvedResultCount = entries.filter(entry => entry.result_state !== 'OBSERVED').length;
  const observedReaderCount = entries.length - unresolvedResultCount;
  const disagreementDetected = observedReaderCount > 1 && (
    Object.values(setComponents).some(component => component.disagreement_ids.length > 0)
    || Object.values(numericComponents).some(component => component.spread > 0)
  );
  const comparisonState = incompleteProvenanceCount || unresolvedResultCount
    ? 'PARTIAL_READER_DISAGREEMENT'
    : 'OBSERVED_READER_DISAGREEMENT';

  const record = {
    schema: READER_DISAGREEMENT_LEDGER_SCHEMA,
    version: 'v0.1',
    ledger_id: input.ledgerId || randomId('readerdisagree_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    mode: 'PROVENANCE_GATED_COMPONENTWISE_DISAGREEMENT',
    registry_reference: input.registry.registry_digest,
    matched_context: matched,
    comparison_state: comparisonState,
    reader_count: entries.length,
    observed_reader_count: observedReaderCount,
    incomplete_provenance_count: incompleteProvenanceCount,
    unresolved_result_count: unresolvedResultCount,
    entries,
    set_components: setComponents,
    numeric_components: numericComponents,
    pairwise: pairwiseRows,
    disagreement_detected: disagreementDetected,
    universal_disagreement_score: null,
    real_surveillance_probability: null,
    raw_reader_input_present: false,
    raw_reader_result_present: false,
    readers_executed_by_ledger: false,
    provider_call_performed: false,
    network_called: false,
    storage_mutated: false,
    transport_authorized: false,
    release_authorized: false,
    identity_inference_authorized: false,
    authorship_attribution_authorized: false,
    ownership_inference_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    recommendation_not_command: true,
    source_status: String(input.sourceStatus || 'DERIVED').toUpperCase(),
    evidence_basis: uniqueSorted(input.evidenceBasis || [
      'verified Reader result provenance receipts',
      'matched Case Map and Route Memory',
      'purpose-shaped component summaries'
    ]),
    missingness: uniqueSorted([
      ...(input.missingness || []),
      ...entries.flatMap(entry => entry.missingness),
      ...(incompleteProvenanceCount ? [`${incompleteProvenanceCount} incomplete provenance receipt(s)`] : []),
      ...(unresolvedResultCount ? [`${unresolvedResultCount} unresolved Reader result(s)`] : [])
    ]),
    alternatives: uniqueSorted(input.alternatives || [
      'Reader-specific extraction thresholds',
      'different training or prompting conditions',
      'incomplete provider provenance',
      'summary transcription or mapping error',
      'ordinary ambiguity in the purpose-shaped source'
    ]),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    ledger_digest: null
  };
  record.ledger_digest = await canonicalDigest(LEDGER_DOMAIN, without(record, 'ledger_digest'), options);
  return freeze(record);
}

export async function verifyReaderDisagreementLedger(value, options = {}) {
  return Boolean(value
    && value.schema === READER_DISAGREEMENT_LEDGER_SCHEMA
    && SHA256.test(String(value.ledger_digest || ''))
    && value.ledger_digest === await canonicalDigest(LEDGER_DOMAIN, without(value, 'ledger_digest'), options));
}

export async function replayReaderDisagreementLedger(value, registry, provenances = [], input = {}, options = {}) {
  const ledgerVerified = await verifyReaderDisagreementLedger(value, options);
  const registryVerified = await verifyReaderAdapterRegistry(registry, options);
  const provenanceByDigest = new Map();
  let provenanceSetVerified = provenances.length === value?.entries?.length;
  for (const provenance of provenances) {
    const verified = await verifyReaderResultProvenance(provenance, options);
    const related = registryVerified && verifyAdapterRelation(provenance, registry);
    if (!verified || !related) provenanceSetVerified = false;
    provenanceByDigest.set(provenance?.provenance_digest, provenance);
  }
  const referenceSetVerified = Boolean(value?.entries?.every(entry => {
    const provenance = provenanceByDigest.get(entry.provenance_digest);
    return provenance
      && provenance.provenance_id === entry.provenance_id
      && provenance.reader.reader_id === entry.reader_id
      && provenance.reader_result_digest === entry.upstream_result_digest;
  }));
  const verified = ledgerVerified && registryVerified && provenanceSetVerified && referenceSetVerified;
  const record = {
    schema: READER_DISAGREEMENT_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('readerdisagreereplay_', options.cryptoImpl || globalThis.crypto),
    created_at: now(input.createdAt),
    source_ledger_id: value?.ledger_id || null,
    source_ledger_digest: value?.ledger_digest || null,
    registry_reference: registry?.registry_digest || null,
    status: verified ? 'READER_DISAGREEMENT_REPLAY_VERIFIED' : 'READER_DISAGREEMENT_REPLAY_HELD',
    ledger_digest_verified: ledgerVerified,
    registry_digest_verified: registryVerified,
    provenance_set_verified: provenanceSetVerified,
    provenance_references_verified: referenceSetVerified,
    summaries_restored_from_ledger: false,
    raw_reader_inputs_restored: false,
    raw_reader_results_restored: false,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    transport_authorized: false,
    release_authorized: false,
    identity_inference_authorized: false,
    authorship_attribution_authorized: false,
    ownership_inference_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    recommendation_not_command: true,
    observations: verified
      ? ['Reader disagreement ledger, provenance set, and adapter relations verified without Reader re-execution.']
      : ['Reader disagreement replay held for ledger, registry, provenance, or reference repair.'],
    missingness: [],
    alternatives: [],
    open_questions: verified ? [] : ['Which ledger, registry, provenance, or reference field changed after sealing?'],
    closure: { required: true, status: 'OPEN' },
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyReaderDisagreementReplay(value, options = {}) {
  return Boolean(value
    && value.schema === READER_DISAGREEMENT_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
