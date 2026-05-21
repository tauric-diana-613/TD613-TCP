import assert from 'assert';
import fs from 'fs';
import { buildHushReadinessDashboard } from '../app/engine/hush-readiness-dashboard.js';
import { buildHushProductState } from '../app/engine/hush-product-state.js';
import { ingestHushReportLine } from '../app/engine/hush-report-ingest.js';
import { buildHushReadinessLedgerRow, summarizeHushReadinessLedger } from '../app/engine/hush-readiness-ledger.js';

const exists = (path) => fs.existsSync(path);
const phase28Line = 'HUSH_PHASE28_TARGET_REGISTER_REPORT {"version":"phase-28-target-register-report","readiness":{"overall":false}}';
const ingested = ingestHushReportLine(phase28Line);
const dashboard = buildHushReadinessDashboard({ phase28: ingested.report, exportReady: true, operatorReady: true });
const productState = buildHushProductState({ dashboard, currentMode: 'product-spine' });
const ledgerRow = await buildHushReadinessLedgerRow({ sourceText: 'private input', outputText: 'private output', dashboardSummary: productState.dashboardSummary });
const ledgerSummary = summarizeHushReadinessLedger(ledgerRow);

const report = {
  version: 'phase-29-product-readiness-report',
  routes: {
    hushRoutePresent: exists('app/hush.html'),
    legacyRoutePresent: exists('app/adversarial-bench.html')
  },
  dashboard: {
    generated: Boolean(dashboard.version),
    surfacesCount: Object.keys(dashboard.surfaces || {}).length,
    hardBlockMapping: Array.isArray(dashboard.blockers),
    warningMapping: Array.isArray(dashboard.warnings)
  },
  ledger: {
    rawTextExcludedByDefault: ledgerRow.privateTextStored === false,
    hashesPresent: Boolean(ledgerRow.inputHash && ledgerRow.outputHash),
    privateTextStoredFalse: ledgerSummary.privateTextStored === false
  },
  docs: {
    operatorManualPresent: exists('docs/HUSH_OPERATOR_MANUAL.md'),
    phaseStatusPresent: exists('docs/HUSH_PHASE_21_28_STATUS.md'),
    knownFailuresPresent: exists('docs/HUSH_KNOWN_FAILURE_MODES.md'),
    productSpineStatusPresent: exists('docs/HUSH_PRODUCT_SPINE_STATUS.md'),
    testFlightProtocolPresent: exists('docs/HUSH_TEST_FLIGHT_PROTOCOL.md')
  },
  appIntegration: {
    productStatePresent: Boolean(productState.version),
    reportIngestPresent: ingested.recognized === true,
    dashboardPanelPresent: fs.readFileSync('app/hush.html', 'utf8').includes('hushReadinessDashboard')
  }
};
report.readiness = {
  productSpineReady: report.routes.hushRoutePresent && report.routes.legacyRoutePresent,
  dashboardReady: report.dashboard.generated && report.dashboard.surfacesCount >= 10,
  ledgerReady: report.ledger.rawTextExcludedByDefault && report.ledger.hashesPresent,
  docsReady: Object.values(report.docs).every(Boolean),
  overall: false
};
report.readiness.overall = report.readiness.productSpineReady && report.readiness.dashboardReady && report.readiness.ledgerReady && report.readiness.docsReady && report.appIntegration.productStatePresent && report.appIntegration.reportIngestPresent && report.appIntegration.dashboardPanelPresent;

console.log('HUSH_PHASE29_PRODUCT_READINESS_REPORT ' + JSON.stringify(report));
assert.equal(report.readiness.overall, true);
console.log('hush-phase29-product-readiness-report tests passed');
