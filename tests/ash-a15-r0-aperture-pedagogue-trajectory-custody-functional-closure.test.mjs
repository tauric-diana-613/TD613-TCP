import assert from 'node:assert/strict';

import { AIA_RECEIVERS } from '../app/dome-world/previews/a15-r0/aia-receiver-indexed-distinguishability.js';
import {
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicObservationMatrix,
  observePhasonicState,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';
import { DROMOLOGICAL_S3_SCHEDULES } from '../app/dome-world/previews/a15-r0/dromological-s3-schedule-atlas-first-stratum-gate.js';
import { bitemporalProspectiveReplayMinimalObservationPolicyCertificate } from '../app/dome-world/previews/a15-r0/bitemporal-prospective-replay-minimal-observation-policy.js';
import { claimBundleMinimalSufficientCustodyFrontierCertificate } from '../app/dome-world/previews/a15-r0/claim-bundle-minimal-sufficient-custody-frontier.js';
import { postRecompressionBundleRestorationSidecarCertificate } from '../app/dome-world/previews/a15-r0/post-recompression-bundle-restoration-sidecar.js';
import { restorationHolonomyPathDependentCustodyCertificate } from '../app/dome-world/previews/a15-r0/restoration-holonomy-path-dependent-custody-certificate.js';
import { anticipatoryCustodyEnvelopeCanonicalCertificate } from '../app/dome-world/previews/a15-r0/anticipatory-custody-envelope-uniform-surface-certificate.js';
import { twoSurfaceHorizonAliasingCertificate } from '../app/dome-world/previews/a15-r0/two-surface-horizon-aliasing.js';
import { finiteDistinguishabilityTrajectoryCalculusCertificate } from '../app/dome-world/previews/a15-r0/finite-distinguishability-trajectory-calculus.js';

const CLAIMS=['FIRST_STRATUM','SCHEDULE','X1','X2','X3','FULL_STATE','REPLAY_REQUIRED_FOR_EXACT_STATE'];
const STAGES=[0,1,2,3];
const EXPECTED_858={2:82,3:36,5:298,6:48,10:90,15:36,25:88,30:64,50:88,75:16,125:18,150:32,250:18,375:36,750:72};
const EXPECTED_862={5:4,10:4,15:8,25:4,30:16,50:4,75:8,125:18,150:16,250:18,375:36,750:72};
const canonical=value=>JSON.stringify(value);
const normalize=record=>Object.fromEntries(Object.entries(record).sort(([a],[b])=>a.localeCompare(b)));
const sameRecord=(a,b)=>canonical(normalize(a))===canonical(normalize(b));

function scheduleId(schedule){
  const letters={PHI_PAIR_WIRE:'P',HEXAGONAL_MOIRE:'H',ICOSAHEDRAL_PHASON:'I'};
  return schedule.map(x=>letters[x]).join('-');
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
  throw new Error(`hostile unknown closure claim ${claim}`);
}
const bundleValue=(claims,a)=>canonical(claims.map(claim=>[claim,claimValue(claim,a)]));
function inc(map,key){ map.set(String(key),(map.get(String(key))??0)+1); }
function record(map,numeric=false){
  return Object.fromEntries([...map.entries()].sort(([a],[b])=>numeric?Number(a)-Number(b):a.localeCompare(b)));
}
function incNested(map,key,m0){
  if(!map.has(key)) map.set(key,{count:0,m0:new Map()});
  const row=map.get(key); row.count+=1; inc(row.m0,m0);
}
function nested(map){
  return Object.fromEntries([...map.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([key,row])=>[
    key,{count:row.count,m0:record(row.m0,true)},
  ]));
}
function profileKey(cards){
  const unique=[...new Set(cards)];
  assert.equal(unique.length,1,'closure hostile found mixed profile in preregistered q3-birth domain');
  return `${cards.length}x${unique[0]}`;
}

const policy=bitemporalProspectiveReplayMinimalObservationPolicyCertificate();
const bundleParent=claimBundleMinimalSufficientCustodyFrontierCertificate();
const parent866=finiteDistinguishabilityTrajectoryCalculusCertificate();
const parent858=postRecompressionBundleRestorationSidecarCertificate();
const parent860=restorationHolonomyPathDependentCustodyCertificate();
const parent862=anticipatoryCustodyEnvelopeCanonicalCertificate();
const parent864=twoSurfaceHorizonAliasingCertificate();
for(const p of [policy,bundleParent,parent866,parent858,parent860,parent862,parent864]) assert.equal(p.passed,true);
assert.equal(parent866.parent_receipt,'b3902a14312d06eb91762ac0369fdb1daf5ff543');

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
}
assert.deepEqual(Object.fromEntries(STAGES.map(stage=>[stage,atlas.get(stage).size])),{0:1,1:23,2:158,3:430});

const allBundles=bundles(CLAIMS);
assert.equal(allBundles.length,127);
const birthRows=new Map(bundleParent.bundle_support_certificate.rows.map(row=>[`${row.schedule_id}|${row.bundle_id}`,row]));
const targets=new Map(DROMOLOGICAL_S3_SCHEDULES.map(schedule=>{
  const id=scheduleId(schedule); return [id,antecedents.filter(a=>a.schedule_id===id)];
}));
const contexts=[];
for(const schedule of DROMOLOGICAL_S3_SCHEDULES){
  const id=scheduleId(schedule);
  for(const claims of allBundles){
    const bundle_id=claims.join('+');
    const inherited=birthRows.get(`${id}|${bundle_id}`);
    assert.ok(inherited,`missing inherited birth ${id}/${bundle_id}`);
    contexts.push({schedule_id:id,bundle_id,claims,bundle_size:claims.length,birth:inherited.actual_birth});
  }
}
assert.equal(contexts.length,762);

const profileCache=new Map();
let stageMaximumRecoveries=0;
function profile(context,stage){
  const id=`${context.schedule_id}|${context.bundle_id}|${stage}`;
  if(profileCache.has(id)) return profileCache.get(id);
  const keys=[...new Set(targets.get(context.schedule_id).map(a=>canonical(quotient(stage,a))))];
  const cards=keys.map(key=>new Set(atlas.get(stage).get(key).map(a=>bundleValue(context.claims,a))).size).sort((a,b)=>a-b);
  const p={cards,maximum:Math.max(...cards),all_singleton:cards.every(v=>v===1)};
  profileCache.set(id,p); stageMaximumRecoveries+=1; return p;
}
for(const context of contexts) for(const stage of STAGES) profile(context,stage);
assert.equal(profileCache.size,3048);
assert.equal(stageMaximumRecoveries,3048);

// #858 independent replay
let r858Total=0,r858Unsafe=0,r858Safe=0,r858SafeFailures=0;
const r858Distribution=new Map();
for(const c of contexts){
  if(c.birth==='INF') continue;
  for(let fine=c.birth;fine<=3;fine+=1) for(let coarse=0;coarse<fine;coarse+=1){
    r858Total+=1;
    const p=profile(c,coarse);
    if(coarse<c.birth){ r858Unsafe+=1; inc(r858Distribution,p.maximum); }
    else { r858Safe+=1; if(!p.all_singleton) r858SafeFailures+=1; }
  }
}
const r858Record=record(r858Distribution,true);
assert.equal(r858Total,1180); assert.equal(r858Unsafe,1022); assert.equal(r858Safe,158); assert.equal(r858SafeFailures,0);
assert.equal(sameRecord(r858Record,EXPECTED_858),true);
assert.equal(sameRecord(r858Record,parent858.restoration_census.m_distribution),true);

// #860 independent replay
const paths=[]; let plateau=0,rupture=0,decrease=0,maxExpansion=-1;
for(const c of contexts){
  if(c.birth==='INF'||c.birth<2) continue;
  for(let fine=c.birth;fine<=3;fine+=1) for(let d=1;d<c.birth;d+=1){
    if(d>=fine) continue;
    for(let terminal=0;terminal<d;terminal+=1){
      const md=profile(c,d).maximum,mc=profile(c,terminal).maximum;
      if(md===mc) plateau+=1; else if(md<mc) rupture+=1; else decrease+=1;
      maxExpansion=Math.max(maxExpansion,mc-md);
      paths.push({schedule_id:c.schedule_id,bundle_id:c.bundle_id,birth:c.birth,fine,intermediate:d,terminal,md,mc,transportable:md===mc});
    }
  }
}
assert.equal(paths.length,784); assert.equal(plateau,42); assert.equal(rupture,742); assert.equal(decrease,0); assert.equal(maxExpansion,745);
const endpointGroups=new Map();
for(const p of paths){
  const key=`${p.schedule_id}|${p.bundle_id}|${p.birth}|${p.fine}|${p.terminal}`;
  if(!endpointGroups.has(key)) endpointGroups.set(key,[]); endpointGroups.get(key).push(p);
}
const twoGroups=[...endpointGroups.values()].filter(g=>g.length===2);
const mixedGroups=twoGroups.filter(g=>g.some(p=>p.transportable)&&g.some(p=>!p.transportable));
assert.equal(twoGroups.length,208); assert.equal(mixedGroups.length,2);
for(const g of mixedGroups){
  const sorted=[...g].sort((a,b)=>a.intermediate-b.intermediate);
  assert.ok(['P-H-I','P-I-H'].includes(g[0].schedule_id)); assert.equal(g[0].bundle_id,'X2+X3');
  assert.deepEqual([sorted[0].intermediate,sorted[0].md,sorted[0].mc,sorted[0].transportable],[1,25,25,true]);
  assert.deepEqual([sorted[1].intermediate,sorted[1].md,sorted[1].mc,sorted[1].transportable],[2,5,25,false]);
}
assert.equal(parent860.path_transport_census.total_paths,paths.length);
assert.equal(parent860.path_transport_census.transport_plateau_paths,plateau);
assert.equal(parent860.path_transport_census.transport_rupture_paths,rupture);
assert.equal(parent860.path_transport_census.maximum_support_cardinality_expansion,maxExpansion);

// #862 and #864 independent replay share q3-birth contexts.
const robust=new Map(),signatures=new Map(),scalar=new Map(),marginal=new Map(),aliasRows=[];
let r862Contexts=0,r862Plateau=0,r862Expand=0,fiveTo750=0;
for(const c of contexts){
  if(c.birth!==3) continue;
  r862Contexts+=1;
  const q2=profile(c,2),q1=profile(c,1),q0=profile(c,0);
  assert.equal(q2.maximum,5);
  inc(robust,q0.maximum);
  const first=q1.maximum===q2.maximum?'FLAT':'EXPAND',second=q0.maximum===q1.maximum?'FLAT':'EXPAND';
  inc(signatures,`${first}->${second}`);
  if(q0.maximum===q2.maximum) r862Plateau+=1; else if(q0.maximum>q2.maximum) r862Expand+=1;
  if(q0.maximum===750) fiveTo750+=1;
  incNested(scalar,`${q2.maximum}->${q1.maximum}`,q0.maximum);
  const q2key=profileKey(q2.cards),q1key=profileKey(q1.cards);
  incNested(marginal,`${q2key}|${q1key}`,q0.maximum);
  aliasRows.push({schedule_id:c.schedule_id,bundle_id:c.bundle_id,bundle_size:c.bundle_size,q2_profile:q2key,q1_profile:q1key,m0:q0.maximum});
}
assert.equal(r862Contexts,208); assert.equal(r862Plateau,4); assert.equal(r862Expand,204); assert.equal(fiveTo750,72);
assert.equal(sameRecord(record(robust,true),EXPECTED_862),true);
assert.deepEqual(record(signatures),{'EXPAND->EXPAND':182,'EXPAND->FLAT':2,'FLAT->EXPAND':20,'FLAT->FLAT':4});
assert.equal(sameRecord(record(robust,true),parent862.anticipatory_envelope_census.future_robust_spectrum),true);

const scalarRecord=nested(scalar),marginalRecord=nested(marginal);
assert.equal(Object.keys(scalarRecord).length,4);
assert.equal(Object.values(scalarRecord).filter(row=>Object.keys(row.m0).length>1).length,4);
assert.equal(Object.keys(marginalRecord).length,6);
const ambiguous=Object.values(marginalRecord).filter(row=>Object.keys(row.m0).length>1);
const identifying=Object.values(marginalRecord).filter(row=>Object.keys(row.m0).length===1);
assert.equal(ambiguous.length,5); assert.equal(identifying.length,1);
assert.equal(ambiguous.reduce((sum,row)=>sum+row.count,0),200); assert.equal(identifying.reduce((sum,row)=>sum+row.count,0),8);
assert.equal(canonical(scalarRecord),canonical(parent864.census.scalar_two_surface_classes));
assert.equal(canonical(marginalRecord),canonical(parent864.census.marginal_profile_classes));
const left=aliasRows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='FIRST_STRATUM+FULL_STATE');
const right=aliasRows.find(row=>row.schedule_id==='P-H-I'&&row.bundle_id==='X2+X3');
assert.ok(left&&right); assert.equal(left.bundle_size,2); assert.equal(right.bundle_size,2);
assert.equal(left.q2_profile,right.q2_profile); assert.equal(left.q1_profile,right.q1_profile);
assert.equal(left.m0,375); assert.equal(right.m0,25); assert.equal(left.m0/right.m0,15);

assert.equal(1180+784+208+208,2380);

// Only after independent reconstruction consult the canonical closure surface.
const closureModule=await import('../app/dome-world/previews/a15-r0/trajectory-custody-functional-closure-certificate.js');
const certificate=closureModule.trajectoryCustodyFunctionalClosureCanonicalCertificate();
assert.equal(certificate.schema,'td613.dome-world.trajectory-custody-functional-closure/v0.1');
assert.equal(certificate.parent_receipt,'a5a073bdf18cd1b7155422b4bd562de9c80aa3f5');
assert.equal(certificate.prehostile_repair.kind,'OBJECT_KEY_INSERTION_ORDER_COMPARISON_ONLY');
assert.equal(certificate.prehostile_repair.scientific_counts_changed,false);
assert.equal(certificate.execution_ledger.stage_maximum_recoveries,3048);
assert.equal(certificate.execution_ledger.cross_theorem_row_comparisons,2380);
assert.equal(Object.values(certificate.parent_matches).every(Boolean),true);
assert.equal(certificate.exact,true);
assert.equal(certificate.passed,true);

const ash=closureModule.compileTrajectoryCustodyFunctionalClosureCanonicalProjection(AIA_RECEIVERS.ASH);
const loom=closureModule.compileTrajectoryCustodyFunctionalClosureCanonicalProjection(AIA_RECEIVERS.LOOM);
assert.deepEqual(ash.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness,PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.equal(Object.values(ash.authority).some(Boolean),false);
assert.equal(Object.values(loom.authority).some(Boolean),false);
assert.equal(ash.payload.full_support_tables_exposed,false);
assert.equal(ash.payload.full_birth_table_exposed,false);
assert.equal(ash.payload.full_replay_rows_exposed,false);

for(const hostile of [
  {...loom,universal_sufficient_statistic:true},
  {...loom,universal_encoding_minimality:true},
  {...loom,shannon_capacity:true},
  {...loom,entropy:true},
  {...loom,mutual_information:true},
  {...loom,physical_holonomy:true},
  {...loom,operational_path_groupoid:true},
  {...loom,source_state_mutation:true},
  {...loom,retrocausality:true},
  {...ash,payload:{...ash.payload,full_support_tables_exposed:true}},
  {...ash,payload:{...ash.payload,full_birth_table_exposed:true}},
  {...ash,payload:{...ash.payload,full_replay_rows_exposed:true}},
]) assert.equal(closureModule.rejectTrajectoryCustodyFunctionalClosureOverreach(hostile).accepted,false);

console.log('Ash A15-R0 trajectory custody-functional closure independent hostile tests passed.');
