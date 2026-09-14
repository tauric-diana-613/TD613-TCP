import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { assessLoomProjectAnswer } from '../app/dome-world/holonomy-loom/ai-project-checks.js';
const dir=new URL('../docs/research/receipts/2026-09-10-loom-live-receiver/',import.meta.url);

test('independent useful receiver answer matches recomputed stated-fee totals',()=>{
  const response=JSON.parse(fs.readFileSync(new URL('receiver-answer.json',dir),'utf8'));
  const result=assessLoomProjectAnswer('vendor-diligence',response);
  assert.deepEqual(result.expected,{vendor_a_12_month_credits:137591.52,vendor_b_12_month_credits:145808.64});
  assert.equal(result.status,'matched');assert.equal(result.blocks_output,false);assert.equal(result.release_authority,false);
});
test('actual hosted relay failure stays visible with both wrong totals',()=>{
  const answer=fs.readFileSync(new URL('hosted-marrowline-answer.txt',dir),'utf8');
  const result=assessLoomProjectAnswer('vendor-diligence',{answer});
  assert.equal(result.status,'needs_review');assert.equal(result.reported.vendor_a.value,23280);assert.equal(result.reported.vendor_b.value,24768);
  assert.ok(result.checks.every(check=>check.status==='mismatch'));assert.equal(result.blocks_output,false);
});
test('bare numeric presence cannot masquerade as a correctly attributed total',()=>{
  const result=assessLoomProjectAnswer('vendor-diligence',{answer:'Candidate amounts include 137,591.52 and 145,808.64. The vendor association remains unclear.'});
  assert.equal(result.status,'needs_review');assert.ok(result.checks.every(check=>check.expected_numeric_presence));
  assert.ok(result.checks.every(check=>check.reported===null));
});
test('incompatible totals within one answer remain ambiguous',()=>{
  const result=assessLoomProjectAnswer('vendor-diligence',{answer:'Vendor-A annual cost: 137,591.52 credits. Vendor-B annual cost: 145,808.64 credits. Vendor-A annual cost: 23,280 credits.'});
  assert.equal(result.status,'needs_review');assert.equal(result.reported.vendor_a.value,null);assert.deepEqual(result.reported.vendor_a.candidates,[137591.52,23280]);
});
test('unrelated tasks and malformed output acquire no universal quality approval',()=>{
  assert.equal(assessLoomProjectAnswer('participant-research',{answer:'Correct.'}).applicable,false);
  assert.equal(assessLoomProjectAnswer('vendor-diligence',{}).status,'needs_review');
});

test('observed deployed Gemini Markdown totals retain explicit vendor attribution',()=>{
  const observation=JSON.parse(fs.readFileSync(new URL('hosted-loom-ai-observation.json',dir),'utf8'));
  const result=assessLoomProjectAnswer('vendor-diligence',{answer:observation.analysis_paragraphs.join('\n\n')});
  assert.equal(result.status,'matched');assert.equal(result.reported.vendor_a.value,137591.52);assert.equal(result.reported.vendor_b.value,145808.64);
  assert.equal(result.blocks_output,false);assert.equal(result.release_authority,false);
});
test('cost-comparison vendor rows count as explicit attribution without weakening bare-number safeguards',()=>{
  const answer='### 12-month stated-fee comparison\n\n| Supplier | 12-month fees |\n| --- | ---: |\n| Vendor A | **137,591.52 credits** |\n| Vendor B | **145,808.64 credits** |';
  const result=assessLoomProjectAnswer('vendor-diligence',{answer});
  assert.equal(result.status,'matched');
  assert.equal(result.reported.vendor_a.value,137591.52);
  assert.equal(result.reported.vendor_b.value,145808.64);
  assert.ok(result.checks.every(check=>check.status==='matched'));
});
test('Markdown totals preserve mismatched, ambiguous and malformed amounts',()=>{
  const a='* **Total Vendor-A Cost**: 137,591.52 credits.';
  const b='* **Total Vendor-B Cost**: 145,808.64 credits.';
  const swapped=assessLoomProjectAnswer('vendor-diligence',{answer:'**Total Vendor-A Cost**: 145,808.64 credits.\n**Total Vendor-B Cost**: 137,591.52 credits.'});
  assert.equal(swapped.status,'needs_review');assert.ok(swapped.checks.every(check=>check.status==='mismatch'));
  const ambiguous=assessLoomProjectAnswer('vendor-diligence',{answer:`${a}\n${b}\n**Total Vendor-A Cost**: 23,280 credits.`});
  assert.equal(ambiguous.reported.vendor_a.extraction,'ambiguous');assert.equal(ambiguous.reported.vendor_a.value,null);
  for(const label of ['**Total Vendor-A Cost**: -137,591.52 credits.','**Total Vendor-A Cost**: 137,591,.52 credits.','Incorrect **Total Vendor-A Cost**: 137,591.52 credits.','**Total Vendor-A Cost**: 137,591.52 credits is a rejected estimate.']){
    const result=assessLoomProjectAnswer('vendor-diligence',{answer:label+'\n'+b});assert.equal(result.status,'needs_review');assert.equal(result.reported.vendor_a.value,null);
  }
});


import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';
import { incidentEvidence, reviewLoomEvidence } from '../app/dome-world/holonomy-loom/ai-evidence-review.js';
const incidentDocuments = LOOM_AI_PROJECTS.find(p => p.id === 'incident-response').documents.filter(d => d.share).map(({id,name,text})=>({id,name,text}));

test('incident orientation binds all selected source bytes, never names alone',()=>{
  assert.ok(incidentEvidence(incidentDocuments));
  assert.ok(incidentEvidence([...incidentDocuments].reverse()));
  assert.equal(incidentEvidence(incidentDocuments.map(d=>({...d,text:d.text+' changed'}))),null);
  assert.equal(incidentEvidence(incidentDocuments.slice(0,2)),null);
  assert.equal(incidentEvidence([...incidentDocuments,{id:'extra',name:'new.txt',text:'new evidence'}]),null);
  assert.equal(incidentEvidence([incidentDocuments[0],incidentDocuments[0],incidentDocuments[2]]),null);
});
test('actual skeptical follow-up and affirmative paraphrases cannot promote missing effects',()=>{
  for(const answer of [
    'We conclude a fast retry (2s) triggered duplicate writes during a timeout, bypassing expected idempotency. It remains uncertain if customers are affected.',
    'The retry caused duplicate downstream work.', // explicit downstream adjective is handled below
    'Duplicated writes occurred.',
    'The logs confirmed double execution.'
  ]){
    assert.equal(reviewLoomEvidence({answer},incidentDocuments).blocks_reuse,true,answer);
  }
});
test('uncertainty and hypotheses remain available; a clean pattern check earns no truth certificate',()=>{
  for(const answer of [
    'We cannot conclude duplicate writes occurred.',
    'If duplicate writes occurred, compare the effect ledger.',
    'Hypothesis: the retry caused duplicate writes.',
    'The two completion records do not establish whether work ran twice.',
    'The actual effect remains unknown.'
  ]){
    const review=reviewLoomEvidence({answer},incidentDocuments);
    assert.equal(review.blocks_reuse,false,answer);
    assert.equal(review.semantic_correctness_verified,false);
  }
});
test('privacy overpromises are flagged in answer and next action without inventing a general proof',()=>{
  assert.equal(reviewLoomEvidence({answer:'Carry this task while maintaining complete privacy.'}).blocks_reuse,true);
  assert.equal(reviewLoomEvidence({answer:'Answer.',suggested_next_step:'This guarantees your anonymity.'}).blocks_reuse,true);
  assert.equal(reviewLoomEvidence({answer:'This does not guarantee complete privacy.'}).blocks_reuse,false);
});
