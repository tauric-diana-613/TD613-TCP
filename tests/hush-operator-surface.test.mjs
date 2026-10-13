import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { HUSH_ALIEN_CONSOLE_VERSION, initHushAlienConsole, renderHushMaskRouteCards, updateHushAlienHeat } from '../app/hush-alien-console.js';

assert.equal(HUSH_ALIEN_CONSOLE_VERSION, 'phase-20');

const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
const bridge = fs.readFileSync('app/adversarial-bench-light.js', 'utf8');
const dom = new JSDOM(html, { url: 'http://localhost/adversarial-bench.html', pretendToBeVisual: true });
const { document } = dom.window;

for (const selector of [
  '.hush-alien-console',
  '.hush-signal-masthead',
  '.hush-local-flight-banner',
  '.hush-operator-path',
  '.hush-message-chamber',
  '.hush-mask-chamber',
  '.hush-transform-gate',
  '.hush-output-chamber',
  '.hush-heat-grid',
  '.hush-drawer-console'
]) {
  assert(document.querySelector(selector), `missing operator surface selector ${selector}`);
}

for (const id of [
  'hushOperatorPath',
  'hushPathMessage',
  'hushPathMask',
  'hushPathTransform',
  'hushPathHeat',
  'hushPathCopy',
  'hushGateStrip',
  'hushMaskRouteGrid',
  'hushOutputStatusBand',
  'hushSyntaxLight',
  'hushSourceHeatLight',
  'hushClaimLight',
  'messageDraftInput',
  'maskFieldSelect',
  'generateMaskedOutputBtn',
  'protectedOutputInput',
  'copyHushOutputBtn',
  'protectedBaselineInput',
  'maskReferenceInput',
  'hushVaultDrawer',
  'hushLabDrawer',
  'escapeVectorGrid',
  'recognitionFieldGrid',
  'ledgerExportOutput',
  'reportExportOutput'
]) {
  assert(document.getElementById(id), `missing ${id}`);
}

assert(document.body.textContent.includes('Local Operator Flight'));
assert(document.body.textContent.includes('No Platform Guarantee'));
assert(bridge.includes('./hush-alien-console.js'), 'browser bridge imports hush-alien-console.js');
assert(bridge.includes('initHushAlienConsole'), 'browser bridge initializes alien console');

const fakeBench = {
  benchState: {
    selectedHushMaskId: 'plain-witness',
    messageDraftText: 'Keep CASE-17 with the note from 6/13. I did not change it.',
    protectedOutputText: 'CASE-17 should stay with the 6/13 note. It was not changed on my end.',
    hushMasks: [
      { id: 'plain-witness', label: 'Plain Witness', family: 'plain', intendedUse: 'direct notes', description: 'calm factual route', riskTell: 'low ornament' },
      { id: 'group-chat-soft', label: 'Group Chat Soft', family: 'soft', intendedUse: 'coworker thread', description: 'warm low-friction route', riskTell: 'casual warmth' }
    ],
    customMasks: [],
    hushSwapResult: {
      selectedCandidateId: 'candidate-1',
      releasePolicy: { releaseStatus: 'needs-review', hardBlocked: false },
      candidates: [{
        id: 'candidate-1',
        escapeVector: { scores: { semanticFidelity: 0.91, maskFit: 0.78 } },
        match: { matchScore: 0.78 },
        lockboxVerification: { preservationScore: 1 },
        syntaxShift: { metrics: { syntaxShiftScore: 0.82 } },
        sourceResidue: { metrics: { cadenceBodyRisk: 0.32 } },
        claimIntegrity: { passed: true }
      }]
    }
  },
  selectHushMask(maskId) { this.benchState.selectedHushMaskId = maskId; return this.benchState.hushMasks.find((mask) => mask.id === maskId); }
};

document.getElementById('maskFieldSelect').innerHTML = '<option value="plain-witness">Plain Witness</option><option value="group-chat-soft">Group Chat Soft</option>';
document.getElementById('maskFieldSelect').value = 'plain-witness';
document.getElementById('messageDraftInput').value = fakeBench.benchState.messageDraftText;
document.getElementById('protectedOutputInput').value = fakeBench.benchState.protectedOutputText;

const init = initHushAlienConsole(document, fakeBench);
assert.equal(init.version, 'phase-20');
const rendered = renderHushMaskRouteCards(document, fakeBench);
assert.equal(rendered.count, 2);
assert.equal(document.querySelectorAll('.hush-route-card').length, 2);
assert.equal(document.querySelector('.hush-route-card[aria-selected="true"]')?.getAttribute('data-mask-id'), 'plain-witness');

document.querySelector('.hush-route-card[data-mask-id="group-chat-soft"]').click();
assert.equal(document.getElementById('maskFieldSelect').value, 'group-chat-soft');
assert.equal(fakeBench.benchState.selectedHushMaskId, 'group-chat-soft');
assert.equal(document.querySelector('.hush-route-card[aria-selected="true"]')?.getAttribute('data-mask-id'), 'group-chat-soft');

updateHushAlienHeat(document, fakeBench);
assert.equal(document.getElementById('hushPathMessage').dataset.state, 'ready');
assert.equal(document.getElementById('hushPathMask').dataset.state, 'ready');
assert.equal(document.getElementById('hushPathTransform').dataset.state, 'ready');
assert.equal(document.getElementById('hushPathCopy').dataset.state, 'ready');
assert.equal(document.getElementById('hushSyntaxLight').dataset.state, 'ready');
assert.equal(document.getElementById('hushSourceHeatLight').dataset.state, 'ready');
assert.equal(document.getElementById('hushClaimLight').dataset.state, 'ready');
assert.equal(document.getElementById('hushOutputStatusText').textContent, 'needs-review');
assert.equal(document.getElementById('hushOutputClaimText').textContent, 'Held');

console.log('hush-operator-surface tests passed');
