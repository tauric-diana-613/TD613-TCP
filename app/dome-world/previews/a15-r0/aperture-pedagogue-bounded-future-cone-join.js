import { runDirectedBranchingConfluenceAssay } from './aperture-pedagogue-directed-branching-confluence.js';
import { runDirectedReachabilityGeometryAssay } from './aperture-pedagogue-directed-reachability-geometry.js';

export const BOUNDED_FUTURE_CONE_JOIN_SCHEMA = 'td613.a15-r0.aperture-pedagogue-bounded-future-cone-join/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const keyOf = (value) => JSON.stringify(value);
const wordKey = (word) => word.length ? word.join('') : 'ID';
const pairKey = (a, b) => `${a}=>${b}`;
const endpointMassFromState = (state) => state.endpoint.flat().reduce((sum, value) => sum + value, 0);

function outcomeIndex(cone) {
  return new Map(cone.outcomes.map((outcome) => [wordKey(outcome.word), outcome]));
}

function buildConeNodes(fork) {
  const nodeMap = new Map();

  const ingest = (side, outcome) => {
    if (!outcome.representative_independent) return;
    if (!nodeMap.has(outcome.target_key)) {
      nodeMap.set(outcome.target_key, {
        key: outcome.target_key,
        state: outcome.target_state,
        realizations: [],
      });
    }
    nodeMap.get(outcome.target_key).realizations.push(freeze({
      side,
      word: freeze([...outcome.word]),
      word_label: outcome.word_label,
      final_history: outcome.final_history,
      endpoint_mass: outcome.endpoint_mass,
      receipt_variants: outcome.final_receipt_variants,
    }));
  };

  fork.left_cone.outcomes.forEach((outcome) => ingest('T_CHILD', outcome));
  fork.right_cone.outcomes.forEach((outcome) => ingest('Q_CHILD', outcome));

  const nodes = [...nodeMap.values()].map((node, index) => freeze({
    node_id: `C${index}`,
    key: node.key,
    state: node.state,
    endpoint_mass: endpointMassFromState(node.state),
    realizations: freeze(node.realizations),
    minimum_left_depth: Math.min(
      ...node.realizations.filter((row) => row.side === 'T_CHILD').map((row) => row.word.length),
      Infinity,
    ),
    minimum_right_depth: Math.min(
      ...node.realizations.filter((row) => row.side === 'Q_CHILD').map((row) => row.word.length),
      Infinity,
    ),
  }));

  return freeze({
    nodes: freeze(nodes),
    by_key: new Map(nodes.map((node) => [node.key, node])),
  });
}

function buildConeEdges(fork, coneNodes, horizon = 4) {
  const leftIndex = outcomeIndex(fork.left_cone);
  const rightIndex = outcomeIndex(fork.right_cone);
  const indexBySide = new Map([
    ['T_CHILD', leftIndex],
    ['Q_CHILD', rightIndex],
  ]);
  const edgeMap = new Map();
  const failures = [];

  for (const node of coneNodes.nodes) {
    for (const generator of ['T', 'Q']) {
      const successorKeys = new Set();
      const rows = [];

      for (const realization of node.realizations) {
        if (realization.word.length >= horizon) continue;
        const nextWord = [...realization.word, generator];
        const next = indexBySide.get(realization.side)?.get(wordKey(nextWord));
        if (!next || !next.representative_independent) {
          failures.push(freeze({
            classification: 'CONE_SUCCESSOR_LOOKUP_FAILED',
            source_key: node.key,
            side: realization.side,
            word: realization.word,
            generator,
            next_word: freeze(nextWord),
          }));
          continue;
        }
        successorKeys.add(next.target_key);
        rows.push(freeze({
          side: realization.side,
          source_word: realization.word,
          generator,
          target_word: next.word,
          target_key: next.target_key,
        }));
      }

      if (rows.length === 0) continue;
      if (successorKeys.size !== 1) {
        failures.push(freeze({
          classification: 'CONE_EDGE_REPRESENTATIVE_INDEPENDENCE_VIOLATION',
          source_key: node.key,
          generator,
          successor_keys: freeze([...successorKeys]),
          rows: freeze(rows),
        }));
        continue;
      }

      const targetKey = [...successorKeys][0];
      const target = coneNodes.by_key.get(targetKey);
      if (!target) {
        failures.push(freeze({
          classification: 'CONE_EDGE_TARGET_OUTSIDE_BOUNDED_NODE_SET',
          source_key: node.key,
          generator,
          target_key: targetKey,
        }));
        continue;
      }

      const deltaMass = target.endpoint_mass - node.endpoint_mass;
      const edgeKey = `${node.key}::${generator}::${targetKey}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, freeze({
          edge_id: `CE${edgeMap.size}`,
          generator,
          source_key: node.key,
          source_node_id: node.node_id,
          target_key: targetKey,
          target_node_id: target.node_id,
          source_mass: node.endpoint_mass,
          target_mass: target.endpoint_mass,
          delta_mass: deltaMass,
          strictly_increases_mass: deltaMass > 0,
          representative_independent: true,
          realization_rows: freeze(rows),
        }));
      }
    }
  }

  const edges = freeze([...edgeMap.values()]);
  const massFailures = edges.filter((edge) => !edge.strictly_increases_mass);
  return freeze({
    edges,
    failures: freeze([...failures, ...massFailures]),
    representative_independent: failures.length === 0,
    strict_mass_increase: massFailures.length === 0,
  });
}

function auditConeReachability(nodes, edges) {
  const outgoing = new Map(nodes.map((node) => [node.key, []]));
  for (const edge of edges) outgoing.get(edge.source_key)?.push(edge.target_key);

  const reachablePairs = new Set();
  for (const source of nodes) {
    const stack = [source.key];
    const seen = new Set();
    while (stack.length) {
      const current = stack.pop();
      if (seen.has(current)) continue;
      seen.add(current);
      reachablePairs.add(pairKey(source.key, current));
      for (const target of outgoing.get(current) ?? []) stack.push(target);
    }
  }

  const reachable = (a, b) => reachablePairs.has(pairKey(a, b));
  const reflexivityFailures = nodes.filter((node) => !reachable(node.key, node.key)).map((node) => node.node_id);
  const antisymmetryFailures = [];
  const transitivityFailures = [];

  for (const a of nodes) {
    for (const b of nodes) {
      if (a.key !== b.key && reachable(a.key, b.key) && reachable(b.key, a.key)) {
        antisymmetryFailures.push(freeze({ a: a.node_id, b: b.node_id }));
      }
      for (const c of nodes) {
        if (reachable(a.key, b.key) && reachable(b.key, c.key) && !reachable(a.key, c.key)) {
          transitivityFailures.push(freeze({ a: a.node_id, b: b.node_id, c: c.node_id }));
        }
      }
    }
  }

  const passed = reflexivityFailures.length === 0
    && antisymmetryFailures.length === 0
    && transitivityFailures.length === 0;

  return freeze({
    passed,
    reachable_pairs: reachablePairs,
    reflexivity_failures: freeze(reflexivityFailures),
    antisymmetry_failures: freeze(antisymmetryFailures),
    transitivity_failures: freeze(transitivityFailures),
    classification: passed ? 'BOUNDED_FUTURE_CONE_REACHABILITY_IS_A_PARTIAL_ORDER' : 'BOUNDED_FUTURE_CONE_ORDER_AUDITION_FAILED',
  });
}

function auditUpperBounds(fork, coneNodes, reachability) {
  const leftKey = fork.left_child.target_key;
  const rightKey = fork.right_child.target_key;
  const reachable = (a, b) => reachability.reachable_pairs.has(pairKey(a, b));

  const upperBounds = coneNodes.nodes.filter((node) => reachable(leftKey, node.key) && reachable(rightKey, node.key));
  const upperBoundKeys = new Set(upperBounds.map((node) => node.key));
  const parentCommonTargetKeys = new Set(fork.common_future_hits.map((hit) => hit.target_key));

  const minimal = upperBounds.filter((candidate) => !upperBounds.some((other) => (
    other.key !== candidate.key
    && reachable(other.key, candidate.key)
  )));

  const least = upperBounds.filter((candidate) => upperBounds.every((other) => reachable(candidate.key, other.key)));

  const parentHadCommonFuture = fork.common_future_hit_count > 0;
  const coneHasCommonUpperBound = upperBounds.length > 0;
  const existenceMatchesParent = parentHadCommonFuture === coneHasCommonUpperBound;
  const membershipMatchesParent = (
    upperBoundKeys.size === parentCommonTargetKeys.size
    && [...upperBoundKeys].every((key) => parentCommonTargetKeys.has(key))
  );

  let classification = 'NO_COMMON_UPPER_BOUND_WITHIN_H4_CONE';
  if (upperBounds.length > 0 && least.length === 1) classification = 'UNIQUE_LEAST_COMMON_FUTURE_WITHIN_H4_CONE';
  else if (upperBounds.length > 0 && minimal.length > 1 && least.length === 0) classification = 'MULTIPLE_MINIMAL_COMMON_FUTURES_WITHOUT_LEAST_WITHIN_H4_CONE';
  else if (upperBounds.length > 0 && least.length === 0) classification = 'COMMON_FUTURES_PRESENT_BUT_NO_LEAST_WITHIN_H4_CONE';
  else if (upperBounds.length > 0 && least.length > 1) classification = 'MULTIPLE_LEAST_CANDIDATES_ORDER_ANTISYMMETRY_CONFLICT';

  const leastNode = least.length === 1 ? least[0] : null;
  const leastProvenanceHits = leastNode
    ? fork.common_future_hits.filter((hit) => hit.target_key === leastNode.key && hit.routes_distinct)
    : [];
  const minimumCostTargets = new Set(fork.minimum_cost_hits.map((hit) => hit.target_key));
  const leastIsMinimumCostTarget = leastNode ? minimumCostTargets.has(leastNode.key) : false;

  return freeze({
    left_child_key: leftKey,
    right_child_key: rightKey,
    upper_bounds: freeze(upperBounds.map((node) => freeze({ node_id: node.node_id, key: node.key, endpoint_mass: node.endpoint_mass }))),
    upper_bound_count: upperBounds.length,
    minimal_upper_bounds: freeze(minimal.map((node) => freeze({ node_id: node.node_id, key: node.key, endpoint_mass: node.endpoint_mass }))),
    minimal_upper_bound_count: minimal.length,
    least_upper_bounds: freeze(least.map((node) => freeze({ node_id: node.node_id, key: node.key, endpoint_mass: node.endpoint_mass }))),
    least_upper_bound_count: least.length,
    unique_least_upper_bound: leastNode ? freeze({ node_id: leastNode.node_id, key: leastNode.key, state: leastNode.state, endpoint_mass: leastNode.endpoint_mass }) : null,
    parent_common_target_count: parentCommonTargetKeys.size,
    existence_matches_parent: existenceMatchesParent,
    membership_matches_parent: membershipMatchesParent,
    minimum_cost_target_keys: freeze([...minimumCostTargets]),
    least_is_minimum_cost_target: leastIsMinimumCostTarget,
    least_provenance_hits: freeze(leastProvenanceHits),
    provenance_survives_at_least_target: leastNode ? leastProvenanceHits.length > 0 : true,
    classification,
  });
}

function auditForkJoin(fork) {
  const coneNodes = buildConeNodes(fork);
  const coneEdges = buildConeEdges(fork, coneNodes, 4);
  const reachability = auditConeReachability(coneNodes.nodes, coneEdges.edges);
  const upperBounds = auditUpperBounds(fork, coneNodes, reachability);

  const passed = (
    coneEdges.representative_independent
    && coneEdges.strict_mass_increase
    && coneEdges.failures.length === 0
    && reachability.passed
    && upperBounds.existence_matches_parent
    && upperBounds.membership_matches_parent
    && upperBounds.provenance_survives_at_least_target
  );

  return freeze({
    source_node_id: fork.source_node_id,
    source_key: fork.source_key,
    source_min_depth: fork.source_min_depth,
    parent_confluence_classification: fork.confluence_classification,
    parent_common_future_hit_count: fork.common_future_hit_count,
    parent_minimum_join_cost: fork.minimum_join_cost,
    passed,
    cone: freeze({
      horizon: 4,
      node_count: coneNodes.nodes.length,
      edge_count: coneEdges.edges.length,
      nodes: coneNodes.nodes,
      edges: coneEdges.edges,
      edge_failures: coneEdges.failures,
      representative_independent: coneEdges.representative_independent,
      strict_mass_increase: coneEdges.strict_mass_increase,
    }),
    reachability,
    upper_bound_audit: upperBounds,
  });
}

export function runBoundedFutureConeJoinAudition() {
  const branching = runDirectedBranchingConfluenceAssay();
  const geometry = runDirectedReachabilityGeometryAssay();
  if (!branching?.passed || !geometry?.passed) {
    return freeze({
      schema: BOUNDED_FUTURE_CONE_JOIN_SCHEMA,
      passed: false,
      status: 'PARENT_DIRECTED_BRANCHING_OR_GEOMETRY_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_BOUNDED_FUTURE_CONE_JOIN_AUDITION',
    });
  }

  const branchingBefore = JSON.stringify(branching);
  const geometryBefore = JSON.stringify(geometry);

  const forks = branching.forks.map(auditForkJoin);
  const failures = forks.filter((fork) => !fork.passed);
  const uniqueLeast = forks.filter((fork) => fork.upper_bound_audit.classification === 'UNIQUE_LEAST_COMMON_FUTURE_WITHIN_H4_CONE');
  const boundedUnresolved = forks.filter((fork) => fork.upper_bound_audit.classification === 'NO_COMMON_UPPER_BOUND_WITHIN_H4_CONE');
  const multipleMinimal = forks.filter((fork) => fork.upper_bound_audit.classification === 'MULTIPLE_MINIMAL_COMMON_FUTURES_WITHOUT_LEAST_WITHIN_H4_CONE');
  const commonWithoutLeast = forks.filter((fork) => fork.upper_bound_audit.classification === 'COMMON_FUTURES_PRESENT_BUT_NO_LEAST_WITHIN_H4_CONE');
  const leastMinimumCoincidences = uniqueLeast.filter((fork) => fork.upper_bound_audit.least_is_minimum_cost_target);

  const pureTSourceLabels = new Set(['ID', 'T', 'TT', 'TTT']);
  const parentForkBySource = new Map(branching.forks.map((fork) => [fork.source_node_id, fork]));
  const unresolvedSourceLabels = boundedUnresolved.map((fork) => {
    const parent = parentForkBySource.get(fork.source_node_id);
    const route = parent?.left_child?.rows?.[0]?.source_history_id ?? null;
    return freeze({ source_node_id: fork.source_node_id, source_history_id: route });
  });

  const branchingAfter = JSON.stringify(runDirectedBranchingConfluenceAssay());
  const geometryAfter = JSON.stringify(runDirectedReachabilityGeometryAssay());
  const parentCustodyUnchanged = branchingBefore === branchingAfter && geometryBefore === geometryAfter;

  const allLeastProvenanceSurvives = uniqueLeast.every((fork) => fork.upper_bound_audit.provenance_survives_at_least_target);
  const allConeOrdersPass = forks.every((fork) => fork.reachability.passed);
  const allConeEdgesStrict = forks.every((fork) => fork.cone.strict_mass_increase && fork.cone.representative_independent);
  const parentCountsMatch = uniqueLeast.length + boundedUnresolved.length + multipleMinimal.length + commonWithoutLeast.length === forks.length;

  const candidatePatternObserved = (
    forks.length === 15
    && uniqueLeast.length === 11
    && boundedUnresolved.length === 4
    && multipleMinimal.length === 0
    && commonWithoutLeast.length === 0
  );

  const success = (
    failures.length === 0
    && allConeOrdersPass
    && allConeEdgesStrict
    && allLeastProvenanceSurvives
    && parentCountsMatch
    && parentCustodyUnchanged
  );

  const canonicalClassification = success
    ? (candidatePatternObserved
      ? 'FINITE_H4_PARTIAL_SIBLING_JOIN_STRUCTURE_WITH_ELEVEN_UNIQUE_LEAST_COMMON_FUTURES_AND_FOUR_BOUNDED_UNRESOLVED_FORKS'
      : 'FINITE_H4_BOUNDED_FUTURE_CONE_JOIN_CENSUS_WITH_PARTIAL_SIBLING_JOIN_DOMAIN')
    : null;

  return freeze({
    schema: BOUNDED_FUTURE_CONE_JOIN_SCHEMA,
    passed: success,
    status: success ? 'BOUNDED_FUTURE_CONE_JOIN_AUDITION_CLOSED' : 'BOUNDED_FUTURE_CONE_JOIN_AUDITION_FAILED',
    horizon: 4,
    fork_count: forks.length,
    forks: freeze(forks),
    census: freeze({
      unique_least_common_future_count: uniqueLeast.length,
      no_common_upper_bound_within_H4_count: boundedUnresolved.length,
      multiple_minimal_without_least_count: multipleMinimal.length,
      common_future_without_least_count: commonWithoutLeast.length,
      least_equals_parent_minimum_cost_target_count: leastMinimumCoincidences.length,
    }),
    partial_join_domain: freeze(uniqueLeast.map((fork) => freeze({
      source_node_id: fork.source_node_id,
      left_child_key: fork.upper_bound_audit.left_child_key,
      right_child_key: fork.upper_bound_audit.right_child_key,
      join_key: fork.upper_bound_audit.unique_least_upper_bound.key,
      join_state: fork.upper_bound_audit.unique_least_upper_bound.state,
      least_is_minimum_cost_target: fork.upper_bound_audit.least_is_minimum_cost_target,
      provenance_witness: fork.upper_bound_audit.least_provenance_hits[0] ?? null,
    }))),
    bounded_unresolved_forks: freeze(boundedUnresolved.map((fork) => freeze({
      source_node_id: fork.source_node_id,
      source_min_depth: fork.source_min_depth,
      classification: 'NO_COMMON_UPPER_BOUND_WITHIN_H4_CONE',
    }))),
    unresolved_source_diagnostic: freeze({
      expected_parent_pure_T_spine_labels: freeze([...pureTSourceLabels]),
      rows: freeze(unresolvedSourceLabels),
      role: 'DIAGNOSTIC_ONLY_SOURCE_IDS_ARE_NOT_USED_TO_PROMOTE_PERMANENT_DIVERGENCE',
    }),
    minimum_cost_hostile: freeze({
      least_minimum_cost_coincidence_count: leastMinimumCoincidences.length,
      unique_least_count: uniqueLeast.length,
      all_unique_least_targets_are_parent_minimum_cost_targets: uniqueLeast.length > 0 && leastMinimumCoincidences.length === uniqueLeast.length,
      anti_equivalence: 'MINIMUM_JOIN_COST_IS_NOT_LEAST_UPPER_BOUND_BY_DEFINITION',
    }),
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged ? 'PARENT_719_720_CUSTODY_UNCHANGED' : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: canonicalClassification,
    bounded_claim: success
      ? 'IN_EACH_AUTHORED_H4_SIBLING_FUTURE_CONE_COMPLETE_K_PERIOD4_STATES_ARE_DEDUPLICATED_INTO_A_FINITE_STRICTLY_FORWARD_REACHABILITY_ORDER_COMMON_UPPER_BOUNDS_ARE_RECONSTRUCTED_ORDER_THEORETICALLY_MINIMAL_AND_LEAST_ELEMENTS_ARE_AUDITED_SEPARATELY_FROM_MINIMUM_CONTINUATION_COST_AND_ANY_UNIQUE_LEAST_COMMON_FUTURE_RETAINS_DISTINCT_T_ROOTED_AND_Q_ROOTED_ROUTE_PROVENANCE_WHILE_FORKS_WITH_NO_H4_COMMON_UPPER_BOUND_REMAIN_BOUNDED_UNRESOLVED'
      : null,
    anti_equivalences: freeze([
      'MINIMUM_COST_COMMON_FUTURE_IS_NOT_LEAST_COMMON_FUTURE_BY_DEFINITION',
      'MINIMAL_COMMON_FUTURE_IS_NOT_LEAST_COMMON_FUTURE',
      'LEAST_COMMON_FUTURE_TARGET_EQUALITY_IS_NOT_ROUTE_IDENTITY',
      'PARTIAL_SIBLING_JOIN_IS_NOT_JOIN_SEMILATTICE',
      'NO_COMMON_UPPER_BOUND_WITHIN_H4_IS_NOT_NO_COMMON_UPPER_BOUND_AT_ANY_HORIZON',
      'BOUNDED_JOIN_IS_NOT_GLOBAL_CONFLUENCE',
    ]),
    claim_ceiling: freeze({
      ambient_td613_join: false,
      join_semilattice: false,
      lattice: false,
      complete_lattice: false,
      domain_theory: false,
      church_rosser: false,
      global_confluence: false,
      permanent_divergence: false,
      inverse_morphisms: false,
      groupoid: false,
      transport_or_connection: false,
      loop_endomorphism: false,
      holonomy: false,
      curvature: false,
      berry_or_quantum: false,
      proto_loom: false,
      a16: false,
      live_ash: false,
      merge: false,
      production: false,
      vercel: false,
    }),
    stop: success
      ? 'HUMAN_𝄐_REQUIRED_BEFORE_ANY_SEMILATTICE_OR_DOMAIN_THEORY_PROMOTION'
      : 'PRESERVE_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
