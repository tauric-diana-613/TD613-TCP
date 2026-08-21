import {
  evaluateWarrantWeave
} from './pedagogue-warrant-weave-two-staircases.js';
import {
  canonicalRuleSignature,
  makeSyntheticReplayWitness
} from './pedagogue-warrant-genealogy-ghost-house.js';

export const PEDAGOGUE_PRECEDENCE_ADMISSION_GENEALOGY_SCHEMA =
  'td613.pedagogue.precedence-admission-genealogy-hostile/v0.1';

const freeze = value => Object.freeze(value);
const freezeArray = values => freeze([...values]);
const freezeRecord = value => freeze({ ...value });

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function evidence(evidence_id, warrants) {
  return freezeRecord({ evidence_id, warrants: freezeArray(warrants) });
}

function witnessedRule(rule_id, requires, produces) {
  const base = {
    rule_id,
    requires: freezeArray(requires),
    produces,
    predeclared: true,
    admissible: true,
    replayable: true
  };
  return freezeRecord({
    ...base,
    replay_witness: makeSyntheticReplayWitness(base, `BLUEPRINT_MARGINS:${canonicalRuleSignature(base)}`)
  });
}

function edgeKey(edge) {
  if (!Array.isArray(edge) || edge.length !== 2) throw new TypeError('edge must be [before, after]');
  return `${edge[0]}\u0000${edge[1]}`;
}

function semanticEdge(edge, eventSemantics) {
  const [before, after] = edge;
  const beforeSemantic = eventSemantics.get(before);
  const afterSemantic = eventSemantics.get(after);
  if (!beforeSemantic || !afterSemantic) throw new Error('edge references unknown event');
  return freezeArray([beforeSemantic, afterSemantic]);
}

function eventSemanticMap(events) {
  const map = new Map();
  const semanticSeen = new Set();
  for (const event of events ?? []) {
    if (!event || typeof event.event_id !== 'string' || !event.event_id) {
      throw new TypeError('every event requires event_id');
    }
    const semantic = event.semantic_label ?? event.event_id;
    if (typeof semantic !== 'string' || !semantic) throw new TypeError('semantic event identity required');
    if (semanticSeen.has(semantic)) throw new Error(`duplicate semantic event identity: ${semantic}`);
    semanticSeen.add(semantic);
    map.set(event.event_id, semantic);
  }
  return map;
}

function semanticSupportFingerprint(record, eventSemantics) {
  return stable({
    semantic_edge: semanticEdge(record.edge, eventSemantics),
    semantic_support_kind: record.semantic_support_kind
  });
}

function semanticWitnessPayload(record, eventSemantics) {
  return freezeRecord({
    schema: 'td613.pedagogue.synthetic-edge-admission-witness/v0.1',
    semantic_edge: semanticEdge(record.edge, eventSemantics),
    semantic_support_kind: record.semantic_support_kind
  });
}

export function makeSyntheticEdgeAdmissionWitness(record, events) {
  const eventSemantics = eventSemanticMap(events);
  return semanticWitnessPayload(record, eventSemantics);
}

export function sealEdgeAdmissionRecord(record) {
  if (!record || typeof record.admission_id !== 'string' || !record.admission_id) {
    throw new TypeError('admission_id required');
  }
  if (typeof record.semantic_support_kind !== 'string' || !record.semantic_support_kind) {
    throw new TypeError('semantic_support_kind required');
  }
  edgeKey(record.edge);
  return deepFreeze(clone({
    admission_id: record.admission_id,
    edge: record.edge,
    semantic_support_kind: record.semantic_support_kind,
    predeclared: record.predeclared === true,
    admissible: record.admissible === true,
    witnessed: record.witnessed === true,
    witness_payload: record.witness_payload ?? null,
    active: record.active !== false
  }));
}

export function requestSealedEdgeAdmissionMutation(sealedRecord, replacement) {
  if (!Object.isFrozen(sealedRecord)) {
    return freezeRecord({
      status: 'REJECT_UNSEALED_EDGE_ADMISSION_MUTATION_TARGET',
      mutated: false
    });
  }
  return freezeRecord({
    status: 'SEALED_EDGE_ADMISSION_RECORD_IMMUTABLE',
    mutated: false,
    admission_id: sealedRecord.admission_id,
    existing_edge: freezeArray(clone(sealedRecord.edge)),
    requested_replacement: deepFreeze(clone(replacement ?? {}))
  });
}

function witnessMatches(record, eventSemantics) {
  if (!record.witness_payload || typeof record.witness_payload !== 'object') return false;
  const expected = semanticWitnessPayload(record, eventSemantics);
  return stable(record.witness_payload) === stable(expected);
}

function classifyAdmissionRecord(record, eventSemantics) {
  const sealed = sealEdgeAdmissionRecord(record);
  let status = 'LAWFUL_ACTIVE_EDGE_ADMISSION_SUPPORT';
  if (!sealed.active) status = 'INACTIVE_HISTORICAL_EDGE_ADMISSION_SUPPORT';
  else if (!sealed.predeclared) status = 'REFUSE_UNDECLARED_EDGE_ADMISSION';
  else if (!sealed.admissible) status = 'REFUSE_INADMISSIBLE_EDGE_ADMISSION';
  else if (!sealed.witnessed || !witnessMatches(sealed, eventSemantics)) status = 'REFUSE_UNWITNESSED_EDGE_ADMISSION';

  const lawfulActive = status === 'LAWFUL_ACTIVE_EDGE_ADMISSION_SUPPORT';
  const semanticEdgeValue = semanticEdge(sealed.edge, eventSemantics);
  return freezeRecord({
    record: sealed,
    admission_id: sealed.admission_id,
    edge: freezeArray(clone(sealed.edge)),
    semantic_edge: semanticEdgeValue,
    semantic_support_kind: sealed.semantic_support_kind,
    semantic_support_fingerprint: semanticSupportFingerprint(sealed, eventSemantics),
    status,
    lawful_active: lawfulActive,
    lawful_historical: status === 'INACTIVE_HISTORICAL_EDGE_ADMISSION_SUPPORT' &&
      sealed.predeclared && sealed.admissible && sealed.witnessed && witnessMatches(sealed, eventSemantics),
    witness_payload_matches: witnessMatches(sealed, eventSemantics)
  });
}

function relationSemanticSerializations(weave, events) {
  if (weave.status !== 'PARTIAL_ORDER_REPLAY_COMPLETE') return [];
  const semanticMap = eventSemanticMap(events);
  return weave.serializations
    .map(serialization => serialization.map(id => semanticMap.get(id)).join('>'))
    .sort();
}

function relationFingerprint(weave, events) {
  if (weave.status !== 'PARTIAL_ORDER_REPLAY_COMPLETE') return null;
  return stable(relationSemanticSerializations(weave, events));
}

function weavePosture(weave) {
  if (weave.status !== 'PARTIAL_ORDER_REPLAY_COMPLETE') {
    return freezeRecord({ status: weave.status });
  }
  return freezeRecord({
    status: weave.status,
    final_presence: weave.final_presence,
    final_snapshot_identified: weave.final_snapshot_identified,
    transient_support_continuity: weave.transient_support_continuity,
    contradiction_history: weave.contradiction_history,
    contradiction_resolution_history: weave.contradiction_resolution_history,
    selected_serialization: weave.selected_serialization,
    lexical_tiebreak_used: weave.lexical_tiebreak_used
  });
}

function normalizeSemanticLineages(classifications) {
  const byFingerprint = new Map();
  for (const item of classifications.filter(value => value.lawful_active)) {
    if (!byFingerprint.has(item.semantic_support_fingerprint)) {
      byFingerprint.set(item.semantic_support_fingerprint, freezeRecord({
        semantic_support_fingerprint: item.semantic_support_fingerprint,
        semantic_edge: item.semantic_edge,
        semantic_support_kind: item.semantic_support_kind,
        record_ids: []
      }));
    }
  }

  return freezeArray([...byFingerprint.values()]
    .map(entry => freezeRecord({
      ...entry,
      record_ids: freezeArray(classifications
        .filter(item => item.lawful_active && item.semantic_support_fingerprint === entry.semantic_support_fingerprint)
        .map(item => item.admission_id)
        .sort())
    }))
    .sort((a, b) => a.semantic_support_fingerprint.localeCompare(b.semantic_support_fingerprint)));
}

function buildAdmittedEdges(classifications) {
  const byEdge = new Map();
  for (const item of classifications.filter(value => value.lawful_active)) {
    const key = edgeKey(item.edge);
    if (!byEdge.has(key)) byEdge.set(key, freezeArray(clone(item.edge)));
  }
  return freezeArray([...byEdge.values()].sort((a, b) => stable(a).localeCompare(stable(b))));
}

function edgeSupportReceipt(admittedEdges, classifications, eventSemantics) {
  return freezeArray(admittedEdges.map(edge => {
    const key = edgeKey(edge);
    const matching = classifications.filter(item => item.lawful_active && edgeKey(item.edge) === key);
    const semanticLineages = normalizeSemanticLineages(matching);
    return freezeRecord({
      edge,
      semantic_edge: semanticEdge(edge, eventSemantics),
      active_lawful_record_count: matching.length,
      semantic_lineage_count: semanticLineages.length,
      semantic_lineages: semanticLineages
    });
  }));
}

function semanticGenealogyFingerprint(classifications) {
  const lineages = normalizeSemanticLineages(classifications).map(item => ({
    semantic_edge: item.semantic_edge,
    semantic_support_kind: item.semantic_support_kind
  }));
  return stable(lineages);
}

function recordCustodyFingerprint(classifications) {
  return stable(classifications.map(item => ({
    admission_id: item.admission_id,
    semantic_support_fingerprint: item.semantic_support_fingerprint,
    status: item.status,
    active: item.record.active
  })).sort((a, b) => a.admission_id.localeCompare(b.admission_id)));
}

export function evaluatePrecedenceAdmissionGenealogy({
  case_id = 'PRECEDENCE_ADMISSION_GENEALOGY_CASE',
  base_specimen,
  admission_records = []
} = {}) {
  if (!base_specimen || typeof base_specimen !== 'object') throw new TypeError('base_specimen required');
  if (!Array.isArray(admission_records)) throw new TypeError('admission_records must be array');
  const eventSemantics = eventSemanticMap(base_specimen.events ?? []);
  const ids = new Set();
  const classifications = [];

  for (const raw of admission_records) {
    if (ids.has(raw?.admission_id)) throw new Error(`duplicate admission_id: ${raw.admission_id}`);
    ids.add(raw.admission_id);
    classifications.push(classifyAdmissionRecord(raw, eventSemantics));
  }

  const admittedEdges = buildAdmittedEdges(classifications);
  const lawfulActive = classifications.filter(item => item.lawful_active);
  const rejected = classifications.filter(item => !item.lawful_active && item.status !== 'INACTIVE_HISTORICAL_EDGE_ADMISSION_SUPPORT');
  const inactiveHistorical = classifications.filter(item => item.status === 'INACTIVE_HISTORICAL_EDGE_ADMISSION_SUPPORT');
  const weave = evaluateWarrantWeave({
    ...clone(base_specimen),
    case_id,
    precedence_edges: clone(admittedEdges)
  });
  const relationAccepted = weave.status === 'PARTIAL_ORDER_REPLAY_COMPLETE';

  return freezeRecord({
    schema: PEDAGOGUE_PRECEDENCE_ADMISSION_GENEALOGY_SCHEMA,
    candidate: 'C6_PRECEDENCE_ADMISSION_GENEALOGY',
    case_id,
    status: relationAccepted
      ? 'PRECEDENCE_ADMISSION_GENEALOGY_EVALUATED'
      : 'PRECEDENCE_ADMISSION_GENEALOGY_RELATION_REJECTED',
    relation_accepted: relationAccepted,
    admitted_edges: admittedEdges,
    active_lawful_support_count: lawfulActive.length,
    rejected_support_count: rejected.length,
    inactive_historical_support_count: inactiveHistorical.length,
    support_classifications: freezeArray(classifications),
    lawful_active_supports: freezeArray(lawfulActive),
    rejected_supports: freezeArray(rejected),
    inactive_historical_supports: freezeArray(inactiveHistorical),
    edge_support_receipts: edgeSupportReceipt(admittedEdges, classifications, eventSemantics),
    semantic_admission_genealogy_fingerprint: semanticGenealogyFingerprint(classifications),
    record_custody_fingerprint: recordCustodyFingerprint(classifications),
    semantic_relation_fingerprint: relationFingerprint(weave, base_specimen.events),
    current_weave_posture: weavePosture(weave),
    weave,
    relation_only_has_admission_genealogy_authority: false,
    support_identifier_authority: false,
    support_serialization_authority: false,
    scalar_aggregation_used: false,
    promotion_authority: false
  });
}

export function evaluateAdmissionGenealogyTimeline({
  case_id = 'ADMISSION_GENEALOGY_TIMELINE',
  base_specimen,
  episodes = []
} = {}) {
  if (!Array.isArray(episodes) || episodes.length === 0) throw new TypeError('episodes required');
  const sealed = [];
  let previous = null;
  for (const episode of episodes) {
    if (!episode || typeof episode.episode_id !== 'string' || !episode.episode_id) throw new TypeError('episode_id required');
    const current = evaluatePrecedenceAdmissionGenealogy({
      case_id: `${case_id}:${episode.episode_id}`,
      base_specimen,
      admission_records: clone(episode.admission_records ?? [])
    });
    sealed.push(freezeRecord({
      episode_id: episode.episode_id,
      result: current,
      semantic_relation_changed: previous
        ? previous.semantic_relation_fingerprint !== current.semantic_relation_fingerprint || previous.weave.status !== current.weave.status
        : false,
      semantic_admission_genealogy_changed: previous
        ? previous.semantic_admission_genealogy_fingerprint !== current.semantic_admission_genealogy_fingerprint
        : false,
      active_lawful_support_count_changed: previous
        ? previous.active_lawful_support_count !== current.active_lawful_support_count
        : false
    }));
    previous = current;
  }

  return freezeRecord({
    schema: 'td613.pedagogue.precedence-admission-genealogy-timeline/v0.1',
    case_id,
    episodes: freezeArray(sealed),
    current: sealed.at(-1).result,
    semantic_relation_trace: freezeArray(sealed.map(item => item.result.semantic_relation_fingerprint)),
    semantic_genealogy_trace: freezeArray(sealed.map(item => item.result.semantic_admission_genealogy_fingerprint)),
    support_count_trace: freezeArray(sealed.map(item => item.result.active_lawful_support_count)),
    historical_support_genealogy_preserved: true,
    latest_relation_only_history_authority: false,
    promotion_authority: false
  });
}

function baseSpecimen() {
  return {
    case_id: 'BLUEPRINT_MARGINS_BASE',
    baseline_evidence: [
      evidence('A', ['MEASUREMENT:A']),
      evidence('B', ['MEASUREMENT:B'])
    ],
    rules: [
      witnessedRule('BM_AB', ['MEASUREMENT:A', 'MEASUREMENT:B'], 'IDENTIFIABILITY:W'),
      witnessedRule('BM_CD', ['MEASUREMENT:C', 'MEASUREMENT:D'], 'IDENTIFIABILITY:W')
    ],
    contradiction_families: [],
    requested_warrant: 'IDENTIFIABILITY:W',
    events: [
      {
        event_id: 'PINK',
        semantic_label: 'WITHDRAW_PRIMARY_LINEAGE',
        kind: 'REMOVE_EVIDENCE',
        remove_evidence_ids: ['A']
      },
      {
        event_id: 'BLUE',
        semantic_label: 'ADD_REPLACEMENT_LINEAGE',
        kind: 'ADD_EVIDENCE',
        add_evidence: [
          evidence('C', ['MEASUREMENT:C']),
          evidence('D', ['MEASUREMENT:D'])
        ]
      }
    ]
  };
}

function record({
  admission_id,
  edge = ['PINK', 'BLUE'],
  semantic_support_kind,
  predeclared = true,
  admissible = true,
  witnessed = true,
  active = true,
  witness_override = null
}) {
  const provisional = {
    admission_id,
    edge,
    semantic_support_kind,
    predeclared,
    admissible,
    witnessed,
    active
  };
  const witness_payload = witness_override ?? makeSyntheticEdgeAdmissionWitness(provisional, baseSpecimen().events);
  return freezeRecord({ ...provisional, witness_payload });
}

function semanticSummary(result) {
  return freezeRecord({
    relation_accepted: result.relation_accepted,
    semantic_relation_fingerprint: result.semantic_relation_fingerprint,
    current_weave_posture: result.current_weave_posture,
    semantic_admission_genealogy_fingerprint: result.semantic_admission_genealogy_fingerprint,
    active_lawful_support_count: result.active_lawful_support_count,
    rejected_support_count: result.rejected_support_count
  });
}

function bm01SameLineDifferentPencil() {
  const a = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM01_ALPHA',
    base_specimen: baseSpecimen(),
    admission_records: [record({ admission_id: 'ADMIT_A', semantic_support_kind: 'DECLARATION_ALPHA' })]
  });
  const b = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM01_BETA',
    base_specimen: baseSpecimen(),
    admission_records: [record({ admission_id: 'ADMIT_B', semantic_support_kind: 'DECLARATION_BETA' })]
  });
  return freezeRecord({
    case_id: 'BM01_SAME_LINE_DIFFERENT_PENCIL',
    a,
    b,
    semantic_relation_equal: a.semantic_relation_fingerprint === b.semantic_relation_fingerprint,
    current_weave_posture_equal: stable(a.current_weave_posture) === stable(b.current_weave_posture),
    admission_genealogy_equal: a.semantic_admission_genealogy_fingerprint === b.semantic_admission_genealogy_fingerprint
  });
}

function bm02TwoPencils() {
  const result = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM02_MULTIPLE_LAWFUL_SUPPORTS_ONE_EDGE',
    base_specimen: baseSpecimen(),
    admission_records: [
      record({ admission_id: 'SUPPORT_ALPHA', semantic_support_kind: 'DECLARATION_ALPHA' }),
      record({ admission_id: 'SUPPORT_BETA', semantic_support_kind: 'DECLARATION_BETA' })
    ]
  });
  return freezeRecord({ case_id: 'BM02_MULTIPLE_LAWFUL_SUPPORTS_ONE_EDGE', result });
}

function bm03OnePencilLifted() {
  const timeline = evaluateAdmissionGenealogyTimeline({
    case_id: 'BM03_ONE_OF_MULTIPLE_SUPPORTS_REVOKED',
    base_specimen: baseSpecimen(),
    episodes: [
      {
        episode_id: 'BOTH_ACTIVE',
        admission_records: [
          record({ admission_id: 'SUPPORT_ALPHA', semantic_support_kind: 'DECLARATION_ALPHA' }),
          record({ admission_id: 'SUPPORT_BETA', semantic_support_kind: 'DECLARATION_BETA' })
        ]
      },
      {
        episode_id: 'ALPHA_REVOKED',
        admission_records: [
          record({ admission_id: 'SUPPORT_ALPHA', semantic_support_kind: 'DECLARATION_ALPHA', active: false }),
          record({ admission_id: 'SUPPORT_BETA', semantic_support_kind: 'DECLARATION_BETA' })
        ]
      }
    ]
  });
  return freezeRecord({ case_id: 'BM03_ONE_OF_MULTIPLE_SUPPORTS_REVOKED', timeline });
}

function bm04AllPencilsLifted() {
  const timeline = evaluateAdmissionGenealogyTimeline({
    case_id: 'BM04_ALL_LAWFUL_SUPPORTS_REVOKED',
    base_specimen: baseSpecimen(),
    episodes: [
      {
        episode_id: 'ONE_ACTIVE',
        admission_records: [record({ admission_id: 'SUPPORT_ALPHA', semantic_support_kind: 'DECLARATION_ALPHA' })]
      },
      {
        episode_id: 'ALL_REVOKED',
        admission_records: [record({ admission_id: 'SUPPORT_ALPHA', semantic_support_kind: 'DECLARATION_ALPHA', active: false })]
      }
    ]
  });
  return freezeRecord({ case_id: 'BM04_ALL_LAWFUL_SUPPORTS_REVOKED', timeline });
}

function bm05FalseWitnessBadge() {
  const fakeWitness = freezeRecord({
    schema: 'td613.pedagogue.synthetic-edge-admission-witness/v0.1',
    semantic_edge: freezeArray(['ADD_REPLACEMENT_LINEAGE', 'WITHDRAW_PRIMARY_LINEAGE']),
    semantic_support_kind: 'DECLARATION_ALPHA'
  });
  const result = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM05_FALSE_WITNESS_BADGE',
    base_specimen: baseSpecimen(),
    admission_records: [record({
      admission_id: 'FAKE_BADGE',
      semantic_support_kind: 'DECLARATION_ALPHA',
      witness_override: fakeWitness
    })]
  });
  return freezeRecord({ case_id: 'BM05_FALSE_WITNESS_BADGE', result });
}

function bm06MarginaliaShuffle() {
  const original = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM06_ORIGINAL',
    base_specimen: baseSpecimen(),
    admission_records: [
      record({ admission_id: 'A_FIRST', semantic_support_kind: 'DECLARATION_ALPHA' }),
      record({ admission_id: 'B_SECOND', semantic_support_kind: 'DECLARATION_BETA' })
    ]
  });
  const renamedReordered = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM06_RENAMED_REORDERED',
    base_specimen: baseSpecimen(),
    admission_records: [
      record({ admission_id: 'ZZZ', semantic_support_kind: 'DECLARATION_BETA' }),
      record({ admission_id: 'AAA', semantic_support_kind: 'DECLARATION_ALPHA' })
    ]
  });
  return freezeRecord({
    case_id: 'BM06_IDENTIFIER_SERIALIZATION_INVARIANCE',
    original,
    renamed_reordered: renamedReordered,
    semantic_relation_invariant: original.semantic_relation_fingerprint === renamedReordered.semantic_relation_fingerprint,
    semantic_genealogy_invariant: original.semantic_admission_genealogy_fingerprint === renamedReordered.semantic_admission_genealogy_fingerprint,
    weave_posture_invariant: stable(original.current_weave_posture) === stable(renamedReordered.current_weave_posture)
  });
}

function bm07BadPencilSortsFirst() {
  const fake = freezeRecord({
    schema: 'td613.pedagogue.synthetic-edge-admission-witness/v0.1',
    semantic_edge: freezeArray(['ADD_REPLACEMENT_LINEAGE', 'WITHDRAW_PRIMARY_LINEAGE']),
    semantic_support_kind: 'FAKE_SUPPORT'
  });
  const result = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM07_INVALID_SUPPORT_SORTS_FIRST_VALID_SUPPORT_LATER',
    base_specimen: baseSpecimen(),
    admission_records: [
      record({ admission_id: 'AAA_INVALID', semantic_support_kind: 'FAKE_SUPPORT', witness_override: fake }),
      record({ admission_id: 'ZZZ_VALID', semantic_support_kind: 'VALID_SUPPORT' })
    ]
  });
  return freezeRecord({ case_id: 'BM07_INVALID_SUPPORT_SORTS_FIRST_VALID_SUPPORT_LATER', result });
}

function bm08CrossedArrows() {
  const result = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM08_OPPOSING_EDGES_CYCLIC_RELATION',
    base_specimen: baseSpecimen(),
    admission_records: [
      record({ admission_id: 'FORWARD', semantic_support_kind: 'FORWARD_DECLARATION' }),
      record({ admission_id: 'REVERSE', edge: ['BLUE','PINK'], semantic_support_kind: 'REVERSE_DECLARATION' })
    ]
  });
  return freezeRecord({ case_id: 'BM08_OPPOSING_EDGES_CYCLIC_RELATION', result });
}

function bm09PostHocEraser() {
  const sealed = sealEdgeAdmissionRecord(record({ admission_id: 'SEALED_RECORD', semantic_support_kind: 'DECLARATION_ALPHA' }));
  const mutation = requestSealedEdgeAdmissionMutation(sealed, {
    edge: ['BLUE','PINK'],
    semantic_support_kind: 'REWRITTEN'
  });
  return freezeRecord({
    case_id: 'BM09_SEALED_ADMISSION_RECORD_MUTATION',
    sealed,
    mutation,
    sealed_edge_unchanged: stable(sealed.edge) === stable(['PINK','BLUE'])
  });
}

function bm10MarginlessBlueprint() {
  const full = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM10_FULL',
    base_specimen: baseSpecimen(),
    admission_records: [record({ admission_id: 'FULL_SUPPORT', semantic_support_kind: 'DECLARATION_ALPHA' })]
  });
  const relationOnly = evaluateWarrantWeave({
    ...clone(baseSpecimen()),
    case_id: 'BM10_RELATION_ONLY',
    precedence_edges: [['PINK','BLUE']]
  });
  return freezeRecord({
    case_id: 'BM10_RELATION_ONLY_COMPACTION',
    full,
    relation_only: relationOnly,
    semantic_relation_equal: full.semantic_relation_fingerprint === relationFingerprint(relationOnly, baseSpecimen().events),
    weave_posture_equal: stable(full.current_weave_posture) === stable(weavePosture(relationOnly)),
    relation_only_admission_genealogy_authority: false
  });
}

function bm11SameSemanticPencilNewLabel() {
  const a = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM11_A',
    base_specimen: baseSpecimen(),
    admission_records: [record({ admission_id: 'OLD_ID', semantic_support_kind: 'DECLARATION_ALPHA' })]
  });
  const b = evaluatePrecedenceAdmissionGenealogy({
    case_id: 'BM11_B',
    base_specimen: baseSpecimen(),
    admission_records: [record({ admission_id: 'NEW_ID', semantic_support_kind: 'DECLARATION_ALPHA' })]
  });
  return freezeRecord({
    case_id: 'BM11_SAME_SEMANTIC_SUPPORT_NEW_RECORD_ID',
    a,
    b,
    semantic_admission_lineage_changed: a.semantic_admission_genealogy_fingerprint !== b.semantic_admission_genealogy_fingerprint,
    record_custody_changed: a.record_custody_fingerprint !== b.record_custody_fingerprint
  });
}

function bm12WitnessScopeExpired() {
  const oneRemaining = evaluateAdmissionGenealogyTimeline({
    case_id: 'BM12_ONE_REMAINS',
    base_specimen: baseSpecimen(),
    episodes: [
      {
        episode_id: 'BOTH_ACTIVE',
        admission_records: [
          record({ admission_id: 'ALPHA', semantic_support_kind: 'DECLARATION_ALPHA' }),
          record({ admission_id: 'BETA', semantic_support_kind: 'DECLARATION_BETA' })
        ]
      },
      {
        episode_id: 'ALPHA_SCOPE_EXPIRED',
        admission_records: [
          record({ admission_id: 'ALPHA', semantic_support_kind: 'DECLARATION_ALPHA', active: false }),
          record({ admission_id: 'BETA', semantic_support_kind: 'DECLARATION_BETA' })
        ]
      }
    ]
  });
  const noneRemaining = evaluateAdmissionGenealogyTimeline({
    case_id: 'BM12_NONE_REMAINS',
    base_specimen: baseSpecimen(),
    episodes: [
      {
        episode_id: 'ACTIVE',
        admission_records: [record({ admission_id: 'ALPHA', semantic_support_kind: 'DECLARATION_ALPHA' })]
      },
      {
        episode_id: 'ALPHA_SCOPE_EXPIRED',
        admission_records: [record({ admission_id: 'ALPHA', semantic_support_kind: 'DECLARATION_ALPHA', active: false })]
      }
    ]
  });
  return freezeRecord({ case_id: 'BM12_ACTIVE_SCOPE_WITHDRAWAL', one_remaining: oneRemaining, none_remaining: noneRemaining });
}

export function runPedagogueBlueprintMarginsGauntlet() {
  const bm01 = bm01SameLineDifferentPencil();
  const bm02 = bm02TwoPencils();
  const bm03 = bm03OnePencilLifted();
  const bm04 = bm04AllPencilsLifted();
  const bm05 = bm05FalseWitnessBadge();
  const bm06 = bm06MarginaliaShuffle();
  const bm07 = bm07BadPencilSortsFirst();
  const bm08 = bm08CrossedArrows();
  const bm09 = bm09PostHocEraser();
  const bm10 = bm10MarginlessBlueprint();
  const bm11 = bm11SameSemanticPencilNewLabel();
  const bm12 = bm12WitnessScopeExpired();

  const defeatConditions = [];

  if (!bm01.semantic_relation_equal || !bm01.current_weave_posture_equal || bm01.admission_genealogy_equal) {
    defeatConditions.push('SAME_RELATION_DIFFERENT_ADMISSION_PROVENANCE_COLLAPSED');
  }

  const bm02Edge = bm02.result.edge_support_receipts[0];
  if (!bm02.result.relation_accepted || bm02.result.admitted_edges.length !== 1 || bm02Edge?.semantic_lineage_count !== 2) {
    defeatConditions.push('MULTIPLE_LAWFUL_EDGE_SUPPORT_LINEAGES_NOT_PRESERVED');
  }

  const bm03First = bm03.timeline.episodes[0].result;
  const bm03Second = bm03.timeline.episodes[1].result;
  if (bm03First.active_lawful_support_count !== 2 || bm03Second.active_lawful_support_count !== 1 ||
      bm03Second.admitted_edges.length !== 1 ||
      bm03First.semantic_admission_genealogy_fingerprint === bm03Second.semantic_admission_genealogy_fingerprint ||
      bm03First.semantic_relation_fingerprint !== bm03Second.semantic_relation_fingerprint) {
    defeatConditions.push('EDGE_PERSISTENCE_SUPPORT_GENEALOGY_CHANGE_NOT_PRESERVED');
  }

  const bm04Final = bm04.timeline.current;
  if (bm04Final.active_lawful_support_count !== 0 || bm04Final.admitted_edges.length !== 0) {
    defeatConditions.push('GHOST_EDGE_SURVIVED_ALL_SUPPORT_REVOCATION');
  }

  if (bm05.result.admitted_edges.length !== 0 ||
      !bm05.result.rejected_supports.some(item => item.status === 'REFUSE_UNWITNESSED_EDGE_ADMISSION')) {
    defeatConditions.push('BOOLEAN_WITNESS_BADGE_LAUNDERED_EDGE_ADMISSION');
  }

  if (!bm06.semantic_relation_invariant || !bm06.semantic_genealogy_invariant || !bm06.weave_posture_invariant) {
    defeatConditions.push('IDENTIFIER_OR_SERIALIZATION_CHANGED_EDGE_AUTHORITY');
  }

  if (bm07.result.admitted_edges.length !== 1 || bm07.result.active_lawful_support_count !== 1 ||
      !bm07.result.rejected_supports.some(item => item.admission_id === 'AAA_INVALID') ||
      !bm07.result.lawful_active_supports.some(item => item.admission_id === 'ZZZ_VALID')) {
    defeatConditions.push('LEXICAL_FIRST_INVALID_SUPPORT_SUPPRESSED_VALID_SUPPORT');
  }

  if (bm08.result.weave.status !== 'REJECT_CYCLIC_OR_INCONSISTENT_PRECEDENCE' ||
      bm08.result.active_lawful_support_count !== 2 || bm08.result.admitted_edges.length !== 2) {
    defeatConditions.push('CYCLIC_RELATION_REJECTION_ERASED_LAWFUL_SUPPORT_CUSTODY');
  }

  if (bm09.mutation.status !== 'SEALED_EDGE_ADMISSION_RECORD_IMMUTABLE' || !bm09.sealed_edge_unchanged) {
    defeatConditions.push('SEALED_EDGE_ADMISSION_RECORD_RETROACTIVELY_MUTATED');
  }

  if (!bm10.semantic_relation_equal || !bm10.weave_posture_equal || bm10.relation_only_admission_genealogy_authority) {
    defeatConditions.push('RELATION_ONLY_COMPACTION_ACQUIRED_ADMISSION_PROVENANCE_AUTHORITY');
  }

  if (bm11.semantic_admission_lineage_changed || !bm11.record_custody_changed) {
    defeatConditions.push('RAW_RECORD_IDENTITY_CONFUSED_WITH_SEMANTIC_SUPPORT_LINEAGE');
  }

  if (bm12.one_remaining.current.admitted_edges.length !== 1 || bm12.none_remaining.current.admitted_edges.length !== 0) {
    defeatConditions.push('HISTORICAL_SUPPORT_SCOPE_CONFUSED_WITH_CURRENT_ACTIVE_SUPPORT');
  }

  const inheritedC5OverclaimEstablished =
    bm01.semantic_relation_equal &&
    bm01.current_weave_posture_equal &&
    !bm01.admission_genealogy_equal;

  return freezeRecord({
    ok: true,
    schema: PEDAGOGUE_PRECEDENCE_ADMISSION_GENEALOGY_SCHEMA,
    inherited_c5_relation_revision_result_preserved: true,
    inherited_c5_admission_provenance_verdict: inheritedC5OverclaimEstablished
      ? 'WEAVE_REVISION_LEDGER_C5_FALSIFIED_AS_PRECEDENCE_ADMISSION_PROVENANCE_SUFFICIENT_FORM'
      : 'C5_PRECEDENCE_ADMISSION_PROVENANCE_OVERCLAIM_NOT_ESTABLISHED_IN_THIS_RUN',
    candidate: 'C6_PRECEDENCE_ADMISSION_GENEALOGY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: defeatConditions.length === 0
      ? 'PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_SURVIVES_BOUNDED_BLUEPRINT_MARGINS'
      : 'PRECEDENCE_ADMISSION_GENEALOGY_CANDIDATE_FALSIFIED_IN_BOUNDED_BLUEPRINT_MARGINS',
    defeat_conditions: freezeArray(defeatConditions),
    rooms: freezeRecord({ bm01, bm02, bm03, bm04, bm05, bm06, bm07, bm08, bm09, bm10, bm11, bm12 }),
    learned_distinctions: freezeArray([
      'same admitted semantic relation != same admission provenance',
      'edge persistence != support-genealogy persistence',
      'declared witnessed != witnessed relation',
      'admission identifier != edge authority',
      'serialization order != edge authority',
      'historically lawful support != currently active support',
      'relation-only custody != edge-admission genealogy custody'
    ]),
    next_learning_action: defeatConditions.length === 0
      ? 'ATTACK_EDGE_ADMISSION_GENEALOGY_SUPPORT_EPISODE_PROVENANCE_SCOPE_AND_EVENT_SET_REVISION_SEPARATELY_BEFORE_FORMALISM_PROMOTION'
      : 'INSPECT_PREREGISTERED_C6_DEFEAT_WITHOUT_POSTHOC_REDEFINITION',
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    promotion_authority: false,
    shared_pedagogue_engine_mutation: false,
    browser_execution: false,
    workflow_mutation: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true,
    scalar_aggregation_used: false
  });
}
