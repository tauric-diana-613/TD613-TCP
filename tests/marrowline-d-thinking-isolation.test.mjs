import test from 'node:test';
import assert from 'node:assert/strict';
import {
  D_THINKING_CONTRAST_SCHEMA,
  buildDThinkingContrast,
  describeRestoredVersusD,
  dThinkingManifest
} from '../research/marrowline-d-thinking-isolation-20261019/d-thinking-contrast.mjs';

test('October 15 successful D control is reproduced byte-exactly for both 3.8 thinking variants', () => {
  const { medium, high, model } = buildDThinkingContrast();
  assert.equal(model, 'gemini-3.8-flash');
  assert.deepEqual(medium.systemInstruction, high.systemInstruction);
  assert.deepEqual(medium.contents, high.contents);
  assert.equal(medium.contents.length, 1);
  assert.equal(medium.contents[0].role, 'user');
  assert.deepEqual(medium.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(high.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  const changedFields = Object.keys(medium.generationConfig).filter(
    key => JSON.stringify(medium.generationConfig[key]) !== JSON.stringify(high.generationConfig[key])
  );
  assert.deepEqual(changedFields, ['thinkingConfig']);
  assert.equal(medium.generationConfig.maxOutputTokens, high.generationConfig.maxOutputTokens);
  assert.equal(Object.hasOwn(medium.generationConfig, 'temperature'), false);
  assert.equal(Object.hasOwn(high.generationConfig, 'temperature'), false);
  assert.equal(Object.hasOwn(medium.generationConfig, 'responseMimeType'), false);
  assert.equal(Object.hasOwn(high.generationConfig, 'responseMimeType'), false);
});

test('restored Grove is not byte-comparable to neutral D even when the user submits D words', () => {
  const observation = describeRestoredVersusD();
  assert.equal(observation.sameModel, true);
  assert.equal(observation.sameUserContents, false);
  assert.equal(observation.sameSystemFrame, false);
  assert.equal(observation.sameGenerationConfigAsDMedium, false);
  assert.equal(observation.sameGenerationConfigAsDHigh, true);
  assert.deepEqual(observation.restoredThinking, { thinkingLevel: 'high' });
  assert.deepEqual(observation.DThinking, { thinkingLevel: 'medium' });
});

test('D thinking study is offline only and reports no provider-output restoration', () => {
  const packet = dThinkingManifest();
  assert.equal(packet.schema, D_THINKING_CONTRAST_SCHEMA);
  assert.equal(packet.status, 'OFFLINE_INPUT_ISOLATION_ONLY');
  assert.equal(packet.noProviderRequests, true);
  assert.equal(packet.sourceContentsIdentical, true);
  assert.equal(packet.sourceSystemIdentical, true);
  assert.notEqual(packet.A.generationSha256, packet.B.generationSha256);
  assert.equal(packet.A.systemSha256, packet.B.systemSha256);
  assert.equal(packet.A.contentsSha256, packet.B.contentsSha256);
});
