import { runFinitePathCategoryAudition } from './aperture-pedagogue-finite-path-category-audition.js';
import {
  endpointMass,
  runInvertibilityAdmissibilityObstructionAssay,
} from './aperture-pedagogue-invertibility-admissibility-obstruction.js';

export const DIRECTED_REACHABILITY_GEOMETRY_SCHEMA = 'td613.a15-r0.aperture-pedagogue-directed-reachability-geometry/v0.1';

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const pairKey = (a, b) => `${a}=>${b}`;

function massOfNode(node) {
  return node.state.endpoint.flat().reduce((sum, value) => sum + value, 0);
}

function buildArrowPairIndex(nodes, arrows) {
  const index = new Map();
  for (const source of nodes) {
    for (const target of nodes) index.set(pairKey(source.key, target.key), []);
  }
  for (const arrow of arrows) {
    const key = pairKey(arrow.source_key, arrow.target_key);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(arrow);
  }
  return index;
}

function auditReachabilityPartialOrder(nodes, arrows) {
  const pairIndex = buildArrowPairIndex(nodes, arrows);
  const reachable = (a, b) => (pairIndex.get(pairKey(a, b)) ?? []).length > 0;

  const reflexivity = [];
  const reflexivityFailures = [];
  for (const node of nodes) {
    const row = freeze({ node_id: node.node_id, reachable_to_self: reachable(node.key, node.key) });
    reflexivity.push(row);
    if (!row.reachable_to_self) reflexivityFailures.push(row);
  }

  const antisymmetry = [];
  const antisymmetryFailures = [];
  for (const a of nodes) {
    for (const b of nodes) {
      const ab = reachable(a.key, b.key);
      const ba = reachable(b.key, a.key);
      const equal = a.key === b.key;
      const passed = !(ab && ba) || equal;
      const row = freeze({
        a: a.node_id,
        b: b.node_id,
        a_reaches_b: ab,
        b_reaches_a: ba,
        same_object: equal,
        passed,
      });
      antisymmetry.push(row);
      if (!passed) antisymmetryFailures.push(row);
    }
  }

  const transitivity = [];
  const transitivityFailures = [];
  for (const a of nodes) {
    for (const b of nodes) {
      if (!reachable(a.key, b.key)) continue;
      for (const c of nodes) {
        if (!reachable(b.key, c.key)) continue;
        const ac = reachable(a.key, c.key);
        const row = freeze({ a: a.node_id, b: b.node_id, c: c.node_id, a_reaches_c: ac });
        transitivity.push(row);
        if (!ac) transitivityFailures.push(row);
      }
    }
  }

  const passed = reflexivityFailures.length === 0
    && antisymmetryFailures.length === 0
    && transitivityFailures.length === 0;

  return freeze({
    passed,
    pair_index: pairIndex,
    reflexivity: freeze({ checks: freeze(reflexivity), failures: freeze(reflexivityFailures) }),
    antisymmetry: freeze({ checks: freeze(antisymmetry), failures: freeze(antisymmetryFailures) }),
    transitivity: freeze({ checks: freeze(transitivity), failures: freeze(transitivityFailures) }),
    relation_classification: passed ? 'FINITE_S3_REACHABILITY_IS_A_PARTIAL_ORDER' : 'FINITE_S3_REACHABILITY_PARTIAL_ORDER_AUDITION_FAILED',
  });
}

function auditPathMultiplicity(nodes, arrows) {
  const pairIndex = buildArrowPairIndex(nodes, arrows);
  const rows = [];
  const multiple = [];
  let maximum = 0;

  for (const source of nodes) {
    for (const target of nodes) {
      const members = pairIndex.get(pairKey(source.key, target.key)) ?? [];
      const row = freeze({
        source_node_id: source.node_id,
        target_node_id: target.node_id,
        multiplicity: members.length,
        arrow_ids: freeze(members.map((arrow) => arrow.arrow_id)),
        generator_words: freeze(members.map((arrow) => arrow.generator_word)),
        lengths: freeze(members.map((arrow) => arrow.length)),
      });
      rows.push(row);
      maximum = Math.max(maximum, members.length);
      if (members.length > 1) multiple.push(row);
    }
  }

  return freeze({
    rows: freeze(rows),
    maximum_endpoint_pair_multiplicity: maximum,
    multiple_endpoint_pairs: freeze(multiple),
    multiple_endpoint_pair_count: multiple.length,
    thin: maximum <= 1,
    classification: maximum <= 1
      ? 'FINITE_S3_PATH_CATEGORY_IS_THIN_ON_AUDITED_SLICE'
      : 'FINITE_S3_PATH_CATEGORY_IS_NONTHIN_AND_REACHABILITY_FORGETS_ROUTE_MULTIPLICITY',
  });
}

function auditHeight(nodes, edges, arrows) {
  const roots = nodes.filter((node) => node.min_depth === 0);
  if (roots.length !== 1) {
    return freeze({
      passed: false,
      status: 'UNIQUE_S3_ROOT_NOT_FOUND',
      root_count: roots.length,
    });
  }

  const root = roots[0];
  const rootMass = massOfNode(root);
  const nodeByKey = new Map(nodes.map((node) => [node.key, node]));
  const heightByKey = new Map(nodes.map((node) => [node.key, massOfNode(node) - rootMass]));
  const edgeRows = [];
  const strictFailures = [];
  const unitFailures = [];

  for (const edge of edges) {
    const source = nodeByKey.get(edge.source_key);
    const target = nodeByKey.get(edge.target_key);
    const sourceHeight = heightByKey.get(edge.source_key);
    const targetHeight = heightByKey.get(edge.target_key);
    const delta = targetHeight - sourceHeight;
    const row = freeze({
      edge_id: edge.edge_id,
      generator: edge.generator,
      source_node_id: source.node_id,
      target_node_id: target.node_id,
      source_height: sourceHeight,
      target_height: targetHeight,
      delta_height: delta,
      strictly_positive: delta > 0,
      unit_increment: delta === 1,
    });
    edgeRows.push(row);
    if (!(delta > 0)) strictFailures.push(row);
    if (delta !== 1) unitFailures.push(row);
  }

  const arrowRows = [];
  const arrowGradeFailures = [];
  for (const arrow of arrows) {
    const sourceHeight = heightByKey.get(arrow.source_key);
    const targetHeight = heightByKey.get(arrow.target_key);
    const heightDifference = targetHeight - sourceHeight;
    const row = freeze({
      arrow_id: arrow.arrow_id,
      length: arrow.length,
      source_height: sourceHeight,
      target_height: targetHeight,
      height_difference: heightDifference,
      length_equals_height_difference: arrow.length === heightDifference,
    });
    arrowRows.push(row);
    if (arrow.length !== heightDifference) arrowGradeFailures.push(row);
  }

  const strictMonotone = strictFailures.length === 0;
  const unitEdges = unitFailures.length === 0;
  const allArrowsGradeByLength = arrowGradeFailures.length === 0;
  const unitGraded = strictMonotone && unitEdges && allArrowsGradeByLength;

  return freeze({
    passed: strictMonotone,
    root_node_id: root.node_id,
    root_key: root.key,
    root_mass: rootMass,
    node_heights: freeze(nodes.map((node) => freeze({
      node_id: node.node_id,
      mass: massOfNode(node),
      height: heightByKey.get(node.key),
    }))),
    edge_audit: freeze({
      rows: freeze(edgeRows),
      strict_failures: freeze(strictFailures),
      unit_failures: freeze(unitFailures),
    }),
    arrow_audit: freeze({
      rows: freeze(arrowRows),
      grade_failures: freeze(arrowGradeFailures),
    }),
    strict_monotone_height: strictMonotone,
    every_generator_edge_unit_increment: unitEdges,
    every_arrow_length_equals_height_difference: allArrowsGradeByLength,
    unit_graded: unitGraded,
    classification: unitGraded
      ? 'FINITE_S3_UNIT_GRADED_BY_ENDPOINT_MASS_DIFFERENCE'
      : strictMonotone
        ? 'STRICT_MONOTONE_HEIGHT_ON_S3_WITHOUT_UNIT_GRADING_PROMOTION'
        : 'S3_HEIGHT_AUDITION_FAILED',
    height_by_key: heightByKey,
  });
}

function auditSameHeightAntichain(nodes, reachability, heightAudit) {
  if (!heightAudit.passed) return freeze({ passed: false, witness: null, classification: 'HEIGHT_AUDIT_NOT_AVAILABLE' });
  const rows = [];
  const witnesses = [];
  const pairIndex = reachability.pair_index;
  const reachable = (a, b) => (pairIndex.get(pairKey(a, b)) ?? []).length > 0;

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const ha = heightAudit.height_by_key.get(a.key);
      const hb = heightAudit.height_by_key.get(b.key);
      if (ha !== hb) continue;
      const ab = reachable(a.key, b.key);
      const ba = reachable(b.key, a.key);
      const row = freeze({
        a: a.node_id,
        b: b.node_id,
        height: ha,
        a_reaches_b: ab,
        b_reaches_a: ba,
        incomparable: !ab && !ba,
      });
      rows.push(row);
      if (row.incomparable) witnesses.push(row);
    }
  }

  return freeze({
    passed: rows.every((row) => row.incomparable),
    same_height_distinct_pair_count: rows.length,
    rows: freeze(rows),
    witnesses: freeze(witnesses),
    witness: witnesses[0] ?? null,
    classification: witnesses.length > 0
      ? 'SAME_HEIGHT_DISTINCT_OBJECTS_FORM_A_DIRECTED_ANTICHAIN_WITNESS'
      : 'NO_SAME_HEIGHT_DISTINCT_PAIR_IN_S3',
  });
}

function buildDirectedDistance(nodes, arrows) {
  const distances = new Map();
  for (const a of nodes) {
    for (const b of nodes) distances.set(pairKey(a.key, b.key), Number.POSITIVE_INFINITY);
  }
  for (const arrow of arrows) {
    const key = pairKey(arrow.source_key, arrow.target_key);
    distances.set(key, Math.min(distances.get(key), arrow.length));
  }
  return distances;
}

function auditDirectedDistance(nodes, arrows) {
  const distances = buildDirectedDistance(nodes, arrows);
  const zeroChecks = [];
  const zeroFailures = [];
  for (const node of nodes) {
    const distance = distances.get(pairKey(node.key, node.key));
    const row = freeze({ node_id: node.node_id, distance, passed: distance === 0 });
    zeroChecks.push(row);
    if (!row.passed) zeroFailures.push(row);
  }

  const finiteRows = [];
  const finiteFailures = [];
  for (const a of nodes) {
    for (const b of nodes) {
      const distance = distances.get(pairKey(a.key, b.key));
      if (!Number.isFinite(distance)) continue;
      const passed = Number.isInteger(distance) && distance >= 0;
      const row = freeze({ a: a.node_id, b: b.node_id, distance, passed });
      finiteRows.push(row);
      if (!passed) finiteFailures.push(row);
    }
  }

  const triangleChecks = [];
  const triangleFailures = [];
  for (const a of nodes) {
    for (const b of nodes) {
      for (const c of nodes) {
        const ab = distances.get(pairKey(a.key, b.key));
        const bc = distances.get(pairKey(b.key, c.key));
        const ac = distances.get(pairKey(a.key, c.key));
        const rhs = ab + bc;
        const passed = ac <= rhs;
        const row = freeze({
          a: a.node_id,
          b: b.node_id,
          c: c.node_id,
          d_ab: Number.isFinite(ab) ? ab : 'INFINITY',
          d_bc: Number.isFinite(bc) ? bc : 'INFINITY',
          d_ac: Number.isFinite(ac) ? ac : 'INFINITY',
          passed,
        });
        triangleChecks.push(row);
        if (!passed) triangleFailures.push(row);
      }
    }
  }

  const asymmetryRows = [];
  for (const a of nodes) {
    for (const b of nodes) {
      if (a.key === b.key) continue;
      const ab = distances.get(pairKey(a.key, b.key));
      const ba = distances.get(pairKey(b.key, a.key));
      if (Number.isFinite(ab) && !Number.isFinite(ba)) {
        asymmetryRows.push(freeze({ a: a.node_id, b: b.node_id, d_ab: ab, d_ba: 'INFINITY' }));
      }
    }
  }

  const passed = zeroFailures.length === 0 && finiteFailures.length === 0 && triangleFailures.length === 0;
  return freeze({
    passed,
    distances,
    zero_law: freeze({ checks: freeze(zeroChecks), failures: freeze(zeroFailures) }),
    finite_distance_audit: freeze({ checks: freeze(finiteRows), failures: freeze(finiteFailures) }),
    triangle_inequality: freeze({ checks: freeze(triangleChecks), failures: freeze(triangleFailures) }),
    asymmetry_witnesses: freeze(asymmetryRows),
    asymmetry_witness: asymmetryRows[0] ?? null,
    classification: passed
      ? 'FINITE_S3_EXTENDED_DIRECTED_SHORTEST_PATH_QUASIMETRIC'
      : 'DIRECTED_SHORTEST_PATH_QUASIMETRIC_AUDITION_FAILED',
    asymmetry_classification: asymmetryRows.length > 0
      ? 'DIRECTED_DISTANCE_ASYMMETRY_WITNESSED'
      : 'NO_DIRECTED_DISTANCE_ASYMMETRY_WITNESS_IN_S3',
  });
}

function auditDistanceInformationLoss(pathMultiplicity, directedDistance, nodes) {
  const rows = [];
  const equalMinimumWitnesses = [];
  const differingLengthWitnesses = [];

  for (const pair of pathMultiplicity.multiple_endpoint_pairs) {
    const source = nodes.find((node) => node.node_id === pair.source_node_id);
    const target = nodes.find((node) => node.node_id === pair.target_node_id);
    const minimum = directedDistance.distances.get(pairKey(source.key, target.key));
    const minimumCount = pair.lengths.filter((length) => length === minimum).length;
    const distinctLengths = [...new Set(pair.lengths)];
    const row = freeze({
      source_node_id: pair.source_node_id,
      target_node_id: pair.target_node_id,
      multiplicity: pair.multiplicity,
      lengths: pair.lengths,
      minimum_length: minimum,
      minimum_length_arrow_count: minimumCount,
      distinct_length_count: distinctLengths.length,
    });
    rows.push(row);
    if (minimumCount > 1) equalMinimumWitnesses.push(row);
    if (distinctLengths.length > 1) differingLengthWitnesses.push(row);
  }

  let classification = 'PATH_CATEGORY_THIN_DISTANCE_ROUTE_COLLAPSE_HOSTILE_NOT_INSTANTIATED';
  if (equalMinimumWitnesses.length > 0) classification = 'DIRECTED_DISTANCE_FORGETS_ROUTE_IDENTITY';
  else if (differingLengthWitnesses.length > 0) classification = 'DIRECTED_DISTANCE_RETAINS_ONLY_MINIMUM_LENGTH_NOT_PATH_SET';
  else if (rows.length > 0) classification = 'REACHABILITY_FORGETS_ROUTE_MULTIPLICITY_WITHOUT_DISTANCE_LENGTH_DIVERGENCE';

  return freeze({
    rows: freeze(rows),
    equal_minimum_witnesses: freeze(equalMinimumWitnesses),
    differing_length_witnesses: freeze(differingLengthWitnesses),
    classification,
  });
}

function auditRootProfile(nodes, reachability, heightAudit, directedDistance) {
  const root = nodes.find((node) => node.key === heightAudit.root_key);
  if (!root) return freeze({ passed: false, status: 'ROOT_NODE_NOT_AVAILABLE' });
  const pairIndex = reachability.pair_index;
  const reachable = (a, b) => (pairIndex.get(pairKey(a, b)) ?? []).length > 0;
  const rows = nodes.map((node) => {
    const isReachable = reachable(root.key, node.key);
    const distance = directedDistance.distances.get(pairKey(root.key, node.key));
    const height = heightAudit.height_by_key.get(node.key);
    return freeze({
      node_id: node.node_id,
      reachable: isReachable,
      height,
      directed_distance: Number.isFinite(distance) ? distance : 'INFINITY',
      distance_equals_height: Number.isFinite(distance) && distance === height,
    });
  });

  const histogramMap = new Map();
  for (const row of rows) histogramMap.set(row.height, (histogramMap.get(row.height) ?? 0) + 1);
  const histogram = freeze([...histogramMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([height, count]) => freeze({ height, count })));
  const unitGradeCompatibility = heightAudit.unit_graded
    ? rows.every((row) => row.reachable && row.distance_equals_height)
    : null;

  return freeze({
    passed: rows.some((row) => row.node_id === root.node_id && row.directed_distance === 0),
    root_node_id: root.node_id,
    reachable_object_count: rows.filter((row) => row.reachable).length,
    unreachable_object_count: rows.filter((row) => !row.reachable).length,
    rows: freeze(rows),
    height_histogram: histogram,
    unit_grade_root_distance_compatibility: unitGradeCompatibility,
  });
}

export function runDirectedReachabilityGeometryAssay() {
  const category = runFinitePathCategoryAudition();
  const obstruction = runInvertibilityAdmissibilityObstructionAssay();
  if (!category?.passed || !obstruction?.passed) {
    return freeze({
      schema: DIRECTED_REACHABILITY_GEOMETRY_SCHEMA,
      passed: false,
      status: 'PARENT_DIRECTED_STRUCTURE_NOT_WITNESSED_BY_EXECUTABLE',
      disposition: 'ABSTAIN_BEFORE_DIRECTED_REACHABILITY_GEOMETRY',
    });
  }

  const categoryBefore = JSON.stringify(category);
  const obstructionBefore = JSON.stringify(obstruction);
  const nodes = category.finite_slice.nodes;
  const edges = category.finite_slice.edges;
  const arrows = category.arrows;

  const reachability = auditReachabilityPartialOrder(nodes, arrows);
  const pathMultiplicity = auditPathMultiplicity(nodes, arrows);
  const height = auditHeight(nodes, edges, arrows);
  const sameHeightAntichain = auditSameHeightAntichain(nodes, reachability, height);
  const directedDistance = auditDirectedDistance(nodes, arrows);
  const distanceInformationLoss = auditDistanceInformationLoss(pathMultiplicity, directedDistance, nodes);
  const rootProfile = auditRootProfile(nodes, reachability, height, directedDistance);

  const categoryAfter = JSON.stringify(runFinitePathCategoryAudition());
  const obstructionAfter = JSON.stringify(runInvertibilityAdmissibilityObstructionAssay());
  const parentCustodyUnchanged = categoryBefore === categoryAfter && obstructionBefore === obstructionAfter;

  const success = (
    reachability.passed
    && height.passed
    && directedDistance.passed
    && directedDistance.asymmetry_witness !== null
    && sameHeightAntichain.passed
    && rootProfile.passed
    && parentCustodyUnchanged
  );

  const suffixes = [];
  if (height.unit_graded) suffixes.push('UNIT_GRADED');
  if (!pathMultiplicity.thin) suffixes.push('NONTHIN_PATH_MULTIPLICITY');
  if (sameHeightAntichain.witness) suffixes.push('SAME_HEIGHT_ANTICHAIN');
  if (distanceInformationLoss.classification === 'DIRECTED_DISTANCE_FORGETS_ROUTE_IDENTITY') suffixes.push('DIRECTED_DISTANCE_ROUTE_COLLAPSE');

  const canonical = success
    ? `FINITE_S3_DIRECTED_REACHABILITY_PARTIAL_ORDER_WITH_STRICT_MONOTONE_HEIGHT_AND_EXTENDED_SHORTEST_PATH_QUASIMETRIC${suffixes.length ? `_${suffixes.join('_')}` : ''}`
    : null;

  return freeze({
    schema: DIRECTED_REACHABILITY_GEOMETRY_SCHEMA,
    passed: success,
    status: success ? 'DIRECTED_REACHABILITY_GEOMETRY_ROUND_CLOSED' : 'DIRECTED_REACHABILITY_GEOMETRY_AUDITION_FAILED',
    slice_id: category.slice_id,
    object_count: nodes.length,
    arrow_count: arrows.length,
    generator_edge_count: edges.length,
    reachability,
    path_multiplicity: pathMultiplicity,
    height,
    same_height_antichain: sameHeightAntichain,
    directed_distance: directedDistance,
    distance_information_loss: distanceInformationLoss,
    root_profile: rootProfile,
    parent_custody_unchanged: parentCustodyUnchanged,
    parent_custody_classification: parentCustodyUnchanged ? 'PARENT_717_718_CUSTODY_UNCHANGED' : 'PARENT_CUSTODY_MUTATION_DETECTED',
    canonical_classification: canonical,
    bounded_claim: success
      ? 'IN_THE_AUTHORED_FINITE_S3_SLICE_EXISTENCE_OF_A_DIRECTED_PATH_DEFINES_A_PARTIAL_ORDER_ON_OPERATIONAL_OBJECTS_ENDPOINT_MASS_DIFFERENCE_SUPPLIES_A_STRICT_MONOTONE_HEIGHT_THE_INTERNAL_DIRECTED_SHORTEST_PATH_LENGTHS_SATISFY_ZERO_AND_TRIANGLE_LAWS_WITH_AN_ASYMMETRY_WITNESS_AND_EQUAL_HEIGHT_DISTINCT_OBJECTS_WHEN_PRESENT_ARE_INCOMPARABLE_WHILE_PATH_MULTIPLICITY_IS_AUDITED_SEPARATELY_FROM_REACHABILITY_AND_DISTANCE'
      : null,
    anti_equivalences: freeze([
      'PATH_IDENTITY_IS_NOT_ENDPOINT_REACHABILITY',
      'REACHABILITY_EQUALITY_IS_NOT_ROUTE_EQUALITY',
      'DIRECTED_DISTANCE_EQUALITY_IS_NOT_ROUTE_EQUALITY',
      'SAME_HEIGHT_IS_NOT_SAME_OPERATIONAL_OBJECT',
      'SAME_HEIGHT_IS_NOT_MUTUAL_REACHABILITY',
      'PARTIAL_ORDER_IS_NOT_THIN_PATH_CATEGORY',
      'DIRECTED_QUASIMETRIC_IS_NOT_SYMMETRIC_METRIC',
    ]),
    claim_ceiling: freeze({
      ambient_td613_partial_order: false,
      causal_set_theorem: false,
      generic_poset_representation: false,
      generic_lyapunov: false,
      symmetric_metric_geometry: false,
      riemannian_or_finsler_geometry: false,
      lawvere_enriched_category_promotion: false,
      groupoid: false,
      inverse_semantics: false,
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
      ? 'HUMAN_𝄐_QUALIFIED_FOR_DIRECTED_BRANCHING_AND_CONFLUENCE_AUDITION'
      : 'PRESERVE_FAILURE_AND_RETURN_TO_HUMAN_𝄐',
  });
}
