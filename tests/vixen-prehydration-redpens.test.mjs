import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translatePublicCopy} from '../app/encyclopedia/vixen-estate/vixen-opera-public-copy.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('app/encyclopedia/vix-cyb.html');
const publicGuide=read('app/encyclopedia/vix-cyb/llms.txt');
const agentGuide=read('app/encyclopedia/reference/podium/AGENTS.md');
const machine=JSON.parse(read('app/encyclopedia/reference/podium/manifest.json'));
const liveMesh=read('app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs');
const folded=read('app/encyclopedia/vixen-estate/vixen-folded-cuirass.mjs');
const css=read('app/encyclopedia/vixen-estate/vixen-electrical-breath-rgi13.css');

test('public Podium offers source-first research handoff rather than backstage controls',()=>{
 const start=html.indexOf("} else if (state.inspectorTab === 'podium')");
 const stop=html.indexOf('// Reference & Utility Button Binders',start);
 assert(start>0&&stop>start);
 const visible=html.slice(start,stop);
 for(const term of ['TD613_PODIUM_OPERATOR_DIRECT','CLI Runner','LAB_RC-','wf-experiment-b-hold','Cross-Atelier Podium Task Preview','podiumRouteSelect','podiumFusionProfile']){
  assert(!visible.includes(term),'backstage inspector content persisted: '+term);
 }
 assert.match(visible,/INVITE A SOURCE-BOUND AI COLLABORATOR/);
 assert.match(visible,/OPERAHOUSE ≠ OPERA ≠ PERFORMER/);
 assert.match(visible,/missing evidence/);
});
test('machine Podium preserves all 27 exact routes without publishing private adapter inventory',()=>{
 assert.equal(machine.routes.length,27);
 assert.equal(new Set(machine.routes.map(x=>x.id)).size,27);
 assert.equal(machine.optional_engine_adapters,undefined);
 assert.match(machine.read_first.public_research_guide,/vix-cyb\/llms.txt/);
 assert.match(agentGuide,/27 declared typed routes/);
});
test('visitor program aliases translate while original Work and machine bytes retain historical names',()=>{
 const all='Experiment A, Experiment B, Emergence HQ, Atelier, EMSTD613, SRC, SignalRupture, Wendbine, Paul, AIx';
 const rendered=translatePublicCopy(all);
 assert.doesNotMatch(rendered,/\b(?:Experiment A|Experiment B|Emergence HQ|Atelier|EMSTD613|SRC|SignalRupture|Wendbine|Paul|AIx)\b/i);
 assert.match(rendered,/source|research/i);
 assert.match(html,/id="vixen-corpus-bundle"/);
 assert.match(publicGuide,/OPERAHOUSE ≠ OPERA ≠ PERFORMER/);
 assert.doesNotMatch(publicGuide,/\b(?:Experiment A|Experiment B|Emergence HQ|Atelier|EMSTD613|SRC|SignalRupture|Wendbine|Paul)\b/i);
});
test('mobile Salon parks fixed viewport field while keeping scroll-owned garment light and desktop same-frame host projection',()=>{
 assert.match(css,/body\[data-view="collection"\] #vixenLivingMesh\.vixen-living-mesh/);
 assert.match(liveMesh,/salonMobile\(\)/);
 assert.match(liveMesh,/const salonMobile=/);
 assert.match(folded,/const onOuterScroll=/);
 assert.match(folded,/ms<scrollActiveUntil/);
 assert.match(folded,/renderHostFrame\?\.\(\{/);
 assert.match(folded,/paintSalonChargePresentation\(/);
});
test('full-surface witness is real-browser, source-bound and exposes gaps',()=>{
 const capture=read('tests/vixen-full-surface-witness.mjs');
 const runner=read('scripts/run-vixen-browser-tests.mjs');
 assert.match(capture,/from 'playwright'/);
 assert.match(capture,/source_revision:revision/);
 assert.match(capture,/SCROLL_BOTTOM_NOT_COVERED/);
 assert.match(capture,/document_scroll_tile/);
 assert.match(capture,/nested_scroll_tile/);
 assert.match(capture,/errors:failure/);
 assert.match(runner,/http\.server/);
});
