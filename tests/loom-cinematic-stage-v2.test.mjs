import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';
import { webcrypto } from 'node:crypto';
import { FLOWCORE_GLYPH_REGISTRY } from '../app/dome-world/data/flowcore-glyph-semantics-v01.js';
import { compileLoomInstrumentStateView, projectLoomInstrumentStateFrame } from '../app/dome-world/holonomy-loom/instrument-state-view.js';

const html=fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html',import.meta.url),'utf8');
const product=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v5.css',import.meta.url),'utf8');
const workspace=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js',import.meta.url),'utf8');
const instrument=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js',import.meta.url),'utf8');
const template=fs.readFileSync(new URL('../app/dome-world/holonomy-loom/workspace-template.js',import.meta.url),'utf8');

test('authored Loom composition pairs the working task and field without the old override cascade',()=>{
  assert.match(html,/loom-product-v5\.css/);
  assert.doesNotMatch(html,/ai-workspace\.css|reentry-workspace\.css|loom-product-v[34]\.css|ux-repair\.css|cinematic-rescue\.css|dromological-regime\.css|cinematic-stage-v2\.css/);
  const doc=new JSDOM(loomWorkspaceTemplate).window.document;
  const surface=doc.querySelector('.loom-working-surface');
  assert.ok(surface.contains(doc.querySelector('#aiRuntimeState')));
  assert.ok(surface.contains(doc.querySelector('#aiTask')));
  assert.ok(doc.querySelector('dialog#loomTools'));
  assert.doesNotMatch(product,/(?:min-)?height\s*:\s*calc\(100(?:s|d)?vh\s*-\s*(?:48|52)px\)/);
});

test('one coordinator remains the animation owner',()=>{
  assert.equal((workspace.match(/new AnimationCoordinator\(/g)||[]).length,1);
  assert.match(instrument,/owns_animation_loop: false/);
  assert.doesNotMatch(product,/@keyframes|animation\s*:/);
  for(const source of [product,template,instrument])assert.doesNotMatch(source,/requestAnimationFrame|setInterval\s*\(|fetch\s*\(|XMLHttpRequest|WebSocket/);
});

test('mobile reduces decorative mutation density without changing evidenced relation grammar',async()=>{
  assert.match(instrument,/const filamentCount = compact \? 10 : filaments\.length/);
  assert.match(instrument,/const particleCount = compact \? 12 : particles\.length/);
  assert.match(instrument,/const flightCount = compact \? 12 : flightGlyphs\.length/);
  assert.match(instrument,/const depthCount = compact \? 4 : depth\.length/);
  assert.match(instrument,/FLOWCORE_GLYPH_REGISTRY/);
  assert.match(instrument,/event_relation_history: eventRelationHistory/);
  assert.match(instrument,/view\.event_relation_history/);
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
});
