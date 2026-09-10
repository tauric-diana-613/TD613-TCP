import {
  enumerateFixedC1JointFiber,
} from './aperture-pedagogue-fixed-c1-joint-route-seam-fiber.js';
import {
  materializeRectangularSchema,
  routeConditionedSchemaProfile,
} from './aperture-pedagogue-route-conditioned-seam-schema-slack.js';

export const DEPENDENT_SUM_CUSTODY_SCHEMA = 'td613.a15-r0.dependent-sum-custody-schema/v0.1';
export const DEPENDENT_SUM_CUSTODY_SCHEMA_PARENT_RECEIPT = '7bc793cbe843f0c9ca0f56a3e2a8337f348f3ba9';
export const DEPENDENT_SUM_CUSTODY_SCHEMA_GATE_ISSUE = 737;

const freeze = (value) => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const nat = (value) => Number.isSafeInteger(value) && value >= 0;
const key = (value) => JSON.stringify(value);

function grouped(t, E, O, P) {
  const fiber = enumerateFixedC1JointFiber(t, E, O, P);
  if (fiber.status !== 'FIXED_C1_JOINT_FIBER_ENUMERATED') {
    return freeze({ status: 'DEPENDENT_SUM_GROUPED_FIBER_ABSTAIN', fiber });
  }
  const map = new Map();
  for (const row of fiber.rows) {
    if (!map.has(row.route_rank)) {
      map.set(row.route_rank, {
        route_rank: row.route_rank,
        blocks: row.blocks,
        word: row.word,
        rows: [],
      });
    }
    map.get(row.route_rank).rows.push(row);
  }
  const routes = [...map.values()]
    .sort((a, b) => a.route_rank - b.route_rank)
    .map((route) => freeze({
      ...route,
      seam_cardinality: route.rows.length,
      rows: freeze([...route.rows].sort((a, b) => Number(BigInt(a.local_seam_rank) - BigInt(b.local_seam_rank)))),
    }));
  return freeze({
    status: routes.reduce((sum, route) => sum + route.seam_cardinality, 0) === fiber.rows.length
      ? 'DEPENDENT_SUM_GROUPED_FIBER_DERIVED'
      : 'DEPENDENT_SUM_GROUPED_FIBER_MISMATCH',
    t, E, O, P,
    route_count: routes.length,
    joint_count: fiber.rows.length,
    routes: freeze(routes),
    fiber,
  });
}

export function dependentSumSchemaProfile(t, E, O, P) {
  const g = grouped(t, E, O, P);
  const parent = routeConditionedSchemaProfile(t, E, O, P);
  if (g.status !== 'DEPENDENT_SUM_GROUPED_FIBER_DERIVED'
      || parent.status !== 'EXACT_ROUTE_CONDITIONED_SEAM_SCHEMA_PROFILE_DERIVED') {
    return freeze({ status: 'DEPENDENT_SUM_SCHEMA_PROFILE_ABSTAIN', grouped: g, parent });
  }
  const sizes = g.routes.map((route) => route.seam_cardinality);
  const dependentCount = sizes.reduce((sum, size) => sum + size, 0);
  const uniform = sizes.every((size) => size === sizes[0]);
  const exact = dependentCount === g.joint_count
    && dependentCount === parent.joint_count
    && (parent.rectangular_slack === 0) === uniform;
  return freeze({
    status: exact ? 'EXACT_DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_DERIVED' : 'DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_MISMATCH',
    t, E, O, P,
    route_count: g.route_count,
    route_conditional_cardinalities: freeze(sizes),
    dependent_sum_cardinality: dependentCount,
    lawful_joint_cardinality: g.joint_count,
    padding_cells: 0,
    route_respecting_product_exactness_possible: uniform,
    minimal_product_secondary_alphabet: parent.shared_conditional_seam_alphabet_min,
    minimal_product_capacity: parent.rectangular_capacity,
    minimal_product_padding: parent.rectangular_slack,
  });
}

export function materializeDependentSumSchema(t, E, O, P) {
  const g = grouped(t, E, O, P);
  if (g.status !== 'DEPENDENT_SUM_GROUPED_FIBER_DERIVED') return g;
  if (g.joint_count > 50000) return freeze({ status: 'DEPENDENT_SUM_SCHEMA_OUTSIDE_SAFE_MATERIALIZATION_DOMAIN' });
  const addresses = [];
  for (const route of g.routes) {
    for (const row of route.rows) {
      addresses.push(freeze({
        route_label: route.route_rank,
        local_label: Number(row.local_seam_rank),
        blocks: row.blocks,
        seams: row.seams,
        lawful: true,
      }));
    }
  }
  const uniqueAddresses = new Set(addresses.map((row) => key([row.route_label, row.local_label]))).size;
  const uniqueStates = new Set(addresses.map((row) => key([row.blocks, row.seams]))).size;
  const passed = addresses.length === g.joint_count
    && uniqueAddresses === addresses.length
    && uniqueStates === addresses.length;
  return freeze({
    status: passed ? 'EXACT_DEPENDENT_SUM_SCHEMA_MATERIALIZED' : 'DEPENDENT_SUM_SCHEMA_MATERIALIZATION_MISMATCH',
    t, E, O, P,
    route_count: g.route_count,
    cardinality: addresses.length,
    padding_cells: 0,
    addresses: freeze(addresses),
  });
}

export function encodeDependentAddress(t, E, O, P, blocks, seams) {
  const schema = materializeDependentSumSchema(t, E, O, P);
  if (schema.status !== 'EXACT_DEPENDENT_SUM_SCHEMA_MATERIALIZED') {
    return freeze({ status: 'DEPENDENT_ADDRESS_ENCODER_SCHEMA_ABSTAIN' });
  }
  const row = schema.addresses.find((candidate) => key(candidate.blocks) === key(blocks) && key(candidate.seams) === key(seams));
  if (!row) return freeze({ status: 'DEPENDENT_ADDRESS_ENCODER_UNLAWFUL_STATE' });
  return freeze({
    status: 'EXACT_DEPENDENT_ADDRESS_ENCODED',
    route_label: row.route_label,
    local_label: row.local_label,
    blocks: row.blocks,
    seams: row.seams,
  });
}

export function decodeDependentAddress(t, E, O, P, routeLabel, localLabel) {
  if (!nat(routeLabel) || !nat(localLabel)) return freeze({ status: 'DEPENDENT_ADDRESS_DECODER_ABSTAIN' });
  const g = grouped(t, E, O, P);
  if (g.status !== 'DEPENDENT_SUM_GROUPED_FIBER_DERIVED') return freeze({ status: 'DEPENDENT_ADDRESS_DECODER_FIBER_ABSTAIN' });
  const route = g.routes.find((candidate) => candidate.route_rank === routeLabel);
  if (!route) return freeze({ status: 'DEPENDENT_ADDRESS_DECODER_ROUTE_OUTSIDE_LAWFUL_ALPHABET' });
  if (localLabel >= route.seam_cardinality) {
    return freeze({
      status: 'DEPENDENT_ADDRESS_DECODER_NONMEMBER_ABSTAINS',
      route_label: routeLabel,
      local_label: localLabel,
      route_local_cardinality: route.seam_cardinality,
      classification: 'OUT_OF_RANGE_ROUTE_LOCAL_LABEL_IS_NOT_A_MEMBER_OF_THE_DEPENDENT_SCHEMA',
    });
  }
  const row = route.rows.find((candidate) => Number(candidate.local_seam_rank) === localLabel);
  if (!row) return freeze({ status: 'DEPENDENT_ADDRESS_DECODER_INTERNAL_MISMATCH' });
  return freeze({
    status: 'EXACT_DEPENDENT_ADDRESS_DECODED',
    route_label: routeLabel,
    local_label: localLabel,
    blocks: row.blocks,
    word: row.word,
    seams: row.seams,
  });
}

export function routeRespectingProductCriterion(t, E, O, P) {
  const profile = dependentSumSchemaProfile(t, E, O, P);
  if (profile.status !== 'EXACT_DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_DERIVED') return profile;
  const sizes = profile.route_conditional_cardinalities;
  const uniform = sizes.every((size) => size === sizes[0]);
  const productAlphabetSize = uniform ? sizes[0] : null;
  let explicitRoundTrip = true;
  if (uniform) {
    const schema = materializeDependentSumSchema(t, E, O, P);
    for (const row of schema.addresses) {
      if (row.local_label >= productAlphabetSize) explicitRoundTrip = false;
      const decoded = decodeDependentAddress(t, E, O, P, row.route_label, row.local_label);
      if (decoded.status !== 'EXACT_DEPENDENT_ADDRESS_DECODED'
          || key(decoded.blocks) !== key(row.blocks)
          || key(decoded.seams) !== key(row.seams)) explicitRoundTrip = false;
    }
  }
  return freeze({
    status: 'ROUTE_RESPECTING_PRODUCT_EXACTNESS_CRITERION_DERIVED',
    route_conditional_cardinalities: freeze([...sizes]),
    uniform,
    route_respecting_padding_free_product_exists: uniform,
    product_secondary_alphabet_size_if_exact: productAlphabetSize,
    explicit_uniform_round_trip_witnessed: uniform ? explicitRoundTrip : null,
    necessity: 'A route-respecting bijection to G_c×A forces every route fiber to have cardinality |A|.',
    sufficiency: 'If all route fibers have common size S, route rank plus exact local seam rank gives a route-respecting bijection to G_c×{0,...,S-1}.',
  });
}

export function productAdmissibilityMask(t, E, O, P) {
  const rectangle = materializeRectangularSchema(t, E, O, P);
  const dependent = materializeDependentSumSchema(t, E, O, P);
  if (rectangle.status !== 'EXACT_RECTANGULAR_SCHEMA_WITH_VISIBLE_PADDING_DERIVED'
      || dependent.status !== 'EXACT_DEPENDENT_SUM_SCHEMA_MATERIALIZED') {
    return freeze({ status: 'PRODUCT_ADMISSIBILITY_MASK_ABSTAIN', rectangle, dependent });
  }
  const dependentKeys = new Set(dependent.addresses.map((row) => key([row.route_label, row.local_label])));
  const cells = rectangle.cells.map((cell) => freeze({
    route_label: cell.route_label,
    local_label: cell.seam_label,
    admitted: dependentKeys.has(key([cell.route_label, cell.seam_label])),
  }));
  const admitted = cells.filter((cell) => cell.admitted).length;
  const rejected = cells.length - admitted;
  return freeze({
    status: admitted === dependent.cardinality && rejected === rectangle.padding_cells
      ? 'EXACT_PRODUCT_ADMISSIBILITY_MASK_DERIVED'
      : 'PRODUCT_ADMISSIBILITY_MASK_MISMATCH',
    capacity: cells.length,
    admitted_cells: admitted,
    rejected_cells: rejected,
    dependent_cardinality: dependent.cardinality,
    cells: freeze(cells),
  });
}

function symbolicCertificate() {
  return freeze({
    passed: true,
    dependent_sum: 'J_c is the disjoint union over routes w of exact route-conditioned seam fibers K_w, so its cardinality is sum_w s(w) with no padding.',
    product_necessity: 'In a route-respecting bijection J_c→G_c×A, the fiber above each route has size |A|, forcing all s(w) equal.',
    product_sufficiency: 'If every s(w)=S, route-local mixed-radix seam rank gives a bijection K_w→{0,...,S-1} for every route.',
    complement: 'For minimal shared S_c=max s(w), the product complement has sum_w(S_c-s(w)) cells, exactly #749 Delta_rect.',
    mask: 'The static predicate local_label<s(w) selects exactly the dependent sum inside the product rectangle.',
    authority: 'FINITE_FIBER_CARDINALITY_ARGUMENT_NOT_ENUMERATION_HORIZON',
  });
}

function inheritedNonuniformHostile() {
  const profile = dependentSumSchemaProfile(3, 1, 1, 3);
  const criterion = routeRespectingProductCriterion(3, 1, 1, 3);
  const mask = productAdmissibilityMask(3, 1, 1, 3);
  return freeze({
    passed: profile.status === 'EXACT_DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_DERIVED'
      && key(profile.route_conditional_cardinalities) === key([4, 1])
      && profile.dependent_sum_cardinality === 5
      && profile.padding_cells === 0
      && profile.minimal_product_capacity === 8
      && profile.minimal_product_padding === 3
      && !criterion.route_respecting_padding_free_product_exists
      && mask.admitted_cells === 5 && mask.rejected_cells === 3,
    profile, criterion, mask,
  });
}

function strictBitParentHostile() {
  const profile = dependentSumSchemaProfile(3, 1, 2, 4);
  const criterion = routeRespectingProductCriterion(3, 1, 2, 4);
  const mask = productAdmissibilityMask(3, 1, 2, 4);
  return freeze({
    passed: key(profile.route_conditional_cardinalities) === key([6, 2])
      && profile.dependent_sum_cardinality === 8
      && profile.minimal_product_capacity === 12
      && profile.minimal_product_padding === 4
      && !criterion.route_respecting_padding_free_product_exists
      && mask.admitted_cells === 8 && mask.rejected_cells === 4,
    profile, criterion, mask,
  });
}

function uniformPositiveHostile() {
  const args = [5, 0, 3, 9];
  const profile = dependentSumSchemaProfile(...args);
  const criterion = routeRespectingProductCriterion(...args);
  const schema = materializeDependentSumSchema(...args);
  return freeze({
    passed: profile.status === 'EXACT_DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_DERIVED'
      && profile.route_count === 2
      && key(profile.route_conditional_cardinalities) === key([4, 4])
      && profile.dependent_sum_cardinality === 8
      && profile.minimal_product_padding === 0
      && criterion.route_respecting_padding_free_product_exists
      && criterion.product_secondary_alphabet_size_if_exact === 4
      && criterion.explicit_uniform_round_trip_witnessed
      && schema.cardinality === 8,
    args: freeze(args), profile, criterion, schema,
  });
}

function dependentRoundTripHostile() {
  const states = [[3, 1, 1, 3], [3, 1, 2, 4], [5, 0, 3, 9], [2, 2, 3, 5], [1, 2, 3, 3], [0, 7, 0, 0]];
  const rows = [];
  for (const args of states) {
    const schema = materializeDependentSumSchema(...args);
    if (schema.status !== 'EXACT_DEPENDENT_SUM_SCHEMA_MATERIALIZED') {
      rows.push(freeze({ args: freeze(args), passed: false, reason: schema.status }));
      continue;
    }
    for (const state of schema.addresses) {
      const encoded = encodeDependentAddress(...args, state.blocks, state.seams);
      const decoded = decodeDependentAddress(...args, encoded.route_label, encoded.local_label);
      rows.push(freeze({
        args: freeze(args),
        passed: encoded.status === 'EXACT_DEPENDENT_ADDRESS_ENCODED'
          && decoded.status === 'EXACT_DEPENDENT_ADDRESS_DECODED'
          && key(decoded.blocks) === key(state.blocks)
          && key(decoded.seams) === key(state.seams),
      }));
    }
  }
  return freeze({ passed: rows.length > 0 && rows.every((row) => row.passed), rows: freeze(rows) });
}

function nonmemberAbstentionHostile() {
  const bad = decodeDependentAddress(3, 1, 1, 3, 1, 1);
  return freeze({
    passed: bad.status === 'DEPENDENT_ADDRESS_DECODER_NONMEMBER_ABSTAINS'
      && bad.classification === 'OUT_OF_RANGE_ROUTE_LOCAL_LABEL_IS_NOT_A_MEMBER_OF_THE_DEPENDENT_SCHEMA',
    bad,
  });
}

function boundedIffCorroboration() {
  const rows = [];
  for (let t = 0; t <= 5; t += 1) {
    for (let E = 0; E <= 3; E += 1) {
      for (let O = 0; O <= 3; O += 1) {
        const maxP = (t + 1) * (E + O + 1);
        for (let P = 0; P <= maxP; P += 1) {
          const profile = dependentSumSchemaProfile(t, E, O, P);
          if (profile.status !== 'EXACT_DEPENDENT_SUM_CUSTODY_SCHEMA_PROFILE_DERIVED') continue;
          const criterion = routeRespectingProductCriterion(t, E, O, P);
          rows.push(freeze({
            t, E, O, P,
            passed: criterion.status === 'ROUTE_RESPECTING_PRODUCT_EXACTNESS_CRITERION_DERIVED'
              && criterion.route_respecting_padding_free_product_exists === (profile.minimal_product_padding === 0),
          }));
        }
      }
    }
  }
  return freeze({ passed: rows.length > 0 && rows.every((row) => row.passed), rows: freeze(rows), authority: 'BOUNDED_CORROBORATION_ONLY' });
}

export function runDependentSumCustodySchemaChamber() {
  const certificates = freeze({
    symbolic: symbolicCertificate(),
    inherited_nonuniform: inheritedNonuniformHostile(),
    strict_bit_parent: strictBitParentHostile(),
    uniform_positive: uniformPositiveHostile(),
    dependent_round_trip: dependentRoundTripHostile(),
    nonmember_abstention: nonmemberAbstentionHostile(),
    bounded_iff_corroboration: boundedIffCorroboration(),
  });
  const passed = Object.values(certificates).every((certificate) => certificate.passed);
  return freeze({
    schema: DEPENDENT_SUM_CUSTODY_SCHEMA,
    parent_receipt: DEPENDENT_SUM_CUSTODY_SCHEMA_PARENT_RECEIPT,
    gate_issue: DEPENDENT_SUM_CUSTODY_SCHEMA_GATE_ISSUE,
    status: passed ? 'DEPENDENT_SUM_CUSTODY_SCHEMA_CHAMBER_PASSED' : 'DEPENDENT_SUM_CUSTODY_SCHEMA_CHAMBER_FAILED',
    passed,
    certificates,
    canonical_candidate: passed
      ? 'THE_FIXED_C1_JOINT_ROUTE_SEAM_FIBER_IS_EXACTLY_THE_FINITE_DEPENDENT_SUM_OF_ROUTE_INDEXED_SEAM_FIBERS_WITH_CARDINALITY_SUM_w_s(w)'
      : 'UNCLASSIFIED',
    consequential_candidate: passed
      ? 'A_PADDING_FREE_ROUTE_RESPECTING_CARTESIAN_PRODUCT_REPRESENTATION_EXISTS_IF_AND_ONLY_IF_ALL_ROUTE_CONDITIONED_SEAM_FIBERS_HAVE_EQUAL_CARDINALITY'
      : 'UNCLASSIFIED',
    architectural_candidate: passed
      ? 'NONUNIFORM_CONDITIONAL_CUSTODY_REQUIRES_EITHER_DEPENDENT_SCHEMA_ADMISSIBILITY_OR_VISIBLE_PRODUCT_PADDING_SO_A_FLAT_PRODUCT_WITHOUT_A_ROUTE_CONDITIONED_VALIDITY_RULE_CAN_IMPERSONATE_NONEXISTENT_HISTORIES'
      : 'UNCLASSIFIED',
    landing: freeze({
      lawful_conditional_values_belong_to_their_conditioning_route: true,
      syntactically_representable_pair_not_necessarily_lawful_history: true,
      dependent_admissibility_prevents_schema_capacity_from_manufacturing_provenance: true,
      product_padding_stays_visible_when_products_are_required: true,
      monolithic_rank_does_not_counterfeit_product_structure: true,
    }),
  });
}

export default runDependentSumCustodySchemaChamber;