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
const flight=read('app/safe-harbor/td613-flight.html');
const ash=read('lib/dome-world-shell-core.js');
const config=JSON.parse(read('vercel.json'));
test('one universal epoch loads before station code',()=>{
 const missing=[];
 function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
   const p=path.join(dir,item.name).replaceAll('\\','/');
   if(item.isDirectory()){if(!/(^|\/)(fixtures|reference)(\/|$)/.test(p))walk(p);continue}
   if(!p.endsWith('.html')||p.endsWith('/site-epoch-reset.html'))continue;
   if(p==='app/dome-world/ash-keep.html'||p==='app/dome-world/ash-keep-source.html')continue; // Frozen mirror pair: server shell injects the preflight.
   const src=read(p);
   if(src.toLowerCase().includes('<head')&&!src.includes('id="td613-sitewide-reset-preflight"'))missing.push(p);
 }}walk('app');
 assert.deepEqual(missing,[]);
 assert(ash.includes('additions.push(SITE_RESET_BOOT)'), 'P0 frozen Ash must get its reset at delivery, not through a source mutation');
 new vm.Script(preflight);new vm.Script(reset);
 assert(preflight.includes(epoch));
 assert(preflight.indexOf("location.replace(destination.href)")>0);
});
test('browser data purge includes conversations, Ash, storage, workers, and caches',()=>{
 for(const token of ['Clear-Site-Data','td613-marrowline-conversations-v1','td613-ash-keep','indexedDB.deleteDatabase','localStorage.clear()','sessionStorage.clear()','serviceWorker.getRegistrations','caches.delete'])assert(reset.includes(token)||read('lib/site-epoch-reset.js').includes(token),token);
 assert(reset.includes('Blocked by another open tab'));
 assert(!reset.includes('td613.ash.cache-preflight.epoch'));
 assert(!reset.includes('td613.ash.cache-flush.aia3.epoch'));
 assert(!reset.includes('td613.ash.cache-flush.epoch'));
 assert(ash.includes('sitewide_epoch_authoritative:true'));
 assert(ash.includes('legacy_reset_suppressed:true'));
});
test('reset endpoint returns destructive header only for same-origin epoch POST',()=>{
 function response(){const h={};return{h,setHeader(k,v){h[k.toLowerCase()]=v},end(body){this.body=JSON.parse(body)}}}
 let x=response();
 resetApi({method:'POST',headers:{'sec-fetch-site':'same-origin','x-td613-reset-epoch':epoch}},x);
 assert.equal(x.statusCode,200);assert.equal(x.h['clear-site-data'],'"cache", "cookies", "storage"');
 for(const req of [{method:'GET',headers:{}},{method:'POST',headers:{'sec-fetch-site':'cross-site','x-td613-reset-epoch':epoch}}]){
   x=response();resetApi(req,x);assert.equal(x.statusCode,403);assert.equal(x.h['clear-site-data'],undefined);
 }
 assert.equal(config.git.deploymentEnabled,false);
 assert(config.rewrites.some(x=>x.source==='/api/site-epoch-reset'&&x.destination==='/api/dome-world-shell?surface=site-epoch-reset'));
 assert.equal(fs.readdirSync('api').filter(x=>/\.(js|py)$/.test(x)).length,11);
});
test('Flight rest is selectable in preface and close, and copiable in Glyph Bay',()=>{
 for(const value of ['id="bodyPreRest"','id="ftrRest"','data-copy="𝄐"','pre.push("𝄐")','lines.push("𝄐")'])assert(flight.includes(value),value);
 assert.equal(flight.split('id="bodyPreRest"').length-1,1);
 assert.equal(flight.split('id="ftrRest"').length-1,1);
});

test('Ash specialist presentation is compatibility-only after the universal epoch',()=>{
 assert(ash.includes('retired:true'));
 assert(ash.includes('sitewide_epoch_authoritative:true'));
 assert(ash.includes("window.__td613AshAia3Preflight=Promise.resolve(receipt)"));
 assert(!ash.includes('Clear-Site-Data'));
 assert(!ash.includes('caches.keys'));
 assert(!ash.includes('getRegistrations'));
 assert(!ash.includes('location.replace(recoveryBridge)'));
 assert(!ash.includes("url.searchParams.set('surface','cache-evict')"));
});
