import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { renderLoomAiResult } from '../app/dome-world/holonomy-loom/ai-result-view.js';

const observed = JSON.parse(fs.readFileSync(new URL('../docs/research/receipts/2026-09-10-loom-live-receiver/hosted-loom-ai-observation.json', import.meta.url), 'utf8'));
const completed = observed.receipt.events.find(event => event.phase === 'completed');
const actualAnswer = {
  answer: observed.analysis_paragraphs.join('\n\n'),
  missing_information: completed.missing_information,
  used_document_ids: completed.used_document_ids,
  suggested_next_step: observed.next_step
};
function render(response = actualAnswer, options) {
  const dom = new JSDOM('<main></main>');
  const container = dom.window.document.querySelector('main');
  return { container, view: renderLoomAiResult(container, response, options) };
}

test('actual hosted heading-first answer exposes substantive capacity assessment before expansion', () => {
  const { container } = render();
  const lead = container.querySelector('.ai-result-lead');
  assert.match(lead.textContent, /Diligence Brief/);
  assert.match(lead.textContent, /1,080 GB active/);
  assert.match(lead.textContent, /unsupported extrapolation/);
  assert.equal(lead.querySelectorAll('h4').length, 2);
  assert.equal(lead.querySelectorAll('li').length, 3);
  assert.equal(lead.querySelector('details'), null);
  assert.equal(container.querySelector('.ai-result-full').open, false);
  assert.match(container.querySelector('.ai-result-full').textContent, /137,591.52/);
  assert.equal(container.querySelector('.ai-result-original pre').textContent, actualAnswer.answer);
});

test('actual nested cost lists retain supplier grouping, every source and every open question', () => {
  const { container, view } = render(actualAnswer, { documentNames: { offer: 'supplier-offer.txt' } });
  assert.ok(container.querySelectorAll('.ai-result-full li > ul').length >= 2);
  assert.ok(container.querySelectorAll('.ai-result-full strong').length >= 2);
  const unknowns = [...container.querySelectorAll('.ai-result-unknowns li')].map(node => node.textContent);
  assert.deepEqual(unknowns, actualAnswer.missing_information);
  const sources = container.querySelector('.ai-result-sources');
  assert.deepEqual([...sources.querySelectorAll('li code')].map(node => node.textContent), actualAnswer.used_document_ids);
  assert.match(sources.textContent, /supplier-offer.txt/);
  assert.equal(sources.open, false);view.setView(true);assert.equal(sources.open, true);
  assert.equal(container.querySelector('.ai-result-next p').textContent, actualAnswer.suggested_next_step);
});

test('hostile heading, list, inline and source markup remains inert, with the exact raw answer retained', () => {
  const answer = '# <img src=x onerror=attack()>\n\n**<script>attack()</script>** stays text.\n\n- [run](javascript:attack())\n  - `<svg onload=attack()>`\n\n<script>another()</script>';
  const response = { answer, missing_information: ['<iframe src=x>'], used_document_ids: ['<input>'], suggested_next_step: '<a onclick=attack()>next</a>' };
  const { container } = render(response, { documentNames: { '<input>': '<style>bad</style>' } });
  assert.equal(container.querySelector('img,script,svg,iframe,input,a,style'), null);
  assert.ok(container.querySelector('strong').textContent.includes('<script>'));
  assert.equal(container.querySelector('.ai-result-original pre').textContent, answer);
  assert.match(container.textContent, /javascript:attack/);
});

test('plain prose remains first, heading-only answers disclose their missing substance, and list numbering survives', () => {
  const plain = render({ ...actualAnswer, answer: 'A useful assessment.\n\nDetails follow.' });
  assert.equal(plain.container.querySelector('.ai-result-lead p').textContent, 'A useful assessment.');
  const headings = render({ ...actualAnswer, answer: '# Title\n\n## Section only' });
  assert.match(headings.container.querySelector('.ai-result-lead').textContent, /without a substantive assessment/);
  assert.equal(headings.container.querySelector('.ai-result-full'), null);
  const numbered = render({ ...actualAnswer, answer: '3. First observed step\n7. Second observed step\n\nFinal paragraph' });
  assert.deepEqual([...numbered.container.querySelectorAll('.ai-result-lead li')].map(li => li.value), [3, 7]);
  assert.equal(numbered.container.querySelector('ol').start, 3);
});
