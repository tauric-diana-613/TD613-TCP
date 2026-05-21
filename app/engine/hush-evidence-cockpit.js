import { createHushSignalBus, writeHushSignal, snapshotHushSignalBus, summarizeHushSignalBus } from './hush-signal-bus.js';
import { buildHushReadinessDashboard, summarizeHushReadinessDashboard } from './hush-readiness-dashboard.js';
import { computeHushNarrowingLosses, summarizeHushNarrowingLosses } from './hush-narrowing-losses.js';
import { buildHushExportReceiptV2, summarizeHushExportReceiptV2 } from './hush-export-receipt-v2.js';
import { auditHushMaskRegistry, summarizeHushMaskRegistryAudit } from './hush-mask-registry-audit.js';
import { runHushSelfTest, summarizeHushSelfTest } from './hush-self-test-harness.js';

export const HUSH_EVIDENCE_COCKPIT_VERSION = 'phase-30';

const list = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

export async function buildHushEvidenceCockpit(input = {}) {
  const dashboard = input.dashboard || buildHushReadinessDashboard(input.reports || { exportReady: true, operatorReady: true });
  const narrowingLosses = input.narrowingLosses || computeHushNarrowingLosses({ ...input, dashboard });
  const exportReceipt = input.exportReceipt || await buildHushExportReceiptV2({ ...input, routeState: narrowingLosses.routeState, readinessDashboardSummary: summarizeHushReadinessDashboard(dashboard), narrowingLossSummary: summarizeHushNarrowingLosses(narrowingLosses), registerContractSummary: input.registerContractSummary || { mode: input.mode || 'review' }, targetRegisterAuditSummary: input.targetRegisterAuditSummary || { passed: true } });
  const maskRegistry = input.maskRegistry || auditHushMaskRegistry(input.registryInput || {});
  let signalBus = createHushSignalBus(input.signalBus || {});
  signalBus = writeHushSignal(signalBus, 'cockpit-build', { registers: { sourceHash: exportReceipt.sourceHash, outputHash: exportReceipt.outputHash, maskId: exportReceipt.maskId || 'pending', mode: exportReceipt.mode || 'review', exportState: exportReceipt.complete ? 'receipt-ready' : 'hold', routeState: narrowingLosses.routeState, ledgerRow: input.ledgerRowHash || exportReceipt.ledgerRowHash || 'pending' } });
  const selfTest = input.selfTest || runHushSelfTest({ routes: input.routes || { hushRoutePresent: true, legacyRoutePresent: true }, ui: input.ui || { dashboardPanelPresent: true, cockpitPanelPresent: true, exportPanelPresent: true }, engine: input.engine || { signalBusPresent: true, reportIngestPresent: true, readinessLedgerPresent: true, narrowingLossesPresent: true }, signalBus, maskRegistry, exportReceipt, docsMemory: input.docsMemory || { passed: true, missingMentions: [], staleMentions: [] } });
  const routeState = selfTest.result?.passed === false ? 'hold' : narrowingLosses.routeState;
  const operatorActions = list(selfTest.result?.hardFailures).length ? list(selfTest.result.hardFailures).map((failure) => `repair:${failure}`) : ['review receipt', 'continue synthetic test flight'];
  return { version: HUSH_EVIDENCE_COCKPIT_VERSION, routeState, signalBusSnapshot: snapshotHushSignalBus(signalBus), signalBusSummary: summarizeHushSignalBus(signalBus), dashboardSummary: summarizeHushReadinessDashboard(dashboard), narrowingLosses, narrowingLossSummary: summarizeHushNarrowingLosses(narrowingLosses), latestReports: input.reports || {}, latestLedgerRow: input.latestLedgerRow || null, exportReceipt, exportReceiptSummary: summarizeHushExportReceiptV2(exportReceipt), maskRegistrySummary: summarizeHushMaskRegistryAudit(maskRegistry), selfTest, selfTestSummary: summarizeHushSelfTest(selfTest), operatorActions, claimCeiling: exportReceipt.claimCeiling || 'local-review-only' };
}

export function summarizeHushEvidenceCockpit(cockpit = {}) {
  return { version: cockpit.version || HUSH_EVIDENCE_COCKPIT_VERSION, routeState: cockpit.routeState || 'pending', signalBus: cockpit.signalBusSummary || {}, dashboard: cockpit.dashboardSummary || {}, narrowingLosses: cockpit.narrowingLossSummary || {}, exportReceipt: cockpit.exportReceiptSummary || {}, selfTest: cockpit.selfTestSummary || {}, operatorActions: list(cockpit.operatorActions), claimCeiling: cockpit.claimCeiling || '' };
}
