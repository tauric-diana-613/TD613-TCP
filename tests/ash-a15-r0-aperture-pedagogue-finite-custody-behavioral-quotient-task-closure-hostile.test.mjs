import assert from 'node:assert/strict';
import {
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from '../app/dome-world/previews/a15-r0/claim-bundle-minimal-sufficient-custody-frontier.js';

// Hostile rule: derive the finite atlas, task signatures, quotient and witnesses
// before importing the canonical behavioral-quotient implementation.

const canon=value=>JSON.stringify(value);
const stages=[0,1,2,3];
const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
const sid=schedule=>schedule.map(stratum=>letters[stratum]).join('-');

function cube() {
  const out=[];
  for(let x1=-2;x1<=2;x1+=1) for(let x2=-2;x2<=2;x2+=1) for(let x3=-2;x3<=2;x3+=1) out.push([x1,x2,x3]);
  return out;
}

function antecedents() {
  const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
  assert.equal(policy.passed,true);
  const bySchedule=new Map(policy.policy_geometry.map(row=>[row.schedule_id,row]));
  const out=[];
  for(const schedule of DROMOLOGICAL_S3_SCHEDULES) {
    const scheduleId=sid(schedule);
    const matrix=phasonicObservationMatrix(schedule);
    const p=bySchedule.get(scheduleId);
    assert.ok(p);
    for(const state of cube()) out.push({
      schedule:[...schedule],schedule_id:scheduleId,first_stratum:schedule[0],state:[...state],
      matrix,observation:observePhasonicState(state,schedule),replay_required:p.replay_required,
    });
  }
  return out;
}

function quotient(stage,a) {
  if(stage===0) return ['NULL_REGISTERED_TRACE'];
  return [a.matrix.slice(0,stage).map(row=>[...row]),a.observation.slice(0,stage)];
}

function claim(claimId,a) {
  switch(claimId) {
    case 'FIRST_STRATUM': return a.first_stratum;
    case 'SCHEDULE': return a.schedule_id;
    case 'X1': return a.state[0];
    case 'X2': return a.state[1];
    case 'X3': return a.state[2];
    case 'FULL_STATE': return a.state;
    case 'REPLAY_REQUIRED_FOR_EXACT_STATE': return a.replay_required;
    default: throw new Error(`unknown hostile claim ${claimId}`);
  }
}
const bundle=(claims,a)=>claims.map(claimId=>[claimId,claim(claimId,a)]);

function atlasFor(all) {
  const atlas=new Map();
  for(const stage of stages) {
    const fibres=new Map();
    for(const a of all) {
      const key=canon(quotient(stage,a));
      if(!fibres.has(key)) fibres.set(key,[]);
      fibres.get(key).push(a);
    }
    atlas.set(stage,fibres);
  }
  return atlas;
}

function profileFor(atlas,targets,stage,claims) {
  const keys=[...new Set(targets.map(a=>canon(quotient(stage,a))))].sort();
  const cards=[];
  const supportRows=[];
  for(const key of keys) {
    const support=[...new Set(atlas.get(stage).get(key).map(a=>canon(bundle(claims,a))))].sort();
    cards.push(support.length);
    supportRows.push([key,support]);
  }
  cards.sort((a,b)=>a-b);
  return {cards,maximum:Math.max(...cards),occupied:keys.length,supportRows,allSingleton:cards.every(v=>v===1)};
}

function uniform(p) {
  const values=[...new Set(p.cards)];
  return values.length===1?`${p.cards.length}x${values[0]}`:`${p.cards.length}xMIXED:${p.cards.join(',')}`;
}

const all=antecedents();
assert.equal(all.length,750);
const atlas=atlasFor(all);
assert.deepEqual([...atlas.values()].map(map=>map.size),[1,23,158,430]);

const bundleParent=claimBundleMinimalSufficientCustodyFrontierCertificate();
assert.equal(bundleParent.passed,true);
assert.equal(bundleParent.bundle_support_certificate.rows.length,762);

const targets=new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
  const id=sid(schedule);
  return [id,all.filter(a=>a.schedule_id===id)];
}));

const contexts=[];
let stageProfiles=0;
for(const row of bundleParent.bundle_support_certificate.rows) {
  const p={};
  for(const stage of stages) {
    p[stage]=profileFor(atlas,targets.get(row.schedule_id),stage,row.claims);
    stageProfiles+=1;
  }
  contexts.push({row,p});
}
assert.equal(contexts.length,762);
assert.equal(stageProfiles,3048);

function recoveredBirth(context) {
  for(const stage of [1,2,3]) if(context.p[stage].maximum===1) return stage;
  return 'INF';
}

let birthMatches=0;
const birthCounts=new Map();
for(const context of contexts) {
  const b=recoveredBirth(context);
  birthCounts.set(String(b),(birthCounts.get(String(b))??0)+1);
  if(b===context.row.actual_birth) birthMatches+=1;
}
assert.equal(birthMatches,762);
assert.deepEqual(Object.fromEntries([...birthCounts.entries()].sort()),{'1':26,'2':80,'3':208,INF:448});

function r858(context) {
  const b=context.row.actual_birth;
  if(b==='INF') return [];
  const out=[];
  for(let fine=b;fine<=3;fine+=1) for(let coarse=0;coarse<fine;coarse+=1) {
    const p=context.p[coarse];
    out.push([fine,coarse,coarse<b?['RESTORE',p.maximum]:['PRESERVE',p.allSingleton]]);
  }
  return out;
}

function r860(context) {
  const b=context.row.actual_birth;
  if(b==='INF'||b<2) return [];
  const out=[];
  for(let fine=b;fine<=3;fine+=1) {
    for(let d=1;d<b;d+=1) {
      if(d>=fine) continue;
      for(let c=0;c<d;c+=1) {
        const md=context.p[d].maximum,mc=context.p[c].maximum;
        out.push([fine,d,c,md,mc,md===mc]);
      }
    }
  }
  return out;
}

function r862(context) {
  if(context.row.actual_birth!==3) return null;
  const m2=context.p[2].maximum,m1=context.p[1].maximum,m0=context.p[0].maximum;
  return [m2,m1,m0,m1===m2?'FLAT':'EXPAND',m0===m1?'FLAT':'EXPAND'];
}

function r864(context) {
  if(context.row.actual_birth!==3) return null;
  return [context.p[2].maximum,context.p[1].maximum,context.p[0].maximum,uniform(context.p[2]),uniform(context.p[1])];
}

function Phi(context) {
  return canon([
    ['BIRTH',context.row.actual_birth],
    ['R858',r858(context)],
    ['R860',r860(context)],
    ['R862',r862(context)],
    ['R864',r864(context)],
  ]);
}

function C(context) {
  return canon([context.row.schedule_id,[3,2,1,0].map(stage=>context.p[stage].maximum)]);
}

function D(context) {
  return canon([context.row.schedule_id,[3,2,1,0].map(stage=>[stage,context.p[stage].supportRows])]);
}

function kappa(context) {
  const b=context.row.actual_birth;
  if(b==='INF') return canon(['INF']);
  if(b===1) return canon([1,context.p[0].maximum]);
  if(b===2) return canon([2,context.p[1].maximum,context.p[0].maximum]);
  if(b===3) return canon([3,context.p[2].occupied,context.p[1].maximum,context.p[0].maximum]);
  throw new Error(`unexpected hostile birth ${b}`);
}

function group(keyFn,subset=contexts) {
  const map=new Map();
  for(const context of subset) {
    const key=keyFn(context);
    if(!map.has(key)) map.set(key,[]);
    map.get(key).push(context);
  }
  return map;
}

const dGroups=group(D),cGroups=group(C),phiGroups=group(Phi),kGroups=group(kappa);
assert.equal(dGroups.size,762);
assert.equal(cGroups.size,154);
assert.equal(phiGroups.size,36);
assert.equal(kGroups.size,36);
assert.equal(new Set(contexts.map(context=>String(context.row.actual_birth))).size,4);

function classesByBirth(keyFn) {
  const out={};
  for(const birth of [1,2,3,'INF']) {
    const subset=contexts.filter(context=>context.row.actual_birth===birth);
    out[String(birth)]=new Set(subset.map(keyFn)).size;
  }
  return out;
}
assert.deepEqual(classesByBirth(D),{'1':26,'2':80,'3':208,INF:448});
assert.deepEqual(classesByBirth(C),{'1':18,'2':32,'3':40,INF:64});
assert.deepEqual(classesByBirth(Phi),{'1':5,'2':10,'3':20,INF:1});

for(const groupRows of kGroups.values()) assert.equal(new Set(groupRows.map(Phi)).size,1,'κ must determine Φ');
for(const groupRows of phiGroups.values()) assert.equal(new Set(groupRows.map(kappa)).size,1,'Φ must determine κ');

const mergeSpectrum=new Map();
for(const groupRows of phiGroups.values()) {
  const size=new Set(groupRows.map(C)).size;
  mergeSpectrum.set(String(size),(mergeSpectrum.get(String(size))??0)+1);
}
assert.deepEqual(Object.fromEntries([...mergeSpectrum.entries()].sort((a,b)=>Number(a[0])-Number(b[0]))),{'2':28,'4':4,'6':3,'64':1});

for(const groupRows of cGroups.values()) assert.equal(new Set(groupRows.map(Phi)).size,1,'C carrier must determine declared task behavior');

let singletonPhi=0;
let minD=Infinity,maxD=0;
let explicitSemanticCollision=null;
for(const groupRows of phiGroups.values()) {
  const byD=new Map(groupRows.map(context=>[D(context),context]));
  minD=Math.min(minD,byD.size); maxD=Math.max(maxD,byD.size);
  if(byD.size===1) singletonPhi+=1;
  if(!explicitSemanticCollision&&byD.size>1) {
    const vals=[...byD.values()];
    explicitSemanticCollision={left:vals[0],right:vals[1]};
  }
}
assert.equal(singletonPhi,0);
assert.equal(minD>=2,true);
assert.ok(explicitSemanticCollision);
assert.equal(Phi(explicitSemanticCollision.left),Phi(explicitSemanticCollision.right));
assert.notEqual(D(explicitSemanticCollision.left),D(explicitSemanticCollision.right));

let taskRows858=0,taskRows860=0,taskRows862=0,taskRows864=0;
for(const context of contexts) {
  taskRows858+=r858(context).length;
  taskRows860+=r860(context).length;
  if(r862(context)) taskRows862+=1;
  if(r864(context)) taskRows864+=1;
}
assert.deepEqual({r858:taskRows858,r860:taskRows860,r862:taskRows862,r864:taskRows864,total:taskRows858+taskRows860+taskRows862+taskRows864},
  {r858:1180,r860:784,r862:208,r864:208,total:2380});

const ablationSpecs={
  q1_drop_m0:{birth:1,key:context=>canon([1]),expected:{ambiguous_keys:1,contexts:26,Phi_classes:5,maximum_Phi_multiplicity:5}},
  q2_drop_m1:{birth:2,key:context=>canon([2,context.p[0].maximum]),expected:{ambiguous_keys:1,contexts:24,Phi_classes:2,maximum_Phi_multiplicity:2}},
  q2_drop_m0:{birth:2,key:context=>canon([2,context.p[1].maximum]),expected:{ambiguous_keys:3,contexts:80,Phi_classes:10,maximum_Phi_multiplicity:6}},
  q3_drop_n2:{birth:3,key:context=>canon([3,context.p[1].maximum,context.p[0].maximum]),expected:{ambiguous_keys:4,contexts:32,Phi_classes:8,maximum_Phi_multiplicity:2}},
  q3_drop_m1:{birth:3,key:context=>canon([3,context.p[2].occupied,context.p[0].maximum]),expected:{ambiguous_keys:4,contexts:32,Phi_classes:8,maximum_Phi_multiplicity:2}},
  q3_drop_m0:{birth:3,key:context=>canon([3,context.p[2].occupied,context.p[1].maximum]),expected:{ambiguous_keys:5,contexts:200,Phi_classes:19,maximum_Phi_multiplicity:6}},
};

const hostileAblations={};
for(const [name,spec] of Object.entries(ablationSpecs)) {
  const subset=contexts.filter(context=>context.row.actual_birth===spec.birth);
  const groups=group(spec.key,subset);
  const ambiguous=[];
  for(const [key,rows] of groups.entries()) {
    const byPhi=new Map();
    for(const context of rows) {
      const p=Phi(context);
      if(!byPhi.has(p)) byPhi.set(p,[]);
      byPhi.get(p).push(context);
    }
    if(byPhi.size>1) ambiguous.push({key,rows,byPhi});
  }
  const actual={
    ambiguous_keys:ambiguous.length,
    contexts:ambiguous.reduce((sum,row)=>sum+row.rows.length,0),
    Phi_classes:ambiguous.reduce((sum,row)=>sum+row.byPhi.size,0),
    maximum_Phi_multiplicity:Math.max(...ambiguous.map(row=>row.byPhi.size)),
  };
  assert.deepEqual(actual,spec.expected,name);
  const first=ambiguous[0];
  const vals=[...first.byPhi.values()];
  assert.ok(vals.length>=2);
  assert.notEqual(Phi(vals[0][0]),Phi(vals[1][0]),`${name} must expose explicit behavior collision`);
  hostileAblations[name]=actual;
}

// Only after the independent derivation above may the hostile consult the canonical certificate.
const { finiteCustodyBehavioralQuotientTaskClosureCertificate } = await import('../app/dome-world/previews/a15-r0/finite-custody-behavioral-quotient-task-closure.js');
const canonicalCertificate=finiteCustodyBehavioralQuotientTaskClosureCertificate();
assert.equal(canonicalCertificate.passed,true);
assert.equal(canonicalCertificate.partitions.D_support_labelled_trajectory_classes,dGroups.size);
assert.equal(canonicalCertificate.partitions.C_schedule_conditioned_cardinality_classes,cGroups.size);
assert.equal(canonicalCertificate.partitions.Phi_declared_task_behavior_classes,phiGroups.size);
assert.equal(canonicalCertificate.compact_quotient.kappa_classes,kGroups.size);
assert.equal(canonicalCertificate.birth_recovery.matches,birthMatches);
assert.equal(canonicalCertificate.semantic_noncollapse.singleton_Phi_classes_under_D_identity,singletonPhi);
assert.equal(canonicalCertificate.semantic_noncollapse.minimum_distinct_D_per_Phi,minD);
assert.equal(canonicalCertificate.semantic_noncollapse.maximum_distinct_D_per_Phi,maxD);
for(const [name,actual] of Object.entries(hostileAblations)) {
  const canonicalRow=canonicalCertificate.coordinate_ablations[name];
  for(const [key,value] of Object.entries(actual)) assert.equal(canonicalRow[key],value,`${name}.${key}`);
}

console.log('Ash A15-R0 finite custody behavioral quotient independent hostile passed.');
