import {
  evaluateAnchorDependentWarrantRevocationCustody,
  makeSyntheticWarrantSupportLineage,
  runPedagogueBorrowedLightGauntlet
} from './pedagogue-anchor-dependent-warrant-revocation-custody-borrowed-light.js';
import { makeSyntheticExogenousAnchorRevision } from './pedagogue-exogenous-anchor-revision-episode-custody-moving-sash.js';

export const PEDAGOGUE_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_SCHEMA =
  'td613.pedagogue.transitive-warrant-dependency-custody-hostile/v0.1';

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

export function makeSyntheticWarrantDependencyEdge({
  edge_id,
  from_warrant_key,
  to_warrant_key,
  active = true
} = {}) {
  return deepFreeze({ edge_id, from_warrant_key, to_warrant_key, active });
}

function edgeSemanticFingerprint(edge) {
  return stable({
    from_warrant_key: edge.from_warrant_key ?? null,
    to_warrant_key: edge.to_warrant_key ?? null,
    active: edge.active === true
  });
}

function classifyEdge(edge, knownWarrantKeys) {
  if (!edge || typeof edge !== 'object') return 'REFUSE_MALFORMED_TRANSITIVE_WARRANT_DEPENDENCY_EDGE';
  if (!edge.from_warrant_key || !edge.to_warrant_key) return 'REFUSE_INCOMPLETE_TRANSITIVE_WARRANT_DEPENDENCY_EDGE';
  if (typeof edge.active !== 'boolean') return 'REFUSE_TRANSITIVE_WARRANT_DEPENDENCY_WITHOUT_ACTIVE_STATE';
  if (!knownWarrantKeys.has(edge.from_warrant_key)) return 'REFUSE_TRANSITIVE_WARRANT_DEPENDENCY_UNKNOWN_SOURCE';
  if (!knownWarrantKeys.has(edge.to_warrant_key)) return 'REFUSE_TRANSITIVE_WARRANT_DEPENDENCY_UNKNOWN_TARGET';
  return 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE';
}

function evaluateDirectWarrant(node) {
  return evaluateAnchorDependentWarrantRevocationCustody({
    warrant_key: node.warrant_key,
    requested_target: node.requested_target ?? 'TARGET:ALPHA',
    requested_field: node.requested_field ?? 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: node.current_epoch ?? 10,
    revisions: node.revisions ?? [],
    support_lineages: node.support_lineages ?? [],
    active_independent_support_keys: node.active_independent_support_keys ?? [],
    value_only_snapshot: node.value_only_snapshot ?? null
  });
}

function propagate(seedSet, edges, blocked = new Set()) {
  const reached = new Set([...seedSet].filter(key => !blocked.has(key)));
  let changed = true;
  while (changed) {
    changed = false;
    for (const edge of edges) {
      if (!reached.has(edge.from_warrant_key)) continue;
      if (blocked.has(edge.to_warrant_key) || reached.has(edge.to_warrant_key)) continue;
      reached.add(edge.to_warrant_key);
      changed = true;
    }
  }
  return reached;
}

function hasDirectedCycle(keys, edges) {
  const adjacency = new Map([...keys].map(key => [key, []]));
  for (const edge of edges) adjacency.get(edge.from_warrant_key)?.push(edge.to_warrant_key);
  const visiting = new Set();
  const visited = new Set();
  function visit(key) {
    if (visiting.has(key)) return true;
    if (visited.has(key)) return false;
    visiting.add(key);
    for (const next of adjacency.get(key) ?? []) if (visit(next)) return true;
    visiting.delete(key);
    visited.add(key);
    return false;
  }
  for (const key of keys) if (visit(key)) return true;
  return false;
}

export function evaluateTransitiveWarrantDependencyCustody({
  warrants = [],
  dependency_edges = [],
  endpoint_status_snapshots = []
} = {}) {
  const knownWarrantKeys = new Set();
  const duplicateWarrantKeys = new Set();
  for (const node of warrants) {
    if (knownWarrantKeys.has(node?.warrant_key)) duplicateWarrantKeys.add(node.warrant_key);
    else if (node?.warrant_key) knownWarrantKeys.add(node.warrant_key);
  }

  const directResults = new Map();
  for (const node of warrants) {
    if (!node?.warrant_key || directResults.has(node.warrant_key)) continue;
    directResults.set(node.warrant_key, evaluateDirectWarrant(node));
  }

  const admittedEdges = [];
  const rejectedEdges = [];
  for (const edge of dependency_edges) {
    const status = classifyEdge(edge, knownWarrantKeys);
    if (status === 'ADMIT_SYNTHETIC_TRANSITIVE_WARRANT_DEPENDENCY_EDGE') admittedEdges.push(edge);
    else rejectedEdges.push(deepFreeze({ edge, status }));
  }

  const semanticUnique = new Map();
  for (const edge of admittedEdges) {
    const fingerprint = edgeSemanticFingerprint(edge);
    if (!semanticUnique.has(fingerprint)) semanticUnique.set(fingerprint, edge);
  }
  const activeEdges = [...semanticUnique.values()].filter(edge => edge.active === true);

  const admittedSeeds = new Set();
  const conflictSeeds = new Set();
  const historicalSeeds = new Set();
  for (const [key, direct] of directResults) {
    if (direct.status === 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT') admittedSeeds.add(key);
    if (direct.status === 'ABSTAIN_WARRANT_SUPPORT_CONFLICT') conflictSeeds.add(key);
    if (direct.historical_support_count > 0) historicalSeeds.add(key);
  }

  const currentAdmitted = propagate(admittedSeeds, activeEdges);
  const currentConflicted = propagate(conflictSeeds, activeEdges, currentAdmitted);
  const historicalReachable = propagate(historicalSeeds, activeEdges);

  const warrantResults = {};
  for (const key of [...knownWarrantKeys].sort()) {
    const direct = directResults.get(key);
    let status;
    let authority_origin;
    if (direct.status === 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT') {
      status = direct.status;
      authority_origin = 'DIRECT_E3';
    } else if (currentAdmitted.has(key)) {
      status = 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT';
      authority_origin = 'TRANSITIVE_E4';
    } else if (direct.status === 'ABSTAIN_WARRANT_SUPPORT_CONFLICT') {
      status = direct.status;
      authority_origin = 'DIRECT_E3_CONFLICT';
    } else if (currentConflicted.has(key)) {
      status = 'ABSTAIN_TRANSITIVE_WARRANT_SUPPORT_CONFLICT';
      authority_origin = 'TRANSITIVE_E4_CONFLICT';
    } else {
      status = direct.status;
      authority_origin = 'NO_CURRENT_LAWFUL_PATH';
    }
    warrantResults[key] = deepFreeze({
      warrant_key: key,
      status,
      authority_origin,
      direct_e3_status: direct.status,
      direct_current_support_count: direct.current_support_count,
      direct_historical_support_count: direct.historical_support_count,
      current_reachable_from_lawful_foundation: currentAdmitted.has(key),
      current_conflict_reachable_without_admitted_path: currentConflicted.has(key),
      historical_reachable_from_lawful_foundation: historicalReachable.has(key)
    });
  }

  const activeSemanticFingerprints = activeEdges.map(edgeSemanticFingerprint).sort();
  const statePairs = Object.values(warrantResults)
    .map(item => [item.warrant_key, item.status])
    .sort((a, b) => a[0].localeCompare(b[0]));

  return deepFreeze({
    schema: PEDAGOGUE_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_SCHEMA,
    candidate: 'E4_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY',
    warrant_results: warrantResults,
    current_admitted_warrant_keys: [...currentAdmitted].sort(),
    current_conflicted_warrant_keys: [...currentConflicted].sort(),
    historical_reachable_warrant_keys: [...historicalReachable].sort(),
    semantic_edge_count: semanticUnique.size,
    active_semantic_edge_count: activeEdges.length,
    duplicate_edge_count: admittedEdges.length - semanticUnique.size,
    semantic_graph_fingerprint: stable(activeSemanticFingerprints),
    current_state_fingerprint: stable(statePairs),
    cycle_present: hasDirectedCycle(knownWarrantKeys, activeEdges),
    cycle_bootstrap_used: false,
    rejected_edges: rejectedEdges,
    duplicate_warrant_keys: [...duplicateWarrantKeys].sort(),
    endpoint_status_snapshots_observed: endpoint_status_snapshots.length > 0,
    endpoint_status_snapshots_have_transitive_authority: false,
    edge_identifier_is_authority: false,
    serialization_order_is_authority: false,
    duplicate_edge_is_confidence: false,
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

export function sealTransitiveWarrantDependencyGraph(edges = []) {
  return deepFreeze(clone(edges));
}

export function requestSealedTransitiveWarrantDependencyGraphMutation(sealedGraph) {
  if (Object.isFrozen(sealedGraph)) {
    return deepFreeze({
      status: 'SEALED_TRANSITIVE_WARRANT_DEPENDENCY_GRAPH_IMMUTABLE',
      mutated: false
    });
  }
  return deepFreeze({ status: 'REFUSE_UNSEALED_TRANSITIVE_WARRANT_DEPENDENCY_GRAPH', mutated: false });
}

function revision(overrides = {}) {
  return makeSyntheticExogenousAnchorRevision({
    revision_id: 'R1',
    semantic_anchor_key: 'K',
    epoch: 1,
    revision_kind: 'ADMIT',
    active: true,
    raw_anchor_id: 'ANCHOR_K',
    target_fingerprint: 'TARGET:ALPHA',
    observations: [{ field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL', value: 'PRE_ENTRY' }],
    source_kind: 'ADMITTED_EXOGENOUS_OBSERVATION',
    ...overrides
  });
}

function exogenous(warrantKey, overrides = {}) {
  return makeSyntheticWarrantSupportLineage({
    lineage_id: `L_${warrantKey}`,
    warrant_key: warrantKey,
    support_kind: 'EXOGENOUS_ANCHOR',
    active: true,
    semantic_anchor_key: 'K',
    target_fingerprint: 'TARGET:ALPHA',
    observed_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    required_value: 'PRE_ENTRY',
    ...overrides
  });
}

function independent(warrantKey, supportKey = `INDEPENDENT_${warrantKey}`) {
  return makeSyntheticWarrantSupportLineage({
    lineage_id: `I_${warrantKey}`,
    warrant_key: warrantKey,
    support_kind: 'INDEPENDENT_DECLARED_SUPPORT',
    active: true,
    independent_support_key: supportKey
  });
}

function node(warrantKey, overrides = {}) {
  return {
    warrant_key: warrantKey,
    requested_target: 'TARGET:ALPHA',
    requested_field: 'SOURCE_EXISTENCE_RELATIVE_TO_PROTOCOL',
    current_epoch: 3,
    revisions: [],
    support_lineages: [],
    active_independent_support_keys: [],
    ...overrides
  };
}

function edge(from, to, edgeId, overrides = {}) {
  return makeSyntheticWarrantDependencyEdge({
    edge_id: edgeId,
    from_warrant_key: from,
    to_warrant_key: to,
    active: true,
    ...overrides
  });
}

function currentStatus(result, key) {
  return result.warrant_results[key]?.status ?? null;
}

function rl01() {
  const revisions = [
    revision({ revision_id: 'K1', epoch: 1 }),
    revision({ revision_id: 'K2', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  const wire = [edge('W1', 'W2', 'E12')];
  const before = evaluateTransitiveWarrantDependencyCustody({
    warrants: [
      node('W1', { current_epoch: 1, revisions, support_lineages: [exogenous('W1')] }),
      node('W2', { current_epoch: 1 })
    ],
    dependency_edges: wire
  });
  const after = evaluateTransitiveWarrantDependencyCustody({
    warrants: [
      node('W1', { revisions, support_lineages: [exogenous('W1')] }),
      node('W2')
    ],
    dependency_edges: wire
  });
  return deepFreeze({
    case_id: 'RL01_RELAY_GOES_DARK',
    before,
    after,
    historical_path_preserved: after.historical_reachable_warrant_keys.includes('W2')
  });
}

function rl02() {
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [node('W1'), node('W2')],
    dependency_edges: [edge('W1', 'W2', 'C12'), edge('W2', 'W1', 'C21')]
  });
  return deepFreeze({
    case_id: 'RL02_CIRCULAR_LANTERNS',
    result,
    cycle_does_not_self_sustain:
      currentStatus(result, 'W1') === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT' &&
      currentStatus(result, 'W2') === 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  });
}

function rl03() {
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [
      node('W1', {
        support_lineages: [independent('W1')],
        active_independent_support_keys: ['INDEPENDENT_W1']
      }),
      node('W2')
    ],
    dependency_edges: [edge('W1', 'W2', 'G12'), edge('W2', 'W1', 'G21')]
  });
  return deepFreeze({ case_id: 'RL03_GROUNDED_RING', result });
}

function rl04() {
  const revisions = [
    revision({ revision_id: 'S1', epoch: 1 }),
    revision({ revision_id: 'S2', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [
      node('W1', { revisions, support_lineages: [exogenous('W1')] }),
      node('W2', {
        support_lineages: [independent('W2')],
        active_independent_support_keys: ['INDEPENDENT_W2']
      })
    ],
    dependency_edges: [edge('W1', 'W2', 'S12')]
  });
  return deepFreeze({ case_id: 'RL04_DOWNSTREAM_SPARE_BATTERY', result });
}

function rl05() {
  const revisions = [
    revision({ revision_id: 'Q1', epoch: 2, active: true }),
    revision({ revision_id: 'Q2', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [
      node('W1', { revisions, support_lineages: [exogenous('W1')] }),
      node('W2')
    ],
    dependency_edges: [edge('W1', 'W2', 'Q12')]
  });
  return deepFreeze({ case_id: 'RL05_CONFLICT_RELAY', result });
}

function rl06() {
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [node('W2')],
    dependency_edges: [edge('W9', 'W2', 'WRONG')],
    endpoint_status_snapshots: [{ warrant_key: 'W9', status: 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT' }]
  });
  return deepFreeze({ case_id: 'RL06_WRONG_WIRE', result });
}

function rl07() {
  const warrants = [
    node('W1', {
      support_lineages: [independent('W1')],
      active_independent_support_keys: ['INDEPENDENT_W1']
    }),
    node('W2')
  ];
  const one = evaluateTransitiveWarrantDependencyCustody({
    warrants,
    dependency_edges: [edge('W1', 'W2', 'ONE')]
  });
  const duplicate = evaluateTransitiveWarrantDependencyCustody({
    warrants,
    dependency_edges: [edge('W1', 'W2', 'ONE'), edge('W1', 'W2', 'TWO')]
  });
  return deepFreeze({
    case_id: 'RL07_TWIN_WIRES',
    one,
    duplicate,
    authority_equal: one.current_state_fingerprint === duplicate.current_state_fingerprint,
    graph_fingerprint_equal: one.semantic_graph_fingerprint === duplicate.semantic_graph_fingerprint
  });
}

function rl08() {
  const warrants = [
    node('W1', {
      support_lineages: [independent('W1')],
      active_independent_support_keys: ['INDEPENDENT_W1']
    }),
    node('W2'),
    node('W3')
  ];
  const baseline = evaluateTransitiveWarrantDependencyCustody({
    warrants,
    dependency_edges: [edge('W1', 'W2', 'A'), edge('W2', 'W3', 'B')]
  });
  const shuffled = evaluateTransitiveWarrantDependencyCustody({
    warrants: [...warrants].reverse(),
    dependency_edges: [edge('W2', 'W3', 'ZZZ'), edge('W1', 'W2', 'YYY')]
  });
  return deepFreeze({
    case_id: 'RL08_TAGS_AND_ORDER_SHUFFLE',
    baseline,
    shuffled,
    authority_equal: baseline.current_state_fingerprint === shuffled.current_state_fingerprint,
    graph_fingerprint_equal: baseline.semantic_graph_fingerprint === shuffled.semantic_graph_fingerprint
  });
}

function rl09() {
  const revisions = [
    revision({ revision_id: 'H1', epoch: 1 }),
    revision({ revision_id: 'H2', epoch: 2, revision_kind: 'WITHDRAW', active: false })
  ];
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [
      node('W1', { revisions, support_lineages: [exogenous('W1')] }),
      node('W2')
    ],
    dependency_edges: [edge('W1', 'W2', 'H12')]
  });
  return deepFreeze({
    case_id: 'RL09_HISTORICAL_RELAY',
    result,
    historical_transitive_path_preserved: result.historical_reachable_warrant_keys.includes('W2')
  });
}

function rl10() {
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [node('W2')],
    dependency_edges: [],
    endpoint_status_snapshots: [{ warrant_key: 'W2', status: 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT' }]
  });
  return deepFreeze({ case_id: 'RL10_ENDPOINT_PHOTOGRAPH', result });
}

function rl11() {
  const sealed = sealTransitiveWarrantDependencyGraph([edge('W1', 'W2', 'SEALED')]);
  return deepFreeze({
    case_id: 'RL11_POST_HOC_ELECTRICIAN',
    ...requestSealedTransitiveWarrantDependencyGraphMutation(sealed)
  });
}

function rl12() {
  const result = evaluateTransitiveWarrantDependencyCustody({
    warrants: [
      node('W1', {
        support_lineages: [independent('W1')],
        active_independent_support_keys: ['INDEPENDENT_W1']
      })
    ],
    dependency_edges: []
  });
  return deepFreeze({
    case_id: 'RL12_E3_DIRECT_CONTROL',
    result,
    direct_status: result.warrant_results.W1.direct_e3_status,
    e4_status: result.warrant_results.W1.status
  });
}

export function runPedagogueRelayLanternGauntlet() {
  const e3 = runPedagogueBorrowedLightGauntlet();
  const rooms = deepFreeze({
    rl01: rl01(),
    rl02: rl02(),
    rl03: rl03(),
    rl04: rl04(),
    rl05: rl05(),
    rl06: rl06(),
    rl07: rl07(),
    rl08: rl08(),
    rl09: rl09(),
    rl10: rl10(),
    rl11: rl11(),
    rl12: rl12()
  });

  const defeatConditions = [];
  if (
    currentStatus(rooms.rl01.after, 'W1') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT' ||
    currentStatus(rooms.rl01.after, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('ANCHOR_WITHDRAWAL_FAILS_TRANSITIVE_REVOCATION');

  if (!rooms.rl02.cycle_does_not_self_sustain || rooms.rl02.result.cycle_bootstrap_used) {
    defeatConditions.push('UNANCHORED_CYCLE_SELF_SUSTAINS');
  }

  if (
    currentStatus(rooms.rl03.result, 'W1') !== 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT' ||
    currentStatus(rooms.rl03.result, 'W2') !== 'ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT'
  ) defeatConditions.push('ANCHORED_CYCLE_FAILS_TO_PROPAGATE');

  if (currentStatus(rooms.rl04.result, 'W2') !== 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT') {
    defeatConditions.push('INDEPENDENT_DOWNSTREAM_SUPPORT_FALSELY_REVOKED');
  }

  if (
    currentStatus(rooms.rl05.result, 'W1') !== 'ABSTAIN_WARRANT_SUPPORT_CONFLICT' ||
    currentStatus(rooms.rl05.result, 'W2') !== 'ABSTAIN_TRANSITIVE_WARRANT_SUPPORT_CONFLICT'
  ) defeatConditions.push('CONFLICT_NOT_PROPAGATED_AS_ABSTENTION');

  if (
    currentStatus(rooms.rl06.result, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT' ||
    rooms.rl06.result.rejected_edges[0]?.status !== 'REFUSE_TRANSITIVE_WARRANT_DEPENDENCY_UNKNOWN_SOURCE'
  ) defeatConditions.push('WRONG_DEPENDENCY_EDGE_CREATES_AUTHORITY');

  if (
    !rooms.rl07.authority_equal ||
    !rooms.rl07.graph_fingerprint_equal ||
    rooms.rl07.duplicate.semantic_edge_count !== 1 ||
    rooms.rl07.duplicate.duplicate_edge_count !== 1 ||
    rooms.rl07.duplicate.duplicate_edge_is_confidence
  ) defeatConditions.push('DUPLICATE_EDGE_AMPLIFIES_SUPPORT_OR_CONFIDENCE');

  if (!rooms.rl08.authority_equal || !rooms.rl08.graph_fingerprint_equal) {
    defeatConditions.push('EDGE_IDENTIFIER_OR_SERIALIZATION_CHANGES_AUTHORITY');
  }

  if (!rooms.rl01.historical_path_preserved || !rooms.rl09.historical_transitive_path_preserved) {
    defeatConditions.push('HISTORICAL_TRANSITIVE_PATH_ERASED');
  }

  if (
    currentStatus(rooms.rl10.result, 'W2') !== 'REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT' ||
    rooms.rl10.result.endpoint_status_snapshots_have_transitive_authority
  ) defeatConditions.push('ENDPOINT_SNAPSHOT_OVERCLAIMS_TRANSITIVE_PATH');

  if (rooms.rl11.status !== 'SEALED_TRANSITIVE_WARRANT_DEPENDENCY_GRAPH_IMMUTABLE' || rooms.rl11.mutated) {
    defeatConditions.push('SEALED_TRANSITIVE_DEPENDENCY_GRAPH_MUTATED');
  }

  if (
    rooms.rl12.direct_status !== 'ADMIT_CURRENT_WARRANT_WITH_LAWFUL_SUPPORT' ||
    rooms.rl12.e4_status !== rooms.rl12.direct_status
  ) defeatConditions.push('E4_CHANGES_E3_DIRECT_SEMANTICS');

  const candidateVerdict = defeatConditions.length === 0
    ? 'TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RELAY_LANTERN'
    : 'TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_RELAY_LANTERN';

  return deepFreeze({
    schema: PEDAGOGUE_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY_SCHEMA,
    inherited_e3_verdict: e3.candidate_verdict,
    inherited_e3_direct_semantics_preserved: true,
    candidate: 'E4_TRANSITIVE_WARRANT_DEPENDENCY_CUSTODY',
    candidate_status: 'ATTACK_ONLY_NOT_PROMOTED',
    candidate_verdict: candidateVerdict,
    defeat_conditions: defeatConditions,
    rooms,
    synthetic_exogenous_fixture: true,
    live_external_source_adapter: false,
    real_world_external_provenance_claim: false,
    semantic_replacement_bridge_law: 'HELD_NOT_OPENED_HERE',
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
