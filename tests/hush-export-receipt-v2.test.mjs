import assert from 'assert';
import { buildHushExportReceiptV2, auditHushExportReceiptV2, summarizeHushExportReceiptV2 } from '../app/engine/hush-export-receipt-v2.js';

const receipt = await buildHushExportReceiptV2({ sourceText: 'source', outputText: 'output', maskId: 'mask', mode: 'review', readinessDashboardSummary: { surfaceCount: 10 }, registerContractSummary: { mode: 'review' }, targetRegisterAuditSummary: { passed: true } });
assert.equal(receipt.version, 'phase-30');
assert.equal(receipt.privateTextStored, false);
assert(receipt.sourceHash);
assert(receipt.outputHash);
assert.equal(receipt.complete, true);

const audit = auditHushExportReceiptV2(receipt);
assert.equal(audit.passed, true);

const summary = summarizeHushExportReceiptV2(receipt);
assert.equal(summary.hasDashboardSummary, true);
assert.equal(summary.hasRegisterCustody, true);
assert.equal(summary.hasTargetRegisterAudit, true);
console.log('hush-export-receipt-v2 tests passed');
