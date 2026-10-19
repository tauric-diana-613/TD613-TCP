import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  D_THINKING_CONTRAST_SCHEMA,
  buildDThinkingContrast,
  describeRestoredVersusD,
  dThinkingManifest
} from '../research/marrowline-d-thinking-isolation-20261019/d-thinking-contrast.mjs';


const gitBlobSha1 = relativePath => {
  const bytes = readFileSync(new URL(relativePath, import.meta.url));
  return createHash('sha1').update(Buffer.concat([
    Buffer.from(`blob ${bytes.length}`), Buffer.from([0]), bytes
  ])).digest('hex');
};

test('immutable October 15 source blobs anchor D assay content and thinking-profile policy', () => {
  // Blob identities observed independently from commit
  // 844ad2b295a5df7c42f1455ff2107793ff3ed4da, the successful D acquisition head.
  // This protects historical source integrity, not today's actual Google wire output.
  assert.equal(gitBlobSha1('../server/marrowline-unicode-capability-assay.js'),
    'f88ea0c84b5f2e425ef9e9088dd488805854390a');
  assert.equal(gitBlobSha1('../server/gemini-generation-envelope.js'),
    '8029e3c80feb6d5dd71a5b5be8bb23057aadcaec');
});

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

test('actual wrapped Marrowline text entrypoint differs from D in frame but agrees on MEDIUM thinking', () => {
  const observation = describeRestoredVersusD();
  assert.equal(observation.sameModel, true);
  assert.equal(observation.sameUserContents, false);
  assert.equal(observation.sameSystemFrame, false);
  assert.equal(observation.sameGenerationConfigAsDMedium, true);
  assert.equal(observation.sameGenerationConfigAsDHigh, false);
  assert.equal(observation.actualEntrypointProfile, 'khonapolit-interactive');
  assert.equal(observation.unprofiledHighIsProduction, false);
  assert.deepEqual(observation.restoredThinking, { thinkingLevel: 'medium' });
  assert.deepEqual(observation.DThinking, { thinkingLevel: 'medium' });
});

test('HTTP entrypoint actually installs the interactive profile for ordinary text requests', () => {
  const entry = readFileSync(new URL('../api/khonapolit.js', import.meta.url), 'utf8');
  const envelope = readFileSync(new URL('../server/gemini-generation-envelope.js', import.meta.url), 'utf8');
  assert.match(entry, /return withGeminiGenerationProfile\(\s*GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,/);
  assert.match(envelope, /id === 'gemini-3\.8-flash'\) requestedLevel = 'medium'/);
});

test('D thinking study is offline only and reports no provider-output restoration', () => {
  const packet = dThinkingManifest();
  assert.equal(packet.schema, D_THINKING_CONTRAST_SCHEMA);
  assert.equal(packet.status, 'OFFLINE_INPUT_ISOLATION_ONLY');
  assert.equal(packet.noProviderRequests, true);
  assert.equal(packet.sourceContentsIdentical, true);
  assert.equal(packet.restoredVersusD.sameGenerationConfigAsDMedium, true);
  assert.equal(packet.restoredVersusD.unprofiledHighIsProduction, false);
  assert.equal(packet.sourceSystemIdentical, true);
  assert.notEqual(packet.A.generationSha256, packet.B.generationSha256);
  assert.equal(packet.A.systemSha256, packet.B.systemSha256);
  assert.equal(packet.A.contentsSha256, packet.B.contentsSha256);
});
