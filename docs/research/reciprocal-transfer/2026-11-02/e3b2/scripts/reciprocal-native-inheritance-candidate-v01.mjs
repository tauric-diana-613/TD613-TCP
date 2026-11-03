// 𝌋 Stage III-B.2 — source-free independent adapter candidate, NOT either deployed Universal recipient.
// Human source rights, scientific adjudication, and activation remain RESERVED.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto, { createHash } from 'node:crypto';
import {pathToFileURL} from 'node:url';
const digest=x=>createHash('sha256').update(x).digest('hex');
const fail=x=>{throw Object.assign(new Error(x),{code:x})};
const TD='TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER';
const W='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA';
export const ROUTES=Object.freeze({
 [TD]:{source:'TD613_ENCYCLOPEDIA',recipient:'UNIVERSAL_ATELIER_CANDIDATE',epoch:'td613-reference-edition-1.4',pin:'50cc9d161f8f72c2d4b6ea33ece17ace88f35eff'},
 [W]:{source:'WENDBINE_PUBLIC_ATELIER',recipient:'UNIVERSAL_ENCYCLOPEDIA_CANDIDATE',epoch:'wendbine-public-v0.1-synthetic',pin:'a8a619378f5a47137a8bd7d1765d47571f383e1e'}
});
export const NATIVE_PINS=Object.freeze({
 td:{file:'encyclopedia-native-reference-runtime.js',sha256:'92bcf30f1900f4336e7c0a175c00db32c5bd9334e7e4e7339dcee76aff438e69'},
 wquery:{file:'wendbine-query-source-pin.mjs',sha256:'405f6ad6ccfc781f2cda4edb5ad7e7fb6c273203573eb676c7c0b307723def05'},
 wcompile:{file:'wendbine-compile.mjs',sha256:'1e87e611524fc25ccb33c7ce63d51a7edfc92ea926c28ed2347c44f99fb45bb0'}
});
function directory(dir){if(!path.isAbsolute(dir)||!fs.existsSync(dir)||fs.lstatSync(dir).isSymbolicLink()||!fs.statSync(dir).isDirectory())fail('ABSOLUTE_REAL_DIRECTORY_REQUIRED');return fs.realpathSync(dir)}
function ordinary(file){if(!fs.existsSync(file)||fs.lstatSync(file).isSymbolicLink()||!fs.lstatSync(file).isFile())fail('FILE_ABSENT_OR_SUBSTITUTED');return file}
function pinned(root,key){const s=NATIVE_PINS[key],f=ordinary(path.join(directory(root),s.file));if(digest(fs.readFileSync(f))!==s.sha256)fail('ORIGINAL_NATIVE_CODE_DRIFT');return f}
function tdInput(snapshot){
 if(!snapshot||snapshot.manifest?.schema!=='td613.encyclopedia.reference/v1'||snapshot.manifest?.edition_version!=='1.4'||!Array.isArray(snapshot.records)||!Array.isArray(snapshot.directory)||!snapshot.records.length||snapshot.records.length!==snapshot.directory.length)fail('TD613_EDITION_OR_RECORDS_REFUSED');
 const ids=new Set(),dir=new Map(snapshot.directory.map(x=>[x.id,x]));if(dir.size!==snapshot.directory.length)fail('TD613_DUPLICATE_DIRECTORY');
 for(const r of snapshot.records){if(!r?.id?.startsWith('R-FIXTURE-')||ids.has(r.id)||r.evidence_class!=='SYNTHETIC'||r.visibility==='private'||!Array.isArray(r.links)||!r.origin||!Array.isArray(r.source_keys))fail('TD613_SYNTHETIC_RECORD_REFUSED');ids.add(r.id);if(dir.get(r.id)?.record_sha256!==digest(JSON.stringify(r).replace(/</g,'\\u003c')))fail('TD613_RECORD_HASH_REFUSED');}
 if([...dir.keys()].some(id=>!ids.has(id)))fail('TD613_DIRECTORY_NOT_BOUND');
 return snapshot;
}
function wInput(snapshot){
 if(snapshot?.meta?.schema!=='wendbine-public-corpus-snapshot/v0.1'||snapshot.meta.rights?.full_post_bodies_copied!==false||snapshot.meta.scope?.private_google_group_admitted!==false||snapshot.meta.scope?.surface!=='synthetic'||snapshot.meta.scope?.community!=='r/Wendbine'||!Array.isArray(snapshot.posts)||!Array.isArray(snapshot.relations))fail('WENDBINE_PUBLIC_RIGHTS_OR_EPOCH_REFUSED');
 const bodyFields=['body','body_text','content','full_text','post_body','private_text','raw_body','source_body','source_text','text'];
 const ids=new Set();for(const p of snapshot.posts){if(!p?.source_id?.startsWith('reddit:t3_fixture')||ids.has(p.source_id)||p.source_text_stored!==false||p.community!=='r/Wendbine'||p.time_precision!=='DAY'||!/^\d{4}-\d{2}-\d{2}$/.test(p.public_date||'')||bodyFields.some(k=>Object.hasOwn(p,k)))fail('WENDBINE_PUBLIC_ROW_REFUSED');ids.add(p.source_id)}
 if(snapshot.meta.coverage?.admitted_source_count!==snapshot.posts.length)fail('WENDBINE_COVERAGE_MISMATCH');
 return snapshot;
}
function tdRuntime(nativeRoot,snapshot){
 tdInput(snapshot);let text=fs.readFileSync(pinned(nativeRoot,'td'),'utf8');text=text.split('// TD613 unified research view adapter.')[0];
 const sections={'td613-reference-manifest':JSON.stringify(snapshot.manifest),'td613-reference-intake-schema':JSON.stringify({type:'object'}),'td613-reference-records':snapshot.records.map(x=>JSON.stringify(x)).join('\n'),'td613-reference-directory':snapshot.directory.map(x=>JSON.stringify(x)).join('\n')};
 const sandbox={document:{getElementById:id=>({textContent:sections[id]})},window:{},TextEncoder,crypto:crypto.webcrypto};
 vm.runInNewContext(text,sandbox,{timeout:2500});return sandbox.window.TD613Reference;
}
async function wRuntime(nativeRoot,snapshot,root){
 wInput(snapshot);pinned(nativeRoot,'wquery');pinned(nativeRoot,'wcompile');
 // Use the source's own public compiler on identical synthetic snapshot before the query.
 const c=await import(pathToFileURL(path.join(directory(nativeRoot),NATIVE_PINS.wcompile.file)).href);
 const topology=c.compilePublicCorpus(snapshot.meta,snapshot.posts,snapshot.relations);
 // The original query operates over real filesystem paths; isolated synthetic index is rebuilt per call.
 const q=await import(pathToFileURL(path.join(directory(nativeRoot),NATIVE_PINS.wquery.file)).href);
 const indexRoot=path.join(root,'synthetic-index');fs.mkdirSync(path.join(indexRoot,'01-MANIFESTS'),{recursive:true,mode:0o700});
 const file=path.join(indexRoot,'01-MANIFESTS','public-reddit-fixture-source-registry.jsonl');
 if(fs.existsSync(file)&&fs.lstatSync(file).isSymbolicLink())fail('INDEX_FILE_SUBSTITUTED');
 const data=snapshot.posts.map(x=>JSON.stringify(x)).join('\n')+'\n';fs.writeFileSync(file,data,{mode:0o600});
 const index=q.buildIndex(indexRoot);if(index.length!==snapshot.posts.length)fail('WENDBINE_INDEX_COUNT_DRIFT');
 return {q,index,topology};
}
export async function originalNative(nativeRoot,route,snapshot,op,args={}){
 const temp=fs.mkdtempSync(path.join(process.cwd(),'td613-native-scratch-'));
 try {return await execute(nativeRoot,route,snapshot,op,args,temp)}finally{fs.rmSync(temp,{recursive:true,force:true})}
}
async function execute(nativeRoot,route,snapshot,op,args,root){
 if(route===TD){const n=tdRuntime(nativeRoot,snapshot);
  if(op==='search')return n.search(args.query,args.options||{});
  if(op==='get')return n.get(args.id);
  if(op==='cite')return n.cite(args.id);
  if(op==='neighbors')return n.neighbors(args.id,args.options||{});
  if(op==='context')return n.context(args.id,args.options||{});
  if(op==='verify')return await n.verify();
  fail('NATIVE_OPERATION_UNSUPPORTED');
 }
 if(route===W){const n=await wRuntime(nativeRoot,snapshot,root);
  if(op==='topology')return {snapshot_id:n.topology.snapshot_id,typed_edges:n.topology.typed_relation_edges,day_buckets:n.topology.publication_day_buckets,documented_graph_semantics:n.topology.graph_semantics,unclassified_graphs:[...new Set(n.topology.typed_relation_edges.map(e=>e.graph).filter(g=>!Object.hasOwn(n.topology.graph_semantics,g)))].sort()};
  if(op==='lexical')return n.q.lexicalSearch(n.index,args.query,args.options||{});
  if(op==='semantic')return n.q.semanticSearch(n.index,args.query,args.options||{});
  if(op==='recent')return n.q.recentEntries(n.index,args.options||{});
  if(op==='resolve')return n.q.resolveEntry(n.index,args.id);
  fail('NATIVE_OPERATION_UNSUPPORTED');
 }
 fail('UNKNOWN_ROUTE');
}
export function openCandidate({route,store,nativeRoot}){
 const spec=ROUTES[route];if(!spec)fail('UNKNOWN_ROUTE');const dest=directory(store),src=directory(nativeRoot);
 if(dest===src||dest.startsWith(src+path.sep)||src.startsWith(dest+path.sep))fail('INDEPENDENT_STORE_REQUIRED');
 // Native binaries are source-pinned before reader initialization; source-rights are fixture-only.
 pinned(src,route===TD?'td':'wquery');if(route===W)pinned(src,'wcompile');
 const state=path.join(dest,digest(route)+'.json'),revoked=path.join(dest,digest(route)+'.withdrawn');
 const check=(receipt)=>{if(!/^[a-f0-9]{64}$/.test(receipt||''))fail('INDEPENDENT_RECEIPT_REQUIRED');
  const bytes=fs.readFileSync(ordinary(state));if(digest(bytes)!==receipt)fail('INDEPENDENT_RECEIPT_MISMATCH');
  const data=JSON.parse(bytes);if(data.schema!=='td613.native-inheritance-sourcefree/v1'||data.route!==route||data.pin!==spec.pin||digest(data.original)!==data.original_sha256)fail('STORED_ORIGIN_DRIFT');
  if(fs.existsSync(revoked))fail('SYNTHETIC_SOURCE_WITHDRAWN');return JSON.parse(data.original)};
 return Object.freeze({route,recipient:spec.recipient,
  state(){return {initialized:true,empty:!fs.existsSync(state),withdrawn:fs.existsSync(revoked),source_free_only:true}},
  admit(envelope){if(envelope?.evidence_class!=='SYNTHETIC_SOURCE_FREE_FIXTURE'||envelope.rights!=='SYNTHETIC_LOCAL_ONLY'||envelope.source_pin!==spec.pin||envelope.epoch!==spec.epoch||envelope.source_id!=='FIXTURE:'+route||typeof envelope.original!=='string'||!Buffer.isBuffer(envelope.bytes)||!envelope.bytes.equals(Buffer.from(envelope.original))||digest(envelope.bytes)!==envelope.original_sha256)fail('SOURCE_EPOCH_RIGHTS_OR_BYTES_REFUSED');
   const payload=JSON.parse(envelope.original);route===TD?tdInput(payload):wInput(payload);
   if(fs.existsSync(revoked))fail('WITHDRAWN_NO_READMISSION');
   const record={schema:'td613.native-inheritance-sourcefree/v1',route,pin:spec.pin,source_id:envelope.source_id,original:envelope.original,original_sha256:envelope.original_sha256,evidence_class:envelope.evidence_class};
   const bytes=Buffer.from(JSON.stringify(record)+'\n');if(fs.existsSync(state)){if(!fs.readFileSync(ordinary(state)).equals(bytes))fail('REPLAY_CONFLICT');return {status:'EXACT_REPLAY',receipt_sha256:digest(bytes)}}
   fs.writeFileSync(state,bytes,{flag:'wx',mode:0o600});return {status:'ADMITTED_SYNTHETIC',receipt_sha256:digest(bytes)};
  },
  readback(receipt){return check(receipt)},
  originalBytes(receipt){check(receipt);const data=JSON.parse(fs.readFileSync(ordinary(state)));return Buffer.from(data.original,'utf8')},
  async run(receipt,op,args={}){const snapshot=check(receipt);const scratch=fs.mkdtempSync(path.join(dest,'scratch-'));try{return await execute(src,route,snapshot,op,args,scratch)}finally{fs.rmSync(scratch,{recursive:true,force:true})}},
  withdraw(receipt,syntheticAuthority){check(receipt);if(syntheticAuthority!=='SYNTHETIC_OPERATOR_WITHDRAWAL_ONLY')fail('WITHDRAWAL_WITNESS_REQUIRED');fs.writeFileSync(revoked,JSON.stringify({receipt,status:'SYNTHETIC_WITHDRAWN'})+'\n',{flag:'wx',mode:0o600});return {status:'SYNTHETIC_SOURCE_WITHDRAWN'};}
 });
}
export const SOURCE_FREE_ONLY=true;