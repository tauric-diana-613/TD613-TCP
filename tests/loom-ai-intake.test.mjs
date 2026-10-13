import test from 'node:test';
import assert from 'node:assert/strict';
import { File } from 'node:buffer';
import { readLoomDocument, buildLoomAiRequest, inspectLoomAiResponse, LOOM_AI_LIMITS } from '../app/dome-world/holonomy-loom/ai-intake.js';

const privateText = 'PRIVATE_SILVER_ORCHID_519';
const original = () => ({
  task: 'Compare the two vendor timelines, identify contradictions, and draft questions with source IDs.',
  documents: [
    { id: 'vendor-a', name: 'delivery.csv', text: 'vendor,date,cost\nA,2026-10-04,1900', share: true },
    { id: 'vendor-b', name: 'schedule.md', text: 'Vendor B reports delivery on October 6 and a cost of 1800.', share: true },
    { id: 'identity', name: 'private-register.txt', text: privateText, share: false }
  ],
  rules: ['Keep source disagreements separate.', 'Cite the supplied document IDs.'], protectedTerms: [privateText]
});
const completed = () => ({schema:'td613.loom.ai-task-result/v0.1',status:'completed',request_id:'req-1',
  answer:'Vendor A reports October 4; vendor B reports October 6. The records describe distinct vendors.',
  missing_information:[], used_document_ids:['vendor-a','vendor-b'], suggested_next_step:'Confirm the delivery requirement.'});
const context = () => ({request_id:'req-1',protectedTerms:[privateText],shared_document_ids:['vendor-a','vendor-b']});

for (const [name, mime, body] of [['brief.txt','text/plain','Useful task'], ['brief.md','text/markdown','# Notes'], ['rows.csv','text/csv','id,cost\n1,2'], ['data.json','application/json','{"cost":2}']]) {
  test(`local ${name} import preserves text and defaults to withheld`, async () => {
    const result = await readLoomDocument(new File([body],name,{type:mime}));
    assert.equal(result.text,body); assert.equal(result.share,false); assert.match(result.id,/^doc-/);
  });
}
test('unsupported and misleading file types fail before parsing', async () => {
  for (const file of [new File(['hello'],'file.pdf',{type:'application/pdf'}),new File(['hello'],'file.docx'),new File(['hello'],'file.txt',{type:'application/pdf'})]) {
    await assert.rejects(readLoomDocument(file),{code:'UNSUPPORTED_FILE'});
  }
});
test('binary, non-UTF8, invalid JSON, empty and oversized imports fail truthfully', async () => {
  await assert.rejects(readLoomDocument(new File(['a\0b'],'binary.txt')),{code:'INVALID_FILE'});
  await assert.rejects(readLoomDocument(new File([new Uint8Array([0xFF])],'invalid.txt')),{code:'UNSUPPORTED_ENCODING'});
  await assert.rejects(readLoomDocument(new File(['{oops}'],'invalid.json')),{code:'INVALID_JSON'});
  await assert.rejects(readLoomDocument(new File([''],'empty.txt')),{code:'FILE_SIZE'});
  await assert.rejects(readLoomDocument(new File(['x'.repeat(65537)],'big.txt')),{code:'FILE_SIZE'});
});
test('mixed sensitivity route preserves useful detailed supports and excludes local private content and policy', () => {
  const input=original(), before=structuredClone(input);
  const {request,localReceipt}=buildLoomAiRequest(input,'req-1');
  assert.deepEqual(request.documents,input.documents.slice(0,2).map(({share,...doc})=>doc));
  assert.equal(JSON.stringify(request).includes(privateText),false);
  assert.equal(Object.hasOwn(request,'protectedTerms'),false);
  assert.equal(JSON.stringify(request).includes('private-register.txt'),false);
  assert.deepEqual(localReceipt.withheld_document_ids,['identity']);
  assert.deepEqual(localReceipt.shared_document_ids,['vendor-a','vendor-b']);
  assert.equal(localReceipt.provider_called,false);
  assert.equal(localReceipt.request_bytes,new TextEncoder().encode(JSON.stringify(request)).byteLength);
  assert.deepEqual(input,before);
});
test('truthy strings or absent sharing flags never grant document egress', () => {
  const input=original(); input.documents[0].share='true'; delete input.documents[1].share;
  assert.deepEqual(buildLoomAiRequest(input,'req-1').request.documents,[]);
});
test('exact protected phrases block task, rule, selected text, name and identity paths', () => {
  const mutations=[
    x=>x.task+=privateText,
    x=>x.rules.push(privateText),
    x=>x.documents[0].text+=privateText,
    x=>x.documents[0].name=privateText+'.txt',
    x=>x.documents[0].id=privateText
  ];
  for(const mutate of mutations){const input=original();mutate(input);assert.throws(()=>buildLoomAiRequest(input,'req-1'),e=>e.code==='PROTECTED_EGRESS'&&e.locations.length>0&&!e.message.includes(privateText));}
  assert.throws(()=>buildLoomAiRequest(original(),privateText),{code:'PROTECTED_EGRESS'});
});
test('private terms containing newlines are inspected before transport encoding',()=>{
  const input=original();input.protectedTerms=['private\nphrase'];input.task+=' private\nphrase';
  assert.throws(()=>buildLoomAiRequest(input,'req-1'),{code:'PROTECTED_EGRESS'});
});
test('duplicate identities and incomplete document or policy arrays fail closed',()=>{
  const input=original();input.documents[1].id='vendor-a';assert.throws(()=>buildLoomAiRequest(input,'req-1'),{code:'DUPLICATE_DOCUMENT_ID'});
  input.documents=new Array(2);assert.throws(()=>buildLoomAiRequest(input,'req-1'),{code:'INVALID_INPUT'});
  const input2=original();input2.protectedTerms=[{}];assert.throws(()=>buildLoomAiRequest(input2,'req-1'),{code:'INVALID_INPUT'});
});
test('bounds include aggregate selected supports and UTF8 bytes',()=>{
  const input=original();input.task='x'.repeat(LOOM_AI_LIMITS.taskCharacters+1);
  assert.throws(()=>buildLoomAiRequest(input,'req-1'),{code:'INVALID_INPUT'});
  input.task='compare';input.documents[0].text='x'.repeat(40000);input.documents[1].text='y'.repeat(40000);
  assert.throws(()=>buildLoomAiRequest(input,'req-1'),{code:'REQUEST_SIZE'});
  input.documents[0].text='界'.repeat(30000);
  assert.throws(()=>buildLoomAiRequest(input,'req-1'),{code:'DOCUMENT_SIZE'});
});
test('returned useful answer passes presentation check with source claims explicitly unverified',()=>{
  const receipt=inspectLoomAiResponse(completed(),context());assert.equal(receipt.allowed,true);
  assert.equal(receipt.action,'PRESENT_FOR_REVIEW');assert.equal(receipt.used_document_ids_verified,false);assert.equal(receipt.release_authority,false);
});
test('provider-returned private terms are held in answer, metadata or source claims',()=>{
  for(const mutate of [r=>r.answer+=privateText,r=>r.observations={note:privateText},r=>r.used_document_ids.push(privateText),r=>r[privateText]='value']){
    const response=completed();mutate(response);const receipt=inspectLoomAiResponse(response,context());
    assert.equal(receipt.held,true);assert.ok(receipt.reasons.some(r=>r.code==='PROTECTED_RESPONSE'));
  }
});
test('unknown, duplicated or private support references stay held',()=>{
  for(const ids of [['identity'],['vendor-a','vendor-a']]){
    const response=completed();response.used_document_ids=ids;assert.equal(inspectLoomAiResponse(response,context()).held,true);
  }
});
test('wrong episode, malformed, oversized and cyclic output never passes',()=>{
  const bad=completed();bad.request_id='old-request';assert.equal(inspectLoomAiResponse(bad,context()).held,true);
  for(const response of [null,{},'raw model prose',{...completed(),used_document_ids:new Array(2)},{...completed(),answer:'x'.repeat(24001)}])assert.equal(inspectLoomAiResponse(response,context()).held,true);
  const cyclic=completed();cyclic.self=cyclic;assert.equal(inspectLoomAiResponse(cyclic,context()).held,true);
});
test('receipt can bind directly to exact builder output while originals remain local',()=>{
  const built=buildLoomAiRequest(original(),'req-1');
  assert.equal(inspectLoomAiResponse(completed(),{...built,protectedTerms:[privateText]}).allowed,true);
  assert.deepEqual(buildLoomAiRequest({...original(),rules:'Preserve disagreements.\nCite source IDs.'},'req-2').request.rules,['Preserve disagreements.','Cite source IDs.']);
});

test('malformed local policy and sparse missingness keep response held',()=>{
  assert.equal(inspectLoomAiResponse(completed(),null).held,true);
  assert.equal(inspectLoomAiResponse(completed(),{...context(),shared_document_ids:{bad:true}}).held,true);
  assert.equal(inspectLoomAiResponse({...completed(),missing_information:new Array(1)},context()).held,true);
});
