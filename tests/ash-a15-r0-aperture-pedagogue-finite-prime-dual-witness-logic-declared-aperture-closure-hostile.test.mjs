import assert from 'node:assert/strict';
import { finiteOrientationFibreSymmetryBreakingCertificate } from '../app/dome-world/previews/a15-r0/finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteMetricCutSkeletonTopologicalOrientationCertificate } from '../app/dome-world/previews/a15-r0/finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

const INHERITED='1111111110';
const NONIDENTITY=['(B M)','(A R)','(A R)(B M)'];
const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
const key=set=>JSON.stringify([...set].sort());
const subsetEq=(a,b)=>{ const sb=new Set(b); return a.every(v=>sb.has(v)); };
const hitsArray=(candidate,edge)=>{ const sc=new Set(candidate); return edge.some(v=>sc.has(v)); };

function normalize(family){
  const map=new Map();
  for(const row of family){ const r=[...new Set(row)].sort(); map.set(key(r),r); }
  return [...map.values()].sort((a,b)=>a.length-b.length||key(a).localeCompare(key(b)));
}
function clutterize(family){
  const rows=normalize(family);
  return rows.filter((edge,i)=>!rows.some((other,j)=>j!==i&&other.length<edge.length&&subsetEq(other,edge)));
}
function blockerDepthFirst(edges){
  const E=clutterize(edges),solutions=[];
  function insert(candidate){
    const c=[...new Set(candidate)].sort();
    if(solutions.some(s=>subsetEq(s,c))) return;
    for(let i=solutions.length-1;i>=0;i--) if(subsetEq(c,solutions[i])) solutions.splice(i,1);
    solutions.push(c);
  }
  function visit(candidate){
    if(solutions.some(s=>subsetEq(s,candidate))) return;
    const uncovered=E.filter(edge=>!hitsArray(candidate,edge));
    if(uncovered.length===0){ insert(candidate); return; }
    uncovered.sort((a,b)=>a.length-b.length||key(a).localeCompare(key(b)));
    for(const vertex of uncovered[0]) visit([...candidate,vertex]);
  }
  visit([]);
  return normalize(solutions);
}
function maskFor(family,index){ return family.reduce((mask,id)=>mask|(1<<index[id]),0)>>>0; }
function hits(mask,edgeMask){ return (mask&edgeMask)!==0; }
function contains(mask,termMask){ return (mask&termMask)===termMask; }

const witness=finiteOrientationFibreSymmetryBreakingCertificate();
const action=finiteMetricCutSkeletonTopologicalOrientationCertificate();
assert.equal(witness.passed,true);
assert.equal(action.passed,true);
function targetFor(g){ return action.metric_isometry_action.action_rows.find(row=>row.source===INHERITED&&row.isometry===g)?.target; }

const hostile={};
for(const name of CLASS_ORDER){
  const rows=witness.classes[name];
  const ids=rows.map(row=>row.id).sort();
  const index=Object.fromEntries(ids.map((id,i)=>[id,i]));
  const n=ids.length,total=2**n,allMask=(1<<n)-1;
  const labelledEdges=NONIDENTITY.map(g=>{
    const target=targetFor(g);
    assert.ok(target,`${name} missing action target for ${g}`);
    return rows.filter(row=>!row.cell.includes(target)).map(row=>row.id).sort();
  });
  const clutter=clutterize(labelledEdges);
  const minimalSuccess=blockerDepthFirst(clutter);
  const originalMasks=labelledEdges.map(edge=>maskFor(edge,index));
  const clauseMasks=clutter.map(edge=>maskFor(edge,index));
  const termMasks=minimalSuccess.map(term=>maskFor(term,index));

  let parentVsDnf=0,parentVsCnf=0,dnfVsCnf=0,successCount=0;
  for(let mask=0;mask<total;mask++){
    const parentTruth=originalMasks.every(edge=>hits(mask,edge));
    const dnfTruth=termMasks.some(term=>contains(mask,term));
    const cnfTruth=clauseMasks.every(edge=>hits(mask,edge));
    if(parentTruth) successCount++;
    if(parentTruth!==dnfTruth) parentVsDnf++;
    if(parentTruth!==cnfTruth) parentVsCnf++;
    if(dnfTruth!==cnfTruth) dnfVsCnf++;
  }

  let dnfIrredundancyFailures=0;
  for(let i=0;i<termMasks.length;i++){
    const W=termMasks[i];
    const parentTruth=originalMasks.every(edge=>hits(W,edge));
    const without=termMasks.some((term,j)=>j!==i&&contains(W,term));
    if(!(parentTruth===true&&without===false)) dnfIrredundancyFailures++;
  }

  let cnfIrredundancyFailures=0;
  for(let i=0;i<clauseMasks.length;i++){
    const W=(allMask&~clauseMasks[i])>>>0;
    const parentTruth=originalMasks.every(edge=>hits(W,edge));
    const full=clauseMasks.every(edge=>hits(W,edge));
    const without=clauseMasks.every((edge,j)=>j===i||hits(W,edge));
    if(!(parentTruth===false&&full===false&&without===true)) cnfIrredundancyFailures++;
  }

  hostile[name]=Object.freeze({
    witness_count:n,
    family_count:total,
    success_count:successCount,
    minimal_success_dnf_term_count:termMasks.length,
    minimal_obstruction_cnf_clause_count:clauseMasks.length,
    origin_truth_vs_success_dnf_mismatches:parentVsDnf,
    origin_truth_vs_obstruction_cnf_mismatches:parentVsCnf,
    success_dnf_vs_obstruction_cnf_mismatches:dnfVsCnf,
    dnf_irredundancy_failures:dnfIrredundancyFailures,
    cnf_irredundancy_failures:cnfIrredundancyFailures,
  });
}
Object.freeze(hostile);

const { finitePrimeDualWitnessLogicDeclaredApertureClosureCertificate } = await import('../app/dome-world/previews/a15-r0/finite-prime-dual-witness-logic-declared-aperture-closure.js');
const child=finitePrimeDualWitnessLogicDeclaredApertureClosureCertificate();
assert.equal(child.passed,true);

let childMismatch=0;
for(const name of CLASS_ORDER){
  const h=hostile[name],c=child.classes[name];
  assert.equal(h.origin_truth_vs_success_dnf_mismatches,0,name);
  assert.equal(h.origin_truth_vs_obstruction_cnf_mismatches,0,name);
  assert.equal(h.success_dnf_vs_obstruction_cnf_mismatches,0,name);
  assert.equal(h.dnf_irredundancy_failures,0,name);
  assert.equal(h.cnf_irredundancy_failures,0,name);
  for(const field of ['witness_count','family_count','success_count','minimal_success_dnf_term_count','minimal_obstruction_cnf_clause_count','origin_truth_vs_success_dnf_mismatches','origin_truth_vs_obstruction_cnf_mismatches','success_dnf_vs_obstruction_cnf_mismatches','dnf_irredundancy_failures','cnf_irredundancy_failures']) if(h[field]!==c[field]) childMismatch++;
}

assert.equal(childMismatch,0);
assert.equal(Object.values(hostile).reduce((sum,row)=>sum+row.family_count,0),1049664);
assert.equal(Object.values(hostile).reduce((sum,row)=>sum+row.success_count,0),982506);
assert.equal(child.declared_aperture_origin_identification_truth_closed,true);
assert.equal(child.rest_certificate.further_same_aperture_subfamily_enumeration_can_add_new_origin_identification_truth_values,false);

console.log(JSON.stringify({
  hostile:true,
  child_mismatches:childMismatch,
  selected_family_count:Object.values(hostile).reduce((sum,row)=>sum+row.family_count,0),
  success_family_count:Object.values(hostile).reduce((sum,row)=>sum+row.success_count,0),
  classes:hostile,
},null,2));
