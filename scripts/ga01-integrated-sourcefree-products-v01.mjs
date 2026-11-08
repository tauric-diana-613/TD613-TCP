/**
 * GA01 · Executable, source-free integration of PE05 twin product entry,
 * PE06 original-source-matched reciprocal receiver and PE02 local index.
 *
 * Every ingested byte comes from a pinned INVENTED B91 catalog specimen or
 * a constructed synthetic TD613 intake. No arbitrary source/body/path inputs,
 * ciphertext, private key, provider, network, or Experiment B activation.
 *
 * Scientific status: T0–T3 fixture-only; T4/T5 unexecuted.
 * Cross-store withdrawal is NOT established; a gap is explicitly reported.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {openTwinProducts} from './td613-preflight-twin-products-v01.mjs';
import {runFixtureOnlyReciprocal,TWO_ROUTES} from './pe06-source-matched-reciprocal-v01.mjs';
import {ROUTES,openSyntheticReceiver,nativeProbe} from './reciprocal-receiver-sourcefree-v01.mjs';
import {createSyntheticLocalIndex,openSyntheticLocalIndex} from './wendbine-gatee-synthetic-local-index-v01.mjs';

const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const need=(v,c)=>{if(!v)throw Object.assign(Error(c),{code:c})};
const stem=path.join(repo,'packages/dome_world_exact/fixtures/a15-r0/ATELIER_METHOD/E3B8/fixture-catalog.json');
const catalog=JSON.parse(fs.readFileSync(stem,'utf8'));
const source=(id)=>{const f=catalog.fixtures.find(x=>x.fixture_id===id);
 need(f?.evidence_class==='SYNTHETIC_REPLAY_ONLY','GA01_ONLY_PINNED_INVENTED_CATALOG');
 const bytes=Buffer.from(f.bytes_base64,'base64');
 need(sha(bytes)===f.sha256&&bytes.length===f.byte_length,'GA01_FIXTURE_BYTES_CONFLICT');return {f,bytes};
};
function syntheticTd(){
 return {schema:'td613.research-intake/v1',record_id:'R-GA01-FIXTURE-001',
  kind:'source_note',title:'Invented research source',recorded_at:'2026-11-02T12:00:00Z',
  author:'fictional fixture',human_request_ref:'synthetic',visibility:'public',
  body:'A source-free demonstration of a withheld research claim.',
  sources:[{source_id:'FIXTURE:GA01-PRIMARY',kind:'artifact',locator:'fixture:ga01',capture_status:'OPERATOR_SUPPLIED'}],
  evidence:{disposition:'SPECIFIED',earned_claim:'invented test only',
  claim_ceiling:'no real-world inference',missing_evidence:[]}};
}
function env(route,id,raw){
 const bytes=Buffer.isBuffer(raw)?raw:Buffer.from(JSON.stringify(raw),'utf8');
 return {source_id:id,evidence_class:'SYNTHETIC_SOURCE_FREE_FIXTURE',
  rights:'SYNTHETIC_LOCAL_ONLY',source_pin:ROUTES[route].sourcePin,
  original:bytes.toString('utf8'),bytes,sha256:sha(bytes)};
}
const names=Object.freeze({TD:'TD_REFERENCE',SRC:'SRC_SPANISH_EXACT',EM:'EM_METHODS',W:'W_PUBLIC'});
function clean(root){
 need(typeof root==='string'&&path.isAbsolute(root)&&fs.existsSync(root)&&
  fs.lstatSync(root).isDirectory()&&!fs.lstatSync(root).isSymbolicLink()&&fs.realpathSync(root)===root,
  'GA01_ABSOLUTE_REAL_EMPTY_ROOT_REQUIRED');
 need(fs.readdirSync(root).length===0,'GA01_EMPTY_ROOT_EXCLUSIVE');
 return root;
}
async function stage(api,id,source_id){
 const {f,bytes}=source(id);
 const declared=(await api.request({action:'describeFixtures'})).find(x=>x.fixture_id===id);
 need(declared && declared.sha256===f.sha256,'GA01_PRODUCT_CATALOG_IDENTITY');
 const response=await api.request({action:'stageSyntheticFixture',product_id:declared.product_id,
  fixture_id:id,source_id,bytes,sha256:f.sha256,epoch:declared.epoch,
  rights:declared.rights,evidence_class:declared.evidence_class});
 need(response.status==='STAGED_UNADMITTED'&&response.real_source_admitted===false,'GA01_UNEXPECTED_STAGE_STATE');
 return {binding:{product_id:response.product_id,source_id,receipt:response.receipt},bytes};
}
async function execute(api,s,operation,params={}){
 const result=await api.request({action:'execute',...s.binding,operation,params});
 need(result.real_source_admitted!==true && result.source_authorized===false &&
   result.scientifically_validated===false,'GA01_SCIENTIFIC_PROMOTION_REFUSED');
 return result;
}

/** Caller owns the temporary isolated root. The function creates only inventeds. */
export async function runGA01IntegratedSyntheticEpisode({workspaceRoot}={}){
 const home=clean(workspaceRoot);
 const paths={atelier:path.join(home,'ATELIER'),encyclopedia:path.join(home,'ENCYCLOPEDIA'),
  receiver:path.join(home,'RECEIVER'),index:path.join(home,'INDEX')};
 for(const p of Object.values(paths))fs.mkdirSync(p,{mode:0o700});
 const twin=await openTwinProducts({atelierWorkspace:paths.atelier,
  encyclopediaWorkspace:paths.encyclopedia,create:true});
 const [a,e]=await Promise.all([twin.atelier.request({action:'status'}),
  twin.encyclopedia.request({action:'status'})]);
 need(a.instance_id!==e.instance_id && a.real_sources_admitted===0&&
   e.real_sources_admitted===0,'GA01_INDEPENDENT_EMPTY_PRODUCTS_NOT_ESTABLISHED');

 const td=await stage(twin.atelier,names.TD,'FIXTURE-TD-GA01');
 const src=await stage(twin.atelier,names.SRC,'FIXTURE-SRC-GA01');
 const em=await stage(twin.atelier,names.EM,'FIXTURE-EM-GA01');
 const w=await stage(twin.encyclopedia,names.W,'FIXTURE-W-GA01');

 const [tdExe,srcExe,emExe,wExe]=await Promise.all([
   execute(twin.atelier,td,'search',{query:'governance'}),
   execute(twin.atelier,src,'explore',{}),
   execute(twin.atelier,em,'WORK_IDENTITY_SPLIT_COLLAPSE_SENSITIVITY',{}),
   execute(twin.encyclopedia,w,'topology',{})]);
 need(tdExe.execution_count>0&&srcExe.execution_count>0&&
   emExe.execution_count>0&&wExe.execution_count>0,'GA01_NATIVE_METHOD_UNEXECUTED');

 // The B91 W_PUBLIC original JSON is the EXACT input to the independent
 // reciprocal native compiler and receiver, with identical original UTF-8 bytes.
 const wRoute='WENDBINE_ATELIER_TO_UNIVERSAL_ENCYCLOPEDIA';
 const tdRoute='TD613_ENCYCLOPEDIA_TO_UNIVERSAL_ATELIER';
 const envelopes={
   [wRoute]:env(wRoute,'FIXTURE:W-GA01-ORIGINAL',w.bytes),
   [tdRoute]:env(tdRoute,'FIXTURE:TD-GA01-ORIGINAL',syntheticTd())
 };
 const controls=await runFixtureOnlyReciprocal({repoRoot:repo,
   store:paths.receiver,sourceByRoute:envelopes});
 const nativeW=await nativeProbe(repo,wRoute,w.bytes.toString('utf8'));
 need(controls.routes[wRoute].T3_native.receiver_result_sha256===
   controls.routes[wRoute].T3_native.native_result_sha256,'GA01_WENDBINE_NATIVE_RECEIVER_DIVERGENCE');
 const nativeEdgeHashes=sha(Buffer.from(JSON.stringify(nativeW.result.typed_edges)));
 const productEdgeHashes=sha(Buffer.from(JSON.stringify(wExe.delegate.result.typed_edges)));
 need(nativeEdgeHashes===productEdgeHashes,'GA01_PRODUCT_RECIPROCAL_TOPOLOGY_DIVERGENCE');

 const wOriginal=w.bytes.toString('utf8'),title='Invented W public original';
 const row={source_id:'FIXTURE-W-GA01-INDEX',rights:'PRIVATE_ONLY',
   evidence_class:'SYNTHETIC_LOCAL_ONLY',title,selftext:wOriginal,
   body_sha256_utf8:sha(w.bytes),title_sha256_utf8:sha(Buffer.from(title)),
   snapshotId:'SYNTHETIC_GA01',sealId:'SYNTHETIC_GA01_SEAL',
   capture_id:'SYNTHETIC_GA01_CAPTURE',
   published_at:'2026-11-02T00:00:00Z'};
 const indexReceipt=createSyntheticLocalIndex({root:paths.index,records:[row]});
 const key=Buffer.alloc(32,13);
 let authorized=true;
 const openIndex=()=>openSyntheticLocalIndex({root:paths.index,
   root_receipt:indexReceipt.root_receipt,cursorKey:key,allowFixture:()=>authorized});
 const before=openIndex().query({term:'DEPENDS_ON',limit:1});
 need(before.total_matches>0&&before.rights_excluded===0,'GA01_RETRIEVAL_NOT_EXECUTED');

 const eRead=await twin.encyclopedia.request({action:'readback',...w.binding});
 need(Buffer.isBuffer(eRead.bytes)&&eRead.bytes.equals(w.bytes) &&
   sha(eRead.bytes)===controls.routes[wRoute].transport.sha256,'GA01_CROSS_PRODUCT_BYTES_MISMATCH');

 const reopened=await openTwinProducts({atelierWorkspace:paths.atelier,
   encyclopediaWorkspace:paths.encyclopedia,rootReceipts:twin.rootReceipts});
 const reRead=await reopened.encyclopedia.request({action:'readback',...w.binding});
 need(reRead.bytes.equals(w.bytes),'GA01_COLD_REOPEN_READBACK_MISMATCH');
 const receiver=openSyntheticReceiver({repoRoot:repo,store:paths.receiver,route:wRoute});
 const record=receiver.retrieve(envelopes[wRoute].source_id,controls.routes[wRoute].T1_admission.receipt);
 need(record.original===wOriginal,'GA01_INDEPENDENT_RECEIVER_BYTES_MISMATCH');

 await reopened.encyclopedia.request({action:'withdraw',...w.binding});
 authorized=false;
 let productRefused=false;
 try{await reopened.encyclopedia.request({action:'readback',...w.binding})}
 catch{productRefused=true}
 need(productRefused,'GA01_LOCAL_PRODUCT_WITHDRAWAL_FAILED');
 const restricted=openIndex().query({term:'DEPENDS_ON'});
 need(restricted.rights_excluded===1&&restricted.returned_count===0,'GA01_LOCAL_INDEX_RIGHTS_WITHDRAWAL_FAILED');

 // Explicit adverse witness: the separate PE06 receiver retains its own
 // independently stored invented fixture. Product-only withdrawal does NOT
 // imply universal cross-store revocation. This requires a later rights gate.
 const remoteStillPresent=receiver.retrieve(envelopes[wRoute].source_id,
   controls.routes[wRoute].T1_admission.receipt).original===wOriginal;
 need(remoteStillPresent,'GA01_WITHDRAWAL_COUNTEREXAMPLE_DISAPPEARED');

 return Object.freeze({
  schema:'td613.ga01.sourcefree-real-api-integration/v1',
  exact_fixture_digest:sha(w.bytes),
  product_instance_ids:{atelier:a.instance_id,encyclopedia:e.instance_id},
  executed_methods:{td:tdExe.execution_count,src:srcExe.execution_count,
   em:emExe.execution_count,wendbine:wExe.execution_count},
  source_matched_wendbine:{
    byte_sha256:sha(w.bytes),product_native_edge_sha256:productEdgeHashes,
    independent_native_edge_sha256:nativeEdgeHashes,
    exact_byte_cross_product_readback:true,
    independent_receiver_byte_readback:true,
    native_library_shared_not_independent_replication:true},
  td_route:{native_receiver_source_matched:true,
    B91_TD_REFERENCE_same_schema_as_native_TD613:false,
    independent_cross_implementation_original_identity:'HELD_SCHEMA_DIFFERENCE'},
  t_states:{T0:'EXACT_SYNTHETIC_BYTES',T1:'SYNTHETIC_RECEIVER_ADMITTED',
    T2:'SYNTHETIC_PERSISTED_RETRIEVAL',T3:'SYNTHETIC_NATIVE_METHOD_EXECUTED',
    T4:'UNEXECUTED',T5:'UNEXECUTED'},
  offline_index:{sha256:indexReceipt.manifest.file_sha256,
   reopened_independent_receipt:true,original_offsets_method:'EXACT_UTF8',
   rights_withdrawal_denied:true},
  rights:{product_local_withdrawal:true,index_local_reauth_denied:true,
   reciprocal_receiver_still_readable_after_product_withdrawal:remoteStillPresent,
   global_cross_store_withdrawal:'HELD_NOT_IMPLEMENTED'},
  original_sources_admitted:0,external_provider_calls:0,
  protected_flight:'HELD',independent_external_trust:'UNPROVISIONED',
  claim_ceiling:'SOURCE_FREE_INTEGRATION_EXECUTED_WITH_CROSS_STORE_REVOCATION_AND_TD_SCHEMA_LIMITS'});
}
