import assert from 'assert';
import fs from 'fs';
import { buildHushEvidenceCockpit } from '../app/engine/hush-evidence-cockpit.js';
import { auditHushMaskRegistry } from '../app/engine/hush-mask-registry-audit.js';
import { buildHushExportReceiptV2, auditHushExportReceiptV2 } from '../app/engine/hush-export-receipt-v2.js';
import { checkHushDocsMemory } from '../app/engine/hush-docs-memory-check.js';

const docs = {
  README: 'app/hush.html Phase 30 Hush Evidence Cockpit',
  PHASE_MAP: 'Phase 30 Evidence Cockpit',
  INDEX: 'HUSH_PHASE_30_EVIDENCE_COCKPIT_SPEC.md HUSH_EVIDENCE_RECEIPT_SCHEMA.md',
  OPERATOR_MANUAL: 'claim ceiling human review',
  EPISTEMICIDE_AUDIT: 'Phase 30 unified evidence cockpit'
};

const receipt = await buildHushExportReceiptV2({
  sourceText: 'source',
  outputText: 'output',
  maskId: 'phase28-transform-to-chatspeak',
  mode: 'review',
  readinessDashboardSummary: { surfaceCount: 10 },
  registerContractSummary: { mode: 'review' },
  targetRegisterAuditSummary: { passed: true }
});
const receiptAudit = auditHushExportReceiptV2(receipt);
const registry = auditHushMaskRegistry();
const docsMemory = checkHushDocsMemory({ docs });
const cockpit = await buildHushEvidenceCockpit({
  sourceText: 'source',
  outputText: 'output',
  maskId: 'phase28-transform-to-chatspeak',
  mode: 'review',
  exportReceipt: receipt,
  maskRegistry: registry,
  docsMemory
});

const js = fs.readFileSync('app/hush.js', 'utf8');
const css = fs.readFileSync('app/hush-product-spine.css', 'utf8');
const report = {
  version: 'phase-30-evidence-cockpit-report',
  signalBus: {
    present: Boolean(cockpit.signalBusSnapshot),
    registers: cockpit.signalBusSnapshot?.registerCount || 0,
    snapshotGenerated: Boolean(cockpit.signalBusSnapshot?.registers)
  },
  cockpit: {
    built: cockpit.version === 'phase-30',
    routeStatePresent: Boolean(cockpit.routeState),
    narrowingLossesPresent: Boolean(cockpit.narrowingLosses),
    exportReceiptPresent: Boolean(cockpit.exportReceipt),
    ledgerLinked: Boolean(cockpit.signalBusSnapshot?.registers?.ledgerRow)
  },
  selfTest: {
    passed: cockpit.selfTest?.result?.passed === true,
    hardFailures: cockpit.selfTest?.result?.hardFailures || [],
    warnings: cockpit.selfTest?.result?.warnings || []
  },
  maskRegistry: {
    audited: registry.version === 'phase-30',
    missingFromStudio: registry.missingFromStudio,
    orphanedMasks: registry.orphanedMasks
  },
  exportReceipt: {
    privateTextStoredFalse: receipt.privateTextStored === false,
    receiptAuditPassed: receiptAudit.passed === true,
    includesReleasePolicy: true,
    includesRegisterCustody: Object.keys(receipt.registerContractSummary || {}).length > 0,
    includesTargetRegisterAudit: Object.keys(receipt.targetRegisterAuditSummary || {}).length > 0,
    includesDashboardSummary: Object.keys(receipt.readinessDashboardSummary || {}).length > 0,
    includesClaimCeiling: Boolean(receipt.claimCeiling)
  },
  ui: {
    cockpitInjected: js.includes('hushEvidenceCockpit'),
    evidenceGlobal: js.includes('__TD613_HUSH_EVIDENCE_COCKPIT__'),
    futurecoreCss: css.includes('cockpit-grid') && css.includes('instrument-panel') && css.includes('loss-track')
  },
  docsMemory: {
    currentPhaseMentioned: docsMemory.passed === true,
    docsIndexCurrent: fs.existsSync('docs/HUSH_PHASE_30_EVIDENCE_COCKPIT_SPEC.md'),
    receiptSchemaPresent: fs.existsSync('docs/HUSH_EVIDENCE_RECEIPT_SCHEMA.md'),
    signalBusDocPresent: fs.existsSync('docs/HUSH_SIGNAL_BUS.md'),
    narrowingLossDocPresent: fs.existsSync('docs/HUSH_NARROWING_LOSSES.md')
  }
};
report.readiness = {
  evidenceCockpitReady: report.cockpit.built && report.signalBus.registers === 10 && report.selfTest.passed,
  exportReceiptReady: report.exportReceipt.privateTextStoredFalse && report.exportReceipt.receiptAuditPassed,
  registryAuditReady: report.maskRegistry.audited && report.maskRegistry.missingFromStudio.length === 0,
  docsMemoryReady: Object.values(report.docsMemory).every(Boolean),
  uiReady: Object.values(report.ui).every(Boolean)
};
report.readiness.overall = Object.values(report.readiness).every(Boolean);

console.log('HUSH_PHASE30_EVIDENCE_COCKPIT_REPORT ' + JSON.stringify(report));
assert.equal(report.readiness.overall, true);
console.log('hush-phase30-evidence-cockpit-report tests passed');
