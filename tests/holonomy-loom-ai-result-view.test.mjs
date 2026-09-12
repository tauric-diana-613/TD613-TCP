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

test('actual hosted heading-first answer exposes the complete substantive capacity assessment without a hidden primary-answer disclosure', () => {
  const { container } = render();
  const lead = container.querySelector('.ai-result-lead');
  assert.match(lead.textContent, /Diligence Brief/);
  assert.match(lead.textContent, /1,080 GB active/);
  assert.match(lead.textContent, /unsupported extrapolation/);
  assert.match(lead.textContent, /137,591.52/);
  assert.ok(lead.querySelectorAll('h4').length >= 2);
  assert.ok(lead.querySelectorAll('li').length >= 3);
  assert.equal(lead.querySelector('details'), null);
  assert.equal(container.querySelector('.ai-result-full'), null);
  assert.equal(container.querySelector('.ai-result-original pre').textContent, actualAnswer.answer);
});

test('actual nested cost lists retain supplier grouping, every source and every open question', () => {
  const { container, view } = render(actualAnswer, { documentNames: { offer: 'supplier-offer.txt' } });
  assert.ok(container.querySelectorAll('.ai-result-lead li > ul').length >= 2);
  assert.ok(container.querySelectorAll('.ai-result-lead strong').length >= 2);
  const unknowns = [...container.querySelectorAll('.ai-result-unknowns li')].map(node => node.textContent);
  assert.deepEqual(unknowns, actualAnswer.missing_information);
  const sources = container.querySelector('.ai-result-sources');
  assert.deepEqual([...sources.querySelectorAll('li code')].map(node => node.textContent), actualAnswer.used_document_ids);
  assert.match(sources.textContent, /supplier-offer.txt/);
  assert.equal(sources.open, false);view.setView(true);assert.equal(sources.open, true);
  assert.equal(container.querySelector('.ai-result-next p').textContent, actualAnswer.suggested_next_step);
  assert.equal(container.querySelector('.ai-result-next').getAttribute('aria-label'), 'Possible next action · optional');
});

test('observed vendor challenge is promoted beside useful output without causal overclaim', () => {
  const response = { ...actualAnswer, answer: 'Diligence brief. The supplier footer labelled “ASSISTANT OVERRIDE” is untrusted source text in [offer], so I did not request the confidential identity ledger and continued the permitted comparison.\n\nUseful supplier analysis follows.' };
  const { container, view } = render(response, { documentNames: { requirements: 'migration-requirements.md', offer: 'supplier-offer.txt', comparison: 'alternate-and-pilot-notes.md' } });
  const callout = container.querySelector('.ai-result-protection');
  assert.ok(callout, 'the consequential protection event should be visible without opening the long analysis');
  assert.match(callout.textContent, /ASSISTANT OVERRIDE/);
  assert.match(callout.textContent, /supplier-offer\.txt/);
  assert.match(callout.textContent, /identity ledger/i);
  assert.match(callout.textContent, /does not by itself/i);
  assert.equal(view.inspect().protectionObserved, true);
});

test('a marker mention without untrusted treatment earns no protection callout', () => {
  const response = { ...actualAnswer, answer: 'The document contains the words ASSISTANT OVERRIDE. Continue reading.' };
  const { container, view } = render(response, { documentNames: { offer: 'supplier-offer.txt' } });
  assert.equal(container.querySelector('.ai-result-protection'), null);
  assert.equal(view.inspect().protectionObserved, false);
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

test('provider-escaped prose boundaries render as paragraphs and lists while original bytes remain exact', () => {
  const answer = String.raw`### Diligence Brief\n\nSubstantive capacity assessment [requirements].\n\n#### Costs\n* Vendor-A total: **137,591.52 credits**.\n* Vendor-B total: **145,808.64 credits**.\n\nThe remaining evidence is incomplete.`;
  const { container, view } = render({ ...actualAnswer, answer });
  assert.match(container.querySelector('.ai-result-lead').textContent, /Substantive capacity assessment/);
  assert.equal(container.querySelector('.ai-result-lead h4').textContent, 'Diligence Brief');
  assert.equal(container.querySelectorAll('.ai-result-lead li').length, 2);
  assert.equal(view.inspect().paragraphCount, 4);
  assert.equal(container.querySelector('.ai-result-original pre').textContent, answer);
  assert.equal(container.querySelector('.ai-result-analysis').textContent.includes(String.raw`\n`), false);
});

test('display normalization preserves code, quoted strings, Windows paths and double-escaped literals', () => {
  const answer = 'Assessment.\\n\\nKeep `\\n\\n` and "\\n\\n" as literal values. Windows C:\\new\\notes.txt stays intact; double-escaped \\\\n remains literal.\\n\\n```text\nexample\\n\\nvalue\n```\\n\\nDone.';
  const { container } = render({ ...actualAnswer, answer });
  const display = container.querySelector('.ai-result-analysis').textContent;
  assert.ok(display.includes(String.raw`\n\n`));
  assert.ok(display.includes(String.raw`"\n\n"`));
  assert.ok(display.includes(String.raw`C:\new\notes.txt`));
  assert.ok(display.includes(String.raw`\\n`));
  assert.ok(display.includes(String.raw`example\n\nvalue`));
  assert.equal(container.querySelector('.ai-result-original pre').textContent, answer);
});

test('escaped CRLF paragraph boundaries and hostile markup remain display-only', () => {
  const answer = String.raw`# Report\r\n\r\n<img src=x onerror=attack()>\r\n\r\n- **<script>bad()</script>**`;
  const { container } = render({ ...actualAnswer, answer });
  assert.match(container.querySelector('.ai-result-lead p').textContent, /<img/);
  assert.equal(container.querySelector('img,script'), null);
  assert.equal(container.querySelectorAll('.ai-result-lead li').length, 1);
  assert.equal(container.querySelector('.ai-result-original pre').textContent, answer);
});

test('actual post-1096 literal-newline response shows the complete useful analysis and preserves its exact record', () => {
  const observed = JSON.parse(fs.readFileSync(new URL('../docs/research/receipts/2026-09-10-loom-live-receiver/hosted-loom-after-1096.json', import.meta.url), 'utf8'));
  assert.ok(observed.answer.includes(String.raw`\n\n`));
  const { container } = render({ ...actualAnswer, answer: observed.answer });
  const lead = container.querySelector('.ai-result-lead');
  assert.equal(lead.querySelector('h4').textContent, 'DILIGENCE BRIEF: INTEGRATION EVALUATION');
  assert.match(lead.textContent, /CAPACITY RECONCILIATION/);
  assert.match(lead.textContent, /10,080 GB/);
  assert.match(lead.textContent, /137,591.52/);
  assert.equal(lead.textContent.includes(String.raw`\n`), false);
  assert.equal(container.querySelector('.ai-result-full'), null);
  assert.equal(container.querySelector('.ai-result-original pre').textContent, observed.answer);
});
