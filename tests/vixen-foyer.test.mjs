/**
 * Vixen Fox House · real frontispiece + source-route regression contract.
 *
 * Quality ceiling is human operator adjudication. This confirms navigational
 * execution, source estates and one owner of mathematical/research state.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {VIXEN_FOYER_CONTRACT} from '../app/encyclopedia/vixen-estate/vixen-foyer.mjs';
const base=new URL('../app/encyclopedia/',import.meta.url);
const html=await readFile(new URL('vix-cyb.html',base),'utf8');
const css=await readFile(new URL('vixen-estate/vixen-foyer.css',base),'utf8');
const script=await readFile(new URL('vixen-estate/vixen-foyer.mjs',base),'utf8');
test('Vixen entrance remains a chromepunk frontispiece with compact interactive research routes',()=>{
 assert.equal(VIXEN_FOYER_CONTRACT.source_estate,'EMSTD613');
 assert.equal(VIXEN_FOYER_CONTRACT.original_research_runtime,'PRESERVED');
 assert.equal(VIXEN_FOYER_CONTRACT.added_executors,0);
 assert.equal(VIXEN_FOYER_CONTRACT.experiment_b_flight,'HELD');
 assert.equal(VIXEN_FOYER_CONTRACT.automatic_theory_approval,false);
 assert.equal(VIXEN_FOYER_CONTRACT.art_adjudication,'HUMAN_RESERVED');
 assert(html.includes('class="vixen-editorial-foyer"'));
 const hero=html.indexOf('<div class="hero" id="cover">');
 const originalArt=html.indexOf('<figure class="hero-art">');
 const foyer=html.indexOf('<section class="vixen-editorial-foyer"');
 assert(hero>=0&&originalArt>hero&&foyer>originalArt,
  'Original Mugler chromepunk frontispiece must precede secondary pathways');
 assert(html.includes('Mugler-unchained chromepunk refractive couture sculpture'));
 assert(css.includes('#view-overview > .hero .hero-art'));
 assert(css.includes('compact chrome instrument console'));
 assert(html.includes('Follow the fox. <em>Bring a question.</em>'));
 assert(html.includes('THE FOX HOUSE / AN INVITATION, NOT AN INSTRUCTION MANUAL'));
 assert(html.includes('OPERAHOUSE ≠ OPERA ≠ PERFORMER'));
 assert(html.includes('vixen-foyer.css'));
 assert(html.includes('vixen-foyer.mjs'));
 assert(css.includes('.mobile-wayfinder.vixen-doorways'));
 assert(css.includes('.vixen-foyer-intro h2'));
});
test('All four Vixen source entrance verbs route into current native Vixen work, lab, theory and original folios',()=>{
 const entry=html.slice(html.indexOf('<section class="vixen-editorial-foyer"'),
  html.indexOf('<!-- Threshold Spread:'));
 const routes=[...entry.matchAll(/<button type="button" data-view="([^"]+)"/g)].map(x=>x[1]);
 assert.deepEqual(routes,['works','observatory','collection','reference']);
 for(const id of routes){
  assert(html.includes('id="view-'+id+'"'),'Missing source-governed route '+id);
  assert(html.includes('class="nav-btn" data-view="'+id+'"'),
   'Route must be native, not isolated from existing navigation');
 }
 for(const text of ['Meet the <em>research.</em>','Touch the <em>instrument.</em>',
  'Make a <em>conjecture.</em>','Follow the <em>trace.</em>'])assert(entry.includes(text));
 assert(!entry.includes('Eclipse–Omega'));
});
test('Carry-forward is session-only and delegates to real research cart instead of a phantom source state',()=>{
 assert(html.includes('id="vixenCarryRail"'));
 assert(html.includes('id="vixenCarryCount"'));
 assert(script.includes('window.VIXEN_STUDY_TRAY?.list?.()'));
 assert(script.includes("const native=document.getElementById('collectionCount')"));
 assert(script.includes('new MutationObserver(refresh)'));
 assert(script.includes('window.addEventListener(\'vixen-study-tray-change\',onTray)'));
 assert(script.includes('automatically_ratified:false'));
 assert(html.includes('class="vixen-carry-action" data-view="collection"'));
 assert(!script.includes('localStorage'));
 assert(!script.includes('fetch('));
});
test('Original scientific and user interface records remain present; genre imports machinery but claims no authorship',()=>{
 for(const needle of ['id="vixen-corpus-bundle"','id="view-gates"',
  'id="view-protocols"','id="view-works"','id="vixenElectricFoundry"',
  'id="vixenSynthesisSalon"','id="vixenReferenceChamber"',
  'id="collectionCount"','id="inspectorDialog"',
  'data-action="search"']) assert(html.includes(needle),'Conservation breach: '+needle);
 assert(html.includes('observatory-computational-score')===false,
  'The score module should be owned by the Observatory, not duplicated in the public header');
 assert(css.includes('--vf-rose:#FF91AF'));
 assert(css.includes('--vf-flash:#dfbfee'),
  'Live foyer must use revised Glinda-lilac chrome accent');
 assert(html.includes('--arc-flash:#F9F36D'),
  'Historical Vixen theme must remain recoverable without dictating current palette');
 assert(css.includes('--vf-foil:linear-gradient'));
 assert(!css.includes('Eclipse–Omega'));
});
