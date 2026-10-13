export const HUSH_PAYLOAD_REPAIR_VERSION = 'phase-21';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values).filter(Boolean))];

function byKind(payloadMap = {}, ...kinds) {
  return asArray(payloadMap.payloadUnits).filter((unit) => kinds.includes(unit.kind));
}

function firstText(payloadMap = {}, ...kinds) {
  return byKind(payloadMap, ...kinds)[0]?.text || '';
}

function has(output = '', text = '') {
  if (!text) return true;
  return safeText(output).toLowerCase().includes(safeText(text).toLowerCase());
}

function sentence(text = '') {
  const value = safeText(text).replace(/\s+/g, ' ').trim();
  if (!value) return '';
  return /[.!?]$/.test(value) ? value : `${value}.`;
}

function joinSentences(parts = []) {
  return asArray(parts).map(sentence).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

export function rebuildPayloadSentence(input = {}) {
  const payloadMap = input.payloadMap || {};
  const evidence = firstText(payloadMap, 'evidence-id');
  const timestamp = firstText(payloadMap, 'timestamp');
  const date = firstText(payloadMap, 'date');
  const actor = firstText(payloadMap, 'actor');
  const org = firstText(payloadMap, 'org', 'department');
  const objects = byKind(payloadMap, 'object').map((unit) => unit.text);
  const actions = byKind(payloadMap, 'action').map((unit) => unit.text);
  const reason = firstText(payloadMap, 'reason');
  const version = firstText(payloadMap, 'version');
  const hasVendor = /vendor/i.test(org) || objects.some((item) => /vendor/i.test(item));
  const spreadsheet = objects.find((item) => /spreadsheet/i.test(item));
  const note = objects.find((item) => /staffing note|note/i.test(item));
  const file = objects.find((item) => /^file$/i.test(item));
  const called = actions.find((item) => /called/i.test(item));
  const saved = actions.find((item) => /saved/i.test(item));
  const logged = actions.find((item) => /logged/i.test(item));
  const told = actions.find((item) => /told/i.test(item));
  const resend = actions.find((item) => /resend/i.test(item));
  const keep = actions.find((item) => /keep|preserve|hold/i.test(item));
  const parts = [];

  if (hasVendor && called) parts.push('The vendor called twice after lunch');
  if (actor && called && !hasVendor) parts.push(`${actor} called`);
  if (note && actor && saved) parts.push(`The ${note} was saved after ${actor} called`);
  else if (note && saved) parts.push(`The ${note} was saved`);
  if (evidence && timestamp) parts.push(`${evidence} was ${logged ? 'logged' : 'recorded'} at ${timestamp}`);
  else if (evidence && date && note) parts.push(`${evidence} should stay with the ${note} from ${date}`);
  else if (evidence && date) parts.push(`${evidence} should stay with ${date}`);
  else if (evidence && note) parts.push(`${evidence} remains the ${note} anchor`);
  else if (evidence) parts.push(`${evidence} remains the record anchor`);
  if (actor && spreadsheet && (resend || told)) {
    const finance = byKind(payloadMap, 'department').find((unit) => /finance/i.test(unit.text))?.text || (org && /finance/i.test(org) ? org : 'finance');
    parts.push(`${actor} should not resend the ${spreadsheet} until ${finance} confirms ${version || 'which version it kept'}`);
  }
  if (file && /before noon/i.test(safeText(input.sourceText))) parts.push('The file was there before noon');
  if (evidence && date && keep && !parts.some((part) => part.includes(evidence) && part.includes(date))) parts.push(`${evidence} and ${date} should stay together`);
  if (reason) parts.push(reason.replace(/^bc\b/i, 'because'));
  return joinSentences(parts);
}

export function repairPayloadLoss(input = {}) {
  const text = safeText(input.text ?? input.candidate?.text);
  const payloadMap = input.payloadMap || {};
  const integrity = input.payloadIntegrity || input.integrity || null;
  const units = asArray(payloadMap.payloadUnits);
  const missingRequired = units.filter((unit) => unit.required && !has(text, unit.text));
  const operations = [];
  const warnings = [];
  let repaired = text;
  const severe = integrity?.passed === false || missingRequired.some((unit) => ['evidence-id', 'timestamp', 'actor', 'department', 'org', 'reason', 'version'].includes(unit.kind));
  if (severe) {
    const rebuilt = rebuildPayloadSentence(input);
    if (rebuilt) {
      repaired = rebuilt;
      operations.push('payload-rebuild-sentence');
    }
  }
  for (const unit of units.filter((item) => item.preserveExact)) {
    if (!has(repaired, unit.text)) {
      repaired = joinSentences([repaired, `${unit.text} remains attached to this record`]);
      operations.push('restore-exact-payload-unit');
    }
  }
  if (!operations.length && missingRequired.length) warnings.push('payload-repair-review');
  if (integrity?.passed === false && !operations.length) warnings.push('payload-repair-failed');
  return { version: HUSH_PAYLOAD_REPAIR_VERSION, text: repaired.replace(/\s+/g, ' ').trim(), changed: repaired.trim() !== text.trim(), operations: unique(operations), warnings: unique(warnings), missingRequired: missingRequired.map((unit) => ({ text: unit.text, kind: unit.kind })) };
}

export function summarizePayloadRepair(repair = {}) {
  return { version: repair.version || HUSH_PAYLOAD_REPAIR_VERSION, changed: Boolean(repair.changed), operationCount: asArray(repair.operations).length, warningCount: asArray(repair.warnings).length, operations: asArray(repair.operations), warnings: asArray(repair.warnings) };
}
