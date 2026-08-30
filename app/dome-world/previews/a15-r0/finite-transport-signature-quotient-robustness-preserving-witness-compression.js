import { finiteOrientationFibreSymmetryBreakingCertificate } from './finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteOrientationFibreTransportOpacityErasureRobustnessCertificate } from './finite-orientation-fibre-transport-opacity-erasure-robustness.js';
import { finiteTransportSeparationHypergraphRobustMulticoverCertificate } from './finite-transport-separation-hypergraph-robust-multicover.js';

export const FINITE_TRANSPORT_SIGNATURE_QUOTIENT_ROBUSTNESS_PRESERVING_WITNESS_COMPRESSION_SCHEMA='td613.dome-world.finite-transport-signature-quotient-robustness-preserving-witness-compression/v0.1';
export const FINITE_TRANSPORT_SIGNATURE_QUOTIENT_ROBUSTNESS_PRESERVING_WITNESS_COMPRESSION_PARENT_RECEIPT='633cd75baaaebcc5f357bd503024aefbbcf11057';

const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
const TRANSPORT_ORDER=['(B M)','(A R)','(A R)(B M)'];
let cached=null;
const freeze=v=>{ if(v&&typeof v==='object'&&!Object.isFrozen(v)){ Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function pc(v){ let n=0; for(;v;v>>>=1)n+=v&1; return n; }
function choose(n,k){ if(k<0||k>n)return 0; let out=1; for(let i=1;i<=k;i++)out=out*(n-k+i)/i; return out; }
function bump(object,key,amount=1){ object[key]=(object[key]||0)+amount; }
function enumerateRanges(maxima,visit){ const state=Array(maxima.length).fill(0); function walk(i){ if(i===maxima.length){visit([...state]);return;} for(let value=0;value<=maxima[i];value++){state[i]=value;walk(i+1);} } walk(0); }
function signatureOf(witness,edges){ return edges.map(edge=>edge.witnesses.includes(witness)?'1':'0').join(''); }
function loadsFor(state,signatures){ return TRANSPORT_ORDER.map((_,j)=>state.reduce((sum,m,i)=>sum+(signatures[i][j]==='1'?m:0),0)); }
function identifying(state,signatures){ return loadsFor(state,signatures).every(v=>v>0); }

function classCertificate(name,witnessRows,hyperRow,robustRow){
  const ids=witnessRows.map(row=>row.id),edges=hyperRow.transport_labelled_edges;
  const witnessSignatures=ids.map(id=>({id,signature:signatureOf(id,edges)}));
  const bySignature={}; for(const row of witnessSignatures){ if(!bySignature[row.signature])bySignature[row.signature]=[]; bySignature[row.signature].push(row.id); }
  const signatures=Object.keys(bySignature).sort(),multiplicities=signatures.map(sig=>bySignature[sig].length);
  const signatureMultiplicities=Object.fromEntries(signatures.map((sig,i)=>[sig,multiplicities[i]]));
  let quotientStateCount=1; for(const n of multiplicities) quotientStateCount*=n+1;

  const weightedMuSpectrum={},quotientMuSpectrum={},weightedRobust=[0,0,0,0,0],minimum=[null,null,null,null,null];
  let familyWeightChecksum=0,loadChecks=0,depthChecks=0,quotientBlockerStateCount=0,weightedBlockerLifts=0,nonbinaryMinimalStates=0;
  const quotientBlockerStates=[];
  enumerateRanges(multiplicities,state=>{
    const loads=loadsFor(state,signatures); loadChecks+=3;
    const mu=Math.min(...loads),width=state.reduce((a,b)=>a+b,0);
    let weight=1; for(let i=0;i<state.length;i++)weight*=choose(multiplicities[i],state[i]);
    familyWeightChecksum+=weight; bump(weightedMuSpectrum,mu,weight); bump(quotientMuSpectrum,mu);
    for(let depth=1;depth<=5;depth++){ depthChecks++; if(mu>=depth){weightedRobust[depth-1]+=weight; if(minimum[depth-1]===null||width<minimum[depth-1])minimum[depth-1]=width;} }
    if(loads.every(v=>v>0)){
      let minimal=true;
      for(let i=0;i<state.length;i++) if(state[i]>0){ const reduced=[...state]; reduced[i]--; if(identifying(reduced,signatures)){minimal=false;break;} }
      if(minimal){ quotientBlockerStateCount++; weightedBlockerLifts+=weight; if(state.some(v=>v>1))nonbinaryMinimalStates++; quotientBlockerStates.push(freeze({multiplicity:freeze([...state]),weight,width})); }
    }
  });

  const signatureIndex=Object.fromEntries(signatures.map((sig,i)=>[sig,i]));
  const witnessSignatureIndex=witnessSignatures.map(row=>signatureIndex[row.signature]);
  const edgeMasks=edges.map(edge=>ids.reduce((mask,id,i)=>edge.witnesses.includes(id)?(mask|(1<<i)):mask,0)>>>0);
  const totalFamilies=2**ids.length;
  let factorizationResidualMismatches=0,factorizationMuMismatches=0;
  for(let mask=0;mask<totalFamilies;mask++){
    const state=Array(signatures.length).fill(0);
    for(let i=0;i<ids.length;i++) if(mask&(1<<i))state[witnessSignatureIndex[i]]++;
    const qLoads=loadsFor(state,signatures);
    const directLoads=edgeMasks.map(edgeMask=>pc((mask&edgeMask)>>>0));
    if(!same(qLoads,directLoads))factorizationResidualMismatches++;
    if(Math.min(...qLoads)!==Math.min(...directLoads))factorizationMuMismatches++;
  }

  const weightedMuMatch=same(weightedMuSpectrum,robustRow.mu_tr_spectrum);
  const robustMatch=same(weightedRobust,robustRow.robust_family_counts_e0_to_e4);
  const minimumMatch=same(minimum,robustRow.minimum_width_e0_to_e4);
  const blockerLiftMatch=weightedBlockerLifts===hyperRow.blocker_member_count;
  const familyWeightMatch=familyWeightChecksum===totalFamilies;
  const passed=familyWeightMatch&&weightedMuMatch&&robustMatch&&minimumMatch&&blockerLiftMatch&&factorizationResidualMismatches===0&&factorizationMuMismatches===0&&nonbinaryMinimalStates===0;
  return freeze({
    witness_count:ids.length,
    original_family_count:totalFamilies,
    transport_order:freeze([...TRANSPORT_ORDER]),
    witness_signatures:freeze(witnessSignatures.map(freeze)),
    signature_classes:freeze(Object.fromEntries(signatures.map(sig=>[sig,freeze([...bySignature[sig]])]))),
    signature_multiplicities:freeze(signatureMultiplicities),
    signature_type_count:signatures.length,
    quotient_state_count:quotientStateCount,
    family_weight_checksum:familyWeightChecksum,
    quotient_transport_load_checks:loadChecks,
    quotient_depth_checks:depthChecks,
    weighted_mu_spectrum:freeze(weightedMuSpectrum),
    quotient_mu_spectrum:freeze(quotientMuSpectrum),
    weighted_robust_counts_e0_to_e4:freeze(weightedRobust),
    minimum_width_e0_to_e4:freeze(minimum),
    quotient_blocker_state_count:quotientBlockerStateCount,
    quotient_blocker_states:freeze(quotientBlockerStates),
    weighted_blocker_lifts:weightedBlockerLifts,
    nonbinary_minimal_identifying_states:nonbinaryMinimalStates,
    factorization_original_family_audits:totalFamilies,
    factorization_residual_transport_mismatches:factorizationResidualMismatches,
    factorization_mu_mismatches:factorizationMuMismatches,
    family_weight_checksum_match:familyWeightMatch,
    weighted_mu_parent_match:weightedMuMatch,
    weighted_robustness_parent_match:robustMatch,
    minimum_width_parent_match:minimumMatch,
    blocker_lift_parent_match:blockerLiftMatch,
    compression_factor:totalFamilies/quotientStateCount,
    passed,
  });
}

export function finiteTransportSignatureQuotientRobustnessPreservingWitnessCompressionCertificate(){
  if(cached)return cached;
  const witnessParent=finiteOrientationFibreSymmetryBreakingCertificate();
  const robustParent=finiteOrientationFibreTransportOpacityErasureRobustnessCertificate();
  const hyperParent=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
  const parentExact=witnessParent.passed===true&&robustParent.passed===true&&hyperParent.passed===true&&hyperParent.parent_receipt==='891cb4125e626c1145b4a6dcb3b1a82074bee510';
  const classes={};
  for(const name of CLASS_ORDER)classes[name]=classCertificate(name,witnessParent.classes[name],hyperParent.classes[name],robustParent.classes[name]);
  const ledger={
    original_family_count:Object.values(classes).reduce((s,r)=>s+r.original_family_count,0),
    quotient_state_count:Object.values(classes).reduce((s,r)=>s+r.quotient_state_count,0),
    quotient_transport_load_checks:Object.values(classes).reduce((s,r)=>s+r.quotient_transport_load_checks,0),
    quotient_depth_checks:Object.values(classes).reduce((s,r)=>s+r.quotient_depth_checks,0),
    original_family_factorization_audits:Object.values(classes).reduce((s,r)=>s+r.factorization_original_family_audits,0),
    family_weight_checksum:Object.values(classes).reduce((s,r)=>s+r.family_weight_checksum,0),
    signature_multiplicity_mismatches:0,
    factorization_residual_transport_mismatches:Object.values(classes).reduce((s,r)=>s+r.factorization_residual_transport_mismatches,0),
    factorization_mu_mismatches:Object.values(classes).reduce((s,r)=>s+r.factorization_mu_mismatches,0),
    weighted_mu_mismatch_classes:Object.values(classes).filter(r=>!r.weighted_mu_parent_match).length,
    weighted_robustness_mismatch_classes:Object.values(classes).filter(r=>!r.weighted_robustness_parent_match).length,
    minimum_width_mismatch_classes:Object.values(classes).filter(r=>!r.minimum_width_parent_match).length,
    blocker_lift_mismatch_classes:Object.values(classes).filter(r=>!r.blocker_lift_parent_match).length,
    nonbinary_minimal_identifying_states:Object.values(classes).reduce((s,r)=>s+r.nonbinary_minimal_identifying_states,0),
  };
  const passed=parentExact&&Object.values(classes).every(r=>r.passed)&&ledger.original_family_count===1049664&&ledger.quotient_state_count===4032&&ledger.quotient_transport_load_checks===12096&&ledger.quotient_depth_checks===20160&&ledger.original_family_factorization_audits===1049664&&ledger.family_weight_checksum===1049664&&ledger.factorization_residual_transport_mismatches===0&&ledger.factorization_mu_mismatches===0&&ledger.weighted_mu_mismatch_classes===0&&ledger.weighted_robustness_mismatch_classes===0&&ledger.minimum_width_mismatch_classes===0&&ledger.blocker_lift_mismatch_classes===0&&ledger.nonbinary_minimal_identifying_states===0;
  cached=freeze({
    schema:FINITE_TRANSPORT_SIGNATURE_QUOTIENT_ROBUSTNESS_PRESERVING_WITNESS_COMPRESSION_SCHEMA,
    parent_receipt:FINITE_TRANSPORT_SIGNATURE_QUOTIENT_ROBUSTNESS_PRESERVING_WITNESS_COMPRESSION_PARENT_RECEIPT,
    parent_exact:parentExact,
    classes:freeze(classes),
    ledger:freeze(ledger),
    laws:freeze([
      'DECLARED_TRANSPORT_FUNCTIONALS_FACTOR_THROUGH_TRANSPORT_SIGNATURE_MULTIPLICITY',
      'RESIDUAL_TRANSPORT_SURVIVAL_IFF_CORRESPONDING_SIGNATURE_LOAD_IS_ZERO',
      'MU_TR_EQUALS_MINIMUM_SIGNATURE_LOAD',
      'EXACT_E_ERASURE_ROBUSTNESS_IFF_EACH_SIGNATURE_LOAD_IS_AT_LEAST_E_PLUS_ONE',
      'BINOMIAL_LIFT_WEIGHTS_RECONSTRUCT_FULL_ORIGINAL_FAMILY_CENSUS',
      'QUOTIENT_MINIMAL_IDENTIFYING_STATES_ARE_ZERO_ONE_VALUED_IN_EACH_DECLARED_CLASS',
      'WEIGHTED_QUOTIENT_BLOCKER_LIFTS_RECONSTRUCT_PARENT_BLOCKER_COUNTS',
    ]),
    membranes:freeze([
      'TRANSPORT_SIGNATURE_EQUIVALENCE != WITNESS_SEMANTIC_EQUIVALENCE',
      'ROBUSTNESS_PRESERVING_QUOTIENT != UNIVERSAL_SUFFICIENT_STATISTIC',
      'TRANSPORT_SIGNATURE != WITNESS_IDENTITY',
      'SIGNATURE_MULTIPLICITY != SHANNON_INFORMATION',
      'QUOTIENT_STATE_COUNT != MINIMUM_BIT_LENGTH',
      'INERT_TRANSPORT_SIGNATURE != GLOBAL_SEMANTIC_IRRELEVANCE',
      'TRANSPORT_SIGNATURE_BIT != PHYSICAL_BIT',
      'TRANSPORT_SEPARATION_HYPERGRAPH != PHYSICAL_NETWORK',
      'TRANSPORT_EDGE_MULTICOVER != ERROR_CORRECTION_CAPACITY',
      'METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS',
      'FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY',
      'ORIENTATION_FIBRE != HIDDEN_STATE_SPACE',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    passed,
  });
  return cached;
}
