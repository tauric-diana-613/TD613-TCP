/**
 * TD613 · Seven-estate BRAID G6 prospective host-return contract.
 * Research-only node module, deliberately disconnected from the browser,
 * providers, private vault and any live privileged dispatch.
 *
 * This adapter normalizes an independently host-authorized bounded native
 * read into a SMALL, typed visitor-safe receipt. Raw native method results,
 * source body text and private file paths NEVER become browser output.
 * OPERAHOUSE != OPERA != PERFORMER.
 */
import {createHash} from 'node:crypto';

export const G6_RETURN_SCHEMA='td613.vixen.g6.typed-host-return/v1';
export const G6_CART_SCHEMA='td613.vixen.g6.noncanonical-research-cart/v1';
const SHA40=/^[a-f0-9]{40}$/,SHA64=/^[a-f0-9]{64}$/;
const hash=b=>createHash('sha256').update(b).digest('hex');
const text=(x,max=240)=>typeof x==='string'&&x.trim().length>0&&x.length<=max?x.trim():null;
const sourceMethods=Object.freeze({
 SRC_ATELIER:Object.freeze(['src_native_epoch_query','src_native_text','src_native_research_journey']),
 WENDBINE_ATELIER:Object.freeze(['wendbine_public_query','wendbine_public_inventory','wendbine_public_research_journey']),
 EM_ATELIER:Object.freeze(['em_native_work_route','em_native_text','em_native_research_journey']),
 CROSS_ATELIER:Object.freeze(['cross_atelier_lexical'])
});
export const G6_PROVIDER_BOUNDARIES=Object.freeze({
 ZENODO:Object.freeze({source:'THIRD_PARTY_REMOTE',public_metadata:'REQUIRES_INDEPENDENT_PROVIDER_WITNESS',full_body:'HELD_RIGHTS_AND_SOURCE_READBACK'}),
 DOI:Object.freeze({source:'THIRD_PARTY_RESOLVER',public_metadata:'REFERENCE_ONLY',full_body:'HELD_RIGHTS_AND_SOURCE_READBACK'}),
 ACADEMIA:Object.freeze({source:'THIRD_PARTY_REMOTE',public_metadata:'REQUIRES_INDEPENDENT_PROVIDER_WITNESS',full_body:'HELD_RIGHTS_AND_SOURCE_READBACK'}),
 MEDIUM:Object.freeze({source:'THIRD_PARTY_REMOTE',public_metadata:'REQUIRES_INDEPENDENT_PROVIDER_WITNESS',full_body:'HELD_RIGHTS_AND_SOURCE_READBACK'}),
 SUBSTACK:Object.freeze({source:'THIRD_PARTY_REMOTE',public_metadata:'REQUIRES_INDEPENDENT_PROVIDER_WITNESS',full_body:'HELD_RIGHTS_AND_SOURCE_READBACK'}),
 REDDIT:Object.freeze({source:'THIRD_PARTY_REMOTE',public_metadata:'ARCHIVE_CLAIM_ONLY',full_body:'HELD_RIGHTS_AND_SOURCE_READBACK'}),
 OPERATOR_LOCAL:Object.freeze({source:'OPERATOR_LOCAL_NOT_PROVIDER_AUTHENTICATED',public_metadata:'HELD_PRIVATE',full_body:'PRIVATE_ONLY_NO_BROWSER_EGRESS'}),
 UNIVERSAL:Object.freeze({source:'LOCAL_REFERENCE_INDEX',public_metadata:'INDEXED_REFERENCE_ONLY',full_body:'HELD_UNBUNDLED_BODY'}),
 SRC_ATELIER:Object.freeze({source:'HOST_LOCAL_NATIVE_ORIGINAL_METHOD',public_metadata:'HOST_BOUND_READ_ONLY',full_body:'HELD_UNLESS_SOURCE_BODY_RIGHTS_VERIFIED'}),
 WENDBINE_ATELIER:Object.freeze({source:'HOST_LOCAL_NATIVE_ORIGINAL_METHOD',public_metadata:'HOST_BOUND_READ_ONLY',full_body:'HELD_UNLESS_SOURCE_BODY_RIGHTS_VERIFIED'}),
 EM_ATELIER:Object.freeze({source:'HOST_LOCAL_NATIVE_ORIGINAL_METHOD',public_metadata:'HOST_BOUND_READ_ONLY',full_body:'HELD_UNLESS_SOURCE_BODY_RIGHTS_VERIFIED'})
});

const held=(reason)=>Object.freeze({schema:G6_RETURN_SCHEMA,status:'HELD',
 reason,read_only:true,canonical_mutations:0,source_body_exported:false,
 provider_sync:false,original_authorship_inferred:false,scientific_credit:0,
 independent_external_witness:false,human_closure_required:true});
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const forbidden=/^(?:private_?path|source_?path|file_?path|secret|token|credentials|authorize|authorization|consent|publish|release|deploy|write|overwrite|delete|promote|import)$/i;
function guardInput(input,depth=0){
 if(depth>6)return false;
 if(Array.isArray(input))return input.length<=32&&input.every(x=>guardInput(x,depth+1));
 if(isObject(input))return Object.keys(input).length<=32&&
  Object.entries(input).every(([k,v])=>!forbidden.test(k)&&guardInput(v,depth+1));
 return input===null||typeof input==='boolean'||
  (typeof input==='number'&&Number.isFinite(input))||
  (typeof input==='string'&&input.length<=1200);
}
function summarizePublicResult(result){
 // Even an authorized host may have private bytes: project only bounded,
 // known-typed identifiers and counts. Do not serialize the native result.
 const d=isObject(result?.data)?result.data:isObject(result)?result:{};
 const items=Array.isArray(d.ranked)?d.ranked:
  Array.isArray(d.hits)?d.hits:Array.isArray(d.results)?d.results:[];
 const ids=items.slice(0,12).map(item=>
  text(item?.source_id||item?.record_id||item?.work_id||item?.id,160)
 ).filter(Boolean);
 return Object.freeze({
  method_schema:text(d.schema,120),
  reported_count:Number.isSafeInteger(d.total)&&d.total>=0?d.total:
   Number.isSafeInteger(d.count)&&d.count>=0?d.count:null,
  visible_reference_ids:ids,
  original_method_status:text(d.status,120)||text(d.state,120)||'UNCLASSIFIED',
  source_bodies_included:false,
  source_excerpt_included:false
 });
}
function clockToken(x){
 return isObject(x)&&text(x.session_id,120)&&
   Number.isSafeInteger(x.generation)&&x.generation>=0&&
   Number.isSafeInteger(x.permission_epoch)&&x.permission_epoch>=0&&
   ['MAESTRO','COMPOSER'].includes(x.role)&&x.read_only===true&&
   x.authorized===true ? JSON.stringify([
    x.session_id,x.generation,x.permission_epoch,x.role
   ]):null;
}
export function createG6HostReadReturn({sourceRevision,hostAdapter=null,hostPermission=null}={}){
 if(!SHA40.test(sourceRevision||''))throw Error('HELD_G6_EXACT_SOURCE_SHA_REQUIRED');
 if(hostAdapter!==null&&typeof hostAdapter!=='function')throw TypeError('HELD_G6_HOST_ADAPTER_INVALID');
 if(hostPermission!==null&&typeof hostPermission!=='function')throw TypeError('HELD_G6_HOST_PERMISSION_INVALID');
 async function read(request){
  if(!isObject(request)||!sourceMethods[request.estate]||
     !sourceMethods[request.estate].includes(request.operation))
   return held('HELD_G6_UNDECLARED_SOURCE_METHOD');
  if(!isObject(request.payload)||!guardInput(request.payload)||
    JSON.stringify(request.payload).length>8192)
   return held('HELD_G6_UNBOUNDED_OR_PRIVILEGED_INPUT');
  if(!hostAdapter||!hostPermission)return held('HELD_G6_HOST_NOT_CONNECTED');
  let before=null;
  try{before=clockToken(hostPermission())}catch{return held('HELD_G6_PERMISSION_UNAVAILABLE')}
  if(!before)return held('HELD_G6_HOST_PERMISSION_REQUIRED');
  let result;
  try{result=await hostAdapter({estate:request.estate,operation:request.operation,
    payload:request.payload})}
  catch{return held('HELD_G6_NATIVE_METHOD_FAILED')}
  let after=null;
  try{after=clockToken(hostPermission())}catch{return held('HELD_G6_PERMISSION_REVOKED')}
  if(after!==before)return held('HELD_G6_STALE_OR_REVOKED_HOST_SESSION');
  if(!isObject(result)||result.read_only!==true||result.scientific_credit!==0||
    !['ORIGINAL_NATIVE_EXECUTABLE','ORIGINAL_COMPILER_PLUS_TD613_DERIVED_ASSAY'].includes(result.kind)||
    (typeof result.estate==='string'&&![
       request.estate,
       request.estate==='EM_ATELIER'?'EMSTD613':request.estate.replace('_ATELIER','')
     ].includes(result.estate)))
   return held('HELD_G6_NATIVE_RECEIPT_TYPE_UNVERIFIED');
  const projection=summarizePublicResult(result);
  return Object.freeze({
   schema:G6_RETURN_SCHEMA,status:'SOURCE_BOUND_HOST_RETURN_PROSPECTIVE',
   method:{estate:request.estate,operation:request.operation,
    original_method_kind:result.kind,source_revision:sourceRevision,
    source_revision_attestation:'HOST_DECLARED_NOT_INDEPENDENT_ORIGIN'},
   projection,
   rights_state:'SOURCE_ID_METADATA_ONLY_SOURCE_BODY_RIGHTS_UNDECIDED',
   source_body_exported:false,private_index_exported:false,
   provider_sync:false,scientific_credit:0,canonical_mutations:0,
   human_closure_required:true,visitor_return_is_original_text:false,
   external_origin_authenticated:false
  });
 }
 return Object.freeze({read,availableMethods:()=>Object.fromEntries(
  Object.entries(sourceMethods).map(([k,v])=>[k,[...v]])),
  source_revision:sourceRevision,connected:Boolean(hostAdapter&&hostPermission),
  live_activation_authority:false});
}
export function createG6ResearchCart({canonicalWorkIds=[]}={}){
 if(!Array.isArray(canonicalWorkIds)||canonicalWorkIds.length!==32||
  new Set(canonicalWorkIds).size!==32||!canonicalWorkIds.every(x=>text(x,160)))
  throw Error('HELD_G6_PINNED_32_WORK_CENSUS_REQUIRED');
 const protectedWorks=new Set(canonicalWorkIds);
 const entries=new Map();
 const inspect=()=>Object.freeze({
  schema:G6_CART_SCHEMA,canonical_work_count:32,
  candidate_count:entries.size,
  entries:[...entries.values()].map(x=>({...x})),
  distinct_evidence_classes:true,works_modified:0,
  provider_synced:false,admission_authority:false,
  human_review_required:true
 });
 const add=({provider,source_id,original_title='',selectedByHuman=false,
  source_sha256=null}={})=>{
  if(selectedByHuman!==true)return held('HELD_G6_HUMAN_SELECTION_REQUIRED');
  const policy=G6_PROVIDER_BOUNDARIES[provider];
  if(!policy)return held('HELD_G6_PROVIDER_NOT_ATTESTED');
  const id=text(source_id,180);
  if(!id||protectedWorks.has(id))return held('HELD_G6_UNVERIFIED_OR_CANONICAL_SOURCE_ID');
  if(source_sha256!==null&&!SHA64.test(source_sha256))return held('HELD_G6_INVALID_CLAIMED_DIGEST');
  const key=provider+'\x1f'+id;
  if(entries.has(key))return Object.freeze({status:'EXISTING_RESEARCH_CANDIDATE',
   candidate_id:entries.get(key).candidate_id,canonical_work_count:32,
   candidate_count:entries.size,canonical_mutations:0});
  if(entries.size>=100)return held('HELD_G6_CANDIDATE_CART_BUDGET');
  const rec=Object.freeze({
   candidate_id:'research:'+hash(key).slice(0,24),
   provider,source_id:id,title:text(original_title,180)||id,
   claimed_source_sha256:source_sha256,
   source_evidence_class:policy.source,
   public_metadata_status:policy.public_metadata,
   body_rights_state:policy.full_body,
   source_authentication:'UNVERIFIED_OR_HOST_LOCAL_ONLY',
   canonical_work_id:null,canonical_work_admission:false,
   original_work_count_contribution:0,scientific_credit:0,
   authorial_origin_inferred:false,human_selected:true
  });
  entries.set(key,rec);
  return Object.freeze({status:'ADDED_RESEARCH_CANDIDATE',candidate:rec,
   canonical_work_count:32,candidate_count:entries.size,
   canonical_mutations:0});
 };
 const remove=(candidateId)=>{
  const row=[...entries.entries()].find(([,v])=>v.candidate_id===candidateId);
  if(!row)return false;
  entries.delete(row[0]);return true;
 };
 return Object.freeze({add,remove,inspect});
}
