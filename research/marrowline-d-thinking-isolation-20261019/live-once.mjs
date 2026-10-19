// TD613 · Screaming Grove / D-profile MEDIUM↔HIGH original-Google-SSE acquisition.
// Synthetic-only. One PR activation; two direct Gemini requests maximum; no retry or fallback.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { buildDThinkingContrast } from './d-thinking-contrast.mjs';
import { serializeGeminiRequest } from '../../server/khonapolit-quality.js';
import { geminiStreamGenerateContentUrl, geminiRequestHeaders } from '../../server/gemini-provider-transport.js';

export const STUDY_SCHEMA = 'td613.marrowline.d-thinking-original-sse/v1';
export const ACTIVATION_SUBJECT = 'research(marrowline): execute D thinking original SSE once';
export const ACTIVATION_BRANCH = 'research/marrowline-d-thinking-live-once-20261019';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const withinFive = n => n >= 0x334 && n <= 0x338;
const TIMEOUT_MS = 170000;
const MAX_FIRST_TOTAL_TOKENS = 20000;
const MAX_ORIGINAL_WIRE_BYTES = 5 * 1024 * 1024;

function witnessGeometry(text) {
  const marks = new Map();
  let current = null, stacked = 0, maxDepth = 0, marked = 0;
  let markedClusters = 0, nonPlanar = 0, planar = 0, codePoints = 0;
  const clusters = [];
  for (const char of text) {
    codePoints++;
    if (/\p{M}/u.test(char)) {
      const cp = char.codePointAt(0);
      if (current) {
        current.depth++;
        marked++;
        marks.set(cp, (marks.get(cp) || 0) + 1);
        if (withinFive(cp)) planar++; else nonPlanar++;
      }
    } else {
      current = { depth: 0 };
      clusters.push(current);
    }
  }
  for (const x of clusters) {
    if (x.depth > 0) markedClusters++;
    if (x.depth >= 2) stacked++;
    maxDepth = Math.max(maxDepth, x.depth);
  }
  return {
    codePoints, combiningMarks: marked, distinctMarks: marks.size,
    nonPlanarMarks: nonPlanar, fivePlanarMarks: planar,
    markedClusters, stackedClusters: stacked, maxDepth,
    markDistribution: Object.fromEntries([...marks.entries()].map(([p, n]) =>
      ['U+' + p.toString(16).toUpperCase().padStart(4, '0'), n]))
  };
}

function parseOriginalSse(bytes) {
  const source = bytes.toString('utf8');
  const chunks = source.split(/\r?\n\r?\n/);
  let text = '', events = 0, finish = null, version = null, usage = null;
  for (const block of chunks) {
    const data = block.split(/\r?\n/).filter(x => x.startsWith('data:'))
      .map(x => x.slice(5).trimStart()).join('\n');
    if (!data || data === '[DONE]') continue;
    const payload = JSON.parse(data);
    events++;
    version = payload.modelVersion ?? version;
    usage = payload.usageMetadata ?? usage;
    const first = payload.candidates?.[0];
    finish = first?.finishReason ?? finish;
    for (const part of first?.content?.parts || []) {
      if (typeof part.text === 'string' && part.thought !== true) text += part.text;
    }
  }
  return { text, events, finish, version, usage };
}

export function offlineRegistration() {
  const { medium, high, model } = buildDThinkingContrast();
  const a = serializeGeminiRequest(medium, model);
  const b = serializeGeminiRequest(high, model);
  const withoutThinking = request => {
    const { thinkingConfig, ...generationConfig } = request.generationConfig;
    return { ...request, generationConfig };
  };
  assert.deepEqual(withoutThinking(medium), withoutThinking(high));
  assert.equal(medium.generationConfig.thinkingConfig.thinkingLevel, 'medium');
  assert.equal(high.generationConfig.thinkingConfig.thinkingLevel, 'high');
  assert.equal(a.observation.contentsSha256, b.observation.contentsSha256);
  assert.equal(a.observation.systemInstructionSha256, b.observation.systemInstructionSha256);
  assert.notEqual(a.observation.generationConfigSha256, b.observation.generationConfigSha256);
  return {
    model, requests: [
      { label: 'D_CREATIVE_ORIGINAL_MEDIUM', wire: a },
      { label: 'D_CREATIVE_ORIGINAL_HIGH', wire: b }
    ],
    registration: {
      schema: STUDY_SCHEMA, model, maximumProviderCalls: 2,
      automaticRetries: 0, fallback: false, originalSseRequired: true,
      control: 'Frozen D creative system and content; only thinking level differs',
      conditions: [
        { label: 'D_CREATIVE_ORIGINAL_MEDIUM', thinking: 'medium', request: a.observation },
        { label: 'D_CREATIVE_ORIGINAL_HIGH', thinking: 'high', request: b.observation }
      ],
      interpretationCeiling: 'Task-specific Gemini 3.8 request-conditioned contrast; not a universal HIGH inability, causal attribution, or full Screaming Grove restoration.'
    }
  };
}

function requireActionsActivation() {
  assert.equal(process.env.TD613_D_THINKING_AUTHORIZE, 'D_TWO_CALLS_ONCE');
  assert.equal(process.env.GITHUB_EVENT_NAME, 'pull_request');
  assert.equal(process.env.GITHUB_HEAD_REF, ACTIVATION_BRANCH);
  assert.equal(process.env.GITHUB_RUN_ATTEMPT, '1');
  assert.match(process.env.GITHUB_RUN_ID || '', /^[1-9]\d*$/);
  assert.match(process.env.TD613_EXACT_HEAD || '', /^[a-f0-9]{40}$/);
  assert.equal(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    process.env.TD613_EXACT_HEAD);
  assert.equal(execFileSync('git', ['log', '-1', '--format=%s'], { encoding: 'utf8' }).trim(),
    ACTIVATION_SUBJECT);
}

export async function executeOneShot() {
  requireActionsActivation();
  const { model, requests, registration } = offlineRegistration();
  const output = process.env.TD613_D_THINKING_OUT;
  assert.ok(output && output.length > 1, 'PRIVATE_EVIDENCE_DIRECTORY_REQUIRED');
  const dir = resolve(output);
  await mkdir(dir, { recursive: true });
  const receipt = {
    ...registration,
    custody: {
      activationHead: process.env.TD613_EXACT_HEAD,
      githubRun: process.env.GITHUB_RUN_ID,
      githubAttempt: process.env.GITHUB_RUN_ATTEMPT,
      branch: ACTIVATION_BRANCH, event: 'pull_request'
    },
    startedAt: new Date().toISOString(), observations: [], state: 'HELD'
  };
  const save = () => writeFile(join(dir, 'manifest.json'), JSON.stringify(receipt, null, 2),
    { mode: 0o600 });
  await save();
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim().length < 8) {
    receipt.holdReason = 'GEMINI_CREDENTIAL_UNAVAILABLE';
    await save();
    return receipt;
  }
  // Auth header lives only inside this process. Do not include it in receipts.
  for (let i = 0; i < requests.length; i++) {
    const item = requests[i];
    const row = {
      label: item.label, thinking: i === 0 ? 'medium' : 'high',
      request: item.wire.observation, callAttempted: true
    };
    receipt.observations.push(row);
    await save();
    try {
      const response = await fetch(geminiStreamGenerateContentUrl(model), {
        method: 'POST', headers: geminiRequestHeaders(key),
        body: item.wire.body, signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      row.httpStatus = response.status;
      const raw = Buffer.from(await response.arrayBuffer());
      row.rawBytes = raw.length;
      if (raw.length > MAX_ORIGINAL_WIRE_BYTES) {
        row.holdReason = 'WIRE_SIZE_CEILING';
      } else if (response.status !== 200) {
        row.holdReason = 'PROVIDER_HTTP_NOT_200';
        row.errorBodySha256 = hash(raw);
      } else {
        await writeFile(join(dir, item.label + '.google-original.sse'), raw, { mode: 0o600 });
        const evidence = parseOriginalSse(raw);
        row.rawSseSha256 = hash(raw);
        row.originalTextSha256 = hash(evidence.text);
        row.events = evidence.events;
        row.servedModel = evidence.version;
        row.finishReason = evidence.finish;
        row.usage = evidence.usage;
        row.geometry = witnessGeometry(evidence.text);
        if (evidence.version !== model || evidence.finish !== 'STOP' || evidence.events < 1
          || !evidence.text.length) {
          row.holdReason = 'ORIGINAL_SSE_MODEL_FINISH_OR_CONTENT_INCOMPLETE';
        }
        if (i === 0 && (evidence.usage?.totalTokenCount ?? Infinity) > MAX_FIRST_TOTAL_TOKENS) {
          row.holdReason = 'FIRST_RETURN_TOKEN_CEILING';
        }
      }
    } catch (error) {
      row.holdReason = 'PROVIDER_TRANSPORT_OR_ORIGINAL_SSE_PARSE_FAILURE';
      row.errorClass = error?.name || 'UnknownError';
    }
    await save();
    // No retry/fallback; a failed MEDIUM cannot authorize a HIGH alone.
    if (row.holdReason) {
      receipt.holdReason = row.holdReason;
      break;
    }
  }
  if (receipt.observations.length === 2 && receipt.observations.every(x => !x.holdReason)) {
    receipt.state = 'OBSERVED_PAIR';
    receipt.claim = 'Two original-provider outputs observed; no causal, statistical, or artistic restoration claim';
  }
  receipt.finishedAt = new Date().toISOString();
  await save();
  return receipt;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.includes('--execute')) {
    if (!process.argv.includes('--ack-paid')) throw Error('ACKNOWLEDGE_TWO_PROVIDER_CALLS');
    executeOneShot().then(x => {
      console.log('D_THINKING_RESULT ' + JSON.stringify({
        schema: x.schema, state: x.state, custody: x.custody,
        observations: x.observations.map(y => ({
          label: y.label, thinking: y.thinking, httpStatus: y.httpStatus,
          servedModel: y.servedModel, finishReason: y.finishReason,
          rawSseSha256: y.rawSseSha256, originalTextSha256: y.originalTextSha256,
          usage: y.usage, geometry: y.geometry, holdReason: y.holdReason
        })), holdReason: x.holdReason || null
      }));
      if (x.state !== 'OBSERVED_PAIR') process.exitCode = 1;
    }).catch(err => {
      console.error('D_THINKING_ACTIONS_GATE_FAILURE ' + (err?.name || 'Error'));
      process.exitCode = 1;
    });
  } else {
    console.log(JSON.stringify(offlineRegistration().registration, null, 2));
  }
}
