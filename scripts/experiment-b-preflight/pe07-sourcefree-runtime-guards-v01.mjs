/**
 * TD613 PE07 source-free Flight preflight negative-control harness.
 * Competes against restart/rollback/tool-execution and resource accounting
 * within synthetic inputs. Not an independent trust root or OS sandbox.
 */
import crypto from 'node:crypto';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const err=s=>{throw Object.assign(Error(s),{code:s})};
const need=(x,s)=>{if(!x)err(s)};
const H=/^[0-9a-f]{64}$/;
export function checkSyntheticAdvancingWitness({retainedWitness,current,proposal}={}){
 need(retainedWitness?.type==='SIMULATED_EXTERNAL_SEPARATE_CUSTODIAN' &&
   current?.evidence_class==='SYNTHETIC_LOCAL_ONLY'&&proposal?.evidence_class==='SYNTHETIC_LOCAL_ONLY',
   'PE07_INDEPENDENT_REAL_TRUST_ROOT_UNPROVISIONED');
 need(Number.isSafeInteger(retainedWitness.ordinal)&&retainedWitness.ordinal>=0 &&
   H.test(retainedWitness.head)&&Number.isSafeInteger(current.ordinal)&&H.test(current.head) &&
   Number.isSafeInteger(proposal.ordinal)&&H.test(proposal.previous_head)&&H.test(proposal.payload_sha256),
   'PE07_MALFORMED_CHECKPOINT');
 need(current.ordinal===retainedWitness.ordinal && current.head===retainedWitness.head,
   'PE07_WHOLE_STORE_ROLLBACK_OR_FORK_HELD');
 need(proposal.ordinal===current.ordinal+1&&proposal.previous_head===current.head,
   'PE07_NON_MONOTONIC_OR_FORK_PROPOSAL');
 const next=sha(JSON.stringify([proposal.ordinal,proposal.previous_head,proposal.payload_sha256]));
 return Object.freeze({status:'SIMULATED_CHECKPOINT_ADVANCE_EXECUTED',ordinal:proposal.ordinal,head:next,
   external_current_head_authority:'UNATTESTED_SIMULATION_ONLY',real_source_authorization:false});
}
export function checkPreimportManifest({files,expected}={}){
 need(Array.isArray(files)&&Array.isArray(expected)&&files.length>0&&files.length===expected.length,'PE07_MANIFEST_INCOMPLETE');
 const names=new Set();
 for(let i=0;i<expected.length;i++){
  const e=expected[i],f=files.find(x=>x.path===e.path);
  need(typeof e.path==='string'&&typeof e.sha256==='string'&&H.test(e.sha256)&&!names.has(e.path)&&
    !e.path.startsWith('/')&&!e.path.split('/').includes('..'),'PE07_UNTRUSTED_MANIFEST_PATH');
  names.add(e.path);need(f&&Buffer.isBuffer(f.bytes)&&sha(f.bytes)===e.sha256,'PE07_PREIMPORT_CODE_DRIFT');
 }
 return {status:'SOURCE_FREE_PREIMPORT_BYTES_MATCH',file_count:expected.length,
   authenticated_original_publisher:false,cryptographic_signer_independently_verified:false};
}
export function checkSyntheticUsage({reservation,reported,maximum}={}){
 need([reservation,reported,maximum].every(Number.isSafeInteger)&&reservation>=0&&reported>=0&&maximum>0,
   'PE07_FINITE_USAGE_REQUIRED');
 need(reservation<=maximum,'PE07_BUDGET_RESERVATION_OVER_CAP');
 need(reported<=reservation,'PE07_UNACCOUNTED_USAGE_HOLD');
 return {status:'SYNTHETIC_RESERVATION_CONSISTENT',remaining:maximum-reported,
   hidden_reasoning_semantics:'NOT_ATTESTED_BY_SOURCE_FREE_FIXTURE',
   financial_authority:false};
}
export function rejectUnexpectedNativeActivities(events){
 need(Array.isArray(events),'PE07_EVENT_RECORD_REQUIRED');
 const forbidden=events.filter(e=>e?.type==='tool_call'||e?.type==='network'||e?.type==='source_read'||
   e?.type==='provider_request'||e?.type==='file_write');
 need(forbidden.length===0,'PE07_UNAUTHORIZED_EXTERNAL_ACTIVITY_HELD');
 return {status:'NO_FORBIDDEN_EVENTS_IN_SUPPLIED_FIXTURE',physical_process_isolation:'NOT_MEASURED'};
}
export const flightGate=Object.freeze({d20:'HELD_NO_SIGNED_EXTERNAL_GRANT',real_source_admitted:0,
 provider_inference_authorized:false,paid_tokens_authorized:0,source_free_test_mode:true});
