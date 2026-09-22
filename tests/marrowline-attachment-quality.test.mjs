import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import crypto from 'node:crypto';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';
import { GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, withGeminiGenerationProfile } from '../server/gemini-generation-envelope.js';
import marrowlineAttachmentHandler, {
  MARROWLINE_ATTACHMENT_MAX_COUNT,
  MARROWLINE_ATTACHMENT_SCHEMA,
  buildAttachmentGeminiRequest,
  buildAttachmentGeminiTerminalRepairRequest,
  normalizeMarrowlineAttachments
} from '../server/marrowline-attachment-quality.js';

function attachment(overrides = {}) {
  const bytes = Buffer.from(overrides.bytes ?? 'MARROWLINE_ATTACHMENT_CANARY_613', 'utf8');
  return {
    schema: MARROWLINE_ATTACHMENT_SCHEMA,
    id: 'att_fixture_613',
    name: 'operator-note.txt',
    kind: 'file',
    mime_type: 'text/plain',
    size_bytes: bytes.length,
    data_base64: bytes.toString('base64'),
    ...Object.fromEntries(Object.entries(overrides).filter(([key]) => key !== 'bytes'))
  };
}

test('attachment payload stays inside the operator task while the compact relay cue remains last', () => {
  const exact = attachment();
  const packet = {
    systemInstruction: 'Synthetic system.',
    mode: 'issued-conjunction',
    message: 'Inspect the attachment without rewriting this operator text.',
    history: []
  };
  const request = buildAttachmentGeminiRequest(packet, {}, 'gemini-3.8-flash', [exact]);
  const parts = request.contents.at(-1).parts;
  assert.equal(parts[0].text, packet.message);
  assert.match(parts[1].text, /Operator attachment att_fixture_613: operator-note\.txt/);
  assert.equal(parts[2].inlineData.mimeType, 'text/plain');
  assert.equal(parts[2].inlineData.data, exact.data_base64);
  assert.match(parts.at(-1).text, /GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION/);
  assert.match(parts.at(-1).text, /both mandatory visible registers/);
  assert.match(parts.at(-1).text, /HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION/);
  assert.match(parts.at(-1).text, /TYPOGRAPHIC CALIBRATION ONLY, NEVER QUOTE THESE WORDS/);
  assert.ok((parts.at(-1).text.match(/\p{M}/gu) || []).length >= 20);
});

test('Marrowline attachment normalizer admits exact declared bytes and strips no custody fields', () => {
  const input = attachment();
  const [normalized] = normalizeMarrowlineAttachments([input]);
  assert.deepEqual(normalized, input);
  assert.equal(Object.isFrozen(normalized), true);
});

test('Marrowline attachment normalizer rejects size, MIME, schema, duplicate-id, and count drift', () => {
  const exact = attachment();
  assert.throws(() => normalizeMarrowlineAttachments([{ ...exact, size_bytes: exact.size_bytes + 1 }]), /attachment-size-mismatch/);
  assert.throws(() => normalizeMarrowlineAttachments([{ ...exact, mime_type: 'application/x-executable' }]), /unsupported-attachment-type/);
  assert.throws(() => normalizeMarrowlineAttachments([{ ...exact, schema: 'wrong-schema' }]), /invalid-attachment-schema/);
  assert.throws(() => normalizeMarrowlineAttachments([exact, exact]), /invalid-attachment-id/);
  assert.throws(() => normalizeMarrowlineAttachments(Array.from({ length: MARROWLINE_ATTACHMENT_MAX_COUNT + 1 }, (_, index) => attachment({ id: `att_${index}` }))), /invalid-attachment-count/);
});

test('Marrowline keeps file and photo MIME classes non-interchangeable', () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
  const photo = attachment({ id: 'att_photo_613', name: 'operator-photo.png', kind: 'photo', mime_type: 'image/png', bytes: png });
  assert.equal(normalizeMarrowlineAttachments([photo])[0].kind, 'photo');
  assert.throws(() => normalizeMarrowlineAttachments([{ ...photo, kind: 'file' }]), /unsupported-attachment-type/);
  assert.throws(() => normalizeMarrowlineAttachments([{ ...attachment(), kind: 'photo' }]), /unsupported-attachment-type/);
});


test('attachment turns walk the same five-seat frontier before waking the human', async t => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-attachment-frontier-key';
  const generationCalls = [];
  t.after(() => {
    clearGeminiModelState();
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  globalThis.fetch = async (url) => {
    const value = String(url);
    if (value.includes('/v1beta/models?')) {
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            models: [
              'gemini-3.8-flash',
              'gemini-3.7-flash',
              'gemini-3.6-flash',
              'gemini-3.5-flash',
              'gemini-3-flash-preview'
            ].map((id) => ({ name: 'models/' + id, supportedGenerationMethods: ['generateContent'] }))
          };
        }
      };
    }
    const model = value.match(/models\/([^:]+):generateContent/)?.[1] || 'unknown';
    generationCalls.push(model);
    return {
      ok: false,
      status: 503,
      headers: { get: () => null },
      async json() { return { error: { status: 'UNAVAILABLE', message: 'synthetic seat unavailable' } }; }
    };
  };

  const req = {
    method: 'POST',
    headers: { 'x-forwarded-for': '203.0.113.244' },
    body: {
      message: 'Read the attached operator note and keep walking the frontier if one seat is unavailable.',
      history: [],
      mode: 'issued-conjunction',
      waiveIssuance: true,
      attachments: [attachment()]
    }
  };
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(text) { this.text = text; this.payload = text ? JSON.parse(text) : null; }
  };

  await marrowlineAttachmentHandler(req, res);
  assert.equal(res.statusCode, 502);
  assert.equal(res.payload.error, 'gemini-provider-unavailable');
  assert.deepEqual(generationCalls, [
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
    'gemini-3-flash-preview'
  ]);
  assert.equal(res.payload.attempts.length, 5);
  assert.ok(res.payload.attempts.every((attempt) => attempt.status === 503));
  assert.ok(res.payload.attempts.every((attempt) => attempt.timeoutMs >= 10000),
    'attachment seats receive completion windows rather than millisecond health probes');
});

test('text/attachment generation envelopes remain explicitly distinguishable without silently changing production thinking', () => {
  const packet = { systemInstruction: 'Synthetic system.', mode: 'issued-conjunction', message: 'Compare one fixed argument.', history: [] };
  const attachmentRequest = buildAttachmentGeminiRequest(packet, {}, 'gemini-3.8-flash', [attachment()]);
  const interactiveRequest = withGeminiGenerationProfile(
    GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
    () => buildAttachmentGeminiRequest(packet, {}, 'gemini-3.8-flash', [attachment()])
  );
  assert.equal(attachmentRequest.generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(attachmentRequest.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  assert.equal(interactiveRequest.generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(interactiveRequest.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  assert.equal(attachmentRequest.contents.at(-1).parts[0].text, packet.message);
  assert.equal(interactiveRequest.contents.at(-1).parts[0].text, packet.message);
  assert.deepEqual(attachmentRequest.contents.at(-1).parts.slice(1), interactiveRequest.contents.at(-1).parts.slice(1));
  for (const fallback of ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-3-flash-preview']) {
    const unprofiled = buildAttachmentGeminiRequest(packet, {}, fallback, [attachment()]);
    const profiled = withGeminiGenerationProfile(
      GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE,
      () => buildAttachmentGeminiRequest(packet, {}, fallback, [attachment()])
    );
    assert.deepEqual(unprofiled.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
    assert.deepEqual(profiled.generationConfig.thinkingConfig, { thinkingLevel: 'low' });
    assert.equal(profiled.generationConfig.maxOutputTokens, 65536);
  }
});

test('attachment response receipts reflect the exact submitted wire configuration and preserve provider Unicode', async t => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-attachment-wire-key';
  t.after(() => {
    globalThis.fetch = originalFetch;
    clearGeminiModelState();
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });
  const exact = attachment();
  const returned = 'Kʰonapolit\nAn original argument survives.\n\nTauric Diana bots\nṚ̇Ē̥Ḍ̈ — the archived joke returns.';
  const wire = [];
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/v1beta/models?')) {
      return { ok: true, status: 200, async json() {
        return { models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }] };
      } };
    }
    assert.match(String(url), /gemini-3\.8-flash:generateContent$/);
    const request = JSON.parse(options.body);
    wire.push(request);
    return {
      ok: true, status: 200, headers: { get: () => null },
      async json() { return {
        candidates: [{ finishReason: 'STOP', content: { parts: [{ text: returned }] } }],
        usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 63, thoughtsTokenCount: 21, totalTokenCount: 184 }
      }; }
    };
  };
  const res = {
    statusCode: 200, headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.payload = JSON.parse(value); }
  };
  await marrowlineAttachmentHandler({
    method: 'POST', headers: { 'x-forwarded-for': '203.0.113.245' },
    body: {
      message: 'Explain the attached record and follow the argument.',
      history: [], mode: 'issued-conjunction', waiveIssuance: true,
      attachments: [exact]
    }
  }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(wire.length, 1);
  assert.equal(wire[0].contents.at(-1).parts[0].text, 'Explain the attached record and follow the argument.');
  assert.equal(wire[0].contents.at(-1).parts.at(-2).inlineData.data, exact.data_base64);
  assert.equal(wire[0].generationConfig.maxOutputTokens, 65536);
  assert.deepEqual(wire[0].generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  assert.equal(res.payload.text, returned, 'native provider text, including combining marks, stays byte-for-byte unchanged');
  const output = res.payload.receipt.provider.output;
  assert.equal(output.outputCeilingSource, 'submitted-generation-config');
  assert.equal(output.maxOutputTokens, wire[0].generationConfig.maxOutputTokens);
  assert.equal(output.thinkingLevel, wire[0].generationConfig.thinkingConfig.thinkingLevel);
  assert.equal(output.finishReason, 'STOP');
  assert.equal(output.usage.candidatesTokenCount, 63);
  assert.deepEqual(res.payload.receipt.provider.attempts[0].output, output);
  assert.equal(res.payload.receipt.provider.authorshipObservation.firstMovementHeadingPresent, true);
  assert.equal(res.payload.receipt.provider.authorshipObservation.terminalMovementHeadingPresent, true);
  assert.ok(res.payload.receipt.provider.authorshipObservation.nativeCombiningMarkCount > 0);
  assert.equal(res.payload.receipt.attachments[0].size_bytes, exact.size_bytes);
});

const terminalPeak = 'R\u0308\u030B\u030C\u0351\u031E\u0325\u0326E\u0302\u0307\u0315\u0357\u0317\u0323D\u0300\u0309\u0310\u0352\u0319\u0325';
const initialVoice = 'Kʰonapolit\\nThe visible map cannot prove the origin of its evidence. Its missing denominator is a custody question.';
const terminalVoice = 'Tauric Diana bots\\n' + [
  'Come closer. The map keeps confusing a counted case with a person.',
  terminalPeak + ' — there, the missing denominator interrupts the speech.',
  'Let the next sentence breathe. A clean interval carries the recoil.',
  'A\u0301 little tremor returns, then ' + terminalPeak + '.',
  'The joke lands quietly. The branch still belongs to the grove.'
].join('\\n\\n');

function attachmentResponse() {
  return { statusCode: 200, headers: {}, sendCount: 0,
    setHeader(name, value) { this.headers[name] = value; },
    end(value) { this.sendCount += 1; this.payload = value ? JSON.parse(value) : null; }
  };
}
function attachmentTurn(ip = '203.0.113.247') {
  return { method: 'POST', headers: { 'x-forwarded-for': ip },
    body: { message: 'Explain the attached map and its custody gap.',
      history: [], mode: 'issued-conjunction', waiveIssuance: true,
      attachments: [attachment()] } };
}

test('terminal-only attachment repair carries original inline bytes and keeps the repair instruction last', () => {
  const packet = { systemInstruction: 'Synthetic system.', mode: 'issued-conjunction',
    message: 'Explain the attached map.', history: [] };
  const request = buildAttachmentGeminiTerminalRepairRequest(packet, {}, 'gemini-3.8-flash',
    [attachment()], initialVoice, ['tauric-diana-bots-nominative-missing']);
  assert.equal(request.contents[0].parts[0].text, packet.message);
  assert.equal(request.contents[0].parts.at(-2).inlineData.data, attachment().data_base64);
  assert.match(request.contents[0].parts.at(-1).text, /CURRENT-TURN RELAY EXECUTION/);
  assert.equal(request.contents[1].parts[0].text, initialVoice);
  assert.match(request.contents[2].parts[0].text, /TERMINAL CONTINUATION ONLY/);
  assert.deepEqual(request.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
});

test('attachment terminal continuation is same-provider, native, byte-preserving and bounded', async t => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'synthetic-attachment-continuation-key';
  clearGeminiModelState();
  t.after(() => {
    globalThis.fetch = originalFetch;
    clearGeminiModelState();
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });
  let mode = 'valid';
  let calls = [];
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/v1beta/models?')) {
      return { ok: true, status: 200, async json() { return {
        models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }]
      }; } };
    }
    assert.match(String(url), /gemini-3\\.8-flash:generateContent$/);
    const request = JSON.parse(options.body);
    calls.push(request);
    const text = calls.length === 1
      ? mode === 'complete' ? initialVoice + '\\n\\n' + terminalVoice : initialVoice
      : mode === 'valid' ? terminalVoice : 'Tauric Diana bots\\n';
    return { ok: true, status: 200, headers: { get: () => null }, async json() {
      return { candidates: [{ finishReason: 'STOP', content: { parts: [{ text }] } }],
        usageMetadata: { promptTokenCount: 110, candidatesTokenCount: 70, thoughtsTokenCount: 20, totalTokenCount: 200 } };
    } };
  };

  await t.test('missing terminal returns two genuine provider outputs and preserves the first hash', async () => {
    mode = 'valid'; calls = [];
    const res = attachmentResponse();
    await marrowlineAttachmentHandler(attachmentTurn('203.0.113.247'), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.sendCount, 1);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].contents[0].parts.at(-2).inlineData.data, attachment().data_base64);
    assert.equal(calls[1].contents[0].parts.at(-2).inlineData.data, attachment().data_base64);
    assert.equal(calls[1].contents[1].parts[0].text, initialVoice);
    assert.match(calls[1].contents.at(-1).parts[0].text, /TERMINAL CONTINUATION ONLY/);
    assert.equal(res.payload.text, initialVoice + '\\n\\n' + terminalVoice);
    assert.equal(res.payload.receipt.provider.authorshipObservation.completionPath, 'same-provider-terminal-continuation');
    assert.equal(res.payload.receipt.provider.attempts.length, 2);
    assert.equal(res.payload.receipt.provider.attempts[1].kind, 'structural-repair');
    const continuation = res.payload.receipt.provider.structuralRepair.terminalContinuation;
    const digest = text => crypto.createHash('sha256').update(text).digest('hex');
    assert.equal(continuation.originalSha256, digest(initialVoice));
    assert.equal(continuation.continuationSha256, digest(terminalVoice));
    assert.equal(continuation.combinedSha256, digest(res.payload.text));
    assert.equal(continuation.originalPreserved, true);
    assert.equal(res.payload.receipt.provider.output.outputCeilingSource, 'submitted-generation-config');
    assert.equal(res.payload.receipt.provider.output.thinkingLevel, calls[1].generationConfig.thinkingConfig.thinkingLevel);
    assert.equal(res.headers['X-TD613-Structural-Repair'], 'provider-authored-bounded-1');
  });

  await t.test('invalid suffix leaves the exact first response visible and does not fabricate bots', async () => {
    mode = 'invalid'; calls = [];
    const res = attachmentResponse();
    await marrowlineAttachmentHandler(attachmentTurn('203.0.113.248'), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.sendCount, 1);
    assert.equal(calls.length, 2);
    assert.equal(res.payload.text, initialVoice);
    assert.equal(res.payload.receipt.provider.structuralRepair.used, true);
    assert.equal(res.payload.receipt.provider.structuralRepair.succeeded, false);
    assert.equal(res.payload.receipt.provider.authorshipObservation.completionPath, 'first-provider-return');
    assert.equal(res.payload.receipt.provider.attempts.length, 2);
    assert.equal(res.headers['X-TD613-Structural-Repair'], undefined);
  });

  await t.test('complete first provider return never spends a repair call', async () => {
    mode = 'complete'; calls = [];
    const res = attachmentResponse();
    await marrowlineAttachmentHandler(attachmentTurn('203.0.113.249'), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.sendCount, 1);
    assert.equal(calls.length, 1);
    assert.equal(res.payload.text, initialVoice + '\\n\\n' + terminalVoice);
    assert.equal(res.payload.receipt.provider.structuralRepair, undefined);
  });
});
