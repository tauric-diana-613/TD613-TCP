import crypto from 'node:crypto';
import {Tiktoken} from 'js-tiktoken/lite';
import {getEncodingNameForModel} from 'js-tiktoken';
import o200k from 'js-tiktoken/ranks/o200k_base';
import cl100k from 'js-tiktoken/ranks/cl100k_base';
import {need,refuse,integer} from './errors.mjs';
export const OFFICIAL_RANK_SHA256='446a9538cb6c348e3516120d7c08b09f57c36495e2acfffe59a5bf8b0cfb1a2d';
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const definitions={o200k_base:{ranks:o200k,size:199998,hash:OFFICIAL_RANK_SHA256},cl100k_base:{ranks:cl100k,size:100256,hash:'223921b76ee99bde995b7ff738513eef100fb51d18c93597a113bcffe865b2a7'}};
const cache=new Map();
const approvedTokenizers=new WeakSet();
export function isApprovedTokenizer(value){return approvedTokenizers.has(value);}
export function referenceTokenizer(encoding='o200k_base'){
 if(cache.has(encoding))return cache.get(encoding);
 need(Object.hasOwn(definitions,encoding),'TOKENIZER_ENCODING_NOT_IMPLEMENTED');const definition=definitions[encoding],ranks=definition.ranks;
 const table=[];
 for(const line of ranks.bpe_ranks.split('\n').filter(Boolean)){
  const [tag,offset,...tokens]=line.split(' ');need(tag==='!'&&Number.isSafeInteger(Number(offset)),'TOKENIZER_TABLE_INVALID');
  tokens.forEach((token,i)=>{need(!table[Number(offset)+i],'TOKENIZER_TABLE_INVALID');table[Number(offset)+i]=token;});
 }
 need(table.length===definition.size&&table.every(Boolean),'TOKENIZER_TABLE_INVALID');
 const rankText=table.map((token,i)=>token+' '+i+'\n').join('');
 need(hash(rankText)===definition.hash,'TOKENIZER_RANK_HASH_MISMATCH');
 const bytes=table.map(t=>Buffer.from(t,'base64'));
 const byteValues=new Set(bytes.filter(b=>b.length===1).map(b=>b[0]));
 need(byteValues.size===256,'TOKENIZER_BYTE_FALLBACK_INCOMPLETE');
 const maxTokenBytes=bytes.reduce((maximum,b)=>Math.max(maximum,b.length),0);
 const encoder=new Tiktoken(ranks);
 const singleton=Object.freeze({
  encoding,implementation:'js-tiktoken@1.0.21',rank_sha256:definition.hash,regex_sha256:hash(ranks.pat_str),max_token_bytes:maxTokenBytes,
  model_mapping_verified:false,
  count(text){need(typeof text==='string'&&text.isWellFormed(),'INVALID_UNICODE');try{return encoder.encode(text,[],[]).length;}catch{refuse('TOKENIZER_FAILURE');}},
  encode(text){need(typeof text==='string'&&text.isWellFormed(),'INVALID_UNICODE');try{return encoder.encode(text,[],[]);}catch{refuse('TOKENIZER_FAILURE');}}
 });
 approvedTokenizers.add(singleton);
 cache.set(encoding,singleton);
 return singleton;
}
export function requireModelMapping(profile,authorization,model='gpt-6.1-sol',effort='high'){
 need(profile&&profile.model===model&&Array.isArray(profile.allowed_efforts)&&profile.allowed_efforts.includes(effort),'MODEL_OR_EFFORT_PROFILE_UNAPPROVED');
 integer(profile.context_tokens,1,Number.MAX_SAFE_INTEGER,'MODEL_OR_EFFORT_PROFILE_UNAPPROVED');integer(profile.max_output_tokens,1,profile.context_tokens,'MODEL_OR_EFFORT_PROFILE_UNAPPROVED');
 const reference=referenceTokenizer(profile.encoding);
 need(profile.rank_sha256===reference.rank_sha256&&profile.regex_sha256===reference.regex_sha256,'MODEL_TOKENIZER_MAPPING_UNAVAILABLE');
 need(authorization&&authorization.accepted_model_tokenizer_profile_sha256===hash(JSON.stringify(profile)),'MODEL_TOKENIZER_MAPPING_UNAVAILABLE');
 need(['OPERATOR_ACCEPTED_OFFLINE_MAPPING','REGISTERED_OPEN_SOURCE_MAPPING'].includes(profile.basis)&&typeof profile.evidence_reference==='string'&&profile.evidence_reference.length>0,'MODEL_TOKENIZER_MAPPING_UNAVAILABLE');
 if(profile.basis==='REGISTERED_OPEN_SOURCE_MAPPING'){let mapped;try{mapped=getEncodingNameForModel(model);}catch{}need(mapped===profile.encoding,'MODEL_TOKENIZER_MAPPING_UNAVAILABLE');}
 const accepted=Object.freeze({...reference,model_mapping_verified:false,model_mapping_accepted_by_operator:true});approvedTokenizers.add(accepted);return accepted;
}
