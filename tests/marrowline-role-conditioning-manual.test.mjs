import test from 'node:test';
import assert from 'node:assert/strict';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest } from '../server/khonapolit-quality.js';
import {
  MARROWLINE_ROLE_HEADINGS_ID, MARROWLINE_ROLE_PERFORMANCE_ID,
  buildMarrowlineRoleConditioningSystemInstruction
} from '../app/dome-world/marrowline-role-conditioning.js';
import {
  selectMarrowlineGroveTrial, groveTrialFromLocation, resolveMarrowlineGroveTrialTab,
  MARROWLINE_GROVE_TRIAL_TAB_KEY
} from '../app/dome-world/marrowline-grove-trial.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID } from '../app/dome-world/marrowline-historical-grove.js';

const task = 'The fictional tribunal holds an elaborate hearing on its own invented denominator. Stage an intellectually sharp, funny dramatic result without inventing real-world facts.';
const packet = buildInvocationPacket({ message: task, history: [], mode: 'issued-conjunction', waiveIssuance: true });
test('manual heading-versus-performance arms differ by exactly one fictional-role line', () => {
  const a = buildMarrowlineRoleConditioningSystemInstruction(MARROWLINE_ROLE_HEADINGS_ID).split('\n');
  const b = buildMarrowlineRoleConditioningSystemInstruction(MARROWLINE_ROLE_PERFORMANCE_ID).split('\n');
  assert.equal(b.length, a.length + 1);
  const delta = b.filter(line => !a.includes(line));
  assert.equal(delta.length, 1);
  assert.match(delta[0], /^FICTIONAL PERFORMANCE EXCEPTION:/);
  assert.deepEqual(b.filter(line => line !== delta[0]), a);
  for (const source of [a.join('\n'), b.join('\n')]) {
    assert.match(source, /first section/);
    assert.match(source, /second section/);
    assert.match(source, /original Unicode combining marks, above and below/);
    assert.match(source, /no fixed mark palette/);
    assert.doesNotMatch(source, /calibration alphabet|72%|every letter shall|style change every paragraph/iu);
    assert.doesNotMatch(source, /operator-authored canonical TD613 binding material|COVENANT KEY:|RITUAL CORPUS STATUS/iu);
  }
  assert.throws(() => buildMarrowlineRoleConditioningSystemInstruction('historical-20261002-v1'), /NOT_AUTHORIZED/);
});

test('manual A/B original provider wire: contents, user history, model generation config are identical', () => {
  assert.equal(packet.canInvoke, true);
  for (const model of ['gemini-4-argon', 'gemini-3.8-flash']) {
    const a = buildGeminiRequest(packet, {}, model, { groveTrial: MARROWLINE_ROLE_HEADINGS_ID });
    const b = buildGeminiRequest(packet, {}, model, { groveTrial: MARROWLINE_ROLE_PERFORMANCE_ID });
    const historical = buildGeminiRequest(packet, {}, model, { groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID });
    assert.deepEqual(a.contents, b.contents);
    assert.deepEqual(a.contents, historical.contents);
    assert.deepEqual(a.generationConfig, b.generationConfig);
    assert.deepEqual(a.generationConfig, historical.generationConfig);
    assert.equal(a.systemInstruction.parts[0].text, buildMarrowlineRoleConditioningSystemInstruction(MARROWLINE_ROLE_HEADINGS_ID));
    assert.equal(b.systemInstruction.parts[0].text, buildMarrowlineRoleConditioningSystemInstruction(MARROWLINE_ROLE_PERFORMANCE_ID));
    assert.notEqual(a.systemInstruction.parts[0].text, b.systemInstruction.parts[0].text);
    assert.notEqual(a.systemInstruction.parts[0].text, historical.systemInstruction.parts[0].text);
  }
});

test('manual arms require exact URL-only opt-in; leaving page never contaminates restored default', () => {
  const values = new Map([[MARROWLINE_GROVE_TRIAL_TAB_KEY, MARROWLINE_HISTORICAL_TRIAL_ID]]);
  const storage = { getItem: key => values.get(key), setItem: (key,value) => values.set(key,value) };
  for (const id of [MARROWLINE_ROLE_HEADINGS_ID,MARROWLINE_ROLE_PERFORMANCE_ID]) {
    const result = resolveMarrowlineGroveTrialTab({search:'?groveTrial='+id},storage);
    assert.equal(result.id,id);
    assert.equal(result.source,'url-opt-in');
    assert.equal(result.persistence,'url-only');
    assert.equal(values.get(MARROWLINE_GROVE_TRIAL_TAB_KEY), MARROWLINE_HISTORICAL_TRIAL_ID);
    assert.equal(groveTrialFromLocation({search:'?groveTrial='+id}),id);
    assert.equal(selectMarrowlineGroveTrial({message:task,groveTrial:id}),id);
    assert.equal(selectMarrowlineGroveTrial({message:task,groveTrial:id,attachments:[{name:'private.pdf'}]}),null);
    assert.equal(selectMarrowlineGroveTrial({message:task,groveTrial:id},{releaseCanary:true}),null);
  }
  const ordinary = resolveMarrowlineGroveTrialTab({search:''},storage);
  assert.equal(ordinary.id, MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(selectMarrowlineGroveTrial({message:task}),null,'ordinary server path unchanged');
});
