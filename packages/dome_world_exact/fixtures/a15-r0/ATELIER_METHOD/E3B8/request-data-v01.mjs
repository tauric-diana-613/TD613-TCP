/** B.9.1 bounded plain-data snapshots. No source reads or execution authority.
 * Khona‌lit-po · requires trusted Node intrinsics; not an untrusted-JS sandbox.
 */
import {types} from 'node:util';

const isProxy=types.isProxy,isShared=types.isSharedArrayBuffer;
const ownKeys=Reflect.ownKeys,descriptor=Object.getOwnPropertyDescriptor;
const prototype=Object.getPrototypeOf,define=Object.defineProperty,freeze=Object.freeze;
const objectPrototype=Object.prototype,arrayPrototype=Array.prototype,bufferPrototype=Buffer.prototype;
const typedPrototype=prototype(Uint8Array.prototype);
const byteLength=descriptor(typedPrototype,'byteLength').get;
const backingBuffer=descriptor(typedPrototype,'buffer').get;
const isBuffer=Buffer.isBuffer,allocate=Buffer.allocUnsafeSlow,utf8Length=Buffer.byteLength;
const forbidden=new Set(['__proto__','prototype','constructor']);
export const REQUEST_LIMITS=freeze({maxDepth:24,maxNodes:8192,maxObjectKeys:128,maxArrayLength:1024,maxStringBytes:65536,maxBufferBytes:262144,maxTotalBufferBytes:524288});
const fail=code=>{throw Object.assign(Error(code),{code})};
const need=(ok,code)=>{if(!ok)fail(code)};

function ordinaryRecord(value){
 need(value!==null&&typeof value==='object','B8_PLAIN_REQUEST_REQUIRED');
 need(!isProxy(value),'B91_PROXY_REFUSED');
 need(prototype(value)===objectPrototype,'B8_PLAIN_REQUEST_REQUIRED');
}

/** Only inspect the action before deny-all-real-source refusal. Other fields stay untouched. */
export function requestAction(value){
 ordinaryRecord(value);
 const d=descriptor(value,'action');
 need(d&&'value' in d&&typeof d.value==='string'&&d.value.length<=128,'B8_ACTION_REQUIRED');
 return d.value;
}

/** Snapshot the complete supported value tree synchronously, without evaluating accessors.
 * Aliased acyclic subtrees are copied separately; reference identity is not protocol data.
 * Buffer is permitted only as the top-level staging bytes field and is copied bytewise.
 */
export function snapshotRequest(input,allowed,{stagingBytes=false}={}){
 ordinaryRecord(input);
 const ancestors=new Set();let nodes=0,stringBytes=0,bufferBytes=0;
 function string(value){stringBytes+=utf8Length(value,'utf8');need(stringBytes<=REQUEST_LIMITS.maxStringBytes,'B91_STRING_LIMIT');return value}
 function data(d){
  need(d&&'value' in d,'B91_ACCESSOR_REFUSED');
  need(d.enumerable===true&&typeof d.writable==='boolean'&&typeof d.configurable==='boolean','B91_HIDDEN_DATA_REFUSED');
  return d.value;
 }
 function copy(value,depth,bufferPosition=false){
  need(depth<=REQUEST_LIMITS.maxDepth,'B91_DEPTH_LIMIT');
  need(++nodes<=REQUEST_LIMITS.maxNodes,'B91_NODE_LIMIT');
  if(value===null||typeof value==='boolean')return value;
  if(typeof value==='string')return string(value);
  if(typeof value==='number'){need(Number.isFinite(value)&&!Object.is(value,-0),'B91_NONCANONICAL_NUMBER');return value}
  need(typeof value==='object','B91_UNSUPPORTED_SCALAR');
  need(!isProxy(value),'B91_PROXY_REFUSED');
  const proto=prototype(value);
  if(isBuffer(value)){
   need(bufferPosition&&stagingBytes,'B91_BUFFER_POSITION_REFUSED');
   need(proto===bufferPrototype,'B91_EXOTIC_BUFFER_PROTOTYPE');
   const n=byteLength.call(value);
   need(n<=REQUEST_LIMITS.maxBufferBytes,'B91_BUFFER_LIMIT');
   bufferBytes+=n;need(bufferBytes<=REQUEST_LIMITS.maxTotalBufferBytes,'B91_BUFFER_LIMIT');
   need(!isShared(backingBuffer.call(value)),'B91_SHARED_MEMORY_REFUSED');
   const keys=ownKeys(value);need(keys.length===n,'B91_BUFFER_EXTRA_PROPERTY');
   // All keys/descriptors must be data before allocating or copying any caller byte.
   const bytes=[];
   for(let i=0;i<n;i++){
    need(keys[i]===String(i),'B91_BUFFER_EXTRA_PROPERTY');
    const b=data(descriptor(value,keys[i]));need(Number.isInteger(b)&&b>=0&&b<=255,'B91_BUFFER_BYTE');bytes.push(b);
   }
   const out=allocate(n);for(let i=0;i<n;i++)out[i]=bytes[i];return out;
  }
  need(!ancestors.has(value),'B91_CYCLIC_DATA');ancestors.add(value);
  try{
   if(Array.isArray(value)){
    need(proto===arrayPrototype,'B91_EXOTIC_ARRAY_PROTOTYPE');
    const length=descriptor(value,'length');need(length&&'value'in length&&length.enumerable===false&&length.configurable===false,'B91_ARRAY_LENGTH_DESCRIPTOR');
    const n=length.value;need(Number.isInteger(n)&&n>=0&&n<=REQUEST_LIMITS.maxArrayLength,'B91_ARRAY_LIMIT');
    const keys=ownKeys(value);need(!keys.some(k=>typeof k==='symbol'),'B91_SYMBOL_REFUSED');
    need(keys.length===n+1&&keys.every(k=>k==='length'||/^(0|[1-9][0-9]*)$/.test(k)&&Number(k)<n),'B91_SPARSE_OR_EXTRA_ARRAY_PROPERTY');
    const values=[];for(let i=0;i<n;i++)values.push(data(descriptor(value,String(i))));
    return freeze(values.map(v=>copy(v,depth+1)));
   }
   need(proto===objectPrototype,'B91_EXOTIC_OBJECT_PROTOTYPE');
   const keys=ownKeys(value);need(keys.length<=REQUEST_LIMITS.maxObjectKeys,'B91_OBJECT_KEY_LIMIT');
   need(!keys.some(k=>typeof k==='symbol'),'B91_SYMBOL_REFUSED');
   const values=[];
   for(const k of keys){
    need(!forbidden.has(k),'B91_PROTOTYPE_KEY_REFUSED');string(k);
    if(depth===0)need(allowed.includes(k),'B8_UNEXPECTED_FIELD:'+k);
    values.push([k,data(descriptor(value,k))]);
   }
   const out={};
   for(const [k,v] of values)define(out,k,{value:copy(v,depth+1,depth===0&&k==='bytes'),enumerable:true,writable:true,configurable:true});
   return freeze(out);
  }finally{ancestors.delete(value)}
 }
 return copy(input,0);
}
