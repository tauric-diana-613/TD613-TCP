import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import resetApi from '../api/site-epoch-reset.js';
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
   if(item.isDirectory()){if(!p.includes('/fixtures/')&&!p.includes('/reference/'))walk(p);continue}
   if(!p.endsWith('.html')||p.endsWith('/site-epoch-reset.html'))continue;
   const src=read(p);
   if(src.toLowerCase().includes('<head')&&!src.includes('id="td613-sitewide-reset-preflight"'))missing.push(p);
 }}walk('app');
 assert.deepEqual(missing,[]);
 new vm.Script(preflight);new vm.Script(reset);
 assert(preflight.includes(epoch));
 assert(preflight.indexOf("location.replace(destination.href)")>0);
});
test('browser data purge includes conversations, Ash, storage, workers, and caches',()=>{
 for(const token of ['Clear-Site-Data','td613-marrowline-conversations-v1','td613-ash-keep','indexedDB.deleteDatabase','localStorage.clear()','sessionStorage.clear()','serviceWorker.getRegistrations','caches.delete'])assert(reset.includes(token)||read('api/site-epoch-reset.js').includes(token),token);
 assert(reset.includes('Blocked by another open tab'));
 assert(reset.includes('td613.ash.cache-preflight.epoch'));
 assert(ash.includes('sitewide_epoch_authoritative:true'));
 assert(ash.includes('legacy_reset_suppressed:true'));
});
test('reset endpoint returns destructive header only for same-origin epoch POST',()=>{
 function response(){const h={};return{h,setHeader(k,v){h[k.toLowerCase()]=v},status(n){this.code=n;return this},json(x){this.body=x;return this}}}
 let x=response();
 resetApi({method:'POST',headers:{'sec-fetch-site':'same-origin','x-td613-reset-epoch':epoch}},x);
 assert.equal(x.code,200);assert.equal(x.h['clear-site-data'],'"cache", "cookies", "storage"');
 for(const req of [{method:'GET',headers:{}},{method:'POST',headers:{'sec-fetch-site':'cross-site','x-td613-reset-epoch':epoch}}]){
   x=response();resetApi(req,x);assert.equal(x.code,403);assert.equal(x.h['clear-site-data'],undefined);
 }
 assert.equal(config.git.deploymentEnabled,false);
});
test('Flight rest is selectable in preface and close, and copiable in Glyph Bay',()=>{
 for(const value of ['id="bodyPreRest"','id="ftrRest"','data-copy="𝄐"','pre.push("𝄐")','lines.push("𝄐")'])assert(flight.includes(value),value);
 assert.equal(flight.split('id="bodyPreRest"').length-1,1);
 assert.equal(flight.split('id="ftrRest"').length-1,1);
});
