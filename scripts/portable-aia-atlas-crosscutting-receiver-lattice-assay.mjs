import {
  HOLONOMY_LOOM_ADVISORY_ROUTE_MODES,
  HOLONOMY_LOOM_ADVISORY_RULES
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import {
  atlasPortableRouteKey,
  atlasPortableRouteQuotient,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';

export const PORTABLE_AIA_ATLAS_CROSSCUTTING_RECEIVER_LATTICE_ASSAY_SCHEMA =
  'td613.portable-aia.atlas-crosscutting-receiver-lattice-assay/v0.1-local-only';

export const PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS = Object.freeze(Object.keys(HOLONOMY_LOOM_ADVISORY_RULES));
export const PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES = Object.freeze([...HOLONOMY_LOOM_ADVISORY_ROUTE_MODES]);

export const HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX = Object.freeze([
  Object.freeze([3, 0, 0]),
  Object.freeze([3, 0, 0]),
  Object.freeze([1, 2, 0]),
  Object.freeze([0, 3, 0]),
  Object.freeze([0, 2, 1]),
  Object.freeze([0, 0, 3]),
  Object.freeze([0, 0, 3])
]);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
}

export function canonicalReceiverLatticeJson(value) {
  return JSON.stringify(stable(value));
}

function canonicalPointId(ruleId, routeMode) {
  return `${ruleId}::${routeMode}`;
}

function buildCanonicalDomain() {
  const points = [];
  for (const ruleId of PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS) {
    for (const routeMode of PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES) {
      const projection = compilePortableAiaProjection({ ruleId, routeMode });
      points.push(Object.freeze({
        id: canonicalPointId(ruleId, routeMode),
        rule_id: ruleId,
        route_mode: routeMode,
        policy_key: atlasPortableRouteKey(projection, 'POLICY_ONLY'),
        boundary_key: atlasPortableRouteKey(projection, 'BOUNDARY_AWARE'),
        projection
      }));
    }
  }
  return Object.freeze(points);
}

function partition(points, keyName) {
  const classes = new Map();
  for (const point of points) {
    const key = point[keyName];
    if (!classes.has(key)) classes.set(key, []);
    classes.get(key).push(point.id);
  }
  return Object.freeze([...classes.entries()].map(([key, members]) => Object.freeze({
    key,
    members: Object.freeze([...members].sort())
  })).sort((a, b) => a.key.localeCompare(b.key)));
}

function classSizeSpectrum(classes) {
  const counts = new Map();
  for (const entry of classes) counts.set(entry.members.length, (counts.get(entry.members.length) || 0) + 1);
  return Object.freeze(Object.fromEntries([...counts.entries()].sort((a, b) => Number(a[0]) - Number(b[0]))));
}

function assertUniform(classes, expectedClassCount, expectedSize, label) {
  if (classes.length !== expectedClassCount) {
    throw new Error(`${label} class count drifted: ${classes.length}`);
  }
  if (!classes.every(entry => entry.members.length === expectedSize)) {
    throw new Error(`${label} block-size profile drifted`);
  }
}

function equivalence(points, leftIndex, rightIndex, keyName) {
  return points[leftIndex][keyName] === points[rightIndex][keyName];
}

function explicitIncomparabilityWitnesses(points) {
  const firstRule = PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS[0];
  const secondRule = PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS[1];
  const firstRoute = PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES[0];
  const secondRoute = PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES[1];
  const byId = new Map(points.map(point => [point.id, point]));

  const sameRuleDifferentRoute = Object.freeze({
    left: byId.get(canonicalPointId(firstRule, firstRoute)),
    right: byId.get(canonicalPointId(firstRule, secondRoute))
  });
  const sameRouteDifferentRule = Object.freeze({
    left: byId.get(canonicalPointId(firstRule, firstRoute)),
    right: byId.get(canonicalPointId(secondRule, firstRoute))
  });

  if (!sameRuleDifferentRoute.left || !sameRuleDifferentRoute.right ||
      !sameRouteDifferentRule.left || !sameRouteDifferentRule.right) {
    throw new Error('incomparability witness points missing from canonical domain');
  }

  if (sameRuleDifferentRoute.left.policy_key !== sameRuleDifferentRoute.right.policy_key ||
      sameRuleDifferentRoute.left.boundary_key === sameRuleDifferentRoute.right.boundary_key) {
    throw new Error('same-rule/different-route witness failed to separate boundary receiver');
  }
  if (sameRouteDifferentRule.left.boundary_key !== sameRouteDifferentRule.right.boundary_key ||
      sameRouteDifferentRule.left.policy_key === sameRouteDifferentRule.right.policy_key) {
    throw new Error('same-route/different-rule witness failed to separate policy receiver');
  }

  return Object.freeze({
    policy_not_refines_boundary: Object.freeze({
      left: sameRuleDifferentRoute.left.id,
      right: sameRuleDifferentRoute.right.id,
      policy_equivalent: true,
      boundary_equivalent: false
    }),
    boundary_not_refines_policy: Object.freeze({
      left: sameRouteDifferentRule.left.id,
      right: sameRouteDifferentRule.right.id,
      boundary_equivalent: true,
      policy_equivalent: false
    })
  });
}

function intersectionTable(policyClasses, boundaryClasses) {
  const rows = [];
  for (const pClass of policyClasses) {
    const pMembers = new Set(pClass.members);
    const cells = [];
    for (const bClass of boundaryClasses) {
      const members = bClass.members.filter(id => pMembers.has(id));
      cells.push(Object.freeze({
        policy_key: pClass.key,
        boundary_key: bClass.key,
        size: members.length,
        members: Object.freeze([...members])
      }));
    }
    rows.push(Object.freeze(cells));
  }
  return Object.freeze(rows);
}

class UnionFind {
  constructor(size) {
    this.parent = Array.from({ length:size }, (_, index) => index);
    this.rank = Array(size).fill(0);
  }
  find(x) {
    let cursor = x;
    while (this.parent[cursor] !== cursor) {
      this.parent[cursor] = this.parent[this.parent[cursor]];
      cursor = this.parent[cursor];
    }
    return cursor;
  }
  union(a, b) {
    let ra = this.find(a);
    let rb = this.find(b);
    if (ra === rb) return;
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra] += 1;
  }
}

function generatedJoin(points) {
  const uf = new UnionFind(points.length);
  let policyEdges = 0;
  let boundaryEdges = 0;
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      if (points[i].policy_key === points[j].policy_key) {
        uf.union(i, j);
        policyEdges += 1;
      }
      if (points[i].boundary_key === points[j].boundary_key) {
        uf.union(i, j);
        boundaryEdges += 1;
      }
    }
  }
  const classes = new Map();
  points.forEach((point, index) => {
    const root = uf.find(index);
    if (!classes.has(root)) classes.set(root, []);
    classes.get(root).push(point.id);
  });
  return Object.freeze({
    class_count: classes.size,
    classes: Object.freeze([...classes.values()].map(members => Object.freeze([...members].sort()))),
    policy_union_edges: policyEdges,
    boundary_union_edges: boundaryEdges
  });
}

function orderedPairCensus(points) {
  let policyEquivalent = 0;
  let boundaryEquivalent = 0;
  let meetEquivalent = 0;
  let distinctPairKeys = new Set();
  for (let i = 0; i < points.length; i += 1) {
    distinctPairKeys.add(`${points[i].policy_key}\u241f${points[i].boundary_key}`);
    for (let j = 0; j < points.length; j += 1) {
      const p = equivalence(points, i, j, 'policy_key');
      const b = equivalence(points, i, j, 'boundary_key');
      if (p) policyEquivalent += 1;
      if (b) boundaryEquivalent += 1;
      if (p && b) meetEquivalent += 1;
    }
  }
  return Object.freeze({
    ordered_pair_controls: points.length * points.length,
    policy_equivalent_ordered_pairs: policyEquivalent,
    boundary_equivalent_ordered_pairs: boundaryEquivalent,
    meet_equivalent_ordered_pairs: meetEquivalent,
    paired_existing_receiver_key_count: distinctPairKeys.size
  });
}

function hostileMarginalControl() {
  const rowSums = HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX.map(row => row.reduce((sum, value) => sum + value, 0));
  const columnSums = [0, 1, 2].map(column => HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX.reduce((sum, row) => sum + row[column], 0));
  const nonempty = HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX.flat().filter(value => value > 0).length;
  const maximum = Math.max(...HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX.flat());
  if (!rowSums.every(value => value === 3)) throw new Error('hostile marginal control row sums drifted');
  if (!columnSums.every(value => value === 7)) throw new Error('hostile marginal control column sums drifted');
  if (nonempty === 21 || maximum <= 1) throw new Error('hostile marginal control accidentally became discrete');
  return Object.freeze({
    matrix: HOSTILE_SAME_MARGINAL_INTERSECTION_MATRIX,
    row_sums: Object.freeze(rowSums),
    column_sums: Object.freeze(columnSums),
    nonempty_intersections: nonempty,
    maximum_intersection_size: maximum,
    same_uniform_marginals_as_canonical: true,
    discrete_meet: false
  });
}

export function runPortableAiaAtlasCrosscuttingReceiverLatticeAssay() {
  const points = buildCanonicalDomain();
  const ids = points.map(point => point.id);
  if (PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS.length !== 7) throw new Error('canonical Loom rule count drifted from preregistered 7');
  if (PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES.length !== 3) throw new Error('canonical route count drifted from preregistered 3');
  if (points.length !== 21 || new Set(ids).size !== 21) throw new Error('canonical policy×route domain is not exactly 21 unique projections');

  const policyClasses = partition(points, 'policy_key');
  const boundaryClasses = partition(points, 'boundary_key');
  assertUniform(policyClasses, 7, 3, 'POLICY_ONLY');
  assertUniform(boundaryClasses, 3, 7, 'BOUNDARY_AWARE');

  const policyQuotient = atlasPortableRouteQuotient(points.map(point => point.projection), 'POLICY_ONLY');
  const boundaryQuotient = atlasPortableRouteQuotient(points.map(point => point.projection), 'BOUNDARY_AWARE');
  if (policyQuotient.class_count !== 7 || boundaryQuotient.class_count !== 3) {
    throw new Error('existing Atlas quotient API disagrees with direct partition derivation');
  }
  if (policyQuotient.route_label_used_in_key || policyQuotient.presentation_used_in_key || policyQuotient.raw_source_used_in_key ||
      boundaryQuotient.route_label_used_in_key || boundaryQuotient.presentation_used_in_key || boundaryQuotient.raw_source_used_in_key) {
    throw new Error('existing receiver quotient reports forbidden key material');
  }

  const witnesses = explicitIncomparabilityWitnesses(points);
  const intersections = intersectionTable(policyClasses, boundaryClasses);
  const flatIntersections = intersections.flat();
  const singletonIntersections = flatIntersections.filter(cell => cell.size === 1);
  if (flatIntersections.length !== 21 || singletonIntersections.length !== 21) {
    throw new Error(`canonical receiver meet is not discrete: ${singletonIntersections.length}/21 singleton intersections`);
  }
  const intersectionMembers = flatIntersections.flatMap(cell => cell.members);
  if (new Set(intersectionMembers).size !== 21 || intersectionMembers.length !== 21) {
    throw new Error('policy×boundary singleton intersections do not cover the canonical domain exactly once');
  }

  const census = orderedPairCensus(points);
  if (census.ordered_pair_controls !== 441) throw new Error('ordered pair census drifted');
  if (census.policy_equivalent_ordered_pairs !== 63) throw new Error(`policy equivalence census drifted: ${census.policy_equivalent_ordered_pairs}`);
  if (census.boundary_equivalent_ordered_pairs !== 147) throw new Error(`boundary equivalence census drifted: ${census.boundary_equivalent_ordered_pairs}`);
  if (census.meet_equivalent_ordered_pairs !== 21) throw new Error(`meet equivalence census drifted: ${census.meet_equivalent_ordered_pairs}`);
  if (census.paired_existing_receiver_key_count !== 21) throw new Error('paired existing receiver keys are not injective on canonical domain');

  const join = generatedJoin(points);
  if (join.class_count !== 1 || join.classes[0]?.length !== 21) {
    throw new Error(`generated receiver join is not universal: ${join.class_count} classes`);
  }

  const hostile = hostileMarginalControl();

  const marginalArithmetic = Object.freeze({
    policy_block_count: 7,
    policy_block_size: 3,
    boundary_block_count: 3,
    boundary_block_size: 7,
    universe_size: 21,
    gcd_block_sizes: 1,
    lcm_block_sizes: 21,
    incomparability_forced_by_uniform_block_sizes: true,
    universal_join_forced_by_coprime_uniform_block_sizes: true,
    discrete_meet_forced_by_marginals: false
  });

  return Object.freeze({
    schema: PORTABLE_AIA_ATLAS_CROSSCUTTING_RECEIVER_LATTICE_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    domain: Object.freeze({
      rule_ids: PORTABLE_AIA_ATLAS_CROSSCUTTING_RULE_IDS,
      route_modes: PORTABLE_AIA_ATLAS_CROSSCUTTING_ROUTE_MODES,
      canonical_projection_count: points.length,
      point_ids: Object.freeze([...ids])
    }),
    policy_partition: Object.freeze({
      class_count: policyClasses.length,
      class_size_spectrum: classSizeSpectrum(policyClasses),
      classes: policyClasses
    }),
    boundary_partition: Object.freeze({
      class_count: boundaryClasses.length,
      class_size_spectrum: classSizeSpectrum(boundaryClasses),
      classes: boundaryClasses
    }),
    incomparability: Object.freeze({
      policy_refines_boundary: false,
      boundary_refines_policy: false,
      witnesses
    }),
    meet: Object.freeze({
      class_count: 21,
      singleton_class_count: singletonIntersections.length,
      intersection_table: intersections,
      paired_existing_receiver_keys_injective: census.paired_existing_receiver_key_count === 21
    }),
    join,
    ordered_pair_census: census,
    marginal_arithmetic: marginalArithmetic,
    hostile_same_marginal_countercontrol: hostile,
    generated_sublattice: Object.freeze({
      element_count: 4,
      elements: Object.freeze(['DISCRETE_21', 'POLICY_ONLY', 'BOUNDARY_AWARE', 'UNIVERSAL_21']),
      order_isomorphic_to_B2: true,
      full_partition_lattice_classified: false
    }),
    existing_receiver_code_modified: false,
    new_production_receiver_added: false,
    route_label_injected_as_key: false,
    presentation_injected_as_key: false,
    raw_source_used: false,
    statistical_independence_claimed: false,
    shannon_claimed: false,
    causal_independence_claimed: false,
    physical_orthogonality_claimed: false,
    external_truth_claimed: false,
    counts_as_exogenous_witness: false,
    golden_egg_credit: 0,
    authority: Object.freeze({
      release_authority: false,
      provider_call_performed: false,
      production_mutation: false,
      human_closure_required: true
    }),
    claim_ceiling: 'exact-current-7x3-portable-aia-two-receiver-generated-partition-sublattice-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runPortableAiaAtlasCrosscuttingReceiverLatticeAssay(), null, 2)}\n`);
}
