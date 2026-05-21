import assert from 'assert';
import { ingestHushReportLine, ingestHushReportLines } from '../app/engine/hush-report-ingest.js';

const line = 'HUSH_PHASE28_TARGET_REGISTER_REPORT {"version":"phase-28-target-register-report","readiness":{"overall":false}}';
const result = ingestHushReportLine(line);
assert.equal(result.recognized, true);
assert.equal(result.reportType, 'phase28');
assert.equal(result.report.readiness.overall, false);

const unknown = ingestHushReportLine('SOMETHING_ELSE {}');
assert.equal(unknown.recognized, false);
assert(unknown.warnings.includes('unknown-report-prefix'));

const batch = ingestHushReportLines([line, 'HUSH_PHASE29_PRODUCT_READINESS_REPORT {"version":"phase-29"}']);
assert.equal(batch.recognized, 2);

console.log('hush-report-ingest tests passed');
