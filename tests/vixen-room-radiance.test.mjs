import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildFoldedCuirass} from '../app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs';
import {paintSalonField,buildSalonField}
 from '../app/encyclopedia/vixen-estate/vixen-salon-ambient-field.mjs';
const geometry=()=>buildFoldedCuirass({width:1140,height:550,time:2,sourceIds:['a','b']});
function canvas(){
 const c={calls:[],save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},
  closePath(){},quadraticCurveTo(){this.calls.push(['curve',this.globalAlpha])},ellipse(){},fillRect(){this.calls.push(['gradient',this.globalAlpha])},
  fill(){this.calls.push(['particle',this.globalAlpha])},
  stroke(){this.calls.push(['stroke',this.globalAlpha,this.shadowBlur])},
  createLinearGradient(){return {addColorStop(){}}},
  createRadialGradient(){return {addColorStop(){}}}};
 return c;
}
test('charge crosses a sewn junction on the same cloth path',()=>{
 const m=geometry(),a=buildSalonField(m),lane=a.trails[8];
 const contactTime=(.5-8*.061)/.085;
 const early=buildFoldedCuirass({...m,time:contactTime-.1});
 const crossing=buildFoldedCuirass({...m,time:contactTime});
 const late=buildFoldedCuirass({...m,time:contactTime+.1});
 assert(early.scene.trails[8].phase<.5);
 assert(late.scene.trails[8].phase>.5);
 assert.deepEqual(crossing.scene.trails[8].pulse,crossing.scene.trails[8].contact);
 const zero=buildFoldedCuirass({...m,beatToGeometryGain:0});
 assert.notDeepEqual(zero.scene.trails[8].points,lane.points);
 assert.equal(zero.scene.trails[8].phase,lane.phase);
 const ctx=canvas();assert.strictEqual(paintSalonField(ctx,m),m.scene);
 assert(ctx.calls.filter(x=>x[0]==='stroke').length>25);
 assert(ctx.calls.every(x=>Number.isFinite(x[1])&&x[1]>=0&&x[1]<=1));
 assert(ctx.calls.every(x=>!x[2]));
});
