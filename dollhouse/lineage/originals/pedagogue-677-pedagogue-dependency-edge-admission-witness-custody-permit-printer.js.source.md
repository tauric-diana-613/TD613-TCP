import {
  evaluateDependencyEdgeAdmissionProvenanceCustody,
  makeSyntheticDependencyEdgeAdmissionRecord,
  makeSyntheticDependencyEdgeCandidate,
  materialDependencyEdgeFingerprint,
  runPedagogueUnlicensedElectricianGauntlet
} from './pedagogue-dependency-edge-admission-provenance-custody-unlicensed-electrician.js';
import { makeSyntheticWarrantSupportLineage } from './pedagogue-anchor-dependent-warrant-revocation-custody-borrowed-light.js';

export const PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_SCHEMA =
  'td613.pedagogue.dependency-edge-admission-witness-custody-hostile/v0.1';

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

export function makeSyntheticWitnessedDependencyEdgeAdmissionRecord({
  admission_id,
  material_edge_fingerprint,
  admission_kind = 'DEPENDENCY_EDGE_ADMISSION',
  active = true,
  revoked = false,
  issuance_event_fingerprint,
  witness_record_ids = [],
  claimed_witnessed = false
} = {}) {
  return deepFreeze({
    ...makeSyntheticDependencyEdgeAdmissionRecord({
      admission_id,
      material_edge_fingerprint,
      admission_kind,
      active,
      revoked
    }),
    issuance_event_fingerprint,
    witness_record_ids: [...witness_record_ids],
    claimed_witnessed
  });
}

export function makeSyntheticDependencyEdgeAdmissionWitnessRecord({
  witness_id,
  witness_kind = 'DEPENDENCY_EDGE_ADMISSION_OBSERVED',
  issuance_event_fingerprint,
  material_edge_fingerprint,
  revoked = false
} = {}) {
  return deepFreeze({
    witness_id,
    witness_kind,
    issuance_event_fingerprint,
    material_edge_fingerprint,
    revoked
  });
}

function witnessSemantic(record) {
  return stable({
    witness_kind: record?.witness_kind ?? null,
    issuance_event_fingerprint: record?.issuance_event_fingerprint ?? null,
    material_edge_fingerprint: record?.material_edge_fingerprint ?? null,
    revoked: record?.revoked === true
  });
}

function indexWitnessLedger(records = []) {
  const byId = new Map();
  for (const record of records) {
    const id = record?.witness_id;
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(record);
  }
  const conflictedIds = new Set();
  const canonicalById = new Map();
  for (const [id, group] of byId) {
    const semantics = new Set(group.map(witnessSemantic));
    if (semantics.size > 1) conflictedIds.add(id);
    else canonicalById.set(id, group[0]);
  }
  return { byId, canonicalById, conflictedIds };
}

function e5AdmitsSinglePermit(edge, permit, warrants, endpointStatusSnapshots) {
  const singleEdge = makeSyntheticDependencyEdgeCandidate({
    ...clone(edge),
    admission_record_ids: [permit.admission_id]
  });
  const result = evaluateDependencyEdgeAdmissionProvenanceCustody({
    warrants,
    dependency_edges: [singleEdge],
    admission_ledger: [permit],
    endpoint_status_snapshots: endpointStatusSnapshots
  });
  return result.edge_evaluations[0]?.status === 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE';
}

function evaluatePermitWitness({ permit, edge, witnessIndex }) {
  const witnessIds = Array.isArray(permit.witness_record_ids) ? permit.witness_record_ids : [];
  const material = materialDependencyEdgeFingerprint(edge);

  if (witnessIds.length === 0) {
    return deepFreeze({
      admission_id: permit.admission_id,
      issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
      status: 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION',
      witnessed: false,
      matching_witness_count: 0
    });
  }

  if (witnessIds.some(id => witnessIndex.conflictedIds.has(id))) {
    return deepFreeze({
      admission_id: permit.admission_id,
      issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
      status: 'REFUSE_DUPLICATE_DEPENDENCY_EDGE_ADMISSION_WITNESS_ID',
      witnessed: false,
      matching_witness_count: 0
    });
  }

  const present = witnessIds.map(id => witnessIndex.canonicalById.get(id));
  const presentCount = present.filter(Boolean).length;
  if (presentCount === 0) {
    return deepFreeze({
      admission_id: permit.admission_id,
      issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
      status: 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION',
      witnessed: false,
      matching_witness_count: 0
    });
  }
  if (presentCount !== witnessIds.length) {
    return deepFreeze({
      admission_id: permit.admission_id,
      issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
      status: 'REFUSE_MISSING_DEPENDENCY_EDGE_ADMISSION_WITNESS',
      witnessed: false,
      matching_witness_count: presentCount
    });
  }

  const records = present.filter(Boolean);
  const materiallyMatching = records.filter(record =>
    record.witness_kind === 'DEPENDENCY_EDGE_ADMISSION_OBSERVED' &&
    record.issuance_event_fingerprint === permit.issuance_event_fingerprint &&
    record.material_edge_fingerprint === material
  );

  if (materiallyMatching.length !== records.length) {
    return deepFreeze({
      admission_id: permit.admission_id,
      issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
      status: 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS',
      witnessed: false,
      matching_witness_count: materiallyMatching.length
    });
  }

  if (materiallyMatching.some(record => record.revoked === true)) {
    return deepFreeze({
      admission_id: permit.admission_id,
      issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
      status: 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS',
      witnessed: false,
      matching_witness_count: materiallyMatching.length
    });
  }

  return deepFreeze({
    admission_id: permit.admission_id,
    issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
    status: 'ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION',
    witnessed: true,
    matching_witness_count: materiallyMatching.length
  });
}

export function evaluateDependencyEdgeAdmissionWitnessCustody({
  warrants = [],
  dependency_edges = [],
  admission_ledger = [],
  admission_witness_ledger = [],
  endpoint_status_snapshots = []
} = {}) {
  const e5Baseline = evaluateDependencyEdgeAdmissionProvenanceCustody({
    warrants,
    dependency_edges,
    admission_ledger,
    endpoint_status_snapshots
  });
  const witnessIndex = indexWitnessLedger(admission_witness_ledger);
  const admissionById = new Map();
  for (const permit of admission_ledger) {
    if (!permit?.admission_id) continue;
    if (!admissionById.has(permit.admission_id)) admissionById.set(permit.admission_id, []);
    admissionById.get(permit.admission_id).push(permit);
  }

  const admissionEvaluations = [];
  const witnessedPermits = [];
  for (const edge of dependency_edges) {
    const citedIds = Array.isArray(edge.admission_record_ids) ? edge.admission_record_ids : [];
    for (const admissionId of citedIds) {
      const permits = admissionById.get(admissionId) ?? [];
      for (const permit of permits) {
        if (!e5AdmitsSinglePermit(edge, permit, warrants, endpoint_status_snapshots)) {
          admissionEvaluations.push(deepFreeze({
            edge_id: edge.edge_id,
            admission_id: permit.admission_id,
            issuance_event_fingerprint: permit.issuance_event_fingerprint ?? null,
            status: 'REFUSE_E5_INVALID_DEPENDENCY_EDGE_ADMISSION',
            witnessed: false,
            matching_witness_count: 0
          }));
          continue;
        }
        const witnessed = evaluatePermitWitness({ permit, edge, witnessIndex });
        admissionEvaluations.push(deepFreeze({ edge_id: edge.edge_id, ...witnessed }));
        if (witnessed.witnessed) witnessedPermits.push(permit);
      }
    }
  }

  const uniqueWitnessedPermits = [];
  const permitSeen = new Set();
  for (const permit of witnessedPermits) {
    const fingerprint = stable({
      admission_id: permit.admission_id,
      material_edge_fingerprint: permit.material_edge_fingerprint,
      admission_kind: permit.admission_kind,
      active: permit.active,
      revoked: permit.revoked,
      issuance_event_fingerprint: permit.issuance_event_fingerprint
    });
    if (permitSeen.has(fingerprint)) continue;
    permitSeen.add(fingerprint);
    uniqueWitnessedPermits.push(permit);
  }

  const e5Filtered = evaluateDependencyEdgeAdmissionProvenanceCustody({
    warrants,
    dependency_edges,
    admission_ledger: uniqueWitnessedPermits,
    endpoint_status_snapshots
  });

  const admissionStatusPairs = admissionEvaluations
    .map(item => [
      stable({ edge_id: item.edge_id, issuance_event_fingerprint: item.issuance_event_fingerprint }),
      item.status
    ])
    .sort((a, b) => stable(a).localeCompare(stable(b)));

  return deepFreeze({
    schema: PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_SCHEMA,
    candidate: 'E6_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY',
    e5_baseline: e5Baseline,
    e5_filtered: e5Filtered,
    admission_evaluations: admissionEvaluations,
    witnessed_permit_count: uniqueWitnessedPermits.length,
    conflicted_witness_ids: [...witnessIndex.conflictedIds].sort(),
    current_state_fingerprint: e5Filtered.current_state_fingerprint,
    admission_witness_state_fingerprint: stable(admissionStatusPairs),
    witness_identifier_is_authority: false,
    admission_identifier_is_authority: false,
    serialization_order_is_authority: false,
    witness_multiplicity_is_confidence: false,
    self_declared_witnessed_flag_is_authority: false,
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

export function sealDependencyEdgeAdmissionWitnessRecord(record) {
  return deepFreeze(clone(record));
}

export function requestSealedDependencyEdgeAdmissionWitnessRecordMutation(record) {
  if (Object.isFrozen(record)) {
    return deepFreeze({
      status: 'SEALED_DEPENDENCY_EDGE_ADMISSION_WITNESS_RECORD_IMMUTABLE',
      mutated: false
    });
  }
  return deepFreeze({
    status: 'REFUSE_UNSEALED_DEPENDENCY_EDGE_ADMISSION_WITNESS_RECORD',
    mutated: false
  });
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

function edge(id = 'EDGE', admissionIds = ['PERMIT'], overrides = {}) {
  return makeSyntheticDependencyEdgeCandidate({
    edge_id: id,
    from_warrant_key: 'W1',
    to_warrant_key: 'W2',
    active: true,
    dependency_kind: 'WARRANT_SUPPORT_DEPENDENCY',
    scope_fingerprint: 'SCOPE:ALPHA',
    admission_record_ids: admissionIds,
    ...overrides
  });
}

function permitFor(candidateEdge, admissionId = 'PERMIT', overrides = {}) {
  return makeSyntheticWitnessedDependencyEdgeAdmissionRecord({
    admission_id: admissionId,
    material_edge_fingerprint: materialDependencyEdgeFingerprint(candidateEdge),
    admission_kind: 'DEPENDENCY_EDGE_ADMISSION',
    active: true,
    revoked: false,
    issuance_event_fingerprint: `ISSUANCE:${admissionId}`,
    witness_record_ids: [`WITNESS:${admissionId}`],
    claimed_witnessed: false,
    ...overrides
  });
}

function witnessFor(candidateEdge, permit, witnessId = `WITNESS:${permit.admission_id}`, overrides = {}) {
  return makeSyntheticDependencyEdgeAdmissionWitnessRecord({
    witness_id: witnessId,
    witness_kind: 'DEPENDENCY_EDGE_ADMISSION_OBSERVED',
    issuance_event_fingerprint: permit.issuance_event_fingerprint,
    material_edge_fingerprint: materialDependencyEdgeFingerprint(candidateEdge),
    revoked: false,
    ...overrides
  });
}

function w2StatusFromE5(result) {
  return result.e5_filtered.e4_result.warrant_results.W2?.status ?? null;
}

function w2StatusBaseline(result) {
  return result.e5_baseline.e4_result.warrant_results.W2?.status ?? null;
}

function permitStatus(result, admissionId) {
  return result.admission_evaluations.find(item => item.admission_id === admissionId)?.status ?? null;
}

function baseWarrants() {
  return [node('W1', true), node('W2')];
}

function pp01() {
  const candidateEdge = edge('FAKE_EDGE', ['FAKE_PERMIT']);
  const fakePermit = permitFor(candidateEdge, 'FAKE_PERMIT', {
    issuance_event_fingerprint: 'ISSUANCE:FAKE',
    witness_record_ids: ['FAKE_WITNESS']
  });
  const result = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(),
    dependency_edges: [candidateEdge],
    admission_ledger: [fakePermit],
    admission_witness_ledger: []
  });
  const insufficiencyEstablished =
    result.e5_baseline.edge_evaluations[0]?.status === 'ADMIT_LEDGER_BOUND_DEPENDENCY_EDGE' &&
    w2StatusBaseline(result) === 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' &&
    permitStatus(result, 'FAKE_PERMIT') === 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION' &&
    w2StatusFromE5(result) === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT';
  return deepFreeze({ case_id: 'PP01_PRINTER_IN_THE_BACK_ROOM', result, insufficiency_established: insufficiencyEstablished });
}

function pp02() {
  const candidateEdge = edge('REAL_EDGE', ['REAL_PERMIT']);
  const permit = permitFor(candidateEdge, 'REAL_PERMIT');
  const witness = witnessFor(candidateEdge, permit);
  return deepFreeze({
    case_id: 'PP02_CLERK_AT_THE_COUNTER',
    result: evaluateDependencyEdgeAdmissionWitnessCustody({
      warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit], admission_witness_ledger: [witness]
    })
  });
}

function pp03() {
  const candidateEdge = edge('PARTIAL_EDGE', ['PARTIAL_PERMIT']);
  const permit = permitFor(candidateEdge, 'PARTIAL_PERMIT', { witness_record_ids: ['W_OK', 'W_MISSING'] });
  const witness = witnessFor(candidateEdge, permit, 'W_OK');
  return deepFreeze({
    case_id: 'PP03_MISSING_CARBON_COPY',
    result: evaluateDependencyEdgeAdmissionWitnessCustody({
      warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit], admission_witness_ledger: [witness]
    })
  });
}

function pp04() {
  const candidateEdge = edge('MISBOUND_EDGE', ['MISBOUND_PERMIT']);
  const permit = permitFor(candidateEdge, 'MISBOUND_PERMIT');
  const witness = witnessFor(candidateEdge, permit, 'WITNESS:MISBOUND_PERMIT', {
    issuance_event_fingerprint: 'ISSUANCE:SOME_OTHER_PERMIT'
  });
  return deepFreeze({
    case_id: 'PP04_WITNESS_SAW_ANOTHER_PERMIT',
    result: evaluateDependencyEdgeAdmissionWitnessCustody({
      warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit], admission_witness_ledger: [witness]
    })
  });
}

function pp05() {
  const candidateEdge = edge('REVOKED_WITNESS_EDGE', ['REVOKED_WITNESS_PERMIT']);
  const permit = permitFor(candidateEdge, 'REVOKED_WITNESS_PERMIT');
  const witness = witnessFor(candidateEdge, permit, 'WITNESS:REVOKED_WITNESS_PERMIT', { revoked: true });
  return deepFreeze({
    case_id: 'PP05_WITNESS_RECANTED',
    result: evaluateDependencyEdgeAdmissionWitnessCustody({
      warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit], admission_witness_ledger: [witness]
    })
  });
}

function pp06() {
  const candidateEdge = edge('DUP_WITNESS_EDGE', ['DUP_WITNESS_PERMIT']);
  const permit = permitFor(candidateEdge, 'DUP_WITNESS_PERMIT', { witness_record_ids: ['DUP_BADGE'] });
  const a = witnessFor(candidateEdge, permit, 'DUP_BADGE');
  const b = witnessFor(candidateEdge, permit, 'DUP_BADGE', { issuance_event_fingerprint: 'ISSUANCE:CONFLICT' });
  return deepFreeze({
    case_id: 'PP06_TWO_PEOPLE_WEARING_THE_SAME_BADGE',
    result: evaluateDependencyEdgeAdmissionWitnessCustody({
      warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit], admission_witness_ledger: [a, b]
    })
  });
}

function pp07() {
  const edgeA = edge('EDGE_A', ['PERMIT_A']);
  const permitA = permitFor(edgeA, 'PERMIT_A', { issuance_event_fingerprint: 'ISSUANCE:STABLE', witness_record_ids: ['W_A'] });
  const witnessA = witnessFor(edgeA, permitA, 'W_A');
  const a = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [edgeA], admission_ledger: [permitA], admission_witness_ledger: [witnessA]
  });

  const edgeB = edge('EDGE_Z', ['PERMIT_Z']);
  const permitB = permitFor(edgeB, 'PERMIT_Z', { issuance_event_fingerprint: 'ISSUANCE:STABLE', witness_record_ids: ['W_Z'] });
  const witnessB = witnessFor(edgeB, permitB, 'W_Z');
  const b = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [edgeB], admission_ledger: [permitB], admission_witness_ledger: [witnessB]
  });
  return deepFreeze({
    case_id: 'PP07_BADGE_NUMBERS_CHANGED', a, b,
    current_state_equal: a.current_state_fingerprint === b.current_state_fingerprint,
    permit_status_equal: permitStatus(a, 'PERMIT_A') === permitStatus(b, 'PERMIT_Z')
  });
}

function pp08() {
  const e12 = edge('ORDER_12', ['ORDER_P1', 'ORDER_P2']);
  const p1 = permitFor(e12, 'ORDER_P1', { witness_record_ids: ['ORDER_W1', 'ORDER_W2'] });
  const p2 = permitFor(e12, 'ORDER_P2', { witness_record_ids: ['ORDER_W3'] });
  const witnesses = [witnessFor(e12, p1, 'ORDER_W1'), witnessFor(e12, p1, 'ORDER_W2'), witnessFor(e12, p2, 'ORDER_W3')];
  const forward = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [e12], admission_ledger: [p1, p2], admission_witness_ledger: witnesses
  });
  const reversedEdge = makeSyntheticDependencyEdgeCandidate({ ...clone(e12), admission_record_ids: [...e12.admission_record_ids].reverse() });
  const reversedPermits = [p2, makeSyntheticWitnessedDependencyEdgeAdmissionRecord({ ...clone(p1), witness_record_ids: [...p1.witness_record_ids].reverse() })];
  const reverse = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: [...baseWarrants()].reverse(), dependency_edges: [reversedEdge], admission_ledger: reversedPermits, admission_witness_ledger: [...witnesses].reverse()
  });
  return deepFreeze({
    case_id: 'PP08_FOLDER_REVERSED', forward, reverse,
    current_state_equal: forward.current_state_fingerprint === reverse.current_state_fingerprint,
    witness_state_equal: forward.admission_witness_state_fingerprint === reverse.admission_witness_state_fingerprint
  });
}

function pp09() {
  const candidateEdge = edge('MIXED_EDGE', ['REAL_MIXED', 'FAKE_MIXED']);
  const real = permitFor(candidateEdge, 'REAL_MIXED');
  const fake = permitFor(candidateEdge, 'FAKE_MIXED', { issuance_event_fingerprint: 'ISSUANCE:FAKE_MIXED', witness_record_ids: ['NO_SUCH_WITNESS'] });
  const witness = witnessFor(candidateEdge, real);
  const result = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [real, fake], admission_witness_ledger: [witness]
  });
  return deepFreeze({ case_id: 'PP09_REAL_PERMIT_BESIDE_A_HOME_PRINTER', result });
}

function pp10() {
  const candidateEdge = edge('STALE_ISSUANCE_EDGE', ['SAME_PERMIT']);
  const original = permitFor(candidateEdge, 'SAME_PERMIT', { issuance_event_fingerprint: 'ISSUANCE:YESTERDAY' });
  const oldWitness = witnessFor(candidateEdge, original);
  const replacement = permitFor(candidateEdge, 'SAME_PERMIT', {
    issuance_event_fingerprint: 'ISSUANCE:TODAY',
    witness_record_ids: [oldWitness.witness_id]
  });
  const result = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [replacement], admission_witness_ledger: [oldWitness]
  });
  return deepFreeze({ case_id: 'PP10_YESTERDAYS_WITNESS_ON_TODAYS_PERMIT', result });
}

function pp11() {
  const oneEdge = edge('CROWD_EDGE', ['CROWD_PERMIT']);
  const onePermit = permitFor(oneEdge, 'CROWD_PERMIT', { witness_record_ids: ['CROWD_W1'] });
  const one = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [oneEdge], admission_ledger: [onePermit], admission_witness_ledger: [witnessFor(oneEdge, onePermit, 'CROWD_W1')]
  });
  const manyPermit = permitFor(oneEdge, 'CROWD_PERMIT', { witness_record_ids: ['CROWD_W1', 'CROWD_W2'] });
  const many = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [oneEdge], admission_ledger: [manyPermit], admission_witness_ledger: [witnessFor(oneEdge, manyPermit, 'CROWD_W1'), witnessFor(oneEdge, manyPermit, 'CROWD_W2')]
  });
  return deepFreeze({
    case_id: 'PP11_CROWD_AT_THE_COUNTER', one, many,
    current_state_equal: one.current_state_fingerprint === many.current_state_fingerprint
  });
}

function pp12() {
  const candidateEdge = edge('STAMP_EDGE', ['STAMP_PERMIT']);
  const permit = permitFor(candidateEdge, 'STAMP_PERMIT', { witness_record_ids: [], claimed_witnessed: true });
  const result = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit], admission_witness_ledger: []
  });
  return deepFreeze({ case_id: 'PP12_WITNESSED_TRUE_RUBBER_STAMP', result, claimed_witnessed: permit.claimed_witnessed });
}

function pp13() {
  const candidateEdge = edge('SEALED_EDGE', ['SEALED_PERMIT']);
  const permit = permitFor(candidateEdge, 'SEALED_PERMIT');
  const sealed = sealDependencyEdgeAdmissionWitnessRecord(witnessFor(candidateEdge, permit));
  return deepFreeze({
    case_id: 'PP13_LOCKED_WITNESS_BOOK',
    ...requestSealedDependencyEdgeAdmissionWitnessRecordMutation(sealed)
  });
}

function pp14() {
  const candidateEdge = edge('CONTROL_EDGE', ['CONTROL_PERMIT']);
  const permit = permitFor(candidateEdge, 'CONTROL_PERMIT');
  const witness = witnessFor(candidateEdge, permit);
  const e5 = evaluateDependencyEdgeAdmissionProvenanceCustody({
    warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit]
  });
  const e6 = evaluateDependencyEdgeAdmissionWitnessCustody({
    warrants: baseWarrants(), dependency_edges: [candidateEdge], admission_ledger: [permit], admission_witness_ledger: [witness]
  });
  return deepFreeze({
    case_id: 'PP14_UNLICENSED_ELECTRICIAN_CONTROL', e5, e6,
    current_state_equal: e5.current_state_fingerprint === e6.current_state_fingerprint
  });
}

export function runPedagoguePermitPrinterGauntlet() {
  const e5 = runPedagogueUnlicensedElectricianGauntlet();
  const rooms = deepFreeze({
    pp01: pp01(), pp02: pp02(), pp03: pp03(), pp04: pp04(), pp05: pp05(), pp06: pp06(), pp07: pp07(),
    pp08: pp08(), pp09: pp09(), pp10: pp10(), pp11: pp11(), pp12: pp12(), pp13: pp13(), pp14: pp14()
  });

  const inheritedInsufficiencyEstablished = rooms.pp01.insufficiency_established === true;
  const defeatConditions = [];

  if (
    permitStatus(rooms.pp01.result, 'FAKE_PERMIT') !== 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION' ||
    w2StatusFromE5(rooms.pp01.result) !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('SELF_ATTESTED_PERMIT_RETAINS_AUTHORITY');
  if (!inheritedInsufficiencyEstablished) defeatConditions.push('E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_NOT_ESTABLISHED');
  if (permitStatus(rooms.pp03.result, 'PARTIAL_PERMIT') !== 'REFUSE_MISSING_DEPENDENCY_EDGE_ADMISSION_WITNESS') {
    defeatConditions.push('PARTIAL_WITNESS_SET_SILENTLY_ACCEPTED');
  }
  if (permitStatus(rooms.pp04.result, 'MISBOUND_PERMIT') !== 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS') {
    defeatConditions.push('MISBOUND_ADMISSION_WITNESS_AUTHORIZES_PERMIT');
  }
  if (permitStatus(rooms.pp05.result, 'REVOKED_WITNESS_PERMIT') !== 'REFUSE_REVOKED_DEPENDENCY_EDGE_ADMISSION_WITNESS') {
    defeatConditions.push('REVOKED_ADMISSION_WITNESS_RETAINS_AUTHORITY');
  }
  if (
    permitStatus(rooms.pp06.result, 'DUP_WITNESS_PERMIT') !== 'REFUSE_DUPLICATE_DEPENDENCY_EDGE_ADMISSION_WITNESS_ID' ||
    rooms.pp06.result.conflicted_witness_ids[0] !== 'DUP_BADGE'
  ) defeatConditions.push('DUPLICATE_WITNESS_ID_LEXICALLY_ARBITRATED');
  if (!rooms.pp07.current_state_equal || !rooms.pp07.permit_status_equal) defeatConditions.push('IDENTIFIER_RENAME_CHANGES_ADMISSION_AUTHORITY');
  if (!rooms.pp08.current_state_equal || !rooms.pp08.witness_state_equal) defeatConditions.push('SERIALIZATION_ORDER_SELECTS_ADMISSION_WITNESS_AUTHORITY');
  if (
    permitStatus(rooms.pp09.result, 'REAL_MIXED') !== 'ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION' ||
    permitStatus(rooms.pp09.result, 'FAKE_MIXED') !== 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION' ||
    w2StatusFromE5(rooms.pp09.result) !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('FABRICATED_ALTERNATIVE_ERASES_VALID_WITNESSED_PERMIT');
  if (
    w2StatusBaseline(rooms.pp10.result) !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' ||
    permitStatus(rooms.pp10.result, 'SAME_PERMIT') !== 'REFUSE_MISBOUND_DEPENDENCY_EDGE_ADMISSION_WITNESS' ||
    w2StatusFromE5(rooms.pp10.result) !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('STALE_ISSUANCE_WITNESS_INHERITS_REPLACEMENT_PERMIT');
  if (
    !rooms.pp11.current_state_equal ||
    rooms.pp11.many.witness_multiplicity_is_confidence ||
    rooms.pp11.many.admission_evaluations[0]?.matching_witness_count !== 2
  ) defeatConditions.push('WITNESS_MULTIPLICITY_AMPLIFIES_AUTHORITY');
  if (
    !rooms.pp12.claimed_witnessed ||
    rooms.pp12.result.self_declared_witnessed_flag_is_authority ||
    permitStatus(rooms.pp12.result, 'STAMP_PERMIT') !== 'REFUSE_SELF_ATTESTED_DEPENDENCY_EDGE_ADMISSION'
  ) defeatConditions.push('SELF_DECLARED_WITNESSED_FLAG_SUBSTITUTES_FOR_WITNESS_LEDGER');
  if (rooms.pp13.status !== 'SEALED_DEPENDENCY_EDGE_ADMISSION_WITNESS_RECORD_IMMUTABLE' || rooms.pp13.mutated) {
    defeatConditions.push('SEALED_ADMISSION_WITNESS_RECORD_MUTATED');
  }
  if (
    permitStatus(rooms.pp02.result, 'REAL_PERMIT') !== 'ADMIT_WITNESSED_DEPENDENCY_EDGE_ADMISSION' ||
    w2StatusFromE5(rooms.pp02.result) !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' ||
    !rooms.pp14.current_state_equal
  ) defeatConditions.push('E6_CHANGES_E5_OR_E4_SEMANTICS_FOR_WITNESSED_PERMIT');

  const candidateVerdict = defeatConditions.length === 0
    ? 'DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_PERMIT_PRINTER'
    : 'DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_PERMIT_PRINTER';

  return deepFreeze({
    schema: PEDAGOGUE_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY_SCHEMA,
    inherited_e5_verdict: e5.candidate_verdict,
    inherited_e5_admission_ledger_provenance_verdict: inheritedInsufficiencyEstablished
      ? 'E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_ESTABLISHED'
      : 'E5_ADMISSION_LEDGER_PROVENANCE_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN',
    inherited_e5_and_e4_semantics_preserved: true,
    candidate: 'E6_DEPENDENCY_EDGE_ADMISSION_WITNESS_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateVerdict,
    defeat_conditions: defeatConditions,
    rooms,
    next_learning_action_if_survives: 'ATTACK_ADMISSION_WITNESS_ACQUISITION_PROVENANCE_AND_PRE_ADMISSION_PROTOCOL_BEFORE_LARGER_GRAPH_COMPOSITION',
    synthetic_exogenous_fixture: true,
    live_external_source_adapter: false,
    real_world_external_provenance_claim: false,
    real_world_authorization_claim: false,
    witness_acquisition_provenance: 'HELD_FOR_NEXT_ATTACK',
    pre_admission_witness_protocol: 'HELD_FOR_NEXT_ATTACK',
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
