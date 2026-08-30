import { finiteOrientationFibreSymmetryBreakingCertificate } from './finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteMetricCutSkeletonTopologicalOrientationCertificate } from './finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';
import { finiteOrientationFibreTransportOpacityErasureRobustnessCertificate } from './finite-orientation-fibre-transport-opacity-erasure-robustness.js';

export const FINITE_TRANSPORT_SEPARATION_HYPERGRAPH_ROBUST_MULTICOVER_SCHEMA='td613.dome-world.finite-transport-separation-hypergraph-robust-multicover/v0.1';
export const FINITE_TRANSPORT_SEPARATION_HYPERGRAPH_ROBUST_MULTICOVER_PARENT_RECEIPT='891cb4125e626c1145b4a6dcb3b1a82074bee510';

const INHERITED='1111111110';
const GROUP=['id','(B M)','(A R)','(A R)(B M)'];
const NONIDENTITY=GROUP.slice(1);
const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
let cached=null;

const freeze=v=>{ if(v&&typeof v==='object'&&!Object.isFrozen(v)){ Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
function popcount32(value){ value=value-((value>>>1)&0x55555555); value=(value&0x33333333)+((value>>>2)&0x33333333); return (((value+(value>>>4))&0x0F0F0F0F)*0x01010101)>>>24; }
function actionTarget(parent,source,g){ return parent.metric_isometry_action?.action_rows?.find(row=>row.source===source&&row.isometry===g)?.target||null; }
function familyIds(mask,ids){ const out=[]; for(let i=0;i<ids.length;i++) if(mask&(1<<i)) out.push(ids[i]); return out; }
function spectrum(values){ const out={}; for(const value of values) out[value]=(out[value]||0)+1; return out; }
function sameArray(a,b){ return a.length===b.length&&a.every((v,i)=>v===b[i]); }
function stableKey(values){ return JSON.stringify([...values].sort()); }

function classCertificate(name,rows,orientationFibre,actionParent,robustParent){
  const ids=rows.map(row=>row.id),n=ids.length,total=2**n;
  const indexByOrientation=Object.fromEntries(orientationFibre.map((bits,i)=>[bits,i]));
  const inheritedBit=1<<indexByOrientation[INHERITED];
  const fullCellMask=(1<<orientationFibre.length)-1;
  const cellMasks=rows.map(row=>row.cell.reduce((mask,bits)=>mask|(1<<indexByOrientation[bits]),0));
  const edgeRows=NONIDENTITY.map(g=>{
    const target=actionTarget(actionParent,INHERITED,g);
    let mask=0;
    for(let i=0;i<n;i++) if(!rows[i].cell.includes(target)) mask|=(1<<i);
    return {transport:g,target,witness_mask:mask>>>0,witnesses:familyIds(mask,ids)};
  });
  const edgeMasks=edgeRows.map(edge=>edge.witness_mask);
  const dedup=new Map();
  for(const edge of edgeRows){ const key=stableKey(edge.witnesses); if(!dedup.has(key)) dedup.set(key,{witnesses:edge.witnesses,transports:[]}); dedup.get(key).transports.push(edge.transport); }

  const directCell=mask=>{ let cell=fullCellMask; for(let i=0;i<n;i++) if(mask&(1<<i)) cell&=cellMasks[i]; return cell; };
  const edgeCounts=mask=>edgeMasks.map(edgeMask=>popcount32((mask&edgeMask)>>>0));
  const isHitting=mask=>edgeMasks.every(edgeMask=>(mask&edgeMask)!==0);

  let edgeAvoidanceMismatches=0,identificationTransversalMismatches=0,muMismatches=0,blockerMismatches=0;
  const depthCounts=[0,0,0,0,0],minimumWidths=[null,null,null,null,null],muValues=[];
  const blockerMasks=[],directMinimalMasks=[];
  const residualTransportSpectrum={};

  for(let mask=0;mask<total;mask++){
    const counts=edgeCounts(mask),mu=Math.min(...counts),width=popcount32(mask),hitting=counts.every(count=>count>0);
    muValues.push(mu);
    const residualByEdges=['id',...NONIDENTITY.filter((_,i)=>counts[i]===0)];
    const cell=directCell(mask);
    const residualByCell=['id',...NONIDENTITY.filter(g=>cell&(1<<indexByOrientation[actionTarget(actionParent,INHERITED,g)]))];
    if(!sameArray(residualByEdges,residualByCell)) edgeAvoidanceMismatches++;
    const rKey=residualByEdges.join('|'); residualTransportSpectrum[rKey]=(residualTransportSpectrum[rKey]||0)+1;
    const identifies=cell===inheritedBit;
    if(identifies!==hitting) identificationTransversalMismatches++;
    const muDirect=Math.min(...NONIDENTITY.map(g=>{
      const target=actionTarget(actionParent,INHERITED,g);
      let count=0; for(let i=0;i<n;i++) if((mask&(1<<i))&&!rows[i].cell.includes(target)) count++; return count;
    }));
    if(muDirect!==mu) muMismatches++;
    for(let depth=1;depth<=5;depth++) if(mu>=depth){ depthCounts[depth-1]++; if(minimumWidths[depth-1]===null||width<minimumWidths[depth-1]) minimumWidths[depth-1]=width; }

    if(hitting){
      let minimal=true;
      for(let i=0;i<n;i++) if(mask&(1<<i)){ const reduced=(mask&~(1<<i))>>>0; if(isHitting(reduced)){minimal=false;break;} }
      if(minimal) blockerMasks.push(mask);
    }
    if(identifies){
      let minimal=true;
      for(let i=0;i<n;i++) if(mask&(1<<i)){ const reduced=(mask&~(1<<i))>>>0; if(directCell(reduced)===inheritedBit){minimal=false;break;} }
      if(minimal) directMinimalMasks.push(mask);
    }
  }

  const blockerKey=new Set(blockerMasks),directKey=new Set(directMinimalMasks);
  for(const mask of blockerKey) if(!directKey.has(mask)) blockerMismatches++;
  for(const mask of directKey) if(!blockerKey.has(mask)) blockerMismatches++;
  const blockerFamilies=blockerMasks.map(mask=>familyIds(mask,ids));
  const blockerWidths=blockerMasks.map(popcount32);
  let essentialMask=n===32?0xFFFFFFFF:((1<<n)-1);
  let usedMask=0;
  for(const mask of blockerMasks){ essentialMask&=mask; usedMask|=mask; }
  if(blockerMasks.length===0) essentialMask=0;
  const allMask=n===32?0xFFFFFFFF:((1<<n)-1);
  const neverMask=(allMask&~usedMask)>>>0;
  const edgeSizes=edgeRows.map(edge=>edge.witnesses.length);
  const fingerprint={
    witness_count:n,
    transport_labelled_edge_count:edgeRows.length,
    deduplicated_edge_count:dedup.size,
    sorted_edge_sizes:[...edgeSizes].sort((a,b)=>a-b),
    transversal_number:minimumWidths[0],
    blocker_member_count:blockerMasks.length,
    blocker_width_spectrum:spectrum(blockerWidths),
  };

  const parentRow=robustParent.classes[name];
  const parentCountMatch=sameArray(depthCounts,parentRow.robust_family_counts_e0_to_e4);
  const parentMinimumMatch=sameArray(minimumWidths,parentRow.minimum_width_e0_to_e4);

  return freeze({
    witness_count:n,
    family_count:total,
    transport_labelled_edges:freeze(edgeRows.map(edge=>freeze({transport:edge.transport,target:edge.target,witnesses:freeze([...edge.witnesses]),size:edge.witnesses.length}))),
    deduplicated_edges:freeze([...dedup.values()].map(row=>freeze({witnesses:freeze([...row.witnesses]),transports:freeze([...row.transports]),size:row.witnesses.length}))),
    deduplicated_edge_count:dedup.size,
    edge_size_spectrum:freeze(spectrum(edgeSizes)),
    residual_transport_edge_avoidance_mismatches:edgeAvoidanceMismatches,
    origin_identification_transversal_mismatches:identificationTransversalMismatches,
    mu_hypergraph_vs_mu_tr_mismatches:muMismatches,
    mu_hypergraph_spectrum:freeze(spectrum(muValues)),
    multicover_family_counts_depth_1_to_5:freeze(depthCounts),
    robust_transport_rank_e0_to_e4:freeze(minimumWidths),
    parent_robust_family_counts_match:parentCountMatch,
    parent_minimum_widths_match:parentMinimumMatch,
    transversal_number:minimumWidths[0],
    blocker_member_count:blockerMasks.length,
    blocker_width_spectrum:freeze(spectrum(blockerWidths)),
    blocker_families:freeze(blockerFamilies.map(freeze)),
    direct_minimal_identifying_family_count:directMinimalMasks.length,
    blocker_vs_inclusion_minimal_identifying_family_mismatches:blockerMismatches,
    essential_witness_vertices:freeze(familyIds(essentialMask,ids)),
    never_minimal_witness_vertices:freeze(familyIds(neverMask,ids)),
    residual_transport_spectrum:freeze(residualTransportSpectrum),
    incidence_fingerprint:freeze(fingerprint),
    passed:edgeAvoidanceMismatches===0&&identificationTransversalMismatches===0&&muMismatches===0&&blockerMismatches===0&&parentCountMatch&&parentMinimumMatch,
  });
}

export function finiteTransportSeparationHypergraphRobustMulticoverCertificate(){
  if(cached) return cached;
  const witnessParent=finiteOrientationFibreSymmetryBreakingCertificate();
  const actionParent=finiteMetricCutSkeletonTopologicalOrientationCertificate();
  const robustParent=finiteOrientationFibreTransportOpacityErasureRobustnessCertificate();
  const orientationFibre=witnessParent.orientation_fibre;
  const pointStabilizer=GROUP.filter(g=>actionTarget(actionParent,INHERITED,g)===INHERITED);
  const parentExact=witnessParent.passed===true&&actionParent.passed===true&&robustParent.passed===true&&robustParent.parent_receipt==='faef60c732e057fe6c678fe4cc7ae7318192f694'&&orientationFibre.length===4&&pointStabilizer.length===1&&pointStabilizer[0]==='id';
  const classes={};
  for(const name of CLASS_ORDER) classes[name]=classCertificate(name,witnessParent.classes[name],orientationFibre,actionParent,robustParent);

  const sameRankDistinctIncidence=[];
  for(let i=0;i<CLASS_ORDER.length;i++) for(let j=i+1;j<CLASS_ORDER.length;j++){
    const a=classes[CLASS_ORDER[i]],b=classes[CLASS_ORDER[j]];
    if(a.transversal_number===b.transversal_number&&JSON.stringify(a.incidence_fingerprint)!==JSON.stringify(b.incidence_fingerprint)) sameRankDistinctIncidence.push(freeze({classes:freeze([CLASS_ORDER[i],CLASS_ORDER[j]]),rank:a.transversal_number,fingerprints:freeze([a.incidence_fingerprint,b.incidence_fingerprint])}));
  }

  const ledger={
    selected_family_count:Object.values(classes).reduce((sum,row)=>sum+row.family_count,0),
    family_transport_intersection_checks:Object.values(classes).reduce((sum,row)=>sum+row.family_count*3,0),
    multicover_depth_checks_1_to_5:Object.values(classes).reduce((sum,row)=>sum+row.family_count*5,0),
    all_family_single_witness_deletion_checks_for_blocker_minimality:Object.entries(classes).reduce((sum,[,row])=>sum+row.witness_count*(2**(row.witness_count-1)),0),
    residual_transport_edge_avoidance_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.residual_transport_edge_avoidance_mismatches,0),
    origin_identification_transversal_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.origin_identification_transversal_mismatches,0),
    mu_hypergraph_vs_mu_tr_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.mu_hypergraph_vs_mu_tr_mismatches,0),
    blocker_vs_inclusion_minimal_identifying_family_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.blocker_vs_inclusion_minimal_identifying_family_mismatches,0),
    same_rank_distinct_incidence_examples:sameRankDistinctIncidence.length,
  };

  const passed=parentExact&&Object.values(classes).every(row=>row.passed)&&ledger.selected_family_count===1049664&&ledger.family_transport_intersection_checks===3148992&&ledger.multicover_depth_checks_1_to_5===5248320&&ledger.all_family_single_witness_deletion_checks_for_blocker_minimality===10491040&&ledger.residual_transport_edge_avoidance_mismatches===0&&ledger.origin_identification_transversal_mismatches===0&&ledger.mu_hypergraph_vs_mu_tr_mismatches===0&&ledger.blocker_vs_inclusion_minimal_identifying_family_mismatches===0&&sameRankDistinctIncidence.length>0;

  cached=freeze({
    schema:FINITE_TRANSPORT_SEPARATION_HYPERGRAPH_ROBUST_MULTICOVER_SCHEMA,
    parent_receipt:FINITE_TRANSPORT_SEPARATION_HYPERGRAPH_ROBUST_MULTICOVER_PARENT_RECEIPT,
    parent_exact:parentExact,
    inherited:INHERITED,
    group:freeze([...GROUP]),
    inherited_point_stabilizer:freeze(pointStabilizer),
    classes:freeze(classes),
    same_rank_distinct_incidence_examples:freeze(sameRankDistinctIncidence),
    ledger:freeze(ledger),
    laws:freeze([
      'RESIDUAL_TRANSPORT_SURVIVAL_IFF_SELECTED_WITNESS_FAMILY_MISSES_THE_CORRESPONDING_TRANSPORT_SEPARATION_EDGE',
      'INHERITED_ORIGIN_IDENTIFICATION_IFF_SELECTED_WITNESS_FAMILY_IS_A_TRANSPORT_SEPARATION_HYPERGRAPH_TRANSVERSAL',
      'TRANSPORT_SEPARATING_RANK_EQUALS_TRANSPORT_SEPARATION_HYPERGRAPH_TRANSVERSAL_NUMBER_IN_EACH_DECLARED_FINITE_CLASS',
      'MU_TR_EQUALS_MINIMUM_TRANSPORT_EDGE_INTERSECTION_MULTIPLICITY',
      'EXACT_E_ERASURE_ROBUSTNESS_EQUALS_E_PLUS_ONE_FOLD_TRANSPORT_EDGE_MULTICOVER_IN_EACH_DECLARED_FINITE_CLASS',
      'INCLUSION_MINIMAL_ORIGIN_IDENTIFYING_FAMILIES_EQUAL_THE_HYPERGRAPH_BLOCKER',
      'SAME_TRANSPORT_SEPARATING_RANK_DOES_NOT_DETERMINE_TRANSPORT_SEPARATION_INCIDENCE',
    ]),
    membranes:freeze([
      'TRANSPORT_SEPARATION_HYPERGRAPH != PHYSICAL_NETWORK',
      'HYPERGRAPH_EDGE != CAUSAL_RELATION',
      'TRANSPORT_EDGE_MULTICOVER != ERROR_CORRECTION_CAPACITY',
      'TRANSPORT_EDGE_MULTICOVER != SHANNON_CHANNEL_CAPACITY',
      'MULTICOVER_DEPTH != MINIMUM_BIT_LENGTH',
      'TRANSPORT_SEPARATING_RANK != ACTION_GENERATING_RANK',
      'TRANSPORT_SEPARATING_RANK != BEHAVIORAL_SEPARATING_RANK',
      'RESIDUAL_TRANSPORT_SET != SETWISE_STABILIZER',
      'METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS',
      'FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY',
      'CUT_ORIENTATION_COORDINATE != PHYSICAL_ORIENTATION',
      'ORIENTATION_FIBRE != HIDDEN_STATE_SPACE',
      'LATER_SYMMETRY_BREAKING != PRIOR_METRIC_IDENTIFIABILITY',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    passed,
  });
  return cached;
}
