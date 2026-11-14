import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildFoldedCuirass,paintFoldedCuirass,CUIRASS_POLICY} from '../app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs';
import {buildSalonField,paintSalonField,SALON_FIELD_POLICY} from '../app/encyclopedia/vixen-estate/vixen-salon-ambient-field.mjs';
const fixture={width:1120,height:540,time:3,sourceIds:['vixen_work_a','vixen_work_b']};
const ctx=()=>({globalCompositeOperation:'source-over',globalAlpha:1,
 save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},
 clearRect(){},setTransform(){},ellipse(){},fill(){},stroke(){},fillRect(){},
 createLinearGradient(){return {addColorStop(){}}},createRadialGradient(){return {addColorStop(){}}}});
test('one clock and shared D3/phi pairs produce deterministic page-wide conductor lattice',()=>{
 const m=buildFoldedCuirass(fixture),a=buildSalonField(m),b=buildSalonField(m);
 assert.deepEqual(a,b);
 assert.equal(a.metadata.clock_source,'FOLDED_CUIRASS_SHARED');
 assert.equal(a.metadata.pairs,m.field.pairs.length);
 assert.equal(a.trails.length,SALON_FIELD_POLICY.tracks);
 assert(a.trails.some(t=>t.points[0][0]<0));
 assert(a.trails.some(t=>t.points.at(-1)[0]>m.width));
 assert(m.cx>m.width*.65 && m.cx<m.width*.85);
 assert.equal(paintSalonField(ctx(),m).trails.length,SALON_FIELD_POLICY.tracks);
 for(const t of a.trails){
  assert.strictEqual(t.contact,m.latticeNodes[t.junctionId].point);
  assert.strictEqual(t.points[32],t.contact);
 }
 const vertices=new Set(a.trails.flatMap(t=>t.points));
 for(const e of a.crossings)assert(e.points.every(p=>vertices.has(p)));
 const changed=buildSalonField(buildFoldedCuirass({...fixture,time:4}));
 assert.notDeepEqual(a.trails,changed.trails);
});
test('one visible chrome compositor retains aggregate screen emission and source custody',()=>{
 const m=buildFoldedCuirass(fixture),out=paintFoldedCuirass(ctx(),m);
 assert.equal(out.carriers,39);
 assert.equal(out.sceneTracks,SALON_FIELD_POLICY.tracks);
 assert(out.sceneNodes>0);
 assert(out.emissionAlpha<=CUIRASS_POLICY.total_emission_alpha+1e-8);
});
test('Salon CSS integrates optical stage without obscuring mobile source copy',()=>{
 const css=readFileSync(new URL('../app/encyclopedia/vixen-estate/synthesis-salon.css',import.meta.url),'utf8');
 assert(css.includes('position:absolute;inset:0;z-index:1'));
 assert(css.includes('width:56%;max-width:775px'));
 assert(css.includes('position:relative;inset:auto;flex:none;min-height:340px'));
 assert(!css.includes('animation:spin'));
});
