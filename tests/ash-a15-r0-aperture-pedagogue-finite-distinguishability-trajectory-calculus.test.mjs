import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import {
  FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_SCHEMA,
  FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_PARENT_RECEIPT,
  finiteDistinguishabilityTrajectoryCalculusCertificate,
  compileFiniteDistinguishabilityTrajectoryProjection,
  rejectFiniteDistinguishabilityTrajectoryOverreach,
} from '../app/dome-world/previews/a15-r0/finite-distinguishability-trajectory-calculus.js';

const CLAIMS=['FIRST_STRATUM','SCHEDULE','X1','X2','X3','FULL_STATE','REPLAY_REQUIRED_FOR_EXACT_STATE'];
const STAGES=[0,1,2,3];
const PAIRS=[[1,0],[2,0],[2,1],[3,0],[3,1],[3,2]];
const TRIPLES=[[2,1,0],[3,2,1],[3,2,0],[3,1,0]];
const EXPECTED_GLOBAL={0:1,1:23,2:158,3:430};
const EXPECTED_UNION={'1->0':762,'2->0':762,'2->1':5842,'3->0':762,'3->1':5842,'3->2':20066};
const EXPECTED_ASSOC={'2->1->0':762,'3->2->1':5842,'3->2->0':762,'3->1->0':762};
const EXPECTED_MONO={
  '3->2':{strict:384,plateau:378},'2->1':{strict:576,plateau:186},'1->0':{strict:736,plateau:26},
  '3->1':{strict:688,plateau:74},'2->0':{strict:746,plateau:16},'3->0':{strict:754,plateau:8},
};
const canonical=value=>JSON.stringify(value);
const setEqual=(a,b)=>a.size===b.size&&[...a].every(v=>b.has(v));

function scheduleId(schedule){
  const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
  return schedule.map(s=>letters[s]).join('-');
}
function states(){
  const out=[];
  for(let x1=-2;x1<=2;x1+=1) for(let x2=-2;x2<=2;x2+=1) for(let x3=-2;x3<=2;x3+=1) out.push([x1,x2,x3]);
  return out;
}
function bundles(values,index=0,current=[],out=[]){
  if(index===values.length){ if(current.length) out.push([...current]); return out; }
  bundles(values,index+1,current,out); current.push(values[index]); bundles(values,index+1,current,out); current.pop(); return out;
}
function quotient(stage,a){
  if(stage===0) return ['NULL_REGISTERED_TRACE'];
  return [a.matrix.slice(0,stage),a.observation.slice(0,stage)];
}
function claimValue(claim,a){
  if(claim==='FIRST_STRATUM') return a.schedule[0];
  if(claim==='SCHEDULE') return a.schedule_id;
  if(claim==='X1') return a.state[0];
  if(claim==='X2') return a.state[1];
  if(claim==='X3') return a.state[2];
  if(claim==='FULL_STATE') return a.state;
  if(claim==='REPLAY_REQUIRED_FOR_EXACT_STATE') return a.replay_required;
  throw new Error(`hostile unknown claim ${claim}`);
}
const bundleValue=(bundle,a)=>canonical(bundle.map(claim=>[claim,claimValue(claim,a)]));

const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
assert.equal(policy.passed,true);
const policyBySchedule=new Map(policy.policy_geometry.map(row=>[row.schedule_id,row]));
const antecedents=[];
for(const schedule of DROMOLOGICAL_S3_SCHEDULES){
  const id=scheduleId(schedule),matrix=phasonicObservationMatrix(schedule),p=policyBySchedule.get(id);
  assert.ok(p);
  for(const state of states()) antecedents.push({schedule,schedule_id:id,state,matrix,observation:observePhasonicState(state,schedule),replay_required:p.replay_required});
}
assert.equal(antecedents.length,750);

const atlas=new Map();
for(const stage of STAGES){
  const fibres=new Map();
  for(const a of antecedents){
    const key=canonical(quotient(stage,a));
    if(!fibres.has(key)) fibres.set(key,[]);
    fibres.get(key).push(a);
  }
  atlas.set(stage,fibres);
  assert.equal(fibres.size,EXPECTED_GLOBAL[stage]);
}

const maps=new Map();
for(const [fine,coarse] of PAIRS){
  const map=new Map();
  for(const [fineKey,members] of atlas.get(fine).entries()){
    const parents=new Set(members.map(a=>canonical(quotient(coarse,a))));
    assert.equal(parents.size,1,`q${fine} fibre must nest in q${coarse}`);
    map.set(fineKey,[...parents][0]);
  }
  maps.set(`${fine}->${coarse}`,map);
}

const allBundles=bundles(CLAIMS);
assert.equal(allBundles.length,127);
const targetMap=new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
  const id=scheduleId(schedule); return [id,antecedents.filter(a=>a.schedule_id===id)];
}));
const occupied=(targets,stage)=>[...new Set(targets.map(a=>canonical(quotient(stage,a))))];
const support=(stage,key,bundle)=>new Set(atlas.get(stage).get(key).map(a=>bundleValue(bundle,a)));
function propagated(fine,coarse,parentKey,bundle){
  const out=new Set(),map=maps.get(`${fine}->${coarse}`);
  for(const [childKey,p] of map.entries()) if(p===parentKey) for(const value of support(fine,childKey,bundle)) out.add(value);
  return out;
}
function maximum(targets,stage,bundle){
  return Math.max(...occupied(targets,stage).map(key=>support(stage,key,bundle).size));
}

const unionCounts=Object.fromEntries(PAIRS.map(([f,c])=>[`${f}->${c}`,0]));
const assocCounts=Object.fromEntries(TRIPLES.map(([f,d,c])=>[`${f}->${d}->${c}`,0]));
const mono=Object.fromEntries(PAIRS.map(([f,c])=>[`${f}->${c}`,{strict:0,plateau:0,decrease:0}]));
let contexts=0;

for(const [schedule,targets] of targetMap.entries()){
  for(const bundle of allBundles){
    contexts+=1;
    const maxima=new Map(STAGES.map(stage=>[stage,maximum(targets,stage,bundle)]));
    for(const [fine,coarse] of PAIRS){
      const pair=`${fine}->${coarse}`;
      for(const parentKey of occupied(targets,coarse)){
        assert.equal(setEqual(support(coarse,parentKey,bundle),propagated(fine,coarse,parentKey,bundle)),true,
          `${schedule}/${bundle.join('+')} ${pair} support union failed`);
        unionCounts[pair]+=1;
      }
      if(maxima.get(coarse)>maxima.get(fine)) mono[pair].strict+=1;
      else if(maxima.get(coarse)===maxima.get(fine)) mono[pair].plateau+=1;
      else mono[pair].decrease+=1;
    }
    for(const [fine,middle,coarse] of TRIPLES){
      const key=`${fine}->${middle}->${coarse}`;
      for(const parentKey of occupied(targets,coarse)){
        const direct=propagated(fine,coarse,parentKey,bundle);
        const staged=new Set();
        for(const [middleKey,p] of maps.get(`${middle}->${coarse}`).entries()){
          if(p!==parentKey) continue;
          for(const value of propagated(fine,middle,middleKey,bundle)) staged.add(value);
        }
        assert.equal(setEqual(direct,staged),true,`${schedule}/${bundle.join('+')} ${key} associativity failed`);
        assocCounts[key]+=1;
      }
    }
  }
}
assert.equal(contexts,762);
assert.deepEqual(unionCounts,EXPECTED_UNION);
assert.equal(Object.values(unionCounts).reduce((a,b)=>a+b,0),34036);
assert.deepEqual(assocCounts,EXPECTED_ASSOC);
assert.equal(Object.values(assocCounts).reduce((a,b)=>a+b,0),8128);
for(const [key,expected] of Object.entries(EXPECTED_MONO)){
  assert.equal(mono[key].strict,expected.strict,key);
  assert.equal(mono[key].plateau,expected.plateau,key);
  assert.equal(mono[key].decrease,0,key);
}
assert.equal(Object.values(mono).reduce((s,r)=>s+r.strict,0),3884);
assert.equal(Object.values(mono).reduce((s,r)=>s+r.plateau,0),688);
assert.equal(Object.values(mono).reduce((s,r)=>s+r.decrease,0),0);

// Ambient-child control: target visibility is not the ambient merge domain.
const phiTargets=targetMap.get('P-H-I');
assert.equal(occupied(phiTargets,1).length,5);
const q0Key=canonical(['NULL_REGISTERED_TRACE']);
assert.equal([...maps.get('1->0').values()].filter(parent=>parent===q0Key).length,23);
assert.ok(23>5);

// Same unlabelled schedule/merge geometry, different support labels and future custody.
const bundleById=new Map(allBundles.map(bundle=>[bundle.join('+'),bundle]));
const left=bundleById.get('FIRST_STRATUM+FULL_STATE');
const right=bundleById.get('X2+X3');
assert.ok(left&&right);
assert.equal(maximum(phiTargets,0,left),375);
assert.equal(maximum(phiTargets,0,right),25);
assert.equal(maximum(phiTargets,0,left)/maximum(phiTargets,0,right),15);

// #860 same-endpoint control reconstructed from this support atlas.
assert.equal(maximum(phiTargets,1,right),25);
assert.equal(maximum(phiTargets,2,right),5);
assert.equal(maximum(phiTargets,0,right),25);
assert.equal(maximum(phiTargets,1,right)===maximum(phiTargets,0,right),true);
assert.equal(maximum(phiTargets,2,right)<maximum(phiTargets,0,right),true);
// Endpoint support is fixed by direct union regardless of whether q1 or q2 is used as an intermediate.
assert.equal(setEqual(propagated(1,0,q0Key,right),propagated(2,0,q0Key,right)),true);

// Only after the hostile reconstruction do we inspect the canonical certificate.
const certificate=finiteDistinguishabilityTrajectoryCalculusCertificate();
assert.equal(certificate.schema,FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_SCHEMA);
assert.equal(certificate.parent_receipt,FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_PARENT_RECEIPT);
assert.equal(FINITE_DISTINGUISHABILITY_TRAJECTORY_CALCULUS_PARENT_RECEIPT,'b3902a14312d06eb91762ac0369fdb1daf5ff543');
assert.equal(certificate.census.contexts,762);
assert.equal(certificate.census.support_union_identity_total,34036);
assert.equal(certificate.census.associativity_identity_total,8128);
assert.equal(certificate.census.strict_expansions,3884);
assert.equal(certificate.census.plateaux,688);
assert.equal(certificate.census.strict_decreases,0);
assert.equal(certificate.census.ambient_child_control.target_visible_q1_fibres,5);
assert.equal(certificate.census.ambient_child_control.ambient_global_q1_fibres_into_q0,23);
assert.equal(certificate.necessity_ablation.ratio,15);
assert.equal(certificate.passed,true);

const ash=compileFiniteDistinguishabilityTrajectoryProjection(AIA_RECEIVERS.ASH);
const loom=compileFiniteDistinguishabilityTrajectoryProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean),false);
assert.equal(Object.values(loom.authority).some(Boolean),false);
assert.equal(ash.payload.full_support_label_tables_exposed,false);
assert.equal(ash.payload.full_ambient_merge_maps_exposed,false);

for(const hostile of [
  {...loom,shannon_capacity:true},{...loom,entropy:true},{...loom,mutual_information:true},
  {...loom,minimum_bit_length:true},{...loom,universal_sufficient_statistic:true},
  {...loom,universal_category_functor:true},{...loom,physical_holonomy:true},
  {...loom,operational_path_groupoid:true},{...loom,source_state_mutation:true},{...loom,retrocausality:true},
  {...ash,payload:{...ash.payload,full_support_label_tables_exposed:true}},
  {...ash,payload:{...ash.payload,full_ambient_merge_maps_exposed:true}},
]) assert.equal(rejectFiniteDistinguishabilityTrajectoryOverreach(hostile).accepted,false);

console.log('Ash A15-R0 finite distinguishability-trajectory calculus independent hostile tests passed.');
