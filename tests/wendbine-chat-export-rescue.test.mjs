import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {P0_CHAT_LEADS,recoverChatExport} from '../packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-chat-export-rescue.mjs';

assert.equal(P0_CHAT_LEADS.length,3);
assert.deepEqual(P0_CHAT_LEADS.map(x=>x.source_id_candidate),['reddit:t3_1wc66e4','reddit:t3_1wc7p1y','reddit:t3_1wc8o05']);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'wendbine-chat-extract-test-'));
const msg='Wendbine 🔐📱🫧 Schrödinger’s Library. Phone Security Systems Glossary\r\n\n  Exact spacing ∴  \nSealed ⟐';
const output=path.join(tmp,'private');
const when=Date.parse(P0_CHAT_LEADS[0].timestamp)/1000;
const fixture=[{
 id:'synthetic-conversation',
 mapping:{
   'source':{message:{id:'synthetic-user-source',create_time:when,author:{role:'user'},content:{parts:[msg]}}},
   'unrelated':{message:{id:'other-private-user-message',create_time:when,author:{role:'user'},content:{parts:['Personal unrelated chat: must not be exported.']}}},
   'assistant':{message:{id:'assistant-paraphrase',create_time:when,author:{role:'assistant'},content:{parts:[msg]}}}
 }
}];
try{
 const input=path.join(tmp,'conversations.json');
 fs.writeFileSync(input,JSON.stringify(fixture));
 const report=recoverChatExport({inputPath:input,destination:output});
 assert.equal(report.leads_requested,3);
 assert.equal(report.unique_candidates_recovered,1);
 assert.equal(report.original_reddit_title_body_pairs_verified,0);
 assert.equal(report.records[1].state,'NO_MATCH_IN_EXPORT');
 const saved=JSON.parse(fs.readFileSync(path.join(output,'1wc66e4-user-message.json'),'utf8'));
 assert.equal(saved.whole_user_message_exact,msg,'Do not normalize Unicode, whitespace or line breaks.');
 assert.equal(saved.whole_message_sha256_utf8,crypto.createHash('sha256').update(Buffer.from(msg,'utf8')).digest('hex'));
 assert.equal(saved.exact_original_reddit_title_body_adjudicated,false);
 assert.ok(!fs.readdirSync(output).some(x=>x.includes('other-private-user-message')),'No unrelated chat may escape');
 assert.throws(()=>recoverChatExport({inputPath:input,destination:output}),/REFUSE_OVERWRITE_EXISTING_PRIVATE_EXPORT/);
 const duplicated=structuredClone(fixture);
 duplicated[0].mapping['duplicate']={message:{id:'second-matching-user-msg',create_time:when,author:{role:'user'},content:{parts:[msg]}}};
 const doubledFile=path.join(tmp,'double.json'),doubledOut=path.join(tmp,'double-private');
 fs.writeFileSync(doubledFile,JSON.stringify(duplicated));
 const doubleReport=recoverChatExport({inputPath:doubledFile,destination:doubledOut});
 assert.equal(doubleReport.records[0].state,'AMBIGUOUS_MATCHES_REQUIRE_REVIEW');
 assert.equal(doubleReport.records[0].candidate_count,2);
 assert.ok(!fs.existsSync(path.join(doubledOut,'1wc66e4-user-message.json')));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('Wendbine P0 prior-chat extraction: exact source-message roundtrip, unrelated-chat isolation, and ambiguous-match hold passed.');
