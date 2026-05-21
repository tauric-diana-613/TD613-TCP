import assert from 'assert';
import { runHushSelfTest } from '../app/engine/hush-self-test-harness.js';
import { buildHushExportReceiptV2 } from '../app/engine/hush-export-receipt-v2.js';

const receipt = await buildHushExportReceiptV2({ sourceText: 'a', outputText: 'b', readinessDashboardSummary: { surfaceCount: 10 }, registerContractSummary: { mode: 'review' }, targetRegisterAuditSummary: { passed: true } });
const result = runHushSelfTest({
  routes: { hushRoutePresent: true, legacyRoutePresent: true },
  ui: { dashboardPanelPresent: true, cockpitPanelPresent: true, exportPanelPresent: true },
  engine: { signalBusPresent: true, reportIngestPresent: true, readinessLedgerPresent: true, narrowingLossesPresent: true },
  exportReceipt: receipt,
  docsMemory: { passed: true, missingMentions: [], staleMentions: [] }
});
assert.equal(result.version, 'phase-30');
assert.equal(result.result.passed, true);
assert.equal(result.result.hardFailures.length, 0);
console.log('hush-self-test-harness tests passed');
