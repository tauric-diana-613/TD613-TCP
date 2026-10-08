import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { handleMarrowlineLoomGateCommand } from '../app/dome-world/marrowline-loom-footer.js';

for (const mobile of [false,true]) test(`Loom footer opens ${mobile?'mobile':'desktop'} Gate, preserves alerts and acknowledges only its reply`,()=>{
  const dom=new JSDOM('<button id="marrowlineInstrumentTab-gatePanel"></button><div class="mobile-dock"><button data-mobile-target="gatePanel"></button></div><details id="gatePanel"><p>OBSERVED_EXPOSURE · original finding</p></details>',{url:'https://td613.com'});
  const env=dom.window,doc=env.document; env.matchMedia=()=>({matches:mobile});
  env.fetch=()=>{throw new Error('Gate review must make no model request');};
  env.__TD613_LOOM_DEMO_CONTROLLER__={snapshot:()=>({active:true,current_result_request_id:'current'}),getGateReports:()=>[{status:'OBSERVED_EXPOSURE'}]};
  const control=mobile?doc.querySelector('.mobile-dock button'):doc.getElementById('marrowlineInstrumentTab-gatePanel');
  let navigations=0;control.addEventListener('click',()=>{navigations++;doc.getElementById('gatePanel').open=true;});
  const first=stage(dom,'Exact first'),second=stage(dom,'Exact second');
  installMarrowlineReadingSurface(first.section,env,{request_id:'current',phase:'CONTINUE'});
  installMarrowlineReadingSurface(second.section,env,{request_id:'different',phase:'ACTIVATE'});
  const button=first.section.querySelector('.marrowline-loom-gate-check');
  assert.equal(button.textContent,'米 Check Loom Gate');assert.equal(button.dataset.gateAttention,'true');
  assert.match(first.section.querySelector('footer').textContent,/Carried alert/);
  button.click(); assert.equal(navigations,1);assert.equal(button.dataset.gateAttention,'false');
  assert.equal(second.section.querySelector('.marrowline-loom-gate-check').dataset.gateAttention,'true');
  assert.match(first.section.querySelector('footer').textContent,/Carried alert.*review opened/);
  assert.match(doc.getElementById('gatePanel').textContent,/OBSERVED_EXPOSURE/);
  assert.equal(first.source.textContent,'Exact first');assert.equal(second.source.textContent,'Exact second');
  removeMarrowlineReadingSurface(first.section);installMarrowlineReadingSurface(first.section,env,{request_id:'current',phase:'CONTINUE'});
  assert.equal(first.section.querySelector('.marrowline-loom-gate-check').dataset.gateAttention,'false','rerender retains scoped acknowledgment');
  assert.equal(handleMarrowlineLoomGateCommand(' 米 ',doc,env),true);assert.equal(navigations,2);
  assert.equal(handleMarrowlineLoomGateCommand('explain 米',doc,env),false);
  env.__TD613_LOOM_DEMO_CONTROLLER__={snapshot:()=>({active:false})};
  assert.equal(handleMarrowlineLoomGateCommand('米',doc,env),false,'ordinary chat keeps its normal meaning');
  dom.window.close();
});
import {
  MARROWLINE_READING_SURFACE_SCHEMA,
  MARROWLINE_LOOM_READING_WORK_UNIT_SCHEMA,
  MARROWLINE_LOOM_HELD_READING_SCHEMA,
  renderMarrowlineReadingView,
  installMarrowlineReadingSurface,
  removeMarrowlineReadingSurface,
  resolveMarrowlineLoomReadingAuthority
} from '../app/dome-world/marrowline-reading-surface.js';

const fixture = [
  '### Acquisition diligence',
  '',
  '**Option A total:** $137,591.52',
  '',
  '1. Preserve source IDs.',
  '2. Distinguish arithmetic from assumptions.',
  '',
  '> Finite pilot evidence does not establish a hard throughput ceiling.',
  '',
  '$$',
  '38 × 240 × 12 = 109440',
  '$$',
  '',
  'Raw HTML stays text: <img src=x onerror="globalThis.PWNED=true">',
  '',
  'Tauric Diana: h̴̢̛͈õ̵̖̿t̶̬͝'
].join('\n');

test('held archive has a readable presentation after expiry without admitted coordinates or rewritten bytes',()=>{
  const dom=new JSDOM('<body></body>');
  const {section,source}=stage(dom);
  const card=dom.window.document.createElement('article');card.append(section);
  card.dataset.loomHeldReadingSchema=MARROWLINE_LOOM_HELD_READING_SCHEMA;
  card.dataset.loomHeldReadingRequestId='held-request';card.dataset.loomHeldReadingPhase='CONTINUE';
  const authority=resolveMarrowlineLoomReadingAuthority(card,{__TD613_LOOM_DEMO_CONTROLLER__:{snapshot:()=>({active:false,phase:'EXPIRED'})}});
  assert.equal(authority.held,true);assert.equal(authority.admission_authority,false);
  const view=installMarrowlineReadingSurface(section,dom.window,authority);
  assert.equal(source.textContent,fixture);assert.match(section.querySelector('.marrowline-reading-claim').textContent,/admission remains held/);
  assert.equal(card.dataset.loomReadingRequestId,undefined);
  view.select('exact');assert.equal(source.hidden,false);assert.equal(source.textContent,fixture);
  delete card.dataset.loomHeldReadingRequestId;assert.equal(resolveMarrowlineLoomReadingAuthority(card,{}),null);
  dom.window.close();
});

function stage(dom, raw=fixture){
  const doc=dom.window.document;
  const section=doc.createElement('section');section.className='relay-stage relay-khonapolit';
  const source=doc.createElement('div');source.className='relay-stage-text';source.textContent=raw;
  section.append(source);doc.body.append(section);
  return {doc,section,source};
}

test('reading renderer creates a safe professional subset without interpreting raw HTML',()=>{
  const dom=new JSDOM('<body></body>');
  const view=renderMarrowlineReadingView(dom.window.document,fixture);
  assert.equal(view.dataset.schema,MARROWLINE_READING_SURFACE_SCHEMA);
  assert.equal(view.querySelector('h4')?.textContent,'Acquisition diligence');
  assert.equal(view.querySelector('strong')?.textContent,'Option A total:');
  assert.deepEqual([...view.querySelectorAll('ol li')].map(n=>n.textContent),[
    'Preserve source IDs.','Distinguish arithmetic from assumptions.'
  ]);
  assert.match(view.querySelector('blockquote')?.textContent||'',/Finite pilot evidence/);
  assert.equal(view.querySelector('.marrowline-reading-equation code')?.textContent,'38 × 240 × 12 = 109440');
  assert.equal(view.querySelector('img'),null,'provider HTML must never become executable DOM');
  assert.match(view.textContent,/Raw HTML stays text: <img src=x onerror=/);
  assert.match(view.textContent,/h̴̢̛͈õ̵̖̿t̶̬͝/,'provider Unicode survives presentation');
  dom.window.close();
});

test('dual surface leaves canonical provider text untouched across reading/exact toggles',()=>{
  const dom=new JSDOM('<body></body>',{url:'https://td613.com/dome-world/marrowline.html'});
  const {section,source}=stage(dom);
  const before=source.textContent;
  const mounted=installMarrowlineReadingSurface(section,dom.window,{request_id:'req-current',phase:'CONTINUE'});
  assert.ok(mounted);
  assert.equal(mounted.raw,before);
  assert.equal(source.textContent,before);
  assert.equal(source.dataset.custodySurface,'exact-provider-return');
  assert.equal(source.hidden,true);
  assert.equal(mounted.reading.hidden,false);
  [...section.querySelectorAll('button')].find(button=>button.textContent==='Exact').click();
  assert.equal(source.hidden,false);
  assert.equal(mounted.reading.hidden,true);
  assert.equal(source.textContent,before);
  [...section.querySelectorAll('button')].find(button=>button.textContent==='Reading').click();
  assert.equal(source.hidden,true);
  assert.equal(mounted.reading.hidden,false);
  assert.equal(source.textContent,before);
  dom.window.close();
});

test('Copy exact emits the untouched provider return rather than reading-view text',async()=>{
  const dom=new JSDOM('<body></body>',{url:'https://td613.com/dome-world/marrowline.html'});
  const {section,source}=stage(dom);
  let copied=null;
  Object.defineProperty(dom.window.navigator,'clipboard',{configurable:true,value:{writeText:async value=>{copied=value;}}});
  installMarrowlineReadingSurface(section,dom.window,{request_id:'req-current',phase:'CONTINUE'});
  const copy=[...section.querySelectorAll('button')].find(button=>button.textContent==='Copy exact');
  await copy.click();
  await Promise.resolve();
  assert.equal(copied,fixture);
  assert.equal(source.textContent,fixture);
  assert.match(section.querySelector('.marrowline-reading-status').textContent,/copied/i);
  dom.window.close();
});

test('reading surface installs only once and keeps exact source node canonical',()=>{
  const dom=new JSDOM('<body></body>',{url:'https://td613.com/dome-world/marrowline.html'});
  const {section,source}=stage(dom,'### One\r\n\r\nTwo');
  const first=installMarrowlineReadingSurface(section,dom.window,{request_id:'req-current',phase:'CONTINUE'});
  const second=installMarrowlineReadingSurface(section,dom.window,{request_id:'req-current',phase:'CONTINUE'});
  assert.ok(first);assert.equal(second,null);
  assert.equal(section.querySelectorAll('.marrowline-reading-surface').length,1);
  assert.equal(source.textContent,'### One\r\n\r\nTwo');
  dom.window.close();
});


function governedCard(dom,{requestId='req-current',phase='CONTINUE',expiresAt=Date.now()+60_000}={}){
  const card=dom.window.document.createElement('article');
  card.dataset.loomReadingSchema=MARROWLINE_LOOM_READING_WORK_UNIT_SCHEMA;
  card.dataset.loomReadingRequestId=requestId;
  card.dataset.loomReadingPhase=phase;
  card.dataset.loomReadingExpiresAt=String(expiresAt);
  return card;
}

test('reading authority requires both a current Loom controller and the current admitted work unit',()=>{
  const dom=new JSDOM('<body></body>',{url:'https://td613.com/dome-world/marrowline.html'});
  const ordinary=dom.window.document.createElement('article');
  assert.equal(resolveMarrowlineLoomReadingAuthority(ordinary,dom.window),null,'ordinary integrated/native reply has no authority');

  const historical=governedCard(dom,{requestId:'req-old'});
  assert.equal(resolveMarrowlineLoomReadingAuthority(historical,dom.window),null,'saved Loom marker alone cannot restore authority after reload');

  dom.window.__TD613_LOOM_DEMO_CONTROLLER__={snapshot:()=>({
    active:true,phase:'DONE',current_result_request_id:'req-current',predecessor_request_id:'req-current'
  })};
  assert.equal(resolveMarrowlineLoomReadingAuthority(historical,dom.window),null,'historical Loom contact cannot inherit current work-unit authority');

  const current=governedCard(dom);
  assert.equal(resolveMarrowlineLoomReadingAuthority(current,dom.window)?.request_id,'req-current','current admitted work unit is eligible');

  dom.window.history.replaceState(null,'','/dome-world/marrowline.html#loom-demo');
  const forged=dom.window.document.createElement('article');
  assert.equal(resolveMarrowlineLoomReadingAuthority(forged,dom.window),null,'route/hash text cannot manufacture message ancestry');

  const expired=governedCard(dom,{expiresAt:Date.now()-1});
  assert.equal(resolveMarrowlineLoomReadingAuthority(expired,dom.window),null,'expired work unit is held');

  dom.window.__TD613_LOOM_DEMO_CONTROLLER__={snapshot:()=>({
    active:true,phase:'EXPIRED',current_result_request_id:'req-current',predecessor_request_id:'req-current'
  })};
  assert.equal(resolveMarrowlineLoomReadingAuthority(current,dom.window),null,'expired route state cannot manufacture current custody UI');
  dom.window.close();
});

test('installer fails closed without Loom authority and removal restores exact source',()=>{
  const dom=new JSDOM('<body></body>',{url:'https://td613.com/dome-world/marrowline.html'});
  const {section,source}=stage(dom,'Exact bytes');
  assert.equal(installMarrowlineReadingSurface(section,dom.window),null);
  assert.equal(source.hidden,false);
  const mounted=installMarrowlineReadingSurface(section,dom.window,{request_id:'req-current',phase:'CONTINUE'});
  assert.ok(mounted);
  assert.equal(source.hidden,true);
  assert.equal(removeMarrowlineReadingSurface(section),true);
  assert.equal(source.hidden,false);
  assert.equal(section.querySelector('.marrowline-reading-surface'),null);
  assert.equal(source.textContent,'Exact bytes');
  dom.window.close();
});
