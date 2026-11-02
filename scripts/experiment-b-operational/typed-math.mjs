import {canonical} from '../experiment-b-resumable/journal.mjs';
// Fixed, finite arithmetic. No expression evaluator or caller-selected code.
export const MATH_POLICY = Object.freeze({schema:'TD613_EXACT_INTEGER_V1',
  operations:['add','subtract','multiply','gcd'], maxOperations:8,
  operandDigits:512, maxRequestBytes:8192, tolerance:0});
export const MAX_TYPED_RESULT_BYTES=Buffer.byteLength(JSON.stringify({content:[{type:'text',text:
  JSON.stringify({schema:MATH_POLICY.schema,values:Array(8).fill('-'+'9'.repeat(1024)),tolerance:0})}],isError:false}));
// Input JSON (8192), serialized result above, fixed keys/sequence/newline (<128).
export const MAX_MATH_RECEIPT_BYTES=8192+MAX_TYPED_RESULT_BYTES+128;
export function exactArithmetic(request) {
  if (!request || Object.keys(request).some(k=>k!=='operations') ||
      !Array.isArray(request.operations) || request.operations.length>8 ||
      Buffer.byteLength(JSON.stringify(request))>8192) throw Error('TYPED_OPERATIONS_REQUIRED');
  const integer=x=>{if(typeof x!=='string'||!/^[-]?[0-9]{1,512}$/.test(x))throw Error('INTEGER_REQUIRED');return BigInt(x);};
  return request.operations.map(item=>{
    if(!item || Object.keys(item).sort().join(',')!=='a,b,op')throw Error('TYPED_OPERATION_REQUIRED');
    const a=integer(item.a),b=integer(item.b);
    switch(item.op){case 'add':return String(a+b);case 'subtract':return String(a-b);
      case 'multiply':return String(a*b);case 'gcd':{let x=a<0n?-a:a,y=b<0n?-b:b;
        while(y){const r=x%y;x=y;y=r;}return String(x);}default:throw Error('OPERATION_REFUSED');}
  });
}

// The stdio tool is the only declared mathematical tool. The supervisor injects
// this fixed source, never a caller expression. It stores the exact successful
// input/output before replying; the capture authority later checks the native
// lifecycle against these separately read physical records.
export const mathServerSource = `
import fs from 'node:fs';
const exactArithmetic=${exactArithmetic.toString()};
const fd=fs.openSync('/capture/kernel.jsonl','wx',0o600);
const tool={name:'exact_integer',description:'Finite exact integer arithmetic; unverified ideas may still be proposed as text.',inputSchema:{type:'object',additionalProperties:false,required:['operations'],properties:{operations:{type:'array',maxItems:8,items:{type:'object',additionalProperties:false,required:['op','a','b'],properties:{op:{enum:['add','subtract','multiply','gcd']},a:{type:'string',pattern:'^-?[0-9]{1,512}$'},b:{type:'string',pattern:'^-?[0-9]{1,512}$'}}}}}}};
let pending='',calls=0;
const reply=(id,result)=>process.stdout.write(JSON.stringify({jsonrpc:'2.0',id,result})+'\\n');
for await(const chunk of process.stdin){pending+=chunk.toString('utf8');if(Buffer.byteLength(pending)>16384)throw Error('MCP_FRAME_BOUND');let end;while((end=pending.indexOf('\\n'))>=0){const line=pending.slice(0,end);pending=pending.slice(end+1);const m=JSON.parse(line);if(m.jsonrpc!=='2.0')throw Error('MCP_PROTOCOL');
if(m.method==='notifications/initialized')continue;
if(m.method==='initialize')reply(m.id,{protocolVersion:m.params.protocolVersion,capabilities:{tools:{}},serverInfo:{name:'td613_math',version:'1.0.0'}});
else if(m.method==='ping')reply(m.id,{});
else if(m.method==='tools/list')reply(m.id,{tools:[tool]});
else if(m.method==='tools/call'){
if(++calls>64||m.params?.name!=='exact_integer')throw Error('MATH_SERVICE_BOUND');
const input=m.params.arguments;const values=exactArithmetic(input);
const result={content:[{type:'text',text:JSON.stringify({schema:'TD613_EXACT_INTEGER_V1',values,tolerance:0})}],isError:false};
fs.writeSync(fd,JSON.stringify({sequence:calls,input,result})+'\\n');fs.fsyncSync(fd);reply(m.id,result);
}else throw Error('MCP_METHOD_REFUSED');}}
if(pending.length)throw Error('MCP_INCOMPLETE_FRAME');fs.closeSync(fd);
`;

export function nativeKernelResult(result){
  // The inspected native JSONL type copies content, optional _meta and
  // structured_content; it does not serialize MCP's successful isError flag.
  // The fixed worker emits no metadata or structured content. Keep its raw
  // receipt unchanged and compare against this explicit transport projection.
  if(!result||Object.keys(result).sort().join(',')!=='content,isError'||result.isError!==false||!Array.isArray(result.content))
    throw Error('FIXED_KERNEL_RESULT_REQUIRED');
  return {content:result.content,structured_content:null};
}

export function correlateKernelEvents(events, receipts, maxCalls=64) {
  if (!Number.isSafeInteger(maxCalls)||maxCalls<1||maxCalls>4096||!Array.isArray(receipts) || receipts.length>maxCalls) throw Error('KERNEL_RECEIPTS_REQUIRED');
  const states=new Map(), completed=[];
  for (const e of events) {
    if(!['item.started','item.updated','item.completed'].includes(e.type))continue;
    const i=e.item;
    if(['agent_message','reasoning'].includes(i?.type))continue;
    if(i?.type!=='mcp_tool_call'||i.server!=='td613_math'||i.tool!=='exact_integer'||typeof i.id!=='string')throw Error('UNEXPECTED_TOOL_ACTIVITY');
    if(e.type==='item.started'){
      if(states.has(i.id))throw Error('KERNEL_LIFECYCLE_REUSE');
      states.set(i.id,'STARTED');
    }else{
      if(states.get(i.id)!=='STARTED')throw Error('KERNEL_LIFECYCLE_INCOMPLETE');
      if(e.type==='item.completed'){
        if(i.error || i.status!=='completed')throw Error('KERNEL_TOOL_FAILED');
        states.set(i.id,'COMPLETED');completed.push(i);
      }
    }
  }
  if([...states.values()].some(s=>s!=='COMPLETED')||completed.length!==receipts.length)throw Error('KERNEL_LIFECYCLE_INCOMPLETE');
  // Ordering is deliberately strict; parallel/reordered or unrecognized native
  // envelopes HOLD until the interface has separate source-free acceptance.
  for(let n=0;n<completed.length;n++){
    const i=completed[n],r=receipts[n];
    if(r.sequence!==n+1 || canonical(i.arguments)!==canonical(r.input) ||
      canonical(i.result)!==canonical(nativeKernelResult(r.result)) ||
      JSON.stringify(exactArithmetic(r.input))!==JSON.stringify(JSON.parse(r.result.content[0].text).values))
      throw Error('KERNEL_ACTIVITY_RECEIPT_CONFLICT');
  }
  return {items:completed,receipts};
}
