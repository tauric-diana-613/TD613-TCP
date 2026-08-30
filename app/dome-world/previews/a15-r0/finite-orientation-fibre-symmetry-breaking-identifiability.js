import { finiteMetricCutSkeletonTopologicalOrientationCertificate } from './finite-metric-cut-skeleton-topological-orientation-nonidentifiability.js';

export const FINITE_ORIENTATION_FIBRE_SYMMETRY_BREAKING_SCHEMA='td613.dome-world.finite-orientation-fibre-symmetry-breaking-identifiability/v0.1';
export const FINITE_ORIENTATION_FIBRE_SYMMETRY_BREAKING_PARENT_RECEIPT='9456a6a44eaaff46fa796cd591bb2f61e3680187';

const ROLES=['A','B','T','M','R'];
const INHERITED='1111111110';
const CUTS=['A','AB','AT','AM','ABT','ABM','ATM','ABTM','ABTR','ATMR'];
const GROUP=['id','(B M)','(A R)','(A R)(B M)'];
let cached=null;

const freeze=v=>{ if(v&&typeof v==='object'&&!Object.isFrozen(v)){ Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const setKey=s=>ROLES.filter(r=>s.has(r)).join('')||'EMPTY';
const setFromId=id=>new Set(id==='EMPTY'?[]:ROLES.filter(r=>id.includes(r)));
const intersect=(a,b)=>new Set([...a].filter(x=>b.has(x)));
function combinations(items,k){ const out=[]; function walk(i,cur){ if(cur.length===k){out.push([...cur]);return;} for(let j=i;j<items.length;j++){cur.push(items[j]);walk(j+1,cur);cur.pop();}} walk(0,[]);return out; }
function specialization(opens){ const rel={}; for(const x of ROLES){rel[x]={};for(const y of ROLES) rel[x][y]=opens.every(o=>!o.has(x)||o.has(y));} return rel; }
function principalOpens(opens){ const out={}; for(const x of ROLES){ let m=new Set(ROLES); for(const o of opens.filter(o=>o.has(x))) m=intersect(m,o); out[x]=setKey(m);} return out; }
function actionTable(parent){ return parent.metric_isometry_action?.action_rows||[]; }
function target(parent,source,g){ const row=actionTable(parent).find(r=>r.source===source&&r.isometry===g); return row?.target||null; }
function stabilizer(parent,cell){ const C=new Set(cell); return GROUP.filter(g=>{ const image=new Set([...C].map(x=>target(parent,x,g))); return image.size===C.size&&[...image].every(x=>C.has(x)); }); }
function evaluatePredicates(parent,topologies,predicates){
  const inherited=topologies[INHERITED],rows=[];
  for(const p of predicates){ const value=p.value(inherited),cell=Object.keys(topologies).filter(bits=>p.value(topologies[bits])===value); rows.push(freeze({id:p.id,value,cell:freeze(cell.sort()),residual_size:cell.length,setwise_stabilizer:freeze(stabilizer(parent,cell)),setwise_stabilizer_size:stabilizer(parent,cell).length,identifies:cell.length===1})); }
  return freeze(rows);
}
function minimumFamilies(rows){
  const ids=rows.map(r=>r.id),cellById=Object.fromEntries(rows.map(r=>[r.id,new Set(r.cell)]));
  for(let k=1;k<=ids.length;k++){ const winners=[]; for(const combo of combinations(ids,k)){ let cell=new Set(Object.keys(Object.fromEntries(rows.flatMap(r=>r.cell.map(x=>[x,true]))))); for(const id of combo) cell=new Set([...cell].filter(x=>cellById[id].has(x))); if(cell.size===1&&cell.has(INHERITED)) winners.push(combo); } if(winners.length) return freeze({minimum:k,count:winners.length,families:freeze(winners.map(freeze))}); }
  return freeze({minimum:null,count:0,families:freeze([])});
}

export function finiteOrientationFibreSymmetryBreakingCertificate(){
  if(cached) return cached;
  const parent=finiteMetricCutSkeletonTopologicalOrientationCertificate();
  const compatible=parent.orientation_fibre?.topologies||[];
  const topologies={};
  for(const row of compatible){ const opens=(row.opens||[]).map(a=>new Set(a)); topologies[row.bits]={bits:row.bits,opens,rel:specialization(opens),principal:principalOpens(opens)}; }

  const comparability=[]; for(const x of ROLES) for(const y of ROLES) if(x!==y) comparability.push({id:`${x}<${y}`,value:t=>Boolean(t.rel[x][y])});
  const principalIdentity=ROLES.map(x=>({id:`U(${x})`,value:t=>t.principal[x]}));
  const principalSize=ROLES.map(x=>({id:`|U(${x})|`,value:t=>setFromId(t.principal[x]).size}));
  const cutOrientation=CUTS.map((cut,i)=>({id:`cut:${cut}`,value:t=>t.bits[i]}));

  const classes={
    specialization_comparability:evaluatePredicates(parent,topologies,comparability),
    principal_open_identity:evaluatePredicates(parent,topologies,principalIdentity),
    principal_open_size:evaluatePredicates(parent,topologies,principalSize),
    cut_orientation:evaluatePredicates(parent,topologies,cutOrientation),
  };
  const minima=Object.fromEntries(Object.entries(classes).map(([k,rows])=>[k,minimumFamilies(rows)]));
  const residualSpectra=Object.fromEntries(Object.entries(classes).map(([k,rows])=>[k,Object.fromEntries([...new Set(rows.map(r=>r.residual_size))].sort((a,b)=>a-b).map(n=>[n,rows.filter(r=>r.residual_size===n).length]))]));
  const singletonSuccesses=Object.fromEntries(Object.entries(classes).map(([k,rows])=>[k,freeze(rows.filter(r=>r.identifies).map(r=>r.id))]));
  const singletonFailures=Object.fromEntries(Object.entries(classes).map(([k,rows])=>[k,freeze(rows.filter(r=>!r.identifies).map(r=>freeze({id:r.id,residual_size:r.residual_size,stabilizer_size:r.setwise_stabilizer_size})))]));
  const pointStabilizer=GROUP.filter(g=>target(parent,INHERITED,g)===INHERITED);
  const parentExact=parent.passed===true&&compatible.length===4&&Object.keys(topologies).length===4&&topologies[INHERITED]!==undefined&&actionTable(parent).length===16&&pointStabilizer.length===1;
  const passed=parentExact&&classes.specialization_comparability.length===20&&classes.principal_open_identity.length===5&&classes.principal_open_size.length===5&&classes.cut_orientation.length===10&&Object.values(minima).every(m=>m.minimum!==null);
  cached=freeze({schema:FINITE_ORIENTATION_FIBRE_SYMMETRY_BREAKING_SCHEMA,parent_receipt:FINITE_ORIENTATION_FIBRE_SYMMETRY_BREAKING_PARENT_RECEIPT,parent_exact:parentExact,orientation_fibre:freeze(Object.keys(topologies).sort()),inherited:INHERITED,metric_isometry_group:freeze([...GROUP]),inherited_point_stabilizer:freeze(pointStabilizer),classes:freeze(classes),singleton_residual_spectra:freeze(residualSpectra),singleton_successes:freeze(singletonSuccesses),singleton_failures:freeze(singletonFailures),minimum_identifying_families:freeze(minima),membranes:freeze(['METRIC_ORBIT != TOPOLOGY_IDENTITY','SYMMETRY_BREAKING_WITNESS != METRIC_INVARIANT','LABELLED_WITNESS != LABEL_FREE_INTRINSIC_INVARIANT','FINITE_WITNESS_CARDINALITY_MINIMUM != MINIMUM_BIT_LENGTH','FINITE_WITNESS_CARDINALITY_MINIMUM != SHANNON_INFORMATION','FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY']),passed});
  return cached;
}