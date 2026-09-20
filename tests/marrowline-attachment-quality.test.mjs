import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import marrowlineAttachmentHandler, {
  MARROWLINE_ATTACHMENT_MAX_COUNT,
  MARROWLINE_ATTACHMENT_SCHEMA,
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
  process.env.GEMINI_API_KEY = 'synthetic-attachment-frontier-key';
  const generationCalls = [];
  t.after(() => {
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
