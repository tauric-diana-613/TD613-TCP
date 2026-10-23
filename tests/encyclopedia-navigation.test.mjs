import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import {JSDOM,VirtualConsole} from 'jsdom';
const html=await readFile(new URL('../app/encyclopedia/index.html',import.meta.url),'utf8');
const pause=(ms=25)=>new Promise(r=>setTimeout(r,ms));
function fixture({mobile=false,url='https://td613.test/encyclopedia/',state=null}={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const canvas=new Proxy({measureText:s=>({width:String(s).length*7})},{get:(o,k)=>o[k]||(()=>{})});
 const dom=new JSDOM(html,{url,runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,beforeParse(w){
  w.matchMedia=q=>({matches:q.includes('reduced-motion')||(mobile&&q.includes('680px')),addEventListener(){}});
  w.scrollTo=({top=0})=>Object.defineProperty(w,'scrollY',{value:top,writable:true,configurable:true});
  w.HTMLElement.prototype.scrollIntoView=function(){w.scrollTo({top:123})};
  w.HTMLCanvasElement.prototype.getContext=()=>canvas;
  w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','')};
  w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'))};
  w.queueMicrotask=callback=>callback(); // Deliberately flush at scheduling time: before the later bubble listener.
  if(state)w.history.replaceState(state,'',url);
 }});
 const w=dom.window,d=w.document;
 const click=async selector=>{const e=d.querySelector(selector);assert(e,selector);e.focus();e.click();await pause();return e};
 const change=async(id,value,type='change')=>{const e=d.getElementById(id);e.value=value;e.dispatchEvent(new w.Event(type,{bubbles:true}));await pause(200)};
 return {dom,w,d,errors,click,change,close(){assert.deepEqual(errors,[]);w.close()}};
}
test('canonical payload binds the current research edition bytes',()=>{
 const json=html.match(/<script id="canonical-audit-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
 assert.equal(createHash('sha256').update(json).digest('hex'),'ff0c98f564c9157f22b8603a20ddefa3ca13d843b17bdfb7e2a495408a49b4c9');
});
test('cover source inventory follows the current source registry',()=>{
 const f=fixture();
 try{assert.equal(f.d.querySelector('.stat-btn[data-view="sources"] .stat-value').textContent,'92')}finally{f.close()}
});
for(const mobile of [false,true])test(`reading journey with ${mobile?'mobile':'desktop'} DOM branches`,async()=>{
 const f=fixture({mobile}),{d,w,click,change}=f;
 try{
  await click('.main-nav [data-view="lexicon"]');
  assert.equal(d.querySelectorAll('[data-select-term]').length,100);
  assert.match(d.getElementById('lexiconPaginationTop').textContent,/1–100 of 533/);
  assert.match(d.getElementById('lexiconPagination').textContent,/1–100 of 533/);
  await click('#lexiconPaginationTop [data-page-number="2"]');
  assert.equal(d.querySelector('[data-select-term]').dataset.selectTerm,'G-101');
  await change('lexiconPageSize','50');
  assert.equal(d.querySelectorAll('[data-select-term]').length,50);
  assert.match(d.getElementById('lexiconPagination').textContent,/101–150 of 533/);
  await change('lexiconPageSize','100');
  w.scrollTo({top:2400});
  await click('[data-select-term="G-150"]');
  assert.equal(d.getElementById('lexiconReader').classList.contains('mobile-reader-open'),mobile);
  await click('[data-adjacent-term="1"]');
  assert.match(d.getElementById('lexiconReader').textContent,/G-151/);
  await click('#readingBack');
  assert.match(d.getElementById('lexiconReader').textContent,/G-150/);
  await click('#readingBack');
  assert.equal(w.scrollY,2400);
  assert.equal(d.activeElement.dataset.selectTerm,'G-150');
  assert(!d.getElementById('lexiconReader').classList.contains('mobile-reader-open'));
  await change('lexiconSearch','G-101','input');
  assert.equal(d.querySelectorAll('[data-select-term]').length,1);
  await click('[data-select-term="G-101"]');
  await click('#lexiconReader [data-record="G-101"]');
  const recordDepth=w.history.state.depth;
  assert(d.getElementById('dossierDialog').open);
  await click('#dossierBody [data-record^="SRC-"]');
  assert(w.location.hash.startsWith('#record=SRC-'));
  await click('[data-action="dossier-back"]');
  assert.equal(w.history.state.depth,recordDepth);
  assert.match(d.getElementById('dossierMeta').textContent,/G-101/);
  await click('[data-action="close-dossier"]');
  assert(!d.getElementById('dossierDialog').open);
  assert.equal(d.getElementById('lexiconSearch').value,'G-101');
  await click('.main-nav [data-view="evidence"]');
  w.history.back();await pause();
  assert(!d.getElementById('view-lexicon').hidden);
  assert.equal(d.getElementById('lexiconSearch').value,'G-101');
  w.history.forward();await pause();
  assert(!d.getElementById('view-evidence').hidden);
  await click('.main-nav [data-view="lexicon"]');
  await click('[data-action="reset-lexicon"]');
  await click('[data-select-term="G-100"]');
  await click('[data-adjacent-term="1"]');
  assert.match(d.getElementById('lexiconPagination').textContent,/101–200/);
  assert.match(d.getElementById('lexiconReader').textContent,/G-101/);
  await click('#lexiconReader [data-save="G-101"]');
  assert.equal(d.getElementById('collectionCount').textContent,'1');
  assert.equal(d.querySelectorAll('[id]').length,new Set([...d.querySelectorAll('[id]')].map(e=>e.id)).size);
 }finally{f.close()}
});
test('reload restores reading state; direct record arrival has a working fallback',async()=>{
 const f=fixture({mobile:true});let saved,url;
 try{await f.click('[data-view="lexicon"]');await f.change('lexiconPageSize','25');await f.click('#lexiconPagination [data-page-number="2"]');await f.click('[data-select-term="G-030"]');f.w.scrollTo({top:700});f.w.dispatchEvent(new f.w.Event('pagehide'));saved=JSON.parse(JSON.stringify(f.w.history.state));url=f.w.location.href}finally{f.close()}
 const reload=fixture({mobile:true,url,state:saved});
 try{assert.equal(reload.d.getElementById('lexiconPageSize').value,'25');assert.match(reload.d.getElementById('lexiconReader').textContent,/G-030/);assert(reload.d.getElementById('lexiconReader').classList.contains('mobile-reader-open'));assert.equal(reload.w.scrollY,700)}finally{reload.close()}
 const direct=fixture({mobile:true,url:'https://td613.test/encyclopedia/#record=G-101'});
 try{assert(direct.d.getElementById('dossierDialog').open);await direct.click('[data-action="close-dossier"]');assert(!direct.d.getElementById('dossierDialog').open);assert(!direct.d.getElementById('view-lexicon').hidden);await direct.click('#readingBack');assert(!direct.d.getElementById('view-overview').hidden);assert.equal(direct.d.getElementById('readingBack').getAttribute('href'),'/aperture/')}finally{direct.close()}
});
test('empty results, malformed fragments and out-of-range adjacency remain bounded',async()=>{
 const f=fixture();try{await f.click('[data-view="lexicon"]');await f.change('lexiconSearch','zzzz-no-match','input');assert.equal(f.d.querySelectorAll('[data-select-term]').length,0);assert(f.d.getElementById('lexiconReader').hidden);await f.click('[data-action="reset-lexicon"]');await f.click('[data-select-term="G-001"]');assert(f.d.querySelector('[data-adjacent-term="-1"]').disabled);f.w.location.hash='record=%E0%A4%A';await pause();assert(!f.d.getElementById('dossierDialog').open)}finally{f.close()}
});
test('search from a source dossier preserves the original record and its return path',async()=>{
 const f=fixture();try{
  await f.click('[data-view="lexicon"]');await f.click('#lexiconReader [data-record]');
  const original=f.d.getElementById('dossierMeta').textContent;
  await f.click('[data-action="search"]');await f.change('commandSearch','M-01','input');
  await f.click('[data-search-record="M-01"]');
  assert.match(f.d.getElementById('dossierMeta').textContent,/M-01/);
  await f.click('[data-action="dossier-back"]');
  assert.equal(f.d.getElementById('dossierMeta').textContent,original);
  await f.click('[data-action="close-dossier"]');
  assert(!f.d.getElementById('dossierDialog').open);
  await f.click('[data-action="about"]');
  assert.match(f.d.getElementById('dossierTitle').textContent,/reading atlas/);
  f.d.getElementById('dossierDialog').dispatchEvent(new f.w.Event('cancel',{cancelable:true}));await pause();
  assert(!f.d.getElementById('dossierDialog').open);
 }finally{f.close()}
});
test('retained instruments, evidence inventories and collection still execute',async()=>{
 const f=fixture();try{
  await f.click('[data-view="observatory"]');assert.equal(f.d.querySelectorAll('[data-engine]').length,4);
  await f.click('[data-engine="fadt"]');assert.equal(f.d.querySelectorAll('[data-fadt-row]').length,18);
  const before=f.d.getElementById('engineResults').textContent;await f.click('[data-fadt-row="0"][data-fadt-bit="2"]');
  assert.notEqual(f.d.getElementById('engineResults').textContent,before);
  await f.click('[data-formula-filter="bridged"]');assert.match(f.d.getElementById('formulaSummary').textContent,/21 entries/);
  await f.click('[data-view="evidence"]');await f.click('[data-evidence-kind="labs"]');assert.match(f.d.getElementById('evidenceSummary').textContent,/343 of 343/);
  await f.click('[data-evidence-kind="burdens"]');assert.match(f.d.getElementById('evidenceSummary').textContent,/37 of 37/);
  await f.click('[data-view="sources"]');await f.click('[data-source-kind="pdf"]');assert.match(f.d.getElementById('sourceSummary').textContent,/7 of 7/);
  await f.click('[data-source-kind="contract"]');assert.match(f.d.getElementById('sourceSummary').textContent,/40 of 40/);
 }finally{f.close()}
});
// Layout, browser paint, screen-reader output and physical iOS remain separate witnesses.
