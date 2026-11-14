/**
 * RGI11 optical acceptance: actual mathematical sampling and source/route
 * interaction, not a CSS-only "Glinda" label. Human aesthetic adjudication
 * remains separate from these deterministic engineering checks.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CARRIERS} from '../app/encyclopedia/vixen-estate/observatory-foundry-kernel.mjs';
import {
 GLINDA_LIGHT,VEIL_CONTRACT,makeVeilFrame
} from '../app/encyclopedia/vixen-estate/vixen-salon-light.mjs';
const root=new URL('../app/encyclopedia/',import.meta.url);
const html=await readFile(new URL('vix-cyb.html',root),'utf8');
const salon=await readFile(new URL('vixen-estate/synthesis-salon.mjs',root),'utf8');
const couture=await readFile(new URL('vixen-estate/glinda-spectacle-rgi11.css',root),'utf8');
const shader=await readFile(new URL('vixen-estate/observatory-foundry.frag',root),'utf8');

function fakeCanvas(){
 const steps=[];
 const gradient=()=>({addColorStop:(...a)=>steps.push(['stop',...a])});
 const ctx={
  setTransform:(...a)=>steps.push(['transform',...a]),clearRect:()=>{},
  createRadialGradient:gradient,createLinearGradient:gradient,
  save:()=>{},restore:()=>{},beginPath:()=>{},stroke:()=>{},fillRect:()=>{},
  ellipse:(...a)=>steps.push(['ellipse',...a]),
  moveTo:(...a)=>steps.push(['move',...a]),
  lineTo:(...a)=>steps.push(['line',...a]),
  bezierCurveTo:(...a)=>steps.push(['curve',...a])
 };
 const canvas={
  width:880,height:560,
  ownerDocument:{defaultView:{devicePixelRatio:1}},
  getBoundingClientRect:()=>({width:880,height:560}),
  getContext:(mode)=>mode==='2d'?ctx:null
 };
 return {canvas,steps};
}
test('A Vixen optical performer can borrow four real mathematical engine families without inheriting their authority',()=>{
 assert.equal(VEIL_CONTRACT.subject,'TWO_DECLARED_VIXEN_WORK_COORDINATES_ONLY');
 assert.deepEqual(VEIL_CONTRACT.optical_sources,
  ['DOME_ART_D3','DOME_ART_PHI','LOOM_39','COUTURE_111']);
 assert.equal(VEIL_CONTRACT.empirical_credit,0);
 assert.equal(VEIL_CONTRACT.experiment_b_flight,'HELD');
 assert.equal(VEIL_CONTRACT.cross_estate_performer_promotion,false);
 assert.deepEqual([CARRIERS.filter(x=>x.near).length,
  CARRIERS.filter(x=>x.mid).length,CARRIERS.filter(x=>x.far).length],[6,13,20]);
});
test('Source selection, route and synthetic lag actually alter deterministic optical geometry',()=>{
 const one=fakeCanvas(),two=fakeCanvas(),three=fakeCanvas(),repeat=fakeCanvas();
 const input={works:['W_01','W_02'],route:'A_B',lag:20,time:0};
 const a=makeVeilFrame({canvas:one.canvas,...input});
 const same=makeVeilFrame({canvas:repeat.canvas,...input});
 const b=makeVeilFrame({canvas:two.canvas,works:input.works,route:'B_A',lag:110,time:0});
 const c=makeVeilFrame({canvas:three.canvas,works:['W_17','W_02'],route:'A_B',lag:20,time:0});
 assert.equal(a.carriers,39);
 assert.equal(a.arc_glints,8,'Six near-Loom carriers and two separately recorded source endpoints form eight computed sparks');
 assert.equal(a.modeled_couture_ribs,24,'Two source-distinct geometric corset ribs per one of twelve silhouette stations');
 assert.deepEqual(a,same);
 assert.deepEqual(one.steps,repeat.steps);
 assert.notDeepEqual(one.steps,two.steps);
 assert.notDeepEqual(one.steps,three.steps);
 assert(b.arc_charge>a.arc_charge,'More synthetic lag increases opportunity for the declared Arc Flash event');
 assert(one.steps.filter(x=>x[0]==='curve').length>=75,'Loom carriers and 36 explicit couture Beziers must have real computed geometry');
 assert(one.steps.filter(x=>x[0]==='line').length>100,'D3/phi computed curves must have real vector topology');
 assert.equal(c.empirical_credit,0);
});
test('The visual engine rejects ungrounded work coordinates instead of constructing fictitious Performers',()=>{
 const {canvas}=fakeCanvas();
 assert.throws(()=>makeVeilFrame({canvas,works:['W_ONE']}),/TWO_WORK_IDS/);
 assert.throws(()=>makeVeilFrame({canvas,works:[null,'W_TWO']}),/TWO_WORK_IDS/);
});
test('Distinct electric pink and pearl with champagne Arc Flash survive the palette repair',()=>{
 assert.equal(GLINDA_LIGHT.rose,'#FF65AA');
 assert.equal(GLINDA_LIGHT.pearl,'#FFF8F0');
 assert.equal(GLINDA_LIGHT.electricPink,'#FF6AAE');
 assert.equal(GLINDA_LIGHT.arcFlash,'#FFF2A9');
 assert.notEqual(GLINDA_LIGHT.arcFlash,GLINDA_LIGHT.electricPink);
 assert.match(couture,/--arc-blonde:#FFF2A9/);
 assert.match(couture,/--arc-white:#FFFBE2/);
 assert.match(shader,/vec3 arcFlash=vec3\(1\.,\.9490,\.6627\)/);
 assert.match(html,/--arc-flash:#F9F36D/,'Original versioned Arc Flash remains recoverable');
});
test('Live Salon keeps the legacy optical contract and mounts one folded computational costume',()=>{
 assert.match(html,/glinda-spectacle-rgi11\.css/);
 assert.match(salon,/import \{mountSalonVeil,VEIL_CONTRACT\}/);
 assert.match(salon,/import \{SALON_COMPOSITOR,mountFoldedCuirass,CUIRASS_CONTRACT\}/);
 assert.match(salon,/const folded=SALON_COMPOSITOR==='FOLDED_CHROME'/);
 assert.match(salon,/veil\.dataset\.computation=folded\?'D3_PHI_BEAT_FOLDED_SHELL':'D3_PHI_LOOM_39_COUTURE_111'/);
 assert.match(salon,/veilHandle=folded\?mountFoldedCuirass\(veil,veilCoordinates\):mountSalonVeil\(veil,veilCoordinates\)/);
 assert.match(salon,/veilHandle\?\.dispose\?\.\(\)/,'Unavailable Canvas2D host must not break source interaction');
 assert.doesNotMatch(salon,/🩰|🚬/);
 assert.match(salon,/host\.dataset\.opticalContract=folded\?CUIRASS_CONTRACT\.schema:VEIL_CONTRACT\.schema/);
});
