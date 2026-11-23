import {deflateRawSync} from 'node:zlib';
import {crc32} from '../lib/zip.mjs';
export function syntheticMembers(count=3,negative=false){
 return Array.from({length:count},(_,i)=>{
  const prefix=negative?'Synthetic counterexample set':'Synthetic relay set';
  const text=[prefix,'Khona\u200clit-po',i===0?'Proposed recurrence: x_(n+1)=x_n+3; observations 5,8,11.':i===1?'Additional observations 15,19 contradict the universal increment 3.':'Revision: x_n=5+3n+max(0,n-2), conditional next value 23.','Private synthetic marker: RESEARCH_MARKER_'+i,''].join('\r\n');
  return {original_index:i,name:'synthetic_'+(negative?'negative_':'')+i+'.md',bytes:Buffer.from(text),text};
 });
}
export function makeZip(members,{deflate=false,descriptor=false}={}){
 const locals=[],central=[];let offset=0;
 for(const member of members){
  const name=Buffer.from(member.name),raw=member.bytes,compressed=deflate?deflateRawSync(raw):raw,method=deflate?8:0,flags=0x0800|(descriptor?8:0),crc=crc32(raw);
  const header=Buffer.alloc(30+name.length);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(flags,6);header.writeUInt16LE(method,8);header.writeUInt16LE(name.length,26);name.copy(header,30);
  if(!descriptor){header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(raw.length,22);}
  const footer=Buffer.alloc(descriptor?16:0);if(descriptor){footer.writeUInt32LE(0x08074b50);footer.writeUInt32LE(crc,4);footer.writeUInt32LE(compressed.length,8);footer.writeUInt32LE(raw.length,12);}
  locals.push(header,compressed,footer);
  const c=Buffer.alloc(46+name.length);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(0x0314,4);c.writeUInt16LE(20,6);c.writeUInt16LE(flags,8);c.writeUInt16LE(method,10);c.writeUInt32LE(crc,16);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(raw.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(0x81a40000,38);c.writeUInt32LE(offset,42);name.copy(c,46);central.push(c);offset+=header.length+compressed.length+footer.length;
 }
 const data=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(members.length,8);end.writeUInt16LE(members.length,10);end.writeUInt32LE(data.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,data,end]);
}
export function syntheticPlan(count=3){return {version:1,model:'gpt-6.1-sol',effort:'high',scope:'MICROSTUDY',documents_per_evidence:count,arm_token_ceiling:720000,input_ceiling:52000,output_ceiling:4096,retry_fraction:0.2,max_retries_per_call:3,history_forecast_tokens:512,provider_overhead_bound:null,controls_verified:false,evaluator:{candidate_cap_per_arm_condition:5,calls_per_candidate:3,total_tokens_per_call:8000,audit_calls_per_condition:1,audit_tokens_per_call:8000,retry_fraction:0.2},conditions:[{evidence:'AUTHENTIC',representation:'NEUTRAL',order:'ORIGINAL',replications:1}]};}
