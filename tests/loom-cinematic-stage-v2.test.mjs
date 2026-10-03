import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';
import { webcrypto } from 'node:crypto';
import { FLOWCORE_GLYPH_REGISTRY } from '../app/dome-world/data/flowcore-glyph-semantics-v01.js';
import { compileLoomInstrumentStateView, projectLoomInstrumentStateFrame, mountLoomInstrumentStateView } from '../app/dome-world/holonomy-loom/instrument-state-view.js';

const html=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const product=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v6.css',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js',import.meta.url),'utf8');
const instrument=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js',import.meta.url),'utf8');
const template=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/workspace-template.js',import.meta.url),'utf8');

test('authored Loom composition preserves a cinematic field scene before the builder',()=>{
  assert.match(html,/loom-product-v6\.css/);
  assert.doesNotMatch(html,/ai-workspace\.css|reentry-workspace\.css|loom-product-v[34]\.css|ux-repair\.css|cinematic-rescue\.css|dromological-regime\.css|cinematic-stage-v2\.css/);
  const doc=new JSDOM(loomWorkspaceTemplate).window.document;
  const stage=doc.querySelector('.loom-stage');
  const builderShell=doc.querySelector('.loom-builder-shell');
  const surface=doc.querySelector('.loom-working-surface');
  assert.ok(stage.contains(doc.querySelector('#aiRuntimeState')));
  assert.ok(!stage.contains(doc.querySelector('#aiTask')));
  assert.ok(surface.contains(doc.querySelector('#aiTask')));
  assert.ok(stage.compareDocumentPosition(builderShell) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(doc.querySelector('#loomBegin'));
  assert.ok(doc.querySelector('.loom-hero-route'));
  assert.ok(doc.querySelector('dialog#loomTools'));
  assert.match(product,/#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 52px\)/);
});

test('one coordinator remains the animation owner',()=>{
  assert.equal((workspace.match(/new AnimationCoordinator\(/g)||[]).length,1);
  assert.match(instrument,/owns_animation_loop: false/);
  assert.doesNotMatch(product,/@keyframes|animation\s*:/);
  for(const source of [product,template,instrument])assert.doesNotMatch(source,/requestAnimationFrame|setInterval\s*\(|fetch\s*\(|XMLHttpRequest|WebSocket/);
});

test('mobile preserves all 39 evidenced carriers and every depth plane through the same canonical frame',async()=>{
  const view=await compileLoomInstrumentStateView({
    phase:'pending',at:'2026-10-03T04:26:18.000Z',request_id:'synthetic-cinematic-relation',
    shared:1,local:1,selected_document_ids:['fictional-brief'],scene:{id:'ai-pending',rules_count:2},
    outbound_submitted:true,response_received:false,binding_verified:true
  },{sourceRevision:'working-tree',cryptoImpl:webcrypto});
  assert.deepEqual(Object.values(view.relations).map(item=>item.glyph),Object.values(FLOWCORE_GLYPH_REGISTRY.entries).map(item=>item.glyph));
  const mobile=projectLoomInstrumentStateFrame(view,{progress:.5,viewport:{width:390,height:300,dpr:1},reducedMotion:false});
  const desktop=projectLoomInstrumentStateFrame(view,{progress:.5,viewport:{width:1363,height:936,dpr:1},reducedMotion:false});
  const still=projectLoomInstrumentStateFrame(view,{progress:.5,viewport:{width:390,height:300,dpr:1},reducedMotion:true});
  assert.equal(mobile.descriptor.glyph,FLOWCORE_GLYPH_REGISTRY.entries.release.glyph);
  assert.equal(mobile.descriptor.glyph,desktop.descriptor.glyph);
  assert.equal(mobile.descriptor.glyph,still.descriptor.glyph,'viewport and rest change demand, never invent a new relation');
  assert.equal(view.scheduler.owns_animation_loop,false);
  assert.equal(view.custody_admission_credit,0);
  assert.equal(view.empirical_credit,0);
  const dom = new JSDOM('<div id="field"></div>');
  const root = dom.window.document.querySelector('#field');
  const renderer = mountLoomInstrumentStateView(root);
  const planeCounts = [];
  for (const width of [390, 1363]) {
    renderer.update(view, { progress: .5, timeMs: 2000, motionTimeMs: 2000, viewport: { width, height: 844, dpr: 1 } });
    const carriers = [...root.querySelectorAll('.loom-field-flight text')];
    assert.equal(carriers.length, 39);
    assert.ok(carriers.every(node => node.style.display !== 'none' && node.getAttribute('visibility') === 'visible' && node.dataset.flightRelation === 'release'));
    planeCounts.push(Object.fromEntries(['flight-near','flight-mid','flight-far'].map(plane => [plane, carriers.filter(node => node.classList.contains(plane)).length])));
    assert.ok(Object.values(planeCounts.at(-1)).every(count => count > 0));
  }
  assert.deepEqual(planeCounts[0], planeCounts[1], 'portrait preserves the whole depth distribution');
  renderer.destroy();dom.window.close();
});

test('finite canonical consequences move current carriers and selected source markers while local material stays separate', async () => {
  const dom = new JSDOM('<div id="field"></div>');
  const root = dom.window.document.querySelector('#field'), renderer = mountLoomInstrumentStateView(root);
  const gathering = { phase: 'prepared', task_present: true, at: '2026-10-03T10:00:00.000Z',
    request_id: 'practice-finite', shared: 2, local: 1, selected_document_ids: ['brief','source'],
    outbound_submitted: false, response_received: false, binding_verified: false,
    scene: { id: 'first-crossing-prepared', rules_count: 1, documents: [{id:'brief'},{id:'source'},{id:'private'}] } };
  const ready = { ...gathering, phase: 'checking', binding_verified: true, at: '2026-10-03T10:00:01.000Z', scene: {...gathering.scene,id:'first-crossing-checking'} };
  const snapshot = (packet, progress, reducedMotion = false) => ({ packet, progress, timeMs: progress*4000, motionTimeMs: progress*4000,
    reducedMotion, viewport: { width: 390, height: 844, dpr: 1 } });
  const sources = () => Object.fromEntries([...root.querySelectorAll('.loom-field-sources [data-source-id]')].map(node => [node.dataset.sourceId,node.getAttribute('transform')]));
  const carriers = () => [...root.querySelectorAll('.loom-field-flight text')].map(node => ({relation:node.dataset.flightRelation,x:Number(node.getAttribute('x')),y:Number(node.getAttribute('y'))}));
  const gathered = await compileLoomInstrumentStateView(gathering,{cryptoImpl:webcrypto});
  renderer.update(gathered,snapshot(gathering,0));
  const initial = carriers(), sourceInitial = sources();
  renderer.update(gathered,snapshot(gathering,.5));
  const halfway = carriers(), sourceHalfway = sources();
  assert.ok(halfway.every((node,index) => Math.hypot(node.x-initial[index].x,node.y-initial[index].y)>40));
  assert.notEqual(sourceHalfway.brief,sourceInitial.brief);
  assert.notEqual(sourceHalfway.source,sourceInitial.source);
  assert.equal(sourceHalfway.private,sourceInitial.private);
  assert.equal(root.querySelector('[data-source-id="private"]').dataset.sourceLocal,'true');
  assert.match(root.querySelector('[data-source-id="private"]').textContent,/cōl/);
  const bound = await compileLoomInstrumentStateView(ready,{eventHistory:[gathering,ready],cryptoImpl:webcrypto});
  renderer.update(bound,snapshot(ready,0));
  const potentialInitial=carriers();
  renderer.update(bound,snapshot(ready,.5));
  assert.ok(carriers().every((node,index)=>node.relation==='created_potential'&&node.y<potentialInitial[index].y-200),'previous gathering cannot masquerade as current readiness');
  renderer.update(bound,snapshot(ready,.5,true));
  const staticCoordinates=carriers();
  renderer.update(bound,snapshot(ready,1,true));
  assert.deepEqual(carriers(),staticCoordinates,'reduced motion has a complete stable equivalent');
  assert.equal(root.querySelector('[data-instrument-active-glyph]').textContent,'上');
  assert.equal(bound.empirical_credit,0);
  renderer.destroy();dom.window.close();
});
