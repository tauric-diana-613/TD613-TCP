// Offline inspection only: no model calls, network, protected ingress, or repository mutations.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const json=p=>JSON.parse(read(p));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const checks=[];
for(const f of json('source-manifest.json')){
 const b=Buffer.from(read('sources/'+f.path));
 assert.equal(sha(b),f.sha256);
 assert.equal(crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex'),f.git_blob_sha1);
}
checks.push('Six exact-ref source SHA-256 and Git blob SHA-1 identities match');
const h=Object.fromEntries(['ARM_2A_MODULAR','ARM_2B_MATCHED_UNION'].map(a=>[a,json('histories/'+a+'.json')]));
const ids=new Set();
let calls=0,tools=0;
for(const [arm,history] of Object.entries(h)){
 assert.equal(history.length,6);
 for(let i=0;i<history.length;i++){
  const item=history[i],prefix=item.receipt.replace('.json','');
  const receipt=json('receipts/'+item.receipt),input=read('receipts/'+prefix+'-input.txt');
  assert.equal(sha(input),receipt.input_sha256);
  assert.equal(receipt.exit_code,0);
  const events=read('receipts/'+prefix+'-stdout.jsonl').trim().split(/\r?\n/).map(x=>JSON.parse(x));
  assert.equal(events.filter(e=>e.type==='turn.completed').length,1);
  assert.equal(events.some(e=>['error','turn.failed'].includes(e.type)),false);
  const text=events.filter(e=>e.item?.type==='agent_message').map(e=>e.item.text).join('\n');
  assert.equal(text,item.text);
  assert.deepEqual(events.find(e=>e.type==='turn.completed').usage,item.usage);
  const id=events.find(e=>e.type==='thread.started').thread_id;
  assert(!ids.has(id));ids.add(id);
  tools+=events.filter(e=>e.item&&e.item.type!=='agent_message').length;
  if(prefix!=='attempt-03'){
   const replay=JSON.parse(input.split('EXACT OWN PRIOR FINAL MESSAGES:\n')[1].split('\nCURRENT ')[0]);
   const expected=(arm==='ARM_2A_MODULAR'?history.slice(0,i).filter(x=>x.stage===item.stage):history.slice(0,i)).map(x=>({document:x.document,stage:x.stage,actual_final_message:x.text}));
   assert.deepEqual(replay,expected);
   if(arm==='ARM_2A_MODULAR'&&item.stage===2){assert(input.includes(history[i-1].text));}
  }
  calls++;
 }
}
assert.equal(calls,12);assert.equal(tools,0);
checks.push('12 successful genuine-process recorded turns, unique local thread IDs, exact output/usage binding, zero visible tool items');
checks.push('All later arm prompts replay exactly their own prescribed stage history; current modular handoffs equal actual preceding outputs');
assert.equal(json('receipts/attempt-01.json').exit_code,1);
assert.equal(json('receipts/attempt-02.json').exit_code,1);
assert(read('receipts/attempt-02-stdout.jsonl').includes("not supported when using Codex with a ChatGPT account"));
assert.equal(json('stage2/independent-credential-contract.json').result,'REJECTED');
assert(json('stage2/baseline-held-assembler-receipts.json').every(x=>x.adjudicated_candidate.status==='HELD_INSUFFICIENT_DATA'));
const review=json('stage2/execution-receipt.json');assert.equal(review.exit_code,0);assert(review.usage);assert.equal(review.independent_credentials,false);
const blind=json('stage2/evaluator-only-payload.json');
assert(!/ARM_2A|ARM_2B|PEDAGOGUE|APERTURE|FADT|CHAMBER|MODULAR|MATCHED[_ -]?UNION/i.test(JSON.stringify(blind)));
checks.push('Recorded failures preserved, independent-credential request refused, uncredentialed baseline assembler held, fresh native review recorded');
checks.push('Syntactic arm labels absent from review packet; semantic blindness explicitly remains unverified');
for(const d of json('receipts/arm0.json').records){assert.equal(sha(read('arm0-transport/'+d.document+'.txt')),d.sha256);}
if(fs.existsSync(path.join(root,'evidence-manifest.json'))){for(const f of json('evidence-manifest.json'))assert.equal(sha(fs.readFileSync(path.join(root,f.path))),f.sha256);checks.push('Published evidence manifest hashes match');}
console.log(JSON.stringify({status:'PASS',checks,successful_reasoning_turns:calls,native_review_turns:1,visible_tool_items:tools,provider_attestation_verified:false,semantic_blindness_verified:false,independent_witness_verified:false},null,2));
