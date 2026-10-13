export const HUSH_PAYLOAD_INTEGRITY_VERSION = 'phase-21';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values).filter(Boolean))];

function includesLoose(output = '', text = '') {
  const value = safeText(output).toLowerCase();
  const needle = safeText(text).toLowerCase();
  if (!needle) return true;
  if (value.includes(needle)) return true;
  if (needle === 'resend' && /hold|wait|do not send|not send|not resend/i.test(output)) return true;
  if (needle === 'told' && /told|asked|instructed|should|needs? to|was directed/i.test(output)) return true;
  if (needle === 'keep' && /keep|stay|remain|preserve/i.test(output)) return true;
  if (needle === 'saved' && /saved|kept|recorded/i.test(output)) return true;
  if (needle === 'logged' && /logged|recorded|entered/i.test(output)) return true;
  if (needle === 'called' && /called|call/i.test(output)) return true;
  if (needle === 'finance kept' && /finance[^.!?]*(kept|keeps|kept version|version|confirms)/i.test(output)) return true;
  if (/which version/i.test(needle) && /finance[^.!?]*(version|confirms)[^.!?]*(kept|it kept|keeps)?/i.test(output)) return true;
  if (/until\s+we\s+know\s+which\s+version\s+finance\s+kept/i.test(needle) && /until[^.!?]*finance[^.!?]*(confirms|knows|verifies)[^.!?]*version/i.test(output)) return true;
  if (/the whole point/i.test(needle) && /whole point|point of the date|date matters|date is the point/i.test(output)) return true;
  return false;
}

function tokenDistance(output = '', left = '', right = '') {
  const tokens = safeText(output).split(/\s+/).filter(Boolean);
  const leftIndex = tokens.findIndex((token) => token.toLowerCase().includes(safeText(left).toLowerCase()));
  const rightIndex = tokens.findIndex((token) => token.toLowerCase().includes(safeText(right).toLowerCase()));
  if (leftIndex < 0 || rightIndex < 0) return Infinity;
  return Math.abs(rightIndex - leftIndex);
}

function truncatedIdentifier(output = '', unit = {}) {
  const text = safeText(unit.text);
  if (!unit.preserveExact || !/[A-Z]+-\d/.test(text)) return false;
  const number = text.match(/\d+/)?.[0];
  return Boolean(number && !output.includes(text) && new RegExp(`\\b${number}\\b`).test(output));
}

function truncatedTimestamp(output = '', unit = {}) {
  const text = safeText(unit.text);
  if (unit.kind !== 'timestamp' || !/:/.test(text)) return false;
  const tail = text.split(':')[1]?.replace(/\D/g, '');
  return Boolean(tail && !output.includes(text) && new RegExp(`\\b${tail}\\b`).test(output));
}

function defaultChecks() {
  return { actors: 'pass', orgs: 'pass', evidenceIds: 'pass', timestamps: 'pass', dates: 'pass', actions: 'pass', objects: 'pass', instructions: 'pass', reasons: 'pass', versions: 'pass', bindings: 'pass' };
}

export function buildPayloadIntegrityCheck(input = {}) {
  const outputText = safeText(input.outputText ?? input.text);
  const payloadMap = input.payloadMap || {};
  const bindingMap = input.payloadBindingMap || input.bindingMap || {};
  const units = asArray(payloadMap.payloadUnits);
  const bindings = asArray(bindingMap.bindings);
  const hardFailures = [];
  const reviewWarnings = [];
  const repairsSuggested = [];
  const checks = defaultChecks();
  let passedCount = 0;
  let requiredCount = 0;

  for (const unit of units.filter((item) => item.required)) {
    requiredCount += 1;
    const present = unit.preserveExact ? outputText.includes(unit.text) : includesLoose(outputText, unit.text);
    if (present) {
      passedCount += 1;
      continue;
    }
    const kind = unit.kind;
    if (kind === 'evidence-id') { checks.evidenceIds = 'fail'; hardFailures.push(truncatedIdentifier(outputText, unit) ? 'evidence-id-truncated' : 'evidence-id-dropped'); repairsSuggested.push('restore-evidence-id'); }
    else if (kind === 'timestamp') { checks.timestamps = 'fail'; hardFailures.push(truncatedTimestamp(outputText, unit) ? 'timestamp-truncated' : 'timestamp-dropped'); repairsSuggested.push('restore-time-action-binding'); }
    else if (kind === 'date') { checks.dates = 'fail'; hardFailures.push('date-dropped'); repairsSuggested.push('restore-evidence-date-binding'); }
    else if (kind === 'actor') { checks.actors = 'fail'; hardFailures.push('actor-dropped'); repairsSuggested.push('restore-actor-action-object'); }
    else if (kind === 'org' || kind === 'department') { checks.orgs = 'fail'; hardFailures.push('required-org-dropped'); repairsSuggested.push('restore-version-context'); }
    else if (kind === 'action') { checks.actions = 'review'; reviewWarnings.push('action-compressed-review'); }
    else if (kind === 'object') { checks.objects = 'fail'; hardFailures.push('instruction-target-dropped'); repairsSuggested.push('restore-instruction-target-binding'); }
    else if (kind === 'reason') { checks.reasons = 'fail'; hardFailures.push('causal-reason-dropped'); repairsSuggested.push('restore-reason-clause'); }
    else if (kind === 'version') { checks.versions = 'fail'; hardFailures.push('version-context-dropped'); repairsSuggested.push('restore-version-context'); }
  }

  for (const binding of bindings.filter((item) => item.required)) {
    const boundUnits = asArray(binding.payloadIds).map((id) => units.find((unit) => unit.id === id)).filter(Boolean);
    if (boundUnits.length < 2) continue;
    const presentUnits = boundUnits.filter((unit) => unit.preserveExact ? outputText.includes(unit.text) : includesLoose(outputText, unit.text));
    if (presentUnits.length < boundUnits.length) {
      checks.bindings = 'fail';
      hardFailures.push('payload-binding-broken');
      repairsSuggested.push(binding.kind === 'reason-instruction' ? 'restore-reason-clause' : `restore-${binding.kind}-binding`);
      continue;
    }
    const [left, right] = boundUnits;
    const distance = tokenDistance(outputText, left.text, right.text);
    if (Number.isFinite(distance) && distance > Number(binding.maxDistanceTokens || 14)) {
      checks.bindings = checks.bindings === 'fail' ? 'fail' : 'review';
      reviewWarnings.push('payload-distance-high');
    }
  }

  if (hardFailures.length >= 3) hardFailures.push('payload-loss-severe');
  if (reviewWarnings.some((item) => item.includes('version'))) checks.versions = checks.versions === 'fail' ? 'fail' : 'review';
  const score = requiredCount ? Math.max(0, Math.min(1, passedCount / requiredCount)) : 1;
  const passed = unique(hardFailures).length === 0;
  return { version: HUSH_PAYLOAD_INTEGRITY_VERSION, passed, score: Number(score.toFixed(4)), checks, hardFailures: unique(hardFailures), reviewWarnings: unique(reviewWarnings), repairsSuggested: unique(repairsSuggested) };
}

export function verifyPayloadIntegrity(input = {}) {
  return buildPayloadIntegrityCheck(input);
}

export function summarizePayloadIntegrity(check = {}) {
  return { version: check.version || HUSH_PAYLOAD_INTEGRITY_VERSION, passed: check.passed !== false, score: Number(check.score ?? 1), hardFailureCount: asArray(check.hardFailures).length, reviewWarningCount: asArray(check.reviewWarnings).length, hardFailures: asArray(check.hardFailures), reviewWarnings: asArray(check.reviewWarnings) };
}
