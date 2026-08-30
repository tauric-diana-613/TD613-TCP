import assert from 'node:assert/strict';
import { finiteOrientationFibreSymmetryBreakingCertificate } from '../app/dome-world/previews/a15-r0/finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteMetricCutSkeletonTopologicalOrientationCertificate } from '../app/dome-world/previews/a15-r0/finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

const INHERITED='1111111110';
const NONIDENTITY=['(B M)','(A R)','(A R)(B M)'];
const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];

const key=set=>JSON.stringify([...set].sort());
const subsetEq=(a,b)=>{ const sb=new Set(b); return a.every(v=>sb.has(v)); };
const hits=(candidate,edge)=>{ const sc=new Set(candidate); return edge.some(v=>sc.has(v)); };

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
  const E=clutterize(edges);
  const solutions=[];
  function insert(candidate){
    const c=[...new Set(candidate)].sort();
    if(solutions.some(s=>subsetEq(s,c))) return;
    for(let i=solutions.length-1;i>=0;i--) if(subsetEq(c,solutions[i])) solutions.splice(i,1);
    solutions.push(c);
  }
  function visit(candidate){
    if(solutions.some(s=>subsetEq(s,candidate))) return;
    const uncovered=E.filter(edge=>!hits(candidate,edge));
    if(uncovered.length===0){ insert(candidate); return; }
    uncovered.sort((a,b)=>a.length-b.length||key(a).localeCompare(key(b)));
    for(const vertex of uncovered[0]) visit([...candidate,vertex]);
  }
  visit([]);
  return normalize(solutions);
}

function familyEqual(a,b){
  const aa=normalize(a).map(key),bb=normalize(b).map(key);
  return aa.length===bb.length&&aa.every((v,i)=>v===bb[i]);
}

const witness=finiteOrientationFibreSymmetryBreakingCertificate();
const action=finiteMetricCutSkeletonTopologicalOrientationCertificate();
assert.equal(witness.passed,true);
assert.equal(action.passed,true);

function targetFor(g){
  return action.metric_isometry_action.action_rows.find(row=>row.source===INHERITED&&row.isometry===g)?.target;
}

const hostileClasses={};
for(const name of CLASS_ORDER){
  const rows=witness.classes[name];
  const labelledEdges=NONIDENTITY.map(g=>{
    const target=targetFor(g);
    assert.ok(target,`${name} missing action target for ${g}`);
    return {transport:g,target,witnesses:rows.filter(row=>!row.cell.includes(target)).map(row=>row.id).sort()};
  });
  const distinct=normalize(labelledEdges.map(row=>row.witnesses));
  const clutter=clutterize(distinct);
  const firstBlocker=blockerDepthFirst(clutter);
  const doubleBlocker=blockerDepthFirst(firstBlocker);
  hostileClasses[name]=Object.freeze({
    labelled_edges:Object.freeze(labelledEdges.map(row=>Object.freeze({transport:row.transport,target:row.target,witnesses:Object.freeze([...row.witnesses])}))),
    distinct_edges:Object.freeze(distinct.map(row=>Object.freeze([...row]))),
    clutter:Object.freeze(clutter.map(row=>Object.freeze([...row]))),
    first_blocker:Object.freeze(firstBlocker.map(row=>Object.freeze([...row]))),
    double_blocker:Object.freeze(doubleBlocker.map(row=>Object.freeze([...row]))),
  });
}
Object.freeze(hostileClasses);

const { finiteTransportSeparationHypergraphRobustMulticoverCertificate } = await import('../app/dome-world/previews/a15-r0/finite-transport-separation-hypergraph-robust-multicover.js');
const { finiteBlockerDualityMinimalObstructionReconstructionCertificate } = await import('../app/dome-world/previews/a15-r0/finite-blocker-duality-minimal-obstruction-reconstruction.js');
const parent=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
const child=finiteBlockerDualityMinimalObstructionReconstructionCertificate();
assert.equal(parent.passed,true);
assert.equal(child.passed,true);

let edgeMismatch=0,blockerMismatch=0,doubleMismatch=0;
for(const name of CLASS_ORDER){
  const h=hostileClasses[name],p=parent.classes[name],c=child.classes[name];
  const parentLabelled=p.transport_labelled_edges.map(row=>row.witnesses);
  if(!familyEqual(h.labelled_edges.map(row=>row.witnesses),parentLabelled)) edgeMismatch++;
  if(!familyEqual(h.first_blocker,p.blocker_families)) blockerMismatch++;
  if(!familyEqual(h.double_blocker,h.clutter)) doubleMismatch++;
  assert.equal(familyEqual(h.clutter,c.clutter_edges),true,name);
  assert.equal(familyEqual(h.first_blocker,c.recomputed_first_blocker),true,name);
  assert.equal(familyEqual(h.double_blocker,c.double_blocker),true,name);
}

assert.equal(edgeMismatch,0);
assert.equal(blockerMismatch,0);
assert.equal(doubleMismatch,0);
assert.equal(child.ledger.first_blocker_vs_parent_mismatches,0);
assert.equal(child.ledger.double_blocker_vs_clutter_mismatches,0);
assert.equal(child.ledger.mu_original_vs_clutter_mismatches,0);

console.log(JSON.stringify({
  hostile:true,
  edge_mismatches:edgeMismatch,
  blocker_mismatches:blockerMismatch,
  double_blocker_mismatches:doubleMismatch,
  classes:Object.fromEntries(CLASS_ORDER.map(name=>[name,{
    edges:hostileClasses[name].labelled_edges,
    clutter:hostileClasses[name].clutter,
    blocker:hostileClasses[name].first_blocker,
    double_blocker:hostileClasses[name].double_blocker,
  }])),
},null,2));
