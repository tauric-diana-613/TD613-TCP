import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-authority-birth-nonretroactive-jurisdiction.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import {
  TWO_SURFACE_HORIZON_ALIASING_SCHEMA,
  TWO_SURFACE_HORIZON_ALIASING_PARENT_RECEIPT,
  twoSurfaceHorizonAliasingCertificate,
  compileTwoSurfaceHorizonAliasingProjection,
  rejectTwoSurfaceHorizonAliasingOverreach,
} from '../app/dome-world/previews/a15-r0/two-surface-horizon-aliasing.js';

const CLAIMS = [
  'FIRST_STRATUM','SCHEDULE','X1','X2','X3','FULL_STATE','REPLAY_REQUIRED_FOR_EXACT_STATE',
];
const STAGES = [0,1,2];
const EXPECTED_SCALAR = {
  '5->5': { count:24, m0:{ 5:4,10:4,15:8,25:2,50:2,75:4 } },
  '5->10': { count:24, m0:{ 30:16,150:8 } },
  '5->25': { count:80, m0:{ 25:2,50:2,75:4,125:18,250:18,375:36 } },
  '5->50': { count:80, m0:{ 150:8,750:72 } },
};
const EXPECTED_MARGINAL = {
  '25x5|5x5': { count:16, m0:{ 5:2,10:2,15:4,25:2,50:2,75:4 } },
  '25x5|5x25': { count:80, m0:{ 25:2,50:2,75:4,125:18,250:18,375:36 } },
  '25x5|5x10': { count:16, m0:{ 30:8,150:8 } },
  '25x5|5x50': { count:80, m0:{ 150:8,750:72 } },
  '9x5|9x5': { count:8, m0:{ 5:2,10:2,15:4 } },
  '9x5|9x10': { count:8, m0:{ 30:8 } },
};

function scheduleId(schedule) {
  const letters = { PHI_PAIR_WIRE:'P', HEXAGONAL_MOIRE:'H', ICOSAHEDRAL_PHASON:'I' };
  return schedule.map(stratum => letters[stratum]).join('-');
}

function stateCube() {
  const out=[];
  for (let x1=-2;x1<=2;x1+=1) for (let x2=-2;x2<=2;x2+=1) for (let x3=-2;x3<=2;x3+=1) out.push([x1,x2,x3]);
  return out;
}

function nonemptyBundles(values) {
  const out=[];
  const visit=(index,current)=>{
    if(index===values.length){ if(current.length) out.push([...current]); return; }
    visit(index+1,current);
    current.push(values[index]);
    visit(index+1,current);
    current.pop();
  };
  visit(0,[]);
  return out;
}

function quotientKey(stage,a) {
  if(stage===0) return JSON.stringify(['NULL_REGISTERED_TRACE']);
  return JSON.stringify([a.matrix.slice(0,stage),a.observation.slice(0,stage)]);
}

function claimValue(claim,a) {
  if(claim==='FIRST_STRATUM') return a.schedule[0];
  if(claim==='SCHEDULE') return a.schedule_id;
  if(claim==='X1') return a.state[0];
  if(claim==='X2') return a.state[1];
  if(claim==='X3') return a.state[2];
  if(claim==='FULL_STATE') return a.state;
  if(claim==='REPLAY_REQUIRED_FOR_EXACT_STATE') return a.replay_required;
  throw new Error(`unknown hostile claim ${claim}`);
}
const bundleValue=(bundle,a)=>JSON.stringify(bundle.map(claim=>[claim,claimValue(claim,a)]));

function buildAntecedents(policy) {
  const policyBySchedule=new Map(policy.policy_geometry.map(row=>[row.schedule_id,row]));
  const antecedents=[];
  for(const schedule of DROMOLOGICAL_S3_SCHEDULES){
    const id=scheduleId(schedule);
    const matrix=phasonicObservationMatrix(schedule);
    const policyRow=policyBySchedule.get(id);
    assert.ok(policyRow);
    for(const state of stateCube()) antecedents.push({
      schedule, schedule_id:id, state, matrix,
      observation:observePhasonicState(state,schedule), replay_required:policyRow.replay_required,
    });
  }
  return antecedents;
}

function buildFibres(antecedents) {
  const out=new Map();
  for(const stage of STAGES){
    const fibres=new Map();
    for(const a of antecedents){
      const key=quotientKey(stage,a);
      if(!fibres.has(key)) fibres.set(key,[]);
      fibres.get(key).push(a);
    }
    out.set(stage,fibres);
  }
  return out;
}

function inheritedBirths(jurisdiction,policy) {
  const replay=new Map(policy.replay_required_authority_certificate.schedules.map(row=>[row.schedule_id,row.birth]));
  const out=new Map();
  for(const schedule of jurisdiction.schedules){
    const births=Object.fromEntries(schedule.claim_rows.map(row=>[row.claim,row.birth]));
    births.REPLAY_REQUIRED_FOR_EXACT_STATE=replay.get(schedule.schedule_id)??'INF';
    out.set(schedule.schedule_id,births);
  }
  return out;
}

function maxBirth(bundle,births) {
  let max=0;
  for(const claim of bundle){
    const b=births[claim];
    if(b==='INF') return 'INF';
    max=Math.max(max,b);
  }
  return max;
}

function profile(fibres,targets,stage,bundle) {
  const occupied=[...new Set(targets.map(target=>quotientKey(stage,target)))];
  const cards=occupied.map(key=>{
    const members=fibres.get(stage).get(key);
    return new Set(members.map(member=>bundleValue(bundle,member))).size;
  }).sort((a,b)=>a-b);
  return { maximum:Math.max(...cards), cards };
}

function uniformKey(row) {
  const unique=[...new Set(row.cards)];
  assert.equal(unique.length,1,'hostile found mixed support-cardinality marginal');
  return `${row.cards.length}x${unique[0]}`;
}

function incrementNested(map,key,value) {
  if(!map.has(key)) map.set(key,{count:0,m0:new Map()});
  const row=map.get(key); row.count+=1;
  row.m0.set(String(value),(row.m0.get(String(value))??0)+1);
}
function normalizeNested(map) {
  return Object.fromEntries([...map.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([key,row])=>[
    key,{count:row.count,m0:Object.fromEntries([...row.m0.entries()].sort(([a],[b])=>Number(a)-Number(b)))}
  ]));
}

const jurisdiction=bitemporalAuthorityBirthNonretroactiveJurisdictionCertificate();
const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
assert.equal(jurisdiction.passed,true);
assert.equal(policy.passed,true);
assert.equal(TWO_SURFACE_HORIZON_ALIASING_PARENT_RECEIPT,'3b58898bbdb64af056913f770ba4891176b27789');

const antecedents=buildAntecedents(policy);
assert.equal(antecedents.length,750);
const fibres=buildFibres(antecedents);
const birthsBySchedule=inheritedBirths(jurisdiction,policy);
const bundles=nonemptyBundles(CLAIMS);
assert.equal(bundles.length,127);
const targetsBySchedule=new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
  const id=scheduleId(schedule); return [id,antecedents.filter(a=>a.schedule_id===id)];
}));

const scalar=new Map();
const marginal=new Map();
const rows=[];
let supportEvaluations=0;
const cache=new Map();
function cachedProfile(schedule,bundle,stage){
  const key=`${schedule}|${bundle.join('+')}|${stage}`;
  if(cache.has(key)) return cache.get(key);
  const row=profile(fibres,targetsBySchedule.get(schedule),stage,bundle);
  supportEvaluations+=row.cards.length;
  cache.set(key,row);
  return row;
}

for(const schedule of DROMOLOGICAL_S3_SCHEDULES){
  const id=scheduleId(schedule);
  const births=birthsBySchedule.get(id);
  for(const bundle of bundles){
    if(maxBirth(bundle,births)!==3) continue;
    const q2=cachedProfile(id,bundle,2);
    const q1=cachedProfile(id,bundle,1);
    const q0=cachedProfile(id,bundle,0);
    assert.equal(q2.maximum,5);
    const scalarKey=`${q2.maximum}->${q1.maximum}`;
    const marginalKey=`${uniformKey(q2)}|${uniformKey(q1)}`;
    incrementNested(scalar,scalarKey,q0.maximum);
    incrementNested(marginal,marginalKey,q0.maximum);
    rows.push({
      schedule_id:id,bundle_id:bundle.join('+'),bundle_size:bundle.length,
      m2:q2.maximum,m1:q1.maximum,m0:q0.maximum,
      q2_profile:uniformKey(q2),q1_profile:uniformKey(q1),
    });
  }
}

assert.equal(rows.length,208);
assert.equal(cache.size,624);
assert.equal(supportEvaluations,6256);
assert.deepEqual(normalizeNested(scalar),EXPECTED_SCALAR);
assert.deepEqual(normalizeNested(marginal),EXPECTED_MARGINAL);
assert.equal([...scalar.values()].filter(row=>row.m0.size>1).length,4);
assert.equal([...marginal.values()].filter(row=>row.m0.size>1).length,5);
assert.equal([...marginal.values()].filter(row=>row.m0.size===1).length,1);
assert.equal([...marginal.values()].filter(row=>row.m0.size>1).reduce((sum,row)=>sum+row.count,0),200);
assert.equal([...marginal.values()].filter(row=>row.m0.size===1).reduce((sum,row)=>sum+row.count,0),8);

const Aleft=rows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='FIRST_STRATUM+X3');
const Aright=rows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='X1+X3');
assert.ok(Aleft&&Aright);
assert.equal(Aleft.bundle_size,2); assert.equal(Aright.bundle_size,2);
assert.equal(Aleft.q2_profile,Aright.q2_profile); assert.equal(Aleft.q1_profile,Aright.q1_profile);
assert.equal(Aleft.m0,15); assert.equal(Aright.m0,25);

const Bleft=rows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='FIRST_STRATUM+FULL_STATE');
const Bright=rows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='X2+X3');
assert.ok(Bleft&&Bright);
assert.equal(Bleft.bundle_size,2); assert.equal(Bright.bundle_size,2);
assert.equal(Bleft.q2_profile,Bright.q2_profile); assert.equal(Bleft.q1_profile,Bright.q1_profile);
assert.equal(Bleft.m0,375); assert.equal(Bright.m0,25); assert.equal(Bleft.m0/Bright.m0,15);

const certificate=twoSurfaceHorizonAliasingCertificate();
assert.equal(certificate.schema,TWO_SURFACE_HORIZON_ALIASING_SCHEMA);
assert.equal(certificate.parent_receipt,TWO_SURFACE_HORIZON_ALIASING_PARENT_RECEIPT);
assert.equal(certificate.domain.contexts,208);
assert.equal(certificate.census.scalar_class_count,4);
assert.equal(certificate.census.scalar_ambiguous_class_count,4);
assert.equal(certificate.census.marginal_profile_class_count,6);
assert.equal(certificate.census.marginal_ambiguous_class_count,5);
assert.equal(certificate.census.marginal_identifying_class_count,1);
assert.equal(certificate.census.marginal_ambiguous_contexts,200);
assert.equal(certificate.census.marginal_identifying_contexts,8);
assert.equal(certificate.census.named_alias_B.ratio,15);
assert.equal(certificate.passed,true);

const ash=compileTwoSurfaceHorizonAliasingProjection(AIA_RECEIVERS.ASH);
const loom=compileTwoSurfaceHorizonAliasingProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean),false);
assert.equal(Object.values(loom.authority).some(Boolean),false);
assert.equal(ash.payload.full_context_rows_exposed,false);
assert.equal(ash.payload.full_fibre_tables_exposed,false);
assert.equal(ash.payload.labelled_merge_incidence_exposed,false);

for(const hostile of [
  {...loom,shannon_capacity:true}, {...loom,entropy:true}, {...loom,mutual_information:true},
  {...loom,minimum_bit_length:true}, {...loom,retrocausal_information_flow:true},
  {...loom,cryptographic_key:true}, {...loom,universal_trajectory_theorem:true},
  {...loom,operational_path_groupoid:true}, {...loom,source_state_mutation:true},
  {...ash,payload:{...ash.payload,full_context_rows_exposed:true}},
  {...ash,payload:{...ash.payload,full_fibre_tables_exposed:true}},
  {...ash,payload:{...ash.payload,labelled_merge_incidence_exposed:true}},
]) assert.equal(rejectTwoSurfaceHorizonAliasingOverreach(hostile).accepted,false);

console.log('Ash A15-R0 two-surface horizon aliasing independent hostile tests passed.');
