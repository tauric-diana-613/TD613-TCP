import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { inspectPortableLoomReceiverConformance, LOOM_DECLARED_RECEIPT_STATUS, LOOM_UNREGISTERED_SOURCE_MARKER } from '../app/engine/portable-loom-receiver-conformance.js';
import { portableLoomFooterText, PORTABLE_LOOM_RECEIVER_OUTPUT_GUIDANCE } from '../app/engine/portable-loom-output.js';

const fixture = JSON.parse(readFileSync(new URL('./fixtures/portable-loom-conformance-captures-20261010.json', import.meta.url)));
const hash = text => createHash('sha256').update(text).digest('hex');
function render(input, body = 'The receipt is unverified and unadmitted.', status = LOOM_DECLARED_RECEIPT_STATUS) {
  input.answer = body + '\n\n```json\n' + JSON.stringify(input.receipt, null, 2) + '\n```\n\n' + portableLoomFooterText({ receiptStatus: status });
  return input;
}
function valid() {
  const expected = { session_root_ref: 'a'.repeat(64), policy_commitment: 'b'.repeat(64), anchor_work_unit_ref: null, operator_task: 'Summarize the selected source.' };
  const receipt = { schema: 'td613.loom.portable-session-receiver-turn/v0.1', ...expected, turn_index: 1,
    used_document_ids: ['source_a'], missing_information: [], receiver_declaration: 'Selected source summarized; declaration only.' };
  return render({
    receipt, expected, review_body_required: true,
    source_context: { registered_document_ids: ['source_a'], observed_used_document_ids: ['source_a'], unidentified_source_count: 0 } });
}
function inspectCaptured(example) {
  return inspectPortableLoomReceiverConformance({ answer: example.answer, receipt: example.receipt, expected: example.expected,
    source_context: example.source_context, receipt_required: example.receipt_required,
    presentation_format: example.presentation_format });
}
for (const example of fixture.cases) {
  test(`preserved ${example.run_id.split('-').at(-1)} ${example.trial.trial_id} turn ${example.trial.turn_index} retains its receipt evidence and exact bytes`, () => {
    const before = JSON.stringify(example), report = inspectCaptured(example);
    assert.equal(hash(example.answer), example.answer_sha256);
    assert.equal(report.findings.includes('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED'), example.expected_qualification_failure);
    if (example.receipt) { assert.equal(report.checks.receipt_shape, true); assert.equal(report.status, 'HOLD'); }
    assert.equal(report.local_ledger_advanced, false); assert.equal(report.admission_authority, false);
    assert.equal(report.provider_requests, 0); assert.equal(JSON.stringify(example), before);
  });
}
test('all five historical qualifier omissions are detected; no capture is repaired in place', () => {
  const failed = fixture.cases.filter(c => inspectCaptured(c).findings.includes('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED'));
  assert.equal(failed.length, 5);
  assert.deepEqual(failed.map(c => [c.run_id.split('-').at(-1), c.trial.case_id, c.trial.turn_index]),
    [['a13','R03',0], ['a15','R02',0], ['a15','R02',1], ['a18','R06',1], ['a18','R06',2]]);
});
test('historical unnamed R06 source cannot silently become no source use', () => {
  const c = fixture.cases.find(c => c.source_context !== null), report = inspectCaptured(c);
  assert.ok(report.findings.includes('SOURCE_IDENTIFIER_UNREGISTERED'));
  assert.ok(report.findings.includes('UNREGISTERED_SOURCE_MISSING_INFORMATION_OMITTED'));
  assert.equal(report.unresolved_source_marker_present, false);
});
test('qualified receipt with matching registered source accounting remains declaration only', () => {
  const report = inspectPortableLoomReceiverConformance(valid());
  assert.equal(report.status, 'QUALIFIED_DECLARATION'); assert.equal(report.findings.length, 0);
  assert.equal(report.receipt_signatures_verified, false); assert.equal(report.receiver_enforcement_observed, false);
  assert.equal(report.admission_authority, false); assert.ok(Object.isFrozen(report.findings));
});
test('explicit pending-revalidation and independently-unverified qualifiers retain their historical meaning', () => {
  for (const status of ['DECLARED_PENDING_REVALIDATION', 'NOT INDEPENDENTLY VERIFIED']) {
    const input = render(valid(), 'Unverified receipt.', status);
    assert.equal(inspectPortableLoomReceiverConformance(input).status, 'QUALIFIED_DECLARATION');
  }
});
test('inline declared status text qualifies the receipt without erasing its words', () => {
  const input = render(valid(), 'The accompanying receipt status is explicitly `DECLARED_UNVERIFIED_UNADMITTED` and serves as a receiver declaration pending Loom revalidation, not proof of enforcement or custody admission.');
  assert.equal(inspectPortableLoomReceiverConformance(input).status, 'QUALIFIED_DECLARATION');
});
test('a later contradictory receipt claim defeats an earlier qualifier', () => {
  const contradictory = render(valid(), 'The receipt is unverified and unadmitted. The receipt is independently verified and admitted.');
  assert.ok(inspectPortableLoomReceiverConformance(contradictory).findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
  const anaphoricContradiction = render(valid(), 'The receipt is unverified and unadmitted. It has been independently verified and admitted.');
  assert.ok(inspectPortableLoomReceiverConformance(anaphoricContradiction).findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
  const demonstrativeContradiction = render(valid(), 'The receipt is unverified and unadmitted. This is independently verified and admitted.');
  assert.ok(inspectPortableLoomReceiverConformance(demonstrativeContradiction).findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
  const coordinatedContradiction = render(valid(), 'The receipt has not been independently verified or admitted, but it has been authenticated.');
  assert.ok(inspectPortableLoomReceiverConformance(coordinatedContradiction).findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
  const naturalNegative = render(valid(), 'The receipt has not been independently verified or admitted.');
  assert.equal(inspectPortableLoomReceiverConformance(naturalNegative).checks.review_body_qualified, true);
});
test('explicitly observed no-source task accepts empty arrays', () => {
  const input = valid(); input.receipt.used_document_ids = [];
  input.source_context = { registered_document_ids: [], observed_used_document_ids: [], unidentified_source_count: 0 };
  render(input);
  assert.equal(inspectPortableLoomReceiverConformance(input).status, 'QUALIFIED_DECLARATION');
});
test('unknown source accounting is held even when the receipt looks complete', () => {
  const input = valid(); input.source_context = null;
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('ORIGIN_SOURCE_ACCOUNTING_UNOBSERVED'));
});
test('recording a missing identifier preserves the HOLD and does not invent an ID', () => {
  const input = valid(); input.receipt.used_document_ids = []; input.receipt.missing_information = [LOOM_UNREGISTERED_SOURCE_MARKER];
  input.source_context = { registered_document_ids: [], observed_used_document_ids: [], unidentified_source_count: 1 };
  render(input);
  const report = inspectPortableLoomReceiverConformance(input);
  assert.equal(report.status, 'HOLD'); assert.equal(report.unresolved_source_marker_present, true);
  assert.equal(report.findings.includes('UNREGISTERED_SOURCE_MISSING_INFORMATION_OMITTED'), false);
});
test('an inline alias and a registered-but-omitted used source both hold', () => {
  const input = valid(); input.receipt.used_document_ids = ['Document A'];
  render(input);
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_SOURCE_NOT_REGISTERED'));
  input.receipt.used_document_ids = [];
  render(input);
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_OBSERVED_SOURCE_MISMATCH'));
});
test('verified or admitted footer claims cannot qualify a receiver declaration', () => {
  for (const status of ['DECLARED','AVAILABLE','VERIFIED','ADMITTED','VERIFIED UNADMITTED']) {
    const input = render(valid(), 'Unverified receipt.', status);
    assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED'), status);
  }
});
test('qualification in prose cannot replace the footer, and the review body must qualify when requested', () => {
  const input = valid(); input.answer = 'The receipt is unverified and unadmitted.';
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED'));
  input.answer = 'Summary completed.\n\n' + portableLoomFooterText({ receiptStatus: LOOM_DECLARED_RECEIPT_STATUS });
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
});
test('wrong task/root and malformed or extended receipt schemas hold', () => {
  const input = valid(); input.receipt.operator_task = 'A different task.';
  render(input);
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_ORIGIN_REFERENCE_MISMATCH'));
  for (const alter of [r => { r.extra = true; }, r => { r.missing_information = null; }, r => { r.used_document_ids = ['source_a','source_a']; }, r => { r.turn_index = 0; }]) {
    const changed = valid(); alter(changed.receipt);
    render(changed);
    assert.ok(inspectPortableLoomReceiverConformance(changed).findings.includes('RECEIPT_SHAPE_INVALID'));
  }
});
test('unknown origin task stays unknown instead of matching receiver self-report', () => {
  const input = valid(); input.expected.operator_task = null;
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('ORIGIN_TASK_BINDING_UNOBSERVED'));
});
test('accessors, sparse arrays and cyclic input are rejected before executing user code', () => {
  let reads = 0; const malicious = { get answer() { reads++; return 'unverified'; } };
  assert.throws(() => inspectPortableLoomReceiverConformance(malicious), /accessors/); assert.equal(reads, 0);
  const sparse = valid(); sparse.receipt.used_document_ids = Array(1);
  assert.throws(() => inspectPortableLoomReceiverConformance(sparse), /dense arrays/);
  const cycle = valid(); cycle.loop = cycle; assert.throws(() => inspectPortableLoomReceiverConformance(cycle), /lossless JSON/);
});
test('prospective source guidance supplies explicit qualification and unresolved-ID instructions', () => {
  assert.ok(PORTABLE_LOOM_RECEIVER_OUTPUT_GUIDANCE.includes(LOOM_DECLARED_RECEIPT_STATUS));
  assert.ok(PORTABLE_LOOM_RECEIVER_OUTPUT_GUIDANCE.includes(LOOM_UNREGISTERED_SOURCE_MARKER));
});
test('a receipt line without the sealed Gate command is not a qualified footer', () => {
  const input = valid(); input.answer = input.answer.replace('米 Check Loom Gate ⟐', '');
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED'));
});
test('offline CLI produces a held raw-capture review and protects existing output bytes', () => {
  const directory = mkdtempSync(join(tmpdir(), 'loom-conformance-'));
  try {
    const output = join(directory, 'review.json');
    const command = new URL('../scripts/check-portable-loom-receiver-conformance.mjs', import.meta.url).pathname;
    const input = new URL('./fixtures/portable-loom-conformance-captures-20261010.json', import.meta.url).pathname;
    const first = spawnSync(process.execPath, [command, input, output], { encoding: 'utf8' });
    assert.equal(first.status, 1); const bytes = readFileSync(output), report = JSON.parse(bytes);
    assert.equal(report.cases.length, 16); assert.equal(report.held_cases, 8); assert.equal(report.provider_requests, 0);
    assert.equal(spawnSync(process.execPath, [command, input, output], { encoding: 'utf8' }).status, 1);
    assert.deepEqual(readFileSync(output), bytes);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('offline CLI accepts an origin-bound declaration and rejects changed capture hash', () => {
  const directory = mkdtempSync(join(tmpdir(), 'loom-conformance-'));
  try {
    const input = join(directory, 'input.json'), command = new URL('../scripts/check-portable-loom-receiver-conformance.mjs', import.meta.url).pathname;
    const record = { id: 'synthetic_registered_control', ...valid() };
    writeFileSync(input, JSON.stringify({ cases: [record] }));
    const passed = spawnSync(process.execPath, [command, input], { encoding: 'utf8' });
    assert.equal(passed.status, 0); assert.equal(JSON.parse(passed.stdout).cases[0].inspection.status, 'QUALIFIED_DECLARATION');
    record.answer_sha256 = '0'.repeat(64); writeFileSync(input, JSON.stringify({ cases: [record] }));
    assert.equal(spawnSync(process.execPath, [command, input], { encoding: 'utf8' }).status, 1);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test('a detached receipt cannot substitute for a missing captured receipt', () => {
  const input = valid(); input.answer = 'The receipt is unverified.\n\n' + portableLoomFooterText({ receiptStatus: LOOM_DECLARED_RECEIPT_STATUS });
  const report = inspectPortableLoomReceiverConformance(input);
  assert.equal(report.status, 'HOLD'); assert.ok(report.findings.includes('CAPTURED_RECEIPT_MISSING'));
});
test('a clean sidecar cannot conceal a conflicting receipt in the answer', () => {
  const input = valid(); input.answer = input.answer.replace('"source_a"', '"forged_source"');
  const report = inspectPortableLoomReceiverConformance(input);
  assert.ok(report.findings.includes('SIDECAR_RECEIPT_DIFFERS_FROM_CAPTURE'));
  assert.ok(report.findings.includes('RECEIPT_SOURCE_NOT_REGISTERED'));
});
test('a captured receipt can be inspected directly without a sidecar', () => {
  const input = valid(); delete input.receipt;
  const report = inspectPortableLoomReceiverConformance(input);
  assert.equal(report.status, 'QUALIFIED_DECLARATION'); assert.equal(report.checks.receipt_bound_to_answer, true);
  assert.equal(report.checks.sidecar_matches_captured_receipt, null);
});
test('multiple captured receipts and duplicate JSON keys stay ambiguous', () => {
  const input = valid(); input.answer = '```json\n' + JSON.stringify(input.receipt) + '\n```\n\n' + input.answer;
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('CAPTURED_RECEIPT_AMBIGUOUS'));
  const duplicate = valid(); duplicate.answer = duplicate.answer.replace('"used_document_ids": [', '"used_document_ids": ["forged_source"], "used_document_ids": [');
  assert.ok(inspectPortableLoomReceiverConformance(duplicate).findings.includes('CAPTURED_RECEIPT_MALFORMED'));
});
test('strict JSON binds its outer receipt and inner presentation from the same raw answer', () => {
  const input = valid(); input.presentation_format = 'STRICT_JSON_TASK_RESULT';
  input.answer = JSON.stringify({ answer: 'The receipt is unverified.\n\n' + portableLoomFooterText({ receiptStatus: LOOM_DECLARED_RECEIPT_STATUS }), loom_session_receipt: input.receipt });
  assert.equal(inspectPortableLoomReceiverConformance(input).status, 'QUALIFIED_DECLARATION');
  input.answer = input.answer.replace('"source_a"', '"forged_source"');
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('SIDECAR_RECEIPT_DIFFERS_FROM_CAPTURE'));
});
test('default inspection checks body qualification; an explicit partial inspection stays partial', () => {
  const input = render(valid(), 'Task complete.'); delete input.review_body_required;
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
  input.review_body_required = false;
  const report = inspectPortableLoomReceiverConformance(input);
  assert.equal(report.status, 'PARTIAL_DECLARATION_INSPECTION'); assert.equal(report.checks.review_body_qualified, null);
});
test('unrelated or contradictory body qualifiers cannot certify receipt qualification', () => {
  const input = render(valid(), 'The receipt is verified. An unverified source was excluded.');
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
});
test('trailing whitespace cannot move the footer qualifier into the body check', () => {
  const input = render(valid(), 'Task complete.'); input.answer += ' '.repeat(2000);
  const report = inspectPortableLoomReceiverConformance(input);
  assert.equal(report.checks.footer_receipt_qualified, true);
  assert.ok(report.findings.includes('RECEIPT_REVIEW_BODY_QUALIFICATION_MISSING'));
});
test('conflicting footer receipt labels cannot select a clean first label', () => {
  const input = valid(); input.answer = input.answer.replace(' · HOLD:', ' · Receipt: VERIFIED · HOLD:');
  assert.ok(inspectPortableLoomReceiverConformance(input).findings.includes('RECEIPT_FOOTER_QUALIFICATION_MISSING_OR_OVERCLAIMED'));
});
test('the CLI defaults to requiring a receipt when the response omits it', () => {
  const directory = mkdtempSync(join(tmpdir(), 'loom-conformance-'));
  try {
    const input = join(directory, 'input.json'), command = new URL('../scripts/check-portable-loom-receiver-conformance.mjs', import.meta.url).pathname;
    const record = valid(); record.receipt = null; record.answer = 'Task complete.';
    writeFileSync(input, JSON.stringify({ cases: [record] }));
    const result = spawnSync(process.execPath, [command, input], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.ok(JSON.parse(result.stdout).cases[0].inspection.findings.includes('CAPTURED_RECEIPT_MISSING'));
    record.receipt_required = false;
    writeFileSync(input, JSON.stringify({ cases: [record] }));
    assert.equal(spawnSync(process.execPath, [command, input], { encoding: 'utf8' }).status, 0);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
