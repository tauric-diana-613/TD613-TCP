import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=n=>readFileSync(new URL('../app/encyclopedia/vixen-estate/'+n,import.meta.url),'utf8');
test('full-page Salon mesh is driven by its existing clock, without another RAF',()=>{
 const mesh=read('vixen-live-mesh-rgi13.mjs'),salon=read('vixen-folded-cuirass.mjs');
 assert(mesh.includes('renderHostFrame:'));
 assert(mesh.includes('now-lastHostFrameMs<180'));
 assert(mesh.includes("HOST_FRAME"));
 assert(salon.includes('VixenLivingMesh?.renderHostFrame?.({time:clock.time'));
 assert(!mesh.includes('requestAnimationFrame(renderHostFrame)'));
});
test('Observatory opt-in inherits its host clock and is disabled by default',()=>{
 const f=read('observatory-electric-foundry.mjs'),css=read('vixen-electrical-breath-rgi13.css');
 assert(f.includes("dataset.vixenOpticalMeshObservatory==='on'"));
 assert(f.includes("renderHostFrame?.({time:state.time,view:'observatory',sourceIds:[]})"));
 assert(css.includes('data-vixen-optical-mesh-observatory="on"'));
});
