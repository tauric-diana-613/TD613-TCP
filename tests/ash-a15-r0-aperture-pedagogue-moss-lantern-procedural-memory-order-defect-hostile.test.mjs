import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {
  oneSidedContinuationTwoSidedSyntacticRecoveryCertificate,
} from '../app/dome-world/previews/a15-r0/one-sided-continuation-two-sided-syntactic-recovery.js';

const fixture=JSON.parse(await fs.readFile(new URL('./fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json',import.meta.url),'utf8'));
const parent=oneSidedContinuationTwoSidedSyntacticRecoveryCertificate();

// Bind the hostile to the inherited known-ground-truth Moss Lantern phantom first.
assert.equal(fixture.schema,'td613.pedagogue-practice-fixture/v0.1');
assert.equal(fixture.fixture_id,'ash-loom.moss-lantern-calibration/v0.1');
assert.equal(fixture.operator_label,'Moss Lantern practice capsule');
assert.equal(fixture.manifestly_fictional,true);
assert.equal(fixture.runtime_binding,false);
assert.equal(fixture.operator_read_only_retrieval_allowed,false);
assert.equal(fixture.practice_custody_write_allowed,false);
assert.deepEqual(fixture.expected_route_steps,['open-practice-case','custody-hold','projection-observe','rest','return']);
assert.equal(fixture.expected_endpoint,'returned-practice-capsule');

// Bind the exact earned memoryless null before constructing the expanded apparatus fixture.
assert.equal(parent.passed,true);
assert.equal(parent.laws.memoryless_same_endpoint_same_future_state_readouts,true);
assert.equal(parent.laws.right_context_endpoint_kernel,true);
assert.equal(parent.two_sided_context.right_context_classes_at_A,5);
assert.equal(parent.two_sided_context.syntactic_action_classes,128);

const STARTS=[[0,0],[0,1],[1,0],[1,1]];
const endpoint=fixture.expected_endpoint;
const same=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const hamming=(a,b)=>Number(a[0]!==b[0])+Number(a[1]!==b[1]);
const marker=([,y])=>y;
const A=([x,y])=>[x^1,y];
const B=([x,y])=>[x,y^x];
const C=([x,y])=>[x^1,y];
const D=([x,y])=>[x,y^1];
const reset=()=>[0,0];
const apply=(start,ops)=>ops.reduce((state,op)=>op(state),[...start]);
const id=([x,y])=>`${x}${y}`;

let targetExecutions=0,targetComparisons=0;
let endpointMatches=0,endpointMismatches=0;
let apparatusDivergences=0,apparatusMatches=0,unitDefects=0;
let markerDivergences=0,markerMatches=0;
let memorylessDivergences=0,memorylessMatches=0;
let resetDivergences=0,resetMatches=0;
const targetRows=[];

for(const start of STARTS){
  const ab=apply(start,[A,B]); targetExecutions+=1;
  const ba=apply(start,[B,A]); targetExecutions+=1;
  targetComparisons+=1;
  if(endpoint===endpoint) endpointMatches+=1; else endpointMismatches+=1;
  if(!same(ab,ba)) apparatusDivergences+=1; else apparatusMatches+=1;
  const defect=hamming(ab,ba); if(defect===1) unitDefects+=1;
  const markerAB=marker(ab),markerBA=marker(ba);
  if(markerAB!==markerBA) markerDivergences+=1; else markerMatches+=1;
  const memorylessAB=endpoint,memorylessBA=endpoint;
  if(memorylessAB!==memorylessBA) memorylessDivergences+=1; else memorylessMatches+=1;
  const resetAB=reset(ab),resetBA=reset(ba);
  if(marker(resetAB)!==marker(resetBA)) resetDivergences+=1; else resetMatches+=1;
  targetRows.push({start:id(start),AB:ab,BA:ba,hamming_Xi:defect,marker_AB:markerAB,marker_BA:markerBA});
}

assert.equal(targetExecutions,8);
assert.equal(targetComparisons,4);
assert.equal(endpointMatches,4);
assert.equal(endpointMismatches,0);
assert.equal(apparatusDivergences,4);
assert.equal(apparatusMatches,0);
assert.equal(unitDefects,4);
assert.equal(markerDivergences,4);
assert.equal(markerMatches,0);
assert.equal(memorylessDivergences,0);
assert.equal(memorylessMatches,4);
assert.equal(resetDivergences,0);
assert.equal(resetMatches,4);
assert.deepEqual(targetRows,[
  {start:'00',AB:[1,1],BA:[1,0],hamming_Xi:1,marker_AB:1,marker_BA:0},
  {start:'01',AB:[1,0],BA:[1,1],hamming_Xi:1,marker_AB:0,marker_BA:1},
  {start:'10',AB:[0,0],BA:[0,1],hamming_Xi:1,marker_AB:0,marker_BA:1},
  {start:'11',AB:[0,1],BA:[0,0],hamming_Xi:1,marker_AB:1,marker_BA:0},
]);

// The commuting negative control must stay completely flat under order reversal.
let controlExecutions=0,controlComparisons=0,controlApparatusDivergences=0,controlMarkerDivergences=0;
const controlRows=[];
for(const start of STARTS){
  const cd=apply(start,[C,D]); controlExecutions+=1;
  const dc=apply(start,[D,C]); controlExecutions+=1;
  controlComparisons+=1;
  if(!same(cd,dc)) controlApparatusDivergences+=1;
  if(marker(cd)!==marker(dc)) controlMarkerDivergences+=1;
  controlRows.push({start:id(start),CD:cd,DC:dc,hamming_Xi:hamming(cd,dc),marker_equal:marker(cd)===marker(dc)});
}
assert.equal(controlExecutions,8);
assert.equal(controlComparisons,4);
assert.equal(controlApparatusDivergences,0);
assert.equal(controlMarkerDivergences,0);
assert.deepEqual(controlRows,[
  {start:'00',CD:[1,1],DC:[1,1],hamming_Xi:0,marker_equal:true},
  {start:'01',CD:[1,0],DC:[1,0],hamming_Xi:0,marker_equal:true},
  {start:'10',CD:[0,1],DC:[0,1],hamming_Xi:0,marker_equal:true},
  {start:'11',CD:[0,0],DC:[0,0],hamming_Xi:0,marker_equal:true},
]);

// Explicit anti-shortcuts: the future marker is computed from Xi, never from the route label;
// the visible endpoint remains identical, and reset removes the only declared delayed-readout carrier.
const canonicalRoute=fixture.expected_route_steps;
const swappedRoute=['open-practice-case','projection-observe','custody-hold','rest','return'];
assert.notDeepEqual(canonicalRoute,swappedRoute);
assert.equal(endpoint,'returned-practice-capsule');
assert.equal(marker([0,0]),0);
assert.equal(marker([0,1]),1);
assert.equal(marker(reset()),0);

// Only after the independent reconstruction is complete may the child certificate be imported.
const childModule=await import('../app/dome-world/previews/a15-r0/moss-lantern-procedural-memory-order-defect.js');
const cert=childModule.mossLanternProceduralMemoryOrderDefectCertificate();
assert.equal(cert.parent_exact,true);
assert.equal(cert.fixture.fixture_id,fixture.fixture_id);
assert.deepEqual(cert.fixture.canonical_route,canonicalRoute);
assert.deepEqual(cert.fixture.swapped_route,swappedRoute);
assert.equal(cert.target.executions,targetExecutions);
assert.equal(cert.target.comparisons,targetComparisons);
assert.equal(cert.target.visible_endpoint_matches,endpointMatches);
assert.equal(cert.target.visible_endpoint_mismatches,endpointMismatches);
assert.equal(cert.target.apparatus_endpoint_divergences,apparatusDivergences);
assert.equal(cert.target.apparatus_endpoint_matches,apparatusMatches);
assert.equal(cert.target.unit_hamming_apparatus_defects,unitDefects);
assert.equal(cert.target.delayed_marker_divergences,markerDivergences);
assert.equal(cert.controls.memoryless_projection.divergences,memorylessDivergences);
assert.equal(cert.controls.memoryless_projection.matches,memorylessMatches);
assert.equal(cert.controls.apparatus_reset.divergences,resetDivergences);
assert.equal(cert.controls.apparatus_reset.matches,resetMatches);
assert.equal(cert.controls.commutative_pair.executions,controlExecutions);
assert.equal(cert.controls.commutative_pair.comparisons,controlComparisons);
assert.equal(cert.controls.commutative_pair.apparatus_divergences,controlApparatusDivergences);
assert.equal(cert.controls.commutative_pair.marker_divergences,controlMarkerDivergences);
assert.equal(cert.laws.procedural_memory_witness_bounded_fixture,true);
assert.equal(cert.passed,true);

console.log('Ash A15-R0 Moss Lantern procedural-memory order-defect independent hostile passed.');
