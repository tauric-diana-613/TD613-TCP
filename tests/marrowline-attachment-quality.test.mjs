import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import {
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
