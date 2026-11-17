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

test('Vixen public markup imports boundary and rejects literal internal names in core controls',()=>{
 assert.match(html,/vixen-opera-public-copy\.mjs/);
 assert.match(html,/>Document Routes<\/button>/);
 assert.match(html,/<strong>Contextual source routes<\/strong>/);
 assert.doesNotMatch(html,/>SRC Projective<\/button>/);
 assert.doesNotMatch(html,/>FADT &amp; XOR SYNERGY</);
 assert.doesNotMatch(html,/>FADT Exact \[C3\]/);
 assert.match(html,/THE OBSIDIAN READING ROOM/);
});
