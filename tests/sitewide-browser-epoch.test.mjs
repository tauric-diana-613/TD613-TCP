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
const localClosure=read('scripts/ash-keep-local-closure-server.mjs');
const epochBaseline=read('scripts/site-epoch-browser-baseline.mjs');
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
 assert(reset.includes('td613.ash.cache-preflight.epoch'));
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
 for(const mapping of [
   "pathname === '/site-epoch-preflight.js'",
   "return 'app/site-epoch-preflight.js'",
   "pathname === '/site-epoch-reset.js'",
   "return 'app/site-epoch-reset.js'",
   "pathname === '/site-epoch-reset.html'",
   "return 'app/site-epoch-reset.html'",
   "url.pathname === '/api/site-epoch-reset'",
   "handleSiteEpochReset(req, res)"
 ]) assert(localClosure.includes(mapping), 'local closure server must preserve production site-epoch geometry: '+mapping);
});
test('Flight rest is selectable in preface and close, and copiable in Glyph Bay',()=>{
 for(const value of ['id="bodyPreRest"','id="ftrRest"','data-copy="𝄐"','pre.push("𝄐")','lines.push("𝄐")'])assert(flight.includes(value),value);
 assert.equal(flight.split('id="bodyPreRest"').length-1,1);
 assert.equal(flight.split('id="ftrRest"').length-1,1);
});

test('Ash specialist presentation retains historical receipt semantics after the universal epoch',()=>{
 assert(ash.includes('sitewide_epoch_authoritative:true,legacy_reset_suppressed:true,legacy_bypass:legacyPresentation'));
 const wrapper=read('scripts/ash-lifecycle-production-probe.mjs');
 assert(wrapper.includes('first-visit site epoch before lifecycle network capture'));
 assert(wrapper.includes('site-epoch-reset.html?return=%2F'));
 assert(wrapper.includes('const page = await context.newPage();'));
 assert(wrapper.includes('td613.site.browser-reset.epoch'));
 assert(wrapper.includes("  'td613.ash.session.epoch',\\n  'td613.site.browser-reset.epoch'\\n]);"), 'Ash local-storage witness must allow the one-time origin marker');
 assert(!wrapper.includes("if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))"), 'local closure now supports the site epoch and may not bypass first-visit reset isolation');
 assert(wrapper.includes("!new URL(location.href).searchParams.has('td613_site_epoch')"), 'lifecycle witness must wait through reset return cleanup before opening the measured page');
 assert(wrapper.includes('await context.addInitScript'), 'lifecycle witness must bind the earned epoch before subsequent document scripts');
 assert(epochBaseline.includes("!current.searchParams.has('td613_site_epoch')"), 'shared browser baseline must not sample storage during reset return navigation');
 assert(epochBaseline.includes('candidate.pathname === expectedReturn.pathname'), 'shared browser baseline must settle on the requested return route');
 assert(!wrapper.includes('legacy eviction before first-visit reset'));
});
