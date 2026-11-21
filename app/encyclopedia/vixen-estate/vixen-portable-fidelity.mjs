/**
 * Vixen G5 portable custody audit. Static-literal dependency closure only.
 * A collection/readback manifest is evidence of its listed bytes, never proof
 * of rendered browser boot, human consent, provenance or original authorship.
 * No provider access, network sync, corpus admission, or rights promotion.
 */
export const PORTABLE_FIDELITY_SCHEMA='td613.vixen.portable-fidelity/v1';
const encoder=new TextEncoder();
const decoder=new TextDecoder('utf-8',{fatal:true});
const CODE=/\.(?:html?|mjs|js|css)$/i;
const RESOURCE=/\.(?:html?|mjs|js|css|json|jsonl|png|jpe?g|svg|webp|gif|ico|woff2?|ttf|otf|wasm|frag|txt)$/i;
const RECORD_ROOT='encyclopedia/reference/records/';
const MAX_FILES=500,MAX_RESOURCE_BYTES=16_000_000,MAX_TOTAL_BYTES=90_000_000;
const toBytes=v=>v instanceof Uint8Array?v:v instanceof ArrayBuffer?new Uint8Array(v):encoder.encode(String(v??''));
const hex=bytes=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
async function sha(bytes,provider){
 if(!provider?.subtle?.digest)return null;
 return hex(new Uint8Array(await provider.subtle.digest('SHA-256',bytes)));
}
function refs(path,value){
 if(!CODE.test(path))return [];
 let text;
 try{text=decoder.decode(toBytes(value))}catch(_){return [{spec:'INVALID_UTF8',failure:'UNDECODABLE_DEPENDENCY_SOURCE'}]}
 const found=[];
 const push=(rx)=>{for(const m of text.matchAll(rx))if(m[1])found.push({spec:m[1].trim()})};
 if(/\.html?$/i.test(path)){
  // Script, style, preload, font, icon, image and alternate machine manifest.
  for(const tag of text.matchAll(/<(?:script|link|img|source|video)\b[^>]*>/gi)){
   const s=tag[0];
   if(/^<link\b/i.test(s)&&!/\brel\s*=\s*["']?(?:stylesheet|modulepreload|preload|icon|alternate)\b/i.test(s))continue;
   const a=s.match(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/i);
   if(a)found.push({spec:a[1]});
  }
 }
 if(/\.css$/i.test(path)){
  push(/@import\s+(?:url\(\s*)?["']?([^"'\s);]+)/gi);
  push(/\burl\(\s*["']?([^"')]+)["']?\s*\)/gi);
 }
 if(/\.(?:mjs|js|html?)$/i.test(path)){
  push(/\b(?:import|export)\s+(?:[^;\n]{0,260}?\s+from\s*)?["']([^"']+)["']/g);
  push(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g);
  push(/\bnew\s+URL\s*\(\s*["']([^"']+)["']/g);
 }
 return found;
}
function resolve(referrer,spec){
 if(!spec||spec==='INVALID_UTF8')return {skip:true};
 if(/^(?:data:|blob:|mailto:|javascript:|node:|#|\?)/i.test(spec))return {skip:true};
 const host=new URL('https://td613-portable.invalid/'+referrer);
 let u;
 try{u=new URL(spec,host)}catch(_){return {skip:true}}
 if(u.origin!==host.origin)return {external:true,from:referrer,protocol:u.protocol};
 const path=decodeURI(u.pathname).replace(/^\/+/, '');
 if(!path||!RESOURCE.test(path))return {skip:true};
 if(path.startsWith('../')||path.includes('/../')||path.includes('\0'))return {skip:true};
 return {path};
}
async function load(fetcher,baseHref,path){
 if(typeof fetcher!=='function')return null;
 const base=new URL(baseHref),u=new URL('/'+path,base);
 if(u.origin!==base.origin||!['http:','https:','file:'].includes(u.protocol))return null;
 try{
  const res=await fetcher(u.href,{method:'GET',credentials:'omit',cache:'no-store',redirect:'error'});
  if(!res?.ok||res.url&&new URL(res.url).href!==u.href)return null;
  const len=Number(res.headers?.get?.('content-length')||0);
  if(len>MAX_RESOURCE_BYTES)return null;
  const b=new Uint8Array(await res.arrayBuffer());
  return b.length&&b.length<=MAX_RESOURCE_BYTES?b:null;
 }catch(_){return null}
}
export async function inspectVixenPortableFidelity({
 entries,omitted=[],baseHref,fetcher,exportedAt,cryptoProvider=globalThis.crypto
}={}){
 if(!Array.isArray(entries)||!baseHref)throw Error('HELD_PORTABLE_INPUT_REQUIRED');
 const found=new Map(entries.map(e=>[e.path,{...e}]));
 const queue=[...found.keys()].filter(p=>CODE.test(p)),visited=new Set();
 const required=new Set(),missing=new Set(),externals=[],decodeFailures=[];
 let total=[...found.values()].reduce((n,e)=>n+toBytes(e.data).length,0);
 while(queue.length){
  const current=queue.shift();
  if(visited.has(current))continue;
  visited.add(current);
  for(const dep of refs(current,found.get(current).data)){
   if(dep.failure){decodeFailures.push(current);continue}
   const r=resolve(current,dep.spec);
   if(r.external){externals.push(r);continue}
   if(!r.path||r.path===current)continue;
   required.add(r.path);
   if(found.has(r.path)){if(CODE.test(r.path)&&!visited.has(r.path))queue.push(r.path);continue}
   if(found.size>=MAX_FILES||total>=MAX_TOTAL_BYTES){missing.add(r.path);continue}
   const content=await load(fetcher,baseHref,r.path);
   if(!content||total+content.length>MAX_TOTAL_BYTES){missing.add(r.path);continue}
   found.set(r.path,{path:r.path,data:content,mtime:new Date(exportedAt)});
   total+=content.length;
   missing.delete(r.path);
   if(CODE.test(r.path))queue.push(r.path);
  }
 }
 const hashes={},failedRecords=[],verifiedRecords=[];
 for(const [path,item] of found){
  const h=await sha(toBytes(item.data),cryptoProvider);
  if(h)hashes[path]={bytes:toBytes(item.data).length,sha256:h};
 }
 const directory=found.get('encyclopedia/reference/directory.json');
 let index=[];
 try{index=JSON.parse(decoder.decode(toBytes(directory?.data)));if(!Array.isArray(index))index=[]}catch(_){}
 let declared=null,graph=null;
 try{declared=JSON.parse(decoder.decode(toBytes(found.get('encyclopedia/reference/manifest.json')?.data)))}catch(_){}
 try{graph=JSON.parse(decoder.decode(toBytes(found.get('encyclopedia/reference/graph.json')?.data)))}catch(_){}
 const validRows=index.length===1141 && index.every(row=>
  typeof row?.id==='string' && /^[A-Z][A-Z0-9]*-[A-Z0-9_-]{1,95}$/.test(row.id) &&
  row.record_path==='reference/records/'+row.id+'.json' &&
  /^[a-f0-9]{64}$/.test(String(row.record_sha256||'')));
 const byId=new Map(index.map(row=>[row.id,row]));
 const indexCensusVerified=validRows&&byId.size===1141&&
  declared?.schema==='td613.encyclopedia.reference/v1' &&
  declared.edition_version==='1.4'&&declared.record_count===1141&&
  Array.isArray(graph?.edges)&&graph.edges.length===2131;
 for(const [path,item] of found){
  if(!path.startsWith(RECORD_ROOT)||!path.endsWith('.json'))continue;
  const id=path.slice(RECORD_ROOT.length,-5),row=byId.get(id),raw=toBytes(item.data);
  const body=raw.at(-1)===10?raw.slice(0,-1):raw;
  let valid=!!row?.record_sha256;
  try{valid=valid&&JSON.parse(decoder.decode(raw)).id===id}catch(_){valid=false}
  valid=valid&&(await sha(body,cryptoProvider))===row.record_sha256;
  (valid?verifiedRecords:failedRecords).push(id);
 }
 const digestAvailable=Object.keys(hashes).length===found.size;
 const missingPaths=[...missing].sort();
 const blocked=missingPaths.length>0||decodeFailures.length>0||failedRecords.length>0||
  !digestAvailable||!indexCensusVerified||externals.length>0||!found.has('encyclopedia/vix-cyb.html');
 // Never promote a statically scanned collection to fully booted offline.
 const fidelity=blocked?'EXPORT_PARTIAL_HELD':'ONLINE_REFERENCE_REQUIRED';
 const manifest={
  schema:PORTABLE_FIDELITY_SCHEMA,fidelity,exported_at:exportedAt,
  authority:'READ_ONLY_SNAPSHOT',scientific_credit:0,human_closure_required:true,
  dependency_scope:'STATIC_LITERAL_SCAN_ONLY',rendered_extracted_boot:'NOT_EVALUATED',
  file_count_excluding_manifest:found.size,
  required_dependency_count:required.size,required_missing_paths:missingPaths,
  optional_missing_paths:[...new Set(omitted)].filter(p=>!required.has(p)).sort(),
  undecodable_dependency_sources:decodeFailures,
  external_resource_dependencies:externals,
  reference:{indexed_records:index.length,index_census_verified:indexCensusVerified,
   expected_records:1141,expected_edges:2131,
   bundled_verified_record_bodies:verifiedRecords.length,
   offline_record_readback_all:false,required_online_record_count:Math.max(0,index.length-verifiedRecords.length),
   bad_or_unverified_record_ids:failedRecords,availability:'ONLINE_REFERENCE_REQUIRED'},
  file_digests_sha256:hashes,
  rights_and_original_authority:'NOT_INFERRED_FROM_BUNDLE'
 };
 const result=[...found.values()];
 result.push({path:'encyclopedia/vixen-estate/portable-fidelity-manifest.json',
  data:JSON.stringify(manifest,null,2)+'\n',mtime:new Date(exportedAt)});
 return {entries:result,requiredMissing:missingPaths,
  omitted:[...new Set([...omitted,...missingPaths])],fidelity,manifest};
}
