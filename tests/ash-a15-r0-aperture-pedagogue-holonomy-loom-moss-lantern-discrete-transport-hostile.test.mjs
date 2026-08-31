import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const STATES=[[0,0],[0,1],[1,0],[1,1]];
const IDX=new Map(STATES.map((s,i)=>[s.join(''),i]));
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const mapOf=fn=>STATES.map(s=>fn(s));
const id=mapOf(([x,y])=>[x,y]);
const A=mapOf(([x,y])=>[x^1,y]);
const B=mapOf(([x,y])=>[x,y^x]);
const C=mapOf(([x,y])=>[x^1,y]);
const D=mapOf(([x,y])=>[x,y^1]);
const mapId=map=>map.map(s=>s.join('')).join('|');
const apply=(map,s)=>map[IDX.get(s.join(''))];
const compose=(left,right)=>STATES.map(s=>apply(right,apply(left,s)));
const isId=map=>STATES.every((s,i)=>same(s,map[i]));
const bijective=map=>new Set(map.map(s=>s.join(''))).size===4;
function closure(gens){
  const byId=new Map([[mapId(id),id]]); let changed=true;
  while(changed){ changed=false; const current=[...byId.values()]; for(const x of current) for(const y of [...gens,...current]) for(const z of [compose(x,y),compose(y,x)]){ const key=mapId(z); if(!byId.has(key)){byId.set(key,z);changed=true;} } }
  return [...byId.values()];
}
function inverse(group,map){ return group.find(candidate=>isId(compose(map,candidate))&&isId(compose(candidate,map)))||null; }
function commutator(group,left,right){ const li=inverse(group,left),ri=inverse(group,right); assert.ok(li&&ri); return compose(compose(compose(left,right),li),ri); }
function subgroup(seed){ const byId=new Map([[mapId(id),id],...seed.map(x=>[mapId(x),x])]); let changed=true; while(changed){ changed=false; const xs=[...byId.values()]; for(const x of xs) for(const y of xs){ const z=compose(x,y),key=mapId(z); if(!byId.has(key)){byId.set(key,z);changed=true;} } } return [...byId.values()]; }

const fixture=JSON.parse(await fs.readFile(new URL('../tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json',import.meta.url),'utf8'));
assert.equal(fixture.fixture_id,'ash-loom.moss-lantern-calibration/v0.1');
assert.equal(fixture.manifestly_fictional,true);
assert.equal(fixture.runtime_binding,false);
assert.equal(fixture.expected_endpoint,'returned-practice-capsule');

const group=closure([A,B]);
assert.equal(group.length,8);
assert.equal(group.filter(bijective).length,8);
assert.equal(group.filter(x=>inverse(group,x)===null).length,0);
const Ai=inverse(group,A),Bi=inverse(group,B);
assert.equal(mapId(Ai),mapId(A));
assert.equal(mapId(Bi),mapId(B));

const hol=compose(compose(compose(A,B),Ai),Bi);
assert.equal(mapId(hol),mapId(D));
const expected=[['00','01'],['01','00'],['10','11'],['11','10']];
assert.deepEqual(STATES.map(s=>[s.join(''),apply(hol,s).join('')]),expected);
for(const s of STATES){
  const end=apply(hol,s);
  assert.equal(Number(s[0]!==end[0])+Number(s[1]!==end[1]),1);
  assert.notEqual(s[1],end[1]);
  assert.deepEqual(apply(hol,end),s);
  assert.equal(fixture.expected_endpoint,'returned-practice-capsule');
  assert.deepEqual(apply(compose(A,Ai),s),s);
  assert.deepEqual(apply(compose(B,Bi),s),s);
}

const comms=[]; const seen=new Set(); let commChecks=0;
for(const left of group) for(const right of group){ commChecks+=1; const value=commutator(group,left,right),key=mapId(value); if(!seen.has(key)){seen.add(key);comms.push(value);} }
assert.equal(commChecks,64);
assert.equal(seen.size,2);
const derived=subgroup(comms);
assert.equal(derived.length,2);
assert.deepEqual(new Set(derived.map(mapId)),new Set([mapId(id),mapId(hol)]));

const controlGroup=closure([C,D]);
const Ci=inverse(controlGroup,C),Di=inverse(controlGroup,D);
const controlHol=compose(compose(compose(C,D),Ci),Di);
assert.equal(isId(controlHol),true);
for(const s of STATES) assert.deepEqual(apply(controlHol,s),s);

// Parent is checked only after the independent transport/group reconstruction above.
const { mossLanternProceduralMemoryOrderDefectCertificate }=await import('../app/dome-world/previews/a15-r0/moss-lantern-procedural-memory-order-defect.js');
const parent=mossLanternProceduralMemoryOrderDefectCertificate();
assert.equal(parent.passed,true);
assert.equal(parent.laws.procedural_memory_witness_bounded_fixture,true);
assert.equal(parent.laws.memoryless_projection_remains_collapsed,true);

const { holonomyLoomMossLanternDiscreteTransportCertificate }=await import('../app/dome-world/previews/a15-r0/holonomy-loom-moss-lantern-discrete-transport.js');
const child=holonomyLoomMossLanternDiscreteTransportCertificate();
assert.equal(child.passed,true);
assert.equal(child.transport.group_size,8);
assert.equal(child.algebra.commutator_subgroup_size,2);
assert.equal(child.holonomy.nonidentity_outputs,4);
assert.equal(child.controls.commuting_control_nonidentity_outputs,0);
assert.equal(child.controls.memoryless_endpoint_divergences,0);

console.log('Ash A15-R0 hostile Holonomy Loom / Moss Lantern discrete transport reconstruction passed.');
