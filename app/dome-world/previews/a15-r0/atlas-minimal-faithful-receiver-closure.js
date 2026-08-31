import {
  ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_SCHEMA,
  atlasNativeSymmetryReceiverStratificationCertificate,
} from './atlas-native-symmetry-receiver-stratification.js';
import {
  ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA,
  atlasAutomorphismLiftExactnessCertificate,
} from './atlas-automorphism-lift-exactness.js';

export const ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_SCHEMA='td613.dome-world.atlas-minimal-faithful-receiver-closure/v0.1';
export const ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_PARENT_RECEIPT='b56e7bbea41e93bdc9f9d59e053be4733a1d5e41';

const V=Object.freeze([[0,0],[1,0],[0,1],[1,1]].map(v=>Object.freeze(v)));
const V_INDEX=new Map(V.map((v,i)=>[v.join(''),i]));
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const qId=q=>q.join('');
function allMatrices(){ const out=[]; for(let n=0;n<16;n++) out.push(Object.freeze([[n&1,(n>>1)&1],[(n>>2)&1,(n>>3)&1]].map(r=>Object.freeze(r)))); return Object.freeze(out); }
function detF2(m){ return ((m[0][0]&m[1][1])^(m[0][1]&m[1][0]))&1; }
function transformIndex(m,index){ const [x,y]=V[index],out=[(m[0][0]&x)^(m[0][1]&y),(m[1][0]&x)^(m[1][1]&y)]; return V_INDEX.get(out.join('')); }
function inverseMatrix(m,gl){ for(const c of gl){ let ok=true; for(let i=0;i<4;i++) if(transformIndex(c,transformIndex(m,i))!==i){ok=false;break;} if(ok) return c; } throw new Error('missing GL(2,2) inverse'); }
function preservesBeta(m,beta){ for(let u=0;u<4;u++) for(let v=0;v<4;v++) if(beta[transformIndex(m,u)][transformIndex(m,v)]!==beta[u][v]) return false; return true; }
function preservesQ(m,q){ for(let u=0;u<4;u++) if(q[transformIndex(m,u)]!==q[u]) return false; return true; }
function pullback(q,m,gl){ const inv=inverseMatrix(m,gl); return Object.freeze(V.map((_,i)=>q[transformIndex(inv,i)])); }
function maskIndices(mask){ return Object.freeze([0,1,2,3].filter(i=>(mask>>i)&1)); }
function freq(rows,key){ const out={}; for(const row of rows){ const k=String(row[key]); out[k]=(out[k]||0)+1; } return out; }
function sameArray(a,b){ return JSON.stringify(a)===JSON.stringify(b); }

function actionPermutations(refinements,group,gl){
  const index=new Map(refinements.map((q,i)=>[qId(q),i]));
  return Object.freeze(group.map(m=>Object.freeze(refinements.map(q=>index.get(qId(pullback(q,m,gl)))))));
}

function auditSubsets(permutations,automorphismLiftMultiplicity){
  const groupSize=permutations.length,rows=[];
  let signatureChecks=0,signaturePairChecks=0,closureOrderedPairChecks=0,indexLawFailures=0,closureFixFailures=0;
  for(let mask=0;mask<16;mask++){
    const selected=maskIndices(mask),signatures=[];
    for(const p of permutations){ signatureChecks+=1; signatures.push(Object.freeze(selected.map(i=>p[i]))); }
    const signatureIds=signatures.map(s=>JSON.stringify(s));
    const fibers=new Map();
    for(const id of signatureIds) fibers.set(id,(fibers.get(id)||0)+1);
    for(let i=0;i<groupSize;i++) for(let j=i+1;j<groupSize;j++) signaturePairChecks+=1;
    const classCount=fibers.size;
    const outerFiberSizes=Object.freeze([...fibers.values()].sort((a,b)=>a-b));
    const automorphismFiberSizes=Object.freeze(outerFiberSizes.map(n=>n*automorphismLiftMultiplicity).sort((a,b)=>a-b));
    const stabilizer=permutations.filter(p=>selected.every(i=>p[i]===i));
    const stabilizerSize=stabilizer.length,index=groupSize/stabilizerSize;
    if(index!==classCount) indexLawFailures+=1;

    const closure=[];
    for(let x=0;x<4;x++){
      let determined=true;
      for(let gi=0;gi<groupSize;gi++) for(let hi=0;hi<groupSize;hi++){
        closureOrderedPairChecks+=1;
        const agree=selected.every(i=>permutations[gi][i]===permutations[hi][i]);
        if(agree&&permutations[gi][x]!==permutations[hi][x]) determined=false;
      }
      if(determined) closure.push(x);
    }
    const fixedSet=[0,1,2,3].filter(x=>stabilizer.every(p=>p[x]===x));
    if(!sameArray(closure,fixedSet)) closureFixFailures+=1;
    rows.push(freeze({mask,selected,class_count:classCount,outer_fiber_sizes:outerFiberSizes,automorphism_fiber_sizes:automorphismFiberSizes,pointwise_stabilizer_size:stabilizerSize,index,closure:freeze(closure),fixed_set:freeze(fixedSet)}));
  }
  const faithful=rows.filter(r=>r.class_count===groupSize),rank=Math.min(...faithful.map(r=>r.selected.length));
  const minimumMasks=faithful.filter(r=>r.selected.length===rank).map(r=>r.mask);
  return freeze({
    group_size:groupSize,rows:freeze(rows),signature_checks:signatureChecks,signature_pair_checks:signaturePairChecks,
    closure_ordered_pair_checks:closureOrderedPairChecks,index_law_failures:indexLawFailures,closure_fixedset_failures:closureFixFailures,
    receiver_class_frequency:freeze(freq(rows,'class_count')),closure_size_frequency:freeze(freq(rows.map(r=>({closure_size:r.closure.length})),'closure_size')),
    faithful_subset_count:faithful.length,receiver_separation_rank:rank,minimum_faithful_masks:freeze(minimumMasks),empty_closure:freeze([...rows[0].closure]),
  });
}

export function atlasMinimalFaithfulReceiverClosureCertificate(){
  if(cached) return cached;
  const parent=atlasNativeSymmetryReceiverStratificationCertificate();
  const lift=atlasAutomorphismLiftExactnessCertificate();
  const parentExact=parent.passed===true&&ATLAS_NATIVE_SYMMETRY_RECEIVER_STRATIFICATION_SCHEMA==='td613.dome-world.atlas-native-symmetry-receiver-stratification/v0.1'&&
    parent.D?.native_outer_size===2&&parent.Q?.native_outer_size===6&&
    JSON.stringify(parent.D?.orbit_sizes)===JSON.stringify([2,1,1])&&JSON.stringify(parent.Q?.orbit_sizes)===JSON.stringify([3,1])&&
    lift.passed===true&&ATLAS_AUTOMORPHISM_LIFT_EXACTNESS_SCHEMA==='td613.dome-world.atlas-automorphism-lift-exactness/v0.1'&&
    JSON.stringify(lift.D?.lift_fiber_sizes)===JSON.stringify([4,4])&&JSON.stringify(lift.Q?.lift_fiber_sizes)===JSON.stringify([4,4,4,4,4,4]);

  const refinements=parent.refinement_reconstruction.vectors.map(q=>Object.freeze([...q]));
  const beta=lift.geometry.D_beta;
  const matrices=allMatrices(),gl=matrices.filter(m=>detF2(m)===1),pairing=gl.filter(m=>preservesBeta(m,beta));
  const dNative=pairing.filter(m=>preservesQ(m,lift.D.q)),qNative=pairing.filter(m=>preservesQ(m,lift.Q.q));
  const dPermutations=actionPermutations(refinements,dNative,gl),qPermutations=actionPermutations(refinements,qNative,gl);
  const D=auditSubsets(dPermutations,4),Q=auditSubsets(qPermutations,4);

  const targetDClasses=[1,1,2,2,2,2,2,2,1,1,2,2,2,2,2,2];
  const targetQClasses=[1,3,3,6,3,6,6,6,1,3,3,6,3,6,6,6];
  const full=[0,1,2,3];
  const targetDClosures=Array.from({length:16},(_,mask)=>[0,1,8,9].includes(mask)?[0,3]:full);
  const targetQClosures=[[3],[0,3],[1,3],full,[2,3],full,full,full,[3],[0,3],[1,3],full,[2,3],full,full,full];
  const expectedDAutFibers=count=>count===1?[8]:[4,4];
  const expectedQAutFibers=count=>count===1?[24]:(count===3?[8,8,8]:[4,4,4,4,4,4]);
  const autFibersExact=D.rows.every(r=>sameArray(r.automorphism_fiber_sizes,expectedDAutFibers(r.class_count)))&&Q.rows.every(r=>sameArray(r.automorphism_fiber_sizes,expectedQAutFibers(r.class_count)));

  const exact=parentExact&&refinements.length===4&&JSON.stringify(refinements.map(qId))===JSON.stringify(['0001','0010','0100','0111'])&&
    matrices.length===16&&gl.length===6&&pairing.length===6&&dNative.length===2&&qNative.length===6&&
    JSON.stringify(D.rows.map(r=>r.class_count))===JSON.stringify(targetDClasses)&&JSON.stringify(Q.rows.map(r=>r.class_count))===JSON.stringify(targetQClasses)&&
    JSON.stringify(D.rows.map(r=>r.closure))===JSON.stringify(targetDClosures)&&JSON.stringify(Q.rows.map(r=>r.closure))===JSON.stringify(targetQClosures)&&
    JSON.stringify(D.receiver_class_frequency)===JSON.stringify({'1':4,'2':12})&&JSON.stringify(Q.receiver_class_frequency)===JSON.stringify({'1':2,'3':6,'6':8})&&
    JSON.stringify(D.closure_size_frequency)===JSON.stringify({'2':4,'4':12})&&JSON.stringify(Q.closure_size_frequency)===JSON.stringify({'1':2,'2':6,'4':8})&&
    D.signature_checks===32&&Q.signature_checks===96&&D.signature_pair_checks===16&&Q.signature_pair_checks===240&&
    D.closure_ordered_pair_checks===256&&Q.closure_ordered_pair_checks===2304&&D.index_law_failures===0&&Q.index_law_failures===0&&D.closure_fixedset_failures===0&&Q.closure_fixedset_failures===0&&
    D.receiver_separation_rank===1&&Q.receiver_separation_rank===2&&JSON.stringify(D.minimum_faithful_masks)===JSON.stringify([2,4])&&JSON.stringify(Q.minimum_faithful_masks)===JSON.stringify([3,5,6])&&
    D.faithful_subset_count===12&&Q.faithful_subset_count===8&&JSON.stringify(D.empty_closure)===JSON.stringify([0,3])&&JSON.stringify(Q.empty_closure)===JSON.stringify([3])&&autFibersExact;

  cached=freeze({
    schema:ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_SCHEMA,
    parent_receipt:ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_PARENT_RECEIPT,
    parent_exact:parentExact,
    refinement_count:refinements.length,
    subset_count:16,
    geometry:freeze({GL2F2_size:gl.length,pairing_automorphisms:pairing.length,D_native_size:dNative.length,Q_native_size:qNative.length}),
    burden:freeze({subset_receiver_signature_checks:D.signature_checks+Q.signature_checks,subset_signature_pair_checks:D.signature_pair_checks+Q.signature_pair_checks,closure_ordered_pair_checks:D.closure_ordered_pair_checks+Q.closure_ordered_pair_checks}),
    D,Q,
    laws:freeze({
      D_minimal_faithful_receiver_rank_one:D.receiver_separation_rank===1,
      Q_minimal_faithful_receiver_rank_two:Q.receiver_separation_rank===2,
      minimal_receiver_rank_native_symmetry_dependent:D.receiver_separation_rank!==Q.receiver_separation_rank,
      receiver_class_count_equals_pointwise_stabilizer_index:D.index_law_failures===0&&Q.index_law_failures===0,
      receiver_closure_equals_pointwise_stabilizer_fixed_set:D.closure_fixedset_failures===0&&Q.closure_fixedset_failures===0,
      globally_fixed_refinements_can_enter_empty_closure_without_outer_identifiability:sameArray(D.empty_closure,[0,3])&&sameArray(Q.empty_closure,[3]),
      native_receiver_rank_equated_to_action_evaluation_rank:false,
      physical_sensor_minimum_claimed:false,
      shannon_capacity_theorem_claimed:false,
    }),
    membranes:freeze([
      'MINIMAL_FAITHFUL_RECEIVER != PHYSICAL_SENSOR_MINIMUM',
      'NATIVE_RECEIVER_SEPARATION_RANK != ACTION_EVALUATION_RANK',
      'POINTWISE_STABILIZER != SECURITY_PERMISSION_SET',
      'RECEIVER_CLOSURE != CAUSAL_RECOVERABILITY',
      'CLOSURE_MEMBERSHIP != OBSERVED_INPUT',
      'GLOBAL_FIXED_REFINEMENT != INFORMATIVE_RECEIVER_COORDINATE',
      'OUTER_ACTION_IDENTIFIABILITY != SOURCE_PROVENANCE_IDENTIFICATION',
      'NATIVE_OUTER_ACTION != PHYSICAL_SYMMETRY_GROUP',
      'FINITE_SUBSET_CENSUS != SHANNON_CAPACITY_THEOREM',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_CERTIFICATE=atlasMinimalFaithfulReceiverClosureCertificate();