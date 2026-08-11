import * as core from './a15-r0-contracts-core.js';

export * from './a15-r0-contracts-core.js';

const SHA256_DIGEST = /^sha256:[0-9a-f]{64}$/;

function strictRfc3339DateTime(value, label) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(Z|[+-](\d{2}):(\d{2}))$/.exec(String(value || ''));
  if (!match) throw new Error(`${label} must be an RFC 3339 date-time.`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[8] === 'Z' ? 0 : Number(match[9]);
  const offsetMinute = match[8] === 'Z' ? 0 : Number(match[10]);
  const daysInMonth = month >= 1 && month <= 12 ? new Date(Date.UTC(year, month, 0)).getUTCDate() : 0;
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth
      || hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59
      || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must name a calendar-valid RFC 3339 date-time.`);
  }
  return value;
}

function strictSha256Digest(value, label) {
  if (typeof value !== 'string' || !SHA256_DIGEST.test(value)) {
    throw new Error(`${label} must be a sha256 digest with exactly 64 lowercase hexadecimal digits.`);
  }
  return value;
}

export function validateGovernedTaskFixture(value) {
  const fixture = core.validateGovernedTaskFixture(value);
  strictRfc3339DateTime(fixture.created_at, 'Fixture created_at');
  for (const [action, timestamp] of Object.entries(fixture.action_times || {})) {
    strictRfc3339DateTime(timestamp, `Fixture action_times.${action}`);
  }
  return fixture;
}

export function validateProjectionRunReceipt(value) {
  const receipt = core.validateProjectionRunReceipt(value);
  strictSha256Digest(receipt.receipt_digest, 'Projection run receipt receipt_digest');
  return receipt;
}

export function validateObservableEvent(value) {
  const event = core.validateObservableEvent(value);
  strictSha256Digest(event.event_digest, 'Observable event event_digest');
  return event;
}
