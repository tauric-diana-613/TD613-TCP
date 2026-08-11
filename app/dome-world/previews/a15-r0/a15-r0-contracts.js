import * as core from './a15-r0-contracts-core.js';

export * from './a15-r0-contracts-core.js';

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

export function validateGovernedTaskFixture(value) {
  const fixture = core.validateGovernedTaskFixture(value);
  strictRfc3339DateTime(fixture.created_at, 'Fixture created_at');
  for (const [action, timestamp] of Object.entries(fixture.action_times || {})) {
    strictRfc3339DateTime(timestamp, `Fixture action_times.${action}`);
  }
  return fixture;
}
