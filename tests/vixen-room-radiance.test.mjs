import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildFoldedCuirass} from '../app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs';
import {paintSalonField,buildSalonField,SALON_FIELD_POLICY}
 from '../app/encyclopedia/vixen-estate/vixen-salon-ambient-field.mjs';
const geometry=()=>buildFoldedCuirass({width:1140,height:550,time:2,sourceIds:['a','b']});
function canvas(){
 const c={calls:[],save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},
  closePath(){},ellipse(){},fillRect(){this.calls.push(['gradient',this.globalAlpha])},
  fill(){this.calls.push(['particle',this.globalAlpha])},
  stroke(){this.calls.push(['stroke',this.globalAlpha,this.shadowBlur])},
  createLinearGradient(){return {addColorStop(){}}},
  createRadialGradient(){return {addColorStop(){}}}};
 return c;
}
test('field geometry remains derived, finite, deterministic and bounded',()=>{
 const m=geometry(),a=buildSalonField(m),b=buildSalonField(m);
 assert.deepEqual(a,b);
 assert.equal(a.trails.length,SALON_FIELD_POLICY.tracks);
 const ctx=canvas(),out=paintSalonField(ctx,m);
 assert.equal(out.trails.length,18);
 assert(ctx.calls.filter(x=>x[0]==='stroke').length>=60);
 assert(ctx.calls.filter(x=>x[0]==='particle').length>=out.nodes.length);
 assert(ctx.calls.every(x=>Number.isFinite(x[1])&&x[1]>=0&&x[1]<=1));
 assert(ctx.calls.filter(x=>x[2]>0).every(x=>x[2]<=18));
 assert.notDeepEqual(a.trails,buildSalonField({...m,time:3}).trails);
});
test('no new clock, random source inference, or unbounded glow',()=>{
 const s=readFileSync(new URL('../app/encyclopedia/vixen-estate/vixen-salon-ambient-field.mjs',import.meta.url),'utf8');
 for(const denied of ['requestAnimationFrame(','setInterval(','Math.random('])assert(!s.includes(denied));
 assert(s.includes('Math.min(12,4+13*power)'));
 assert(s.includes('Math.min(18,H*.025)'));
});
