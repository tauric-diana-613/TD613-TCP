export const CALIBRATION_VERSION = 'phase-8';

const STATUS_WEIGHT = Object.freeze({ pass: 1, warn: 0.62, fail: 0, invalid: 0 });
const DEFAULT_WARN_MARGIN = 0.08;
const FORBIDDEN_EXPECTATION_TERMS = /\b(?:anonymous|anonymity|untraceable|platform[-\s]?proof|same\s+author|not\s+same\s+author|identity\s+proven|identity\s+disproven|will\s+evade\s+detection|safe\s+to\s+publish)\b/i;

const asArray = (value) => Array.isArray(value) ? [...value] : [];
const unique = (...groups) => [...new Set(groups.flat().filter(Boolean))];
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const clamp = (value, min = 0, max = 1) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : null;
const round = (value, digits = 6) => Number.isFinite(value) ? Number(value.toFixed(digits)) : null;

function readPath(source = {}, path = '') {
  if (!path) return undefined;
  return path.split('.').reduce((cursor, part) => cursor == null ? undefined : cursor[part], source);
}

function statusRank(status = 'invalid') {
  return { pass: 0, warn: 1, fail: 2, invalid: 3 }[status] ?? 3;
}

function worstStatus(statuses = []) {
  if (!statuses.length) return 'invalid';
  return statuses.reduce((worst, status) => statusRank(status) > statusRank(worst) ? status : worst, 'pass');
}

function metric(escapeVector = {}, key) {
  return Number.isFinite(escapeVector?.scores?.[key]) ? escapeVector.scores[key] : null;
}

function boolCheck(value, expected, path) {
  if (expected === undefined) return null;
  const ok = Boolean(value) === Boolean(expected);
  return {
    path,
    value: Boolean(value),
    expected: Boolean(expected),
    status: ok ? 'pass' : 'fail',
    message: ok ? `${path} matched expected boolean` : `${path} did not match expected boolean`
  };
}

export function normalizeExpectedRange(range = {}) {
  if (!isObject(range)) return { min: null, max: null, warnBelow: null, warnAbove: null, required: false };
  const min = Number.isFinite(range.min) ? range.min : null;
  const max = Number.isFinite(range.max) ? range.max : null;
  const margin = Number.isFinite(range.warnMargin) ? Math.max(0, range.warnMargin) : DEFAULT_WARN_MARGIN;
  return {
    min,
    max,
    warnBelow: Number.isFinite(range.warnBelow) ? range.warnBelow : min === null ? null : min - margin,
    warnAbove: Number.isFinite(range.warnAbove) ? range.warnAbove : max === null ? null : max + margin,
    required: Boolean(range.required),
    note: range.note || ''
  };
}

export function evaluateRange(value, range = {}) {
  const expected = normalizeExpectedRange(range);
  if (!Number.isFinite(value)) {
    return {
      value: null,
      expected,
      status: expected.required ? 'fail' : 'warn',
      message: expected.required ? 'required numeric value is unavailable' : 'numeric value is unavailable'
    };
  }
  if (expected.min !== null && value < expected.min) {
    const status = expected.warnBelow !== null && value >= expected.warnBelow ? 'warn' : 'fail';
    return { value: round(value), expected, status, message: `${round(value)} is below expected minimum ${expected.min}` };
  }
  if (expected.max !== null && value > expected.max) {
    const status = expected.warnAbove !== null && value <= expected.warnAbove ? 'warn' : 'fail';
    return { value: round(value), expected, status, message: `${round(value)} is above expected maximum ${expected.max}` };
  }
  return { value: round(value), expected, status: 'pass', message: 'value inside expected range' };
}

export function computeCalibrationDrift({ current = {}, expected = {}, tolerance = DEFAULT_WARN_MARGIN } = {}) {
  const checks = [];
  for (const [key, range] of Object.entries(expected || {})) {
    const value = current?.[key];
    const normalized = normalizeExpectedRange({ ...range, warnMargin: tolerance });
    const evaluation = evaluateRange(value, normalized);
    checks.push({ path: key, ...evaluation });
  }
  const status = worstStatus(checks.map((check) => check.status));
  return { status, checks, tolerance, driftScore: round(1 - (checks.reduce((sum, check) => sum + (STATUS_WEIGHT[check.status] ?? 0), 0) / Math.max(checks.length, 1))) };
}

function checkAllowedState(value, expectation = {}) {
  const allowed = asArray(expectation.allowedStates);
  if (!allowed.length) return null;
  const status = allowed.includes(value) ? 'pass' : 'fail';
  return { path: 'controller.state', value, expected: { allowedStates: allowed }, status, message: status === 'pass' ? 'controller state is allowed' : 'controller state outside allowed states' };
}

function checkPreferredState(value, expectation = {}) {
  if (!expectation.preferredState) return null;
  const status = value === expectation.preferredState ? 'pass' : 'warn';
  return { path: 'controller.preferredState', value, expected: expectation.preferredState, status, message: status === 'pass' ? 'controller state matches preferred state' : 'controller state differs from preferred state' };
}

function checkClaimLevel(claim = {}, expectation = {}) {
  const checks = [];
  if (Number.isFinite(expectation.minLevel) || Number.isFinite(expectation.maxLevel)) {
    checks.push({ path: 'claimCeiling.level', ...evaluateRange(claim.level, { min: expectation.minLevel, max: expectation.maxLevel, required: true }) });
  }
  if (expectation.id) {
    const status = claim.id === expectation.id ? 'pass' : 'warn';
    checks.push({ path: 'claimCeiling.id', value: claim.id, expected: expectation.id, status, message: status === 'pass' ? 'claim id matched' : 'claim id differs from preferred fixture id' });
  }
  if (expectation.maxLevel === 8 && expectation.allowExternalCorroboration !== true) {
    checks.push({ path: 'claimCeiling.level8Use', value: claim.level, expected: 'level 8 only when external-corroboration guardrail is intended', status: claim.level === 8 ? 'warn' : 'pass', message: 'level 8 is a guardrail, not proof' });
  }
  return checks;
}

function checkReport(report = {}, expectation = {}) {
  const checks = [];
  if (!expectation || !Object.keys(expectation).length) return checks;
  checks.push(boolCheck(report?.reproducibility?.sourceTextIncluded, false, 'report.reproducibility.sourceTextIncluded'));
  checks.push(boolCheck(report?.reproducibility?.outputTextIncluded, false, 'report.reproducibility.outputTextIncluded'));
  if (expectation.mustIncludeLimitations) {
    checks.push({ path: 'report.limitations', value: asArray(report.limitations).length, expected: 'one or more limitations', status: asArray(report.limitations).length ? 'pass' : 'fail', message: asArray(report.limitations).length ? 'limitations are present' : 'limitations are missing' });
  }
  if (expectation.mustAvoidForbiddenClaims) {
    const text = JSON.stringify(report || {});
    const status = FORBIDDEN_EXPECTATION_TERMS.test(text) && !/does not claim|does not issue|does not prove/i.test(text) ? 'fail' : 'pass';
    checks.push({ path: 'report.forbiddenClaims', value: status, expected: 'no positive forbidden claims', status, message: status === 'pass' ? 'no positive forbidden claims detected by calibration guard' : 'positive forbidden claim detected' });
  }
  return checks.filter(Boolean);
}

function validateFixtureShape(fixture = {}) {
  const failures = [];
  if (!fixture.id) failures.push('fixture id missing');
  if (!fixture.fixtureClass) failures.push('fixtureClass missing');
  if (!isObject(fixture.inputs)) failures.push('inputs missing');
  if (!isObject(fixture.expectations)) failures.push('expectations missing');
  const expectationText = JSON.stringify(fixture.expectations || {});
  if (/identity proof|same author truth|not same author truth|anonymity proof|platform proof/i.test(expectationText)) failures.push('fixture expectations contain prohibited proof language');
  return failures;
}

export function evaluateFixtureExpectations({
  fixture = {},
  escapeVector = {},
  ingestionAudit = {},
  controllerDecision = {},
  claimCeiling = {},
  reportPayload = {}
} = {}) {
  const shapeFailures = validateFixtureShape(fixture);
  if (shapeFailures.length) {
    return {
      fixtureId: fixture.id || 'unknown',
      status: 'invalid',
      score: 0,
      checks: shapeFailures.map((message) => ({ path: 'fixture.schema', value: null, expected: 'valid fixture schema', status: 'invalid', message })),
      warnings: [],
      failures: shapeFailures
    };
  }
  const expectations = fixture.expectations || {};
  const checks = [];
  for (const [key, range] of Object.entries(expectations.escapeVector || {})) {
    checks.push({ path: `escapeVector.${key}`, ...evaluateRange(metric(escapeVector, key), range) });
  }
  const stateCheck = checkAllowedState(controllerDecision.state, expectations.controller || {});
  if (stateCheck) checks.push(stateCheck);
  const preferredCheck = checkPreferredState(controllerDecision.state, expectations.controller || {});
  if (preferredCheck) checks.push(preferredCheck);
  checks.push(...checkClaimLevel(claimCeiling, expectations.claimCeiling || {}));
  checks.push(...checkReport(reportPayload, expectations.report || {}));
  if (expectations.ingestionAudit?.ingestionFriction) checks.push({ path: 'ingestionAudit.ingestionFriction', ...evaluateRange(ingestionAudit.ingestionFriction, expectations.ingestionAudit.ingestionFriction) });
  if (expectations.ingestionAudit?.khonaLitPoStatus) {
    const actual = ingestionAudit.khonaLitPo?.status;
    const status = actual === expectations.ingestionAudit.khonaLitPoStatus ? 'pass' : 'warn';
    checks.push({ path: 'ingestionAudit.khonaLitPo.status', value: actual, expected: expectations.ingestionAudit.khonaLitPoStatus, status, message: status === 'pass' ? 'Khona\u200Clit-po status matched' : 'Khona\u200Clit-po status differs from preferred fixture status' });
  }
  const status = worstStatus(checks.map((check) => check.status));
  const score = round(checks.reduce((sum, check) => sum + (STATUS_WEIGHT[check.status] ?? 0), 0) / Math.max(checks.length, 1));
  return {
    fixtureId: fixture.id,
    fixtureClass: fixture.fixtureClass,
    status,
    score,
    checks,
    warnings: checks.filter((check) => check.status === 'warn').map((check) => `${check.path}: ${check.message}`),
    failures: checks.filter((check) => check.status === 'fail' || check.status === 'invalid').map((check) => `${check.path}: ${check.message}`)
  };
}

export function classifyCalibrationStatus(result = {}) {
  if (result.status) return result.status;
  return worstStatus(asArray(result.checks).map((check) => check.status));
}

export function summarizeCalibrationResult(results = []) {
  const rows = asArray(results);
  const counts = { pass: 0, warn: 0, fail: 0, invalid: 0 };
  for (const result of rows) counts[classifyCalibrationStatus(result)] = (counts[classifyCalibrationStatus(result)] || 0) + 1;
  const score = round(rows.reduce((sum, result) => sum + (Number.isFinite(result.score) ? result.score : STATUS_WEIGHT[classifyCalibrationStatus(result)] ?? 0), 0) / Math.max(rows.length, 1));
  const status = counts.fail || counts.invalid ? 'fail' : counts.warn ? 'warn' : rows.length ? 'pass' : 'invalid';
  return { version: CALIBRATION_VERSION, status, score, counts, total: rows.length, warnings: rows.flatMap((result) => asArray(result.warnings)), failures: rows.flatMap((result) => asArray(result.failures)) };
}
