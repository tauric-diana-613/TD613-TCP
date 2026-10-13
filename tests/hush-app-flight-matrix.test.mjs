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

function setValue(id, text) {
  const el = document.getElementById(id);
  assert(el, `missing ${id}`);
  el.value = text;
  return el;
}

function getValue(id) {
  return document.getElementById(id)?.value || '';
}

function literalsFrom(text = '') {
  return text.match(/\b(?:DOC|CASE|REF|INV|FILE)[A-Z0-9:_#\/-]*\b|\b\d{1,2}:\d{2}\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b/g) || [];
}

installDom();
const bench = await import(`../app/adversarial-bench.js?matrix=${Date.now()}`);
bench.initAdversarialBench(document);

const cases = [
  'Keep DOC-77 with 04/21. The file was visible before noon, and the date is the anchor.',
  'Keep REF-23 with 5/18. The note changed later, and the timing should stay attached.',
  'INV-440 was logged at 2:18. Keep the version context with the invoice note.'
];
const maskIds = ['plain-witness', 'group-chat-soft', 'phase22-jagged-record'];
const rows = [];

for (const message of cases) {
  for (const maskId of maskIds) {
    bench.resetBench();
    const mask = bench.selectHushMask(maskId);
    assert(mask, `mask not found: ${maskId}`);
    setValue('protectedBaselineInput', '');
    setValue('messageDraftInput', message);
    document.getElementById('generateMaskedOutputBtn').click();

    const result = bench.benchState.hushSwapResult;
    const output = getValue('protectedOutputInput');
    assert(result, `no result for ${maskId}`);
    assert.equal(result.version, 'phase-22.1-selection-pressure');
    assert(result.releasePolicy, 'missing release policy');
    assert(result.writer?.payloadMap, 'missing payload map');
    assert(result.payloadIntegrity, 'missing payload integrity');
    assert(result.claimIntegrity, 'missing claim integrity');

    const emitted = output.trim().length > 0;
    const missingLiterals = emitted ? literalsFrom(message).filter((literal) => !output.includes(literal)) : [];
    if (emitted) {
      assert.notEqual(output.trim(), message.trim(), `matrix emitted unchanged output for ${maskId}`);
      assert.equal(result.releasePolicy?.hardBlocked, false, `matrix emitted while hard-blocked for ${maskId}`);
      assert.equal(missingLiterals.length, 0, `matrix output missing literals for ${maskId}: ${missingLiterals.join(', ')}`);
      assert.notEqual(result.payloadIntegrity?.passed, false, `matrix emitted payload failure for ${maskId}`);
      assert.notEqual(result.claimIntegrity?.passed, false, `matrix emitted claim failure for ${maskId}`);
    } else {
      assert.equal(result.releasePolicy?.hardBlocked, true, `blank matrix output lacked hard block for ${maskId}`);
      assert((result.releasePolicy?.hardBlockReasons || []).length > 0, `blank matrix output lacked hard-block reasons for ${maskId}`);
    }

    rows.push({
      maskId,
      emitted,
      status: result.releasePolicy?.releaseStatus,
      hardBlocked: Boolean(result.releasePolicy?.hardBlocked),
      hardBlockReasons: result.releasePolicy?.hardBlockReasons || [],
      selectedCandidateId: result.selectedCandidateId
    });
  }
}

assert.equal(rows.length, cases.length * maskIds.length);
assert(rows.some((row) => row.emitted), 'matrix flight emitted zero outputs');
assert(rows.every((row) => row.emitted || row.hardBlockReasons.length > 0), 'blank matrix rows must expose hard-block reasons');
console.log('HUSH_APP_FLIGHT_MATRIX_PHASE22_SUMMARY ' + JSON.stringify({ attempts: rows.length, emitted: rows.filter((row) => row.emitted).length, rows }));
console.log('hush-app-flight-matrix tests passed');
