export const DISCRETE_TRANSPORT_TOMOGRAPHY_SCHEMA = 'td613.ash.discrete-transport-tomography.closed-loop-falsification/v0.1';
export const MODULUS = 31;
export const SPEC_HEAD = 'd9cff3a1c6969be28af28c90f7aef85e4200fc70';

export const P_FULL = Object.freeze([
  Object.freeze({ probe_id:'P1', x:Object.freeze([1,0]), p:Object.freeze([1,0]) }),
  Object.freeze({ probe_id:'P2', x:Object.freeze([0,1]), p:Object.freeze([1,0]) }),
  Object.freeze({ probe_id:'P3', x:Object.freeze([1,0]), p:Object.freeze([0,1]) }),
  Object.freeze({ probe_id:'P4', x:Object.freeze([1,1]), p:Object.freeze([1,1]) })
]);
export const P_BLIND = Object.freeze([
  P_FULL[0], P_FULL[1], P_FULL[2],
  Object.freeze({ probe_id:'PB4', x:Object.freeze([1,1]), p:Object.freeze([1,0]) })
]);
export const P_HOLD = Object.freeze({ probe_id:'P_HOLD', x:Object.freeze([1,2]), p:Object.freeze([2,1]) });

export const POSITIVE_EDGES = Object.freeze({
  AB:Object.freeze([[1,1],[0,1]].map(row => Object.freeze(row))),
  BC:Object.freeze([[1,0],[1,1]].map(row => Object.freeze(row))),
  CA:Object.freeze([[1,2],[0,1]].map(row => Object.freeze(row)))
});
export const FLAT_EDGES = Object.freeze({
  AB:Object.freeze([[1,1],[0,1]].map(row => Object.freeze(row))),
  BC:Object.freeze([[1,30],[1,0]].map(row => Object.freeze(row))),
  CA:Object.freeze([[1,0],[30,1]].map(row => Object.freeze(row)))
});
export const GAUGE_FRAMES = Object.freeze({
  A:Object.freeze([[1,1],[1,2]].map(row => Object.freeze(row))),
  B:Object.freeze([[2,1],[1,1]].map(row => Object.freeze(row))),
  C:Object.freeze([[1,2],[1,3]].map(row => Object.freeze(row)))
});
export const HISTORY_AB = Object.freeze({
  after_start:Object.freeze([[1,1],[0,1]].map(row => Object.freeze(row))),
  after_C:Object.freeze([[1,2],[0,1]].map(row => Object.freeze(row)))
});

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

export function mod(value) {
  return ((Number(value) % MODULUS) + MODULUS) % MODULUS;
}

function invScalar(value) {
  const a = mod(value);
  if (a === 0) throw new Error('zero has no inverse in F_31');
  for (let candidate = 1; candidate < MODULUS; candidate += 1) {
    if (mod(a * candidate) === 1) return candidate;
  }
  throw new Error('nonzero field element unexpectedly lacked inverse');
}

export function matrixMultiply(left, right) {
  return freeze(left.map((row) => right[0].map((_, column) =>
    mod(row.reduce((sum, value, index) => sum + value * right[index][column], 0))
  )));
}

export function matrixVectorMultiply(matrix, vector) {
  return freeze(matrix.map(row => mod(row.reduce((sum, value, index) => sum + value * vector[index], 0))));
}

export function determinant2(matrix) {
  return mod(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
}

export function inverse2(matrix) {
  const det = determinant2(matrix);
  if (det === 0) throw new Error('matrix is singular in F_31');
  const scale = invScalar(det);
  return freeze([
    [mod(scale * matrix[1][1]), mod(-scale * matrix[0][1])],
    [mod(-scale * matrix[1][0]), mod(scale * matrix[0][0])]
  ]);
}

function matrixEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function identity(size) {
  return Array.from({ length:size }, (_, row) => Array.from({ length:size }, (_, column) => row === column ? 1 : 0));
}

export function rankMod(matrix) {
  if (!Array.isArray(matrix) || matrix.length === 0) return 0;
  const work = matrix.map(row => row.map(mod));
  const rows = work.length;
  const cols = work[0].length;
  let rank = 0;
  for (let column = 0; column < cols && rank < rows; column += 1) {
    let pivot = rank;
    while (pivot < rows && work[pivot][column] === 0) pivot += 1;
    if (pivot === rows) continue;
    [work[rank], work[pivot]] = [work[pivot], work[rank]];
    const inverse = invScalar(work[rank][column]);
    for (let c = column; c < cols; c += 1) work[rank][c] = mod(work[rank][c] * inverse);
    for (let row = 0; row < rows; row += 1) {
      if (row === rank) continue;
      const factor = work[row][column];
      if (factor === 0) continue;
      for (let c = column; c < cols; c += 1) work[row][c] = mod(work[row][c] - factor * work[rank][c]);
    }
    rank += 1;
  }
  return rank;
}

function solveUnique(coefficients, observations) {
  const n = coefficients[0].length;
  if (rankMod(coefficients) !== n) return null;
  const augmented = coefficients.map((row, index) => [...row.map(mod), mod(observations[index])]);
  let pivotRow = 0;
  for (let column = 0; column < n; column += 1) {
    let pivot = pivotRow;
    while (pivot < augmented.length && augmented[pivot][column] === 0) pivot += 1;
    if (pivot === augmented.length) return null;
    [augmented[pivotRow], augmented[pivot]] = [augmented[pivot], augmented[pivotRow]];
    const inverse = invScalar(augmented[pivotRow][column]);
    for (let c = column; c <= n; c += 1) augmented[pivotRow][c] = mod(augmented[pivotRow][c] * inverse);
    for (let row = 0; row < augmented.length; row += 1) {
      if (row === pivotRow) continue;
      const factor = augmented[row][column];
      if (factor === 0) continue;
      for (let c = column; c <= n; c += 1) augmented[row][c] = mod(augmented[row][c] - factor * augmented[pivotRow][c]);
    }
    pivotRow += 1;
  }
  return freeze(augmented.slice(0,n).map(row => row[n]));
}

export function probeRow(probe) {
  const [x1,x2] = probe.x;
  const [p1,p2] = probe.p;
  return freeze([mod(p1*x1), mod(p1*x2), mod(p2*x1), mod(p2*x2)]);
}

function operatorVector(matrix) {
  return freeze([matrix[0][0],matrix[0][1],matrix[1][0],matrix[1][1]].map(mod));
}

function vectorOperator(vector) {
  return freeze([[mod(vector[0]),mod(vector[1])],[mod(vector[2]),mod(vector[3])]]);
}

export function observeOperator(matrix, probe) {
  const tx = matrixVectorMultiply(matrix, probe.x);
  return mod(probe.p[0] * tx[0] + probe.p[1] * tx[1]);
}

function edgeEndpoints(edgeId) {
  if (edgeId === 'AB') return ['A','B'];
  if (edgeId === 'BC') return ['B','C'];
  if (edgeId === 'CA') return ['C','A'];
  return ['A','B'];
}

export function reconstructEdge(edgeId, oracle, schedule = P_FULL) {
  const [source,target] = edgeEndpoints(edgeId);
  const coefficients = schedule.map(probeRow);
  const observations = schedule.map(probe => observeOperator(oracle, probe));
  const rank = rankMod(coefficients);
  const solution = solveUnique(coefficients, observations);
  const reconstructed = solution ? vectorOperator(solution) : null;
  const predicted = reconstructed ? coefficients.map(row => mod(row.reduce((sum,value,index) => sum + value * solution[index],0))) : null;
  const inSampleResidual = predicted ? predicted.map((value,index) => mod(value - observations[index])) : null;
  const heldoutObserved = observeOperator(oracle, P_HOLD);
  const heldoutPredicted = reconstructed ? observeOperator(reconstructed, P_HOLD) : null;
  const replayObservations = schedule.map(probe => observeOperator(oracle, probe));
  const replaySolution = solveUnique(coefficients, replayObservations);
  const replayOperator = replaySolution ? vectorOperator(replaySolution) : null;
  return freeze({
    edge_id:edgeId,
    source_fiber:`V_${source}`,
    target_fiber:`V_${target}`,
    projection_schedule_id:schedule === P_FULL ? 'P_FULL' : 'P_BLIND',
    projection_coefficient_matrix:coefficients,
    projection_rank:rank,
    projection_nullity:4-rank,
    scalar_observations:freeze(observations),
    unique_reconstruction:reconstructed !== null,
    reconstructed_operator:reconstructed,
    operator_determinant:reconstructed ? determinant2(reconstructed) : null,
    operator_invertible:reconstructed ? determinant2(reconstructed) !== 0 : null,
    in_sample_residual:inSampleResidual,
    heldout_probe:P_HOLD,
    heldout_observed:heldoutObserved,
    heldout_predicted:heldoutPredicted,
    heldout_residual:heldoutPredicted === null ? null : mod(heldoutPredicted-heldoutObserved),
    deterministic_replay_operator:replayOperator,
    deterministic_replay_match:reconstructed !== null && matrixEqual(reconstructed,replayOperator),
    oracle_operator:oracle,
    oracle_match:reconstructed !== null && matrixEqual(reconstructed,oracle),
    oracle_consulted_by_inverse_solver:false,
    reusable_transport_candidate:reconstructed !== null && determinant2(reconstructed) !== 0 && heldoutPredicted === heldoutObserved && matrixEqual(reconstructed,replayOperator)
  });
}

function subtractIdentity(matrix) {
  return matrix.map((row,i) => row.map((value,j) => mod(value - (i===j ? 1 : 0))));
}

function loopReceipt(edgeReceipts) {
  const allReusable = edgeReceipts.every(edge => edge.reusable_transport_candidate);
  if (!allReusable) return freeze({ all_edges_reusable:false, loop_operator:null, classification:'LOOP_WITHHELD_EDGE_TRANSPORT_NOT_ADMITTED' });
  const byId = Object.fromEntries(edgeReceipts.map(edge => [edge.edge_id, edge.reconstructed_operator]));
  const loop = matrixMultiply(byId.CA, matrixMultiply(byId.BC, byId.AB));
  const trace = mod(loop[0][0] + loop[1][1]);
  const det = determinant2(loop);
  const rankDefect = rankMod(subtractIdentity(loop));
  return freeze({
    all_edges_reusable:true,
    all_edges_heldout_validated:edgeReceipts.every(edge => edge.heldout_residual === 0),
    base_vertex:'A',
    ordered_edge_ids:freeze(['AB','BC','CA']),
    reconstructed_edge_operators:freeze(byId),
    loop_operator:loop,
    identity_matrix:freeze([[1,0],[0,1]]),
    loop_is_identity:matrixEqual(loop,[[1,0],[0,1]]),
    rank_loop_minus_identity:rankDefect,
    trace_mod_31:trace,
    determinant_mod_31:det,
    characteristic_polynomial_mod_31:freeze({ lambda2:1, lambda:mod(-trace), constant:det })
  });
}

function reconstructFamily(edges) {
  return freeze(['AB','BC','CA'].map(edgeId => reconstructEdge(edgeId, edges[edgeId], P_FULL)));
}

function gaugeTransform(edges) {
  const {A:KA,B:KB,C:KC} = GAUGE_FRAMES;
  return freeze({
    AB:matrixMultiply(KB,matrixMultiply(edges.AB,inverse2(KA))),
    BC:matrixMultiply(KC,matrixMultiply(edges.BC,inverse2(KB))),
    CA:matrixMultiply(KA,matrixMultiply(edges.CA,inverse2(KC)))
  });
}

function blindControl() {
  const blind = reconstructEdge('AB',POSITIVE_EDGES.AB,P_BLIND);
  const identifiedBC = reconstructEdge('BC',POSITIVE_EDGES.BC,P_FULL);
  const identifiedCA = reconstructEdge('CA',POSITIVE_EDGES.CA,P_FULL);
  const materialized = [1,2].map(t22 => freeze([[1,1],[0,t22]]));
  const compatible = materialized.map(candidate => {
    const observations = P_BLIND.map(probe => observeOperator(candidate,probe));
    return freeze({
      candidate,
      invertible:determinant2(candidate)!==0,
      matches_blind_observations:JSON.stringify(observations)===JSON.stringify(blind.scalar_observations),
      loop_operator:matrixMultiply(identifiedCA.reconstructed_operator,matrixMultiply(identifiedBC.reconstructed_operator,candidate))
    });
  });
  const loopsDistinct = !matrixEqual(compatible[0].loop_operator,compatible[1].loop_operator);
  return freeze({
    blind_edge_receipt:blind,
    compatible_family_parameterization:'t11=1,t12=1,t21=0,t22 free in F_31 subject to invertibility',
    materialized_compatible_candidates:freeze(compatible),
    compatible_loop_operators_distinct:loopsDistinct,
    loop_identifiability:loopsDistinct ? 'UNIDENTIFIED' : 'NOT_FALSIFIED_BY_MATERIALIZED_CANDIDATES',
    classification:loopsDistinct ? 'CLOSED_LOOP_TRANSPORT_UNIDENTIFIED_UNDER_PROJECTION_NULLSPACE' : 'BLIND_CONTROL_FAILED_TO_EXPOSE_LOOP_AMBIGUITY'
  });
}

function historyControl() {
  const afterStart = reconstructEdge('AB',HISTORY_AB.after_start,P_FULL);
  const afterC = reconstructEdge('AB',HISTORY_AB.after_C,P_FULL);
  const differs = !matrixEqual(afterStart.reconstructed_operator,afterC.reconstructed_operator);
  return freeze({
    nominal_edge_id:'AB',
    same_projection_schedule:true,
    after_start:afterStart,
    after_C:afterC,
    context_reconstructions_differ:differs,
    reusable_transport_under_declared_context_free_edge_model:!differs,
    classification:differs ? 'HISTORY_DEPENDENT_EDGE_REJECTS_REUSABLE_TRANSPORT_MODEL' : 'HISTORY_CONTROL_DID_NOT_FALSIFY_REUSE'
  });
}

export function runDiscreteTransportTomographyAssay() {
  const fullRank = rankMod(P_FULL.map(probeRow));
  const blindRank = rankMod(P_BLIND.map(probeRow));

  const positiveEdges = reconstructFamily(POSITIVE_EDGES);
  const flatEdges = reconstructFamily(FLAT_EDGES);
  const positiveLoop = loopReceipt(positiveEdges);
  const flatLoop = loopReceipt(flatEdges);

  const reverseLoop = matrixMultiply(
    inverse2(positiveLoop.reconstructed_edge_operators.AB),
    matrixMultiply(inverse2(positiveLoop.reconstructed_edge_operators.BC),inverse2(positiveLoop.reconstructed_edge_operators.CA))
  );
  const positiveInverse = inverse2(positiveLoop.loop_operator);

  const gaugeEdgesOracle = gaugeTransform(POSITIVE_EDGES);
  const gaugeEdges = reconstructFamily(gaugeEdgesOracle);
  const gaugeLoop = loopReceipt(gaugeEdges);
  const expectedGaugeLoop = matrixMultiply(GAUGE_FRAMES.A,matrixMultiply(positiveLoop.loop_operator,inverse2(GAUGE_FRAMES.A)));

  const blind = blindControl();
  const history = historyControl();
  const flatMechanismPass = flatLoop.loop_is_identity === true;
  const positiveMechanismPass = positiveLoop.loop_is_identity === false && positiveLoop.rank_loop_minus_identity === 2;
  const gaugePass = matrixEqual(gaugeLoop.loop_operator,expectedGaugeLoop)
    && gaugeLoop.rank_loop_minus_identity === positiveLoop.rank_loop_minus_identity
    && gaugeLoop.characteristic_polynomial_mod_31.lambda === positiveLoop.characteristic_polynomial_mod_31.lambda
    && gaugeLoop.characteristic_polynomial_mod_31.constant === positiveLoop.characteristic_polynomial_mod_31.constant;
  const reversalPass = matrixEqual(reverseLoop,positiveInverse);
  const edgewisePass = [...positiveEdges,...flatEdges,...gaugeEdges].every(edge => edge.oracle_match && edge.heldout_residual === 0 && edge.deterministic_replay_match);
  const blindPass = blind.blind_edge_receipt.projection_rank === 3
    && blind.blind_edge_receipt.unique_reconstruction === false
    && blind.compatible_loop_operators_distinct;
  const historyPass = history.context_reconstructions_differ && history.reusable_transport_under_declared_context_free_edge_model === false;
  const mechanismValidated = fullRank === 4 && blindRank === 3 && edgewisePass && flatMechanismPass && positiveMechanismPass && gaugePass && reversalPass && blindPass && historyPass;

  return freeze({
    schema:DISCRETE_TRANSPORT_TOMOGRAPHY_SCHEMA,
    spec_head:SPEC_HEAD,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    arithmetic_domain:'F_31',
    fibers:freeze({ A:'F_31^2', B:'F_31^2', C:'F_31^2' }),
    projection_geometry:freeze({
      full_rank_schedule:freeze({ rows:P_FULL.map(probeRow), rank:fullRank, nullity:4-fullRank }),
      blind_schedule:freeze({ rows:P_BLIND.map(probeRow), rank:blindRank, nullity:4-blindRank }),
      heldout_probe:P_HOLD
    }),
    positive:freeze({ edges:positiveEdges, loop:positiveLoop }),
    flat_null:freeze({ edges:flatEdges, loop:flatLoop }),
    gauge_clone:freeze({
      frames:GAUGE_FRAMES,
      oracle_edges:gaugeEdgesOracle,
      reconstructed_edges:gaugeEdges,
      loop:gaugeLoop,
      expected_conjugate_loop:expectedGaugeLoop,
      conjugacy_consistent:gaugePass
    }),
    reversal:freeze({
      reverse_loop:reverseLoop,
      positive_loop_inverse:positiveInverse,
      consistent:reversalPass
    }),
    blind_projection_control:blind,
    history_dependent_impostor:history,
    findings:freeze({
      edgewise_scalar_projection_reconstruction_validated:edgewisePass,
      flat_gauge_generated_loop_recovers_identity:flatMechanismPass,
      nontrivial_reusable_loop_recovers_after_edgewise_reconstruction:positiveMechanismPass,
      gauge_clone_conjugacy_consistent:gaugePass,
      reversed_loop_matches_inverse:reversalPass,
      projection_nullspace_can_destroy_loop_identifiability:blindPass,
      history_dependence_can_falsify_reusable_transport_model:historyPass,
      assay_mechanism_validated:mechanismValidated
    }),
    bounded_answer:mechanismValidated
      ? 'DISCRETE_HOLONOMY_TOMOGRAPHY_IS_IMPLEMENTABLE_AND_FALSIFIABLE_IN_AUTHORED_FINITE_RESEARCH_FIXTURE'
      : 'DISCRETE_HOLONOMY_TOMOGRAPHY_CANDIDATE_FAILED_FALSIFICATION_ASSAY',
    claim_ceiling:freeze({
      finite_synthetic_fixture_only:true,
      discrete_transport_reconstruction_grammar:mechanismValidated,
      td613_general_holonomy_observed:false,
      physical_tomography:false,
      physical_parallel_transport:false,
      physical_connection:false,
      physical_curvature:false,
      physical_holonomy:false,
      berry_phase:false,
      berry_curvature:false,
      quantum_behavior:false,
      manifold_ontology:false,
      fiber_bundle_ontology:false,
      proto_loom_authority:false,
      holonomy_loom_runtime_authority:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    live_ash_binding:false,
    human_closure_required:true
  });
}
