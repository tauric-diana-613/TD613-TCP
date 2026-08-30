import { finiteOrientationFibreSymmetryBreakingCertificate } from './finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteMetricCutSkeletonTopologicalOrientationCertificate } from './finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

export const FINITE_ORIENTATION_FIBRE_TRANSPORT_OPACITY_ERASURE_SCHEMA='td613.dome-world.finite-orientation-fibre-transport-opacity-erasure-robustness/v0.1';
export const FINITE_ORIENTATION_FIBRE_TRANSPORT_OPACITY_ERASURE_PARENT_RECEIPT='faef60c732e057fe6c678fe4cc7ae7318192f694';

const INHERITED='1111111110';
const GROUP=['id','(B M)','(A R)','(A R)(B M)'];
const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
let cached=null;

const freeze=value=>{ if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
function popcount32(value){ value=value-((value>>>1)&0x55555555); value=(value&0x33333333)+((value>>>2)&0x33333333); return (((value+(value>>>4))&0x0F0F0F0F)*0x01010101)>>>24; }
function combinations(items,k){ const out=[]; function walk(start,current){ if(current.length===k){out.push([...current]);return;} for(let i=start;i<items.length;i++){current.push(items[i]);walk(i+1,current);current.pop();} } walk(0,[]); return out; }
function deletionMasks(n,e){ if(e===0) return [0]; const bits=Array.from({length:n},(_,i)=>i); return combinations(bits,e).map(combo=>combo.reduce((mask,i)=>mask|(1<<i),0)); }
function actionRows(parent){ return parent.metric_isometry_action?.action_rows||[]; }
function target(parent,source,g){ return actionRows(parent).find(row=>row.source===source&&row.isometry===g)?.target||null; }
function sameSet(left,right){ return left.size===right.size&&[...left].every(value=>right.has(value)); }
function setwiseStabilizerMask(parent,transportMask){
  const cell=new Set(GROUP.filter((_,i)=>(transportMask&(1<<i))!==0).map(g=>target(parent,INHERITED,g)));
  let mask=0;
  for(let gi=0;gi<GROUP.length;gi++){
    const g=GROUP[gi],image=new Set([...cell].map(bits=>target(parent,bits,g)));
    if(sameSet(cell,image)) mask|=(1<<gi);
  }
  return {mask,cell:[...cell].sort()};
}
function selectedIds(rows,mask){ const out=[]; for(let i=0;i<rows.length;i++) if(mask&(1<<i)) out.push(rows[i].id); return out; }
function counterObject(values){ const out={}; for(const value of values) out[value]=(out[value]||0)+1; return out; }

function auditClass(name,rows,parent){
  const n=rows.length,total=2**n,fullMask=total-1,nonidentity=GROUP.slice(1);
  const inheritedTargets=nonidentity.map(g=>target(parent,INHERITED,g));
  const separationMasks=inheritedTargets.map(bits=>{
    let mask=0;
    for(let i=0;i<n;i++) if(!rows[i].cell.includes(bits)) mask|=(1<<i);
    return mask>>>0;
  });

  const widths=new Uint8Array(total),mu=new Uint8Array(total),exact=new Uint8Array(total),transportMask=new Uint8Array(total);
  const muValues=[],exactWidths=[];
  let exactCount=0,transportStabilizerDifferenceFamilies=0,firstTransportStabilizerCounterexample=null;
  const cellSpectrum={};

  for(let mask=0;mask<total;mask++){
    const width=popcount32(mask); widths[mask]=width;
    const counts=separationMasks.map(sep=>popcount32(mask&sep));
    const margin=Math.min(...counts); mu[mask]=margin; muValues.push(margin);
    const isExact=counts.every(count=>count>0); exact[mask]=isExact?1:0;
    if(isExact){ exactCount++; exactWidths.push(width); }

    let tmask=1;
    for(let gi=0;gi<separationMasks.length;gi++) if((mask&separationMasks[gi])===0) tmask|=(1<<(gi+1));
    transportMask[mask]=tmask;
    const {mask:stabMask,cell}=setwiseStabilizerMask(parent,tmask);
    const cellKey=cell.join('|'); cellSpectrum[cellKey]=(cellSpectrum[cellKey]||0)+1;
    if(tmask!==stabMask){
      transportStabilizerDifferenceFamilies++;
      if(!firstTransportStabilizerCounterexample) firstTransportStabilizerCounterexample=freeze({family_mask:mask,witnesses:freeze(selectedIds(rows,mask)),residual_cell:freeze(cell),residual_transport_set:freeze(GROUP.filter((_,i)=>tmask&(1<<i))),setwise_stabilizer:freeze(GROUP.filter((_,i)=>stabMask&(1<<i)))});
    }
  }

  const robustFamilyCounts=[],minimumWidths=[],directDeletionCaseCounts=[];
  let criterionMismatches=0;
  for(let e=0;e<=4;e++){
    const robust=new Uint8Array(total); robust.fill(1);
    let directCases=0;
    for(const deletion of deletionMasks(n,e)){
      const complement=fullMask^deletion;
      let remaining=complement;
      while(true){
        const selected=(remaining|deletion)>>>0;
        if(exact[remaining]!==1) robust[selected]=0;
        directCases++;
        if(remaining===0) break;
        remaining=((remaining-1)&complement)>>>0;
      }
    }
    let robustCount=0,minWidth=null;
    for(let mask=0;mask<total;mask++){
      if(widths[mask]<e) continue;
      const direct=robust[mask]===1;
      const criterion=mu[mask]>=e+1;
      if(direct!==criterion) criterionMismatches++;
      if(direct){ robustCount++; if(minWidth===null||widths[mask]<minWidth) minWidth=widths[mask]; }
    }
    robustFamilyCounts.push(robustCount); minimumWidths.push(minWidth); directDeletionCaseCounts.push(directCases);
  }

  return freeze({
    name,
    witnesses:n,
    families:total,
    exact_identifying_families:exactCount,
    transport_separating_rank:minimumWidths[0],
    separation_masks:freeze(Object.fromEntries(nonidentity.map((g,i)=>[g,freeze({mask:separationMasks[i],hex:`0x${separationMasks[i].toString(16)}`,witness_count:popcount32(separationMasks[i])})]))),
    mu_tr_spectrum:freeze(counterObject(muValues)),
    exact_width_spectrum:freeze(counterObject(exactWidths)),
    robust_family_counts_e0_to_e4:freeze(robustFamilyCounts),
    minimum_width_e0_to_e4:freeze(minimumWidths),
    direct_deletion_cases_e0_to_e4:freeze(directDeletionCaseCounts),
    criterion_mismatches:criterionMismatches,
    residual_cell_spectrum:freeze(cellSpectrum),
    residual_transport_vs_setwise_stabilizer_difference_families:transportStabilizerDifferenceFamilies,
    first_transport_stabilizer_counterexample:firstTransportStabilizerCounterexample,
  });
}

export function finiteOrientationFibreTransportOpacityErasureRobustnessCertificate(){
  if(cached) return cached;
  const parent=finiteOrientationFibreSymmetryBreakingCertificate();
  const actionParent=finiteMetricCutSkeletonTopologicalOrientationCertificate();
  const pointStabilizer=GROUP.filter(g=>target(actionParent,INHERITED,g)===INHERITED);
  const parentExact=parent.passed===true&&actionParent.passed===true&&parent.inherited===INHERITED&&JSON.stringify(parent.orientation_fibre)===JSON.stringify(['0000000001','0000000010','1111111101','1111111110'])&&actionRows(actionParent).length===16&&pointStabilizer.length===1;
  const classes={};
  for(const name of CLASS_ORDER) classes[name]=auditClass(name,parent.classes[name],actionParent);
  const totalSelectedFamilies=Object.values(classes).reduce((sum,row)=>sum+row.families,0);
  const totalDirectDeletionCases=Object.values(classes).reduce((sum,row)=>sum+row.direct_deletion_cases_e0_to_e4.reduce((a,b)=>a+b,0),0);
  const criterionMismatches=Object.values(classes).reduce((sum,row)=>sum+row.criterion_mismatches,0);
  const differenceFamilies=Object.values(classes).reduce((sum,row)=>sum+row.residual_transport_vs_setwise_stabilizer_difference_families,0);
  const passed=parentExact&&totalSelectedFamilies===1049664&&totalDirectDeletionCases===528332644&&criterionMismatches===0&&differenceFamilies>0&&classes.specialization_comparability.transport_separating_rank===1&&classes.principal_open_identity.transport_separating_rank===1&&classes.principal_open_size.transport_separating_rank===2&&classes.cut_orientation.transport_separating_rank===2;
  cached=freeze({
    schema:FINITE_ORIENTATION_FIBRE_TRANSPORT_OPACITY_ERASURE_SCHEMA,
    parent_receipt:FINITE_ORIENTATION_FIBRE_TRANSPORT_OPACITY_ERASURE_PARENT_RECEIPT,
    parent_exact:parentExact,
    inherited:INHERITED,
    group:freeze([...GROUP]),
    inherited_point_stabilizer:freeze(pointStabilizer),
    definitions:freeze({residual_transport_set:'S_W={g in G : every selected inherited-valued witness also accepts g tau*}',mu_tr:'min over nonidentity g of selected witnesses separating g tau* from tau*'}),
    classes:freeze(classes),
    ledger:freeze({total_selected_families:totalSelectedFamilies,total_direct_deletion_cases:totalDirectDeletionCases,criterion_mismatches:criterionMismatches,residual_transport_vs_setwise_stabilizer_difference_families:differenceFamilies}),
    laws:freeze([
      'EXACT_ORIGIN_IDENTIFICATION_IFF_RESIDUAL_TRANSPORT_SET_IS_IDENTITY_IN_THE_FIXED_FREE_TRANSITIVE_FOUR_POINT_FIBRE',
      'DIRECT_EXACT_E_WITNESS_ERASURE_SURVIVAL_IFF_MU_TR_IS_AT_LEAST_E_PLUS_ONE_FOR_E_ZERO_THROUGH_FOUR_IN_EACH_DECLARED_WITNESS_CLASS',
      'RESIDUAL_TRANSPORT_SET_NEED_NOT_EQUAL_THE_SETWISE_STABILIZER_OF_THE_RESIDUAL_TOPOLOGY_CELL',
    ]),
    membranes:freeze([
      'RESIDUAL_TRANSPORT_SET != SETWISE_STABILIZER',
      'TRANSPORT_SEPARATING_RANK != BEHAVIORAL_SEPARATING_RANK',
      'TRANSPORT_SEPARATING_RANK != ACTION_GENERATING_RANK',
      'WITNESS_ERASURE_ROBUSTNESS != ERROR_CORRECTION_CAPACITY',
      'SEPARATION_MULTIPLICITY != SHANNON_DISTANCE',
      'FINITE_WITNESS_WIDTH != MINIMUM_BIT_LENGTH',
      'METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS',
      'FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY',
      'CUT_ORIENTATION_COORDINATE != PHYSICAL_ORIENTATION',
      'ORIENTATION_FIBRE != HIDDEN_STATE_SPACE',
      'LATER_SYMMETRY_BREAKING != PRIOR_METRIC_IDENTIFIABILITY',
    ]),
    passed,
  });
  return cached;
}
