import { finiteTransportSeparationHypergraphRobustMulticoverCertificate } from './finite-transport-separation-hypergraph-robust-multicover.js';

export const FINITE_BLOCKER_DUALITY_MINIMAL_OBSTRUCTION_RECONSTRUCTION_SCHEMA='td613.dome-world.finite-blocker-duality-minimal-obstruction-reconstruction/v0.1';
export const FINITE_BLOCKER_DUALITY_MINIMAL_OBSTRUCTION_RECONSTRUCTION_PARENT_RECEIPT='633cd75baaaebcc5f357bd503024aefbbcf11057';

const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
const NONIDENTITY=['(B M)','(A R)','(A R)(B M)'];
let cached=null;

const freeze=v=>{ if(v&&typeof v==='object'&&!Object.isFrozen(v)){ Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const uniq=values=>[...new Set(values)];
const setKey=values=>JSON.stringify([...values].sort());
const subsetEq=(a,b)=>{ const sb=new Set(b); return a.every(v=>sb.has(v)); };
const intersects=(a,b)=>{ const sb=new Set(b); return a.some(v=>sb.has(v)); };
const sameArray=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
function popcount32(value){ value=value-((value>>>1)&0x55555555); value=(value&0x33333333)+((value>>>2)&0x33333333); return (((value+(value>>>4))&0x0F0F0F0F)*0x01010101)>>>24; }

function normalizeFamily(family){
  const seen=new Map();
  for(const row of family){
    const normalized=[...new Set(row)].sort();
    seen.set(setKey(normalized),normalized);
  }
  return [...seen.values()].sort((a,b)=>a.length-b.length||setKey(a).localeCompare(setKey(b)));
}

function minimalFamily(family){
  const normalized=normalizeFamily(family);
  return normalized.filter((edge,i)=>!normalized.some((other,j)=>j!==i&&other.length<edge.length&&subsetEq(other,edge)));
}

function blockerRecursive(edges){
  const normalized=minimalFamily(edges);
  if(normalized.length===0) return [];
  let candidates=[[]];
  for(const edge of normalized){
    const next=[];
    for(const candidate of candidates){
      if(intersects(candidate,edge)) next.push(candidate);
      else for(const vertex of edge) next.push([...candidate,vertex]);
    }
    candidates=minimalFamily(next);
  }
  return minimalFamily(candidates);
}

function familyEqual(a,b){
  const aa=normalizeFamily(a).map(setKey),bb=normalizeFamily(b).map(setKey);
  return sameArray(aa,bb);
}

function permutations(values){
  if(values.length<=1) return [values];
  const out=[];
  for(let i=0;i<values.length;i++){
    const head=values[i],rest=[...values.slice(0,i),...values.slice(i+1)];
    for(const tail of permutations(rest)) out.push([head,...tail]);
  }
  return out;
}

function classCertificate(name,parentRow){
  const transportEdges=parentRow.transport_labelled_edges.map(row=>[...row.witnesses]);
  const distinctEdges=normalizeFamily(transportEdges);
  const clutter=minimalFamily(distinctEdges);
  const firstBlocker=blockerRecursive(clutter);
  const parentBlocker=normalizeFamily(parentRow.blocker_families);
  const doubleBlocker=blockerRecursive(parentBlocker);

  const witnessUniverse=uniq([
    ...transportEdges.flat(),
    ...parentBlocker.flat(),
    ...(parentRow.never_minimal_witness_vertices||[]),
    ...(parentRow.essential_witness_vertices||[]),
  ]).sort();
  const n=witnessUniverse.length,total=2**n;
  const index=Object.fromEntries(witnessUniverse.map((id,i)=>[id,i]));
  const masks=family=>family.map(edge=>edge.reduce((mask,id)=>mask|(1<<index[id]),0)>>>0);
  const originalMasks=masks(transportEdges),clutterMasks=masks(clutter);

  let muMismatch=0;
  const depthCounts=[0,0,0,0,0],minimumWidths=[null,null,null,null,null];
  for(let mask=0;mask<total;mask++){
    const muOriginal=Math.min(...originalMasks.map(edgeMask=>popcount32((mask&edgeMask)>>>0)));
    const muClutter=Math.min(...clutterMasks.map(edgeMask=>popcount32((mask&edgeMask)>>>0)));
    if(muOriginal!==muClutter) muMismatch++;
    const width=popcount32(mask);
    for(let depth=1;depth<=5;depth++) if(muClutter>=depth){
      depthCounts[depth-1]++;
      if(minimumWidths[depth-1]===null||width<minimumWidths[depth-1]) minimumWidths[depth-1]=width;
    }
  }

  const relabelled=[];
  for(const labels of permutations(NONIDENTITY)){
    const labelled=transportEdges.map((edge,i)=>({transport:labels[i],witnesses:edge}));
    const unlabeled=labelled.map(row=>row.witnesses);
    const relabelClutter=minimalFamily(unlabeled);
    const relabelBlocker=blockerRecursive(relabelClutter);
    relabelled.push({labels,unchanged:familyEqual(relabelClutter,clutter)&&familyEqual(relabelBlocker,parentBlocker)});
  }

  const firstBlockerMatchesParent=familyEqual(firstBlocker,parentBlocker);
  const doubleBlockerMatchesClutter=familyEqual(doubleBlocker,clutter);
  const parentCountsMatch=sameArray(depthCounts,parentRow.multicover_family_counts_depth_1_to_5);
  const parentMinimumMatch=sameArray(minimumWidths,parentRow.robust_transport_rank_e0_to_e4);
  const witnessUniverseExact=n===parentRow.witness_count;
  const labelRelabellingInvariant=relabelled.length===6&&relabelled.every(row=>row.unchanged);

  return freeze({
    witness_count:n,
    parent_witness_count:parentRow.witness_count,
    witness_universe_exact:witnessUniverseExact,
    family_count:total,
    transport_labelled_edge_count:transportEdges.length,
    distinct_edge_count:distinctEdges.length,
    clutter_edge_count:clutter.length,
    duplicate_edge_count_removed:transportEdges.length-distinctEdges.length,
    strict_superedge_count_removed:distinctEdges.length-clutter.length,
    clutter_edges:freeze(clutter.map(edge=>freeze([...edge]))),
    parent_blocker_member_count:parentBlocker.length,
    recomputed_first_blocker:freeze(firstBlocker.map(edge=>freeze([...edge]))),
    first_blocker_vs_parent_mismatches:firstBlockerMatchesParent?0:1,
    double_blocker:freeze(doubleBlocker.map(edge=>freeze([...edge]))),
    double_blocker_vs_clutter_mismatches:doubleBlockerMatchesClutter?0:1,
    mu_original_vs_clutter_mismatches:muMismatch,
    clutter_multicover_family_counts_depth_1_to_5:freeze(depthCounts),
    clutter_minimum_multicover_width_depth_1_to_5:freeze(minimumWidths),
    multicover_counts_match_parent:parentCountsMatch,
    minimum_widths_match_parent:parentMinimumMatch,
    transport_label_permutation_controls:freeze(relabelled.map(row=>freeze({labels:freeze([...row.labels]),unchanged:row.unchanged}))),
    transport_label_relabelling_changes_unlabelled_blocker:!labelRelabellingInvariant,
    passed:witnessUniverseExact&&firstBlockerMatchesParent&&doubleBlockerMatchesClutter&&muMismatch===0&&parentCountsMatch&&parentMinimumMatch&&labelRelabellingInvariant,
  });
}

export function finiteBlockerDualityMinimalObstructionReconstructionCertificate(){
  if(cached) return cached;
  const parent=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
  const parentExact=parent.passed===true&&parent.ledger?.selected_family_count===1049664&&parent.ledger?.blocker_vs_inclusion_minimal_identifying_family_mismatches===0;
  const classes={};
  for(const name of CLASS_ORDER) classes[name]=classCertificate(name,parent.classes[name]);

  const ledger={
    selected_family_count:Object.values(classes).reduce((sum,row)=>sum+row.family_count,0),
    first_blocker_vs_parent_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.first_blocker_vs_parent_mismatches,0),
    double_blocker_vs_clutter_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.double_blocker_vs_clutter_mismatches,0),
    mu_original_vs_clutter_mismatches:Object.values(classes).reduce((sum,row)=>sum+row.mu_original_vs_clutter_mismatches,0),
    multicover_count_mismatches:Object.values(classes).filter(row=>!row.multicover_counts_match_parent).length,
    minimum_width_mismatches:Object.values(classes).filter(row=>!row.minimum_widths_match_parent).length,
    label_relabelling_controls:Object.values(classes).reduce((sum,row)=>sum+row.transport_label_permutation_controls.length,0),
    label_relabelling_failures:Object.values(classes).reduce((sum,row)=>sum+row.transport_label_permutation_controls.filter(control=>!control.unchanged).length,0),
    all_parent_hypergraphs_already_clutters:Object.values(classes).every(row=>row.duplicate_edge_count_removed===0&&row.strict_superedge_count_removed===0),
  };

  const passed=parentExact&&Object.values(classes).every(row=>row.passed)&&ledger.selected_family_count===1049664&&ledger.first_blocker_vs_parent_mismatches===0&&ledger.double_blocker_vs_clutter_mismatches===0&&ledger.mu_original_vs_clutter_mismatches===0&&ledger.multicover_count_mismatches===0&&ledger.minimum_width_mismatches===0&&ledger.label_relabelling_controls===24&&ledger.label_relabelling_failures===0;

  cached=freeze({
    schema:FINITE_BLOCKER_DUALITY_MINIMAL_OBSTRUCTION_RECONSTRUCTION_SCHEMA,
    parent_receipt:FINITE_BLOCKER_DUALITY_MINIMAL_OBSTRUCTION_RECONSTRUCTION_PARENT_RECEIPT,
    parent_exact:parentExact,
    inherited:parent.inherited,
    classes:freeze(classes),
    ledger:freeze(ledger),
    laws:freeze([
      'DOUBLE_BLOCKER_OF_TRANSPORT_SEPARATION_HYPERGRAPH_EQUALS_ITS_MINIMAL_EDGE_CLUTTER_IN_EACH_DECLARED_FINITE_CLASS',
      'MINIMAL_INHERITED_ORIGIN_IDENTIFYING_FAMILIES_RECONSTRUCT_THE_MINIMAL_UNLABELLED_TRANSPORT_OBSTRUCTION_CLUTTER',
      'CLUTTERIZATION_PRESERVES_MU_TR_AND_ALL_EARNED_EXACT_ERASURE_ROBUSTNESS_DEPTHS_IN_EACH_DECLARED_FINITE_CLASS',
      'BLOCKER_IS_A_SUFFICIENT_FINITE_CARRIER_FOR_UNLABELLED_MINIMUM_TRANSPORT_SEPARATION_DEPTH_VIA_DOUBLE_DUALIZATION',
      'TRANSPORT_LABEL_PERMUTATION_LEAVES_UNLABELLED_BLOCKER_AND_CLUTTER_INCIDENCE_UNCHANGED',
    ]),
    membranes:freeze([
      'BLOCKER_DUAL_RECOVERY != TRANSPORT_LABEL_RECOVERY',
      'MINIMAL_IDENTIFYING_FAMILIES != COMPLETE_WITNESS_SEMANTICS',
      'OBSTRUCTION_CLUTTER != PHYSICAL_NETWORK',
      'HYPERGRAPH_EDGE != CAUSAL_RELATION',
      'CLUTTERIZATION != INFORMATION_THEORETIC_COMPRESSION',
      'BLOCKER_CARDINALITY != MINIMUM_BIT_LENGTH',
      'MULTICOVER_DEPTH != SHANNON_INFORMATION',
      'TRANSPORT_EDGE_MULTICOVER != ERROR_CORRECTION_CAPACITY',
      'TRANSPORT_SEPARATING_RANK != ACTION_GENERATING_RANK',
      'TRANSPORT_SEPARATING_RANK != BEHAVIORAL_SEPARATING_RANK',
      'METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS',
      'FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY',
      'ORIENTATION_FIBRE != HIDDEN_STATE_SPACE',
      'LATER_SYMMETRY_BREAKING != PRIOR_METRIC_IDENTIFIABILITY',
      'WITNESS_ROUTING != SCIENTIFIC_ANCESTRY',
    ]),
    passed,
  });
  return cached;
}
