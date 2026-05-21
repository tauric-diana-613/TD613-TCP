import { summarizeHushSignalBus } from './hush-signal-bus.js';
import { auditHushMaskRegistry, summarizeHushMaskRegistryAudit } from './hush-mask-registry-audit.js';
import { auditHushExportReceiptV2, summarizeHushExportReceiptV2 } from './hush-export-receipt-v2.js';
import { summarizeHushDocsMemoryCheck } from './hush-docs-memory-check.js';

export const HUSH_SELF_TEST_HARNESS_VERSION = 'phase-30';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export function runHushSelfTest(input = {}) {
  const maskRegistry = input.maskRegistry || auditHushMaskRegistry(input.registryInput || {});
  const exportAudit = input.exportReceipt ? auditHushExportReceiptV2(input.exportReceipt) : { passed: false, hardFailures: ['export-receipt-missing'], warnings: [] };
  const docsMemory = input.docsMemory || { passed: false, missingMentions: ['docs-memory-missing'], staleMentions: [] };
  const signalBus = input.signalBus || {};
  const hardFailures = [];
  const warnings = [];
  if (!input.routes?.hushRoutePresent) hardFailures.push('missing-hush-route');
  if (!input.routes?.legacyRoutePresent) warnings.push('legacy-route-not-confirmed');
  if (!input.ui?.dashboardPanelPresent) hardFailures.push('dashboard-not-bound');
  if (!input.engine?.reportIngestPresent) hardFailures.push('report-ingest-missing');
  if (!input.engine?.readinessLedgerPresent) hardFailures.push('readiness-ledger-missing');
  if (!input.engine?.signalBusPresent) hardFailures.push('signal-bus-missing');
  if (!input.engine?.narrowingLossesPresent) hardFailures.push('narrowing-losses-missing');
  if (maskRegistry.passed === false) hardFailures.push('mask-registry-orphan');
  if (exportAudit.passed === false) hardFailures.push(...list(exportAudit.hardFailures));
  if (docsMemory.passed === false) hardFailures.push('docs-phase-drift');
  return {
    version: HUSH_SELF_TEST_HARNESS_VERSION,
    route: input.routes || {},
    ui: input.ui || {},
    engine: input.engine || {},
    signalBus: summarizeHushSignalBus(signalBus),
    registry: summarizeHushMaskRegistryAudit(maskRegistry),
    exportReceipt: input.exportReceipt ? summarizeHushExportReceiptV2(input.exportReceipt) : {},
    docs: summarizeHushDocsMemoryCheck(docsMemory),
    result: { passed: hardFailures.length === 0, warnings: [...new Set(warnings)], hardFailures: [...new Set(hardFailures)] }
  };
}

export function summarizeHushSelfTest(result = {}) {
  return { version: result.version || HUSH_SELF_TEST_HARNESS_VERSION, passed: result.result?.passed === true, hardFailures: list(result.result?.hardFailures), warnings: list(result.result?.warnings), routeState: result.signalBus?.routeState || 'pending' };
}
