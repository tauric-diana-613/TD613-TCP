import assert from 'node:assert/strict';
import { phasonicObservationMatrix,observePhasonicState } from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from '../app/dome-world/previews/a15-r0/claim-bundle-minimal-sufficient-custody-frontier.js';
import { finiteCustodyBehavioralQuotientTaskClosureCanonicalCertificate } from '../app/dome-world/previews/a15-r0/finite-custody-behavioral-quotient-task-closure-certificate.js';

// Hostile rule: reconstruct the five task-output functions and every subset closure
// before importing the canonical successor implementation.
const TASKS=['B','R','T','A','M'];
const RULES=[['R','B'],['R','T'],['T','A'],['M','A']];
const EXPECTED={
  EMPTY:['EMPTY',1],B:['B',4],R:['BRTA',32],T:['TA',27],A:['A',17],M:['AM',21],
  BR:['BRTA',32],BT:['BTA',28],BA:['BA',19],BM:['BAM',23],RT:['BRTA',32],RA:['BRTA',32],RM:['BRTAM',36],TA:['TA',27],TM:['TAM',31],AM:['AM',21],
  BRT:['BRTA',32],BRA:['BRTA',32],BRM:['BRTAM',36],BTA:['BTA',28],BTM:['BTAM',32],BAM:['BAM',23],RTA:['BRTA',32],RTM:['BRTAM',36],RAM:['BRTAM',36],TAM:['TAM',31],
  BRTA:['BRTA',32],BRTM:['BRTAM',36],BRAM:['BRTAM',36],BTAM:['BTAM',32],RTAM:['BRTAM',36],BRTAM:['BRTAM',36],
};
const canon=value=>JSON.stringify(value);
const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
const sid=schedule=>schedule.map(x=>letters[x]).join('-');
const equal=(a,b)=>a.size===b.size&&[...a].every(v=>b.has(v));
const subset=(a,b)=>[...a].every(v=>b.has(v));
const union=(a,b)=>new Set([...a,...b]);
const inter=(a,b)=>new Set([...a].filter(v=>b.has(v)));
const ordered=S=>new Set(TASKS.filter(t=>S.has(t)));
const id=S=>TASKS.filter(t=>S.has(t)).join('')||'EMPTY';
const idSet=text=>new Set(text==='EMPTY'?[]:TASKS.filter(t=>text.includes(t)));

function cube(){const out=[];for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++)for(let z=-2;z<=2;z++)out.push([x,y,z]);return out;}
function antecedents(){
  const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  assert.equal(policy.passed,true);
  const pmap=new Map(policy.policy_geometry.map(r=>[r.schedule_id,r]));
  const out=[];
  for(const schedule of DROMOLOGICAL_S3_SCHEDULES){
    const schedule_id=sid(schedule),matrix=phasonicObservationMatrix(schedule),p=pmap.get(schedule_id);assert.ok(p);
    for(const state of cube()) out.push({schedule:[...schedule],schedule_id,first_stratum:schedule[0],state,matrix,observation:observePhasonicState(state,schedule),replay_required:p.replay_required});
  }
  return out;
}
function q(stage,a){return stage===0?['NULL_REGISTERED_TRACE']:[a.matrix.slice(0,stage),a.observation.slice(0,stage)];}
function claim(c,a){
  if(c==='FIRST_STRATUM')return a.first_stratum;if(c==='SCHEDULE')return a.schedule_id;if(c==='X1')return a.state[0];if(c==='X2')return a.state[1];if(c==='X3')return a.state[2];
  if(c==='FULL_STATE')return a.state;if(c==='REPLAY_REQUIRED_FOR_EXACT_STATE')return a.replay_required;throw new Error(`hostile unknown claim ${c}`);
}
const bundle=(claims,a)=>claims.map(c=>[c,claim(c,a)]);
function atlas(all){const out=new Map();for(const stage of [0,1,2,3]){const fibres=new Map();for(const a of all){const k=canon(q(stage,a));if(!fibres.has(k))fibres.set(k,[]);fibres.get(k).push(a);}out.set(stage,fibres);}return out;}
function profile(A,targets,stage,claims){
  const keys=[...new Set(targets.map(a=>canon(q(stage,a))))].sort(),cards=[];
  for(const k of keys)cards.push(new Set(A.get(stage).get(k).map(a=>canon(bundle(claims,a)))).size);
  cards.sort((a,b)=>a-b);return {cards,maximum:Math.max(...cards),all:cards.every(x=>x===1),occupied:keys.length};
}
function uniform(p){const v=[...new Set(p.cards)];return v.length===1?`${p.cards.length}x${v[0]}`:`${p.cards.length}xMIXED:${p.cards.join(',')}`;}

const all=antecedents();assert.equal(all.length,750);
const A=atlas(all);assert.deepEqual([...A.values()].map(x=>x.size),[1,23,158,430]);
const parent=claimBundleMinimalSufficientCustodyFrontierCertificate();assert.equal(parent.passed,true);assert.equal(parent.bundle_support_certificate.rows.length,762);
const targets=new Map(DROMOLOGICAL_S3_SCHEDULES.map(s=>{const k=sid(s);return[k,all.filter(a=>a.schedule_id===k)];}));
const contexts=[];let stageProfiles=0;
for(const row of parent.bundle_support_certificate.rows){const p={};for(const stage of [0,1,2,3]){p[stage]=profile(A,targets.get(row.schedule_id),stage,row.claims);stageProfiles++;}contexts.push({row,p});}
assert.equal(contexts.length,762);assert.equal(stageProfiles,3048);

function R(c){const b=c.row.actual_birth;if(b==='INF')return[];const out=[];for(let f=b;f<=3;f++)for(let d=0;d<f;d++){const p=c.p[d];out.push([f,d,d<b?['RESTORE',p.maximum]:['PRESERVE',p.all]]);}return out;}
function T(c){const b=c.row.actual_birth;if(b==='INF'||b<2)return[];const out=[];for(let f=b;f<=3;f++)for(let d=1;d<b;d++){if(d>=f)continue;for(let k=0;k<d;k++){const md=c.p[d].maximum,mc=c.p[k].maximum;out.push([f,d,k,md,mc,md===mc]);}}return out;}
function AA(c){if(c.row.actual_birth!==3)return null;const m2=c.p[2].maximum,m1=c.p[1].maximum,m0=c.p[0].maximum;return[m2,m1,m0,m1===m2?'FLAT':'EXPAND',m0===m1?'FLAT':'EXPAND'];}
function M(c){if(c.row.actual_birth!==3)return null;return[c.p[2].maximum,c.p[1].maximum,c.p[0].maximum,uniform(c.p[2]),uniform(c.p[1])];}
let rRows=0,tRows=0,aRows=0,mRows=0;
for(const c of contexts){c.tasks={B:c.row.actual_birth,R:R(c),T:T(c),A:AA(c),M:M(c)};rRows+=c.tasks.R.length;tRows+=c.tasks.T.length;if(c.tasks.A)aRows++;if(c.tasks.M)mRows++;}
assert.deepEqual({rRows,tRows,aRows,mRows,total:rRows+tRows+aRows+mRows},{rRows:1180,tRows:784,aRows:208,mRows:208,total:2380});

function subsets(){const out=[];function walk(i,cur){if(i===TASKS.length){out.push(ordered(new Set(cur)));return;}walk(i+1,cur);cur.push(TASKS[i]);walk(i+1,cur);cur.pop();}walk(0,[]);return out;}
function signature(c,S){return canon(TASKS.filter(t=>S.has(t)).map(t=>[t,c.tasks[t]]));}
function groups(S){const g=new Map();for(const c of contexts){const k=signature(c,S);if(!g.has(k))g.set(k,[]);g.get(k).push(c);}return g;}
function closure(g){const out=new Set();for(const task of TASKS){let ok=true;for(const rows of g.values())if(new Set(rows.map(c=>canon(c.tasks[task]))).size>1)ok=false;if(ok)out.add(task);}return ordered(out);}
function ruleClosure(S,rules=RULES){const out=new Set(S);let changed=true;while(changed){changed=false;for(const[from,to]of rules)if(out.has(from)&&!out.has(to)){out.add(to);changed=true;}}return ordered(out);}

const rows=new Map(),groupsMap=new Map();let signatureBuilds=0,constancyObservations=0;
for(const S of subsets()){
  const g=groups(S);signatureBuilds+=contexts.length;
  const C=new Set();for(const task of TASKS){let ok=true;for(const members of g.values()){const values=new Set();for(const c of members){values.add(canon(c.tasks[task]));constancyObservations++;}if(values.size>1)ok=false;}if(ok)C.add(task);}
  rows.set(id(S),{S,closure:ordered(C),classes:g.size});groupsMap.set(id(S),g);
}
assert.equal(rows.size,32);assert.equal(signatureBuilds,24384);assert.equal(constancyObservations,121920);
for(const[key,[cl,classes]]of Object.entries(EXPECTED)){assert.equal(id(rows.get(key).closure),cl,key);assert.equal(rows.get(key).classes,classes,key);}

for(const row of rows.values())assert.equal(equal(ruleClosure(row.S),row.closure),true);
const deletion={};for(const[from,to]of RULES){const reduced=RULES.filter(r=>!(r[0]===from&&r[1]===to));let bad=0;for(const row of rows.values())if(!equal(ruleClosure(row.S,reduced),row.closure))bad++;deletion[`${from}->${to}`]=bad;}
assert.deepEqual(deletion,{'R->B':8,'R->T':8,'T->A':6,'M->A':2});

const closedIds=[...new Set([...rows.values()].map(r=>id(r.closure)))];assert.equal(closedIds.length,12);
assert.deepEqual(new Set(closedIds),new Set(['EMPTY','B','A','BA','TA','AM','BTA','BAM','TAM','BRTA','BTAM','BRTAM']));
let extensive=0,idempotent=0,monoPairs=0,monoFail=0,unionPairs=0,unionFail=0;
for(const x of rows.values()){if(subset(x.S,x.closure))extensive++;if(equal(rows.get(id(x.closure)).closure,x.closure))idempotent++;}
for(const x of rows.values())for(const y of rows.values()){
  if(subset(x.S,y.S)){monoPairs++;if(!subset(x.closure,y.closure))monoFail++;}
  unionPairs++;const U=ordered(union(x.S,y.S)),rhs=ordered(union(x.closure,y.closure));if(!equal(rows.get(id(U)).closure,rhs))unionFail++;
}
assert.deepEqual({extensive,idempotent,monoPairs,monoFail,unionPairs,unionFail},{extensive:32,idempotent:32,monoPairs:243,monoFail:0,unionPairs:1024,unionFail:0});
assert.equal(id(rows.get('EMPTY').closure),'EMPTY');

const closed=closedIds.map(idSet);let pairChecks=0,pairFail=0,triples=0,d1=0,d2=0;
const closedSet=new Set(closedIds);
for(const X of closed)for(const Y of closed){pairChecks++;if(!closedSet.has(id(ordered(inter(X,Y))))||!closedSet.has(id(ordered(union(X,Y)))))pairFail++;}
for(const X of closed)for(const Y of closed)for(const Z of closed){triples++;if(!equal(inter(X,union(Y,Z)),union(inter(X,Y),inter(X,Z))))d1++;if(!equal(union(X,inter(Y,Z)),inter(union(X,Y),union(X,Z))))d2++;}
assert.deepEqual({pairChecks,pairFail,triples,d1,d2},{pairChecks:144,pairFail:0,triples:1728,d1:0,d2:0});

const full=[...rows.values()].filter(r=>id(r.closure)==='BRTAM');
const minimal=full.filter(r=>!full.some(o=>o.S.size<r.S.size&&subset(o.S,r.S))).map(r=>id(r.S));
assert.deepEqual(minimal,['RM']);assert.equal(rows.get('R').classes,32);assert.equal(rows.get('M').classes,21);assert.equal(rows.get('RM').classes,36);

let splitClasses=0,splitContexts=0,allQ3=true;
for(const members of groupsMap.get('R').values())if(new Set(members.map(c=>canon(c.tasks.M))).size>1){splitClasses++;splitContexts+=members.length;if(!members.every(c=>c.row.actual_birth===3))allQ3=false;}
assert.deepEqual({splitClasses,splitContexts,allQ3},{splitClasses:4,splitContexts:32,allQ3:true});
const left=contexts.find(c=>c.row.schedule_id==='P-H-I'&&c.row.bundle_id==='X3');
const right=contexts.find(c=>c.row.schedule_id==='H-P-I'&&c.row.bundle_id==='X3');
assert.ok(left&&right);assert.deepEqual(left.tasks.R,right.tasks.R);assert.notDeepEqual(left.tasks.M,right.tasks.M);
assert.deepEqual(left.tasks.M,[5,5,5,'25x5','5x5']);assert.deepEqual(right.tasks.M,[5,5,5,'9x5','9x5']);

const earnedParent=finiteCustodyBehavioralQuotientTaskClosureCanonicalCertificate();assert.equal(earnedParent.passed,true);assert.equal(earnedParent.partitions.Phi_declared_task_behavior_classes,36);
// Only after the independent reconstruction above may the hostile inspect #872.
const { finiteCustodyTaskDependencyPosetCertificate }=await import('../app/dome-world/previews/a15-r0/finite-custody-task-dependency-poset.js');
const certificate=finiteCustodyTaskDependencyPosetCertificate();
assert.equal(certificate.passed,true);assert.equal(certificate.exact,true);
assert.equal(certificate.closed_set_lattice.closed_state_count,closedIds.length);
assert.deepEqual(certificate.dependency_poset.single_edge_deletion_mismatches,deletion);
assert.equal(certificate.finite_task_closure.monotone_ordered_inclusion_pairs,monoPairs);
assert.equal(certificate.finite_task_closure.ordered_union_pairs,unionPairs);
assert.equal(certificate.generator.R_classes_split_by_M,splitClasses);
assert.equal(certificate.generator.R_contexts_split_by_M,splitContexts);
assert.deepEqual(certificate.generator.minimal_full_generators,minimal);

console.log('Ash A15-R0 finite custody task dependency poset independent hostile passed.');
