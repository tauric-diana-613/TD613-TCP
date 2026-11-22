import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {translatePublicCopy,installVixenPublicCopy} from
 '../app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const html=readFileSync(resolve(here,'../app/encyclopedia/vix-cyb.html'),'utf8');
const PUBLIC_TERMS=/\b(?:SignalRupture|Wendbine|EMSTD613|SRC|Atelier|FADT)\b/i;

test('presentation aliases explain internal names without changing machine identifiers',()=>{
 const before='Wendbine and SignalRupture / SRC Atelier / EMSTD613 / Cross-Atelier / FADT';
 const after=translatePublicCopy(before);
 assert.doesNotMatch(after,PUBLIC_TERMS);
 assert.match(after,/documentary|research|source|evidence/i);
 assert.equal(translatePublicCopy('conscription not-src transform'),'conscription not-src transform');
 assert.equal(translatePublicCopy('The Architecture of Control'),'The Architecture of Control');
  assert.equal(translatePublicCopy('OPERAHOUSE ≠ OPERA ≠ PERFORMER'),'OPERAHOUSE ≠ OPERA ≠ PERFORMER');
});

test('Program codenames and private researcher aliases stay out of public copy',()=>{
 const aliases='Experiment A / Experiment B / Emergence HQ / AIX / Paul / Atelier / EMSTD613 / SRC / SignalRupture / Wendbine';
 const visible=translatePublicCopy(aliases);
 assert.doesNotMatch(visible,/\b(?:Experiment[- ]A|Experiment[- ]B|Emergence\s+HQ|AIX|Paul|Atelier|EMSTD613|SRC|SignalRupture|Wendbine)\b/i);
 assert.equal(translatePublicCopy('OPERAHOUSE ≠ OPERA ≠ PERFORMER'),'OPERAHOUSE ≠ OPERA ≠ PERFORMER');
 assert.equal(translatePublicCopy('The Architecture of Control'),'The Architecture of Control');
});

test('Human inspector no longer exposes host-private diagnostic benches',()=>{
 const ix=html.slice(html.indexOf('function renderInspectorBody()'),html.indexOf('// Reference & Utility Button Binders'));
 assert(!ix.includes('ENGINE_DIAGNOSTIC_BENCH'),'engineering-only digest bench escaped into public inspector');
 assert(!ix.includes('A-PFR0.2 Engine Track'),'host engine inventory escaped into public inspector');
 assert(!ix.includes('TD613_PODIUM_OPERATOR_DIRECT=1'),'private CLI attestation escaped into visitor inspector');
 assert(ix.includes('VERIFY A RECORDED WORK'));
 assert(ix.includes('RESEARCH HANDOFF · ORIGINAL WORKS FIRST'));
});

test('DOM language boundary covers initial chrome and asynchronous user-facing messages',async()=>{
 const dom=new JSDOM('<!DOCTYPE html><body><nav title="SRC methods"><button aria-label="Wendbine Atelier">SignalRupture scored by FADT</button></nav><script type="application/json" id="data">{"name":"EMSTD613"}</script><div id="dynamic"></div></body>');
 const root=dom.window.document.body;
 const rawScript=dom.window.document.getElementById('data').textContent;
 const guard=installVixenPublicCopy(root);
 const nav=root.querySelector('nav');
 assert.doesNotMatch(nav.textContent,PUBLIC_TERMS);
 assert.doesNotMatch(nav.getAttribute('title'),PUBLIC_TERMS);
 assert.doesNotMatch(root.querySelector('button').getAttribute('aria-label'),PUBLIC_TERMS);
 const dynamic=root.querySelector('#dynamic');
 dynamic.innerHTML='<p title="SRC search">Use the Atelier</p>';
 await new Promise(done=>setImmediate(done));
 assert.doesNotMatch(dynamic.textContent,PUBLIC_TERMS);
 assert.doesNotMatch(dynamic.firstElementChild.getAttribute('title'),PUBLIC_TERMS);
 dynamic.firstElementChild.textContent='An EMSTD613 FADT report';
 await new Promise(done=>setImmediate(done));
 assert.doesNotMatch(dynamic.textContent,PUBLIC_TERMS);
 assert.equal(dom.window.document.getElementById('data').textContent,rawScript,
   'Original machine payload must remain unmodified');
 guard.disconnect();
 dom.window.close();
});

test('Source titles and machine receipts never pass through public alias rewriting',async()=>{
 const dom=new JSDOM('<body><h2>OPERAHOUSE ≠ OPERA ≠ PERFORMER</h2><div data-vixen-source-provenance title="SRC Atelier Original">Original EMSTD613 FADT evidence</div><div class="vs-work-title">Atelier witness manuscript</div></body>');
 const guard=installVixenPublicCopy(dom.window.document.body);
 assert.equal(dom.window.document.querySelector('h2').textContent,'OPERAHOUSE ≠ OPERA ≠ PERFORMER');
 const source=dom.window.document.querySelector('[data-vixen-source-provenance]');
 assert.equal(source.textContent,'Original EMSTD613 FADT evidence');
 assert.equal(source.getAttribute('title'),'SRC Atelier Original');
 assert.equal(dom.window.document.querySelector('.vs-work-title').textContent,'Atelier witness manuscript');
 guard.disconnect();dom.window.close();
});
test('Vixen public markup imports boundary and rejects literal internal names in core controls',()=>{
 assert.match(html,/vixen-opera-public-copy\.mjs/);
 assert.match(html,/>Document Routes<\/button>/);
 assert.match(html,/<strong>Contextual source routes<\/strong>/);
 assert.doesNotMatch(html,/>SRC Projective<\/button>/);
 assert.doesNotMatch(html,/>FADT &amp; XOR SYNERGY</);
 assert.doesNotMatch(html,/>FADT Exact \[C3\]/);
 assert.match(html,/THE OBSIDIAN READING ROOM/);
});

test('Global search preserves title/filename only, not unrelated dynamic explanatory UI text',()=>{
 const source=html.slice(html.indexOf('function renderGlobalSearchResult'),html.indexOf('function runGlobalSearch'));
 assert.doesNotMatch(source,/class="command-result" data-vixen-source-provenance/);
 assert.match(source,/<span data-vixen-source-provenance="true">/);
 assert.match(source,/<div data-vixen-source-provenance="true" style="font:400/);
 assert.match(source,/<div class="expa-search-why">/);
});


test('Public optical captions explain instruments without naming their private host engines',()=>{
 const foundry=readFileSync(resolve(here,'../app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs'),'utf8');
 const salon=readFileSync(resolve(here,'../app/encyclopedia/vixen-estate/synthesis-salon.mjs'),'utf8');
 assert.doesNotMatch(foundry,/LOOM-CLASSIFIED OPTICAL CHOREOGRAPHY|Loom-classified optical carriers/);
 assert.doesNotMatch(foundry,/Dome-Art, Loom, Aperture and Couture are borrowed instrument engines/);
 assert.doesNotMatch(salon,/APERTURE RADIOMETRY/);
 assert.match(foundry,/DEPTH-CLASSIFIED OPTICAL CHOREOGRAPHY/);
 assert.match(salon,/SPECTRAL RADIOMETRY/);
 // Legitimate optical and research source terminology is not globally rewritten.
 assert.match(foundry,/OPERAHOUSE ≠ OPERA ≠ PERFORMER/);
});

test('Vixen Observatory presents observation mathematics without claiming host RC methods as source works',()=>{
 const start=html.indexOf('const OBS_MODELS');
 const end=html.indexOf('function renderObservatoryControls',start);
 assert.ok(start>=0&&end>start);
 const models=html.slice(start,end);
 assert.match(models,/Observation Geometry & Fiber Admissibility/);
 assert.match(models,/Projection Nullspace & Measurement Context/);
 assert.doesNotMatch(models,/\[RC-0\d\]|Atlas A-08 Contexts|DERIVATIVE_CLOCK_CUSTODY_V0_1/);
 assert.doesNotMatch(html,/VERDICT: \[RC-03\]|VERDICT: IDENTIFIABLE_2X2_OPERATOR \(\[RC-07\]/);
});
