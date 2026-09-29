import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';

const html = fs.readFileSync(new URL('../app/dome-world/holonomy-loom.html', import.meta.url), 'utf8');
const ux = fs.readFileSync(new URL('../app/dome-world/holonomy-loom/ux-repair.css', import.meta.url), 'utf8');

test('Loom loads the task-first hierarchy repair after the chamber and room styles', () => {
  const doc = new JSDOM(html).window.document;
  const hrefs = [...doc.querySelectorAll('link[rel="stylesheet"]')].map(node => node.getAttribute('href'));
  const observer = hrefs.indexOf('./holonomy-loom/observer-chamber.css');
  const repair = hrefs.indexOf('./holonomy-loom/ux-repair.css');
  assert.ok(observer >= 0, 'observer chamber stylesheet remains present');
  assert.ok(repair > observer, 'task-first repair loads after the optional research chamber');
  assert.equal(doc.querySelectorAll('#loomObserverChamber').length, 1);
  assert.ok(doc.querySelector('#loomLegacy #loomObserverChamber'), 'synthetic observer chamber remains opt-in under the laboratory');
});

test('Loom task editor dominates one vertical route without hiding the living-room witness', () => {
  assert.match(ux, /Loom targeted hierarchy repair v1/);
  assert.match(ux, /#loomAiWorkspace \.ai-columns\{[\s\S]*grid-template-columns:minmax\(0,1fr\)!important/);
  assert.match(ux, /#loomAiWorkspace \.ai-observer\{[\s\S]*position:static!important/);
  assert.doesNotMatch(ux, /#aiLivingRoom[^\{]*\{[^\}]*display\s*:\s*none/i);
  assert.doesNotMatch(ux, /\.loom-living-room[^\{]*\{[^\}]*display\s*:\s*none/i);
  assert.match(ux, /#loomAiWorkspace textarea#aiTask\{[\s\S]*min-height:175px!important/);
  assert.match(ux, /#loomAiWorkspace \.loom-living-room\{[\s\S]*padding:10px!important/);
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
    /setInterval\s*\(/,
    /provider/i
  ]) assert.doesNotMatch(ux, forbidden);
});
