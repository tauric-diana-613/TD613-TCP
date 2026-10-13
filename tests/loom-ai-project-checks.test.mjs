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
test('subscription subtotals cannot masquerade as twelve-month totals',()=>{
  const answer='Vendor-A annual subscription cost: 109,440.00 credits. Vendor-B annual subscription cost: 126,720.00 credits.';
  const result=assessLoomProjectAnswer('vendor-diligence',{answer});
  assert.equal(result.status,'needs_review');
  assert.equal(result.reported.vendor_a.value,null);
  assert.equal(result.reported.vendor_b.value,null);
  assert.ok(result.checks.every(check=>check.status==='not_found'));
});
test('explicit totals remain extractable when subscription components appear first',()=>{
  const answer='Vendor-A annual subscription cost: 109,440.00 credits. Vendor-A total cost: 137,591.52 credits. Vendor-B annual subscription cost: 126,720.00 credits. Vendor-B total cost: 145,808.64 credits.';
  const result=assessLoomProjectAnswer('vendor-diligence',{answer});
  assert.equal(result.status,'matched');
  assert.equal(result.reported.vendor_a.value,137591.52);
  assert.equal(result.reported.vendor_b.value,145808.64);
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
import { incidentEvidence, vendorDiligenceEvidence, reviewLoomEvidence } from '../app/dome-world/holonomy-loom/ai-evidence-review.js';
const incidentDocuments = LOOM_AI_PROJECTS.find(p => p.id === 'incident-response').documents.filter(d => d.share).map(({id,name,text})=>({id,name,text}));
const vendorDocuments = LOOM_AI_PROJECTS.find(p => p.id === 'vendor-diligence').documents.filter(d => d.share).map(({id,name,text})=>({id,name,text}));

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
test('vendor diligence exact-source review holds finite-pilot impossibility and retention certainty',()=>{
  assert.ok(vendorDiligenceEvidence(vendorDocuments));
  for(const answer of [
    'The full migration is mathematically impossible in one day under these limits.',
    'At this throughput the one-day migration is physically impossible.',
    'Vendor-A backup content will persist for up to 45 days.'
  ]){
    const review=reviewLoomEvidence({answer},vendorDocuments);
    assert.equal(review.blocks_reuse,true,answer);
    assert.equal(review.semantic_correctness_verified,false);
  }
});
test('vendor diligence conditional projections and modal retention language remain reusable',()=>{
  for(const answer of [
    'At the observed P2 pilot rate, the required wave would miss the eight-hour target; representative concurrent tests are still needed to establish a throughput bound.',
    'The packet does not establish that a one-day migration is impossible.',
    'Vendor-A permits backup retention for up to 45 days; actual configured or observed retention is not established.'
  ]){
    const review=reviewLoomEvidence({answer},vendorDocuments);
    assert.equal(review.blocks_reuse,false,answer);
  }
});
test('vendor claim patterns do not activate on altered or incomplete source bytes',()=>{
  const altered=vendorDocuments.map((d,index)=>index?d:{...d,text:d.text+' altered'});
  assert.equal(vendorDiligenceEvidence(altered),null);
  assert.equal(reviewLoomEvidence({answer:'The full migration is mathematically impossible in one day.'},altered).blocks_reuse,false);
});

test('privacy overpromises are flagged in answer and next action without inventing a general proof',()=>{
  assert.equal(reviewLoomEvidence({answer:'Carry this task while maintaining complete privacy.'}).blocks_reuse,true);
  assert.equal(reviewLoomEvidence({answer:'Answer.',suggested_next_step:'This guarantees your anonymity.'}).blocks_reuse,true);
  assert.equal(reviewLoomEvidence({answer:'This does not guarantee complete privacy.'}).blocks_reuse,false);
});

test('regression: RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION fails on certainty and passes on modal precision', () => {
  assert.ok(vendorDiligenceEvidence(vendorDocuments));

  // FAIL CASE 1: Exact R2 failure payload where permitted ceiling was promoted to guaranteed persistence and intermediate duration
  const failingAnswer = "Deleted records disappear within 24 hours, but that data will persist in Vendor-A's backup systems for up to 31 days before final erasure.";
  const failReview = reviewLoomEvidence({ answer: failingAnswer }, vendorDocuments);
  assert.equal(failReview.blocks_reuse, true, 'Must block reuse when retention permission is asserted as future persistence');
  assert.ok(
    failReview.conflicts.some(c => c.code === 'RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION'),
    'Must identify RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION'
  );

  // FAIL CASE 2: Exact R3 failure payload where backup retention permitted for up to 45 days was promoted to affirmative persistence
  const r3FailingAnswer = "While Vendor-A purges active records within 24 hours, synthetic or migrated client test records will persist inside immutable or secondary system backups for up to 45 days. This leaves a 31-day compliance gap beyond the buyer's 14-day limit.";
  const r3FailReview = reviewLoomEvidence({ answer: r3FailingAnswer }, vendorDocuments);
  assert.equal(r3FailReview.blocks_reuse, true, 'Must block reuse when retention ceiling is stated as will persist in backups');
  assert.ok(
    r3FailReview.conflicts.some(c => c.code === 'RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION'),
    'Must identify RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION on R3 answer'
  );

  // PASS CASE: General evidence invariant preserved - source modality and exact bounded quantities maintained
  const passingAnswer = "Deleted records disappear from the active application within 24 hours; Vendor-A's backup footnote permits retention for up to 45 days, but this clause reflects a contractual permission ceiling rather than an observed, configured, or guaranteed duration, and the documents establish no intermediate duration such as 31 days.";
  const passReview = reviewLoomEvidence({ answer: passingAnswer }, vendorDocuments);
  assert.equal(passReview.blocks_reuse, false, 'Must permit reuse when modal qualifiers and source boundaries are preserved');
  assert.equal(passReview.conflicts.length, 0);
});

