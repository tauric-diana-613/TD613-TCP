import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { buildGeminiRequest, observeGeminiOutput, KHONAPOLIT_MAX_OUTPUT_TOKENS } from '../server/khonapolit-quality.js';
import {
  buildLoomTaskProviderRequest,
  LOOM_TASK_FRONTIER_OUTPUT_TOKEN_BUDGET,
  LOOM_TASK_FRONTIER_THINKING_LEVEL,
  LOOM_TASK_OUTPUT_TOKEN_BUDGET
} from '../server/loom-task.js';
import { resolveGeminiModelPlan } from '../server/gemini-model-policy.js';

const packet = {
  systemInstruction: 'Synthetic covenant test instruction.',
  history: [],
  message: 'Analyze a sufficiently complicated task without artificial compression.',
  mode: 'full-invocation'
};
const frontierMarrowline = buildGeminiRequest(packet, {}, 'gemini-3.8-flash');
assert.equal(frontierMarrowline.generationConfig.maxOutputTokens, KHONAPOLIT_MAX_OUTPUT_TOKENS);
assert.equal(frontierMarrowline.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(frontierMarrowline.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
assert.deepEqual(observeGeminiOutput({}, 'gemini-3.8-flash'), {
  finishReason: null,
  outputTokenLimitReached: false,
  maxOutputTokens: 65536,
  thinkingLevel: 'high',
  usage: {}
});
const syntheticMarrowline = buildGeminiRequest(packet, {}, 'synthetic-model');
assert.equal(syntheticMarrowline.generationConfig.maxOutputTokens, 4096);
assert.equal(Object.hasOwn(syntheticMarrowline.generationConfig, 'thinkingConfig'), false);

const loomInput = {
  schema: 'td613.loom.ai-task/v0.1',
  request_id: 'frontier-envelope',
  task: 'Compare the packet deeply and preserve the full reasoning surface.',
  documents: [{ id: 'packet', name: 'Packet', text: 'A sufficiently complicated admitted document.' }],
  rules: ['Do not invent withheld facts.']
};
const frontierLoom = buildLoomTaskProviderRequest(loomInput, 'gemini-3.8-flash');
assert.equal(frontierLoom.generationConfig.maxOutputTokens, LOOM_TASK_FRONTIER_OUTPUT_TOKEN_BUDGET);
assert.equal(frontierLoom.generationConfig.maxOutputTokens, 65536);
assert.deepEqual(frontierLoom.generationConfig.thinkingConfig, { thinkingLevel: LOOM_TASK_FRONTIER_THINKING_LEVEL });
const syntheticLoom = buildLoomTaskProviderRequest(loomInput, 'synthetic-model');
assert.equal(syntheticLoom.generationConfig.maxOutputTokens, LOOM_TASK_OUTPUT_TOKEN_BUDGET);
assert.equal(syntheticLoom.generationConfig.maxOutputTokens, 16384);
assert.equal(Object.hasOwn(syntheticLoom.generationConfig, 'thinkingConfig'), false);

const at = 1000000;
const providerListing = {
  ok: true,
  complete: true,
  observedAt: at - 1000,
  expiresAt: at + 599000,
  models: ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite']
};
const plan = resolveGeminiModelPlan({ task: 'khonapolit-dialogue', env: {}, at, providerListing });
assert.equal(plan.callableModels[0], 'gemini-3.8-flash');
assert.deepEqual(plan.callableModels.slice(0, 6), ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash']);
assert.ok(!plan.callableModels.some(model => /flash-lite/.test(model)));

const livingChat = await fs.readFile(new URL('../app/dome-world/marrowline-living-chat.js', import.meta.url), 'utf8');
assert.match(livingChat, /family=Reddit\+Sans/);
assert.match(livingChat, /--marrowline-chat-sans:\"Reddit Sans\"/);
assert.match(livingChat, /SF Pro Text/);
assert.match(livingChat, /Noto Sans/);
assert.match(livingChat, /relay-bots\[data-intensity=\\"5\\"\][\s\S]*line-height:4!important/);
assert.match(livingChat, /\.zalgo-line\{display:block!important/);

console.log('marrowline-loom-frontier-envelope: frontier routing, 64K output, high thinking, and Zalgo-safe type guard ok');
