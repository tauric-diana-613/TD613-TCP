import assert from 'node:assert/strict';
import { finiteOrientationFibreSymmetryBreakingCertificate } from '../app/dome-world/previews/a15-r0/finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteMetricCutSkeletonTopologicalOrientationCertificate } from '../app/dome-world/previews/a15-r0/finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

const INHERITED='1111111110';
const GROUP=['id','(B M)','(A R)','(A R)(B M)'];
const NONIDENTITY=GROUP.slice(1);
const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
const witnessParent=finiteOrientationFibreSymmetryBreakingCertificate();
const actionParent=finiteMetricCutSkeletonTopologicalOrientationCertificate();
assert.equal(witnessParent.passed,true);
assert.equal(actionParent.passed,true);
assert.deepEqual(witnessParent.inherited_point_stabilizer,['id']);

function pc(v){ let n=0; for(;v;v>>>=1)n+=v&1; return n; }
function target(source,g){ return actionParent.metric_isometry_action.action_rows.find(row=>row.source===source&&row.isometry===g)?.target||null; }
function ids(mask,names){ const out=[]; for(let i=0;i<names.length;i++) if(mask&(1<<i))out.push(names[i]); return out; }
function spec(values){ const out={}; for(const value of values) out[value]=(out[value]||0)+1; return out; }
function key(values){ return JSON.stringify([...values].sort()); }

const fibre=witnessParent.orientation_fibre;
const fibreIndex=Object.fromEntries(fibre.map((bits,i)=>[bits,i]));
const inheritedBit=1<<fibreIndex[INHERITED];
const fullCell=(1<<fibre.length)-1;
const hostile={};

for(const name of CLASS_ORDER){
  const rows=witnessParent.classes[name],names=rows.map(row=>row.id),n=rows.length,total=2**n;
  const cellMasks=rows.map(row=>row.cell.reduce((m,bits)=>m|(1<<fibreIndex[bits]),0));
  const edgeRows=NONIDENTITY.map(g=>{
    const t=target(INHERITED,g); let mask=0;
    for(let i=0;i<n;i++) if(!rows[i].cell.includes(t)) mask|=(1<<i);
    return {transport:g,target:t,mask:mask>>>0,witnesses:ids(mask,names)};
  });
  const edgeMasks=edgeRows.map(row=>row.mask);
  const d=new Map(); for(const edge of edgeRows){ const k=key(edge.witnesses); if(!d.has(k))d.set(k,{witnesses:edge.witnesses,transports:[]}); d.get(k).transports.push(edge.transport); }
  const cellOf=mask=>{ let cell=fullCell; for(let i=0;i<n;i++) if(mask&(1<<i))cell&=cellMasks[i]; return cell; };
  const hits=mask=>edgeMasks.every(edge=>(mask&edge)!==0);
  const depth=[0,0,0,0,0],mins=[null,null,null,null,null],muValues=[],blocker=[],directMinimal=[];
  let avoidMismatch=0,transversalMismatch=0,muMismatch=0;
  for(let mask=0;mask<total;mask++){
    const counts=edgeMasks.map(edge=>pc((mask&edge)>>>0)),mu=Math.min(...counts),width=pc(mask),h=counts.every(c=>c>0),cell=cellOf(mask),identifies=cell===inheritedBit;
    muValues.push(mu);
    const byEdge=['id',...NONIDENTITY.filter((_,i)=>counts[i]===0)];
    const byCell=['id',...NONIDENTITY.filter(g=>cell&(1<<fibreIndex[target(INHERITED,g)]))];
    if(JSON.stringify(byEdge)!==JSON.stringify(byCell))avoidMismatch++;
    if(h!==identifies)transversalMismatch++;
    const directMu=Math.min(...NONIDENTITY.map(g=>{ const t=target(INHERITED,g); let c=0; for(let i=0;i<n;i++) if((mask&(1<<i))&&!rows[i].cell.includes(t))c++; return c; }));
    if(mu!==directMu)muMismatch++;
    for(let k=1;k<=5;k++) if(mu>=k){depth[k-1]++; if(mins[k-1]===null||width<mins[k-1])mins[k-1]=width;}
    if(h){ let minimal=true; for(let i=0;i<n;i++) if(mask&(1<<i)) if(hits((mask&~(1<<i))>>>0)){minimal=false;break;} if(minimal)blocker.push(mask); }
    if(identifies){ let minimal=true; for(let i=0;i<n;i++) if(mask&(1<<i)) if(cellOf((mask&~(1<<i))>>>0)===inheritedBit){minimal=false;break;} if(minimal)directMinimal.push(mask); }
  }
  assert.deepEqual([...blocker].sort((a,b)=>a-b),[...directMinimal].sort((a,b)=>a-b),name);
  const widths=blocker.map(pc),allMask=(1<<n)-1; let essential=allMask,used=0; for(const mask of blocker){essential&=mask;used|=mask;} if(blocker.length===0)essential=0;
  hostile[name]=Object.freeze({
    witness_count:n,family_count:total,
    edges:Object.freeze(edgeRows.map(row=>Object.freeze({transport:row.transport,target:row.target,witnesses:Object.freeze([...row.witnesses]),size:row.witnesses.length}))),
    deduplicated_edge_count:d.size,
    edge_size_spectrum:Object.freeze(spec(edgeRows.map(row=>row.witnesses.length))),
    mu_spectrum:Object.freeze(spec(muValues)),
    multicover_counts:Object.freeze(depth),minimum:Object.freeze(mins),
    blocker_families:Object.freeze(blocker.map(mask=>Object.freeze(ids(mask,names)))),
    blocker_width_spectrum:Object.freeze(spec(widths)),
    essential:Object.freeze(ids(essential,names)),
    never:Object.freeze(ids((allMask&~used)>>>0,names)),
    avoidMismatch,transversalMismatch,muMismatch,
  });
}
Object.freeze(hostile);

// Freeze inherited expectations before either #886 or the child is loaded.
assert.deepEqual(hostile.specialization_comparability.multicover_counts,[981696,714560,319040,61888,0]);
assert.deepEqual(hostile.specialization_comparability.minimum,[1,2,4,6,null]);
assert.deepEqual(hostile.principal_open_identity.multicover_counts,[27,14,3,0,0]);
assert.deepEqual(hostile.principal_open_identity.minimum,[1,2,4,null,null]);
assert.deepEqual(hostile.principal_open_size.multicover_counts,[18,2,0,0,0]);
assert.deepEqual(hostile.principal_open_size.minimum,[2,4,null,null,null]);
assert.deepEqual(hostile.cut_orientation.multicover_counts,[765,247,0,0,0]);
assert.deepEqual(hostile.cut_orientation.minimum,[2,4,null,null,null]);
for(const [name,row] of Object.entries(hostile)){
  assert.equal(row.avoidMismatch,0,name);
  assert.equal(row.transversalMismatch,0,name);
  assert.equal(row.muMismatch,0,name);
}

const { finiteOrientationFibreTransportOpacityErasureRobustnessCertificate }=await import('../app/dome-world/previews/a15-r0/finite-orientation-fibre-transport-opacity-erasure-robustness.js');
const robustParent=finiteOrientationFibreTransportOpacityErasureRobustnessCertificate();
assert.equal(robustParent.passed,true);
for(const name of CLASS_ORDER){
  assert.deepEqual(hostile[name].multicover_counts,robustParent.classes[name].robust_family_counts_e0_to_e4,name);
  assert.deepEqual(hostile[name].minimum,robustParent.classes[name].minimum_width_e0_to_e4,name);
}

const { finiteTransportSeparationHypergraphRobustMulticoverCertificate }=await import('../app/dome-world/previews/a15-r0/finite-transport-separation-hypergraph-robust-multicover.js');
const child=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
for(const name of CLASS_ORDER){
  const h=hostile[name],c=child.classes[name];
  assert.equal(c.witness_count,h.witness_count,name);
  assert.equal(c.family_count,h.family_count,name);
  assert.deepEqual(c.transport_labelled_edges,h.edges,name);
  assert.equal(c.deduplicated_edge_count,h.deduplicated_edge_count,name);
  assert.deepEqual(c.edge_size_spectrum,h.edge_size_spectrum,name);
  assert.deepEqual(c.mu_hypergraph_spectrum,h.mu_spectrum,name);
  assert.deepEqual(c.multicover_family_counts_depth_1_to_5,h.multicover_counts,name);
  assert.deepEqual(c.robust_transport_rank_e0_to_e4,h.minimum,name);
  assert.deepEqual(c.blocker_families,h.blocker_families,name);
  assert.deepEqual(c.blocker_width_spectrum,h.blocker_width_spectrum,name);
  assert.deepEqual(c.essential_witness_vertices,h.essential,name);
  assert.deepEqual(c.never_minimal_witness_vertices,h.never,name);
  assert.equal(c.passed,true,name);
}
assert.deepEqual(child.ledger.selected_family_count,1049664);
assert.deepEqual(child.ledger.family_transport_intersection_checks,3148992);
assert.deepEqual(child.ledger.multicover_depth_checks_1_to_5,5248320);
assert.deepEqual(child.ledger.all_family_single_witness_deletion_checks_for_blocker_minimality,10491040);
assert.ok(child.same_rank_distinct_incidence_examples.length>0);
assert.equal(child.passed,true);
console.log('Ash A15-R0 independent hostile transport-separation hypergraph / robust multicover reconstruction passed.');
