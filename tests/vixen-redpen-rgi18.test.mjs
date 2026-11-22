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

test('RGI24 · each captured native-PDF text derivative reflows losslessly, even title-case fragments',()=>{
 const bundle=JSON.parse(page.match(/<script id="vixen-corpus-bundle" type="application\/json">([\s\S]*?)<\/script>/)[1]);
 const titleBySource=new Map(bundle.works.flatMap(w=>
   (w.linked_sources||[]).map(s=>[s.source_file_id,w.declared_title])));
 const canon=s=>String(s).replace(/\s+/gu,'');
 let counted=0;
 let titleMatched=0;
 for(const shardName of ['corpus-experiment-a-part1.json','corpus-experiment-a-part2.json']){
  const shard=JSON.parse(read('app/encyclopedia/vixen-estate/'+shardName));
  for(const source of Object.values(shard.sources)){
   if(source.format!=='pdf'||!source.text_body)continue;
   counted++;
   const projection=projectManuscriptLineation(source.text_body,{
    sourceFormat:source.media_type,documentTitle:titleBySource.get(source.source_file_id)||''
   });
   assert.equal(projection.pdf_derivative_reflow,true,source.original_filename);
   assert.equal(canon(projection.projection_title+projection.text),canon(source.text_body),
     'Source nonwhitespace characters must remain exact and ordered: '+source.original_filename);
   const paragraphs=projection.text.split(/\n\n+/);
   assert(paragraphs.length>=18&&paragraphs.length<=160,
     'PDF should be readable as substantial editorial paragraphs: '+source.original_filename+' '+paragraphs.length);
   assert(paragraphs.filter(p=>p.trim().split(/\s+/).length<4).length<=1,
     'PDF renderer may not expose one-word fragments as manuscript paragraphs: '+source.original_filename);
   assert(projection.collapsed_micro_paragraphs>1000,
     'This actual derivative must exercise a real multi-thousand fragment recovery: '+source.original_filename);
   if(projection.projection_title)titleMatched++;
  }
 }
 assert.equal(counted,20,'Test all recorded PDF derivatives across both source shards');
 assert(titleMatched>=6,'At least six source-matched title headings must restore without invention');
 const original=read('app/encyclopedia/vixen-estate/manuscript-reader.mjs');
 assert.match(original,/VIXEN_PDF_REFLOW_NONWHITESPACE_INVARIANT/);
 assert.match(original,/pre\.textContent = raw/);
 assert.match(page,/sourceFormat:activeSrc\.media_type/);
 assert.match(page,/documentTitle:work\.declared_title/);
});
test('RGI24 · Markdown documents keep native structural breaks and manifest identities',()=>{
 const native='# **Folio**\n\nFirst paragraph.\n\n## Evidence\n\nSecond paragraph.';
 const projection=projectManuscriptLineation(native,{sourceFormat:'text/markdown',documentTitle:'Folio'});
 assert.equal(projection.pdf_derivative_reflow,false);
 assert.equal(projection.text,native);
 assert.match(page,/id="expaReaderFocusButton"/);
 assert.match(visual,/RGI24 · THE READING ATELIER/);
 assert.match(visual,/data-reading-focus="true"/);
});
test('RGI25 · Noir Folio replaces porcelain reading asset with compact, interactive source-safe layout',()=>{
 const noir=read('app/encyclopedia/vixen-estate/vixen-noir-folio-rgi25.css');
 assert.doesNotMatch(page,/<link[^>]*vixen-noir-folio-rgi25\.css/);
 assert.match(page,/<link[^>]*vixen-obsidian-reading-rgi26\.css/);
 const successor=read('app/encyclopedia/vixen-estate/vixen-obsidian-reading-rgi26.css');
 assert.match(successor,/\.vix-couture-reader/);
 assert.match(successor,/#0b1215/);
 assert.match(page,/class="vix-noir-folio-frame"/);
 assert.match(page,/data-folio-density="compact"/);
 assert.match(page,/data-folio-density="comfort"/);
 assert.match(page,/id="vixFolioProgress"/);
 assert.match(page,/id="vixFolioPrevious"/);
 assert.match(page,/id="vixFolioNext"/);
 assert.match(noir,/RGI25 \/ VIXEN'S NOIR FOLIO/);
 assert.match(noir,/background:linear-gradient\(130deg,#0c1519,#121d22/);
 assert.match(noir,/font:400 clamp\(14px,1\.04vw,16\.5px\)/);
 assert.match(noir,/data-folio-density="comfort"/);
 assert.match(noir,/#view-works #worksExperimentAReaderMount #expaCompanionBodyPre/);
 assert.doesNotMatch(noir,/background:#fffaf7!important|background:#fffefb!important/i);
 assert.match(page,/sourceFormat:activeSrc\.media_type/);
 assert.match(page,/documentTitle:work\.declared_title/);
});

test('RGI25 · scoring cards explain eight axes and keep TD613 candidate authorship distinct',()=>{
 const noir=read('app/encyclopedia/vixen-estate/vixen-noir-folio-rgi25.css');
 const engine=read('app/encyclopedia/vixen-estate/synthesis-salon-engine.mjs');
 assert.match(noir,/\.ci-candidate-axes/);
 assert.match(page,/OPEN EVIDENCE LEDGER · EIGHT AXES & COUNTERTEST/);
 assert.match(page,/NOT A PROBABILITY OF TRUTH/);
 assert.match(page,/operaResearchLabel/);
 assert.match(page,/documentary source-route/);
 assert.match(engine,/id:'cand-vixen-documentary-route'/);
 assert.match(engine,/methodology_origin:'TD613'/);
 assert.doesNotMatch(engine,/id:'cand-src-projective-tomography'/);
 assert.doesNotMatch(engine,/const srcCandidate=rawTpl/);
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
 assert.match(visual,/content:"◀︎"/);
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

test('RGI23 · engine text receives bounded editorial lineation, no CSS-generated header',()=>{
 assert.match(foundry,/function renderSynthesisHeadline\(raw\)/);
 assert.match(foundry,/railTitle\.textContent=crossed/);
 assert.match(foundry,/sourceText\.length<=110/);
 assert.match(foundry,/railHeading\.prepend\(railTitle\)/);
 assert.match(visual,/\.ef-aria-score>\.ef-kicker::before\s*\{[\s\S]*?content:none!important/);
 assert.match(visual,/\.ef-rail-display-headline/);
 assert.match(visual,/white-space:pre-line!important/);
});
test('RGI23 · selection marker follows actual aria-pressed and gold frame, not all hover targets',()=>{
 assert.match(foundry,/b\.setAttribute\('aria-pressed',String\(state\.labId===id\)\)/);
 assert.match(visual,/\.ef-hero-tab::after\s*\{\s*content:none!important/);
 assert.match(visual,/\.ef-hero-tab\[aria-pressed="true"\]::after\s*\{\s*content:"◀︎"!important/);
 assert.match(visual,/border:2px solid #d6ad45!important/);
 assert.match(visual,/@keyframes vix-gold-interference/);
 assert.match(visual,/@media\(prefers-reduced-motion:reduce\)/);
});
test('RGI23 · proof has uniform toolbar material and status lives outside optical frame',()=>{
 assert.match(visual,/\.ef-toolbar :is\(button\.ef-toggle,button\.ef-button,button\.ef-inspector-switch\)/);
 assert.match(visual,/\.ef-toolbar \.ef-inspector-switch::after\s*\{\s*content:none!important/);
 assert.match(foundry,/add\(stage,canvas,notation,composerCanvas,overlay\);/);
 assert.match(foundry,/add\(eye,iris,sceneBadge\);/);
 assert.doesNotMatch(foundry,/COMPOSER HELD · No independently authorized exhibit substitution/);
 assert.match(foundry,/composerReview\.hidden=!active/);
 assert.match(visual,/\.ef-composer-review\[hidden\]/);
 assert.match(visual,/\.ef-scene-badge\s*\{[\s\S]*?position:relative!important/);
});
test('RGI23 · three pedagogical Opera paths preserve all native source-bearing controls',()=>{
 for(const name of ['vixWorksPathTitle','vixGatePathTitle','vixRefusalPathTitle']){
  assert.match(page,new RegExp('id="'+name+'"'));
 }
 assert.equal((page.match(/class="vix-couture-route-guide"/g)||[]).length,3);
 assert.equal((page.match(/class="vix-route-stage" role="listitem"/g)||[]).length,9);
 assert.equal((page.match(/class="vix-route-custody"/g)||[]).length,3);
 for(const id of ['workSearchInput','worksListContainer','gateSensitivityReadout',
  'gatesStackContainer','resetGatesBtn','vixenElectricFoundry']){
  assert.match(page,new RegExp('id="'+id+'"'));
 }
 assert.match(page,/BOUNDED_TIE/);
 assert.match(visual,/RGI23 · THREE ROOM COUTURE/);
 assert.match(visual,/#view-gates \.gate-controls \.segmented button\[aria-pressed="true"\]/);
});

test('redpen VIII — loaded CSS, host prewarm, bounded fail-open arrival curtain',()=>{
 assert.match(page,/vixen-redpen-couture-rgi18\.css/);
 assert.match(page,/rel="modulepreload".*observatory-electric-foundry\.mjs/);
 assert.match(page,/rel="modulepreload".*synthesis-salon\.mjs/);
 assert.match(page,/id="vixEntryVeil"/);
 const arrival=read('app/encyclopedia/vixen-estate/vixen-arrival-prewarm-rgi19.mjs');
 assert.match(page,/vixen-arrival-prewarm-rgi19\.mjs/);
 assert.match(arrival,/setTimeout\(\(\)=>finish\('BOUNDED_FAIL_OPEN'\),3100\)/);
 assert.match(arrival,/status\.critical_presentation_ready&&resources/);
 assert.match(arrival,/salonSourceStatus==='TWO_SALON_BODIES_VERIFIED'/);
 assert.doesNotMatch(arrival,/age>=2900/);
 assert.match(foundry,/requestIdleCallback\(prewarm/);
 assert.match(visual,/\.vix-entry-veil\[data-state="revealed"\]/);
});
