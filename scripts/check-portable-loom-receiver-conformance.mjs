import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inspectPortableLoomReceiverConformance } from '../app/engine/portable-loom-receiver-conformance.js';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath) throw new Error('Supply a JSON review input file; optional output path must be new.');
const bytes = await readFile(inputPath), input = JSON.parse(bytes);
if (!Array.isArray(input.cases) || input.cases.length < 1 || input.cases.length > 1000) throw new TypeError('Review input requires 1–1000 explicit cases.');
const cases = input.cases.map((record, index) => {
  const answerBytes = Buffer.from(record.answer, 'utf8');
  const answerHash = createHash('sha256').update(answerBytes).digest('hex');
  if (record.answer_sha256 && record.answer_sha256 !== answerHash) throw new Error(`Case ${index} answer byte hash differs.`);
  const answer = record.presentation_format === 'STRICT_JSON_TASK_RESULT' ? JSON.parse(record.answer).answer : record.answer;
  return { id: record.id ?? `${record.run_id}:${record.trial?.trial_id}:${record.trial?.turn_index}`, answer_sha256: answerHash,
    inspection: inspectPortableLoomReceiverConformance({ answer, receipt: record.receipt, expected: record.expected,
      source_context: record.source_context, receipt_required: record.receipt_required ?? record.receipt !== null,
      review_body_required: record.review_body_required ?? false }) };
});
const report = { schema: 'td613.loom.receiver-conformance-review/v0.1', observed_at: new Date().toISOString(),
  input_sha256: createHash('sha256').update(bytes).digest('hex'), cases,
  held_cases: cases.filter(c => c.inspection.status === 'HOLD').length,
  provider_requests: 0, local_ledger_advanced: false, admission_authority: false };
const output = JSON.stringify(report, null, 2) + '\n';
if (outputPath) await writeFile(outputPath, output, { flag: 'wx' });
process.stdout.write(output);
if (report.held_cases) process.exitCode = 1;
