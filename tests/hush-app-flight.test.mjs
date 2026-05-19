import assert from 'assert';
import fs from 'fs';
import { JSDOM } from 'jsdom';

function installDom() {
  const html = fs.readFileSync('app/adversarial-bench.html', 'utf8');
  const dom = new JSDOM(html, { url: 'http://localhost/adversarial-bench.html', pretendToBeVisual: true });
  global.window = dom.window;
  global.document = dom.window.document;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  return dom;
}

function value(id) { return document.getElementById(id)?.value || ''; }
function setValue(id, text) { const el = document.getElementById(id); assert(el, `missing ${id}`); el.value = text; return el; }

installDom();
const bench = await import(`../app/adversarial-bench.js?flight=${Date.now()}`);
bench.initAdversarialBench(document);

const cases = [
  {
    name: 'plain witness receipt',
    maskId: 'plain-witness',
    message: 'Keep CASE-17 with the note from 6/13. I did not change the attachment.'
  },
  {
    name: 'group chat caveat',
    maskId: 'group-chat-soft',
    message: 'Please keep DOC-91 in the update. I cannot confirm who changed the file on 2026-05-18.'
  },
  {
    name: 'legal intake record',
    maskId: 'legal-intake',
    message: 'I did not edit EXHIBIT-42. The 6/13 timestamp matters because the label changed later.'
  }
];

const flightResults = [];
for (const flight of cases) {
  bench.resetBench();
  const mask = bench.selectHushMask(flight.maskId);
  assert(mask, `mask not found: ${flight.maskId}`);
  setValue('protectedBaselineInput', '');
  setValue('messageDraftInput', flight.message);
  document.getElementById('generateMaskedOutputBtn').click();
  const result = bench.benchState.hushSwapResult;
  const output = value('protectedOutputInput');
  assert(result, `no Hush swap result for ${flight.name}`);
  assert.equal(result.version, 'phase-17');
  assert(result.releasePolicy, `missing release policy for ${flight.name}`);
  assert(result.releasePolicy.mayPopulateOutput, `release policy blocked output for ${flight.name}: ${result.releasePolicy.hardBlockReasons?.join(', ')}`);
  assert(output.trim().length > 0, `UI did not populate transformed output for ${flight.name}`);
  assert.notEqual(output.trim(), flight.message.trim(), `output did not transform source text for ${flight.name}`);
  for (const literal of flight.message.match(/\b(?:EXHIBIT|DOC|CASE)[A-Z0-9:_#\/-]*\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b/g) || []) {
    assert(output.includes(literal), `missing literal ${literal} in ${flight.name}`);
  }
  flightResults.push({
    name: flight.name,
    maskId: flight.maskId,
    status: result.releasePolicy.releaseStatus,
    outputWords: output.trim().split(/\s+/).length,
    selectedCandidateId: result.selectedCandidateId,
    finalScore: result.candidates.find((candidate) => candidate.id === result.selectedCandidateId)?.finalScore ?? null,
    warnings: result.releasePolicy.reviewWarnings?.slice(0, 8) || []
  });
}

console.log('hush app flight results:', JSON.stringify(flightResults, null, 2));
console.log('hush-app-flight tests passed');
