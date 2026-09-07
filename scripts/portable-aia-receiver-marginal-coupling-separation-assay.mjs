import {
  runPortableAiaAtlasCrosscuttingReceiverLatticeAssay
} from './portable-aia-atlas-crosscutting-receiver-lattice-assay.mjs';

export const PORTABLE_AIA_RECEIVER_MARGINAL_COUPLING_SEPARATION_ASSAY_SCHEMA =
  'td613.portable-aia.receiver-marginal-coupling-separation-assay/v0.1-local-only';

export const RECEIVER_COUPLING_TOTAL_WEIGHT = 84;

export const RECEIVER_COUPLING_MU0 = Object.freeze([
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4])
]);

export const RECEIVER_COUPLING_MU1 = Object.freeze([
  Object.freeze([5,3,4]),
  Object.freeze([3,5,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4]),
  Object.freeze([4,4,4])
]);

function freeze(value) {
  if (Array.isArray(value)) return Object.freeze(value.map(freeze));
  if (!value || typeof value !== 'object') return value;
  return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, child]) => [key, freeze(child)])));
}

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function reducedFraction(numerator, denominator) {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator) || denominator <= 0) {
    throw new TypeError('exact fraction requires integer numerator and positive denominator');
  }
  const divisor = gcd(numerator, denominator);
  return Object.freeze({ numerator:numerator / divisor, denominator:denominator / divisor });
}

function matrixSummary(matrix, label) {
  if (!Array.isArray(matrix) || matrix.length !== 7 || !matrix.every(row => Array.isArray(row) && row.length === 3)) {
    throw new Error(`${label} must be an exact 7×3 matrix`);
  }
  const flat = matrix.flat();
  if (!flat.every(Number.isInteger)) throw new Error(`${label} weights must be integers`);
  if (!flat.every(value => value > 0)) throw new Error(`${label} must have full positive support on all 21 cells`);
  const rowSums = matrix.map(row => row.reduce((sum, value) => sum + value, 0));
  const columnSums = [0,1,2].map(column => matrix.reduce((sum, row) => sum + row[column], 0));
  const total = rowSums.reduce((sum, value) => sum + value, 0);
  return Object.freeze({
    row_sums:Object.freeze(rowSums),
    column_sums:Object.freeze(columnSums),
    total,
    full_support:true,
    positive_cell_count:flat.length
  });
}

function exactIndependence(matrix, summary) {
  const violations = [];
  const cells = [];
  for (let row = 0; row < 7; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const observedCrossProduct = matrix[row][column] * summary.total;
      const factorizedCrossProduct = summary.row_sums[row] * summary.column_sums[column];
      const independent = observedCrossProduct === factorizedCrossProduct;
      const cell = Object.freeze({
        row,
        column,
        weight:matrix[row][column],
        observed_cross_product:observedCrossProduct,
        factorized_cross_product:factorizedCrossProduct,
        independent
      });
      cells.push(cell);
      if (!independent) violations.push(Object.freeze({ row, column }));
    }
  }
  return Object.freeze({
    exact_integer_test:true,
    independent:violations.length === 0,
    violation_count:violations.length,
    violations:Object.freeze(violations),
    cells:Object.freeze(cells)
  });
}

function semanticCells(parent) {
  const table = parent.meet?.intersection_table;
  if (!Array.isArray(table) || table.length !== 7 || !table.every(row => Array.isArray(row) && row.length === 3)) {
    throw new Error('parent #1072 meet table is not the exact 7×3 domain');
  }
  const cells = [];
  for (let row = 0; row < 7; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const cell = table[row][column];
      if (cell?.size !== 1 || !Array.isArray(cell.members) || cell.members.length !== 1) {
        throw new Error(`parent #1072 cell ${row},${column} is not singleton`);
      }
      cells.push(Object.freeze({
        row,
        column,
        point_id:cell.members[0],
        policy_key:cell.policy_key,
        boundary_key:cell.boundary_key
      }));
    }
  }
  if (new Set(cells.map(cell => cell.point_id)).size !== 21) {
    throw new Error('parent #1072 semantic cell identities are not injective');
  }
  return Object.freeze(cells);
}

function weightedSemanticTable(cells, matrix) {
  return Object.freeze(cells.map(cell => Object.freeze({
    ...cell,
    weight:matrix[cell.row][cell.column]
  })));
}

function relabelHostileControl(cells) {
  const original = cells.map(cell => cell.point_id);
  const permuted = [...original];
  [permuted[0], permuted[8]] = [permuted[8], permuted[0]];
  const mismatches = original.reduce((count, id, index) => count + (id === permuted[index] ? 0 : 1), 0);
  if (mismatches !== 2) throw new Error('semantic relabel hostile control did not move exactly two identities');
  return Object.freeze({
    position_weights_unchanged:true,
    semantic_identity_mapping_unchanged:false,
    semantic_identity_mismatch_count:mismatches,
    positional_weight_equality_is_semantic_equivalence:false
  });
}

export function runPortableAiaReceiverMarginalCouplingSeparationAssay() {
  const parent = runPortableAiaAtlasCrosscuttingReceiverLatticeAssay();
  if (parent.status !== 'PASS' || parent.domain?.canonical_projection_count !== 21 ||
      parent.meet?.class_count !== 21 || parent.meet?.singleton_class_count !== 21 ||
      parent.join?.class_count !== 1 || parent.generated_sublattice?.order_isomorphic_to_B2 !== true) {
    throw new Error('exact #1072 receiver-lattice parent theorem unavailable');
  }

  const cells = semanticCells(parent);
  const mu0Summary = matrixSummary(RECEIVER_COUPLING_MU0, 'μ0');
  const mu1Summary = matrixSummary(RECEIVER_COUPLING_MU1, 'μ1');
  const expectedRows = [12,12,12,12,12,12,12];
  const expectedColumns = [28,28,28];
  for (const [label, summary] of [['μ0', mu0Summary], ['μ1', mu1Summary]]) {
    if (summary.total !== RECEIVER_COUPLING_TOTAL_WEIGHT) throw new Error(`${label} total weight drifted`);
    if (JSON.stringify(summary.row_sums) !== JSON.stringify(expectedRows)) throw new Error(`${label} policy marginals drifted`);
    if (JSON.stringify(summary.column_sums) !== JSON.stringify(expectedColumns)) throw new Error(`${label} boundary marginals drifted`);
    if (!summary.full_support || summary.positive_cell_count !== 21) throw new Error(`${label} lost full support`);
  }

  const samePolicyMarginals = JSON.stringify(mu0Summary.row_sums) === JSON.stringify(mu1Summary.row_sums);
  const sameBoundaryMarginals = JSON.stringify(mu0Summary.column_sums) === JSON.stringify(mu1Summary.column_sums);
  if (!samePolicyMarginals || !sameBoundaryMarginals) throw new Error('frozen measures do not preserve one-receiver marginals');

  const mu0Independence = exactIndependence(RECEIVER_COUPLING_MU0, mu0Summary);
  const mu1Independence = exactIndependence(RECEIVER_COUPLING_MU1, mu1Summary);
  if (!mu0Independence.independent || mu0Independence.violation_count !== 0) throw new Error('μ0 failed exact factorization');
  const expectedViolations = JSON.stringify([{row:0,column:0},{row:0,column:1},{row:1,column:0},{row:1,column:1}]);
  if (mu1Independence.independent || mu1Independence.violation_count !== 4 || JSON.stringify(mu1Independence.violations) !== expectedViolations) {
    throw new Error(`μ1 exact independence violation set drifted: ${JSON.stringify(mu1Independence.violations)}`);
  }

  let l1Numerator = 0;
  let changedCells = 0;
  for (let row = 0; row < 7; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      const difference = Math.abs(RECEIVER_COUPLING_MU1[row][column] - RECEIVER_COUPLING_MU0[row][column]);
      l1Numerator += difference;
      if (difference > 0) changedCells += 1;
    }
  }
  const totalVariation = reducedFraction(l1Numerator, 2 * RECEIVER_COUPLING_TOTAL_WEIGHT);
  if (totalVariation.numerator !== 1 || totalVariation.denominator !== 42 || changedCells !== 4) {
    throw new Error(`total-variation separation drifted: ${JSON.stringify(totalVariation)}, changed=${changedCells}`);
  }

  const ePlusMu0Weight = RECEIVER_COUPLING_MU0[0][0] + RECEIVER_COUPLING_MU0[1][1];
  const ePlusMu1Weight = RECEIVER_COUPLING_MU1[0][0] + RECEIVER_COUPLING_MU1[1][1];
  const ePlusDifference = reducedFraction(Math.abs(ePlusMu1Weight - ePlusMu0Weight), RECEIVER_COUPLING_TOTAL_WEIGHT);
  if (ePlusDifference.numerator !== totalVariation.numerator || ePlusDifference.denominator !== totalVariation.denominator) {
    throw new Error('E+ does not attain the exact total-variation bound');
  }

  const mu0Semantic = weightedSemanticTable(cells, RECEIVER_COUPLING_MU0);
  const mu1Semantic = weightedSemanticTable(cells, RECEIVER_COUPLING_MU1);
  const jointTablesDiffer = mu0Semantic.some((cell, index) => cell.weight !== mu1Semantic[index].weight);
  if (!jointTablesDiffer) throw new Error('paired receiver joint tables unexpectedly coincide');

  const relabelControl = relabelHostileControl(cells);

  return freeze({
    schema:PORTABLE_AIA_RECEIVER_MARGINAL_COUPLING_SEPARATION_ASSAY_SCHEMA,
    status:'PASS',
    assay_local_only:true,
    parent_structure:{
      canonical_projection_count:21,
      policy_class_count:7,
      boundary_class_count:3,
      meet_class_count:21,
      meet_singleton_class_count:21,
      join_class_count:1,
      generated_sublattice_element_count:4,
      generated_sublattice_B2:true,
      measure_free_structure_unchanged:true
    },
    semantic_cells:cells,
    measures:{
      mu0:{ matrix:RECEIVER_COUPLING_MU0, ...mu0Summary, exact_independence:mu0Independence },
      mu1:{ matrix:RECEIVER_COUPLING_MU1, ...mu1Summary, exact_independence:mu1Independence }
    },
    receiver_marginals:{
      policy_identical:samePolicyMarginals,
      boundary_identical:sameBoundaryMarginals,
      policy_vector:mu0Summary.row_sums,
      boundary_vector:mu0Summary.column_sums,
      either_single_receiver_marginal_distinguishes_measures:false
    },
    joint_coupling:{
      paired_receiver_joint_table_distinguishes_measures:jointTablesDiffer,
      changed_cell_count:changedCells,
      mu0_independent:true,
      mu1_independent:false,
      mu1_independence_violation_count:4,
      mu1_independence_violations:mu1Independence.violations
    },
    exact_separation:{
      l1_weight_numerator:l1Numerator,
      common_total_weight:RECEIVER_COUPLING_TOTAL_WEIGHT,
      total_variation:totalVariation,
      e_plus_cells:Object.freeze([{row:0,column:0},{row:1,column:1}]),
      e_plus_mu0_weight:ePlusMu0Weight,
      e_plus_mu1_weight:ePlusMu1Weight,
      e_plus_difference:ePlusDifference,
      e_plus_attains_tv_bound:true,
      floating_point_authority:false
    },
    hostile_semantic_relabel:relabelControl,
    partition_complementarity_implies_statistical_independence:false,
    same_receiver_marginals_imply_same_joint_coupling:false,
    full_support_implies_independence:false,
    statistical_independence_claimed_for_real_td613_observations:false,
    empirical_user_distribution_claimed:false,
    causal_dependence_claimed:false,
    production_probability_model_added:false,
    new_production_receiver_added:false,
    product_source_mutated:false,
    counts_as_exogenous_witness:false,
    golden_egg_credit:0,
    authority:{
      release_authority:false,
      provider_call_performed:false,
      production_mutation:false,
      human_closure_required:true
    },
    claim_ceiling:'exact-current-21-cell-synthetic-same-marginal-distinct-joint-coupling-counterexample-only',
    seal:'⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runPortableAiaReceiverMarginalCouplingSeparationAssay(), null, 2)}\n`);
}
