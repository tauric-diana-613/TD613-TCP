import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { loomWorkspaceTemplate } from '../app/dome-world/holonomy-loom/workspace-template.js';

const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');
const product = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/loom-product-v6.css', import.meta.url), 'utf8');
const workspaceSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js', import.meta.url), 'utf8');
const instrumentSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js', import.meta.url), 'utf8');
const templateSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/workspace-template.js', import.meta.url), 'utf8');

// These are source/DOM witnesses. Physical-device behavior, viewport geometry,
// provider execution and measured human comprehension require separate evidence.

test('primary Loom is one product route, not a nested laboratory archive', () => {
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('#loomLegacy').length, 0);
  assert.equal(doc.querySelectorAll('.hero,.wrap').length, 0);
  assert.equal(doc.querySelector('a[href="/dome-world/loom-instrument-lab.html"]')?.textContent, 'Lab');
  assert.equal(doc.querySelectorAll('link[href*="ai-workspace.css"],link[href*="reentry-workspace.css"],link[href*="loom-product-v3.css"],link[href*="ux-repair.css"],link[href*="cinematic-rescue.css"],link[href*="dromological-regime.css"]').length,0);
});

test('cinematic route field and builder are separate scenes while advanced tools stay secondary', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  const stage = doc.querySelector('.loom-stage');
  const builderShell = doc.querySelector('.loom-builder-shell');
  const surface = doc.querySelector('.loom-working-surface');
  assert.ok(stage.contains(doc.querySelector('#aiRuntimeState')));
  assert.ok(!stage.contains(doc.querySelector('#aiTask')));
  assert.ok(surface.contains(doc.querySelector('#aiTask')));
  assert.ok(stage.compareDocumentPosition(builderShell) & doc.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.ok(doc.querySelector('#loomBegin'));
  assert.deepEqual([...doc.querySelectorAll('.loom-journey-step strong')].map(node => node.textContent), ['Loom', 'Marrowline', 'Return']);
  assert.equal(builderShell.hidden, true, 'Threshold withholds the builder until the crossing gesture');
  assert.equal(doc.querySelector('#loomBuilder').hidden, false, 'the builder content itself remains intact behind the Threshold');
  assert.equal(doc.querySelector('#aiResult').hidden, true);
  assert.equal(doc.querySelector('#loomReturnWorkspace').hidden, true);
  assert.equal(doc.querySelectorAll('#loomBuilder > details,#aiResult > details').length, 0);
  for (const id of ['aiRules','aiPrivate','aiRuntimeProfile','aiRun','aiChallengeDrawer','aiExport','aiCopy','aiSessionReceipt']) {
    assert.ok(doc.querySelector('#loomTools').contains(doc.querySelector(`#${id}`)), `${id} remains accessible in secondary tooling`);
  }
  assert.match(workspaceSource, /root\.innerHTML\s*=\s*loomWorkspaceTemplate/);
  assert.match(product, /#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 52px\)/);
});

test('Threshold gates Loom while First Crossing remains local, replayable, and grammar-bound', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  assert.equal(doc.querySelector('.loom-builder-shell').hidden, true);
  for (const id of ['loomBegin','loomReturnThreshold','loomFirstCrossing','loomFirstCrossingAction','loomFirstCrossingStop','loomReplayFirstCrossing']) {
    assert.ok(doc.querySelector(`#${id}`), `Threshold control exists: ${id}`);
  }
  assert.equal(doc.querySelectorAll('[data-first-crossing-item]').length, 3);
  assert.match(workspaceSource, /FIRST_CROSSING_KEY = 'td613\.loom\.first-crossing\.v1'/);
  assert.match(workspaceSource, /outbound_submitted:false,[\s\S]{0,120}response_received:false/);
  assert.match(workspaceSource, /First Crossing complete · à gathered · cōl stayed protected · 上 created readiness\. Nothing crossed\./);
  assert.match(workspaceSource, /root\.dataset\.thresholdState='opening'/);
  assert.match(workspaceSource, /root\.dataset\.thresholdBeat='3'/);
  assert.doesNotMatch(workspaceSource, /firstCrossing[\s\S]{0,1200}(?:fetch\s*\(|provider_call_authorized\s*:\s*true)/);
});

test('First Crossing is field-native and suppresses ordinary Loom chrome', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  const crossing=doc.querySelector('#loomFirstCrossing');
  assert.ok(crossing);
  assert.equal(crossing.querySelectorAll('[data-first-crossing-item]').length,3);
  assert.match(product, /v7 FIELD-NATIVE FIRST CROSSING/);
  assert.match(product, /#loomAiWorkspace \.loom-first-crossing\{[\s\S]*?inset:0!important[\s\S]*?border:0!important[\s\S]*?background:transparent!important/);
  assert.match(product, /#loomAiWorkspace\[data-first-crossing="active"\] \.loom-field-caption,[\s\S]*?\.loom-hero-route\{[\s\S]*?display:none!important/);
  assert.match(product, /button\[data-first-crossing-item="brief"\]\{--fc-x:22%;--fc-y:48%\}/);
  assert.match(product, /button::before\{[\s\S]*?border-radius:50%/);
  assert.match(workspaceSource, /root\.dataset\.firstCrossingStep='0'/);
  assert.match(workspaceSource, /if\(correct\)\{[\s\S]*?actFirstCrossing\(\)/);
  assert.doesNotMatch(product, /\.loom-first-crossing\{[^}]*background:rgba\(5,8,12,.67\)/);
});

test('Phase 3 return bypasses the entrance Threshold without completing onboarding', () => {
  assert.match(workspaceSource, /review\?\.source==='OPENER_RETURN'\|\|environment\.location\.hash==='#return-review'/);
  assert.match(workspaceSource, /root\.dataset\.thresholdState='open'/);
  assert.match(workspaceSource, /thresholdStage\.hidden=true;[\s\S]{0,120}builderShell\.hidden=false/);
  assert.match(workspaceSource, /openWorkspace\('return',\{focus:bypassThreshold\}\)/);
  assert.doesNotMatch(workspaceSource, /openReturnedReviewScene[\s\S]{0,700}storageWrite\(FIRST_CROSSING_KEY/);
});

test('mobile keeps consequential boundaries and source-defined focus protection', () => {
  assert.match(product, /@media\(max-width:760px\)/);
  assert.match(product, /@media\(min-width:761px\)/);
  assert.match(product, /\.ai-composer>textarea\{[^}]*font-size:16px/);
  assert.match(product, /\.loom-tools textarea,\.loom-tools select\{[^}]*font-size:16px/);
  assert.match(product, /\.loom-reentry textarea,\.loom-reentry input:not\(\[type=checkbox\]\)\{[^}]*font-size:16px/);
  assert.match(product, /:focus-visible\{/);
  assert.match(product, /@media\(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(product, /grid-template-columns:116px\s+minmax\(0,1fr\)/);
  assert.match(product, /#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 52px\)/);
  assert.match(product, /@media\(max-width:760px\)[\s\S]*?#loomAiWorkspace \.loom-stage\{[\s\S]*?height:calc\(100svh - 48px\)/);
  assert.match(product, /#loomAiWorkspace \.loom-instrument-state-boundary\{[\s\S]*?display:block!important/);
  assert.match(product, /#loomAiWorkspace \.ai-room-replay\{[\s\S]*?position:absolute!important/);
  assert.doesNotMatch(product, /Georgia|Times New Roman|var\(--serif\)/);
});

test('hidden state actually withholds the Practice chooser despite component display rules', () => {
  const dom = new JSDOM(`<style>${product}</style><section id="loomAiWorkspace">${loomWorkspaceTemplate}</section>`);
  const chooser = dom.window.document.querySelector('#aiProjectChoices');
  assert.equal(chooser.hidden, true);
  assert.equal(dom.window.getComputedStyle(chooser).display, 'none');
  chooser.hidden = false;
  assert.notEqual(dom.window.getComputedStyle(chooser).display, 'none');
  chooser.hidden = true;
  assert.equal(dom.window.getComputedStyle(chooser).display, 'none');
  dom.window.close();
});

test('local preparation selects foreground crossing focus rather than a field detour', () => {
  assert.match(workspaceSource, /function revealResult\(\)\{\s*openWorkspace\('crossing',\{focus:true\}\)/);
  assert.match(workspaceSource, /name==='crossing'\?\$\('aiResult'\)/);
  assert.match(workspaceSource, /target\.focus\?\.\(\{preventScroll:true\}\)/);
  assert.doesNotMatch(workspaceSource, /\$\('aiRuntime'\)\.scrollIntoView/);
  assert.match(workspaceSource, /\$\('aiPreparePortable'\)\.classList\.add\('ai-primary'\)/);
  assert.match(workspaceSource, /\$\('aiRun'\)\.classList\.remove\('ai-primary'\)/);
});

test('cinematic route labels remain on the field while deep inspection stays inside Tools flow', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  assert.ok(doc.querySelector('.loom-stage').contains(doc.querySelector('#aiRuntimeState')));
  assert.match(workspaceSource, /for\(const selector of \['\.loom-instrument-state-next','\.loom-instrument-state-inspection'\]\)/);
  assert.doesNotMatch(workspaceSource, /stateTools[\s\S]{0,180}loom-instrument-state-endpoints/);
  assert.doesNotMatch(workspaceSource, /stateTools[\s\S]{0,180}loom-instrument-state-relation/);
  assert.match(product, /\.loom-tools \[data-tool-panel="session"\] \.loom-instrument-state-inspection\{[\s\S]*?position:static!important/);
});

test('product shell owns no second animation clock or network authority', () => {
  for (const forbidden of [/requestAnimationFrame/,/setInterval\s*\(/,/fetch\s*\(/,/XMLHttpRequest/,/WebSocket/,/@keyframes|animation\s*:/]) assert.doesNotMatch(product,forbidden);
  for (const forbidden of [/requestAnimationFrame/,/setInterval\s*\(/,/fetch\s*\(/,/XMLHttpRequest/,/WebSocket/]) assert.doesNotMatch(templateSource,forbidden);
  assert.equal((workspaceSource.match(/new AnimationCoordinator\(/g)||[]).length,1);
});

test('return admission remains absent from the default journey until a Loom session exists', () => {
  const doc = new JSDOM(loomWorkspaceTemplate).window.document;
  assert.equal(doc.querySelector('#aiReentryWorkspace').hidden,true);
  assert.ok(doc.querySelector('#loomReturnWorkspace').contains(doc.querySelector('#aiReentryWorkspace')));
  assert.match(workspaceSource, /\$\('aiReentryWorkspace'\)\.hidden=false;[\s\S]*await reentry\.setSession/);
});

test('cinematic Flow-Core traffic remains evidence-bound and single-clock', () => {
  assert.match(instrumentSource, /event_relation_history: eventRelationHistory/);
  assert.match(instrumentSource, /view\.event_relation_history/);
  assert.match(instrumentSource, /owns_animation_loop: false/);
  assert.match(instrumentSource, /const filamentCount = compact \? 10 : filaments\.length/);
  assert.match(instrumentSource, /const flightCount = compact \? 12 : flightGlyphs\.length/);
});

test('Loom product chrome does not reintroduce SHI or speculative release authority', () => {
  assert.doesNotMatch(workspaceSource+templateSource, /id="aiShi"|Safe Harbor issuance|validateShi|issuanceHold/);
  assert.match(workspaceSource, /const awake = \(Boolean\(acceptedTask\) \|\| locallyAdmitted\) && !busy/);
});
