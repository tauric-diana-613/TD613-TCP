export const GAUGE_BLIND_GL2_HOLONOMY_SCHEMA = 'td613.ash.gauge-blind-gl2-f31-holonomy-conjugacy/v0.1';
export const GAUGE_BLIND_SPEC_HEAD = 'f58a1513973ca26e1eb03b73dc8a8a40c3988949';
export const MODULUS = 31;

const I = Object.freeze([[1,0],[0,1]].map(row=>Object.freeze(row)));
const H0 = Object.freeze([[18,29],[19,19]].map(row=>Object.freeze(row)));
const HL = Object.freeze([[16,17],[30,29]].map(row=>Object.freeze(row)));
const K0 = Object.freeze([[4,1],[2,1]].map(row=>Object.freeze(row)));
const U = Object.freeze([[1,1],[0,1]].map(row=>Object.freeze(row)));
const S3 = Object.freeze([[3,0],[0,3]].map(row=>Object.freeze(row)));
const J3 = Object.freeze([[3,1],[0,3]].map(row=>Object.freeze(row)));
const KJ = Object.freeze([[2,1],[1,1]].map(row=>Object.freeze(row)));

function freeze(value) {
  if(value && typeof value==='object' && !Object.isFrozen(value)) {
    for(const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
export function mod(value) { return ((Number(value)%MODULUS)+MODULUS)%MODULUS; }
function scalarInverse(value) {
  const a=mod(value);
  if(a===0) throw new Error('zero has no inverse in F_31');
  for(let k=1;k<MODULUS;k+=1) if(mod(a*k)===1) return k;
  throw new Error('inverse missing');
}
function matrixEqual(left,right) { return JSON.stringify(left)===JSON.stringify(right); }

export function matrixMultiply(left,right) {
  return freeze(left.map(row=>right[0].map((_,column)=>mod(row.reduce((sum,value,index)=>sum+value*right[index][column],0)))));
}
export function determinant2(matrix) { return mod(matrix[0][0]*matrix[1][1]-matrix[0][1]*matrix[1][0]); }
export function inverse2(matrix) {
  const det=determinant2(matrix);
  if(det===0) throw new Error('singular matrix');
  const d=scalarInverse(det);
  return freeze([[mod(d*matrix[1][1]),mod(-d*matrix[0][1])],[mod(-d*matrix[1][0]),mod(d*matrix[0][0])]]);
}

export function rankMod(matrix) {
  if(!Array.isArray(matrix) || matrix.length===0) return 0;
  const work=matrix.map(row=>row.map(mod));
  let rank=0;
  const cols=work[0].length;
  for(let c=0;c<cols && rank<work.length;c+=1) {
    let pivot=rank;
    while(pivot<work.length && work[pivot][c]===0) pivot+=1;
    if(pivot===work.length) continue;
    [work[rank],work[pivot]]=[work[pivot],work[rank]];
    const inv=scalarInverse(work[rank][c]);
    for(let k=c;k<cols;k+=1) work[rank][k]=mod(work[rank][k]*inv);
    for(let r=0;r<work.length;r+=1) {
      if(r===rank) continue;
      const factor=work[r][c];
      if(factor===0) continue;
      for(let k=c;k<cols;k+=1) work[r][k]=mod(work[r][k]-factor*work[rank][k]);
    }
    rank+=1;
  }
  return rank;
}

function shiftedRank(matrix,lambda) {
  return rankMod(matrix.map((row,i)=>row.map((value,j)=>mod(value-(i===j?lambda:0)))));
}

const NONZERO_SQUARES = Object.freeze([...new Set(Array.from({length:MODULUS-1},(_,i)=>mod((i+1)*(i+1))))].sort((a,b)=>a-b));
function squareClass(value) {
  const v=mod(value);
  if(v===0) return 'ZERO';
  return NONZERO_SQUARES.includes(v) ? 'NONZERO_SQUARE' : 'NONSQUARE';
}

export function conjugacyFingerprint(matrix) {
  const determinant=determinant2(matrix);
  if(determinant===0) return freeze({ admitted:false, reason:'SINGULAR_MATRIX_OUTSIDE_GL2_F31' });
  const trace=mod(matrix[0][0]+matrix[1][1]);
  const discriminant=mod(trace*trace-4*determinant);
  const discriminantSquareClass=squareClass(discriminant);
  let repeatedRootLambda=null;
  let repeatedRootShiftRank=null;
  let repeatedRootType=null;
  if(discriminant===0) {
    repeatedRootLambda=mod(trace*scalarInverse(2));
    repeatedRootShiftRank=shiftedRank(matrix,repeatedRootLambda);
    repeatedRootType=repeatedRootShiftRank===0 ? 'SCALAR_REPEATED_ROOT' : 'NONTRIVIAL_JORDAN_REPEATED_ROOT';
  }
  return freeze({
    admitted:true,
    trace_mod_31:trace,
    determinant_mod_31:determinant,
    discriminant_mod_31:discriminant,
    discriminant_square_class:discriminantSquareClass,
    repeated_root_lambda:repeatedRootLambda,
    rank_shifted_by_repeated_root:repeatedRootShiftRank,
    repeated_root_type:repeatedRootType,
    fingerprint:freeze({
      trace_mod_31:trace,
      determinant_mod_31:determinant,
      discriminant_square_class:discriminantSquareClass,
      repeated_root_rank:repeatedRootShiftRank
    })
  });
}

function rrefWithPivots(matrix) {
  const work=matrix.map(row=>row.map(mod));
  const pivots=[];
  let r=0;
  for(let c=0;c<work[0].length && r<work.length;c+=1) {
    let pivot=r;
    while(pivot<work.length && work[pivot][c]===0) pivot+=1;
    if(pivot===work.length) continue;
    [work[r],work[pivot]]=[work[pivot],work[r]];
    const inv=scalarInverse(work[r][c]);
    for(let k=c;k<work[r].length;k+=1) work[r][k]=mod(work[r][k]*inv);
    for(let rr=0;rr<work.length;rr+=1) {
      if(rr===r) continue;
      const factor=work[rr][c];
      if(factor===0) continue;
      for(let k=c;k<work[rr].length;k+=1) work[rr][k]=mod(work[rr][k]-factor*work[r][k]);
    }
    pivots.push(c);
    r+=1;
  }
  return { rref:work, pivots };
}

function conjugacyEquationMatrix(A,B) {
  const [[a,b],[c,d]]=A;
  const [[e,f],[g,h]]=B;
  return freeze([
    [mod(a-e),c,mod(-f),0],
    [b,mod(d-e),0,mod(-f)],
    [mod(-g),0,mod(a-h),c],
    [0,mod(-g),b,mod(d-h)]
  ].map(row=>Object.freeze(row.map(mod))));
}

function nullspaceBasis(matrix) {
  const {rref,pivots}=rrefWithPivots(matrix);
  const cols=matrix[0].length;
  const pivotSet=new Set(pivots);
  const free=[];
  for(let c=0;c<cols;c+=1) if(!pivotSet.has(c)) free.push(c);
  const basis=[];
  for(const freeCol of free) {
    const vector=Array(cols).fill(0);
    vector[freeCol]=1;
    pivots.forEach((pivotCol,rowIndex)=>{ vector[pivotCol]=mod(-rref[rowIndex][freeCol]); });
    basis.push(Object.freeze(vector));
  }
  return freeze({ basis:freeze(basis), dimension:basis.length, rank:pivots.length });
}

function vectorToMatrix(vector) { return freeze([[vector[0],vector[1]],[vector[2],vector[3]]]); }
function linearCombination(basis,coefficients) {
  const out=Array(4).fill(0);
  basis.forEach((vector,index)=>vector.forEach((value,k)=>{ out[k]=mod(out[k]+coefficients[index]*value); }));
  return out;
}

function enumerateCoefficientVectors(dimension) {
  const out=[];
  function walk(prefix) {
    if(prefix.length===dimension) { out.push(Object.freeze([...prefix])); return; }
    for(let value=0;value<MODULUS;value+=1) walk([...prefix,value]);
  }
  walk([]);
  return out;
}

function findConjugator(A,B) {
  const equation=conjugacyEquationMatrix(A,B);
  const nullspace=nullspaceBasis(equation);
  const coefficientVectors=enumerateCoefficientVectors(nullspace.dimension);
  let recovered=null;
  for(const coefficients of coefficientVectors) {
    const candidate=vectorToMatrix(linearCombination(nullspace.basis,coefficients));
    if(determinant2(candidate)===0) continue;
    if(matrixEqual(B,matrixMultiply(candidate,matrixMultiply(A,inverse2(candidate))))) {
      recovered=candidate;
      break;
    }
  }
  return freeze({
    conjugacy_equation_matrix:equation,
    conjugacy_equation_rank:nullspace.rank,
    conjugacy_solution_dimension:nullspace.dimension,
    nullspace_basis:nullspace.basis,
    full_nullspace_coefficients_enumerated:coefficientVectors.length,
    expected_full_solution_count:MODULUS**nullspace.dimension,
    exhaustive_solution_space_searched:coefficientVectors.length===MODULUS**nullspace.dimension,
    invertible_conjugator_found:recovered!==null,
    recovered_conjugator:recovered,
    exact_conjugation_verified:recovered!==null
  });
}

export function classifyPair(A,B,{oracleConjugatorExposed=false}={}) {
  const left=conjugacyFingerprint(A);
  const right=conjugacyFingerprint(B);
  const traceDetEqual=left.admitted && right.admitted && left.trace_mod_31===right.trace_mod_31 && left.determinant_mod_31===right.determinant_mod_31;
  const fingerprintsEqual=left.admitted && right.admitted && JSON.stringify(left.fingerprint)===JSON.stringify(right.fingerprint);
  const witness=left.admitted && right.admitted ? findConjugator(A,B) : null;
  return freeze({
    left_fingerprint:left,
    right_fingerprint:right,
    trace_det_equal:traceDetEqual,
    fingerprints_equal:fingerprintsEqual,
    ...(witness??{}),
    oracle_conjugator_exposed_to_classifier:oracleConjugatorExposed,
    classification:fingerprintsEqual && witness?.invertible_conjugator_found
      ? 'GAUGE_BLIND_CONJUGACY_EQUIVALENCE_WITNESSED'
      : 'GAUGE_BLIND_CONJUGACY_EQUIVALENCE_REJECTED'
  });
}

export function runGaugeBlindGL2HolonomyClassifierGauntlet() {
  const H0Clone=matrixMultiply(K0,matrixMultiply(H0,inverse2(K0)));
  const J3Clone=matrixMultiply(KJ,matrixMultiply(J3,inverse2(KJ)));

  const positiveDistinct=classifyPair(H0,H0Clone);
  const identityUnipotentTrap=classifyPair(I,U);
  const repeatedScaleTrap=classifyPair(S3,J3);
  const positiveJordan=classifyPair(J3,J3Clone);
  const differentCharacteristic=classifyPair(H0,HL);

  const pass=
    matrixEqual(H0Clone,[[19,23],[28,18]]) &&
    matrixEqual(J3Clone,[[1,4],[30,5]]) &&
    positiveDistinct.fingerprints_equal && positiveDistinct.invertible_conjugator_found && positiveDistinct.exact_conjugation_verified &&
    positiveDistinct.oracle_conjugator_exposed_to_classifier===false &&
    identityUnipotentTrap.trace_det_equal && !identityUnipotentTrap.fingerprints_equal && !identityUnipotentTrap.invertible_conjugator_found &&
    repeatedScaleTrap.trace_det_equal && !repeatedScaleTrap.fingerprints_equal && !repeatedScaleTrap.invertible_conjugator_found &&
    positiveJordan.fingerprints_equal && positiveJordan.invertible_conjugator_found &&
    positiveJordan.left_fingerprint.rank_shifted_by_repeated_root===1 && positiveJordan.right_fingerprint.rank_shifted_by_repeated_root===1 &&
    !differentCharacteristic.fingerprints_equal && !differentCharacteristic.invertible_conjugator_found &&
    [positiveDistinct,identityUnipotentTrap,repeatedScaleTrap,positiveJordan,differentCharacteristic].every(result=>result.exhaustive_solution_space_searched===true);

  return freeze({
    schema:GAUGE_BLIND_GL2_HOLONOMY_SCHEMA,
    spec_head:GAUGE_BLIND_SPEC_HEAD,
    source_status:'SIMULATED',
    arithmetic_domain:'F_31',
    matrix_group:'GL(2,F_31)',
    oracle_generation:freeze({ H0_clone:H0Clone, J3_clone:J3Clone, oracle_conjugators_exposed_to_classifier:false }),
    cases:freeze({ positive_distinct_eigen:positiveDistinct, identity_unipotent_trap:identityUnipotentTrap, repeated_scale_trap:repeatedScaleTrap, positive_jordan:positiveJordan, different_characteristic:differentCharacteristic }),
    findings:freeze({
      unknown_gauge_conjugacy_can_be_witnessed_without_oracle_conjugator:positiveDistinct.invertible_conjugator_found && positiveJordan.invertible_conjugator_found,
      trace_determinant_insufficient_on_repeated_root_classes:identityUnipotentTrap.trace_det_equal && !identityUnipotentTrap.fingerprints_equal && repeatedScaleTrap.trace_det_equal && !repeatedScaleTrap.fingerprints_equal,
      exhaustive_linear_conjugacy_solution_space_search_agrees_with_fingerprint_classifier:pass,
      gauntlet_validated:pass
    }),
    bounded_answer:pass
      ? 'GAUGE_BLIND_GL2_F31_HOLONOMY_CONJUGACY_CLASSIFICATION_SURVIVES_HOSTILE_REPEATED_ROOT_CONTROLS'
      : 'GAUGE_BLIND_GL2_F31_HOLONOMY_CONJUGACY_CLASSIFIER_FAILED',
    claim_ceiling:freeze({
      exact_finite_field_matrix_conjugacy_instrument:pass,
      universal_matrix_group_classifier:false,
      physical_gauge_symmetry:false,
      continuum_bundle:false,
      yang_mills_structure:false,
      berry_structure:false,
      quantum_behavior:false,
      proto_loom:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
