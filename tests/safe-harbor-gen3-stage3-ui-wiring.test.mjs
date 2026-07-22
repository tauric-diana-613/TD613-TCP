import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const index = readFileSync(new URL('../app/safe-harbor/index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-temporal-bloom.css', import.meta.url), 'utf8');
const moduleSource = readFileSync(new URL('../app/safe-harbor/app/safe-harbor-temporal-bloom.js', import.meta.url), 'utf8');
const schema = JSON.parse(readFileSync(new URL('../app/safe-harbor/schemas/td613-safe-harbor.stage3-presentation.v1.schema.json', import.meta.url), 'utf8'));

assert.ok(index.includes('app/safe-harbor-temporal-bloom.css?v=20260722-gen3-stage3'));
assert.ok(index.includes('type="module" src="app/safe-harbor-temporal-bloom.js?v=20260722-gen3-stage3"'));
assert.ok(index.indexOf('safe-harbor-pr169-packet-vault-direct.js') < index.indexOf('safe-harbor-temporal-bloom.js'), 'Stage 3 presentation must load after the existing packet-vault bridge');
assert.ok(index.indexOf('app/styles.css') < index.indexOf('safe-harbor-temporal-bloom.css'), 'bounded Stage 3 CSS must load after the base stylesheet');

assert.ok(css.includes('.temporal-bloom-public #ingressProgressPill'));
assert.ok(css.includes('.temporal-bloom-public #ingressResolvedReadout'));
assert.ok(css.includes('.temporal-bloom-public #ingressThresholdReadout'));
assert.ok(css.includes('.temporal-bloom-public #ingressStepMeta'));
assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
assert.ok(css.includes('@media (max-width: 760px)'));
assert.ok(css.includes(':focus-visible'));

assert.ok(moduleSource.includes("section.setAttribute('aria-labelledby', 'td613TemporalBloomTitle')"));
assert.ok(moduleSource.includes("section.setAttribute('aria-labelledby', 'td613Stage3Title')"));
assert.ok(moduleSource.includes('aria-live="polite"'));
assert.ok(moduleSource.includes('data-td613-shi'));
assert.ok(moduleSource.includes('AI IMITATION COLLISION: PRESENT'));
assert.ok(moduleSource.includes('AUTHORITY CLAIM REDUCED'));
assert.ok(moduleSource.includes('INDEPENDENT IDENTITY ADJUDICATION: NOT CLAIMED'));
assert.ok(moduleSource.includes("raw_text_included: false"));
assert.ok(moduleSource.includes("document.getElementById('ingressContinue')"));
assert.ok(moduleSource.includes('continueButton.hidden = !show'));
assert.ok(moduleSource.includes("new MutationObserver(refresh)"));
assert.ok(moduleSource.includes("window.dispatchEvent(new CustomEvent('td613:safe-harbor:stage3-ready'"));

assert.equal(schema.$id, 'td613.safe-harbor.stage3-presentation/v1');
assert.deepEqual(schema.properties.authority_label.enum, ['PACKET-SCOPED AUTHORITY', 'AUTHORITY CLAIM REDUCED']);
assert.deepEqual(schema.properties.countersignature_state.enum, ['unsigned', 'countersigned']);

const forbidden = [
  'keystroke timing',
  'pause timing',
  'covert behavioral biometric',
  'personality diagnosis',
  'trauma diagnosis',
  'intelligence score',
  'universal authorship proof'
];
for (const phrase of forbidden) {
  assert.equal(moduleSource.toLowerCase().includes(phrase), false, `forbidden Stage 3 behavior or inflated claim found: ${phrase}`);
}

console.log('safe-harbor-gen3-stage3-ui-wiring: ok');
