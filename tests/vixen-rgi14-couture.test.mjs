import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {OPAL_COUTURE_CONTRACT,coutureGeometry,paintOpalineCouture}
 from '../app/encyclopedia/vixen-estate/vixen-opaline-couture-rgi14.mjs';
const root=new URL('../app/encyclopedia/',import.meta.url);
const html=await readFile(new URL('vix-cyb.html',root),'utf8');
const css=await readFile(new URL('vixen-estate/vixen-opaline-couture-rgi14.css',root),'utf8');
function makeCtx(){
 let strokes=0,curves=0,glints=0;
 const gradient=()=>({addColorStop(){}});
 const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){},
  fillRect(){glints++},moveTo(){},lineTo(){},closePath(){},
  bezierCurveTo(){curves++},ellipse(){},stroke(){strokes++},fill(){},
  clearRect(){},createRadialGradient:gradient,createLinearGradient:gradient};
 return {ctx,stat:()=>({strokes,curves,glints})};
}
test('The visual performance carries zero scientific, custodial or authority credit',()=>{
 assert.equal(OPAL_COUTURE_CONTRACT.role,'OPERA_VISUAL_ONLY');
 assert.equal(OPAL_COUTURE_CONTRACT.authority,'NONE');
 assert.equal(OPAL_COUTURE_CONTRACT.other_estates_mutated,0);
 assert.equal(OPAL_COUTURE_CONTRACT.empirical_credit,0);
 assert.equal(OPAL_COUTURE_CONTRACT.experiment_b_flight,'HELD');
 assert.equal(OPAL_COUTURE_CONTRACT.model_carriers,39);
});
test('39 independently computed material ribs and 15 transverse curved seams',()=>{
 const a=coutureGeometry({width:1200,height:690,time:1.7,sourceIds:['W_01','W_02']});
 const b=coutureGeometry({width:1200,height:690,time:1.7,sourceIds:['W_01','W_02']});
 assert.deepEqual(a.ribs,b.ribs);
 assert.equal(a.ribs.length,39);
 assert.deepEqual([a.ribs.filter(x=>x.near).length,a.ribs.filter(x=>x.mid).length,
  a.ribs.filter(x=>!x.near&&!x.mid).length],[6,13,20]);
 assert.equal(a.hoops.length,15);
 assert(a.ribs.every(x=>x.points.length===21));
 assert(a.hoops.every(x=>x.points.length===49));
 assert.equal(a.empirical_credit,0);
});
test('Source changes condition the light while temporal breath remains visual only',()=>{
 const p={width:1200,height:690,time:1.7,sourceIds:['W_01','W_02']};
 const a=coutureGeometry(p);
 const b=coutureGeometry({...p,sourceIds:['W_01','W_03']});
 const c=coutureGeometry({...p,time:5.1});
 assert.notDeepEqual(a.ribs[0].points,b.ribs[0].points);
 assert.notDeepEqual(a.ribs[0].points,c.ribs[0].points);
});
test('The finish is cubic luminous couture, not the rejected rectilinear mesh',()=>{
 const m=coutureGeometry({width:1260,height:670,time:2,sourceIds:['W_01','W_02']});
 const f=makeCtx(),r=paintOpalineCouture(f.ctx,m),stats=f.stat();
 assert.equal(r.rendered,true);
 assert.equal(r.carriers,39);
 assert.equal(r.moire_layers,2);
 assert.equal(r.empirical_credit,0);
 assert(stats.curves>1400,'Apt couture must visibly use smooth Bezier geometry');
 assert(stats.strokes>110,'Independent filament and Arc seams must be painted');
 assert(stats.glints>2,'Localized bounded blooms must actually paint');
});
test('The frontispiece remains above the separate ambient visual costume',()=>{
 assert.match(css,/body\[data-view="overview"\][^{]*#vixenLivingMesh\s*\{[^}]*z-index:0!important/s);
 assert.match(css,/body\[data-view="overview"\][^{]*#view-overview\s*\{[^}]*z-index:2/s);
 assert.match(css,/\.hero-art\s*\{[^}]*z-index:3!important/s);
 assert.match(css,/\.vixen-opaline-couture/);
 assert.match(html,/vixen-opaline-couture-rgi14\.css/);
 assert.match(html,/vixen-opaline-couture-rgi14\.mjs/);
});
test('No plum can be reintroduced through the last architectural skin',()=>{
 assert.match(css,/--vix-black:#070A0E/);
 assert.match(css,/--vix-graphite:#192027/);
 assert.match(css,/--vix-arc:#FFF0A8/);
 assert.match(css,/--vix-hot:#FF329A/);
 assert.match(css,/--vix-electric-lilac:#D7AFFF/);
 assert.doesNotMatch(css,/#[0-9A-Fa-f]{2}(?:1[0-9A-Fa-f]|2[0-9A-Fa-f])(?:3[0-9A-Fa-f]|4[0-9A-Fa-f])/,
  'Do not infer purity from a swatch alone; still verify browser screenshot');
});
test('Reject nonpositive viewport rather than manufacturing geometric evidence',()=>{
 assert.throws(()=>coutureGeometry({width:-1,height:690}),/COUTURE_VIEWPORT_REQUIRED/);
});
