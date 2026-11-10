/**
 * RGI10 · Glinda/cybergoth material-system audit.
 * Static design contracts complement Chromium—not a substitute for visual
 * operator adjudication or source/exterior scientific evidence.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root=new URL('../app/encyclopedia/',import.meta.url);
const page=await readFile(new URL('vix-cyb.html',root),'utf8');
const css=await readFile(new URL('vixen-estate/glinda-cybergoth-rgi10.css',root),'utf8');
const paths=['vixen-foyer.css','observatory-electric-foundry.css','synthesis-salon.css','research-chamber.css'];
const archived=JSON.parse(page.match(/id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/)[1]);
test('Couture treatment lives downstream of the original Vixen constitution',()=>{
 assert.match(page,/<link rel="stylesheet" href="\.\/vixen-estate\/glinda-cybergoth-rgi10\.css"[^>]*>/);
 assert.match(css,/OPERAHOUSE/);
 assert.match(css,/PERFORMER/);
 assert.equal(archived.works.length,32);
 assert.equal(archived.works.reduce((n,w)=>n+w.linked_sources.length,0),53);
 assert.equal(archived.human_gates.length,8);
 assert(archived.human_gates.every(g=>g.default_state==='UNADJUDICATED_PAIR'));
 assert.equal(archived.instruments.length,21);
});
test('The source-owned eight-room Fox House is never wholly hidden by a 1280px breakpoint',()=>{
 assert.equal((page.match(/class="vixen-room" data-view=/g)||[]).length,8);
 assert.match(css,/#vixenRoomRail\{[\s\S]*?display:flex!important/);
 assert.match(css,/@media\(min-width:960px\)/);
 assert.match(css,/@media\(max-width:959px\)/);
 assert.match(css,/body\[data-active-research-stage="OPERAHOUSE"\] #vixenRoomRail\{display:none!important\}/);
 assert.match(css,/scroll-snap-type:x proximity/);
});
test('Mustard is excluded from active Opera styling while original historic palette remains recoverable',async()=>{
 assert.match(css,/--arc-flash:#FFF2A9/);
 for(const name of paths){
  const content=await readFile(new URL('vixen-estate/'+name,root),'utf8');
  assert(!/#F9F36D|#f9f36d|rgba\(249,243,109/i.test(content),
   'Legacy yellow remains active inside source-owned Opera styling: '+name);
 }
 assert.match(page.match(/<style id="manifest-instance-theme">([\s\S]*?)<\/style>/)[1],
  /--arc-flash:#F9F36D/,
  'The historically authored palette is provenance, not a mutable visual source');
 assert.match(css,/body:not\(\[data-active-research-stage="OPERAHOUSE"\]\)/,
  'The current couture override must apply only to the original Vixen Opera');
});
test('All 22 mathematical folios stay in the data while display is curated',()=>{
 assert.equal(archived.formula_folios.length,22);
 assert.match(page,/id="formulaFolioGrid" data-expanded="false"/);
 assert.match(page,/id="formulaGalleryReveal"/);
 assert.match(page,/formulaExpanded: false/);
 assert.match(page,/state\.formulaExpanded=!state\.formulaExpanded/);
 assert.match(page,/const searching = Boolean\(q\) \|\| state\.formulaGroup !== 'all'/);
 assert.match(css,/\.formula-list:not\(\[data-expanded="true"\]\)>.formula-card:nth-child\(n\+5\)/);
 assert.match(css,/\.formula-card:nth-child\(1\)/);
 assert.match(css,/\.formula-card:nth-child\(2\)/);
});
