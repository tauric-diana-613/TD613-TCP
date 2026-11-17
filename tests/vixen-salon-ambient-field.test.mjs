import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildFoldedCuirass,paintFoldedCuirass,CUIRASS_POLICY} from '../app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs';
import {buildSalonField,paintSalonField,SALON_FIELD_POLICY,pointOnFieldPath,chargeSeamEnvelope,traceSilkBeam} from '../app/encyclopedia/vixen-estate/vixen-salon-ambient-field.mjs';
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

test('moving charge is C1-continuous and exactly preserves each sewn sample point',()=>{
 const path=[[0,0,0],[1,1,1],[2,0,0],[3,-1,-1],[4,0,0]];
 for(let i=0;i<path.length;i++){
  const p=pointOnFieldPath(path,i/(path.length-1));
  for(let k=0;k<3;k++)assert(Math.abs(p[k]-path[i][k])<1e-9);
 }
 for(let index=1;index<path.length-1;index++){
  const u=index/(path.length-1),epsilon=1e-5;
  const left=pointOnFieldPath(path,u-epsilon),mid=pointOnFieldPath(path,u),
   right=pointOnFieldPath(path,u+epsilon);
  for(let k=0;k<3;k++){
   const vl=(mid[k]-left[k])/epsilon,vr=(right[k]-mid[k])/epsilon;
   assert(Math.abs(vl-vr)<.001,'particle velocity must remain continuous at vertices');
  }
 }
 assert.throws(()=>pointOnFieldPath([[0,0,0]],.5),/FIELD_PATH_NEEDS_VERTICES/);
});

test('beam wraparound fades continuously rather than teleporting fully lit sparks',()=>{
 for(const phase of [0,1,-1])assert.equal(chargeSeamEnvelope(phase),0);
 assert.equal(chargeSeamEnvelope(.5),1);
 assert(Math.abs(chargeSeamEnvelope(.999)-chargeSeamEnvelope(-.001))<1e-12);
 assert(chargeSeamEnvelope(.02)>0&&chargeSeamEnvelope(.02)<1);
 assert(chargeSeamEnvelope(.04)>chargeSeamEnvelope(.01));
 const scene=buildSalonField(buildFoldedCuirass(fixture));
 assert.equal(scene.trails.length,51);
 assert(scene.nodes.every(node=>node.visibility>=0&&node.visibility<=1));
});

test('desktop and mobile leading beams are silk curves; geometry and source remain unchanged',()=>{
 const points=[[0,0,0],[2,5,1],[5,9,2],[10,8,1],[13,4,0]];
 const moves=[],segments=[];
 traceSilkBeam({moveTo:(...v)=>moves.push(v),
  bezierCurveTo:(...v)=>segments.push(v)},points);
 assert.deepEqual(moves,[[0,0]]);
 assert.equal(segments.length,points.length-1);
 for(let i=0;i<segments.length;i++){
  assert.equal(segments[i][4],points[i+1][0]);
  assert.equal(segments[i][5],points[i+1][1]);
 }
 const strokes=[];
 traceSilkBeam({moveTo:()=>{},lineTo:(...v)=>strokes.push(v)},points);
 assert.equal(strokes.length,points.length-1,'limited canvases retain fallback');
 for(const width of [390,428,1440]){
  const scale=width===1440?900:844;
  const model=buildFoldedCuirass({width,height:scale,time:3,sourceIds:fixture.sourceIds});
  const scene=buildSalonField(model);
  let curved=0,light=0;
  const painter={
   ...ctx(),bezierCurveTo(){curved++},quadraticCurveTo(){light++}
  };
  paintSalonField(painter,model);
  assert.equal(curved,3*(SALON_FIELD_POLICY.points_per_track-1),
   'Only the three bright beams use the expensive smooth curves');
  assert(light>0,'Moving charge tails follow curved geometry');
  assert.equal(scene.trails.length,51);
  assert(scene.contacts.length===scene.trails.length);
 }
});
