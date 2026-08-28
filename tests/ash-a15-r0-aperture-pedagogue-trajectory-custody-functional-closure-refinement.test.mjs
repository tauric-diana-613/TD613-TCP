import assert from 'node:assert/strict';

import {
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from '../app/dome-world/previews/a15-r0/claim-bundle-minimal-sufficient-custody-frontier.js';

const CLAIMS = [
  'FIRST_STRATUM','SCHEDULE','X1','X2','X3','FULL_STATE','REPLAY_REQUIRED_FOR_EXACT_STATE',
];
const STAGES = [0,1,2,3];
const canonical = value => JSON.stringify(value);

function scheduleId(schedule) {
  const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
  return schedule.map(stratum=>letters[stratum]).join('-');
}
function states() {
  const out=[];
  for(let x1=-2;x1<=2;x1+=1) for(let x2=-2;x2<=2;x2+=1) for(let x3=-2;x3<=2;x3+=1) out.push([x1,x2,x3]);
  return out;
}
function bundles(values,index=0,current=[],out=[]) {
  if(index===values.length) {
    if(current.length) out.push([...current]);
    return out;
  }
  bundles(values,index+1,current,out);
  current.push(values[index]); bundles(values,index+1,current,out); current.pop();
  return out;
}
function quotient(stage,a) {
  if(stage===0) return ['NULL_REGISTERED_TRACE'];
  return [a.matrix.slice(0,stage),a.observation.slice(0,stage)];
}
function claimValue(claim,a) {
  if(claim==='FIRST_STRATUM') return a.schedule[0];
  if(claim==='SCHEDULE') return a.schedule_id;
  if(claim==='X1') return a.state[0];
  if(claim==='X2') return a.state[1];
  if(claim==='X3') return a.state[2];
  if(claim==='FULL_STATE') return a.state;
  if(claim==='REPLAY_REQUIRED_FOR_EXACT_STATE') return a.replay_required;
  throw new Error(`refinement hostile unknown claim ${claim}`);
}
const bundleValue=(claims,a)=>canonical(claims.map(claim=>[claim,claimValue(claim,a)]));
function profileFingerprint(cardsByStage) {
  return canonical(cardsByStage.map(cards=>[...cards].sort((a,b)=>a-b)));
}
function setMapping(map,key,value) {
  if(!map.has(key)) map.set(key,new Set());
  map.get(key).add(value);
}

const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
const bundleParent=claimBundleMinimalSufficientCustodyFrontierCertificate();
assert.equal(policy.passed,true);
assert.equal(bundleParent.passed,true);

const policyBySchedule=new Map(policy.policy_geometry.map(row=>[row.schedule_id,row]));
const antecedents=[];
for(const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id=scheduleId(schedule),matrix=phasonicObservationMatrix(schedule),p=policyBySchedule.get(id);
  assert.ok(p);
  for(const state of states()) antecedents.push({
    schedule,schedule_id:id,state,matrix,
    observation:observePhasonicState(state,schedule),replay_required:p.replay_required,
  });
}
assert.equal(antecedents.length,750);

const atlas=new Map();
for(const stage of STAGES) {
  const fibres=new Map();
  for(const a of antecedents) {
    const key=canonical(quotient(stage,a));
    if(!fibres.has(key)) fibres.set(key,[]);
    fibres.get(key).push(a);
  }
  atlas.set(stage,fibres);
}
assert.deepEqual(Object.fromEntries(STAGES.map(stage=>[stage,atlas.get(stage).size])),{0:1,1:23,2:158,3:430});

const targetBySchedule=new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
  const id=scheduleId(schedule);
  return [id,antecedents.filter(a=>a.schedule_id===id)];
}));
const birthRows=new Map(bundleParent.bundle_support_certificate.rows.map(row=>[`${row.schedule_id}|${row.bundle_id}`,row]));
const allBundles=bundles(CLAIMS);
assert.equal(allBundles.length,127);

function stageProfile(scheduleIdValue,claims,stage) {
  const occupied=[...new Set(targetBySchedule.get(scheduleIdValue).map(a=>canonical(quotient(stage,a))))];
  const cards=occupied.map(key=>new Set(atlas.get(stage).get(key).map(a=>bundleValue(claims,a))).size).sort((a,b)=>a-b);
  return {cards,maximum:Math.max(...cards)};
}

const contexts=[];
for(const schedule of DROMOLOGICAL_S3_SCHEDULES) {
  const id=scheduleId(schedule);
  for(const claims of allBundles) {
    const bundle_id=claims.join('+');
    const inherited=birthRows.get(`${id}|${bundle_id}`);
    assert.ok(inherited);
    const p3=stageProfile(id,claims,3),p2=stageProfile(id,claims,2),p1=stageProfile(id,claims,1),p0=stageProfile(id,claims,0);
    contexts.push({
      schedule_id:id,bundle_id,claims,bundle_size:claims.length,birth:inherited.actual_birth,
      maxima:[p3.maximum,p2.maximum,p1.maximum,p0.maximum],
      profile:profileFingerprint([p3.cards,p2.cards,p1.cards,p0.cards]),
      q2q1_profile:profileFingerprint([p2.cards,p1.cards]),
    });
  }
}
assert.equal(contexts.length,762);

// Secondary counterassay: raw maxima do alias profiles if schedule context is discarded.
const rawMaximumToProfile=new Map();
const rawProfileClasses=new Set();
for(const c of contexts) {
  setMapping(rawMaximumToProfile,canonical(c.maxima),c.profile);
  rawProfileClasses.add(c.profile);
}
assert.equal(rawMaximumToProfile.size,55);
assert.equal(rawProfileClasses.size,77);
const rawSplit=[...rawMaximumToProfile.values()].filter(values=>values.size>1);
assert.equal(rawSplit.length,19);
const rawSplitContextCount=[...rawMaximumToProfile.entries()]
  .filter(([,values])=>values.size>1)
  .reduce((sum,[maxKey])=>sum+contexts.filter(c=>canonical(c.maxima)===maxKey).length,0);
assert.equal(rawSplitContextCount,202);
assert.deepEqual(
  Object.fromEntries([...rawMaximumToProfile.values()].reduce((m,values)=>m.set(values.size,(m.get(values.size)??0)+1),new Map())),
  {1:36,2:16,3:3},
);

// But schedule is intrinsic to Q. Once schedule is retained, maxima and full cardinality profiles
// are mutually identifying on the observed finite domain.
const scheduleMaximumToProfile=new Map();
const scheduleProfileToMaximum=new Map();
for(const c of contexts) {
  setMapping(scheduleMaximumToProfile,canonical([c.schedule_id,c.maxima]),c.profile);
  setMapping(scheduleProfileToMaximum,canonical([c.schedule_id,c.profile]),canonical(c.maxima));
}
assert.equal(scheduleMaximumToProfile.size,154);
assert.equal(scheduleProfileToMaximum.size,154);
assert.equal([...scheduleMaximumToProfile.values()].filter(values=>values.size!==1).length,0);
assert.equal([...scheduleProfileToMaximum.values()].filter(values=>values.size!==1).length,0);

// #864 q3-birth prefix: schedule + (m2,m1) uniquely identifies complete q2/q1
// cardinality marginals in all 12 observed schedule-conditioned classes.
const q3Prefix=new Map();
let q3Contexts=0;
for(const c of contexts) {
  if(c.birth!==3) continue;
  q3Contexts+=1;
  setMapping(q3Prefix,canonical([c.schedule_id,c.maxima[1],c.maxima[2]]),c.q2q1_profile);
}
assert.equal(q3Contexts,208);
assert.equal(q3Prefix.size,12);
assert.equal([...q3Prefix.values()].filter(values=>values.size!==1).length,0);

// Support identity remains strictly richer. Hold schedule, inherited birth, bundle cardinality,
// and the complete four-stage cardinality profile fixed, then count distinct bundle-conditioned
// support-labelled trajectories remaining in each controlled class.
const controlled=new Map();
for(const c of contexts) {
  const key=canonical([c.schedule_id,c.birth,c.bundle_size,c.profile]);
  if(!controlled.has(key)) controlled.set(key,[]);
  controlled.get(key).push(c);
}
assert.equal(controlled.size,346);
const controlledAmbiguous=[...controlled.values()].filter(rows=>rows.length>1);
assert.equal(controlledAmbiguous.length,148);
assert.equal(controlledAmbiguous.reduce((sum,rows)=>sum+rows.length,0),564);
assert.equal(Math.max(...[...controlled.values()].map(rows=>rows.length)),12);

const named=controlledAmbiguous.find(rows=>{
  if(rows[0]?.schedule_id!=='P-H-I'||rows[0]?.birth!==3||rows[0]?.bundle_size!==2) return false;
  const ids=new Set(rows.map(row=>row.bundle_id));
  return ids.has('X1+FULL_STATE')&&ids.has('X2+FULL_STATE')&&ids.has('X3+FULL_STATE');
});
assert.ok(named);
const namedIds=new Set(named.map(row=>row.bundle_id));
assert.equal(namedIds.has('X1+FULL_STATE'),true);
assert.equal(namedIds.has('X2+FULL_STATE'),true);
assert.equal(namedIds.has('X3+FULL_STATE'),true);
const witness=named.find(row=>row.bundle_id==='X1+FULL_STATE');
assert.deepEqual(witness.maxima,[1,5,25,125]);
const witnessProfiles=JSON.parse(witness.profile);
assert.equal(witnessProfiles[0].length,125); assert.equal(new Set(witnessProfiles[0]).size,1); assert.equal(witnessProfiles[0][0],1);
assert.equal(witnessProfiles[1].length,25);  assert.equal(new Set(witnessProfiles[1]).size,1); assert.equal(witnessProfiles[1][0],5);
assert.equal(witnessProfiles[2].length,5);   assert.equal(new Set(witnessProfiles[2]).size,1); assert.equal(witnessProfiles[2][0],25);
assert.equal(witnessProfiles[3].length,1);   assert.equal(witnessProfiles[3][0],125);

// Only after independent counterassay inspect the narrowed canonical closure surface.
const closureModule=await import('../app/dome-world/previews/a15-r0/trajectory-custody-functional-closure-certificate.js');
const certificate=closureModule.trajectoryCustodyFunctionalClosureCanonicalCertificate();
assert.equal(certificate.passed,true);
assert.equal(certificate.preauthority_theoretical_refinement.withdrawn_claim,'864_REQUIRES_PER_FIBRE_CARDINALITY_PROFILES_BEYOND_STAGE_MAXIMA');
assert.equal(certificate.preauthority_theoretical_refinement.replay_counts_changed,false);
assert.equal(certificate.preauthority_theoretical_refinement.preregistration_rewritten,false);
assert.equal(certificate.hierarchy.profile_sufficiency_for_864,true);
assert.equal(certificate.hierarchy.profile_strict_necessity_beyond_schedule_conditioned_maxima,false);
assert.equal(certificate.classifications.some(text=>text.includes('REQUIRES_PER_FIBRE_CARDINALITY_PROFILES_BEYOND_STAGE_MAXIMA')),false);
assert.equal(certificate.scars.includes('SUFFICIENT_REPLAY_REPRESENTATION != NECESSARY_REPLAY_REPRESENTATION'),true);

console.log('Ash A15-R0 trajectory custody-functional closure pre-authority refinement hostile tests passed.');
