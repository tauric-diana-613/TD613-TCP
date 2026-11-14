import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildFoldedCuirass,sampleCuirassFields,paintFoldedCuirass,coutureBackingSize,
 mountFoldedCuirass,CUIRASS_POLICY} from '../app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs';
const html=readFileSync(new URL('../app/encyclopedia/vix-cyb.html',import.meta.url),'utf8');
const corpus=JSON.parse(html.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
const sourceIds=corpus.works.slice(1,3).map(w=>w.work_id);
const params={width:550,height:460,time:2,sourceIds};
const approx=(a,b,e=1e-8)=>assert(Math.abs(a-b)<=e,`${a} / ${b}`);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function context(){
 const calls=[],gradient=()=>({addColorStop(){}});
 return {calls,globalAlpha:1,globalCompositeOperation:'source-over',
  save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},ellipse(){},
  clearRect(){},setTransform(){},createLinearGradient:gradient,createRadialGradient:gradient,
  fill(){calls.push({op:'fill',mode:this.globalCompositeOperation,alpha:this.globalAlpha});},
  fillRect(){calls.push({op:'rect',mode:this.globalCompositeOperation,alpha:this.globalAlpha});},
  stroke(){calls.push({op:'stroke',mode:this.globalCompositeOperation,alpha:this.globalAlpha});}};
}
test('separate carrier fields and analytic beat gradient agree with central differences',()=>{
 const m=buildFoldedCuirass(params),x=18,y=33,dt=1e-4;
 const f=sampleCuirassFields(m.field.pairs,x,y,2);
 assert.notEqual(f.d3,f.phi);
 const s=(x,y)=>sampleCuirassFields(m.field.pairs,x,y,2).beat;
 approx(f.gradient[0],(s(x+dt,y)-s(x-dt,y))/(2*dt),1e-7);
 approx(f.gradient[1],(s(x,y+dt)-s(x,y-dt))/(2*dt),1e-7);
});
test('geometry-only refraction moves contours, seams and filaments while glints stay identical',()=>{
 const a=buildFoldedCuirass(params),repeat=buildFoldedCuirass(params);
 const b=buildFoldedCuirass({...params,beatToGeometryGain:0});
 assert.deepEqual(a,repeat);assert.deepEqual(a.glints,b.glints);
 const drift=Math.max(...a.grid.flat().map((v,i)=>distance(v.screen,repeat.grid.flat()[i].screen)));
 const displacement=Math.max(...a.grid.flat().map((v,i)=>distance(v.screen,b.grid.flat()[i].screen)));
 assert.equal(drift,0);assert(displacement>2);
 assert(Math.abs(a.metrics.seamLength-b.metrics.seamLength)>1);
 assert(Math.abs(a.metrics.filamentLength-b.metrics.filamentLength)>1);
 assert(Math.abs(a.metrics.contourWidth-b.metrics.contourWidth)>.1);
 assert.equal(a.faces.length>900,true);assert.equal(a.seams.length,12);
 assert.equal(a.filaments.length,39);
});
test('finite source/time sweep retains closed, monotonic shell and viewport clearance',()=>{
 for(const [width,height] of [[550,460],[350,390]])for(const time of [0,8]){
  for(let k=0;k<corpus.works.length;k+=4){
   const sourceIds=[corpus.works[k].work_id,corpus.works[(k+3)%32].work_id];
   const m=buildFoldedCuirass({width,height,time,sourceIds});
   assert(m.bounds.left>0&&m.bounds.right<width&&m.bounds.top>0&&m.bounds.bottom<height-24);
   for(let j=0;j<=32;j++)m.grid[0][j].p.forEach((v,i)=>approx(v,m.grid[72][j].p[i]));
   for(const row of m.grid)for(let j=1;j<row.length;j++)assert(row[j].p[1]>row[j-1].p[1]);
   // Angular order of each cross section must stay positive (no fold-over).
   for(let j=0;j<=32;j++)for(let i=1;i<72;i++){
    const a=m.grid[i-1][j].p,b=m.grid[i][j].p;
    assert(a[2]*b[0]-a[0]*b[2]>0);
   }
  }
 }
});
test('Work change affects geometry and responsive projection preserves the same material cut',()=>{
 const a=buildFoldedCuirass(params);
 const b=buildFoldedCuirass({...params,sourceIds:[sourceIds[0],corpus.works[8].work_id]});
 assert.notDeepEqual(a.grid,b.grid);
 const mobile=buildFoldedCuirass({...params,width:350,height:390});
 assert.deepEqual(a.grid.map(r=>r.map(v=>v.p)),mobile.grid.map(r=>r.map(v=>v.p)));
});
test('Canvas command smoke: filled surfaces and total emissive draw allocation stay bounded',()=>{
 const m=buildFoldedCuirass(params),ctx=context();
 const r=paintFoldedCuirass(ctx,m);
 assert(r.rendered&&r.faces>900);
 assert(ctx.calls.filter(c=>c.op==='fill'&&c.mode==='source-over').length>900);
 const allocated=ctx.calls.filter(c=>c.mode==='screen').reduce((n,c)=>n+c.alpha,0);
 assert(allocated<=CUIRASS_POLICY.total_emission_alpha+1e-8);
 assert(m.glints.every(p=>p.bloomRadius<=18));assert(m.glints.length<=11);
 const off=context();paintFoldedCuirass(off,m,{optics:false});
 assert.equal(off.calls.length,1);assert.equal(off.calls[0].op,'rect');
});
test('backing resolution follows DPR under a 1.5M pixel ceiling',()=>{
 for(const [w,h] of [[550,460],[350,390],[4000,3000]]){
  const a=coutureBackingSize(w,h,1),b=coutureBackingSize(w,h,2);
  assert(b.width*b.height<=1500000);assert(b.dpr<=1.25);
  if(w*h<1000000)assert(b.width>a.width&&b.height>a.height);
 }
 assert.throws(()=>coutureBackingSize(0,100));
});
test('single clock settles in Still/Rest/reduced motion and invalidates paused DPR and Work changes',()=>{
 const events=new Map(),raf=new Map(),media=[],observers=[];
 let id=0,still=true,source=[...sourceIds],resting=false;
 const mq=key=>{const m={key,matches:false,addEventListener:(_,f)=>m.cb=f,removeEventListener:()=>m.cb=null};media.push(m);return m;};
 class Observer{constructor(cb){this.cb=cb;observers.push(this)}observe(){}disconnect(){}}
 const doc={hidden:false,body:{dataset:{view:'collection'}},getElementById:()=>({getAttribute:()=>String(still)}),
  addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
 const win={devicePixelRatio:1,performance:{now:()=>performance.now()},matchMedia:mq,
  requestAnimationFrame:f=>{raf.set(++id,f);return id},cancelAnimationFrame:i=>raf.delete(i),
  IntersectionObserver:Observer,ResizeObserver:Observer,MutationObserver:Observer,
  addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)};
 doc.defaultView=win;const ctx=context();
 const canvas={ownerDocument:doc,width:0,height:0,clientWidth:550,getContext:()=>ctx,
  getBoundingClientRect:()=>({width:550,height:460})};
 const opticalClock={time:0};
 const handle=mountFoldedCuirass(canvas,()=>({works:source,resting,opticalClock}));
 const frame=ms=>{const c=[...raf.values()];raf.clear();c.forEach(f=>f(ms));};
 observers[0].cb([{isIntersecting:true}]);frame(0);
 assert.equal(handle.getStatus().frames,1);assert.equal(raf.size,0);
 source=[source[0],corpus.works[8].work_id];handle.renderOnce();frame(10);
 assert.equal(handle.getStatus().frames,2);assert.deepEqual(handle.getStatus().last.sourceIds,source);assert.equal(raf.size,0);
 win.devicePixelRatio=2;media.at(-1).cb();frame(20);
 assert.equal(canvas.width,687);assert.equal(raf.size,0);
 still=false;observers[2].cb();frame(30);frame(80);frame(130);
 assert(opticalClock.time>0);assert.equal(raf.size,1);
 resting=true;handle.renderOnce();frame(140);const phase=opticalClock.time;
 assert.equal(raf.size,0);assert.equal(handle.getStatus().last.phase,phase);
 resting=false;media[0].matches=true;media[0].cb();frame(150);
 assert.equal(raf.size,0);assert.equal(opticalClock.time,phase);
 handle.dispose();assert.equal(raf.size,0);
});
