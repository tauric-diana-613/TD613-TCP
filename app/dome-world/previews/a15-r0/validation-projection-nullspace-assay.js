import {
  P_FULL,
  P_HOLD,
  POSITIVE_EDGES,
  observeOperator,
  probeRow,
  rankMod
} from './discrete-transport-tomography-closed-loop.js';

export const VALIDATION_NULLSPACE_SCHEMA='td613.pedagogue.validation-projection-nullspace/v0.1';
export const VALIDATION_SPEC_HEAD='3f80041af7dd9466066a7cd50a36b792c038e20f';
export const P_HOLD_GUARD=Object.freeze({probe_id:'P_HOLD_GUARD',x:Object.freeze([0,1]),p:Object.freeze([0,1])});
const MOD=31;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
const mod=value=>((value%MOD)+MOD)%MOD;

function invScalar(value){
  const a=mod(value);
  if(a===0) throw new Error('zero has no inverse in F_31');
  for(let candidate=1;candidate<MOD;candidate+=1) if(mod(a*candidate)===1) return candidate;
  throw new Error('missing field inverse');
}

function inverseMatrix(matrix){
  const n=matrix.length;
  const aug=matrix.map((row,r)=>[...row.map(mod),...Array.from({length:n},(_,c)=>r===c?1:0)]);
  for(let column=0;column<n;column+=1){
    let pivot=column;
    while(pivot<n&&aug[pivot][column]===0) pivot+=1;
    if(pivot===n) throw new Error('primary matrix singular');
    [aug[column],aug[pivot]]=[aug[pivot],aug[column]];
    const inverse=invScalar(aug[column][column]);
    for(let c=0;c<2*n;c+=1) aug[column][c]=mod(aug[column][c]*inverse);
    for(let row=0;row<n;row+=1){
      if(row===column) continue;
      const factor=aug[row][column];
      if(factor===0) continue;
      for(let c=0;c<2*n;c+=1) aug[row][c]=mod(aug[row][c]-factor*aug[column][c]);
    }
  }
  return freeze(aug.map(row=>freeze(row.slice(n))));
}

function rowTimesMatrix(row,matrix){
  return freeze(matrix[0].map((_,column)=>mod(row.reduce((sum,value,index)=>sum+value*matrix[index][column],0))));
}

function matrixVector(matrix,vector){
  return freeze(matrix.map(row=>mod(row.reduce((sum,value,index)=>sum+value*vector[index],0))));
}

function vectorToOperator(vector){ return freeze([[vector[0],vector[1]],[vector[2],vector[3]]]); }

function reconstructFromPrimary(primary,inverse){ return vectorToOperator(matrixVector(inverse,primary)); }

function validationResidual(operator,oracle,probe){ return mod(observeOperator(operator,probe)-observeOperator(oracle,probe)); }

function singleErrorSweep(oracle,Ainverse){
  const cleanPrimary=P_FULL.map(probe=>observeOperator(oracle,probe));
  const cases=[];
  for(let coordinate=0;coordinate<4;coordinate+=1){
    for(let magnitude=1;magnitude<MOD;magnitude+=1){
      const corrupted=[...cleanPrimary];
      corrupted[coordinate]=mod(corrupted[coordinate]+magnitude);
      const reconstructed=reconstructFromPrimary(corrupted,Ainverse);
      const legacyResidual=validationResidual(reconstructed,oracle,P_HOLD);
      const guardResidual=validationResidual(reconstructed,oracle,P_HOLD_GUARD);
      cases.push(freeze({
        primary_coordinate:coordinate,
        magnitude,
        corrupted_primary:freeze(corrupted),
        reconstructed_operator:reconstructed,
        legacy_residual:legacyResidual,
        legacy_detected:legacyResidual!==0,
        guard_residual:guardResidual,
        guard_detected:guardResidual!==0
      }));
    }
  }
  return freeze(cases);
}

export function runValidationProjectionNullspaceAssay(){
  const A=P_FULL.map(probeRow);
  const Ainverse=inverseMatrix(A);
  const legacyRow=probeRow(P_HOLD);
  const guardRow=probeRow(P_HOLD_GUARD);
  const legacySensitivity=rowTimesMatrix(legacyRow,Ainverse);
  const guardSensitivity=rowTimesMatrix(guardRow,Ainverse);
  const combined=freeze([legacySensitivity,guardSensitivity]);
  const combinedRank=rankMod(combined);
  const cases=singleErrorSweep(POSITIVE_EDGES.AB,Ainverse);

  const byCoordinate=Array.from({length:4},(_,coordinate)=>{
    const subset=cases.filter(item=>item.primary_coordinate===coordinate);
    return freeze({
      coordinate,
      case_count:subset.length,
      legacy_detected:subset.filter(item=>item.legacy_detected).length,
      legacy_missed:subset.filter(item=>!item.legacy_detected).length,
      guard_detected:subset.filter(item=>item.guard_detected).length,
      guard_missed:subset.filter(item=>!item.guard_detected).length
    });
  });

  const jointNullWitnesses=freeze([
    freeze([14,16,1,0]),
    freeze([2,30,0,1])
  ].map(vector=>freeze({vector,syndrome:matrixVector(combined,vector)})));

  const legacyExpected=JSON.stringify(legacySensitivity)===JSON.stringify([0,2,30,2]);
  const guardExpected=JSON.stringify(guardSensitivity)===JSON.stringify([30,30,30,1]);
  const legacyP1Blind=byCoordinate[0].legacy_missed===30;
  const legacyOthersDetect=byCoordinate.slice(1).every(item=>item.legacy_detected===30);
  const guardAllSingle=cases.every(item=>item.guard_detected);
  const jointNullPass=combinedRank===2&&jointNullWitnesses.every(item=>item.syndrome.every(value=>value===0));
  const pass=rankMod(A)===4&&legacyExpected&&guardExpected&&legacyP1Blind&&legacyOthersDetect&&guardAllSingle&&jointNullPass;

  return freeze({
    schema:VALIDATION_NULLSPACE_SCHEMA,
    spec_head:VALIDATION_SPEC_HEAD,
    arithmetic_domain:'F_31',
    primary_inverse:freeze({matrix:A,rank:rankMod(A),inverse:Ainverse}),
    validators:freeze({
      legacy:freeze({row:legacyRow,sensitivity:legacySensitivity}),
      guard:freeze({row:guardRow,sensitivity:guardSensitivity}),
      combined:freeze({sensitivity_matrix:combined,rank:combinedRank,nullity:4-combinedRank})
    }),
    exhaustive_single_error_family:freeze({
      case_count:cases.length,
      cases,
      by_coordinate:freeze(byCoordinate),
      legacy_detected_total:cases.filter(item=>item.legacy_detected).length,
      legacy_missed_total:cases.filter(item=>!item.legacy_detected).length,
      guard_detected_total:cases.filter(item=>item.guard_detected).length,
      guard_missed_total:cases.filter(item=>!item.guard_detected).length
    }),
    coordinated_error_nullspace:freeze({
      rank:combinedRank,
      nullity:4-combinedRank,
      materialized_null_witnesses:jointNullWitnesses
    }),
    findings:freeze({
      legacy_heldout_has_single_primary_error_blind_direction:legacyP1Blind,
      guard_validator_detects_all_nonzero_single_primary_coordinate_errors:guardAllSingle,
      combined_validators_retain_coordinated_error_nullspace:jointNullPass,
      heldout_does_not_imply_geometric_independence:true,
      all_single_coordinate_errors_detected_does_not_imply_all_multi_coordinate_errors_detected:true,
      assay_mechanism_validated:pass
    }),
    bounded_answer:pass
      ? 'VALIDATION_IS_ITSELF_A_PROJECTION_DESIGN_PROBLEM_IN_AUTHORED_F31_INVERSE_FIXTURE'
      : 'VALIDATION_PROJECTION_NULLSPACE_ASSAY_FAILED',
    claims:freeze({
      exact_finite_validation_geometry:pass,
      stochastic_robustness:false,
      deployed_adversarial_robustness:false,
      statistical_generalization:false,
      physical_sensor_reliability:false,
      production_authority:false,
      vercel_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    human_closure_required:true
  });
}
