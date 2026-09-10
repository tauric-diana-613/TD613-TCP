import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';

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
