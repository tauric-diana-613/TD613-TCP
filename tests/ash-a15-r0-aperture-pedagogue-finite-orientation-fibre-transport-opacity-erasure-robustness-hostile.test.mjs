import assert from 'node:assert/strict';
import { finiteOrientationFibreSymmetryBreakingCertificate } from '../app/dome-world/previews/a15-r0/finite-orientation-fibre-symmetry-breaking-identifiability.js';
import { finiteMetricCutSkeletonTopologicalOrientationCertificate } from '../app/dome-world/previews/a15-r0/finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

const INHERITED='1111111110';
const GROUP=['id','(B M)','(A R)','(A R)(B M)'];
const CLASS_ORDER=['specialization_comparability','principal_open_identity','principal_open_size','cut_orientation'];
const parent=finiteOrientationFibreSymmetryBreakingCertificate();
const actionParent=finiteMetricCutSkeletonTopologicalOrientationCertificate();
assert.equal(parent.passed,true);
assert.equal(actionParent.passed,true);

function popcount32(value){ value=value-((value>>>1)&0x55555555); value=(value&0x33333333)+((value>>>2)&0x33333333); return (((value+(value>>>4))&0x0F0F0F0F)*0x01010101)>>>24; }
function choose(n,k){ if(k<0||k>n)return 0; let out=1; for(let i=1;i<=k;i++) out=out*(n-k+i)/i; return out; }
function actionTarget(source,g){ return actionParent.metric_isometry_action.action_rows.find(row=>row.source===source&&row.isometry===g)?.target||null; }
function sameSet(a,b){ return a.size===b.size&&[...a].every(x=>b.has(x)); }
function setwiseStabilizerMask(transportMask){
  const cell=new Set(GROUP.filter((_,i)=>transportMask&(1<<i)).map(g=>actionTarget(INHERITED,g)));
  let out=0;
  for(let gi=0;gi<GROUP.length;gi++){
    const image=new Set([...cell].map(bits=>actionTarget(bits,GROUP[gi])));
    if(sameSet(cell,image)) out|=(1<<gi);
  }
  return out;
}
function bump(object,key){ object[key]=(object[key]||0)+1; }

const hostile={};
for(const name of CLASS_ORDER){
  const rows=parent.classes[name],n=rows.length,total=2**n;
  const nonidentity=GROUP.slice(1);
  const separationMasks=nonidentity.map(g=>{
    const target=actionTarget(INHERITED,g); let mask=0;
    for(let i=0;i<n;i++) if(!rows[i].cell.includes(target)) mask|=(1<<i);
    return mask>>>0;
  });
  const muSpectrum={},robust=[0,0,0,0,0],minimum=[null,null,null,null,null];
  let exact=0,difference=0;
  for(let mask=0;mask<total;mask++){
    const width=popcount32(mask),counts=separationMasks.map(sep=>popcount32(mask&sep)),mu=Math.min(...counts);
    bump(muSpectrum,mu);
    if(mu>=1) exact++;
    for(let e=0;e<=4;e++) if(mu>=e+1){ robust[e]++; if(minimum[e]===null||width<minimum[e]) minimum[e]=width; }
    let transport=1;
    for(let i=0;i<separationMasks.length;i++) if((mask&separationMasks[i])===0) transport|=(1<<(i+1));
    if(transport!==setwiseStabilizerMask(transport)) difference++;
  }
  const cases=Array.from({length:5},(_,e)=>choose(n,e)*(2**(n-e)));
  hostile[name]={witnesses:n,families:total,exact,mu:muSpectrum,robust,minimum,difference,cases};
}

// Freeze the hostile result before the child module is loaded.
assert.deepEqual(hostile.specialization_comparability,{witnesses:20,families:1048576,exact:981696,mu:{0:66880,1:267136,2:395520,3:257152,4:61888},robust:[981696,714560,319040,61888,0],minimum:[1,2,4,6,null],difference:576,cases:[1048576,10485760,49807360,149422080,317521920]});
assert.deepEqual(hostile.principal_open_identity,{witnesses:5,families:32,exact:27,mu:{0:5,1:13,2:11,3:3},robust:[27,14,3,0,0],minimum:[1,2,4,null,null],difference:0,cases:[32,80,80,40,10]});
assert.deepEqual(hostile.principal_open_size,{witnesses:5,families:32,exact:18,mu:{0:14,1:16,2:2},robust:[18,2,0,0,0],minimum:[2,4,null,null,null],difference:0,cases:[32,80,80,40,10]});
assert.deepEqual(hostile.cut_orientation,{witnesses:10,families:1024,exact:765,mu:{0:259,1:518,2:247},robust:[765,247,0,0,0],minimum:[2,4,null,null,null],difference:0,cases:[1024,5120,11520,15360,13440]});

const { finiteOrientationFibreTransportOpacityErasureRobustnessCertificate } = await import('../app/dome-world/previews/a15-r0/finite-orientation-fibre-transport-opacity-erasure-robustness.js');
const child=finiteOrientationFibreTransportOpacityErasureRobustnessCertificate();
for(const name of CLASS_ORDER){
  const h=hostile[name],c=child.classes[name];
  assert.equal(c.witnesses,h.witnesses,name);
  assert.equal(c.families,h.families,name);
  assert.equal(c.exact_identifying_families,h.exact,name);
  assert.deepEqual(c.mu_tr_spectrum,h.mu,name);
  assert.deepEqual(c.robust_family_counts_e0_to_e4,h.robust,name);
  assert.deepEqual(c.minimum_width_e0_to_e4,h.minimum,name);
  assert.equal(c.residual_transport_vs_setwise_stabilizer_difference_families,h.difference,name);
  assert.deepEqual(c.direct_deletion_cases_e0_to_e4,h.cases,name);
  assert.equal(c.criterion_mismatches,0,name);
}
assert.equal(Object.values(hostile).reduce((sum,row)=>sum+row.cases.reduce((a,b)=>a+b,0),0),528332644);
assert.equal(child.ledger.residual_transport_vs_setwise_stabilizer_difference_families,576);
assert.equal(child.passed,true);
console.log('Ash A15-R0 independent hostile transport-opacity / witness-erasure reconstruction passed.');
