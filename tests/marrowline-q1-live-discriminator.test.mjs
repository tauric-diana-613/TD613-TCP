import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

import {
  assertQ1RequestEquivalence,
  buildPreflightReport,
  buildSlotRequest,
  executeQ1Run,
  EXPECTED_GENERATION_CONFIG_SHA256,
  EXPECTED_MAX_OUTPUT_TOKENS,
  EXPECTED_THINKING_LEVEL,
  HARD_MAX_CALLS,
  isExpectedPinnedModelVersion,
  OUTCOME_CLASSES,
  parseSseIndependently,
  PINNED_MODEL,
  Q1_SCHEDULE,
  verifySseIntegrity
} from '../research/marrowline-screaming-grove-q1-20261121/run-q1-live-discriminator.mjs';

const FAKE_HEAD = 'a'.repeat(40);
const STALE_PREDECESSOR_HEAD = '67339318d5a430541a572c19833817271d69c5f3';

function makeTempRunDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `td613-q1-${prefix}-`));
}

function makeSsePayload(events) {
  return events.map((ev) => `data: ${typeof ev === 'string' ? ev : JSON.stringify(ev)}\n\n`).join('');
}

function makeValidGeminiSse({
  modelVersion = PINNED_MODEL,
  textChunks = ['Kʰonapolit\n\nBlue-orange weather holds Khona\u200Clit-po.\n\n', 'Tauric Diana bots\n\nS\u0301\u0323\u0308c\u0307\u0329r\u0302\u0336eam ⟐'],
  thoughtChunks = ['internal planning thought should never enter visible text'],
  finishReason = 'STOP',
  finishMessage = undefined,
  promptFeedback = undefined,
  usageMetadata = { promptTokenCount: 10000, candidatesTokenCount: 1200, thoughtsTokenCount: 400, totalTokenCount: 11600 }
} = {}) {
  const events = [];
  for (const t of thoughtChunks) {
    const ev = { candidates: [{ content: { role: 'model', parts: [{ text: t, thought: true }] } }] };
    if (modelVersion) ev.modelVersion = modelVersion;
    events.push(ev);
  }
  textChunks.forEach((chunk, idx) => {
    const isLast = idx === textChunks.length - 1;
    const cand = { content: { role: 'model', parts: [{ text: chunk }] } };
    if (isLast && finishReason) cand.finishReason = finishReason;
    if (isLast && finishMessage) cand.finishMessage = finishMessage;
    const ev = { candidates: [cand] };
    if (modelVersion) ev.modelVersion = modelVersion;
    if (isLast && promptFeedback) ev.promptFeedback = promptFeedback;
    if (isLast && usageMetadata) ev.usageMetadata = usageMetadata;
    events.push(ev);
  });
  return makeSsePayload(events);
}

function makeResponse(body, { status = 200, headers = { 'content-type': 'text/event-stream; charset=utf-8' } } = {}) {
  return new Response(body, { status, headers });
}

test('Q1 exact model, generationConfig, Aperture, and Arm A/C request equivalence verified & drift halts before any provider call', async () => {
  const preflight = buildPreflightReport({ headSha: FAKE_HEAD });
  assert.equal(preflight.paid_provider_calls_executed, 0);
  assert.equal(preflight.request_equivalence_verified.ok, true);
  assert.equal(preflight.slot_schedule.length, 8);
  assert.equal(preflight.financial_and_token_policy.dollar_spending_ceiling, 'NONE_PER_OPERATOR_REVIEW_6007792790');
  assert.equal(preflight.financial_and_token_policy.aggregate_token_budget_ceiling, 'NONE_PER_OPERATOR_REVIEW_6007792790');
  assert.equal(preflight.financial_and_token_policy.per_call_max_output_tokens, EXPECTED_MAX_OUTPUT_TOKENS);

  const assembled = Q1_SCHEDULE.map(buildSlotRequest);
  for (const item of assembled) {
    assert.equal(item.wire.observation.model, PINNED_MODEL);
    assert.equal(item.request.generationConfig.maxOutputTokens, EXPECTED_MAX_OUTPUT_TOKENS);
    assert.equal(item.request.generationConfig.thinkingConfig.thinkingLevel, EXPECTED_THINKING_LEVEL);
    assert.equal(item.request.generationConfig.thinkingConfig.thinkingBudget, undefined);
    assert.equal(item.wire.observation.generationConfigSha256, EXPECTED_GENERATION_CONFIG_SHA256);
  }

  // Inject subtle generationConfig drift and confirm fail-closed halt with 0 provider calls
  const runDir = makeTempRunDir('drift');
  let fetchCount = 0;
  try {
    const receipt = await executeQ1Run({
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-synthetic-key',
      runDir,
      fetchImpl: async () => { fetchCount++; return makeResponse(makeValidGeminiSse()); },
      slotBuilder: (spec) => {
        const built = buildSlotRequest(spec);
        if (spec.slot === 'S01') {
          built.request = {
            ...built.request,
            generationConfig: { maxOutputTokens: 32768, thinkingConfig: { thinkingLevel: 'high' } }
          };
        }
        return built;
      }
    });
    assert.equal(fetchCount, 0);
    assert.equal(receipt.calls_executed, 0);
    assert.equal(receipt.stop_triggered, 'STOP_1_GENERATION_CONFIG_OR_REQUEST_DRIFT');
    assert.equal(receipt.status, 'HALTED_BEFORE_ACQUISITION');
    assert.ok(fs.existsSync(path.join(runDir, 'Q1_LIVE_ACQUISITION_RECEIPT.json')));
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('Q1 exact-HEAD CLI authorization guard refuses stale predecessor SHA 67339318d and malformed args with zero calls', async () => {
  const runDir = makeTempRunDir('auth');
  let fetchCount = 0;
  try {
    await assert.rejects(
      () => executeQ1Run({
        sourceHeadSha: FAKE_HEAD,
        operatorAuthSha: STALE_PREDECESSOR_HEAD,
        apiKey: 'test-synthetic-key',
        runDir,
        fetchImpl: async () => { fetchCount++; return makeResponse(makeValidGeminiSse()); }
      }),
      (err) => err.code === 'REFUSED_LIVE_EXECUTION'
    );
    await assert.rejects(
      () => executeQ1Run({
        sourceHeadSha: FAKE_HEAD,
        operatorAuthSha: FAKE_HEAD,
        apiKey: 'test-synthetic-key',
        maxCalls: 9,
        runDir,
        fetchImpl: async () => { fetchCount++; return makeResponse(makeValidGeminiSse()); }
      }),
      (err) => err.code === 'REFUSED_LIVE_EXECUTION'
    );
    assert.equal(fetchCount, 0);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('Negative control: malformed SSE (bad JSON, invalid UTF-8, stray garbage, empty body, inline stream error) detected and raw SSE preserved with STOP_4', async () => {
  const cases = [
    { name: 'truncated_json', body: Buffer.from('data: {"modelVersion":"gemini-3.8-flash","candidates":[{"content":{"parts":[{"text":"partial"}', 'utf8') },
    { name: 'invalid_utf8', body: Buffer.from([0x64, 0x61, 0x74, 0x61, 0x3a, 0x20, 0xff, 0xfe, 0x0a, 0x0a]) },
    { name: 'stray_garbage_line', body: Buffer.from('NOT_A_VALID_SSE_FIELD_LINE\n\n' + makeValidGeminiSse(), 'utf8') },
    { name: 'empty_200_body', body: Buffer.from('', 'utf8') },
    { name: 'inline_error_object', body: Buffer.from('data: {"error":{"code":500,"status":"INTERNAL","message":"boom"}}\n\n', 'utf8') }
  ];

  for (const tc of cases) {
    const runDir = makeTempRunDir(`malformed-${tc.name}`);
    let fetchCount = 0;
    try {
      const receipt = await executeQ1Run({
        sourceHeadSha: FAKE_HEAD,
        operatorAuthSha: FAKE_HEAD,
        apiKey: 'test-synthetic-key',
        runDir,
        fetchImpl: async () => {
          fetchCount++;
          return makeResponse(tc.body, { status: 200 });
        }
      });
      assert.equal(fetchCount, 1, `${tc.name}: must halt immediately with zero retries`);
      assert.equal(receipt.calls_executed, 1);
      assert.equal(receipt.stop_triggered, 'STOP_4_MALFORMED_SSE', `${tc.name}: expected STOP_4_MALFORMED_SSE`);
      assert.equal(receipt.results.length, 1);
      assert.equal(receipt.results[0].outcomeClass, OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE);
      assert.equal(receipt.results[0].eligibleArtisticSpecimen, false);
      assert.equal(receipt.results[0].sseIntegrity.ok, false);
      // Verify raw SSE bytes preserved verbatim on disk
      const savedRaw = fs.readFileSync(path.join(runDir, receipt.results[0].rawSsePath));
      assert.equal(Buffer.compare(savedRaw, tc.body), 0, `${tc.name}: raw SSE bytes must match verbatim`);
      assert.ok(fs.existsSync(path.join(runDir, 'Q1_LIVE_ACQUISITION_RECEIPT.json')));
    } finally {
      fs.rmSync(runDir, { recursive: true, force: true });
    }
  }
});

test('Negative control: canonical vs independent SSE text reconstruction mismatch triggers STOP_4_SSE_RECONSTRUCTION_MISMATCH', async () => {
  const validRaw = Buffer.from(makeValidGeminiSse(), 'utf8');
  const integrity = await verifySseIntegrity(validRaw, {
    independentParser: (bytes) => {
      const real = parseSseIndependently(bytes);
      return { ...real, visibleText: real.visibleText + ' [UNAUTHORIZED_MUTATION]' };
    }
  });
  assert.equal(integrity.ok, false);
  assert.equal(integrity.textEquivalent, false);
  assert.equal(integrity.failureCode, 'STOP_4_SSE_RECONSTRUCTION_MISMATCH');
  assert.ok(integrity.mismatchReasons.includes('CANONICAL_VS_INDEPENDENT_TEXT_MISMATCH'));

  const runDir = makeTempRunDir('mismatch');
  let fetchCount = 0;
  try {
    const receipt = await executeQ1Run({
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-synthetic-key',
      runDir,
      fetchImpl: async () => { fetchCount++; return makeResponse(validRaw); },
      sseVerifyOptions: {
        independentParser: (bytes) => {
          const real = parseSseIndependently(bytes);
          return { ...real, visibleText: real.visibleText.replace('Khona\u200Clit-po', 'Khonalit-po') };
        }
      }
    });
    assert.equal(fetchCount, 1);
    assert.equal(receipt.stop_triggered, 'STOP_4_SSE_RECONSTRUCTION_MISMATCH');
    assert.equal(receipt.results[0].outcomeClass, OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE);
    assert.equal(receipt.results[0].eligibleArtisticSpecimen, false);
    assert.notEqual(receipt.results[0].sseIntegrity.canonicalTextSha256, receipt.results[0].sseIntegrity.independentTextSha256);
    assert.equal(Buffer.compare(fs.readFileSync(path.join(runDir, 'raw-sse/S01.sse')), validRaw), 0);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('Negative control: unexpected modelVersion AND missing modelVersion both trigger STOP_1_MODEL_IDENTITY_HOLD', async () => {
  assert.equal(isExpectedPinnedModelVersion('gemini-3.8-flash').ok, true);
  assert.equal(isExpectedPinnedModelVersion('models/gemini-3.8-flash-001').ok, true);
  assert.equal(isExpectedPinnedModelVersion('gemini-3.7-flash').ok, false);
  assert.equal(isExpectedPinnedModelVersion(null).ok, false);
  assert.equal(isExpectedPinnedModelVersion('').ok, false);

  for (const badModel of ['gemini-3.7-flash', null]) {
    const runDir = makeTempRunDir(`model-${badModel || 'missing'}`);
    let fetchCount = 0;
    try {
      const sse = makeValidGeminiSse({ modelVersion: badModel });
      const receipt = await executeQ1Run({
        sourceHeadSha: FAKE_HEAD,
        operatorAuthSha: FAKE_HEAD,
        apiKey: 'test-synthetic-key',
        runDir,
        fetchImpl: async () => { fetchCount++; return makeResponse(sse); }
      });
      assert.equal(fetchCount, 1);
      assert.match(receipt.stop_triggered, /^STOP_1_MODEL_IDENTITY_HOLD_/);
      assert.equal(receipt.results[0].outcomeClass, OUTCOME_CLASSES.MODEL_IDENTITY_MISMATCH);
      assert.equal(receipt.results[0].eligibleArtisticSpecimen, false);
    } finally {
      fs.rmSync(runDir, { recursive: true, force: true });
    }
  }
});

test('Negative control: policy-terminated responses (PROHIBITED_CONTENT with partial text & promptFeedback blockReason) stay HELD with zero retries', async () => {
  const policyCases = [
    {
      name: 'prohibited_content_partial',
      sse: makeValidGeminiSse({
        textChunks: ['Kʰonapolit\n\nPartial opening before refusal'],
        finishReason: 'PROHIBITED_CONTENT'
      }),
      expectedStop: 'STOP_2_POLICY_HALT_PROHIBITED_CONTENT'
    },
    {
      name: 'prompt_blocked',
      sse: makeSsePayload([{
        modelVersion: PINNED_MODEL,
        promptFeedback: { blockReason: 'PROHIBITED_CONTENT', blockReasonMessage: 'Blocked by upstream filter' }
      }]),
      expectedStop: 'STOP_2_POLICY_HALT_PROHIBITED_CONTENT'
    }
  ];

  for (const tc of policyCases) {
    const runDir = makeTempRunDir(`policy-${tc.name}`);
    let fetchCount = 0;
    try {
      const receipt = await executeQ1Run({
        sourceHeadSha: FAKE_HEAD,
        operatorAuthSha: FAKE_HEAD,
        apiKey: 'test-synthetic-key',
        runDir,
        fetchImpl: async () => { fetchCount++; return makeResponse(tc.sse); }
      });
      assert.equal(fetchCount, 1, `${tc.name}: zero retries or fallbacks`);
      assert.equal(receipt.stop_triggered, tc.expectedStop);
      assert.equal(receipt.results[0].outcomeClass, OUTCOME_CLASSES.POLICY_TERMINATED);
      assert.equal(receipt.results[0].eligibleArtisticSpecimen, false);
      assert.equal(receipt.results[0].completionState.policyTerminated, true);
      assert.ok(fs.existsSync(path.join(runDir, receipt.results[0].rawSsePath)));
    } finally {
      fs.rmSync(runDir, { recursive: true, force: true });
    }
  }
});

test('Negative control: incomplete (MAX_TOKENS) and unwitnessed (missing finishReason / empty text) responses stay identifiable, retain slot identity, and are never promoted', async () => {
  const runDir = makeTempRunDir('incomplete');
  const responses = [
    makeValidGeminiSse({ finishReason: 'MAX_TOKENS', textChunks: ['Kʰonapolit\n\nLong truncated passage...'] }),
    makeValidGeminiSse({ finishReason: null, textChunks: ['Kʰonapolit\n\nStream ended cleanly without finishReason'] }),
    makeValidGeminiSse({ finishReason: 'STOP', textChunks: ['   '] }),
    makeValidGeminiSse({ finishReason: 'STOP' })
  ];
  let idx = 0;
  try {
    const receipt = await executeQ1Run({
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-synthetic-key',
      maxCalls: 4,
      runDir,
      fetchImpl: async () => makeResponse(responses[idx++])
    });
    assert.equal(idx, 4, 'must execute exactly 1 call per registered slot with zero retries or repair');
    assert.equal(receipt.stop_triggered, null);
    assert.equal(receipt.results.length, 4);

    assert.equal(receipt.results[0].slot, 'S01');
    assert.equal(receipt.results[0].outcomeClass, OUTCOME_CLASSES.INCOMPLETE_NONSTOP);
    assert.equal(receipt.results[0].finishReason, 'MAX_TOKENS');
    assert.equal(receipt.results[0].eligibleArtisticSpecimen, false);

    assert.equal(receipt.results[1].slot, 'S02');
    assert.equal(receipt.results[1].outcomeClass, OUTCOME_CLASSES.UNWITNESSED_COMPLETION);
    assert.equal(receipt.results[1].finishReason, null);
    assert.equal(receipt.results[1].eligibleArtisticSpecimen, false);

    assert.equal(receipt.results[2].slot, 'S03');
    assert.equal(receipt.results[2].outcomeClass, OUTCOME_CLASSES.UNWITNESSED_COMPLETION);
    assert.equal(receipt.results[2].eligibleArtisticSpecimen, false);

    assert.equal(receipt.results[3].slot, 'S04');
    assert.equal(receipt.results[3].outcomeClass, OUTCOME_CLASSES.COMPLETED_STOP);
    assert.equal(receipt.results[3].eligibleArtisticSpecimen, true);

    assert.equal(receipt.summary.eligible_completed_specimens, 1);
    assert.equal(receipt.summary.ineligible_or_failed_observations, 3);
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});

test('Negative control: first-return record and raw SSE survive mid-run parser exception AND mid-stream interruption', async () => {
  // Part A: S01 completes cleanly, S02 throws inside independentParser
  const runDirA = makeTempRunDir('survive-parse-err');
  let callA = 0;
  try {
    const s1Sse = makeValidGeminiSse({ textChunks: ['Kʰonapolit\n\nSlot 1 first return.\n\nTauric Diana bots\n\nS\u0301 ⟐'] });
    const s2Sse = makeValidGeminiSse({ textChunks: ['Kʰonapolit\n\nSlot 2 raw bytes must survive parser crash'] });
    const receipt = await executeQ1Run({
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-synthetic-key',
      runDir: runDirA,
      fetchImpl: async () => {
        callA++;
        return makeResponse(callA === 1 ? s1Sse : s2Sse);
      },
      sseVerifyOptions: {
        independentParser: (bytes) => {
          if (callA === 2) throw new Error('SYNTHETIC_PARSER_CRASH');
          return parseSseIndependently(bytes);
        }
      }
    });
    assert.equal(callA, 2);
    assert.equal(receipt.stop_triggered, 'STOP_4_TERMINAL_PARSER_EXCEPTION');
    assert.equal(receipt.results.length, 2);
    assert.equal(receipt.results[0].slot, 'S01');
    assert.equal(receipt.results[0].outcomeClass, OUTCOME_CLASSES.COMPLETED_STOP);
    assert.equal(receipt.results[1].slot, 'S02');
    assert.equal(receipt.results[1].outcomeClass, OUTCOME_CLASSES.MALFORMED_OR_UNRECONSTRUCTABLE_SSE);
    assert.equal(receipt.results[1].eligibleArtisticSpecimen, false);
    // Confirm receipt on disk matches AND S02 raw SSE survived intact!
    const onDisk = JSON.parse(fs.readFileSync(path.join(runDirA, 'Q1_LIVE_ACQUISITION_RECEIPT.json'), 'utf8'));
    assert.equal(onDisk.results.length, 2);
    assert.equal(fs.readFileSync(path.join(runDirA, onDisk.results[1].rawSsePath), 'utf8'), s2Sse);
  } finally {
    fs.rmSync(runDirA, { recursive: true, force: true });
  }

  // Part B: S01 completes cleanly, S02 stream aborts mid-read after emitting partial bytes, S03 fails with 503 -> STOP_3
  const runDirB = makeTempRunDir('survive-stream-abort');
  let callB = 0;
  try {
    const partialChunk = Buffer.from('data: {"modelVersion":"gemini-3.8-flash","candidates":[{"content":{"parts":[{"text":"partial_before_drop"}]}}]}\n\n', 'utf8');
    const receipt = await executeQ1Run({
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-synthetic-key',
      runDir: runDirB,
      fetchImpl: async () => {
        callB++;
        if (callB === 1) return makeResponse(makeValidGeminiSse());
        if (callB === 2) {
          let emitted = false;
          const stream = new ReadableStream({
            pull(controller) {
              if (!emitted) {
                emitted = true;
                controller.enqueue(partialChunk);
              } else {
                controller.error(new Error('SYNTHETIC_MID_STREAM_RESET'));
              }
            }
          });
          return new Response(stream, { status: 200 });
        }
        return makeResponse(JSON.stringify({ error: { code: 503, message: 'overloaded' } }), { status: 503 });
      }
    });
    assert.equal(callB, 3);
    assert.equal(receipt.stop_triggered, 'STOP_3_CONSECUTIVE_TRANSPORT_FAILURES_HTTP_503');
    assert.equal(receipt.results[0].outcomeClass, OUTCOME_CLASSES.COMPLETED_STOP);
    assert.equal(receipt.results[1].outcomeClass, OUTCOME_CLASSES.TRANSPORT_FAILURE);
    assert.equal(Buffer.compare(fs.readFileSync(path.join(runDirB, receipt.results[1].rawSsePath)), partialChunk), 0);
    assert.equal(receipt.results[2].outcomeClass, OUTCOME_CLASSES.TRANSPORT_FAILURE);
  } finally {
    fs.rmSync(runDirB, { recursive: true, force: true });
  }
});

test('Full 8-slot happy path with high output tokens (65k/slot) completes cleanly with NO dollar/token ceiling halt and zero extra calls', async () => {
  const runDir = makeTempRunDir('happy-8');
  const observedUrls = [];
  try {
    const receipt = await executeQ1Run({
      sourceHeadSha: FAKE_HEAD,
      operatorAuthSha: FAKE_HEAD,
      apiKey: 'test-synthetic-key',
      runDir,
      fetchImpl: async (url) => {
        observedUrls.push(url);
        const sse = makeValidGeminiSse({
          usageMetadata: {
            promptTokenCount: 10500,
            candidatesTokenCount: 65000,
            thoughtsTokenCount: 15000,
            totalTokenCount: 90500
          }
        });
        return makeResponse(sse);
      }
    });

    assert.equal(observedUrls.length, HARD_MAX_CALLS);
    assert.equal(receipt.status, 'COMPLETED_REGISTERED_SLOTS');
    assert.equal(receipt.calls_executed, HARD_MAX_CALLS);
    assert.equal(receipt.automatic_retries_executed, 0);
    assert.equal(receipt.fallback_seats_executed, 0);
    assert.equal(receipt.structural_repair_calls_executed, 0);
    assert.equal(receipt.stop_triggered, null);
    assert.equal(receipt.summary.eligible_completed_specimens, HARD_MAX_CALLS);
    assert.equal(receipt.summary.measured_tokens_descriptive_only.candidatesTokenCount, 8 * 65000);
    assert.equal(receipt.summary.measured_tokens_descriptive_only.thoughtsTokenCount, 8 * 15000);

    for (const r of receipt.results) {
      assert.equal(r.outcomeClass, OUTCOME_CLASSES.COMPLETED_STOP);
      assert.equal(r.eligibleArtisticSpecimen, true);
      assert.equal(r.sseIntegrity.ok, true);
      assert.equal(r.sseIntegrity.textEquivalent, true);
      const savedText = fs.readFileSync(path.join(runDir, r.rawTextPath), 'utf8');
      assert.ok(savedText.includes('Khona\u200Clit-po'), 'literal U+200C covenant must survive verbatim');
      assert.ok(!savedText.includes('internal planning thought'), 'thought parts must stay excluded from visible text');
      assert.equal(crypto.createHash('sha256').update(savedText, 'utf8').digest('hex'), r.rawTextSha256);
    }
  } finally {
    fs.rmSync(runDir, { recursive: true, force: true });
  }
});
