import assert from 'node:assert/strict';
import { finiteTransportSeparationHypergraphRobustMulticoverCertificate } from '../app/dome-world/previews/a15-r0/finite-transport-separation-hypergraph-robust-multicover.js';
import { finiteBlockerDualityMinimalObstructionReconstructionCertificate } from '../app/dome-world/previews/a15-r0/finite-blocker-duality-minimal-obstruction-reconstruction.js';

const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
const transport=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
const blocker=finiteBlockerDualityMinimalObstructionReconstructionCertificate();
assert.equal(transport.passed,true);
assert.equal(blocker.passed,true);

const uniq=values=>[...new Set(values)];
const familyMask=(family,index)=>family.reduce((mask,id)=>mask|(1<<index[id]),0)>>>0;
const familyIds=(mask,ids)=>ids.filter((_,i)=>mask&(1<<i));
const sortMasks=xs=>[...new Set(xs.map(x=>x>>>0))].sort((a,b)=>a-b);
const sameMasks=(a,b)=>{ const aa=sortMasks(a),bb=sortMasks(b); return aa.length===bb.length&&aa.every((v,i)=>v===bb[i]); };
const hits=(mask,edge)=>(mask&edge)!==0;

function truthFromTransport(total,edges){
  const truth=new Uint8Array(total); let checks=0;
  for(let mask=0;mask<total;mask++){
    let ok=true;
    for(const edge of edges){ checks++; if(!hits(mask,edge)) ok=false; }
    truth[mask]=ok?1:0;
  }
  return {truth,checks};
}

function normalize(truth,n){
  const total=truth.length,all=(1<<n)-1;
  const truePred=new Uint8Array(total),falseSucc=new Uint8Array(total);
  let checks=0;
  for(let lower=0;lower<total;lower++) for(let i=0;i<n;i++){
    const bit=1<<i; if(lower&bit) continue;
    const upper=lower|bit; checks++;
    if(truth[lower]===1&&truth[upper]===1) truePred[upper]=1;
    if(truth[lower]===0&&truth[upper]===0) falseSucc[lower]=1;
  }
  const minTrue=[],maxFalse=[];
  for(let mask=0;mask<total;mask++){
    if(truth[mask]===1&&truePred[mask]===0) minTrue.push(mask>>>0);
    if(truth[mask]===0&&falseSucc[mask]===0) maxFalse.push(mask>>>0);
  }
  return {minTrue:sortMasks(minTrue),minObstruction:sortMasks(maxFalse.map(mask=>(all^mask)>>>0)),checks};
}

function dnfTruth(total,n,seeds){
  const truth=new Uint8Array(total); for(const mask of seeds) truth[mask]=1;
  let updates=0;
  for(let i=0;i<n;i++){
    const bit=1<<i;
    for(let mask=0;mask<total;mask++) if(mask&bit){ updates++; if(truth[mask^bit]) truth[mask]=1; }
  }
  return {truth,updates};
}

function cnfTruth(total,edges){
  const truth=new Uint8Array(total); let checks=0;
  for(let mask=0;mask<total;mask++){
    let ok=true;
    for(const edge of edges){ checks++; if(!hits(mask,edge)) ok=false; }
    truth[mask]=ok?1:0;
  }
  return {truth,checks};
}

function mismatches(a,b){ let n=0; for(let i=0;i<a.length;i++) if(a[i]!==b[i]) n++; return n; }

const hostileClasses={};
for(const name of CLASS_ORDER){
  const tr=transport.classes[name],br=blocker.classes[name];
  const universe=uniq([
    ...tr.transport_labelled_edges.flatMap(row=>row.witnesses),
    ...tr.blocker_families.flat(),
    ...(tr.never_minimal_witness_vertices||[]),
    ...(tr.essential_witness_vertices||[]),
  ]).sort();
  const n=universe.length,total=2**n,index=Object.fromEntries(universe.map((id,i)=>[id,i]));
  const edgeMasks=tr.transport_labelled_edges.map(row=>familyMask(row.witnesses,index));
  const parentBlocker=tr.blocker_families.map(f=>familyMask(f,index));
  const parentClutter=br.clutter_edges.map(f=>familyMask(f,index));
  const direct=truthFromTransport(total,edgeMasks);
  const first=normalize(direct.truth,n);
  const dnf=dnfTruth(total,n,first.minTrue);
  const cnf=cnfTruth(total,first.minObstruction);
  const second=normalize(dnf.truth,n);

  assert.equal(sameMasks(first.minTrue,parentBlocker),true,name);
  assert.equal(sameMasks(first.minObstruction,parentClutter),true,name);
  assert.equal(mismatches(dnf.truth,direct.truth),0,name);
  assert.equal(mismatches(cnf.truth,direct.truth),0,name);
  assert.equal(mismatches(dnf.truth,cnf.truth),0,name);
  assert.equal(sameMasks(second.minTrue,first.minTrue),true,name);
  assert.equal(sameMasks(second.minObstruction,first.minObstruction),true,name);

  hostileClasses[name]=Object.freeze({
    witness_count:n,
    family_count:total,
    transport_truth_intersection_checks:direct.checks,
    first_hasse_edge_checks:first.checks,
    success_dnf_subset_zeta_updates:dnf.updates,
    obstruction_cnf_intersection_checks:cnf.checks,
    second_hasse_edge_checks:second.checks,
    first_minimal_true_families:Object.freeze(first.minTrue.map(mask=>Object.freeze(familyIds(mask,universe)))),
    first_minimal_obstruction_families:Object.freeze(first.minObstruction.map(mask=>Object.freeze(familyIds(mask,universe)))),
    first_minimal_true_count:first.minTrue.length,
    first_minimal_obstruction_count:first.minObstruction.length,
    fixed_point:true,
  });
}
Object.freeze(hostileClasses);

const sum=key=>Object.values(hostileClasses).reduce((a,row)=>a+row[key],0);
const hostileLedger=Object.freeze({
  selected_family_count:sum('family_count'),
  transport_truth_intersection_checks:sum('transport_truth_intersection_checks'),
  first_hasse_edge_checks:sum('first_hasse_edge_checks'),
  success_dnf_subset_zeta_updates:sum('success_dnf_subset_zeta_updates'),
  obstruction_cnf_intersection_checks:sum('obstruction_cnf_intersection_checks'),
  second_hasse_edge_checks:sum('second_hasse_edge_checks'),
  fixed_work_units:sum('transport_truth_intersection_checks')+sum('first_hasse_edge_checks')+sum('success_dnf_subset_zeta_updates')+sum('obstruction_cnf_intersection_checks')+sum('second_hasse_edge_checks'),
  minimal_true_count:sum('first_minimal_true_count'),
  minimal_obstruction_count:sum('first_minimal_obstruction_count'),
});

assert.deepEqual(hostileLedger,{
  selected_family_count:1049664,
  transport_truth_intersection_checks:3148992,
  first_hasse_edge_checks:10491040,
  success_dnf_subset_zeta_updates:10491040,
  obstruction_cnf_intersection_checks:3147904,
  second_hasse_edge_checks:10491040,
  fixed_work_units:37770016,
  minimal_true_count:46,
  minimal_obstruction_count:9,
});

// Child import occurs only after the hostile prime families and ledger are frozen.
const { finitePrimeDualFixedPointRestNormalizerCertificate } = await import('../app/dome-world/previews/a15-r0/finite-prime-dual-fixed-point-rest-normalizer.js');
const child=finitePrimeDualFixedPointRestNormalizerCertificate();
assert.equal(child.passed,true);
assert.equal(child.parent_exact,true);

for(const name of CLASS_ORDER){
  const h=hostileClasses[name],c=child.classes[name];
  assert.equal(c.witness_count,h.witness_count,name);
  assert.equal(c.family_count,h.family_count,name);
  assert.equal(c.transport_truth_intersection_checks,h.transport_truth_intersection_checks,name);
  assert.equal(c.first_hasse_edge_checks,h.first_hasse_edge_checks,name);
  assert.equal(c.success_dnf_subset_zeta_updates,h.success_dnf_subset_zeta_updates,name);
  assert.equal(c.obstruction_cnf_intersection_checks,h.obstruction_cnf_intersection_checks,name);
  assert.equal(c.second_hasse_edge_checks,h.second_hasse_edge_checks,name);
  assert.deepEqual(c.first_minimal_true_families,h.first_minimal_true_families,name);
  assert.deepEqual(c.first_minimal_obstruction_families,h.first_minimal_obstruction_families,name);
  assert.equal(c.prime_dual_normalization_fixed_point,true,name);
}

for(const [key,value] of Object.entries(hostileLedger)) assert.equal(child.ledger[key],value,key);
assert.equal(child.ledger.first_minimal_true_vs_parent_blocker_mismatches,0);
assert.equal(child.ledger.first_minimal_obstruction_vs_parent_clutter_mismatches,0);
assert.equal(child.ledger.dnf_reconstruction_vs_transport_truth_mismatches,0);
assert.equal(child.ledger.cnf_reconstruction_vs_transport_truth_mismatches,0);
assert.equal(child.ledger.dnf_vs_cnf_truth_mismatches,0);
assert.equal(child.ledger.second_minimal_true_vs_first_mismatches,0);
assert.equal(child.ledger.second_minimal_obstruction_vs_first_mismatches,0);

console.log(JSON.stringify({schema:'td613.hostile.finite-prime-dual-fixed-point-rest-normalizer/v0.1',hostileLedger,classes:hostileClasses},null,2));
