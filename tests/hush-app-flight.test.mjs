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
  { name: 'plain witness receipt', maskId: 'plain-witness', message: 'Keep CASE-17 with the note from 6/13. I did not change the attachment.' },
  { name: 'group chat caveat', maskId: 'group-chat-soft', message: 'Please keep DOC-91 in the update. I cannot confirm who changed the file on 2026-05-18.' },
  { name: 'legal intake record', maskId: 'legal-intake', message: 'I did not edit EXHIBIT-42. The 6/13 timestamp matters because the label changed later.' },
  { name: 'payload invoice record', maskId: 'plain-witness', message: 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until we know which version finance kept.' }
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
  assert.equal(result.version, 'phase-21');
  assert(result.releasePolicy, `missing release policy for ${flight.name}`);
  assert(result.writer?.payloadMap, `missing payload map for ${flight.name}`);
  assert(result.writer?.payloadBindingMap, `missing payload binding map for ${flight.name}`);
  assert(result.writer?.claimRoleMap, `missing claim role map for ${flight.name}`);
  assert(result.writer?.literalPlacementMap, `missing literal placement map for ${flight.name}`);
  assert(result.writer?.syntaxPlan, `missing syntax plan for ${flight.name}`);
  assert(result.syntaxShift, `missing syntax shift for ${flight.name}`);
  assert(result.payloadIntegrity, `missing payload integrity for ${flight.name}`);
  assert(result.claimIntegrity, `missing claim integrity for ${flight.name}`);
  assert(output.trim().length > 0, `UI did not populate transformed output for ${flight.name}`);
  assert.notEqual(output.trim(), flight.message.trim(), `UI emitted unchanged output for ${flight.name}`);
  for (const literal of flight.message.match(/\b(?:EXHIBIT|DOC|CASE|REF|INV)[A-Z0-9:_#\/-]*\b|\b\d{1,2}:\d{2}\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b/g) || []) {
    assert(output.includes(literal), `missing literal ${literal} in ${flight.name}`);
  }
  if (flight.name === 'payload invoice record') {
    assert(output.includes('Jordan'), 'payload invoice record must keep Jordan');
    assert(/finance/i.test(output), 'payload invoice record must keep finance');
    assert(/version/i.test(output), 'payload invoice record must keep version context');
    assert(!/\b440 record\b/i.test(output), 'payload invoice record must not truncate INV-440');
    assert(!/\b18\.\s*not\b/i.test(output), 'payload invoice record must not clip 2:18/not');
  }
  flightResults.push({
    name: flight.name,
    maskId: flight.maskId,
    status: result.releasePolicy.releaseStatus,
    selectedCandidateId: result.selectedCandidateId,
    finalScore: result.candidates.find((candidate) => candidate.id === result.selectedCandidateId)?.finalScore ?? null,
    syntaxShiftScore: result.syntaxShift?.metrics?.syntaxShiftScore ?? null,
    sourceBodyRisk: result.sourceResidue?.metrics?.cadenceBodyRisk ?? null,
    payloadIntegrity: result.payloadIntegrity?.passed ?? null,
    claimIntegrity: result.claimIntegrity?.passed ?? null
  });
}

console.log('hush app flight results:', JSON.stringify(flightResults, null, 2));
console.log('hush-app-flight tests passed');
