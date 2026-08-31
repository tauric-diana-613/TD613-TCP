import {
  ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_SCHEMA,
  atlasMinimalFaithfulReceiverClosureCertificate,
} from './atlas-minimal-faithful-receiver-closure.js';

export const ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA='td613.dome-world.atlas-matroidal-receiver-closure-basis-exchange/v0.1';
export const ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_PARENT_RECEIPT='ae53ebdc5fa970c162768fb694e826edc23fb0bb';

const E=Object.freeze([0,1,2,3]);
let cached=null;

function freeze(value){ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
const popcount=n=>E.reduce((s,i)=>s+((n>>i)&1),0);
const maskIndices=mask=>E.filter(i=>(mask>>i)&1);
const maskOf=xs=>xs.reduce((m,i)=>m|(1<<i),0);
const subseteq=(a,b)=>(a&~b)===0;
const union=(a,b)=>a|b;
const intersect=(a,b)=>a&b;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function frequency(values){ const out={}; for(const v of values){ const k=String(v); out[k]=(out[k]||0)+1; } return out; }

function closureTableFromParent(rows){
  const table=Array(16).fill(null);
  for(const row of rows) table[row.mask]=maskOf(row.closure);
  if(table.some(x=>x===null)) throw new Error('incomplete inherited closure table');
  return Object.freeze(table);
}

function rankFromClosure(closure,mask){
  let best=Infinity;
  for(let witness=0;witness<16;witness++) if(subseteq(mask,closure[witness])) best=Math.min(best,popcount(witness));
  return best;
}

function auditClosure(closure,parentMinimumMasks){
  let extensivityChecks=0,extensivityFailures=0,idempotenceChecks=0,idempotenceFailures=0;
  let monotonicityCandidatePairs=0,monotonicityInclusionPremises=0,monotonicityFailures=0;
  let steinitzCandidateTriples=0,steinitzTrueAntecedents=0,steinitzFailures=0;

  for(let s=0;s<16;s++){
    extensivityChecks+=1; if(!subseteq(s,closure[s])) extensivityFailures+=1;
    idempotenceChecks+=1; if(closure[closure[s]]!==closure[s]) idempotenceFailures+=1;
  }
  for(let s=0;s<16;s++) for(let t=0;t<16;t++){
    monotonicityCandidatePairs+=1;
    if(subseteq(s,t)){
      monotonicityInclusionPremises+=1;
      if(!subseteq(closure[s],closure[t])) monotonicityFailures+=1;
    }
  }
  for(let s=0;s<16;s++) for(const x of E) for(const y of E){
    steinitzCandidateTriples+=1;
    const yBit=1<<y,xBit=1<<x;
    const antecedent=(closure[s|xBit]&yBit)!==0&&(closure[s]&yBit)===0;
    if(antecedent){
      steinitzTrueAntecedents+=1;
      if((closure[s|yBit]&xBit)===0) steinitzFailures+=1;
    }
  }

  const ranks=Object.freeze(Array.from({length:16},(_,m)=>rankFromClosure(closure,m)));
  const fullRank=ranks[15];
  let rankClosureChecks=0,rankClosureFailures=0,rankSubmodularityPairs=0,rankSubmodularityFailures=0;
  for(let s=0;s<16;s++) for(const e of E){
    rankClosureChecks+=1;
    const inClosure=(closure[s]&(1<<e))!==0;
    const rankSame=ranks[s|(1<<e)]===ranks[s];
    if(inClosure!==rankSame) rankClosureFailures+=1;
  }
  for(let s=0;s<16;s++) for(let t=0;t<16;t++){
    rankSubmodularityPairs+=1;
    if(ranks[s]+ranks[t]<ranks[union(s,t)]+ranks[intersect(s,t)]) rankSubmodularityFailures+=1;
  }

  const independent=[];
  for(let m=0;m<16;m++) if(ranks[m]===popcount(m)) independent.push(m);
  const independentSet=new Set(independent);
  const bases=independent.filter(m=>ranks[m]===fullRank&&popcount(m)===fullRank);
  const basisSet=new Set(bases);
  const circuits=[];
  for(let m=1;m<16;m++){
    if(independentSet.has(m)) continue;
    const xs=maskIndices(m);
    if(xs.every(x=>independentSet.has(m&~(1<<x)))) circuits.push(m);
  }
  const loops=circuits.filter(m=>popcount(m)===1).map(m=>maskIndices(m)[0]);
  const loopSet=new Set(loops);
  const parallel=[];
  for(let i=0;i<4;i++) for(let j=i+1;j<4;j++){
    if(loopSet.has(i)||loopSet.has(j)) continue;
    const pair=(1<<i)|(1<<j);
    if(circuits.includes(pair)) parallel.push(Object.freeze([i,j]));
  }

  let basisExchangeObligations=0,basisExchangeFailures=0;
  for(const b1 of bases) for(const b2 of bases){
    for(const x of maskIndices(b1&~b2)){
      basisExchangeObligations+=1;
      const candidates=maskIndices(b2&~b1);
      if(!candidates.some(y=>basisSet.has((b1&~(1<<x))|(1<<y)))) basisExchangeFailures+=1;
    }
  }

  const rankFrequency=frequency(ranks);
  const basesEqualParent=same(bases,parentMinimumMasks);
  const allClosureAxioms=extensivityFailures===0&&idempotenceFailures===0&&monotonicityFailures===0&&steinitzFailures===0;
  const allRankAxioms=rankClosureFailures===0&&rankSubmodularityFailures===0;

  return freeze({
    closure:freeze([...closure]),
    closure_axioms:freeze({
      extensivity_checks:extensivityChecks,extensivity_failures:extensivityFailures,
      idempotence_checks:idempotenceChecks,idempotence_failures:idempotenceFailures,
      monotonicity_candidate_pairs:monotonicityCandidatePairs,monotonicity_inclusion_premises:monotonicityInclusionPremises,monotonicity_failures:monotonicityFailures,
      steinitz_candidate_triples:steinitzCandidateTriples,steinitz_true_antecedents:steinitzTrueAntecedents,steinitz_failures:steinitzFailures,
      all_closure_axioms:allClosureAxioms,
    }),
    rank:freeze({
      full_rank:fullRank,values:ranks,frequency:freeze(rankFrequency),
      closure_equivalence_checks:rankClosureChecks,closure_equivalence_failures:rankClosureFailures,
      submodularity_pairs:rankSubmodularityPairs,submodularity_failures:rankSubmodularityFailures,
      all_rank_axioms:allRankAxioms,
    }),
    combinatorics:freeze({
      independent_masks:freeze(independent),basis_masks:freeze(bases),circuit_masks:freeze(circuits),loop_indices:freeze(loops),nonloop_parallel_pairs:freeze(parallel),
      parent_minimum_faithful_masks:freeze([...parentMinimumMasks]),bases_equal_parent_minimum_faithful_masks:basesEqualParent,
      basis_exchange_obligations:basisExchangeObligations,basis_exchange_failures:basisExchangeFailures,
    }),
  });
}

export function atlasMatroidalReceiverClosureBasisExchangeCertificate(){
  if(cached) return cached;
  const parent=atlasMinimalFaithfulReceiverClosureCertificate();
  const parentExact=parent.passed===true&&ATLAS_MINIMAL_FAITHFUL_RECEIVER_CLOSURE_SCHEMA==='td613.dome-world.atlas-minimal-faithful-receiver-closure/v0.1'&&
    parent.D?.receiver_separation_rank===1&&parent.Q?.receiver_separation_rank===2&&
    same(parent.D?.minimum_faithful_masks,[2,4])&&same(parent.Q?.minimum_faithful_masks,[3,5,6])&&
    parent.D?.closure_fixedset_failures===0&&parent.Q?.closure_fixedset_failures===0;

  const dClosure=closureTableFromParent(parent.D.rows),qClosure=closureTableFromParent(parent.Q.rows);
  const D=auditClosure(dClosure,parent.D.minimum_faithful_masks),Q=auditClosure(qClosure,parent.Q.minimum_faithful_masks);

  const Dtype=D.rank.full_rank===1&&same(D.combinatorics.independent_masks,[0,2,4])&&same(D.combinatorics.basis_masks,[2,4])&&same(D.combinatorics.circuit_masks,[1,6,8])&&same(D.combinatorics.loop_indices,[0,3])&&same(D.combinatorics.nonloop_parallel_pairs,[[1,2]])?'U_1_2_PLUS_TWO_LOOPS':null;
  const Qtype=Q.rank.full_rank===2&&same(Q.combinatorics.independent_masks,[0,1,2,3,4,5,6])&&same(Q.combinatorics.basis_masks,[3,5,6])&&same(Q.combinatorics.circuit_masks,[7,8])&&same(Q.combinatorics.loop_indices,[3])&&same(Q.combinatorics.nonloop_parallel_pairs,[])?'U_2_3_PLUS_ONE_LOOP':null;

  const combined=freeze({
    extensivity_checks:D.closure_axioms.extensivity_checks+Q.closure_axioms.extensivity_checks,
    idempotence_checks:D.closure_axioms.idempotence_checks+Q.closure_axioms.idempotence_checks,
    monotonicity_candidate_pairs:D.closure_axioms.monotonicity_candidate_pairs+Q.closure_axioms.monotonicity_candidate_pairs,
    monotonicity_inclusion_premises:D.closure_axioms.monotonicity_inclusion_premises+Q.closure_axioms.monotonicity_inclusion_premises,
    steinitz_candidate_triples:D.closure_axioms.steinitz_candidate_triples+Q.closure_axioms.steinitz_candidate_triples,
    steinitz_true_antecedents:D.closure_axioms.steinitz_true_antecedents+Q.closure_axioms.steinitz_true_antecedents,
    rank_closure_equivalence_checks:D.rank.closure_equivalence_checks+Q.rank.closure_equivalence_checks,
    rank_submodularity_pairs:D.rank.submodularity_pairs+Q.rank.submodularity_pairs,
    basis_exchange_obligations:D.combinatorics.basis_exchange_obligations+Q.combinatorics.basis_exchange_obligations,
  });
  const failureTotal=D.closure_axioms.extensivity_failures+D.closure_axioms.idempotence_failures+D.closure_axioms.monotonicity_failures+D.closure_axioms.steinitz_failures+D.rank.closure_equivalence_failures+D.rank.submodularity_failures+D.combinatorics.basis_exchange_failures+
    Q.closure_axioms.extensivity_failures+Q.closure_axioms.idempotence_failures+Q.closure_axioms.monotonicity_failures+Q.closure_axioms.steinitz_failures+Q.rank.closure_equivalence_failures+Q.rank.submodularity_failures+Q.combinatorics.basis_exchange_failures;

  const exact=parentExact&&Dtype==='U_1_2_PLUS_TWO_LOOPS'&&Qtype==='U_2_3_PLUS_ONE_LOOP'&&
    same(D.rank.frequency,{'0':4,'1':12})&&same(Q.rank.frequency,{'0':2,'1':6,'2':8})&&
    D.closure_axioms.steinitz_true_antecedents===16&&Q.closure_axioms.steinitz_true_antecedents===30&&
    D.combinatorics.basis_exchange_obligations===2&&Q.combinatorics.basis_exchange_obligations===6&&
    D.combinatorics.bases_equal_parent_minimum_faithful_masks&&Q.combinatorics.bases_equal_parent_minimum_faithful_masks&&
    same(combined,{extensivity_checks:32,idempotence_checks:32,monotonicity_candidate_pairs:512,monotonicity_inclusion_premises:162,steinitz_candidate_triples:512,steinitz_true_antecedents:46,rank_closure_equivalence_checks:128,rank_submodularity_pairs:512,basis_exchange_obligations:8})&&failureTotal===0;

  cached=freeze({
    schema:ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_SCHEMA,
    parent_receipt:ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_PARENT_RECEIPT,
    parent_exact:parentExact,
    ground_set:freeze(['q00','q01','q10','q11']),
    D:freeze({...D,matroid_type:Dtype}),
    Q:freeze({...Q,matroid_type:Qtype}),
    combined_burden:combined,
    failure_total:failureTotal,
    laws:freeze({
      declared_native_receiver_closures_are_matroidal:D.closure_axioms.all_closure_axioms&&Q.closure_axioms.all_closure_axioms&&D.rank.all_rank_axioms&&Q.rank.all_rank_axioms,
      D_is_U_1_2_plus_two_loops:Dtype==='U_1_2_PLUS_TWO_LOOPS',
      Q_is_U_2_3_plus_one_loop:Qtype==='U_2_3_PLUS_ONE_LOOP',
      minimum_faithful_receivers_are_exactly_matroid_bases:D.combinatorics.bases_equal_parent_minimum_faithful_masks&&Q.combinatorics.bases_equal_parent_minimum_faithful_masks,
      native_receiver_separation_rank_equals_matroid_rank:D.rank.full_rank===parent.D.receiver_separation_rank&&Q.rank.full_rank===parent.Q.receiver_separation_rank,
      globally_fixed_refinements_are_matroid_loops:same(D.combinatorics.loop_indices,parent.D.empty_closure)&&same(Q.combinatorics.loop_indices,parent.Q.empty_closure),
      D_moving_refinements_form_unique_nonloop_parallel_pair:same(D.combinatorics.nonloop_parallel_pairs,[[1,2]]),
      universal_receiver_matroid_theorem_claimed:false,
      physical_matroid_claimed:false,
    }),
    membranes:freeze([
      'MATROIDAL_RECEIVER_CLOSURE != UNIVERSAL_RECEIVER_MATROID_THEOREM',
      'MATROID_RANK != SHANNON_INFORMATION',
      'MATROID_LOOP != PHYSICAL_DISCONNECTION',
      'MATROID_PARALLELISM != DUPLICATE_PHYSICAL_SENSOR',
      'BASIS != UNIQUE_OPTIMAL_EXPERIMENT',
      'RECEIVER_EXCHANGE != CAUSAL_SUBSTITUTABILITY',
      'FINITE_MATROID_ISOMORPHISM != PHYSICAL_STRUCTURE',
      'MINIMUM_FAITHFUL_RECEIVER_BASIS != MINIMUM_PHYSICAL_SENSOR_ARRAY',
      'CLOSURE_EXCHANGE_IN_THIS_FIXTURE != UNIVERSAL_CLOSURE_EXCHANGE',
      'ATLAS_REGISTRATION != LIVE_RUNTIME_STATE',
    ]),
    passed:exact,
  });
  return cached;
}

export const ATLAS_MATROIDAL_RECEIVER_CLOSURE_BASIS_EXCHANGE_CERTIFICATE=atlasMatroidalReceiverClosureBasisExchangeCertificate();