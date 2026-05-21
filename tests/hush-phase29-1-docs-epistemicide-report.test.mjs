import assert from 'assert';
import fs from 'fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const exists = (path) => fs.existsSync(path);

const readme = read('README.md');
const phaseMap = read('docs/PHASE_MAP.md');
const index = read('docs/INDEX.md');
const audit = read('docs/HUSH_EPISTEMICIDE_AUDIT.md');

const report = {
  version: 'phase-29-1-docs-epistemicide-report',
  readme: {
    mentionsHushRoute: readme.includes('app/hush.html'),
    mentionsPhase29: readme.includes('Phase 29'),
    mentionsPhase29Point1: readme.includes('Phase 29.1'),
    mentionsAudit: readme.includes('HUSH_EPISTEMICIDE_AUDIT.md')
  },
  phaseMap: {
    mentionsPhase29: phaseMap.includes('Phase 29'),
    mentionsPhase29Point1: phaseMap.includes('29.1'),
    mentionsHushRoute: phaseMap.includes('app/hush.html'),
    noPhase12CloseoutOnly: !phaseMap.includes('Phase 10 closed the first Toy-to-Tool plan. Phase 11 starts')
  },
  docsIndex: {
    mentionsOperatorManual: index.includes('HUSH_OPERATOR_MANUAL.md'),
    mentionsProductSpine: index.includes('HUSH_PRODUCT_SPINE_STATUS.md'),
    mentionsAudit: index.includes('HUSH_EPISTEMICIDE_AUDIT.md'),
    mentionsLatePhaseStatus: index.includes('HUSH_PHASE_21_28_STATUS.md')
  },
  auditDoc: {
    present: exists('docs/HUSH_EPISTEMICIDE_AUDIT.md'),
    mentionsReportUiDrift: audit.includes('Report-to-UI drift'),
    mentionsMaskRegistryDrift: audit.includes('Mask registry drift'),
    mentionsExportReceiptLag: audit.includes('Export receipt lag'),
    mentionsPhase30: audit.includes('Phase 30')
  }
};
report.readiness = {
  readmeReady: Object.values(report.readme).every(Boolean),
  phaseMapReady: Object.values(report.phaseMap).every(Boolean),
  docsIndexReady: Object.values(report.docsIndex).every(Boolean),
  auditDocReady: Object.values(report.auditDoc).every(Boolean)
};
report.readiness.overall = Object.values(report.readiness).every(Boolean);

console.log('HUSH_PHASE29_1_DOCS_EPISTEMICIDE_REPORT ' + JSON.stringify(report));
assert.equal(report.readiness.overall, true);
console.log('hush-phase29-1-docs-epistemicide-report tests passed');
