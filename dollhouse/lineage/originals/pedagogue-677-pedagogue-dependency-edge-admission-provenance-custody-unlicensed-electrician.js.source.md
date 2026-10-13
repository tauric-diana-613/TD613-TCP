import {
  evaluateTransitiveWarrantDependencyCustody,
  makeSyntheticWarrantDependencyEdge,
  runPedagogueRelayLanternGauntlet
} from './pedagogue-transitive-warrant-dependency-custody-relay-lantern.js';
import {
  makeSyntheticWarrantSupportLineage
} from './pedagogue-anchor-dependent-warrant-revocation-custody-borrowed-light.js';

export const PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_SCHEMA =
  'td613.pedagogue.dependency-edge-admission-provenance-custody-hostile/v0.1';

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

export function materialDependencyEdgeFingerprint(edge = {}) {
  return stable({
    from_warrant_key: edge.from_warrant_key ?? null,
    to_warrant_key: edge.to_warrant_key ?? null,
    dependency_kind: edge.dependency_kind ?? 'WARRANT_SUPPORT_DEPENDENCY',
    scope_fingerprint: edge.scope_fingerprint ?? 'SCOPE:ALPHA'
  });
}

export function makeSyntheticDependencyEdgeCandidate({
  edge_id,
  from_warrant_key,
  to_warrant_key,
  active = true,
  dependency_kind = 'WARRANT_SUPPORT_DEPENDENCY',
  scope_fingerprint = 'SCOPE:ALPHA',
  admission_record_ids = []
} = {}) {
  return deepFreeze({
    ...makeSyntheticWarrantDependencyEdge({ edge_id, from_warrant_key, to_warrant_key, active }),
    dependency_kind,
    scope_fingerprint,
    admission_record_ids: [...admission_record_ids]
  });
}

export function makeSyntheticDependencyEdgeAdmissionRecord({
  admission_id,
  material_edge_fingerprint,
  admission_kind = 'DEPENDENCY_EDGE_ADMISSION',
  active = true,
  revoked = false
} = {}) {
  return deepFreeze({
    admission_id,
    material_edge_fingerprint,
    admission_kind,
    active,
    revoked
  });
}

function admissionRecordSemantic(record) {
  return stable({
    material_edge_fingerprint: record?.material_edge_fingerprint ?? null,
    admission_kind: record?.admission_kind ?? null,
    active: record?.active === true,
    revoked: record?.revoked === true
  });
}

function indexAdmissionLedger(records = []) {
  const byId = new Map();
  for (const record of records) {
    const id = record?.admission_id;
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(record);
  }
  const conflictedIds = new Set();
  const canonicalById = new Map();
  for (const [id, group] of byId) {
    const semantics = new Set(group.map(admissionRecordSemantic));
    if (semantics.size > 1) conflictedIds.add(id);
    else canonicalById.set(id, group[0]);
  }
  return { byId, canonicalById, conflictedIds };
}

function evaluateEdgeAdmission(edge, ledgerIndex, warrants, endpointStatusSnapshots) {
  const inherited = evaluateTransitiveWarrantDependencyCustody({
    warrants,
    dependency_edges: [edge],
    endpoint_status_snapshots: endpointStatusSnapshots
  });
  if (inherited.rejected_edges.length > 0) {
    return deepFreeze({
      edge,
      material_edge_fingerprint: materialDependencyEdgeFingerprint(edge),
      status: 'REFUSE_E4_INVALID_DEPENDENCY_EDGE',
      inherited_e4_status: inherited.rejected_edges[0].status,
      admitted: false,
      matching_admission_count: 0
    });
  }

  const ids = Array.isArray(edge.admission_record_ids) ? edge.admission_record_ids : [];
  if (ids.length === 0) {
    return deepFreeze({
      edge,
      material_edge_fingerprint: materialDependencyEdgeFingerprint(edge),
      status: 'REFUSE_UNADMITTED_DEPENDENCY_EDGE',
      inherited_e4_status: 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE',
      admitted: false,
      matching_admission_count: 0
    });
  }

  if (ids.some(id => ledgerIndex.conflictedIds.has(id))) {
    return deepFreeze({
      edge,
      material_edge_fingerprint: materialDependencyEdgeFingerprint(edge),
      status: 'REFUSE_DUPLICATE_DEPENDENCY_EDGE_ADMISSION_ID',
      inherited_e4_status: 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE',
      admitted: false,
      matching_admission_count: 0
    });
  }

  const records = ids.map(id => ledgerIndex.canonicalById.get(id)).filter(Boolean);
  if (records.length === 0) {
    return deepFreeze({
      edge,
      material_edge_fingerprint: materialDependencyEdgeFingerprint(edge),
      status: 'REFUSE_UNADMITTED_DEPENDENCY_EDGE',
      inherited_e4_status: 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE',
      admitted: false,
      matching_admission_count: 0
    });
  }

  const material = materialDependencyEdgeFingerprint(edge);
  const matching = records.filter(record =>
    record.admission_kind === 'DEPENDENCY_EDGE_ADMISSION' &&
    record.material_edge_fingerprint === material
  );

  if (matching.length === 0) {
    return deepFreeze({
      edge,
      material_edge_fingerprint: material,
      status: 'REFUSE_STALE_DEPENDENCY_EDGE_ADMISSION_BINDING',
      inherited_e4_status: 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE',
      admitted: false,
      matching_admission_count: 0
    });
  }

  const live = matching.filter(record => record.active === true && record.revoked !== true);
  if (live.length === 0) {
    return deepFreeze({
      edge,
      material_edge_fingerprint: material,
      status: 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION',
      inherited_e4_status: 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE',
      admitted: false,
      matching_admission_count: matching.length
    });
  }

  return deepFreeze({
    edge,
    material_edge_fingerprint: material,
    status: 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE',
    inherited_e4_status: 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE',
    admitted: true,
    matching_admission_count: live.length
  });
}

export function evaluateDependencyEdgeAdmissionProvenanceCustody({
  warrants = [],
  dependency_edges = [],
  admission_ledger = [],
  endpoint_status_snapshots = []
} = {}) {
  const ledgerIndex = indexAdmissionLedger(admission_ledger);
  const edgeEvaluations = dependency_edges.map(edge =>
    evaluateEdgeAdmission(edge, ledgerIndex, warrants, endpoint_status_snapshots)
  );
  const admittedEdges = edgeEvaluations.filter(item => item.admitted).map(item => item.edge);
  const e4Result = evaluateTransitiveWarrantDependencyCustody({
    warrants,
    dependency_edges: admittedEdges,
    endpoint_status_snapshots
  });

  const edgeStatusPairs = edgeEvaluations
    .map(item => [item.material_edge_fingerprint, item.status])
    .sort((a, b) => stable(a).localeCompare(stable(b)));

  return deepFreeze({
    schema: PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_SCHEMA,
    candidate: 'E5_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY',
    edge_evaluations: edgeEvaluations,
    admitted_edge_count: admittedEdges.length,
    refused_edge_count: edgeEvaluations.length - admittedEdges.length,
    conflicted_admission_ids: [...ledgerIndex.conflictedIds].sort(),
    e4_result: e4Result,
    current_state_fingerprint: e4Result.current_state_fingerprint,
    edge_admission_state_fingerprint: stable(edgeStatusPairs),
    endpoint_status_snapshots_observed: endpoint_status_snapshots.length > 0,
    endpoint_status_snapshots_have_edge_admission_authority: false,
    edge_identifier_is_authority: false,
    admission_identifier_is_authority: false,
    serialization_order_is_authority: false,
    admission_multiplicity_is_confidence: false,
    scalar_aggregation_used: false,
    promotion_authority: false,
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true
  });
}

export function sealDependencyEdgeAdmissionRecord(record) {
  return deepFreeze(clone(record));
}

export function requestSealedDependencyEdgeAdmissionRecordMutation(record) {
  if (Object.isFrozen(record)) {
    return deepFreeze({
      status: 'SEALED_DEPENDENCY_EDGE_ADMISSION_RECORD_IMMUTABLE',
      mutated: false
    });
  }
  return deepFreeze({ status: 'REFUSE_UNSEALED_DEPENDENCY_EDGE_ADMISSION_RECORD', mutated: false });
}

function independentLineage(warrantKey, supportKey = `SUPPORT_${warrantKey}`) {
  return makeSyntheticWarrantSupportLineage({
    lineage_id: `LINEAGE_${warrantKey}`,
    warrant_key: warrantKey,
    support_kind: 'INDEPENDENT_DECLARED_SUPPORT',
    active: true,
    independent_support_key: supportKey
  });
}

function node(warrantKey, lawful = false) {
  const supportKey = `SUPPORT_${warrantKey}`;
  return {
    warrant_key: warrantKey,
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 3,
    revisions: [],
    support_lineages: lawful ? [independentLineage(warrantKey, supportKey)] : [],
    active_independent_support_keys: lawful ? [supportKey] : []
  };
}

function candidateEdge(from, to, id, overrides = {}) {
  return makeSyntheticDependencyEdgeCandidate({
    edge_id: id,
    from_warrant_key: from,
    to_warrant_key: to,
    active: true,
    dependency_kind: 'WARRANT_SUPPORT_DEPENDENCY',
    scope_fingerprint: 'SCOPE:ALPHA',
    admission_record_ids: [],
    ...overrides
  });
}

function permitFor(edge, admissionId, overrides = {}) {
  return makeSyntheticDependencyEdgeAdmissionRecord({
    admission_id: admissionId,
    material_edge_fingerprint: materialDependencyEdgeFingerprint(edge),
    admission_kind: 'DEPENDENCY_EDGE_ADMISSION',
    active: true,
    revoked: false,
    ...overrides
  });
}

function status(result, warrantKey) {
  return result.e4_result.warrant_results[warrantKey]?.status ?? null;
}

function edgeStatus(result, index = 0) {
  return result.edge_evaluations[index]?.status ?? null;
}

function ue01() {
  const warrants = [node('W1', true), node('W2')];
  const wire = candidateEdge('W1', 'W2', 'UNLICENSED');
  const e4 = evaluateTransitiveWarrantDependencyCustody({ warrants, dependency_edges: [wire] });
  const e5 = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [wire], admission_ledger: [] });
  return deepFreeze({
    case_id: 'UE01_EXTENSION_CORD_THROUGH_THE_WINDOW',
    e4,
    e5,
    e4_declared_edge_insufficiency_established:
      e4.warrant_results.W2.status === 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' &&
      edgeStatus(e5) === 'REFUSE_UNADMITTED_DEPENDENCY_EDGE' &&
      status(e5, 'W2') === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  });
}

function ue02() {
  const warrants = [node('W1', true), node('W2')];
  const wire = candidateEdge('W1', 'W2', 'LICENSED', { admission_record_ids: ['P1'] });
  const permit = permitFor(wire, 'P1');
  const result = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [wire], admission_ledger: [permit] });
  return deepFreeze({ case_id: 'UE02_PERMIT_ON_FILE', result });
}

function ue03() {
  const warrants = [node('W1', true), node('W2')];
  const original = candidateEdge('W1', 'W2', 'EDGE_ALPHA', { admission_record_ids: ['OLD_PERMIT'] });
  const oldPermit = permitFor(original, 'OLD_PERMIT');
  const replacement = candidateEdge('W1', 'W2', 'EDGE_ALPHA', {
    dependency_kind: 'CORRELATION_ONLY',
    scope_fingerprint: 'SCOPE:BETA',
    admission_record_ids: ['OLD_PERMIT']
  });
  const e4 = evaluateTransitiveWarrantDependencyCustody({ warrants, dependency_edges: [replacement] });
  const e5 = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [replacement], admission_ledger: [oldPermit] });
  return deepFreeze({
    case_id: 'UE03_OLD_PERMIT_NEW_WIRING',
    original_material_fingerprint: materialDependencyEdgeFingerprint(original),
    replacement_material_fingerprint: materialDependencyEdgeFingerprint(replacement),
    e4,
    e5
  });
}

function ue04() {
  const warrants = [node('W1', true), node('W2')];
  const a = candidateEdge('W1', 'W2', 'AAA', { admission_record_ids: ['PERMIT_AAA'] });
  const b = candidateEdge('W1', 'W2', 'ZZZ', { admission_record_ids: ['PERMIT_ZZZ'] });
  const ra = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [a], admission_ledger: [permitFor(a, 'PERMIT_AAA')] });
  const rb = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [b], admission_ledger: [permitFor(b, 'PERMIT_ZZZ')] });
  return deepFreeze({
    case_id: 'UE04_NUMBER_ON_THE_PERMIT',
    a: ra,
    b: rb,
    material_fingerprint_equal: materialDependencyEdgeFingerprint(a) === materialDependencyEdgeFingerprint(b),
    current_state_equal: ra.current_state_fingerprint === rb.current_state_fingerprint
  });
}

function ue05() {
  const warrants = [node('W1', true), node('W2'), node('W3')];
  const e12 = candidateEdge('W1', 'W2', 'E12', { admission_record_ids: ['A12', 'A12B'] });
  const e23 = candidateEdge('W2', 'W3', 'E23', { admission_record_ids: ['A23'] });
  const ledger = [permitFor(e12, 'A12'), permitFor(e12, 'A12B'), permitFor(e23, 'A23')];
  const forward = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [e12, e23], admission_ledger: ledger });
  const reverse = evaluateDependencyEdgeAdmissionProvenanceCustody({
    warrants: [...warrants].reverse(),
    dependency_edges: [
      makeSyntheticDependencyEdgeCandidate({ ...clone(e23), admission_record_ids: [...e23.admission_record_ids].reverse() }),
      makeSyntheticDependencyEdgeCandidate({ ...clone(e12), admission_record_ids: [...e12.admission_record_ids].reverse() })
    ],
    admission_ledger: [...ledger].reverse()
  });
  return deepFreeze({
    case_id: 'UE05_PAPERS_REVERSED_ON_THE_DESK',
    forward,
    reverse,
    current_state_equal: forward.current_state_fingerprint === reverse.current_state_fingerprint,
    admission_state_equal: forward.edge_admission_state_fingerprint === reverse.edge_admission_state_fingerprint
  });
}

function ue06() {
  const warrants = [node('W1', true), node('W2')];
  const one = candidateEdge('W1', 'W2', 'DUP', { admission_record_ids: ['ONE'] });
  const two = candidateEdge('W1', 'W2', 'DUP', { admission_record_ids: ['ONE', 'TWO'] });
  const p1 = permitFor(one, 'ONE');
  const p2 = permitFor(one, 'TWO');
  const r1 = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [one], admission_ledger: [p1] });
  const r2 = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [two], admission_ledger: [p1, p2] });
  return deepFreeze({
    case_id: 'UE06_PHOTOCOPIES_OF_THE_PERMIT',
    one: r1,
    duplicate: r2,
    current_state_equal: r1.current_state_fingerprint === r2.current_state_fingerprint
  });
}

function ue07() {
  const warrants = [node('W1', true), node('W2')];
  const wire = candidateEdge('W1', 'W2', 'REVOKED', { admission_record_ids: ['P7'] });
  const permit = permitFor(wire, 'P7', { revoked: true });
  return deepFreeze({
    case_id: 'UE07_PERMIT_REVOKED',
    result: evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [wire], admission_ledger: [permit] })
  });
}

function ue08() {
  const warrants = [node('W1', true), node('W2'), node('W3')];
  const intended = candidateEdge('W1', 'W2', 'HOUSE_A', { admission_record_ids: ['P8'] });
  const neighbor = candidateEdge('W1', 'W3', 'HOUSE_B', { admission_record_ids: ['P8'] });
  const permit = permitFor(neighbor, 'P8');
  return deepFreeze({
    case_id: 'UE08_PERMIT_FOR_THE_NEIGHBORS_HOUSE',
    result: evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [intended], admission_ledger: [permit] })
  });
}

function ue09() {
  const warrants = [node('W1', true), node('W2')];
  const valid = candidateEdge('W1', 'W2', 'VALID', { admission_record_ids: ['P9'] });
  const fake = candidateEdge('W1', 'W2', 'FAKE', { admission_record_ids: ['FABRICATED'] });
  const result = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [valid, fake], admission_ledger: [permitFor(valid, 'P9')] });
  return deepFreeze({ case_id: 'UE09_LICENSED_AND_UNLICENSED_COPIES', result });
}

function ue10() {
  const warrants = [node('W1', true), node('W2')];
  const wire = candidateEdge('W1', 'W2', 'PHOTO');
  const result = evaluateDependencyEdgeAdmissionProvenanceCustody({
    warrants,
    dependency_edges: [wire],
    admission_ledger: [],
    endpoint_status_snapshots: [{ warrant_key: 'W2', status: 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' }]
  });
  return deepFreeze({ case_id: 'UE10_ENDPOINT_PHOTOGRAPH', result });
}

function ue11() {
  const warrants = [node('W1', true), node('W2'), node('W3')];
  const wire = candidateEdge('W1', 'W2', 'CONFLICT', { admission_record_ids: ['DUPLICATE'] });
  const other = candidateEdge('W1', 'W3', 'OTHER');
  const a = permitFor(wire, 'DUPLICATE');
  const b = permitFor(other, 'DUPLICATE');
  const result = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [wire], admission_ledger: [a, b] });
  return deepFreeze({ case_id: 'UE11_DUPLICATE_ADMISSION_ID', result });
}

function ue12() {
  const wire = candidateEdge('W1', 'W2', 'SEALED');
  const sealed = sealDependencyEdgeAdmissionRecord(permitFor(wire, 'SEALED_PERMIT'));
  return deepFreeze({
    case_id: 'UE12_LOCKED_PERMIT_CABINET',
    ...requestSealedDependencyEdgeAdmissionRecordMutation(sealed)
  });
}

function ue13() {
  const warrants = [node('W1', true), node('W2')];
  const wire = candidateEdge('W1', 'W2', 'CONTROL', { admission_record_ids: ['CONTROL_PERMIT'] });
  const e4 = evaluateTransitiveWarrantDependencyCustody({ warrants, dependency_edges: [wire] });
  const e5 = evaluateDependencyEdgeAdmissionProvenanceCustody({ warrants, dependency_edges: [wire], admission_ledger: [permitFor(wire, 'CONTROL_PERMIT')] });
  return deepFreeze({
    case_id: 'UE13_RELAY_LANTERN_CONTROL',
    e4,
    e5,
    propagation_equal: e4.current_state_fingerprint === e5.current_state_fingerprint
  });
}

export function runPedagogueUnlicensedElectricianGauntlet() {
  const e4 = runPedagogueRelayLanternGauntlet();
  const rooms = deepFreeze({
    ue01: ue01(), ue02: ue02(), ue03: ue03(), ue04: ue04(), ue05: ue05(), ue06: ue06(), ue07: ue07(),
    ue08: ue08(), ue09: ue09(), ue10: ue10(), ue11: ue11(), ue12: ue12(), ue13: ue13()
  });

  const inheritedInsufficiencyEstablished = rooms.ue01.e4_declared_edge_insufficiency_established === true;
  const defeatConditions = [];

  if (edgeStatus(rooms.ue01.e5) !== 'REFUSE_UNADMITTED_DEPENDENCY_EDGE' || status(rooms.ue01.e5, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT') {
    defeatConditions.push('UNADMITTED_EDGE_RETAINS_AUTHORITY');
  }
  if (!inheritedInsufficiencyEstablished) defeatConditions.push('E4_DECLARED_EDGE_INSUFFICIENCY_NOT_ESTABLISHED');
  if (
    rooms.ue03.original_material_fingerprint === rooms.ue03.replacement_material_fingerprint ||
    rooms.ue03.e4.warrant_results.W2.status !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' ||
    edgeStatus(rooms.ue03.e5) !== 'REFUSE_STALE_DEPENDENCY_EDGE_ADMISSION_BINDING' ||
    status(rooms.ue03.e5, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('STALE_SEMANTIC_REPLACEMENT_INHERITS_OLD_ADMISSION');
  if (!rooms.ue04.material_fingerprint_equal || !rooms.ue04.current_state_equal) defeatConditions.push('EDGE_OR_ADMISSION_IDENTIFIER_SELECTS_AUTHORITY');
  if (!rooms.ue05.current_state_equal || !rooms.ue05.admission_state_equal) defeatConditions.push('SERIALIZATION_ORDER_SELECTS_EDGE_AUTHORITY');
  if (!rooms.ue06.current_state_equal || rooms.ue06.duplicate.admission_multiplicity_is_confidence) defeatConditions.push('DUPLICATE_ADMISSION_AMPLIFIES_AUTHORITY');
  if (edgeStatus(rooms.ue07.result) !== 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION' || status(rooms.ue07.result, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT') {
    defeatConditions.push('REVOKED_ADMISSION_RETAINS_AUTHORITY');
  }
  if (edgeStatus(rooms.ue08.result) !== 'REFUSE_STALE_DEPENDENCY_EDGE_ADMISSION_BINDING' || status(rooms.ue08.result, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT') {
    defeatConditions.push('MISBOUND_ADMISSION_AUTHORIZES_EDGE');
  }
  if (
    rooms.ue09.result.edge_evaluations[0]?.status !== 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE' ||
    rooms.ue09.result.edge_evaluations[1]?.status !== 'REFUSE_UNADMITTED_DEPENDENCY_EDGE' ||
    status(rooms.ue09.result, 'W2') !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('FABRICATED_COPY_ERASES_VALID_ADMISSION');
  if (
    rooms.ue10.result.endpoint_status_snapshots_have_edge_admission_authority ||
    edgeStatus(rooms.ue10.result) !== 'REFUSE_UNADMITTED_DEPENDENCY_EDGE' ||
    status(rooms.ue10.result, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('ENDPOINT_SNAPSHOT_SUBSTITUTES_FOR_EDGE_ADMISSION');
  if (
    edgeStatus(rooms.ue11.result) !== 'REFUSE_DUPLICATE_DEPENDENCY_EDGE_ADMISSION_ID' ||
    rooms.ue11.result.conflicted_admission_ids[0] !== 'DUPLICATE'
  ) defeatConditions.push('DUPLICATE_ADMISSION_ID_LEXICALLY_ARBITRATED');
  if (rooms.ue12.status !== 'SEALED_DEPENDENCY_EDGE_ADMISSION_RECORD_IMMUTABLE' || rooms.ue12.mutated) {
    defeatConditions.push('SEALED_EDGE_ADMISSION_LEDGER_MUTATED');
  }
  if (
    edgeStatus(rooms.ue02.result) !== 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE' ||
    status(rooms.ue02.result, 'W2') !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' ||
    !rooms.ue13.propagation_equal
  ) defeatConditions.push('E5_CHANGES_E4_PROPAGATION_SEMANTICS_FOR_ADMITTED_EDGE');

  const candidateVerdict = defeatConditions.length === 0
    ? 'DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_UNLICENSED_ELECTRICIAN'
    : 'DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_UNLICENSED_ELECTRICIAN';

  return deepFreeze({
    schema: PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY_SCHEMA,
    inherited_e4_verdict: e4.candidate_verdict,
    inherited_e4_declared_edge_admission_verdict: inheritedInsufficiencyEstablished
      ? 'E4_DECLARED_DEPENDENCY_EDGE_ADMISSION_INSUFFICIENCY_ESTABLISHED'
      : 'E4_DECLARED_DEPENDENCY_EDGE_ADMISSION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN',
    inherited_e4_propagation_semantics_preserved: true,
    candidate: 'E5_DEPENDENCY_EDGE_ADMISSION_PROVENANCE_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateVerdict,
    defeat_conditions: defeatConditions,
    rooms,
    next_learning_action_if_survives: 'ATTACK_EDGE_ADMISSION_LEDGER_PROVENANCE_AND_BOOTSTRAP_AUTHORITY_BEFORE_LARGER_GRAPH_COMPOSITION',
    synthetic_exogenous_fixture: true,
    live_external_source_adapter: false,
    real_world_external_provenance_claim: false,
    real_world_authorization_claim: false,
    admission_ledger_provenance: 'HELD_FOR_NEXT_ATTACK',
    universal_graph_semantics: false,
    scalar_aggregation_used: false,
    H2: 'HELD_NOT_TESTED_HERE',
    H3: 'HELD_NOT_TESTED_HERE',
    intersections: 'HELD_NOT_OPENED_HERE',
    APERTURE_V32_REPLAY_STABILITY: 'HELD_NOT_YET_WITNESSED',
    promotion_authority: false,
    product_mutation: false,
    shared_pedagogue_engine_mutation: false,
    workflow_mutation: false,
    browser_execution: false,
    merge_performed: false,
    deployment_performed: false,
    release_authority: false,
    vercel_release_requires_issue_405_and_new_explicit_operator_gesture: true
  });
}
