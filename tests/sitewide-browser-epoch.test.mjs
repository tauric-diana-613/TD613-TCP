import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import resetApi from '../lib/site-epoch-reset.js';

const read=p=>fs.readFileSync(p,'utf8');
const epoch='td613.site.browser-reset/2026-09-27-v1';
const preflight=read('app/site-epoch-preflight.js');
const reset=read('app/site-epoch-reset.js');
const resetPage=read('app/site-epoch-reset.html');
const flight=read('app/safe-harbor/td613-flight.html');
const ash=read('lib/dome-world-shell-core.js');
const config=JSON.parse(read('vercel.json'));

test('legacy site epoch preflight is a non-destructive compatibility shim',()=>{
  const missing=[];
  function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
    const p=path.join(dir,item.name).replaceAll('\\','/');
    if(item.isDirectory()){if(!/(^|\/)(fixtures|reference)(\/|$)/.test(p))walk(p);continue}
    if(!p.endsWith('.html')||p.endsWith('/site-epoch-reset.html'))continue;
    if(p==='app/dome-world/ash-keep.html'||p==='app/dome-world/ash-keep-source.html')continue;
    const src=read(p);
    if(src.toLowerCase().includes('<head')&&!src.includes('id="td613-sitewide-reset-preflight"'))missing.push(p);
  }}walk('app');
  assert.deepEqual(missing,[]);
  new vm.Script(preflight);
  assert.doesNotMatch(preflight,/location\.replace|localStorage|sessionStorage|indexedDB|serviceWorker|caches\.delete|Clear-Site-Data/);
  assert.match(preflight,/searchParams\.delete\('td613_site_epoch'\)/);
});

test('legacy reset URL cannot erase browser data or show the old epoch screen',()=>{
  new vm.Script(reset);
  assert.doesNotMatch(reset,/localStorage\.clear|sessionStorage\.clear|indexedDB\.deleteDatabase|serviceWorker|getRegistrations|caches\.delete|fetch\('\/api\/site-epoch-reset/);
  assert.doesNotMatch(resetPage,/Fresh browser epoch|browser data cleared|will be erased|Clearing old browser data/i);
  assert.match(resetPage,/location\.replace\(target\)/);
});

test('legacy reset endpoint is retired and emits no destructive header',()=>{
  function response(){const h={};return{h,setHeader(k,v){h[k.toLowerCase()]=v},end(body){this.body=JSON.parse(body)}}}
  let x=response();
  resetApi({method:'POST',headers:{'sec-fetch-site':'same-origin','x-td613-reset-epoch':epoch}},x);
  assert.equal(x.statusCode,410);
  assert.equal(x.h['clear-site-data'],undefined);
  assert.equal(x.body.status,'RETIRED');
  assert.equal(x.body.destructive,false);
  x=response();
  resetApi({method:'GET',headers:{}},x);
  assert.equal(x.statusCode,403);
  assert.equal(config.git.deploymentEnabled,false);
  assert(config.rewrites.some(x=>x.source==='/api/site-epoch-reset'&&x.destination==='/api/dome-world-shell?surface=site-epoch-reset'));
  assert.equal(fs.readdirSync('api').filter(x=>/\.(js|py)$/.test(x)).length,11);
});

test('Flight rest is selectable in preface and close, and copiable in Glyph Bay',()=>{
  for(const value of ['id="bodyPreRest"','id="ftrRest"','data-copy="𝄐"','pre.push("𝄐")','lines.push("𝄐")'])assert(flight.includes(value),value);
  assert.equal(flight.split('id="bodyPreRest"').length-1,1);
  assert.equal(flight.split('id="ftrRest"').length-1,1);
});

test('Ash specialist eviction remains retired while the legacy site shim is inert',()=>{
  assert(ash.includes('retired:true'));
  assert(ash.includes("window.__td613AshAia3Preflight=Promise.resolve(receipt)"));
  assert(!ash.includes('Clear-Site-Data'));
  assert(!ash.includes('caches.keys'));
  assert(!ash.includes('getRegistrations'));
  assert(!ash.includes('location.replace(recoveryBridge)'));
  assert(!ash.includes("url.searchParams.set('surface','cache-evict')"));
});
