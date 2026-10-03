import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');
const ux = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ux-repair.css', import.meta.url), 'utf8');
const dromological = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/dromological-regime.css', import.meta.url), 'utf8');
const workspaceSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ai-workspace.js', import.meta.url), 'utf8');
const instrumentSource = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/instrument-state-view.js', import.meta.url), 'utf8');

test('the primary Loom page isolates historical checker and observer practice from its closed Instrument Lab', () => {
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('#loomLegacy').length, 1);
  assert.equal(doc.querySelector('#loomLegacy').open, false);
  assert.equal(doc.querySelectorAll('#loomTheater, #loomObserverChamber, #loomPracticeFixtures, #message, #glyphPath').length, 0);
  assert.equal(doc.querySelectorAll('script[src$="/theater.js"], script[src$="/observer-chamber.js"]').length, 0);
  assert.equal(doc.querySelectorAll('link[href$="/living-room.css"], link[href$="/observer-chamber.css"], link[href$="/theater.css"]').length, 0);
});

test('Loom task editor keeps its one vertical hierarchy', () => {
  assert.match(ux, /Loom targeted hierarchy repair v1/);
  assert.match(ux, /#loomAiWorkspace \.ai-columns\{[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);



  assert.match(ux, /#loomAiWorkspace textarea#aiTask\{[\s\S]*min-height:175px!important/);

});

test('Loom first viewport and 390px-class layout stay compact and non-horizontal', () => {
  assert.match(ux, /\.hero\{[\s\S]*padding:18px 0 14px!important/);
  assert.match(ux, /\.hero h1\{[\s\S]*font-size:clamp\(2\.35rem,5vw,4\.2rem\)!important/);
  assert.match(ux, /@media\(max-width:420px\)\{[\s\S]*\.wrap\{width:calc\(100% - 14px\)!important/);
  assert.match(ux, /@media\(max-width:420px\)\{[\s\S]*#loomAiWorkspace \.ai-toolbar\{[\s\S]*grid-template-columns:1fr!important/);
  assert.match(ux, /@media\(max-width:760px\)\{[\s\S]*#loomAiWorkspace \.ai-send-row\{[\s\S]*grid-template-columns:1fr auto!important/);
});

test('UX repair changes presentation only, not route or measurement authority', () => {
  for (const forbidden of [
    /fetch\s*\(/,
    /XMLHttpRequest/,
    /WebSocket/,
    /localStorage/,
    /sessionStorage/,
    /requestAnimationFrame/,
    /setInterval\s*\(/
  ]) assert.doesNotMatch(ux, forbidden);
});


test('dromological Loom is a route regime rather than a second animation engine', () => {
  const doc = new JSDOM(html).window.document;
  assert.equal(doc.querySelectorAll('link[href$="/dromological-regime.css"]').length, 1);
  assert.match(dromological, /data-loom-journey="ready"/);
  assert.match(dromological, /data-loom-journey="marrowline"/);
  assert.match(dromological, /data-loom-journey="return"/);
  assert.match(dromological, /min-height:100svh/);
  assert.doesNotMatch(dromological, /@keyframes|animation\s*:/, 'continuous cinematic motion stays on the existing coordinator');
});

test('Loom product chrome no longer speculatively SHI-gates the crossing', () => {
  assert.doesNotMatch(workspaceSource, /id="aiShi"|Safe Harbor issuance|validateShi|issuanceHold/);
  assert.match(workspaceSource, /Continue the route\./);
  assert.match(workspaceSource, /const awake = \(Boolean\(acceptedTask\) \|\| locallyAdmitted\) && !busy/);
});

test('cinematic Flow-Core traffic is sourced from evidenced relation history', () => {
  assert.match(instrumentSource, /event_relation_history: eventRelationHistory/);
  assert.match(instrumentSource, /Array\.from\(\{length:39\}/);
  assert.match(instrumentSource, /view\.event_relation_history/);
  assert.match(instrumentSource, /owns_animation_loop: false/);
});
