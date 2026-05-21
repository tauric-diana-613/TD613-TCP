export const HUSH_PAYLOAD_BINDING_VERSION = 'phase-21';

const safeText = (value) => String(value ?? '');
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const unique = (values = []) => [...new Set(asArray(values).filter(Boolean))];

function byKind(units = [], ...kinds) {
  return asArray(units).filter((unit) => kinds.includes(unit.kind));
}

function pushBinding(bindings, binding = {}) {
  const payloadIds = unique(binding.payloadIds || []);
  if (!payloadIds.length) return;
  const key = `${binding.kind}:${payloadIds.join('|')}`;
  if (bindings.some((item) => `${item.kind}:${asArray(item.payloadIds).join('|')}` === key)) return;
  bindings.push({
    id: `binding-${bindings.length + 1}`,
    required: true,
    rewriteRule: 'keep-near',
    maxDistanceTokens: 10,
    sourceText: '',
    ...binding,
    payloadIds
  });
}

function unitText(units = [], id = '') {
  return asArray(units).find((unit) => unit.id === id)?.text || '';
}

export function bindPayloadUnits(input = {}) {
  const payloadMap = input.payloadMap || {};
  const units = asArray(payloadMap.payloadUnits);
  const bindings = [];
  const evidence = byKind(units, 'evidence-id');
  const dates = byKind(units, 'date');
  const times = byKind(units, 'timestamp');
  const actors = byKind(units, 'actor');
  const orgs = byKind(units, 'org', 'department');
  const actions = byKind(units, 'action');
  const objects = byKind(units, 'object');
  const reasons = byKind(units, 'reason');
  const versions = byKind(units, 'version');

  for (const id of evidence) {
    const date = dates[0];
    if (date) pushBinding(bindings, { kind: 'evidence-date', payloadIds: [id.id, date.id], sourceText: `${id.text} ${date.text}`, rewriteRule: 'keep-near', maxDistanceTokens: 8 });
    const time = times[0];
    if (time) pushBinding(bindings, { kind: 'evidence-time', payloadIds: [id.id, time.id], sourceText: `${id.text} ${time.text}`, rewriteRule: 'keep-near', maxDistanceTokens: 8 });
  }
  for (const actor of actors) {
    const action = actions.find((item) => actor.sourceUnitId && item.sourceUnitId === actor.sourceUnitId) || actions[0];
    if (action) pushBinding(bindings, { kind: 'actor-action', payloadIds: [actor.id, action.id], sourceText: `${actor.text} ${action.text}`, rewriteRule: 'local-reorder-only', maxDistanceTokens: 12 });
  }
  for (const action of actions) {
    const object = objects.find((item) => action.sourceUnitId && item.sourceUnitId === action.sourceUnitId) || objects[0];
    if (object) pushBinding(bindings, { kind: 'action-object', payloadIds: [action.id, object.id], sourceText: `${action.text} ${object.text}`, rewriteRule: 'keep-near', maxDistanceTokens: 10 });
    const time = times.find((item) => action.sourceUnitId && item.sourceUnitId === action.sourceUnitId) || times[0];
    if (time) pushBinding(bindings, { kind: 'time-action', payloadIds: [time.id, action.id], sourceText: `${action.text} ${time.text}`, rewriteRule: 'keep-near', maxDistanceTokens: 10 });
  }
  const instructionAction = actions.find((item) => /keep|preserve|resend|hold|told/i.test(item.text));
  const targetObject = objects.find((item) => /spreadsheet|file|note|record|date|message|version/i.test(item.text)) || objects[0];
  if (instructionAction && targetObject) pushBinding(bindings, { kind: 'instruction-target', payloadIds: [instructionAction.id, targetObject.id], sourceText: `${instructionAction.text} ${targetObject.text}`, rewriteRule: 'preserve-causal-force', maxDistanceTokens: 14 });
  for (const reason of reasons) {
    const target = instructionAction || actions[0];
    if (target) pushBinding(bindings, { kind: 'reason-instruction', payloadIds: [reason.id, target.id], sourceText: reason.text, rewriteRule: 'preserve-causal-force', maxDistanceTokens: 18 });
  }
  for (const version of versions) {
    const target = objects.find((item) => /spreadsheet|version|file|record|label/i.test(item.text)) || orgs.find((item) => /finance/i.test(item.text)) || objects[0];
    if (target) pushBinding(bindings, { kind: 'version-object', payloadIds: [version.id, target.id], sourceText: version.text, rewriteRule: 'preserve-causal-force', maxDistanceTokens: 18 });
  }
  const finance = orgs.find((item) => /finance/i.test(item.text));
  if (finance && versions[0]) pushBinding(bindings, { kind: 'version-object', payloadIds: [finance.id, versions[0].id], sourceText: `${finance.text} ${versions[0].text}`, rewriteRule: 'preserve-causal-force', maxDistanceTokens: 18 });

  return bindings.map((binding) => ({ ...binding, sourceText: binding.sourceText || binding.payloadIds.map((id) => unitText(units, id)).join(' ') }));
}

export function buildPayloadBindingMap(input = {}) {
  const payloadMap = input.payloadMap || {};
  const bindings = bindPayloadUnits(input);
  return {
    version: HUSH_PAYLOAD_BINDING_VERSION,
    bindings,
    warnings: bindings.length ? ['payload-bindings-present'] : [],
    limitations: ['Payload bindings are local proximity constraints, not factual verification.']
  };
}

export function summarizePayloadBindingMap(bindingMap = {}) {
  const bindings = asArray(bindingMap.bindings);
  return { version: bindingMap.version || HUSH_PAYLOAD_BINDING_VERSION, bindingCount: bindings.length, requiredCount: bindings.filter((item) => item.required).length, kinds: unique(bindings.map((item) => item.kind)), warnings: asArray(bindingMap.warnings) };
}
