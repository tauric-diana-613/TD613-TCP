#!/usr/bin/env node
/**
 * Local-only recovery of three Sept 10 user-pasted Wendbine originals.
 * ChatGPT data export is PRIVATE: no upload, no network, no GitHub publication.
 * Exact user message is a candidate witness, NOT automatically a clean Reddit body.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {assertPrivateDestination} from './wendbine-originals-intake.mjs';

export const P0_CHAT_LEADS=[
 {source_id_candidate:'reddit:t3_1wc66e4',timestamp:'2026-09-10T03:22:46Z',needles:['phone security systems glossary','schrödinger']},
 {source_id_candidate:'reddit:t3_1wc7p1y',timestamp:'2026-09-10T03:54:01Z',needles:['authorization and trust corridor']},
 {source_id_candidate:'reddit:t3_1wc8o05',timestamp:'2026-09-10T06:26:40Z',needles:['third-party dependency propagation','table of contents']}
];
const sha256Utf8 = s=>crypto.createHash('sha256').update(Buffer.from(s,'utf8')).digest('hex');
function partsOf(message){
 const content=message?.content;
 if(Array.isArray(content?.parts))return content.parts.filter(p=>typeof p==='string');
 if(typeof content?.text==='string')return [content.text];
 return [];
}
export function recoverChatExport({inputPath,destination,leads=P0_CHAT_LEADS}){
 const output=assertPrivateDestination(destination);
 if(fs.existsSync(output))throw new Error('REFUSE_OVERWRITE_EXISTING_PRIVATE_EXPORT');
 const data=JSON.parse(fs.readFileSync(inputPath,'utf8'));
 if(!Array.isArray(data))throw new Error('CHAT_EXPORT_ARRAY_REQUIRED');
 const candidates=[];
 for(const conversation of data){
   for(const node of Object.values(conversation.mapping||{})){
     const message=node?.message;
     if(message?.author?.role!=='user')continue;
     const parts=partsOf(message);
     if(!parts.length)continue;
     const when=Number(message.create_time);
     for(const lead of leads){
       if(!Number.isFinite(when)||Math.abs(when-Date.parse(lead.timestamp)/1000)>600)continue;
       const haystack=parts.join('\n').normalize('NFKC').toLowerCase();
       if(!lead.needles.every(n=>haystack.includes(n.normalize('NFKC').toLowerCase())))continue;
       candidates.push({lead,conversation_id:conversation.id??null,message_id:message.id??null,timestamp:message.create_time,parts});
     }
   }
 }
 // Do not claim one unique original when multiple match the same lead.
 fs.mkdirSync(output,{recursive:true,mode:0o700});
 const report=[];
 for(const lead of leads){
   const matches=candidates.filter(c=>c.lead.source_id_candidate===lead.source_id_candidate);
   if(matches.length!==1){
     report.push({source_id_candidate:lead.source_id_candidate,state:matches.length?'AMBIGUOUS_MATCHES_REQUIRE_REVIEW':'NO_MATCH_IN_EXPORT',candidate_count:matches.length});
     continue;
   }
   const c=matches[0],id=lead.source_id_candidate.slice('reddit:t3_'.length);
   const whole=c.parts.length===1?c.parts[0]:null;
   const artifact={
     schema:'wendbine-private-user-pasted-chat-source-candidate/v0.1',
     source_id_candidate:lead.source_id_candidate,
     source_message_timestamp:c.timestamp,
     source_conversation_id:c.conversation_id,
     source_message_id:c.message_id,
     content_parts_exact:c.parts,
     whole_user_message_exact:whole,
     source_class:'USER_PASTED_FULL_MESSAGE_CANDIDATE_SOURCE_SPAN_NOT_YET_ISOLATED',
     source_id_canonical_match_state:'CANDIDATE_BY_TITLE_AND_TIME_NOT_VERIFIED_BY_POST_FETCH',
     exact_original_reddit_title_body_adjudicated:false,
     content_parts_sha256_utf8:c.parts.map(sha256Utf8),
     whole_message_sha256_utf8:whole===null?null:sha256Utf8(whole)
   };
   fs.writeFileSync(path.join(output,id+'-user-message.json'),JSON.stringify(artifact,null,2)+'\n',{flag:'wx',mode:0o600});
   report.push({source_id_candidate:lead.source_id_candidate,state:'EXACT_USER_MESSAGE_PARTS_RECOVERED_SOURCE_BODY_BOUNDARY_REVIEW_REQUIRED',candidate_count:1,parts:c.parts.length,whole_message_sha256_utf8:artifact.whole_message_sha256_utf8});
 }
 const result={schema:'wendbine-chat-export-p0-recovery/v0.1',leads_requested:leads.length,unique_candidates_recovered:report.filter(r=>r.candidate_count===1).length,original_reddit_title_body_pairs_verified:0,records:report};
 fs.writeFileSync(path.join(output,'recovery-report.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [inputPath,destination]=process.argv.slice(2);
 if(!inputPath||!destination)throw new Error('Usage: node wendbine-chat-export-rescue.mjs /private/conversations.json /private/wendbine-chat-recovery');
 const result=recoverChatExport({inputPath,destination});
 process.stdout.write(JSON.stringify({unique_candidates_recovered:result.unique_candidates_recovered,original_reddit_title_body_pairs_verified:0})+'\n');
}
