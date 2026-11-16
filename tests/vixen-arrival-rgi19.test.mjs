import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {inspectOperaArrival,VIXEN_ARRIVAL_CONTRACT} from '../app/encyclopedia/vixen-estate/vixen-arrival-prewarm-rgi19.mjs';

const html=readFileSync('app/encyclopedia/vix-cyb.html','utf8');
const engine=readFileSync('app/encyclopedia/vixen-estate/vixen-arrival-prewarm-rgi19.mjs','utf8');
const mesh=readFileSync('app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs','utf8');
const foundry=readFileSync('app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs','utf8');
const viewIDs=['overview','observatory','works','gates','protocols','holds','collection','reference'];
const happyDoc={
 querySelector(selector){
  if(selector.includes('hero-art img'))return {complete:true,naturalWidth:3840};
  return {tagName:'SECTION'};
 }
};
const happyWindow={VixenLivingMesh:{mounted:true},
 VIXEN_ELECTRIC_FOUNDRY:{status:()=>({backend:'WEBGL2'})}};
test('RGI19 readiness census covers the native 8/8 Opera rooms',()=>{
 const x=inspectOperaArrival(happyDoc,happyWindow);
 assert.equal(x.ready_count,8);
 assert.equal(x.all_rooms_materialized,true);
 assert.equal(x.critical_presentation_ready,true);
 assert.equal(x.observatory_gpu_prepared,true);
 assert.deepEqual(Object.keys(x.rooms),viewIDs);
 assert.equal(x.scientific_promotion_authority,false);
 assert.equal(x.corpus_mutation,false);
});
test('RGI19 refuses to claim readiness on missing Opera surfaces',()=>{
 const incomplete={querySelector(sel){
  if(sel.includes('vixenReferenceChamber'))return null;
  return happyDoc.querySelector(sel);
 }};
 const report=inspectOperaArrival(incomplete,happyWindow);
 assert.equal(report.ready_count,7);
 assert.equal(report.critical_presentation_ready,false);
 assert.equal(report.rooms.reference,false);
 assert.equal(report.scientific_promotion_authority,false);
});
test('RGI19 requires finished first illustration and one persistent mesh',()=>{
 const fake={...happyDoc,querySelector(sel){
  if(sel.includes('hero-art img'))return {complete:true,naturalWidth:0};
  return {tagName:'SECTION'};
 }};
 assert.equal(inspectOperaArrival(fake,happyWindow).cover_decoded,false);
 assert.equal(inspectOperaArrival(happyDoc,{}).critical_presentation_ready,false);
});
test('RGI19 warms static modules and first illustration from landing, without duplicating source engine',()=>{
 assert.equal(VIXEN_ARRIVAL_CONTRACT.rooms,8);
 assert.match(html,/vixen-arrival-prewarm-rgi19\.mjs/);
 assert.match(html,/VIXEN_BOOT_HYDRATION = hydrateExperimentAModules\(\)\.then/);
 assert.match(html,/rel="modulepreload" href="\.\/vixen-estate\/manuscript-reader\.mjs"/);
 assert.match(html,/rel="preload" as="image" href="\.\/assets\/vixen\/frontispiece-desktop\.png"/);
 assert.match(html,/rel="preload" as="image" href="\.\/assets\/vixen\/frontispiece-mobile\.png"/);
 assert.match(engine,/maximum_entry_hold_ms:3100/);
 assert.match(engine,/EIGHT_ROOMS_PREPARED/);
 assert.match(engine,/BOUNDED_FAIL_OPEN/);
 assert.match(engine,/coverPrepared&&fontsPrepared/);
});
test('RGI19 does not reinitialize GPU work or fragment the living cloth per route',()=>{
 assert.match(foundry,/requestIdleCallback\(prewarm/);
 assert.match(foundry,/state\.initialized=true/);
 assert.match(mesh,/if\(doc\.getElementById\('vixenLivingMesh'\)\)/);
 assert.match(mesh,/AWAITING_HOST_HELD_LAST_FRAME/);
 assert.match(mesh,/win\.addEventListener\('scroll',onOuterScroll/);
 assert.match(html,/scrollPersistTimer = setTimeout/);
 assert.doesNotMatch(html,/scrollPersistRaf/);
});
test('RGI19 conserves existing research jurisdiction',()=>{
 assert.match(engine,/OPERAHOUSE ≠ OPERA ≠ PERFORMER/);
 assert.equal(VIXEN_ARRIVAL_CONTRACT.source_mutation,false);
 assert.equal(VIXEN_ARRIVAL_CONTRACT.authorization,false);
 assert.equal(VIXEN_ARRIVAL_CONTRACT.autonomous_action,false);
 assert.match(engine,/background_animation_while_hidden:false/);
});
