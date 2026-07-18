import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
import { buildResearchFixture } from '../app/dome-world/ash-research-demo-hydration.js';
import { compileCaseMap,compileRoomRules,compileRouteMemory,verifyCaseMap,verifyRoomRules,verifyRouteMemory } from '../app/engine/ash-keep-core.js';

const f=buildResearchFixture();
assert.deepEqual(f.counts,{rooms:14,nodes:72,relationships:112,rules:8,routes:6,controls:12,held_outs:8,strata:10});
assert.equal(f.assay.maximum_assurance,'PA2_LOCALLY_EXECUTED');
assert.equal(f.assay.source_status,'CONSTRUCTED');
assert.equal(f.assay.promotion_authorized,false);
assert.equal(f.assay.unknown_readers,'UNMEASURED');
assert.equal(f.assay.universal_secrecy,false);
for(const kind of ['MATCHED_BENIGN','ROUTE_ORDER','CROSS_SESSION','METADATA_ONLY'])assert.ok(f.assay.controls.some(c=>c.class===kind));
const rooms=new Set(f.rooms.map(x=>x.id)),nodes=new Set(f.nodes.map(x=>x.id)),edges=new Set(f.relationships.map(x=>x.id));
assert.equal(rooms.size,14);assert.equal(nodes.size,72);assert.equal(edges.size,112);
for(const n of f.nodes)assert.ok(rooms.has(n.room_id),`Unknown Room for ${n.id}`);
for(const e of f.relationships){assert.ok(nodes.has(e.from),`Unknown source ${e.id}`);assert.ok(nodes.has(e.to),`Unknown target ${e.id}`);}
for(const rule of f.rules){for(const id of rule.allowed_room_ids)assert.ok(rooms.has(id));for(const id of rule.local_link_keys)assert.ok(edges.has(id));}
for(const route of f.routes.entries){assert.match(route.draft_digest,/^sha256:[0-9a-f]{64}$/);for(const id of route.disclosed_opaque_references)assert.ok(nodes.has(id));}
for(const held of f.assay.held_outs)assert.ok(nodes.has(held.reference));
const caseMap=await compileCaseMap({profile:'research',caseId:'case_demo_research',title:f.profile.title,rooms:f.rooms,nodes:f.nodes,relationships:f.relationships,privateChronology:f.profile.chronology,intendedActions:f.profile.actions,sourceStatus:'SIMULATED',evidenceBasis:['synthetic Research qualification fixture'],observations:f.profile.observations,missingness:f.profile.missingness,alternatives:f.profile.alternatives,openQuestions:f.profile.open_questions,operatorNotes:['demo_profile:research']});
const roomRules=await compileRoomRules({caseId:caseMap.case_id,rules:f.rules,sourceStatus:'SIMULATED'});
const routeMemory=await compileRouteMemory({caseId:caseMap.case_id,entries:f.routes.entries,operatorDeclaredAssumptions:f.routes.operator_declared_assumptions,unknown:f.routes.unknown,sourceStatus:'SIMULATED'});
assert.equal(await verifyCaseMap(caseMap),true);assert.equal(await verifyRoomRules(roomRules),true);assert.equal(await verifyRouteMemory(routeMemory),true);
console.log('ash-research-demo-hydration.test.mjs passed');
