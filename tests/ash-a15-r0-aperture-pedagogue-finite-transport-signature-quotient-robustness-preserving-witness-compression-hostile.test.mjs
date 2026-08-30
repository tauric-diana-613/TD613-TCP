import assert from 'node:assert/strict';
import { finiteOrientationFibreSymmetryBreakingCertificate } from '../app/dome-world/previews/a15-r0/finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteTransportSeparationHypergraphRobustMulticoverCertificate } from '../app/dome-world/previews/a15-r0/finite-transport-separation-hypergraph-robust-multicover.js';

const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
const witnessParent=finiteOrientationFibreSymmetryBreakingCertificate();
const hyperParent=finiteTransportSeparationHypergraphRobustMulticoverCertificate();
assert.equal(witnessParent.passed,true); assert.equal(hyperParent.passed,true);
function choose(n,k){ if(k<0||k>n)return 0; let z=1; for(let i=1;i<=k;i++)z=z*(n-k+i)/i; return z; }
function bump(o,k,a=1){o[k]=(o[k]||0)+a;}
function ranges(maxima,visit){const s=Array(maxima.length).fill(0);function w(i){if(i===maxima.length){visit([...s]);return;}for(let v=0;v<=maxima[i];v++){s[i]=v;w(i+1);}}w(0);}
function loads(state,sigs){return [0,1,2].map(j=>state.reduce((sum,m,i)=>sum+(sigs[i][j]==='1'?m:0),0));}
function identifies(state,sigs){return loads(state,sigs).every(v=>v>0);}

const hostile={};
for(const name of CLASS_ORDER){
  const ids=witnessParent.classes[name].map(r=>r.id),edges=hyperParent.classes[name].transport_labelled_edges;
  const groups={};
  for(const id of ids){const sig=edges.map(e=>e.witnesses.includes(id)?'1':'0').join('');if(!groups[sig])groups[sig]=[];groups[sig].push(id);}
  const sigs=Object.keys(groups).sort(),ns=sigs.map(s=>groups[s].length),multiplicities=Object.fromEntries(sigs.map((s,i)=>[s,ns[i]]));
  let states=1;for(const n of ns)states*=n+1;
  const weightedMu={},robust=[0,0,0,0,0],minimum=[null,null,null,null,null];let checksum=0,qBlockers=0,blockerLifts=0,nonbinary=0;
  ranges(ns,state=>{
    const L=loads(state,sigs),mu=Math.min(...L),width=state.reduce((a,b)=>a+b,0);let weight=1;for(let i=0;i<state.length;i++)weight*=choose(ns[i],state[i]);
    checksum+=weight;bump(weightedMu,mu,weight);for(let d=1;d<=5;d++)if(mu>=d){robust[d-1]+=weight;if(minimum[d-1]===null||width<minimum[d-1])minimum[d-1]=width;}
    if(L.every(v=>v>0)){let minimal=true;for(let i=0;i<state.length;i++)if(state[i]>0){const r=[...state];r[i]--;if(identifies(r,sigs)){minimal=false;break;}}if(minimal){qBlockers++;blockerLifts+=weight;if(state.some(v=>v>1))nonbinary++;}}
  });
  hostile[name]=Object.freeze({signature_multiplicities:Object.freeze(multiplicities),signature_classes:Object.freeze(Object.fromEntries(sigs.map(s=>[s,Object.freeze([...groups[s]])])) ,quotient_state_count:states,family_weight_checksum:checksum,weighted_mu_spectrum:Object.freeze(weightedMu),weighted_robust_counts_e0_to_e4:Object.freeze(robust),minimum_width_e0_to_e4:Object.freeze(minimum),quotient_blocker_state_count:qBlockers,weighted_blocker_lifts:blockerLifts,nonbinary_minimal_identifying_states:nonbinary});
}
Object.freeze(hostile);

assert.deepEqual(hostile.specialization_comparability.signature_multiplicities,{'000':6,'001':2,'010':2,'011':6,'100':2,'111':2});
assert.deepEqual(hostile.principal_open_identity.signature_multiplicities,{'011':2,'101':1,'111':2});
assert.deepEqual(hostile.principal_open_size.signature_multiplicities,{'000':1,'011':2,'101':2});
assert.deepEqual(hostile.cut_orientation.signature_multiplicities,{'011':8,'101':2});
assert.deepEqual(CLASS_ORDER.map(n=>hostile[n].quotient_state_count),[3969,18,18,27]);
assert.deepEqual(CLASS_ORDER.map(n=>hostile[n].quotient_blocker_state_count),[3,2,1,1]);
assert.deepEqual(CLASS_ORDER.map(n=>hostile[n].weighted_blocker_lifts),[22,4,4,16]);
assert.equal(CLASS_ORDER.reduce((s,n)=>s+hostile[n].family_weight_checksum,0),1049664);
assert.equal(CLASS_ORDER.reduce((s,n)=>s+hostile[n].quotient_state_count,0),4032);
assert.equal(CLASS_ORDER.reduce((s,n)=>s+hostile[n].nonbinary_minimal_identifying_states,0),0);

const { finiteTransportSignatureQuotientRobustnessPreservingWitnessCompressionCertificate }=await import('../app/dome-world/previews/a15-r0/finite-transport-signature-quotient-robustness-preserving-witness-compression.js');
const child=finiteTransportSignatureQuotientRobustnessPreservingWitnessCompressionCertificate();
for(const name of CLASS_ORDER){
  const h=hostile[name],c=child.classes[name];
  assert.deepEqual(c.signature_multiplicities,h.signature_multiplicities,name);
  assert.deepEqual(c.signature_classes,h.signature_classes,name);
  assert.equal(c.quotient_state_count,h.quotient_state_count,name);
  assert.equal(c.family_weight_checksum,h.family_weight_checksum,name);
  assert.deepEqual(c.weighted_mu_spectrum,h.weighted_mu_spectrum,name);
  assert.deepEqual(c.weighted_robust_counts_e0_to_e4,h.weighted_robust_counts_e0_to_e4,name);
  assert.deepEqual(c.minimum_width_e0_to_e4,h.minimum_width_e0_to_e4,name);
  assert.equal(c.quotient_blocker_state_count,h.quotient_blocker_state_count,name);
  assert.equal(c.weighted_blocker_lifts,h.weighted_blocker_lifts,name);
  assert.equal(c.nonbinary_minimal_identifying_states,h.nonbinary_minimal_identifying_states,name);
  assert.equal(c.passed,true,name);
}
assert.equal(child.ledger.quotient_state_count,4032);
assert.equal(child.ledger.original_family_factorization_audits,1049664);
assert.equal(child.passed,true);
console.log('Ash A15-R0 independent hostile transport-signature quotient reconstruction passed.');
