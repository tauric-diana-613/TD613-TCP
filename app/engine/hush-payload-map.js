import { extractOperationalIdentifiers, extractTimeAnchors } from './hush-meaning-plan.js';

export const HUSH_PAYLOAD_MAP_VERSION = 'phase-21';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values).filter(Boolean))];

function hashText(text = '') {
  let hash = 2166136261;
  for (const ch of safeText(text)) {
    hash ^= ch.codePointAt(0) || 0;
    hash = Math.imul(hash, 16777619);
  }
  return `hpm-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

const ACTIONS = ['called', 'saved', 'logged', 'told', 'resend', 'kept', 'keep', 'changed', 'edited', 'uploaded', 'deleted', 'moved', 'attached', 'confirmed', 'verified', 'preserve', 'hold'];
const OBJECTS = ['staffing note', 'spreadsheet', 'file', 'vendor', 'invoice', 'record', 'packet', 'attachment', 'version', 'label', 'message', 'date', 'note'];
const ORGS = ['finance', 'hr', 'vendor', 'payroll', 'legal', 'compliance', 'manager', 'field office'];

function pushUnit(units, seen, item) {
  const text = safeText(item.text).trim();
  if (!text) return;
  const key = `${item.kind}:${text.toLowerCase()}:${item.sourceUnitId || ''}`;
  if (seen.has(key)) return;
  seen.add(key);
  units.push({ id: `payload-${units.length + 1}`, required: true, preserveExact: false, rewriteFreedom: 'low', anchors: [], warnings: [], ...item, text });
}

function sourceUnitFor(text = '', meaningPlan = {}) {
  const unit = asArray(meaningPlan.units).find((item) => safeText(item.text).includes(text));
  return unit?.id || '';
}

export function classifyPayloadToken(input = {}) {
  const text = safeText(input.text);
  const lower = text.toLowerCase();
  if (extractOperationalIdentifiers(text).includes(text) || /\b[A-Z]{2,12}-\d/.test(text)) return 'evidence-id';
  if (extractTimeAnchors(text).includes(text) || /\d{1,2}:\d{2}/.test(text)) return /:/.test(text) ? 'timestamp' : 'date';
  if (ORGS.includes(lower)) return lower === 'vendor' ? 'org' : 'department';
  if (ACTIONS.includes(lower)) return 'action';
  if (OBJECTS.includes(lower)) return 'object';
  if (/\b(because|bc|since|so that|until|whole point)\b/i.test(text)) return 'reason';
  if (/\b(version|later copy|current version|old version|new version|finance kept)\b/i.test(text)) return 'version';
  if (/^[A-Z][a-z]{2,}$/.test(text)) return 'actor';
  return 'context';
}

function extractActors(text = '') {
  const value = safeText(text);
  const candidates = value.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  const excluded = new Set([
    'The', 'Please', 'Keep', 'I', 'This', 'That', 'For', 'Record', 'Vendor', 'Finance',
    'Make', 'Review', 'Preserve', 'Hold', 'Save', 'Attach', 'Confirm', 'Change', 'Use',
    'Leave', 'Send', 'Resend', 'Do', 'Can', 'Could', 'Should', 'Need'
  ]);
  return unique(candidates.filter((word) => !excluded.has(word)));
}

function extractObjects(text = '') {
  const lower = safeText(text).toLowerCase();
  return OBJECTS.filter((object) => lower.includes(object));
}

function extractActions(text = '') {
  const lower = safeText(text).toLowerCase();
  return ACTIONS.filter((action) => new RegExp(`\\b${action}\\b`, 'i').test(lower));
}

function extractReasons(text = '') {
  const value = safeText(text);
  const matches = value.match(/\b(?:because|bc|since|so that|until)\b[^.!?;]*/gi) || [];
  if (/the whole point/i.test(value) && !matches.some((item) => /whole point/i.test(item))) matches.push('that date is the whole point');
  return unique(matches.map((item) => item.trim()));
}

function extractVersions(text = '') {
  const value = safeText(text);
  const matches = value.match(/\b(?:which version|kept version|version finance kept|finance kept|later copy|original label|current version|old version|new version)[^.!?;]*/gi) || [];
  return unique(matches.map((item) => item.trim()));
}

function buildRelationships(units = []) {
  const relationships = [];
  const byKind = (kind) => units.filter((unit) => unit.kind === kind || unit.kind === `${kind}s`);
  const evidence = byKind('evidence-id');
  const dates = units.filter((unit) => unit.kind === 'date');
  const timestamps = units.filter((unit) => unit.kind === 'timestamp');
  const actors = byKind('actor');
  const actions = byKind('action');
  const objects = byKind('object');
  const reasons = byKind('reason');
  const versions = byKind('version');
  for (const id of evidence) {
    const date = dates[0] || timestamps[0];
    if (date) relationships.push({ fromPayloadId: id.id, toPayloadId: date.id, relation: date.kind === 'timestamp' ? 'time-qualifies-action' : 'date-qualifies-evidence' });
  }
  for (const actor of actors) {
    const action = actions[0];
    if (action) relationships.push({ fromPayloadId: actor.id, toPayloadId: action.id, relation: 'actor-did-action' });
  }
  for (const action of actions) {
    const object = objects[0];
    if (object) relationships.push({ fromPayloadId: action.id, toPayloadId: object.id, relation: 'action-targets-object' });
  }
  for (const reason of reasons) {
    const action = actions.find((item) => /keep|preserve|resend|hold/i.test(item.text)) || actions[0];
    if (action) relationships.push({ fromPayloadId: reason.id, toPayloadId: action.id, relation: 'reason-qualifies-instruction' });
  }
  for (const version of versions) {
    const object = objects.find((item) => /spreadsheet|version|file|record|label/i.test(item.text)) || objects[0];
    if (object) relationships.push({ fromPayloadId: version.id, toPayloadId: object.id, relation: 'version-qualifies-object' });
  }
  return relationships;
}

export function buildPayloadMap(input = {}) {
  const sourceText = safeText(input.sourceText ?? input.text);
  const meaningPlan = input.meaningPlan || {};
  const protectedLiterals = unique([...(input.protectedLiterals || []), ...(meaningPlan.protectedLiterals || [])]);
  const payloadUnits = [];
  const seen = new Set();
  for (const literal of unique([...protectedLiterals, ...extractOperationalIdentifiers(sourceText), ...extractTimeAnchors(sourceText)])) {
    const kind = classifyPayloadToken({ text: literal });
    pushUnit(payloadUnits, seen, { text: literal, kind, sourceUnitId: sourceUnitFor(literal, meaningPlan), required: true, preserveExact: true, rewriteFreedom: 'none' });
  }
  for (const actor of extractActors(sourceText)) pushUnit(payloadUnits, seen, { text: actor, kind: 'actor', sourceUnitId: sourceUnitFor(actor, meaningPlan), required: true, preserveExact: true });
  for (const org of ORGS.filter((word) => new RegExp(`\\b${word}\\b`, 'i').test(sourceText))) pushUnit(payloadUnits, seen, { text: org, kind: org === 'vendor' ? 'org' : 'department', sourceUnitId: sourceUnitFor(org, meaningPlan), required: true });
  for (const action of extractActions(sourceText)) pushUnit(payloadUnits, seen, { text: action, kind: 'action', sourceUnitId: sourceUnitFor(action, meaningPlan), required: true, preserveExact: false, rewriteFreedom: 'medium' });
  for (const object of extractObjects(sourceText)) pushUnit(payloadUnits, seen, { text: object, kind: 'object', sourceUnitId: sourceUnitFor(object, meaningPlan), required: true, preserveExact: false, rewriteFreedom: 'medium' });
  for (const reason of extractReasons(sourceText)) pushUnit(payloadUnits, seen, { text: reason, kind: 'reason', sourceUnitId: sourceUnitFor(reason, meaningPlan), required: true, preserveExact: false, rewriteFreedom: 'low' });
  for (const version of extractVersions(sourceText)) pushUnit(payloadUnits, seen, { text: version, kind: 'version', sourceUnitId: sourceUnitFor(version, meaningPlan), required: true, preserveExact: false, rewriteFreedom: 'low' });
  const relationships = buildRelationships(payloadUnits);
  return { version: HUSH_PAYLOAD_MAP_VERSION, sourceHash: hashText(sourceText), payloadUnits, relationships, warnings: payloadUnits.length ? ['payload-units-present'] : [], limitations: ['Payload maps preserve local drafting context; human review remains required.'] };
}

export function summarizePayloadMap(payloadMap = {}) {
  const units = asArray(payloadMap.payloadUnits);
  return { version: payloadMap.version || HUSH_PAYLOAD_MAP_VERSION, payloadUnitCount: units.length, requiredCount: units.filter((unit) => unit.required).length, exactCount: units.filter((unit) => unit.preserveExact).length, kinds: unique(units.map((unit) => unit.kind)), relationshipCount: asArray(payloadMap.relationships).length, warnings: asArray(payloadMap.warnings) };
}
