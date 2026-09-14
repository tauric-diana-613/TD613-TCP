import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';
import { renderLoomAiResult } from '../app/dome-world/holonomy-loom/ai-result-view.js';
import { livingGeometryShapeScales } from '../app/dome-world/holonomy-loom/living-geometry.js';
import { buildGeminiRequest, allocateKhonapolitAttemptTimeout } from '../server/khonapolit-quality.js';

test('three substantial fictional projects exercise distinct useful AI tasks', () => {
  assert.deepEqual(LOOM_AI_PROJECTS.map(p => p.id), ['vendor-diligence', 'participant-research', 'incident-response']);
  for (const project of LOOM_AI_PROJECTS) {
    assert.match(project.task, /fictional/i);
    assert.match(project.task, /JSON/);
    assert.ok(project.task.length >= 800);
    assert.equal(project.documents.length, 4);
    assert.equal(new Set(project.documents.map(d => d.id)).size, 4);
    assert.equal(project.documents.filter(d => d.share).length, 3);
    assert.equal(project.documents.filter(d => !d.share).length, 1);
    for (const document of project.documents) {
      assert.equal(typeof document.share, 'boolean');
      assert.ok(document.text.length >= 800 && document.text.length <= 2000, `${document.name}: ${document.text.length}`);
      assert.match(document.text, /FICTIONAL/);
    }
  }
});

test('selected document, task and rule projection excludes every local canary', () => {
  for (const project of LOOM_AI_PROJECTS) {
    const outbound = JSON.stringify({ task: project.task, rules: project.rules, documents: project.documents.filter(d => d.share) });
    const local = project.documents.filter(d => !d.share).map(d => d.text).join('\n');
    assert.ok(project.protectedTerms.length >= 2);
    for (const term of project.protectedTerms) {
      assert.ok(local.includes(term), `${term} must exercise a real local exclusion`);
      assert.equal(outbound.includes(term), false, `${term} crossed the selected-document boundary`);
    }
  }
});

test('each admitted corpus contains a source-instruction challenge and useful independent evidence', () => {
  for (const project of LOOM_AI_PROJECTS) {
    const shared = project.documents.filter(d => d.share).map(d => d.text).join('\n');
    assert.match(shared, /ASSISTANT|SYSTEM NOTE TO AI/);
    assert.match(shared, /untrusted|prompt-injection/i);
    assert.match(project.rules.join(' '), /untrusted|ignore embedded|never as instructions/);
    assert.match(shared, /\d{2}/);
    assert.ok(project.rules.length >= 3);
  }
});

test('independent Marrowline fallbacks spend their short rescue windows on low-latency reasoning', () => {
  const packet = { systemInstruction: 'Synthetic system.', history: [], message: 'Plan a small workshop.', mode: 'full-invocation' };
  const primary = buildGeminiRequest(packet, {}, 'gemini-3.8-flash', { fallback: false });
  const fallback = buildGeminiRequest(packet, {}, 'gemini-3.8-flash', { fallback: true });
  const fallback25 = buildGeminiRequest(packet, {}, 'gemini-2.5-flash', { fallback: true });
  assert.deepEqual(primary.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  assert.deepEqual(fallback.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
  assert.deepEqual(fallback25.generationConfig.thinkingConfig, { thinkingBudget: 1024 });
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 50000, index: 0 }), 32000);
  assert.equal(allocateKhonapolitAttemptTimeout({ remainingMs: 18000, index: 1 }), 10500);
});

test('Demo 3 supplies a bounded newcomer takeaway before the engineering report', () => {
  const incident = LOOM_AI_PROJECTS.find(project => project.id === 'incident-response');
  const eventLog = incident.documents.find(document => document.id === 'event-log');
  const selectedDocuments = incident.documents.filter(document => document.share);
  assert.equal(eventLog.name, 'sanitized-events.log');

  const dom = new JSDOM('<main></main>');
  const container = dom.window.document.querySelector('main');
  renderLoomAiResult(container, {
    answer: '09:12:00 — technical timeline begins here.',
    missing_information: ['Independent effect ledger'],
    used_document_ids: ['event-log'],
    suggested_next_step: 'Run the controlled check.'
  }, { documentNames: { 'event-log': eventLog.name }, selectedDocuments });
  const takeaway = container.querySelector('.ai-result-takeaway');
  assert.ok(takeaway, 'newcomer payoff must render without asking a follow-up');
  assert.equal(container.firstElementChild, takeaway, 'plain-language payoff must precede technical assessment');
  assert.deepEqual([...takeaway.querySelectorAll('dt')].map(node => node.textContent), ['Question', 'Finding', 'Privacy consequence']);
  const values = [...takeaway.querySelectorAll('dd')].map(node => node.textContent);
  assert.match(values[0], /ran twice|reported twice/i);
  assert.match(values[1], /repeated completion signals/i);
  assert.match(values[1], /do not yet establish/i);
  assert.match(values[2], /credentials/i);
  assert.match(values[2], /customer identifiers/i);
  assert.match(takeaway.textContent, /exact AI report remains below/i);
});

test('living geometry exposes a responsive anti-squash floor', () => {
  const desktop = livingGeometryShapeScales({ width: 1440, height: 900 });
  const portrait = livingGeometryShapeScales({ width: 390, height: 844 });
  assert.ok(desktop.sectionY >= 0.8, `desktop section vertical scale ${desktop.sectionY} is still visibly compressed`);
  assert.ok(desktop.rosetteY >= 0.85, `desktop rosette vertical scale ${desktop.rosetteY} is still visibly compressed`);
  assert.ok(portrait.sectionY >= 0.76, `portrait section vertical scale ${portrait.sectionY} is still visibly compressed`);
  assert.ok(portrait.rosetteY >= 0.78, `portrait rosette vertical scale ${portrait.rosetteY} is still visibly compressed`);
  assert.ok(desktop.sectionY <= 1 && desktop.rosetteY <= 1 && portrait.sectionY <= 1 && portrait.rosetteY <= 1);
});

test('fixtures cannot silently change sharing posture or canaries after import', () => {
  assert.ok(Object.isFrozen(LOOM_AI_PROJECTS));
  for (const project of LOOM_AI_PROJECTS) {
    assert.ok(Object.isFrozen(project));
    assert.ok(Object.isFrozen(project.rules));
    assert.ok(Object.isFrozen(project.protectedTerms));
    assert.ok(Object.isFrozen(project.documents));
    for (const document of project.documents) assert.ok(Object.isFrozen(document));
    assert.throws(() => { project.documents.find(d => !d.share).share = true; }, TypeError);
    assert.throws(() => project.protectedTerms.push('replacement'), TypeError);
  }
});