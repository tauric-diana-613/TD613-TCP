import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { initHushInvisibleShell, updateHushPressureRibbon } from '../app/hush-invisible-shell.js';

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const bridge = fs.readFileSync('app/adversarial-bench-light.js', 'utf8');
const bootstrap = fs.readFileSync('app/chamber-bootstrap.js', 'utf8');
const dom = new JSDOM(html);
const { document } = dom.window;

for (const copy of ['Message to Transform', 'Choose Mask', 'Transform', 'Transformed Message', 'Vault', 'Lab', 'Advanced Reference Voice']) {
  assert(document.body.textContent.includes(copy), `Hush page contains ${copy}`);
}

for (const id of [
  'hushPressureRibbon',
  'hushVaultDrawer',
  'hushLabDrawer',
  'messageDraftInput',
  'maskFieldSelect',
  'generateMaskedOutputBtn',
  'protectedOutputInput',
  'copyHushOutputBtn',
  'openHushReviewBtn',
  'protectedBaselineInput',
  'maskReferenceInput',
  'hushBuiltInTabBtn',
  'hushCustomizeTabBtn',
  'hushCustomMaskName',
  'hushCustomMaskSampleInput',
  'hushAddSampleBtn',
  'hushSaveCustomMaskBtn',
  'hushCustomMaskSummary',
  'hushMaskProfilePanel',
  'hushProfileMatchPanel',
  'hushSwapWarningsPanel',
  'maskMemorySummary',
  'escapeVectorPanel',
  'escapeVectorGrid',
  'controllerPanel',
  'personaMemoryPanel',
  'recognitionFieldPanel',
  'recognitionContextType',
  'recognitionIntentMode',
  'recognitionExposureDuration',
  'recognitionFieldGrid',
  'recognitionFieldWarnings',
  'iterationPreviewPanel',
  'exportLedgerJsonBtn',
  'exportHushMaskProfileBtn',
  'exportHushSwapJsonBtn',
  'includeLedgerTextsToggle',
  'ledgerExportOutput',
  'reportExportPanel',
  'claimCeilingPanel',
  'exportReportJsonBtn',
  'exportReportMarkdownBtn',
  'reportExportOutput'
]) {
  assert(document.getElementById(id), `missing ${id}`);
}

const vault = document.getElementById('hushVaultDrawer');
const lab = document.getElementById('hushLabDrawer');
assert.equal(vault.open, false, 'Vault drawer is collapsed by default');
assert.equal(lab.open, false, 'Lab drawer is collapsed by default');
assert(vault.contains(document.getElementById('protectedBaselineInput')), 'advanced reference voice lives inside Vault');
assert(vault.contains(document.getElementById('maskReferenceInput')), 'mask reference lives inside Vault');
assert(lab.contains(document.getElementById('escapeVectorGrid')), 'escape vector grid lives inside Lab');
assert(lab.contains(document.getElementById('recognitionFieldPanel')), 'recognition field lives inside Lab');
assert(lab.contains(document.getElementById('ledgerExportOutput')), 'ledger export lives inside Lab');
assert(lab.contains(document.getElementById('reportExportOutput')), 'report export lives inside Lab');

assert(html.includes('./hush-invisible.css'), 'Hush page loads hush-invisible.css directly');
assert(bridge.includes('./hush-invisible-shell.js'), 'light browser bridge imports hush-invisible-shell.js');
assert(bridge.includes('__TD613_HUSH_BENCH__'), 'browser bridge exposes the Hush bench for the invisible shell');

for (const oldLabel of ['Protected Baseline / Reference Voice', 'Message Draft / Source Text', 'Protected Output']) {
  assert(!document.body.textContent.includes(oldLabel), `old primary label still visible: ${oldLabel}`);
}

const runtimeDom = new JSDOM(html, { url: 'http://localhost/adversarial-bench.html', pretendToBeVisual: true });
const runtimeDoc = runtimeDom.window.document;
const fakeBench = {
  benchState: {
    escapeVector: {
      scores: { semanticFidelity: 0.82, maskFit: 0.79 },
      warnings: []
    },
    hushProfileMatch: { matchScore: 0.81 },
    controllerDecision: { state: 'continue' },
    claimCeiling: { label: 'local review only' },
    recognitionField: { classifications: { route: 'continue' } }
  }
};
assert.equal(initHushInvisibleShell(runtimeDoc, fakeBench).version, 'phase-15');
assert.equal(initHushInvisibleShell(runtimeDoc, fakeBench).idempotent, true, 'invisible shell initializes idempotently');
updateHushPressureRibbon(fakeBench);
assert.equal(runtimeDoc.getElementById('hushMeaningLight').dataset.state, 'ready');
assert.equal(runtimeDoc.getElementById('hushMaskFitLight').dataset.state, 'ready');
runtimeDoc.getElementById('openHushReviewBtn').click();
assert.equal(runtimeDoc.getElementById('hushLabDrawer').open, true, 'Review opens the Lab drawer');
runtimeDoc.getElementById('protectedOutputInput').value = 'masked output';
assert.equal(runtimeDoc.defaultView.__TD613_HUSH_BENCH__, undefined);

console.log('hush-invisible-instrument tests passed');
