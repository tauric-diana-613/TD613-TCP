// Exact fictional sources, captured live failures and synthetic native transport.
// These tests make no claim about a new paid provider run.
import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';
import { reviewLoomEvidence, vendorDiligenceEvidence } from '../app/dome-world/holonomy-loom/ai-evidence-review.js';
import { projectLoomEvidenceReview } from '../app/dome-world/holonomy-loom/ai-evidence-diagnostic.js';
import { buildLoomMarrowlineMessage, createLoomMarrowlineTaskHandler } from '../server/loom-marrowline-task.js';

const project = LOOM_AI_PROJECTS.find(p => p.id === 'vendor-diligence');
const documents = project.documents.filter(d => d.share).map(({ id, name, text }) => ({ id, name, text }));
const cases = [
  ['captured pilot conditions', 'PILOT_CONDITIONS_ASSERTED_WITHOUT_WITNESS', 'Pilot P2 yields an observed throughput of approximately $0.346\\text{ GB/minute}$ (or $20.77\\text{ GB/hour}$) under un-congested, non-concurrent single-stream conditions.'],
  ['captured deletion assertion', 'DELETION_VIOLATION_ASSERTED_WITHOUT_WITNESS', 'This violates the buyer\'s 14-day deletion limit unless a specific contractual exception or custom backup purging schedule is executed.'],
  ['marked pilot condition', 'PILOT_CONDITIONS_ASSERTED_WITHOUT_WITNESS', 'P2 was run under s̶i̶n̶g̶l̶e̶-stream conditions.'],
  ['format-mark pilot condition', 'PILOT_CONDITIONS_ASSERTED_WITHOUT_WITNESS', 'P2 was run under non-con\u200dcurrent conditions.'],
  ['caveat followed by pilot assertion', 'PILOT_CONDITIONS_ASSERTED_WITHOUT_WITNESS', 'It is unknown whether archives scale, but pilot P2 ran single-stream.'],
  ['caveat followed by violation', 'DELETION_VIOLATION_ASSERTED_WITHOUT_WITNESS', 'Deletion is unobserved, but the supplier violates the 14-day deletion requirement.'],
  ['contract permission followed by violation', 'DELETION_VIOLATION_ASSERTED_WITHOUT_WITNESS', 'The contract permits 45 days, but actual deletion violates the 14-day limit.'],
  ['hypothetical conditions', null, 'If pilot P2 were single-stream, its rate still would not establish production capacity.'],
  ['explicit projection assumption', null, 'For a projection from pilot P2, assume single-stream execution; this is not an observed pilot condition.'],
  ['unknown pilot conditions', null, 'It is unknown whether P2 ran single-stream.'],
  ['negated observation', null, 'The P2 record does not establish single-stream conditions.'],
  ['source-backed pilot facts', null, 'P2 imported 9 GB in 26 minutes with two retries (comparison); its calculated average is approximately 20.77 GB/hour.'],
  ['source-backed omission', null, 'Neither pilot tested concurrent production-sized imports (comparison).'],
  ['contractual conflict', null, 'The 45-day backup permission conflicts with the requested 14-day removal term (offer); deletion was not verified (comparison).'],
  ['contract terms assessment', null, 'The written offer fails to meet the 14-day deletion requirement; actual deletion is unobserved.'],
  ['conditional violation', null, 'If actual deletion takes longer than 14 days, it would violate the deletion requirement.'],
  ['negated violation', null, 'These sources do not prove that Vendor-A violates the 14-day deletion requirement.'],
  ['no observed violation', null, 'No deletion violation has been observed.'],
  ['unverified violation', null, 'A deletion violation remains unobserved.'],
  ['negated verified violation', null, 'A deletion violation has not been verified.'],
  ['contractual violation assessment', null, 'This is a contractual deletion violation; actual deletion remains unobserved.'],
  ['contract permission without outcome witness', 'DELETION_VIOLATION_ASSERTED_WITHOUT_WITNESS', 'The contract permits 45 days and this violates the 14-day deletion limit.'],
  ['explicit rejected quotation', null, 'The supplier falsely claims "P2 ran single-stream".'],
  ['conditional rate projection', null, 'At an unchanged P2 average, 4,320 GB of active content would take approximately 208 hours; this is a conditional projection, not a benchmark.']
];
for (const [name, code, answer] of cases) test(`vendor grounding: ${name}`, () => {
  const before = JSON.stringify({ answer, documents });
  const review = reviewLoomEvidence({ answer }, documents);
  assert.equal(review.blocks_reuse, Boolean(code));
  if (code) {
    assert.ok(review.conflicts.some(c => c.code === code));
    assert.ok(projectLoomEvidenceReview(review).conflicts.some(c => c.code === code));
  }
  assert.equal(JSON.stringify({ answer, documents }), before, 'inspection never rewrites custody/source bytes');
});

test('the evidence guide traces excerpts and arithmetic to selected source bytes', () => {
  const guide = vendorDiligenceEvidence(documents);
  for (const fact of guide.reported_facts) assert.ok(documents.find(d => d.id === fact.source_id).text.includes(fact.excerpt));
  const values = guide.calculations.map(c => c.value);
  assert.deepEqual(values, [9 * 60 / 26, 4320, 10080, 4320 / (9 * 60 / 26)]);
  assert.match(guide.calculations[0].scope, /no stream count, concurrency or congestion/);
  assert.match(guide.calculations[3].scope, /Conditional linear projection/);
  assert.match(guide.decision_support[0].finding, /contractual gap, not a measured deletion violation/);
  assert.ok(guide.missing_evidence.includes('P2 stream count, concurrency and congestion conditions'));
  for (const term of project.protectedTerms) assert.ok(!JSON.stringify(guide).includes(term));
});

test('guide and vendor patterns require the complete exact selected fixture', () => {
  for (const changed of [documents.slice(0, 2), documents.map(d => ({ ...d, text: d.text + ' changed' })), [...documents, documents[0]]]) {
    assert.equal(vendorDiligenceEvidence(changed), null);
    assert.equal(reviewLoomEvidence({ answer: cases[0][2] }, changed).blocks_reuse, false);
  }
});

test('the native request receives the grounding guide once without extra calls or reply extraction', async () => {
  const input = { schema: 'td613.loom.ai-task/v0.1', request_id: 'grounded_native', task: project.task, documents, rules: project.rules };
  const message = buildLoomMarrowlineMessage(input);
  assert.match(message, /Selected-source analysis guide/);
  for (const d of documents) assert.ok(message.includes(JSON.stringify(d)));
  for (const term of project.protectedTerms) assert.ok(!message.includes(term));
  const answer = cases[11][2] + '\n' + cases[13][2];
  const native = { ok: true, text: answer, relay: { transcript: answer }, receipt: { provider: { completion: { complete: true } } } };
  let calls = 0;
  const response = { statusCode: 200, setHeader() {}, end(raw) { this.body = JSON.parse(String(raw)); } };
  await createLoomMarrowlineTaskHandler({ nativeHandler: async (req, res) => {
    calls++; assert.equal(req.body.message, message); res.end(JSON.stringify(native));
  } })({ body: input }, response);
  assert.equal(calls, 1);
  assert.equal(response.body.answer, answer);
  assert.deepEqual(response.body.native_reply, native);
  assert.deepEqual(response.body.used_document_ids, []);
  assert.deepEqual(response.body.missing_information, []);
  assert.equal(reviewLoomEvidence(response.body, documents).blocks_reuse, false);
});
