#!/usr/bin/env node
/** Independent historical Em-source checkout witness.
 * Must be run with TD613_EM_ARCHIVE_CHECKOUT pointing to a git checkout
 * OUTSIDE the Vixen repository at the exact ORIGINAL PR #962 immutable HEAD.
 * Only output aggregate custody and bounded native search receipts.
 */
import {readFileSync,existsSync,lstatSync,realpathSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,relative,dirname,isAbsolute,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createNativeAtelierReadAdapters} from './vixen-native-atelier-bridge.mjs';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const PIN='70b5a0f9e94626cba6068f41c6117e7978800bbd';
const sourceRel='packages/dome_world_exact/fixtures/a15-r0/EMSTD613';
const emFile='packages/dome_world_exact/fixtures/a15-r0/EMSTD613/99-ADMIN/em-native-text-search-v1.py';
const SHA=/^[0-9a-f]{64}$/;
const need=(x,c)=>{if(!x)throw Error(c)};
const digest=x=>createHash('sha256').update(x).digest('hex');
const gitblob=x=>{const b=Buffer.from(x);return createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
const inside=(root,p)=>{const r=relative(root,p);return r===''||(r!=='..'&&!r.startsWith('..'+sep)&&!isAbsolute(r));};
function parseJsonl(path,max=300000){
 const data=readFileSync(path);
 need(data.length<max,'HELD_EM_HISTORICAL_MANIFEST_TOO_LARGE');
 return {rows:data.toString('utf8').split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s)),gitblob:gitblob(data),sha256:digest(data)};
}
function originalCheckout(archivePath){
 need(typeof archivePath==='string'&&isAbsolute(archivePath)&&existsSync(archivePath) &&
  !lstatSync(archivePath).isSymbolicLink(),'HELD_EM_OUT_OF_TREE_ARCHIVE_REQUIRED');
 const em=realpathSync(archivePath);
 need(!inside(ROOT,em)&&!inside(em,ROOT),'HELD_EM_HISTORICAL_ARCHIVE_INSIDE_VIXEN');
 const observed=execFileSync('git',['-C',em,'rev-parse','HEAD'],{encoding:'utf8',timeout:8000}).trim();
 need(observed===PIN,'HELD_EM_HISTORICAL_EXACT_HEAD_DRIFT');
 need(existsSync(resolve(em,'ATELIER_PROFILE.json')),'HELD_EM_HISTORICAL_PROFILE_MISSING');
 return em;
}
function currentVixen(){
 const body=readFileSync(resolve(ROOT,'app/encyclopedia/vix-cyb.html'),'utf8');
 const m=body.match(/<script[^>]*id="vixen-corpus-bundle"[^>]*>([\s\S]*?)<\/script>/);
 need(m,'HELD_EM_VIXEN_CATALOGUE');
 return JSON.parse(m[1]).works;
}
export function qualifyEmOriginalArchive({archivePath=process.env.TD613_EM_ARCHIVE_CHECKOUT||''}={}){
 const em=originalCheckout(archivePath);
 const workPath=resolve(em,'01-MANIFESTS/work-index.jsonl');
 const sourcePath=resolve(em,'01-MANIFESTS/source-files.jsonl');
 const relatedPath=resolve(em,'01-MANIFESTS/work-manifestations.jsonl');
 const derivativePath=resolve(em,'03-DERIVATIVES/derivative-index.jsonl');
 const w=parseJsonl(workPath),s=parseJsonl(sourcePath),l=parseJsonl(relatedPath),d=parseJsonl(derivativePath);
 need(w.gitblob==='9c6c2976386dcd70cb040db6728dbdfcd4cf8059'&&
  s.gitblob==='0c33ea0daea21d9c6fffdd8344bd79878b7ea9e5'&&
  l.gitblob==='aa836272ea09d14a828d56982720e4e9eafd4e71'&&
  d.gitblob==='b85837df315bb4d79a472a13f5025a1261871e37',
  'HELD_EM_SOURCE_REGISTRY_GIT_BLOBS_DRIFT');
 const originalMap=new Map(w.rows.map(x=>[x.work_id,x]));
 const sourceMap=new Map(s.rows.map(x=>[x.source_file_id,x]));
 const vixen=currentVixen();
 need(w.rows.length===32&&vixen.length===32&&s.rows.length===87&&d.rows.length===87,
  'HELD_EM_HISTORICAL_POPULATION_DRIFT');
 need(w.rows.filter(x=>x.human_gate_required).length===8 &&
  vixen.filter(x=>x.human_gate_required).length===8 &&
  new Set(w.rows.map(x=>x.work_id)).size===32 && sourceMap.size===87,
  'HELD_EM_HISTORICAL_IDENTITY_DRIFT');
 let observedManifestations=0;
 const boundIds=new Set();
 for(const v of vixen){
  const original=originalMap.get(v.work_id);
  need(original&&v.identity_status===original.identity_status&&
   v.human_gate_required===original.human_gate_required,
   'HELD_EM_VIXEN_HISTORICAL_WORK_CROSSWALK');
  const a=original.manifestation_source_file_ids;
  const b=v.linked_sources.map(x=>x.source_file_id);
  need(a.length===b.length&&new Set(a).size===a.length&&
   a.every(x=>b.includes(x)), 'HELD_EM_HISTORICAL_WORK_MANIFESTATIONS_DIFFER');
  for(const sref of v.linked_sources){
   const file=sourceMap.get(sref.source_file_id);
   need(file&&file.sha256===sref.sha256&&SHA.test(file.sha256),
    'HELD_EM_HISTORICAL_SOURCE_SHA_MISMATCH');
   boundIds.add(sref.source_file_id);observedManifestations++;
  }
 }
 need(observedManifestations===53&&boundIds.size===53,'HELD_EM_HISTORICAL_PERFORMER_CROSSWALK_CENSUS');
 let verifiedOriginalBytes=0,excluded=0;
 for(const file of s.rows){
  const name=file.archive_relative_path;
  need(typeof name==='string'&&!name.startsWith('/')&&!name.includes('..')&&
   !name.includes('\\'),'HELD_EM_HISTORICAL_SOURCE_PATH_UNSAFE');
  const full=resolve(em,name);
  need(inside(em,full)&&existsSync(full)&&!lstatSync(full).isSymbolicLink(),
   'HELD_EM_HISTORICAL_SOURCE_BYTES_UNAVAILABLE');
  const buf=readFileSync(full);
  need(digest(buf)===file.sha256,'HELD_EM_HISTORICAL_ORIGINAL_BYTES_SHA_MISMATCH');
  verifiedOriginalBytes++;
 }
 const native=createNativeAtelierReadAdapters({repoRoot:ROOT,
  sourceCheckouts:{EMSTD613:{path:em,git_head:PIN}}});
 const route=native.EM_ATELIER({operation:'em_native_work_route',
  payload:{work_id:'emwork_085223e721130117f5510975'}});
 need(route.kind==='ORIGINAL_NATIVE_EXECUTABLE'&&
  route.data?.work_id==='emwork_085223e721130117f5510975',
  'HELD_EM_NATIVE_WORK_ROUTE_EXECUTION');
 const scratch=mkdtempSync(resolve(tmpdir(),'td613-em-private-fts-'));
 let indexed,search,journey;
 try{
  const index=resolve(scratch,'em-native-readonly.sqlite');
  const PY=process.env.TD613_NATIVE_PYTHON||(process.platform==='win32'?'python':'python3');
  indexed=JSON.parse(execFileSync(PY,[resolve(ROOT,emFile),'--root',em,'--index',index,
   '--estate','EMSTD613','build'],{encoding:'utf8',timeout:45000,
    maxBuffer:1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:'1',PYTHONUTF8:'1'}}));
  need(indexed.indexed_derivatives>0,'HELD_EM_EMPTY_ORIGINAL_TEXT_INDEX');
  const verify=native.EM_ATELIER({operation:'em_native_text',
   payload:{action:'verify',index_path:index}});
  need(verify.data?.verified===true&&
   verify.data?.indexed_sources===indexed.indexed_derivatives,
   'HELD_EM_ORIGINAL_FTS_SOURCE_TAMPER');
  search=native.EM_ATELIER({operation:'em_native_text',
   payload:{action:'search',index_path:index,query:'feedback',limit:5}});
  need(search.data?.query||search.data?.results,'HELD_EM_ORIGINAL_TEXT_SEARCH_UNAVAILABLE');
  journey=native.EM_ATELIER({operation:'em_native_research_journey',
   payload:{index_path:index,query:'feedback'}});
  need(journey.data?.schema==='td613.em.research-journey/v1'&&
   journey.data?.lineage_proven===false &&
   journey.data?.identity_sensitivity?.human_gated_groups===8,
   'HELD_EM_ORIGINAL_RESEARCH_JOURNEY');
 }finally{rmSync(scratch,{recursive:true,force:true});}
 return {
  schema:'td613.vixen.em-original-pinned-archive-qualification/v1',
  original_archive_head:PIN,original_source_files_sha256_verified:verifiedOriginalBytes,
  historical_source_population:s.rows.length,
  archive_manifestation_crosswalk_verified:observedManifestations,
  historical_work_count:w.rows.length,unresolved_identity_groups:8,
  local_native_text_derivatives_indexed:indexed.indexed_derivatives,
  native_work_route_executed:true,
  native_text_index_source_verified:true,
  native_search_returned_results:search.data.results?.length??0,
  native_research_journey_executed:true,
  native_research_journey_event_count:journey.data.events?.length??0,
  input_source_bytes_exposed_to_public_vixen:false,
  source_roster_is_not_original_author_executable:true,
  historical_author_attribution_inferred:false,
  historical_relation_proven:false,
  independent_external_capture_witness:false,
  algorithmic_native_method_parity:'HELD_UNPROVEN',
  scientific_credit:0,human_closure_required:true
 };
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==2)throw Error('HELD_EM_NO_CLI_ARGS');
  process.stdout.write(JSON.stringify(qualifyEmOriginalArchive())+'\n')}
 catch(e){process.stderr.write(JSON.stringify({status:'HELD',reason:String(e?.message||e).slice(0,180)})+'\n');process.exitCode=2}
}
