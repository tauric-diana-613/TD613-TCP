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
