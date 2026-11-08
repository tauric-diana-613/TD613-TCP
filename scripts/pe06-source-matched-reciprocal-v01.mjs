/**
 * TD613 PE06 prospective source-matched reciprocal chassis.
 * Executes native / receiver / transport-only fixture lanes on each source.
 * T0..T3 limited synthetic, T4/T5 NOT EXECUTED.
 */
import {createHash} from 'node:crypto';
import {ROUTES,nativeProbe,openSyntheticReceiver} from './reciprocal-receiver-sourcefree-v01.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const fail=s=>{throw Error(s)};
const need=(x,s)=>{if(!x)fail(s)};
export const TWO_ROUTES=Object.freeze(Object.keys(ROUTES));
export async function runFixtureOnlyReciprocal({repoRoot,store,sourceByRoute}={}){
 need(sourceByRoute&&typeof sourceByRoute==='object'&&Object.keys(sourceByRoute).length===2 &&
   TWO_ROUTES.every(r=>Object.hasOwn(sourceByRoute,r)),'PE06_BOTH_ROUTES_REQUIRED');
 const receipt={schema:'td613.pe06.fixture-only-reciprocal/v1',experimental_authority:false,real_sources_admitted:0,
  routes:{},cross_receiver_generalization:'NOT_EARNED',
  T4_source_grounded_interpretation:'UNEXECUTED',T5_new_research:'UNEXECUTED'};
 for(const route of TWO_ROUTES){
  const x=sourceByRoute[route],pin=ROUTES[route].sourcePin;
  need(x&&x.evidence_class==='SYNTHETIC_SOURCE_FREE_FIXTURE'&&x.rights==='SYNTHETIC_LOCAL_ONLY'&&
    x.source_pin===pin&&String(x.source_id).startsWith('FIXTURE:')&&
    typeof x.original==='string'&&Buffer.isBuffer(x.bytes)&&x.bytes.equals(Buffer.from(x.original))&&
    x.sha256===hash(x.bytes),'PE06_SOURCE_FREE_BYTES_AND_PIN_REQUIRED');
  const transport={status:'T0_EXACT_BYTES',sha256:hash(x.bytes),returned_bytes:Buffer.from(x.bytes),
    research_operations_executed:0,source_pin:pin};
  const native=await nativeProbe(repoRoot,route,x.original);
  const receiver=openSyntheticReceiver({repoRoot,store,route});
  const admitted=await receiver.admit(x);
  const read=receiver.retrieve(x.source_id,admitted.record_sha256);
  need(read.original===x.original&&read.original_sha256===x.sha256,'PE06_T2_RETRIEVAL_MISMATCH');
  const executed=await receiver.execute(x.source_id,admitted.record_sha256);
  need(executed.operation===native.operation&&hash(JSON.stringify(executed.result))===hash(JSON.stringify(native.result)),
    'PE06_SOURCE_MATCHED_NATIVE_DIVERGENCE');
  receipt.routes[route]={source_id:x.source_id,source_pin:pin,
    transport:{status:transport.status,sha256:transport.sha256,executed:0},
    T1_admission:{status:admitted.status,receipt:admitted.record_sha256},
    T2_retrieval:{status:'SYNTHETIC_RECEIVER_RETRIEVED',sha256:read.original_sha256},
    T3_native:{status:'SYNTHETIC_NATIVE_EXECUTED',operation:executed.operation,
      receiver_result_sha256:hash(JSON.stringify(executed.result)),native_result_sha256:hash(JSON.stringify(native.result))},
    comparisons:{within_source_transport_vs_receiver:'NATIVE_ACTIVITY_VS_ZERO',
      within_source_native_vs_receiver:'EQUAL_RESULT_PINNED_SHARED_LIBRARY_NOT_INDEPENDENT_REPLICATION'},
    T4:'UNEXECUTED',T5:'UNEXECUTED'};
 }
 const a=receipt.routes[TWO_ROUTES[0]],b=receipt.routes[TWO_ROUTES[1]];
 need(a.source_id!==b.source_id,'PE06_ROUTE_SOURCE_ID_COLLISION');
 return Object.freeze(receipt);
}
