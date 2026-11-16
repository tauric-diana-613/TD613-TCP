import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {projectManuscriptLineation} from '../app/encyclopedia/vixen-estate/manuscript-reader.mjs';

const root=process.cwd();
const read=path=>readFileSync(join(root,path),'utf8');
const page=read('app/encyclopedia/vix-cyb.html');
const visual=read('app/encyclopedia/vixen-estate/vixen-redpen-couture-rgi18.css');
const stage=read('app/encyclopedia/vixen-estate/vixen-stage-architecture-rgi10b.css');
const foundry=read('app/encyclopedia/vixen-estate/observatory-electric-foundry.mjs');
const mesh=read('app/encyclopedia/vixen-estate/vixen-live-mesh-rgi13.mjs');

test('redpen I — PDF paragraph reconstruction is display-only and retains unmodified source',()=>{
 const micro=['intelligence','architecture—depends','entirely','on','its','capacity','to','manage','environmental','conditions'];
 const raw=micro.join('\n\n');
 const projected=projectManuscriptLineation(raw);
 assert.equal(projected.text,micro.join(' '));
 assert.equal(projected.collapsed_micro_paragraphs,9);
 assert.equal(raw,micro.join('\n\n'));
 assert.match(read('app/encyclopedia/vixen-estate/manuscript-reader.mjs'),/pre\.textContent = raw;/);
});
test('redpen I — short normal section labels and long prose remain separate',()=>{
 const source=['## Summary','A full prose paragraph that ends with a period.','## Evidence','A second intact paragraph that makes a claim.'].join('\n\n');
 const projected=projectManuscriptLineation(source);
 assert.equal(projected.text,source);
 assert.equal(projected.collapsed_micro_paragraphs,0);
 assert.match(visual,/\.vix-reader-paragraph/);
});
test('redpen II — proof is one operable high contrast toggle',()=>{
 assert.match(foundry,/BTN\(state\.inspectorOpen\?'CLOSE THE PROOF':'OPEN THE PROOF'/);
 assert.match(foundry,/aria-expanded/);
 assert.match(visual,/\.ef-inspector-switch:hover/);
 assert.match(visual,/\.ef-inspector-switch:focus-visible/);
});
test('redpen III — Opera heading comes from engine not Podium Score',()=>{
 assert.doesNotMatch(stage,/content:'The Score'/);
 assert.match(stage,/content:attr\(data-synthesis-headline\)/);
 assert.match(foundry,/titleFromCover/);
 assert.match(foundry,/vixen:editorial-synthesis/);
 assert.match(page,/document\.dispatchEvent\(new CustomEvent\('vixen:editorial-synthesis'/);
});
test('redpen IV–V — selection remains existing source-backed button with silver clock and right icon',()=>{
 assert.match(foundry,/b\.setAttribute\('aria-pressed',String\(state\.labId===id\)\)/);
 assert.match(foundry,/ef-silver-lace/);
 assert.match(foundry,/state\.simPhase\*2\.8/);
 assert.match(visual,/\.ef-hero-tab::after/);
 assert.match(visual,/content:"◀"/);
});
test('redpen VI — exactly nine original constitutional method strings carried into accessible list',()=>{
 const original=read('app/encyclopedia/vixen-estate/observatory-vixen-corpus.mjs');
 assert.match(page,/From a source to a claim\./);
 assert.match(page,/class="vix-invariant-grid"/);
 const content=page.match(/<ol class="vix-invariant-grid"[\s\S]*?<\/ol>/)?.[0]||'';
 assert.equal((content.match(/<li>/g)||[]).length,9);
 assert.match(page,/87 historical files/);
 assert.match(page,/54 substantive/);
 assert.match(page,/6 Sieves \+ 7 Authority \+ 4 Lineage \+ 4 Control Planes = 21/);
 assert.match(page,/8 UNADJUDICATED_PAIR gates/);
 assert.match(original,/UNADJUDICATED_PAIR/);
 assert.match(visual,/linear-gradient\(120deg,#060a0c/);
 assert.doesNotMatch(visual,/#(?:[0-9a-f]{3,8})?\bpurple\b/i);
});
test('redpen VII — mesh excludes nested scroll invalidation and keeps same canvas',()=>{
 assert.match(mesh,/const onOuterScroll/);
 assert.match(mesh,/now-lastOuterScrollPaint<125/);
 assert.match(mesh,/win\.addEventListener\('scroll',onOuterScroll/);
 assert.match(mesh,/win\.removeEventListener\('scroll',onOuterScroll/);
 assert.match(mesh,/AWAITING_HOST_HELD_LAST_FRAME/);
 assert.doesNotMatch(mesh,/win\.addEventListener\('scroll',onLayout/);
 assert.match(visual,/html \{scroll-behavior:auto!important;\}/);
});
test('redpen VIII — loaded CSS, host prewarm, bounded fail-open arrival curtain',()=>{
 assert.match(page,/vixen-redpen-couture-rgi18\.css/);
 assert.match(page,/rel="modulepreload".*observatory-electric-foundry\.mjs/);
 assert.match(page,/rel="modulepreload".*synthesis-salon\.mjs/);
 assert.match(page,/id="vixEntryVeil"/);
 assert.match(page,/age>=2900/);
 assert.match(page,/setTimeout\(finish,3100\)/);
 assert.match(foundry,/requestIdleCallback\(prewarm/);
 assert.match(visual,/\.vix-entry-veil\[data-state="revealed"\]/);
});
