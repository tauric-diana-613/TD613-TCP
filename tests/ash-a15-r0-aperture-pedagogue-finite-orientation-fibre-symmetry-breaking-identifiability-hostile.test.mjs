import assert from 'node:assert/strict';
import { finiteMetricCutSkeletonTopologicalOrientationCertificate as parentCertificate } from '../app/dome-world/previews/a15-r0/finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

const ROLES=['A','B','T','M','R'];
const INHERITED='1111111110';
const CUTS=['A','AB','AT','AM','ABT','ABM','ATM','ABTM','ABTR','ATMR'];
const GROUP=['id','(B M)','(A R)','(A R)(B M)'];
const parent=parentCertificate();
const compatible=parent.orientation_fibre?.compatible_topologies||parent.compatible_topologies||[];
assert.equal(compatible.length,4);
const topologies={};
const setKey=s=>ROLES.filter(r=>s.has(r)).join('')||'EMPTY';
const intersect=(a,b)=>new Set([...a].filter(x=>b.has(x)));
for(const row of compatible){
  const opens=row.opens.map(a=>new Set(a));
  const rel={}; for(const x of ROLES){ rel[x]={}; for(const y of ROLES) rel[x][y]=opens.every(o=>!o.has(x)||o.has(y)); }
  const principal={}; for(const x of ROLES){ let m=new Set(ROLES); for(const o of opens.filter(o=>o.has(x))) m=intersect(m,o); principal[x]=setKey(m); }
  topologies[row.bits]={bits:row.bits,rel,principal};
}
assert.deepEqual(Object.keys(topologies).sort(),['0000000001','0000000010','1111111101','1111111110']);
const actionRows=parent.orientation_fibre?.action_rows||parent.action?.rows||[];
const target=(source,g)=>actionRows.find(r=>r.source===source&&r.isometry===g)?.target||null;
assert.equal(GROUP.filter(g=>target(INHERITED,g)===INHERITED).length,1);
function cell(fn){ const v=fn(topologies[INHERITED]); return Object.keys(topologies).filter(k=>fn(topologies[k])===v).sort(); }
const comparability=[]; for(const x of ROLES) for(const y of ROLES) if(x!==y) comparability.push([`${x}<${y}`,cell(t=>Boolean(t.rel[x][y]))]);
const principalIdentity=ROLES.map(x=>[`U(${x})`,cell(t=>t.principal[x])]);
const principalSize=ROLES.map(x=>[`|U(${x})|`,cell(t=>t.principal[x]==='EMPTY'?0:t.principal[x].length)]);
const cutOrientation=CUTS.map((cut,i)=>[`cut:${cut}`,cell(t=>t.bits[i])]);
for(const rows of [comparability,principalIdentity,principalSize,cutOrientation]) for(const [,c] of rows) assert.ok(c.includes(INHERITED));
const spectra=rows=>Object.fromEntries([...new Set(rows.map(([,c])=>c.length))].sort((a,b)=>a-b).map(n=>[n,rows.filter(([,c])=>c.length===n).length]));
console.log(JSON.stringify({hostile:true,spectra:{specialization_comparability:spectra(comparability),principal_open_identity:spectra(principalIdentity),principal_open_size:spectra(principalSize),cut_orientation:spectra(cutOrientation)}},null,2));
const child=await import('../app/dome-world/previews/a15-r0/finite-orientation-fibre-symmetry-breaking-identifiability.js');
const c=child.finiteOrientationFibreSymmetryBreakingCertificate();
assert.equal(c.passed,true);
assert.deepEqual(c.singleton_residual_spectra.specialization_comparability,spectra(comparability));
assert.deepEqual(c.singleton_residual_spectra.principal_open_identity,spectra(principalIdentity));
assert.deepEqual(c.singleton_residual_spectra.principal_open_size,spectra(principalSize));
assert.deepEqual(c.singleton_residual_spectra.cut_orientation,spectra(cutOrientation));
