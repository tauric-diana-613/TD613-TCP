import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {runFixtureOnlyReciprocal,TWO_ROUTES} from '../scripts/pe06-source-matched-reciprocal-v01.mjs';
import {ROUTES} from '../scripts/reciprocal-receiver-sourcefree-v01.mjs';
const repoRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=b=>createHash('sha256').update(b).digest('hex');
const td={schema:'td613.research-intake/v1',record_id:'R-PE06-001',kind:'source_note',title:'Synthetic source Ω',
 recorded_at:'2026-11-02T12:00:00Z',author:'fixture',human_request_ref:'synthetic',visibility:'public',
 body:'Qualified invented witness.',sources:[{source_id:'FIXTURE:TD-PRIMARY',kind:'artifact',locator:'fixture:source',capture_status:'OPERATOR_SUPPLIED'}],
 evidence:{disposition:'SPECIFIED',earned_claim:'invented only',claim_ceiling:'No empirical inference',missing_evidence:[]}};
const posts=['a','b'].map(x=>({source_id:'reddit:t3_'+x,snapshot_id:'SYN',community:'r/Wendbine',
 source_text_stored:false,real_person_identity_adjudicated:false,
 canonical_url:'https://www.reddit.com/r/Wendbine/comments/'+x,declared_concepts:['alpha','beta'],
 public_date:'2026-09-10',time_precision:'DAY',technical_header:'fixture '+x,source_flags:[]}));
const w={meta:{schema:'wendbine-public-corpus-snapshot/v0.1',snapshot_id:'SYN',coverage:{admitted_source_count:2},
 scope:{surface:'synthetic',community:'r/Wendbine',private_google_group_admitted:false},rights:{full_post_bodies_copied:false},authority:{}},
 posts,relations:[{source_id:posts[0].source_id,graph:'G_D',from:'alpha',relation:'DEPENDS_ON',to:'beta',evidence_class:'SOURCE_EXPLICIT_PROGRAM'}]};
const make=(r,id,o)=>{const original=JSON.stringify(o),bytes=Buffer.from(original);return {
 evidence_class:'SYNTHETIC_SOURCE_FREE_FIXTURE',rights:'SYNTHETIC_LOCAL_ONLY',
 source_pin:ROUTES[r].sourcePin,source_id:id,original,bytes,sha256:sha(bytes)}};
const cases=()=>({[TWO_ROUTES[0]]:make(TWO_ROUTES[0],'FIXTURE:TD-PE06',td),
 [TWO_ROUTES[1]]:make(TWO_ROUTES[1],'FIXTURE:W-PE06',w)});
test('PE06: both route-specific six control lanes execute source-matched native/receiver/transport',async t=>{
 const store=fs.mkdtempSync(path.join(os.tmpdir(),'pe06-'));t.after(()=>fs.rmSync(store,{recursive:true,force:true}));
 const actual=await runFixtureOnlyReciprocal({repoRoot,store,sourceByRoute:cases()});
 assert.equal(Object.keys(actual.routes).length,2);
 for(const x of Object.values(actual.routes)){
  assert.equal(x.transport.executed,0);assert.equal(x.T3_native.receiver_result_sha256,x.T3_native.native_result_sha256);
  assert.equal(x.T4,'UNEXECUTED');assert.equal(x.T5,'UNEXECUTED');
 }
 assert.equal(actual.experimental_authority,false);assert.equal(actual.real_sources_admitted,0);
});
test('PE06: refuse missing route, wrong evidence and wrong rights before read',async t=>{
 const store=fs.mkdtempSync(path.join(os.tmpdir(),'pe06-'));t.after(()=>fs.rmSync(store,{recursive:true,force:true}));
 const c=cases();delete c[TWO_ROUTES[1]];
 await assert.rejects(runFixtureOnlyReciprocal({repoRoot,store,sourceByRoute:c}),/PE06_BOTH_ROUTES_REQUIRED/);
 const d=cases();d[TWO_ROUTES[0]].rights='WENDBINE_PRIVATE_BODY';
 await assert.rejects(runFixtureOnlyReciprocal({repoRoot,store,sourceByRoute:d}),/PE06_SOURCE_FREE_BYTES_AND_PIN_REQUIRED/);
});
