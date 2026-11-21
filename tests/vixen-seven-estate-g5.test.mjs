import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {
 inspectVixenPortableFidelity,PORTABLE_FIDELITY_SCHEMA
} from '../app/encyclopedia/vixen-estate/vixen-portable-fidelity.mjs';
import {
 downloadVixenSessionZip,buildVixenSessionZipBytes,crc32Bytes
} from '../app/encyclopedia/vixen-estate/session-zip.mjs';

const enc=new TextEncoder();
const base='https://example.test/encyclopedia/vix-cyb.html';
const stamp='2026-11-20T21:00:00.000Z';
const entry=(path,data)=>({path,data,mtime:new Date(stamp)});
const net=(resources)=>{
 const requests=[];
 const fetcher=async(url,options)=>{
  requests.push({url,options});
  const path=new URL(url).pathname.slice(1);
  if(!Object.hasOwn(resources,path))return {ok:false,status:404};
  const bytes=enc.encode(resources[path]);
  return {ok:true,url,headers:{get:()=>null},arrayBuffer:async()=>bytes.buffer};
 };
 return {fetcher,requests};
};
const syntheticReferenceIndex=()=>{
 const rows=Array.from({length:1141},(_,i)=>{
  const id='G-'+String(i+1).padStart(4,'0');
  return {id,record_path:'reference/records/'+id+'.json',record_sha256:'a'.repeat(64)};
 });
 const edges=Array.from({length:2131},()=>({source:'G-0001',target:'G-0002',type:'synthetic-link'}));
 return [
  entry('encyclopedia/reference/directory.json',JSON.stringify(rows)),
  entry('encyclopedia/reference/graph.json',JSON.stringify({edges})),
  entry('encyclopedia/reference/manifest.json',JSON.stringify({
   schema:'td613.encyclopedia.reference/v1',edition_version:'1.4',record_count:1141
  }))
 ];
};
const audit=({entries,fetcher,omitted=[]})=>inspectVixenPortableFidelity({
 entries,omitted,baseHref:base,fetcher,exportedAt:stamp,cryptoProvider:webcrypto
});

test('G5-A: recursive static module, CSS font and dynamic-literal closure keeps exact bytes',async()=>{
 const resources={
  'encyclopedia/vixen-estate/main.mjs':
    "import './side.mjs'; const late=import('./late.mjs'); const icon=new URL('./icon.svg',import.meta.url);",
  'encyclopedia/vixen-estate/side.mjs':"export {signal} from './core.mjs';",
  'encyclopedia/vixen-estate/core.mjs':"export const signal='ORIGINAL_METHOD_NOT_INFERRED';",
  'encyclopedia/vixen-estate/late.mjs':"export default 1;",
  'encyclopedia/vixen-estate/icon.svg':'<svg></svg>',
  'encyclopedia/vixen-estate/main.css':'@import "./nested.css";body{src:url("./spectrum.woff2")}',
  'encyclopedia/vixen-estate/nested.css':'body{opacity:1}',
  'encyclopedia/vixen-estate/spectrum.woff2':'synthetic font bytes'
 };
 const {fetcher,requests}=net(resources);
 const result=await audit({entries:[entry('encyclopedia/vix-cyb.html',
  '<script type="module" src="./vixen-estate/main.mjs"></script><link rel="stylesheet" href="./vixen-estate/main.css">'),
  ...syntheticReferenceIndex()],fetcher});
 assert.equal(result.manifest.schema,PORTABLE_FIDELITY_SCHEMA);
 assert.equal(result.fidelity,'ONLINE_REFERENCE_REQUIRED');
 assert.deepEqual(result.requiredMissing,[]);
 for(const p of Object.keys(resources)){
  const item=result.entries.find(e=>e.path===p);
  assert(item,p+' missing from archive');
  assert.equal(item.data.length,enc.encode(resources[p]).length);
  assert.match(result.manifest.file_digests_sha256[p].sha256,/^[a-f0-9]{64}$/);
 }
 assert(requests.every(r=>r.options.credentials==='omit'));
 assert.equal(result.manifest.rendered_extracted_boot,'NOT_EVALUATED');
 assert.equal(result.manifest.reference.offline_record_readback_all,false);
 assert.equal(result.manifest.reference.index_census_verified,true);
 assert.equal(result.manifest.reference.indexed_records,1141);
 assert.equal(result.manifest.rights_and_original_authority,'NOT_INFERRED_FROM_BUNDLE');
});

test('G5-B: absent required dynamic module prevents a success-like export',async()=>{
 const result=await audit({entries:[entry('encyclopedia/vix-cyb.html',
  '<script src="./vixen-estate/missing.mjs"></script>')],fetcher:async()=>({ok:false,status:404})});
 assert.equal(result.fidelity,'EXPORT_PARTIAL_HELD');
 assert.deepEqual(result.requiredMissing,['encyclopedia/vixen-estate/missing.mjs']);
});

test('G5-C: refused external executable and tampered source record remain HELD',async()=>{
 const body='{"id":"G-001","record":{"text":"source body"}}\n';
 const dir=JSON.stringify([{id:'G-001',record_path:'reference/records/G-001.json',record_sha256:'a'.repeat(64)}]);
 const result=await audit({entries:[
  entry('encyclopedia/vix-cyb.html','<script src="https://cdn.example.invalid/foreign.js"></script>'),
  entry('encyclopedia/reference/directory.json',dir),
  entry('encyclopedia/reference/records/G-001.json',body)
 ],fetcher:async()=>({ok:false,status:404})});
 assert.equal(result.fidelity,'EXPORT_PARTIAL_HELD');
 assert.deepEqual(result.manifest.reference.bad_or_unverified_record_ids,['G-001']);
 assert.equal(result.manifest.external_resource_dependencies.length,1);
 assert.equal(result.manifest.reference.offline_record_readback_all,false);
});

test('G5-D: exact permitted record body is hash-checked but never upgrades whole edition',async()=>{
 const body='{"id":"G-001","record":{"text":"operator-authorized example"}}\n';
 const bytes=enc.encode(body.trimEnd());
 const checksum=Array.from(new Uint8Array(await webcrypto.subtle.digest('SHA-256',bytes)),
  x=>x.toString(16).padStart(2,'0')).join('');
 const dir=JSON.stringify([{id:'G-001',record_path:'reference/records/G-001.json',record_sha256:checksum}]);
 const result=await audit({entries:[
  entry('encyclopedia/vix-cyb.html','<!doctype html><title>research</title>'),
  entry('encyclopedia/reference/directory.json',dir),
  entry('encyclopedia/reference/records/G-001.json',body)
 ],fetcher:async()=>({ok:false,status:404})});
 assert.equal(result.manifest.reference.bundled_verified_record_bodies,1);
 assert.deepEqual(result.manifest.reference.bad_or_unverified_record_ids,[]);
 assert.equal(result.manifest.reference.offline_record_readback_all,false);
 assert.equal(result.fidelity,'EXPORT_PARTIAL_HELD','One verified body cannot establish a fabricated one-record edition');
 assert.equal(result.manifest.reference.index_census_verified,false);
});

test('G5-E: all-fetch-failure exports are refused before ZIP download',async()=>{
 const res=await downloadVixenSessionZip({
  baseHref:base,fetcher:async()=>({ok:false,status:503}),documentRef:null,
  exportedAt:stamp,synthesisState:{}
 });
 assert.equal(res.ok,false);
 assert.equal(res.fidelity,'EXPORT_PARTIAL_HELD');
 assert.equal(res.triggered_download,false);
 assert.equal(res.manifest.reference.offline_record_readback_all,false);
});

test('G5-G: a multiline original named import is retained for actual browser boot',async()=>{
 const modules={
  'encyclopedia/vixen-estate/entry.mjs':
   "import {probe,\n original} from './em-source-challenge-probes.mjs';\nexport const seen=probe;",
  'encyclopedia/vixen-estate/em-source-challenge-probes.mjs':
   "export const probe='SOURCE_BOUND';export const original=true;"
 };
 const {fetcher}=net(modules);
 const result=await audit({entries:[entry('encyclopedia/vix-cyb.html',
  '<script type="module" src="./vixen-estate/entry.mjs"></script>'),
  ...syntheticReferenceIndex()],fetcher});
 assert.equal(result.fidelity,'ONLINE_REFERENCE_REQUIRED');
 assert.deepEqual(result.requiredMissing,[]);
 assert(result.entries.some(x=>x.path==='encyclopedia/vixen-estate/em-source-challenge-probes.mjs'));
 assert.equal(result.manifest.reference.index_census_verified,true);
});

test('G5-F: PKZIP retained CRC protection, no integrity certification from member count',()=>{
 const data=buildVixenSessionZipBytes([entry('SESSION_START_HERE.md','offline-held')]);
 assert.equal(new DataView(data.buffer).getUint32(0,true),0x04034b50);
 assert.equal(new DataView(data.buffer).getUint32(14,true),crc32Bytes(enc.encode('offline-held')));
 assert.equal(crc32Bytes(data)>>>0,crc32Bytes(new Uint8Array(data))>>>0);
});
