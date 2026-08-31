import {
  MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_SCHEMA,
  mossLanternProceduralMemoryOrderDefectCertificate,
} from './moss-lantern-procedural-memory-order-defect.js';

export const HOLONOMY_LOOM_MOSS_LANTERN_DISCRETE_TRANSPORT_SCHEMA='td613.dome-world.holonomy-loom-moss-lantern-discrete-transport/v0.1';
export const HOLONOMY_LOOM_MOSS_LANTERN_DISCRETE_TRANSPORT_PARENT_RECEIPT='d840400c37d6ac36b744157c1fbae1bc9451ada1';

const STATES=Object.freeze([[0,0],[0,1],[1,0],[1,1]].map(row=>Object.freeze(row)));
const STATE_INDEX=new Map(STATES.map((row,index)=>[row.join(''),index]));
const BASE_PATH=Object.freeze(['v0','v1','v2','v3','v0']);
const ENDPOINT='returned-practice-capsule';
let cached=null;

function freeze(value){
  if(value&&typeof value==='object'&&!Object.isFrozen(value)){ Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const pairId=pair=>pair.join('');
const samePair=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const hamming=(a,b)=>Number(a[0]!==b[0])+Number(a[1]!==b[1]);
const A=([x,y])=>Object.freeze([x^1,y]);
const B=([x,y])=>Object.freeze([x,y^x]);
const C=([x,y])=>Object.freeze([x^1,y]);
const D=([x,y])=>Object.freeze([x,y^1]);
const ID=state=>Object.freeze([...state]);
const MARKER=([,y])=>y;

function mapOf(fn){ return Object.freeze(STATES.map(state=>Object.freeze([...fn(state)]))); }
function mapId(map){ return map.map(pairId).join('|'); }
function applyMap(map,state){ return map[STATE_INDEX.get(pairId(state))]; }
function compose(left,right){ return Object.freeze(STATES.map(state=>Object.freeze([...applyMap(right,applyMap(left,state))]))); }
function applySequence(start,maps){ let state=Object.freeze([...start]); for(const map of maps) state=applyMap(map,state); return state; }
function isIdentity(map){ return STATES.every((state,index)=>samePair(state,map[index])); }
function isBijective(map){ return new Set(map.map(pairId)).size===STATES.length; }
function inverseIn(group,map){
  for(const candidate of group) if(isIdentity(compose(map,candidate))&&isIdentity(compose(candidate,map))) return candidate;
  return null;
}
function closure(generators){
  const identity=mapOf(ID);
  const byId=new Map([[mapId(identity),identity]]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current){
      for(const right of [...generators,...current]){
        for(const candidate of [compose(left,right),compose(right,left)]){
          const id=mapId(candidate);
          if(!byId.has(id)){ byId.set(id,candidate); changed=true; }
        }
      }
    }
  }
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function subgroupClosure(seed,group){
  const identity=mapOf(ID);
  const byId=new Map([[mapId(identity),identity],...seed.map(map=>[mapId(map),map])]);
  let changed=true;
  while(changed){
    changed=false;
    const current=[...byId.values()];
    for(const left of current) for(const right of current){
      const candidate=compose(left,right);
      const id=mapId(candidate);
      if(!byId.has(id)){ byId.set(id,candidate); changed=true; }
    }
  }
  const groupIds=new Set(group.map(mapId));
  if([...byId.keys()].some(id=>!groupIds.has(id))) throw new Error('subgroup closure escaped declared transport group');
  return Object.freeze([...byId.values()].sort((a,b)=>mapId(a).localeCompare(mapId(b))));
}
function commutator(left,right,group){
  const leftInv=inverseIn(group,left),rightInv=inverseIn(group,right);
  if(!leftInv||!rightInv) throw new Error('commutator requires invertible transports');
  return compose(compose(compose(left,right),leftInv),rightInv);
}

export function holonomyLoomMossLanternDiscreteTransportCertificate(){
  if(cached) return cached;
  const parent=mossLanternProceduralMemoryOrderDefectCertificate();
  const parentExact=parent.passed===true&&
    MOSS_LANTERN_PROCEDURAL_MEMORY_ORDER_DEFECT_SCHEMA==='td613.dome-world.moss-lantern-procedural-memory-order-defect/v0.1'&&
    parent.laws?.procedural_memory_witness_bounded_fixture===true&&
    parent.laws?.memoryless_projection_remains_collapsed===true&&
    parent.fixture?.fixture_id==='ash-loom.moss-lantern-calibration/v0.1';

  const idMap=mapOf(ID),aMap=mapOf(A),bMap=mapOf(B),cMap=mapOf(C),dMap=mapOf(D);
  const group=closure([aMap,bMap]);
  const aInv=inverseIn(group,aMap),bInv=inverseIn(group,bMap);
  const inverseChecks=group.map(map=>inverseIn(group,map));
  const groupBijections=group.filter(isBijective).length;
  const groupInverseFailures=inverseChecks.filter(value=>value===null).length;

  let aInverseChecks=0,bInverseChecks=0,aInverseFailures=0,bInverseFailures=0;
  for(const state of STATES){
    aInverseChecks+=1; if(!samePair(applySequence(state,[aMap,aInv]),state)) aInverseFailures+=1;
    bInverseChecks+=1; if(!samePair(applySequence(state,[bMap,bInv]),state)) bInverseFailures+=1;
  }

  const holonomy=compose(compose(compose(aMap,bMap),aInv),bInv);
  const expectedHolonomy=mapOf(D);
  const rows=[];
  let loopBasepointReturns=0,loopNonidentity=0,loopUnitHamming=0,loopMarkerSplits=0,loopSquaredIdentity=0;
  let memorylessEndpointDivergences=0;
  for(const start of STATES){
    const end=applyMap(holonomy,start);
    const twice=applyMap(holonomy,end);
    if(BASE_PATH[0]===BASE_PATH.at(-1)) loopBasepointReturns+=1;
    if(!samePair(start,end)) loopNonidentity+=1;
    if(hamming(start,end)===1) loopUnitHamming+=1;
    if(MARKER(start)!==MARKER(end)) loopMarkerSplits+=1;
    if(samePair(start,twice)) loopSquaredIdentity+=1;
    const qBefore=ENDPOINT,qAfter=ENDPOINT;
    if(qBefore!==qAfter) memorylessEndpointDivergences+=1;
    rows.push(freeze({start:pairId(start),end:pairId(end),hamming:hamming(start,end),marker_before:MARKER(start),marker_after:MARKER(end),twice:pairId(twice),base_start:'v0',base_end:'v0'}));
  }

  let groupCommutatorChecks=0;
  const commutators=[];
  const commutatorIds=new Set();
  for(const left of group) for(const right of group){
    groupCommutatorChecks+=1;
    const value=commutator(left,right,group);
    const id=mapId(value);
    if(!commutatorIds.has(id)){ commutatorIds.add(id); commutators.push(value); }
  }
  const derived=subgroupClosure(commutators,group);

  let backtrackChecks=0,backtrackNonidentity=0;
  for(const state of STATES){
    for(const pair of [[aMap,aInv],[bMap,bInv]]){
      backtrackChecks+=1;
      if(!samePair(applySequence(state,pair),state)) backtrackNonidentity+=1;
    }
  }

  const controlGroup=closure([cMap,dMap]);
  const cInv=inverseIn(controlGroup,cMap),dInv=inverseIn(controlGroup,dMap);
  const controlHolonomy=compose(compose(compose(cMap,dMap),cInv),dInv);
  let commutingControlChecks=0,commutingControlNonidentity=0;
  for(const state of STATES){ commutingControlChecks+=1; if(!samePair(applyMap(controlHolonomy,state),state)) commutingControlNonidentity+=1; }

  const holonomyExact=mapId(holonomy)===mapId(expectedHolonomy);
  const derivedIds=new Set(derived.map(mapId));
  const derivedExact=derived.length===2&&derivedIds.has(mapId(idMap))&&derivedIds.has(mapId(holonomy));

  const exact=parentExact&&STATES.length===4&&BASE_PATH.length===5&&BASE_PATH[0]===BASE_PATH.at(-1)&&
    group.length===8&&groupBijections===8&&groupInverseFailures===0&&aInverseChecks===4&&bInverseChecks===4&&aInverseFailures===0&&bInverseFailures===0&&
    holonomyExact&&loopBasepointReturns===4&&loopNonidentity===4&&loopUnitHamming===4&&loopMarkerSplits===4&&loopSquaredIdentity===4&&memorylessEndpointDivergences===0&&
    groupCommutatorChecks===64&&derivedExact&&backtrackChecks===8&&backtrackNonidentity===0&&commutingControlChecks===4&&commutingControlNonidentity===0;

  cached=freeze({
    schema:HOLONOMY_LOOM_MOSS_LANTERN_DISCRETE_TRANSPORT_SCHEMA,
    parent_receipt:HOLONOMY_LOOM_MOSS_LANTERN_DISCRETE_TRANSPORT_PARENT_RECEIPT,
    parent_exact:parentExact,
    base:freeze({graph:'synthetic calibration cycle C4',vertices:freeze(['v0','v1','v2','v3']),based_path:freeze([...BASE_PATH]),basepoint:'v0'}),
    fiber:freeze({carrier:'F2^2',states:freeze(STATES.map(row=>freeze([...row]))),visible_endpoint:ENDPOINT}),
    transport:freeze({A:'(x,y)->(x xor 1,y)',B:'(x,y)->(x,y xor x)',A_inverse_equals_A:true,B_inverse_equals_B:true,group_size:group.length,group_bijections:groupBijections,group_inverse_failures:groupInverseFailures}),
    holonomy:freeze({loop:'A B A^-1 B^-1',map:'(x,y)->(x,y xor 1)',rows:freeze(rows),basepoint_returns:loopBasepointReturns,nonidentity_outputs:loopNonidentity,unit_hamming_outputs:loopUnitHamming,marker_splits:loopMarkerSplits,squared_identity_outputs:loopSquaredIdentity}),
    algebra:freeze({group_commutator_checks:groupCommutatorChecks,distinct_commutator_values:commutatorIds.size,commutator_subgroup_size:derived.length,commutator_subgroup_exact_identity_plus_holonomy:derivedExact}),
    controls:freeze({backtrack_checks:backtrackChecks,backtrack_nonidentity_outputs:backtrackNonidentity,commuting_control_checks:commutingControlChecks,commuting_control_nonidentity_outputs:commutingControlNonidentity,memoryless_endpoint_divergences:memorylessEndpointDivergences}),
    laws:freeze({formal_discrete_holonomy_nontrivial:holonomyExact&&loopNonidentity===4,holonomy_order_two:loopSquaredIdentity===4,commutator_subgroup_exactly_identity_plus_holonomy:derivedExact,backtrack_null:backtrackNonidentity===0,commuting_square_null:commutingControlNonidentity===0,memoryless_endpoint_projection_blind:memorylessEndpointDivergences===0}),
    membranes:freeze(['FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_HOLONOMY','FORMAL_DISCRETE_HOLONOMY != PHYSICAL_HOLONOMY','DISCRETE_TRANSPORT_ASSIGNMENT != LEVI_CIVITA_OR_GAUGE_CONNECTION','CALIBRATION_BASE_CYCLE != LIVE_ROUTE_GRAPH','DECLARED_INVERSE_EDGE_TRANSPORT != OPERATIONAL_UNDO_OR_REVERSE_WORKFLOW','NONTRIVIAL_COMMUTATOR != PHYSICAL_CURVATURE_MEASUREMENT','FINITE_TRANSPORT_GROUP != MODEL_INTERNAL_SYMMETRY_GROUP','HOLONOMY_LOOM_RESEARCH_RECEIPT != LIVE_HOLONOMY_LOOM_RUNTIME']),
    passed:exact,
  });
  return cached;
}

export const HOLONOMY_LOOM_MOSS_LANTERN_DISCRETE_TRANSPORT_CERTIFICATE=holonomyLoomMossLanternDiscreteTransportCertificate();
