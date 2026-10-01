/** Static instrument integrity only; browser layout and custody need actual live witnessing. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const source = readFileSync(new URL('../app/dome-world/previews/loom-native-mobile-witness.html', import.meta.url), 'utf8');
const dom = new JSDOM(source, { url: 'https://td613.com/dome-world/previews/loom-native-mobile-witness.html' });
const doc = dom.window.document;

test('narrow witness loads only the canonical same-origin route without substituting application state', () => {
  const frames = doc.querySelectorAll('iframe');
  assert.equal(frames.length, 1);
  const frame = frames[0];
  assert.equal(frame.src, 'https://td613.com/dome-world/holonomy-loom.html');
  assert.equal(frame.name, 'canonicalWitness');
  assert.equal(frame.getAttribute('width'), '390');
  assert.equal(frame.getAttribute('height'), '844');
  assert.equal(frame.hasAttribute('sandbox'), false, 'canonical origin/storage must remain available');
  assert.equal(frame.hasAttribute('srcdoc'), false);
  assert.equal(doc.querySelectorAll('script').length,1);
  assert.equal(doc.querySelector('script').id,'td613-sitewide-reset-preflight');
  assert.equal(doc.querySelector('script').getAttribute('src'),'/site-epoch-preflight.js?v=20260927-v1');
  assert.equal(doc.querySelector('script').textContent,'');
  assert.equal(doc.querySelectorAll('link[rel="stylesheet"], form').length,0);
  assert.doesNotMatch(source, /on(?:load|click|submit)\s*=|fetch\(|postMessage\(|sessionStorage|localStorage|native_reply|loom_demo_stage_receipt|data:/i);
  assert.match(doc.querySelector('style').textContent, /iframe\s*\{[^}]*width:\s*390px;\s*height:\s*844px;/);
});

test('only explicit navigation links choose canonical Loom or ordinary Marrowline in the existing frame', () => {
  const links = [...doc.querySelectorAll('a')];
  assert.equal(links.length, 2);
  assert.deepEqual(links.map(link => link.href), [
    'https://td613.com/dome-world/holonomy-loom.html',
    'https://td613.com/dome-world/marrowline.html'
  ]);
  links.forEach(link => assert.equal(link.target, 'canonicalWitness'));
  assert.match(doc.body.textContent, /not a physical-device test/);
  assert.match(doc.body.textContent, /does not simulate iOS, touch input, a software keyboard/);
  assert.equal(doc.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
});
