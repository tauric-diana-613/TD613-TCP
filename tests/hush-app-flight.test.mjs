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
function hasActionableHardBlock(reasons = []) { return reasons.some((reason) => /literal|semantic|claim-integrity|claim-payload|payload|source-body|syntax-shift|dangling/.test(reason)); }

installDom();
const bench = await import(`../app/adversarial-bench.js?flight=${Date.now()}`);
bench.initAdversarialBench(document);

bench.resetBench();
const mask = bench.selectHushMask('phase22-jagged-record') || bench.selectHushMask('plain-witness');
assert(mask, 'mask not found for app flight');
const message = 'Keep DOC-77 with 04/21. The file was visible before noon, and the date is the anchor.';
setValue('protectedBaselineInput', '');
setValue('messageDraftInput', message);
document.getElementById('generateMaskedOutputBtn').click();

const result = bench.benchState.hushSwapResult;
const output = value('protectedOutputInput');
assert(result, 'no Hush swap result for app flight');
assert.equal(result.version, 'phase-22');
assert(result.releasePolicy, 'missing release policy');
assert(result.writer?.payloadMap, 'missing payload map');
assert(result.writer?.payloadBindingMap, 'missing payload binding map');
assert(result.writer?.claimRoleMap, 'missing claim role map');
assert(result.writer?.literalPlacementMap, 'missing literal placement map');
assert(result.writer?.syntaxPlan, 'missing syntax plan');
assert(result.syntaxShift, 'missing syntax shift');
assert(result.payloadIntegrity, 'missing payload integrity');
assert(result.claimIntegrity, 'missing claim integrity');

const hardBlockReasons = result.releasePolicy?.hardBlockReasons || [];
if (output.trim()) {
  assert.notEqual(output.trim(), message.trim(), 'UI emitted unchanged output');
  assert.equal(result.releasePolicy?.hardBlocked, false, 'UI emitted while hard-blocked');
  assert(output.includes('DOC-77'), 'missing DOC-77');
  assert(output.includes('04/21'), 'missing 04/21');
} else {
  assert.equal(result.releasePolicy?.hardBlocked, true, 'blank UI output lacked hard block');
  assert(hasActionableHardBlock(hardBlockReasons), `blank UI output lacked actionable hard-block reason: ${hardBlockReasons.join(', ')}`);
}

console.log('hush app flight smoke:', JSON.stringify({ emitted: Boolean(output.trim()), hardBlocked: Boolean(result.releasePolicy?.hardBlocked), hardBlockReasons }));
console.log('hush-app-flight tests passed');
