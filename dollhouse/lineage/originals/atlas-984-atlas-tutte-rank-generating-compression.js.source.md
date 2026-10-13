import {
  ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_SCHEMA,
  atlasReceiverMatroidMinorsFaultToleranceCertificate,
} from './atlas-receiver-matroid-minors-fault-tolerance.js';
import {
  ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA,
  atlasMatroidalReceiverClosureBasisExchangeCertificate,
} from './atlas-matroidal-receiver-closure-basis-exchange.js';

export const ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_SCHEMA='td613.dome-world.atlas-tutte-rank-generating-compression/v0.1';
export const ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_PARENT_RECEIPT='62722caea3f35bd520a2a1bfa5163f8cd2e14c26';

const ALL4=15;
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const popcount=n=>n.toString(2).replace(/0/g,'').length;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function binom(n,k){ if(k<0||k>n) return 0; if(k===0||k===n) return 1; let out=1; for(let i=1;i<=k;i++) out=out*(n-k+i)/i; return out; }
function addTerm(map,a,b,c){ if(!c) return; const key=`${a},${b}`; map.set(key,(map.get(key)||0)+c); }
function cleanTerms(map){ return Object.freeze([...map.entries()].map(([key,c])=>{ const [a,b]=key.split(',').map(Number); return {a,b,c}; }).filter(t=>t.c!==0).sort((p,q)=>p.a-q.a||p.b-q.b).map(freeze)); }
function publicTerms(terms,names){ return Object.freeze(terms.map(t=>freeze({[names[0]]:t.a,[names[1]]:t.b,c:t.c}))); }
function evaluate(terms,x,y){ let out=0; for(const t of terms) out+=t.c*(x**t.a)*(y**t.b); return out; }
function addPolynomials(a,b){ const map=new Map(); for(const t of [...a,...b]) addTerm(map,t.a,t.b,t.c); return cleanTerms(map); }
function multiplyVariable(terms,axis){ return Object.freeze(terms.map(t=>freeze({a:t.a+(axis==='x'?1:0),b:t.b+(axis==='y'?1:0),c:t.c}))); }

function rankGenerating(rank){
  const map=new Map(),fullRank=rank[rank.length-1];
  let subsetTerms=0;
  for(let mask=0;mask<rank.length;mask++){
    subsetTerms+=1;
    addTerm(map,fullRank-rank[mask],popcount(mask)-rank[mask],1);
  }
  const terms=cleanTerms(map);
  return freeze({full_rank:fullRank,subset_terms:subsetTerms,terms,coefficient_sum:terms.reduce((s,t)=>s+t.c,0)});
}

function toTutte(rankTerms){
  const map=new Map(); let rawContributions=0;
  for(const t of rankTerms){
    for(let i=0;i<=t.a;i++) for(let j=0;j<=t.b;j++){
      rawContributions+=1;
      const c=t.c*binom(t.a,i)*((t.a-i)%2?-1:1)*binom(t.b,j)*((t.b-j)%2?-1:1);
      addTerm(map,i,j,c);
    }
  }
  return freeze({terms:cleanTerms(map),raw_substitution_contributions:rawContributions});
}

function deletionEnumeratorFromSpanningSlice(rankTerms,n,fullRank){
  const coeffs=Array(n+1).fill(0);
  for(const t of rankTerms){
    if(t.a!==0) continue;
    const deletionSize=n-fullRank-t.b;
    if(deletionSize>=0&&deletionSize<=n) coeffs[deletionSize]+=t.c;
  }
  return Object.freeze(coeffs);
}
function deriveTutte(rank){ const R=rankGenerating(rank),T=toTutte(R.terms); return freeze({R,T}); }
function elementClass(rank,e){ const full=rank[ALL4]; if(rank[1<<e]===0) return 'loop'; if(full-rank[ALL4&~(1<<e)]===1) return 'coloop'; return 'ordinary'; }
function expectedMinorPolynomials(){ return freeze({
  U_1_2_PLUS_ONE_LOOP: freeze([{a:0,b:2,c:1},{a:1,b:1,c:1}].map(freeze)),
  U_1_1_PLUS_TWO_LOOPS: freeze([{a:1,b:2,c:1}].map(freeze)),
  U_0_3: freeze([{a:0,b:3,c:1}].map(freeze)),
  U_2_3: freeze([{a:0,b:1,c:1},{a:1,b:0,c:1},{a:2,b:0,c:1}].map(freeze)),
  U_2_2_PLUS_ONE_LOOP: freeze([{a:2,b:1,c:1}].map(freeze)),
}); }

function auditControl(name,rank,parentMatroid,parentMinorSurface){
  const parent=deriveTutte(rank),specializations=freeze({
    '1,1':evaluate(parent.T.terms,1,1),'2,1':evaluate(parent.T.terms,2,1),'1,2':evaluate(parent.T.terms,1,2),'2,2':evaluate(parent.T.terms,2,2),
  });
  const recoveredDeletion=deletionEnumeratorFromSpanningSlice(parent.R.terms,4,parent.R.full_rank);
  const minorExpected=expectedMinorPolynomials(),seenByType=new Map();
  let minorRankTerms=0,minorTypePolynomialFailures=0;
  const minorRows={delete:[],contract:[]};
  for(const [op,key] of [['delete','deletion'],['contract','contraction']]){
    for(const row of parentMinorSurface.minors[key]){
      minorRankTerms+=row.values.length;
      const derived=deriveTutte(row.values);
      if(seenByType.has(row.type)&&!same(seenByType.get(row.type),derived.T.terms)) minorTypePolynomialFailures+=1;
      else if(!seenByType.has(row.type)) seenByType.set(row.type,derived.T.terms);
      if(!same(derived.T.terms,minorExpected[row.type])) minorTypePolynomialFailures+=1;
      minorRows[op].push(freeze({element:row.element,type:row.type,rank_terms:derived.R.subset_terms,tutte_terms:publicTerms(derived.T.terms,['x','y'])}));
    }
  }

  let recurrenceFailures=0,loopIdentities=0,coloopIdentities=0,ordinaryIdentities=0;
  const recurrence=[];
  for(let e=0;e<4;e++){
    const cls=elementClass(rank,e);
    const d=deriveTutte(parentMinorSurface.minors.deletion[e].values).T.terms;
    const c=deriveTutte(parentMinorSurface.minors.contraction[e].values).T.terms;
    let rhs;
    if(cls==='loop'){ loopIdentities+=1; rhs=multiplyVariable(d,'y'); }
    else if(cls==='coloop'){ coloopIdentities+=1; rhs=multiplyVariable(c,'x'); }
    else { ordinaryIdentities+=1; rhs=addPolynomials(d,c); }
    const passed=same(parent.T.terms,rhs); if(!passed) recurrenceFailures+=1;
    recurrence.push(freeze({element:e,class:cls,passed}));
  }

  const basisCount=parentMatroid.combinatorics.basis_masks.length;
  const independentCount=parentMatroid.combinatorics.independent_masks.length;
  const spanningCount=parentMinorSurface.deletion.rank_preserving_masks.length;
  const specializationCrossChecks=freeze({
    bases:specializations['1,1']===basisCount,
    independent_sets:specializations['2,1']===independentCount,
    spanning_sets:specializations['1,2']===spanningCount,
    all_subsets:specializations['2,2']===16,
  });

  return freeze({
    name,full_rank:parent.R.full_rank,
    rank_generating_terms:publicTerms(parent.R.terms,['u','v']),rank_generating_coefficient_sum:parent.R.coefficient_sum,subset_rank_terms:parent.R.subset_terms,
    raw_substitution_contributions:parent.T.raw_substitution_contributions,tutte_terms:publicTerms(parent.T.terms,['x','y']),tutte_internal:parent.T.terms,
    specializations,specialization_cross_checks:specializationCrossChecks,
    spanning_slice_deletion_coefficients:recoveredDeletion,earned_rank_preserving_deletion_coefficients:freeze([...parentMinorSurface.deletion.rank_preserving_by_size]),
    deletion_enumerator_recovered:same(recoveredDeletion,parentMinorSurface.deletion.rank_preserving_by_size),
    element_classes:freeze(Array.from({length:4},(_,e)=>elementClass(rank,e))),recurrence:freeze(recurrence),recurrence_failures:recurrenceFailures,
    loop_identities:loopIdentities,coloop_identities:coloopIdentities,ordinary_identities:ordinaryIdentities,
    minor_rank_terms:minorRankTerms,minor_type_polynomial_failures:minorTypePolynomialFailures,
    minor_rows:freeze({delete:freeze(minorRows.delete),contract:freeze(minorRows.contract)}),
  });
}

export function atlasTutteRankGeneratingCompressionCertificate(){
  if(cached) return cached;
  const parent=atlasReceiverMatroidMinorsFaultToleranceCertificate();
  const matroid=atlasMatroidalReceiverClosureBasisExchangeCertificate();
  const parentExact=parent.passed===true&&ATLAS_RECEIVER_MATROID_MINORS_FAULT_TOLERANCE_SCHEMA==='td613.dome-world.atlas-receiver-matroid-minors-fault-tolerance/v0.1'&&
    parent.D?.deletion?.deletion_distance===2&&parent.Q?.deletion?.deletion_distance===2&&
    same(parent.D?.deletion?.rank_preserving_by_size,[1,4,5,2,0])&&same(parent.Q?.deletion?.rank_preserving_by_size,[1,4,3,0,0])&&parent.cross_control_bridge?.passed===true&&
    matroid.passed===true&&ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA==='td613.dome-world.atlas-matroidal-receiver-closure-basis-exchange/v0.1';

  const D=auditControl('D',matroid.D.rank.values,matroid.D,parent.D),Q=auditControl('Q',matroid.Q.rank.values,matroid.Q,parent.Q);
  const targetDR=freeze([{u:0,v:0,c:2},{u:0,v:1,c:5},{u:0,v:2,c:4},{u:0,v:3,c:1},{u:1,v:0,c:1},{u:1,v:1,c:2},{u:1,v:2,c:1}].map(freeze));
  const targetQR=freeze([{u:0,v:0,c:3},{u:0,v:1,c:4},{u:0,v:2,c:1},{u:1,v:0,c:3},{u:1,v:1,c:3},{u:2,v:0,c:1},{u:2,v:1,c:1}].map(freeze));
  const targetDT=freeze([{x:0,y:3,c:1},{x:1,y:2,c:1}].map(freeze));
  const targetQT=freeze([{x:0,y:2,c:1},{x:1,y:1,c:1},{x:2,y:1,c:1}].map(freeze));
  const specializationFailures=[D,Q].reduce((s,row)=>s+Object.values(row.specialization_cross_checks).filter(v=>!v).length,0);
  const aggregate=freeze({
    parent_subset_rank_terms:D.subset_rank_terms+Q.subset_rank_terms,coefficient_sum_identities:2,
    raw_substitution_contributions:D.raw_substitution_contributions+Q.raw_substitution_contributions,
    minor_rank_terms:D.minor_rank_terms+Q.minor_rank_terms,deletion_contraction_identities:D.recurrence.length+Q.recurrence.length,
    loop_identities:D.loop_identities+Q.loop_identities,coloop_identities:D.coloop_identities+Q.coloop_identities,ordinary_identities:D.ordinary_identities+Q.ordinary_identities,
    specialization_identities:8,deletion_enumerator_recoveries:2,
    failures:D.recurrence_failures+Q.recurrence_failures+D.minor_type_polynomial_failures+Q.minor_type_polynomial_failures+specializationFailures+(D.deletion_enumerator_recovered?0:1)+(Q.deletion_enumerator_recovered?0:1),
  });

  const exact=parentExact&&same(D.rank_generating_terms,targetDR)&&same(Q.rank_generating_terms,targetQR)&&D.rank_generating_coefficient_sum===16&&Q.rank_generating_coefficient_sum===16&&
    D.raw_substitution_contributions===22&&Q.raw_substitution_contributions===21&&same(D.tutte_terms,targetDT)&&same(Q.tutte_terms,targetQT)&&
    same(D.specializations,{'1,1':2,'2,1':3,'1,2':12,'2,2':16})&&same(Q.specializations,{'1,1':3,'2,1':7,'1,2':8,'2,2':16})&&
    same(D.spanning_slice_deletion_coefficients,[1,4,5,2,0])&&same(Q.spanning_slice_deletion_coefficients,[1,4,3,0,0])&&
    same(D.element_classes,['loop','ordinary','ordinary','loop'])&&same(Q.element_classes,['ordinary','ordinary','ordinary','loop'])&&
    same(aggregate,{parent_subset_rank_terms:32,coefficient_sum_identities:2,raw_substitution_contributions:43,minor_rank_terms:128,deletion_contraction_identities:8,loop_identities:3,coloop_identities:0,ordinary_identities:5,specialization_identities:8,deletion_enumerator_recoveries:2,failures:0});

  cached=freeze({
    schema:ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_SCHEMA,parent_receipt:ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_PARENT_RECEIPT,parent_exact:parentExact,D,Q,aggregate,
    laws:freeze({
      exact_rank_generating_compression:exact,exact_tutte_polynomials:exact,
      all_elementwise_deletion_contraction_identities:D.recurrence_failures===0&&Q.recurrence_failures===0,
      standard_specializations_recover_earned_counts:specializationFailures===0,
      spanning_slice_recovers_earned_deletion_enumerators:D.deletion_enumerator_recovered&&Q.deletion_enumerator_recovered,
      complete_matroid_isomorphism_invariant_claimed:false,lossless_history_reconstruction_claimed:false,universal_statistic_sufficiency_claimed:false,
      physical_reliability_claimed:false,causal_deletion_contraction_claimed:false,
    }),
    membranes:freeze([
      'TUTTE_POLYNOMIAL != COMPLETE_MATROID_ISOMORPHISM_INVARIANT','CORANK_NULLITY_COMPRESSION != LOSSLESS_HISTORY_RECONSTRUCTION',
      'POLYNOMIAL_SPECIALIZATION != UNIVERSAL_STATISTIC_SUFFICIENCY','TUTTE_COEFFICIENT != SHANNON_INFORMATION',
      'DELETION_CONTRACTION_RECURRENCE != CAUSAL_REMOVAL_OR_INTERVENTION','SPANNING_SET_COUNT != PHYSICAL_RELIABILITY',
      'RANK_PRESERVING_DELETION_ENUMERATOR != PHYSICAL_RELIABILITY_CURVE','MATROID_POLYNOMIAL != PHYSICAL_SYSTEM_POLYNOMIAL','ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_TUTTE_RANK_GENERATING_COMPRESSION_CERTIFICATE=atlasTutteRankGeneratingCompressionCertificate();
