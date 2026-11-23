import crypto from 'node:crypto';
import {need,integer,exactKeys} from './errors.mjs';
import {referenceTokenizer,isApprovedTokenizer} from './tokenizer.mjs';
import {renderTemplate,renderEvaluatorTemplate,TEMPLATE_VERSION} from './templates.mjs';
export const ARMS=['ARM_2A_MODULAR','ARM_2B_MATCHED_UNION'];
const PUBLIC_MODEL_IDS=new Set(['gpt-6.1-sol','gpt-6.1-terra','gpt-6-astra','gpt-6-sol','gpt-6-luna','gpt-5','gpt-5-mini','gpt-4.1','gpt-4o','gpt-4','o1','o3','o4-mini']);
export const OBSERVED=Object.freeze({a:{calls:6,input:70378,output:1828},b:{calls:6,input:72443,output:1701},review:{input:12430,output:733}});
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const measurements=new WeakSet();
function frozen(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){Object.values(x).forEach(frozen);Object.freeze(x);}return x;}
export function canonical(x){
 if(x===null||typeof x!=='object')return JSON.stringify(x);
 if(Array.isArray(x))return '['+x.map(canonical).join(',')+']';
 return '{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
}
export function planDigest(x){return hash(canonical(x));}
export function validatePlan(p,approvedCeiling=720000){
 exactKeys(p,['version','model','effort','scope','documents_per_evidence','arm_token_ceiling','input_ceiling','output_ceiling','retry_fraction','max_retries_per_call','history_forecast_tokens','provider_overhead_bound','controls_verified','evaluator','conditions','replay_outputs','evaluation_payloads']);
 need(p.version===1&&PUBLIC_MODEL_IDS.has(p.model)&&['none','minimal','low','medium','high','xhigh','max','ultra'].includes(p.effort)&&['FULL','SINGLE_PASS','MICROSTUDY'].includes(p.scope),'INVALID_CONFIGURATION');
 integer(p.documents_per_evidence,1,24);integer(p.arm_token_ceiling,1,approvedCeiling,'UNAPPROVED_BUDGET_ESCALATION');integer(p.input_ceiling,1,1000000);integer(p.output_ceiling,1,128000);integer(p.history_forecast_tokens,1,p.output_ceiling);
 need(Number.isFinite(p.retry_fraction)&&p.retry_fraction>=0&&p.retry_fraction<=1,'INVALID_CONFIGURATION');integer(p.max_retries_per_call,0,3);
 need(p.provider_overhead_bound===null||Number.isSafeInteger(p.provider_overhead_bound)&&p.provider_overhead_bound>=0,'INVALID_CONFIGURATION');
 need(p.controls_verified===false,'HARD_CONTROLS_UNVERIFIED'); // No execution-control attestation mechanism is implemented by a static instrument.
 exactKeys(p.evaluator,['candidate_cap_per_arm_condition','calls_per_candidate','total_tokens_per_call','audit_calls_per_condition','audit_tokens_per_call','retry_fraction','future_payload_byte_bound','reference_encoding']);
 for(const k of ['candidate_cap_per_arm_condition','calls_per_candidate','total_tokens_per_call','audit_calls_per_condition','audit_tokens_per_call'])integer(p.evaluator[k],1,1000000);
 need(Number.isFinite(p.evaluator.retry_fraction)&&p.evaluator.retry_fraction>=0&&p.evaluator.retry_fraction<=1,'INVALID_CONFIGURATION');
 need(p.evaluator.reference_encoding===undefined||['o200k_base','cl100k_base'].includes(p.evaluator.reference_encoding),'INVALID_CONFIGURATION');
 need(p.evaluator.future_payload_byte_bound===undefined||p.evaluator.future_payload_byte_bound===null||Number.isSafeInteger(p.evaluator.future_payload_byte_bound)&&p.evaluator.future_payload_byte_bound>=0&&p.evaluator.future_payload_byte_bound<=2*1024*1024,'INVALID_CONFIGURATION');
 need(Array.isArray(p.conditions)&&p.conditions.length>0&&p.conditions.length<=12,'INVALID_CONFIGURATION');const unique=new Set();
 for(const c of p.conditions){
  exactKeys(c,['evidence','representation','order','indices','replications']);
  need(['AUTHENTIC','NEGATIVE'].includes(c.evidence)&&['NEUTRAL','DOLLHOUSE'].includes(c.representation)&&['ORIGINAL','REVERSED','EXPLICIT'].includes(c.order),'INVALID_CONFIGURATION');integer(c.replications,1,10);
  if(c.order==='EXPLICIT'){need(Array.isArray(c.indices)&&c.indices.length===p.documents_per_evidence&&new Set(c.indices).size===p.documents_per_evidence&&c.indices.every(i=>Number.isSafeInteger(i)&&i>=0&&i<p.documents_per_evidence),'DOCUMENT_OMISSION_OR_ORDER_MUTATION');}else need(c.indices===undefined,'INVALID_CONFIGURATION');
  const key=canonical({...c,replications:0});need(!unique.has(key),'DUPLICATE_CONDITION');unique.add(key);
 }
 if(p.scope==='FULL'){
  need(p.documents_per_evidence>=20,'SCOPE_NOT_FULL_FLIGHT');
  for(const order of ['ORIGINAL','REVERSED','EXPLICIT'])for(const evidence of ['AUTHENTIC','NEGATIVE'])for(const representation of ['NEUTRAL','DOLLHOUSE'])need(p.conditions.some(c=>c.order===order&&c.evidence===evidence&&c.representation===representation),'SCOPE_NOT_FULL_FLIGHT');
 }
 if(p.replay_outputs!==undefined){need(p.replay_outputs&&typeof p.replay_outputs==='object'&&!Array.isArray(p.replay_outputs),'INVALID_REPLAY');for(const x of Object.values(p.replay_outputs))need(typeof x==='string'&&x.isWellFormed()&&Buffer.byteLength(x)<=2*1024*1024,'INVALID_REPLAY');}
 if(p.evaluation_payloads!==undefined){need(p.evaluation_payloads&&typeof p.evaluation_payloads==='object'&&!Array.isArray(p.evaluation_payloads),'INVALID_REPLAY');for(const x of Object.values(p.evaluation_payloads))need(typeof x==='string'&&x.isWellFormed()&&Buffer.byteLength(x)<=2*1024*1024,'INVALID_REPLAY');}
 return p;
}
export function prepareDatasets(members,membership,documentCount){
 need(Array.isArray(members)&&members.length>0,'EMPTY_CORPUS');exactKeys(membership,['AUTHENTIC','NEGATIVE']);const seen=new Set(),result={};
 for(const [label,indices] of Object.entries(membership)){
  need(Array.isArray(indices)&&indices.length===documentCount,'DOCUMENT_OMISSION_OR_ORDER_MUTATION');let previous=-1;
  result[label]=indices.map(i=>{integer(i,0,members.length-1,'DOCUMENT_OMISSION_OR_ORDER_MUTATION');need(i>previous&&!seen.has(i),'DOCUMENT_OMISSION_OR_ORDER_MUTATION');previous=i;seen.add(i);const m=members[i];need(m&&Buffer.isBuffer(m.bytes)&&typeof m.text==='string'&&m.text.isWellFormed()&&Buffer.from(m.text,'utf8').equals(m.bytes),'SOURCE_BYTES_MUTATED');return m;});
 }
 need(seen.size===members.length,'DOCUMENT_OMISSION_OR_ORDER_MUTATION');return result;
}
function orderDocuments(documents,c){if(c.order==='ORIGINAL')return documents;if(c.order==='REVERSED')return [...documents].reverse();return c.indices.map(i=>documents[i]);}
export function measureCapacity({plan,datasets,tokenizer=referenceTokenizer(),approvedCeiling=720000}){
 need(isApprovedTokenizer(tokenizer),'UNTRUSTED_TOKENIZER');
 validatePlan(plan,approvedCeiling);const calls=[],evaluationRecords=[],knownOutput=plan.replay_outputs||{},used=new Set(),sourceRecords=[],counts=new Map();
 for(const value of Object.values(knownOutput))need(tokenizer.count(value)<=plan.output_ceiling,'INVALID_REPLAY');
 const count=text=>{if(!counts.has(text))counts.set(text,tokenizer.count(text));return counts.get(text);};
 for(const [evidence,docs] of Object.entries(datasets)){need(docs.length===plan.documents_per_evidence,'DOCUMENT_OMISSION_OR_ORDER_MUTATION');for(const doc of docs)sourceRecords.push({evidence,original_index:doc.original_index,name:doc.name,bytes:doc.bytes.length,sha256:hash(doc.bytes),source_tokens:tokenizer.count(doc.text)});}
 const slot=(id)=>{used.add(id);return {id,text:Object.hasOwn(knownOutput,id)?knownOutput[id]:null};};
 function measured(context,history,handoffs,evidence,id){
  const missing=[...history,...handoffs].filter(x=>x.text===null).length;
  const values=x=>x.map(v=>v.text===null?'':v.text);
  const rendered=renderTemplate({...context,evidence,history:values(history),handoffs:values(handoffs)});
  const emptyTokens=count(rendered),bytes=Buffer.byteLength(rendered);
  const byteUpper=bytes+missing*6*plan.output_ceiling*tokenizer.max_token_bytes;
  need(Number.isSafeInteger(byteUpper),'CAPACITY_ARITHMETIC_OVERFLOW');
  const refs=values=>values.map(v=>({output_id:v.id,available:v.text!==null,sha256:v.text===null?null:hash(v.text)}));
  calls.push({id,arm:context.arm,stage:context.stage,history_refs:refs(history),handoff_refs:refs(handoffs),evidence_refs:evidence.map(e=>({source:e.source,sha256:hash(e.text)})),missing_output_slots:missing,exact_rendered_text_tokens:missing===0?emptyTokens:null,empty_slot_hypothetical_text_tokens:emptyTokens,known_rendered_bytes:bytes,conditional_body_token_upper_bound:missing===0?emptyTokens:byteUpper,forecast_body_tokens:emptyTokens+missing*plan.history_forecast_tokens,provider_input_exact:false,rendered_sha256:missing===0?hash(rendered):null});
 }
 for(let condition=0;condition<plan.conditions.length;condition++){
  const c=plan.conditions[condition];need(Array.isArray(datasets[c.evidence]),'MISSING_NEGATIVE_EVIDENCE_VARIANT');
  const docs=orderDocuments(datasets[c.evidence],c);
  for(let replication=0;replication<c.replications;replication++)for(const arm of ARMS){
   const prefix=condition+':'+replication+':'+arm,all=[],second=[],handoffs=[];
   const baseline=prefix+':baseline';measured({arm,stage:'BASELINE',representation:c.representation},[],[],[],baseline);const initial=slot(baseline);all.push(initial);second.push(initial);
   for(let d=0;d<docs.length;d++){
    const evidence=docs.slice(0,d+1).map(doc=>({source:'EM::D'+(doc.original_index+1),text:doc.text}));
    const one=prefix+':'+d+':1',two=prefix+':'+d+':2';
    if(arm==='ARM_2A_MODULAR'){
     measured({arm,stage:'MODULAR_1',representation:c.representation},all,[],evidence,one);const first=slot(one);all.push(first);handoffs.push(first);
     measured({arm,stage:'MODULAR_2',representation:c.representation},second,handoffs,[],two);const final=slot(two);second.push(final);all.push(final);
    }else{
     measured({arm,stage:'UNION_1',representation:c.representation},all,[],evidence,one);all.push(slot(one));
     measured({arm,stage:'UNION_2',representation:c.representation},all,[],evidence,two);all.push(slot(two));
    }
   }
   measured({arm,stage:'SYNTHESIS',representation:c.representation},arm==='ARM_2A_MODULAR'?second:all,arm==='ARM_2A_MODULAR'?handoffs:[],arm==='ARM_2A_MODULAR'?[]:docs.map(doc=>({source:'EM::D'+(doc.original_index+1),text:doc.text})),prefix+':synthesis');
  }
 }
 need(Object.keys(knownOutput).every(k=>used.has(k)),'UNUSED_OR_WRONG_LANE_REPLAY');
 const evalTokenizer=referenceTokenizer(plan.evaluator.reference_encoding||tokenizer.encoding),evalUsed=new Set(),evalInputs=plan.evaluation_payloads||{},evalCounts=new Map();
 const payload=id=>{evalUsed.add(id);return Object.hasOwn(evalInputs,id)?evalInputs[id]:null;};
 const evalMeasure=(arm,stage,evidence,values)=>{
  const missing=values.filter(x=>x===null).length,B=plan.evaluator.future_payload_byte_bound??null;
  if(B!==null)need(values.every(x=>x===null||Buffer.byteLength(x)<=B),'INVALID_REPLAY');
  const strings=values.map(x=>x===null?'':x);
  const text=renderEvaluatorTemplate(stage==='SEMANTIC_AUDIT'?{stage,neutralPackets:strings}:{stage,evidence,candidate:strings[0],proof:strings[1],controls:strings[2]});
  if(!evalCounts.has(text))evalCounts.set(text,evalTokenizer.count(text));const tokens=evalCounts.get(text);
  evaluationRecords.push({arm,stage,missing_payload_slots:missing,encoding:evalTokenizer.encoding,exact_rendered_text_tokens:missing===0?tokens:null,empty_slot_hypothetical_text_tokens:tokens,conditional_body_token_upper_bound:missing===0?tokens:B===null?null:Buffer.byteLength(text)+missing*6*B,rendered_sha256:missing===0?hash(text):null,provider_input_exact:false,evaluator_model_mapping_verified:false});
 };
 for(let condition=0;condition<plan.conditions.length;condition++){
  const c=plan.conditions[condition],e=plan.evaluator,evidence=datasets[c.evidence].map(doc=>({source:'EM::D'+(doc.original_index+1),text:doc.text}));
  for(let replication=0;replication<c.replications;replication++){
   const packets=[];
   for(const arm of ARMS)for(let candidate=0;candidate<e.candidate_cap_per_arm_condition;candidate++){
    const prefix='E:'+condition+':'+replication+':'+arm+':'+candidate,values=['candidate','proof','controls'].map(field=>payload(prefix+':'+field));packets.push(values[0]);
    for(let pass=0;pass<e.calls_per_candidate;pass++)evalMeasure(arm,['MATHEMATICAL_PROOF','MATCHED_CONTROL','WARRANT_AND_NOVELTY'][pass%3],evidence,values);
   }
   for(let audit=0;audit<e.audit_calls_per_condition;audit++)evalMeasure('SHARED','SEMANTIC_AUDIT',[],packets);
  }
 }
 need(Object.keys(evalInputs).every(k=>evalUsed.has(k)),'UNUSED_OR_WRONG_LANE_REPLAY');
 const stats=ARMS.map((arm,index)=>{
  const lane=calls.filter(x=>x.arm===arm),base=lane.length,reserved=base+Math.ceil(base*plan.retry_fraction),maxAllRetry=base*(1+plan.max_retries_per_call);
  const output=plan.output_ceiling,overhead=plan.provider_overhead_bound;
  const conditions=plan.conditions.reduce((n,c)=>n+c.replications,0),e=plan.evaluator;
  const candidateBase=conditions*e.candidate_cap_per_arm_condition*e.calls_per_candidate,candidateReserved=candidateBase+Math.ceil(candidateBase*e.retry_fraction);
  const auditBase=conditions*e.audit_calls_per_condition,auditReserved=auditBase+Math.ceil(auditBase*e.retry_fraction);
  const evaluatorAllocated=candidateReserved*e.total_tokens_per_call+Math.ceil(auditReserved*e.audit_tokens_per_call/2);
  const observation=index===0?OBSERVED.a:OBSERVED.b,mean=(observation.input+observation.output)/observation.calls;
  const maxBound=lane.reduce((n,x)=>Math.max(n,x.conditional_body_token_upper_bound),0),evalLane=evaluationRecords.filter(x=>x.arm===arm||x.arm==='SHARED');
  return {arm,base_generation_calls:base,reserved_generation_attempts:reserved,per_call_retry_maximum_attempts:maxAllRetry,global_retry_pool_limits_retries:true,
   known_text_turns:lane.filter(x=>x.exact_rendered_text_tokens!==null).length,unproduced_output_turns:lane.filter(x=>x.exact_rendered_text_tokens===null).length,
   observed_mean_generation_forecast:Math.ceil(reserved*mean),source_aware_hypothetical_forecast:Math.ceil(lane.reduce((n,x)=>n+x.forecast_body_tokens+output,0)*(reserved/base)),
   imposed_limit_conditional_generation_envelope:reserved*(plan.input_ceiling+output),evaluator_candidate_attempts:candidateReserved,evaluator_shared_audit_attempts:auditReserved,evaluator_tokens_allocated:evaluatorAllocated,
   conditional_total_ceiling:reserved*(plan.input_ceiling+output)+evaluatorAllocated,observed_mean_plus_evaluator:Math.ceil(reserved*mean)+evaluatorAllocated,
   known_text_input_breach:lane.some(x=>x.exact_rendered_text_tokens!==null&&x.exact_rendered_text_tokens>plan.input_ceiling),
   unknown_history_upper_may_exceed_input_cap:maxBound+(overhead||0)>plan.input_ceiling,
   evaluator_future_payload_unbounded:evalLane.some(x=>x.conditional_body_token_upper_bound===null),evaluator_exact_known_inputs:evalLane.filter(x=>x.exact_rendered_text_tokens!==null).length,
   provider_overhead_unbounded:overhead===null,hard_controls_verified:false,fits_imposed_envelope:reserved*(plan.input_ceiling+output)+evaluatorAllocated<=plan.arm_token_ceiling};
 });
 for(const x of stats)for(const value of Object.values(x))if(typeof value==='number')need(Number.isSafeInteger(value)&&value>=0,'CAPACITY_ARITHMETIC_OVERFLOW');
 need(stats[0].base_generation_calls===stats[1].base_generation_calls,'COMPARATOR_OPPORTUNITY_MISMATCH');
 const result=frozen({private_record:{template_version:TEMPLATE_VERSION,plan,source_records:sourceRecords,call_records:calls,evaluator_records:evaluationRecords,statistics:stats,encoding:tokenizer.encoding,rank_sha256:tokenizer.rank_sha256},statistics:stats,source_token_total:sourceRecords.reduce((n,x)=>n+x.source_tokens,0),document_count:sourceRecords.length,model_mapping_verified:tokenizer.model_mapping_verified===true});measurements.add(result);return result;
}
const EXPORT_FIELDS=['document_count','source_token_total_bucket','capacity_by_arm'];
export function validateRelease(release){
 exactKeys(release,['fields','quantum']);need(Array.isArray(release.fields)&&new Set(release.fields).size===release.fields.length&&release.fields.every(f=>EXPORT_FIELDS.includes(f)),'UNAPPROVED_METADATA_EXPORT');integer(release.quantum,1000,1000000,'UNAPPROVED_METADATA_EXPORT');return release;
}
export function aggregateReport(measurement,release){
 need(measurements.has(measurement),'UNTRUSTED_MEASUREMENT');
 validateRelease(release);
 const bucket=n=>Math.ceil(n/release.quantum)*release.quantum;
 const p=measurement.private_record.plan;
 const report={schema:'td613.blind-capacity.aggregate/v1',status:'HELD_LIMITS_OR_MODEL_MAPPING_UNVERIFIED',template_version:TEMPLATE_VERSION,requested_model:p.model,requested_effort:p.effort,encoding:measurement.private_record.encoding,forecast_basis:'PR1616_REQUEST_CONDITION_REFERENCE_RATE_ONLY',matches_observed_request_condition:p.model==='gpt-6.1-sol'&&p.effort==='medium',effort_support_independently_verified:false,input_count_scope:'LOCAL_RENDERED_JSON_TEXT_ONLY',source_text_disclosed:false,provider_input_exact:false,model_mapping_verified:measurement.model_mapping_verified,gate_f:'HELD',empirical_credit:0};
 if(release.fields.includes('document_count'))report.document_count=measurement.document_count;
 if(release.fields.includes('source_token_total_bucket'))report.source_token_total_bucket=bucket(measurement.source_token_total);
 if(release.fields.includes('capacity_by_arm'))report.capacity_by_arm=measurement.statistics.map(s=>({arm:s.arm,base_generation_calls:s.base_generation_calls,reserved_generation_attempts:s.reserved_generation_attempts,
  observed_mean_forecast_bucket:bucket(s.observed_mean_plus_evaluator),hypothetical_body_forecast_bucket:bucket(s.source_aware_hypothetical_forecast+s.evaluator_tokens_allocated),
  imposed_conditional_envelope_bucket:bucket(s.conditional_total_ceiling),evaluation_allocation_bucket:bucket(s.evaluator_tokens_allocated),known_text_input_breach:s.known_text_input_breach,
  unknown_history_upper_may_exceed_input_cap:s.unknown_history_upper_may_exceed_input_cap,evaluator_future_payload_unbounded:s.evaluator_future_payload_unbounded,provider_overhead_unbounded:s.provider_overhead_unbounded,hard_controls_verified:false,fits_imposed_envelope:s.fits_imposed_envelope}));
 return report;
}
