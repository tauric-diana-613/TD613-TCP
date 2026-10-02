import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import {
  MARROWLINE_READING_SURFACE_SCHEMA,
  renderMarrowlineReadingView,
  installMarrowlineReadingSurface
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
  const mounted=installMarrowlineReadingSurface(section,dom.window);
  assert.ok(mounted);
  assert.equal(mounted.raw,before);
  assert.equal(source.textContent,before);
  assert.equal(source.dataset.custodySurface,'exact-provider-return');
  assert.equal(source.hidden,true);
  assert.equal(mounted.reading.hidden,false);
  section.querySelector('button:nth-child(2)').click();
  assert.equal(source.hidden,false);
  assert.equal(mounted.reading.hidden,true);
  assert.equal(source.textContent,before);
  section.querySelector('button:nth-child(1)').click();
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
  installMarrowlineReadingSurface(section,dom.window);
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
  const first=installMarrowlineReadingSurface(section,dom.window);
  const second=installMarrowlineReadingSurface(section,dom.window);
  assert.ok(first);assert.equal(second,null);
  assert.equal(section.querySelectorAll('.marrowline-reading-surface').length,1);
  assert.equal(source.textContent,'### One\r\n\r\nTwo');
  dom.window.close();
});
